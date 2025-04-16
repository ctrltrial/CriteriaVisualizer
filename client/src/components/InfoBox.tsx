import { RankItem } from "../utils/data.ts";

interface Props {
    rankData: RankItem[];
}

export const InfoBox: React.FC<Props> = ({ rankData }) => {
    return (
        <div className="absolute top-4 left-4 bg-[rgba(30,30,30,0.3)] backdrop-blur-3xl rounded-lg text-white border border-white/20 p-3 z-10">
            <h3 className="text-sm font-semibold mb-2">Ranks</h3>
            {rankData.map(({ CLUSTER, LABEL, RANK }) => (
            <div key={CLUSTER} className="flex items-center justify-between my-1 text-xs">
                <span>{LABEL}</span>
                <span className="ml-4 font-bold text-white/80">{RANK}</span>
            </div>
            ))}
        </div>
    );
};