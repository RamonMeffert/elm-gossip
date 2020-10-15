module Parsers.CallSequence exposing (..)
import Types.Agent exposing (Agent)


type alias Call = 
    { from : Agent
    , to : Agent
    }


type alias CallSequence = List Call


parse : String -> CallSequence
parse input = []