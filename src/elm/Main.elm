module Main exposing (..)

import Browser
import CallSequence.CallSequence
import CallSequence.Parser
import CallSequence.Renderer
import GossipGraph.Agent exposing (Agent)
import GossipGraph.Parser
import GossipGraph.Relation exposing (Relation)
import GossipGraph.Renderer
import Graph exposing (Graph)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import GossipGraph.Parser



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


view : Model -> Html Message
view model =
    main_ []
        [ h1 [] [ text "Tools for Gossip" ]
        , hr [] []
        , h2 [] [ text "Gossip graph" ]
        , p [] [ text "You can enter a text representation of a gossip graph here." ]
        , input [ type_ "text", id "gossip-graph-input", value model.inputGossipGraph, onInput ChangeGossipGraph, placeholder "Gossip graph representation" ] []
        , div [ id "gossip-graph" ] 
            [ GossipGraph.Renderer.render model.graph model.graphSettings
            , text ("Canonical representation: " ++ model.canonicalGossipGraph)
            ]
        , h2 [] [ text "Call sequence" ]
        , p [] [ text "You can enter a text representation of a call sequence on the gossip graph above here." ]
        , input [ type_ "text", id "call-sequence-input", value model.inputCallSequence, onInput ChangeCallSequence, placeholder "Call sequence input" ] []
        , div [ id "call-sequence" ]
            (CallSequence.Renderer.render
                model.callSequence
                model.agents
            )
        ]
