import React from "react";
import { RankItem } from "../utils/data";

interface InfoBoxProps {
  rankData: RankItem[];
  hoveredCluster?: string;
  setHoveredCluster: (cluster: string | undefined) => void;
  activePlot: string; // new prop
}

export const InfoBox: React.FC<InfoBoxProps> = ({
  rankData,
  hoveredCluster,
  setHoveredCluster,
  activePlot, // new prop
}) => {
  const sortedRanks = rankData.slice().sort((a, b) => a.RANK - b.RANK);

  return (
    <div className="absolute bottom-4 left-4 bg-[rgba(30,30,30,0.3)] backdrop-blur-3xl rounded-lg text-white border border-white/20 p-3 z-10 max-h-[40vh] flex flex-col">
      {/* Header stays fixed */}
      <h3 className="text-sm font-semibold mb-2">
        {`Common ${activePlot} Clinical Trial Criteria`}
      </h3>

      {/* Scrollable List (with hidden scrollbar) */}
      <div className="overflow-y-auto no-scrollbar max-h-[calc(40vh-6rem)] flex-grow">
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

      {/* Bottom-Aligned Content */}
      <div className="mt-2 text-[10px] text-white/50">Scroll for more ▼</div>
    </div>
  );
};
