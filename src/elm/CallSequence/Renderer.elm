module CallSequence.Renderer exposing (..)

import CallSequence.CallSequence exposing (CallSequence)
import FontAwesome.Icon as Icon exposing (Icon)
import FontAwesome.Solid as Icon
import GossipGraph.Agent as Agent exposing (Agent)
import GossipGraph.Call as Call exposing (Call)
import Html exposing (Html, div, text)
import Html.Attributes exposing (class, id)
import Task exposing (sequence)


render : Result String CallSequence -> Result String (List Agent) -> List (Html msg)
render sequenceResult agentsResult =
    case (sequenceResult, agentsResult) of
        (Ok sequence, Ok agents) ->
            if List.isEmpty sequence then
                [ text "No call sequence entered" ]

            else
                List.reverse sequence
                |> List.map (Call.render agents)

        (Err error, Ok _) ->
            [ div [ class "error" ]
                [ Icon.viewIcon Icon.exclamationTriangle
                , text (" " ++ error)
                ]
            ]

        (Ok _, Err _) ->
            [ div [ class "error" ]
                [ Icon.viewIcon Icon.exclamationTriangle
                , text " There was an error parsing the initial gossip graph."
                ]
            ]

        _ ->
            [ div [ class "error" ]
                [ Icon.viewIcon Icon.exclamationTriangle
                , text " Something went very wrong."
                ]
            ]
