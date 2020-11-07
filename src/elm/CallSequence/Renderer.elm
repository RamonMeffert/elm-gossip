module CallSequence.Renderer exposing (..)

import CallSequence.CallSequence exposing (CallSequence)
import FontAwesome.Icon as Icon exposing (Icon)
import FontAwesome.Solid as Icon
import GossipGraph.Agent as Agent exposing (Agent)
import Html exposing (Html, div, text)
import Html.Attributes exposing (class, id)
import Task exposing (sequence)


render : Result String CallSequence -> List Agent -> List (Html msg)
render result agents =
    let
        renderCall call =
            case ( Agent.fromId agents call.from, Agent.fromId agents call.to ) of
                ( Ok from, Ok to ) ->
                    div [ class "call" ] [ text (String.fromChar from.name ++ " 📞 " ++ String.fromChar to.name) ]

                _ ->
                    div [ class "call" ]
                        [ text "❌" ]
    in
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
                List.map renderCall sequence
