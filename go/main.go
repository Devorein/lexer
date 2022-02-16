package main

import (
	"fmt"
	"os"
	"strings"
)

var keywordsMap = map[string]bool{"int": true, "if": true, "else": true, "double": true, "char": true, "bool": true, "void": true}
var punctuationMap = map[string]bool{",": true, ";": true, "(": true, ")": true, "{": true, "}": true, "[": true, "]": true}
var numericLiteralMap = map[string]bool{"1": true, "2": true, "3": true, "4": true, "5": true, "6": true, "7": true, "8": true, "9": true, "0": true}
var booleanLiteralMap = map[string]bool{"true": true, "false": true}

var operatorLookAheadTable = map[string]map[string]string{
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

func check(e error) {
	if e != nil {
		panic(e)
	}
}

func checkIsWhiteSpace(char string) bool {
	strChar := string(char)
	return strChar == "\r" || strChar == " " || strChar == "\n"
}

func checkIsAlphabetical(char string) bool {
	_, existInOperatorLookAheadTable := operatorLookAheadTable[char]
	_, existInPunctuationMap := punctuationMap[char]
	_, existInNumericLiteralMap := numericLiteralMap[char]

	return !existInOperatorLookAheadTable && !existInPunctuationMap && !existInNumericLiteralMap
}

type TokensRecord map[string]map[string]bool

func checkIdentifier(tokensRecord TokensRecord, lexeme string) {
	_, isKeyword := keywordsMap[lexeme]
	_, isBooleanLiteral := booleanLiteralMap[lexeme]
	if isKeyword {
		tokensRecord["keywords"][lexeme] = true
	} else if isBooleanLiteral {
		tokensRecord["boolean_literals"][lexeme] = true
	} else {
		tokensRecord["identifiers"][lexeme] = true
	}
}

func generateTokensFromText(textContent string) TokensRecord {
	tokensRecord := TokensRecord{
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
	}

	lines := strings.Split(textContent, "\n")

	for lineNumber := 0; lineNumber < len(lines); lineNumber += 1 {
		line := lines[lineNumber]

		index := 0
		for index < len(line) {
			char := string(line[index])

			if !checkIsWhiteSpace(char) {
				operatorLookAheadTableValue, isOperator := operatorLookAheadTable[char]
				_, isPunctuation := punctuationMap[char]
				_, isNumericLiteral := numericLiteralMap[char]

				if isOperator {
					nextChar := string(line[index+1])
					tokenClass, belongsToTokenClass := operatorLookAheadTableValue[nextChar]

					if belongsToTokenClass {
						tokensRecord[tokenClass][char+nextChar] = true
						index += 1
					} else {
						tokensRecord[operatorLookAheadTableValue["default"]][char] = true
					}
					index += 1
				} else if isPunctuation {
					tokensRecord["punctuations"][char] = true
					index += 1
				} else if isNumericLiteral {
					lexeme, isFloatingPoint := char, false
					index += 1
					for ; index < len(line); index++ {
						nextChar := string(line[index])
						_, isNumericLiteral := numericLiteralMap[nextChar]
						if isNumericLiteral {
							lexeme += nextChar
						} else if nextChar == "." {
							isFloatingPoint = true
							lexeme += nextChar
						} else {
							break
						}
					}

					if isFloatingPoint {
						tokensRecord["floating_points"][lexeme] = true
					} else {
						tokensRecord["integers"][lexeme] = true
					}
					tokensRecord["numeric_literals"][lexeme] = true
				} else if char == "\"" {
					lexeme := ""
					index += 1
					for ; index < len(line); index++ {
						nextChar := string(line[index])

						if nextChar == "\\" && string(line[index+1]) == "\"" {
							index += 1
							lexeme += "\\\""
						} else if nextChar == "\"" {
							index += 1
							break
						} else {
							lexeme += nextChar
						}
					}

					tokensRecord["string_literals"]["\""+lexeme+"\""] = true
				} else {
					lexeme := char
					index += 1
					for ; index < len(line); index++ {
						nextChar := string(line[index])

						if checkIsWhiteSpace(nextChar) {
							checkIdentifier(tokensRecord, lexeme)
							break
						}

						if checkIsAlphabetical(nextChar) {
							lexeme += nextChar
							if index == len(line)-1 {
								checkIdentifier(tokensRecord, lexeme)
							}
						} else {
							checkIdentifier(tokensRecord, lexeme)
							break
						}
					}
				}
			} else {
				index += 1
			}
		}
	}
	return tokensRecord
}

func printTokenRecord(tokensRecord TokensRecord) {
	for tokenClass, tokenClassItemsMap := range tokensRecord {
		tokenClassItems := ""

		for tokenClassItem := range tokenClassItemsMap {
			tokenClassItems += tokenClassItem + " "
		}

		fmt.Println(tokenClass+":", tokenClassItems)
	}
}

func main() {
	data, err := os.ReadFile("input.txt")
	check(err)
	textContent := string(data)
	tokensRecord := generateTokensFromText(textContent)
	printTokenRecord(tokensRecord)
}
