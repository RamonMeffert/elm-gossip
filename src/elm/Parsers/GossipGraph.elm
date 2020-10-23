module Parsers.GossipGraph exposing
    ( parse, fromAgentsAndRelations
    , fromString, toString
    )

{-| This module is responsible for recognizing agents and relations from an input string.
It also provides a utility to create a Graph for use with the `elm-community/graph` library.


# Main functions

@docs parse, fromAgentsAndRelations


## Converting between strings and graphs

@docs fromString, toString


# Internal parsing functions

@docs parseAgents, parseRelations, toRelations, knowledgeToIndices

-}

import Force exposing (Entity)
import Graph exposing (..)
import IntDict
import List exposing (..)
import Types.Agent as Agent exposing (..)
import Types.Relation as Relation exposing (..)
import Utils.General exposing (uncurry)
import Utils.List exposing (distinct)
import Utils.Tuple exposing (swap)


{-| The `Knowledge` type alias is a string representation of the knowledge of one agent.
-}
type alias Knowledge =
    String


{-| Shorthand function combining `parse` and `fromAgentsAndRelations`. Takes an
input string and returns a gossip graph.
-}
fromString : String -> Graph Agent Relation
fromString =
    parse >> uncurry fromAgentsAndRelations


{-| Converts an input string to a list of `Agent`s and their corresponding `Relation`s
-}
parse : String -> ( List Agent, List Relation )
parse input =
    let
        -- TODO: Add validation:
        --  - I_S should always be true -> Warning if not, correct automatically (i.e. "ab ab" is read as "Ab aB")
        --  - Check separator character -> Error if incorrect, suggestion to use different sep. char
        --  - Check input characters    -> Error if unsupported, if of different type -> suggest setting change
        agents : List Agent
        agents =
            parseAgents input

        relations : List Relation
        relations =
            parseRelations input agents
    in
    ( agents, relations )


{-| Converts a list of `Agent`s and `Relation`s to a `Graph` for use with the `elm-community/graph` library
-}
fromAgentsAndRelations : List Agent -> List Relation -> Graph Agent Relation
fromAgentsAndRelations agents relations =
    let
        nodes : List (Node Agent)
        nodes =
            List.map Agent.toNode agents

        edges : List (Edge Relation)
        edges =
            List.map Relation.toEdge relations
    in
    Graph.fromNodesAndEdges nodes edges


{-| Converts a gossip graph to its string representation.

    graph = parse "Abc ABC abC"
        |> uncurry fromAgentsAndRelations


    toString graph == "Abc ABC abC"

-}
toString : Graph Agent Relation -> String
toString graph =
    Graph.fold (adjacencyToString (Graph.nodes graph)) [] graph
        |> List.reverse
        -- include separator
        -- TODO: make separator configurable
        |> List.intersperse " "
        -- concatenate list of strings into string
        |> List.foldr (++) ""


{-| Converts and adjacency, i.e. a node and its incoming and outgoing edges, to
a string
-}
adjacencyToString : List (Node Agent) -> NodeContext Agent Relation -> List String -> List String
adjacencyToString agents context acc =
    let
        -- Accumulating function that takes a partially completed knowledge
        -- string and adds a new character based on an AgentId and a RelationType
        toCharacter : ( Int, Kind ) -> String -> String
        toCharacter ( id, kind ) acc2 =
            Utils.List.find (\node -> node.label.id == id) agents
                |> Maybe.map (.label >> .name)
                |> Maybe.withDefault '?'
                |> (if kind == Number then
                        Char.toLower

                    else
                        Char.toUpper
                   )
                |> (\c -> String.fromChar c ++ acc2)

        nonIdRelations =
            Relation.fromNodeContext context
                |> List.map (\r -> ( r.to, r.kind ))

        -- Also include identity relation. we need to manually add it because it is implied in the rest of the data model
        relations =
            List.sortBy Tuple.first (( context.node.label.id, Secret ) :: nonIdRelations)
    in
    List.foldr toCharacter "" relations :: acc


{-| Given a list of agents and a list of knowledge strings, return a list of
tuples indicating the relations between agents.

    findRelationTuples
        [ { id = 0, name = 'A' }
        , { id = 1, name = 'B' }
        ]
        "B A"
        == [ ( 0, 1 ), ( 1, 0 ) ]

-}
findRelationTuples : List Agent -> List Knowledge -> List ( Int, Int )
findRelationTuples agents knowledge =
    knowledge
        |> List.map (knowledgeToIndices agents)
        |> List.indexedMap (\i list -> List.map (\item -> ( i, item )) list)
        |> List.concat
        |> List.filter (\( a, b ) -> a /= b)


{-| Converts a knowledge string to a list of agent ids given a list of agents.

    knowledgeToIndices
        [ { id = 0, name = 'a' }
        , { id = 1, name = 'b' }
        ]
        "ab"
        == [ 0, 1 ]

-}
knowledgeToIndices : List Agent -> Knowledge -> List Int
knowledgeToIndices agents input =
    agents
        |> List.filter (\agent -> List.member agent.name (String.toList <| String.toUpper input))
        |> List.map .id


{-| Converts a list of tuples into a list of directed relations of a specified kind.

    toNumberRelations Number
        [ ( 0, 1 )
        , ( 1, 0 )
        , ( 0, 2 )
        ]
        == [ { from = 0, to = 1, directed = False, kind = Number }
           , { from = 0, to = 2, directed = True, kind = Number }
           ]

-}
toRelations : Kind -> List ( Int, Int ) -> List Relation
toRelations kind tuples =
    let
        toRelationsAcc : List ( Int, Int ) -> List Relation -> List Relation
        toRelationsAcc tups relations =
            case tups of
                [] ->
                    removeDuplicates relations

                ( from, to ) :: xs ->
                    if List.any (\r -> r.directed && r.from == to && r.to == from) relations then
                        toRelationsAcc xs ({ from = to, to = from, directed = False, kind = kind } :: relations)

                    else
                        toRelationsAcc xs ({ from = from, to = to, directed = True, kind = kind } :: relations)

        removeDuplicates : List Relation -> List Relation
        removeDuplicates relations =
            let
                removeDuplicatesAcc withDups withoutDups =
                    case withDups of
                        [] ->
                            withoutDups

                        rel :: withDupsRest ->
                            if rel.directed && List.any (\r -> (r.from == rel.from && r.to == rel.to && not r.directed) || (r.from == rel.to && r.to == rel.from && not r.directed)) relations then
                                removeDuplicatesAcc withDupsRest withoutDups

                            else
                                removeDuplicatesAcc withDupsRest (rel :: withoutDups)
            in
            removeDuplicatesAcc relations []
    in
    toRelationsAcc tuples []


{-| Extracts the agents from the input string.

    parseAgents "Ab aB"
        == [ { id = 0, name = 'A' }
           , { id = 1, name = 'B' }
           ]

-}
parseAgents : String -> List Agent
parseAgents input =
    input
        |> String.filter Char.isAlpha
        |> String.toUpper
        |> String.toList
        |> distinct
        |> List.indexedMap (\index name -> { id = index, name = name })


{-| Extracts the relations from the input string.

    parseRelations "Ab aB"
        [ { id = 0, name = 'A' }
        , { id = 1, name = 'B' }
        ]
        == [ { from = 0, to = 1, directed = False, kind = Number } ]

-}
parseRelations : String -> List Agent -> List Relation
parseRelations input agents =
    let
        numberRelations =
            input
                |> String.split " "
                |> List.map (String.filter Char.isLower)
                |> findRelationTuples agents
                |> toRelations Number

        secretRelations =
            input
                |> String.split " "
                |> List.map (String.filter Char.isUpper)
                |> findRelationTuples agents
                |> toRelations Secret
    in
    append numberRelations secretRelations
