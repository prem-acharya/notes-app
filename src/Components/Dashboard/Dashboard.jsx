import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
// import MainContent from './MainContent';

const Dashboard = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {/* <MainContent /> */}
      </div>
    </div>
  );
};

export default Dashboard;
