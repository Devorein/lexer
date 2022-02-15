package main

import (
	"fmt"
	"os"
)

var operatorLookAheadTable = map[string]map[string]string{
	"+": map[string]string{
		"+":       "unary_operators",
		"=":       "assignment_operators",
		"default": "arithmetic_operators",
	},
	"-": map[string]string{
		"-":       "unary_operators",
		"=":       "assignment_operators",
		"default": "arithmetic_operators",
	},
	"/": map[string]string{
		"=":       "assignment_operators",
		"default": "arithmetic_operators",
	},
	"*": map[string]string{
		"=":       "assignment_operators",
		"default": "arithmetic_operators",
	},
	"%": map[string]string{
		"=":       "assignment_operators",
		"default": "arithmetic_operators",
	},
	"=": map[string]string{
		"=":       "relational_operators",
		"default": "assignment_operators",
	},
	"<": map[string]string{
		"=":       "relational_operators",
		"<":       "bitwise_operators",
		"default": "relational_operators",
	},
	">": map[string]string{
		"=":       "relational_operators",
		">":       "bitwise_operators",
		"default": "relational_operators",
	},
	"!": map[string]string{
		"=":       "relational_operators",
		"default": "logical_operators",
	},
	"&": map[string]string{
		"&":       "logical_operators",
		"default": "bitwise_operators",
	},
	"|": map[string]string{
		"|":       "logical_operators",
		"default": "bitwise_operators",
	},
	"~": map[string]string{
		"default": "bitwise_operators",
	},
	"^": map[string]string{
		"default": "bitwise_operators",
	},
}

func check(e error) {
	if e != nil {
		panic(e)
	}
}

func checkIsWhiteSpace(char string) bool {
	str_char := string(char)
	return str_char == "\r" && str_char == " " && str_char == "\n"
}

func checkIsAlphabetical(char string) bool {

}

func main() {
	keywordsMap := map[string]bool{"int": true, "if": true, "else": true, "double": true, "char": true, "bool": true, "void": true}
	punctuationMap := map[string]bool{",": true, ";": true, "(": true, ")": true, "{": true, "}": true, "[": true, "]": true}
	digitsMap := map[string]bool{"1": true, "2": true, "3": true, "4": true, "5": true, "6": true, "7": true, "8": true, "9": true, "0": true}
	booleanLiteralMap := map[string]bool{"true": true, "false": true}

	tokensRecord := map[string]map[string]bool{}

	data, err := os.ReadFile("input.txt")
	check(err)
	str_data := string(data)
	for index := 0; index < len(str_data); index++ {
		char := str_data[index]
		str_char := string(char)
		if false {

		} else {
			lexeme := str_char
			index += 1
			for ; index < len(str_data); index++ {
				nextChar := string(str_data[index+1])
				if checkIsWhiteSpace(nextChar) {

				}
			}
		}
		fmt.Println(str_char)
	}
}
