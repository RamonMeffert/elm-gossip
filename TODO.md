# To do

This file will act as both a to-do list and a log of finished features.

| Label    | Explanation                                                              |
| :-:      | :--                                                                      |
| ![hi]    | Implement ASAP, as this will help with the rest of the feature/project   |
| ![low]   | Implement when the main feature is done                                  |
| ![maybe] | Would be nice, but is probably a lot of work and is not really necessary |

## Features

### Protocol representation

- [ ] Representation of constituents
- [ ] Default protocols
- [ ] UI/UX ![low]
  - [ ] Nesting
  - [ ] Drag to reorder
  - [ ] Popup w/ possible consituents
  - [ ] Delete
  - [ ] Saving and/or Import/Export

### Call sequence analysis (depends on protocol implementation)

- [ ] Possibility
- [ ] Permissibility
- [ ] UI/UX ![low]
  - [ ] Make calls draggable elements (for easy call reordering)
  - [ ] Timeline navigation (previous/next call buttons)

### Gossip graph representation

- [ ] Input validation
  - Every agent should at least have their own number
- [ ] Graph analysis
  - [ ] Connectedness
  - [ ] Sun graph Y/N
- [ ] Visualize gossip graph
  - [ ] Pick graph rendering library. Options:
    - [dagre-d3](https://github.com/dagrejs/dagre-d3)
    - [d3-graphviz](https://github.com/magjac/d3-graphviz)
    - [viz.js](https://github.com/mdaines/viz.js/) (deprecated)
    - [elm-visualization](https://github.com/gampleman/elm-visualization)
- [ ] ![low] UI/UX
  - [ ] Currently a bidirectional relation is visualised as two arrows. While technically correct, this should really be one arrow with two heads.
  - [ ] ![maybe] Allow multiple text representations[^1] of graphs as input[^3]
  - [ ] ![maybe] WYSIWYG graph editing[^4]
- [x] [09-10-2020] ~~Integrate [elm-community/graph](https://package.elm-lang.org/packages/elm-community/graph/latest/)~~
- [x] [29-09-2020] ~~Write parser for short[^2] gossip graph representation~~

### Execution tree visualisation

- [ ] Limitation on n. of agents (trees get big fast)
- [ ] (More items T.B.D.)

### Miscellaneous

- [ ] ![low] Make the app look good
- [ ] Make code [citable](https://guides.github.com/activities/citable-code/) when a release version is done
- [ ] Figure out fitting license
- [ ] Clean up code and make sure documentation is complete

<!-- Footnotes -->

[^1]: Such as [DOT](https://www.graphviz.org/doc/info/lang.html), [TGF](https://en.wikipedia.org/wiki/Trivial_Graph_Format).
[^2]: As seen in van Ditmarsch, H., Gattinger, M., Kuijer, L. B., & Pardo, P. (2019). Strengthening Gossip Protocols using Protocol-Dependent Knowledge. _Journal of Applied Logics_, 6(1), 157–203.
[^3]: This might be hard, as generic input is not guaranteed to represent a gossip graph. Also might be hard to detect input type, but users could also select that manually.
[^4]: Quite hard, depending on what the libs support

<!-- Images -->

[low]: https://img.shields.io/badge/-low%20prio-yellow
[hi]: https://img.shields.io/badge/-high%20prio-red
[maybe]: https://img.shields.io/badge/-optional-%23eee
