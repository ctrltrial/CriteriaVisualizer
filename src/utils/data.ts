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

export const DECADE_COLORS = {
  "1970-1979": "#1ab2ff",
  "1980-1989": "#009ce3",
  "1990-1999": "#0088c6",
  "2000-2009": "#0074a8",
  "2010-2019": "#00608a",
  "2020+": "#004c6d",
};

export const getDecadeGroups = (colors: Record<string, string>) => [
  { start: 1970, end: 1979, color: colors["1970-1979"] },
  { start: 1980, end: 1989, color: colors["1980-1989"] },
  { start: 1990, end: 1999, color: colors["1990-1999"] },
  { start: 2000, end: 2009, color: colors["2000-2009"] },
  { start: 2010, end: 2019, color: colors["2010-2019"] },
  { start: 2020, end: Infinity, color: colors["2020+"] },
];