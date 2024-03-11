import DescriptionIcon from "@material-ui/icons/Description";
import StarBorderOutlinedIcon from "@material-ui/icons/StarBorderOutlined";
// import AddIcon from "@material-ui/icons/Add";
import CameraAltIcon from "@material-ui/icons/CameraAlt";

const Sidebar = () => {
  return (
    <div className="mt-2 ml-2 mr-12">
      <div className="mb-2">
        {/* <button className="flex items-center border border-gray-300 rounded-full p-1 shadow-md ml-2 bg-transparent hover:bg-gray-100">
          <AddIcon style={{ color: "#0A96F8" }} />
          <span className="text-base mr-5 ml-2.5">New</span>
        </button> */}
      </div>
      <div className="mt-2">
        {[
          { icon: <DescriptionIcon />, text: "My documents" },
          { icon: <CameraAltIcon />, text: "Scan Documents" },
          { icon: <StarBorderOutlinedIcon />, text: "Starred" },
        ].map((option, index) => (
          <div
            key={index}
            className="flex items-center p-2 hover:bg-gray-200 cursor-pointer rounded-r-full"
          >
            {option.icon}
            <span className="ml-4 text-sm font-medium text-gray-600">
              {option.text}
            </span>
          </div>
        ))}
      </div>
      {/* <hr /> */}
      {/* <div className="mt-2.5">
        <div className="flex items-center p-2 hover:bg-gray-200 cursor-pointer rounded-r-full">
          <CloudQueueIcon />
          <span className="ml-4 text-sm font-medium text-gray-600">
            Storage
          </span>
        </div>
        <div className="rounded-full m-2 h-3 w-36 bg-gray-300">
          <div
            className="bg-blue-500 h-3 rounded-full"
            style={{ width: `${progressPercentage}%` }} // Dynamically set the width based on the progress
          ></div>
        </div>
        <span className="block text-gray-800 m-2 text-sm mt-1">
          5 GB of 1 GB used
        </span>
      </div> */}
    </div>
  );
};

export default Sidebar;
