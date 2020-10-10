{-
This module basically contains functions on lists I'd wish Elm had natively,
but it doesn't. So I've made them myself. Mostly based off of Haskell functions.
-}

module ListHelpers exposing (distinct, takeWhile)


{-| Returns the unique elements in a list.

    distinct ['a', 'a', 'a'] == ['a']
-}
distinct : List a -> List a
distinct list =
    let
        distinctAcc l acc = 
            case l of 
                []      -> List.reverse acc
                (x::xs) -> if List.member x acc 
                            then distinctAcc xs acc 
                            else distinctAcc xs (x::acc)
    in
    distinctAcc list []


{-| Returns the items in a list up until an item matching a function is given.

    takeWhile (\n -> n < 5) [1, 3, 5, 7] == [1, 3]
-}
takeWhile : (a -> Bool) -> List a -> List a
takeWhile f xs = 
    let 
        trav : (a -> Bool) -> List a -> List a -> List a
        trav fun list acc =
            case list of 
                [] -> List.reverse acc
                (y::ys) -> if not <| fun y 
                    then List.reverse acc 
                    else trav fun ys (y::acc)
    in trav f xs []
