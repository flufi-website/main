import { getHighlighter, highlight_flf } from "./flf_highlighter";
import { highlight_hjs } from "./hjs_highlighter";
import { TokenType } from "./token";

export type Token = { type: TokenType, content: string };

export function highlight(code: string, lang: string | undefined): Token[][] {
    if (!lang)
        return no_highlight(code);
    
    const flf = getHighlighter(lang);
    if (flf)
        return splitTokensByLine(highlight_flf(code, flf));

    const hjs = highlight_hjs(code, lang);
    if (!hjs)
        return no_highlight(code);
    
    const out = hjs;

    return mergeTokens(out);
}

export function mergeTokens(lines: Token[][]): Token[][] {
    return lines.map(line =>
        line.reduce<Token[]>((acc, token) => {
            const prev = acc[acc.length - 1];
            if (prev && prev.type === token.type)
                prev.content += token.content;
            else
                acc.push({ ...token });
            return acc;
        }, [])
    );
}

export function splitTokensByLine(tokens: Token[]): Token[][] {
    const lines: Token[][] = [];
    let current: Token[] = [];

    for (const token of tokens) {
        const parts = token.content.split("\n");

        for (let i = 0; i < parts.length; i++) {
            if (parts[i].length > 0) {
                current.push({
                    type: token.type,
                    content: parts[i]
                });
            }

            if (i < parts.length - 1) {
                lines.push(current);
                current = [];
            }
        }
    }

    lines.push(current);
    return lines;
}

export function no_highlight(code: string): Token[][] {
    return code.split("\n").map(line => [{ type: TokenType.Word, content: line }]);
}

export function tokenTypeToCssClass(type: TokenType): string {
    switch (type) {
        case TokenType.Word:          return "code_token_word";
        case TokenType.Keyword:       return "code_token_keyword";
        case TokenType.Constant:      return "code_token_constant";
        case TokenType.Operator:      return "code_token_operator";
        case TokenType.Variable:      return "code_token_variable";
        case TokenType.Type:          return "code_token_type";
        case TokenType.Function:      return "code_token_function";
        case TokenType.Punctuation:   return "code_token_punctuation";
        case TokenType.Bracket:       return "code_token_bracket";
        case TokenType.String:        return "code_token_string";
        case TokenType.Comment:       return "code_token_comment";
        case TokenType.Decorator:     return "code_token_decorator";
        case TokenType.PropertyHolder:return "code_token_property_holder";
        case TokenType.Escape:        return "code_token_escape";
        case TokenType.Subst:         return "code_token_subst";
        case TokenType.Regexp:        return "code_token_regexp";
        case TokenType.Symbol:        return "code_token_symbol";
        case TokenType.Property:      return "code_token_property";
        case TokenType.Meta:          return "code_token_meta";
        case TokenType.Title:         return "code_token_title";
        case TokenType.Tag:           return "code_token_tag";
        case TokenType.Attribute:     return "code_token_attribute";
    }
}