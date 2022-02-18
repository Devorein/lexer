operator_look_ahead_table = {
  "+": {
    "+": "unary_operators",
    "=": "assignment_operators",
    "default": "arithmetic_operators"
  },
  "-": {
    "-": "unary_operators",
    "=": "assignment_operators",
    "default": "arithmetic_operators"
  },
  "/": {
    "=": "assignment_operators",
    "default": "arithmetic_operators"
  },
  "*": {
    "=": "assignment_operators",
    "default": "arithmetic_operators"
  },
  "%": {
    "=": "assignment_operators",
    "default": "arithmetic_operators"
  },
  "=": {
    "=": "relational_operators",
    "default": "assignment_operators",
  },
  "<": {
    "=": "relational_operators",
    "<": "bitwise_operators",
    "default": "relational_operators",
  },
  ">": {
    "=": "relational_operators",
    ">": "bitwise_operators",
    "default": "relational_operators",
  },
  "!": {
    "=": "relational_operators",
    "default": "logical_operators",
  },
  "&": {
    "&": "logical_operators",
    "default": "bitwise_operators",
  },
  "|": {
    "|": "logical_operators",
    "default": "bitwise_operators",
  },
  "~": {
    "default": "bitwise_operators"
  },
  "^": {
    "default": "bitwise_operators"
  }
}

keywords = {"int", "float", "if", "else", "double", "char", "bool", "void"}
punctuations = {",", ";", "(", ")", "{", "}", "[", "]"}
digits = {"1", "2", "3", "4", "5", "6", "7", "8", "9", "0"}
boolean_literals = {"true", "false"}

def check_is_alphabetical(char):
  is_operator = char in operator_look_ahead_table
  is_punctuation = char in punctuations
  is_numeric_literal = char in digits

  return not is_operator and not is_punctuation and not is_numeric_literal

def check_is_whitespace(char):
  return char == "\r" or char == "\n" or char == " "

def check_identifier(tokens_record, lexeme):
  if lexeme in keywords:
    tokens_record["keywords"].add(lexeme)
  elif lexeme in boolean_literals:
    tokens_record["boolean_literals"].add(lexeme)
  else:
    tokens_record["identifiers"].add(lexeme)

def generate_tokens_from_text(text_content):
  lines = text_content.split("\n")

  tokens_record = {
    "keywords": set([]),
    "identifiers": set([]),
    "unary_operators": set([]),
    "arithmetic_operators": set([]),
    "relational_operators": set([]),
    "bitwise_operators": set([]),
    "assignment_operators": set([]),
    "logical_operators": set([]),
    "numeric_literals": set([]),
    "string_literals": set([]),
    "boolean_literals": set([]),
    "punctuations": set([]),
    "floating_points": set([]),
    "integers": set([]),
    "character_literals": set([]),
  }

  for line_number in range(len(lines)):
    line = lines[line_number]

    index = 0
    while (index < len(line)):
      char = line[index]
      if ( not check_is_whitespace(char) ):
        is_operator = char in operator_look_ahead_table
        is_punctuation = char in punctuations
        is_numeric_literal = char in digits

        if is_operator:
          operator_look_ahead_table_value = operator_look_ahead_table[char]
          next_char = line[index + 1]
          token_class_exist = next_char in operator_look_ahead_table_value

          if token_class_exist:
            token_class = operator_look_ahead_table_value[next_char]
            tokens_record[token_class].add(char + next_char)
            index+=1
          else:
            tokens_record[operator_look_ahead_table_value["default"]].add(char)
          index+=1
        elif is_punctuation:
          tokens_record["punctuations"].add(char)
          index+=1
        elif is_numeric_literal:
          lexeme = char
          is_floating_point = False
          index+=1

          while (index < len(line)):
            next_char = line[index]
            if next_char in digits:
              lexeme += next_char
            elif next_char == ".":
              is_floating_point = True
              lexeme += next_char
            else:
              break
            index+=1
          if is_floating_point:
            tokens_record["floating_points"].add(lexeme)
          else:
            tokens_record["integers"].add(lexeme)
          tokens_record["numeric_literals"].add(lexeme)
          
        elif char == "'":
          lexeme = ""
          index+=1
          while (index < len(line)):
            next_char = line[index]
            if next_char == "'":
              index+=1
              break
            lexeme += next_char
            index+=1
          tokens_record["character_literals"].add(lexeme)
        elif char == "\"":
          lexeme = ""
          index+=1
          while (index < len(line)):
            next_char = line[index]
            if next_char == "\\" and next_char[index + 1] == "\"":
              index+=1
              lexeme += "\\\""
            elif next_char == "\"":
              index+=1
              break
            else:
              lexeme += next_char
            index+=1
          tokens_record["string_literals"].add(f'''"{lexeme}"''')
          
        else:
          lexeme = char
          index+=1
          while (index < len(line)):
            next_char = line[index]
            if check_is_whitespace(next_char):
              check_identifier(tokens_record, lexeme)
              break

            if check_is_alphabetical(next_char):
              lexeme+=next_char
              if index == len(line) - 1:
                check_identifier(tokens_record, lexeme)
            else:
              check_identifier(tokens_record, lexeme)
              break
            index+=1
      else:
        index+=1

  return tokens_record
