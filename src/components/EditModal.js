import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Player } from "@lottiefiles/react-lottie-player";
import LoadingAnimation from '../assets/lottie/lf30_xhjuaccs.json';
import { useState, useEffect, useRef } from "react";
import default_image from '../assets/no_image.jpg';
import LinearProgress from '@mui/material/LinearProgress';
import VisibilityIcon from '@mui/icons-material/Visibility';

import './table.css'

import Paper from "@mui/material/Paper";
import moment from 'moment';

export default function ScrollDialog(props) {
    const [scroll, setScroll] = React.useState('paper');
    const [previewImage, setPreviewImage] = React.useState(null);
    const [openImagePreview, setOpenImagePreview] = React.useState(false);
    const elementRef = useRef(null);
    let setupSelected = {};
    
    for (let x = 0; x <= props.tableColumns.length - 1; x++) {
        setupSelected[`${props.tableColumns[x].sceneName}`] = {
            ...props?.selectedEditData?.DATA.find(data => data && data.SCENE_NAME === props.tableColumns[x].sceneName),
            defaultSelected: true
        }
    }

    let tableItems = [...props.editData];
    let insertIndex = tableItems.map(d => d[0]).findIndex(data => {
        return data?.ENTER_TIMESTAMP < Object.values(setupSelected)[0].ENTER_TIMESTAMP
    })

    let insertPoint = (tableItems.length / 2) || 0;

    tableItems.splice(insertIndex, 0, Object.values(setupSelected))

    const scrollToElement = () => {
        // Scroll to the element
        if (elementRef.current) {
            elementRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    let [selectedItemIds, setSelectedItemIds] = useState(null);

    useEffect(() => {
        let setupSelected = {};

        for (let x = 0; x <= props.tableColumns.length - 1; x++) {
            setupSelected[`${props.tableColumns[x].sceneName}`] = props?.selectedEditData?.DATA.find(data => data && data.SCENE_NAME === props.tableColumns[x].sceneName)?.SMALL_CIRCLE_ID
        }
        setSelectedItemIds(setupSelected)
    }, [props.selectedEditData])

    useEffect(() => {
        if (props.fetchingEditData === false) {
            setTimeout(() => {
                scrollToElement();
            }, 300)
        }
    }, [props.fetchingEditData])

    const handleSelect = (id, pov) => {
        setSelectedItemIds((val) => ({
            ...val,
            [`${pov}`]: id
        }))
    }

    return (
        <React.Fragment>
            <Dialog
                open={openImagePreview}
                onClose={() => setOpenImagePreview(false)}
                maxWidth={'lg'}
            >
                <DialogContent>
                    <img
                        style={{ height: 540, width: 960 }}
                        alt="hehe_image"
                        src={previewImage}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={props.openEditModal}
                onClose={() => props.closeModal()}
                scroll={scroll}
                maxWidth={'xl'}
                fullWidth={'xl'}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle id="scroll-dialog-title" style={{ fontFamily: 'Nunito', fontSize: 14, fontWeight: 'bold' }}>
                    Edit Session {props?.selectedEditData?.JOURNEY_ID}
                    <div>
                        {props.isValidating && <LinearProgress />}
                    </div>
                </DialogTitle>
                <DialogContent dividers={scroll === 'paper'}>
                    {props.fetchingEditData ?
                        <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Player
                                autoplay
                                loop
                                src={LoadingAnimation}
                                style={{ height: '200px', width: '200px' }}
                            />
                        </div>
                        :
                        <Paper>
                            <TableContainer className="edit-table-container">
                                <Table stickyHeader aria-label="sticky table">
                                    <TableHead>
                                        <TableRow>
                                            {props.tableColumns.map((column, index) => {
                                                return (
                                                    <TableCell
                                                        style={{ fontFamily: "Nunito", fontWeight: "bold", backgroundColor: '#E7EBF0', width: `${100 / props.tableColumns.length}%` }}
                                                        align="left"
                                                    >
                                                        {column.sceneName}
                                                    </TableCell>
                                                )
                                            })
                                            }
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {tableItems.map((row, index) => {
                                            return (
                                                <React.Fragment key={row.JOURNEY_ID}>
                                                    <TableRow
                                                        ref={index === (insertPoint - 1) ? elementRef : null}
                                                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                                        style={{ borderTop: 0 }}
                                                    >   
                                                        {props.tableColumns.map((tableC) => {
                                                            let rowData = row.find((d => (d && d.SCENE_NAME) === tableC.sceneName));
                                                            let imageUrl = rowData ? (rowData.defaultSelected ? (rowData.VALIDATED_IMAGE_URL || rowData.IMAGE_URL) : rowData.IMAGE_URL) : default_image;
                                                            let enterTimestamp = rowData && (rowData.defaultSelected ? (rowData.VALIDATED_ENTER_TIMESTAMP || rowData.ENTER_TIMESTAMP) : rowData.ENTER_TIMESTAMP);
                                                            let exitTimestamp = rowData && (rowData.defaultSelected ? (rowData.VALIDATED_EXIT_TIMESTAMP || rowData.EXIT_TIMESTAMP) : rowData.EXIT_TIMESTAMP);
                                                            return (
                                                                <TableCell align="left" width={'25%'} style={{ fontFamily: "Nunito", fontWeight: "bold" }}>
                                                                    {rowData &&
                                                                        <>
                                                                            <div style={{ position: 'relative' }}>
                                                                                <img
                                                                                    onClick={(props.isValidating || !rowData.IMAGE_URL) ? () => { } : () => {
                                                                                        return handleSelect(rowData?.SMALL_CIRCLE_ID, rowData.SCENE_NAME)
                                                                                    }}
                                                                                    alt={`${rowData.sceneName}_image`}
                                                                                    className={`samdt_img ${imageUrl ? 'click_icon' : ''} ${selectedItemIds[`${rowData.SCENE_NAME}`] === rowData?.SMALL_CIRCLE_ID ? 'glowing' : ''}`}
                                                                                    src={imageUrl}
                                                                                />
                                                                                {rowData.IMAGE_URL &&
                                                                                    <VisibilityIcon
                                                                                        onClick={() => {
                                                                                            setOpenImagePreview(true);
                                                                                            setPreviewImage(imageUrl)
                                                                                        }}
                                                                                        style={{ color: 'white', position: 'absolute', top: 10, left: 10 }}
                                                                                    />
                                                                                }

                                                                                {rowData && rowData.JOURNEY_ID === null &&
                                                                                    <div style={{ position: 'absolute', top: 10, right: 10 }}>
                                                                                        <span style={{ fontSize: 12, fontFamily: 'Nunito' }}>
                                                                                            No Journey Id
                                                                                        </span>
                                                                                    </div>
                                                                                }
                                                                            </div>
                                                                            <div style={{ float: 'right', fontSize: 12 }}>
                                                                                <span>IN: {moment(enterTimestamp, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A,')}</span>
                                                                                <span style={{ marginLeft: 5 }}>OUT: {moment(exitTimestamp, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A')}</span>
                                                                            </div>
                                                                        </>
                                                                    }

                                                                </TableCell>
                                                            )
                                                        })
                                                        }
                                                    </TableRow>
                                                </React.Fragment>
                                            )
                                        })
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    }
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        style={{ fontFamily: 'Nunito', opacity: props.isValidating ? '50%' : '100%', backgroundColor: '#F0F3F5', color: 'black' }}
                        onClick={props.isValidating ? () => { } : () => props.closeModal()}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        style={{ fontFamily: 'Nunito', opacity: props.isValidating ? '50%' : '100%' }}
                        onClick={props.isValidating ? () => { } : () => props.validate_data(selectedItemIds)}
                    >
                        Apply
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}


// const TableItem = (props) => {
//     let puw = props.row.find(data => data && data.SCENE_NAME === 'Scene Pull Up Window');
//     let ylane = props.row.find(data => data && data.SCENE_NAME === 'Scene Y Lane Merge');
//     let orderpoint = props.row.find(data => data && data.SCENE_NAME === 'Scene Order Point Outside Lane');
//     let entrance = props.row.find(data => data && data.SCENE_NAME === 'Scene Entrance Outside Lane');

//     return (
//         <React.Fragment key={props.row.JOURNEY_ID}>
//             <TableRow
//                 sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
//                 style={{ borderTop: 0 }}
//             >
//                 <TableCell
//                     style={{ fontFamily: "Nunito", fontWeight: "bold" }}
//                     align="left"
//                     width={'25%'}
//                 >
//                     {puw &&
//                         <>
//                             <img
//                                 onClick={props.validating ? () => { } : () => props.handleSelect(puw?.SMALL_CIRCLE_ID, 'puw')}
//                                 alt="puw_image"
//                                 className={`samdt_img click_icon ${props.selectedItemIds?.puw === puw?.SMALL_CIRCLE_ID ? 'glowing' : ''}`}
//                                 src={(puw && puw.IMAGE_URL) || null}
//                             />

//                             <div style={{ float: 'right', fontSize: 12 }}>
//                                 <span>IN: {moment(puw.ENTER_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A,')}</span>
//                                 <span style={{ marginLeft: 5 }}>OUT: {moment(puw.EXIT_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A')} </span>
//                             </div>
//                         </>

//                     }
//                 </TableCell>

//                 <TableCell
//                     style={{ fontFamily: "Nunito", fontWeight: "bold" }}
//                     width={'25%'}
//                     align="left"
//                 >
//                     {ylane &&
//                         <>
//                             <img
//                                 onClick={props.validating ? () => { } : () => props.handleSelect(ylane?.SMALL_CIRCLE_ID, 'ylane')}
//                                 alt="ylane_image"
//                                 className={`samdt_img click_icon ${props.selectedItemIds?.ylane === ylane?.SMALL_CIRCLE_ID ? 'glowing' : ''}`}
//                                 src={(ylane && ylane.IMAGE_URL) || null}
//                             />

//                             <div style={{ float: 'right', fontSize: 12 }}>
//                                 <span>IN: {moment(ylane.ENTER_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A,')}</span>
//                                 <span style={{ marginLeft: 5 }}>OUT: {moment(ylane.EXIT_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A')}</span>
//                             </div>
//                         </>

//                     }

//                 </TableCell>

//                 <TableCell width={'25%'} align="left" style={{ fontFamily: "Nunito", fontWeight: "bold" }}>
//                     {orderpoint &&
//                         <>
//                             <img
//                                 onClick={props.validating ? () => { } : () => props.handleSelect(orderpoint?.SMALL_CIRCLE_ID, 'orderpoint')}
//                                 alt="orderpoint_image"
//                                 className={`samdt_img click_icon ${props.selectedItemIds?.orderpoint === orderpoint?.SMALL_CIRCLE_ID ? 'glowing' : ''}`}
//                                 src={(orderpoint && orderpoint.IMAGE_URL) || null}
//                             />

//                             <div style={{ float: 'right', fontSize: 12 }}>
//                                 <span>IN: {moment(orderpoint.ENTER_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A,')}</span>
//                                 <span style={{ marginLeft: 5 }}>OUT: {moment(orderpoint.EXIT_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A')}</span>
//                             </div>
//                         </>

//                     }
//                 </TableCell>

//                 <TableCell align="left" width={'25%'} style={{ fontFamily: "Nunito", fontWeight: "bold" }}>
//                     {entrance &&
//                         <>
//                             <img
//                                 onClick={props.validating ? () => { } : () => props.handleSelect(entrance?.SMALL_CIRCLE_ID, 'entrance')}
//                                 alt="entrance_image"
//                                 className={`samdt_img click_icon ${props.selectedItemIds?.entrance === entrance?.SMALL_CIRCLE_ID ? 'glowing' : ''}`}
//                                 src={(entrance && entrance.IMAGE_URL) || null}
//                             />

//                             <div style={{ float: 'right', fontSize: 12 }}>
//                                 <span>IN: {moment(entrance.ENTER_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A,')}</span>
//                                 <span style={{ marginLeft: 5 }}>OUT: {moment(entrance.EXIT_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A')}</span>
//                             </div>
//                         </>

//                     }
//                 </TableCell>
//             </TableRow>
//         </React.Fragment>
//     );
// };