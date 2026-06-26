const fs = require('fs');
const path = require('path');

const files = [
  path.resolve('public/menu.json'),
  path.resolve('src/data/menu.json'),
];

const prepTimes = {
  soups: 8,
  starters: 10,
  salads: 7,
  meat: 18,
  fish: 16,
  pasta: 14,
  pizza: 15,
  vegetarian: 14,
  drinks: 2,
  desserts: 6,
};

function enrich(data) {
  data.categories.forEach((cat) => {
    const basePrep = prepTimes[cat.id] ?? 12;
    cat.items.forEach((item, idx) => {
      if (!item.prepTimeMinutes) {
        // vary prep time by item position to feel realistic
        item.prepTimeMinutes = basePrep + (idx % 3) * 2;
      }
      if (typeof item.rating !== 'number') {
        // ratings 4.3 - 4.9, higher for featured/popular
        const base = item.featured ? 4.7 : 4.4;
        item.rating = Math.round((base + (idx % 5) * 0.05) * 10) / 10;
      }
      if (typeof item.reviewCount !== 'number') {
        item.reviewCount = 20 + (idx % 10) * 7 + (item.featured ? 30 : 0);
      }
      if (typeof item.popularity !== 'number') {
        item.popularity = item.featured ? 95 : 50 + (idx % 6) * 8;
      }
    });
  });
  return data;
}

files.forEach((file) => {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  enrich(data);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log('enriched', file);
});
