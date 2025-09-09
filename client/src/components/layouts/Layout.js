import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';

const Layout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
