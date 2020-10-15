module Types.Agent exposing (..)

{-| The `Agent` type is used to model the agents in a gossip graph.


# Definition

@docs Agent


# Helpers

@docs toNode, getDotAttrs

-}

import Dict exposing (Dict)
import Graph exposing (Node)


{-| An agent in a gossip graph.
-}
type alias Agent =
    { id : Int
    , name : Char
    }


{-| Converts an agent to a `Node` for use with the `elm-community/graph` package.

    toNode 1 'A' == { id = 1, label = 'A' }

-}
toNode : Agent -> Node Agent
toNode agent =
    { id = agent.id, label = agent }


{-| Gets the style attributes for rendering the current agent as a node in a GraphViz graph.

    getDotAttrs { id = 0, name = 'A' } == Dict.singleton "label" "A"

-}
getDotAttrs : Agent -> Dict String String
getDotAttrs a =
    Dict.singleton "label" (String.fromChar a.name)
