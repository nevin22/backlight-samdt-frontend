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
import Checkbox from '@mui/material/Checkbox';

import './table.css'

import Paper from "@mui/material/Paper";
import moment from 'moment';

export default function EditModal(props) {
    const eventTypes = [
        'Warm Exit',
        'Balk',
        'Abandon'
    ]
    const [scroll, setScroll] = React.useState('paper');
    const [previewImage, setPreviewImage] = React.useState(null);
    const [openImagePreview, setOpenImagePreview] = React.useState(false);
    const [eventType, setEventType] = React.useState(eventTypes[0])
    const [isBalk, setIsBalk] = React.useState(false);
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
        // setIsBalk(!!props?.selectedEditData?.DATA.find(d => d.BA_TYPE === 'balk'))

        setEventType(props?.selectedEditData?.DATA[0].BA_TYPE || eventTypes[0])
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

    const setEventTypeFunc = (eventType) => {
        // removed selected items for fov which originally does not have a data
        let sceneNames = props.tableColumns.map(d => d.sceneName);
        let originalDataSceneNames = props?.selectedEditData?.DATA.map(d => d.SCENE_NAME)
        let itemsToRemove = sceneNames.filter(d => !originalDataSceneNames.includes(d));
        setSelectedItemIds((items) => {
            itemsToRemove.forEach((scene) => {
                items[`${scene}`] = '';
            })
            return items
        })
        setEventType(eventType);
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
                onClose={() => {
                    // setIsBalk(false);
                    setEventType(eventTypes[0])
                    props.closeModal();
                }}
                scroll={scroll}
                maxWidth={'xl'}
                fullWidth
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
                                                        key={index}
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
                                                <React.Fragment key={index}>
                                                    <TableRow
                                                        key={ index}
                                                        ref={index === (insertPoint - 1) ? elementRef : null}
                                                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                                        style={{ borderTop: 0 }}
                                                    >
                                                        {props.tableColumns.map((tableC, tIndex) => {
                                                            let rowData = row.find((d => (d && d.SCENE_NAME) === tableC.sceneName));
                                                            let imageUrl = rowData ? (rowData.defaultSelected ? (rowData.VALIDATED_IMAGE_URL || rowData.IMAGE_URL || default_image) : rowData.IMAGE_URL) : default_image;
                                                            let enterTimestamp = rowData && (rowData.defaultSelected ? (rowData.VALIDATED_ENTER_TIMESTAMP || rowData.ENTER_TIMESTAMP) : rowData.ENTER_TIMESTAMP);
                                                            let exitTimestamp = rowData && (rowData.defaultSelected ? (rowData.VALIDATED_EXIT_TIMESTAMP || rowData.EXIT_TIMESTAMP) : rowData.EXIT_TIMESTAMP);

                                                            let originalData = props?.selectedEditData?.DATA;
                                                            let select_disabled = false;
                                                            if ((eventType === eventTypes[1]) && !originalData.find(d => d.SCENE_NAME === tableC.sceneName)) {
                                                                select_disabled = true;
                                                            } else if (eventType === eventTypes[2]) {
                                                                select_disabled = tIndex === 0;
                                                            }

                                                            return (
                                                                <TableCell
                                                                    key={tIndex}
                                                                    align="left"
                                                                    width={`${100 / props.tableColumns.length}%`}
                                                                    style={{ fontFamily: "Nunito", fontWeight: "bold", backgroundColor: select_disabled ? '#A9A9A9' : 'white' }}
                                                                >
                                                                    {rowData &&
                                                                        <>
                                                                            <div style={{ position: 'relative' }}>
                                                                                <img
                                                                                    onClick={(props.isValidating || !rowData.IMAGE_URL || select_disabled) ? () => { } : () => {
                                                                                        return handleSelect(rowData?.SMALL_CIRCLE_ID, rowData.SCENE_NAME)
                                                                                    }}
                                                                                    alt={`${rowData.sceneName}_image`}
                                                                                    className={`samdt_img ${(imageUrl) ? 'click_icon' : ''} ${selectedItemIds[`${rowData.SCENE_NAME}`] === rowData?.SMALL_CIRCLE_ID ? 'glowing' : ''}`}
                                                                                    style={{ opacity: select_disabled ? '65%' : '100%' }}
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
                                                                                {
                                                                                    moment(enterTimestamp, 'YYYY-MM-DD HH:mm:ss.SSS').format('YYYY/MM/DD - ')
                                                                                }
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
                <DialogActions style={{ justifyContent: 'space-between' }}>
                    <div>
                        <Checkbox checked={eventType === eventTypes[0]} onClick={() => setEventTypeFunc(eventTypes[0])} />
                        <span style={{ fontFamily: 'Nunito', fontWeight: 'bold' }}>Warm Exit</span>
                        <Checkbox checked={eventType === eventTypes[1]} onClick={() => setEventTypeFunc(eventTypes[1])} />
                        <span style={{ fontFamily: 'Nunito', fontWeight: 'bold' }}>Balk</span>
                        <Checkbox checked={eventType === eventTypes[2]} onClick={() => setEventTypeFunc(eventTypes[2])} />
                        <span style={{ fontFamily: 'Nunito', fontWeight: 'bold' }}>Abandon</span>
                    </div>
                    <div>
                        <Button
                            variant="contained"
                            style={{ fontFamily: 'Nunito', opacity: props.isValidating ? '50%' : '100%', backgroundColor: '#F0F3F5', color: 'black' }}
                            onClick={props.isValidating ? () => { } : () => {
                                setEventType('Warm Exit')
                                props.closeModal();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            style={{ fontFamily: 'Nunito', opacity: props.isValidating ? '50%' : '100%', marginLeft: 15 }}
                            onClick={props.isValidating ? () => { } : () => props.validate_data(selectedItemIds, eventType)}
                        >
                            Apply
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}