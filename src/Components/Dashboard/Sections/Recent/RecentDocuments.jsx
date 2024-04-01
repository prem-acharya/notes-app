import React, { useEffect, useState, useRef } from "react";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import TableChartIcon from "@mui/icons-material/TableChart";
import GifBoxIcon from "@mui/icons-material/GifBox";
import MovieIcon from "@mui/icons-material/Movie";
import MusicVideoIcon from "@mui/icons-material/MusicVideo";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import TerminalIcon from "@mui/icons-material/Terminal";
import ClearIcon from "@mui/icons-material/Clear";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { storage, firestore } from "../../../../firebase";
import { collection, query, where, getDocs, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useAuth } from "../../../Authentication/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FileOptionsDropdown from "../Documents/FileOptionsDropdown";
import LoadingBar from "react-top-loading-bar";

const RecentDocuments = ({ setSelectedFile }) => {
  const { currentUser } = useAuth();
  const [userFiles, setUserFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const uploadTaskRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolder, setIsCreateFolder] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState("root");
  const [breadcrumbPath, setBreadcrumbPath] = useState([{ name: "Star Notes", id: "root" }]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [progress, setProgress] = useState(0);

  const toggleDropdown = (folderId) => {
    if (dropdownOpen === folderId) {
      setDropdownOpen(null);
    } else {
      setDropdownOpen(folderId);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeFolders = onSnapshot(
      query(
        collection(firestore, "folders"),
        where("userId", "==", currentUser.uid),
      ),
      (snapshot) => {
        const foldersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFolders(foldersData);
      }
    );

    const unsubscribeFiles = onSnapshot(
      query(
        collection(firestore, "files"),
        where("userId", "==", currentUser.uid),
      ),
      (snapshot) => {
        const filesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserFiles(filesData);
      }
    );

    return () => {
      unsubscribeFolders();
      unsubscribeFiles();
    };
  }, [currentUser, currentFolderId]);


  const cancelUpload = () => {
    if (uploadTaskRef.current) {
      uploadTaskRef.current.cancel(); // Use the ref to access the current upload task
      setIsUploading(false);
      setUploadProgress(0);
      setShowCancelDialog(false); // Hide the cancel dialog
    }
  };

  const handleFileClick = async (file) => {
    setSelectedFile(file);

    // Reference to the clicked file in Firestore
    const fileRef = doc(firestore, "files", file.id);

    // Update the lastOpened timestamp of the file
    await updateDoc(fileRef, {
      lastOpened: new Date().toISOString() // Store the current timestamp
    }).then(() => {
    //   console.log("Timestamp updated successfully");
    }).catch((error) => {
    //   console.error("Error updating timestamp: ", error);
    });
  };

  const getFileIcon = (fileName, colorClass = "") => {
    const extension = fileName.split(".").pop().toLowerCase();

    switch (extension) {
      case "pdf":
        return <PictureAsPdfIcon className={colorClass} />;
      case "png":
      case "jpg":
      case "jpeg":
        return <ImageIcon className={colorClass} />;
      case "mp4":
        return <MovieIcon className={colorClass} />;
      case "mp3":
        return <MusicVideoIcon className={colorClass} />;
      case "docx":
        return <DescriptionIcon className={colorClass} />;
      case "pptx":
        return <SlideshowIcon className={colorClass} />;
      case "xlsx":
        return <TableChartIcon className={colorClass} />;
      case "gif":
        return <GifBoxIcon className={colorClass} />;
      case "zip":
        return <FolderZipIcon className={colorClass} />;
      case "py":
      case "c":
      case "html":
      case "c#":
      case "cpp":
      case "css":
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "json":
      case "dart":
      case "md":
      case "yaml":
      case "cc":
      case "php":
        return <TerminalIcon className={colorClass} />;
      default:
        return <InsertDriveFileIcon className={colorClass} />;
    }
  };

  const handleColorChange = (folderId, colorClass) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === folderId ? { ...folder, color: colorClass } : folder
      )
    );
    setUserFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === folderId ? { ...file, color: colorClass } : file
      )
    );
  };

  const categorizeFilesByDate = (files) => {
    const categories = {
      today: [],
      tomorrow: [],
      thisWeek: [],
      thisMonth: [],
      thisYear: [],
      older: []
    };

    files.forEach(file => {
      const fileDate = new Date(file.lastOpened);
      if (isToday(fileDate)) {
        categories.today.push(file);
      } else if (isTomorrow(fileDate)) {
        categories.tomorrow.push(file);
      } else if (isThisWeek(fileDate)) {
        categories.thisWeek.push(file);
      } else if (isThisMonth(fileDate)) {
        categories.thisMonth.push(file);
      } else if (isThisYear(fileDate)) {
        categories.thisYear.push(file);
      } else if (isOlderThanOneYear(fileDate)) {
        categories.older.push(file);
      }
    });

    return categories;
  };
  
  // Helper functions to determine the date category
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const isTomorrow = (date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };
  
  const isThisWeek = (date) => {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return date >= weekStart && date <= weekEnd;
  };

  const isThisMonth = (date) => {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const isThisYear = (date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear();
  };

  const isOlderThanOneYear = (date) => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return date < oneYearAgo;
  };

  const { today, tomorrow, thisWeek, thisMonth, thisYear, older } = categorizeFilesByDate(userFiles);

  document.title = "Starred Documents - Notes App";

  return (
    <>
      <LoadingBar color="#0066ff" progress={progress} height={4} />
      <div className="bg-white p-5 rounded-md absolute top-20 left-5 md:left-72 right-5 md:right-5">
        <div className={`relative`}>
          <div className="flex md:flex-row justify-between items-center mb-4">
            <h2 className="text-xl font-semibold mb-4 md:mb-0">Recent Documents</h2>
          </div>
          <div className="px-2">
            <hr />
          </div>
          {/* Files Section */}
          <div className="h-[68vh] overflow-y-scroll overflow-x-hidden">
          {today.length > 0 && (
            <div className="mt-4 ml-2 mr-2 cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Today</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {today.map((file) => (
                  <div
                    key={file.id}
                    className="relative bg-blue-50 hover:bg-blue-100 shadow-md rounded-md p-4 flex flex-col justify-between items-center">
                    <div className="flex justify-between items-center w-full">
                      <div
                        className="flex items-center space-x-2"
                        onClick={() => handleFileClick(file)}
                      >
                        <div className="text-blue-400">
                          {getFileIcon(file.name, file.color || "text-blue-400")}
                        </div>
                        <span
                          className="text-sm font-medium truncate"
                          title={file.name}
                        >
                          {file.name.slice(0, 15)}
                          {file.name.length > 15 ? "..." : ""}
                        </span>
                      </div>
                      <MoreVertIcon
                        className="text-gray-600 hover:bg-gray-300 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(file.id);
                        }}
                      />
                      <FileOptionsDropdown
                        file={file}
                        isOpen={dropdownOpen === file.id}
                        toggleDropdown={toggleDropdown}
                        onRenameSuccess={() => {}}
                        fileColor={file.color}
                          onColorChange={(colorClass) =>
                            handleColorChange(file.id, colorClass)
                          }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tomorrow.length > 0 && (
            <div className="mt-4 ml-2 mr-2 cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Tomorrow</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tomorrow.map((file) => (
                  <div
                    key={file.id}
                    className="relative bg-blue-50 hover:bg-blue-100 shadow-md rounded-md p-4 flex flex-col justify-between items-center">
                    <div className="flex justify-between items-center w-full">
                      <div
                        className="flex items-center space-x-2"
                        onClick={() => handleFileClick(file)}
                      >
                        <div className="text-blue-400">
                          {getFileIcon(file.name, file.color || "text-blue-400")}
                        </div>
                        <span
                          className="text-sm font-medium truncate"
                          title={file.name}
                        >
                          {file.name.slice(0, 15)}
                          {file.name.length > 15 ? "..." : ""}
                        </span>
                      </div>
                      <MoreVertIcon
                        className="text-gray-600 hover:bg-gray-300 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(file.id);
                        }}
                      />
                      <FileOptionsDropdown
                        file={file}
                        isOpen={dropdownOpen === file.id}
                        toggleDropdown={toggleDropdown}
                        onRenameSuccess={() => {}}
                        fileColor={file.color}
                          onColorChange={(colorClass) =>
                            handleColorChange(file.id, colorClass)
                          }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {thisWeek.length > 0 && (
            <div className="mt-4 ml-2 mr-2 cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Earlier this week</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {thisWeek.map((file) => (
                  <div
                    key={file.id}
                    className="relative bg-blue-50 hover:bg-blue-100 shadow-md rounded-md p-4 flex flex-col justify-between items-center">
                    <div className="flex justify-between items-center w-full">
                      <div
                        className="flex items-center space-x-2"
                        onClick={() => handleFileClick(file)}
                      >
                        <div className="text-blue-400">
                          {getFileIcon(file.name, file.color || "text-blue-400")}
                        </div>
                        <span
                          className="text-sm font-medium truncate"
                          title={file.name}
                        >
                          {file.name.slice(0, 15)}
                          {file.name.length > 15 ? "..." : ""}
                        </span>
                      </div>
                      <MoreVertIcon
                        className="text-gray-600 hover:bg-gray-300 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(file.id);
                        }}
                      />
                      <FileOptionsDropdown
                        file={file}
                        isOpen={dropdownOpen === file.id}
                        toggleDropdown={toggleDropdown}
                        onRenameSuccess={() => {}}
                        fileColor={file.color}
                          onColorChange={(colorClass) =>
                            handleColorChange(file.id, colorClass)
                          }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {thisMonth.length > 0 && (
            <div className="mt-4 ml-2 mr-2 cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Earlier this month</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {thisMonth.map((file) => (
                  <div
                    key={file.id}
                    className="relative bg-blue-50 hover:bg-blue-100 shadow-md rounded-md p-4 flex flex-col justify-between items-center">
                    <div className="flex justify-between items-center w-full">
                      <div
                        className="flex items-center space-x-2"
                        onClick={() => handleFileClick(file)}
                      >
                        <div className="text-blue-400">
                          {getFileIcon(file.name, file.color || "text-blue-400")}
                        </div>
                        <span
                          className="text-sm font-medium truncate"
                          title={file.name}
                        >
                          {file.name.slice(0, 15)}
                          {file.name.length > 15 ? "..." : ""}
                        </span>
                      </div>
                      <MoreVertIcon
                        className="text-gray-600 hover:bg-gray-300 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(file.id);
                        }}
                      />
                      <FileOptionsDropdown
                        file={file}
                        isOpen={dropdownOpen === file.id}
                        toggleDropdown={toggleDropdown}
                        onRenameSuccess={() => {}}
                        fileColor={file.color}
                          onColorChange={(colorClass) =>
                            handleColorChange(file.id, colorClass)
                          }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {thisYear.length > 0 && (
            <div className="mt-4 ml-2 mr-2 cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Earlier this year</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {thisYear.map((file) => (
                  <div
                    key={file.id}
                    className="relative bg-blue-50 hover:bg-blue-100 shadow-md rounded-md p-4 flex flex-col justify-between items-center">
                    <div className="flex justify-between items-center w-full">
                      <div
                        className="flex items-center space-x-2"
                        onClick={() => handleFileClick(file)}
                      >
                        <div className="text-blue-400">
                          {getFileIcon(file.name, file.color || "text-blue-400")}
                        </div>
                        <span
                          className="text-sm font-medium truncate"
                          title={file.name}
                        >
                          {file.name.slice(0, 15)}
                          {file.name.length > 15 ? "..." : ""}
                        </span>
                      </div>
                      <MoreVertIcon
                        className="text-gray-600 hover:bg-gray-300 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(file.id);
                        }}
                      />
                      <FileOptionsDropdown
                        file={file}
                        isOpen={dropdownOpen === file.id}
                        toggleDropdown={toggleDropdown}
                        onRenameSuccess={() => {}}
                        fileColor={file.color}
                          onColorChange={(colorClass) =>
                            handleColorChange(file.id, colorClass)
                          }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {older.length > 0 && (
            <div className="mt-4 ml-2 mr-2 cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Older</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {older.map((file) => (
                  <div
                    key={file.id}
                    className="relative bg-blue-50 hover:bg-blue-100 shadow-md rounded-md p-4 flex flex-col justify-between items-center">
                    <div className="flex justify-between items-center w-full">
                      <div
                        className="flex items-center space-x-2"
                        onClick={() => handleFileClick(file)}
                      >
                        <div className="text-blue-400">
                          {getFileIcon(file.name, file.color || "text-blue-400")}
                        </div>
                        <span
                          className="text-sm font-medium truncate"
                          title={file.name}
                        >
                          {file.name.slice(0, 15)}
                          {file.name.length > 15 ? "..." : ""}
                        </span>
                      </div>
                      <MoreVertIcon
                        className="text-gray-600 hover:bg-gray-300 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(file.id);
                        }}
                      />
                      <FileOptionsDropdown
                        file={file}
                        isOpen={dropdownOpen === file.id}
                        toggleDropdown={toggleDropdown}
                        onRenameSuccess={() => {}}
                        fileColor={file.color}
                          onColorChange={(colorClass) =>
                            handleColorChange(file.id, colorClass)
                          }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
          <ToastContainer />
        </div>
        {isUploading && (
          <div className="fixed bottom-5 z-50 right-5 bg-blue-100 p-6 shadow-lg rounded-md">
            <div className="flex items-center text-xl justify-between">
              <span className="ml-4">Uploading...</span>
              <span className="mr-4">{Math.round(uploadProgress)}%</span>
              <button
                onClick={() => setShowCancelDialog(true)}
                title="Cancel upload"
              >
                <ClearIcon />
              </button>
            </div>
            <div className="w-full mt-4 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        {showCancelDialog && (
          <div className="fixed inset-0 z-50 bg-gray-50 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg shadow-xl">
              <h3 className="text-lg font-bold mb-4">Cancel Upload?</h3>
              <p>
                Your upload is not complete. Would you like to cancel the
                upload?
              </p>
              <div className="flex justify-end mt-4">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                  onClick={() => setShowCancelDialog(false)}
                >
                  Continue Upload
                </button>
                <button
                  className="font-bold py-2 px-4 rounded border-2 border-blue-500 hover:border-red-500"
                  onClick={cancelUpload}
                >
                  Cancel Upload
                </button>
              </div>
            </div>
          </div>
        )}
        {showCreateFolderModal && (
          <div
            className="fixed inset-0 z-50 bg-gray-50 bg-opacity-50 overflow-y-auto h-full w-full"
            id="my-modal"
          >
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-700">
                  New folder
                </h3>
                <div className="mt-2 px-7 py-3">
                  <input
                    type="text"
                    className="border rounded-md py-2 px-3 text-grey-darkest w-full"
                    placeholder="Untitled folder"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    id="cancel-modal"
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-md mr-1"
                    onClick={() => setShowCreateFolderModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    id="create-folder"
                    disabled={isCreateFolder}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md ml-1"
                    onClick={createFolder}
                  >
                    {isCreateFolder ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RecentDocuments
