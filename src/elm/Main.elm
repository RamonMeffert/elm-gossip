module Main exposing (..)

import Browser
import CallSequence.CallSequence
import CallSequence.Parser
import CallSequence.Renderer
import FontAwesome.Attributes as Icon
import FontAwesome.Icon as Icon exposing (Icon)
import FontAwesome.Solid as Icon
import GossipGraph.Agent exposing (Agent)
import GossipGraph.Parser
import GossipGraph.Relation exposing (Relation)
import GossipGraph.Renderer
import Graph exposing (Graph)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)



-- MAIN


main : Program () Model Message
main =
    Browser.sandbox { init = init, update = update, view = view }



-- MODEL


type alias Model =
    { inputGossipGraph : String
    , canonicalGossipGraph : String
    , inputCallSequence : String
    , graph : Graph Agent Relation
    , agents : List Agent
    , relations : List Relation
    , graphSettings : GossipGraph.Renderer.GraphSettings
    , callSequence : Result CallSequence.Parser.Error CallSequence.CallSequence.CallSequence -- not great. Maybe move "type" to main namespace somehow
    }


init : Model
init =
    { inputGossipGraph = ""
    , inputCallSequence = ""
    , canonicalGossipGraph = ""
    , callSequence = Ok []
    , graph = Graph.empty
    , agents = []
    , relations = []
    , graphSettings =
        { nodeRadius = 20
        , edgeWidth = 2
        , arrowLength = 6
        }
    }



-- UPDATE


type Message
    = ChangeGossipGraph String
    | ChangeCallSequence String


update : Message -> Model -> Model
update msg model =
    case msg of
        -- TODO: move to separate method for cleanliness
        ChangeGossipGraph input ->
            let
                ( agents, relations ) =
                    GossipGraph.Parser.parse input

                graph =
                    GossipGraph.Parser.fromAgentsAndRelations agents relations

                callSequence =
                    CallSequence.Parser.parse model.inputCallSequence agents

                canonical =
                    GossipGraph.Parser.toCanonicalString graph
            in
            { model
                | inputGossipGraph = input
                , canonicalGossipGraph = canonical
                , graph = graph
                , agents = agents
                , relations = relations
                , callSequence = callSequence
            }

        ChangeCallSequence input ->
            let
                callSequence =
                    CallSequence.Parser.parse input model.agents
            in
            { model
                | inputCallSequence = input
                , callSequence = callSequence
            }



-- VIEW


headerView : List (Html msg)
headerView =
    [ h1 [] [ text "Tools for Gossip" ]
    , p [ class "subtitle" ] [ text "Bachelor's Project by R.A. Meffert | Supervisor: B.R.M. Gattinger" ]
    , hr [] []
    ]


gossipGraphView : Model -> List (Html Message)
gossipGraphView model =
    [ h2 [] [ text "Gossip graph" ]
    , p [] [ text "You can enter a text representation of a gossip graph here." ]
    , input [ type_ "text", id "gossip-graph-input", value model.inputGossipGraph, onInput ChangeGossipGraph, placeholder "Gossip graph representation" ] []
    , if String.isEmpty model.inputGossipGraph then
        div [ id "gossip-graph", class "empty"]
            [ Icon.chalkboard |> Icon.present |> Icon.styled [ Icon.fa7x ] |> Icon.view
            , div [] [text "Type something above to see a graph!"]
            ]

      else
        div [ id "gossip-graph" ]
            [ GossipGraph.Renderer.render model.graph model.graphSettings
            , text ("Canonical representation: " ++ model.canonicalGossipGraph)
            ]
    ]


callSequenceView : Model -> List (Html Message)
callSequenceView model =
    [ h2 [] [ text "Call sequence" ]
    , p [] [ text "You can enter a text representation of a call sequence on the gossip graph above here." ]
    , input [ type_ "text", id "call-sequence-input", value model.inputCallSequence, onInput ChangeCallSequence, placeholder "Call sequence input" ] []
    , div [ id "call-sequence" ]
        (CallSequence.Renderer.render
            model.callSequence
            model.agents
        )
    ]


view : Model -> Html Message
view model =
    main_ []
        (headerView
            ++ gossipGraphView model
            ++ callSequenceView model
        )
