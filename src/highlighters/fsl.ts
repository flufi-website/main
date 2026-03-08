import { Highlighter } from './base';
import { TokenType } from '../token';

export class FslHighlighter extends Highlighter {
    public *highlightWhitespace(): Generator<TokenType> {
        while (/\s/.test(this.peek()))
            yield this.last_yield; // so it doesnt generate new token types between whitespaces
    }
    public *highlightComment(): Generator<TokenType> {
        if (this.peek(1) == "/" && this.peek(2) == "*") {
            yield TokenType.Comment;
            yield TokenType.Comment;
            while(!(this.peek(1) == "*" && this.peek(2) == "/") && !this.atEnd()) {
                yield TokenType.Comment;
            }
            yield TokenType.Comment;
            yield TokenType.Comment;
        }
    }

    public *highlight(): Generator<TokenType> {
        const gen = this.highlightMain();
        let next;
        while ((next = gen.next()) && !next.done) {
            yield next.value;
            yield* this.highlightComment();
        }
    }

    public *highlightMain(): Generator<TokenType> {
        yield* this.highlightComment();
        while (this.i < this.tokens.length) {
            yield* this.highlightStatement();
        }
    }

    // statement
    public *highlightStatement(): Generator<TokenType> {
        if (this.peek() == "fn") {
            yield* this.highlightFunctionStatement();
            return;
        }

        if (this.peek() == "{") {
            yield TokenType.Bracket;

            yield* this.highlightWhitespace();
        
            while (this.peek() != "}" && !this.atEnd())
                yield* this.highlightStatement();

            if (this.peek() == "}")
                yield TokenType.Bracket;
        }

        yield* this.highlightExpression();
        if (this.peek() == ";")
            yield TokenType.Punctuation;
    }

    public *highlightFunctionStatement(): Generator<TokenType> {
        yield TokenType.Keyword;
        
        yield* this.highlightWhitespace();

        yield TokenType.Function;

        if (this.peek() == "(")
            yield TokenType.Bracket;
        
        while (this.peek() != ")" && !this.atEnd())
            yield* this.highlightParameter();

        if (this.peek() == ")")
            yield TokenType.Bracket;
        
        yield* this.highlightWhitespace();

        yield* this.highlightStatement();
    }

    public *highlightParameter(): Generator<TokenType> {
        if (
            this.peek(1) == "." &&
            this.peek(2) == "." &&
            this.peek(3) == "."
        ) {
            yield TokenType.Operator;
            yield TokenType.Operator;
            yield TokenType.Operator;
            yield* this.highlightWhitespace();
            yield TokenType.Variable;
            yield* this.highlightWhitespace();
            if (this.peek() == ":")
                yield TokenType.Operator;
            yield* this.highlightWhitespace();
            yield* this.highlightTypeExpression();

            return;
        }

        if (/^\w+$/.test(this.peek())) {
            yield TokenType.Variable;
            yield* this.highlightWhitespace();
            if (this.peek() == ":")
                yield TokenType.Operator;
            yield* this.highlightWhitespace();
            yield* this.highlightTypeExpression();
            
            return;
        }

        yield TokenType.Word;
    }

    // expressions
    public *highlightExpression(): Generator<TokenType> {
        yield* this.highlightIdentifierCall();
    }
    public *highlightIdentifierCall(): Generator<TokenType> {
        if (/^\w+$/.test(this.peek()) && this.peek(2) == "(") {
            yield TokenType.Function;
            yield TokenType.Bracket;
            yield* this.highlightWhitespace();

            while (this.peek() != ")" && !this.atEnd()) {
                yield* this.highlightExpression();
                if (this.peek() == ",")
                    yield TokenType.Punctuation;
            }

            if (this.peek() == ")")
                yield TokenType.Bracket;
        }

        yield* this.highlightCall();
    }
    public *highlightCall(): Generator<TokenType> {
        yield* this.highlightPrimary();
        
        yield* this.highlightWhitespace();

        if (this.peek() == "(") {
            yield TokenType.Bracket;
            yield* this.highlightWhitespace();

            while (this.peek() != ")" && !this.atEnd()) {
                yield* this.highlightExpression();
                if (this.peek() == ",")
                    yield TokenType.Punctuation;
            }

            if (this.peek() == ")")
                yield TokenType.Bracket;
        }
    }
    public *highlightPrimary(): Generator<TokenType> {
        if (/^\w+$/.test(this.peek())) {
            yield TokenType.Variable;
            return;
        }

        if (["'","\"","`"].includes(this.peek())) {
            const quote = this.peek();

            yield TokenType.String;
            while (this.peek() != quote && !this.atEnd()) {
                yield TokenType.String;
            }
            yield TokenType.String;

            return;
        }

        yield TokenType.Word;
    }

    // type expressions
    public *highlightTypeExpression(): Generator<TokenType> {
        yield* this.highlightTypePrimary();
    }
    public *highlightTypePrimary(): Generator<TokenType> {
        if (this.peek() == "dyn") {
            yield TokenType.Keyword;
            return;
        }

        if (/^\w+$/.test(this.peek())) {
            yield TokenType.Type;
            return;
        }
        console.log("hi");
        yield TokenType.Word;
    }
}