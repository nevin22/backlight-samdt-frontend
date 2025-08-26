import React from 'react';
import { useEffect, useState } from "react";
import moment from 'moment';
import backendService from '../services/backendService';

import Popover from '@mui/material/Popover';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import BeenhereIcon from '@mui/icons-material/Beenhere';
import TableContainer from "@mui/material/TableContainer";
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TableRow from "@mui/material/TableRow";
import ErrorIcon from '@mui/icons-material/Error';
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

import default_image from '../assets/no_image.jpg';
import IconPublished from '../assets/icons/icon-published.svg';
import IconValidated from '../assets/icons/icon-check-with-circle.svg';
import IconTime from '../assets/icons/icon-time-black.svg'
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
        props.updateEditedItem(res.updatedData, true)
        props.openSnackBar({ success: true })
        closeModal();
      })
      .catch(err => {
        setIsValidating(false);
        alert(err.response.data.message || 'An error has occured while editing');
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
              props.updateEditedItem(res.updatedData, false)
              props.openSnackBar({ success: true })
              // setTimeout(() => {
              //   window.location.reload();
              // }, 300)
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
                  validate_data={(ids, type, sdata) => {
                    validate_data(ids, type, sdata);
                  }}
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

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? `simple-popover ${columnLength}` : undefined;

  let rowComponents = [];
  for (let i = 0; i <= columnLength - 1; i++) {
    let item = rowItems.find(d => parseInt(d.ORDER_INDEX) === (columnLength - 1) - i);
    let enter_ts = item && (item.VALIDATED_ENTER_TIMESTAMP || item.ENTER_TIMESTAMP);
    let exit_ts = item && (item.VALIDATED_EXIT_TIMESTAMP || item.EXIT_TIMESTAMP);
    const diffMilliseconds = moment(exit_ts).diff(moment(enter_ts));
    const duration = moment.duration(diffMilliseconds);

    const result = [
      duration.hours() && `${duration.hours()}h`,
      duration.minutes() && `${duration.minutes()}m`,
      duration.seconds() && `${duration.seconds()}s`,
    ].filter(Boolean).join(' ') || '0s';

    if (item && !item.NO_DATA) {
      let image = item.VALIDATED_IMAGE_URL ? item.VALIDATED_IMAGE_URL : (item.IMAGE_URL || default_image);
      rowComponents.push(
        <StyledTableCell
          key={i}
          style={{ fontFamily: "Nunito", fontWeight: "bold", position: 'relative' }}
          align="left"
          width={`${100 / columnLength}%`}
        >
          <img
            alt="samdt_image"
            className="samdt_img"
            src={image}
          /> 
          <div style={{ position: 'absolute', zIndex: 50, right: 20, bottom: 35, fontSize: 12, color: 'white', opacity: 0.5 }}>
            {item.SMALL_CIRCLE_ID}
          </div>
          <div style={{ float: 'right', fontSize: 12, display: 'flex', placeContent: 'center' }}>
            {!!item.IS_BA &&
              <React.Fragment>
                <ErrorIcon style={{ height: 15, width: 15, marginRight: 5, color: '#ff7474' }} />
                <span style={{ fontFamily: 'Nunito', marginRight: 10, color: '#ff7474' }}>BA</span>
              </React.Fragment>
            }
            {/* <span style={{ marginRight: 5 }}>{moment(enter_ts, 'YYYY-MM-DD HH:mm:ss.SSS').format('MMM, DD YYYY')}</span> */}
            <span>IN: {moment((item.VALIDATED_ENTER_TIMESTAMP || item.ENTER_TIMESTAMP), 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A,')}</span>
            <span style={{ marginLeft: 5 }}>OUT: {moment(exit_ts, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A')} </span>
            <img
              style={{ height: 16, marginLeft: 5 }}
              alt="samdt_image"
              src={IconTime}
            />
            <span style={{ marginLeft: 2 }}>{result}</span>
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
        style={{ backgroundColor: isValidated ? '#B4D9FD' : '' }}
      >
        <TableCell
          colSpan={columnLength}
          style={{ fontFamily: "Nunito", fontSize: 18, fontWeight: "bold", borderBottom: 0, paddingBottom: 0 }}
          align="left"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className='flex items-center'>
              <span
                style={{ cursor: isValidated ? '' : 'pointer' }}
                className='mr-2'
                onClick={() => {
                  return !isValidated && props.openEditModal({
                    ...props.row,
                    DATA: props.row.DATA.filter(d => !d.NO_DATA)
                  })
                }}>
                {props.index + 1} Session {props.row.JOURNEY_ID}
              </span>
              {isValidated && !forPublish &&
                <div className='flex items-center ml-4'>
                  <img
                    style={{ height: 16 }}
                    alt="samdt_image"
                    src={IconValidated}
                  />
                  <span
                    // onDoubleClick={() => props.setIdToInvalidate(props.row.JOURNEY_ID)}
                    style={{ userSelect: 'none', fontFamily: 'Nunito', color: '#1976D2', fontSize: 14 }}
                    className='px-1'
                  >
                    VALIDATED
                  </span>
                </div>
              }

              {forPublish &&
                <div className='flex items-center ml-4'>
                  <img
                    style={{ height: 16 }}
                    alt="samdt_image"
                    src={IconPublished}
                  />
                  <span style={{ fontFamily: 'Nunito', color: '#028F68', fontSize: 14, paddingLeft: 5 }}>PUBLISHED</span>
                </div>
              }

              {eventType === 'Warm Exit' && isValidated &&
                <>
                  <span
                    style={{ cursor: forPublish ? '' : 'pointer', userSelect: 'none', fontFamily: 'Nunito', color: '#4988CF', fontSize: 10, border: 'solid #4988CF 2px', borderRadius: 5, backgroundColor: '#E6F2FE' }}
                    className='ml-4 px-1'
                  >
                    Warm Exit
                  </span>
                </>
              }

              {eventType === 'Balk' &&
                <>
                  <span
                    style={{ cursor: forPublish ? '' : 'pointer', userSelect: 'none', fontFamily: 'Nunito', color: '#EBAE43', fontSize: 10, border: 'solid #EBAE43 2px', borderRadius: 5 }}
                    className='ml-4 px-1'
                  >
                    BALK
                  </span>
                </>
              }

              {eventType === 'Abandon' &&
                <>
                  <span
                    style={{ cursor: forPublish ? '' : 'pointer', userSelect: 'none', fontFamily: 'Nunito', color: '#D83231', fontSize: 10, border: 'solid #D83231 2px', borderRadius: 5 }}
                    className='ml-4 px-1'
                  >
                    ABANDON
                  </span>
                </>
              }

            </div>
            {((isValidated && !forPublish) || columnLength === props.row.DATA.filter(d => !d.NO_DATA)?.length) &&
              <div>
                <MoreHorizIcon onClick={handleClick} />
                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <div className='py-1'>
                    {isValidated && !forPublish &&
                      <div
                        className='flex items-center pl-2'
                        style={{ fontSize: 14, height: 30, width: 150, backgroundColor: '#D21716', color: 'white' }}
                        onClick={() => {
                          if (forPublish) {
                            alert('Cannot invalidate for publish sessions.')
                          } else {
                            props.setIdToInvalidate(props.row.JOURNEY_ID);
                          }

                          handleClose()
                        }}
                      >
                        Invalidate Session
                      </div>
                    }

                    {!isValidated && columnLength === props.row.DATA.filter(d => !d.NO_DATA)?.length &&
                      <div
                        className='flex items-center pl-2'
                        style={{ fontSize: 14, height: 30, width: 150, backgroundColor: 'green', color: 'white' }}
                        onClick={() => {
                          let setupSelected = {};
                          let selectedData = {...props.row, DATA: props.row.DATA.filter(d => !d.NO_DATA)};
                          for (let x = 0; x <= props.tableColumns.length - 1; x++) {
                              setupSelected[`${props.tableColumns[x].sceneName}`] = rowItems.find(data => data && data.SCENE_NAME === props.tableColumns[x].sceneName)?.SMALL_CIRCLE_ID
                          }
                          props.validate_data(setupSelected, 'Warm Exit', selectedData)

                          handleClose()
                        }}
                      >
                        Validate Session
                      </div>
                    }

                  </div>
                </Popover>
              </div>
            }
          </div>
        </TableCell>
      </TableRow>

      <StyledTableRow
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        style={{ borderTop: 0, backgroundColor: isValidated ? '#B4D9FD' : '' }}
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