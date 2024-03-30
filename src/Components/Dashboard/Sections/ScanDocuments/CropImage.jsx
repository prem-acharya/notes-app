import React, { useState, useRef, useCallback } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import Upload from "./Upload";
// import { useNavigate } from "react-router-dom";

function CropImage({ imageDataUrl }) {
  const [crop, setCrop] = useState({ aspect: 4 / 3 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [filteredImageUrl, setFilteredImageUrl] = useState(null);
  const imgRef = useRef(null);
//   const navigate = useNavigate();

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  const applyFilter = (filter) => {
    if (imgRef.current) {
      imgRef.current.style.filter = filter;
    }
  };

  const resetFilter = () => {
    if (imgRef.current) {
      imgRef.current.style.filter = "none";
    }
  };

  const getCroppedImg = async (image, crop) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    if (imgRef.current.style.filter !== "none") {
      ctx.filter = imgRef.current.style.filter;
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(URL.createObjectURL(blob));
      }, "image/jpeg");
    });
  };

  const handleDone = async () => {
    if (imgRef.current && completedCrop?.width && completedCrop?.height) {
      try {
        const croppedImage = await getCroppedImg(imgRef.current, completedCrop);

        setCroppedImageUrl(croppedImage);

        setFilteredImageUrl(croppedImage);

        toast.success("Image cropped successfully! 🎉");
      } catch (error) {
        toast.error("Error cropping image! 😵");
        // console.error("Error cropping image:", error);
      }
    }
  };

  const handleFilterChange = (filter) => {
    resetFilter();
    applyFilter(filter);

    setFilteredImageUrl(null);
  };

  return (
    <div className="flex flex-col items-center">
      {!croppedImageUrl ? (
        <>
          <div className="text-2xl mt-4 font-semibold italic font-sans text-center">
            Crop your Image
          </div>

          <div className="mt-4"></div>
          <div style={{ maxWidth: '75%', maxHeight: '75%' }}>
            <ReactCrop
              src={filteredImageUrl || imageDataUrl}
              crop={crop}
              onImageLoaded={onLoad}
              onComplete={(c) => setCompletedCrop(c)}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              aspect={4 / 3}
              minHeight={100}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={filteredImageUrl || imageDataUrl}
                style={{ maxWidth: '100%', maxHeight: '100%' }} // Ensure the image fits within the container
              />
            </ReactCrop>
          </div>

          <div className="flex mt-4">
            <button
              onClick={() => handleFilterChange("none")}
              className="bg-blue-500 text-white font-semibold m-2 px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
            >
              Original
            </button>

            <button
              onClick={() =>
                handleFilterChange(
                  "brightness(1.3) contrast(1.25) saturate(1.3) "
                )
              }
              className="bg-blue-500 text-white font-semibold m-2 px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
            >
              Light
            </button>

            <button
              onClick={() =>
                handleFilterChange("grayscale(1.4) contrast(1.3) saturate(1.2)")
              }
              className="bg-blue-500 text-white font-semibold m-2 px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
            >
              Grayscale
            </button>
          </div>

          <button
            onClick={handleDone}
            className="bg-blue-500 text-white font-semibold m-4 px-4 py-2 rounded-md mt-4 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
          >
            Done
          </button>
        </>
      ) : (
        <>
          <div className="text-2xl mt-4 font-semibold italic font-sans text-center">
            Final Output
          </div>
          <div className="mt-4"></div>

          {/* Display the filtered image, if a filter is applied */}
          {filteredImageUrl && (
            <img
              alt="Filtered Cropped Version"
              src={filteredImageUrl}
              style={{ width: "100%", height: "auto", filter: "none" }}
            />
          )}

          <Upload
            imageDataUrl={filteredImageUrl || croppedImageUrl}
            onUploadSuccess={(downloadUrl) => {
              // console.log("Upload successful:", downloadUrl);
            }}
            onUploadError={(error) => {
              // console.error("Upload error:", error);
            }}
          />
          {/* <button
            onClick={() => navigate("/")}
            className="bg-red-500 text-white px-4 py-2 font-semibold rounded-md mt-4 focus:outline-none focus:ring focus:ring-red-400"
          >
            Back to Camera
          </button> */}
        </>
      )}
      <ToastContainer />
    </div>
  );
}

export default CropImage;
