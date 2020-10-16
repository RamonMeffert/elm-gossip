module Helpers.List exposing (distinct, dropWhile, takeWhile, find, get)

{-| This module contains some useful functions on list. Generally based on their
availability in Haskell.
-}

{-| Returns the unique elements in a list.

    distinct [ 'a', 'a', 'a' ] == [ 'a' ]

-}
distinct : List a -> List a
distinct list =
    let
        distinctAcc l acc =
            case l of
                [] ->
                    List.reverse acc

                x :: xs ->
                    if List.member x acc then
                        distinctAcc xs acc

                    else
                        distinctAcc xs (x :: acc)
    in
    distinctAcc list []


{-| Returns the items in a list up until an item matching a function is given.

    takeWhile (\n -> n < 5) [ 1, 3, 5, 7 ] == [ 1, 3 ]

-}
takeWhile : (a -> Bool) -> List a -> List a
takeWhile f xs =
    let
        trav : (a -> Bool) -> List a -> List a -> List a
        trav fun list acc =
            case list of
                [] ->
                    List.reverse acc

                y :: ys ->
                    if not <| fun y then
                        List.reverse acc

                    else
                        trav fun ys (y :: acc)
    in
    trav f xs []


{-| Removes the items in a list up until an item matching a function is given and returns the remaining list. O(n).

    dropWhile (\n -> n < 5) [ 1, 3, 5, 7 ] == [ 5, 7 ]

-}
dropWhile : (a -> Bool) -> List a -> List a
dropWhile f xs =
    let
        trav : (a -> Bool) -> List a -> List a
        trav fun list =
            case list of
                [] ->
                    []

                y :: ys ->
                    if fun y then
                        trav fun ys

                    else
                        y :: ys
    in
    trav f xs

{-| Finds the first element in a list matching the predicate `f`. If none exists,
returns `Nothing`.

    find (\x -> even x) [1,2,3,4] == 2
    find (\x -> Char.isUpper x) (String.toList "test") == Nothing
-}
find : (a -> Bool) -> List a -> Maybe a
find f xs =
    let
        findAcc : List a -> Maybe a
        findAcc list =
            case list of
                [] ->
                    Nothing

                y :: ys ->
                    if f y then
                        Just y

                    else
                        findAcc ys
    in
    findAcc xs


{-| Retrievs an item from a list at a specified index.
-}
get : List a -> Int -> Maybe a
get list index =
    List.head (List.drop index list)