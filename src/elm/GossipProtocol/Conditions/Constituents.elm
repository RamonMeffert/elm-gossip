module GossipProtocol.Conditions.Constituents exposing (..)

{-| All possible constituents of a protocol condition. Based on definition 4 in _Van Ditmarsch (2018)_
-}

import GossipGraph.Agent exposing (AgentId)
import CallSequence.CallSequence exposing (CallSequence, last)
import GossipGraph.Relation exposing (Kind(..), Relation, knows)


{-| σₓ == ϵ

Returns whether a call sequence is empty. `sequence` should be the subsequence of calls containing `x`.

-}
empty : CallSequence -> Bool
empty sequence =
    List.isEmpty sequence


{-| σₓ == τ;zx

Returns whether the last call in a sequence was to x. `sequence` should be the subsequence of calls containing `x`.

-}
lastTo : AgentId -> CallSequence -> Bool
lastTo agent sequence =
    case last sequence of
        Just call ->
            call.to == agent

        Nothing ->
            False


{-| σₓ == τ;xz

Returns whether the last call in a sequence was from x. `sequence` should be the subsequence of calls containing `x`.

-}
lastFrom : AgentId -> CallSequence -> Bool
lastFrom agent sequence =
    case last sequence of
        Just call ->
            call.from == agent

        Nothing ->
            False


{-| xy ∈ σₓ

Returns whether x has called y in a sequence. `sequence` should be the subsequence of calls containing `x`.

-}
hasCalled : AgentId -> AgentId -> CallSequence -> Bool
hasCalled x y sequence =
    List.any (\c -> c.from == x && c.to == y) sequence


{-| yx ∈ σₓ

Returns whether x was called by y in a sequence. `sequence` should be the subsequence of calls containing `x`.

-}
wasCalledBy : AgentId -> AgentId -> CallSequence -> Bool
wasCalledBy x y sequence =
    List.any (\c -> c.from == y && c.to == x) sequence


{-| S^σ xy

Returns whether agent x knows the secret of agent y. `relations` should be the list of relations in the current graph state (i.e. after some call sequence σ)

-}
knowsSecret : AgentId -> AgentId -> List Relation -> Bool
knowsSecret x y relations =
    List.any (\r -> knows x y Secret r) relations
