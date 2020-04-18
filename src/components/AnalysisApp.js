import React from 'react';
import { InputBase } from '@material-ui/core';
import BlueSelectionPanel from './BlueSelectionPanel';
import { DateControlsContainer, DateControlsButton, DateLabel } from './DateControls';
import { LayerTogglesContainer, LayerToggleButton } from './LayerToggles';
import { ExportContainer, ExportButton } from './ExportControls';
import { HoverCardContainer, HoverCardRow, HoverCardHeader } from './HoverCard';
import { RightPanelContainer, PanelTableRow, PanelUnit } from './RightPanel';
import Navbar from './Navbar';
import {
  getInProjection,
  getMinimum,
  getAverage,
  getMaximum,
  getMinimumVelocity,
  getAverageVelocity,
  getMaximumVelocity,
  getMinimumAcceleration,
  getAverageAcceleration,
  getMaximumAcceleration,
  getStandardDeviation,
  getVelocities,
  getTimeStringFromDate,
  getDurationString,
  getStartString,
  getEndString,
  getDateStringFromDate
} from './../graphUtils';

const TWELVE_HOURS_IN_MS = 12 * 60 * 60 * 1000;

const NUMBER_OF_ENTRIES_IN_ONE_DAY = 24 * 12;
const ENTRIES_COUNT = NUMBER_OF_ENTRIES_IN_ONE_DAY / 2;

const GRAPH_HEIGHT = 800;
const PANEL_WIDTH = 300;

const LINE_SEPARATOR_COLOR = 'rgba(255, 255, 255, 0.1)';
const ENTRY_PROJECTION_COLOR = 'rgba(85, 85, 85, 0.2)';
const ENTRY_PROJECTION_ACTIVE_COLOR = 'rgba(85, 85, 85,0.7)';
const VELOCITY_COLOR = 'red';
const GLUCOSE_POINT_COLOR = '#ccc';
const SMOOTHED_COLOR = '#3f51b5';

const POINT_DIAMETER = 4;
const CLICK_TARGET_HEIGHT = 50;
const GLUCOSE_TO_PIXEL_SCALE = 1.9;

const HorizontalLine = () => (
  <div
    style={{
      left: '0',
      bottom: GRAPH_HEIGHT / 2,
      width: '100%',
      height: '1px',
      background: LINE_SEPARATOR_COLOR,
      position: 'absolute',
      zIndex: 0
    }}
  />
);

const GraphContainer = ({ children, width }) => (
  <div
    style={{
      width,
      height: GRAPH_HEIGHT,
      position: 'relative',
      background: '#1b1d1e',
      borderBottom: `1px solid ${LINE_SEPARATOR_COLOR}`,
      float: 'left'
    }}
  >{children}</div>
);

const EntryClickTarget = ({ left, width, ...otherProps }) => (
  <div
    style={{
      position: 'absolute',
      left,
      top: 0,
      width,
      height: '100%',
      cursor: 'pointer',
      zIndex: '0'
    }}
    {...otherProps}
  />
);

const EntryPoint = ({
  isActive, left, bottom, background, ...otherProps
}) => (
  <div
    style={{
      cursor: 'pointer',
      zIndex: '1',
      position: 'absolute',
      width: isActive ? 2 * POINT_DIAMETER : POINT_DIAMETER,
      height: isActive ? 2 * POINT_DIAMETER : POINT_DIAMETER,
      borderRadius: isActive ? 2 * (POINT_DIAMETER - 1) : POINT_DIAMETER - 1,
      left,
      bottom,
      background
    }}
    {...otherProps}
  />
);

const EntryProjection = ({
  height, left, bottom, background, ...otherProps
}) => (
  <div
    style={{
      cursor: 'pointer',
      zIndex: '0',
      position: 'absolute',
      width: POINT_DIAMETER,
      height,
      left,
      bottom,
      background
    }}
    {...otherProps}
  />
);

const EntryPointClickTarget = ({
  left, bottom, width, height, ...otherProps
}) => (
  <div
    style={{
      position: 'absolute',
      left,
      bottom,
      width,
      height,
      cursor: 'pointer',
      zIndex: '1'
    }}
    {...otherProps}
  />
);

class AnalysisApp extends React.Component {
  state = {
    start: 1570431600000,
    entries: null,
    active: null,
    cursorX: null,
    cursorY: null,
    dragStartIndex: null,
    showGlucose: true,
    showVelocity: false,
    showSmoothed: false,
    showProjection: false,
    showAcceleration: false,
    showProjectionTwoPoint: false,
    isUploading: false
  }

  async componentDidMount() {
    const start = 1570431600000;
    const end = 1570474800000;
    const response = await fetch(`https://jakob-nightscout.herokuapp.com/api/v1/entries.json?find[date][$gte]=${start}&find[date][$lt]=${end}&count=10000`);
    const json = await response.json();

    this.setState({
      start: start,
      entries: json
    }, () => {
      this.fetchPreviousDataInBackground();
      this.fetchNextDataInBackground();
    });

    this.init();
  }

  init() {
  	if (window.Event) {
  	document.captureEvents(Event.MOUSEMOVE);
  	}
  	document.onmousemove = this.setCursorXY;
  }

  setCursorXY = (e) => {
  	const cursorX = (window.Event) ? e.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
  	const cursorY = (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);

    this.setState({
      cursorX,
      cursorY
    });
  }

  handleMouseOver = (entry) => {
    this.setState({
      active: entry
    });
  }

  handleMouseOut = () => {
    this.setState({
      active: null
    });
  }

  getIsActive = (entry) => {
    return this.state.active && (this.state.active.date === entry.date);
  }

  handleMouseDown = (index) => {
    this.setState({
      dragStartIndex: index,
      selectionStartIndex: null,
      selectionEndIndex: null
    });
  }

  handleClick = () => {
    this.setState({
      dragStartIndex: null,
      selectionStartIndex: null,
      selectionEndIndex: null
    });
  }

  handleSaveSegmentClick = () => {
    document.addEventListener('keydown', this.handleKeyDown);

    this.setState({
      isUploading: true
    });
  }

  handleKeyDown = ({ key, code, keyCode }) => {
    if (key === 'Enter' || code === 'Enter' || keyCode === 13) {
      this.handleUpload();
    }
  }

  handleUpload = () => {
    const start = this.state.start + (5 * 60 * 1000 * (this.state.selectionStartIndex + 1)) - 50 * 60 * 1000;
    const end = this.state.start + (5 * 60 * 1000 * (this.state.selectionEndIndex + 2));

    const element = document.getElementById('segment-name');
    const name = element.value;

    this.setState({
      isUploading: false
    });

    fetch('/upload', {
      method: 'POST',
      body: JSON.stringify({ start, end, name }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  handleMouseUp = (index) => {
    this.setState({
      selectionStartIndex: this.state.dragStartIndex,
      selectionEndIndex: index,
      dragStartIndex: null
    });
  }

  getSelectedEntries() {
    const { selectionStartIndex, selectionEndIndex } = this.state;

    if (selectionStartIndex && selectionEndIndex) {
      return this.state.entries.slice(selectionStartIndex, selectionEndIndex);
    }

    return this.state.entries.slice(0, ENTRIES_COUNT);
  }

  toggleGlucose = () => {
    this.setState({
      showGlucose: !this.state.showGlucose
    });
  }

  toggleVelocity = () => {
    this.setState({
      showVelocity: !this.state.showVelocity
    });
  }

  toggleSmoothed = () => {
    this.setState({
      showSmoothed: !this.state.showSmoothed
    });
  }

  toggleProjection = () => {
    this.setState({
      showProjection: !this.state.showProjection
    });
  }

  toggleAcceleration = () => {
    this.setState({
      showAcceleration: !this.state.showAcceleration
    });
  }

  toggleProjectionTwoPoint = () => {
    this.setState({
      showProjectionTwoPoint: !this.state.showProjectionTwoPoint
    });
  }

  fetchNextDataInBackground = async () => {
    const newStart = this.state.start + TWELVE_HOURS_IN_MS;
    const response = await fetch(`https://jakob-nightscout.herokuapp.com/api/v1/entries.json?find[date][$gte]=${newStart}&find[date][$lt]=${newStart + TWELVE_HOURS_IN_MS}&count=10000`);
    const json = await response.json();

    this.setState({
      nextEntries: json
    });
  }

  fetchPreviousDataInBackground = async () => {
    const newStart = this.state.start - TWELVE_HOURS_IN_MS;
    const response = await fetch(`https://jakob-nightscout.herokuapp.com/api/v1/entries.json?find[date][$gte]=${newStart}&find[date][$lt]=${this.state.start}&count=10000`);
    const json = await response.json();

    this.setState({
      previousEntries: json
    });
  }

  handleNextClick = async () => {
    const newStart = this.state.start + TWELVE_HOURS_IN_MS;
    this.setState({
      start: newStart,
      previousEntries: this.state.entries,
      entries: this.state.nextEntries,
      nextEntries: null
    }, this.fetchNextDataInBackground);
  }

  handlePreviousClick = async () => {
    const newStart = this.state.start - TWELVE_HOURS_IN_MS;
    this.setState({
      start: newStart,
      nextEntries: this.state.entries,
      entries: this.state.previousEntries,
      previousEntries: null
    }, this.fetchPreviousDataInBackground);
  }

  renderEntry(entry, index) {
    const {
      showGlucose, showVelocity, showSmoothed, showProjection, showAcceleration, showProjectionTwoPoint
    } = this.state;

    const screenWidth = window.screen.width;
    const entryLeftOffset = (screenWidth - PANEL_WIDTH) / ENTRIES_COUNT;

    const mouseHoverHandlers = {
      onMouseOver: () => {
        this.handleMouseOver(entry);
      },
      onMouseOut: this.handleMouseOut
    };

    const mouseDragHandlers = {
      onMouseDown: () => {
        this.handleMouseDown(index);
      },
      onMouseUp: () => {
        this.handleMouseUp(index);
      }
    };

    const entryPointClickTargetHandlers = {
      ...mouseDragHandlers,
      ...mouseHoverHandlers,
      onClick: this.handleClick
    };

    const isActive = this.getIsActive(entry);
    const pointLeftPosition = index * entryLeftOffset + (entryLeftOffset / 2) - (isActive ? POINT_DIAMETER : (POINT_DIAMETER / 2));
    const getPointBottomPosition = glucose => glucose * GLUCOSE_TO_PIXEL_SCALE - (isActive ? (POINT_DIAMETER / 2) : 0);
    const getClickTargetBottomPosition = glucose => glucose * GLUCOSE_TO_PIXEL_SCALE - (CLICK_TARGET_HEIGHT / 2);

    return (index < ENTRIES_COUNT) && (
      <React.Fragment>
        <EntryClickTarget
          left={index * entryLeftOffset}
          width={entryLeftOffset}
          {...mouseDragHandlers}
          onClick={this.handleClick}
        />
        { this.state.dragStartIndex && (
          <BlueSelectionPanel
            left={this.state.dragStartIndex * entryLeftOffset}
            width={this.state.cursorX - this.state.dragStartIndex * entryLeftOffset}
          />
        )}
        { this.state.selectionStartIndex && this.state.selectionEndIndex && (
          <BlueSelectionPanel
            left={this.state.selectionStartIndex * entryLeftOffset}
            width={(this.state.selectionEndIndex - this.state.selectionStartIndex) * entryLeftOffset}
            onClick={this.handleClick}
          />
        )}
        { showGlucose
          && <React.Fragment>
            <EntryPointClickTarget
              left={index * entryLeftOffset}
              bottom={getClickTargetBottomPosition(entry.sgv)}
              width={entryLeftOffset}
              height={CLICK_TARGET_HEIGHT + POINT_DIAMETER}
              {...entryPointClickTargetHandlers}
            />
            <EntryPoint
              left={pointLeftPosition}
              bottom={getPointBottomPosition(entry.sgv)}
              isActive={isActive}
              background={GLUCOSE_POINT_COLOR}
              {...entryPointClickTargetHandlers}
            />
          </React.Fragment>
        }
        { showVelocity
          && <React.Fragment>
            <EntryPointClickTarget
              left={index * entryLeftOffset}
              bottom={getClickTargetBottomPosition(entry.velocity) + (GRAPH_HEIGHT / 2)}
              width={entryLeftOffset}
              height={CLICK_TARGET_HEIGHT + POINT_DIAMETER}
              {...entryPointClickTargetHandlers}
            />
            <EntryPoint
              left={pointLeftPosition}
              bottom={getPointBottomPosition(entry.velocity) + (GRAPH_HEIGHT / 2)}
              isActive={isActive}
              background={VELOCITY_COLOR}
              {...entryPointClickTargetHandlers}
            />
          </React.Fragment>
        }
        { showSmoothed
          && <React.Fragment>
            <EntryPointClickTarget
              left={index * entryLeftOffset}
              bottom={getClickTargetBottomPosition(entry.smoothed)}
              width={entryLeftOffset}
              height={CLICK_TARGET_HEIGHT + POINT_DIAMETER}
              {...entryPointClickTargetHandlers}
            />
            <EntryPoint
              left={pointLeftPosition}
              bottom={getPointBottomPosition(entry.smoothed)}
              isActive={isActive}
              background={SMOOTHED_COLOR}
              {...entryPointClickTargetHandlers}
            />
          </React.Fragment>
        }
        { showAcceleration
          && <React.Fragment>
            <EntryPointClickTarget
              left={index * entryLeftOffset}
              bottom={getClickTargetBottomPosition(entry.acceleration) + (GRAPH_HEIGHT / 2)}
              width={entryLeftOffset}
              height={CLICK_TARGET_HEIGHT + POINT_DIAMETER}
              {...entryPointClickTargetHandlers}
            />
            <EntryPoint
              left={pointLeftPosition}
              bottom={getPointBottomPosition(entry.acceleration) + (GRAPH_HEIGHT / 2)}
              isActive={isActive}
              background="green"
              {...entryPointClickTargetHandlers}
            />
          </React.Fragment>
        }
        { showProjection
          && <React.Fragment>
            <EntryPointClickTarget
              left={index * entryLeftOffset}
              bottom={getClickTargetBottomPosition(entry.minProjected)}
              width={entryLeftOffset}
              height={GLUCOSE_TO_PIXEL_SCALE * (entry.maxProjected - entry.minProjected) + CLICK_TARGET_HEIGHT}
              {...entryPointClickTargetHandlers}
            />
            <EntryProjection
              left={index * entryLeftOffset + (entryLeftOffset / 2) - (POINT_DIAMETER / 2)}
              bottom={GLUCOSE_TO_PIXEL_SCALE * entry.minProjected}
              height={GLUCOSE_TO_PIXEL_SCALE * (entry.maxProjected - entry.minProjected)}
              background={isActive ? ENTRY_PROJECTION_ACTIVE_COLOR : ENTRY_PROJECTION_COLOR}
              {...entryPointClickTargetHandlers}
            />
          </React.Fragment>
        }
        { showProjectionTwoPoint
          && <React.Fragment>
            <EntryPointClickTarget
              left={index * entryLeftOffset}
              bottom={getClickTargetBottomPosition(entry.minProjectedTwoPoint)}
              width={entryLeftOffset}
              height={GLUCOSE_TO_PIXEL_SCALE * (entry.maxProjectedTwoPoint - entry.minProjectedTwoPoint) + CLICK_TARGET_HEIGHT}
              {...entryPointClickTargetHandlers}
            />
            <EntryProjection
              left={index * entryLeftOffset + (entryLeftOffset / 2) - (POINT_DIAMETER / 2)}
              bottom={GLUCOSE_TO_PIXEL_SCALE * entry.minProjectedTwoPoint}
              height={GLUCOSE_TO_PIXEL_SCALE * (entry.maxProjectedTwoPoint - entry.minProjectedTwoPoint)}
              background={isActive ? 'rgba(128,0,128,0.7)' : 'rgba(128,0,128,0.2)'}
              {...entryPointClickTargetHandlers}
            />
          </React.Fragment>
        }
        {
          isActive && (
            <HoverCardContainer left={this.state.cursorX + 30} top={this.state.cursorY - 50} width={(showProjection || showProjectionTwoPoint) ? '120px' : '80px'}>
              <HoverCardHeader heading={getTimeStringFromDate(entry.date)} />
              { showGlucose && <HoverCardRow color="#000" value={entry.sgv} label="mg/dL" /> }
              { showProjection && <HoverCardRow color="#555" value={`${entry.minProjected}-${entry.maxProjected}`} label="projected" />}
              { showVelocity && <HoverCardRow color={VELOCITY_COLOR} value={entry.velocity} label="mg/dL*hr" />}
              { showAcceleration && <HoverCardRow color="green" value={entry.acceleration} label="mg/dL*hr^2" />}
              { showSmoothed && <HoverCardRow color={SMOOTHED_COLOR} value={entry.smoothed} label="mg/dL" />}
              { showProjectionTwoPoint && <HoverCardRow color="rgba(128,0,128,0.7)" value={`${entry.minProjectedTwoPoint}-${entry.maxProjectedTwoPoint}`} label="mg/dL" />}
            </HoverCardContainer>
          )
        }
      </React.Fragment>
    );
  }

  render() {
    const {
      showGlucose, showVelocity, showSmoothed, showProjection, isUploading
    } = this.state;

    return (
      <React.Fragment>
        <Navbar />
        <div style={{
          top: '57px',
          position: 'relative'
        }}>
          <GraphContainer width={`calc(100% - ${PANEL_WIDTH}px)`}>
            { this.state.entries && this.state.entries.map((entry, index) => this.renderEntry(entry, index)) }
            <HorizontalLine />
            <DateControlsContainer>
              <DateControlsButton onClick={this.handlePreviousClick}>Previous</DateControlsButton>
              <DateControlsButton onClick={this.handleNextClick}>Next</DateControlsButton>
              <DateLabel text={getDateStringFromDate(this.state.start)} />
            </DateControlsContainer>
            <LayerTogglesContainer>
              <LayerToggleButton onClick={this.toggleGlucose}>Glucose</LayerToggleButton>
              <LayerToggleButton onClick={this.toggleVelocity} color="secondary">Velocity</LayerToggleButton>
              <LayerToggleButton onClick={this.toggleSmoothed} color="primary">Smoothed</LayerToggleButton>
              <LayerToggleButton onClick={this.toggleAcceleration} additionalStyle={{ background: 'green', color: 'white' }}>Acceleration</LayerToggleButton>
              <LayerToggleButton onClick={this.toggleProjection} additionalStyle={{ background: ENTRY_PROJECTION_COLOR, color: 'white' }}>Projection</LayerToggleButton>
              <LayerToggleButton onClick={this.toggleProjectionTwoPoint} additionalStyle={{ background: 'purple', color: 'white' }}>2pt Projection</LayerToggleButton>
            </LayerTogglesContainer>
            { this.state.selectionStartIndex && this.state.selectionEndIndex && (
              <ExportContainer>
                { isUploading
                  && <InputBase
                    id="segment-name"
                    placeholder="Segment name"
                    autoFocus
                    style={{
                      background: 'white',
                      color: 'black',
                      borderRadius: '4px 0 0 4px',
                      fontSize: '13px',
                      padding: '1.25px 8px',
                      verticalAlign: 'bottom'
                    }}
                  />
                }
                <ExportButton
                  onClick={isUploading ? this.handleUpload : this.handleSaveSegmentClick}
                  additionalStyle={{
                    background: 'orange',
                    color: 'white',
                    borderRadius: isUploading ? '0 4px 4px 0' : '4px 4px 4px 4px',
                    verticalAlign: 'bottom'
                  }}>{ isUploading ? 'Upload' : 'Save Segment' }</ExportButton>
              </ExportContainer>
            )}
          </GraphContainer>
          <RightPanelContainer width={PANEL_WIDTH - 1}>
            { this.state.entries && this.state.entries && (
              <div style={{
                padding: '20px',
                color: 'white'
              }}>
                <h2
                  style={{
                    textAlign: 'center',
                    marginBottom: '25px'
                  }}
                >{ (this.state.selectionStartIndex && this.state.selectionEndIndex) ? 'Selection' : 'Overall' }</h2>
                <PanelUnit
                  isThird
                  name="Start"
                  value={getStartString(this.getSelectedEntries()) && getStartString(this.getSelectedEntries()).replace(' pm', '').replace(' am', '')}
                  unit={getStartString(this.getSelectedEntries()) && (getStartString(this.getSelectedEntries()).includes('am') ? 'am' : 'pm')}
                />
                <PanelUnit isThird
                  name="End"
                  value={getStartString(this.getSelectedEntries()) && getEndString(this.getSelectedEntries()).replace(' pm', '').replace(' am', '')}
                  unit={getStartString(this.getSelectedEntries()) && (getStartString(this.getSelectedEntries()).includes('am') ? 'am' : 'pm')}
                />
                <PanelUnit isThird name="Duration" value={getDurationString(this.getSelectedEntries())} />
                <PanelUnit name="Average" value={getAverage(this.getSelectedEntries())} unit="mg/dL" />
                <PanelUnit name="Std Dev" value={getStandardDeviation(this.getSelectedEntries())} unit="mg/dL" />
                <PanelUnit name="In Projection" value={getInProjection(this.getSelectedEntries()).inProjection} unit="%" />
                <PanelUnit name="Projection Diff" value={getInProjection(this.getSelectedEntries()).averageDiff} unit="%" />
                <p>&nbsp;</p>
                <PanelTableRow value="" units="" min="MIN" avg="AVG" max="MAX" />
                <PanelTableRow
                  value="Glucose"
                  units="mg/dL"
                  min={getMinimum(this.getSelectedEntries())}
                  avg={getAverage(this.getSelectedEntries())}
                  max={getMaximum(this.getSelectedEntries())}
                />
                <PanelTableRow
                  value="Velocity"
                  units="mg/dL*hr"
                  min={getMinimumVelocity(this.getSelectedEntries())}
                  avg={getAverageVelocity(this.getSelectedEntries())}
                  max={getMaximumVelocity(this.getSelectedEntries())}
                />
                <PanelTableRow
                  value="Acceleration"
                  units="mg/dL*hr^2"
                  min={getMinimumAcceleration(this.getSelectedEntries())}
                  avg={getAverageAcceleration(this.getSelectedEntries())}
                  max={getMaximumAcceleration(this.getSelectedEntries())}
                />
              </div>
            )}
          </RightPanelContainer>
        </div>
      </React.Fragment>
    );
  }
}

export default AnalysisApp;
