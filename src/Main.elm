module Main exposing (..)

import Array exposing (Array)
import Browser
import Graph exposing (Graph)
import Graph.DOT
import Graph.DOT exposing (defaultStyles)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Parsers.GossipGraph as GossipGraph
import Types.Agent as Agent exposing (Agent)
import Types.Relation as Relation exposing (Relation)
import Renderers.GossipGraph



-- MAIN


main : Program () Model Message
main =
    Browser.sandbox { init = init, update = update, view = view }



-- MODEL


type alias Model =
    { input     : String
    , graph     : Graph Agent Relation
    , agents    : List Agent
    , relations : List Relation
    , graphSettings : Renderers.GossipGraph.GraphSettings
    }


init : Model
init =
    { input = ""
    , graph = Graph.empty
    , agents = []
    , relations = []
    , graphSettings = 
        { nodeRadius = 10
        , edgeWidth = 1
        , arrowLength = 4
        }
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
                , agents = agents
                , relations = relations
            }



-- VIEW


view : Model -> Html Message
view model =
    div []
        [ input [ value model.input, onInput Change, style "width" "400px", placeholder "Gossip graph representation" ] []
        , Renderers.GossipGraph.render model.graph model.graphSettings
        ]
