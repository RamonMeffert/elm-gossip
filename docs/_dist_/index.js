/* This file is needed for Snowpack.
*/

// Import main Elm module
import Elm from './elm/Main.js';

// Import styles
import './styles/main.css.proxy.js';

// Initialize Elm
Elm.Main.init({
  node: document.querySelector('main'),
});