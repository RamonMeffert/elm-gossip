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
import TypedSvg exposing (circle, defs, g, line, marker, polygon, svg, text_, title)
import TypedSvg.Attributes exposing (class, cx, cy, dy, fill, id, markerEnd, markerHeight, markerWidth, orient, points, r, refX, refY, stroke, strokeWidth, textAnchor, viewBox, x, x1, x2, y, y1, y2)
import TypedSvg.Core exposing (Svg, text)
import TypedSvg.Types exposing (AnchorAlignment(..), Length(..), Paint(..), px)
import Types.Agent exposing (Agent)
import Types.Relation exposing (Relation)
import TypedSvg.Attributes exposing (markerStart)
import Types.Relation exposing (Kind(..))
import TypedSvg.Attributes exposing (strokeDasharray)



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


type alias Model =
    { graph : Graph Entity Relation
    , settings : GraphSettings
    }


type alias GraphSettings =
    -- For now, these don't have an explicit unit (cm, px, etc) but are just assumed to be px
    -- that is, until I figure out how to get the value out of a `Length`.
    { nodeRadius : Float
    , edgeWidth : Float
    , arrowLength : Float
    }


type Msg
    = Nothing


type alias Entity =
    Force.Entity Int { value : Agent }


init : Model
init =
    let
        graph =
            Parsers.GossipGraph.parse "abc abc abc"
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


linkElement : Model -> Edge Relation -> Svg msg
linkElement model edge =
    let
        retrieveEntity =
            Maybe.withDefault (Force.entity 0 { id = -1, name = '?' }) << Maybe.map (.node >> .label)

        source =
            retrieveEntity <| Graph.get edge.from model.graph

        target =
            retrieveEntity <| Graph.get edge.to model.graph

        (newSource, newTarget) = newCoordinates source target (model.settings.nodeRadius + (model.settings.arrowLength))

        sourceAttributes = 
            if edge.label.directed then
                [ x1 (px source.x) 
                , y1 (px source.y) 
                ]
            else
                [ x1 (px (Tuple.first newSource))
                , y1 (px (Tuple.second newSource)) 
                , markerStart "url(#arrow-head-start)"
                ]

        dashed =
            if edge.label.kind == Number then
                [ strokeDasharray "4" ]
            else
                []
    in
    line
        ([ strokeWidth (px model.settings.edgeWidth)
        , stroke <| Paint <| Color.black
        , markerEnd "url(#arrow-head-end)"
        , x2 (px (Tuple.first newTarget))
        , y2 (px (Tuple.second newTarget))
        ] ++ sourceAttributes
          ++ dashed )
        []


nodeElement : Model -> Graph.Node Entity -> Svg msg
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
            [ title [] [ text "test" ] ]
        , text_
            [ textAnchor AnchorMiddle
            , x (px node.label.x)
            , y (px node.label.y)
            , dy (px 5)
            ]
            [ text (String.fromChar node.label.value.name) ]
        ]



-- VIEW


arrowHeads : Model -> List (Svg msg)
arrowHeads model =
    let
        width = model.settings.arrowLength
        height = model.settings.arrowLength
        yMid = height / 2
    in
    
    [ marker [ id "arrow-head-end"
                , markerWidth (px width)
                , markerHeight (px height)
                , refX "0"
                , refY (String.fromFloat yMid)
                , orient "auto" 
                ]
        [ polygon [ points [ ( 0, 0 ), ( width, yMid ), ( 0, height ) ] ] []
        ]
    , marker [ id "arrow-head-start"
                , markerWidth (px width)
                , markerHeight (px height)
                , refX (String.fromFloat width)
                , refY (String.fromFloat yMid)
                , orient "auto" 
                ]
        [ polygon [ points [ ( width, 0 ), (0 , yMid), ( width, height ) ] ] []
        ]
    ]


view : Model -> Svg msg
view model =
    svg [ viewBox 0 0 400 400 ]
        [ defs []
            (arrowHeads model)
        , g [ class [ "links" ] ] <| List.map (linkElement model) <| Graph.edges model.graph
        , g [ class [ "nodes" ] ] <| List.map (nodeElement model) <| Graph.nodes model.graph
        ]


-- HELPERS


newCoordinates : Entity -> Entity -> Float -> ((Float, Float), (Float, Float))
newCoordinates source target r = 
    let
        -- recalculate source and target coordinates to account for node radius
        -- if this is not done, the arrows are invisible because they are covered up by the nodes
        -- construct a right-angled triangle with the edge as hypothenuse
        dx =
            abs (source.x - target.x)

        dy =
            abs (source.y - target.y)

        hyp =
            sqrt (dx * dx + dy * dy)

        angle =
            asin (dy / hyp)

        -- calculate x and y offsets
        xoff =
            r * cos angle

        yoff =
            r * sin angle

        newSource = newCoordinate source target xoff yoff
        newTarget = newCoordinate target source xoff yoff
            
    in
    (newSource, newTarget)


newCoordinate : Entity -> Entity -> Float -> Float -> (Float, Float)
newCoordinate source target xoff yoff =
    case (source.x > target.x, source.y > target.y) of
        (True, True) ->
            -- source is to the right and underneath the source
            (source.x - xoff, source.y - yoff)
        (True, False) ->
            -- source is to the right and above the source
            (source.x - xoff, source.y + yoff)
        (False, True) ->
            -- source is to the left and underneath the source
            (source.x + xoff, source.y - yoff)
        _ ->
            -- source is to the left and above the source
            (source.x + xoff, source.y + yoff)