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

// Key: operator
// Value: Record
//        Key: operator
//        value: Token class
// This look ahead table is used to check if the current character belongs to any of the key of the record
// Then move the pointer and check the next character
// If the next character belong in the nested record
// Use the token class to concatenate both characters together in a single token class
// Otherwise use the default token class
// For example ++
// + is the first key in the record
// The second characters is also + and it does exist in + value
// So gobble these two characters ++ together in a single token class
// Otherwise if it was +a, then use the `default` token class 
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

// A predefined set of keywords, punctuations, digits and boolean literals
// We are using a set as lookup using a set is a lot faster than an array
const keywordsSet = new Set(["int", "float", "if", "else", "double", "char", "bool", "void"]);
const punctuationsSet = new Set([",", ";", "(", ")", "{", "}", "[", "]"]);
const digitsSet = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]);
const booleanLiteralsSet = new Set(["true", "false"]);

/**
 * Checks if a character is part of the regular alphabet
 * @param char Character to check for alphabet
 * @returns True if its an alphabet, false otherwise
 */
function checkIsAlphabetical(char: string) {
  const operatorLookAheadTableValue = operatorLookAheadTable[char];
  const isOperator = Boolean(operatorLookAheadTableValue);
  const isPunctuation = punctuationsSet.has(char);
  const isNumericLiteral = digitsSet.has(char);

  return !isOperator && !isPunctuation && !isNumericLiteral;
}

/**
 * Checks if a character is a whitespace
 * @param char Character to check for whitespace
 * @returns true if character is a whitespace, false otherwise
 */
function checkIsWhitespace(char: string) {
  return char === "\r" || char === "\n" || char === " "
}

/**
 * Populate the tokens record based on the token class of the passed lexeme
 * @param tokensRecord Token record to populate
 * @param lexeme Lexeme to check against keywords and literals set
 */
function checkIdentifier(tokensRecord: TokensRecord, lexeme: string) {
  // If the lexeme is a keyword
  if (keywordsSet.has(lexeme)) {
    tokensRecord.keywords.add(lexeme);
  } 
  // If the lexeme is a boolean literal
  else if (booleanLiteralsSet.has(lexeme)) {
    tokensRecord.boolean_literals.add(lexeme);
  }
  // Otherwise it must be an identifier
  else {
    tokensRecord.identifiers.add(lexeme);
  }
}

function generateTokensFromText(textContent: string) {
  const lines = textContent.split("\n");
  // This record keeps track of all the tokens encountered
  // place them in the right token class (key of the record)
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

  // Loop through each line
  for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
    // Get each of the line
    const line = lines[lineNumber];

    // Loop through each character of the line
    // updating the index will be done dynamically so its not present in the for loop
    // For example if we find two characters that belongs to the same token class
    // index would be incremented by two rather than the usual one
    for (let index = 0; index < line.length;) {
      const char = line[index];
      // If its not a carriage return, new line or a white space, we proceed to classify the lexeme
      if (!checkIsWhitespace(char)) {
        // Check if the current character is present in the operator table
        const operatorLookAheadTableValue = operatorLookAheadTable[char];
        const isOperator = Boolean(operatorLookAheadTableValue);
        // Check if the current character is present in the punctuation set
        const isPunctuation = punctuationsSet.has(char);
        // Check if the current character is present in the digits set
        const isNumericLiteral = digitsSet.has(char);

        // If its an operator
        if (isOperator) {
          // Operators usually come in a pair of two, so get the next character
          const nextChar = line[index + 1];
          // If the current operator can be grouped with the next character
          // and be classified in a single token class
          const tokenClass = operatorLookAheadTableValue[nextChar];
          if (tokenClass) {
            // Populate the token record with the correct token class
            // Concatenate current and next characters
            tokensRecord[tokenClass].add(char + nextChar);
            // Increase the pointer as two characters have been consumed
            index++
          } else {
            // Otherwise just add it to the default token class of the operator
            tokensRecord[operatorLookAheadTableValue.default].add(char);
          }
          index++
        }
        // punctuations lexemes only contain a single character, no need to look ahead
        else if (isPunctuation) {
          // Add it to the punctuation token class
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
          tokensRecord.string_literals.add(`"${lexeme}"`)
        }
        // It could either be a keyword, identifier or literals
        else {
          let lexeme = char;
          index += 1;
          for (; index < line.length; index++) {
            const nextChar = line[index];
            // If we encounter a white space space
            if (checkIsWhitespace(nextChar)) {
              checkIdentifier(tokensRecord, lexeme)
              break
            }

            const isAlphabetical = checkIsAlphabetical(nextChar);

            if (isAlphabetical) {
              lexeme += nextChar;
              if (index === line.length - 1) {
                checkIdentifier(tokensRecord, lexeme)
              }
            } else {
              checkIdentifier(tokensRecord, lexeme)
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