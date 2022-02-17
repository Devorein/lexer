export type TokensRecord = Record<
  "keywords" |
  "identifiers" |
  "unary_operators" |
  "arithmetic_operators" |
  "relational_operators" |
  "bitwise_operators" |
  "assignment_operators" |
  "logical_operators" |
  "numeric_literals" |
  "string_literals" |
  "boolean_literals" |
  "punctuations" |
  "floating_points" |
  "character_literals" |
  "integers", Set<string>
>