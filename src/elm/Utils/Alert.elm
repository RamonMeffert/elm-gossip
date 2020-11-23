module Utils.Alert exposing (MessageType(..), render)

{-| A module that provides rendering functions for simple messages,
such as warnings, errors and information
-}

import FontAwesome.Attributes exposing (fa2x)
import FontAwesome.Icon as Icon
import FontAwesome.Solid as Solid
import Html exposing (Html, div, text)
import Html.Attributes exposing (class)


{-| The types of messages that can be rendered
-}
type MessageType
    = Information
    | Warning
    | Error


render : MessageType -> String -> Html msg
render type_ content =
    div [ class <| "alert " ++ cls type_ ]
        [ div [ class "icon" ] [ icn type_ ]
        , div [ class "content" ] [ text content ]
        ]


cls : MessageType -> String
cls type_ =
    case type_ of
        Information ->
            "info"

        Warning ->
            "warning"

        Error ->
            "error"


icn : MessageType -> Html msg
icn type_ =
    case type_ of
        Information ->
            Icon.viewStyled [ fa2x ] Solid.infoCircle

        Warning ->
            Icon.viewStyled [ fa2x ] Solid.exclamationCircle

        Error ->
            Icon.viewStyled [ fa2x ] Solid.timesCircle
