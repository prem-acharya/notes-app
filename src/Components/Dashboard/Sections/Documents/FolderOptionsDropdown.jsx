import React, { useEffect, useRef, useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../../../firebase";
import { useAuth } from "../../../Authentication/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FolderOptionsDropdown = ({
  folderId,
  isOpen,
  toggleDropdown,
  onRenameSuccess,
}) => {
  const dropdownRef = useRef(null);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [isRenameFolder, setIsRenameFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const { currentUser } = useAuth();

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

  const handleRenameFolder = async () => {
    setIsRenameFolder(true);
    if (!currentUser) {
      //   console.error("No user logged in");
      return;
    }

    const folderDocRef = doc(firestore, "folders", folderId);

    try {
      await updateDoc(folderDocRef, {
        name: newFolderName,
        userId: currentUser.uid, // Ensure to update only if the current user owns the folder
      });
      //   console.log("Folder renamed successfully");
      toast.success("Folder renamed successfully! 🥳");
      setShowRenameDialog(false);
      if (onRenameSuccess) {
        onRenameSuccess(); // Call the callback function to refresh the folders list
      }
    } finally {
      setIsRenameFolder(false);
    }
  };

  return (
    <>
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
            <ColorLensIcon className="mr-3" /> Folder Colors
          </div>
          <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
            <StarBorderIcon className="mr-3" /> Add to starred
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
                Rename folder
              </h3>
              <div className="mt-2 px-7 py-3">
                <input
                  type="text"
                  className="border rounded-md py-2 px-3 text-grey-darkest w-full"
                  placeholder="New folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
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
                  onClick={handleRenameFolder}
                  disabled={isRenameFolder}
                >
                  {isRenameFolder ? "Renaming..." : "Rename"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FolderOptionsDropdown;
