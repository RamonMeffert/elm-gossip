/* This file is needed for Snowpack.
*/

import json from './version.json';

// Import main Elm module
import Elm from './elm/Main.elm';

// Import styles
import './styles/main.scss';

// Initialize Elm
var app = Elm.Main.init({
  node: document.querySelector('main'),
  flags: json.version
});

// Port for better drag-and-drop support in Firefox
app.ports.dragstart.subscribe(function(event) {
  event.dataTransfer.setData('text', '');
});