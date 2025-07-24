import { Outlet } from 'react-router-dom';
import './App.css';

function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Fire Analysis Dashboard</h1>
        <p>Fire analysis graphs for today</p>
      </header>
      <Outlet />
    </div>
  );
}

export default Layout; 