/*
 * Copyright (c) 2022 Brandon Pacewic
 *
 * Developed and tested by Brandon Pacewic
 * 
 * home.ts - Main file for web based playfair cipher solver
 */

// Set<string> where each string is of len 1
const createValidCharSet = (): Set<String> => {
    const alph = 'abcdefghijklmnopqrstuvwxyz';
    let charSet: Set<String> = new Set();

    for (let i = 0; i < alph.length; i++) {
        charSet.add(alph[i]);
    }

    return charSet;
}

const validateInput = (charSet: Set<String>, input: string): void => {
    for (let i = 0; i < input.length; i++) {
        console.assert(charSet.has(input[i]));
    }
}

// TODO: should define matrix type, this class is just a quick fix for matrix
// wrapping
interface rowColPair {
    row: number;
    col: number;
    limit: number;
}

class rowColPair {
    constructor(limit: number) {
        this.row = 0;
        this.col = 0;
        this.limit = limit;
    }

    getCol(): number {
        const before = this.col;
        this.col++;

        if (this.col === this.limit) {
            this.col = 0;
            this.row++;
        }

        return before;
    }

    getRow(): number {
        return this.row;
    }

}

const createMatrix = (key: string): string[][] => {
    const alph = 'abcdefghiklmnopqrstuvwxyz'; // Note no 'j'
    const matrixSize = Math.sqrt(alph.length);
    let usedChars: Set<string> = new Set();
    let matrix: string[][] = [];

    let rowCol = new rowColPair(matrixSize);

    for (let i = 0; i < key.length; i++) {
        if (usedChars.has(key[i])) { continue; }

        matrix[rowCol.getRow()][rowCol.getCol()] = key[i];
    }

    for (let i = 0; i < alph.length; i++) {
        if (usedChars.has(alph[i])) { continue; }

        matrix[rowCol.getRow()][rowCol.getCol()] = alph[i];
    }

    return matrix;
}