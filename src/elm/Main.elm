port module Main exposing (..)

import Browser exposing (Document)
import CallSequence.CallSequence
import CallSequence.Parser
import CallSequence.Renderer
import Dict
import FontAwesome.Attributes as Icon
import FontAwesome.Brands as Icon
import FontAwesome.Icon as Icon
import FontAwesome.Solid as Icon
import GossipGraph.Agent exposing (Agent)
import GossipGraph.Call as Call exposing (Call)
import GossipGraph.Parser
import GossipGraph.Relation exposing (Kind(..), Relation)
import GossipGraph.Renderer
import GossipProtocol.BooleanFormula as Formula exposing (Negation(..))
import GossipProtocol.Conditions.Constituents exposing (ProtocolConstituent(..))
import GossipProtocol.Conditions.Predefined as Predefined
import GossipProtocol.GossipProtocol as GossipProtocol exposing (HistoryNode(..), evaluateFormulaAsProtocolCondition)
import Graph exposing (Graph)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Html5.DragDrop as DragDrop
import Json.Decode as Json
import Tree exposing (Tree)
import Tree.Zipper
import Utils.Alert as Alert


port dragstart : Json.Value -> Cmd msg



-- MAIN


main : Program String Model Message
main =
    Browser.document
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }



-- MODEL


type alias DragId =
    Formula.NodeId


type alias DropId =
    Formula.NodeId


type alias Protocol =
    Formula.Formula ProtocolConstituent


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
    , modal : { visible : Bool, title : List (Html Message), content : List (Html Message) }
    , formula : Protocol
    , dragDrop : DragDrop.Model DragId DropId
    , dragFocus : Maybe Int
    , constituentPickerVisible : Bool
    , applicationVersion : String
    }


init : String -> ( Model, Cmd msg )
init version =
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
      , protocolCondition = evaluateFormulaAsProtocolCondition Predefined.formulaAny
      , protocolName = "any"
      , executionTreeDepth = 3
      , graphSettings =
            { nodeRadius = 20
            , edgeWidth = 1.5
            , arrowLength = 6
            , canvasWidth = 400
            , canvasHeight = 400
            }
      , modal =
            { visible = False
            , title = []
            , content = []
            }
      , formula = Predefined.formulaAny
      , dragDrop = DragDrop.init
      , dragFocus = Nothing
      , constituentPickerVisible = False
      , applicationVersion = version
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
    | ExecuteCall Call
    | ExecuteCallSequence
    | TimeTravel Int
    | InsertExampleGraph String
    | ShowModal (List (Html Message)) (List (Html Message))
    | HideModal
    | ChangeExecutionTreeDepth String
    | GenerateExecutionTree
    | ClearExecutionTree
    | ProtocolMessage PMessage


type PMessage
    = DragDropMsg (DragDrop.Msg DragId DropId)
    | SetDragFocus DragId
    | ClearDragFocus
    | ToggleConnective Formula.NodeId
    | DeleteNode Formula.NodeId
    | ToggleNegation Formula.NodeId
    | TogglePopover
    | AppendConstituent (Formula.BoolElement ProtocolConstituent)


update : Message -> Model -> ( Model, Cmd Message )
update msg model =
    case msg of
        ChangeGossipGraph input ->
            changeGossipGraph input model

        ChangeCallSequence input ->
            changeCallSequence model input

        ExecuteCall call ->
            executeCall model call

        ExecuteCallSequence ->
            executeCallSequence model

        ChangeProtocol protocolName ->
            changeProtocol protocolName model

        TimeTravel to ->
            timeTravel to model

        InsertExampleGraph graph ->
            insertExampleGraph graph model

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
            ( { model | executionTreeDepth = String.toInt depth |> Maybe.withDefault 5 |> clamp 0 5 }, Cmd.none )

        GenerateExecutionTree ->
            generateExecutionTree model

        ClearExecutionTree ->
            ( { model
                | history = Tree.singleton Root
                , historyInitialGraph = Result.withDefault Graph.empty model.graph
                , historyLocation = 0
              }
            , Cmd.none
            )

        ProtocolMessage message ->
            updateProtocol message model


updateProtocol : PMessage -> Model -> ( Model, Cmd Message )
updateProtocol msg model =
    case msg of
        DragDropMsg message ->
            let
                ( newModel, result ) =
                    -- TODO: Consider using updateSticky
                    DragDrop.update message model.dragDrop

                newFormula =
                    case result of
                        Just ( dragId, dropId, position ) ->
                            updateFormula dragId dropId position model.formula

                        Nothing ->
                            model.formula
            in
            ( { model
                | dragDrop = newModel
                , formula = newFormula
                , protocolCondition = evaluateFormulaAsProtocolCondition newFormula
                , protocolName = "custom"
              }
            , DragDrop.getDragstartEvent message
                |> Maybe.map (.event >> dragstart)
                |> Maybe.withDefault Cmd.none
            )

        SetDragFocus index ->
            ( { model | dragFocus = Just index }, Cmd.none )

        ClearDragFocus ->
            ( { model | dragFocus = Nothing }, Cmd.none )

        ToggleConnective index ->
            case Formula.toggleConnective model.formula index of
                Just newFormula ->
                    ( { model
                        | formula = newFormula
                        , protocolCondition = evaluateFormulaAsProtocolCondition newFormula
                        , protocolName = "custom"
                      }
                    , Cmd.none
                    )

                Nothing ->
                    ( model, Cmd.none )

        ToggleNegation index ->
            case Formula.toggleNegation model.formula index of
                Just newFormula ->
                    ( { model
                        | formula = newFormula
                        , protocolCondition = evaluateFormulaAsProtocolCondition newFormula
                        , protocolName = "custom"
                      }
                    , Cmd.none
                    )

                Nothing ->
                    ( model, Cmd.none )

        DeleteNode id ->
            let
                newFormula =
                    Formula.pruneTreeAt id model.formula
            in
            ( { model
                | formula = newFormula
                , protocolCondition = evaluateFormulaAsProtocolCondition newFormula
                , protocolName = "custom"
              }
            , Cmd.none
            )

        AppendConstituent constituent ->
            let
                newFormula =
                    Formula.append Formula.Or constituent model.formula
            in
            ( { model
                | formula = newFormula
                , protocolCondition = evaluateFormulaAsProtocolCondition newFormula
                , protocolName = "custom"
                , constituentPickerVisible = False
              }
            , Cmd.none
            )

        TogglePopover ->
            ( { model
                | constituentPickerVisible = not model.constituentPickerVisible
              }
            , Cmd.none
            )


{-| Updates the formula after a drag-and-drop event
-}
updateFormula : DragId -> DropId -> DragDrop.Position -> Protocol -> Protocol
updateFormula dragId dropId _ formula =
    let
        dragged =
            Formula.subTreeAt dragId formula

        droppedOn =
            Formula.subTreeAt dropId formula
    in
    -- disallow dropping an element on itself
    if dragId /= dropId then
        case ( dragged, droppedOn ) of
            ( Just draggedElement, Just droppedElement ) ->
                Formula.pruneTreeAt dragId formula
                    |> (\newFormula ->
                            Formula.replaceTreeAt dropId
                                newFormula
                                (Formula.makeConnective (Formula.highestIndex formula + 1) Formula.Or droppedElement draggedElement)
                                |> Maybe.withDefault formula
                       )

            _ ->
                formula

    else
        formula



-- VIEW


insertExampleGraph : String -> Model -> ( Model, Cmd Message )
insertExampleGraph graph model =
    update (ChangeGossipGraph graph) model
        |> (\( mo, me ) -> ( { mo | modal = (\md -> { md | visible = False }) mo.modal }, me ))


changeGossipGraph : String -> Model -> ( Model, Cmd Message )
changeGossipGraph input model =
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


changeCallSequence : Model -> String -> ( Model, Cmd Message )
changeCallSequence model input =
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


generateExecutionTree : Model -> ( Model, Cmd Message )
generateExecutionTree model =
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
    , Cmd.none
    )


executeCall : Model -> Call -> ( Model, Cmd Message )
executeCall model call =
    -- TODO: make this less of a copy of ExecuteCallSequence (extract some common code, clean up)
    case model.graph of
        Ok graph ->
            let
                highestIndex =
                    model.history
                        |> Tree.flatten
                        |> List.map
                            (\n ->
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
                    { callHistory =
                        -- Apply the sequence to the current position in the tree
                        Tree.Zipper.fromTree model.history
                            |> Tree.Zipper.findFromRoot
                                (\node ->
                                    case node of
                                        Node { index } ->
                                            index == model.historyLocation

                                        _ ->
                                            False
                                )
                            |> Maybe.withDefault (Tree.Zipper.fromTree model.history)
                    , state = graph
                    , index = highestIndex
                    }
                        |> (\{ callHistory, state, index } ->
                                { callHistory =
                                    Tree.Zipper.mapTree (Tree.prependChild <| Tree.singleton (Node { call = call, index = index + 1, state = Call.execute state call })) callHistory
                                        |> (\z -> Maybe.withDefault callHistory (Tree.Zipper.firstChild z))
                                , state = Call.execute state call
                                , index = index + 1
                                }
                           )
            in
            ( { model
                | graph = Ok <| newGraph.state
                , relations = Ok <| Graph.fold (\ctx acc -> acc ++ GossipGraph.Relation.fromNodeContext ctx) [] newGraph.state
                , historyLocation = newGraph.index
                , history = Tree.Zipper.toTree newGraph.callHistory
                , inputCallSequence = ""
                , inputGossipGraph = GossipGraph.Parser.toString newGraph.state
                , callSequence = Ok []
                , canonicalGossipGraph = GossipGraph.Parser.toCanonicalString newGraph.state
                , historyInitialGraph =
                    if Graph.isEmpty model.historyInitialGraph then
                        Result.withDefault Graph.empty model.graph

                    else
                        model.historyInitialGraph
              }
            , Cmd.none
            )

        _ ->
            ( model, Cmd.none )


executeCallSequence : Model -> ( Model, Cmd Message )
executeCallSequence model =
    case ( model.graph, model.callSequence ) of
        ( Ok graph, Ok sequence ) ->
            let
                highestIndex =
                    model.history
                        |> Tree.flatten
                        |> List.map
                            (\n ->
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
                                |> Tree.Zipper.findFromRoot
                                    (\node ->
                                        case node of
                                            Node { index } ->
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
                , canonicalGossipGraph = GossipGraph.Parser.toCanonicalString newGraph.state
                , historyInitialGraph =
                    if Graph.isEmpty model.historyInitialGraph then
                        Result.withDefault Graph.empty model.graph

                    else
                        model.historyInitialGraph
              }
            , Cmd.none
            )

        _ ->
            ( model, Cmd.none )


timeTravel : Int -> Model -> ( Model, Cmd Message )
timeTravel to model =
    let
        targetNode : Maybe (Tree.Zipper.Zipper HistoryNode)
        targetNode =
            if to == 0 then
                Just
                    (Tree.Zipper.fromTree model.history
                        |> Tree.Zipper.root
                    )

            else
                Tree.Zipper.fromTree model.history
                    |> Tree.Zipper.findFromRoot
                        (\zip ->
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
                node =
                    Tree.Zipper.label zip
            in
            case node of
                Node n ->
                    ( { model
                        | graph = Ok n.state
                        , inputGossipGraph = GossipGraph.Parser.toString n.state
                        , canonicalGossipGraph = GossipGraph.Parser.toCanonicalString n.state
                        , historyLocation = to
                      }
                    , Cmd.none
                    )

                Root ->
                    ( { model
                        | graph = Ok model.historyInitialGraph
                        , inputGossipGraph = GossipGraph.Parser.toString model.historyInitialGraph
                        , canonicalGossipGraph = GossipGraph.Parser.toCanonicalString model.historyInitialGraph
                        , historyLocation = to
                      }
                    , Cmd.none
                    )

                DeadEnd ->
                    ( model, Cmd.none )

        _ ->
            ( model, Cmd.none )


changeProtocol : String -> Model -> ( Model, Cmd Message )
changeProtocol protocolName model =
    let
        condition =
            Dict.get protocolName Predefined.condition

        formula =
            Dict.get protocolName Predefined.formula
    in
    case ( condition, formula ) of
        ( Just c, Just f ) ->
            ( { model
                | protocolCondition = c
                , protocolName = protocolName
                , history = Tree.singleton Root
                , formula = f
              }
            , Cmd.none
            )

        _ ->
            ( { model
                | protocolCondition = Predefined.any
                , protocolName = "any"
                , history = Tree.singleton Root
                , formula = Predefined.formulaAny
              }
            , Cmd.none
            )


helpButtonView : String -> List (Html Message) -> Html Message
helpButtonView title_ content =
    button [ class "help", title <| "Information about " ++ String.toLower title_, onClick (ShowModal [text title_] content) ]
        [ Icon.viewIcon Icon.question ]


headerHelpView : List (Html msg)
headerHelpView =
    let
        newTabLink content name url =
            a [ href url
                , title <| "Go to " ++ name ++ " (opens in a new tab)"
                , target "_blank" 
                ]
                [ content ]

        packageUrl name =
            let
                content = code [] [ text name ]
                url = "https://package.elm-lang.org/packages/" ++ name ++ "/latest/"
                title = "the " ++ name ++ " package on the Elm package site"
            in
            
            newTabLink content title url
    in
    
    [ p []
        [ text "ElmGossip is a web tool for exploring and analysing dynamic gossip."
        , text " This application is developed by "
        , newTabLink (text "Ramon Meffert") "Ramon's personal website" "https://r3n.nl"
        , text " and started as part of his "
        , newTabLink (text "bachelor's research project") "the thesis on the project" "https://fse.studenttheses.ub.rug.nl/23961/"
        , text " at the University of Groningen under supervision of Dr. "
        , newTabLink (text "Malvin Gattinger") "Malvin's personal website" "https://malv.in"
        , text "."
        ]
    , p []
        [ text "This tool is built on the following free software:" ]
    , ul []
        [ li []
            [ newTabLink (text "Elm") "the Elm website" "https://elm-lang.org"
            , text ", a functional web language, along with (among others) the following packages:"
            , ul []
                [ li []
                    [ packageUrl "elm-community/graph"
                    , text " for internal graph representation"
                    ]
                , li []
                    [ packageUrl "gampleman/elm-visualization"
                    , text " for rendering the graphs"
                    ]
                , li []
                    [ packageUrl "lattyware/elm-fontawesome"
                    , text " for the interface icons"
                    ]
                , li []
                    [ packageUrl "norpan/elm-html5-drag-drop"
                    , text " for the drag-and-drop functionality of the protocol builder"
                    ]
                , li []
                    [ packageUrl "zwilias/elm-rosetree"
                    , text " for the call history/execution tree"
                    ]
                ]
            ]
        , li [] 
            [ newTabLink ( text "Sass" ) "the Sass website" "https://sass-lang.org/"
            , text " for better CSS" ]
        ]
    , p []
        [ text "The source code is available on " 
        , newTabLink (text "GitHub") "the GitHub repository for ElmGossip" "https://github.com/ramonmeffert/elm-gossip"
        , text "."
        ]
    ]


headerView : Model -> Html Message
headerView model =
    header [ id "header" ]
        [ div [ class "title" ]
            [ img [ id "logo", src "logo-small.svg", title "ElmGossip Logo" ] []
            , div []
                [ h1 [] [ text "ElmGossip" ]
                ]
            ]
        , div [ class "info" ]
            [ a
                [ class "transparent icon button"
                , href "https://github.com/ramonmeffert/elm-gossip"
                , title "Source code (opens in a new tab)"
                , target "_blank"
                ]
                [ Icon.viewIcon Icon.github
                , text "Source code"
                ]
            , button [ class "transparent help icon", title "About this tool", onClick (ShowModal ([text "ElmGossip ", span [ class "note" ] [text "v", text model.applicationVersion]]) (headerHelpView)) ]
                [ Icon.viewIcon Icon.infoCircle, text "About" ]
            ]
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
        [ text "This notation is based on the notation in the appendix of the paper "
        , a [ href "https://arxiv.org/abs/1907.12321" ] [ text "Strengthening Gossip Protocols using Protocol-Dependent Knowledge" ]
        , text " by Van Ditmarsch et al. (2019)."
        ]

    -- , Alert.render Alert.Information "The next version of this application will allow an alternative input format: Instead of the letter-based format, a list-like format will be implemented. The string Ab aB will look like ([[0, 1], [0, 1]], [[0], [1]])."
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
    [ p [] [ text "These are some examples to get you started." ]
    , h4 [] [ text "Only number relations" ]
    , button [ type_ "button", class "icon", title "Load the numbers example", style "float" "right", onClick <| InsertExampleGraph "Abc aBc abC" ]
        [ Icon.viewIcon Icon.arrowRight
        , text "Load example"
        ]
    , p []
        [ text "In this example, three agents only know each others' phone numbers."
        ]
    , h4 [] [ text "All secret relations" ]
    , button [ type_ "button", class "icon", title "Load the secrets example", style "float" "right", onClick <| InsertExampleGraph "ABC ABC ABC" ]
        [ Icon.viewIcon Icon.arrowRight
        , text "Load example"
        ]
    , p []
        [ text "In this example, three agents know each others' secrets already."
        ]
    , h4 [] [ text "A complex example" ]
    , button [ type_ "button", class "icon", title "Load the complex example", style "float" "right", onClick <| InsertExampleGraph "Xyaz Axzy ZyAb BaZX Y" ]
        [ Icon.viewIcon Icon.arrowRight
        , text "Load example"
        ]
    , p []
        [ text "This is an example of a more complex gossip graph."
        ]
    ]


gossipGraphView : Model -> Html Message
gossipGraphView model =
    let
        graphIsValid =
            case ( String.isEmpty model.inputGossipGraph, model.graph ) of
                ( False, Ok _ ) ->
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
                , button [ type_ "button", title "Select one of several predefined gossip graphs", onClick <| ShowModal [ text "Gossip Graph input examples" ] gossipGraphExamples ] [ text "Examples" ]
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

        -- , div [ id "export-buttons", class "input-group right" ]
        --     [ button [ disabled (not graphIsValid), onClick (ShowModal "Coming soon" [ p [] [ Alert.render Alert.Information "This feature is coming soon." ] ]) ] [ text "Generate LaTeX file" ]
        --     , button [ disabled (not graphIsValid), onClick (ShowModal "Coming soon" [ p [] [ Alert.render Alert.Information "This feature is coming soon." ] ]) ] [ text "Copy GraphViz DOT code" ]
        --     ]
        ]


historyHelpView : List (Html msg)
historyHelpView =
    [ p []
        [ text """This section shows the history of calls that have been made. You can click any of the calls to 
                  time-travel to that state of the gossip graph. """
        , text "Clicking the "
        , code [] [ Icon.viewIcon Icon.fastForward ]
        , text " button will present you with a dialog in which you can explore all possible calls (up to a given depth). "
        , text "Clicking the "
        , code [] [ Icon.viewIcon Icon.eraser ]
        , text " button will clear the call history."
        ]
    ]


historyView : Model -> Html Message
historyView model =
    let
        renderCallHistoryNode : HistoryNode -> Html Message
        renderCallHistoryNode node =
            case node of
                Root ->
                    div [ onClick (TimeTravel 0), classList [ ( "call", True ), ( "current", model.historyLocation == 0 ) ], title "Initial Graph" ]
                        [ Icon.viewIcon Icon.asterisk ]

                DeadEnd ->
                    div [ class "dead-end", title "No more calls are possible" ]
                        [ Icon.viewIcon Icon.times ]

                Node n ->
                    case model.agents of
                        Ok agents ->
                            div
                                [ onClick (TimeTravel n.index)
                                , classList [ ( "call", True ), ( "current", model.historyLocation == n.index ) ]
                                ]
                                [ text <| Call.renderString agents n.call
                                ]

                        Err _ ->
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
        renderTree tree =
            tree
                |> Tree.restructure renderCallHistoryNode toListItems
                |> (\root -> ul [] [ root ])
    in
    -- TODO: render historic call sequence based on current branch of tree OR highlight current branch somehow
    section [ id "history" ]
        [ header []
            [ h2 [] [ text "Call history" ]
            , div [ class "input-set" ]
                [ button [ type_ "button", title "Clear the call history", onClick ClearExecutionTree ] [ Icon.viewIcon Icon.eraser ]
                , button [ type_ "button", title "Generate an execution tree", onClick (ShowModal [ text "Execution Tree" ] (executionTreeModalView model)) ] [ Icon.viewIcon Icon.fastForward ]
                , helpButtonView "Call history" historyHelpView
                ]
            ]
        , div [ id "execution-tree" ] [ renderTree model.history ]
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
        , sup [] [ text "d" ]
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
        , code [] [ Icon.viewStyled [ style "color" "red" ] Icon.times ]
        , text " or "
        , code [] [ Icon.viewStyled [ style "color" "green" ] Icon.check ]
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
        [ text <|
            "The current call sequence is "
                ++ (if not permitted then
                        "not"

                    else
                        ""
                   )
                ++ " permitted under the "
        , code [] [ text protocolName ]
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

        empty : Bool
        empty =
            String.isEmpty model.inputCallSequence
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
                    (if permitted && not empty then
                        "permitted"

                     else if empty then
                        ""

                     else
                        "not-permitted"
                    )
                , value model.inputCallSequence
                , onInput ChangeCallSequence
                , placeholder "Call sequence input"
                ]
                []
            , if empty then
                button [ disabled True, class "help", id "call-sequence-validity" ] [ text " " ]

              else if permitted then
                button
                    [ class "help permitted"
                    , id "call-sequence-validity"
                    , onClick <|
                        ShowModal
                            [ text "Call sequence permissibility" ]
                            (callSequencePermissibilityHelpView (Maybe.withDefault "?" <| Dict.get model.protocolName Predefined.name) permitted)
                    ]
                    [ Icon.viewStyled [ style "color" "green" ] Icon.check ]

              else
                button
                    [ class "help not-permitted"
                    , id "call-sequence-validity"
                    , onClick <|
                        ShowModal
                            [ text "Call sequence permissibility" ]
                            (callSequencePermissibilityHelpView (Maybe.withDefault "?" <| Dict.get model.protocolName Predefined.name) permitted)
                    ]
                    [ Icon.viewStyled [ style "color" "red" ] Icon.times ]
            , button
                [ type_ "button"
                , onClick ExecuteCallSequence
                , disabled <| not permitted || empty
                , title
                    (if empty then
                        "Please fill in a call sequence to execute"

                     else if permitted then
                        "Execute this call sequence on the gossip graph"

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
        [ text "This section allows you to select one of the gossip protocols as defined in the paper "
        , a [ href "https://doi.org/10/cvpm" ] [ text "Dynamic Gossip" ]
        , text " by Van Ditmarsch et al. (2018). When you have selected a protocol, the possible calls for that protocol and the current gossip graph, together with the call history, will be shown. "
        , text "Clicking the "
        , code [] [ Icon.viewIcon Icon.question ]
        , text " icon will tell you the rules of the selected protocol."
        ]
    , h4 [] [ text "Building custom protocols" ]
    , p []
        [ text """In the paper mentioned above, protocols are defined using a set of so-called constituents. Besides the
                  protocols mentioned in the paper, this tool allows you to remove, add and reconfigure these 
                  constituents in order to build new protocols."""
        ]
    , p []
        [ text "Using the "
        , code [] [ Icon.viewIcon Icon.plus, text " Add constituent" ]
        , text " button, you can choose one of six protocol constituents, as well as "
        , code [] [ text "⊤" ]
        , text " (True) and "
        , code [] [ text "⊥" ]
        , text " (False). "
        , text "You can remove elements from the formula using the "
        , code [] [ Icon.viewIcon Icon.trash ]
        , text " icon, reorder them using the grab handle ("
        , code [] [ Icon.viewIcon Icon.gripVertical ]
        , text ") and change whether constituents are negated using the "
        , code [] [ text "¬" ]
        , text " toggle. Clicking the conjunction ("
        , code [] [ text "∧" ]
        , text ") or disjunction ("
        , code [] [ text "∨" ]
        , text ") symbol will toggle between them."
        ]
    , h5 [] [ text "Protocol constituents" ]
    , table []
        [ tr []
            [ th [] [ text "Constituent" ]
            , th [] [ text "Explanation" ]
            ]
        , tr []
            [ td [ class "c" ] [ renderProtocolConstituent Empty ]
            , td [] [ text "There are no calls involving agent x." ]
            ]
        , tr []
            [ td [ class "c" ] [ renderProtocolConstituent LastTo ]
            , td [] [ text "The last call involving agent x was a call to agent x." ]
            ]
        , tr []
            [ td [ class "c" ] [ renderProtocolConstituent LastFrom ]
            , td [] [ text "The last call involving agent x was a call agent x made themselves." ]
            ]
        , tr []
            [ td [ class "c" ] [ renderProtocolConstituent HasCalled ]
            , td [] [ text "Agent x has already called agent y." ]
            ]
        , tr []
            [ td [ class "c" ] [ renderProtocolConstituent WasCalledBy ]
            , td [] [ text "Agent x has already been called by agent y." ]
            ]
        , tr []
            [ td [ class "c" ] [ renderProtocolConstituent KnowsSecret ]
            , td [] [ text "Agent x knows the secret of agent y." ]
            ]
        ]
    , h5 [] [ text "Execution of gossip protocols" ]
    , p [] [ text "A protocol π(x, y) is evaluated according to the following algorithm:" ]
    , blockquote []
        [ text "Until all agents are experts, select x, y ∈ A, such that x ≠ y, Nxy, and π(x, y), and execute call x y." ]
    , p [] 
        [ text "Or, more informally: " ]
    , blockquote [] 
        [ text "Until all agents know all secrets, and while there still is a distinct pair of agents (x, y) where x knows the number of y, and the protocol condition π(x, y) holds, let x call y." ]
    , p []
        [ text "These definitions are due to "
        , a [ href "https://doi.org/10/cvpm" ] [ text "Van Ditmarsch et al. (2018)" ] 
        , text "."
        ]
    , p [ class "note" ]
        [ em [] [ text "Note: " ]
        , text """when dragging one element on top of another, it will be placed after the element it is dropped on.
                  This means that dropping the second element of a boolean combination on top of the first one will not
                  change the combination. For example, if a formula is (A ∨ B), dragging B onto A will not change the
                  formula."""
        ]
    ]


renderProtocolConstituent : ProtocolConstituent -> Html msg
renderProtocolConstituent constituent =
    case constituent of
        Empty ->
            span [ class "protocol-constituent" ]
                [ text "σ"
                , sub [] [ text "x" ]
                , text " = ϵ"
                ]

        Verum ->
            span [ class "protocol-constituent" ]
                [ text "⊤" ]

        Falsum ->
            span [ class "protocol-constituent" ]
                [ text "⊥" ]

        LastTo ->
            span [ class "protocol-constituent" ]
                [ text "σ"
                , sub [] [ text "x" ]
                , text " = τ;zx"
                ]

        LastFrom ->
            span [ class "protocol-constituent" ]
                [ text "σ"
                , sub [] [ text "x" ]
                , text " = τ;xz"
                ]

        HasCalled ->
            span [ class "protocol-constituent" ]
                [ text "xy ∈ σ"
                , sub [] [ text "x" ]
                ]

        WasCalledBy ->
            span [ class "protocol-constituent" ]
                [ text "yx ∈ σ"
                , sub [] [ text "x" ]
                ]

        KnowsSecret ->
            span [ class "protocol-constituent" ]
                [ text "S"
                , sup [] [ text "σ" ]
                , text "xy"
                ]


isDragFocus : Formula.NodeId -> Maybe Formula.NodeId -> Bool
isDragFocus index dragFocus =
    case dragFocus of
        Nothing ->
            False

        Just i ->
            index == i


dragHandle : Formula.NodeId -> Html Message
dragHandle index =
    div
        [ class "drag-handle"
        , Html.Events.onMouseOver (ProtocolMessage (SetDragFocus index))
        , Html.Events.onMouseLeave (ProtocolMessage ClearDragFocus)
        ]
        [ Icon.viewIcon Icon.gripVertical ]


negationToggle : Formula.NodeId -> Negation -> Html Message
negationToggle id negationState =
    let
        isChecked =
            negationState == Negated
    in
    input
        [ type_ "checkbox"
        , class "negation"
        , checked isChecked
        , onClick (ProtocolMessage (ToggleNegation id))
        ]
        []


deleteButton : Formula.NodeId -> Html Message
deleteButton id =
    button [ onClick (ProtocolMessage (DeleteNode id)), class "delete-constituent" ]
        [ Icon.viewIcon Icon.trash ]


protocolView : Model -> Html Message
protocolView model =
    let
        protocolExplanation =
            case Dict.get model.protocolName Predefined.explanation of
                Just explanation ->
                    [ p [] [ text "This protocol is defined as follows:" ]
                    , blockquote []
                        [ p [] explanation
                        , footer []
                            [ Html.cite [] [ text "Based on the definition in ", Html.a [ href "https://doi.org/10/cvpm" ] [ text "Dynamic Gossip" ], text " (Van Ditmarsch et al., 2018)" ]
                            ]
                        ]
                    ]

                Nothing ->
                    if model.protocolName == "custom" then
                        [ p []
                            [ text "Custom protocols are built from protocol constituents. Click the "
                            , code [] [ Icon.viewIcon Icon.question ]
                            , text " button on the protocols section to learn more."
                            ]
                        ]

                    else
                        [ p [] [ text "Unknown protocol" ] ]

        transform :
            Formula.NodeId
            -> Formula.BoolElement ProtocolConstituent
            -> List (Html Message)
            -> List (Html Message)
            -> List (Html Message)
        transform id label left right =
            let
                junctionToString : Formula.Junction -> String
                junctionToString j =
                    if j == Formula.And then
                        "∧"

                    else
                        "∨"

                draggability : List (Attribute Message)
                draggability =
                    if isDragFocus id model.dragFocus then
                        DragDrop.draggable (\msg -> ProtocolMessage (DragDropMsg msg)) id

                    else
                        []

                droppability : List (Attribute Message)
                droppability =
                    case model.dragFocus of
                        Just _ ->
                            DragDrop.droppable (\msg -> ProtocolMessage (DragDropMsg msg)) id

                        Nothing ->
                            []
            in
            case label of
                Formula.Connective junction ->
                    [ ul (draggability ++ droppability)
                        [ dragHandle id
                        , div [ class "children" ]
                            [ li [] left
                            , li
                                [ class "junction"
                                , onClick <| ProtocolMessage (ToggleConnective id)
                                ]
                                [ text <| junctionToString junction ]
                            , li [] right
                            ]
                        ]
                    ]

                Formula.Constituent negation value ->
                    div (class "constituent" :: (draggability ++ droppability))
                        [ div [ class "controls" ]
                            [ dragHandle id
                            , negationToggle id negation
                            ]
                        , renderProtocolConstituent value
                        , deleteButton id
                        ]
                        :: left
                        ++ right
    in
    section [ id "protocols" ]
        [ header []
            [ h2 [] [ text "Gossip Protocols" ]
            , helpButtonView "Gossip Protocols" protocolHelpView
            ]
        , div [ id "protocol-builder" ] (Formula.cata transform [] model.formula)
        , div [ id "add-protocol-component" ]
            [ button [ type_ "button", class "icon", onClick <| ProtocolMessage TogglePopover ]
                [ Icon.viewIcon Icon.plus
                , text "Add constituent"
                ]
            ]
        , div [ id "constituent-popover", classList [ ( "visible", model.constituentPickerVisible ) ] ]
            [ div [ class "window" ]
                [ header []
                    [ strong []
                        [ text "Constituents" ]
                    , button [ type_ "button", title "Close window", onClick (ProtocolMessage TogglePopover) ] [ Icon.viewIcon Icon.times ]
                    ]
                , div [ class "constituents" ]
                    [ addProtocolConstituentButton Verum
                    , addProtocolConstituentButton Falsum
                    , addProtocolConstituentButton Empty
                    , addProtocolConstituentButton LastTo
                    , addProtocolConstituentButton LastFrom
                    , addProtocolConstituentButton HasCalled
                    , addProtocolConstituentButton WasCalledBy
                    , addProtocolConstituentButton KnowsSecret
                    ]
                ]
            ]
        , div [ class "input-group" ]
            [ select [ on "change" (Json.map ChangeProtocol targetValue), value model.protocolName ]
                (List.map (\k -> option [ value k ] [ text <| Maybe.withDefault "?" <| Dict.get k Predefined.name ]) (Dict.keys Predefined.name)
                    ++ [ option [ value "custom", disabled True ] [ text "Custom" ] ]
                )
            , helpButtonView
                (case Dict.get model.protocolName Predefined.name of
                    Just name ->
                        "The " ++ name ++ " protocol"

                    Nothing ->
                        "Custom protocols"
                )
                protocolExplanation
            ]
        , h3 [] [ text "Possible calls" ]
        , div [ class "call-list" ]
            (case ( model.agents, model.graph ) of
                ( Ok agents, Ok graph ) ->
                    let
                        calls =
                            GossipProtocol.selectCalls graph
                                model.protocolCondition
                                (findHistoryUpToIndex model.history model.historyLocation
                                )
                    in
                    if String.isEmpty model.inputGossipGraph then
                        [ text "None" ]

                    else if List.isEmpty calls then
                        [ text "All possible calls have been made." ]

                    else
                        List.map (\call -> div [ class "call", onClick (ExecuteCall call) ] [ text <| Call.renderString agents call ]) calls

                _ ->
                    -- TODO: propagate errors from model.callSequence, .agents, .graph instead of the error below
                    [ Alert.render Alert.Information "The call sequence below is impossible. I'll start looking for possible calls again when I understand the call sequence!"
                    ]
            )
        ]


findHistoryUpToIndex : Tree HistoryNode -> Int -> List Call
findHistoryUpToIndex history index =
    let
        getIndex : HistoryNode -> Int
        getIndex hNode =
            case hNode of
                Root -> 0
                DeadEnd -> -1
                Node a -> a.index

        getCall : HistoryNode -> List Call
        getCall hNode =
            case hNode of
                Node a -> [ a.call ]
                _ -> []

        makeHistory : List Call -> Tree.Zipper.Zipper HistoryNode -> List Call
        makeHistory h zip =
            case Tree.Zipper.parent zip of
                Just z -> (Tree.Zipper.label z |> getCall) ++ h

                Nothing -> h
    in
    Tree.Zipper.fromTree history
        |> Tree.Zipper.findFromRoot (\l -> getIndex l == index)
        |> Maybe.withDefault (Tree.Zipper.fromTree history)
        |> (\t -> makeHistory (Tree.Zipper.label t |> getCall) t)


addProtocolConstituentButton : ProtocolConstituent -> Html Message
addProtocolConstituentButton constituent =
    button [ type_ "button", onClick <| ProtocolMessage (AppendConstituent <| Formula.Constituent NotNegated constituent) ]
        [ renderProtocolConstituent constituent ]


modalView : Model -> Html Message
modalView model =
    div
        [ classList
            [ ( "modal-overlay", True )
            , ( "visible", model.modal.visible )
            ]
        ]
        [ div [ class "modal-window" ]
            [ header [ class "modal-header" ]
                [ h3 [] model.modal.title
                , button [ type_ "button", title "Close window", onClick HideModal ] [ Icon.viewIcon Icon.times ]
                ]
            , div [ class "modal-content" ] model.modal.content
            ]
        ]


view : Model -> Document Message
view model =
    { title = "ElmGossip"
    , body =
        [ headerView model
        , protocolView model
        , callSequenceView model
        , historyView model
        , gossipGraphView model
        , modalView model
        ]
    }
