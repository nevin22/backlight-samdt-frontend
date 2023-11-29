import Button from "@mui/material/Button";
import axios from "axios";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { useEffect, useState } from "react";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import DeleteIcon from "@mui/icons-material/Delete";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";

export default function SimpleDialog(props) {
  const {
    onClose,
    open,
    data,
    updateList,
    availableSensors,
    availableTypes,
    onAdd,
    disableDialogActions,
    env
  } = props;

  const [sensor, setSensor] = useState("");
  const [type, setType] = useState("");

  const handleChangeSensor = (event) => {
    setSensor(event.target.value);
  };

  const handleChangeType = (event) => {
    setType(event.target.value);
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={() => onClose()} open={open}>
      <DialogTitle style={{ fontFamily: "Nunito" }}>
        Configure Sensors
      </DialogTitle>
      <Divider />
      <div
        style={{
          fontFamily: "Nunito",
          display: "flex",
          padding: "0px 16px 0px 16px",
        }}
      >
        <Button
          disabled={disableDialogActions}
          style={{ fontFamily: "Nunito" }}
          variant="text"
          onClick={() => {
            if (sensor === '' || type === '') {
              alert('fillup the fields')
            } else {
              onAdd({
                serial_id: sensor.serial_id,
                type
              });
              setTimeout(() => {
                setType("");
                setSensor("")
              })
            }
          }}
        >
          ADD
        </Button>

        <FormControl
          style={{ fontFamily: "Nunito" }}
          sx={{ m: 1, minWidth: 120 }}
        >
          <InputLabel id="sensor-label">Sensor</InputLabel>
          <Select
            labelId="sensor-label"
            value={sensor}
            label="Sensor"
            onChange={handleChangeSensor}
          >
            {availableSensors && availableSensors.map((d, i) => {
              return (
                <MenuItem key={i} style={{ fontFamily: "Nunito" }} value={d}>
                  {d.serial_id}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="Type-label">Type</InputLabel>
          <Select
            labelId="Type-label"
            value={type}
            label="Type"
            onChange={handleChangeType}
          >
            {availableTypes && availableTypes.map((d, i) => {
              return (
                <MenuItem key={i} style={{ fontFamily: "Nunito" }} value={d}>
                  {d}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </div>

      <Divider />
      <List>
        {data.map((d, i) => {
          return (
            <ListItem key={i} disablePadding>
              <ListItemButton>
                <ListItemText primary={`${d.serial_id} - ${d.type}`} />
                <IconButton
                  disabled={disableDialogActions}
                  onClick={() => updateList(i)}
                  edge="end"
                  aria-label="delete"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Dialog>
  );
};