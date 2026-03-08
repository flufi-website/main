import { TokenType } from "../token";

export abstract class Highlighter {
    public tokens: Array<string> = [];
    public i: number = 0;
    public last_yield: TokenType = TokenType.Word;

    public peek(amt: number = 1): string {
        return this.tokens[this.i + amt - 1];
    }
    public atEnd(): boolean {
        return this.i >= this.tokens.length;
    }

    public tokenise(text: string): Array<string> {
        const tokens = [""];
        const split = [
            "(",")",
            "[","]",
            "{","}",
            ",",";",":","<","=",">",".","#",
            "+","-","*","/","%","^","|",
            "\\",
            "'","\"","`",
            " ","\n",
            "!","?",
        ];
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (split.includes(char)) {
                if (tokens[tokens.length-1] == "")
                    tokens.pop();
                tokens.push(char);
                tokens.push("");
                continue;
            }
            tokens[tokens.length-1] += char;
        }
        if (!tokens[tokens.length-1])
            tokens.pop();
        return tokens;
    }
    public *highlight(): Generator<TokenType> {
        while (this.i < this.tokens.length) {
            yield TokenType.Word;
        }
        return; 
    }
}
