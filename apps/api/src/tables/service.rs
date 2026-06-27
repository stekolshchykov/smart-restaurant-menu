use std::collections::HashSet;

use image::codecs::png::PngEncoder;
use image::ImageEncoder;
use printpdf::{
    BuiltinFont, Color, Mm, Op, PaintMode, PdfDocument, PdfFontHandle, PdfPage, PdfSaveOptions,
    PdfWarnMsg, Point, Pt, RawImage, Rect, Rgb, TextItem, XObjectTransform,
};
use qrcode::QrCode;
use rand::seq::SliceRandom;
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::middleware::CurrentUser;
use crate::error::AppError;
use crate::projects::models::Project;
use crate::projects::repository as projects_repo;
use crate::state::AppState;
use crate::tables::models::{
    to_response, BulkCreateRequest, CreateTableRequest, Table, TableResponse, UpdateTableRequest,
};
use crate::tables::repository;

const TOKEN_ALPHABET: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TOKEN_LEN: usize = 6;
const MAX_BULK: i32 = 100;

fn generate_token() -> String {
    let mut rng = rand::thread_rng();
    (0..TOKEN_LEN)
        .map(|_| *TOKEN_ALPHABET.choose(&mut rng).unwrap() as char)
        .collect()
}

async fn generate_unique_token(pool: &PgPool) -> Result<String, AppError> {
    for _ in 0..100 {
        let token = generate_token();
        if !repository::token_exists(pool, &token).await? {
            return Ok(token);
        }
    }
    Err(AppError::Internal(anyhow::anyhow!(
        "failed to generate unique table token"
    )))
}

fn ensure_owner(project: &Project, current_user: &CurrentUser) -> Result<(), AppError> {
    if project.owner_id != current_user.id {
        return Err(AppError::Forbidden);
    }
    Ok(())
}

pub async fn create_table(
    state: &AppState,
    current_user: &CurrentUser,
    project_id: Uuid,
    req: CreateTableRequest,
) -> Result<TableResponse, AppError> {
    let project = projects_repo::get_project(&state.db, project_id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;
    ensure_owner(&project, current_user)?;

    let label = req.label.trim().to_string();
    if label.is_empty() {
        return Err(AppError::ValidationError(Default::default()));
    }

    let token = generate_unique_token(&state.db).await?;
    let sort_order = req.sort_order.unwrap_or(0);
    let active = req.active.unwrap_or(true);

    let table = repository::create(&state.db, project_id, &label, &token, active, sort_order).await?;
    Ok(to_response(
        table,
        state.config.web_origin(),
        state.config.api_origin(),
    ))
}

pub async fn bulk_create_tables(
    state: &AppState,
    current_user: &CurrentUser,
    project_id: Uuid,
    req: BulkCreateRequest,
) -> Result<Vec<TableResponse>, AppError> {
    let project = projects_repo::get_project(&state.db, project_id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;
    ensure_owner(&project, current_user)?;

    if req.start < 1 || req.end < req.start || req.end - req.start + 1 > MAX_BULK {
        return Err(AppError::InvalidTableRange);
    }

    let prefix = req.prefix.unwrap_or_else(|| "Стол ".to_string());
    let count = (req.end - req.start + 1) as usize;

    let mut tokens = HashSet::with_capacity(count);
    while tokens.len() < count {
        tokens.insert(generate_unique_token(&state.db).await?);
    }
    let tokens: Vec<String> = tokens.into_iter().collect();

    let mut tx = state.db.begin().await?;
    let mut tables = Vec::with_capacity(count);

    for (idx, token) in tokens.into_iter().enumerate() {
        let number = req.start + idx as i32;
        let label = format!("{prefix}{number}");
        let table = repository::create(&mut *tx, project_id, &label, &token, true, 0).await?;
        tables.push(table);
    }

    tx.commit().await?;

    Ok(tables
        .into_iter()
        .map(|t| to_response(t, state.config.web_origin(), state.config.api_origin()))
        .collect())
}

pub async fn list_tables(
    state: &AppState,
    current_user: &CurrentUser,
    project_id: Uuid,
) -> Result<Vec<TableResponse>, AppError> {
    let project = projects_repo::get_project(&state.db, project_id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;
    ensure_owner(&project, current_user)?;

    let tables = repository::list_by_project(&state.db, project_id).await?;
    Ok(tables
        .into_iter()
        .map(|t| to_response(t, state.config.web_origin(), state.config.api_origin()))
        .collect())
}

pub async fn update_table(
    state: &AppState,
    current_user: &CurrentUser,
    id: Uuid,
    req: UpdateTableRequest,
) -> Result<TableResponse, AppError> {
    let table = repository::get(&state.db, id)
        .await?
        .ok_or(AppError::TableNotFound)?;
    let project = projects_repo::get_project(&state.db, table.project_id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;
    ensure_owner(&project, current_user)?;

    if let Some(label) = &req.label {
        if label.trim().is_empty() {
            return Err(AppError::ValidationError(Default::default()));
        }
    }

    let table = repository::update(&state.db, id, &req).await?;
    Ok(to_response(
        table,
        state.config.web_origin(),
        state.config.api_origin(),
    ))
}

pub async fn delete_table(
    state: &AppState,
    current_user: &CurrentUser,
    id: Uuid,
) -> Result<(), AppError> {
    let table = repository::get(&state.db, id)
        .await?
        .ok_or(AppError::TableNotFound)?;
    let project = projects_repo::get_project(&state.db, table.project_id)
        .await?
        .ok_or(AppError::ProjectNotFound)?;
    ensure_owner(&project, current_user)?;

    repository::delete(&state.db, id).await
}

pub async fn get_public_table_by_token(
    pool: &PgPool,
    token: &str,
) -> Result<Option<Table>, AppError> {
    repository::get_by_token(pool, token).await
}

pub fn generate_qr_png(url: &str) -> Result<Vec<u8>, AppError> {
    let code = QrCode::new(url).map_err(|_| AppError::QrGenerationError)?;
    let img = code
        .render::<image::Luma<u8>>()
        .module_dimensions(8, 8)
        .build();

    let mut bytes = Vec::new();
    PngEncoder::new(&mut bytes)
        .write_image(
            img.as_raw(),
            img.width(),
            img.height(),
            image::ExtendedColorType::L8,
        )
        .map_err(|_| AppError::QrGenerationError)?;
    Ok(bytes)
}

pub fn generate_table_pdf(
    table: &Table,
    project: &Project,
    qr_png: &[u8],
) -> Result<Vec<u8>, AppError> {
    let mut doc = PdfDocument::new(&format!("Table {}", table.label));

    let font = BuiltinFont::Helvetica
        .get_parsed_font()
        .ok_or(AppError::PdfGenerationError)?;
    let font_id = doc.add_font(&font);

    let dark = Color::Rgb(Rgb::new(0.1, 0.1, 0.1, None));
    let gray = Color::Rgb(Rgb::new(0.9, 0.9, 0.9, None));

    let mut ops = Vec::new();

    ops.push(Op::SetFillColor { col: gray });
    ops.push(Op::DrawRectangle {
        rectangle: Rect {
            x: Mm(20.0).into(),
            y: Mm(250.0).into(),
            width: Mm(40.0).into(),
            height: Mm(20.0).into(),
            mode: Some(PaintMode::Fill),
            winding_order: None,
        },
    });

    ops.push(Op::SetFillColor { col: dark });

    ops.push(Op::StartTextSection);
    ops.push(Op::SetFont {
        font: PdfFontHandle::External(font_id.clone()),
        size: Pt(24.0),
    });
    ops.push(Op::SetTextCursor {
        pos: Point::new(Mm(20.0), Mm(238.0)),
    });
    ops.push(Op::ShowText {
        items: vec![TextItem::Text(project.name.clone())],
    });
    ops.push(Op::EndTextSection);

    ops.push(Op::StartTextSection);
    ops.push(Op::SetFont {
        font: PdfFontHandle::External(font_id.clone()),
        size: Pt(18.0),
    });
    ops.push(Op::SetTextCursor {
        pos: Point::new(Mm(20.0), Mm(220.0)),
    });
    ops.push(Op::ShowText {
        items: vec![TextItem::Text(format!("Table: {}", table.label))],
    });
    ops.push(Op::EndTextSection);

    ops.push(Op::StartTextSection);
    ops.push(Op::SetFont {
        font: PdfFontHandle::External(font_id),
        size: Pt(12.0),
    });
    ops.push(Op::SetTextCursor {
        pos: Point::new(Mm(20.0), Mm(205.0)),
    });
    ops.push(Op::ShowText {
        items: vec![TextItem::Text(
            "Scan the code to view the menu and order".to_string(),
        )],
    });
    ops.push(Op::EndTextSection);

    let qr_img = image::load_from_memory(qr_png).map_err(|_| AppError::PdfGenerationError)?;
    let raw_img = RawImage::from_dynamic_image(qr_img).map_err(|_| AppError::PdfGenerationError)?;
    let xobject_id = doc.add_image(&raw_img);

    ops.push(Op::UseXobject {
        id: xobject_id,
        transform: XObjectTransform {
            translate_x: Some(Mm(55.0).into()),
            translate_y: Some(Mm(80.0).into()),
            scale_x: Some(3.0),
            scale_y: Some(3.0),
            rotate: None,
            dpi: None,
        },
    });

    doc.pages.push(PdfPage::new(Mm(210.0), Mm(297.0), ops));

    Ok(doc.save(&PdfSaveOptions::default(), &mut Vec::<PdfWarnMsg>::new()))
}
