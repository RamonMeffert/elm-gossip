module CallSequence.Renderer exposing (..)

import CallSequence.CallSequence exposing (CallSequence)
import FontAwesome.Icon as Icon exposing (Icon)
import FontAwesome.Solid as Icon
import GossipGraph.Agent as Agent exposing (Agent)
import GossipGraph.Call as Call exposing (Call)
import Html exposing (Html, div, text)
import Html.Attributes exposing (class, id)
import Task exposing (sequence)


render : Result String CallSequence -> List Agent -> List (Html msg)
render result agents =
    case result of
        Err error ->
            [ div [ class "error" ]
                [ Icon.viewIcon Icon.exclamationTriangle
                , text (" " ++ error)
                ]
            ]

        Ok sequence ->
            if List.isEmpty sequence then
                [ text "No call sequence entered" ]

            else
                List.reverse sequence
                |> List.map (Call.render agents)
