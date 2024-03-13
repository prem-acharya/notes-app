import React from "react";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";

const Documents = () => {
  return (
<div className="bg-white p-5 rounded-md absolute top-20 left-5 md:left-72 right-5 md:right-5">
  <div className="flex flex-col md:flex-row justify-between items-center mb-4">
    <h2 className="text-xl font-semibold mb-4 md:mb-0">My Documents</h2>
    <div className="flex space-x-4 bg-blue-100 rounded-md p-2">
      <label className="cursor-pointer">
        <input type="file" className="hidden" />
        <div className="flex items-center space-x-2 font-medium text-blue-600">
          <span className="material-icons">
            <NoteAddIcon className="text-xl" />
          </span>
          <span className="hidden md:inline-block">Upload File</span>
        </div>
      </label>
      <button className="flex items-center space-x-2 font-medium text-blue-600">
        <span className="material-icons">
          <CreateNewFolderIcon className="text-xl" />
        </span>
        <span className="hidden md:inline-block">Create Folder</span>
      </button>
    </div>
  </div>
  {/* Rest of your content goes here */}
</div>

  );
};

export default Documents;
