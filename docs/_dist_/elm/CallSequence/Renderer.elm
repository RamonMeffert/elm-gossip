module CallSequence.Renderer exposing (..)

import CallSequence.CallSequence exposing (CallSequence)
import FontAwesome.Icon as Icon exposing (Icon)
import FontAwesome.Solid as Icon
import GossipGraph.Agent as Agent exposing (Agent)
import GossipGraph.Call as Call exposing (Call)
import Html exposing (Html, div, text)
import Html.Attributes exposing (class, id)
import Utils.Alert as Alert


render : Result String CallSequence -> Result String (List Agent) -> List (Html msg)
render sequenceResult agentsResult =
    case ( sequenceResult, agentsResult ) of
        ( Ok sequence, Ok agents ) ->
            if List.isEmpty sequence then
                [ text "No call sequence entered" ]

            else
                List.reverse sequence
                    |> List.map (Call.render agents)

        ( Err error, Ok _ ) ->
            -- Error in parsing sequence
            [ Alert.render Alert.Error error
            ]

        ( Ok _, Err _ ) ->
            -- Error in parsing gossip graph
            [ Alert.render Alert.Warning " There was a problem parsing the initial gossip graph."
            ]

        ( Err e1, Err _ ) ->
            -- Error in parsing sequence
            [ Alert.render Alert.Error <| e1 ++ " Additionally, there was a problem parsing the initial gossip graph."
            ]
