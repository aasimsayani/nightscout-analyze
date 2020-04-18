import React from 'react';

const RightPanelContainer = ({ width, children }) => (
  <div
    style={{
      width,
      height: '800px',
      float: 'right',
      position: 'relative',
      background: '#1b1d1e',
      borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}
  >{children}</div>
);

const PanelTableRow = ({
  value, units, min, avg, max
}) => (
  <div style={{ height: '25px', textAlign: 'center' }}>
    <div style={{ width: '30%', float: 'left', textAlign: 'right' }}>{value || '.'}</div>
    <div style={{ width: '15%', float: 'left' }}>{min}</div>
    <div style={{ width: '15%', float: 'left' }}>{avg}</div>
    <div style={{ width: '15%', float: 'left' }}>{max}</div>
    <div style={{ width: '25%', float: 'left', textAlign: 'left' }}>{units}</div>
  </div>
);

const PanelUnit = ({
  name, value, unit, isThird
}) => (
  <div style={{
    width: isThird ? '33%' : '50%', height: '50px', float: 'left', textAlign: 'center'
  }}>
    <div style={{ color: '#777' }}>{name}</div>
    <div><span style={{ fontSize: isThird ? '18px' : '24px' }}>{value}</span> {unit}</div>
  </div>
);

export { RightPanelContainer, PanelTableRow, PanelUnit };
