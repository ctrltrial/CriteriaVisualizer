import React from "react";

function NavBar() {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="rounded-lg shadow-2xl">
        <div className="bg-white backdrop-blur-sm rounded-lg px-6 py-2">
          <div className="flex items-center gap-3">
            <img
              src="ctrl-trial-logo-copy.png"
              alt="Logo"
              className="w-20 h-auto"
            />
            <span className="text-xl font-semibold text-gray-800">
              Clinical Trial Criteria Visualizer
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;