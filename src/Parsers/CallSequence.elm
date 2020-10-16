module Parsers.CallSequence exposing (parse, lexer)

{-| Simple LL(1) parser for call sequences.
-}

import Types.Agent exposing (Agent)
import Helpers.List exposing (takeWhile)
import Helpers.List exposing (dropWhile)


type alias Call =
    { from : Agent
    , to : Agent
    }


type alias CallSequence =
    List Call


type alias Error =
    String


{-| Expects a string of the format `ab ; cd ; ef`
-}
parse : String -> Result Error CallSequence
parse input =
    Ok []



-- LEXER


type LexToken
    = CallToken String
    | Separator


whitespace : List Char
whitespace =
    [ ' ', '\t', '\n' ]


separators : List Char
separators =
    [ ';' ]


{-| -}
lexer : String -> Result Error (List LexToken)
lexer s =
    let
        charLexer : List Char -> Int -> Result Error (List LexToken)
        charLexer chars pos =
            case chars of
                [] ->
                    Ok []

                c :: cs ->
                    if List.member c whitespace then
                        charLexer cs (pos + 1)

                    else if List.member c separators then
                        case charLexer cs (pos + 1) of
                            Ok tokens ->
                                Ok (Separator :: tokens)
                            Err e
                                -> Err e

                    else if Char.isAlpha c then
                        let
                            token = String.fromList (c :: takeWhile (\x -> Char.isAlpha x) cs)
                            rest = charLexer (dropWhile (\x -> Char.isAlpha x) cs) (pos + 1 + String.length token)
                        in
                        case rest of
                            Ok tokens ->
                                Ok (CallToken token :: tokens)
                            Err e ->
                                Err e

                    else
                        Err ("Invalid character '" ++ (String.fromChar c) ++ "' at position " ++ (String.fromInt pos))

    in
    charLexer (String.toList s) 1
