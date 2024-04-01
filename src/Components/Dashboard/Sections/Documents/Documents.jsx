import React, { useEffect, useState, useRef } from "react";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
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
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../../../Authentication/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";
import FolderOptionsDropdown from "./FolderOptionsDropdown";
import FileOptionsDropdown from "./FileOptionsDropdown";
import LoadingBar from "react-top-loading-bar";

const Documents = ({ setSelectedFile }) => {
  const { currentUser } = useAuth(); // Use useAuth to access currentUser
  const [userFiles, setUserFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const uploadTaskRef = useRef(null); // Use useRef to persist the upload task reference
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolder, setIsCreateFolder] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState([
    { name: "My Notes", id: "root" },
  ]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [progress, setProgress] = useState(0);
  const [sortedFolders, setSortedFolders] = useState([]);
  const [sortedFiles, setSortedFiles] = useState([]);

  const toggleDropdown = (folderId) => {
    if (dropdownOpen === folderId) {
      setDropdownOpen(null);
    } else {
      setDropdownOpen(folderId);
    }
  };

  useEffect(() => {
    // Sort folders by name in ascending order
    const sortedFolders = [...folders].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    setSortedFolders(sortedFolders);

    // Sort files by name in ascending order
    const sortedFiles = [...userFiles].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    setSortedFiles(sortedFiles);
  }, [folders, userFiles]); // This will re-sort when folders or userFiles change

  const fetchFilesAndFolders = async () => {
    if (!currentUser) return;

    const q = query(
      collection(firestore, "files"),
      where("userId", "==", currentUser.uid),
      where("folderId", "==", currentFolderId || "root")
    );
    const querySnapshot = await getDocs(q);
    const files = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUserFiles(files);

    const foldersQuery = query(
      collection(firestore, "folders"),
      where("userId", "==", currentUser.uid),
      where("parentId", "==", currentFolderId || "root")
    );
    const foldersSnapshot = await getDocs(foldersQuery);
    const foldersData = foldersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setFolders(foldersData);
  };

  useEffect(() => {
    fetchFilesAndFolders();
  }, [currentUser, currentFolderId]);

  const handleFolderClick = async (folderId, folderName) => {
    setCurrentFolderId(folderId);
    // Add the new folder to the breadcrumb path
    setBreadcrumbPath((prevPath) => [
      ...prevPath,
      { name: folderName, id: folderId },
    ]);
    // Fetch the contents of the clicked folder
    await fetchFilesAndFolders();
  };

  const handleBreadcrumbClick = async (folderId, index) => {
    setCurrentFolderId(folderId);
    // Trim the breadcrumb path to the selected index
    setBreadcrumbPath((prevPath) => prevPath.slice(0, index + 1));
    // Fetch the contents of the clicked folder
    await fetchFilesAndFolders();
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    let isParentStarred = false;
    if (currentFolderId && currentFolderId !== "root") {
      const parentFolderRef = doc(firestore, "folders", currentFolderId);
      const parentFolderSnap = await getDoc(parentFolderRef);
      isParentStarred =
        parentFolderSnap.exists() && parentFolderSnap.data().isStarred;
    }

    const fileId = uuidv4();
    const filePath = currentFolderId
      ? `files/${currentUser.uid}/${currentFolderId}/${fileId}-${file.name}`
      : `files/${currentUser.uid}/${fileId}-${file.name}`;
    const storageRef = ref(storage, filePath);
    uploadTaskRef.current = uploadBytesResumable(storageRef, file);

    setIsUploading(true); // Start uploading
    setProgress(30);

    uploadTaskRef.current.on(
      "state_changed",
      (snapshot) => {
        // Get upload progress
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        // Handle unsuccessful uploads
        toast.error("File upload failed!");
        setIsUploading(false);
        setProgress(100);
      },
      () => {
        // Handle successful uploads on complete
        getDownloadURL(uploadTaskRef.current.snapshot.ref).then(
          (downloadURL) => {
            const fileMetadata = {
              name: file.name,
              size: file.size,
              uid: fileId,
              uploadDate: new Date().toISOString(),
              userId: currentUser.uid,
              previewUrl: downloadURL, // Include the preview URL in the file metadata
              folderId: currentFolderId || "root", // Include the current folder ID
              isStarred: isParentStarred, // Automatically star the file if the parent folder is starred
            };

            addDoc(collection(firestore, "files"), fileMetadata);
            toast.success("File uploaded successfully!");
            fetchFilesAndFolders(); // Fetch files and folders again to update the list in real time
            setIsUploading(false); // End uploading
            setProgress(100);
          }
        );
      }
    );
  };

  //   const FilePreview = ({ file }) => {
  //   const [hasError, setHasError] = useState(false);

  //   const renderFileIcon = () => (
  //     <div className="flex justify-center items-center w-full h-32 bg-gray-200">
  //       <div className="opacity-50 text-blue-500 text-6xl">
  //         {getFileIcon(file.name)}
  //       </div>
  //     </div>
  //   );

  //   if (hasError || !file.previewUrl) {
  //     return renderFileIcon();
  //   }

  //   return (
  //     <img
  //       src={file.previewUrl}
  //       alt={`Preview of ${file.name}`}
  //       className="w-full h-32 object-cover"
  //       onError={() => setHasError(true)}
  //     />
  //   );
  // };

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
      // console.log("Timestamp updated successfully");
    }).catch((error) => {
      // console.error("Error updating timestamp: ", error);
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

  const openCreateFolderModal = () => {
    setShowCreateFolderModal(true);
  };

  const createFolder = async () => {
    setIsCreateFolder(true);
    setProgress(30);
    if (!newFolderName.trim()) {
      toast.error("Folder name cannot be empty!");
      setIsCreateFolder(false);
      return;
    }

    let isParentStarred = false;
    if (currentFolderId && currentFolderId !== "root") {
      const parentFolderRef = doc(firestore, "folders", currentFolderId);
      const parentFolderSnap = await getDoc(parentFolderRef);
      isParentStarred =
        parentFolderSnap.exists() && parentFolderSnap.data().isStarred;
    }

    const folderId = uuidv4();
    const folderPath = currentFolderId
      ? `folders/${currentUser.uid}/${currentFolderId}/${folderId}`
      : `folders/${currentUser.uid}/${folderId}`;
    const folderRef = ref(storage, folderPath);
    const folderData = {
      name: newFolderName,
      userId: currentUser.uid,
      folderId: folderId,
      parentId: currentFolderId || "root",
      creationDate: new Date().toISOString(),
      isStarred: isParentStarred, // Automatically star the folder if the parent folder is starred
    };

    try {
      // Create a folder document in Firestore
      await addDoc(collection(firestore, "folders"), folderData);

      // Create a placeholder file in Google Storage to represent the folder
      await uploadBytesResumable(
        folderRef,
        new Blob(["This is a placeholder for the folder structure."], {
          type: "text/plain",
        })
      );

      toast.success("Folder created successfully!");
      fetchFilesAndFolders(); // Fetch files and folders again to update the list in real time
      setShowCreateFolderModal(false); // Close the modal
      setNewFolderName(""); // Reset the folder name
      setProgress(100);
    } catch (error) {
      toast.error("Failed to create folder!");
      console.error("Error creating folder: ", error);
      setProgress(100);
    } finally {
      setIsCreateFolder(false);
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

  document.title = "My Documents - Notes App";

  return (
    <>
      <LoadingBar color="#0066ff" progress={progress} height={4} />
      <div className="bg-white p-5 rounded-md absolute top-20 left-5 md:left-72 right-5 md:right-5">
        <div className={`relative`}>
          <div className="flex md:flex-row justify-between items-center mb-4">
            <h2 className="text-xl font-semibold mb-4 md:mb-0">My Documents</h2>
            <div className="flex space-x-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="flex items-center space-x-2 bg-blue-100 rounded-md p-2 hover:bg-blue-200 font-medium text-blue-600">
                  <span className="material-icons">
                    <UploadFileIcon className="text-xl" />
                  </span>
                  <span className="hidden md:inline-block">Upload</span>
                </div>
              </label>
              <button
                className="flex items-center bg-blue-100 rounded-md p-2 hover:bg-blue-200 space-x-2 font-medium text-blue-600"
                onClick={openCreateFolderModal}
              >
                <span className="material-icons">
                  <CreateNewFolderOutlinedIcon className="text-xl" />
                </span>
                <span className="hidden md:inline-block">Folder</span>
              </button>
            </div>
          </div>
          <Breadcrumb
            path={breadcrumbPath}
            onBreadcrumbClick={handleBreadcrumbClick}
          />
          <div className="px-2">
            <hr />
          </div>
          {/* Folders Section */}
          <div className="h-[68vh] overflow-y-scroll overflow-x-hidden">
            <div className="mt-4 ml-2 mr-2 cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Folders</h3>
              <div className="rounded-md">
                {sortedFolders.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedFolders.map((folder) => (
                      <div
                        key={folder.id}
                        className="relative bg-blue-50 hover:bg-blue-100 shadow-md rounded-md p-4 flex justify-between items-center"
                      >
                        <div
                          className="flex items-center"
                          onClick={() =>
                            handleFolderClick(folder.id, folder.name)
                          }
                        >
                          <FolderIcon
                            className={`${
                              folder.color || "text-blue-400"
                            } text-2xl mr-2`}
                          />
                          <span
                            className="text-sm font-medium"
                            title={folder.name}
                          >
                            {folder.name.slice(0, 15)}
                            {folder.name.length > 15 ? "..." : ""}
                          </span>
                        </div>
                        <MoreVertIcon
                          className="text-gray-600 hover:bg-gray-300 rounded-full"
                          onClick={() => toggleDropdown(folder.id)}
                        />
                        <FolderOptionsDropdown
                          folderId={folder.id}
                          isOpen={dropdownOpen === folder.id}
                          toggleDropdown={toggleDropdown}
                          onRenameSuccess={fetchFilesAndFolders}
                          folderColor={folder.color} // Pass the current color
                          onColorChange={(colorClass) =>
                            handleColorChange(folder.id, colorClass)
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ml-4 text-gray-500">
                    No folders in this folder.
                  </div>
                )}
              </div>
            </div>
            {/* Files Section */}
            <div className="mt-4 ml-2 mr-2 cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Files</h3>
              <div
                className={`rounded-md ${
                  sortedFiles.length > 0 ? "" : "flex"
                }`}
              >
                {sortedFiles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="relative bg-blue-50 hover:bg-blue-100 shadow-md rounded-md p-4 flex flex-col justify-between items-center"
                      >
                        {/* <div className="w-full h-32 bg-gray-200 flex items-center justify-center overflow-hidden mb-2">
                    <FilePreview file={file} />
                  </div> */}
                        <div className="flex justify-between items-center w-full">
                          <div
                            className="flex items-center space-x-2"
                            onClick={() => handleFileClick(file)}
                          >
                            <div className="text-blue-400">
                              {getFileIcon(
                                file.name,
                                file.color || "text-blue-400"
                              )}
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
                            onClick={() => toggleDropdown(file.id)}
                          />
                          <FileOptionsDropdown
                            file={file}
                            isOpen={dropdownOpen === file.id}
                            toggleDropdown={() => toggleDropdown(file.id)}
                            collectionName="files"
                            onRenameSuccess={fetchFilesAndFolders}
                            onDeleteSuccess={fetchFilesAndFolders}
                            fileColor={file.color}
                            onColorChange={(colorClass) =>
                              handleColorChange(file.id, colorClass)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-14 ml-4 text-gray-500">No files in this folder.</div>
                )}
              </div>
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

export default Documents;
