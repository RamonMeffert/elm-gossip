module GossipProtocol.BooleanFormula exposing (Formula, BoolElement(..), Junction(..), Negation(..), empty, 
    singleton, at, toString, append, replaceTreeAt, pruneTreeAt, subTreeAt,
    toggleConnective, toggleNegation, isLeaf, NodeId, cata, makeConnective, highestIndex)


{-| A module for creating and modifying boolean formulae.

-}


import Maybe
import List exposing (maximum)
import Html exposing (..)

{-- NOT exposed so we can guarantee valid formulae

-}
-- TODO: consider adding a leaf type
type IndexTree label 
    = Leaf
    | Node NodeId label (IndexTree label) (IndexTree label)


type alias NodeId = Int


type alias Formula a = IndexTree (BoolElement a)


type Negation = Negated | NotNegated


type Junction
    = And
    | Or


type BoolElement a
    = Connective Junction
    | Constituent Negation a


invertJunction : Junction -> Junction
invertJunction junction =
    case junction of
        And ->
            Or
        Or ->
            And


empty : Formula a
empty = Leaf


isLeaf : Formula a -> Bool
isLeaf formula =
    case formula of
        Node _ _ Leaf Leaf ->
            True

        _ ->
            False

highestIndex : Formula a -> Int
highestIndex formula =
    case formula of
        Leaf -> 0 -- to make sure the first node has id 0

        Node index _ left right ->
            maximum [ index, highestIndex left, highestIndex right ]
                |> Maybe.withDefault 0


singleton : Int -> BoolElement a -> Formula a
singleton index node =
    Node index node Leaf Leaf


makeConnective : NodeId -> Junction -> Formula a -> Formula a -> Formula a
makeConnective id junction left right =
    Node id (Connective junction) left right


{-| Inserts a new boolean element at the end of a formula

-}
append : Junction -> BoolElement a -> Formula a -> Formula a
append junction el formula =
    let
        newIndex = highestIndex formula
    in
    
    case formula of
        Leaf ->
            singleton newIndex el
            
        Node i leaf Leaf Leaf ->
            -- Insert a node at a leaf
            Node (newIndex + 1) (Connective junction) (singleton i leaf) (singleton (newIndex + 2) el)

        Node i label left right ->
            -- Insert a node at a branch
            Node i label left (append junction el right)


{-| Tries to find an element at a given index.

-}
at : Int -> Formula a -> Maybe (BoolElement a)
at index formula =
    case formula of
        Leaf ->
            Nothing
        
        Node i node left right ->
            if i == index then
                Just <| node
            
            else
                case at index left of
                    Nothing ->
                        at index right

                    Just f ->
                        Just f


subTreeAt : Int -> Formula a -> Maybe (Formula a)
subTreeAt index formula =
    case formula of
        Leaf ->
            Nothing
        
        Node i _ left right ->
            if i == index then
                Just <| formula
            
            else
                case subTreeAt index left of
                    Nothing ->
                        subTreeAt index right

                    Just f ->
                        Just f

sameBoolElementType : BoolElement a -> BoolElement a -> Bool
sameBoolElementType b1 b2 =
    case (b1, b2) of
        (Connective _, Connective _) ->
            True
        
        (Constituent _ _, Constituent _ _) ->
            True

        _ ->
            False


{-| Removes a subtree at a given index from the tree, and makes sure the tree 
remains a valid boolean formula.

-}
pruneTreeAt : Int -> Formula a -> Formula a
pruneTreeAt index tree =
    let
        branchIndex : Formula a -> Int
        branchIndex branch =
            case branch of
                Leaf ->
                    -1

                Node i _ _ _ ->
                    i
    in
    case tree of
        Leaf ->
            tree

        Node i node left right ->
            let
                leftIndex = branchIndex left
                rightIndex = branchIndex right
            in
            
            if leftIndex == index then
                right
            else if rightIndex == index then
                left
            else
                Node i node
                    (pruneTreeAt index left)
                    (pruneTreeAt index right)


{-| Replaces a tree at an index if one exists and if the original element has 
the same type as the replacement

-}
replaceTreeAt : Int -> Formula a -> Formula a -> Maybe (Formula a)
replaceTreeAt index original replacement =
    case original of
        Leaf ->
            Nothing
        
        Node i node left right ->
            if i == index then
                case replacement of
                    Node _ replacementNode _ _ ->
                        -- if sameBoolElementType replacementNode node then
                            Just replacement
                        -- else
                        --     Nothing
                    _ ->
                        Nothing
            else
                case replaceTreeAt index left replacement of
                    Nothing ->
                        replaceTreeAt index right replacement
                            |> Maybe.andThen (\t -> Just <| Node i node left t)

                    Just t ->
                        Just <| Node i node t right


{-| Toggles a connective based on their index. Since this is not a balanced
tree, finding the connective is a bit inefficient 

-}
toggleConnective : Formula a -> NodeId -> Maybe (Formula a)
toggleConnective formula index =
    case formula of
        Leaf ->
            Nothing
        
        Node i node left right ->
            if i == index then
                case node of
                    Connective junction ->
                        Just <| Node i (Connective <| invertJunction junction) left right
                    _ ->
                        Nothing
            else
                case toggleConnective left index of
                    Nothing ->
                        toggleConnective right index
                            |> Maybe.andThen (\t -> Just <| Node i node left t)

                    Just t ->
                        Just <| Node i node t right


{-| Toggles whether a constituent is negated
-}
toggleNegation : Formula a -> NodeId -> Maybe (Formula a)
toggleNegation formula index =
    case formula of
        Leaf ->
            Nothing
        
        Node i node left right ->
            if i == index then
                case node of
                    Constituent negation value ->
                        case negation of
                            Negated ->
                                Just <| Node i (Constituent NotNegated value) left right
                            
                            NotNegated ->
                                Just <| Node i (Constituent Negated value) left right

                    _ ->
                        Nothing
            else
                case toggleNegation left index of
                    Nothing ->
                        toggleNegation right index
                            |> Maybe.andThen (\t -> Just <| Node i node left t)

                    Just t ->
                        Just <| Node i node t right


toString : (a -> String) -> Formula a -> String
toString valueToString formula =
    case formula of
        Leaf ->
            ""
        
        Node i (Connective junction) left right ->
            case junction of
                And ->
                    "(" ++ (toString valueToString left) ++ " AND" ++ "[" ++ (String.fromInt i) ++ "] " ++ (toString valueToString right) ++ ")"

                Or ->
                    "(" ++ (toString valueToString left) ++ " OR" ++ "[" ++ (String.fromInt i) ++ "] " ++ (toString valueToString right) ++ ")"

        Node i (Constituent negation value) _ _ ->
            case negation of
                Negated ->
                    "NOT " ++ valueToString value ++ "[" ++ (String.fromInt i) ++ "]"
                NotNegated ->
                    valueToString value ++ "[" ++ (String.fromInt i) ++ "]"



{-| Restructures a boolean formula tree into another datatype. A common example
would be an HTML list.

    toList : List (Html msg) -> Html msg
    toList children =
        li [] 
            [ ul [] children ]

    toListItem : BoolElement -> Html msg
    toListItem el =
        case el of
            Connective junction ->
                case junction of
                    And -> 
                        li [] [ text "AND" ]

                    Or -> 
                        li [] [ text "OR" ]

            Constituent negated value ->
                if negated then
                    li [] [ text <| "NOT " ++ value ]
                else 
                    li [] [ text value ]

    fromList [ Constituent false "a", Constituent false "b", Constituent false "c"]
        |> restructure toListItem toList

    == Html.ul []
        [ Html.li [] [text "a"]
        , Html.li [] [text "OR"]
        , Html.li []
            [ Html.ul []
                [ Html.li [] [ text "b" ]
                , Html.li [] [ text "OR" ]
                , Html.li [] [ text "c" ]
                ]
            ]
        ]

-}
restructure : (BoolElement a -> a) -> (List a -> a) -> Formula a -> a
restructure transformLabel transformTree formula =
    case formula of
        Node _ (Connective junction) left right ->
            transformTree
                [ restructure transformLabel transformTree left
                , transformLabel (Connective junction)
                , restructure transformLabel transformTree right
                ]

        Node _ (Constituent negated value) _ _ ->
            transformLabel (Constituent negated value)

        Leaf ->
            transformTree []


{-| The same as `restructure`, but the label transform also takes an index.

-}
restructureIndexed : (NodeId -> BoolElement b -> a) -> (List a -> a) -> Formula b -> a
restructureIndexed transformLabel transformTree formula =
    case formula of
        Node i (Connective junction) left right ->
            transformTree
                [ restructureIndexed transformLabel transformTree left
                , transformLabel i (Connective junction)
                , restructureIndexed transformLabel transformTree right
                ]

        Node i (Constituent negated value) _ _ ->
            transformLabel i (Constituent negated value)

        Leaf ->
            transformTree []

{-| Produce a catamorphism of a tree.

(TODO: add example)

-}
cata :  (NodeId -> a -> b -> b -> b) -> b -> IndexTree a -> b
cata f acc formula =
    case formula of
        Leaf ->
            acc

        Node id label left right ->
            f id label (cata f acc left) (cata f acc right)
