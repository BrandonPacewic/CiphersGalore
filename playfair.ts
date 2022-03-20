/*
 * Copyright (c) 2022 Brandon Pacewic
 *
 * Developed and tested by Brandon Pacewic
 * 
 * playfair.ts - File for the functionality of the playfair cipher solver
 */

// Set<string> where each string is of len 1
const createValidCharSet = (): Set<string> => {
  const alph = 'abcdefghijklmnopqrstuvwxyz';
  let charSet: Set<string> = new Set();

  for (let i = 0; i < alph.length; i++) {
    charSet.add(alph[i]);
  }

  return charSet;
};

const validateInput = (charSet: Set<string>, input: string): string => {
  input.toLowerCase();
  input = input.split(' ').join('');

  let output = '';

  for (let i = 0; i < input.length; i++) {
    if (!(charSet.has(input[i]))) {
      console.warn(`Invalid character at index ${i}`);
      continue;
    }

    output += input[i];
  }

  return output;
};

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

    if (matrix.length <= rowCol.row) {
      matrix.push([]);
    }

    matrix[rowCol.getRow()][rowCol.getCol()] = key[i];
    usedChars.add(key[i]);
  }

  for (let i = 0; i < alph.length; i++) {
    if (usedChars.has(alph[i])) { continue; }

    if (matrix.length <= rowCol.row) {
      matrix.push([]);
    }

    matrix[rowCol.getRow()][rowCol.getCol()] = alph[i];
  }

  return matrix;
};

const encoder = (
  matrix: string[][], encoding: boolean, input: string
): string => {
  const matrixSize = matrix.length;

  // Need to change the string input into array of string len 1
  // Should be a better way of doing this but we need to be able to 
  // assign chars through indexing
  let message = input.split('');

  let mapCharToCord: { [key: string]: number[] } = {};

  for (let row = 0; row < matrixSize; row++) {
    for (let cell = 0; cell < matrixSize; cell++) {
      mapCharToCord[matrix[row][cell]] = [row, cell];
    }
  }

  // If the message len is not even the letter 'x' is added to make 
  // enough character pairs
  if (message.length % 2 !== 0) {
    message.push('x');
  }

  console.assert(message.length % 2 === 0);

  // If any pair of chars is the same, the second one must be coverted
  // to 'x'. Also at this step every 'j' must be replaced with an 'i'
  const handleJ = (str: string): string => (str === 'j') ? 'i' : str;

  const handleDoubles = (first: string, second: string): string => {
    return (first === second) ? 'x' : second;
  };

  for (let i = 0; i < message.length; i += 2) {
    message[i] = handleJ(message[i]);
    message[i + 1] = handleJ(message[i + 1]);
    message[i + 1] = handleDoubles(message[i], message[i + 1]);
  }

  let messageCords: number[][] = [];

  for (let i = 0; i < message.length; i++) {
    messageCords[i] = mapCharToCord[message[i]];
  }

  // Mod in js works differently than expected should create a number between
  // 0 and y, but in js it creates a number between -y and y.
  // This is not what we want so it is redefined here
  const mod = (x: number, y: number) => ((x % y) + y) % y;

  // adjustment defines the movment needed to find the propper char in the 
  // matrix on the account of the starting pairs are in the same row/column
  const adjustment = (encoding) ? 1 : -1;
  let newCords: number[][] = [];

  for (let i = 0; i < messageCords.length; i += 2) {
    if (messageCords[i][0] === messageCords[i + 1][0]) {
      newCords[i] = [
        messageCords[i][0],
        mod(messageCords[i][1] + adjustment, matrixSize)
      ];

      newCords[i + 1] = [
        messageCords[i + 1][0],
        mod(messageCords[i + 1][1] + adjustment, matrixSize)
      ];
    } 
    else if (messageCords[i][1] === messageCords[i + 1][1]) {
      newCords[i] = [
        mod(messageCords[i][0] - adjustment, matrixSize),
        messageCords[i][1]
      ];

      newCords[i + 1] = [
        mod(messageCords[i + 1][0] - adjustment, matrixSize),
        messageCords[i + 1][1]
      ];
    } 
    else {
      newCords[i] = [messageCords[i][0], messageCords[i + 1][1]];
      newCords[i + 1] = [messageCords[i + 1][0], messageCords[i][1]];
    }
  }

  let newMessage = '';

  for (let i = 0; i < newCords.length; i++) {
    newMessage += matrix[newCords[i][0]][newCords[i][1]];
  }

  return newMessage;
};

document.querySelector('.encode-message').addEventListener('click', () => {
  console.log('button update');

  const validCharSet = createValidCharSet();
  let message = (<HTMLInputElement>document.getElementById(
    'encoding-input')).value;
  let key = (<HTMLInputElement>document.getElementById(
    'encoding-key')).value;

  console.log(key, message);

  key = validateInput(validCharSet, key);
  message = validateInput(validCharSet, message);

  const matrix = createMatrix(key);
  const newMessage = encoder(matrix, true, message);

  console.log(newMessage);

  document.querySelector('.encoding-output').innerHTML = newMessage;
});
