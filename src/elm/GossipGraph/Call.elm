module GossipGraph.Call exposing (..)

import GossipGraph.Agent as Agent exposing (Agent, AgentId)
import Html exposing (Html, div, text)
import Html.Attributes exposing (class)
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
        Err "No group calls allowed."

    else
        case ( from, to ) of
            ( Just f, Just t ) ->
                if f.id == t.id then
                    Err "An agent cannot call itself."

                else
                    Ok { from = f.id, to = t.id }

            _ ->
                Err "There is no one to call. Make sure a call looks like “xy”."


{-| Returns whether an agent is in a call
-}
includes : Call -> AgentId -> Bool
includes call agent =
    call.from == agent || call.to == agent


render : List Agent -> Call -> Html msg
render agents call =
    case ( Agent.fromId agents call.from, Agent.fromId agents call.to ) of
        ( Ok from, Ok to ) ->
            div [ class "call" ] [ text (String.fromChar from.name ++ " 📞 " ++ String.fromChar to.name) ]

        _ ->
            div [ class "call" ]
                [ text "❌" ]
