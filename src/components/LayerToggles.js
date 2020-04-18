import React from 'react';
import { Button } from '@material-ui/core';

const LayerTogglesContainer = ({ children }) => (
  <div
    style={{
      top: '10px',
      right: '0',
      position: 'absolute'
    }}
  >{children}</div>
);

const LayerToggleButton = ({ children, additionalStyle = {}, ...otherProps }) => (
  <Button
    variant="contained"
    style={{
      marginRight: '10px',
      fontSize: '11px',
      ...additionalStyle
    }}
    {...otherProps}
  >{children}</Button>
);

export { LayerTogglesContainer, LayerToggleButton };
