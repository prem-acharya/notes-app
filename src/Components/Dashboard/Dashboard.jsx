import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
// import MainContent from './MainContent';
import Documents from './Sections/Documents'; // Import Documents
import FileReader from './Sections/FileReader'; // Import FileReader

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // State for selected file

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
        <Documents setSelectedFile={setSelectedFile} /> {/* Pass setSelectedFile to Documents */}
        {/* <MainContent /> */}
      </div>
      {selectedFile && (
        <FileReader
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
