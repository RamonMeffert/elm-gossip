module Types.Protocol exposing (..)

import Graph exposing (Graph)
import Types.CallSequence exposing (CallSequence)
import Types.Agent exposing (Agent)
import Types.Call exposing (Call)
import Types.Relation exposing (Relation)

-- protocol definition
-- Until all agents are experts, select x, y ∈ A, such that x /= y, Nxy, and π(x, y), and execute call x y.


type alias Condition =
    (Agent, Agent) -> List Relation -> CallSequence -> Bool


type alias Protocol =
    Graph Agent Relation -> Condition -> List Call
