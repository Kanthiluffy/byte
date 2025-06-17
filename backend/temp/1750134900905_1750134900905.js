const readline = require('readline');

function isPalindrome(x) {
  if (x < 0) return false;
  const str = x.toString();
  return str === str.split('').reverse().join('');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Enter a number: ", (input) => {
  const num = parseInt(input, 10);
  if (isNaN(num)) {
    console.log("Invalid input. Please enter a valid number.");
  } else {
    const result = isPalindrome(num);
    console.log(`Is ${num} a palindrome? ${result}`);
  }
  rl.close();
});
