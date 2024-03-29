import React, { useEffect, useRef, useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import StarIcon from "@mui/icons-material/Star"; // Added for "Add to starred" functionality
import { doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "../../../../firebase";
import { useAuth } from "../../../Authentication/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingBar from "react-top-loading-bar";
import { getDownloadURL } from "firebase/storage";

const FileOptionsDropdown = ({
  file,
  isOpen,
  toggleDropdown,
  onRenameSuccess,
  onDeleteSuccess,
  fileColor,
  onColorChange,
}) => {
  const dropdownRef = useRef(null);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [isRenameFile, setIsRenameFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showFileDeleteConfirmDialog, setShowFileDeleteConfirmDialog] = useState(false);
  const [isFileStarred, setIsFileStarred] = useState(false); // Added for "Add to starred" functionality
  const [showFileDetailsDialog, setShowFileDetailsDialog] = useState(false); // State to control file details dialog visibility

  const FilecolorOptions = [
    { name: "Blue", class: "text-blue-400" },
    { name: "Red", class: "text-red-500" },
    { name: "Green", class: "text-green-500" },
    { name: "Pink", class: "text-pink-400" },
    { name: "Yellow", class: "text-yellow-400" },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        toggleDropdown(null);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, toggleDropdown]);

  useEffect(() => {
    const fetchStarStatus = async () => {
      const fileDocRef = doc(firestore, "files", file.id);
      const fileDoc = await getDoc(fileDocRef);
      if (fileDoc.exists()) {
        setIsFileStarred(fileDoc.data().isStarred || false);
      }
    };

    fetchStarStatus();
  }, [file.id]);

  const handleRenameClick = () => {
    setShowRenameDialog(true);
    setProgress(30);
  };

  const handleRenameFile = async () => {
    setIsRenameFile(true);
    setProgress(30); // Start the loading process
    if (!currentUser) {
      toast.error("You must be logged in to rename files.");
      setProgress(100); // Complete the loading process if there's an error
      return;
    }

    // Split the original file name to separate the name from the extension
    const originalNameParts = file.name.split(".");
    const originalExtension = originalNameParts.pop(); // Remove the last element (the extension)
    const originalNameWithoutExtension = originalNameParts.join("."); // Re-join the remaining parts

    // If the new file name is empty or the same as the original (without the extension), do not proceed
    if (!newFileName || newFileName === originalNameWithoutExtension) {
      toast.error("Please enter a new name for the file.");
      setIsRenameFile(false);
      setProgress(100);
      return;
    }

    // Construct the final new file name
    const finalNewFileName = `${newFileName}.${originalExtension}`;

    const fileDocRef = doc(firestore, "files", file.id);

    try {
      await updateDoc(fileDocRef, {
        name: finalNewFileName,
        userId: currentUser.uid,
      });
      toast.success("File Renamed successfully!");
      setShowRenameDialog(false);
      setProgress(100); // Complete the loading process
      if (onRenameSuccess) {
        onRenameSuccess(finalNewFileName); // Pass the new file name to the callback
      }
    } catch (error) {
      toast.error("Failed to rename file!");
      console.error("Error renaming file: ", error);
      setProgress(100);
    } finally {
      setIsRenameFile(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    // Example Firestore path to the document containing the file URL
    const docRef = doc(firestore, "files", file.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const fileUrl = docSnap.data().url; // Assuming the URL is stored in the 'url' field

      // Create a temporary anchor tag to trigger the download
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = file.name; // Set the file name for download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadProgress(100);
      setIsDownloading(false);
    } else {
      toast.error("No such document!");
      setIsDownloading(false);
    }
  };

  const promptDeleteFile = () => {
    setProgress(30);
    setShowFileDeleteConfirmDialog(true);
  };

  const handleDeleteFile = async () => {
    setProgress(30);
    setShowFileDeleteConfirmDialog(false); // Close the confirmation dialog
    const fileDocRef = doc(firestore, "files", file.id); // Corrected to use file.id
    try {
      await deleteDoc(fileDocRef);
      toast.success("File deleted successfully!");
      setProgress(100);
      if (onDeleteSuccess) {
        onDeleteSuccess(); // Refresh files list
      }
    } catch (error) {
      console.error("Error deleting file: ", error);
      toast.error("Failed to delete file.");
      setProgress(100);
    }
  };

  const handleColorSelect = async (color) => {
    const fileDocRef = doc(firestore, "files", file.id);
    setProgress(30);
    try {
      await updateDoc(fileDocRef, { color: color.class });
      // toast.success(`File color changed to ${color.name}!`);
      if (onColorChange) {
        onColorChange(color.class); // Assuming onColorChange updates the UI
        setProgress(100);
      }
    } catch (error) {
      // toast.error("Failed to change file color.");
      // console.error("Error changing file color: ", error);
      setProgress(100);
    }
  };

  const handleToggleStar = async () => {
    const fileDocRef = doc(firestore, "files", file.id);
    const newStarredStatus = !isFileStarred;
    await updateDoc(fileDocRef, { isStarred: newStarredStatus });
    setIsFileStarred(newStarredStatus);
    toast.success(`File ${newStarredStatus ? "starred" : "unstarred"} successfully!`);
  };

  const handleFileDetails = async () => {
    setShowFileDetailsDialog(true); // Show the file details dialog
  };

  // Helper function to format file size
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Helper function to get file extension
  const getFileExtension = (filename) => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  };

  return (
    <>
      <LoadingBar color="#0066ff" progress={progress} height={4} />
      {isDownloading && (
        <div className="fixed bottom-5 z-50 right-5 bg-blue-100 p-6 shadow-lg rounded-md">
          <div className="flex items-center text-xl justify-between">
            <span className="ml-4">Downloading...</span>
            <span className="mr-4">{Math.round(downloadProgress)}%</span>
          </div>
          <div className="w-full mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${downloadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      <div
        ref={dropdownRef}
        className={`absolute z-30 right-0 top-10 mb-2 w-48 bg-white rounded-md shadow-lg ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div className="text-gray-700">
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={handleDownload}
          >
            <DownloadIcon className="mr-3" /> Download
          </div>
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={handleRenameClick}
          >
            <DriveFileRenameOutlineIcon className="mr-3" /> Rename
          </div>
          <div className="group px-4 py-2 hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center">
              <ColorLensIcon className="mr-3" />
              <span className="mr-2">File Colors</span>
            </div>
            <div className="hidden group-hover:flex flex-wrap mt-2">
              {FilecolorOptions.map((color) => (
                <button
                  key={color.name}
                  className={`h-6 w-6 rounded-full m-1 focus:outline-none ${color.class.replace(
                    "text",
                    "bg"
                  )} ${
                    fileColor === color.class ? " border-4 border-black" : ""
                  }`} // Add border if selected
                  onClick={() => handleColorSelect(color)}
                  title={`Change folder color to ${color.name}`}
                  style={{ backgroundColor: color.name }}
                />
              ))}
            </div>
          </div>
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={handleToggleStar}
          >
            {isFileStarred ? <StarIcon className="mr-3" /> : <StarBorderIcon className="mr-3" />}
            {isFileStarred ? "Unstar" : "Add to starred"}
          </div>
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={handleFileDetails}
          >
            <InfoOutlinedIcon className="mr-3" /> File Details
          </div>
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={promptDeleteFile}
          >
            <DeleteForeverIcon className="mr-3" /> Delete
          </div>
        </div>
      </div>
      {showRenameDialog && (
        <div
          className="fixed inset-0 z-50 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          id="my-modal"
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-700">
                Rename file
              </h3>
              <div className="mt-2 px-7 py-3">
                <input
                  type="text"
                  className="border rounded-md py-2 px-3 text-grey-darkest w-full"
                  placeholder="New file name"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                />
              </div>
              <div className="items-center px-4 py-3">
                <button
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md mr-2"
                  onClick={() => setShowRenameDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-md"
                  onClick={handleRenameFile}
                  disabled={isRenameFile}
                >
                  {isRenameFile ? "Renaming..." : "Rename"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showFileDeleteConfirmDialog && (
        <div
          className="fixed inset-0 z-50 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          id="delete-confirm-modal"
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-700">
                Confirm Delete
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this file?
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md mr-2"
                  onClick={() => setShowFileDeleteConfirmDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 hover:bg-red-500 text-white rounded-md"
                  onClick={handleDeleteFile}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showFileDetailsDialog && (
        <div
          className="fixed inset-0 z-50 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          id="file-details-modal"
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 text-center font-medium text-gray-700">
                File Details
              </h3>
              <div className="mt-2 ml-4 px-3 py-2">
                <p className="text-sm text-gray-500">
                  <strong className="hover:text-blue-500">Name:</strong> {file.name}
                </p>
                <p className="text-sm text-gray-500">
                  <strong className="hover:text-blue-500">Type:</strong> {getFileExtension(file.name)}
                </p>
                <p className="text-sm text-gray-500">
                  <strong className="hover:text-blue-500">Upload Time:</strong> {new Date(file.uploadDate).toLocaleString()}
                </p>
                {/* <p className="text-sm text-gray-500">
                  <strong className="hover:text-blue-500">Last Opened:</strong> {new Date(file.lastOpened).toLocaleString()}
                </p>
                { not update in real time} */}
                <p className="text-sm text-gray-500">
                  <strong className="hover:text-blue-500">Size:</strong> {formatBytes(file.size)}
                </p>
              </div>
              <div className="items-center text-center px-4 py-3">
                <button
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md"
                  onClick={() => setShowFileDetailsDialog(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileOptionsDropdown;
