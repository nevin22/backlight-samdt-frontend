import { useEffect, useState } from "react";
import moment from "moment";
import { Player } from "@lottiefiles/react-lottie-player";
import SearchOffIcon from '@mui/icons-material/SearchOff';
import Cookies from 'js-cookie';

import backendService from './services/backendService';
import { useQueryDetection } from './queryHooks/useQueryDetections';

import "./App.css";
import Config from './config';
import Filter from "./components/Filter";
import Table from "./components/Table";
import LoadingAnimation from './assets/lottie/lf30_xhjuaccs.json';
import AlertDialog from "./components/AlertDialog2";
import Snackbar from "./components/SnackBar";
import Button from '@mui/material/Button';

function App(props) {
  const [d, set_d] = useState([]);
  const [paginated_d, setPaginated_d] = useState([]);
  const [isListFiltered, setIsListFiltered] = useState(false);
  const [filtered_d, setFiltered_d] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [page, setPage] = useState(1);
  const [fetching, setFetching] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [publishAll, setPublishAll] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [successSnackBar, setSuccessSnackBar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment().subtract(1, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss.SSS'));
  const [tableColumns, setTableColumns] = useState([]);

  const [env, setEnv] = useState({ url: Config.backend_link });

  useEffect(() => {
    if (!!Cookies.get('network') && !!Cookies.get('site')) {
      fetchData(selectedDate, { network: Cookies.get('network'), site: Cookies.get('site') })
    }
  }, [])

  useEffect(() => {
  }, [page])

  let fetchData = (date, filters) => {
    setFetching(true);
    backendService.getDetections(date, filters)
      .then((res) => {
        setTableColumns(setUpTableColumns(res.detections))
        set_d(res.detections);
        setPage(1);
        setPaginated_d(res.detections.slice(0, rowsPerPage));
        setFetching(false);
      })
      .catch(err => {
        console.log("err", err);
        setFetching(false)
      })
  }

  let syncToManifest = (syncAll) => {
    backendService.prepDataForSyncing(syncAll ? null : selectedDate, Cookies.get('site'), Cookies.get('network'))
      .then(res => {
        setOpenSnackBar(true);
        setSuccessSnackBar(true);
        fetchData(selectedDate, { network: Cookies.get('network'), site: Cookies.get('site') });
      })
      .catch(err => {
        setOpenSnackBar(true);
        setSuccessSnackBar(false);
        console.log("err", err);
      })
  }


  let onPageChange = (page) => {
    let firstIndex = (page - 1) * rowsPerPage;
    setPage(page);

    if (isListFiltered) {
      setPaginated_d(filtered_d.slice(firstIndex, firstIndex + rowsPerPage))
    } else {
      setPaginated_d(d.slice(firstIndex, firstIndex + rowsPerPage))
    }
  }

  let searchFilter = (text) => {
    if (text.length > 0) {
      setIsListFiltered(true)
      setFiltered_d(d.filter(data => data.JOURNEY_ID.includes(text)));
      setPaginated_d(d.filter(data => data.JOURNEY_ID.includes(text)).slice(0, rowsPerPage));
    } else {
      setIsListFiltered(false)
      setPaginated_d(d.slice(0, rowsPerPage));
    }
  }

  let showAllSessionStatus = () => {
    setIsListFiltered(false)
    setPaginated_d(d.slice(0, rowsPerPage));
  }

  let showOnlyValidated = (trigger) => {
    if (trigger) {
      setIsListFiltered(true)
      setFiltered_d(d.filter(data => data.DATA.some(item => item.IS_VALIDATED_FULL_JOURNEY)));
      setPaginated_d(d.filter(data => data.DATA.some(item => item.IS_VALIDATED_FULL_JOURNEY)).slice(0, rowsPerPage));
    } else {
      setIsListFiltered(false)
      setPaginated_d(d.slice(0, rowsPerPage));
    }
  }

  let showOnlyUnValidated = () => {
    setIsListFiltered(true)
    setFiltered_d(d.filter(data => !data.DATA.some(item => item.IS_VALIDATED_FULL_JOURNEY)));
    setPaginated_d(d.filter(data => !data.DATA.some(item => item.IS_VALIDATED_FULL_JOURNEY)).slice(0, rowsPerPage));
  }

  let showOnlyAbandonment = (trigger) => {
    if (trigger) {
      setIsListFiltered(true)
      setFiltered_d(d.filter(data => data.DATA.some(item => item.BA_TYPE === 'Abandon') && data.DATA.some(item => item.IS_VALIDATED_FULL_JOURNEY)));
      setPaginated_d(d.filter(data => data.DATA.some(item => item.BA_TYPE === 'Abandon') && data.DATA.some(item => item.IS_VALIDATED_FULL_JOURNEY)).slice(0, rowsPerPage));
    } else {
      setIsListFiltered(false)
      setPaginated_d(d.slice(0, rowsPerPage));
    }
  }

  let showOnlyWarmExit = (trigger) => {
    if (trigger) {
      setIsListFiltered(true)
      setFiltered_d(d.filter(data => data.DATA.some(item => item.BA_TYPE === 'Warm Exit') && data.DATA.some(item => item.IS_VALIDATED_FULL_JOURNEY)));
      setPaginated_d(d.filter(data => data.DATA.some(item => item.BA_TYPE === 'Warm Exit') && data.DATA.some(item => item.IS_VALIDATED_FULL_JOURNEY)).slice(0, rowsPerPage));
    } else {
      setIsListFiltered(false)
      setPaginated_d(d.slice(0, rowsPerPage));
    }
  }

  let showOnlyBalk = (trigger) => {
    if (trigger) {
      setIsListFiltered(true)
      setFiltered_d(d.filter(data => data.DATA.some(item => item.BA_TYPE === 'Balk') && data.DATA.some(item => item.IS_VALIDATED_FULL_JOURNEY)));
      setPaginated_d(d.filter(data => data.DATA.some(item => item.BA_TYPE === 'Balk') && data.DATA.some(item => item.IS_VALIDATED_FULL_JOURNEY)).slice(0, rowsPerPage));
    } else {
      setIsListFiltered(false)
      setPaginated_d(d.slice(0, rowsPerPage));
    }
  }

  let filterViaSlider = (min, max) => {
    let slider_d = d.filter(d2 => {
      let index_with_data = d2.DATA.filter(d3 => d3.NO_DATA !== true).map(d4 => parseInt(d4.ORDER_INDEX))
      let dataToUse = d2.DATA.find(data => parseInt(data.ORDER_INDEX) === Math.min(...index_with_data));
      let timestamp_to_use = dataToUse.IS_VALIDATED ? dataToUse.VALIDATED_ENTER_TIMESTAMP : dataToUse.ENTER_TIMESTAMP

      return (timestamp_to_use > min) && (timestamp_to_use < max);
    })

    setFiltered_d(slider_d);
    setPage(1);
    setPaginated_d(slider_d.slice(0, rowsPerPage));
    setIsListFiltered(true);
  }

  let updateEditedItem = (data, updateAfterValidation) => {
    let journey_item = data[0];
    set_d((d) => {
      let d_copy = [...d];
      let indexOfDataToUpdate = d.findIndex(item => {
        return item.JOURNEY_ID === (updateAfterValidation ? journey_item.VALIDATED_JOURNEY : journey_item.JOURNEY_ID)
      });
      d_copy[indexOfDataToUpdate].DATA = data;
      return d_copy
    })
  }

  let setUpTableColumns = (data) => {
    const sceneNamesByIndex = {};
    data.forEach(journey => {
      journey.DATA.forEach(entry => {
        const index = parseInt(entry.ORDER_INDEX);
        const sceneName = entry.SCENE_NAME;

        if (!sceneNamesByIndex[index]) {
          sceneNamesByIndex[index] = sceneName;
        }
      });
    });

    const result = Object.keys(sceneNamesByIndex).map(index => {
      return { index: parseInt(index), sceneName: sceneNamesByIndex[index] };
    });

    return result.sort((a, b) => b.index - a.index);
  }

  return (
    <>
      {/* <Button
        style={{ fontFamily: 'Nunito', position: 'fixed', top: 60, right: -1650, zIndex: 1000000000000 }} //, position: 'fixed'
        variant="contained"
        size="small"
        onClick={() => setOpenAlert(true)}
      >
        Sync to manifest
      </Button> */}
      <div style={{ position: 'relative' }}>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />

        <Snackbar
          open={openSnackBar}
          close={() => setOpenSnackBar(false)}
          success={successSnackBar}
        />

        <AlertDialog
          closeAlert={() => setOpenAlert(false)}
          openAlert={openAlert}
          publishAll={publishAll}
          contentText={
            publishAll ?
              'You are about to publish all validated sessions from all dates. These changes will be permanent, are you sure you want to proceed?'
              :
              `You are about to publish all validated sessions within these filtered dates(${moment(selectedDate).format('dddd, MMMM D, YYYY')}). These changes will be permanent, so please ensure that you have reviewed all sessions before proceeding.`
          }
          onProceed={(syncAll) => syncToManifest(syncAll)}
          title={
            publishAll ?
              "Publish All Validated Sessions?"
              :
              "Publish Validated Sessions?"
          }
        />

        <div>
          <div>
            <Filter
              tableColumns={tableColumns}
              fetching={fetching}
              rowsPerPage={rowsPerPage}
              page={page}
              origignalResultsCount={d.length}
              originalData={d}
              pageCount={Math.ceil(isListFiltered ? (filtered_d.length / rowsPerPage) : (d.length / rowsPerPage))}
              resultsCount={isListFiltered ? filtered_d.length : d.length}
              updatePage={(page) => setPage(page)}
              fetchData={(date, filters) => fetchData(date, filters)}
              onPageChange={(page) => onPageChange(page)}
              searchFilter={(text) => searchFilter(text)}
              setSelectedDate={(data) => setSelectedDate(data)}
              selectedDate={selectedDate}
              hasFilter={isListFiltered}
              showOnlyValidated={(trigger) => showOnlyValidated(trigger)}
              showOnlyUnValidated={() => showOnlyUnValidated()}
              showAllSessionStatus={() => showAllSessionStatus()}
              showOnlyAbandonment={(trigger) => showOnlyAbandonment(trigger)}
              showOnlyWarmExit={(trigger) => showOnlyWarmExit(trigger)}
              showOnlyBalk={(trigger) => showOnlyBalk(trigger)}
              hasData={d.length > 0}
              filterViaSlider={(min, max) => filterViaSlider(min, max)}
              setOpenAlert={(bool, isAll) => {
                setOpenAlert(true);
                setPublishAll(isAll);
              }}
            />

            {fetching &&
              <div style={{ paddingTop: 250 }}>
                <Player
                  autoplay
                  loop
                  src={LoadingAnimation}
                  style={{ height: '200px', width: '200px' }}
                />
              </div>
            }
            {!fetching && d.length === 0 &&
              <div style={{ fontFamily: 'Nunito', fontSize: 25, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 250 }}>
                No Data <SearchOffIcon style={{ paddingLeft: 20, color: 'black', height: 50, width: 50 }} />
              </div>
            }
            {!fetching && !!d.length &&
              <div style={{ margin: 20, marginTop: 0 }}>
                <Table
                  tableColumns={tableColumns}
                  openSnackBar={(props) => {
                    setOpenSnackBar(true);
                    setSuccessSnackBar(props.success);
                  }}
                  fetching={fetching}
                  env={env}
                  detectionz={paginated_d}
                  updateEditedItem={(updateData, updateAfterValidation) => updateEditedItem(updateData, updateAfterValidation)}
                />
              </div>
            }
          </div>

        </div>
      </div>
    </>

  );
}

export default App;
