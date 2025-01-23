// import { Attack, AttackType } from "./Attack";
// import { Cell } from '../board/Cell';
// import { Position } from '../board/Position';
//
// export const AttackRegistry: {[key in AttackType]: Attack} = {
//     [AttackType.REGULAR]: {
//         name: "Regular Attack",
//         description: "Reveals one cell.",
//         execute: regularAttack,
//     },
//     [AttackType.PLUS]: {
//         name: "Plus Attack",
//         description: "Reveals the target cell and adjacent cells in a plus shape.",
//         execute: plusAttack,
//     },
//     [AttackType.SCATTER]: {
//         name: "Scatter Attack",
//         description: "Reveals the target cell and 6 random cells.",
//         execute: scatterAttack
//     },
//     [AttackType.NUKED]: {
//         name: "Nuke Attack",
//         description: "Reveals all cells around the target cell ( 9 cells, including the target cell).",
//         execute: nukeAttack
//     },
// }
//
// function regularAttack(board: Cell[][], target: Position): void {
//     const cell = board[target.row][target.col];
//     if (!cell.isRevealed && isValidPosition(board, target)) {
//         cell.isRevealed = true;
//     }
// }
//
// function plusAttack(board: Cell[][], target: Position): void {
//         const directions = [
//             { row: -1, col: 0 },
//             { row: 1, col: 0 },
//             { row: 0, col: -1 },
//             { row: 0, col: 1 },
//             { row: 0, col: 0 },
//         ];
//
//     revealCells(board, directions, target);
// }
//
// function scatterAttack(board: Cell[][], target: Position): void {
//     const rows = board.length;
//     const cols = board[0].length;
//
//     board[target.row][target.col].isRevealed = true;
//
//     for (let i = 0; i < 6; i++) {
//         const randRow = Math.floor(Math.random() * rows);
//         const randCol = Math.floor(Math.random() * cols);
//         if (!board[randRow][randCol].isRevealed) {
//             board[randRow][randCol].isRevealed = true;
//         }
//     }
// }
//
// function nukeAttack(board: Cell[][], target: Position): void {
//     const directions = [
//         { row: -1, col: 0 },
//         { row: 1, col: 0 },
//         { row: 0, col: -1 },
//         { row: 0, col: 1 },
//         { row: -1, col: -1 },
//         { row: -1, col: 1 },
//         { row: 1, col: -1 },
//         { row: 1, col: 1 },
//         { row: 0, col: 0 },
//     ];
//
//     revealCells(board, directions, target);
// }
//
// function revealCells(board: Cell[][], directions: Position[], target: Position): void {
//     for (const dir of directions) {
//         const newRow = target.row + dir.row;
//         const newCol = target.col + dir.col;
//         if (isValidPosition(board, { row: newRow, col: newCol })) {
//             board[newRow][newCol].isRevealed = true;
//         }
//     }
// }
//
// function isValidPosition(board: Cell[][], position: Position): boolean {
//     return (
//         position.row >= 0 &&
//         position.row < board.length &&
//         position.col >= 0 &&
//         position.col < board[0].length
//     );
// }
