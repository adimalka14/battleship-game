import { Position } from "../board/Position";
import { Board } from "../board/Board";

export function calculateMove(board: Board): Position {
    const validPositions: Position[] = [];

    for (let row = 0; row < board.grid.length; row++) {
        for (let col = 0; col < board.grid[row].length; col++) {
            if (!board.grid[row][col].isRevealed) {
                validPositions.push({ row, col });
            }
        }
    }

    return validPositions[Math.floor(Math.random() * validPositions.length)];
}
