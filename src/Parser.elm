module Parser exposing (..)


import Graph exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Helpers exposing (distinct)
import Browser
import Array
import Graph.DOT exposing (..)
import Dict exposing (Dict)


-- MAIN


main : Program () Model Msg
main = Browser.sandbox { init = init, update = update, view = view }


-- MODEL


type alias Model = 
    { input : String
    , graph : Graph Agent Relation
    , temp  : String
    }


type alias Agent = Char

-- todo: add directionality for rendering
type Relation = Number | Secret


init : Model
init = 
    { input = ""
    , graph = empty
    , temp = ""
    }


-- UPDATE


type Msg = Change String

update : Msg -> Model -> Model
update msg model = 
    case msg of 
        Change input -> parse input model


parse : String -> Model -> Model
parse input model =
    let
        agentTuples = parseInput input
        
        nodes : List (Node Agent)
        nodes = List.indexedMap tupleToNode agentTuples

        tupleToNode : Int -> (Agent, String) -> Node Agent
        tupleToNode id (name, _) = { id = id, label = name }
        
        tupleToEdges : Int -> (Agent, String) -> List (Edge Relation)
        tupleToEdges id (name, knowledge) =
            String.toList knowledge
            |> List.filter (\c -> Char.toUpper c /= name) --ignore identity
            |> List.map (tupleToEdge id)
        
        agentIndex : Char -> List (Agent, String) -> Int
        agentIndex name tuples =
            let
                count : Char -> List (Agent, String) -> Int -> Int
                count nam tup n =
                    case tup of
                       [] -> n
                       (t::ts) -> if (Char.toUpper <| Tuple.first t) == (Char.toUpper nam) then n else count nam ts (n + 1)

            in
            count name tuples 0

        tupleToEdge : Int -> Char -> (Edge Relation)
        tupleToEdge id name =
            let 
                agentId = agentIndex name agentTuples
            in
            if Char.isUpper name then
                Edge id agentId Secret
            else 
                Edge id agentId Number

        edges = List.concat <| List.indexedMap tupleToEdges agentTuples
        
        graph = fromNodesAndEdges nodes edges

        styles = 
            { defaultStyles 
            | rankdir = LR -- Left to right
            }
    in
    { model 
    | input = input
    , temp = Graph.DOT.outputWithStylesAndAttributes styles renderNode renderEdge graph
    }


renderNode : Agent -> Dict String String
renderNode a = Dict.singleton "label" (String.fromChar a)


renderEdge : Relation -> Dict String String
renderEdge e = 
    if e == Number then
        Dict.singleton "style" "dashed"
    else
        Dict.empty


{-| Convert a string containing agent knowledge separated by spaces into a list
of tuples (AgentName, Knowledge). This is intended to make parsing easier along
the way.

    parseInput "ab Ab" == [('A', "ab"), ('B', "Ab")]
-}
parseInput : String -> List (Agent, String)
parseInput input = 
    let
        agents : List Agent
        agents = String.filter Char.isAlpha input
            |> String.toUpper
            |> String.toList
            |> distinct

        relations : List String
        relations = String.split " " input
    in
    -- zip
    List.map2 Tuple.pair agents (relations ++ (List.repeat (List.length agents - List.length relations) ""))


-- VIEW


view : Model -> Html Msg
view model =
    div [] 
        [ input [ value model.input, onInput Change ] [ ] 
        , text model.temp
        ]