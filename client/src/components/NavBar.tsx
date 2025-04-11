function NavBar() {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="rounded-lg shadow-2xl">
        <div className="bg-[rgba(30,30,30,0.3)] backdrop-blur-3xl rounded-lg text-white border border-white/20 px-6 py-2">
          <div className="flex items-center gap-4">
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
            <span className="text-xl font-semibold text-white">
              Clinical Trial Criteria Visualizer
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
