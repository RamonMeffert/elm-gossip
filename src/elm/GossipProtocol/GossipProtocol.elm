module GossipProtocol.GossipProtocol exposing (..)

import Array
import CallSequence.CallSequence exposing (CallSequence)
import GossipGraph.Agent exposing (Agent, AgentId)
import GossipGraph.Call as Call exposing (Call)
import GossipGraph.Relation as Relation exposing (Kind(..), Relation, knows)
import Graph exposing (DfsNodeVisitor, Graph, NodeContext, NodeId)
import IntDict
import List
import Set exposing (Set)
import Tree exposing (Tree)


{-| Protocol conditions
import GossipGraph.Relation
-}
type alias ProtocolCondition =
    ( AgentId, AgentId ) -> List Relation -> CallSequence -> Bool


type HistoryNode
    = Root
    | Node
        { call : Call
        , index : Int
        , state : Graph Agent Relation
        }
    | DeadEnd


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
            Graph.fold (\ctx acc -> acc ++ Relation.fromNodeContext ctx) [] g

        isCallPermitted : Call -> Graph Agent Relation -> CallSequence -> Bool
        isCallPermitted { from, to } currentGraph callHistory =
            let
                -- `rels` is the set of relations on the current graph, i.e. N^σ ∪ S^σ
                rels : List Relation
                rels =
                    relations currentGraph
            in
            -- x ≠ y
            (from /= to)
                -- N^σ xy
                && List.any (\r -> knows from to Number r) rels
                -- π(x, y)
                && condition ( from, to ) rels callHistory
    in
    -- results in a tuple of the form ((Bool, (CallSequence, Graph Agent Relation)), List Graph Agent Relation)
    -- Since the empty call sequence is allowed, start with true
    -- while traversing the call sequence, we need to keep track of
    -- - the calls that have occured so far
    -- - the current state of the graph
    -- - whether the current call was permitted
    List.foldr
        (\call ( history, state, permitted ) ->
            ( call :: history
            , Call.execute state call
            , permitted && isCallPermitted call state history
            )
        )
        ( [], graph, True )
        sequence
        |> (\( _, _, isPermitted ) -> isPermitted)



-- TODO: move everything below here to GossipGraph
-- TODO: Extract edgeInAnyDirection function as it is used by both isWeaklyConnected and isStronglyConnected


{-| An initial gossip graph G = (A, N, S) is a sun iff N is strongly connected
on the restriction of G to the set of non-terminal nodes.

That is: if you prune leaf nodes (i.e. nodes with only incoming edges), N should be strongly connected.

-}
isSunGraph : Graph Agent Relation -> Bool
isSunGraph graph =
    let
        prune g =
            Graph.fold
                (\ctx acc ->
                    -- if the only outgoing relation is the identity relation,
                    -- that means there are no outgoing relations and the node can
                    -- be pruned
                    if IntDict.remove ctx.node.id ctx.outgoing |> IntDict.isEmpty then
                        ctx.node.id :: acc

                    else
                        acc
                )
                []
                g
                |> List.foldr (\nodeid _ -> Graph.remove nodeid graph) g
    in
    graph
        |> prune
        |> isStronglyConnected Number


{-| Van Ditmarsch et al. (2018) state that “[a relation] is weakly connected if,
for all _x, y ∈ A_, there is an _(N ∪ N⁻¹)_ path from _x_ to _y_”
(Note: _N_ is _a_ relation, not necessarily the number relation)

That is: for all nodes, there must exist a path to every other node. To check
this, we can simply pick a random node and see if we can reach every other node.

Idea:

1.  Compute the symmetric closure of the graph
2.  Pick a random node
3.  Check if all other nodes are reachable by traversing depth-first
4.  If this is true, the graph is weakly connected

-}
isWeaklyConnected : Kind -> Graph Agent Relation -> Bool
isWeaklyConnected kind graph =
    let
        firstNode = List.head <| Graph.nodeIds graph

        merger : NodeId -> NodeId -> Relation -> Relation -> Relation
        merger _ _ outLabel _ =
            outLabel

        visitor : DfsNodeVisitor Agent Relation (Set AgentId)
        visitor ctx acc =
            ctx.outgoing
                -- find all relations of `kind` from the current node and ignore reflexive relation
                |> IntDict.filter (\_ r -> Relation.isOfKind r kind && r.to /= r.from)
                -- convert to a List (Int, Relation)
                |> IntDict.toList
                -- Take only the Relation, and of that, only .to
                |> List.map (Tuple.second >> .to)
                -- Add that agent id to the set of reachable agents
                |> List.foldr Set.insert acc
                -- produce the desired format (??)
                |> (\a -> ( a, identity ))
    in
    case firstNode of
        Just fn ->
            -- Construct the symmetric closure of the graph
            Graph.symmetricClosure merger graph
                -- Starting at some first node, traverse the graph depth-first and construct the set of reachable agents
                |> Graph.guidedDfs Graph.alongOutgoingEdges visitor [ fn ] Set.empty
                -- Add the first agent to the set of reachable agents
                |> \(reachableAgents, _) -> Set.insert fn reachableAgents
                -- Check if all agents are reachable
                |> (\allReachableAgents -> List.all (\agent -> Set.member agent allReachableAgents) (Graph.nodeIds graph))
        
        Nothing ->
            False

{-| Determines whether some relation P of a given kind is strongly connected by
checking whether the number of connected components for P is equal to 1.

-}
isStronglyConnected : Kind -> Graph Agent Relation -> Bool
isStronglyConnected kind graph =
    let
        -- Removes edges from a context that are not of the right kind.
        -- For example, when we want to find out if the number relation is 
        -- strongly connected, we need to remove all edges indicating secret 
        -- relations. When checking for the secret relation, we do not need to 
        -- remove edges, since a secret relation implies a number relation.
        -- The Relation.isOfKind function takes care of this. However, if we
        -- would want better performance, we could also let kindGraph be the
        -- unmodified graph when analysing the secret relation.
        reduceContext : NodeContext Agent Relation -> NodeContext Agent Relation
        reduceContext context =
            { context 
                | incoming = IntDict.filter (\_ r -> Relation.isOfKind r kind) context.incoming
                , outgoing = IntDict.filter (\_ r -> Relation.isOfKind r kind) context.outgoing
            }

        -- The subgraph containing only edges that are at least of some kind,
        -- keeping in mind that N ⊆ S
        kindGraph = Graph.mapContexts reduceContext graph
    in
    case Graph.stronglyConnectedComponents kindGraph of
       -- Ok acyclic means the graph is acyclic and therefor cannot be strongly connected
       Ok _ -> False
       -- If the graph contains strongly connected components, it is only strongly connected if there is only 1
       Err components -> List.length components == 1


generateExecutionTree : Int -> Graph Agent Relation -> ProtocolCondition -> CallSequence -> Int -> Tree HistoryNode -> Tree HistoryNode
generateExecutionTree index graph condition sequence depth state =
    let
        -- Select the calls that are possible on the current state of the graph
        possibleCalls =
            selectCalls graph condition sequence |> Array.fromList |> Array.toIndexedList

        nextIndex =
            index + List.length possibleCalls

        nextState =
            if List.isEmpty possibleCalls then
                Tree.prependChild (Tree.singleton DeadEnd) state

            else
                List.foldr
                    (\( ind, call ) acc ->
                        Tree.prependChild (Tree.singleton (Node { call = call, index = index + ind, state = Call.execute graph call })) acc
                    )
                    state
                    possibleCalls
    in
    if depth > 1 then
        nextState
            |> Tree.mapChildren
                (List.indexedMap
                    (\ind child ->
                        case Tree.label child of
                            Node n ->
                                generateExecutionTree (nextIndex * (ind + 1)) n.state condition sequence (depth - 1) child

                            _ ->
                                child
                    )
                )

    else
        nextState
