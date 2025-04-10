export interface DataItem {
  YEAR: number;
  CLUSTER: number;
  X: number;
  Y: number;
}

export interface LabelItem {
  CLUSTER: number;
  LABEL: string;
  X: number;
  Y: number;
}

export const DECADE_COLORS = {
  "1970-1979": "#FFA500", 
  "1980-1989": "#40E0D0",
  "1990-1999": "#32CD32",
  "2000-2009": "#1E90FF", 
  "2010-2019": "#8A2BE2", 
  "2020+": "#FFC107", 
};

export async function fetchData(): Promise<DataItem[]> {
  const response = await fetch("http://localhost:443/api/points");
  return await response.json(); 
}

export async function fetchLabel(): Promise<LabelItem[]> {
  const response = await fetch("http://localhost:443/api/labels");
  return await response.json(); 
}

export function getMinVal(data: DataItem[]) {
  return Math.round(Math.min(...data.map((item) => item.YEAR)));
}

export function getMaxVal(data: DataItem[]) {
  return Math.round(Math.max(...data.map((item) => item.YEAR)));
}