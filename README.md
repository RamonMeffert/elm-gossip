# ElmGossip: Explore dynamic gossip in your browser

[![Website](https://img.shields.io/website?url=https%3A%2F%2Framonmeffert.github.io%2Felm-gossip%2F)](https://ramonmeffert.github.io/elm-gossip/)
[![License](https://img.shields.io/github/license/ramonmeffert/elm-gossip)](https://github.com/RamonMeffert/elm-gossip/blob/master/LICENSE)

ElmGossip is a web tool for exploring and analysing dynamic gossip, built in [Elm](https://elm-lang.org).
The tool is available [online](https://ramonmeffert.github.io/elm-gossip/), or you can follow the [instructions](#running-locally) below to run the tool locally.
In general, we advise using the online version unless you plan to do anything with the source code.

## About

This tool began its life as part of my [bachelor's thesis](https://fse.studenttheses.ub.rug.nl/23961/).
Since finishing my thesis, I have been working on implementing new features and polishing the tool.

## Features

- 👁 Visualise gossip graphs
- ☎️ See which calls are allowed for any protocol
- ✅ Validate and execute call sequences
- ⏰ Time-travel between multiple graph states after executing calls
- 🛠 Create your own custom gossip protocols
- 🌳 Generate execution trees
- ⚠️ Helpful and human-oriented error messages
- 🪶 Lightweight<sup>1</sup>

### In progress

- Successfulness analysis  
  _That is, whether some protocol is weakly/strongly successful on a given graph_
- GraphViz and LaTeX export  
  _Making it easy to use graphs and protocol formulae in other places_
- Saving the state of the tool to LocalStorage  
  _So you don't lose your work when navigating away from the page_
- Saving and loading custom protocols  
  _Transferability!_
- Dark mode  
  _🌚_

You can track the progress of these features on the [issues](/RamonMeffert/elm-gossip/issues) page.

### Future ideas

- Mobile support ([#75](/RamonMeffert/elm-gossip/issues/75))
- Turn the site into a Progressive Web App for offline access

## Running locally

If you want to build this project yourself, you'll need [`yarn`][1] (or, alternatively, [`npm`][1]).

To install:

```sh
yarn install # or npm install
```

## Building and running

If you just want to run the project, you can run a live-reload server in development mode:

```sh
yarn start # or npm start
```

If you want to build a release, you can run the following command:

```sh
yarn build # or npm build
```

This will generate a `docs`<sup>2</sup> directory. You can upload this directory to a web server or run a local web server from this directory (e.g. `python3 -m http.server`) to see the project. Since Elm is compiled to Javascript, uploading the compiled files is all you need to do – you don't have to start a web server as everything runs client side.

---

<sup><sup>1</sup> The entire application, bundled for production, weighs in at around 200kb. That includes compiled js, css, images and all favicons – most of which you won't even load, since they are platform-specific. For example, when loading the application on Firefox, only 129.29KB (45.73KB gzipped) is downloaded.</sup>  
<sup><sup>2</sup> The application is configured for deployment to GitHub Pages, which expects a `docs` directory.</sup>

<!--Urls-->

[1]: https://yarnpkg.com/
[2]: https://www.npmjs.com/
