import React, { useState } from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import ShareIcon from "@mui/icons-material/Share";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import StorageIcon from "@mui/icons-material/Storage";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import Documents from "./Sections/Documents";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [selectedOption, setSelectedOption] = useState("documents");

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      <div
        className={`fixed bottom-0 z-50 left-0 w-64 bg-blue-50 p-5 flex-col cursor-pointer  ${
          isSidebarOpen ? "translate-x-0 top-20" : "-translate-x-full top-0"
        } md:relative md:translate-x-0 md:w-64 md:flex md:flex-col`}
      >
        <div className="flex items-center mb-3">
          <span className="font-bold text-lg">My Notes</span>
        </div>
        <div className="flex flex-col">
          <div
            className={`flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md ${
              selectedOption === "documents" ? "bg-gray-200" : ""
            }`}
            onClick={() => handleOptionClick("documents")}
          >
            <DescriptionIcon className="mr-2" /> Documents
          </div>
          <div
            className={`flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md ${
              selectedOption === "scanner" ? "bg-gray-200" : ""
            }`}
            onClick={() => handleOptionClick("scanner")}
          >
            <DocumentScannerIcon className="mr-2" /> Scanner
          </div>
          <div
            className={`flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md ${
              selectedOption === "recent" ? "bg-gray-200" : ""
            }`}
            onClick={() => handleOptionClick("recent")}
          >
            <ScheduleIcon className="mr-2" /> Recent
          </div>
          <div
            className={`flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md ${
              selectedOption === "shared" ? "bg-gray-200" : ""
            }`}
            onClick={() => handleOptionClick("shared")}
          >
            <ShareIcon className="mr-2" /> Shared with me
          </div>
          <div
            className={`flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md ${
              selectedOption === "starred" ? "bg-gray-200" : ""
            }`}
            onClick={() => handleOptionClick("starred")}
          >
            <StarBorderIcon className="mr-2" /> Starred
          </div>
          <div
            className={`flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md ${
              selectedOption === "trash" ? "bg-gray-200" : ""
            }`}
            onClick={() => handleOptionClick("trash")}
          >
            <DeleteOutlineIcon className="mr-2" /> Trash
          </div>
          <div
            className={`flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md ${
              selectedOption === "storage" ? "bg-gray-200" : ""
            }`}
            onClick={() => handleOptionClick("storage")}
          >
            <StorageIcon className="mr-2" /> Storage
          </div>
        </div>
      </div>

      {/* Content on the right side */}
      {selectedOption && (
        <div className="flex-grow p-5">
          {/* Render the specific content for the selected option */}
          {selectedOption === "documents" && (
            <div className="bg-white p-5 rounded-md"><Documents /></div>
          )}
          {selectedOption === "scanner" && (
            <div className="bg-white p-5 rounded-md">
              <h2>Scanner Content</h2>
            </div>
          )}
          {selectedOption === "recent" && (
            <div className="bg-white p-5 rounded-md">
              <h2>Recent Content</h2>
            </div>
          )}
          {selectedOption === "shared" && (
            <div className="bg-white p-5 rounded-md">
              <h2>Shared Content</h2>
            </div>
          )}
          {selectedOption === "starred" && (
            <div className="bg-white p-5 rounded-md">
              <h2>Starred Content</h2>
            </div>
          )}
          {selectedOption === "trash" && (
            <div className="bg-white p-5 rounded-md">
              <h2>Trash Content</h2>
            </div>
          )}
          {selectedOption === "storage" && (
            <div className="bg-white p-5 rounded-md">
              <h2>Storage Content</h2>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
