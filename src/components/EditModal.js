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
import CircularProgress from '@mui/material/CircularProgress';
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
    let puw = props?.selectedEditData?.DATA.find(data => data && data.SCENE_NAME === 'Scene Pull Up Window');
    let ylane = props?.selectedEditData?.DATA.find(data => data && data.SCENE_NAME === 'Scene Y Lane Merge');
    let orderpoint = props?.selectedEditData?.DATA.find(data => data && data.SCENE_NAME === 'Scene Order Point Outside Lane');
    let entrance = props?.selectedEditData?.DATA.find(data => data && data.SCENE_NAME === 'Scene Entrance Outside Lane');
    let tableItems = [...props.editData];

    let aboveSelectedTimestamp = tableItems.filter((d => d.find(s => s && s.SCENE_NAME === 'Scene Pull Up Window').ENTER_TIMESTAMP > puw.ENTER_TIMESTAMP));
    let insertPoint = aboveSelectedTimestamp && aboveSelectedTimestamp.length || 0;

    // for editing valited session :(
    if (puw) {
        puw.defaultSelected = true;
        ylane.defaultSelected = true;
        orderpoint.defaultSelected = true;
        entrance.defaultSelected = true;
    }

    tableItems.splice(insertPoint, 0, [puw, ylane, orderpoint, entrance])

    const scrollToElement = () => {
        // Scroll to the element
        if (elementRef.current) {
            elementRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    let [selectedItemIds, setSelectedItemIds] = useState(null);

    useEffect(() => {
        setSelectedItemIds({
            puw: puw?.SMALL_CIRCLE_ID,
            ylane: ylane?.SMALL_CIRCLE_ID,
            orderpoint: orderpoint?.SMALL_CIRCLE_ID,
            entrance: entrance?.SMALL_CIRCLE_ID
        })
    }, [props.selectedEditData])

    useEffect(() => {
        if (props.fetchingEditData === false) {
            setTimeout(() => {
                scrollToElement();
            }, 300)
        }
    }, [props.fetchingEditData])

    const handleSelect = (id, pov) => {
        switch (pov) {
            case 'puw':
                setSelectedItemIds((val) => ({
                    ...val,
                    puw: id
                }))
                break;
            case 'ylane':
                setSelectedItemIds((val) => ({
                    ...val,
                    ylane: id
                }))
                break;
            case 'orderpoint':
                setSelectedItemIds((val) => ({
                    ...val,
                    orderpoint: id
                }))
                break;
            case 'entrance':
                setSelectedItemIds((val) => ({
                    ...val,
                    entrance: id
                }))
                break;
            default:
                break;
        }
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
                                            <TableCell
                                                style={{ fontFamily: "Nunito", fontWeight: "bold", backgroundColor: '#E7EBF0', width: '25%' }}
                                                align="left"
                                            >
                                                PUW
                                            </TableCell>
                                            <TableCell
                                                style={{ fontFamily: "Nunito", fontWeight: "bold", backgroundColor: '#E7EBF0', width: '25%' }}
                                                align="left"
                                            >
                                                YLANE
                                            </TableCell>
                                            <TableCell
                                                style={{ fontFamily: "Nunito", fontWeight: "bold", backgroundColor: '#E7EBF0', width: '25%' }}
                                                align="left"
                                            >
                                                Order Point
                                            </TableCell>
                                            <TableCell
                                                style={{ fontFamily: "Nunito", fontWeight: "bold", backgroundColor: '#E7EBF0', width: '25%' }}
                                                align="left"
                                            >
                                                Entrance
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {tableItems.map((row, index) => {
                                            let _puw = row.find(data => data && data.SCENE_NAME === 'Scene Pull Up Window');
                                            let _ylane = row.find(data => data && data.SCENE_NAME === 'Scene Y Lane Merge');
                                            let _orderpoint = row.find(data => data && data.SCENE_NAME === 'Scene Order Point Outside Lane');
                                            let _entrance = row.find(data => data && data.SCENE_NAME === 'Scene Entrance Outside Lane');

                                            let puw_image = '';
                                            let ylane_image = '';
                                            let orderpoint_image = '';
                                            let entrance_image = '';
                                            
                                            let ylane_enter_timestamp = '';
                                            let ylane_exit_timestamp = '';
                                            let puw_enter_timestamp = '';
                                            let puw_exit_timestamp = '';
                                            let orderpoint_enter_timestamp = '';
                                            let orderpoint_exit_timestamp = '';
                                            let entrance_enter_timestamp = '';
                                            let entrance_exit_timestamp = '';

                                            if (_puw) { // show validated image url if it is the selected session and it has validate image url
                                                puw_image = _puw ? (_puw.defaultSelected ? (_puw.VALIDATED_IMAGE_URL || _puw.IMAGE_URL) : _puw.IMAGE_URL) : default_image;
                                                puw_enter_timestamp = _puw && (_puw.defaultSelected ? (_puw.VALIDATED_ENTER_TIMESTAMP || _puw.ENTER_TIMESTAMP) : _puw.ENTER_TIMESTAMP);
                                                puw_exit_timestamp = _puw && (_puw.defaultSelected ? (_puw.VALIDATED_EXIT_TIMESTAMP || _puw.EXIT_TIMESTAMP) : _puw.EXIT_TIMESTAMP);

                                                ylane_image = _ylane ? (_ylane.defaultSelected ? (_ylane.VALIDATED_IMAGE_URL || _ylane.IMAGE_URL) : _ylane.IMAGE_URL) : default_image;
                                                ylane_enter_timestamp = _ylane && (_ylane.defaultSelected ? (_ylane.VALIDATED_ENTER_TIMESTAMP || _ylane.ENTER_TIMESTAMP) : _ylane.ENTER_TIMESTAMP);
                                                ylane_exit_timestamp = _ylane && (_ylane.defaultSelected ? (_ylane.VALIDATED_EXIT_TIMESTAMP || _ylane.EXIT_TIMESTAMP) : _ylane.EXIT_TIMESTAMP);
                                                
                                                orderpoint_image = _orderpoint ? (_orderpoint.defaultSelected ? (_orderpoint.VALIDATED_IMAGE_URL || _orderpoint.IMAGE_URL) : _orderpoint.IMAGE_URL) : default_image;
                                                orderpoint_enter_timestamp = _orderpoint && (_orderpoint.defaultSelected ? (_orderpoint.VALIDATED_ENTER_TIMESTAMP || _orderpoint.ENTER_TIMESTAMP) : _orderpoint.ENTER_TIMESTAMP);
                                                orderpoint_exit_timestamp = _orderpoint && (_orderpoint.defaultSelected ? (_orderpoint.VALIDATED_EXIT_TIMESTAMP || _orderpoint.EXIT_TIMESTAMP) : _orderpoint.EXIT_TIMESTAMP);
                                                
                                                entrance_image = _entrance ? (_entrance.defaultSelected ? (_entrance.VALIDATED_IMAGE_URL|| _entrance.IMAGE_URL) : _entrance.IMAGE_URL) : default_image;
                                                entrance_enter_timestamp = _entrance && (_entrance.defaultSelected ? (_entrance.VALIDATED_ENTER_TIMESTAMP || _entrance.ENTER_TIMESTAMP) : _entrance.ENTER_TIMESTAMP);
                                                entrance_exit_timestamp = _entrance && (_entrance.defaultSelected ? (_entrance.VALIDATED_EXIT_TIMESTAMP || _entrance.EXIT_TIMESTAMP) : _entrance.EXIT_TIMESTAMP);
                                            }
                                            return (
                                                // <TableItem
                                                //     validating={props.isValidating}
                                                //     row={item}
                                                //     selectedItemIds={selectedItemIds}
                                                //     handleSelect={(id, pov) => handleSelect(id, pov)}
                                                // />
                                                <React.Fragment key={row.JOURNEY_ID}>
                                                    <TableRow
                                                        ref={index === (insertPoint - 1) ? elementRef : null}
                                                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                                        style={{ borderTop: 0 }}
                                                    >
                                                        <TableCell
                                                            style={{ fontFamily: "Nunito", fontWeight: "bold" }}
                                                            align="left"
                                                            width={'25%'}
                                                        >
                                                            {_puw &&
                                                                <>
                                                                    <div style={{ position: 'relative' }}>
                                                                        <img
                                                                            // onClick={props.isValidating ? () => { } : () => handleSelect(_puw?.SMALL_CIRCLE_ID, 'puw')}
                                                                            alt="puw_image"
                                                                            className={`samdt_img click_icon ${selectedItemIds?.puw === _puw?.SMALL_CIRCLE_ID ? 'glowing' : ''}`}
                                                                            src={puw_image}
                                                                            style={{ opacity: selectedItemIds?.puw === _puw?.SMALL_CIRCLE_ID ? '100%' : '50%' }}
                                                                        />
                                                                        {_puw.IMAGE_URL &&
                                                                            <VisibilityIcon
                                                                                onClick={() => {
                                                                                    setOpenImagePreview(true);
                                                                                    setPreviewImage(puw_image)
                                                                                }}
                                                                                style={{ color: 'white', position: 'absolute', top: 10, left: 10 }}
                                                                            />
                                                                        }
                                                                    </div>
                                                                    <div style={{ float: 'right', fontSize: 12 }}>
                                                                        <span>IN: {moment(_puw.ENTER_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A,')}</span>
                                                                        <span style={{ marginLeft: 5 }}>OUT: {moment(_puw.EXIT_TIMESTAMP, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A')} </span>
                                                                    </div>
                                                                </>

                                                            }
                                                        </TableCell>

                                                        <TableCell
                                                            style={{ fontFamily: "Nunito", fontWeight: "bold" }}
                                                            width={'25%'}
                                                            align="left"
                                                        >
                                                            {_ylane &&
                                                                <>
                                                                    <div style={{ position: 'relative' }}>
                                                                        <img
                                                                            onClick={(props.isValidating || !_ylane.IMAGE_URL) ? () => { } : () => handleSelect(_ylane?.SMALL_CIRCLE_ID, 'ylane')}
                                                                            alt="ylane_image"
                                                                            className={`samdt_img ${_ylane.IMAGE_URL ? 'click_icon' : ''} ${selectedItemIds?.ylane === _ylane?.SMALL_CIRCLE_ID ? 'glowing' : ''}`}
                                                                            src={ylane_image}
                                                                        />
                                                                        {_ylane.IMAGE_URL &&
                                                                            <VisibilityIcon
                                                                                onClick={() => {
                                                                                    setOpenImagePreview(true);
                                                                                    setPreviewImage(ylane_image)
                                                                                }}
                                                                                style={{ color: 'white', position: 'absolute', top: 10, left: 10 }}
                                                                            />
                                                                        }
                                                                    </div>

                                                                    <div style={{ float: 'right', fontSize: 12 }}>
                                                                        <span>IN: {moment(ylane_enter_timestamp, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A,')}</span>
                                                                        <span style={{ marginLeft: 5 }}>OUT: {moment(ylane_exit_timestamp, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A')}</span>
                                                                    </div>
                                                                </>
                                                            }

                                                        </TableCell>

                                                        <TableCell width={'25%'} align="left" style={{ fontFamily: "Nunito", fontWeight: "bold" }}>
                                                            {_orderpoint &&
                                                                <>
                                                                    <div style={{ position: 'relative' }}>
                                                                        <img
                                                                            onClick={(props.isValidating || !_orderpoint.IMAGE_URL) ? () => { } : () => handleSelect(_orderpoint?.SMALL_CIRCLE_ID, 'orderpoint')}
                                                                            alt="orderpoint_image"
                                                                            className={`samdt_img ${_orderpoint.IMAGE_URL ? 'click_icon' : ''} ${selectedItemIds?.orderpoint === _orderpoint?.SMALL_CIRCLE_ID ? 'glowing' : ''}`}
                                                                            src={orderpoint_image}
                                                                        />
                                                                        {_orderpoint.IMAGE_URL &&
                                                                            <VisibilityIcon
                                                                                onClick={() => {
                                                                                    setOpenImagePreview(true);
                                                                                    setPreviewImage(orderpoint_image)
                                                                                }}
                                                                                style={{ color: 'white', position: 'absolute', top: 10, left: 10 }}
                                                                            />
                                                                        }
                                                                    </div>

                                                                    <div style={{ float: 'right', fontSize: 12 }}>
                                                                        <span>IN: {moment(orderpoint_enter_timestamp, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A,')}</span>
                                                                        <span style={{ marginLeft: 5 }}>OUT: {moment(orderpoint_exit_timestamp, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A')}</span>
                                                                    </div>
                                                                </>

                                                            }
                                                        </TableCell>

                                                        <TableCell align="left" width={'25%'} style={{ fontFamily: "Nunito", fontWeight: "bold" }}>
                                                            {_entrance &&
                                                                <>
                                                                    <div style={{ position: 'relative' }}>
                                                                        <img
                                                                            onClick={(props.isValidating || !_entrance.IMAGE_URL) ? () => { } : () => handleSelect(_entrance?.SMALL_CIRCLE_ID, 'entrance')}
                                                                            alt="entrance_image"
                                                                            className={`samdt_img ${_entrance.IMAGE_URL ? 'click_icon' : ''} ${selectedItemIds?.entrance === _entrance?.SMALL_CIRCLE_ID ? 'glowing' : ''}`}
                                                                            src={entrance_image}
                                                                        />
                                                                        {_entrance.IMAGE_URL &&
                                                                            <VisibilityIcon
                                                                                onClick={() => {
                                                                                    setOpenImagePreview(true);
                                                                                    setPreviewImage(entrance_image)
                                                                                }}
                                                                                style={{ color: 'white', position: 'absolute', top: 10, left: 10 }}
                                                                            />
                                                                        }
                                                                    </div>
                                                                    <div style={{ float: 'right', fontSize: 12 }}>
                                                                        <span>IN: {moment(entrance_enter_timestamp, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A,')}</span>
                                                                        <span style={{ marginLeft: 5 }}>OUT: {moment(entrance_exit_timestamp, 'YYYY-MM-DD HH:mm:ss.SSS').format('hh:mm:ss A')}</span>
                                                                    </div>
                                                                </>

                                                            }
                                                        </TableCell>
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