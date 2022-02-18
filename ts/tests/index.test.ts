/// <reference types="@types/jest" />
/// <reference types="@types/node" />

import fs from "fs";
import path from "path";
import { generateTokensFromText } from "../src/generateTokensFromText";

it(`Generate lexeme record`, async () => {
  const lexemeRecord = generateTokensFromText(fs.readFileSync(path.join(__dirname, "input.txt"), "utf-8"))
  expect(Array.from(lexemeRecord.identifiers)).toStrictEqual([
    "a",
    "b",
    "c",
    "d",
    "e",
    "str",
  ])

  expect(Array.from(lexemeRecord.unary_operators)).toStrictEqual([
    "++",
    "--",
  ])

  expect(Array.from(lexemeRecord.arithmetic_operators)).toStrictEqual([
    "+", "-", "/", "*", "%"
  ])

  expect(Array.from(lexemeRecord.relational_operators)).toStrictEqual([
    "==",
    "<=",
    "<",
    ">=",
    ">",
    "!=",
  ])

  expect(Array.from(lexemeRecord.bitwise_operators)).toStrictEqual([
    "<<",
    ">>",
    "&",
    "|",
    "~",
    "^",
  ])

  expect(Array.from(lexemeRecord.assignment_operators)).toStrictEqual([
    "=",
    "+=",
    "-=",
    "/=",
    "*=",
    "%=",
  ])

  expect(Array.from(lexemeRecord.logical_operators)).toStrictEqual([
    "!",
    "&&",
    "||",
  ])

  expect(Array.from(lexemeRecord.numeric_literals)).toStrictEqual([
    "1",
    "2",
    "10",
    "22",
    "22.5"
  ])

  expect(Array.from(lexemeRecord.string_literals)).toStrictEqual([
    "\"Hello \\\"World\"",
    "\"\\\"AB\"",
  ])

  expect(Array.from(lexemeRecord.boolean_literals)).toStrictEqual([
    "true",
    "false",
  ])

  expect(Array.from(lexemeRecord.punctuations)).toStrictEqual([
    ";",
    "(",
    ")",
    "{",
    "[",
    "]",
    ",",
    "}",
  ])

  expect(Array.from(lexemeRecord.floating_points)).toStrictEqual([
    "22.5",
  ])

  expect(Array.from(lexemeRecord.integers)).toStrictEqual([
    "1",
    "2",
    "10",
    "22",
  ])

  expect(Array.from(lexemeRecord.character_literals)).toStrictEqual([
    "A",
    "B",
  ])
})