import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Tesseract from 'tesseract.js';
import keywordExtractor from 'keyword-extractor';

const RelatedInfo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState('');
  const [text, setText] = useState('');
  const [progress, setProgress] = useState(0);
  const [keywords, setKeywords] = useState([]);

  const handleSubmit = () => {
    setIsLoading(true);
    Tesseract.recognize(image, 'eng', {
      logger: (m) => {
        console.log(m);
        if (m.status === 'recognizing text') {
          setProgress(parseInt(m.progress * 100));
        }
      },
    })
    .catch((err) => {
      console.error(err);
    })
    .then((result) => {
      console.log(result.data);
      setText(result.data.text);
      setIsLoading(false);
      // Extract keywords using keyword-extractor
      const extractionResult = keywordExtractor.extract(result.data.text, {
        language: "english",
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: false
      });
      setKeywords(extractionResult);
    });
  };

  const searchGoogle = (keyword) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
    window.open(url, '_blank');
  };

  const handleKeywordClick = (keyword) => {
    searchGoogle(keyword);
  };

  return (
    <>
      <div className="bg-white p-5 rounded-md absolute top-20 left-5 md:left-72 right-5 md:right-5 shadow-lg">
        <div>
          <div className="flex md:flex-row justify-between items-center mb-4">
            <h2 className="text-xl font-semibold mb-4 md:mb-0">Related Info</h2>
          </div>
          <div className="px-2">
            <hr />
          </div>
          <div className="h-[68vh] overflow-y-scroll overflow-x-hidden">
            <div className="m-4">
              {isLoading && (
                <>
                  <progress className="progress w-full mt-4" value={progress} max="100"></progress>
                  <p className="text-center py-0 my-0">Converting: {progress} %</p>
                </>
              )}
              {/* This section will always be visible now */}
              <input
                type="file"
                onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))}
                className="mt-5 mb-2"
              />
              <button
                onClick={handleSubmit}
                className="btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5"
              >
                Convert
              </button>
              {/* End of always visible section */}
              {!isLoading && text && (
                <>
                  <div className="mt-3 mb-3 p-3 bg-gray-100 rounded">
                    <p className="whitespace-pre-wrap">{text}</p>
                  </div>
                    <div className="m-2 font-semibold underline">keyword search on google:</div>
                  <div className="flex flex-wrap gap-2 p-2">
                    {keywords.map((keyword, index) => (
                      <button
                        key={index}
                        onClick={() => handleKeywordClick(keyword)}
                        className="bg-blue-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 focus:outline-none"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                  {/* <button
                    onClick={() => searchGoogle(keywords.join(' '))}
                    className="m-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg font-bold py-2 px-4"
                  >
                    Search on Google
                  </button> */}
                </>
              )}
            </div>
          </div>
          <ToastContainer />
        </div>
      </div>
    </>
  );
};

export default RelatedInfo;