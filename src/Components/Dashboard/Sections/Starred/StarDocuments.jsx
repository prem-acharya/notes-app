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
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, query, where, getDocs, doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "../../../Authentication/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";
import FolderOptionsDropdown from "../Documents/FolderOptionsDropdown";
import FileOptionsDropdown from "../Documents/FileOptionsDropdown";
import LoadingBar from "react-top-loading-bar";

const Starred = ({ setSelectedFile }) => {
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

  const fetchFilesAndFolders = async (folderId = "root") => {
    if (!currentUser) return;

    setFolders([]); // Reset folders state before fetching new data
    setUserFiles([]); // Reset files state before fetching new data

    // Fetch starred folders at the current level
    const foldersQuery = query(
      collection(firestore, "folders"),
      where("userId", "==", currentUser.uid),
      where("parentId", "==", folderId),
      where("isStarred", "==", true)
    );
    const foldersSnapshot = await getDocs(foldersQuery);
    const foldersData = foldersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch starred files at the current level
    const filesQuery = query(
      collection(firestore, "files"),
      where("userId", "==", currentUser.uid),
      where("folderId", "==", folderId),
      where("isStarred", "==", true)
    );
    const filesSnapshot = await getDocs(filesQuery);
    const filesData = filesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Update state with fetched folders and files
    setFolders(foldersData);
    setUserFiles(filesData);
  };

  useEffect(() => {
    fetchFilesAndFolders(currentFolderId);
  }, [currentUser, currentFolderId]);

  const handleFolderClick = (folderId, folderName) => {
    setCurrentFolderId(folderId);
    // Update breadcrumbPath to include the new folder
    setBreadcrumbPath(prevPath => [...prevPath, { id: folderId, name: folderName }]);
    fetchFilesAndFolders(folderId);
  };

  const handleBreadcrumbClick = (folderId, index) => {
    setCurrentFolderId(folderId);
    // Trim the breadcrumbPath to the selected index
    setBreadcrumbPath(prevPath => prevPath.slice(0, index + 1));
    fetchFilesAndFolders(folderId);
  };

  const Breadcrumb = ({ path, onBreadcrumbClick }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleDropdownClick = () => {
      setIsDropdownOpen(!isDropdownOpen);
    };

    useEffect(() => {
      function handleClickOutside(event) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsDropdownOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [dropdownRef]);

    return (
      <div className="flex space-x-2">
        {path.length > 3 ? (
          <>
            <button
              className="font-semibold text-blue-500 hover:bg-blue-100 px-2 hover:rounded-full hover:text-blue-600"
              onClick={handleDropdownClick}
            >
              <MoreHorizIcon />
            </button>
            {isDropdownOpen && (
              <div
                className="absolute bg-white shadow-md rounded-md mt-1 z-10"
                ref={dropdownRef}
              >
                {path.slice(0, -2).map((crumb, index) => (
                  <div
                    key={crumb.id}
                    className="px-4 py-2 font-semibold text-blue-500 hover:bg-blue-50 cursor-pointer"
                    onClick={() => onBreadcrumbClick(crumb.id, index)}
                  >
                    {crumb.name}
                  </div>
                ))}
              </div>
            )}
            <span>
              <ArrowForwardIosIcon style={{ fontSize: "1rem" }} />
            </span>
            <button
              className="font-semibold text-blue-500 hover:bg-blue-100 px-2 hover:rounded-full hover:text-blue-600"
              onClick={() =>
                onBreadcrumbClick(path[path.length - 2].id, path.length - 2)
              }
            >
              {path[path.length - 2].name}
            </button>
            <span>
              <ArrowForwardIosIcon className="" style={{ fontSize: "1rem" }} />
            </span>
            <button
              className="font-semibold text-blue-500 hover:bg-blue-100 px-2 hover:rounded-full hover:text-blue-600"
              onClick={() =>
                onBreadcrumbClick(path[path.length - 1].id, path.length - 1)
              }
            >
              {path[path.length - 1].name}
            </button>
          </>
        ) : (
          path.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              {index > 0 && (
                <span>
                  <ArrowForwardIosIcon
                    className=""
                    style={{ fontSize: "1rem" }}
                  />
                </span>
              )}
              <button
                className="font-semibold text-blue-500 hover:bg-blue-100 px-2 hover:rounded-full hover:text-blue-600"
                onClick={() => onBreadcrumbClick(crumb.id, index)}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))
        )}
      </div>
    );
  };

  const cancelUpload = () => {
    if (uploadTaskRef.current) {
      uploadTaskRef.current.cancel(); // Use the ref to access the current upload task
      setIsUploading(false);
      setUploadProgress(0);
      setShowCancelDialog(false); // Hide the cancel dialog
    }
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
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

  document.title = "Notes App - My Documents";

  return (
    <>
      <LoadingBar color="#0066ff" progress={progress} height={4} />
      <div className="bg-white p-5 rounded-md absolute top-20 left-5 md:left-72 right-5 md:right-5">
        <div className={`relative`}>
          <div className="flex md:flex-row justify-between items-center mb-4">
            <h2 className="text-xl font-semibold mb-4 md:mb-0">Starred Documents</h2>
          </div>
          <Breadcrumb
            path={breadcrumbPath}
            onBreadcrumbClick={handleBreadcrumbClick}
          />
          <div className="px-2">
            <hr />
          </div>
          {/* Folders Section */}
          <div className="mt-4 ml-2 mr-2 cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">Folders</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="relative bg-blue-50 hover:bg-blue-100 shadow-md rounded-md p-4 flex justify-between items-center"
                  onClick={() => handleFolderClick(folder.id, folder.name)}
                >
                  <div
                    className="flex items-center"
                  >
                    <FolderIcon
                      className={`${folder.color || "text-blue-400"} text-2xl mr-2`}
                    />
                    <span className="text-sm font-medium" title={folder.name}>
                      {folder.name.slice(0, 15)}
                      {folder.name.length > 15 ? "..." : ""}
                    </span>
                  </div>
                  <MoreVertIcon
                    className="text-gray-600 hover:bg-gray-300 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(folder.id);
                    }}
                  />
                  <FolderOptionsDropdown
                    folderId={folder.id}
                    isOpen={dropdownOpen === folder.id}
                    toggleDropdown={toggleDropdown}
                    onRenameSuccess={() => fetchFilesAndFolders(currentFolderId)}
                    folderColor={folder.color} // Pass the current color
                    onColorChange={(colorClass) =>
                      handleColorChange(folder.id, colorClass)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Files Section */}
          <div className="mt-4 ml-2 mr-2 cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">Files</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {userFiles.map((file) => (
                <div
                  key={file.id}
                  className="relative bg-blue-50 hover:bg-blue-100 shadow-md rounded-md p-4 flex flex-col justify-between items-center"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="flex justify-between items-center w-full">
                    <div
                      className="flex items-center space-x-2"
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
                      onRenameSuccess={() => fetchFilesAndFolders(currentFolderId)}
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

export default Starred;
