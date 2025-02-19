export const data = Array.from({ length: 30000 }, () => ({
  x: (Math.random() - 0.5) * 60,
  y: (Math.random() - 0.5) * 40,
  filterVal: 1970 + Math.pow(Math.random(), 0.3) * 55, // 1970-2025, skewed earlier
}));

export const minDataVal = Math.round(
  Math.min(...data.map((item) => item.filterVal))
);
export const maxDataVal = Math.round(
  Math.max(...data.map((item) => item.filterVal))
);
