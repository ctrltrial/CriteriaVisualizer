function NavBar() {
  return (
    <nav className="navbar fixed-top bg-light shadow-sm">
      <div className="container d-flex align-items-center gap-3">
        <img
          src="ctrl-trial-logo-copy.png"
          alt="Logo"
          width="110"
          height="50"
        />
        <a className="navbar-brand fs-4 text-dark">
          Clinical Trial Criteria Visualizer
        </a>
      </div>
    </nav>
  );
}

export default NavBar;
