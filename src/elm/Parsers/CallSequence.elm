module Parsers.CallSequence exposing (parse)

{-| LL(1) parser for call sequences.
-}

import Types.Agent as Agent exposing (..)
import Types.Call as Call exposing (..)
import Types.CallSequence exposing (CallSequence)
import Types.Protocol exposing (ProtocolCondition)
import Utils.List exposing (dropWhile, takeWhile)


{-| A utility type for error reporting. Could be extended at some point so more
information about the error is included.
-}
type alias Error =
    String


{-| Expects a string of the format `ab;cd;ef` and returns a `CallSequence`.
Also checks whether calls are between different agents (identity calls are not
allowed) and whether all agents in the call exist.
-}
parse : String -> List Agent -> Result Error CallSequence
parse input agents =
    let
        parseCall : String -> Result String Call
        parseCall s =
            Agent.fromString agents s
                |> Result.andThen Call.fromList

        tryParse : List LexToken -> Result Error CallSequence
        tryParse tokens =
            case tokens of
                [] ->
                    Ok []

                t :: ts ->
                    case t of
                        -- skip separators
                        Separator ->
                            tryParse ts

                        CallToken s ->
                            case ( parseCall s, tryParse ts ) of
                                ( Ok call, Ok seq ) ->
                                    Ok (call :: seq)

                                ( Err e, _ ) ->
                                    Err e

                                ( _, Err e ) ->
                                    Err e
    in
    lexer input
        |> Result.andThen tryParse



-- LEXER


{-| The tokens the lexer recognizes.
-}
type LexToken
    = CallToken String
    | Separator


{-| The list of charactes that count as whitespace. Probably incomplete.
-}
whitespace : List Char
whitespace =
    [ ' ', '\t', '\n' ]


{-| The list of characters that can act as a separator between calls
-}
separators : List Char
separators =
    [ ';' ]


{-| Converts an input string to a set of tagged tokens if the input string is
valid, otherwise returns an error message.

    lexer "ab;cd" == Ok [ CallToken "ab", Separator, CallToken "cd" ]

    lexer "ab;cd?" == Err "Invalid character '?' at position 6"

-}
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
                        -- Skip whitespace
                        charLexer cs (pos + 1)

                    else if List.member c separators then
                        -- Lex separators
                        case charLexer cs (pos + 1) of
                            Ok tokens ->
                                Ok (Separator :: tokens)

                            Err e ->
                                Err e

                    else if Char.isAlpha c then
                        -- Lex calls
                        let
                            token =
                                String.fromList (c :: takeWhile (\x -> Char.isAlpha x) cs)

                            rest =
                                charLexer (dropWhile (\x -> Char.isAlpha x) cs) (pos + 1 + String.length token)
                        in
                        case rest of
                            Ok tokens ->
                                Ok (CallToken token :: tokens)

                            Err e ->
                                Err e

                    else
                        -- Return an error for unrecognized sequences
                        Err ("Invalid character '" ++ String.fromChar c ++ "' at position " ++ String.fromInt pos)
    in
    charLexer (String.toList s) 1
