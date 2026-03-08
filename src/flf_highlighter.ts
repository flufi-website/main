
import type { Token } from "./highlighter";
import type { Highlighter } from "./highlighters/base";
import { FslHighlighter } from "./highlighters/fsl";
import type { TokenType } from "./token";

export function getHighlighter(lang: string): Highlighter | undefined {
    if (lang == "fsl")
        return new FslHighlighter();

    return undefined;
}


export function highlight_flf(text: string, highlighter: Highlighter): Token[] {
    const tokens = highlighter.tokenise(text);
    
    highlighter.tokens = tokens;
    highlighter.i = 0;

    let gen = highlighter.highlight();

    let buf: Array<Token> = [];
    let next: IteratorResult<TokenType, any>;
    while ((next = gen.next()) && !next.done) {
        const type = next.value;
        highlighter.last_yield = next.value;

        if (buf[buf.length - 1] && buf[buf.length - 1].type == type) {
            // if the last token was the same type, just merge them
            buf[buf.length - 1].content += highlighter.tokens[highlighter.i];
        } else {
            // just push a new token
            if (highlighter.i < highlighter.tokens.length)
                buf.push({ type, content: highlighter.tokens[highlighter.i]});
        }

        highlighter.i ++;
    }

    return buf;
}

