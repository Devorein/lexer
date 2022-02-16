import fs from "fs";
import path from "path";

type TokensRecord = Record<
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
  "integers", Set<string>
>

const operatorLookAheadTable: Record<string, Record<string | "default", keyof TokensRecord>> = {
  "+": {
    "+": "unary_operators",
    "=": "assignment_operators",
    default: "arithmetic_operators"
  },
  "-": {
    "-": "unary_operators",
    "=": "assignment_operators",
    default: "arithmetic_operators"
  },
  "/": {
    "=": "assignment_operators",
    default: "arithmetic_operators"
  },
  "*": {
    "=": "assignment_operators",
    default: "arithmetic_operators"
  },
  "%": {
    "=": "assignment_operators",
    default: "arithmetic_operators"
  },
  "=": {
    "=": "relational_operators",
    default: "assignment_operators",
  },
  "<": {
    "=": "relational_operators",
    "<": "bitwise_operators",
    default: "relational_operators",
  },
  ">": {
    "=": "relational_operators",
    ">": "bitwise_operators",
    default: "relational_operators",
  },
  "!": {
    "=": "relational_operators",
    default: "logical_operators",
  },
  "&": {
    "&": "logical_operators",
    default: "bitwise_operators",
  },
  "|": {
    "|": "logical_operators",
    default: "bitwise_operators",
  },
  "~": {
    default: "bitwise_operators"
  },
  "^": {
    default: "bitwise_operators"
  }
}

function generateTokensFromText(textContent: string) {
  const lines = textContent.split("\n");
  const keywordsSet = new Set(["int", "float", "if", "else", "double", "char", "bool", "void"]);
  const punctuationsSet = new Set([",", ";", "(", ")", "{", "}", "[", "]"]);
  const digitsSet = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]);
  const booleanLiteralsSet = new Set(["true", "false"]);
  const tokensRecord: TokensRecord = {
    // Using a set to store only unique values
    keywords: new Set(),
    identifiers: new Set(),
    unary_operators: new Set(),
    arithmetic_operators: new Set(),
    relational_operators: new Set(),
    bitwise_operators: new Set(),
    assignment_operators: new Set(),
    logical_operators: new Set(),
    numeric_literals: new Set(),
    string_literals: new Set(),
    boolean_literals: new Set(),
    punctuations: new Set(),
    floating_points: new Set(),
    integers: new Set()
  }

  function checkIsAlphabetical(char: string) {
    const operatorLookAheadTableValue = operatorLookAheadTable[char];
    const isOperator = Boolean(operatorLookAheadTableValue);
    const isPunctuation = punctuationsSet.has(char);
    const isNumericLiteral = digitsSet.has(char);

    return !isOperator && !isPunctuation && !isNumericLiteral;
  }

  function checkIsWhitespace(char: string) {
    return char === "\r" || char === "\n" || char === " "
  }

  function checkIdentifier(lexeme: string) {
    if (keywordsSet.has(lexeme)) {
      tokensRecord.keywords.add(lexeme);
    } else if (booleanLiteralsSet.has(lexeme)) {
      tokensRecord.boolean_literals.add(lexeme);
    }
    else {
      tokensRecord.identifiers.add(lexeme);
    }
  }

  for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
    const line = lines[lineNumber];

    let index = 0;

    for (; index < line.length; ) {
      const char = line[index];
      // If its not a carriage return, new line or a white space
      if (!checkIsWhitespace(char)) {
        const operatorLookAheadTableValue = operatorLookAheadTable[char];
        const isOperator = Boolean(operatorLookAheadTableValue);
        const isPunctuation = punctuationsSet.has(char);
        const isNumericLiteral = digitsSet.has(char);

        // If its an operator
        if (isOperator) {
          const nextChar = line[index + 1];
          const tokenClass = operatorLookAheadTableValue[nextChar];
          if (tokenClass) {
            tokensRecord[tokenClass].add(char + nextChar);
            index++
          } else {
            tokensRecord[operatorLookAheadTableValue.default].add(char);
          }
          index++
        }
        // punctuations lexemes only contain a single character, no need to look ahead
        else if (isPunctuation) {
          tokensRecord.punctuations.add(char);
          index++;
        }
        else if (isNumericLiteral) {
          let lexeme = char, isFloatingPoint = false;
          index += 1;
          for (; index < line.length; index++) {
            const nextChar = line[index];

            if (digitsSet.has(nextChar)) {
              lexeme += nextChar;
            } else if (nextChar === ".") {
              isFloatingPoint = true;
              lexeme += nextChar;
            } else {
              break;
            }
          }

          if (isFloatingPoint) {
            tokensRecord.floating_points.add(lexeme)
          } else {
            tokensRecord.integers.add(lexeme)
          }
          tokensRecord.numeric_literals.add(lexeme)
        }
        // Starting of a string literal
        else if (char === "\"") {
          let lexeme = "";
          index+=1;
          // Move forward until we reach the end of line
          for (; index < line.length; index++) {
            const nextChar = line[index];
            
            // If we encounter a escape sequence dont close on the next "
            if (nextChar === "\\" && line[index+1] === "\"") {
              index+=1;
              lexeme += "\\\""
            } 
            // Found closing quote, end of string literal
            else if (nextChar === "\"") {
              index+=1;
              break;
            } else {
              // Concatenate each character to the lexeme
              lexeme+=nextChar;
            }
          }
          tokensRecord.string_literals.add(lexeme)
        }
        // It could either be a keyword, identifier or literals
        else {
          let lexeme = char;
          index += 1;
          for (; index < line.length; index++) {
            const nextChar = line[index];
            // If we encounter a white space space
            if (checkIsWhitespace(nextChar)) {
              checkIdentifier(lexeme)
              break
            }

            const isAlphabetical = checkIsAlphabetical(nextChar);

            if (isAlphabetical) {
              lexeme += nextChar;
              if (index === line.length - 1) {
                checkIdentifier(lexeme)
              }
            } else {
              checkIdentifier(lexeme)
              break
            }
          }
        }
      } else {
        index++
      }
    }
  }
  return tokensRecord;
}

function printTokensRecord(tokensRecord: TokensRecord) {
  Object.entries(tokensRecord).forEach(([tokenClass, tokensSet]) => {
    const tokenClassLabel = tokenClass.split("_").map(tokenClassLabel => tokenClassLabel.charAt(0).toUpperCase() + tokenClassLabel.slice(1)).join(" ");
    console.log(`${tokenClassLabel}: ${Array.from(tokensSet).join(" ")}`)
  })
}

printTokensRecord(generateTokensFromText(fs.readFileSync(path.join(__dirname, "input2.txt"), "utf-8")));