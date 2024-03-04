import * as React from "react";
import DateTimePicker from "react-datetime-picker";
import Cookies from 'js-cookie';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useState } from "react";
import Search from '@mui/icons-material/Search';
import Pagination from '@mui/material/Pagination';
import Button from '@mui/material/Button';
import moment from "moment";
import Checkbox from '@mui/material/Checkbox';
import '../index.css';
import FilterOptions from './FilterOptions';
import Drawer from '@mui/material/Drawer';
import Slider from './Slider';


export default function BasicTextFields(props) {
  const [dateValue, onChange] = useState(moment().subtract(1, 'days').startOf('day').toDate());
  const [onlyShowValidated, setOnlyShowValidated] = useState(false);
  const [isCalendarOpen, setIsCalenderOpen] = useState(false);
  const [drawerIsOpen, setDrawerIsOpen] = useState(!(!!Cookies.get('network') && !!Cookies.get('site')));

  const [selectedNetwork, setNetwork] = useState(Cookies.get('network') || '');
  const [selectedSite, setSite] = useState(Cookies.get('site') || '');
  const [optionNetworks, setOptionNetworks] = useState([]);
  const [optionSites, setOptionSites] = useState(!!Cookies.get('site') ? [Cookies.get('site')]: []);

  let debounce_timer = null;
  const [dateChangeIndicator, setDateChangeIndicator] = useState(1);

  const handleSearch = (e) => {
    clearTimeout(debounce_timer);

    debounce_timer = setTimeout(() => {
      props.searchFilter(e.target.value);
    }, 300);
  };

  const toggleValidatedFilter = () => {
    props.showOnlyValidated(!onlyShowValidated)
    setOnlyShowValidated(!onlyShowValidated);

  }

  return (
    <div className="sticky">
      <Drawer
        anchor={'left'}
        open={drawerIsOpen}
        onClose={() => setDrawerIsOpen(false)}
      >
        <FilterOptions
          closeDrawer={() => setDrawerIsOpen(false)}
          setNetwork={(network) => setNetwork(network)}
          setSite={(site) => setSite(site)}
          selectedNetwork={selectedNetwork}
          selectedSite={selectedSite}
          optionNetworks={optionNetworks}
          setOptionNetworks={(networks) => setOptionNetworks(networks)}
          optionSites={optionSites}
          setOptionSites={(sites) => setOptionSites(sites)}
          fetchData={() => props.fetchData(props.selectedDate, { network: selectedNetwork, site: selectedSite })}
        />
      </Drawer>

      <div style={{ fontWeight: 'bold', fontFamily: "Nunito", fontSize: 18 }}>
        Backlight
        <span style={{ fontWeight: 'normal', fontSize: 14, marginLeft: 5 }}>{props.origignalResultsCount} total result{props.origignalResultsCount > 1 ? 's' : ''}</span>

        <div style={{ display: 'flex', fontWeight: 'bold', fontFamily: "Nunito", alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Checkbox size="small" checked={onlyShowValidated} onChange={() => toggleValidatedFilter()} style={{ marginLeft: -10 }} />
            <span style={{ fontSize: 12, fontFamily: 'Nunito' }}>Only show validated</span>
          </div>
          <Button
            style={{ fontFamily: 'Nunito', marginBottom: 10 }}
            variant="contained"
            size="small"
            onClick={() => setDrawerIsOpen(!drawerIsOpen)}
          >
            Filters
          </Button>
        </div>


      </div>

      <div style={{ display: 'flex', fontWeight: 'bold', fontFamily: "Nunito", alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="search-container">
            <Search style={{ color: '#7D8697' }} />
            <input
              type="text"
              placeholder="Search for a session"
              className="search-input"
              onChange={handleSearch}
            />
          </div>
          {props.hasFilter &&
            <span style={{ fontWeight: 'normal', fontSize: 14, marginLeft: 10 }}>{props.resultsCount} filtered result/s</span>
          }
        </div>

        {props.hasData &&
          <Pagination
            page={props.page}
            onChange={(e, page) => {
              props.onPageChange(page)
            }}
            count={props.pageCount}
            color="primary"
            shape="rounded"
            size="small"
          />
        }

      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, marginBottom: 55 }}>
        <Slider
          selectedDate={props.selectedDate}
          filterViaSlider={(min, max) => props.filterViaSlider(min, max)}
          dateChangeIndicator={dateChangeIndicator}
          originalData={props.originalData}
        />
        {/* A very hacked datetime picker xD */}
        {isCalendarOpen &&
          <DateTimePicker
            portalId="root-portal"
            clearIcon={null}
            disableCalendar={props.fetching}
            isCalendarOpen={isCalendarOpen}
            className={'calendar_floater_style'}
            disableClock
            onChange={(d) => {
              onChange(d);
              props.fetchData(d, { network: selectedNetwork, site: selectedSite });
              setIsCalenderOpen(false);
              props.setSelectedDate(d);
              setDateChangeIndicator(dateChangeIndicator + 1)
            }}
            onCalendarClose={() => {
              setIsCalenderOpen(false);
            }}
            value={dateValue}
          />
        }
        <div style={{ height: 65, backgroundColor: 'rgb(200,200,200)' }}>
          <div
            onClick={() => setIsCalenderOpen(true)}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', margin: 10, marginLeft: 20, marginRight: 20, zIndex: 10, borderRadius: 5, paddingTop: 10, paddingBottom: 10, border: '1px solid #CCCCCC', width: 300 }}
          >
            <div style={{ display: 'flex', height: 22, alignItems: 'center' }}>
              <CalendarTodayIcon style={{ color: '#7D8697', fontSize: 15 }} />
              <span style={{ marginLeft: 15, marginRight: 15, fontFamily: 'Nunito', fontSize: 14 }}>{moment(dateValue).subtract('days').format('ddd, DD MMM yyyy')}</span>
              <KeyboardArrowDownIcon style={{ color: '#7D8697', fontSize: 15 }} />
            </div>
          </div>
        </div>

      </div>

      {/* quickfix para sticky and table header haha */}
      {props.hasData &&
        <div className="sticky-table-header-hack">
          {props.tableColumns.map((column, index) => {
            return (
              <div key={index} className="sticky-table-header-cell" style={{ width: `${100 / props.tableColumns.length}%` }}>
                {column.sceneName}
              </div>
            )
          })
          }
        </div>
      }
    </div>
  );
}
