module Main exposing (..)

import Browser
import Graph exposing (Graph)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Parsers.GossipGraph as GossipGraph
import Renderers.GossipGraph
import Types.Agent exposing (Agent)
import Types.Relation exposing (Relation)



-- MAIN


main : Program () Model Message
main =
    Browser.sandbox { init = init, update = update, view = view }



-- MODEL


type alias Model =
    { input : String
    , graph : Graph Agent Relation
    , agents : List Agent
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
        { nodeRadius = 20
        , edgeWidth = 2
        , arrowLength = 6
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
                ( agents, relations ) =
                    GossipGraph.parse input

                graph =
                    GossipGraph.fromAgentsAndRelations agents relations
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
    main_ []
        [ h1 [] [ text "Tools for Gossip" ]
        , input [ id "gossip-graph-input", value model.input, onInput Change, placeholder "Gossip graph representation" ] []
        , Renderers.GossipGraph.render model.graph model.graphSettings
        ]
