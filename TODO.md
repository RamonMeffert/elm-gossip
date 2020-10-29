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

- [x] Representation of constituents
- [x] Default protocols
- [ ] Way to run protocols
- [ ] Building protocols dynamically by combining constituents in the ui
- [ ] UI/UX ![low]
  - [ ] Nesting
  - [ ] Drag to reorder
  - [ ] Popup w/ possible consituents
  - [ ] Delete
  - [ ] Saving and/or Import/Export

### Call sequence analysis (depends on protocol implementation)

- [ ] Permissibility ![next]
- [ ] Consider using `elm/parser` instead of "homemade" parsing
- [ ] Consider saving call sequences in reverse: changes lookup time of the last call from O(n) to (1)
  - It seems like the last call is needed (way) more frequently than the first call. Makes sense.
- [ ] UI/UX ![low]
  - [ ] Make calls draggable elements (for easy call reordering)
  - [ ] Timeline navigation (previous/next call buttons / changing zoom focus?)
- [x] [16-10-2020] ~~Possibility~~ (Parsing checks for possibility)
- [x] [16-10-2020] ~~Call sequence parsing~~

### Gossip graph representation

- [ ] Graph analysis ![next]
  - [ ] Connectedness
  - [ ] Sun graph Y/N (might actually be easy; `elm-community/graph` has a cyclicity checker, that's at least 50% of the work done already)
- [ ] Normalized agent string (fully alphabetical or fully numerical)
  - i.e. even if the input is `Fxl fEXl fL`, generate a string like `Acd aBCd aCD D` (or its numerical equivalent)
- [ ] Consider using `elm/parser` instead of "homemade" parsing
  - Iff `elm/parser` can deal with indexed input.
- [ ] Accept numbers _and_ letters as agent representation
- [ ] Input validation
  - [ ] The identity relation for N and S should always be satisfied
    - **either** Flag input as incorrect w/ error;
      - 😕 bad ux
      - 😃 easy
    - **or** Give a warning and add implied identity relations.
      - 😃 good ux
      - 😕 might be unclear to some users
  - [ ] Input should be in correct format
    - [ ] Numeric (`03-20-123 0-1-2-3`) or alphabetic (`Abc ABC abC`)
    - [ ] Different separators
      - [ ] **either** always allow multiple (possibly arbitrary) separators in input, and give a warning when more than one is used
        - 😃 good ux
        - 😕 how would number input work, as it needs 2 different separators?
      - [ ] **or** reject input when separators are inconsistent
        - 😕 bad ux
        - 😃 easy
  - [ ] Input should not contain unconnected nodes (?)
    - [ ] If no one can reach a node, it will never be included in any call sequence. So: warning and remove, or error?
- [ ] Fix gossip graph rendering
- [x] [20-10-2020] ~~Visualize gossip graph~~
  - [x] [29-09-2020] ~~Write parser for short[^2] gossip graph representation~~
  - [x] [09-10-2020] ~~Integrate [elm-community/graph](https://package.elm-lang.org/packages/elm-community/graph/latest/)~~
  - [x] [17-10-2020] ~~Pick graph rendering library.~~ ([rationale](./NOTES.md#rendering-graphs))
- [ ] ![low] UI/UX
  - [x] [10-10-2020] ~~Currently a bidirectional relation is visualised as two arrows. While technically correct, this should really be one arrow with two heads.~~
  - [ ] Allow multiple text representations[^1] of graphs as input
    - [ ] Automatic detection or toggle switch?
    - [ ] Numeric input (`03-12-013 0-1-2-3`)
    - [ ] Shortcuts e.g. `I4` is identity for four agents, s.t. `I4` === `0-1-2-3`
    - [ ] DOT code as input[^3] ![maybe]
    - [x] ~~Letter input (`Abc aBc abC`)~~
  - [ ] ![maybe] WYSIWYG graph editing[^4]
  - [ ] ![maybe] Configurability, e.g. show identity relations

### Execution tree visualisation

- [ ] Find possible calls in current state ![next]
- [ ] Tree w/ simplified visualisation (e.g. using letter representations as in the appendix of [^2])
  - [ ] Tree rendering
  - [ ] Show gossip graph on-click (popup?)
  - [ ] For efficiency: consider using some kind of `diff` tree instead of a tree of full graphs.
        Maybe save the updating functions in the tree nodes instead of the graph?
        This might have some consequences for rendering, though.
  - [x] [21-10-2020] ~~Graph to letter representation~~
- [ ] Data model for representing protocols
  - [ ] Implementation of at least 1 protocol
- [ ] Infinite loop check (e.g. for ANY)
- [ ] Limitation on n. of agents (trees get big fast)

### Miscellaneous

- [ ] ![hi] Rethink application structure. Maybe take the types in the `Types` folder and create folders for them instead of having them separated like this? Then they could have separate modules if needed. Then also separate things that now contain types to their own directory, so we can have `GossipGraph.Renderer` instead of `Renderers.GossipGraph`.
- [ ] Show more output in the UI, even if not fully finished ![next]
  - Call Sequence rendering + error messages
  - Creating gossip graph string from graph representation (normalized?)
- [ ] ![low] Make the app look good
- [ ] Make code [citable](https://guides.github.com/activities/citable-code/) when a release version is done
- [ ] Set up release on github pages when project is presentable
- [ ] Figure out fitting license
- [ ] Check consistency of argument order / figure out rationale behind argument order for consistency
  - possibly: if a function f works on two related arguments, these arguments should be the first arguments. Act as if the function _could_ be written using infix notation, e.g. a check if agents are equal in a graph: `equals x y graph` => ``x `equals` y graph`` (actually, is this a thing you can do in haskell? I'm not 100% sure)
- [x] [21-10-2020] ~~Integrate `gulp` or something similar to streamline building~~ (using yarn/npm scripts for now)

<!-- Footnotes -->

[^1]: Such as [DOT](https://www.graphviz.org/doc/info/lang.html), [TGF](https://en.wikipedia.org/wiki/Trivial_Graph_Format).

[^2]: As seen in van Ditmarsch, H., Gattinger, M., Kuijer, L. B., & Pardo, P. (2019). Strengthening Gossip Protocols using Protocol-Dependent Knowledge. _Journal of Applied Logics_, 6(1), 157–203.

[^3]: This might be hard, as generic input is not guaranteed to represent a gossip graph. Also might be hard to detect input type, but users could also select that manually.

[^4]: Quite hard, depending on what the libs support

[^6]: This actually does create a bit of an unnecessary limitation, as Elm's `Char.isLower` and `Char.toLower` (and related functions) are very limited. They only support the latin alphabet, even though other alphabets also have lower- and uppercase characters, notably Cyrillic and Greek (`Char.isLower ш` and `Char.isLower ω` return `False`). However, it is unlikely this system will support more than 26 agents, so it is not a _real_ problem -- it would only be a problem if this tool were to be extended.

<!-- Images -->

[low]: https://img.shields.io/badge/-low%20prio-yellow
[hi]: https://img.shields.io/badge/-high%20prio-red
[maybe]: https://img.shields.io/badge/-optional-%23eee
[eval1]: https://img.shields.io/badge/-1st%20evaluation-blue
[next]: https://img.shields.io/badge/-next%20meeting-blue
