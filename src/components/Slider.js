import React, { Component, useEffect, useState } from "react";
import { render } from "react-dom";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import { SliderRail, Handle, Track, Tick } from "./SliderComponents"; // example render components - source below
import moment from "moment";

const sliderStyle = {
  position: "relative",
  width: "100%"
};

const domain = [1, 288];

function convertMinutes(value) {
  var hours = Math.floor(value / 60);
  var minutes = value % 60;
  return { hours: hours, minutes: minutes };
}

export default function ScrollDialog(props) {
  let [values, setValues] = useState([1, 288]);
  let [scrollingValues, setScrollingValues] = useState([1, 288]) // used for higlighthing selected time
  let [timeWithData, setTimeWithData] = useState([])

  useEffect(() => {
    setValues([1, 288]);
    setScrollingValues([1, 288]);
  }, [props.dateChangeIndicator])

  useEffect(() => {
    let data_list = props.originalData.map(d => d.DATA).flat().map(d2 => d2.ENTER_TIMESTAMP).filter(d3 => d3); // get all entertimestamp and filter undefined values
    let moment_dates = data_list.map(d => {
      let date = moment(d)
      return Math.floor((date.hours() * 60 + date.minutes()) / 5) // get minutes of the timestamp divided by 5
    })
    setTimeWithData([...new Set(moment_dates)]);
  }, [props.originalData])

  return (
    <div style={{ width: "100%", marginRight: 10 }}>
      <Slider
        mode={1}
        step={1}
        domain={domain}
        rootStyle={sliderStyle}
        onUpdate={(val) => setScrollingValues(val)}
        onChange={(val) => {
          let min = val[0] * 5; // times 5 because domain is total minutes of day divideby 5
          let max = val[1] * 5;

          let minTime = convertMinutes(min)
          let maxTime = convertMinutes(max)
          let minDate = moment(props.selectedDate);
          let maxDate = moment(moment(props.selectedDate).endOf('day').toDate());

          minDate.hour(minTime.hours);
          minDate.minute(minTime.minutes);

          maxDate.hour(maxTime.hours);
          maxDate.minute(maxTime.minutes);

          props.filterViaSlider(minDate.format('YYYY-MM-DD HH:mm:ss.SSS'), maxDate.format('YYYY-MM-DD HH:mm:ss.SSS'))

          setValues(val)
        }}
        values={values}
      >
        <Rail>
          {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
        </Rail>
        <Handles>
          {({ handles, getHandleProps }) => (
            <div className="slider-handles">
              {handles.map((handle) => (
                <Handle
                  key={handle.id}
                  handle={handle}
                  domain={domain}
                  getHandleProps={getHandleProps}
                />
              ))}
            </div>
          )}
        </Handles>
        <Tracks left={false} right={false}>
          {({ tracks, getTrackProps }) => (
            <div className="slider-tracks">
              {tracks.map(({ id, source, target }) => (
                <Track
                  key={id}
                  source={source}
                  target={target}
                  getTrackProps={getTrackProps}
                />
              ))}
            </div>
          )}
        </Tracks>
        <Ticks count={288}>
          {({ ticks }) => (
            <div className="slider-ticks">
              {ticks.map((tick, index) => {
                return (
                  <Tick
                    key={tick.id}
                    tick={tick}
                    count={ticks.length}
                    divider={12}
                    showLine={timeWithData.includes(tick.value)}
                    highlightLine={tick.value > scrollingValues[0] && tick.value < scrollingValues[1]}
                    lastItem={index === (ticks.length - 1)}
                  />
                )
              })}
            </div>
          )}
        </Ticks>
      </Slider>
    </div>
  );
}