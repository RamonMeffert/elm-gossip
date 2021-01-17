module Main exposing (..)

-- import GossipGraph.Parser

import Array exposing (Array)
import Browser exposing (Document)
import CallSequence.CallSequence
import CallSequence.Parser
import CallSequence.Renderer
import Dict
import FontAwesome.Attributes as Icon
import FontAwesome.Icon as Icon exposing (Icon)
import FontAwesome.Solid as Icon
import GossipGraph.Agent as Agent exposing (Agent)
import GossipGraph.Call as Call exposing (Call)
import GossipGraph.Parser
import GossipGraph.Relation exposing (Kind(..), Relation)
import GossipGraph.Renderer
import GossipProtocol.Conditions.Predefined as Predefined
import GossipProtocol.GossipProtocol as GossipProtocol
import Graph exposing (Graph)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Decode as Json
import Tuple
import Utils.Alert as Alert
import TypedSvg.Attributes exposing (color)
import Color
import Tree exposing (Tree)
import Tree.Zipper
import Tree.Zipper
import Json.Decode
import GossipProtocol.GossipProtocol exposing (HistoryNode(..))



-- MAIN


main : Program () Model Message
main =
    Browser.document
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }



-- MODEL


type alias Model =
    { inputGossipGraph : String
    , canonicalGossipGraph : String
    , inputCallSequence : String
    , graph : Result String (Graph Agent Relation)
    , agents : Result String (List Agent)
    , relations : Result String (List Relation)
    , protocolCondition : GossipProtocol.ProtocolCondition
    , protocolName : String
    , graphSettings : GossipGraph.Renderer.GraphSettings
    , callSequence : Result CallSequence.Parser.Error CallSequence.CallSequence.CallSequence -- not great. Maybe move "type" to main namespace somehow
    , historyLocation : Int
    , history : Tree HistoryNode
    , historyInitialGraph : Graph Agent Relation
    , executionTreeDepth : Int
    , modal : { visible : Bool, title : String, content : List (Html Message) }
    }


init : () -> ( Model, Cmd msg )
init _ =
    ( { inputGossipGraph = ""
      , inputCallSequence = ""
      , canonicalGossipGraph = ""
      , callSequence = Ok []
      , history = Tree.singleton Root
      , historyLocation = 0
      , historyInitialGraph = Graph.empty
      , graph = Ok Graph.empty
      , agents = Ok []
      , relations = Ok []
      , protocolCondition = Predefined.any
      , protocolName = "any"
      , executionTreeDepth = 5
      , graphSettings =
            { nodeRadius = 20
            , edgeWidth = 1.5
            , arrowLength = 6
            , canvasWidth = 800
            , canvasHeight = 400
            }
      , modal =
            { visible = False
            , title = ""
            , content = []
            }
      }
    , Cmd.none
    )


subscriptions : Model -> Sub Message
subscriptions _ =
    Sub.none


-- UPDATE


type Message
    = ChangeGossipGraph String
    | ChangeCallSequence String
    | ChangeProtocol String
    | ApplyCallSequence
    | TimeTravel Int
    | InsertExampleGraph String
    | ShowModal String (List (Html Message))
    | HideModal
    | ChangeExecutionTreeDepth String
    | GenerateExecutionTree


update : Message -> Model -> ( Model, Cmd Message )
update msg model =
    case msg of
        -- TODO: move to separate method for cleanliness
        ChangeGossipGraph input ->
            let
                lexResult =
                    GossipGraph.Parser.lexer { separator = " " } input

                agents : Result String (List Agent)
                agents =
                    lexResult
                        |> Result.andThen GossipGraph.Parser.parseAgents

                relations =
                    case ( lexResult, agents ) of
                        ( Ok tokens, Ok agts ) ->
                            GossipGraph.Parser.parseRelations agts tokens

                        ( Err e, Ok _ ) ->
                            Err e

                        ( Ok _, Err e ) ->
                            Err e

                        _ ->
                            Err "Something went wrong when parsing the relations"

                graph =
                    case ( agents, relations ) of
                        ( Ok agts, Ok rels ) ->
                            Ok <| GossipGraph.Parser.fromAgentsAndRelations agts rels

                        ( Err e, _ ) ->
                            Err e

                        ( _, Err e ) ->
                            Err e

                callSequence =
                    agents
                        |> Result.andThen (CallSequence.Parser.parse model.inputCallSequence)

                canonical =
                    GossipGraph.Parser.toCanonicalString (Result.withDefault Graph.empty graph)
            in
            ( { model
                | inputGossipGraph = input
                , canonicalGossipGraph = canonical
                , graph = graph
                , agents = agents
                , relations = relations
                , callSequence = callSequence
                , history = Tree.singleton Root
              }
            , Cmd.none
            )

        ChangeCallSequence input ->
            let
                callSequence =
                    model.agents
                        |> Result.andThen (CallSequence.Parser.parse input)
            in
            ( { model
                | inputCallSequence = input
                , callSequence = callSequence
              }
            , Cmd.none
            )

        ApplyCallSequence ->
            case ( model.graph, model.callSequence ) of
                ( Ok graph, Ok sequence ) ->
                    let
                        highestIndex = model.history 
                            |> Tree.flatten
                            |> List.map (\n -> 
                                case n of
                                    Root ->
                                        0
                                    Node { index } ->
                                        index
                                    DeadEnd ->
                                        -1
                                )
                            |> List.maximum
                            |> Maybe.withDefault 0

                        newGraph =
                            List.foldr
                                (\call { callHistory, state, index } ->
                                    { callHistory = 
                                        Tree.Zipper.mapTree (Tree.prependChild <| Tree.singleton (Node { call = call, index = index + 1, state = Call.execute state call })) callHistory 
                                            |> (\z -> Maybe.withDefault callHistory (Tree.Zipper.firstChild z))
                                    , state = Call.execute state call
                                    , index = index + 1
                                    }
                                )
                                { callHistory = 
                                    -- Apply the sequence to the current position in the tree
                                    Tree.Zipper.fromTree model.history
                                    |> Tree.Zipper.findFromRoot (\node -> 
                                        case node of                                            
                                            Node { index} ->
                                                index == model.historyLocation

                                            _ ->
                                                False
                                        )
                                    |> Maybe.withDefault (Tree.Zipper.fromTree model.history)
                                , state = graph
                                , index = highestIndex 
                                }
                                sequence
                    in
                    ( { model
                        | graph = Ok <| newGraph.state
                        , relations = Ok <| Graph.fold (\ctx acc -> acc ++ GossipGraph.Relation.fromNodeContext ctx) [] newGraph.state
                        , historyLocation = newGraph.index
                        , history = Tree.Zipper.toTree newGraph.callHistory
                        , inputCallSequence = ""
                        , inputGossipGraph = GossipGraph.Parser.toString newGraph.state
                        , callSequence = Ok []
                        , historyInitialGraph = if Graph.isEmpty model.historyInitialGraph then Result.withDefault Graph.empty model.graph else model.historyInitialGraph
                      }
                    , Cmd.none
                    )

                _ ->
                    ( model, Cmd.none )

        ChangeProtocol protocolName ->
            let
                condition = Dict.get protocolName Predefined.condition
            in
            case condition of
                Just c ->
                    ( { model
                        | protocolCondition = c
                        , protocolName = protocolName
                        , history = Tree.singleton Root
                      }
                    , Cmd.none)
                Nothing ->
                    ( { model
                        | protocolCondition = Predefined.any
                        , protocolName = "any"
                        , history = Tree.singleton Root
                      }
                    , Cmd.none
                    )

        TimeTravel to ->
            let 
                targetNode : Maybe (Tree.Zipper.Zipper HistoryNode)
                targetNode =
                    if to == 0 then
                        Just (Tree.Zipper.fromTree model.history 
                            |> Tree.Zipper.root)
                    else
                        Tree.Zipper.fromTree model.history
                            |> Tree.Zipper.findFromRoot (
                                \zip ->
                                    case zip of
                                        Node { index } ->
                                            index == to
                                        _ ->
                                            False
                            )
            in
            case targetNode of
                Just zip ->
                    let
                        node = Tree.Zipper.label zip
                    in
                    case node of
                        Node n ->
                            ( { model 
                                | graph = Ok n.state
                                , inputGossipGraph = GossipGraph.Parser.toString n.state
                                , historyLocation = to
                            }
                            , Cmd.none )
                        
                        Root ->
                            ( { model 
                                | graph = Ok model.historyInitialGraph
                                , inputGossipGraph = GossipGraph.Parser.toString model.historyInitialGraph
                                , historyLocation = to
                              }
                            , Cmd.none
                            )

                        DeadEnd ->
                            (model, Cmd.none)
                _ ->
                    (model, Cmd.none)

        InsertExampleGraph graph ->
            update (ChangeGossipGraph graph) model

        HideModal ->
            ( { model
                | modal = (\md -> { md | visible = False }) model.modal
              }
            , Cmd.none
            )

        ShowModal title content ->
            ( { model
                | modal = { visible = True, title = title, content = content }
              }
            , Cmd.none
            )

        ChangeExecutionTreeDepth depth ->
            ({ model | executionTreeDepth = String.toInt depth |> Maybe.withDefault 5 |> clamp 0 5 }, Cmd.none)

        GenerateExecutionTree ->
            let
                initialGraph =
                    if Graph.isEmpty model.historyInitialGraph then
                        Result.withDefault Graph.empty model.graph
                    else
                        model.historyInitialGraph
            in
            
            ( { model 
                | modal = (\md -> { md | visible = False }) model.modal
                , history = GossipProtocol.generateExecutionTree 1 initialGraph model.protocolCondition [] model.executionTreeDepth (Tree.singleton Root)
                , historyInitialGraph = initialGraph
              }
            , Cmd.none)


-- VIEW


helpButtonView : String -> List (Html Message) -> Html Message
helpButtonView title content =
    button [ class "help", onClick (ShowModal title content) ] [ Icon.viewIcon Icon.question ]


headerHelpView : List (Html msg)
headerHelpView =
    [ p []
        [ text
            """This application is intended as a tool to gain insight into dynamic gossip.
            It allows you to visualise gossip graphs, execute different gossip protocols and see how calls influence the state of the gossip graph."""
        ]
    , p []
        [ text
            "This application was developed by Ramon Meffert ("
        , a [ href "mailto:r.a.meffert@student.rug.nl" ] [ text "r.a.meffert@student.rug.nl" ]
        , text ") as part of his bachelor's research project under supervision of Dr. Malvin Gattinger."
        ]
    , p []
        [ text "This tool is built on the following free software:" ]
    , ul []
        [ li [] [ a [ href "https://elm-lang.org/" ] [ text "Elm" ] , text ", a functional web language" ]
        , li [] [ text "A number of ", a [ href "https://package.elm-lang.org/" ] [ text "Elm packages" ] , text " by the Elm commmunity" ]
        , li [] [ a [ href "https://sass-lang.org/" ] [ text "Sass" ] , text " for better CSS" ]
        , li [] [ a [ href "https://fontawesome.com/" ] [ text "FontAwesome" ] , text " for the interface icons" ]
        , li [] [ a [ href "https://iconmonstr.com/" ] [ text "IconMonstr" ] , text " for the favicon" ]
        ]
    , p []
        [ text "The source code is available on "
        , a [ href "https://github.com/RamonMeffert/tools-for-gossip" ] [ text "GitHub" ]
        , text ". Once finished, the accompanying thesis will also be made available."
        ]
    ]


headerView : Html Message
headerView =
    header [ id "header" ]
        [ div []
            [ h1 [] [ text "Tools for Gossip" ]
            , p [ class "subtitle" ]
                [ text "Bachelor's project" ]
            , p [ class "subtitle" ]
                [ text "R.A. Meffert ("
                , a [ href "mailto:r.a.meffert@student.rug.nl" ] [ text "r.a.meffert@student.rug.nl" ]
                , text ")"
                ]
            , p [ class "subtitle" ]
                [ text "Supervisor: Dr. B.R.M. Gattinger" ]
            ]
        , helpButtonView "Tools for Gossip" headerHelpView
        ]


gossipGraphHelpView : List (Html msg)
gossipGraphHelpView =
    [ p []
        [ text "You can enter a text representation of a gossip graph here. Examples of valid input are "
        , code [] [ text "Abc aBc abC" ]
        , text ", "
        , code [] [ text "A B C" ]
        , text " and "
        , code [] [ text "abC Abc aBc" ]
        , text ". The first unique uppercase letter of each segment is taken as the name of the agent represented by that segment. (So in the last example, the first agent is called “C”, the second “A” and the last “B”)"
        ]
    , p []
        [ text """
            Knowing how agents are named, it becomes easier to read these strings. 
            They represent both the agents and relations between agents at the same time.
            An uppercase letter represents a “secret” relation S, and a lowercase letter represents a “number” relation N.
            For example, the string
            """
        , code [] [ text "A B C" ]
        , text """
             contains the identity relation on S for the agents A, B and C.
            Additionally, all agents who know another agent's secret are also assumed to know that agent's number.
            """
        ]
    , p []
        [ text
            """Lastly, the icons in the top-left corner provide some information about the current graph. When you hover over them, you are shown extra details."""
        ]
    , p []
        [ text "This notation is based on the notation in the appendix of "
        , a [ href "https://arxiv.org/abs/1907.12321" ] [ text "van Ditmarsch et al. (2019)" ]
        , text "."
        ]
    , Alert.render Alert.Information "The next version of this application will allow an alternative input format: Instead of the letter-based format, a list-like format will be implemented. The string Ab aB will look like ([[0, 1], [0, 1]], [[0], [1]])."
    ]


canonicalRepresentationInfoView : List (Html Message)
canonicalRepresentationInfoView =
    [ p []
        [ text "The "
        , strong [] [ text "canonical representation" ]
        , text
            """ of the input represents the same graph as the one generated from the input string.
            However, it has renamed all agents so the first agent is called """
        , code [] [ text "A" ]
        , text ", the second "
        , code [] [ text "B" ]
        , text ", and so on. For example, the input string "
        , code [] [ text "Xqv Qvx Vxq" ]
        , text " becomes "
        , code [] [ text "Abc aBc abC" ]
        , text "."
        ]
    ]


gossipGraphExamples : List (Html Message)
gossipGraphExamples =
    [ p [] [ text "These are some examples" ]
    , div [ class "input-group" ]
        [ button [ type_ "button", onClick <| InsertExampleGraph "Abc aBc abC" ] [ text "Only numbers" ]
        , button [ type_ "button", onClick <| InsertExampleGraph "ABC ABC ABC" ] [ text "All Secrets" ]
        , button [ type_ "button", onClick <| InsertExampleGraph "Xyaz Axzy ZyAb BaZX Y" ] [ text "Complex example" ]
        ]
    ]


gossipGraphView : Model -> Html Message
gossipGraphView model =
    let
        graphIsValid = 
            case (String.isEmpty model.inputGossipGraph, model.graph) of
                (False, Ok _) ->
                    True

                _ ->
                    False
    in
    
    section [ id "graph" ]
        [ header []
            [ h2 [] [ text "Gossip graph" ]
            , helpButtonView "Gossip Graphs" gossipGraphHelpView
            ]
        , div [ class "columns" ]
            [ label [ for "gossip-graph-input" ] [ text "Gossip graph input" ]
            , div [ class "input-group" ]
                [ input [ type_ "text", id "gossip-graph-input", value model.inputGossipGraph, onInput ChangeGossipGraph, placeholder "Gossip graph representation" ] []
                , button [ type_ "button", onClick <| ShowModal "Gossip Graph input examples" gossipGraphExamples ] [ text "Examples" ]
                ]
            , label [ for "canonical-graph-input" ] [ text "Canonical representation" ]
            , div [ class "input-group" ]
                [ input [ type_ "text", id "canonical-graph-input", disabled True, value model.canonicalGossipGraph, placeholder "Canonical representation" ] []
                , helpButtonView "Canonical Representation" canonicalRepresentationInfoView
                ]
            ]
        , if String.isEmpty model.inputGossipGraph then
            div [ id "gossip-graph", class "empty" ]
                [ Icon.chalkboard |> Icon.present |> Icon.styled [ Icon.fa7x ] |> Icon.view
                , div [] [ text "Type something above to see a graph!" ]
                ]

          else
            div [ id "gossip-graph" ]
                [ GossipGraph.Renderer.render model.graph model.graphSettings
                , case model.graph of
                    Ok _ ->
                        div [ class "connection-info-container" ]
                            [ connectionInfoView Number model.graph
                            , connectionInfoView Secret model.graph
                            , sunInfoView model.graph
                            ]

                    Err _ ->
                        div [] []
                ]
        , div [ id "export-buttons", class "input-group right" ]
            [ button [ disabled (not graphIsValid), onClick (ShowModal "Coming soon" [ p [] [ Alert.render Alert.Information "This feature is coming soon." ] ]) ] [ text "Generate LaTeX file" ]
            , button [ disabled (not graphIsValid), onClick (ShowModal "Coming soon" [ p [] [ Alert.render Alert.Information "This feature is coming soon." ] ]) ] [ text "Copy GraphViz DOT code" ]
            ]
        ]


historyHelpView : List (Html msg)
historyHelpView =
    [ p [] [ text "This section shows the history of calls that have been made. You can click any of the calls to time-travel to that state of the gossip graph." ]
    ]

historyView : Model -> Html Message
historyView model =
    let
        renderCallHistoryNode : HistoryNode -> Html Message
        renderCallHistoryNode node =
            case node of
                Root ->
                    div [ onClick (TimeTravel 0), classList [ ("call", True), ("current", model.historyLocation == 0)], title "Initial Graph" ] 
                        [ Icon.viewIcon Icon.asterisk ]

                DeadEnd ->
                    div [ class "dead-end", title "No more calls are possible"] 
                        [ Icon.viewIcon Icon.times ]

                Node n ->
                    case model.agents of
                        Ok agents ->
                            div [ onClick (TimeTravel n.index)
                                , classList [ ("call", True), ("current", model.historyLocation == n.index)]
                                ] 
                                [ text <| Call.renderString agents n.call
                                ]
                        Err e ->
                            div [] [ text "❌" ]

        toListItems : Html msg -> List (Html msg) -> Html msg
        toListItems label children =
            case children of
                [] ->
                    Html.li [] [ label ]
                _ ->
                    Html.li []
                        [ label
                        , Html.ul [] children
                        ]

        renderTree : Tree HistoryNode -> Html Message
        renderTree tree = tree
            |> Tree.restructure renderCallHistoryNode toListItems
            |> \root -> ul [] [ root ]


    in
    -- TODO: render historic call sequence based on current branch of tree OR highlight current branch somehow
    section [ id "history" ]
        [ header [] 
            [ h2 [] [ text "Call history" ]
            , div [ class "input-set" ]
                [ button [ type_ "button", onClick (ShowModal "Execution Tree" (executionTreeModalView model)) ] [ Icon.viewIcon Icon.fastForward ]
                , helpButtonView "Call history" historyHelpView
                ]
            ]
        , div [ id "execution-tree" ] [renderTree model.history]
        ]


executionTreeModalView : Model -> List (Html Message)
executionTreeModalView model =
    [ p [] [ text "You can generate the execution tree up until a specified depth here. The execution tree will be generated starting from the initial graph." ]
    , p [] [ text "If there already is a call history, the execution tree will be generated from that history's initial graph. Otherwise, the current graph will be taken as the initial graph." ]
    , label [ for "execution-depth" ] [ text "Depth" ]
    , div [ class "input-group", id "execution-depth" ] 
        [ input [ type_ "number", Html.Attributes.min "0", Html.Attributes.max "5", value (String.fromInt model.executionTreeDepth), onInput ChangeExecutionTreeDepth ] []
        , button [ type_ "button", onClick GenerateExecutionTree ] [ text "Generate" ]
        ]
    , Alert.render Alert.Warning "Depending on the size of the graph, this might generate a very large execution tree*. This might take some time! Clicking “Generate” will overwrite the current call history."
    , p [ class "note " ]
        [ text "* If you take a 3-agent graph where all agents know each others numbers, and assume the "
        , code [] [ text "Any" ]
        , text " protocol is selected, that means there are 6 calls to be made for every round, ending up with 6"
        , sup [] [ text "d"]
        , text " history nodes (where d is the depth). For d = 5, that means 7,776 nodes!"
        ]
    ]


connectionInfoView : Kind -> Result String (Graph Agent Relation) -> Html Message
connectionInfoView kind graph =
    let
        icon =
            case kind of
                Number ->
                    text "N"

                Secret ->
                    text "S"

        relationType =
            case kind of
                Number ->
                    "Number relation"

                Secret ->
                    "Secret relation"

        stronglyConnected =
            GossipProtocol.isStronglyConnected kind (Result.withDefault Graph.empty graph)

        weaklyConnected =
            GossipProtocol.isWeaklyConnected kind (Result.withDefault Graph.empty graph)
    in
    Html.div [ class "connection-info" ]
        [ Html.div [ class "visible" ]
            [ Html.div [ class "icon" ] [ icon ]
            , Html.span [ class "explanation" ] [ text relationType ]
            ]
        , Html.div [ class "divider" ] []
        , Html.div
            [ if stronglyConnected then
                class "visible"

              else
                class ""
            ]
            [ Html.div [ class "icon" ] [ Icon.viewIcon Icon.dumbbell ]
            , Html.span [ class "explanation" ]
                [ text <|
                    "This relation is "
                        ++ (if stronglyConnected then
                                ""

                            else
                                "not"
                           )
                        ++ " strongly connected."
                ]
            ]
        , Html.div
            [ if weaklyConnected then
                class "visible"

              else
                class ""
            ]
            [ Html.div [ class "icon" ] [ Icon.viewIcon Icon.feather ]
            , Html.span [ class "explanation" ]
                [ text <|
                    "This relation is "
                        ++ (if weaklyConnected then
                                ""

                            else
                                "not"
                           )
                        ++ " weakly connected."
                ]
            ]
        ]


sunInfoView : Result String (Graph Agent Relation) -> Html Message
sunInfoView graph =
    let
        isSunGraph =
            GossipProtocol.isSunGraph (Result.withDefault Graph.empty graph)
    in
    Html.div [ class "connection-info" ]
        [ Html.div
            [ if isSunGraph then
                class "visible"

              else
                class ""
            ]
            [ Html.div [ class "icon" ] [ Icon.viewIcon Icon.sun ]
            , Html.span [ class "explanation" ]
                [ text <|
                    "This graph is "
                        ++ (if isSunGraph then
                                ""

                            else
                                "not"
                           )
                        ++ " a sun graph."
                ]
            ]
        ]


callSequenceHelpView : List (Html msg)
callSequenceHelpView =
    [ p [] 
        [ text 
            """This input allows you to enter a call sequence and see if it is allowed under the current protocol. 
            The input has to look like """
        , code [] [ text "ab;cd" ]
        , text 
            """. This represents two calls: One from agent """
        , code [] [ text "A" ]
        , text " to agent "
        , code [] [ text "B" ]
        , text ", and one from agent "
        , code [] [ text "C" ]
        , text " to agent "
        , code [] [ text "D" ]
        , text ". You can use semicolons ("
        , code [] [ text ";" ]
        , text "), commas ("
        , code [] [ text "," ]
        , text ") or spaces "
        , code [] [ text "⎵" ]
        , text " as separators between calls."
        ]
    , p [] 
        [ text "Once you have entered a sequence, a symbol ("
        , code [] [Icon.viewStyled [style "color" "red"] Icon.times]
        , text " or "
        , code [] [Icon.viewStyled [style "color" "green"] Icon.check]
        , text ") represents whether the call sequence is permissible. "
        , text "If the sequence is permissible, you can click the "
        , code [] [ text "Execute" ]
        , text 
            """ button to execute the call sequence on the gossip graph. 
            The list of calls will then be made, and the graph will be changed accordingly,
            and the call sequence will be added to the call history."""
        ]
    ]


callSequencePermissibilityHelpView : String -> Bool -> List (Html msg)
callSequencePermissibilityHelpView protocolName permitted = 
    [ p [] 
        [ text <| "The current call sequence is " ++ (if not permitted then "not" else "") ++ " permitted under the "
        , code [] [text protocolName]
        , text " protocol."
        ]
    , p [] 
        [ text "You can see which calls are possible from the current graph in the " 
        , strong [] [ text "Gossip Protocols" ]
        , text " section."
        ]
    ]


callSequenceView : Model -> Html Message
callSequenceView model =
    let
        permitted : Bool
        permitted =
            case ( model.graph, model.callSequence ) of
                ( Ok graph, Ok sequence ) ->
                    GossipProtocol.sequencePermittedOn model.protocolCondition graph sequence

                _ ->
                    False
    in
    section [ id "sequences" ]
        [ header []
            [ h2 [] [ text "Call sequence" ]
            , helpButtonView "Call Sequences" callSequenceHelpView
            ]
        , div [ class "input-group" ]
            [ input
                [ type_ "text"
                , id "call-sequence-input"
                , class
                    (if permitted && not (String.isEmpty model.inputCallSequence) then
                        "permitted"

                     else if String.isEmpty model.inputCallSequence then
                        ""

                     else
                        "not-permitted"
                    )
                , value model.inputCallSequence
                , onInput ChangeCallSequence
                , placeholder "Call sequence input"
                ]
                []
            , if String.isEmpty model.inputCallSequence then
                button [ disabled True, class "help", id "call-sequence-validity" ] [ text " " ]
              
              else if permitted then
                button 
                    [ class "help permitted"
                    , id "call-sequence-validity"
                    , onClick <| ShowModal 
                        "Call sequence permissibility"
                        (callSequencePermissibilityHelpView (Maybe.withDefault "?" <| Dict.get model.protocolName Predefined.name) permitted)
                    ]
                    [ Icon.viewStyled [style "color" "green"]  Icon.check ]
              
              else
                button 
                    [ class "help not-permitted"
                    , id "call-sequence-validity"
                    , onClick <| ShowModal 
                        "Call sequence permissibility"
                        (callSequencePermissibilityHelpView (Maybe.withDefault "?" <| Dict.get model.protocolName Predefined.name) permitted)
                    ]
                    [ Icon.viewStyled [style "color" "red"] Icon.times ]

            , button
                [ type_ "button"
                , onClick ApplyCallSequence
                , disabled <| not permitted
                , title
                    (if permitted then
                        "Execute the calls in this sequence on the gossip graph"

                     else
                        "The call sequence must be permitted before it can be executed"
                    )
                ]
                [ text "Execute" ]
            ]
        , div [ class "call-list" ]
            (CallSequence.Renderer.render
                model.callSequence
                model.agents
            )
        ]


protocolHelpView : List (Html msg)
protocolHelpView =
    [ p [] 
        [ text "This section allows you to select one of the gossip protocols as defined by "
        , a [ href "https://doi.org/10/cvpm" ] [ text "van Ditmarsch et al. (2018)" ]
        , text ". When you have selected a protocol, the possible calls for that protocol and the current gossip graph, together with the call history, will be shown. "
        , text "Clicking the "
        , code [] [ Icon.viewIcon Icon.question ]
        , text " icon will tell you the rules of the selected protocol."
        ]
    , Alert.render Alert.Information "In the next version of this application, you will be able to define custom gossip protocols using the constituents defined by van Ditmarsch et al. (2018)."
    ] 


protocolView : Model -> Html Message
protocolView model =
    let
        protocolExplanation =
            case Dict.get model.protocolName Predefined.explanation of
                Just explanation ->
                    [ blockquote []
                        [ p [] explanation
                        , footer []
                            [ Html.cite [] [ text "Based on " , Html.a [ href "https://doi.org/10/cvpm" ] [ text "van Ditmarsch et al. (2018)" ] ]
                            ]
                        ]
                    ]

                Nothing ->
                    if model.protocolName == "custom" then
                        [ p [] [ text "Custom" ] ]

                    else
                        [ p [] [ text "Unknown protocol" ] ]
    in
    section [ id "protocols" ]
        [ header []
            [ h2 [] [ text "Gossip Protocols" ]
            , helpButtonView "Gossip Protocols" protocolHelpView
            ]
        , div [ class "input-group" ]
            [ select [ on "change" (Json.map ChangeProtocol targetValue) ]
                (List.map (\k -> option [ value k ] [ text <| Maybe.withDefault "?" <| Dict.get k Predefined.name ]) (Dict.keys Predefined.name)
                    ++ [ option [ value "custom", disabled True ] [ text "Custom" ] ]
                )
            , helpButtonView ("Current protocol: " ++ (Maybe.withDefault "?" <| Dict.get model.protocolName Predefined.name)) protocolExplanation
            ]
        , h3 [] [ text "Possible calls" ]
        , div [ class "call-list" ]
            (case ( model.agents, model.graph ) of
                ( Ok agents, Ok graph ) ->
                    let
                        calls =
                            GossipProtocol.selectCalls graph model.protocolCondition (Tree.flatten model.history |> List.foldr (\el acc ->
                                case el of
                                    Node n ->
                                        n.call :: acc

                                    _ ->
                                        acc
                            ) [])
                    in
                    if String.isEmpty model.inputGossipGraph then
                        [ text "None" ]

                    else if List.isEmpty calls then
                        [ text "All possible calls have been made." ]

                    else
                        List.map (Call.render agents) calls

                _ ->
                    -- TODO: propagate errors from model.callSequence, .agents, .graph instead of the error below
                    [ Alert.render Alert.Information "The call sequence below is impossible. I'll start looking for possible calls again when I understand the call sequence!"
                    ]
            )
        ]


modalView : Model -> Html Message
modalView model =
    div
        [ classList
            [ ("modal-overlay", True)
            , ("visible", model.modal.visible)
            ]
        ]
        [ div [ class "modal-window" ]
            [ header [ class "modal-header" ]
                [ h4 [] [ text model.modal.title ]
                , button [ type_ "button", title "Close window", onClick HideModal ] [ Icon.viewIcon Icon.times ]
                ]
            , div [ class "modal-content" ] model.modal.content
            ]
        ]


view : Model -> Document Message
view model =
    { title = "Tools for Gossip"
    , body =
        [ headerView
        , gossipGraphView model
        , historyView model
        , protocolView model
        , callSequenceView model
        , modalView model
        ]
    }
