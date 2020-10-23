module Types.Relation exposing (..)

{-| The `Relation` type is used to model the relations in a gossip graph.


# Definition

@docs Relation, Kind


# Helpers

@docs toEdge, getDotAttrs

-}

import Dict exposing (Dict)
import Graph exposing (Edge)
import Html.Attributes exposing (rel)
import Types.Agent exposing (Agent)


{-| A relation in a gossip graph.
-}
type alias Relation =
    { from : Int
    , to : Int
    , directed : Bool
    , kind : Kind
    }


{-| The kind of knowledge a relation models.
-}
type Kind
    = Number
    | Secret


{-| Converts a gossip relation to an `Edge` for use with the `elm-community/graph` package.
-}
toEdge : Relation -> Edge Relation
toEdge rel =
    { from = rel.from, to = rel.to, label = rel }


{-| Gets the style attributes for rendering the current relation in a GraphViz graph.
-}
getDotAttrs : Relation -> Dict String String
getDotAttrs e =
    case ( e.kind, e.directed ) of
        ( Number, True ) ->
            Dict.singleton "style" "dashed"

        ( Number, False ) ->
            Dict.fromList [ ( "style", "dashed" ), ( "dir", "both" ) ]

        ( Secret, True ) ->
            Dict.empty

        ( Secret, False ) ->
            Dict.singleton "dir" "both"

{-| Given a relation of some kind, check whether x knows y in that relation
-}
knows : Agent -> Agent -> Kind -> Relation -> Bool
knows x y kind relation =
    if relation.directed then
        relation.from == x.id && relation.to == y.id && relation.kind == kind
    else
        ((relation.from == x.id && relation.to == y.id) ||
        (relation.from == y.id && relation.to == x.id)) && relation.kind == kind