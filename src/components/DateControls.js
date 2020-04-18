import React from 'react';
import { Button } from '@material-ui/core';

const DateControlsContainer = ({ children }) => (
  <div
    style={{
      left: '0px',
      top: '10px',
      position: 'absolute'
    }}
  >{children}</div>
);

const DateControlsButton = ({ children, ...otherProps }) => (
  <Button
    variant="contained"
    style={{
      marginLeft: '10px',
      fontSize: '11px'
    }}
    {...otherProps}
  >{children}</Button>
);

const DateLabel = ({ text }) => (
  <span
    style={{
      fontSize: '16px',
      marginLeft: '15px',
      color: 'white'
    }}
  >{text}</span>
);

export { DateControlsContainer, DateControlsButton, DateLabel };
