import React, { useState, useEffect } from "react";
import { db } from "../../../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "images"));
        const imageData = querySnapshot.docs.map((doc) => doc.data());
        setImages(imageData);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, []);

  return (
    <div>
      <div className="top-0 p-4 bg-gradient-to-r from-blue-100 via-sky-200 to-blue-100 rounded-md">
        <div className="text-3xl text-center font-semibold mb-6">Dashboard</div>
        <Link to="/" className="inline-block bg-blue-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-600">
          Camera
        </Link>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="overflow-hidden rounded-md border transition-transform transform hover:scale-105">
              <img
                src={image.url}
                alt=""
                className="w-full h-40 object-cover rounded-t-md cursor-pointer"
              />
              <div className="p-4 bg-white rounded-b-md">
                <p className="text-sm text-gray-600">{new Date(image.createdAt.toDate()).toLocaleString()}</p>
                {image.fileName && (
                  <p className="text-md font-semibold text-blue-500 mt-2">{image.fileName}.png</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
