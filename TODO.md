# To do

This file will act as both a to-do list and a log of finished features.

| Label    | Explanation                                                              |
| :-:      | :--                                                                      |
| ![hi]    | Implement ASAP, as this will help with the rest of the feature/project   |
| ![low]   | Implement when the main feature is done                                  |
| ![maybe] | Would be nice, but is probably a lot of work and is not really necessary |
| ![eval1] | Should be finished for the first evaluation                              |

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
  - [ ] Timeline navigation (previous/next call buttons / changing zoom focus?)
- [x] [16-10-2020] ~~Call sequence parsing~~ ![eval1]

### Gossip graph representation

- [ ] Accept numbers _and_ letters as agent representation
- [ ] Input validation
  - The identity relation should for N should hold[^5]
  - Only allow letter input[^6]
- [ ] Graph analysis
  - [ ] Connectedness
  - [ ] Sun graph Y/N
- [x] [20-10-2020] ~~Visualize gossip graph~~ ![eval1]
  - [x] [29-09-2020] ~~Write parser for short[^2] gossip graph representation~~
  - [x] [09-10-2020] ~~Integrate [elm-community/graph](https://package.elm-lang.org/packages/elm-community/graph/latest/)~~
  - [x] [17-10-2020] ~~Pick graph rendering library.~~ ([rationale](./NOTES.md#rendering-graphs))
- [ ] ![low] UI/UX
  - [x] [10-10-2020] ~~Currently a bidirectional relation is visualised as two arrows. While technically correct, this should really be one arrow with two heads.~~
  - [ ] Allow multiple text representations[^1] of graphs as input[^3]
    - [ ] Automatic detection or toggle switch? 
    - [ ] Numeric input (`03-12-013 0-1-2-3`)
    - [ ] Shortcuts e.g. `I4` is identity for four agents, s.t. `I4` === `0-1-2-3`
    - [ ] DOT code as input ![maybe]
    - [x] ~~Letter input (`Abc aBc abC`)~~
  - [ ] ![maybe] WYSIWYG graph editing[^4]
  - [ ] ![maybe] Configurability, e.g. show identity relations

### Execution tree visualisation ![eval1]

- [ ] Tree w/ simplified visualisation (e.g. using letter representations in the appendix of [^2])
  - [ ] Show gossip graph on-click (popup?)
  - [ ] Graph to letter representation
- [ ] Limitation on n. of agents (trees get big fast)
- [ ] (More items T.B.D.)

### Miscellaneous

- [ ] ![low] Make the app look good
- [ ] Make code [citable](https://guides.github.com/activities/citable-code/) when a release version is done
- [ ] Figure out fitting license
- [ ] Clean up code and make sure documentation is complete
- [ ] Integrate `gulp` or something similar to streamline building

<!-- Footnotes -->

[^1]: Such as [DOT](https://www.graphviz.org/doc/info/lang.html), [TGF](https://en.wikipedia.org/wiki/Trivial_Graph_Format).

[^2]: As seen in van Ditmarsch, H., Gattinger, M., Kuijer, L. B., & Pardo, P. (2019). Strengthening Gossip Protocols using Protocol-Dependent Knowledge. _Journal of Applied Logics_, 6(1), 157–203.

[^3]: This might be hard, as generic input is not guaranteed to represent a gossip graph. Also might be hard to detect input type, but users could also select that manually.

[^4]: Quite hard, depending on what the libs support

[^5]: Maybe? Currently, the system allows a set of agents where only one agent has information, e.g. `"␣␣abc"` (␣ is a space). This notation indicates that agents `a` and `b` know nothing, and agent `c` has the numbers of `a`, `b` and `c`.

[^6]: This actually does create a bit of an unnecessary limitation, as Elm's `Char.isLower` and `Char.toLower` (and related functions) are very limited. They only support the latin alphabet, even though other alphabets also have lower- and uppercase characters, notably Cyrillic and Greek (`Char.isLower ш` and `Char.isLower ω` return `False`). However, it is unlikely this system will support more than 26 agents, so it is not a _real_ problem -- it would only be a problem if this tool were to be extended.

<!-- Images -->

[low]: https://img.shields.io/badge/-low%20prio-yellow
[hi]: https://img.shields.io/badge/-high%20prio-red
[maybe]: https://img.shields.io/badge/-optional-%23eee
[eval1]: https://img.shields.io/badge/-1st%20evaluation-blue
