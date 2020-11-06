module Main exposing (..)

import Browser
import Graph exposing (Graph)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import GossipGraph.Parser
import GossipGraph.Renderer
import GossipGraph.Agent exposing (Agent)
import GossipGraph.Relation exposing (Relation)



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
    , graphSettings : GossipGraph.Renderer.GraphSettings
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
                    GossipGraph.Parser.parse input

                graph =
                    GossipGraph.Parser.fromAgentsAndRelations agents relations
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
        , GossipGraph.Renderer.render model.graph model.graphSettings
        ]
