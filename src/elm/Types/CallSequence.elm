module Types.CallSequence exposing (..)

import List exposing (head)
import Task exposing (sequence)
import Types.Agent exposing (Agent, AgentId)
import Types.Call exposing (Call, includes)


{-| A list of consecutive calls.
-}
type alias CallSequence =
    List Call


{-| σ\_x
-}
containing : CallSequence -> AgentId -> CallSequence
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
