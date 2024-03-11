import React, { useState } from "react";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ListIcon from "@material-ui/icons/List";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import FolderIcon from "@material-ui/icons/Folder";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import OptionsModal from "./OptionsModal";

const Data = () => {
  const [optionsAnchorEl, setOptionsAnchorEl] = useState(null);
  const [fileColor, setFileColor] = useState("gray");

  const handleOptionsClick = (event) => {
    setOptionsAnchorEl(event.currentTarget);
  };

  const handleOptionsClose = () => {
    setOptionsAnchorEl(null);
  };

  return (
    <div className="flex flex-col w-full space-y-4 px-4 pt-2">
      <div className="flex flex-col md:flex-row md:justify-between border-b border-gray-300 pb-4">
        <div className="flex items-center space-x-2">
          <p>My Documents</p>
          <ArrowDropDownIcon />
        </div>
        <div className="flex items-center space-x-2.5">
          <ListIcon />
          <InfoOutlinedIcon />
        </div>
      </div>
      <div className=" w-2/6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center border border-gray-200 p-4 rounded-sm">
            <InsertDriveFileIcon
              style={{ color: fileColor }}
              fontSize="large"
            />
            <div className="border-t border-gray-300 mt-1 text-sm bg-gray-100 py-2 relative">
              File Name
              <MoreVertIcon
                className="text-gray-600 cursor-pointer absolute top-1/2 right-2 transform -translate-y-1/2"
                onClick={handleOptionsClick}
              />
            </div>
            <OptionsModal
              anchorEl={optionsAnchorEl}
              handleClose={handleOptionsClose}
              currentColor={fileColor}
              setColor={(color) => setFileColor(color)}
            />
          </div>
          <div className="text-center border border-gray-200 p-4 rounded-sm">
            <FolderIcon style={{ color: fileColor }} fontSize="large" />
            <div className="border-t border-gray-300 mt-1 text-sm bg-gray-100 py-2 relative">
              Folder Name
              <MoreVertIcon
                className="text-gray-600 cursor-pointer absolute top-1/2 right-2 transform -translate-y-1/2"
                onClick={handleOptionsClick}
              />
            </div>
            <OptionsModal
              anchorEl={optionsAnchorEl}
              handleClose={handleOptionsClose}
              currentColor={fileColor}
              setColor={(color) => setFileColor(color)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Data;
