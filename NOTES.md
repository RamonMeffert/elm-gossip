# Notes

This is a place where I collect notes on things (problems, ideas, ...) I come
accross while working on this project.

## Sets

Oct 10, 2020

I've found that `Set`s in Elm are useless if you want to use them for anything other than the types that Elm has predefined to be `comparable` (`Int`, `Float`, ...).
Ideally, I would have used a `Set` to store the agents in the current graph.
However,due to the above limitation, this is not possible -- my `Agent` type alias is a record, which is not `comparable`.
I wish Elm would support type classes. I did come across a [blog post][elm-is-wrong] where the author ran into the same problem.

Guess I'm using a `List` for now.

[elm-is-wrong]: https://reasonablypolymorphic.com/blog/elm-is-wrong/