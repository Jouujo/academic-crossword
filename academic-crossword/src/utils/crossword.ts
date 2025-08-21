import { Clue, CrosswordPuzzle } from "@/types/crossword";

export type AcrossInput = Array<{
    clue: string;
    answer: string;
}>;

function createEmptyGrid(rows: number, cols: number): string[][] {
    // Creates a grid of empty strings - which is where the puzzle will be built
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));
}

function cleanAnswer(raw: string): string {
    // Keep letters and digits only, uppercase
    return (raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function determineGridSize(entries: AcrossInput): { rows: number; cols: number } {
    // Fixed height: 5 rows
    const rows = 5;

    // Dynamic width from longest cleaned answer among first 5 rows
    const cleaned = entries.slice(0, rows).map((e) => cleanAnswer(e.answer));
    const maxLen = cleaned.reduce((m, a) => Math.max(m, a.length), 0);

    // Default width when no input yet
    let cols = maxLen || 5;

    // Clamp width to reasonable bounds
    cols = Math.max(3, Math.min(15, cols));

    return { rows, cols };
}

export function generateAcrossOnlyPuzzle(params: {
    title: string;
    description?: string;
    createdBy?: string;
    entries: AcrossInput; // each item is one across answer in its own row
    timerEnabled?: boolean; // whether timing is enabled for this puzzle
}): { puzzle: CrosswordPuzzle; warnings: string[]; size: { rows: number; cols: number } } {
    const { title, description, createdBy = "", entries, timerEnabled = false } = params;
    const warnings: string[] = [];

    const { rows, cols } = determineGridSize(entries);
    const grid = createEmptyGrid(rows, cols);
    const clues: Clue[] = [];

    for (let row = 0; row < rows; row += 1) {
        const entry = entries[row];
        if (!entry) {
            continue;
        }

        const cleaned = cleanAnswer(entry.answer);
        if (cleaned.length === 0) {
            if (entry.answer && entry.answer.trim().length > 0) {
                warnings.push(`Row ${row + 1}: answer has no valid characters (A–Z, 0–9) after cleaning.`);
            }
            continue;
        }
        const placed = cleaned.slice(0, cols);
        if (cleaned.length > cols) {
            warnings.push(`Row ${row + 1}: answer has beentrimmed to ${cols} characters to fit ${cols} columns.`);
        }

        for (let col = 0; col < placed.length; col += 1) {
            grid[row][col] = placed[col];
        }

        const clue: Clue = {
            id: `across-${row + 1}`,
            number: row + 1,
            clue: entry.clue || `Across ${row + 1}`,
            answer: placed,
            startRow: row,
            startCol: 0,
            length: placed.length,
        };
        clues.push(clue);
    }

    const puzzle: CrosswordPuzzle = {
        id: cryptoRandomId(),
        title,
        description,
        clues,
        grid,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
        timerEnabled,
    };

    return { puzzle, warnings, size: { rows, cols } };
}

function cryptoRandomId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        // @ts-expect-error node/edge/browser runtime provides randomUUID
        return crypto.randomUUID();
    }
    return `puz_${Math.random().toString(36).slice(2, 10)}`;
}

export function isCellBlack(value: string): boolean {
    return !value || value.trim() === "";
}

export function computeAutoGridSize(entries: AcrossInput): { rows: number; cols: number } {
    return determineGridSize(entries);
}


