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

export interface RankItem {
  CLUSTER: number;
  LABEL: string;
  RANK: number;
}


export async function fetchData(plotType: string): Promise<DataItem[]> {
  const response = await fetch(`http://localhost:443/api/points?plot=${encodeURIComponent(plotType)}`);
  return await response.json(); 
}

export async function fetchLabel(plotType: string): Promise<LabelItem[]> {
  const response = await fetch(`http://localhost:443/api/labels?plot=${encodeURIComponent(plotType)}`);
  return await response.json(); 
}

export async function fetchRank(plotType: string): Promise<RankItem[]> {
  const response = await fetch(`http://localhost:443/api/ranks?plot=${encodeURIComponent(plotType)}`);
  return await response.json(); 
}

export function getMinVal(data: DataItem[]) {
  return Math.round(Math.min(...data.map((item) => item.YEAR)));
}

export function getMaxVal(data: DataItem[]) {
  return Math.round(Math.max(...data.map((item) => item.YEAR)));
}