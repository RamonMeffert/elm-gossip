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
                -- filter out identity relations
                localRelations =
                    -- select x, y ∈ A, such that x /= y, Nxy
                    Relation.fromNodeContext context
                    |> List.filter (\{ from, to } -> from /= to )

                -- the protocol condition needs a pair (x,y)
                relationPairs =
                    localRelations
                        |> List.map (\r -> ( r.from, r.to ))
            in
            -- check π(x, y)
            -- the resulting list of calls is the list of calls that can be executed on G given the call history
            List.filter (\x -> condition x localRelations sequence) relationPairs
                |> List.map GossipGraph.Call.fromTuple
                |> (++) acc
    in
    Graph.fold calls [] graph


