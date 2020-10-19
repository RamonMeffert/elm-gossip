module Renderers.Types exposing (..)
import Force
import Types.Agent exposing (Agent)
import Graph exposing (Graph)
import Types.Relation exposing (Relation)



type alias Model =
    { graph : Graph Entity Relation
    , settings : GraphSettings
    }


type alias GraphSettings =
    -- For now, these don't have an explicit unit (cm, px, etc) but are just assumed to be px
    -- that is, until I figure out how to get the value out of a `Length`.
    { nodeRadius : Float
    , edgeWidth : Float
    , arrowLength : Float
    }

    
type alias Entity =
    Force.Entity Int { value : Agent }