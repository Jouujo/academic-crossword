"use client";

import { useMemo, useState, useEffect } from "react";
import GridPreview from "@/components/GridPreview";
import { generateAcrossOnlyPuzzle } from "@/utils/crossword";
import { savePuzzleToFirestore } from "@/lib/puzzles";

const ACCESS_CODE = "TC2025"; // Change this to whatever code we want to (maybe per semester?)

export default function TutorPage() {
    const [title, setTitle] = useState("Untitled Mini");
    const [description, setDescription] = useState("");
    const [entries, setEntries] = useState(
        Array.from({ length: 5 }, () => ({ clue: "", answer: "" }))
    );
    const [subject, setSubject] = useState("");
    const [tags, setTags] = useState<string>("");
    const [timerEnabled, setTimerEnabled] = useState(false);
    const [accessGranted, setAccessGranted] = useState(false);
    const [accessCode, setAccessCode] = useState("");
    const [showAccessPrompt, setShowAccessPrompt] = useState(false);

    const { puzzle, warnings, size } = useMemo(
        () =>
            generateAcrossOnlyPuzzle({
                title,
                description,
                entries,
                timerEnabled,
            }),
        [title, description, entries, timerEnabled]
    );

    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);

    // Check if access was already granted in this session
    useEffect(() => {
        const hasAccess = sessionStorage.getItem('crosswordAccess');
        if (hasAccess === ACCESS_CODE) {
            setAccessGranted(true);
        } else {
            setShowAccessPrompt(true);
        }
    }, []);

    const handleAccessCodeSubmit = () => {
        if (accessCode === ACCESS_CODE) {
            sessionStorage.setItem('crosswordAccess', ACCESS_CODE);
            setAccessGranted(true);
            setShowAccessPrompt(false);
        } else {
            alert('Incorrect access code. Please try again.');
            setAccessCode('');
        }
    };

    async function handleSave() {
        setSaveMsg(null);
        setSaving(true);
        try {
            await savePuzzleToFirestore({
                puzzle,
                size,
                metadata: {
                    subject: subject.trim(),
                    tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
                },
            });
            setSaveMsg("Saved!");
        } catch (err: any) {
            setSaveMsg(err?.message || "Failed to save");
        } finally {
            setSaving(false);
        }
    }

    // Show access code prompt if not granted
    if (showAccessPrompt) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 border rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Access Required</h1>
                <p className="text-gray-600 mb-6 text-center">
                    Please enter the access code to create crossword puzzles.
                </p>
                <div className="space-y-4">
                    <input
                        type="password"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        placeholder="Enter access code"
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleAccessCodeSubmit()}
                    />
                    <button
                        onClick={handleAccessCodeSubmit}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                    >
                        Submit
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                    This code is required to prevent unauthorized access to puzzle creation.
                </p>
            </div>
        );
    }

    // Show main tutor interface if access granted
    if (!accessGranted) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Create New Crossword Puzzle</h1>
                <div className="text-sm text-red-400">
                    Access granted ✓
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. CS 1412 Mini #1"
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g. Biology, Algebra"
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                            <input
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="Comma-separated (e.g. cells,energy,mitosis)"
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            id="timerEnabled"
                            checked={timerEnabled}
                            onChange={(e) => setTimerEnabled(e.target.checked)}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="timerEnabled" className="text-sm font-medium text-gray-700">
                            Enable timer for competitive completion tracking
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description of puzzle for student(s)"
                            className="w-full border rounded-md px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-red-300"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="font-semibold">Across Entries (5 rows fixed; width auto from longest answer, up to 15)</div>
                        {entries.map((row, idx) => (
                            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                                <div className="sm:col-span-1 text-sm text-gray-600">{idx + 1}.</div>
                                <input
                                    value={row.clue}
                                    onChange={(e) => {
                                        const next = entries.slice();
                                        next[idx] = { ...next[idx], clue: e.target.value };
                                        setEntries(next);
                                    }}
                                    placeholder="Clue"
                                    className="sm:col-span-5 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                                />
                                <input
                                    value={row.answer}
                                    onChange={(e) => {
                                        const next = entries.slice();
                                        next[idx] = { ...next[idx], answer: e.target.value };
                                        setEntries(next);
                                    }}
                                    placeholder="Answer (A–Z, 0–9)"
                                    className="sm:col-span-6 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 tracking-widest"
                                />
                            </div>
                        ))}
                        <p className="text-sm text-gray-500">Only A–Z and 0–9 are kept. Width auto-sizes to the longest answer (up to 15). Longer entries are trimmed to fit requirements.</p>
                    </div>
                </form>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Live Preview</h2>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-500">Size: 5 × {size.cols}</div>
                            {timerEnabled && (
                                <div className="text-sm text-green-600 font-medium">
                                    ⏱️ Timer Enabled
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="border rounded-md p-4 inline-block bg-white">
                        <GridPreview grid={puzzle.grid} />
                    </div>

                    {warnings.length > 0 && (
                        <ul className="mt-3 list-disc list-inside text-amber-600 text-sm">
                            {warnings.map((w) => (
                                <li key={w}>{w}</li>
                            ))}
                        </ul>
                    )}

                    <div className="pt-2 text-sm text-gray-600">
                        Clue order is row-based: 1 to 5. Letters are auto uppercased and placed from column 1.
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className={`px-4 py-2 rounded-md text-white ${
                                saving ? "bg-red-300" : "bg-red-600 hover:bg-red-700"
                            }`}
                        >
                            {saving ? "Saving..." : "Save Puzzle"}
                        </button>
                        {saveMsg && <span className="text-sm text-gray-700">{saveMsg}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}