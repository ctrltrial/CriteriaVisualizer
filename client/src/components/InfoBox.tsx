import React from "react";
import { RankItem } from "../utils/data";

interface InfoBoxProps {
  rankData: RankItem[];
  hoveredCluster?: string;
  setHoveredCluster: (cluster: string | undefined) => void;
}

export const InfoBox: React.FC<InfoBoxProps> = ({
  rankData,
  hoveredCluster,
  setHoveredCluster,
}) => {
  const sortedRanks = rankData.slice().sort((a, b) => a.RANK - b.RANK);

  return (
    <div className="absolute top-4 left-4 bg-[rgba(30,30,30,0.3)] backdrop-blur-3xl rounded-lg text-white border border-white/20 p-3 z-10 max-h-[90vh] overflow-y-auto">
      <h3 className="text-sm font-semibold mb-2">Common Breast Cancer Clinical Trial Criteria</h3>
      <ul className="text-xs pl-1">
        {sortedRanks.map(({ CLUSTER, LABEL, RANK }) => (
          <li
            key={CLUSTER}
            className={`my-1 cursor-pointer rounded ${
              hoveredCluster === String(CLUSTER)
                ? "bg-white/20 text-blue-300 font-bold"
                : ""
            }`}
            onMouseEnter={() => setHoveredCluster(String(CLUSTER))}
            onMouseLeave={() => setHoveredCluster(undefined)}
          >
            <span className="font-bold text-white/80">{RANK}.</span> {LABEL}
          </li>
        ))}
      </ul>
    </div>
  );
};
