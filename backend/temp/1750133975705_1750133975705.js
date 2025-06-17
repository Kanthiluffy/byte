const n = parseInt(require('fs').readFileSync(0, 'utf8').trim());

function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

console.log(fib(n));