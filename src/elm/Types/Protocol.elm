module Types.Protocol exposing (..)

import Graph exposing (Graph, NodeContext, fold)
import Types.Agent exposing (Agent, AgentId)
import Types.Call exposing (Call)
import Types.CallSequence exposing (CallSequence)
import Types.Relation exposing (Kind(..), Relation, fromNodeContext)


{-| Protocol conditions
-}
type alias ProtocolCondition =
    ( AgentId, AgentId ) -> List Relation -> CallSequence -> Bool


{-| Selects the calls to be executed based on some protocol condition.

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
                -- also, because S ⊆ N ⊆ A², we know for sure that Nxy: fromNodeContext returns all relations for an agent,
                -- so any relation is definitely a number relation
                localRelations =
                    fromNodeContext context

                -- the protocol condition needs a pair (x,y)
                relationPairs =
                    localRelations
                        |> List.map (\r -> ( r.from, r.to ))
            in
            -- select x, y ∈ A, such that x /= y, Nxy, and π(x, y)
            -- the resulting list of calls is the list of calls that can be executed on G given the call history
            List.filter (\x -> condition x localRelations sequence) relationPairs
                |> List.map Types.Call.fromTuple
    in
    Graph.fold calls [] graph
