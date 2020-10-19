module Renderers.GossipGraph exposing (..)

{-| based on <https://elm-visualization.netlify.app/backgroundgraph/>
and <https://elm-visualization.netlify.app/forcedirectedgraph/>
-}

import Browser
import Color exposing (Color)
import Force exposing (Entity, State)
import Graph exposing (Edge, Graph, Node, NodeContext, NodeId)
import Helpers.General exposing (uncurry)
import Parsers.GossipGraph
import Renderers.Edge exposing (arrowHeads, linkElement)
import Renderers.Types exposing (Entity, Model)
import TypedSvg exposing (circle, defs, g, line, marker, polygon, svg, text_, title)
import TypedSvg.Attributes exposing (class, cx, cy, dy, fill, id, markerEnd, markerHeight, markerStart, markerWidth, orient, points, r, refX, refY, stroke, strokeDasharray, strokeWidth, textAnchor, viewBox, x, x1, x2, y, y1, y2)
import TypedSvg.Core exposing (Svg, text)
import TypedSvg.Types exposing (AnchorAlignment(..), Length(..), Paint(..), px)
import Types.Agent exposing (Agent)
import Types.Relation exposing (Kind(..), Relation)



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


type Msg
    = Nothing


init : Model
init =
    let
        graph =
            Parsers.GossipGraph.parse "abc ABC abc"
                |> uncurry Parsers.GossipGraph.fromAgentsAndRelations
                |> Graph.mapNodes agentToEntity

        forces =
            [ Force.links (getLinks graph)
            , Force.manyBodyStrength -200 <| List.map .id <| Graph.nodes graph
            , Force.center 200 200
            ]
    in
    -- initialize "complete" simulation to begin with:
    -- extract entities from graph, calculate forces, and replace entities in graph
    { graph =
        Force.computeSimulation (Force.simulation forces) (List.map (\n -> n.label) (Graph.nodes graph))
            |> updateGraphWithList graph
    , settings =
        { nodeRadius = 10
        , edgeWidth = 1
        , arrowLength = 4
        }
    }



-- HELPERS


updateGraphWithList : Graph Entity Relation -> List Entity -> Graph Entity Relation
updateGraphWithList =
    let
        graphUpdater value =
            Maybe.map (\ctx -> updateContextWithValue ctx value)
    in
    List.foldr (\node graph -> Graph.update node.id (graphUpdater node) graph)


updateContextWithValue : NodeContext Entity Relation -> Entity -> NodeContext Entity Relation
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


nodeElement : Model -> Node Entity -> Svg msg
nodeElement model node =
    g []
        [ circle
            [ r (px model.settings.nodeRadius)
            , fill <| Paint Color.white
            , stroke <| Paint <| Color.black
            , strokeWidth (px 1)
            , cx (px node.label.x)
            , cy (px node.label.y)
            ]
            [ title [] [ text (String.fromChar node.label.value.name) ] ]
        , text_
            [ textAnchor AnchorMiddle
            , x (px node.label.x)
            , y (px node.label.y)
            , dy (px 5)
            ]
            [ text (String.fromChar node.label.value.name) ]
        ]



-- VIEW


view : Model -> Svg msg
view model =
    svg [ viewBox 0 0 400 400 ]
        [ defs []
            (arrowHeads model)
        , g [ class [ "links" ] ] <| List.map (linkElement model) <| Graph.edges model.graph
        , g [ class [ "nodes" ] ] <| List.map (nodeElement model) <| Graph.nodes model.graph
        ]



-- HELPERS
