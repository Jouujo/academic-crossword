// Type definitions for our crossword puzzle system

// Represents a single clue with its answer
export interface Clue {
    id: string;           // Unique identifier for the clue
    number: number;       // Clue number (1, 2, 3, etc.)
    clue: string;         // The actual clue text
    answer: string;       // The correct answer
    startRow: number;     // Starting row position (0-4 for 5x5 grid)
    startCol: number;     // Starting column position (0-4 for 5x5 grid)
    length: number;       // Length of the answer
  }
  
  // Represents a complete crossword puzzle
  export interface CrosswordPuzzle {
    id: string;           // Unique identifier for the puzzle
    title: string;        // Title of the puzzle
    description?: string; // Optional description
    clues: Clue[];        // Array of all clues (across only)
    grid: string[][];     // 5x5 grid where each cell contains a letter or is empty
    createdAt: Date;      // When the puzzle was created
    updatedAt: Date;      // When the puzzle was last updated
    createdBy: string;    // ID of the tutor who created it
    timerEnabled?: boolean; // Whether timing is enabled for this puzzle
  }
  
  // Represents the state of a cell in the grid
  export interface GridCell {
    letter: string;       // The letter in the cell (or empty string)
    isBlack: boolean;     // Whether this cell is blacked out
    isSelected: boolean;  // Whether this cell is currently selected
    isHighlighted: boolean; // Whether this cell is highlighted (part of selected word)
    number?: number;      // Clue number if this cell starts a word
  }