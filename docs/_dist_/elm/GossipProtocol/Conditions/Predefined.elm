module GossipProtocol.Conditions.Predefined exposing (..)

{-| This file contains several predefined protocol conditions. Based on Van Ditmarsch (2018)
-}

import CallSequence.CallSequence exposing (containing)
import Dict exposing (Dict)
import GossipProtocol.BooleanFormula as Formula exposing (Junction(..), Negation(..))
import GossipProtocol.Conditions.Constituents exposing (..)
import GossipProtocol.GossipProtocol exposing (ProtocolCondition)
import Html exposing (Html, p, sup, text)


type alias Protocol =
    Formula.Formula ProtocolConstituent


any : ProtocolCondition
any _ _ _ =
    True


tok : ProtocolCondition
tok ( x, _ ) _ sequence =
    let
        sigma_x =
            containing sequence x
    in
    empty sigma_x || lastTo x sigma_x


spi : ProtocolCondition
spi ( x, _ ) _ sequence =
    let
        sigma_x =
            containing sequence x
    in
    empty sigma_x || lastFrom x sigma_x


co : ProtocolCondition
co ( x, y ) _ sequence =
    let
        sigma_x =
            containing sequence x
    in
    not (hasCalled x y sigma_x) && not (wasCalledBy x y sigma_x)


wco : ProtocolCondition
wco ( x, y ) _ sequence =
    let
        sigma_x =
            containing sequence x
    in
    not (hasCalled x y sigma_x)


lns : ProtocolCondition
lns ( x, y ) relations _ =
    not (knowsSecret x y relations)


name : Dict String String
name =
    Dict.fromList
        [ ( "any", "Any" )
        , ( "tok", "Token" )
        , ( "spi", "Spider" )
        , ( "co", "Call Once" )
        , ( "wco", "Weak Call Once" )
        , ( "lns", "Learn New Secrets" )
        ]


condition : Dict String ProtocolCondition
condition =
    Dict.fromList
        [ ( "any", any )
        , ( "tok", tok )
        , ( "spi", spi )
        , ( "co", co )
        , ( "wco", wco )
        , ( "lns", lns )
        ]


formula : Dict String (Formula.Formula ProtocolConstituent)
formula =
    Dict.fromList
        [ ( "any", formulaAny )
        , ( "tok", formulaTok )
        , ( "spi", formulaSpi )
        , ( "co", formulaCo )
        , ( "wco", formulaWco )
        , ( "lns", formulaLns )
        ]


formulaAny : Formula.Formula ProtocolConstituent
formulaAny =
    Formula.singleton 0 (Formula.Constituent NotNegated Verum)


formulaTok =
    Formula.singleton 0 (Formula.Constituent NotNegated Empty)
        |> Formula.append Or (Formula.Constituent NotNegated LastTo)


formulaSpi =
    Formula.singleton 0 (Formula.Constituent NotNegated Empty)
        |> Formula.append Or (Formula.Constituent NotNegated LastFrom)


formulaCo =
    Formula.singleton 0 (Formula.Constituent Negated HasCalled)
        |> Formula.append And (Formula.Constituent Negated WasCalledBy)


formulaWco =
    Formula.singleton 0 (Formula.Constituent NotNegated HasCalled)


formulaLns =
    Formula.singleton 0 (Formula.Constituent Negated KnowsSecret)


explanation : Dict String (List (Html msg))
explanation =
    Dict.fromList
        [ ( "any"
          , [ p [] [ text "Until every agent knows all secrets, choose different agents x and y, such that x knows the number of y, and let x call y." ]
            , p [] [ text "Represented by the boolean formula ⊤." ]
            ]
          )
        , ( "tok"
          , [ p [] [ text "Until every agent knows all secrets, choose different agents x and y with x ≠ y, such that x knows y’s number and either x has not been in prior calls or the last call involving x was to x, and let x call y." ]
            , p [] [ text "Represented by the boolean formula σₓ = ϵ ∨ σₓ = t;zx." ]
            ]
          )
        , ( "spi"
          , [ p [] [ text "Until every agent knows all secrets, choose different agents x and y, such that x knows y’s number and either x has not been in prior calls or the last call involving x was from x, and let x call y." ]
            , p [] [ text "Represented by the boolean formula σₓ = ϵ ∨ σₓ = t;xz." ]
            ]
          )
        , ( "wco"
          , [ p [] [ text "Until every agent knows all secrets, choose different agents x and y, such that x knows the number of y and x did not call y before, and let x call y." ]
            , p [] [ text "Represented by the boolean formula xy ∉ σₓ ∧ yx ∉ σₓ." ]
            ]
          )
        , ( "co"
          , [ p [] [ text "Until every agent knows all secrets, choose different agents x and y, such that x knows the number of y and there was no prior call between x and y, and let x call y." ]
            , p [] [ text "Represented by the boolean formula xy ∉ σₓ." ]
            ]
          )
        , ( "lns"
          , [ p [] [ text "Until every agent knows all secrets, choose different agents x and y, such that x knows the number of y but not the secret of y, and let x call y." ]
            , p []
                [ text "Represented by the boolean formula ¬S"
                , sup [] [ text "σ" ]
                , text "xy."
                ]
            ]
          )
        ]
