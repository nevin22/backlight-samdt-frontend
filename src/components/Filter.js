import * as React from "react";
import DateTimePicker from "react-datetime-picker";
import Cookies from 'js-cookie';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useState, useEffect } from "react";
import Search from '@mui/icons-material/Search';
import Pagination from '@mui/material/Pagination';
import moment from "moment";
import '../index.css';
import FilterOptions from './FilterOptions';
import Slider from './Slider';
import Popover from '@mui/material/Popover';

import CustomDropdown from './CustomDropDown';

import IconSession from '../assets/icons/icon-session.svg';
import IconDivider from '../assets/icons/icon-divider.svg';
import IconDividerGray from '../assets/icons/icon-divider-gray.svg';

export default function BasicTextFields(props) {
  const [dateValue, onChange] = useState(moment().subtract(1, 'days').startOf('day').toDate());
  const [isCalendarOpen, setIsCalenderOpen] = useState(false);

  const [selectedNetwork, setNetwork] = useState(Cookies.get('network') || '');
  const [selectedSite, setSite] = useState(Cookies.get('site') || '');
  const [optionNetworks, setOptionNetworks] = useState([]);
  const [optionSites, setOptionSites] = useState(!!Cookies.get('site') ? [Cookies.get('site')] : []);

  const [sliderPrevValues, setSliderPrevValues] = useState([1, 288]);
  const [selectedSession, setSelectedSession] = useState("All")

  let debounce_timer = null;
  const [dateChangeIndicator, setDateChangeIndicator] = useState(1);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClickPublishSelector = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClosePublishSelector = () => {
    setAnchorEl(null);
  };
  const openPublishSelector = Boolean(anchorEl);
  const id = openPublishSelector ? `simple-popover` : undefined;

  const handleSearch = (e) => {
    clearTimeout(debounce_timer);

    debounce_timer = setTimeout(() => {
      props.searchFilter(e.target.value);
    }, 300);
  };

  const filterViaSessionStatus = (selected) => {
    switch (selected) {
      case 'All':
        props.showAllSessionStatus()
        break;
      case 'Validated':
        props.showOnlyValidated(true);
        break;
      case 'Unvalidated':
        props.showOnlyUnValidated()
        break;
      case 'Warm Exit':
        props.showOnlyWarmExit(true);
        break;
      case 'Balk':
        props.showOnlyBalk(true);
        break;
      case 'Abandon':
        props.showOnlyAbandonment(true);
        break;
      default:
    }
  }

  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollTop, setLastScrollTop] = useState(0);

  const [downCount, setDownCount] = useState(0);
  const [upCount, setUpCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (scrollTop > lastScrollTop) {
        // Scrolling Down
        setDownCount(prev => prev + 1);
        setUpCount(0);

        if (downCount + 1 >= 5) {
          setScrollDirection('down');
          setDownCount(0);
        }
      } else if (scrollTop < lastScrollTop) {
        // Scrolling Up
        setUpCount(prev => prev + 1);
        setDownCount(0);

        if (upCount + 1 >= 10 || scrollTop === 0) {
          setScrollDirection('up');
          setUpCount(0);
        }
      }
      setLastScrollTop(scrollTop <= 0 ? 0 : scrollTop); // Avoid negative scroll
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollTop, downCount, upCount]);

  return (
    <div className="sticky">
      {scrollDirection === 'up' ?
        (
          <div>
            <div style={{ fontWeight: 'bold', fontFamily: "Nunito", fontSize: 18 }}>
              <div style={{ display: 'flex', fontWeight: 'bold', fontFamily: "Nunito", alignItems: 'center', justifyContent: 'space-between' }} className="mb-2">
                <div className="flex-none">
                  Backlight
                  <span style={{ fontWeight: 'normal', fontSize: 14, marginLeft: 5 }}>{props.origignalResultsCount} total result{props.origignalResultsCount > 1 ? 's' : ''}</span>
                </div>
                <div>

                  <div
                    style={{ backgroundColor: '#1565C0' }}
                    className="border rounded p-1 flex items-center select-none cursor-pointer"
                  >

                    <span
                      className="text-sm text-white px-1 font-lato"
                      onClick={() => props.setOpenAlert(true, 'all')}
                    >Publish Updates</span>

                    <img src={IconDivider} style={{ height: 20 }} className="px-2" />

                    <div
                      className="pr-1"
                      onClick={handleClickPublishSelector}
                    >
                      <KeyboardArrowDownIcon style={{ color: 'white', fontSize: 16 }} />
                    </div>

                    <Popover
                      id={id}
                      open={openPublishSelector}
                      anchorEl={anchorEl}
                      onClose={handleClosePublishSelector}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <div className='py-1'>
                        <div
                          className='flex items-center pl-2 select-none cursor-pointer'
                          style={{ fontSize: 14, height: 30, width: 150, color: '#1565C0' }}
                          onClick={() => {
                            props.setOpenAlert(true, false)
                            handleClosePublishSelector()
                          }}
                        >
                          Publish Selected Date
                        </div>
                        <div
                          className='flex items-center pl-2 select-none cursor-pointer'
                          style={{ fontSize: 14, height: 30, width: 150 }}
                          onClick={() => {
                            props.setOpenAlert(true, true)
                            handleClosePublishSelector()
                          }}
                        >
                          Publish All Dates
                        </div>
                      </div>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{ display: 'flex', fontWeight: 'bold', fontFamily: "Nunito", alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="search-container">
                  <Search style={{ color: '#CACDD4', fontSize: 20 }} className="mr-1" />
                  <input
                    type="text"
                    placeholder="Search for an event"
                    className="search-input"
                    onChange={handleSearch}
                  />
                </div>
                {props.hasFilter &&
                  <span style={{ fontWeight: 'normal', fontSize: 14, marginLeft: 10 }}>{props.resultsCount} filtered result/s</span>
                }
              </div>

              <div className="flex">
                <FilterOptions
                  setNetwork={(network) => {
                    setNetwork(network)
                    setSelectedSession('All')
                  }}
                  setSite={(site) => {
                    setSite(site)
                    setSelectedSession('All')
                  }}
                  selectedNetwork={selectedNetwork}
                  selectedSite={selectedSite}
                  optionNetworks={optionNetworks}
                  setOptionNetworks={(networks) => setOptionNetworks(networks)}
                  optionSites={optionSites}
                  setOptionSites={(sites) => setOptionSites(sites)}
                  fetchData={() => props.fetchData(props.selectedDate, { network: Cookies.get('network'), site: Cookies.get('site') })}
                />
                <CustomDropdown
                  defaultText={'Session Status'}
                  defaultOption={selectedSession}
                  dontShowTextIfOptionIs={'All'}
                  options={['All', 'Validated', 'Unvalidated', 'Warm Exit', 'Balk', 'Abandon']}
                  onSelect={(selected) => {
                    filterViaSessionStatus(selected);
                    setSelectedSession(selected)
                  }}
                  customIcon={IconSession}
                  customStyle={{ minWidth: 150, marginLeft: 15 }}
                />
                <img src={IconDividerGray} className="mr-2 ml-4" style={{ height: 32}} />
                {props.hasData &&
                  <div className="flex items-center ml-2">
                    <Pagination
                      page={props.page}
                      onChange={(e, page) => {
                        props.onPageChange(page)
                      }}
                      count={props.pageCount}
                      siblingCount={0}
                      boundaryCount={1}
                      sx={{
                        '& .MuiPaginationItem-root': {
                          backgroundColor: 'white',
                          color: '#D5D5D5',
                          border: '1px solid #D5D5D5',
                          borderRadius: '2px',
                          margin: '0 4px',
                          padding: '5px',
                        },
                        '& .MuiPaginationItem-root.Mui-selected': {
                          backgroundColor: 'white',
                          color: '#4E95F5',
                          border: '1px solid #4E95F5',
                        },
                      }}
                    />
                  </div>

                }
              </div>
            </div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, marginBottom: 55 }}
            >
              <Slider
                selectedDate={props.selectedDate}
                filterViaSlider={(min, max) => props.filterViaSlider(min, max)}
                dateChangeIndicator={dateChangeIndicator}
                originalData={props.originalData}
                sliderPrevValues={sliderPrevValues}
                setSliderPrevValues={(val) => setSliderPrevValues(val)}
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
                    setSliderPrevValues([1, 288])
                    setDateChangeIndicator(dateChangeIndicator + 1)
                  }}
                  onCalendarClose={() => {
                    setIsCalenderOpen(false);
                  }}
                  value={dateValue}
                />
              }
              <div style={{ height: 65, backgroundColor: '#D1D4D9' }}>
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
              <div className={`sticky-table-header-hack`}>
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
        )
        :
        (
          <div style={{ fontWeight: 'bold', fontFamily: "Nunito", fontSize: 18 }}>
            <div style={{ display: 'flex', fontWeight: 'bold', fontFamily: "Nunito", alignItems: 'center', justifyContent: 'space-between' }} className="mb-2 h-20">
              <div className="flex-none">
                Backlight
                <span style={{ fontWeight: 'normal', fontSize: 14, marginLeft: 5 }}>{props.origignalResultsCount} total result{props.origignalResultsCount > 1 ? 's' : ''}</span>
              </div>

              <Slider
                selectedDate={props.selectedDate}
                filterViaSlider={(min, max) => props.filterViaSlider(min, max)}
                dateChangeIndicator={dateChangeIndicator}
                originalData={props.originalData}
                customWidth={'80%'}
                customTop={'-33px'}
                noNumberIndicator={true}
                sliderPrevValues={sliderPrevValues}
                setSliderPrevValues={(val) => setSliderPrevValues(val)}
              />

              <div>
                <div
                  style={{ backgroundColor: '#1565C0' }}
                  className="border rounded p-1 flex items-center select-none cursor-pointer"
                >

                  <span
                    className="text-sm text-white px-1 font-lato"
                    onClick={() => props.setOpenAlert(true, 'all')}
                  >Publish Updates</span>

                  <img src={IconDivider} style={{ height: 20 }} className="px-2" />

                  <div
                    className="pr-1"
                    onClick={handleClickPublishSelector}
                  >
                    <KeyboardArrowDownIcon style={{ color: 'white', fontSize: 16 }} />
                  </div>

                  <Popover
                    id={id}
                    open={openPublishSelector}
                    anchorEl={anchorEl}
                    onClose={handleClosePublishSelector}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <div className='py-1'>
                      <div
                        className='flex items-center pl-2 select-none cursor-pointer'
                        style={{ fontSize: 14, height: 30, width: 150, color: '#1565C0' }}
                        onClick={() => {
                          props.setOpenAlert(true, false)
                          handleClosePublishSelector()
                        }}
                      >
                        Publish Selected Date
                      </div>
                      <div
                        className='flex items-center pl-2 select-none cursor-pointer'
                        style={{ fontSize: 14, height: 30, width: 150 }}
                        onClick={() => {
                          props.setOpenAlert(true, true)
                          handleClosePublishSelector()
                        }}
                      >
                        Publish All Dates
                      </div>
                    </div>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}
