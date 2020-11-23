module GossipProtocol.GossipProtocol exposing (..)

import CallSequence.CallSequence exposing (CallSequence)
import GossipGraph.Agent exposing (Agent, AgentId)
import GossipGraph.Call as Call exposing (Call)
import GossipGraph.Relation as Relation exposing (Kind(..), Relation, knows)
import Graph exposing (Graph, NodeContext)
import IntDict
import List.Extra exposing (mapAccumr)


{-| Protocol conditions
-}
type alias ProtocolCondition =
    ( AgentId, AgentId ) -> List Relation -> CallSequence -> Bool


{-| Selects the calls that can be executed based on some protocol condition.

Select x, y ∈ A, such that x ≠ y, Nxy, and π(x, y)

-}
selectCalls : Graph Agent Relation -> ProtocolCondition -> CallSequence -> List Call
selectCalls graph condition sequence =
    let
        calls : NodeContext Agent Relation -> List Call -> List Call
        calls context acc =
            let
                -- filter out identity relations
                localRelations =
                    -- select x, y ∈ A, such that x /= y, Nxy
                    Relation.fromNodeContext context
                        |> List.filter (\{ from, to } -> from /= to)

                -- the protocol condition needs a pair (x,y)
                relationPairs =
                    localRelations
                        |> List.map (\r -> ( r.from, r.to ))
            in
            -- check π(x, y)
            -- the resulting list of calls is the list of calls that can be executed on G given the call history
            List.filter (\x -> condition x localRelations sequence) relationPairs
                |> List.map Call.fromTuple
                |> (++) acc
    in
    Graph.fold calls [] graph


{-| Given a call sequence, a graph and a protocol condition, figure out whether
the call sequence is permitted.

Call sequence σ;xy is P-permitted on G iff σ is P-permitted on G and xy is P-permitted on Gσ

-}
sequencePermittedOn : ProtocolCondition -> Graph Agent Relation -> CallSequence -> Bool
sequencePermittedOn condition graph sequence =
    let
        relations : Graph Agent Relation -> List Relation
        relations g =
            Graph.edges g
                |> List.map .label

        isCallPermitted : Call -> Graph Agent Relation -> CallSequence -> Bool
        isCallPermitted { from, to } currentGraph callHistory =
            let
                rels =
                    relations currentGraph
            in
                (from /= to |> Debug.log "--\nx /= y")
                -- N^σ xy
                && (List.any (\r -> knows from to Number r) rels |> Debug.log "Nxy")
                -- π(x, y)
                && condition ( from, to ) rels callHistory |> Debug.log "pi(x, y)"
    in
    -- results in a tuple of the form ((Bool, (CallSequence, Graph Agent Relation)), List Graph Agent Relation)
    -- Since the empty call sequence is allowed, start with true
    -- while traversing the call sequence, we need to keep track of
    -- - the calls that have occured so far
    -- - the current state of the graph
    -- - whether the current call was permitted
    List.foldr (\call (history, state, permitted) ->
        (call :: history
        , Call.execute state call
        , permitted && isCallPermitted call state history
        )
    ) ([], graph, True) sequence
        |> \(_, _, isPermitted) -> isPermitted