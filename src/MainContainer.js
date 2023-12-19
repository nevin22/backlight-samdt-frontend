import "./App.css";
import Filter from "./components/Filter";
import Table from "./components/Table";
import axios from "axios";
import { Player } from "@lottiefiles/react-lottie-player";
import moment from "moment";
import { useEffect, useState } from "react";
import LoadingAnimation from '../src/assets/lottie/lf30_xhjuaccs.json';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import AlertDialog from "./components/AlertDialog";
import Snackbar from "./components/SnackBar";

function App(props) {
  const [d, set_d] = useState([]);
  const [paginated_d, setPaginated_d] = useState([]);

  const [isListFiltered, setIsListFiltered] = useState(false);
  const [filtered_d, setFiltered_d] = useState([]);


  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [page, setPage] = useState(1);

  const [fetching, setFetching] = useState(false);

  const [openAlert, setOpenAlert] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [successSnackBar, setSuccessSnackBar] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);

  const [env, setEnv] = useState({
    url: "http://localhost:8080",
  });

  useEffect(() => {
    const desiredFormat = 'YYYY-MM-DD HH:mm:ss.SSS';
    setFetching(true);
    axios
      .get(`${env.url}/detections/samdt_list`, {
        params: {
          startTime: moment().subtract(1, 'days').startOf('day').format(desiredFormat),
          endTime: moment().subtract('days').startOf('day').format(desiredFormat)
        }
      })
      .then((res) => {
        set_d(res.data.detections);
        setPaginated_d(res.data.detections.slice(0, rowsPerPage));
        setFetching(false)
      })
      .catch((err) => {
        console.log("err", err);
        setFetching(false)
      });
  }, [env]);

  useEffect(() => {
  }, [page])

  let fetchData = (date) => {
    const desiredFormat = 'YYYY-MM-DD HH:mm:ss.SSS';
    setFetching(true);
    axios
      .get(`${env.url}/detections/samdt_list`, {
        params: {
          startTime: moment(date).startOf('day').format(desiredFormat),
          endTime: moment(date).endOf('day').format(desiredFormat)
        }
      })
      .then((res) => {
        set_d(res.data.detections);
        setPage(1);
        setPaginated_d(res.data.detections.slice(0, rowsPerPage));
        setFetching(false);
      })
      .catch((err) => {
        console.log("err", err);
        setFetching(false)
      });
  }

  let syncToManifest = () => {
    axios
      .post(`${env.url}/detections/sync_data_to_manifest`)
      .then((res) => {
        setOpenSnackBar(true);
        setSuccessSnackBar(true);
        fetchData(selectedDate);
      })
      .catch((err) => {
        setOpenSnackBar(true);
        setSuccessSnackBar(false);
        console.log("err", err);
      });
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

  let showOnlyValidated = (trigger) => {
    if (trigger) {
      setIsListFiltered(true)
      setFiltered_d(d.filter(data => data.DATA[data.DATA.findIndex(item => (item && item.SCENE_NAME) === "Scene Pull Up Window")].IS_VALIDATED));
      setPaginated_d(d.filter(data => data.DATA[data.DATA.findIndex(item => (item && item.SCENE_NAME) === "Scene Pull Up Window")].IS_VALIDATED).slice(0, rowsPerPage));
    } else {
      setIsListFiltered(false)
      setPaginated_d(d.slice(0, rowsPerPage));
    }
  }
  
  let updateEditedItem = (data) => {
    let puw = data.find(d => d.SCENE_NAME === 'Scene Pull Up Window')
    set_d((d) => {
      let d_copy = [...d];
      // let dataToUpdate = d.find(item => item.JOURNEY_ID === puw.JOURNEY_ID);
      let indexOfDataToUpdate = d.findIndex(item => item.JOURNEY_ID === puw.JOURNEY_ID);
      d_copy[indexOfDataToUpdate].DATA = data;
      return d_copy
    })

    setTimeout(() => {
      console.log('d', d)
    }, 1000)
  }

  return (
    <div>
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
        contentText={'Proceeding will finalize your validated sessions for syncing in the manifest. Are you certain you wish to continue?'}
        onProceed={() => syncToManifest()}
        title={"Sync to manifest ?"}
      />
      <div>
        <div>
          <Filter
            fetching={fetching}
            rowsPerPage={rowsPerPage}
            page={page}
            origignalResultsCount={d.length}
            pageCount={Math.ceil(isListFiltered ? (filtered_d.length / rowsPerPage) : (d.length / rowsPerPage))}
            resultsCount={isListFiltered ? filtered_d.length : d.length}
            updatePage={(page) => setPage(page)}
            fetchData={(date) => fetchData(date)}
            onPageChange={(page) => onPageChange(page)}
            searchFilter={(text) => searchFilter(text)}
            setSelectedDate={(data) => setSelectedDate(data)}
            hasFilter={isListFiltered}
            showOnlyValidated={(trigger) => showOnlyValidated(trigger)}
            syncToManifest={() => setOpenAlert(true)}
            hasData={d.length > 0}
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
                openSnackBar={(props) => {
                  setOpenSnackBar(true);
                  setSuccessSnackBar(props.success);
                }}
                fetching={fetching}
                env={env}
                detectionz={paginated_d}
                updateEditedItem={(updateData) => updateEditedItem(updateData)}
              />
            </div>
          }
        </div>

      </div>
    </div>
  );
}

export default App;
