const readline = require('readline');

// Function to calculate the nth Fibonacci number using memoization
function nthFibonacciUtil(n, memo) {
    if (n <= 1) {
        return n;
    }

    if (memo[n] !== -1) {
        return memo[n];
    }

    memo[n] = nthFibonacciUtil(n - 1, memo) + nthFibonacciUtil(n - 2, memo);
    return memo[n];
}

function nthFibonacci(n) {
    let memo = new Array(n + 1).fill(-1);
    return nthFibonacciUtil(n, memo);
}

// Setup readline for input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Prompt the user
rl.question('', (answer) => {
    const n = parseInt(answer, 10);
    if (isNaN(n) || n < 0) {
        console.log("Please enter a valid non-negative integer.");
    } else {
        const result = nthFibonacci(n);
        console.log(result);
    }
    rl.close();
});
