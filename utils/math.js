/**
 * NodeForge - Math Utility Module
 * Demonstrates CommonJS export of mathematical and statistical helper functions
 */

function add(a, b) {
  return Number(a) + Number(b);
}

function subtract(a, b) {
  return Number(a) - Number(b);
}

function multiply(a, b) {
  return Number(a) * Number(b);
}

function divide(a, b) {
  const divisor = Number(b);
  if (divisor === 0) {
    throw new Error('Division by zero is not allowed.');
  }
  return Number(a) / divisor;
}

function factorial(n) {
  const num = parseInt(n, 10);
  if (isNaN(num) || num < 0) {
    throw new Error('Factorial requires a non-negative integer.');
  }
  if (num > 20) {
    throw new Error('Factorial argument exceeds safe display limit (<= 20).');
  }
  let result = 1;
  for (let i = 2; i <= num; i++) {
    result *= i;
  }
  return result;
}

function power(base, exponent) {
  return Math.pow(Number(base), Number(exponent));
}

function stats(numbers = []) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error('Stats function requires a non-empty array of numbers.');
  }
  const cleanNums = numbers.map(Number).filter(n => !isNaN(n));
  if (cleanNums.length === 0) {
    throw new Error('No valid numbers provided for stats computation.');
  }
  const sum = cleanNums.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / cleanNums.length;
  const min = Math.min(...cleanNums);
  const max = Math.max(...cleanNums);
  return {
    count: cleanNums.length,
    sum,
    average: Number(avg.toFixed(2)),
    min,
    max
  };
}

module.exports = {
  add,
  subtract,
  multiply,
  divide,
  factorial,
  power,
  stats
};
