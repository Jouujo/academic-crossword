"use client";

import { useMemo, useState } from "react";
import GridPreview from "@/components/GridPreview";
import { generateAcrossOnlyPuzzle } from "@/utils/crossword";
import { savePuzzleToFirestore } from "@/lib/puzzles";

export default function TutorPage() {
    const [title, setTitle] = useState("Untitled Mini");
    const [description, setDescription] = useState("");
    const [entries, setEntries] = useState(
        Array.from({ length: 5 }, () => ({ clue: "", answer: "" }))
    );
    const [subject, setSubject] = useState("");
    const [tags, setTags] = useState<string>("");

    const { puzzle, warnings, size } = useMemo(
        () =>
            generateAcrossOnlyPuzzle({
                title,
                description,
                entries,
            }),
        [title, description, entries]
    );

    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);

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

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Crossword Puzzle</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. CS 1412 Mini #1"
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g. Biology, Algebra"
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                            <input
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="Comma-separated (e.g. cells,energy,mitosis)"
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description for students"
                            className="w-full border rounded-md px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="sm:col-span-6 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    value={row.answer}
                                    onChange={(e) => {
                                        const next = entries.slice();
                                        next[idx] = { ...next[idx], answer: e.target.value };
                                        setEntries(next);
                                    }}
                                    placeholder="Answer (A–Z, 0–9)"
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500  tracking-widest"
                                />
                            </div>
                        ))}
                        <p className="text-sm text-gray-500">Only A–Z and 0–9 are kept. Width auto-sizes to the longest answer (up to 15). Longer entries are trimmed.</p>
                    </div>
                </form>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Live Preview</h2>
                        <div className="text-sm text-gray-500">Size: 5 × {size.cols}</div>
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
                                saving ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {saving ? "Saving..." : "Save to Firebase"}
                        </button>
                        {saveMsg && <span className="text-sm text-gray-700">{saveMsg}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
