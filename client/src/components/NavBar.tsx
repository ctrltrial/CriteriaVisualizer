function NavBar() {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="rounded-lg shadow-2xl">
        <div className="bg-[rgba(30,30,30,0.3)] backdrop-blur-3xl rounded-lg text-white border border-white/20 px-4 sm:px-6 py-2 transition-all duration-300 ease-in-out">
          <div className="flex items-center gap-4 whitespace-nowrap">
            {/* <a
              href="https://ctrltrial.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer transition hover:opacity-80"
            >
              <img
                src="ctrl-trial-logo-copy.png"
                alt="Ctrl Trial Logo"
                className="w-20 h-auto"
              />
            </a> */}
            <span className="text-lg sm:text-xl font-semibold text-white">
              Clinical Trial Criteria Visualizer
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

interface GraphToggleProps {
  activePlot: string;
  setActivePlot: (plot: string) => void;
  plots: string[];
}

export const PlotToggle: React.FC<GraphToggleProps> = ({
  activePlot,
  setActivePlot,
  plots,
}) => {
  return (
    <div className="absolute top-4 left-4 z-50 bg-[rgba(30,30,30,0.5)] backdrop-blur rounded p-2 shadow-md transition-all duration-300 ease-in-out">
      <div className="flex flex-col sm:flex-row gap-2 z-10">
        {plots.map((plot) => (
          <button
            key={plot}
            onClick={() => setActivePlot(plot)}
            className={`text-xs sm:text-sm px-3 py-1 rounded transition-all duration-200 ease-in-out hover:scale-105
              ${
                activePlot === plot
                  ? "bg-white text-black font-semibold"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
          >
            {plot}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavBar;
