import { db } from "@/lib/firebase";
import { CrosswordPuzzle } from "@/types/crossword";
import { collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export async function savePuzzleToFirestore(params: {
    puzzle: CrosswordPuzzle;
    size: { rows: number; cols: number };
    createdBy?: string;
    metadata?: {
        subject?: string;
        tags?: string[];
    };
}): Promise<{ id: string }> {
    const { puzzle, size, createdBy, metadata } = params;

    const ref = doc(collection(db, "puzzles"), puzzle.id);
    // Firestore does not support nested arrays; serialize each row to a string
    const gridRows: string[] = puzzle.grid.map((row) =>
        row.map((c) => (c && c.trim() !== "" ? c : "_")).join("")
    );

    await setDoc(ref, {
        id: puzzle.id,
        title: puzzle.title,
        description: puzzle.description ?? "",
        gridRows, 
        clues: puzzle.clues.map((c) => ({
            number: c.number,
            clue: c.clue,
            answer: c.answer,
            startRow: c.startRow,
            startCol: c.startCol,
            length: c.length,
        })),
        size,
        emptyCellChar: "_",
        createdBy: createdBy ?? puzzle.createdBy ?? "",
        subject: metadata?.subject ?? "",
        tags: metadata?.tags ?? [],
        timerEnabled: puzzle.timerEnabled ?? false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return { id: puzzle.id };
}

export function deserializeGrid(gridRows: string[], emptyCellChar: string = "_"): string[][] {
    return gridRows.map((row) => row.split("").map((ch) => (ch === emptyCellChar ? "" : ch)));
}

export async function loadPuzzleById(id: string): Promise<
    | null
    | {
          id: string;
          title: string;
          description: string;
          size: { rows: number; cols: number };
          gridRows: string[];
          emptyCellChar: string;
          grid: string[][]; // reconstructed
          clues: Array<{ number: number; clue: string; answer: string; startRow: number; startCol: number; length: number }>;
          timerEnabled: boolean;
      }
> {
    const ref = doc(collection(db, "puzzles"), id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const val = snap.data() as any;

    const gridRows: string[] = val.gridRows || [];
    const emptyCellChar: string = val.emptyCellChar || "_";
    const grid = deserializeGrid(gridRows, emptyCellChar);

    return {
        id: val.id ?? id,
        title: val.title ?? "Untitled",
        description: val.description ?? "",
        size: val.size ?? { rows: grid.length || 5, cols: grid[0]?.length || 5 },
        gridRows,
        emptyCellChar,
        grid,
        clues: Array.isArray(val.clues) ? val.clues : [],
        timerEnabled: val.timerEnabled ?? false,
    };
}


