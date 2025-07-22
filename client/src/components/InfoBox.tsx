import React from "react";
import { RankItem } from "../utils/data";

interface InfoBoxProps {
  rankData: RankItem[];
  hoveredCluster?: string;
  setHoveredCluster: (cluster: string | undefined) => void;
  activePlot: string; // new prop
  clusterColors?: string[]; // new prop for cluster colors
  clusterCounts?: { [key: number]: number }; // new prop for cluster counts
}

export const InfoBox: React.FC<InfoBoxProps> = ({
  rankData,
  hoveredCluster,
  setHoveredCluster,
  activePlot, // new prop
  clusterColors = [], // new prop with default value
  clusterCounts = {}, // new prop with default value
}) => {
  const sortedRanks = rankData.slice().sort((a, b) => {
    const countA = clusterCounts[a.CLUSTER] || 0;
    const countB = clusterCounts[b.CLUSTER] || 0;
    return countB - countA; // Sort in descending order (highest count first)
  });

  return (
    <div className="absolute bottom-4 left-4 backdrop-blur-3xl rounded-lg text-white border border-white/20 p-3 z-10 max-h-[50vh] flex flex-col w-[280px] sm:w-[300px] md:w-[280px] lg:w-[300px] xl:w-[320px] transition-all duration-300 ease-in-out">
      {/* Header stays fixed */}
      <h3 className="text-sm font-semibold mb-2">
        {`${activePlot} Clinical Trial Criteria`}
      </h3>

      {/* Scrollable List (with hidden scrollbar) */}
      <div className="overflow-y-auto no-scrollbar max-h-[calc(50vh-6rem)] flex-grow">
        <ul className="text-xs pl-1">
          {sortedRanks.map(({ CLUSTER, LABEL, RANK }, index) => {
            const clusterColor = clusterColors[CLUSTER - 1] || "#ffffff";
            return (
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
                <div className="flex items-center">
                  <span className="font-bold text-white/80">{index + 1}.</span> {LABEL}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom-Aligned Content */}
      <div className="mt-2 text-[10px] text-white/50">Scroll for more ▼</div>
    </div>
  );
};
