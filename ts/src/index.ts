import fs from "fs";
import path from "path";
import { generateTokensFromText } from "./generateTokensFromText";
import { printTokensRecord } from "./printTokensRecord";

printTokensRecord(generateTokensFromText(fs.readFileSync(path.join(__dirname, "input2.txt"), "utf-8")));