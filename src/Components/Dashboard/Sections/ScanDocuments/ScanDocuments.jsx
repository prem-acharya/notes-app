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
        collection(firestore, "scan-documents"), // Changed from "files" to "scan-documents"
        where("userId", "==", currentUser.uid),
      ),
      (snapshot) => {
        const filesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserFiles(filesData);
      },
      (error) => {
        console.error("Error fetching scan documents:", error); // Error handling
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
    const fileRef = doc(firestore, "scan-documents", file.id);

    // Update the lastOpened timestamp of the file
    await updateDoc(fileRef, {
      lastOpened: new Date().toISOString() // Store the current timestamp
    }).then(() => {
    //   console.log("Timestamp updated successfully");
    }).catch((error) => {
    //   console.error("Error updating timestamp: ", error);
    });
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



  document.title = "Starred Documents - Notes App";

  return (
    <>
      <LoadingBar color="#0066ff" progress={progress} height={4} />
      <div className="bg-white p-5 rounded-md absolute top-20 left-5 md:left-72 right-5 md:right-5">
        <div className={`relative`}>
          <div className="flex md:flex-row justify-between items-center mb-4">
            <h2 className="text-xl font-semibold mb-4 md:mb-0">Scan Documents</h2>
          </div>
          <div className="px-2">
            <hr />
          </div>
          {/* Files Section */}
          <div className="mt-4 ml-2 mr-2 cursor-pointer">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {userFiles.length > 0 ? (
                userFiles.map((file) => (
                  <div
                    key={file.id}
                    className="relative bg-blue-50 hover:bg-blue-100 shadow-md rounded-md p-4 flex flex-col justify-between items-center">
                    <div className="flex justify-between items-center w-full">
                      <div
                        className="flex items-center space-x-2"
                        onClick={() => handleFileClick(file)}
                      >
                        <div className="text-blue-400">
                          <ImageIcon className={file.color || "text-blue-400"} />
                        </div>
                        <span
                          className="text-sm font-medium truncate"
                          title={file.name}
                        >
                          {file.name}
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
                ))
              ) : (
                <div className="mb-14 ml-4 text-gray-500">No scan documents found</div>
              )}
            </div>
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
        
      </div>
    </>
  );
};

export default RecentDocuments
