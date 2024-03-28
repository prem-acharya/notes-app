import React, { useEffect, useRef, useState } from "react";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { firestore } from "../../../../firebase";
import { useAuth } from "../../../Authentication/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingBar from "react-top-loading-bar";

const FolderOptionsDropdown = ({
  folderId,
  isOpen,
  toggleDropdown,
  onRenameSuccess,
  folderColor,
  // isCurrentlyStarred,
}) => {
  const dropdownRef = useRef(null);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [isRenameFolder, setIsRenameFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState(0);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showColorSubsection, setShowColorSubsection] = useState(false);
  const [isCurrentlyStarred, setIsCurrentlyStarred] = useState(false);

  useEffect(() => {
    const fetchStarStatus = async () => {
      const folderDocRef = doc(firestore, "folders", folderId);
      const folderDoc = await getDoc(folderDocRef);
      if (folderDoc.exists()) {
        setIsCurrentlyStarred(folderDoc.data().isStarred || false);
      }
    };

    fetchStarStatus();
  }, [folderId]);

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
    setProgress(30);
  };

  const handleRenameFolder = async () => {
    setIsRenameFolder(true);
    setProgress(30); // Start the loading process
    if (!currentUser) {
      setProgress(100); // Complete the loading process if there's an error
      return;
    }

    const folderDocRef = doc(firestore, "folders", folderId);

    try {
      await updateDoc(folderDocRef, {
        name: newFolderName,
        userId: currentUser.uid, // Ensure to update only if the current user owns the folder
      });
      toast.success("Folder Renamed successfully!");
      setShowRenameDialog(false);
      setProgress(100); // Complete the loading process
      if (onRenameSuccess) {
        onRenameSuccess(); // Call the callback function to refresh the folders list
      }
    } finally {
      setIsRenameFolder(false);
      setProgress(100);
    }
  };

  const promptDeleteFolder = () => {
    setProgress(30);
    setShowDeleteConfirmDialog(true);
  };

  const handleDeleteFolder = async () => {
    setProgress(30);
    setShowDeleteConfirmDialog(false); // Close the confirmation dialog
    if (!folderId) return; // Guard clause if folderId is not provided
    const folderDocRef = doc(firestore, "folders", folderId);
    try {
      await deleteDoc(folderDocRef);
      toast.success("Folder deleted successfully!");
      if (onRenameSuccess) {
        setProgress(100);
        onRenameSuccess();
      }
    } catch (error) {
      console.error("Error deleting folder: ", error);
      toast.error("Failed to delete folder.");
      setProgress(100);
    }
  };

  const colorOptions = [
    { name: "Blue", class: "text-blue-400" },
    { name: "Red", class: "text-red-500" },
    { name: "Green", class: "text-green-500" },
    { name: "Pink", class: "text-pink-400" },
    { name: "Yellow", class: "text-yellow-400" },
  ];

  const handleColorSelect = async (colorClass) => {
    const textColorClass = colorClass.replace("bg", "text");
    const folderDocRef = doc(firestore, "folders", folderId);
    setProgress(30);
    try {
      await updateDoc(folderDocRef, {
        color: textColorClass,
      });
      // toast.success("Folder color updateded!");
      if (onRenameSuccess) {
        onRenameSuccess(); // Call the callback function to refresh the folder's color
        setProgress(100);
      }
    } catch (error) {
      // console.error("Error updating folder color: ", error);
      // toast.error("Failed to update folder color.");
      setProgress(100);
    }
  };

  const handleToggleStar = async () => {
    const newStarredStatus = !isCurrentlyStarred;
    setIsCurrentlyStarred(newStarredStatus);
  
    const updateStarStatus = async (id, isFolder = true) => {
      const ref = doc(firestore, isFolder ? "folders" : "files", id);
      await updateDoc(ref, { isStarred: newStarredStatus });
    };
  
    const fetchAndUpdateSubItems = async (parentId) => {
      const subFoldersQuery = query(collection(firestore, "folders"), where("parentId", "==", parentId));
      const subFoldersSnapshot = await getDocs(subFoldersQuery);
      for (const doc of subFoldersSnapshot.docs) {
        await updateStarStatus(doc.id);
        await fetchAndUpdateSubItems(doc.id); // Recursively update subfolders
      }
  
      const filesQuery = query(collection(firestore, "files"), where("folderId", "==", parentId));
      const filesSnapshot = await getDocs(filesQuery);
      for (const doc of filesSnapshot.docs) {
        await updateStarStatus(doc.id, false); // Update files
      }
    };
  
    await updateStarStatus(folderId); // Update the main folder
    await fetchAndUpdateSubItems(folderId); // Update subfolders and files recursively
    toast.success(`Folder ${newStarredStatus ? "starred" : "unstarred"} successfully!`);
    if (onRenameSuccess) {
      onRenameSuccess(); // Refresh the list
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
          {/* <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
            <DownloadIcon className="mr-3" /> Download
          </div> */}
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={handleRenameClick}
          >
            <DriveFileRenameOutlineIcon className="mr-3" /> Rename
          </div>
          <div className="group px-4 py-2 hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center">
              <ColorLensIcon className="mr-3" />
              <span className="mr-2">Folder Colors</span>
            </div>
            <div className="hidden group-hover:flex flex-wrap mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  className={`h-6 w-6 rounded-full m-1 focus:outline-none ${color.class.replace(
                    "text",
                    "bg"
                  )} ${
                    folderColor === color.class ? " border-4 border-black" : ""
                  }`} // Add border if selected
                  onClick={() => handleColorSelect(color.class)}
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
            {isCurrentlyStarred ? (
              <StarIcon className="mr-3" />
            ) : (
              <StarBorderIcon className="mr-3" />
            )}
            {isCurrentlyStarred ? "Unstar" : "Add to starred"}
          </div>
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={promptDeleteFolder}
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
      {showDeleteConfirmDialog && (
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
                  Are you sure you want to delete this folder?
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md mr-2"
                  onClick={() => setShowDeleteConfirmDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 hover:bg-red-500 text-white rounded-md"
                  onClick={handleDeleteFolder}
                >
                  Delete
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


