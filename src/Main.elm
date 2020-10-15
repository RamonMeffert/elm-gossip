module Main exposing (..)

import Array exposing (Array)
import Browser
import Graph exposing (Graph)
import Graph.DOT
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Parsers.GossipGraph as GossipGraph
import Types.Agent as Agent exposing (Agent)
import Types.Relation as Relation exposing (Relation)



-- MAIN


main : Program () Model Message
main =
    Browser.sandbox { init = init, update = update, view = view }



-- MODEL


type alias Model =
    { input     : String
    , output    : String
    , graph     : Graph Agent Relation
    , agents    : List Agent
    , relations : List Relation
    }


init : Model
init =
    { input = ""
    , output = ""
    , graph = Graph.empty
    , agents = []
    , relations = []
    }



-- UPDATE


type Message
    = Change String


update : Message -> Model -> Model
update msg model =
    case msg of
        Change input ->
            let
                (agents, relations) = GossipGraph.parse input

                graph = GossipGraph.fromAgentsAndRelations agents relations
            in
            { model
                | input = input
                , graph = graph
                , output = Graph.DOT.outputWithStylesAndAttributes Graph.DOT.defaultStyles Agent.getDotAttrs Relation.getDotAttrs graph
                , agents = agents
                , relations = relations
            }



-- VIEW


view : Model -> Html Message
view model =
    div []
        [ input [ value model.input, onInput Change, style "width" "400px", placeholder "Gossip graph representation" ] []
        , br [] []
        , textarea [ value model.output, rows 30, cols 80 ] []
        , br [] []
        , text "You can use "
        , a [ href "http://webgraphviz.com/" ] [ text "WebGraphViz" ]
        , text " to visualise the DOT code generated above."
        ]
