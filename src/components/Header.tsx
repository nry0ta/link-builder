import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="app-header">
      <div className="container">
        <Link to="/" className="header-logo">
          Link Builder <span className="version-tag">β ver. 2.1 (React)</span>
        </Link>
      </div>
      <div className="header-controls">
        <Link to="/usage" className="header-text-link">使い方</Link>
        <Link to="/settings" className="setting-button">設定</Link>
      </div>
    </header>
  );
}

export default Header;
