export const data = Array.from({ length: 2000 }, () => ({
  x: (Math.random() - 0.5) * 60,
  y: (Math.random() - 0.5) * 40,
  filterVal: 1970 + Math.random() * 55, // filter val from 1970 to 2025
  // filterVal: Math.round(Math.random() * 50), // filter val from 0 to 100
}));

export const minDataVal = Math.round(
  Math.min(...data.map((item) => item.filterVal))
);
export const maxDataVal = Math.round(
  Math.max(...data.map((item) => item.filterVal))
);
