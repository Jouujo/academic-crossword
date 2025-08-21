"use client";

import { useEffect, useMemo, useState } from "react";
import { loadPuzzleById } from "@/lib/puzzles";
import PlayGrid from "@/components/PlayGrid";
import ConfettiCongrats from "@/components/ConfettiCongrats";

export default function StudentPage() {
    const [id, setId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [puzzle, setPuzzle] = useState<Awaited<ReturnType<typeof loadPuzzleById>> | null>(null);
    const [cells, setCells] = useState<string[][]>([]);
    const [focused, setFocused] = useState<{ row: number; col: number } | null>(null);
    const [requestFocusRow, setRequestFocusRow] = useState<number | null>(null);
    const [rowStatuses, setRowStatuses] = useState<Array<"correct" | "wrong" | "incomplete">>([]);
    const [rowHints, setRowHints] = useState<Array<"empty" | "partial" | "full_match" | "full_mismatch">>([]);
    
    // Timer functionality
    const [timerEnabled, setTimerEnabled] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [finalTime, setFinalTime] = useState<number | null>(null);
    
    const isComplete = useMemo(() => {
        console.log("=== COMPLETION CHECK ===");
        console.log("Puzzle loaded:", !!puzzle);
        console.log("Cells length:", cells.length);
        console.log("Cells state:", JSON.stringify(cells));
        console.log("Row statuses:", rowStatuses);
        
        // Only check completion if we have a puzzle loaded and cells are properly initialized
        if (!puzzle || cells.length === 0) {
            console.log("Early return: no puzzle or cells");
            return false;
        }
        
        // Additional check: ensure that at least some cells have been filled by the student
        const hasStudentInput = cells.some(row => row && row.some(cell => cell && cell.trim() !== ""));
        if (!hasStudentInput) {
            console.log("No student input yet, cannot be complete");
            return false;
        }
        
        const complete = rowStatuses.length > 0 && rowStatuses.every((s) => s === "correct");
        console.log("Completion result:", { complete, rowStatuses, cellsLength: cells.length, hasStudentInput });
        console.log("=== END COMPLETION CHECK ===");
        return complete;
    }, [rowStatuses, puzzle, cells.length]);
    
    // Format time helper
    const formatTime = (milliseconds: number) => {
        if (milliseconds <= 0) return "0.0";
        
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const tenths = Math.floor((milliseconds % 1000) / 100);
        
        if (minutes > 0) {
            return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`;
        }
        return `${seconds}.${tenths}`;
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const qid = params.get("id");
        if (qid) setId(qid);
    }, []);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await loadPuzzleById(id);
                if (!cancelled) setPuzzle(data);
            } catch (e: any) {
                if (!cancelled) setError(e?.message || "Failed to load puzzle");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id]);

    // Initialize row statuses and cells when puzzle loads
    useEffect(() => {
        if (!puzzle || !puzzle.grid) return;
        
        setRowStatuses(Array.from({ length: puzzle.size.rows }, () => "incomplete"));
        setRowHints(Array.from({ length: puzzle.size.rows }, () => "empty"));
        // Initialize cells as empty for student to fill in, not with puzzle answers
        setCells(Array.from({ length: puzzle.size.rows }, () => 
            Array.from({ length: puzzle.size.cols }, () => "")
        ));
        
        // Auto-enable timer if puzzle has it enabled
        if (puzzle.timerEnabled && !timerEnabled) {
            setTimerEnabled(true);
            // Don't auto-start, let student choose when to start
        }
    }, [puzzle, timerEnabled]);
    
    // Timer effect - update elapsed time every 100ms
    useEffect(() => {
        console.log("=== TIMER EFFECT ===");
        console.log("Timer enabled:", timerEnabled);
        console.log("Start time:", startTime);
        console.log("Is complete:", isComplete);
        
        if (!timerEnabled || !startTime || isComplete) {
            console.log("Timer effect returning early");
            return;
        }
        
        const interval = setInterval(() => {
            setElapsedTime(Date.now() - startTime);
        }, 100);
        
        return () => clearInterval(interval);
    }, [timerEnabled, startTime, isComplete]);
    
    // Stop timer and record final time when puzzle is completed
    useEffect(() => {
        if (isComplete && startTime && finalTime === null) {
            const completionTime = Date.now() - startTime;
            setFinalTime(completionTime);
            setElapsedTime(completionTime);
        }
    }, [isComplete, startTime, finalTime]);
    
    // Debug logging for completion detection
    useEffect(() => {
        console.log("Completion state changed:", {
            isComplete,
            rowStatuses,
            cellsLength: cells.length,
            puzzleLoaded: !!puzzle
        });
    }, [isComplete, rowStatuses, cells.length, puzzle]);

    // Update row statuses when cells change
    useEffect(() => {
        if (!puzzle || !puzzle.grid || !puzzle.clues || cells.length === 0) return;
        
        console.log("=== ROW STATUS UPDATE ===");
        console.log("Cells state:", JSON.stringify(cells));
        console.log("Puzzle grid:", JSON.stringify(puzzle.grid));
        console.log("Puzzle clues:", puzzle.clues);
        
        const nextStatuses: Array<"correct" | "wrong" | "incomplete"> = [];
        for (let r = 0; r < puzzle.size.rows; r += 1) {
            const expected = puzzle.clues.find((c) => c.number === r + 1)?.answer || "";
            
            // Only consider playable cells (non-black cells)
            const rowCells = cells[r];
            if (!rowCells) {
                nextStatuses[r] = "incomplete";
                continue;
            }
            
            // Get what the student has typed (only from playable cells)
            const playableCells = rowCells.filter((_, c) => {
                const gridCell = puzzle.grid[r]?.[c];
                return gridCell && gridCell.trim() !== "";
            }) || [];
            const typed = playableCells.join("").replace(/[^A-Z0-9]/g, "") || "";
            
            console.log(`Row ${r + 1}: expected="${expected}", typed="${typed}", playableCells=`, playableCells);
            
            // A row is only correct if the student has typed something AND it matches the expected answer
            if (!typed || typed.length === 0) {
                nextStatuses[r] = "incomplete";
            } else if (typed.length < expected.length) {
                nextStatuses[r] = "incomplete";
            } else if (typed === expected) {
                nextStatuses[r] = "correct";
            } else {
                nextStatuses[r] = "wrong";
            }
        }
        console.log("Final row statuses:", nextStatuses);
        console.log("=== END ROW STATUS UPDATE ===");
        setRowStatuses(nextStatuses);
    }, [cells, puzzle]);

    return (
        <div className="max-w-4xl mx-auto px-4">
            {!id && <div className="text-sm text-gray-600">No puzzle id provided. Open from the Puzzles page.</div>}
            {loading && <div>Loading…</div>}
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {puzzle && (
                <>
                    {/* Timer Display */}
                    {timerEnabled && (
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-4 bg-gray-100 rounded-lg px-6 py-3">
                                <div className="text-sm text-gray-600">Timer:</div>
                                <div className="text-2xl font-mono font-bold text-gray-900">
                                    {isComplete && finalTime 
                                        ? formatTime(finalTime)
                                        : startTime 
                                        ? formatTime(elapsedTime)
                                        : "0.0"
                                    }
                                </div>
                                {isComplete && finalTime && (
                                    <div className="text-sm text-red-300 font-semibold">
                                        ✓ Completed in {formatTime(finalTime)}!
                                    </div>
                                )}
                                {timerEnabled && !startTime && (
                                    <div className="text-sm text-blue-600 font-semibold">
                                        ⏸️ Paused
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{puzzle.title}</h1>
                        {puzzle.description && (
                            <p className="text-gray-600 text-lg">{puzzle.description}</p>
                        )}
                        
                        {/* Timer Toggle */}
                        <div className="mt-4">
                            <button
                                onClick={() => {
                                    console.log("Timer toggle clicked:", { timerEnabled, startTime, isComplete });
                                    
                                    if (!timerEnabled) {
                                        // Start timer
                                        console.log("Starting timer...");
                                        setTimerEnabled(true);
                                        setStartTime(Date.now());
                                        setElapsedTime(0);
                                        setFinalTime(null);
                                    } else {
                                        // Stop timer
                                        console.log("Stopping timer...");
                                        setTimerEnabled(false);
                                        setStartTime(null);
                                        setElapsedTime(0);
                                        setFinalTime(null);
                                    }
                                }}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    timerEnabled
                                        ? "bg-red-600 hover:bg-red-700 text-white"
                                        : "bg-green-600 hover:bg-green-700 text-white"
                                }`}
                            >
                                {timerEnabled ? "Stop Timer" : "Start Timer"}
                            </button>
                            {timerEnabled && (
                                <div className="mt-2 text-sm text-gray-600">
                                    {startTime ? "Timer is running..." : "Timer is paused"}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Left side - Grid */}
                        <div className="lg:col-span-2 flex justify-center">
                            <div className="space-y-4">
                                <PlayGrid
                                    grid={puzzle.grid}
                                    onChange={setCells}
                                    onFocusChange={setFocused}
                                    focusRowIndex={requestFocusRow}
                                    rowStatuses={rowStatuses}
                                />
                                
                                {/* Row completion status */}
                                <div className="text-center">
                                    <div className="inline-flex space-x-2">
                                        {rowStatuses?.map((status, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-3 h-3 rounded-full ${
                                                    status === "correct" ? "bg-green-500" : 
                                                    status === "wrong" ? "bg-red-500" : 
                                                    "bg-gray-300"
                                                }`}
                                                title={`Row ${idx + 1}: ${status === "correct" ? "Correct!" : status === "wrong" ? "Try again" : "Incomplete"}`}
                                            />
                                        )) || null}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Clues */}
                        <div className="lg:col-span-1">
                            <div className="bg-red-100 rounded-lg p-6 sticky top-4">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Across Clues</h2>
                                <div className="space-y-3">
                                    {puzzle.clues?.map((c) => {
                                        const isActive = focused && focused.row === c.startRow;
                                        const status = rowStatuses && c.number > 0 && c.number <= rowStatuses.length ? rowStatuses[c.number - 1] : "incomplete";
                                        return (
                                            <div
                                                key={c.number}
                                                className={`${isActive ? "bg-FFD6D6" : ""} rounded px-1 cursor-pointer`}
                                                onClick={() => {
                                                    setRequestFocusRow(c.startRow);
                                                }}
                                            >
                                                <span className="font-semibold text-gray-700">{c.number}.</span>{" "}
                                                <span className="text-gray-600">{c.clue}</span>
                                                {status === "correct" && (
                                                    <span className="ml-2 text-green-600">✓</span>
                                                )}
                                                {status === "wrong" && (
                                                    <span className="ml-2 text-red-600">✗</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Completion celebration */}
                    {isComplete && <ConfettiCongrats completionTime={finalTime || undefined} />}
                </>
            )}
        </div>
    );
}