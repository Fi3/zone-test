import {App} from '../src/app.jsx'; // eslint-disable-line no-unused-vars
import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDom from 'react-dom';
require('./mystyles.scss');

const mountNode = document.getElementById('main');

//$FlowFixMe
ReactDom.render(<App />, mountNode);
