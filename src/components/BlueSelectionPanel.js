import React from 'react';

const BlueSelectionPanel = ({ left, width, onClick }) => (
  <div
    style={{
      position: 'absolute',
      left,
      top: 0,
      width,
      height: '100%',
      cursor: 'pointer',
      zIndex: '0',
      background: 'rgba(56,157,218,0.01)'
    }}
    onClick={onClick}
  />
);

export default BlueSelectionPanel;
