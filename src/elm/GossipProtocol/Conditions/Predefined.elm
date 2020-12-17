module GossipProtocol.Conditions.Predefined exposing (..)

{-| This file contains several predefined protocol conditions. Based on Van Ditmarsch (2018)
-}

import CallSequence.CallSequence exposing (containing)
import Dict exposing (Dict)
import GossipProtocol.Conditions.Constituents exposing (..)
import GossipProtocol.GossipProtocol exposing (ProtocolCondition)


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


explanation : Dict String String
explanation =
    Dict.fromList
        [ ( "any", "Until every agent knows all secrets, choose different agents x and y, such that x knows the number of y, and let x call y." )
        , ( "tok", "Until every agent knows all secrets, choose different agents x and y with x ≠ y, such that x knows y’s number and either x has not been in prior calls or the last call involving x was to x, and let x call y." )
        , ( "spi", "Until every agent knows all secrets, choose different agents x and y, such that x knows y’s number and either x has not been in prior calls or the last call involving x was from x, and let x call y." )
        , ( "wco", "Until every agent knows all secrets, choose different agents x and y, such that x knows the number of y and x did not call y before, and let x call y." )
        , ( "co", "Until every agent knows all secrets, choose different agents x and y, such that x knows the number of y and there was no prior call between x and y, and let x call y." )
        , ( "lns", "Until every agent knows all secrets, choose different agents x and y, such that x knows the number of y but not the secret of y, and let x call y." )
        ]
