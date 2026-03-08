import hljs from "highlight.js";
import { TokenType, typeMap } from "./token";
import type { Token } from "./highlighter";

type EmitterNode = { scope?: string; children: (EmitterNode | string)[] } | string;

function mapScope(scope: string | undefined): TokenType {
    if (!scope) return TokenType.Word;
    return typeMap[scope] ?? (() => {
        console.warn(`no handler for scope ${scope}`);
        return TokenType.Word;
    })();
}

function walkNode(node: EmitterNode, inherited: TokenType, lines: Token[][]): void {
    if (typeof node === "string") {
        const parts = node.split("\n");

        for (let i = 0; i < parts.length; i++) {
            if (i > 0) lines.push([]);

            const segment = parts[i];
            if (!segment) continue;

            const split = segment.split(/([()[\]{}])/);

            for (const part of split) {
                if (!part) continue;

                const type =
                    /^[()[\]{}]$/.test(part)
                        ? TokenType.Bracket
                        : inherited;

                lines[lines.length - 1].push({
                    type,
                    content: part
                });
            }
        }

        return;
    }

    const type = node.scope ? mapScope(node.scope) : inherited;

    for (const child of node.children)
        walkNode(child, type, lines);
}

export function highlight_hjs(code: string, lang: string): Token[][] | undefined {
    if (!hljs.getLanguage(lang))
        return;

    const result = hljs.highlight(code, { language: lang, ignoreIllegals: true });
    const root = (result as any)._emitter.root as EmitterNode;

    const lines: Token[][] = [[]];
    walkNode(root, TokenType.Word, lines);
    return lines;
}