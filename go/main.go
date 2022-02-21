package main

// Importing necessary libraries
import (
	"errors"
	"fmt"
	"os"
	"strings"
)

// A map of valid keywords, the key is the keyword, value is a boolean literal true
var keywordsMap = map[string]bool{"int": true, "if": true, "else": true, "double": true, "char": true, "bool": true, "void": true, "float": true}

// A map of valid punctuations
var punctuationMap = map[string]bool{",": true, "-": true, ";": true, "(": true, ")": true, "{": true, "}": true, "[": true, "]": true}

// A map of valid numeric digits
var numericLiteralMap = map[string]bool{"1": true, "2": true, "3": true, "4": true, "5": true, "6": true, "7": true, "8": true, "9": true, "0": true}

// A map of valid boolean literals
var booleanLiteralMap = map[string]bool{"true": true, "false": true}

// A map of maps where operator is the key
// and value is a map of operator and token class
// This operator map is used to check if the current character can be concatenated with next characters to form a single token
// Its done by first checking if the current character exist in the map
// If so, then increment the pointer and check the next character
// If the next character belong in the nested map
// Concatenate both the characters into a single token class
// The value of the nested map is the token class
// If no value exist in nested map then the default token class
// For example ++
// + is the first key in the map
// The second characters is also + and it does exist in the map for +
// So concatenate these two characters ++ together to a single token class
// Otherwise if it was +a, then it would've used the `default` token class
var operatorsMap = map[string]map[string]string{
	"+": {
		"+":       "unary_operators",
		"=":       "assignment_operators",
		"default": "arithmetic_operators",
	},
	"-": {
		"-":       "unary_operators",
		"=":       "assignment_operators",
		"default": "arithmetic_operators",
	},
	"/": {
		"=":       "assignment_operators",
		"default": "arithmetic_operators",
	},
	"*": {
		"=":       "assignment_operators",
		"default": "arithmetic_operators",
	},
	"%": {
		"=":       "assignment_operators",
		"default": "arithmetic_operators",
	},
	"=": {
		"=":       "relational_operators",
		"default": "assignment_operators",
	},
	"<": {
		"=":       "relational_operators",
		"<":       "bitwise_operators",
		"default": "relational_operators",
	},
	">": {
		"=":       "relational_operators",
		">":       "bitwise_operators",
		"default": "relational_operators",
	},
	"!": {
		"=":       "relational_operators",
		"default": "logical_operators",
	},
	"&": {
		"&":       "logical_operators",
		"default": "bitwise_operators",
	},
	"|": {
		"|":       "logical_operators",
		"default": "bitwise_operators",
	},
	"~": {
		"default": "bitwise_operators",
	},
	"^": {
		"default": "bitwise_operators",
	},
}

// Check if the passed character is a white space or not
func checkIsWhiteSpace(char string) bool {
	strChar := string(char)
	// Would've been simpler with regex, but its not allowed
	return strChar == "\r" || strChar == " " || strChar == "\n"
}

// Check if the character is alphabetic or not,
// Sometimes numeric check might be skipped
func checkIsAlphabetical(char string, skipNumericCheck bool) bool {
	_, existInOperatorsMap := operatorsMap[char]
	_, existInPunctuationMap := punctuationMap[char]
	_, existInNumericLiteralMap := numericLiteralMap[char]
	if skipNumericCheck {
		existInNumericLiteralMap = false
	}
	// If its not a operator or a numeric literal or a punctuation then its alphabetical
	return !existInOperatorsMap && !existInPunctuationMap && !existInNumericLiteralMap
}

// Custom type for storing tokens in their appropriate token classes
type TokensMap map[string]map[string]bool

// Check if a lexeme is an identifier or not
// It takes in the tokens map to populate the appropriate token class
func checkIdentifier(tokensMap TokensMap, lexeme string) {
	// Check if the lexeme is a keyword
	_, isKeyword := keywordsMap[lexeme]
	// Check if the lexeme is a boolean literal
	_, isBooleanLiteral := booleanLiteralMap[lexeme]
	if isKeyword {
		// Add the lexeme to the keywords token class
		tokensMap["keywords"][lexeme] = true
	} else if isBooleanLiteral {
		// Add the lexeme to the boolean literal token class
		tokensMap["boolean_literals"][lexeme] = true
	} else {
		// Add the lexeme to the identifier token class
		tokensMap["identifiers"][lexeme] = true
	}
}

func generateTokensMapFromText(textContent string) TokensMap {
	// Initialize the token class
	tokensMap := TokensMap{
		"keywords":             {},
		"identifiers":          {},
		"unary_operators":      {},
		"arithmetic_operators": {},
		"relational_operators": {},
		"bitwise_operators":    {},
		"assignment_operators": {},
		"logical_operators":    {},
		"numeric_literals":     {},
		"string_literals":      {},
		"boolean_literals":     {},
		"punctuations":         {},
		"floating_points":      {},
		"integers":             {},
		"character_literals":   {},
	}

	// Split all the lines by newline character
	lines := strings.Split(textContent, "\n")

	// Loop through all the lines
	for lineNumber := 0; lineNumber < len(lines); lineNumber += 1 {
		// Get each line
		line := lines[lineNumber]

		index := 0
		// Loop through each character of the line
		// updating the index will be done dynamically so its not present in the for loop
		// For example if we find two characters that belongs to the same token class
		// index would be incremented by two rather than the usual one
		// And some other edge cases where regular increment by 1 wouldn't suffice
		for index < len(line) {
			// Get each character
			char := string(line[index])
			// If its not a carriage return, new line or a white space, we proceed to classify the lexeme
			if !checkIsWhiteSpace(char) {
				// Check if the current character is present in the operator map
				operatorsMapValue, isOperator := operatorsMap[char]
				// Check if the current character is present in the punctuation map
				_, isPunctuation := punctuationMap[char]
				// Check if the current character is present in the numeric map
				_, isNumericLiteral := numericLiteralMap[char]

				// If its an operator
				if isOperator {
					// Operators might come in a pair of two, so get the next character
					nextChar := string(line[index+1])
					// Check if the next character can be grouped with the current operator
					tokenClass, belongsToTokenClass := operatorsMapValue[nextChar]

					// If it can be grouped
					if belongsToTokenClass {
						// Populate the token map with the correct token class
						// concatenate them together to a single token class
						tokensMap[tokenClass][char+nextChar] = true
						// Increase the pointer as two characters have been consumed
						index += 1
					} else
					// If it can't be grouped
					{
						// add it to the default token class of the operator
						tokensMap[operatorsMapValue["default"]][char] = true
					}
					// Move to the next character
					index += 1
				} else if isPunctuation {
					// punctuations lexemes only contain a single character, no need to check the next character
					// Add the lexeme to the punctuations token class
					tokensMap["punctuations"][char] = true
					// Move to the next character
					index += 1
				} else if isNumericLiteral {
					// We need to check if the numeric literal is regular integer or a floating point vlaue
					lexeme, isFloatingPoint := char, false
					index += 1
					// Loop through all the character till we reach the end of line
					for ; index < len(line); index++ {
						// get the next character
						nextChar := string(line[index])
						// Check if its a digit
						_, isNumericLiteral := numericLiteralMap[nextChar]
						// If its a digit
						if isNumericLiteral {
							// Concatenate it with the current lexeme
							lexeme += nextChar
						} else if nextChar == "." {
							// Else if next character is a . it means we have encountered a floating point number
							// Set the isFloatingPoint flag to true
							isFloatingPoint = true
							// Concatenate the .
							lexeme += nextChar
						} else {
							// Otherwise its neither a digit nor a . so break the loop
							break
						}
					}

					// If we are dealing with a floating point number
					if isFloatingPoint {
						// Populate the floating_points token class with the lexeme
						tokensMap["floating_points"][lexeme] = true
					} else {
						// Otherwise populate the integers token class with the lexeme
						tokensMap["integers"][lexeme] = true
					}
					// Regardless of whether its a integer or floating point,
					// Add it to the numeric literals token class
					tokensMap["numeric_literals"][lexeme] = true
				} else if char == "\"" {
					// If we have encountered a " (double quote)
					// We are starting a string literal
					lexeme := ""
					index += 1
					// Loop through all the character till we reach the end of line
					for ; index < len(line); index++ {
						// get the next character
						nextChar := string(line[index])
						// If the next character is \" escaped double quote
						// We shouldn't end the literal as the quote has been escaped
						if nextChar == "\\" && string(line[index+1]) == "\"" {
							// Increment the pointer
							// Add \" to the lexeme
							// Not we need to escape both \ and " thats why the string is a bit weird
							index += 1
							lexeme += "\\\""
						} else if nextChar == "\"" {
							// If next character is "
							// We have checked for escaped character so this must mean end of string
							index += 1
							// break the loop we've reached the end of string
							break
						} else {
							// concatenate every thing within the quotes
							lexeme += nextChar
						}
					}
					// Add the lexeme to the string_literals class
					tokensMap["string_literals"]["\""+lexeme+"\""] = true
				} else if char == "'" {
					// Starting of a character literal
					index += 1
					// Add the lexeme to the character literals class
					tokensMap["character_literals"][string(line[index])] = true
					// Increment the pointer as we don't need to deal with the single quote after the character
					index += 2
				} else {
					// It could either be a keyword, identifier or literals
					lexeme := char
					index += 1
					// Loop through all the character till we reach the end of line
					for ; index < len(line); index++ {
						// get the next character
						nextChar := string(line[index])

						// If its a whitespace, for example identifier\s=\strue\n
						if checkIsWhiteSpace(nextChar) {
							// Add the lexeme to the appropriate token class
							checkIdentifier(tokensMap, lexeme)
							// Break the loop
							break
						}

						// Check if its alphabetical
						// Skip checking for numeric as its allowed after the first character
						if checkIsAlphabetical(nextChar, len(lexeme) != 0) {
							lexeme += nextChar
							// If we are at the last character of the line
							if index == len(line)-1 {
								checkIdentifier(tokensMap, lexeme)
							}
						} else {
							checkIdentifier(tokensMap, lexeme)
							break
						}
					}
				}
			} else {
				// Increment the pointer on whitespace
				index += 1
			}
		}
	}
	// Return token map
	return tokensMap
}

// Loop trough a map, concatenate all its key and return them
func concatenateMapKeys(mapValue map[string]bool) string {
	mapKeyValues := []string{}
	// Loop through each key of the map value
	for mapKey := range mapValue {
		mapKeyValues = append(mapKeyValues, mapKey)
	}
	return strings.Join(mapKeyValues, " ")
}

// Merge two maps together
func mergeMaps(map1 map[string]bool, map2 map[string]bool) map[string]bool {
	newMap := map[string]bool{}

	for mapKey := range map1 {
		newMap[mapKey] = true
	}

	for mapKey := range map2 {
		newMap[mapKey] = true
	}

	return newMap
}

// Print passed token map to console
func printTokenMap(tokensMap TokensMap) {
	fmt.Println("Keywords:", concatenateMapKeys(tokensMap["keywords"]))
	fmt.Println("Identifiers:", concatenateMapKeys(tokensMap["identifiers"]))
	mathOperators := concatenateMapKeys(tokensMap["arithmetic_operators"])
	// Check if = exist in assignment operators,
	_, equalExists := tokensMap["assignment_operators"]["="]
	if equalExists {
		mathOperators += " " + "="
	}
	fmt.Println("Math Operators:", mathOperators)
	// Not sure whether > belongs to logical or relational operator but the output must match
	fmt.Println("Logical Operators:", concatenateMapKeys(mergeMaps(tokensMap["logical_operators"], tokensMap["relational_operators"])))
	fmt.Println("Numeric Values:", concatenateMapKeys(tokensMap["numeric_literals"]))
	fmt.Println("Others:", concatenateMapKeys(tokensMap["punctuations"]))

	fmt.Println()

	// Loop through the key, value pairs of the map
	for tokenClass, tokenClassItemsMap := range tokensMap {
		// Print the token class and the tokens
		fmt.Println(tokenClass+":", concatenateMapKeys(tokenClassItemsMap))
	}
}

func main() {
	// Read from input.txt file
	data, err := os.ReadFile("input.txt")
	// Check for error
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			fmt.Println("Please provide input.txt file")
		} else {
			panic(err)
		}
	} else {
		// Get the text content of the data
		textContent := string(data)
		// Generate the token map
		tokensMap := generateTokensMapFromText(textContent)
		// Print token map to console
		printTokenMap(tokensMap)
	}
}
