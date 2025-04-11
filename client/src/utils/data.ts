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