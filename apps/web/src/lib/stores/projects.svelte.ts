import { api } from '$lib/api/client';
import type {
  ApiError,
  CreateProjectRequest,
  ProjectResponse,
  ProjectThemeResponse,
  UpdateProjectRequest,
  UpdateProjectThemeRequest,
} from '@digital-menu/api-client';

function getErrorMessage(err: unknown): string {
  const apiError = err as ApiError | undefined;
  if (apiError?.message) return apiError.message;
  if (err instanceof Error) return err.message;
  return 'Что-то пошло не так. Попробуйте ещё раз.';
}

function createProjectsStore() {
  let projects = $state<ProjectResponse[]>([]);
  let currentProject = $state<ProjectResponse | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function loadProjects() {
    loading = true;
    error = null;

    try {
      const list = await api.getProjects();
      projects = list;
    } catch (err) {
      error = getErrorMessage(err);
    } finally {
      loading = false;
    }
  }

  async function createProject(body: CreateProjectRequest): Promise<ProjectResponse> {
    loading = true;
    error = null;

    try {
      const project = await api.createProject(body);
      projects = [project, ...projects];
      currentProject = project;
      return project;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function selectProject(id: string): Promise<ProjectResponse> {
    const cached = projects.find((p) => p.id === id);
    if (cached) {
      currentProject = cached;
    }

    loading = true;
    error = null;

    try {
      const project = await api.getProject(id);
      currentProject = project;
      projects = projects.map((p) => (p.id === id ? project : p));
      return project;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function updateProject(id: string, body: UpdateProjectRequest): Promise<ProjectResponse> {
    loading = true;
    error = null;

    try {
      const project = await api.updateProject(id, body);
      projects = projects.map((p) => (p.id === id ? project : p));
      if (currentProject?.id === id) {
        currentProject = project;
      }
      return project;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function deleteProject(id: string): Promise<void> {
    loading = true;
    error = null;

    try {
      await api.deleteProject(id);
      projects = projects.filter((p) => p.id !== id);
      if (currentProject?.id === id) {
        currentProject = null;
      }
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function updateTheme(id: string, body: UpdateProjectThemeRequest): Promise<ProjectThemeResponse> {
    loading = true;
    error = null;

    try {
      const theme = await api.updateProjectTheme(id, body);
      projects = projects.map((p) =>
        p.id === id ? { ...p, theme } : p,
      );
      if (currentProject?.id === id) {
        currentProject = { ...currentProject, theme };
      }
      return theme;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  function clearError() {
    error = null;
  }

  return {
    get projects() {
      return projects;
    },
    get currentProject() {
      return currentProject;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    loadProjects,
    createProject,
    selectProject,
    updateProject,
    deleteProject,
    updateTheme,
    clearError,
  };
}

export const projects = createProjectsStore();
