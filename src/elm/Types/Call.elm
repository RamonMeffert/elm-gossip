module Types.Call exposing (..)

import Types.Agent exposing (Agent, AgentId)
import Utils.List exposing (get)


{-| A call from one agent to another.
-}
type alias Call =
    { from : AgentId
    , to : AgentId
    }


{-| Converts a tuple of two agents to a call.
-}
fromTuple : ( AgentId, AgentId ) -> Call
fromTuple ( x, y ) =
    { from = x, to = y }


{-| Converts a list of exactly two agents into a call.

TODO: (maybe) move validation outside this function so it can also be used for fromTuple

-}
fromList : List Agent -> Result String Call
fromList agents =
    let
        from =
            get agents 0

        to =
            get agents 1
    in
    if List.length agents > 2 then
        Err "List contains too many agents to construct a call. Make sure the list contains exactly two agents."

    else
        case ( from, to ) of
            ( Just f, Just t ) ->
                if f.id == t.id then
                    Err "An agent cannot call itself."

                else
                    Ok { from = f.id, to = t.id }

            _ ->
                Err "Could not retrieve one or more agents from the input list. Make sure the list contains exactly two agents."


{-| Returns whether an agent is in a call
-}
includes : Call -> AgentId -> Bool
includes call agent =
    call.from == agent || call.to == agent
