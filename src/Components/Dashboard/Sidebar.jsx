import React, { useState } from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StorageIcon from "@mui/icons-material/Storage";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import Documents from "./Sections/Documents/Documents";
import LoadingBar from "react-top-loading-bar";
import Starred from "./Sections/Starred/StarDocuments";
import RecentDocuments from "./Sections/Recent/RecentDocuments";
import ScanDocuments from "./Sections/ScanDocuments/ScanDocuments";
import Camera from "./Sections/ScanDocuments/Camera";
import RelatedInfo from "./Sections/RelatedInfo/RelatedInfo";

const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  selectedOption,
  setSelectedOption,
}) => {
  const [progress, setProgress] = useState(0); // State for loading bar progress

  const handleOptionClick = (option) => {
    setProgress(30); // Start loading process
    setSelectedOption(option);
    setIsSidebarOpen(!isSidebarOpen);
    setTimeout(() => setProgress(100), 500); // Simulate loading process
  };

  return (
    <>
      <LoadingBar color="#0066ff" progress={progress} height={4} />
      <div className="flex h-screen">
        <div
          className={`fixed bottom-0 z-50 left-0 w-64 bg-blue-50 p-5 flex-col cursor-pointer  ${
            isSidebarOpen ? "translate-x-0 top-0" : "-translate-x-full top-0"
          } md:relative md:translate-x-0 md:w-64 md:flex md:flex-col`}
        >
          <div className="flex items-center mb-3">
            <span className="font-bold text-lg">My Notes</span>
          </div>
          <div className="flex flex-col">
            <div
              className={`flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md ${
                selectedOption === "documents" ? "bg-blue-200" : ""
              }`}
              onClick={() => handleOptionClick("documents")}
            >
              <DescriptionIcon className="mr-2" /> Documents
            </div>
            <div
              className={`flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md ${
                selectedOption === "camera" ? "bg-blue-200" : ""
              }`}
              onClick={() => handleOptionClick("camera")}
            >
              <CameraAltIcon className="mr-2" /> Camera
            </div>
            <div
              className={`flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md ${
                selectedOption === "scandocuments" ? "bg-blue-200" : ""
              }`}
              onClick={() => handleOptionClick("scandocuments")}
            >
              <DocumentScannerIcon className="mr-2" /> Scan Documents
            </div>
            <div
              className={`flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md ${
                selectedOption === "starred" ? "bg-blue-200" : ""
              }`}
              onClick={() => handleOptionClick("starred")}
            >
              <StarBorderIcon className="mr-2" /> Starred
            </div>
            <div
              className={`flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md ${
                selectedOption === "trash" ? "bg-blue-200" : ""
              }`}
              onClick={() => handleOptionClick("trash")}
            >
              <AutoAwesomeIcon className="mr-2" /> Related Info
            </div>
            <div
              className={`flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md ${
                selectedOption === "recent" ? "bg-blue-200" : ""
              }`}
              onClick={() => handleOptionClick("recent")}
            >
              <ScheduleIcon className="mr-2" /> Recent
            </div>
            {/* <div
              className={`flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md ${
                selectedOption === "storage" ? "bg-blue-200" : ""
              }`}
              onClick={() => handleOptionClick("storage")}
            >
              <StorageIcon className="mr-2" /> Storage
            </div> */}
          </div>
        </div>

        {/* Content on the right side */}
        {selectedOption && (
          <div className="flex-grow p-5">
            {/* Render the specific content for the selected option */}
            {selectedOption === "documents" && (
              <div className="bg-white p-5 rounded-md">
                <Documents />
              </div>
            )}
            {selectedOption === "camera" && (
              <div className="bg-white p-5 rounded-md">
                <Camera />
              </div>
            )}
            {selectedOption === "scandocuments" && (
              <div className="bg-white p-5 rounded-md">
                <ScanDocuments />
              </div>
            )}
            {selectedOption === "recent" && (
              <div className="bg-white p-5 rounded-md">
                <RecentDocuments />
              </div>
            )}
            {selectedOption === "starred" && (
              <div className="bg-white p-5 rounded-md">
                <Starred />
              </div>
            )}
            {selectedOption === "trash" && (
              <div className="bg-white p-5 rounded-md">
                <RelatedInfo />
              </div>
            )}
            {/* {selectedOption === "storage" && (
              <div className="bg-white p-5 rounded-md">
                <h2>Storage Content</h2>
              </div>
            )} */}
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
