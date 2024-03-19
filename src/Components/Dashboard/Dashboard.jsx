import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
// import MainContent from './MainContent';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="flex flex-col h-screen">
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex flex-1 overflow-hidden">
      <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        {/* <MainContent /> */}
      </div>
    </div>
  );
};

export default Dashboard;
