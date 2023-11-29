import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import BeenhereIcon from '@mui/icons-material/Beenhere';
import Popover from '@mui/material/Popover';
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import default_image from '../assets/no_image.jpg';
import { useEffect, useState } from "react";
import React from 'react';
import EditModal from './EditModal';
import moment from 'moment';
import axios from "axios";
import './table.css'

export default function BasicTable(props) {
  let [detections, setDetections] = useState(props.detectionz);
  let [isOpenEditModal, setOpenEditModal] = useState(false);
  let [selectedEditData, setselectedEditData] = useState(null);
  let [fetchingEditData, setFetchingEditData] = useState(false);
  let [isValidating, setIsValidating] = useState(false);
  let [editData, setEditData] = useState([]);

  let openEditModal = (data) => {
    setOpenEditModal(true);
    setselectedEditData(data);
    setFetchingEditData(true);
    axios
      .get(`http://localhost:8080/detections/samdt_edit_list`, {
        params: {
          journey_id: data.JOURNEY_ID,
          data: data.DATA
        }
      }).then((res) => {
        setFetchingEditData(false);
        setEditData(formatEditData(res, data))
      })
      .catch((err) => {
        console.log("err", err);
        setFetchingEditData(false);
      });
  }

  let closeModal = () => {
    setOpenEditModal(false);
  }

  let validate_data = (ids, isValidated = false) => {
    setIsValidating(true);
    axios
      .post(`http://localhost:8080/detections/validate_data`, {
        body: {
          selected_data: selectedEditData,
          small_circle_ids: ids,
          isValidated: selectedEditData.DATA[0].IS_VALIDATED
        }
      }).then((res) => {
        props.updateEditedItem(res.data.updatedData)
        setIsValidating(false);
        props.openSnackBar({ success: true })
        closeModal();
      })
      .catch((err) => {
        setIsValidating(false);
        alert('An error has occured while editing');
        console.log("err", err);
      });
  }

  useEffect(() => {
    setDetections(props.detectionz);
  }, [props.detectionz]);

  return (
    <Paper sx={{ width: '100%', overflowY: 'auto' }}>
      <EditModal
        openEditModal={isOpenEditModal}
        selectedEditData={selectedEditData}
        editData={editData}
        fetchingEditData={fetchingEditData}
        closeModal={() => closeModal()}
        validate_data={(ids) => validate_data(ids)}
        isValidating={isValidating}
      />
      <TableContainer className="table-container">
        <Table stickyHeader aria-label="sticky table">
          <TableBody>
            {detections.map((row, index) => {
              return (
                <TableRowz
                  env={props.env}
                  keyy={`${row.delta_id}`}
                  row={row}
                  index={index}
                  openEditModal={(data) => openEditModal(data)}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

const TableRowz = (props) => {
  const sceneOrder = {
    "Scene Pull Up Window": 1,
    "Scene Y Lane Merge": 2,
    "Scene Order Point Outside Lane": 3,
    "Scene Entrance Outside Lane": 4,
  };

  const data = props.row.DATA.sort((a, b) => {
    const sceneA = sceneOrder[a.SCENE_NAME];
    const sceneB = sceneOrder[b.SCENE_NAME];
    return sceneA - sceneB;
  });

  let puw = props.row.DATA.find(data => data.SCENE_NAME === 'Scene Pull Up Window');
  let ylane = props.row.DATA.find(data => data.SCENE_NAME === 'Scene Y Lane Merge');
  let orderpoint = props.row.DATA.find(data => data.SCENE_NAME === 'Scene Order Point Outside Lane');
  let entrance = props.row.DATA.find(data => data.SCENE_NAME === 'Scene Entrance Outside Lane');


  return (
    <React.Fragment key={props.row.JOURNEY_ID}>
      <TableRow
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        style={{ backgroundColor: puw.IS_VALIDATED ? '#81bffc' : '' }}
      >
        <TableCell
          colSpan={4}
          style={{ fontFamily: "Nunito", fontSize: 18, fontWeight: "bold", borderBottom: 0, paddingBottom: 0 }}
          align="left"
        >
          <span style={{ cursor: puw.FOR_PUBLISH ? '' : 'pointer', userSelect: puw.FOR_PUBLISH ? 'none' : '', display: 'flex', alignItems: 'center' }} onClick={() => !puw.FOR_PUBLISH && props.openEditModal(props.row)}>
            Session {props.row.JOURNEY_ID}
            {puw.IS_VALIDATED &&
              <>
                <BeenhereIcon style={{ color: '#1976D2', height: 15, paddingLeft: 15 }} />
                <span style={{ fontFamily: 'Nunito', color: '#1976D2', fontSize: 14 }}>VALIDATED</span>
              </>
            }

            {puw.FOR_PUBLISH &&
              <>
                <BeenhereIcon style={{ color: 'white', height: 15, paddingLeft: 15 }} />
                <span style={{ fontFamily: 'Nunito', color: 'white', fontSize: 14 }}>FOR PUBLISH</span>
              </>
            }
          </span>
        </TableCell>
      </TableRow>

      <StyledTableRow
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        style={{ borderTop: 0, backgroundColor: puw.IS_VALIDATED ? '#81bffc' : '' }}
      >
        <StyledTableCell
          style={{ fontFamily: "Nunito", fontWeight: "bold" }}
          align="left"
          width={'25%'}
        >
          <img
            alt="puw_image"
            className="samdt_img"
            src={(puw && puw.IMAGE_URL) || default_image}
          />
          {puw &&
            <div style={{ float: 'right', fontSize: 12 }}>
              <span style={{ marginRight: 10 }}>(UTC) {moment(puw.ENTER_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('MMM, DD YYYY -')}</span>
              <span>IN: {moment(puw.ENTER_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A,')}</span>
              <span style={{ marginLeft: 5 }}>OUT: {moment(puw.EXIT_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A')} </span>
            </div>
          }
        </StyledTableCell>

        <StyledTableCell
          style={{ fontFamily: "Nunito", fontWeight: "bold" }}
          width={'25%'}
          align="left"
        >
          <img
            alt="ylane_image"
            className="samdt_img"
            src={(puw.IS_VALIDATED ? ylane.VALIDATED_IMAGE_URL : ylane.IMAGE_URL) || default_image}
          />
          {ylane &&
            <div style={{ float: 'right', fontSize: 12 }}>
              <span>IN: {moment(puw.IS_VALIDATED ? ylane.VALIDATED_ENTER_TIMESTAMP : ylane.ENTER_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A,')}</span>
              <span style={{ marginLeft: 5 }}>OUT: {moment(puw.IS_VALIDATED ? ylane.VALIDATED_EXIT_TIMESTAMP : ylane.EXIT_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A')}</span>
            </div>
          }
        </StyledTableCell>

        <StyledTableCell width={'25%'} align="left" style={{ fontFamily: "Nunito", fontWeight: "bold" }}>
          <img
            alt="ylane_image"
            className="samdt_img"
            src={(puw.IS_VALIDATED ? orderpoint.VALIDATED_IMAGE_URL : orderpoint.IMAGE_URL) || default_image}
          />
          {orderpoint &&
            <div style={{ float: 'right', fontSize: 12 }}>
              <span>IN: {moment(puw.IS_VALIDATED ? orderpoint.VALIDATED_ENTER_TIMESTAMP : orderpoint.ENTER_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A,')}</span>
              <span style={{ marginLeft: 5 }}>OUT: {moment(puw.IS_VALIDATED ? orderpoint.VALIDATED_EXIT_TIMESTAMP : orderpoint.EXIT_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A')}</span>
            </div>
          }
        </StyledTableCell>

        <StyledTableCell align="left" width={'25%'} style={{ fontFamily: "Nunito", fontWeight: "bold" }}>
          <img
            alt="ylane_image"
            className="samdt_img"
            src={(puw.IS_VALIDATED ? entrance.VALIDATED_IMAGE_URL : entrance.IMAGE_URL) || default_image}
          />
          {entrance &&
            <div style={{ float: 'right', fontSize: 12 }}>
              <span>IN: {moment(puw.IS_VALIDATED ? entrance.VALIDATED_ENTER_TIMESTAMP : entrance.ENTER_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A,')}</span>
              <span style={{ marginLeft: 5 }}>OUT: {moment(puw.IS_VALIDATED ? entrance.VALIDATED_EXIT_TIMESTAMP : entrance.EXIT_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A')}</span>
            </div>
          }
        </StyledTableCell>
      </StyledTableRow>
    </React.Fragment>
  );
};

const formatEditData = (d, selectedData) => {
  let data = d.data.rows;
  let selectedDataArray = selectedData.DATA;

  let entrance = {
    aboveSelectedTime: data['Scene Entrance Outside Lane'].filter(d => d.ENTER_TIMESTAMP > selectedDataArray.find(i => i.SCENE_NAME === 'Scene Entrance Outside Lane').ENTER_TIMESTAMP),
    belowSelectedTime: data['Scene Entrance Outside Lane'].filter(d => d.ENTER_TIMESTAMP < selectedDataArray.find(i => i.SCENE_NAME === 'Scene Entrance Outside Lane').ENTER_TIMESTAMP)
  };
  let puw = {
    aboveSelectedTime: data['Scene Pull Up Window'].filter(d => d.ENTER_TIMESTAMP > selectedDataArray.find(i => i.SCENE_NAME === 'Scene Pull Up Window').ENTER_TIMESTAMP),
    belowSelectedTime: data['Scene Pull Up Window'].filter(d => d.ENTER_TIMESTAMP < selectedDataArray.find(i => i.SCENE_NAME === 'Scene Pull Up Window').ENTER_TIMESTAMP)
  };
  let orderPoint = {
    aboveSelectedTime: data['Scene Order Point Outside Lane'].filter(d => d.ENTER_TIMESTAMP > selectedDataArray.find(i => i.SCENE_NAME === 'Scene Order Point Outside Lane').ENTER_TIMESTAMP),
    belowSelectedTime: data['Scene Order Point Outside Lane'].filter(d => d.ENTER_TIMESTAMP < selectedDataArray.find(i => i.SCENE_NAME === 'Scene Order Point Outside Lane').ENTER_TIMESTAMP)
  };
  let ylaneData = {
    aboveSelectedTime: data['Scene Y Lane Merge'].filter(d => d.ENTER_TIMESTAMP > selectedDataArray.find(i => i.SCENE_NAME === 'Scene Y Lane Merge').ENTER_TIMESTAMP),
    belowSelectedTime: data['Scene Y Lane Merge'].filter(d => d.ENTER_TIMESTAMP < selectedDataArray.find(i => i.SCENE_NAME === 'Scene Y Lane Merge').ENTER_TIMESTAMP)
  };

  let maxAboveTimeLength = [entrance.aboveSelectedTime.length, puw.aboveSelectedTime.length, orderPoint.aboveSelectedTime.length, ylaneData.aboveSelectedTime.length];
  let maxBelowTimeLength = [entrance.belowSelectedTime.length, puw.belowSelectedTime.length, orderPoint.belowSelectedTime.length, ylaneData.belowSelectedTime.length];

  let tableData = [];

  if (Math.max(...maxAboveTimeLength)) {
    for (let x = 0; x <= Math.max(...maxAboveTimeLength) - 1; x++) {
      tableData.push([
        entrance.aboveSelectedTime[x] || null,
        puw.aboveSelectedTime[x] || null,
        orderPoint.aboveSelectedTime[x] || null,
        ylaneData.aboveSelectedTime[x] || null
      ])
    }
  }

  if (Math.max(...maxBelowTimeLength)) {
    for (let x = 0; x <= Math.max(...maxBelowTimeLength) - 1; x++) {
      tableData.push([
        entrance.belowSelectedTime[x] || null,
        puw.belowSelectedTime[x] || null,
        orderPoint.belowSelectedTime[x] || null,
        ylaneData.belowSelectedTime[x] || null
      ])
    }
  }

  // for (let x = 1; x <= 15; x++) {
  //   if (x <= 5) {
  //     tableData.push([
  //       entrance.aboveSelectedTime[x - 1],
  //       puw.aboveSelectedTime[x - 1],
  //       orderPoint.aboveSelectedTime[x - 1],
  //       ylaneData.aboveSelectedTime[x - 1]
  //     ])
  //   } else {
  //     tableData.push([
  //       entrance.belowSelectedTime[x - 6],
  //       puw.belowSelectedTime[x - 6],
  //       orderPoint.belowSelectedTime[x - 6],
  //       ylaneData.belowSelectedTime[x - 6]
  //     ])
  //   }
  // }

  const sortViaEnterTimestampOfPuw = (a, b) => {
    const timestampA = new Date(a[0].ENTER_TIMESTAMP).getTime();
    const timestampB = new Date(b[0].ENTER_TIMESTAMP).getTime();
    return timestampB - timestampA;
  };

  return tableData.sort(sortViaEnterTimestampOfPuw)
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#FAFAFA',
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));