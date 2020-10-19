module Helpers.General exposing (..)

{-| General helper functions
-}


{-| transforms a function that normally accepts two arguments into one that accepts a tuple
-}
uncurry : (a -> b -> c) -> ( a, b ) -> c
uncurry f ( a, b ) =
    f a b


{-| transforms a function that normally accepts a tuple into one that accepts two arguments
-}
curry : (( a, b ) -> c) -> a -> b -> c
curry f a b =
    f ( a, b )
