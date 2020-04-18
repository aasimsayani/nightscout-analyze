import React from 'react';
import { Button } from '@material-ui/core';

const ExportContainer = ({ children }) => (
  <div
    style={{
      bottom: '10px',
      right: '0',
      position: 'absolute'
    }}
  >{children}</div>
);

const ExportButton = ({ children, additionalStyle = {}, ...otherProps }) => (
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

export { ExportContainer, ExportButton };
