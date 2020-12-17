# Tools for Gossip

![Deployment status](https://img.shields.io/github/workflow/status/ramonmeffert/tools-for-gossip/Deployment/gh-pages)

This repository contains the code for my Bachelors' Project Artificial Intelligence. 
The project is a tool to visualise and manipulate gossip protocols.
It allows you to work on gossip graphs using an easy-to-use interface directly on the web.

## Usage

The most recent version of the project can be found on [GitHub pages](https://ramonmeffert.github.io/tools-for-gossip). 
This version is regularly updated when changes are made to the project.
If you want to build and run the project yourself, please refer to the information below.

## Features

- Visualise gossip graphs
- See what calls are allowed under several protocols
- Check whether call sequences are allowed on a graph given a protocol, and execute the sequences if they are allowed
- Time-travel between multiple graph states after executing calls

### Work in progress features

- Create your own custom gossip protocols
- Visualise the execution tree for a graph and a protocol

You can track the progress of these features on the [Issues](https://github.com/RamonMeffert/tools-for-gossip/issues) page.
Besides the features mentioned above, I am also working on improving the stability and user experience of the application.

## Running locally

If you want to build this project yourself, you'll need [`yarn`][1] or [`npm`][1].

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

This will generate a `/docs/`<sup>1</sup> directory. You can upload this directory to a web server or run a local web server from this directory (e.g. `python3 -m http.server`) to see the project.

---

<sup><sup>1</sup> To deploy to GitHub Pages, the folder has to be called `docs`.</sup>

<!--Urls-->

[1]: https://yarnpkg.com/
[2]: https://www.npmjs.com/
