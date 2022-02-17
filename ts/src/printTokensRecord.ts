import { TokensRecord } from "../types";

export function printTokensRecord(tokensRecord: TokensRecord) {
  Object.entries(tokensRecord).forEach(([tokenClass, tokensSet]) => {
    const tokenClassLabel = tokenClass.split("_").map(tokenClassLabel => tokenClassLabel.charAt(0).toUpperCase() + tokenClassLabel.slice(1)).join(" ");
    console.log(`${tokenClassLabel}: ${Array.from(tokensSet).join(" ")}`)
  })
}