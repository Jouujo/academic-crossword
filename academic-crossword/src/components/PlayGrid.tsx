"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isCellBlack } from "@/utils/crossword";

type Props = {
    grid: string[][];
    onChange?: (grid: string[][]) => void;
    onFocusChange?: (pos: { row: number; col: number }) => void;
    focusRowIndex?: number | null;
    rowStatuses?: Array<"correct" | "wrong" | "incomplete" | null> | null;
};

export default function PlayGrid({ grid, onChange, onFocusChange, focusRowIndex = null, rowStatuses = null }: Props) {
    // Add safety check for grid
    if (!grid || !Array.isArray(grid) || grid.length === 0) {
        return <div>Invalid grid data</div>;
    }
    
    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;
    // Cells the student is filling; initialize empty for playable cells
    const [cells, setCells] = useState<string[][]>(() =>
        grid.map((row, r) => row.map((_, c) => {
            // Always start with empty strings - students need to fill these in
            return "";
        }))
    );
    const [focused, setFocused] = useState<{ r: number; c: number } | null>(null);
    const inputsRef = useRef<Array<Array<HTMLInputElement | null>>>([]);

    useEffect(() => {
        setCells(grid.map((row, r) => row.map((_, c) => {
            // Always start with empty strings - students need to fill these in
            return "";
        })));
    }, [grid]);

    useEffect(() => {
        console.log("=== PLAYGRID ONCHANGE ===");
        console.log("Cells changed, calling onChange:", JSON.stringify(cells));
        onChange?.(cells);
    }, [cells, onChange]);

    // Focus helpers
    const isPlayable = useCallback((r: number, c: number) => {
        const gridCell = grid[r]?.[c];
        return !isCellBlack(gridCell);
    }, [grid]);

    const focusCell = useCallback((r: number, c: number) => {
        inputsRef.current[r]?.[c]?.focus();
        inputsRef.current[r]?.[c]?.select?.();
        setFocused({ r, c });
        onFocusChange?.({ row: r, col: c });
    }, []);

    const findNextPlayableRight = useCallback(
        (r: number, fromC: number) => {
            for (let c = fromC; c < cols; c += 1) {
                if (isPlayable(r, c)) return c;
            }
            return fromC;
        },
        [cols, isPlayable]
    );

    const findPrevPlayableLeft = useCallback(
        (r: number, fromC: number) => {
            for (let c = fromC; c >= 0; c -= 1) {
                if (isPlayable(r, c)) return c;
            }
            return fromC;
        },
        [isPlayable]
    );

    const getPlayableCols = useCallback(
        (r: number) => {
            const colsIdx: number[] = [];
            for (let c = 0; c < cols; c += 1) if (isPlayable(r, c)) colsIdx.push(c);
            return colsIdx;
        },
        [cols, isPlayable]
    );

    const isRowEmpty = useCallback(
        (r: number, state: string[][] = cells) => {
            const playable = getPlayableCols(r);
            return playable.every((c) => !state[r][c]);
        },
        [cells, getPlayableCols]
    );

    const isRowFilled = useCallback(
        (r: number, state: string[][] = cells) => {
            const playable = getPlayableCols(r);
            return playable.length > 0 && playable.every((c) => !!state[r][c]);
        },
        [cells, getPlayableCols]
    );

    const findPrevRowWithPlayable = useCallback(
        (fromR: number) => {
            for (let r = fromR; r >= 0; r -= 1) {
                if (getPlayableCols(r).length > 0) return r;
            }
            return -1;
        },
        [getPlayableCols]
    );

    const findNextRowWithPlayable = useCallback(
        (fromR: number) => {
            for (let r = fromR; r < rows; r += 1) {
                if (getPlayableCols(r).length > 0) return r;
            }
            return -1;
        },
        [rows, getPlayableCols]
    );

    const handleKey = useCallback(
        (r: number, c: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            const key = e.key;
            if (key === "ArrowRight") {
                e.preventDefault();
                if (c + 1 < cols) {
                    const nc = findNextPlayableRight(r, c + 1);
                    if (nc !== c + 1 && !isPlayable(r, c + 1)) return focusCell(r, nc);
                    return focusCell(r, c + 1);
                }
                return;
            }
            if (key === "ArrowLeft") {
                e.preventDefault();
                if (c - 1 >= 0) {
                    const pc = findPrevPlayableLeft(r, c - 1);
                    if (pc !== c - 1 && !isPlayable(r, c - 1)) return focusCell(r, pc);
                    return focusCell(r, c - 1);
                }
                return;
            }
            if (key === "ArrowDown") {
                e.preventDefault();
                if (r + 1 < rows) {
                    // find nearest playable in same column going down
                    for (let nr = r + 1; nr < rows; nr += 1) {
                        if (isPlayable(nr, c)) return focusCell(nr, c);
                    }
                }
                return;
            }
            if (key === "ArrowUp") {
                e.preventDefault();
                if (r - 1 >= 0) {
                    for (let nr = r - 1; nr >= 0; nr -= 1) {
                        if (isPlayable(nr, c)) return focusCell(nr, c);
                    }
                }
                return;
            }
            if (key === "Backspace") {
                // Stay within the same row and same word (do not cross black squares)
                setCells((prev) => {
                    const next = prev.map((row) => row?.slice() || []);
                    const leftCol = c - 1;
                    const canMoveLeft = leftCol >= 0 && isPlayable(r, leftCol);

                    if (next[r] && c < next[r].length && next[r][c]) {
                        // Clear current; move left by one only if left cell is playable
                        next[r][c] = "";
                        if (canMoveLeft) setTimeout(() => focusCell(r, leftCol), 0);
                        return next;
                    }
                    // Current empty: clear left cell only if it's playable, and move into it
                    if (canMoveLeft && next[r] && leftCol < next[r].length) {
                        next[r][leftCol] = "";
                        setTimeout(() => focusCell(r, leftCol), 0);
                    }
                    return next;
                });
                return;
            }
            // Accept A–Z and 0–9
            if (/^[a-zA-Z0-9]$/.test(key)) {
                setCells((prev) => {
                    const next = prev.map((row) => row?.slice() || []);
                    if (next[r] && c < next[r].length) {
                        next[r][c] = key.toUpperCase();
                    }
                    // If row now filled, jump to next row's first playable
                    if (isRowFilled(r, next)) {
                        const nr = findNextRowWithPlayable(r + 1);
                        if (nr >= 0) {
                            const firstCol = findNextPlayableRight(nr, 0);
                            setTimeout(() => focusCell(nr, firstCol), 0);
                            return next;
                        }
                    }
                    return next;
                });
                // Move to next playable to the right after typing (if not already moved to next row)
                if (c + 1 < cols) {
                    const nc = findNextPlayableRight(r, c + 1);
                    setTimeout(() => focusCell(r, nc), 0);
                }
            }
        },
        [rows, cols, focusCell, findNextPlayableRight, findPrevPlayableLeft, isPlayable]
    );

    inputsRef.current = useMemo(() =>
        Array.from({ length: rows }, () => Array.from({ length: cols }, () => null)),
    [rows, cols]);

    // Parent-requested focus of a specific row (first playable cell)
    useEffect(() => {
        if (focusRowIndex == null) return;
        const r = Math.max(0, Math.min(rows - 1, focusRowIndex));
        const c = findNextPlayableRight(r, 0);
        focusCell(r, c);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusRowIndex]);

    return (
        <div className="flex justify-center">
            <div className="inline-grid rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg" style={{ gridTemplateColumns: `repeat(${cols}, 48px)` }}>
                {cells.map((row, rIdx) =>
                    row.map((cell, cIdx) => {
                        const gridCell = grid[rIdx]?.[cIdx];
                        const black = isCellBlack(gridCell);
                        const inActiveRow = focused && focused.r === rIdx && !black;
                        const rowStatus = rowStatuses && rIdx < rowStatuses.length ? rowStatuses[rIdx] : null;
                        const statusClass = rowStatus === "correct" ? "bg-green-100" : rowStatus === "wrong" ? "bg-rose-100" : "";
                        
                        // Add rounded corners to corner cells
                        let cornerClass = "";
                        if (rIdx === 0 && cIdx === 0) cornerClass = "rounded-tl-lg"; // top-left
                        if (rIdx === 0 && cIdx === cols - 1) cornerClass = "rounded-tr-lg"; // top-right
                        if (rIdx === rows - 1 && cIdx === 0) cornerClass = "rounded-bl-lg"; // bottom-left
                        if (rIdx === rows - 1 && cIdx === cols - 1) cornerClass = "rounded-br-lg"; // bottom-right
                        
                        return (
                            <div
                                key={`${rIdx}-${cIdx}`}
                                className={`w-12 h-12 border-r border-b border-gray-400 flex items-center justify-center ${
                                    statusClass || (inActiveRow ? "bg-red-200" : "")
                                } ${cornerClass}`}
                                style={{
                                    borderRight: cIdx === cols - 1 ? 'none' : '1px solid #9CA3AF',
                                    borderBottom: rIdx === rows - 1 ? 'none' : '1px solid #9CA3AF'
                                }}
                            >
                                {black ? (
                                    <div className="w-full h-full bg-gray-200" />
                                ) : (
                                    <input
                                        ref={(el) => {
                                            if (!inputsRef.current[rIdx]) {
                                                if (!inputsRef.current) inputsRef.current = [];
                                                inputsRef.current[rIdx] = [];
                                            }
                                            inputsRef.current[rIdx][cIdx] = el;
                                        }}
                                        value={cell}
                                        onChange={() => {}}
                                        onKeyDown={(e) => handleKey(rIdx, cIdx, e)}
                                        onFocus={() => {
                                            setFocused({ r: rIdx, c: cIdx });
                                            onFocusChange?.({ row: rIdx, col: cIdx });
                                        }}
                                        className="w-full h-full text-center text-lg font-semibold outline-none bg-transparent"
                                    />
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}


