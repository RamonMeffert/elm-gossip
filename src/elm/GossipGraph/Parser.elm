module GossipGraph.Parser exposing (..)

import GossipGraph.Agent as Agent exposing (Agent)
import GossipGraph.Relation as Relation exposing (Kind(..), Relation)
import Graph exposing (Graph, Node, NodeContext)
import Set
import Utils.General exposing (pluralize)
import Utils.List exposing (distinct, dropWhile, takeWhile)


type alias ParseOptions =
    { separator : String
    }


type LexToken
    = Token Kind Char Int
    | Separator



-- PARSING


fromAgentsAndRelations : List Agent -> List Relation -> Graph Agent Relation
fromAgentsAndRelations agents relations =
    let
        nodes =
            List.map Agent.toNode agents

        edges =
            List.map Relation.toEdge relations
    in
    Graph.fromNodesAndEdges nodes edges


parseRelations : List Agent -> List LexToken -> Result String (List Relation)
parseRelations agents tokens =
    let
        parser pos ts =
            case ts of
                [] ->
                    Ok []

                Separator :: rest ->
                    parseRelations agents rest

                (Token kind name id) :: rest ->
                    case parseRelations agents rest of
                        Ok relations ->
                            Agent.fromChar agents name
                                |> Result.map (\agent -> { from = id, to = agent.id, kind = kind } :: relations)

                        Err e ->
                            Err e
    in
    parser 1 tokens


parseAgents : List LexToken -> Result String (List Agent)
parseAgents tokens =
    let
        numberOfSegments =
            tokens
                |> List.filter (\t -> t == Separator)
                |> List.length
                |> (+) 1

        maybeAddName el acc =
            case el of
                Token _ name _ ->
                    Set.insert (Char.toUpper name) acc

                _ ->
                    acc

        agentNames =
            List.foldr maybeAddName Set.empty tokens

        -- compares the result of parsing with the result of the function above, and gives
        -- a hopefully useful debug message so the user can correct their input if needed
        validateNumberOfAgents : List Agent -> Result String (List Agent)
        validateNumberOfAgents agents =
            let
                numberOfNames =
                    Set.size agentNames

                numberOfAgents =
                    List.length agents
            in
            if numberOfNames == 0 then
                Err
                    """Your input does not contain any secret relations.
                Therefore, I cannot determine the names of the agents.
                I need every agent to at least know their own secret!"""

            else if numberOfAgents < numberOfSegments then
                Err <|
                    String.concat
                        [ "I found "
                        , pluralize numberOfSegments "segment" "segments"
                        , ", but I only found "
                        , pluralize numberOfAgents "unique agent" "unique agents"
                        , "."
                        ]

            else if numberOfAgents /= numberOfNames then
                if numberOfAgents > numberOfNames then
                    Err <|
                        String.concat
                            [ "Your input contains the "
                            , pluralize numberOfNames "name" "names"
                            , " of "
                            , pluralize numberOfNames "agent" "agents"
                            , ", but I found segments representing the relations of "
                            , pluralize numberOfAgents "agent" "agents"
                            , " ("
                            , renderCharacterList (List.map (\a -> a.name) agents)
                            , "). That's too many!"
                            ]

                else
                    Err <|
                        String.concat
                            [ "Your input contains the "
                            , pluralize numberOfNames "name" "names"
                            , " of "
                            , pluralize numberOfNames "agent" "agents"
                            , ", but I only found "
                            , pluralize numberOfAgents "segment" "segments"
                            , " representing "
                            , pluralize numberOfAgents "agent" "agents"
                            , " ("
                            , renderCharacterList (List.map (\a -> a.name) agents)
                            , "). Make sure every agent is represented in their own segment."
                            ]

            else
                Ok agents

        parser :
            List LexToken
            -> Set.Set Char -- segment names
            -> Set.Set Char -- all names
            -> Int -- highest id added
            -> Int -- segment start
            -> Int -- pos
            -> Result String (List Agent)
        parser ts segmentNames allNames highestIdAdded segmentStart pos =
            case ts of
                token :: rest ->
                    case token of
                        Token kind name id ->
                            let
                                ucName =
                                    Char.toUpper name
                            in
                            if Set.member ucName segmentNames then
                                -- Duplicate agent name in a segment
                                Err <| "The segment starting at position " ++ String.fromInt segmentStart ++ " has a duplicate agent."

                            else if kind == Number then
                                -- lowercase character, so just add it to the list of segment names and continue
                                parser rest (Set.insert ucName segmentNames) allNames highestIdAdded segmentStart (pos + 1)
                                    |> Result.andThen (\list -> Ok list)

                            else if id > highestIdAdded && not (Set.member ucName allNames) then
                                -- an agent name we haven't seen before! add it to the list.
                                parser rest (Set.insert ucName segmentNames) (Set.insert ucName allNames) id segmentStart (pos + 1)
                                    |> Result.andThen (\list -> Ok ({ id = id, name = ucName } :: list))

                            else
                                -- an agent name we have seen before. BORING! just continue.
                                parser rest (Set.insert ucName segmentNames) allNames highestIdAdded segmentStart (pos + 1)
                                    |> Result.andThen (\list -> Ok list)

                        Separator ->
                            -- We need to check for multiple separators because that messes up parsing
                            case List.head rest of
                                Just Separator ->
                                    Err <|
                                        String.concat
                                            [ "I found multiple separators at position "
                                            , String.fromInt pos
                                            , ". "
                                            , "This means I can't be sure which segment represents which agent. "
                                            , "Please make sure every segment is separated by exactly one separator!"
                                            ]

                                _ ->
                                    parser rest Set.empty allNames highestIdAdded (pos + 1) (pos + 1)

                [] ->
                    Ok []
    in
    parser tokens Set.empty Set.empty -1 1 1
        |> Result.andThen validateNumberOfAgents



-- LEXING


separators : List Char
separators =
    [ ' ' ]


renderCharacterList : List Char -> String
renderCharacterList characters =
    characters
        |> List.map (\x -> String.fromList [ '‘', x, '’' ])
        |> List.intersperse ", "
        |> List.concatMap String.toList
        |> String.fromList


lexer : ParseOptions -> String -> Result String (List LexToken)
lexer options string =
    let
        charLexer : Int -> List Char -> Result String (List LexToken)
        charLexer id characters =
            case characters of
                [] ->
                    Ok []

                c :: cs ->
                    if Char.isAlpha c then
                        let
                            rest =
                                charLexer id cs
                        in
                        case rest of
                            Ok tokens ->
                                if Char.isUpper c then
                                    Ok <| Token Secret c id :: tokens

                                else
                                    Ok <| Token Number c id :: tokens

                            Err e ->
                                Err e

                    else if List.member c separators then
                        let
                            rest =
                                charLexer (id + 1) cs
                        in
                        case rest of
                            Ok tokens ->
                                Ok <| Separator :: tokens

                            Err e ->
                                Err e

                    else
                        Err <| "Only lower- and uppercase letters and separator(s) " ++ renderCharacterList separators ++ " are allowed."
    in
    String.trim string
        |> String.toList
        |> charLexer 0



-- CONVERSION TO STRING


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


toCanonicalString : Graph Agent Relation -> String
toCanonicalString graph =
    Graph.fold adjacencyToCanonicalString [] graph
        |> List.reverse
        -- include separator
        -- TODO: make separator configurable
        |> List.intersperse " "
        -- concatenate list of strings into string
        |> List.foldr (++) ""


{-| Converts an adjacency, i.e. a node and its incoming and outgoing edges, to
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

        relations =
            context
                |> Relation.fromNodeContext
                |> List.map (\r -> ( r.to, r.kind ))
                |> List.sortBy Tuple.first
    in
    List.foldr toCharacter "" relations :: acc


{-| Converts an adjacency, i.e. a node and its incoming and outgoing edges, to
a string
-}
adjacencyToCanonicalString : NodeContext Agent Relation -> List String -> List String
adjacencyToCanonicalString context acc =
    let
        -- Accumulating function that takes a partially completed knowledge
        -- string and adds a new character based on an AgentId and a RelationType
        toCharacter : ( Int, Kind ) -> String -> String
        toCharacter ( id, kind ) acc2 =
            -- 65 is the unicode code for 'A', so we're mapping 0 to 'A' here
            Char.fromCode (id + 65)
                |> (if kind == Number then
                        Char.toLower

                    else
                        Char.toUpper
                   )
                |> (\c -> String.fromChar c ++ acc2)

        relations =
            context
                |> Relation.fromNodeContext
                |> List.map (\r -> ( r.to, r.kind ))
                |> List.sortBy Tuple.first
    in
    List.foldr toCharacter "" relations :: acc
