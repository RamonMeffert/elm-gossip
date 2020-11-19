module GossipGraph.Relation exposing (..)

{-| The `Relation` type is used to model the relations in a gossip graph.


# Definition

@docs Relation, Kind


# Helpers

@docs toEdge, getDotAttrs

-}

import Dict exposing (Dict)
import GossipGraph.Agent exposing (Agent, AgentId)
import Graph exposing (Edge, NodeContext)
import IntDict


{-| A relation in a gossip graph.
-}
type alias Relation =
    { from : Int
    , to : Int
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



-- {-| Gets the style attributes for rendering the current relation in a GraphViz graph.
-- -}
-- getDotAttrs : Relation -> Dict String String
-- getDotAttrs e =
--     case ( e.kind, e.directed ) of
--         ( Number, True ) ->
--             Dict.singleton "style" "dashed"
--         ( Number, False ) ->
--             Dict.fromList [ ( "style", "dashed" ), ( "dir", "both" ) ]
--         ( Secret, True ) ->
--             Dict.empty
--         ( Secret, False ) ->
--             Dict.singleton "dir" "both"


{-| Given a relation of some kind, check whether x knows y in that relation
-}
knows : AgentId -> AgentId -> Kind -> Relation -> Bool
knows x y kind relation =
    relation.from == x && relation.to == y && relation.kind == kind


{-| Takes a relation and produces its inverse
-}
inverse : Relation -> Relation
inverse relation =
    { relation
        | from = relation.to
        , to = relation.from
    }



{-| Transforms a node context into a list of relations.
Bidirectional relations are represented by a regular relation with the `directed` flag set to false.
as such, to find all relations for an agent, we need to take all the outgoing relations combined with
the inverse relation of all bidirectional incoming relations.
-}
fromNodeContext : NodeContext Agent Relation -> List Relation
fromNodeContext context = IntDict.values context.outgoing
