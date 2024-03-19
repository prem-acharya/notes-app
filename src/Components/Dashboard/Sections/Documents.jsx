import React, { useEffect, useState } from "react";
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
import { storage, firestore } from "../../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../../../Components/Authentication/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";
import FileReader from "./FileReader"; // Import FileReader component

const Documents = () => {
  const { currentUser } = useAuth(); // Use useAuth to access currentUser
  const [userFiles, setUserFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // State to hold the selected file
  const [showFileReader, setShowFileReader] = useState(false); // State to control the visibility of the FileReader component

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileId = uuidv4();
    const storageRef = ref(
      storage,
      `files/${currentUser.uid}/${fileId}-${file.name}`
    );
    try {
      await uploadBytes(storageRef, file);
      const previewUrl = await getDownloadURL(storageRef);

      const fileMetadata = {
        name: file.name,
        size: file.size,
        uid: fileId,
        uploadDate: new Date().toISOString(),
        userId: currentUser.uid,
        previewUrl: previewUrl, // Include the preview URL in the file metadata
      };

      await addDoc(collection(firestore, "files"), fileMetadata);
      toast.success("File uploaded successfully! 📄");

      // Fetch files again to update the list in real time
      fetchFiles();
    } catch (error) {
      toast.error("File upload failed! ❌");
    }
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setShowFileReader(true);
  };

  const FilePreview = ({ file }) => {
    const [hasError, setHasError] = useState(false);

    const renderFileIcon = () => (
      <div className="flex justify-center items-center w-full h-32 bg-gray-200">
        <div className="opacity-50 text-blue-500 text-6xl">
          {getFileIcon(file.name)}
        </div>
      </div>
    );

    if (hasError || !file.previewUrl) {
      return renderFileIcon();
    }

    return (
      <img
        src={file.previewUrl}
        alt={`Preview of ${file.name}`}
        className="w-full h-32 object-cover"
        onError={() => setHasError(true)}
      />
    );
  };

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
      <div className={`relative ${showFileReader ? "blur-sm" : ""} `}>
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
                  <div className="w-full h-32 bg-gray-200 flex items-center justify-center overflow-hidden">
                    <FilePreview file={file} />
                  </div>
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
        {showFileReader && (
          <FileReader
            file={selectedFile}
            onClose={() => setShowFileReader(false)}
          />
        )}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Documents;
