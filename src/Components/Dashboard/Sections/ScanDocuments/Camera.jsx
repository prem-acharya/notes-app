import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../Authentication/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingBar from "react-top-loading-bar";
import CropImage from "./CropImage";
import ScannerGIF from "../../../../assets/Scanner.gif";
import { useMediaQuery } from 'react-responsive';

const Camera = () => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState(0);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [stream, setStream] = useState(null);
  const [showCamera, setShowCamera] = useState(true);
  const videoRef = useRef(null);
  const [showOpenCameraButton, setShowOpenCameraButton] = useState(true);

  const isMobile = useMediaQuery({ query: "(max-width: 525px)" });

  useEffect(() => {
    document.title = "Camera - Notes App";

    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }

    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    if (!currentUser) {
      toast.error("Please log in to access the camera.");
      return;
    }
    setProgress(30); // Starting the camera, set progress
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      setShowCamera(true);
      setShowOpenCameraButton(false);
      setProgress(100); // Successfully accessed the camera, complete the progress
    } catch (error) {
      toast.error("Error accessing the camera");
      setProgress(100); // Even on error, complete the progress to reset the bar
    }
  };

  const captureImage = () => {
    if (!currentUser) {
      toast.error("Please log in to capture images.");
      return;
    }
    setProgress(50); // Starting the capture process, set progress
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setImageDataUrl(dataUrl);
    setShowCamera(false);

    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());

    toast.success("Image captured!");
    setProgress(100); // Successfully captured the image, complete the progress
  };

  return (
    <>
      <LoadingBar color="#0066ff" progress={progress} height={4} />
      <div className="bg-white p-5 rounded-md absolute top-20 left-5 md:left-72 right-5 md:right-5">
        <div className={`relative`}>
          <div className="flex md:flex-row justify-between items-center mb-4">
            <h2 className="text-xl font-semibold mb-4 md:mb-0">Camera</h2>
          </div>
          <div className="px-2">
            <hr />
            <div className="flex flex-col items-center">
              {showOpenCameraButton && (
              <>
              <div>
                <img src={ScannerGIF} className="" alt="Scanner GIF" />
              </div>
                <button
                  onClick={startCamera}
                  className="bg-blue-500 text-white font-semibold m-4 px-4 py-2 rounded-md mt-4 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
                >
                  Open Camera
                </button>
              </>
              )}
              {showCamera && stream && (
                <div className="mt-4">
                  <video
                    autoPlay={true}
                    ref={videoRef}
                    className="rounded-lg shadow-lg"
                    style={{
                      Width: isMobile ? 'auto' : '320',
                      Height: isMobile ? 'auto' : '540',
                    }}
                  />
                  <button
                    className="absolute mt-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white font-semibold px-4 py-2 rounded-md z-10 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
                    onClick={captureImage}
                  >
                    Capture Image
                  </button>
                </div>
              )}
              {imageDataUrl && <CropImage imageDataUrl={imageDataUrl} toast={toast} />}
              <ToastContainer />
            </div>
            {/* Camera Component Implementation Ends Here */}
          </div>
          <ToastContainer />
        </div>
      </div>
    </>
  );
};

export default Camera;