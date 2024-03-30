import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Authentication/AuthContext";
import { storage, database as db } from "../../../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Upload = ({ imageDataUrl, onUploadSuccess, onUploadError }) => {
  const [fileName, setFileName] = useState("");
  const [fileNameError, setFileNameError] = useState("");
  // const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isUpload, setIsUpload] = useState(false);

  const validateFileName = () => {
    if (!fileName.trim()) {
      setFileNameError("File name cannot be empty");
      return false;
    }
    setFileNameError("");
    return true;
  };

  const uploadImage = async () => {
    setIsUpload(true);
    if (!currentUser) {
      toast.error("You must be logged in to upload an image.");
      setIsUpload(false);
      return;
    }

    if (!validateFileName()) {
      return;
    }

    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      // Organize images by user's UID in Google Storage
      const uploadFileName = `scan-documents/${currentUser.uid}/${fileName || new Date().toISOString()}.png`;
      const imageRef = ref(storage, uploadFileName);

      const snapshot = await uploadBytes(imageRef, blob);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // Include the current user's UID when storing the image info in Firestore
      await addDoc(collection(db, "scan-documents"), {
        url: downloadUrl,
        createdAt: new Date(),
        name: fileName,
        userId: currentUser.uid, // Store the user's UID with the image info
      });

      onUploadSuccess(downloadUrl);
      setIsUpload(true);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      onUploadError(error);

      toast.error("Error uploading image!");
    }finally{
      setIsUpload(false);
    }
  };

  // const goToDashboard = () => {
  //   navigate("/scandocuments");
  // };

  return (
    <div className="flex flex-col items-center">
      <input
        type="text"
        placeholder="Enter file name"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        className={`border border-gray-300 rounded-md px-3 py-2 mt-4 focus:outline-none focus:ring focus:ring-blue-400 ${
          fileNameError ? "border-red-500" : ""
        }`}
        required
      />
      {fileNameError && (
        <p className="text-red-500 text-sm mt-1">{fileNameError}</p>
      )}

      <button
        onClick={uploadImage}
        disabled={isUpload}
        className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md mt-4 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
      >
        {isUpload ? "Uploading..." : "Upload"}
      </button>

      {/* <button
        onClick={goToDashboard}
        className="bg-gray-400 text-white font-semibold px-4 py-2 rounded-md mt-4 hover:bg-gray-600 focus:outline-none focus:ring focus:ring-green-400"
      >
        Scan Documents
      </button> */}
    </div>
  );
};

export default Upload;
