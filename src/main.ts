import { highlight, tokenTypeToCssClass } from "./highlighter";
import { removeIndent } from "./utils";

function replaceCodeBlock(elem: HTMLElement) {
    if (!elem.textContent)
        return;
    
    const text = removeIndent(elem.textContent!).trim();

    elem.innerHTML = "";

    const content_elem = document.createElement("div");
    content_elem.className = "code-content";
    elem.appendChild(content_elem);

    const lines = highlight(text, elem.lang);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const line_elem = document.createElement("div");
        for (let i = 0; i < line.length; i++) {
            const token = line[i];

            const token_elem = document.createElement("span");
            token_elem.className = `${tokenTypeToCssClass(token.type)}`;
            token_elem.textContent = token.content;
            line_elem.appendChild(token_elem);
        }
        content_elem.appendChild(line_elem);
    }
}

function replaceCodeBlocks() {
    const elems = document.getElementsByTagName("code");
    for (let i = 0; i < elems.length; i++) {
        replaceCodeBlock(elems[i]);
    }
}

replaceCodeBlocks();
