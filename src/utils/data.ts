// random generated x,y points
export const data = Array.from({ length: 2000 }, () => ({
  x: (Math.random() - 0.5) * 60,
  y: (Math.random() - 0.5) * 40,
  filterVal: Math.random() * 100, // filter val from 0 - 100
}));
