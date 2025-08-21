"use client";

import { isCellBlack } from "@/utils/crossword";

type Props = {
    grid: string[][];
};

export default function GridPreview({ grid }: Props) {
    const rows = grid.length;
    const cols = grid[0]?.length || 0;

    return (
        <div className="flex justify-center">
            <div className="inline-grid rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm" style={{ gridTemplateColumns: `repeat(${cols}, 32px)` }}>
                {grid.map((row, rIdx) =>
                    row.map((cell, cIdx) => {
                        const empty = !cell || cell.trim() === "";
                        
                        // Add rounded corners to corner cells
                        let cornerClass = "";
                        if (rIdx === 0 && cIdx === 0) cornerClass = "rounded-tl-lg"; // top-left
                        if (rIdx === 0 && cIdx === cols - 1) cornerClass = "rounded-tr-lg"; // top-right
                        if (rIdx === rows - 1 && cIdx === 0) cornerClass = "rounded-bl-lg"; // bottom-left
                        if (rIdx === rows - 1 && cIdx === cols - 1) cornerClass = "rounded-br-lg"; // bottom-right
                        
                        return (
                            <div
                                key={`${rIdx}-${cIdx}`}
                                className={`w-8 h-8 border-r border-b border-gray-400 flex items-center justify-center text-sm font-semibold ${
                                    empty ? "bg-gray-200 text-transparent" : "bg-white text-gray-900"
                                } ${cornerClass}`}
                                style={{
                                    borderRight: cIdx === cols - 1 ? 'none' : '1px solid #9CA3AF',
                                    borderBottom: rIdx === rows - 1 ? 'none' : '1px solid #9CA3AF'
                                }}
                            >
                                {empty ? "_" : cell}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}


