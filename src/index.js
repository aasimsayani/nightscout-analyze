import React from 'react';
import ReactDOM from 'react-dom';

import AnalysisApp from './components/AnalysisApp';

ReactDOM.render(
  <AnalysisApp />,
  document.getElementById('entrypoint')
);

module.hot.accept();
