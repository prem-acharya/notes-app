import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Documents from './Sections/Documents/Documents';
import FileReader from './Sections/Documents/FileReader';
// import MainContent from './MainContent';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // State for selected file
  const [selectedOption, setSelectedOption] = useState("documents");

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
          selectedOption={selectedOption} // Pass selectedOption to Sidebar
          setSelectedOption={setSelectedOption} // Pass setSelectedOption to Sidebar
        />
        {/* Conditional rendering based on selectedOption */}
        {selectedOption === "documents" && <Documents setSelectedFile={setSelectedFile} />}
        {/* Add similar conditions for other options like "scanner", "recent", etc. */}
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
