import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import ComputerIcon from '@mui/icons-material/Computer';
import ShareIcon from '@mui/icons-material/Share';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import StorageIcon from '@mui/icons-material/Storage';
import ScheduleIcon from '@mui/icons-material/Schedule';

const Sidebar = () => {

  return(
    <div className="fixed inset-y-0 left-0 w-64 bg-blue-50 p-5 flex-col cursor-pointer transition duration-300 transform -translate-x-full md:relative md:translate-x-0 md:w-64 md:flex md:flex-col">
      <div className="flex items-center mb-3">
        <span className="font-bold text-lg">My Notes</span>
      </div>
      <div className="flex flex-col">
        <a href="#" className="flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md">
          <HomeIcon className="mr-2" /> Documents
        </a>
        <a href="#" className="flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md">
          <ComputerIcon className="mr-2" /> Scanner
        </a>
        <a href="#" className="flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md">
          <ScheduleIcon className="mr-2" /> Recent
        </a>
        <a href="#" className="flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md">
          <ShareIcon className="mr-2" /> Shared with me
        </a>
        <a href="#" className="flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md">
          <StarBorderIcon className="mr-2" /> Starred
        </a>
        <a href="#" className="flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md">
          <DeleteOutlineIcon className="mr-2" /> Trash
        </a>
        <div className="flex items-center py-2 text-gray-700 hover:bg-gray-200 rounded-md">
          <StorageIcon className="mr-2" /> Storage
        </div>
      </div>
    </div>
  );
};

export default Sidebar;