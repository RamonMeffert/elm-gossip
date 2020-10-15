module Helpers.Tuple exposing (..)

{-| Swaps the elements in a tuple.

    swap (1, 2) == (2, 1)

-}
swap : ( a, a ) -> ( a, a )
swap ( a, b ) =
    ( b, a )
