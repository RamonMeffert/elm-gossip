/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    "public": "/",
    "src": "/_dist_"
  },
  plugins: [
    "@snowpack/plugin-sass",
    ["snowpack-plugin-elm", {
      "verbose": false,
      "debugger": "dev",
      "optimize": "build"
    }],
    // "@snowpack/plugin-optimize"
  ],
  install: [
    /* ... */
  ],
  installOptions: {
    /* ... */
  },
  devOptions: {
    "open": "none",
    "output": "stream"
  },
  buildOptions: {
    /* ... */
  },
  proxy: {
    /* ... */
  },
  alias: {
    /* ... */
  },
};