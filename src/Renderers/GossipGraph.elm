module Renderers.GossipGraph exposing (..)

{-| based on <https://elm-visualization.netlify.app/backgroundgraph/>
and <https://elm-visualization.netlify.app/forcedirectedgraph/>
-}

import Browser
import Color exposing (Color)
import Force exposing (Entity, State)
import Graph exposing (Edge, Graph, NodeContext, NodeId)
import Helpers.General exposing (uncurry)
import Parsers.GossipGraph
import TypedSvg exposing (circle, g, line, polygon, svg, title)
import TypedSvg.Attributes exposing (class, fill, points, stroke, viewBox)
import TypedSvg.Attributes.InPx exposing (cx, cy, r, strokeWidth, x1, x2, y1, y2)
import TypedSvg.Core exposing (Svg, text)
import TypedSvg.Types exposing (Paint(..))
import Types.Agent exposing (Agent)
import Types.Relation exposing (Relation)



{- Steps to create a force simulated graph:

      - transform an existing graph:
          - nodes should become Force.Entities
          - edges should become
      - calculate simulation
      - ???
      - profit

   TODO:
       - make canvas width and height part of model for centering etc
       - Use Browser.element instead of Browser.sandbox

-}
-- MAIN


main : Program () Model Msg
main =
    Browser.sandbox
        { init = init
        , view = view
        , update = \msg model -> model
        }



-- MODEL


type alias Model = Graph Entity Relation


type Msg
    = Nothing


type alias Entity =
    Force.Entity Int { value : Agent }


init : Graph Entity Relation
init =
    let
        graph =
            Parsers.GossipGraph.parse "Abc aBc abC"
                |> uncurry Parsers.GossipGraph.fromAgentsAndRelations
                |> Graph.mapNodes agentToEntity

        forces =
            [ Force.links (getLinks graph)
            , Force.manyBody <| List.map .id <| Graph.nodes graph
            , Force.center 400 400
            ]
    in
    -- initialize "complete" simulation to begin with:
    -- extract entities from graph, calculate forces, and replace entities in graph
    Force.computeSimulation (Force.simulation forces) (List.map (\n -> n.label) (Graph.nodes graph))
        |> (updateGraphWithList graph)



-- HELPERS


updateGraphWithList : Graph Entity Relation -> List Entity -> Graph Entity Relation
updateGraphWithList =
    let
        graphUpdater value =
            Maybe.map (\ctx -> updateContextWithValue ctx value)
    in
    List.foldr (\node graph -> Graph.update node.id (graphUpdater node) graph)


updateContextWithValue nodeCtx value =
    let
        node =
            nodeCtx.node
    in
    { nodeCtx | node = { node | label = value } }


agentToEntity : Agent -> Entity
agentToEntity agent =
    Force.entity agent.id agent


getLinks : Graph Entity Relation -> List ( Int, Int )
getLinks graph =
    List.map (\edge -> ( edge.from, edge.to )) (Graph.edges graph)


linkElement : Graph Entity Relation -> Edge Relation -> Svg msg
linkElement graph edge =
    let
        retrieveEntity =
            Maybe.withDefault (Force.entity 0 { id = -1, name = '?' }) << Maybe.map (.node >> .label)

        source =
            retrieveEntity <| Graph.get edge.from graph

        target =
            retrieveEntity <| Graph.get edge.to graph
    in
    line
        [ strokeWidth 1
        , stroke <| Paint <| Color.rgb255 170 170 170
        , x1 source.x
        , y1 source.y
        , x2 target.x
        , y2 target.y
        ]
        []


nodeElement : Graph.Node Entity -> Svg msg
nodeElement node =
    circle
        [ r 2.5
        , fill <| Paint Color.black
        , stroke <| Paint <| Color.rgba 0 0 0 0
        , strokeWidth 7
        , cx node.label.x
        , cy node.label.y
        ]
        [ title [] [ text "test" ] ] -- TODO: Change this to the actual value



-- VIEW


view model =
    svg [ viewBox 0 0 800 800 ]
        [ g [ class [ "links" ] ] <| List.map (linkElement model) <| Graph.edges model
        , g [ class [ "nodes" ] ] <| List.map nodeElement <| Graph.nodes model
        ]
