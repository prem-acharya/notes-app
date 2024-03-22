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
import { storage, firestore } from "../../../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../../../Components/Authentication/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";

const Documents = ({ setSelectedFile }) => {
  const { currentUser } = useAuth(); // Use useAuth to access currentUser
  const [userFiles, setUserFiles] = useState([]);
  const uploadTaskRef = useRef(null); // Use useRef to persist the upload task reference
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const fetchFiles = async () => {
    if (!currentUser) return;
    const q = query(
      collection(firestore, "files"),
      where("userId", "==", currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    const files = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUserFiles(files);
  };

  useEffect(() => {
    fetchFiles();
  }, [currentUser]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileId = uuidv4();
    const storageRef = ref(storage, `files/${currentUser.uid}/${fileId}-${file.name}`);
    uploadTaskRef.current = uploadBytesResumable(storageRef, file);

    setIsUploading(true); // Start uploading

    uploadTaskRef.current.on(
      "state_changed",
      (snapshot) => {
        // Get upload progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        // Handle unsuccessful uploads
        toast.error("File upload failed! ❌");
        setIsUploading(false);
      },
      () => {
        // Handle successful uploads on complete
        getDownloadURL(uploadTaskRef.current.snapshot.ref).then((downloadURL) => {
          const fileMetadata = {
            name: file.name,
            size: file.size,
            uid: fileId,
            uploadDate: new Date().toISOString(),
            userId: currentUser.uid,
            previewUrl: downloadURL, // Include the preview URL in the file metadata
          };

          addDoc(collection(firestore, "files"), fileMetadata);
          toast.success("File uploaded successfully! 📄");
          fetchFiles(); // Fetch files again to update the list in real time
          setIsUploading(false); // End uploading
        });
      }
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

  // const FilePreview = ({ file }) => {
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

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();

    switch (extension) {
      case "pdf":
        return <PictureAsPdfIcon />;
      case "png":
      case "jpg":
      case "jpeg":
        return <ImageIcon />;
      case "mp4":
        return <MovieIcon />;
      case "mp3":
        return <MusicVideoIcon />;
      case "docx":
        return <DescriptionIcon />;
      case "pptx":
        return <SlideshowIcon />;
      case "xlsx":
        return <TableChartIcon />;
      case "gif":
        return <GifBoxIcon />;
      case "zip":
        return <FolderZipIcon />;
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
        return <TerminalIcon />;
      default:
        return <InsertDriveFileIcon />;
    }
  };

  return (
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
            <button className="flex items-center bg-blue-100 rounded-md p-2 hover:bg-blue-200 space-x-2 font-medium text-blue-600">
              <span className="material-icons">
                <CreateNewFolderOutlinedIcon className="text-xl" />
              </span>
              <span className="hidden md:inline-block">Folder</span>
            </button>
          </div>
        </div>
        <div className=" font-semibold text-blue-500">Home / ICT / Sem-8</div>
        <hr />
        {/* Folders Section */}
        <div className="h-[68vh] overflow-y-scroll overflow-x-hidden ">
          <div className="mt-4 cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">Folders</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Repeat this block for each folder */}
              <div className="bg-gray-100 hover:bg-gray-200 rounded-md p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <FolderIcon className="text-blue-400 text-2xl mr-2" />
                  <span className="text-sm font-medium">Folder Name</span>
                </div>
                <MoreVertIcon className="text-gray-600 hover:bg-gray-300 rounded-full" />
              </div>
            </div>
          </div>
          {/* Files Section */}
          <div className="mt-6 ml-2 mr-2 cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">Files</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {userFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-blue-50 hover:bg-blue-100 shadow-md hover:scale-105 transition-transform transform rounded-md p-4 flex flex-col justify-between items-center"
                  onClick={() => handleFileClick(file)}
                >
                  {/* <div className="w-full h-32 bg-gray-200 flex items-center justify-center overflow-hidden">
                    <FilePreview file={file} />
                  </div> */}
                  <div className="flex justify-between items-center w-full mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="text-blue-400">
                        {getFileIcon(file.name)}
                      </div>
                      <span
                        className="text-sm font-medium truncate"
                        title={file.name}
                      >
                        {file.name.slice(0, 15)}
                        {file.name.length > 15 ? "..." : ""}
                      </span>
                    </div>
                    <MoreVertIcon className="text-gray-600 hover:bg-gray-300 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
      {isUploading && (
        <div className="fixed bottom-5 right-5 bg-blue-100 p-8 shadow-lg rounded-md">
          <div className="flex items-center text-xl justify-between">
            <span className="ml-4">Uploading...</span>
            <span className="mr-4">{Math.round(uploadProgress)}%</span>
            <button onClick={() => setShowCancelDialog(true)} title="Cancel upload">
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
        <div className="fixed inset-0 bg-gray-50 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4">Cancel Upload?</h3>
            <p>Your upload is not complete. Would you like to cancel the upload?</p>
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
  );
};

export default Documents;
