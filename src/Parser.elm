module Parser exposing (..)
import Graph exposing (..)
import Array exposing (Array)
import ListHelpers exposing (distinct)
import TupleHelpers exposing (reverse)
import Agent exposing (..)
import Relation exposing (..)
import List exposing (..)
import Debug exposing (..)

type alias Knowledge = String


parse : String -> Graph Agent Relation
parse input =
    let
        agents : List Agent
        agents = parseAgents input

        relations : List (Relation, Int, Int)
        relations = parseRelations input agents
        
        nodes : List (Node Agent)
        nodes = List.map Agent.toNode agents

        edges : List (Edge Relation)
        edges = List.map Relation.toEdge relations
    in
    Graph.fromNodesAndEdges nodes edges

{-| Extracts the agents from the input string.

    parseAgents "Ab aB" == [{ id = 0, name = 'A' }, { id = 1, name = 'B'}]
-}
parseAgents : String -> List Agent
parseAgents input = input 
    |> String.filter Char.isAlpha
    |> String.toUpper
    |> String.toList
    |> distinct
    |> List.indexedMap (\index name -> { id = index, name = name })


findRelationTuples : List Agent -> List Knowledge -> List (Int, Int)
findRelationTuples agents knowledge = knowledge
    |> List.map (knowledgeToIndices agents)
    |> List.indexedMap (\i list -> List.map (\item -> (i, item)) list)
    |> List.concat
    |> List.filter (\(a, b) -> a /= b) -- remove identity relation as it is assumed


{-| Converts a knowledge string to a list of agent ids given a list of agents.

    knowledgeToIndices [{ id = 0, name = 'a'}, { id = 1, name = 'b'}] "ab" = [0, 1]
-}
knowledgeToIndices : List Agent -> Knowledge -> List Int
knowledgeToIndices agents input = agents
    |> List.filter (\agent -> List.member agent.name (String.toList <| String.toUpper input))
    |> List.map .id


{-| Converts a list of tuples into a list of directed relations
-}
toNumberRelations : List (Int, Int) -> List (Relation, Int, Int)
toNumberRelations tup = 
    let 
        removeDuplicates : List (Relation, Int, Int) -> List (Relation, Int, Int)
        removeDuplicates relations =
            let
                removeDuplicatesAcc wDups woDups = 
                    case wDups of
                        [] -> woDups
                        ((rel, from, to)::wDupsRest) ->
                            if 
                                rel == Number Monodirectional && (List.member (Number Bidirectional, from, to) relations || List.member (Number Bidirectional, to, from) relations)
                            then 
                                removeDuplicatesAcc wDupsRest woDups
                            else 
                                removeDuplicatesAcc wDupsRest ((rel, from, to)::woDups)
            in
            removeDuplicatesAcc relations []
            

        toNumberRelationsAcc : List (Int, Int) -> List (Relation, Int, Int) -> List (Relation, Int, Int)
        toNumberRelationsAcc tuples relations =
            case tuples of
                [] -> removeDuplicates relations
                ((x1, x2)::xs) -> 
                    if 
                        List.member (Number Monodirectional, x2, x1) relations
                    then 
                        toNumberRelationsAcc xs ((Number Bidirectional, x1, x2) :: relations)
                    else 
                        toNumberRelationsAcc xs ((Number Monodirectional, x1, x2) :: relations)
    in
    toNumberRelationsAcc tup []


{-| Converts a list of tuples into a list of directed relations
-}
toSecretRelations : List (Int, Int) -> List (Relation, Int, Int)
toSecretRelations tup = 
    let 
        removeDuplicates : List (Relation, Int, Int) -> List (Relation, Int, Int)
        removeDuplicates relations =
            let
                removeDuplicatesAcc wDups woDups = 
                    case wDups of
                        [] -> woDups
                        ((rel, from, to)::wDupsRest) ->
                            if 
                                rel == Secret Monodirectional && (List.member (Secret Bidirectional, from, to) relations || List.member (Secret Bidirectional, to, from) relations)
                            then 
                                removeDuplicatesAcc wDupsRest woDups
                            else 
                                removeDuplicatesAcc wDupsRest ((rel, from, to)::woDups)
            in
            removeDuplicatesAcc relations []

        toSecretRelationsAcc : List (Int, Int) -> List (Relation, Int, Int) -> List (Relation, Int, Int)
        toSecretRelationsAcc tuples relations =
            case tuples of
                [] -> removeDuplicates relations
                ((x1, x2)::xs) -> 
                    if 
                        List.member (Secret Monodirectional, x2, x1) relations
                    then
                        toSecretRelationsAcc xs ((Secret Bidirectional, x1, x2) :: relations)
                    else
                        toSecretRelationsAcc xs ((Secret Monodirectional, x1, x2) :: relations)
    in
    toSecretRelationsAcc tup []


{-| Extracts the relations from the input string

    parseRelations "Ab aB" ['A', 'B'] == [(Number Bidirectional, 0, 1)]
-}
parseRelations : String -> List Agent -> List (Relation, Int, Int)
parseRelations input agents = 
    let
        numberRelations = input
            |> String.split " "
            |> List.map (String.filter Char.isLower)
            |> findRelationTuples agents
            |> toNumberRelations
            

        secretRelations = input
            |> String.split " "
            |> List.map (String.filter Char.isUpper)
            |> findRelationTuples agents
            |> toSecretRelations

        -- next: knowledge strings to ids, i.e. "abc" -> [0,1,2]
    in
    append numberRelations secretRelations
