/// <reference types="@types/jest" />

import { generateTokensFromText } from "../src/generateTokensFromText";

it(`Generate lexeme record`, () => {
  const lexemeRecord = generateTokensFromText(`
int a=1;
int b=2;

a+=1;
a++;
a=a+1;

b-=1;
b--;
b=b-1;

a/=1;
a/b;

a*=1;
a*b;

a%=1;
a%b;

a=1;
a==b;

a<<2
a<=2
a<2

b>>2
b>=2
b>2

!a
a!=b

a&&b
a&b

a||b
a|b

~a
^a

int a = 1;
float b = 2;
if (a == 2) {
  char[] c = {10, 22, 22.5};
} else {
  char[] d = "Hello \"World";
}

bool d= true;
bool e =false;

char str[] = {'A', 'B'};
char str[] = "\"AB";`)

  console.log(lexemeRecord);
  
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
    "Hello \"World",
    "\"AB",
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

  expect(Array.from(lexemeRecord.punctuations)).toStrictEqual([
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