const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');
const User = require('./src/models/User');
require('dotenv').config();

const additionalProblems = [
  {
    title: "Fibonacci Number",
    description: "The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.\n\nGiven n, calculate F(n).",
    difficulty: "Easy",
    examples: [
      {
        input: "2",
        output: "1",
        explanation: "F(2) = F(1) + F(0) = 1 + 0 = 1."
      },
      {
        input: "3",
        output: "2", 
        explanation: "F(3) = F(2) + F(1) = 1 + 1 = 2."
      },
      {
        input: "4",
        output: "3",
        explanation: "F(4) = F(3) + F(2) = 2 + 1 = 3."
      }
    ],
    constraints: "0 <= n <= 30",
    testCases: [
      { input: "0", expectedOutput: "0" },
      { input: "1", expectedOutput: "1" },
      { input: "2", expectedOutput: "1" },
      { input: "3", expectedOutput: "2" },
      { input: "4", expectedOutput: "3" },
      { input: "5", expectedOutput: "5" },
      { input: "10", expectedOutput: "55" }
    ]
  },
  {
    title: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
    difficulty: "Easy",
    examples: [
      {
        input: '["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        explanation: ""
      },
      {
        input: '["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
        explanation: ""
      }
    ],
    constraints: "1 <= s.length <= 10^5\ns[i] is a printable ascii character.",
    testCases: [
      { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' },
      { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]' },
      { input: '["a"]', expectedOutput: '["a"]' },
      { input: '["a","b"]', expectedOutput: '["b","a"]' }
    ]
  },
  {
    title: "Maximum Subarray",
    description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.\n\nA subarray is a contiguous part of an array.",
    difficulty: "Medium",
    examples: [
      {
        input: "[-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "[4,-1,2,1] has the largest sum = 6."
      },
      {
        input: "[1]",
        output: "1",
        explanation: ""
      },
      {
        input: "[5,4,-1,7,8]",
        output: "23",
        explanation: ""
      }
    ],
    constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" },
      { input: "[1]", expectedOutput: "1" },
      { input: "[5,4,-1,7,8]", expectedOutput: "23" },
      { input: "[-1]", expectedOutput: "-1" },
      { input: "[-2,-1]", expectedOutput: "-1" }
    ]
  },
  {
    title: "Binary Tree Inorder Traversal",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    difficulty: "Easy",
    examples: [
      {
        input: "[1,null,2,3]",
        output: "[1,3,2]",
        explanation: ""
      },
      {
        input: "[]",
        output: "[]",
        explanation: ""
      },
      {
        input: "[1]",
        output: "[1]",
        explanation: ""
      }
    ],
    constraints: "The number of nodes in the tree is in the range [0, 100].\n-100 <= Node.val <= 100",
    testCases: [
      { input: "[1,null,2,3]", expectedOutput: "[1,3,2]" },
      { input: "[]", expectedOutput: "[]" },
      { input: "[1]", expectedOutput: "[1]" },
      { input: "[1,2]", expectedOutput: "[2,1]" },
      { input: "[1,null,2]", expectedOutput: "[1,2]" }
    ]
  },
  {
    title: "Merge Intervals",
    description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    difficulty: "Medium",
    examples: [
      {
        input: "[[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
        explanation: "Since intervals [1,3] and [2,6] overlaps, merge them into [1,6]."
      },
      {
        input: "[[1,4],[4,5]]",
        output: "[[1,5]]",
        explanation: "Intervals [1,4] and [4,5] are considered overlapping."
      }
    ],
    constraints: "1 <= intervals.length <= 10^4\nintervals[i].length == 2\n0 <= starti <= endi <= 10^4",
    testCases: [
      { input: "[[1,3],[2,6],[8,10],[15,18]]", expectedOutput: "[[1,6],[8,10],[15,18]]" },
      { input: "[[1,4],[4,5]]", expectedOutput: "[[1,5]]" },
      { input: "[[1,4],[0,4]]", expectedOutput: "[[0,4]]" },
      { input: "[[1,4],[2,3]]", expectedOutput: "[[1,4]]" }
    ]
  }
];

async function addTestProblems() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@codejudge.com' });
    if (!adminUser) {
      console.error('Admin user not found! Please run seed.js first.');
      return;
    }

    console.log('Adding additional test problems...');
    
    for (const problemData of additionalProblems) {
      const existingProblem = await Problem.findOne({ title: problemData.title });
      if (!existingProblem) {
        await Problem.create({
          ...problemData,
          createdBy: adminUser._id
        });
        console.log(`Created problem: ${problemData.title}`);
      } else {
        console.log(`Problem already exists: ${problemData.title}`);
      }
    }

    console.log('\n=== Additional Test Problems Added! ===');
    
    const totalProblems = await Problem.countDocuments();
    console.log(`Total problems in database: ${totalProblems}`);

  } catch (error) {
    console.error('Error adding test problems:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addTestProblems();
