import * as React from "react";
import DateTimePicker from "react-datetime-picker";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useState } from "react";
import Search from '@mui/icons-material/Search';
import Pagination from '@mui/material/Pagination';
import Button from '@mui/material/Button';
import moment from "moment";
import Checkbox from '@mui/material/Checkbox';
import '../index.css';

export default function BasicTextFields(props) {
  const [dateValue, onChange] = useState(moment().subtract(1, 'days').startOf('day').toDate());
  const [onlyShowValidated, setOnlyShowValidated] = useState(false);
  const [isCalendarOpen, setIsCalenderOpen] = useState(false)
  let debounce_timer = null;

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
      <div style={{ fontWeight: 'bold', fontFamily: "Nunito", fontSize: 18 }}>
        Backlight
        <span style={{ fontWeight: 'normal', fontSize: 14, marginLeft: 5 }}>{props.origignalResultsCount} total result{props.origignalResultsCount > 1 ? 's' : ''}</span>

        <div>
          <Checkbox size="small" checked={onlyShowValidated} onChange={() => toggleValidatedFilter() } style={{ marginLeft: -10 }}/>
          <span style={{ fontSize: 12, fontFamily: 'Nunito'}}>Only show validated</span>
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

        <Pagination page={props.page} onChange={(e, page) => props.onPageChange(page)} count={props.pageCount} color="primary" shape="rounded" size="small" style={{ marginBottom: 10 }} />
      </div>

      {/* A very hacked datetime picker xD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <Button
          style={{ fontFamily: 'Nunito', marginBottom: 10 }}
          variant="contained"
          size="small"
          onClick={() => props.syncToManifest()}
        >
          Sync to Manifest
        </Button>
        {isCalendarOpen &&
          <DateTimePicker
            portalId="root-portal"
            disableCalendar={props.fetching}
            isCalendarOpen={isCalendarOpen}
            className={props.hasData ? 'hehe' : 'hoho'}
            disableClock
            onChange={(d) => {
              onChange(d);
              props.fetchData(d);
              setIsCalenderOpen(false);
              props.setSelectedDate(d);
            }}
            onCalendarClose={() => {
              setIsCalenderOpen(false);
            }}
            value={dateValue}
          />
        }
        <div
          onClick={() => setIsCalenderOpen(true)}
          style={{ backgroundColor: 'white', padding: 10, zIndex: 10, borderRadius: 5, border: '1px solid #CCCCCC' }}
        >
          <div style={{ display: 'flex', height: 22, width: 330, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CalendarTodayIcon style={{ color: '#7D8697', fontSize: 15 }} />
            <span style={{ marginLeft: 10, marginRight: 10, fontFamily: 'Nunito', fontSize: 14 }}>{moment(dateValue).subtract('days').format('ddd, DD MMM yyyy')}</span>
            <KeyboardArrowDownIcon style={{ color: '#7D8697', fontSize: 15 }} />
          </div>
        </div>
      </div>

      {/* quickfix para sticky and table header haha */}
      {props.hasData &&
        <div className="sticky-table-header-hack">
          <div className="sticky-table-header-cell">
            PUW
          </div>
          <div className="sticky-table-header-cell">
            YLANE
          </div>
          <div className="sticky-table-header-cell">
            Order Point
          </div>
          <div className="sticky-table-header-cell">
            Entrance
          </div>
        </div>
      }
    </div>
  );
}
