module Types.Relation exposing (..)
import Graph exposing (Edge)
import Dict exposing (Dict)


type Direction = Monodirectional | Bidirectional


type Relation = Number Direction | Secret Direction


toEdge : (Relation, Int, Int) -> Edge Relation
toEdge (rel, from, to) = { from = from, to = to, label = rel }


renderEdge : Relation -> Dict String String
renderEdge e = 
    if e == (Number Monodirectional) then
        Dict.singleton "style" "dashed"
    else if e == (Number Bidirectional) then
        Dict.fromList [("style", "dashed"), ("dir", "both")]
    else if e == (Secret Monodirectional) then
        Dict.empty
    else
        Dict.singleton "dir" "both"