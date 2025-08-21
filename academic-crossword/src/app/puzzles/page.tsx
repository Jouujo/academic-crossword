"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type PuzzleListItem = {
    id: string;
    title: string;
    description?: string;
    size?: { rows: number; cols: number };
    updatedAt?: { seconds: number; nanoseconds: number } | null;
    subject?: string;
    //grade?: string;
    //difficulty?: string;
    tags?: string[];
};



export default function PuzzlesPage() {
    const [items, setItems] = useState<PuzzleListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [subjectFilter, setSubjectFilter] = useState("");
    const [tagsFilter, setTagsFilter] = useState("");

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const q = query(collection(db, "puzzles"), orderBy("updatedAt", "desc"));
                const snap = await getDocs(q);
                const data: PuzzleListItem[] = snap.docs.map((d) => {
                    const val = d.data() as any;
                    return {
                        id: val.id ?? d.id,
                        title: val.title ?? "Untitled",
                        description: val.description ?? "",
                        size: val.size ?? { rows: 5, cols: (val.gridRows?.[0]?.length ?? 5) },
                        updatedAt: val.updatedAt ?? null,
                        subject: val.subject ?? "",
                        tags: val.tags ?? [],
                    };
                });
                setItems(data);
            } catch (e: any) {
                setError(e?.message || "Failed to load puzzles");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = useMemo(() => {
        const wantedTags = tagsFilter
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean);
        const subj = subjectFilter.trim().toLowerCase();
        return items.filter((p) => {
            const passSubject = subj ? (p.subject || "").toLowerCase().includes(subj) : true;
            const passTags = wantedTags.length === 0
                ? true
                : (p.tags || []).map((t) => t.toLowerCase()).filter(Boolean).length > 0 &&
                  wantedTags.every((t) => (p.tags || []).map((x) => x.toLowerCase()).includes(t));
            return passSubject && passTags;
        });
    }, [items, subjectFilter, tagsFilter]);

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Puzzles</h1>
            {loading && <div>Loading…</div>}
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {!loading && !error && (
                <div className="grid grid-cols-1 gap-4">
                    {items.length === 0 && (
                        <div className="text-gray-600">No puzzles yet. Create one from the Tutor page.</div>
                    )}
                    <div className="flex flex-wrap gap-3 items-end mb-2">
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Subject</label>
                            <input
                                value={subjectFilter}
                                onChange={(e) => setSubjectFilter(e.target.value)}
                                placeholder="e.g. CHEM 1412"
                                className="border rounded px-2 py-1 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Tags (comma-separated)</label>
                            <input
                                value={tagsFilter}
                                onChange={(e) => setTagsFilter(e.target.value)}
                                placeholder="cells, mitosis"
                                className="border rounded px-2 py-1 text-sm"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => { setSubjectFilter(""); setTagsFilter(""); }}
                            className="ml-auto px-3 py-1.5 rounded bg-red-100 hover:bg-red-200 text-sm transition-colors duration-200"
                        >
                            Clear
                        </button>
                        <div className="text-xs text-gray-500 ml-auto">{filtered.length} result{filtered.length === 1 ? "" : "s"}</div>
                    </div>
                    {filtered.map((p) => (
                        <div key={p.id} className="border rounded-md p-4 flex items-center justify-between">
                            <div>
                                <div className="font-semibold">{p.title}</div>
                                <div className="text-sm text-gray-600">{p.description}</div>
                                <div className="text-xs text-gray-500 mt-1">Size: {p.size?.rows} × {p.size?.cols}</div>
                                {p.subject && (
                                    <div className="text-xs text-gray-500 mt-1">{p.subject}</div>
                                )}
                                {p.tags && p.tags.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {p.tags.map((t) => (
                                            <span key={t} className="text-xs bg-red-100 rounded px-1 py-0.5">{t}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Placeholder actions for future: View, Edit, Play */}
                            <div className="flex gap-2 text-sm">
                                <a className="px-3 py-1 rounded-md bg-red-100 hover:bg-red-200 text-red-700 transition-colors duration-200" href={`/student?id=${encodeURIComponent(p.id)}`}>Play</a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


