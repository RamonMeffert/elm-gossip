module GossipProtocol.GossipProtocol exposing (..)

import Graph exposing (Graph, NodeContext, fold)
import GossipGraph.Agent exposing (Agent, AgentId)
import GossipGraph.Call exposing (Call)
import CallSequence.CallSequence exposing (CallSequence)
import GossipGraph.Relation as Relation exposing (Kind(..), Relation)


{-| Protocol conditions
-}
type alias ProtocolCondition =
    ( AgentId, AgentId ) -> List Relation -> CallSequence -> Bool


{-| Selects the calls that can be executed based on some protocol condition.

Select x, y ∈ A, such that x ≠ y, Nxy, and π(x, y)

-}
select : Graph Agent Relation -> ProtocolCondition -> CallSequence -> List Call
select graph condition sequence =
    let
        calls : NodeContext Agent Relation -> List Call -> List Call
        calls context acc =
            let
                -- since identity relations are implied, they aren't modeled so we do not need to filter them out
                -- that is, x /= y is inherently satisfied
                -- also, because S ⊆ N ⊆ A², we know for sure that Nxy holds, for `fromNodeContext` returns all relations for an agent,
                -- so any relation is definitely at least a number relation
                localRelations =
                    Relation.fromNodeContext context

                -- the protocol condition needs a pair (x,y)
                relationPairs =
                    localRelations
                        |> List.map (\r -> ( r.from, r.to ))
            in
            -- select x, y ∈ A, such that x /= y, Nxy, and π(x, y)
            -- the resulting list of calls is the list of calls that can be executed on G given the call history
            List.filter (\x -> condition x localRelations sequence) relationPairs
                |> List.map GossipGraph.Call.fromTuple
                |> (++) acc
    in
    Graph.fold calls [] graph


