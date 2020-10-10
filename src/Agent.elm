module Agent exposing (..)
import Graph exposing (Node)
import Dict exposing (Dict)



type alias Agent = 
    { id : Int
    , name : Char 
    }

{-| Converts an agent with an id to a Graph.Node.

    toNode 1 'A' == Node { id = 1, label = 'A' }
-}
toNode : Agent -> Node Agent
toNode agent = { id = agent.id, label = agent }


renderNode : Agent -> Dict String String
renderNode a = Dict.singleton "label" (String.fromChar a.name)
