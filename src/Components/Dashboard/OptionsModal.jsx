import React, { useState } from "react";
import { Menu, MenuItem, ListItemIcon } from "@material-ui/core";
import BorderColorIcon from "@material-ui/icons/BorderColor";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import PaletteIcon from "@material-ui/icons/Palette";
import InfoIcon from "@material-ui/icons/Info";
import styled from "styled-components";

const ColorPaletteContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  gap: 3px;
`;

const ColorOption = styled.div`
  width: 20px;
  height: 20px;
  margin: 5px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.2);
  }
`;

const OptionsModal = ({ anchorEl, handleClose, currentColor, setColor }) => {
  const [colorMenuAnchorEl, setColorMenuAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const openColorMenu = Boolean(colorMenuAnchorEl);

  const handleOptionClick = (option) => {
    if (option === "Color") {
      setColorMenuAnchorEl(anchorEl);
    } else {
      console.log(`${option} clicked`);
      handleClose();
    }
  };

  const handleColorMenuClose = () => {
    setColorMenuAnchorEl(null);
    handleClose();
  };

  const handleColorOptionClick = (color) => {
    console.log(`Color ${color} clicked`);
    setColor(color);
    handleClose();
  };

  const colorOptions = ["#FF5733", "#FFC300", "#4CAF50", "#2196F3", "#9C27B0"];

  return (
    <div>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        getContentAnchorEl={null}
      >
        <MenuItem onClick={() => handleOptionClick("Color")}>
          <ListItemIcon>
            <PaletteIcon />
          </ListItemIcon>
          Color
        </MenuItem>
        <MenuItem onClick={() => handleOptionClick("Rename")}>
          <ListItemIcon>
            <BorderColorIcon />
          </ListItemIcon>
          Rename
        </MenuItem>
        <MenuItem onClick={() => handleOptionClick("Delete")}>
          <ListItemIcon>
            <DeleteForeverIcon />
          </ListItemIcon>
          Delete
        </MenuItem>
        <MenuItem onClick={() => handleOptionClick("Details")}>
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          Details
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={colorMenuAnchorEl}
        open={openColorMenu}
        onClose={handleColorMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        getContentAnchorEl={null}
      >
        <ColorPaletteContainer>
          {colorOptions.map((color, index) => (
            <ColorOption
              key={index}
              color={color}
              onClick={() => handleColorOptionClick(color)}
            />
          ))}
        </ColorPaletteContainer>
      </Menu>
    </div>
  );
};

export default OptionsModal;
