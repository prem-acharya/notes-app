import React, { useState } from "react";
import { useAuth } from "../../../Authentication/AuthContext";
import { storage, database as db } from "../../../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Upload = ({ imageDataUrl, onUploadSuccess, onUploadError }) => {
  const [fileName, setFileName] = useState("");
  const [fileNameError, setFileNameError] = useState("");
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
    if (!currentUser) {
      toast.error("You must be logged in to upload an image.");
      return;
    }

    if (!validateFileName()) {
      return;
    }

    setIsUpload(true);

    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const fileSize = blob.size; // Get the file size from the blob
      const timestamp = new Date().toISOString();
      const uploadFileName = `${fileName}` + (fileName.endsWith('.png') ? '' : '.png');
      const imageRef = ref(storage, `scan-documents/${currentUser.uid}/${uploadFileName}`);

      const snapshot = await uploadBytes(imageRef, blob);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "scan-documents"), {
        url: downloadUrl,
        previewUrl: downloadUrl,
        uploadDate: new Date(),
        name: uploadFileName, // Use the uploadFileName with .png extension
        userId: currentUser.uid,
        size: fileSize, // Add the file size
        isStarred: false, // Initialize isStarred as false
      });

      onUploadSuccess(downloadUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      onUploadError(error);
      toast.error("Error uploading image: " + error.message);
    } finally {
      setIsUpload(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="text"
        placeholder="Enter file name"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        className={`border border-gray-300 rounded-md px-3 py-2 mt-4 focus:outline-none focus:ring focus:ring-blue-400 ${fileNameError ? "border-red-500" : ""}`}
        required
      />
      {fileNameError && <p className="text-red-500 text-sm mt-1">{fileNameError}</p>}
      <button
        onClick={uploadImage}
        disabled={isUpload}
        className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md mt-4 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
      >
        {isUpload ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default Upload;
