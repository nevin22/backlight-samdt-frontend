import axios from 'axios';
import moment from 'moment';
import Config from '../config'

const BASE_URL = Config.backend_link;

const backendService = {
    getDetections: async (date, filters) => {
        const desiredFormat = 'YYYY-MM-DD HH:mm:ss.SSS';
        try {
            const response = await axios.get(`${BASE_URL}/detections/samdt_list`, {
                params: {
                    startTime: (date && moment(date).startOf('day').format(desiredFormat)) || moment().subtract(1, 'days').startOf('day').format(desiredFormat),
                    endTime: (date && moment(date).endOf('day').format(desiredFormat)) || moment().subtract(1, 'days').startOf('day').format(desiredFormat),
                    filters
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching detections:", error);
            throw error;
        }
    },
    prepDataForSyncing: async (selectedDate, site, network) => {
        const desiredFormat = 'YYYY-MM-DD HH:mm:ss.SSS';
        let payload = selectedDate ? {
            startTime: (selectedDate && moment(selectedDate).startOf('day').format(desiredFormat)) || moment().subtract(1, 'days').startOf('day').format(desiredFormat),
            endTime: (selectedDate && moment(selectedDate).endOf('day').format(desiredFormat)) || moment().subtract(1, 'days').startOf('day').format(desiredFormat),
            site,
            network
        } : {
            site,
            network
        }

        try {
            const response = await axios.post(`${BASE_URL}/detections/sync_data_to_manifest`, {
                body: payload
            });
            return response.data;
        } catch (error) {
            console.error("Error while syncing:", error);
            throw error;
        }
    },
    getEditList: async (data, tableColumns) => {
        try {
            const response = await axios.get(`${BASE_URL}/detections/samdt_edit_list`, {
                params: {
                    journey_id: data.JOURNEY_ID,
                    data: data.DATA,
                    tableColumns: tableColumns
                }
            })
            return response.data;
        } catch (error) {
            console.error("Error while fetching edit list:", error);
            throw error;
        }
    },
    validateData: async (ids, eventType, selectedEditData) => {
        try {
            const response = await axios.post(`${BASE_URL}/detections/validate_data`, {
                body: {
                    selected_data: selectedEditData,
                    small_circle_ids: ids,
                    // isValidated: !!selectedEditData.DATA.find(d => d.IS_VALIDATED),
                    eventType
                }
            })
            return response.data;
        } catch (error) {
            console.error("Error while validating data:", error.response.data.message);
            throw error;
        }
    },
    invalidateData: async (id) => {
        try {
            const response = await axios.post(`${BASE_URL}/detections/invalidate_data`, {
                body: {
                    journey_id: id,
                }
            })
            return response.data
        } catch (error) {
            console.error("Error while invalidating data:", error);
            throw error;
        }
    },
    getNetworks: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/detections/get_network_options`)
            return response.data.data.NETWORKS;
        } catch (error) {
            console.log('get networks err - ', error);
            throw error;
        }
    },
    getSites: async (network) => {
        try {
            const response = await axios.get(`${BASE_URL}/detections/get_site_options`, { params: { network } })
            return response.data.data.SITES;
        } catch (error) {
            console.log('get networks err - ', error);
            throw error;
        }
    }
};

export default backendService;