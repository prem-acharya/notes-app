import React, { useEffect, useRef, useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../../../firebase";
import { useAuth } from "../../../Authentication/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingBar from "react-top-loading-bar";

const FileOptionsDropdown = ({
  file,
  isOpen,
  toggleDropdown,
  onRenameSuccess,
}) => {
  const dropdownRef = useRef(null);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [isRenameFile, setIsRenameFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState(0);

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

  const handleRenameClick = () => {
    setShowRenameDialog(true);
  };

  const handleRenameFile = async () => {
    setIsRenameFile(true);
    setProgress(30); // Start the loading process
    if (!currentUser) {
      // console.error("No user logged in");
      setProgress(100); // Complete the loading process if there's an error
      return;
    }

    const fileDocRef = doc(firestore, "files", file.id); // Change from folderId to file.id

    try {
      await updateDoc(fileDocRef, {
        name: newFileName || file.name, // Use newFileName or keep the old name if not provided
        userId: currentUser.uid, // Ensure to update only if the current user owns the folder
      });
      // console.log("Folder renamed successfully");
      toast.success("File renamed successfully!");
      setShowRenameDialog(false);
      setProgress(100); // Complete the loading process
      if (onRenameSuccess) {
        onRenameSuccess(); // Call the callback function to refresh the folders list
      }
    } catch (error) {
      toast.error("Failed to rename file!");
      console.error("Error renaming file: ", error);
      setProgress(100);
    } finally {
      setIsRenameFile(false);
    }
  };

  return (
    <>
      <LoadingBar color="#0066ff" progress={progress} height={4} />
      <div
        ref={dropdownRef}
        className={`absolute z-30 right-0 top-10 mb-2 w-48 bg-white rounded-md shadow-lg ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div className="text-gray-700">
          <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
            <DownloadIcon className="mr-3" /> Download
          </div>
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={handleRenameClick}
          >
            <DriveFileRenameOutlineIcon className="mr-3" /> Rename
          </div>
          <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
            <ColorLensIcon className="mr-3" /> File Colors
          </div>
          <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
            <StarBorderIcon className="mr-3" /> Add to starred
          </div>
          <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
            <InfoOutlinedIcon className="mr-3" /> File Details
          </div>
          <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
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
    </>
  );
};

export default FileOptionsDropdown;
