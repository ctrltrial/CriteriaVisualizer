import { RankItem } from "../utils/data.ts";

interface Props {
    rankData: RankItem[];
}

export const InfoBox: React.FC<Props> = ({ rankData }) => {
    const sortedRanks = rankData.slice().sort((a, b) => a.RANK - b.RANK);
    return (
      <div className="absolute top-4 left-4 bg-[rgba(30,30,30,0.3)] backdrop-blur-3xl rounded-lg text-white border border-white/20 p-3 z-10 max-h-[96vh] overflow-y-auto">
        <h3 className="text-sm font-semibold mb-2">Common Criteria</h3>
        <ul className="text-xs pl-1">
          {sortedRanks.map(({ CLUSTER, LABEL, RANK }) => (
            <li key={CLUSTER} className="my-1">
              <span className="font-bold text-white/80">{RANK}.</span> {LABEL}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  