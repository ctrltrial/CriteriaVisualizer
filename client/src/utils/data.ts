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

// Use relative path to work in both local dev and production
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:4000/api"
    : "http://3.23.217.207:4000/api"; // my ec2 host address

export async function fetchData(plotType: string): Promise<DataItem[]> {
  const response = await fetch(
    `${API_BASE}/points?plot=${encodeURIComponent(plotType)}`
  );
  return await response.json();
}

export async function fetchLabel(plotType: string): Promise<LabelItem[]> {
  const response = await fetch(
    `${API_BASE}/labels?plot=${encodeURIComponent(plotType)}`
  );
  return await response.json();
}

export async function fetchRank(plotType: string): Promise<RankItem[]> {
  const response = await fetch(
    `${API_BASE}/ranks?plot=${encodeURIComponent(plotType)}`
  );
  return await response.json();
}

export function getMinVal(data: DataItem[]) {
  return Math.round(Math.min(...data.map((item) => item.YEAR)));
}

export function getMaxVal(data: DataItem[]) {
  return Math.round(Math.max(...data.map((item) => item.YEAR)));
}
