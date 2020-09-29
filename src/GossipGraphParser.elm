module GossipGraphParser exposing (..)
import Browser
import Html exposing (Html)
import Html exposing (div)
import Html exposing (input)
import Html exposing (text)
import Html.Attributes exposing (value)
import Html.Events exposing (onInput)
import Helpers exposing (distinct)
import Array exposing (Array)


-- MAIN


main = Browser.sandbox { init = init, update = update, view = view }


-- MODEL


type alias Agent = 
    { name : Char
    }


type alias Model = 
    { input : String
    , agents : Array Agent
    , n : Array (List Agent)
    , s : Array (List Agent)
    }


init : Model
init = 
    { input  = ""
    , agents = Array.empty
    , n = Array.empty
    , s = Array.empty
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
        -- unique agents
        agents = parseAgents input
        -- strings representing agents
        agentStrings = String.split " " input
        -- number relation
        n = parseNumberRelations agentStrings
        -- secret relation
        s = parseSecretRelations agentStrings
    in
    { model 
    | input = input
    , agents = agents
    , n = n
    , s = s
    }


{-
Parses the input string, returning an array of agents.
-}
parseAgents : String -> Array Agent
parseAgents input = input 
    |> String.filter Char.isAlpha
    |> String.toLower
    |> String.toList
    |> distinct
    |> List.map (\name -> { name = name })
    |> Array.fromList


{-
Parses the input string, returning the number relations of the agents
Requires that every agent be represented. Since knowing a secret implies knowing
a number, we can just take the characters as they are.
-}
parseNumberRelations : List String -> Array (List Agent)
parseNumberRelations agentStrings = 
    let 
        stringToAgents s = String.toLower s
            |> String.toList
            |> distinct
            |> List.map (\c -> { name = Char.toLower c })

        f a n = 
            case a of
                []      -> n
                (string::strings) -> f strings (Array.push (stringToAgents string) n)
    in
    f agentStrings Array.empty


{-
Parses the input string, returning the number relations of the agents
Requires that every agent be represented. Since knowing a secret implies knowing
a number, we can just take the characters as they are.
-}
parseSecretRelations : List String -> Array (List Agent)
parseSecretRelations agentStrings = 
    let 
        stringToAgents s = String.filter Char.isUpper s
            |> String.toList
            |> distinct
            |> List.map (\c -> { name = Char.toLower c })

        f a n = 
            case a of
                []      -> n
                (string::strings) -> f strings (Array.push (stringToAgents string) n)
    in
    f agentStrings Array.empty

-- VIEW


view : Model -> Html Msg
view model =
    div []
        [ input [ value model.input, onInput Change ] [ ]
        , div [ ] 
            [ text "Number of agents: "
            , text <| String.fromInt <| Array.length model.agents ]
        , div [ ] 
            (text "Agents: " :: (List.intersperse (text ", ") <| renderAgents model.agents))
        , div [ ] 
            (text "N: " :: (List.intersperse (text ", ") <| renderRelations model.agents model.n))
        , div [ ] 
            (text "S: " :: (List.intersperse (text ", ") <| renderRelations model.agents model.s))
        ]


renderAgents : Array Agent -> List (Html Msg)
renderAgents agents = Array.toList 
    <| Array.map (\a -> text <| String.fromChar a.name) agents

renderRelations : Array Agent -> Array (List Agent) -> List (Html Msg)
renderRelations agents relations = 
    let 
        renderRelation : Agent -> Agent -> Html Msg
        renderRelation a b = text <| String.fromChar a.name ++ " → " ++ String.fromChar b.name
    in
    List.concat
    <| Array.toList 
    <| Array.indexedMap (\i a -> List.map (renderRelation a) (Maybe.withDefault [] (Array.get i relations))) agents