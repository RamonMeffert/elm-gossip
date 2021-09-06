# ElmGossip: Explore dynamic gossip in your browser

> **NOTE**: This is an _anonymized_ version of the tool and repository. Therefore, _some_ information that included references to the author(s) might be missing.

ElmGossip is a web tool for exploring and analysing dynamic gossip, built in [Elm](https://elm-lang.org).
The tool is available [online](https://ipfs.io/ipfs/QmNkZ9sZ6AYWnjitGAj49JEvgyG8UHMCtrr2HuGJaSskyA) if you have access to [IPFS](https://ipfs.io), or you can follow the [instructions](#running-locally) below to run the tool locally.
In general, we advise using the online version unless you plan to do anything with the source code.

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

### Future ideas

- Mobile support
- Turn the site into a Progressive Web App for offline access

## Running locally

If you want to build this project yourself, you'll need [`yarn`][1] (or,
alternatively, [`npm`][1]). Clone the repository, and follow the instructions
below:

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