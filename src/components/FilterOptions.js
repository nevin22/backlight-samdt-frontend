import * as React from 'react';
import axios from "axios";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';

import CustomDropdown from './CustomDropDown';
import IconNetwork from '../assets/icons/icon-netwok.svg';
import IconSite from '../assets/icons/icon-site.svg';

import backendService from '../services/backendService';

export default function BasicSelect(props) {
    const { selectedNetwork, selectedSite, setSite, setNetwork, optionNetworks, setOptionNetworks, optionSites, setOptionSites } = props;
    const [loading, setLoading] = useState(true);
    const [isLoadingSites, setIsLoadingSites] = useState(false);

    useEffect(() => {
        backendService.getNetworks()
            .then((res) => {
                setOptionNetworks(res);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                console.log(err)
            })

        if (Cookies.get('network')) {
            get_sites(Cookies.get('network'))
        }
    }, [])

    const get_sites = (network) => {
        setIsLoadingSites(true)

        backendService.getSites(network)
            .then((res) => {
                setOptionSites(res);
                setIsLoadingSites(false)
            })
            .catch(err => {
                setIsLoadingSites(false)
                console.log('err', err)
            })
    }

    const handleChangeNetwork = (network) => {
        setNetwork(network);
        Cookies.set('network', network);
        Cookies.set('site', '');
        setSite('')
        get_sites(network);
        
    };

    const handleChangeSite = (site) => {
        Cookies.set('site', site);
        setSite(site);
        props.fetchData();
    };


    return (
        <div>
            <div className='flex flex-row justify-center'>
                <CustomDropdown
                    defaultText={'Network'}
                    options={optionNetworks}
                    customIcon={IconNetwork}
                    customStyle={{ marginRight: -5 }}
                    onSelect={(network) => handleChangeNetwork(network)}
                    defaultOption={selectedNetwork}
                />
                < CustomDropdown
                    defaultText={'Site'}
                    options={optionSites}
                    customIcon={IconSite}
                    customStyle={{ backgroundColor: 'white', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, width: 230 }}
                    onSelect={(site) => handleChangeSite(site)}
                    defaultOption={selectedSite}
                />
            </div>
        </div>

    );
}