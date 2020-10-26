module Conditions.Predefined exposing (..)

{-| This file contains several predefined protocol conditions. Based on Van Ditmarsch (2018)
-}

import Conditions.Constituents exposing (..)
import Types.CallSequence exposing (containing)
import Types.Protocol exposing (ProtocolCondition)


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
