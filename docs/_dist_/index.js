/* This file is needed for Snowpack.
*/

import json from './version.json.proxy.js';

// Import main Elm module
import Elm from './elm/Main.js';

// Import styles
import './styles/main.css.proxy.js';

// Initialize Elm
var app = Elm.Main.init({
  node: document.querySelector('main'),
  flags: json.version
});

// Port for better drag-and-drop support in Firefox
app.ports.dragstart.subscribe(function(event) {
  event.dataTransfer.setData('text', '');
});