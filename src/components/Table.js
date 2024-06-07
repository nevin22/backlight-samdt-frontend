import React from 'react';
import { useEffect, useState } from "react";
import moment from 'moment';
import axios from "axios";

import backendService from '../services/backendService';

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import BeenhereIcon from '@mui/icons-material/Beenhere';
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import ErrorIcon from '@mui/icons-material/Error';
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

import default_image from '../assets/no_image.jpg';
import EditModal from './EditModal';
import AlertDialog from "./AlertDialog";

import './table.css'

export default function BasicTable(props) {
  let [detections, setDetections] = useState(props.detectionz);
  let [isOpenEditModal, setOpenEditModal] = useState(false);
  let [selectedEditData, setselectedEditData] = useState(null);
  let [fetchingEditData, setFetchingEditData] = useState(false);
  let [isValidating, setIsValidating] = useState(false);
  let [editData, setEditData] = useState([]);
  let [openAlert, setOpenAlert] = useState(false);
  let [idToInvalidate, setIdToInvalidate] = useState('');

  let openEditModal = (data) => {
    setOpenEditModal(true);
    setselectedEditData(data);
    setFetchingEditData(true);

    backendService.getEditList(data, props.tableColumns)
      .then(res => {
        setFetchingEditData(false);
        setEditData(formatEditData(res, data, props.tableColumns))
      })
      .catch(err => {
        console.log("err", err);
        setFetchingEditData(false);
      })
  }

  let closeModal = () => {
    setOpenEditModal(false);
  }

  let validate_data = (ids, eventType, selectedEditData) => {
    setIsValidating(true);
    backendService.validateData(ids, eventType, selectedEditData)
      .then(res => {
        setIsValidating(false);
        props.updateEditedItem(res.updatedData)
        props.openSnackBar({ success: true })
        closeModal();
      })
      .catch(err => {
        setIsValidating(false);
        alert('An error has occured while editing');
        console.log("err", err);
      })
  }

  useEffect(() => {
    setDetections(props.detectionz);
  }, [props.detectionz]);

  return (
    <Paper sx={{ width: '100%', overflowY: 'auto' }}>
      <AlertDialog
        closeAlert={() => setOpenAlert(false)}
        openAlert={openAlert}
        contentText={'Are you certain you wish to invalidate this session ?'}
        title={"Invalidate Session ?"}
        onProceed={() => {
          backendService.invalidateData(idToInvalidate)
            .then(res => {
              setOpenAlert(false)
              setIdToInvalidate('');
              setTimeout(() => {
                window.location.reload();
              }, 300)
            })
            .catch(err => {
              console.log('errr', err);
              setOpenAlert(false)
              setIdToInvalidate('');
            })
        }}
      />
      <EditModal
        tableColumns={props.tableColumns}
        openEditModal={isOpenEditModal}
        selectedEditData={selectedEditData}
        editData={editData}
        fetchingEditData={fetchingEditData}
        closeModal={() => closeModal()}
        validate_data={(ids, eventType) => validate_data(ids, eventType, selectedEditData)}
        isValidating={isValidating}
      />
      <TableContainer className="table-container">
        <Table stickyHeader aria-label="sticky table">
          <TableBody>
            {detections.map((row, index) => {
              return (
                <CustomTableRow
                  tableColumns={props.tableColumns}
                  env={props.env}
                  key={`${index}`}
                  propKey={`${index}`}
                  row={row}
                  index={index}
                  openEditModal={(data) => openEditModal(data)}
                  setIdToInvalidate={(id) => {
                    setIdToInvalidate(id);
                    setOpenAlert(true)
                  }}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

const CustomTableRow = (props) => {
  let rowItems = props.row.DATA;
  let columnLength = props.tableColumns.length;
  let forPublish = rowItems.find(d => d.IS_FOR_PUBLISH_FULL_JOURNEY);
  let isValidated = rowItems.find(d => d.IS_VALIDATED_FULL_JOURNEY);
  let eventType = rowItems[0].BA_TYPE;


  let rowComponents = [];
  for (let i = 0; i <= columnLength - 1; i++) {
    let item = rowItems.find(d => parseInt(d.ORDER_INDEX) === (columnLength - 1) - i);
    if (item && !item.NO_DATA) {
      let image = item.VALIDATED_IMAGE_URL ? item.VALIDATED_IMAGE_URL : (item.IMAGE_URL || default_image);
      rowComponents.push(
        <StyledTableCell
          key={i}
          style={{ fontFamily: "Nunito", fontWeight: "bold" }}
          align="left"
          width={`${100 / columnLength}%`}
        >
          <img
            alt="samdt_image"
            className="samdt_img"
            src={image}
          />
          <div style={{ float: 'right', fontSize: 12, display: 'flex', placeContent: 'center' }}>
            {!!item.IS_BA &&
              <React.Fragment>
                <ErrorIcon style={{ height: 15, width: 15, marginRight: 5, color: '#ff7474' }} />
                <span style={{ fontFamily: 'Nunito', marginRight: 10, color: '#ff7474' }}>BA</span>
              </React.Fragment>
            }
            <span style={{ marginRight: 10 }}>{moment((item.VALIDATED_ENTER_TIMESTAMP || item.ENTER_TIMESTAMP), 'YYYY-MM-DD HH:mm:ss.SSS').format('MMM, DD YYYY -')}</span>
            <span>IN: {moment((item.VALIDATED_ENTER_TIMESTAMP || item.ENTER_TIMESTAMP), 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A,')}</span>
            <span style={{ marginLeft: 5 }}>OUT: {moment((item.VALIDATED_EXIT_TIMESTAMP || item.EXIT_TIMESTAMP), 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A')} </span>
          </div>
        </StyledTableCell>
      )
    } else {
      rowComponents.push(
        <StyledTableCell
          key={i}
          style={{ fontFamily: "Nunito", fontWeight: "bold" }}
          align='center'
          width={`${100 / columnLength}%`}
        >
          No Data
        </StyledTableCell>
      )
    }
  }

  return (
    <React.Fragment key={props.propKey}>
      <TableRow key={props.propKey}
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        style={{ backgroundColor: isValidated ? '#81bffc' : '' }}
      >
        <TableCell
          colSpan={columnLength}
          style={{ fontFamily: "Nunito", fontSize: 18, fontWeight: "bold", borderBottom: 0, paddingBottom: 0 }}
          align="left"
        >
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{ cursor: forPublish ? '' : 'pointer', userSelect: forPublish ? 'none' : '' }}
              onClick={() => {
                return !forPublish && props.openEditModal({
                  ...props.row,
                  DATA: props.row.DATA.filter(d => !d.NO_DATA)
                })
              }}>
              {props.index + 1} Session {props.row.JOURNEY_ID}
            </span>
            {isValidated &&
              <>
                <BeenhereIcon style={{ color: '#1976D2', height: 15, paddingLeft: 15 }} />
                <span
                  onDoubleClick={() => props.setIdToInvalidate(props.row.JOURNEY_ID)}
                  style={{ cursor: forPublish ? '' : 'pointer', userSelect: 'none', fontFamily: 'Nunito', color: '#1976D2', fontSize: 14 }}
                >
                  VALIDATED
                </span>
              </>
            }

            {eventType === 'Balk' &&
              <>
                <BeenhereIcon style={{ color: '#6B0000', height: 15, paddingLeft: 15 }} />
                <span
                  onDoubleClick={() => props.setIdToInvalidate(props.row.JOURNEY_ID)}
                  style={{ cursor: forPublish ? '' : 'pointer', userSelect: 'none', fontFamily: 'Nunito', color: '#6B0000', fontSize: 14 }}
                >
                  BALK
                </span>
              </>
            }

            {eventType === 'Abandon' &&
              <>
                <BeenhereIcon style={{ color: '#6B0000', height: 15, paddingLeft: 15 }} />
                <span
                  onDoubleClick={() => props.setIdToInvalidate(props.row.JOURNEY_ID)}
                  style={{ cursor: forPublish ? '' : 'pointer', userSelect: 'none', fontFamily: 'Nunito', color: '#6B0000', fontSize: 14 }}
                >
                  ABANDON
                </span>
              </>
            }

            {forPublish &&
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
        style={{ borderTop: 0, backgroundColor: isValidated ? '#81bffc' : '' }}
      >
        {rowComponents}
      </StyledTableRow>
    </React.Fragment>
  );
};

const formatEditData = (d, selectedData, tableColumns) => {
  let data = d.rows;
  let selectedDataArray = selectedData.DATA;
  let editItemPerFov = tableColumns.map((column, index) => {
    return ({
      aboveSelectedTime: data[`${column.sceneName}`]?.filter(d => {
        let selectedData = selectedDataArray.find(i => i.SCENE_NAME === column.sceneName) || selectedDataArray[0];
        return d?.ENTER_TIMESTAMP > (selectedData?.ENTER_TIMESTAMP || selectedData?.VALIDATED_ENTER_TIMESTAMP)
      }),
      belowSelectedTime: data[`${column.sceneName}`]?.filter(d => {
        let selectedData = selectedDataArray.find(i => i.SCENE_NAME === column.sceneName) || selectedDataArray[0];
        return d?.ENTER_TIMESTAMP < (selectedData?.ENTER_TIMESTAMP || selectedData?.VALIDATED_ENTER_TIMESTAMP)
      }),
    })
  })

  let maxAboveTimeLength = Math.max(...editItemPerFov.map(d => d.aboveSelectedTime?.length).filter(value => value !== undefined));
  let maxBelowTimeLength = Math.max(...editItemPerFov.map(d => d.belowSelectedTime?.length).filter(value => value !== undefined));

  let tableData = [];

  if (maxAboveTimeLength) {
    for (let x = 0; x <= maxAboveTimeLength - 1; x++) {
      tableData.push(tableColumns.map((d, index) => {
        let povItems = editItemPerFov.find(d2 => (d2.aboveSelectedTime && d2.aboveSelectedTime[x] && d2.aboveSelectedTime[x].SCENE_NAME) === d.sceneName);
        return { [`${d.sceneName}`]: povItems && povItems.aboveSelectedTime[x] }
      }))
    }
  }

  if (maxBelowTimeLength) {
    for (let x = 0; x <= maxBelowTimeLength - 1; x++) {
      tableData.push(tableColumns.map((d, index) => {
        let povItems = editItemPerFov.find(d2 => (d2.belowSelectedTime && d2.belowSelectedTime[x] && d2.belowSelectedTime[x].SCENE_NAME) === d.sceneName);
        return { [`${d.sceneName}`]: povItems && povItems.belowSelectedTime[x] }
      }))
    }
  }

  let transformedTable = tableData.map(d => {
    return d.map((d2) => Object.values(d2)[0])
  })

  const sortViaEnterTimestampOfPuw = (a, b) => {
    const timestampA = a[0] && a[0].ENTER_TIMESTAMP ? new Date(a[0].ENTER_TIMESTAMP).getTime() : 0;
    const timestampB = b[0] && b[0].ENTER_TIMESTAMP ? new Date(b[0].ENTER_TIMESTAMP).getTime() : 0;
    return timestampB - timestampA;
  };

  return transformedTable.sort(sortViaEnterTimestampOfPuw)
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