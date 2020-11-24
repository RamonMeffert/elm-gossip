module GossipGraph.Parser exposing (..)

import GossipGraph.Agent as Agent exposing (Agent)
import GossipGraph.Relation exposing (Kind(..))
import Utils.List exposing (distinct, dropWhile, takeWhile)
import Set
import Utils.General exposing (pluralize)
import Html exposing (i)
import GossipGraph.Relation as Relation exposing (Relation)
import Graph exposing (Graph)
import Graph exposing (Node)
import Graph exposing (NodeContext)


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
        nodes = List.map Agent.toNode agents

        edges = List.map Relation.toEdge relations
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

                Token kind name id :: rest ->
                    case parseRelations agents rest of
                        Ok relations ->
                            Agent.fromChar agents name 
                                |> Result.map (\agent -> { from = id, to = agent.id, kind = kind } :: relations)
                        Err e ->
                            Err e
    in
    parser 1 tokens

parseAgents : List LexToken -> Result String (List Agent)
parseAgents ts =
    let
        -- we need to check the possible names (i.e. the distinct uppercase characters)
        -- so we can check if every agent in the input is accounted for
        possibleNames =
            ts
                |> List.foldr
                    (\t acc ->
                        case t of
                            Token _ name _ ->
                                if Char.isUpper name then
                                    Set.insert name acc

                                else
                                    acc

                            _ ->
                                acc
                    )
                    Set.empty

        numberOfSegments =
            ts
                |> List.filter (\t -> t == Separator)
                |> List.length
                |> (+) 1

        -- compares the result of parsing with the result of the function above, and gives
        -- a hopefully useful debug message so the user can correct their input if needed
        validateNumberOfAgents : List Agent -> Result String (List Agent)
        validateNumberOfAgents agents =
            let
                numberOfNames =
                    Set.size possibleNames

                numberOfAgents =
                    List.length agents
            in
            if numberOfNames == 0 then
                Err "Your input does not contain any secret relations. Therefore, I cannot determine the names of the agents. I need every agent to at least know their own secret!"

            else if numberOfAgents < numberOfSegments then
                Err <|
                    "I found " ++ pluralize numberOfSegments "segment" "segments" ++ ", but I only found " ++ pluralize numberOfAgents "unique agent" "unique agents" ++ "."
            else if numberOfAgents /= numberOfNames then
                Err <| "Your input contains the names of " ++ pluralize numberOfNames "name" "names" ++ " agents, but I was only able to identify segments representing the relations of the following " ++ pluralize numberOfAgents "agent" "agents" ++ ": " ++ renderCharacterList (List.map (\a -> a.name) agents) ++ ". Make sure every segment contains the identity relation for the agent it represents!"

            else
                Ok agents

        -- The main parser function works by looping over the list of tokens.
        -- While keeping track of the names it has encountered, it loops over the segments
        -- (i.e. the groups of letters between separators), and takes the first character it
        -- has not encountered yet as the name of a new agent.
        -- TODO: An improvement to make the parser a bit stricter could be to enforce the agents
        --       are represented by secret relations, that is, I_S must be satisfied.
        --       this could be achieved rather simply by skipping over lowercase characters.
        parser : List Char -> Int -> List LexToken -> Result String (List Agent)
        parser names pos tokens =
            case tokens of
                [] ->
                    Ok []

                (Token _ name id) :: rest ->
                    if Char.isLower name || List.member name names then
                        -- skip this agent if it is already known, or if its name is lowercase
                        parser names (pos + 1) rest

                    else
                        -- take the current character as an agent and skip until the next separator
                        let
                            agent =
                                { id = id, name = name }

                            skippedCharacters =
                                takeWhile (\a -> not <| a == Separator) rest |> List.length
                        in
                        case parser (name :: names) (pos + 1 + skippedCharacters) (dropWhile (\a -> not <| a == Separator) rest) of
                            Ok nextTokens ->
                                Ok <| agent :: nextTokens

                            Err e ->
                                Err e

                Separator :: rest ->
                    let
                        nextSegment =
                            takeWhile ((/=) Separator) rest

                        isLastToken =
                            List.isEmpty nextSegment && List.isEmpty rest

                        hasConsectiveSeparators =
                            List.isEmpty nextSegment && not (List.isEmpty rest)

                        agentNames =
                            List.foldr
                                (\t acc ->
                                    case t of
                                        Token _ name _ ->
                                            name :: acc

                                        Separator ->
                                            acc
                                )
                                []
                                nextSegment

                        distinctAgentNames =
                            agentNames |> distinct

                        hasDuplicates =
                            List.length agentNames > List.length distinctAgentNames
                    in
                    if isLastToken then
                        Err <| "I expected another segment at position " ++ String.fromInt pos ++ ", but there's nothing else here."

                    else if hasConsectiveSeparators then
                        Err <| "I found multiple separators at position " ++ String.fromInt pos ++ "."

                    else if hasDuplicates then
                        Err <| "The segment starting at position " ++ String.fromInt pos ++ " has a duplicate agent."

                    else
                        parser names (pos + 1) rest
    in
    parser [] 1 ts
        |> Result.andThen validateNumberOfAgents



-- LEXING


separators : List Char
separators =
    [ ' ' ]


renderCharacterList : List Char -> String
renderCharacterList characters =
    characters
        |> List.map (\x -> String.fromList [ '‘', x, '’' ])
        |> List.intersperse ","
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
    String.toList string
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
    Graph.fold (adjacencyToCanonicalString) [] graph
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

        relations = context
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

        relations = context
            |> Relation.fromNodeContext
            |> List.map (\r -> ( r.to, r.kind ))
            |> List.sortBy Tuple.first
    in
    List.foldr toCharacter "" relations :: acc