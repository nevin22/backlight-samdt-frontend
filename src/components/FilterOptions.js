import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import axios from "axios";
import { useEffect, useState } from "react";
import CircularProgress from '@mui/material/CircularProgress';

export default function BasicSelect(props) {
    const { selectedNetwork, selectedSite, setSite, setNetwork, optionNetworks, setOptionNetworks, optionSites, setOptionSites } = props;

    const [loading, setLoading] = useState(true);

    const [isLoadingSites, setIsLoadingSites] = useState(false);

    useEffect(() => {
        axios
            .get(`http://localhost:8080/detections/get_network_options`, {
            }).then((res) => {
                setOptionNetworks(res.data.data.NETWORKS);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                console.log(err)
            })
    }, [])

    const get_sites = (network) => {
        setIsLoadingSites(true)
        axios
        .get(`http://localhost:8080/detections/get_site_options`, {
            params: {
                network
            }
        }).then((res) => {
            setOptionSites(res.data.data.SITES);
            setIsLoadingSites(false)
        })
        .catch((err) => {
            setIsLoadingSites(false)
            console.log('err', err)
        })
    }
    const handleChangeNetwork = (event) => {
        setNetwork(event.target.value);
        get_sites(event.target.value);
    };

    const handleChangeSite = (event) => {
        setSite(event.target.value);
    };


    return (
        <div style={{ padding: 25, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <Box sx={{ minWidth: 450 }}>
                {loading &&
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 250 }}>
                        <CircularProgress />
                    </div>
                }
                {!loading &&
                    <React.Fragment>
                        <FormControl fullWidth style={{ marginTop: 20 }}>
                            <InputLabel id="network-select-label">Network</InputLabel>
                            <Select
                                labelId="network-select-label"
                                id="network-select"
                                value={selectedNetwork}
                                label="Network"
                                onChange={handleChangeNetwork}
                            >
                                {optionNetworks && optionNetworks.map((item, i) => {
                                    return (
                                        <MenuItem key={i} value={item}>{item}</MenuItem>
                                    )
                                })}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth style={{ marginTop: 20 }}>
                            <InputLabel id="site-select-label">Site</InputLabel>
                            <Select
                                labelId="site-select-label"
                                id="site-select"
                                value={selectedSite}
                                label="Site"
                                onChange={handleChangeSite}
                                disabled={!selectedNetwork || (selectedNetwork && isLoadingSites)}
                            >
                                {optionSites && optionSites.map((item, i) => {
                                    return (
                                        <MenuItem key={i} value={item}>{item}</MenuItem>
                                    )
                                })}
                            </Select>
                        </FormControl>
                    </React.Fragment>
                }

            </Box>

            {!loading &&
                <Button
                    style={{ fontFamily: 'Nunito', marginBottom: 10 }}
                    variant="contained"
                    size="small"
                    onClick={() => {
                        props.fetchData();
                        props.closeDrawer();
                    }}
                    disabled={!selectedNetwork || !selectedSite}
                >
                    Apply
                </Button>
            }

        </div>

    );
}