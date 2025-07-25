import { Outlet } from 'react-router-dom';
import './App.css';

function getTodayMDTPretty() {
  const mdtDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Denver' }));
  return mdtDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Denver'
  });
}

function Layout() {
  const todayPrettyMDT = getTodayMDTPretty();
  return (
    <div className="app">
      <header className="app-header">
        <h1>Fire Analysis Dashboard</h1>
        <p>Fire analysis graphs for ({todayPrettyMDT} MDT)<br/> updated daily at 8:30am MDT</p>
      </header>
      <Outlet />
    </div>
  );
}

export default Layout; 