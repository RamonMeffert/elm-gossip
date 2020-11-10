/* This file is needed for Snowpack.
*/

// Import main Elm module
import Elm from './elm/Main.elm';

// Import styles
import './styles/main.scss';

// Initialize Elm
Elm.Main.init({
  node: document.querySelector('main'),
});