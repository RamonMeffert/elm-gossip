module Conditions.Constituents exposing (..)

{-| All possible constituents of a protocol condition. Based on definition 4 in _Van Ditmarsch (2018)_
-}

import Task exposing (sequence)
import Types.Agent exposing (Agent)
import Types.Call exposing (Call)
import Types.CallSequence exposing (CallSequence, last)
import Types.Relation exposing (Kind(..), Relation, knows)


{-| σₓ == ϵ

Returns whether a call sequence is empty. `sequence` should be the subsequence of calls containing `x`.
-}
empty : CallSequence -> Bool
empty sequence =
    List.isEmpty sequence


{-| σₓ == τ;zx

Returns whether the last call in a sequence was to x. `sequence` should be the subsequence of calls containing `x`.

-}
lastTo : Agent -> CallSequence -> Bool
lastTo agent sequence =
    case last sequence of
        Just call ->
            call.to == agent

        Nothing ->
            False


{-| σₓ == τ;xz

Returns whether the last call in a sequence was from x. `sequence` should be the subsequence of calls containing `x`.

-}
lastFrom : Agent -> CallSequence -> Bool
lastFrom agent sequence =
    case last sequence of
        Just call ->
            call.from == agent

        Nothing ->
            False


{-| xy ∈ σₓ

Returns whether x has called y in a sequence. `sequence` should be the subsequence of calls containing `x`.

-}
hasCalled : Agent -> Agent -> CallSequence -> Bool
hasCalled x y sequence =
    List.member { from = x, to = y } sequence


{-| yx ∈ σₓ

Returns whether x was called by y in a sequence. `sequence` should be the subsequence of calls containing `x`.

-}
wasCalledBy : Agent -> Agent -> CallSequence -> Bool
wasCalledBy x y sequence =
    List.member { from = y, to = x } sequence


{-| S^σ xy

Returns whether agent x knows the secret of agent y. `relations` should be the list of relations in the current graph state (i.e. after some call sequence σ)

-}
knowsSecret : Agent -> Agent -> List Relation -> Bool
knowsSecret x y relations =
    List.any (\r -> knows x y Secret r) relations
