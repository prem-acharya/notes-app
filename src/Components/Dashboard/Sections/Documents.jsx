import React, { useEffect, useState } from "react";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { storage, firestore } from '../../../firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../../Components/Authentication/AuthContext';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from 'uuid';

const Documents = () => {
  const { currentUser } = useAuth(); // Use useAuth to access currentUser
  const [userFiles, setUserFiles] = useState([]);

  const fetchFiles = async () => {
    if (!currentUser) return;
    const q = query(collection(firestore, "files"), where("userId", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);
    const files = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUserFiles(files);
  };

  useEffect(() => {
    fetchFiles();
  }, [currentUser]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileId = uuidv4();
    const storageRef = ref(storage, `files/${currentUser.uid}/${fileId}-${file.name}`);
    try {
      await uploadBytes(storageRef, file);

      const fileMetadata = {
        name: file.name,
        size: file.size,
        uid: fileId,
        uploadDate: new Date().toISOString(),
        userId: currentUser.uid,
      };

      await addDoc(collection(firestore, "files"), fileMetadata);
      toast.success("File uploaded successfully! 📄");

      // Fetch files again to update the list in real time
      fetchFiles();
    } catch (error) {
      toast.error("File upload failed! ❌");
    }
  };

  return (
    <div className="bg-white p-5 rounded-md absolute top-20 left-5 md:left-72 right-5 md:right-5">
      <div className="flex md:flex-row justify-between items-center mb-4">
        <h2 className="text-xl font-semibold mb-4 md:mb-0">My Documents</h2>
        <div className="flex space-x-4">
          <label className="cursor-pointer">
            <input type="file" className="hidden" onChange={handleFileUpload} />
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
        <div className="mt-6 cursor-pointer">
          <h3 className="text-lg font-semibold mb-2">Files</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {userFiles.map(file => (
              <div key={file.id} className="bg-gray-100 hover:bg-gray-200 rounded-md p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <InsertDriveFileIcon className="text-blue-400 text-2xl mr-2" />
                  <span className="text-sm font-medium" title={file.name}>{file.name.slice(0, 12)}{file.name.length > 12 ? '...' : ''}</span>
                </div>
                <MoreVertIcon className="text-gray-600 hover:bg-gray-300 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Documents;