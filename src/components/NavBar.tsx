import "./NavBar.css"; // Import styles for more customization

function NavBar() {
  return (
    <nav className="navbar fixed-top glassmorphic-nav">
      <div className="container d-flex justify-content-center align-items-center gap-3">
        <img
          src="ctrl-trial-logo-copy.png"
          alt="Logo"
          width="90"
          height="40"
          className="logo"
        />
        <a className="navbar-brand modern-text">
          Clinical Trial Criteria Visualizer
        </a>
      </div>
    </nav>
  );
}

export default NavBar;
