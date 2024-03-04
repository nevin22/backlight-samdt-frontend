import axios from 'axios';
import moment from 'moment';
import Config from '../config'

const BASE_URL = Config.backend_link;

const getDetections = async ({ queryKey }) => {
    let [_key, date, filters] = queryKey;
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
  };

// const backendService = {
//     getDetections: async (date, filters) => {
//         const desiredFormat = 'YYYY-MM-DD HH:mm:ss.SSS';
//         try {
//             const response = await axios.get(`${BASE_URL}/detections/samdt_list`, {
//                 params: {
//                     startTime: (date && moment(date).startOf('day').format(desiredFormat)) || moment().subtract(1, 'days').startOf('day').format(desiredFormat),
//                     endTime: (date && moment(date).endOf('day').format(desiredFormat)) || moment().subtract(1, 'days').startOf('day').format(desiredFormat),
//                     filters
//                 }
//             });
//             return response.data;
//         } catch (error) {
//             console.error("Error fetching detections:", error);
//             throw error;
//         }
//     },
//     prepDataForSyncing: async () => {
//         try {
//             const response = await axios.post(`${BASE_URL}/detections/sync_data_to_manifest`);
//             return response.data;
//         } catch (error) {
//             console.error("Error while syncing:", error);
//             throw error;
//         }
//     },
//     getEditList: async (data, tableColumns) => {
//         try {
//             const response = await axios.get(`${BASE_URL}/detections/samdt_edit_list`, {
//                 params: {
//                     journey_id: data.JOURNEY_ID,
//                     data: data.DATA,
//                     tableColumns: tableColumns
//                 }
//             })
//             return response.data;
//         } catch (error) {
//             console.error("Error while fetching edit list:", error);
//             throw error;
//         }
//     },
//     validateData: async (ids, eventType, selectedEditData) => {
//         try {
//             const response = await axios.post(`${BASE_URL}/detections/validate_data`, {
//                 body: {
//                     selected_data: selectedEditData,
//                     small_circle_ids: ids,
//                     isValidated: !!selectedEditData.DATA.find(d => d.IS_VALIDATED),
//                     eventType
//                 }
//             })
//             return response.data;
//         } catch (error) {
//             console.error("Error while validating data:", error);
//             throw error;
//         }
//     },
//     invalidateData: async(id) => {
//         try {
//             const response = axios.post(`${BASE_URL}/detections/invalidate_data`, {
//               body: {
//                 journey_id: id,
//               }
//             })
//             return response.data
//         } catch (error) {
//             console.error("Error while invalidating data:", error);
//             throw error;
//         }
//     }
// };

export { getDetections };