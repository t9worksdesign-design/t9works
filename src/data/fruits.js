export const CATEGORIES = ['red', 'orange', 'yellow', 'green', 'purple'];

function spreadsFor(id, count = 3) {
  return Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, '0');
    return `/images/spreads/${id}/${n}.jpg`;
  });
}

// Image paths point at the final formats: PNG cutouts for fruit images,
// JPG for InDesign spread exports. Drop real files in at these exact
// paths/names under public/ to replace the placeholders — no code
// changes needed unless a filename or extension actually differs.
// `scale` is each fruit's size relative to its canvas's base unit (1 = base).
// Tweak these to taste — they drive both the physics body radius and the
// rendered image size, so a bigger scale reads as a visually bigger fruit.
export const fruits = [
  { id: 'apple', name: 'Apple', category: 'red', order: 1, scale: 1, spreadCount: 4 },
  { id: 'tomato', name: 'Tomato', category: 'red', order: 2, scale: 0.85 },
  { id: 'pitaya', name: 'Pitaya', category: 'red', order: 3, scale: 1.15 },

  { id: 'orange', name: 'Orange', category: 'orange', order: 1, scale: 1 },
  { id: 'papaya', name: 'Papaya', category: 'orange', order: 2, scale: 1.2 },
  { id: 'persimmon', name: 'Persimmon', category: 'orange', order: 3, scale: 0.9 },

  { id: 'banana', name: 'Banana', category: 'yellow', order: 1, scale: 1.4 },
  { id: 'starfruit', name: 'Starfruit', category: 'yellow', order: 2, scale: 1 },
  { id: 'lemon', name: 'Lemon', category: 'yellow', order: 3, scale: 0.9 },

  { id: 'kiwi', name: 'Kiwi', category: 'green', order: 1, scale: 0.85 },
  { id: 'cucumber', name: 'Cucumber', category: 'green', order: 2, scale: 1.25 },
  { id: 'green-grape', name: 'Green grape', category: 'green', order: 3, scale: 1 },

  { id: 'grape', name: 'Grape', category: 'purple', order: 1, scale: 0.7, spreadCount: 2 },
  { id: 'eggplant', name: 'Eggplant', category: 'purple', order: 2, scale: 1.3 },
  { id: 'blueberry', name: 'Blueberry', category: 'purple', order: 3, scale: 0.6 },
].map((f) => ({
  ...f,
  image: `/images/fruits/${f.category}/${f.id}.png`,
  spreads: spreadsFor(f.id, f.spreadCount ?? 3),
}));

export function getFruitsByCategory(category) {
  return fruits
    .filter((f) => f.category === category)
    .sort((a, b) => a.order - b.order);
}

export function getAllFruitsSorted() {
  return [...fruits].sort((a, b) => {
    const ci = CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category);
    return ci !== 0 ? ci : a.order - b.order;
  });
}

export function getFruitById(id) {
  return fruits.find((f) => f.id === id) || null;
}

export function getAdjacentFruit(id, direction) {
  const fruit = getFruitById(id);
  if (!fruit) return null;
  const siblings = getFruitsByCategory(fruit.category);
  const index = siblings.findIndex((f) => f.id === id);
  const nextIndex = (index + direction + siblings.length) % siblings.length;
  return siblings[nextIndex];
}
