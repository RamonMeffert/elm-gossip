module Renderers.GossipGraph exposing (GraphSettings, render)

{-| based on <https://elm-visualization.netlify.app/backgroundgraph/>
and <https://elm-visualization.netlify.app/forcedirectedgraph/>
-}

import Browser
import Color exposing (Color)
import Force exposing (Entity, State, entity)
import Graph exposing (Edge, Graph, Node, NodeContext, NodeId)
import Parsers.GossipGraph
import TypedSvg exposing (circle, defs, g, line, marker, polygon, svg, text_, title)
import TypedSvg.Attributes exposing (class, cx, cy, dy, fill, id, markerEnd, markerHeight, markerStart, markerWidth, orient, points, r, refX, refY, stroke, strokeDasharray, strokeWidth, textAnchor, viewBox, x, x1, x2, y, y1, y2)
import TypedSvg.Core exposing (Attribute, Svg, text)
import TypedSvg.Types exposing (AnchorAlignment(..), Length(..), Paint(..), px)
import Types.Agent exposing (Agent)
import Types.Relation exposing (Kind(..), Relation)
import Utils.General exposing (uncurry)



-- MODEL


type alias GraphSettings =
    -- For now, these don't have an explicit unit (cm, px, etc) but are just assumed to be px
    -- that is, until I figure out how to get the value out of a `Length`.
    { nodeRadius : Float
    , edgeWidth : Float
    , arrowLength : Float
    }


type alias Entity =
    Force.Entity Int { value : Agent }



-- MAIN


{-| Renders a gossip graph. Does some pretty expensive computation to make sure 
everything is aligned correctly, so ideally changes to this graph are made using
some update function (that has yet to be written)
-}
render : Graph Agent Relation -> GraphSettings -> Svg msg
render graph settings =
    let
        entityGraph =
            Graph.mapNodes agentToEntity graph

        forces =
            [ Force.links (getLinks entityGraph)
            , Force.manyBodyStrength -200 <| List.map .id <| Graph.nodes entityGraph
            , Force.center 200 200
            ]

        computedGraph =
            Force.computeSimulation (Force.simulation forces) (List.map (\n -> n.label) (Graph.nodes entityGraph))
                |> updateGraphWithList entityGraph
    in
    svg [ viewBox 0 0 400 400 ]
        [ defs []
            (arrowHeads settings)
        , g [ class [ "links" ] ] <| List.map (linkElement computedGraph settings) <| Graph.edges computedGraph
        , g [ class [ "nodes" ] ] <| List.map (nodeElement settings) <| Graph.nodes computedGraph
        ]



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


nodeElement : GraphSettings -> Node Entity -> Svg msg
nodeElement settings node =
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
            , dy (px (settings.nodeRadius / 2))
            ]
            [ text (String.fromChar node.label.value.name) ]
        ]



-- EDGE RENDERING


{-| For when there are two relations that aren't of the same type.
This is _always_ the case when an edge exists where this.from == that.to and vice versa,
as edges of the same type have been merged before
-}
linkElementOffset : GraphSettings -> List (Attribute msg) -> Entity -> Entity -> Svg msg
linkElementOffset settings extraAttributes source target =
    -- idea: calculate initial offsets as normal, then "rotate" them along the center of the nodes by some amount
    let
        r1 =
            settings.nodeRadius

        r2 =
            settings.nodeRadius + settings.arrowLength

        ( newSource, newTarget ) =
            newCoordinates source target r1 r2

        src =
            circularOffset newSource (pi / 16) source

        tgt =
            circularOffset newTarget (-pi / 16) target
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
linkElementBidirectional : GraphSettings -> List (Attribute msg) -> Entity -> Entity -> Svg msg
linkElementBidirectional settings extraAttributes source target =
    let
        r =
            settings.nodeRadius + settings.arrowLength

        ( src, tgt ) =
            newCoordinates source target r r
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
linkElementBasic : GraphSettings -> List (Attribute msg) -> Entity -> Entity -> Svg msg
linkElementBasic settings extraAttributes source target =
    let
        r1 =
            settings.nodeRadius

        r2 =
            settings.nodeRadius + settings.arrowLength

        ( src, tgt ) =
            newCoordinates source target r1 r2
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


linkElement : Graph Entity Relation -> GraphSettings -> Edge Relation -> Svg ms
linkElement graph settings edge =
    let
        retrieveEntity =
            Maybe.withDefault (Force.entity 0 { id = -1, name = '?' }) << Maybe.map (.node >> .label)

        source =
            retrieveEntity <| Graph.get edge.from graph

        target =
            retrieveEntity <| Graph.get edge.to graph

        dashed =
            if edge.label.kind == Number then
                [ strokeDasharray "2" ]

            else
                []
    in
    if List.any (\e -> edge.from == e.to && edge.to == e.from) (Graph.edges graph) then
        linkElementOffset settings dashed source target

    else if not edge.label.directed then
        linkElementBidirectional settings dashed source target

    else
        linkElementBasic settings dashed source target


{-| Retrieved from <https://github.com/elm-community/basics-extra/blob/master/src/Basics/Extra.elm>
-}
fractionalModBy : Float -> Float -> Float
fractionalModBy modulus x =
    x - modulus * toFloat (floor (x / modulus))


{-| Move a coordinate on the edge of a node clockwise
0 <= offset < 2pi
the point (x,y) always lies at (radius) from (node.x, node.y)
-}
circularOffset : ( Float, Float ) -> Float -> Entity -> ( Float, Float )
circularOffset ( x, y ) offset node =
    let
        dx =
            x - node.x

        -- this should be in (-r, r)
        dy =
            y - node.y

        -- this should be in (-r, r)
        ( r, theta ) =
            toPolar ( dx, dy )

        newAngle =
            fractionalModBy (2 * pi) (theta - offset)

        -- make sure new angle is within range
        ( newX, newY ) =
            fromPolar ( r, newAngle )
    in
    ( node.x + newX, node.y + newY )


{-| Basically calculates an offset along an edge from one node to another
-}
newCoordinates : Entity -> Entity -> Float -> Float -> ( ( Float, Float ), ( Float, Float ) )
newCoordinates source target sourceOffset targetOffset =
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
        sourceOffsetX =
            sourceOffset * cos angle

        sourceOffsetY =
            sourceOffset * sin angle

        targetOffsetX =
            targetOffset * cos angle

        targetOffsetY =
            targetOffset * sin angle

        newSource =
            newCoordinate source target sourceOffsetX sourceOffsetY

        newTarget =
            newCoordinate target source targetOffsetX targetOffsetY
    in
    ( newSource, newTarget )


newCoordinate : Entity -> Entity -> Float -> Float -> ( Float, Float )
newCoordinate source target xoff yoff =
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
