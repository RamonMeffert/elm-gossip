# Notes

This is a place where I collect notes on things (problems, ideas, ...) I come
accross while working on this project.

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

<sup><sup>1</sup> It seems like elm [used to have guards][guards], but they were removed for some reason.</sup>

[guards]: https://stackoverflow.com/a/23201661/4545692

### (Infix) operators

The ability to define infix operators was [removed in Elm 0.19][infix-removed]. Huh. No `(!!)` for me I guess

[infix-removed]: https://gist.github.com/evancz/769bba8abb9ddc3bf81d69fa80cc76b1#root-design-goal

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
