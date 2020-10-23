module Types.CallSequence exposing (..)
import Types.Call exposing (Call, includes)
import Task exposing (sequence)
import Types.Agent exposing (Agent)
import List exposing (head)

{-| A list of consecutive calls.
-}
type alias CallSequence =
    List Call



{-| σ_x
-}
containing : CallSequence -> Agent -> CallSequence
containing sequence agent =
    case sequence of
        [] ->
            []

        call :: calls ->
            -- this would've read so nicely if Elm supported infix notation. Alas.
            -- (if call `includes` agent then) (calls `containing` agent)
            if includes call agent then
                call :: containing calls agent

            else
                containing calls agent


last : CallSequence -> Maybe Call
last sequence = 
    head <| List.reverse sequence
