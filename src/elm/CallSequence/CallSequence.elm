module CallSequence.CallSequence exposing (..)

import GossipGraph.Agent exposing (AgentId)
import GossipGraph.Call as Call exposing (Call, includes)
import GossipGraph.Relation as Relation exposing (Kind(..))
import Graph
import IntDict
import List exposing (head)
import List.Extra exposing (mapAccumr)


{-| A list of consecutive calls. Ordered latest to first call to improve lookup speed.
-}
type alias CallSequence =
    List Call


{-| σ\_x
-}
containing : CallSequence -> AgentId -> CallSequence
containing sequence agent =
    case sequence of
        [] ->
            []

        call :: calls ->
            if includes call agent then
                call :: containing calls agent

            else
                containing calls agent
