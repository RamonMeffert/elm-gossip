module GossipGraph.Renderer exposing (GraphSettings, render)

{-| This module is for rendering gossip graphs.

Based on <https://elm-visualization.netlify.app/backgroundgraph/>
and <https://elm-visualization.netlify.app/forcedirectedgraph/>

-}

-- import GossipGraph.Parser

import Browser
import Color exposing (Color)
import FontAwesome.Icon as Icon exposing (Icon)
import FontAwesome.Solid as Icon
import Force exposing (Entity, State, entity)
import GossipGraph.Agent exposing (Agent)
import GossipGraph.Relation exposing (Kind(..), Relation)
import Graph exposing (Edge, Graph, Node, NodeContext, NodeId)
import Html exposing (Html, div)
import Html.Attributes
import TypedSvg exposing (circle, defs, g, line, marker, polygon, svg, text_, title)
import TypedSvg.Attributes exposing (class, cx, cy, dy, fill, id, markerEnd, markerHeight, markerStart, markerWidth, orient, points, preserveAspectRatio, r, refX, refY, stroke, strokeDasharray, strokeWidth, textAnchor, viewBox, x, x1, x2, y, y1, y2)
import TypedSvg.Core exposing (Attribute, Svg, text)
import TypedSvg.Types exposing (Align(..), AnchorAlignment(..), Length(..), MeetOrSlice(..), Paint(..), Scale(..), px)
import Utils.General exposing (uncurry)
import Utils.Alert as Alert


-- MODEL


{-| The settings that are used while rendering the graph
-}
type alias GraphSettings =
    -- For now, these don't have an explicit unit (cm, px, etc) but are just
    -- assumed to be px. That is, until I figure out how to get the value out
    -- of a `Length`.
    { nodeRadius : Float
    , edgeWidth : Float
    , arrowLength : Float
    , canvasWidth : Float
    , canvasHeight : Float
    }


{-| A wrapper around the `Agent` Type so information needed for calculating its
position can be saved in it
-}
type alias Entity =
    Force.Entity Int { value : Agent }



-- MAIN


{-| Renders a gossip graph. Does some pretty expensive computation to make sure
everything is aligned correctly, so ideally changes to this graph are made using
some update function (has yet to be written)
-}
render : Result String (Graph Agent Relation) -> GraphSettings -> Html msg
render graphResult settings =
    case graphResult of
        Ok graph ->
            renderGraph graph settings

        Err error ->
            Alert.render Alert.Error error


renderGraph : Graph Agent Relation -> GraphSettings -> Html msg
renderGraph graph settings =
    let
        entityGraph : Graph Entity Relation
        entityGraph =
            Graph.mapNodes agentToEntity graph

        forces : List (Force.Force Int)
        forces =
            [ Force.customLinks 1 (getLinks entityGraph)
            , Force.manyBodyStrength 1000 <|
                List.map .id <|
                    Graph.nodes entityGraph
            , Force.center (settings.canvasWidth / 2) (settings.canvasHeight / 2)
            ]

        computedGraph : Graph Entity Relation
        computedGraph =
            Graph.nodes entityGraph
                -- the labels are Entities
                |> List.map (\n -> n.label)
                |> Force.computeSimulation (Force.simulation forces)
                |> updateGraphWithList entityGraph
    in
    svg [ viewBox 0 0 settings.canvasWidth settings.canvasHeight, preserveAspectRatio (Align ScaleMid ScaleMid) Meet ]
        [ defs []
            (arrowHeads settings)
        , g [ class [ "links" ] ] <| List.map (renderEdge computedGraph settings) <| List.filter (\e -> e.from /= e.to) <| Graph.edges computedGraph
        , g [ class [ "nodes" ] ] <| List.map (renderNode settings) <| Graph.nodes computedGraph
        ]



-- HELPERS


{-| Updates a graph based on a list of entities
-}
updateGraphWithList : Graph Entity Relation -> List Entity -> Graph Entity Relation
updateGraphWithList =
    let
        graphUpdater value =
            Maybe.map (\ctx -> updateContextWithValue ctx value)
    in
    List.foldr (\node graph -> Graph.update node.id (graphUpdater node) graph)


{-| Update the node in a nodecontext
-}
updateContextWithValue : NodeContext Entity Relation -> Entity -> NodeContext Entity Relation
updateContextWithValue nodeCtx value =
    let
        node =
            nodeCtx.node
    in
    { nodeCtx | node = { node | label = value } }


{-| Convert an agent to an `Entity` so it can be used to render a graph
-}
agentToEntity : Agent -> Entity
agentToEntity agent =
    Force.entity agent.id agent


{-| Get a list of tuples representing directed relations from a graph
-}
getLinks :
    Graph Entity Relation
    ->
        List
            { source : Int
            , target : Int
            , distance : Float
            , strength : Maybe Float
            }
getLinks graph =
    Graph.edges graph
        |> List.filter (\{ from, to } -> from /= to)
        |> List.map (\edge -> { source = edge.from, target = edge.to, distance = 150, strength = Just 2 })


{-| Code for rendering a node.
-}
renderNode : GraphSettings -> Node Entity -> Svg msg
renderNode settings node =
    g []
        [ circle
            [ r (px settings.nodeRadius)
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
            , dy (px (settings.nodeRadius / 3))
            ]
            [ text (String.fromChar node.label.value.name) ]
        ]



-- EDGE RENDERING


{-| For when there are two relations that aren't of the same type.
This is _always_ the case when an edge exists where this.from == that.to and vice versa,
as edges of the same type have been merged before
-}
renderEdgeOffset : GraphSettings -> List (Attribute msg) -> Entity -> Entity -> Svg msg
renderEdgeOffset settings extraAttributes source target =
    -- idea: calculate initial offsets as normal, then "rotate" them along the center of the nodes by some amount
    let
        r1 =
            settings.nodeRadius

        r2 =
            settings.nodeRadius + (2 * settings.arrowLength)

        ( newSource, newTarget ) =
            radialOffset source target r1 r2

        src =
            angularOffset newSource (pi / 16) source

        tgt =
            angularOffset newTarget (-pi / 16) target
    in
    line
        ([ strokeWidth (px settings.edgeWidth)
         , stroke <| Paint <| Color.black
         , markerEnd "url(#arrow-head-end)"
         , x1 <| px (Tuple.first src)
         , y1 <| px (Tuple.second src)
         , x2 <| px (Tuple.first tgt)
         , y2 <| px (Tuple.second tgt)
         ]
            ++ extraAttributes
        )
        []


{-| Simple monodirectional edge. Has an arrow head at both ends.
-}
renderEdgeUndirected : GraphSettings -> List (Attribute msg) -> Entity -> Entity -> Svg msg
renderEdgeUndirected settings extraAttributes source target =
    let
        r =
            settings.nodeRadius + (2 * settings.arrowLength)

        ( src, tgt ) =
            radialOffset source target r r
    in
    line
        ([ strokeWidth (px settings.edgeWidth)
         , stroke <| Paint <| Color.black
         , markerEnd "url(#arrow-head-end)"
         , markerStart "url(#arrow-head-start)"
         , x1 <| px (Tuple.first src)
         , y1 <| px (Tuple.second src)
         , x2 <| px (Tuple.first tgt)
         , y2 <| px (Tuple.second tgt)
         ]
            ++ extraAttributes
        )
        []


{-| Simple monodirectional edge. Has an arrow head at the end.
-}
renderEdgeDirected : GraphSettings -> List (Attribute msg) -> Entity -> Entity -> Svg msg
renderEdgeDirected settings extraAttributes source target =
    let
        r1 =
            settings.nodeRadius

        r2 =
            settings.nodeRadius + (2 * settings.arrowLength)

        ( src, tgt ) =
            radialOffset source target r1 r2
    in
    line
        ([ strokeWidth (px settings.edgeWidth)
         , stroke <| Paint <| Color.black
         , markerEnd "url(#arrow-head-end)"
         , x1 <| px (Tuple.first src)
         , y1 <| px (Tuple.second src)
         , x2 <| px (Tuple.first tgt)
         , y2 <| px (Tuple.second tgt)
         ]
            ++ extraAttributes
        )
        []


renderEdge : Graph Entity Relation -> GraphSettings -> Edge Relation -> Svg ms
renderEdge graph settings edge =
    let
        retrieveEntity =
            Maybe.withDefault (Force.entity 0 { id = -1, name = '?' }) << Maybe.map (.node >> .label)

        source =
            retrieveEntity <| Graph.get edge.from graph

        target =
            retrieveEntity <| Graph.get edge.to graph

        dashed =
            if edge.label.kind == Number then
                [ strokeDasharray (String.fromFloat (settings.edgeWidth * 2)) ]

            else
                []
    in
    if List.any (\e -> edge.from == e.to && edge.to == e.from) (Graph.edges graph) then
        renderEdgeOffset settings dashed source target

    else
        renderEdgeDirected settings dashed source target


{-| Retrieved from <https://github.com/elm-community/basics-extra/blob/master/src/Basics/Extra.elm>
-}
fractionalModBy : Float -> Float -> Float
fractionalModBy modulus x =
    x - modulus * toFloat (floor (x / modulus))


{-| Move a coordinate along a node, keeping the distance between them equal.
The offset is in radians. To use degrees, use the built in `degrees` function
when supplying an offset - it converts degrees to radians.
-}
angularOffset : ( Float, Float ) -> Float -> Entity -> ( Float, Float )
angularOffset ( x, y ) offset node =
    let
        dx =
            x - node.x

        dy =
            y - node.y

        ( r, theta ) =
            toPolar ( dx, dy )

        -- make sure new angle is within range
        newAngle =
            fractionalModBy (2 * pi) (theta - offset)

        ( newX, newY ) =
            fromPolar ( r, newAngle )
    in
    ( node.x + newX, node.y + newY )


{-| Given two points A and B, calculate new points C and D such that points
C and D move away from A and B along the line AB. Offsets can be set separately
for both sides.
-}
radialOffset : Entity -> Entity -> Float -> Float -> ( ( Float, Float ), ( Float, Float ) )
radialOffset source target sourceOffset targetOffset =
    let
        dx =
            abs (source.x - target.x)

        dy =
            abs (source.y - target.y)

        hyp =
            sqrt (dx * dx + dy * dy)

        angle =
            asin (dy / hyp)

        sourceOffsetX =
            sourceOffset * cos angle

        sourceOffsetY =
            sourceOffset * sin angle

        targetOffsetX =
            targetOffset * cos angle

        targetOffsetY =
            targetOffset * sin angle

        newSource =
            radialOffsetValue source target sourceOffsetX sourceOffsetY

        newTarget =
            radialOffsetValue target source targetOffsetX targetOffsetY
    in
    ( newSource, newTarget )


{-| Helper function for `radialOffset`. Makes sure the offset is calculated
correctly. Can probably be simplified, but it works.
-}
radialOffsetValue : Entity -> Entity -> Float -> Float -> ( Float, Float )
radialOffsetValue source target xoff yoff =
    case ( source.x > target.x, source.y > target.y ) of
        ( True, True ) ->
            -- source is to the right and underneath the source
            ( source.x - xoff, source.y - yoff )

        ( True, False ) ->
            -- source is to the right and above the source
            ( source.x - xoff, source.y + yoff )

        ( False, True ) ->
            -- source is to the left and underneath the source
            ( source.x + xoff, source.y - yoff )

        ( False, False ) ->
            -- source is to the left and above the source
            ( source.x + xoff, source.y + yoff )


{-| A function that defines shapes for arrow heads to use in rendering directed
edges.
-}
arrowHeads : GraphSettings -> List (Svg msg)
arrowHeads settings =
    let
        width =
            settings.arrowLength

        height =
            settings.arrowLength

        yMid =
            height / 2
    in
    [ marker
        [ id "arrow-head-end"
        , markerWidth (px width)
        , markerHeight (px height)
        , refX "0"
        , refY (String.fromFloat yMid)
        , orient "auto"
        ]
        [ polygon [ points [ ( 0, 0 ), ( width, yMid ), ( 0, height ) ] ] []
        ]
    , marker
        [ id "arrow-head-start"
        , markerWidth (px width)
        , markerHeight (px height)
        , refX (String.fromFloat width)
        , refY (String.fromFloat yMid)
        , orient "auto"
        ]
        [ polygon [ points [ ( width, 0 ), ( 0, yMid ), ( width, height ) ] ] []
        ]
    ]
