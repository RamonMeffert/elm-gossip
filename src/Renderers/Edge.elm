module Renderers.Edge exposing (..)

import Color
import Force
import Graph exposing (Edge, Node)
import Renderers.Types exposing (Entity, Model)
import TypedSvg exposing (line, marker, polygon)
import TypedSvg.Attributes exposing (class, cx, cy, dy, fill, id, markerEnd, markerHeight, markerStart, markerWidth, orient, points, r, refX, refY, stroke, strokeDasharray, strokeWidth, textAnchor, viewBox, x, x1, x2, y, y1, y2)
import TypedSvg.Core exposing (Svg)
import TypedSvg.Types exposing (Paint(..), px)
import Types.Relation exposing (Relation)
import Types.Relation exposing (Kind(..))
import TypedSvg.Core exposing (Attribute)


{-| For when there are two relations that aren't of the same type.
This is _always_ the case when an edge exists where this.from == that.to and vice versa,
as edges of the same type have been merged before
-}
linkElementOffset : Model -> List (Attribute msg) -> Entity -> Entity -> Svg msg
linkElementOffset model extraAttributes source target =
    -- idea: calculate initial offsets as normal, then "rotate" them along the center of the nodes by some amount
    let
        r1 =
            model.settings.nodeRadius

        r2 =
            model.settings.nodeRadius + model.settings.arrowLength
        
        ( newSource, newTarget ) =
            newCoordinates source target r1 r2

        src = circularOffset newSource (pi / 16) source
        tgt = circularOffset newTarget (-pi / 16) target

    in
    line
        ([ strokeWidth (px model.settings.edgeWidth)
        , stroke <| Paint <| Color.black
        , markerEnd "url(#arrow-head-end)"
        , x1 <| px (Tuple.first src)
        , y1 <| px (Tuple.second src)
        , x2 <| px (Tuple.first tgt)
        , y2 <| px (Tuple.second tgt)
        ] ++ extraAttributes)
        []


{-| Simple monodirectional edge. Has an arrow head at both ends.
-}
linkElementBidirectional : Model -> List (Attribute msg) -> Entity -> Entity -> Svg msg
linkElementBidirectional model extraAttributes source target =
    let
        r =
            model.settings.nodeRadius + model.settings.arrowLength

        ( src, tgt ) =
            newCoordinates source target r r
    in
    line
        ([ strokeWidth (px model.settings.edgeWidth)
        , stroke <| Paint <| Color.black
        , markerEnd "url(#arrow-head-end)"
        , markerStart "url(#arrow-head-start)"
        , x1 <| px (Tuple.first src)
        , y1 <| px (Tuple.second src)
        , x2 <| px (Tuple.first tgt)
        , y2 <| px (Tuple.second tgt)
        ] ++ extraAttributes)
        []


{-| Simple monodirectional edge. Has an arrow head at the end.
-}
linkElementBasic : Model -> List (Attribute msg) -> Entity -> Entity -> Svg msg
linkElementBasic model extraAttributes source target =
    let
        r1 =
            model.settings.nodeRadius

        r2 =
            model.settings.nodeRadius + model.settings.arrowLength

        ( src, tgt ) =
            newCoordinates source target r1 r2
    in
    line
        ([ strokeWidth (px model.settings.edgeWidth)
        , stroke <| Paint <| Color.black
        , markerEnd "url(#arrow-head-end)"
        , x1 <| px (Tuple.first src)
        , y1 <| px (Tuple.second src)
        , x2 <| px (Tuple.first tgt)
        , y2 <| px (Tuple.second tgt)
        ] ++ extraAttributes)
        []


linkElement : Model -> Edge Relation -> Svg ms
linkElement model edge =
    let
        retrieveEntity =
            Maybe.withDefault (Force.entity 0 { id = -1, name = '?' }) << Maybe.map (.node >> .label)

        source =
            retrieveEntity <| Graph.get edge.from model.graph

        target =
            retrieveEntity <| Graph.get edge.to model.graph

        dashed =
            if edge.label.kind == Number then
                [ strokeDasharray "2" ]

            else
                []
    in
    if List.any (\e -> edge.from == e.to && edge.to == e.from) (Graph.edges model.graph) then
        linkElementOffset model dashed source target

    else if not edge.label.directed then
        linkElementBidirectional model dashed source target

    else
        linkElementBasic model dashed source target


{-| Retrieved from https://github.com/elm-community/basics-extra/blob/master/src/Basics/Extra.elm
-}
fractionalModBy : Float -> Float -> Float
fractionalModBy modulus x =
    x - modulus * toFloat (floor (x / modulus))


{-| Move a coordinate on the edge of a node clockwise
    0 <= offset < 2pi
    the point (x,y) always lies at (radius) from (node.x, node.y)
-}
circularOffset : (Float, Float) -> Float -> Entity -> (Float, Float)
circularOffset (x, y) offset node =
    let
        dx = x - node.x -- this should be in (-r, r)
        dy = y - node.y -- this should be in (-r, r)
        (r, theta) = toPolar (dx, dy)
        newAngle = fractionalModBy (2 * pi) (theta - offset) -- make sure new angle is within range

        (newX, newY) = fromPolar (r, newAngle)
    in
    (node.x + newX, node.y + newY)
    


{-| Basically calculates an offset along an edge from one node to another
-}
newCoordinates : Entity -> Entity -> Float -> Float -> ( ( Float, Float ), ( Float, Float ) )
newCoordinates source target sourceOffset targetOffset =
    let
        -- recalculate source and target coordinates to account for node radius
        -- if this is not done, the arrows are invisible because they are covered up by the nodes
        -- construct a right-angled triangle with the edge as hypothenuse
        dx =
            abs (source.x - target.x) -- if abs is removed, the newCoordinate function is probably not needed

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


arrowHeads : Model -> List (Svg msg)
arrowHeads model =
    let
        width =
            model.settings.arrowLength

        height =
            model.settings.arrowLength

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
