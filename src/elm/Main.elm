module Main exposing (..)

-- import GossipGraph.Parser

import Browser
import CallSequence.CallSequence
import CallSequence.Parser
import CallSequence.Renderer
import Dict
import FontAwesome.Attributes as Icon
import FontAwesome.Icon as Icon exposing (Icon)
import FontAwesome.Solid as Icon
import GossipGraph.Agent exposing (Agent)
import GossipGraph.Call as Call exposing (Call)
import GossipGraph.Parser
import GossipGraph.Relation exposing (Relation)
import GossipGraph.Renderer
import GossipProtocol.Conditions.Predefined as Predefined
import GossipProtocol.GossipProtocol as GossipProtocol
import Graph exposing (Graph)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Decode as Json
import Utils.Alert as Alert
import Tuple


-- MAIN


main : Program () Model Message
main =
    Browser.sandbox { init = init, update = update, view = view }



-- MODEL


type alias Model =
    { inputGossipGraph : String
    , canonicalGossipGraph : String
    , inputCallSequence : String
    , graph : Result String (Graph Agent Relation)
    , agents : Result String (List Agent)
    , relations : Result String (List Relation)
    , protocolCondition : GossipProtocol.ProtocolCondition
    , protocolName : String
    , graphSettings : GossipGraph.Renderer.GraphSettings
    , callSequence : Result CallSequence.Parser.Error CallSequence.CallSequence.CallSequence -- not great. Maybe move "type" to main namespace somehow
    }


init : Model
init =
    { inputGossipGraph = ""
    , inputCallSequence = ""
    , canonicalGossipGraph = ""
    , callSequence = Ok []
    , graph = Ok Graph.empty
    , agents = Ok []
    , relations = Ok []
    , protocolCondition = Predefined.any
    , protocolName = "any"
    , graphSettings =
        { nodeRadius = 20
        , edgeWidth = 2
        , arrowLength = 6
        , canvasWidth = 800
        , canvasHeight = 400
        }
    }



-- UPDATE


type Message
    = ChangeGossipGraph String
    | ChangeCallSequence String
    | ChangeProtocol String
    | ApplyCallSequence


update : Message -> Model -> Model
update msg model =
    case msg of
        -- TODO: move to separate method for cleanliness
        ChangeGossipGraph input ->
            let
                lexResult =
                    GossipGraph.Parser.lexer { separator = " " } input

                agents : Result String (List Agent)
                agents =
                    lexResult
                        |> Result.andThen GossipGraph.Parser.parseAgents

                relations =
                    case ( lexResult, agents ) of
                        ( Ok tokens, Ok agts ) ->
                            GossipGraph.Parser.parseRelations agts tokens

                        ( Err e, Ok _ ) ->
                            Err e

                        ( Ok _, Err e ) ->
                            Err e

                        _ ->
                            Err "Something went wrong when parsing the relations"

                graph =
                    case ( agents, relations ) of
                        ( Ok agts, Ok rels ) ->
                            Ok <| GossipGraph.Parser.fromAgentsAndRelations agts rels

                        ( Err e, _ ) ->
                            Err e

                        ( _, Err e ) ->
                            Err e

                callSequence =
                    agents
                        |> Result.andThen (CallSequence.Parser.parse model.inputCallSequence)

                -- TODO: Reimplement this for the new Graph datastructure
                -- canonical =
                --     GossipGraph.Parser.toCanonicalString graph
            in
            { model
                | inputGossipGraph = input

                -- , canonicalGossipGraph = canonical
                , graph = graph
                , agents = agents
                , relations = relations
                , callSequence = callSequence
            }

        ChangeCallSequence input ->
            let
                callSequence =
                    model.agents
                        |> Result.andThen (CallSequence.Parser.parse input)
            in
            { model
                | inputCallSequence = input
                , callSequence = callSequence
            }

        ApplyCallSequence ->
            case (model.graph, model.callSequence) of
                (Ok graph, Ok sequence) ->
                    let
                         newGraph = List.foldr (\call (history, state) ->
                            (call :: history
                            , Call.execute state call
                            )
                            ) ([], graph) sequence
                            |> Tuple.second
                    in        
                    { model
                        | graph = Ok newGraph
                        }
                _ ->
                    model

        ChangeProtocol protocolName ->
            case protocolName of
                -- TODO: Define a dict and just map this
                "any" ->
                    { model
                        | protocolCondition = Predefined.any
                        , protocolName = protocolName
                    }

                "tok" ->
                    { model
                        | protocolCondition = Predefined.tok
                        , protocolName = protocolName
                    }

                "spi" ->
                    { model
                        | protocolCondition = Predefined.spi
                        , protocolName = protocolName
                    }

                "co" ->
                    { model
                        | protocolCondition = Predefined.co
                        , protocolName = protocolName
                    }

                "wco" ->
                    { model
                        | protocolCondition = Predefined.wco
                        , protocolName = protocolName
                    }

                "lns" ->
                    { model
                        | protocolCondition = Predefined.lns
                        , protocolName = protocolName
                    }

                _ ->
                    { model
                        | protocolCondition = Predefined.any
                        , protocolName = protocolName
                    }



-- VIEW


headerView : Html msg
headerView =
    header []
        [ h1 [] [ text "Tools for Gossip" ]
        , p [ class "subtitle" ] [ text "Bachelor's Project, R.A. Meffert — Supervisor: B.R.M. Gattinger" ]
        ]


gossipGraphView : Model -> Html Message
gossipGraphView model =
    section []
        [ h2 [] [ text "Gossip graph" ]
        , p [] [ text "You can enter a text representation of a gossip graph here." ]
        , div [ class "input-group" ]
            [ input [ type_ "text", id "gossip-graph-input", value model.inputGossipGraph, onInput ChangeGossipGraph, placeholder "Gossip graph representation" ] []
            ]
        , if String.isEmpty model.inputGossipGraph then
            div [ id "gossip-graph", class "empty" ]
                [ Icon.chalkboard |> Icon.present |> Icon.styled [ Icon.fa7x ] |> Icon.view
                , div [] [ text "Type something above to see a graph!" ]
                ]

          else
            div [ id "gossip-graph" ]
                [ GossipGraph.Renderer.render model.graph model.graphSettings
                , text ("Canonical representation: " ++ model.canonicalGossipGraph)
                ]
        ]


callSequenceView : Model -> Html Message
callSequenceView model =
    let
        permitted : Bool
        permitted =
            case ( model.graph, model.callSequence ) of
                ( Ok graph, Ok sequence ) ->
                    GossipProtocol.sequencePermittedOn model.protocolCondition graph sequence

                _ ->
                    False
    in
    section []
        [ h2 [] [ text "Call sequence" ]
        , p [] [ text "You can enter a text representation of a call sequence on the gossip graph above here. This sequence is taken as the call history." ]
        , if permitted then
            -- TODO: move this to CallSequence.Renderer.render
            Alert.render Alert.Information <| "This sequence is permitted under the “" ++ (Dict.get model.protocolName Predefined.name |> Maybe.withDefault "?")  ++ "” protocol."

          else
            Alert.render Alert.Warning <| "This sequence is not permitted under the “" ++ (Dict.get model.protocolName Predefined.name |> Maybe.withDefault "?") ++ "” protocol."
        , div [ class "input-group" ]
            [ input [ type_ "text", id "call-sequence-input", value model.inputCallSequence, onInput ChangeCallSequence, placeholder "Call sequence input" ] []
            , button 
                [ type_ "button"
                , onClick ApplyCallSequence
                , disabled <| not permitted
                , title (if permitted then "Execute the calls in this sequence on the gossip graph" else "The call sequence must be permitted before it can be executed")
                ] 
                [ text "Execute" ]
            ]
        , div [ class "call-list" ]
            (CallSequence.Renderer.render
                model.callSequence
                model.agents
            )
        ]


protocolView : Model -> Html Message
protocolView model =
    section []
        [ h2 [] [ text "Protocols" ]
        , p [] [ text "If you select a protocol, you'll be presented with the calls that can be made given the current gossip graph, the call history and that protocol." ]
        , div [ class "columns" ]
            [ if String.isEmpty model.inputGossipGraph then
                div [ class "call-list" ]
                    [ Alert.render Alert.Warning " If there are no agents, no calls can be made."
                    ]

              else
                div [ class "call-list" ]
                    (case ( model.callSequence, model.agents, model.graph ) of
                        ( Ok sequence, Ok agents, Ok graph ) ->
                            let
                                calls =
                                    GossipProtocol.selectCalls graph model.protocolCondition sequence
                            in
                            if List.isEmpty calls then
                                [ text "No more calls are possible." ]

                            else
                                List.map (Call.render agents) calls

                        _ ->
                            -- TODO: propagate errors from model.callSequence, .agents, .graph instead of the error below
                            [ Alert.render Alert.Information "The call sequence below is impossible. I'll start looking for possible calls again when I understand the call sequence!"
                            ]
                    )
            , div [ class "info" ]
                [ div [ class "input-group" ]
                    [ select [ on "change" (Json.map ChangeProtocol targetValue) ]
                        (List.map (\k -> option [ value k ] [ text <| Maybe.withDefault "?" <| Dict.get k Predefined.name ]) (Dict.keys Predefined.name))
                    ]
                , case Dict.get model.protocolName Predefined.explanation of
                    Just explanation ->
                        blockquote []
                            [ p [] [ text explanation ]
                            , footer []
                                [ text "—"
                                , Html.cite [] [ Html.a [ href "https://doi.org/10/cvpm" ] [ text "van Ditmarsch et al. (2018)" ] ]
                                ]
                            ]

                    Nothing ->
                        text "I have no clue."
                ]
            ]
        ]


view : Model -> Html Message
view model =
    main_ []
        [ headerView
        , gossipGraphView model
        , protocolView model
        , callSequenceView model
        ]
