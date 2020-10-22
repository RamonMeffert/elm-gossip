# Notes

This is a place where I collect notes on things (problems, ideas, ...) I come
accross while working on this project.

## Execution trees: processing, rendering and efficiency

October 22, 2020

I'm working on the implementation of execution trees, and I need to type out how this should work to organize my thoughts a bit.

### How do execution trees work?

One of the main goals of this project is being able to visualise execution trees. That means that given some initial gossip graph `G` and a protocol `P`, we apply `P` to `G`. Because a protocol can yield multiple calls, this will cause branching. To generate an execution tree, we simply execute `P` on all branches and repeat until (1) there are no more possible calls, or (2) an infinite loop is encountered. Condition 1 is easy: if applying `P` to some graph `G_n` in the execution tree yields no possible calls, we have reached a leaf. Condition 2, however, is a bit harder: how do we check for infinite loops? Protocols like `ANY` allow call sequences of the form `ab;ab;ab;...`. Do we consider any sequence where the last call is the same as the second to last call infinite? This might be a good heuristic, as no extra information is exchanged in repeated calls (assuming synchronous sequential calls), but it does exclude sequences like `ab;ab;bc`. I think this might actually be a good thing, though: If the protocol allows the call sequence `σ;ab;bc`, then allowing `σ;ab;ab;bc` does not really make sense, as you're basically duplicating branches that way.

### Rendering and efficiency

Rendering execution trees could be a very heavy operation. Therefore, it is important to think about efficiency in the rendering algorithm. A naive approach would be to take some initial gossip graph `G`, find all possible calls using some protocol `P` and generate a set of new graphs based on those calls. Depending on the connectedness of the initial graph, this might lead to a lot of new graphs that only differ in one edge and at most two nodes.

Therefore, to increase efficiency, it might be useful to represent nodes in the execution tree as the difference compared to the previous nodes. This could be represented as just the set of nodes and edges that have changed.

#### Space efficiency

Let me backtrack for a bit: Why do we need to keep rendering efficiency in mind? This has to do with the library I am using to render gossip graphs, `gampleman/elm-visualization`. This library renders graphs using a physics simulation. To achieve a stable (i.e. good-looking) graph, it needs to run the simulation for a number of ticks, 300 by default. For bigger graphs, this might be computationally expensive. However, if we render the initial gossip graph using this method once, we can update the (accurate) graph for much less computational cost. Therefore, if the execution tree contains one initial graph and a set of graph differences, possibly annotated with metadata ("this node is a leaf because there are no calls/it results in an infinite loop"), rendering any node in the tree is trivial: Take the initial graph, traverse up from the node to collect the graph differences, and apply all differences (in reverse order) to achieve the updated graph. This way we can compute the execution tree, save the result efficiently (size will be `size(initial_graph) + n_calls * size(changeset)` instead of `size(initial_graph) * n_calls` ).

#### Time efficiency

So the above handles _space efficiency_. That's nice, but how about time efficiency? Right now, we still have to compute all successor graphs to find the graph differences. There are two key observations that can improve efficiency here:

  1. Calculating successor graphs might result in duplicate graphs;
  2. For most calls, we can take an earlier successor to calculate the difference;

I will explain these two observations in more detail. The first is very easy to explain: Say we have an initial gossip graph that allows the calls `ab`, `bc` and `cd`. If we then take the successor graphs of the calls `ab` (`G1`) and `cd` (`G2`), and say that for `G1` the call `cd` is allowed, and for `G2` the call`ab` is allowed, we now have two branches that we can represent by the call sequences `ab;cd` and `cd;ab`. These obviously result in the same graph<sup>1</sup>. Hence, we do not need to calculate the successor graph again; we can just take the set difference of the changesets of the first and second branch to find the new changeset for the second branch. That way, we need to calculate calls resulting in the same successor only once, and can do simple lookup most of the time.

The second observation relies on the fact that calls result in local changes. Finding a changeset normally would require taking the parent graph and applying a call to it to find the successor. However, we might be able to use an earlier parent to calculate the changeset. If we need to find the changeset resulting from a call `xy` on graph `G`, and the nodes that are involved are not in the changeset of the parent, we can just take the parent of the parent to calculate the changeset. That way, we need to calculate fewer full graphs. Do note though, that this is only the case if none of the agent in the calls from a node are in the changeset of the parent.

These observations are, as of now, ideas; I need to do some testing and possibly some more calculations to see how much of an improvement this will yield.

<sup><sup>1</sup>I should double-check this to make sure, ideally with a proof (induction?). Definitely only holds if the initial graph is the same.</sup>

## Papers on gossip

October 21, 2020

While working on this project, I'm also reading up on gossip literature. I found a paper talking about gossip protocols
in distributed databases that I thought had a pretty neat idea on how to determine stability:

> _Rumor mongering:_ sites are initially "ignorant"; when a site receives a new update it becomes a "hot rumor"; while a site holds a hot rumor, it periodically chooses another site at random and ensurees that the other site has seen the update; when a site has tried to share a hot rumor with too many sites that have already seen it, the site stops treating the rumor as hot and retains the update without propagating it further. [...]
>
> —Demers et al., [1988](https://doi.org/10/fmhpvg)

I think the main reason I like it is because it has such a clear real-world equivalent: you can explain this algorithm to anyone, and they will understand it. It might be interesting (if time allows it, and if it is within the scope of the project) to include something like this.

_(Note: I haven't read the full paper yet, only the introduction. So my opinion of this might change)_

## Rendering graphs

October 17, 2020

An important part of this project is visualisation. Therefore, it makes sense to take some time to think on how to best do this. In practice, this comes down—at least for a big part—to picking the right library. Before listing the options I am considering, I'll list my considerations in the form of a [MoSCoW][moscow].

### Must-haves

The library...

- Must be able to **render directed graphs** with named nodes and different edge styles
  - By directly interacting with `elm-community/graph`, or
  - By interacting with an output format supported by `elm-community/graph`
- Must be able to render said graph such that the visualisation **updates in real time**, or at least near real time

### Should-haves

The library...

- Should **integrate with Elm**
  - Either directly, or by using Elm's [ports][ports]
- Should be **maintained**
  - That is, it should use modern standards and be updated (somewhat) regularly

### Could-haves

The library...

- Could have a way to **handle user input** to make the visualisation more interactive
  - An extended goal of this project is to increase usability by being more WYSIWYG

### Won't-haves

The library...

- Won't have the need for lots of **additional code in another language**, like Javascript

### Libraries

So far, I have found the following libraries (ordered by when I found them):

- [dagre-d3](https://github.com/dagrejs/dagre-d3)
- [d3-graphviz](https://github.com/magjac/d3-graphviz)
- [viz.js](https://github.com/mdaines/viz.js/)
- [elm-visualization](https://package.elm-lang.org/packages/gampleman/elm-visualization/latest/)
- [typed-svg](https://package.elm-lang.org/packages/elm-community/typed-svg/latest/)
- [graphvizlib.wasm](https://github.com/hpcc-systems/hpcc-js-wasm#graphviz-graphvizlibwasm)

There are, without a doubt, more libraries that can do this, and I'll keep looking for others while working on the project. However, these seem like decent options. I'll go over them one by one to evaluate them, and eventually pick a ‘winner’.

#### dagre-d3

##### Pros

- 😃 Nice looking output
- 😃 Accepts DOT code as input
- 😃 When used for DOT code visualisation, requires little extra Javascript
- 😃 Maintained (Updated less than a year ago)

##### Cons

- 😕 Does way more than just graph visualisation so might be a bit overkill
- 😕 Some pretty big dependencies
- 😕 Using extra features requires Javascript

**Dependencies**: lodash, graphlib, dagre, (maybe d3? It's in the name, but it's not listed)

#### d3-graphviz

##### Pros

- 😃 Nice looking output
- 😃 Accepts DOT code as input (i.e. it just works)
- 😃 Supports animations
- 😃 Uses a version of GraphViz compiled to WebAssembly, so compatibility guaranteed
- 😃 Maintained (Updated less than a year ago)

##### Cons

- 😕 Includes a warning that animations might make things slow

**Dependencies**: d3, graphvizlib.wasm

#### viz.js

Suggested in the `elm-community/graph` documentation, but is deprecated. Suggests using Dagre instead. (see above)

#### elm-visualization

##### Pros

- 😃 Written in Elm, so integration and interaction is very nice
- 😃 Actively maintained (Updated about a month ago)
- 😃 The only real way to make satisfying the could-haves a possibility<sup>1</sup>

##### Cons

- 😕 Does way more than just graph visualisation so might be a bit overkill
- 😕 Requires writing some code to render graphs (doesn't work out-of-the-box)

**Dependencies**: (all Elm packages) elm-color, list-extra, one-true-path-experiment, elm-geometry, elm-units-prefixed, time-extra, date-format

#### typed-svg

##### Pros

- 😃 Written in Elm, so integration and interaction is very nice
- 😃 Just SVG, so output is extremely flexible and extensible
- 😃 Also (like `elm-visualization`) allows user interaction

##### Cons

- 😕 Pretty hardcore: all rendering code has to be implemented from scratch

**Dependencies**: (Elm package) avh4/elm-color

#### graphvizlib.wasm

##### Pros

- 😃 It's just GraphViz, but on the web

##### Cons

- 😕 It's just GraphViz, but on the web

**Dependencies**: None

### Conclusion

I want to see if using `elm-visualisation` is feasible, as it allows for best integration and keeps the could-haves achievable. If that doesn't work, I'll probably switch to `d3-graphviz`.

---

<sup><sup>1</sup>This is _technically_ also possible with some of the javascript libraries, but would require using ports _a lot_, which I frankly would like to avoid if possible</sup>

[moscow]: https://en.wikipedia.org/wiki/MoSCoW_method
[ports]:  https://guide.elm-lang.org/interop/ports.html

## Minor annoyances with Elm

October 16, 2020

These thing's don't really matter, but they do bother me a bit. Do note that I still _like_ elm, it's just that sometimes I miss features and/or syntax from other languages.

### Pattern matching

Why is using `case` the only way to do pattern matching? This often causes some pretty deep indentation, especially when following the elm style guidelines (i.e. a newline and added indentation after the `->` symbol).
A good example is when matching sub elements of lists:

```elm
match : List Int -> List Int
match list =
    case list of
        [] ->
            []

        x :: xs ->
            case x of
                1 ->
                    (20 :: match xs)

                2 ->
                    (10 :: match xs)

                _ ->
                    (-1 :: match xs)
```

In Haskell, this would like like this. We can use the fact that you can match patterns in the function definition as well as guards<sup>1</sup> to make the code a lot more compact.

```haskell
match :: [Int] -> [Int]
match [] = []
match (x:xs)
    | x == 1 = (20 : match xs)
    | x == 2 = (10 : match xs)
    | otherwise = (-1 : match xs)
```

See what I mean? In Elm, the `case` statement looks the cleanest to me in most scenarios, but it often does not suffice, leaving you to the `if`-`else` construction that, granted, takes up fewer lines, but does introduce more visual clutter (note how the conditions aren't aligned):

```elm
match : List Int -> List Int
match list =
    case list of
        [] ->
            []

        x :: xs ->
            if x == 1 then
                (20 :: match xs)

            else if x == 2 then
                (10 :: match xs)

            else
                (-1 :: match xs)
```

### Strings and lists

_Why_ aren't strings lists. Every other functional language does this, but in Elm I have to deal with `String.toList` and `String.fromList`.

### Method signatures and concat

_Why_ did Elm feel the need to switch the `:` and `::` operators. Both F# and Haskell, which I think were the main inspirations for Elm, have them the other way around.

### Shorthand (?) lambda functions

This is a really minor nitpick, but I just like writing `filter (==5) [..]` a bit better than `filter (\x -> x == 5) [..]`.

### (Infix) operators

The ability to define infix operators was [removed in Elm 0.19][infix-removed]. Huh. No `(!!)` for me I guess

---

<sup><sup>1</sup> It seems like Elm [used to have guards][guards], but they were removed.</sup>

[infix-removed]: https://gist.github.com/evancz/769bba8abb9ddc3bf81d69fa80cc76b1#root-design-goal
[guards]: https://stackoverflow.com/a/23201661/4545692

## Validation

Oct 15, 2020

Just so I don't forget: Elm has a useful `andThen` operator that can be used to chain method calls for validation.
It is somewhat comparable to the `do` notation or the `>>=` operator in Haskell.
By using `andThen`, and implementing `validate` functions for the parsers, validation and parsing could be quite clean.

_A few hours pass_

Actually, in order for this to work, I'll need the [`Result`][result] type.
I'm not yet sure if the validation should be inside the `parse` function or if it should be separate,
but given the way `Result` works, I'm leaning towards inside `parse`.
That is, it'll be a separate function that is called inside the `parse` function, it just won't be exposed.

[result]: https://package.elm-lang.org/packages/elm/core/latest/Result

## Sets

Oct 10, 2020

I've found that `Set`s in Elm are useless if you want to use them for anything other than the types that Elm has predefined to be `comparable` (`Int`, `Float`, ...).
Ideally, I would have used a `Set` to store the agents in the current graph.
However, due to the above limitation, this is not possible -- my `Agent` type alias is a record, which is not `comparable`.
I wish Elm would support type classes. I did come across a [blog post][elm-is-wrong] where the author ran into the same problem.

Guess I'll be using `List` for now.

[elm-is-wrong]: https://reasonablypolymorphic.com/blog/elm-is-wrong/
