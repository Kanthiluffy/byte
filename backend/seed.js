const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const Problem = require('./src/models/Problem');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codejudge');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Problem.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@codejudge.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create regular user
    const regularUser = new User({
      name: 'John Doe',
      email: 'user@codejudge.com',
      password: 'user123',
      role: 'user',
      isVerified: true
    });
    await regularUser.save();
    console.log('Created regular user');

    // Sample problems
    const problems = [
      {
        title: 'Two Sum',
        description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
        difficulty: 'Easy',
        tags: ['array', 'hash-table'],
        constraints: `- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
        examples: [
          {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
          },
          {
            input: 'nums = [3,2,4], target = 6',
            output: '[1,2]',
            explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
          }
        ],
        testCases: [
          { input: '2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
          { input: '3 2 4\n6', expectedOutput: '1 2', isHidden: false },
          { input: '3 3\n6', expectedOutput: '0 1', isHidden: true },
          { input: '1 2 3 4 5\n8', expectedOutput: '2 4', isHidden: true }
        ],
        createdBy: adminUser._id
      },
      {
        title: 'Palindrome Number',
        description: `Given an integer x, return true if x is palindrome integer.

An integer is a palindrome when it reads the same backward as forward.

For example, 121 is a palindrome while 123 is not.`,
        difficulty: 'Easy',
        tags: ['math'],
        constraints: `-2^31 <= x <= 2^31 - 1`,
        examples: [
          {
            input: 'x = 121',
            output: 'true',
            explanation: '121 reads as 121 from left to right and from right to left.'
          },
          {
            input: 'x = -121',
            output: 'false',
            explanation: 'From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.'
          }
        ],
        testCases: [
          { input: '121', expectedOutput: 'true', isHidden: false },
          { input: '-121', expectedOutput: 'false', isHidden: false },
          { input: '10', expectedOutput: 'false', isHidden: true },
          { input: '0', expectedOutput: 'true', isHidden: true }
        ],
        createdBy: adminUser._id
      },
      {
        title: 'Valid Parentheses',
        description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
        difficulty: 'Easy',
        tags: ['string', 'stack'],
        constraints: `- 1 <= s.length <= 10^4
- s consists of parentheses only '()[]{}'.`,
        examples: [
          {
            input: 's = "()"',
            output: 'true',
            explanation: 'The string is valid.'
          },
          {
            input: 's = "()[]{}"',
            output: 'true',
            explanation: 'The string is valid.'
          },
          {
            input: 's = "(]"',
            output: 'false',
            explanation: 'The brackets are not properly matched.'
          }
        ],
        testCases: [
          { input: '()', expectedOutput: 'true', isHidden: false },
          { input: '()[]{]', expectedOutput: 'true', isHidden: false },
          { input: '(]', expectedOutput: 'false', isHidden: false },
          { input: '([)]', expectedOutput: 'false', isHidden: true },
          { input: '{[]}', expectedOutput: 'true', isHidden: true }
        ],
        createdBy: adminUser._id
      },
      {
        title: 'Longest Common Subsequence',
        description: `Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.

A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.

For example, "ace" is a subsequence of "abcde".

A common subsequence of two strings is a subsequence that is common to both strings.`,
        difficulty: 'Medium',
        tags: ['dynamic-programming', 'string'],
        constraints: `- 1 <= text1.length, text2.length <= 1000
- text1 and text2 consist of only lowercase English characters.`,
        examples: [
          {
            input: 'text1 = "abcde", text2 = "ace"',
            output: '3',
            explanation: 'The longest common subsequence is "ace" and its length is 3.'
          },
          {
            input: 'text1 = "abc", text2 = "abc"',
            output: '3',
            explanation: 'The longest common subsequence is "abc" and its length is 3.'
          }
        ],
        testCases: [
          { input: 'abcde\nace', expectedOutput: '3', isHidden: false },
          { input: 'abc\nabc', expectedOutput: '3', isHidden: false },
          { input: 'abc\ndef', expectedOutput: '0', isHidden: true },
          { input: 'ezupkr\nubmrapg', expectedOutput: '2', isHidden: true }
        ],
        createdBy: adminUser._id
      },
      {
        title: 'N-Queens',
        description: `The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.

Given an integer n, return all distinct solutions to the n-queens puzzle. You may return the answer in any order.

Each solution contains a distinct board configuration of the n-queens' placement, where 'Q' and '.' both indicate a queen and an empty space, respectively.`,
        difficulty: 'Hard',
        tags: ['backtracking', 'array'],
        constraints: `1 <= n <= 9`,
        examples: [
          {
            input: 'n = 4',
            output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]',
            explanation: 'There exist two distinct solutions to the 4-queens puzzle.'
          },
          {
            input: 'n = 1',
            output: '[["Q"]]',
            explanation: 'There is only one solution for n=1.'
          }
        ],
        testCases: [
          { input: '4', expectedOutput: '2', isHidden: false },
          { input: '1', expectedOutput: '1', isHidden: false },
          { input: '8', expectedOutput: '92', isHidden: true },
          { input: '5', expectedOutput: '10', isHidden: true }
        ],
        createdBy: adminUser._id
      }
    ];

    for (const problemData of problems) {
      const problem = new Problem(problemData);
      await problem.save();
      console.log(`Created problem: ${problem.title}`);
    }

    console.log('\n=== Seed Data Created Successfully! ===');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@codejudge.com / admin123');
    console.log('User:  user@codejudge.com / user123');
    console.log('\nFrontend: http://localhost:5173');
    console.log('Backend:  http://localhost:5000');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedData();
