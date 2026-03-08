
export function removeIndent(input: string): string {
    const lines = input.split("\n");

    const nonEmpty = lines.filter(l => l.trim() !== "");
    if (nonEmpty.length === 0)
        return input;

    const minIndent = Math.min(
        ...nonEmpty.map(l => l.match(/^ */)![0].length)
    );

    return lines.map(l => l.slice(minIndent)).join("\n");
}
