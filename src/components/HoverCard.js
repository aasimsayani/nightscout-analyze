import React from 'react';

const HoverCardContainer = ({
  left, top, width, children
}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      padding: '8px 12px',
      background: 'white',
      color: '#333',
      zIndex: '2',
      textAlign: 'center',
      width
    }}
  >{children}</div>
);

const HoverCardRow = ({ color, value, label }) => (
  <div style={{ margin: '6px 0', clear: 'both' }}>
    <div
      style={{
        width: '50%',
        float: 'left',
        textAlign: 'right',
        color,
        fontWeight: 'bold'
      }}
    >{value} &nbsp;</div>
    <div
      style={{
        width: '50%',
        float: 'right',
        textAlign: 'left',
        fontSize: '9px',
        paddingTop: '3px'
      }}
    >{label}</div>
  </div>
);

const HoverCardHeader = ({ heading }) => (
  <div style={{
    margin: '6px 0', fontSize: '16px', clear: 'both', color: '#555'
  }}>{heading}</div>
);

export { HoverCardContainer, HoverCardRow, HoverCardHeader };
