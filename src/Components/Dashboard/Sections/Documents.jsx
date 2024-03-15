import React from "react";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';

const Documents = () => {
  return (
<div className="bg-white p-5 rounded-md absolute top-20 left-5 md:left-72 right-5 md:right-5">
  <div className="flex md:flex-row justify-between items-center mb-4">
    <h2 className="text-xl font-semibold mb-4 md:mb-0">My Documents</h2>
    <div className="flex space-x-4">
      <label className="cursor-pointer">
        <input type="file" className="hidden" />
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
</div>

  );
};

export default Documents;
