const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');
const User = require('./src/models/User');
require('dotenv').config();

const moreProblems = [
  {
    title: "Remove Duplicates from Sorted Array",
    description: "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same.\n\nReturn k after placing the final result in the first k slots of nums.",
    difficulty: "Easy",
    tags: ["array", "two-pointers"],
    examples: [
      {
        input: "nums = [1,1,2]",
        output: "2, nums = [1,2,_]",
        explanation: "Your function should return k = 2, with the first two elements of nums being 1 and 2 respectively."
      },
      {
        input: "nums = [0,0,1,1,1,2,2,3,3,4]",
        output: "5, nums = [0,1,2,3,4,_,_,_,_,_]",
        explanation: "Your function should return k = 5, with the first five elements of nums being 0, 1, 2, 3, and 4 respectively."
      }
    ],
    constraints: "1 <= nums.length <= 3 * 10^4\n-100 <= nums[i] <= 100\nnums is sorted in non-decreasing order.",
    testCases: [
      { input: "1 1 2", expectedOutput: "2" },
      { input: "0 0 1 1 1 2 2 3 3 4", expectedOutput: "5" },
      { input: "1", expectedOutput: "1" },
      { input: "1 2", expectedOutput: "2" },
      { input: "1 1 1", expectedOutput: "1" }
    ]
  },
  {
    title: "Search Insert Position",
    description: "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.\n\nYou must write an algorithm with O(log n) runtime complexity.",
    difficulty: "Easy",
    tags: ["array", "binary-search"],
    examples: [
      {
        input: "nums = [1,3,5,6], target = 5",
        output: "2",
        explanation: ""
      },
      {
        input: "nums = [1,3,5,6], target = 2",
        output: "1",
        explanation: ""
      },
      {
        input: "nums = [1,3,5,6], target = 7",
        output: "4",
        explanation: ""
      }
    ],
    constraints: "1 <= nums.length <= 10^4\n-10^4 <= nums[i] <= 10^4\nnums contains distinct values sorted in ascending order.\n-10^4 <= target <= 10^4",
    testCases: [
      { input: "1 3 5 6\n5", expectedOutput: "2" },
      { input: "1 3 5 6\n2", expectedOutput: "1" },
      { input: "1 3 5 6\n7", expectedOutput: "4" },
      { input: "1 3 5 6\n0", expectedOutput: "0" },
      { input: "1\n1", expectedOutput: "0" }
    ]
  },
  {
    title: "Climbing Stairs",
    description: "You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    difficulty: "Easy",
    tags: ["math", "dynamic-programming", "memoization"],
    examples: [
      {
        input: "n = 2",
        output: "2",
        explanation: "There are two ways to climb to the top.\n1. 1 step + 1 step\n2. 2 steps"
      },
      {
        input: "n = 3",
        output: "3",
        explanation: "There are three ways to climb to the top.\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step"
      }
    ],
    constraints: "1 <= n <= 45",
    testCases: [
      { input: "1", expectedOutput: "1" },
      { input: "2", expectedOutput: "2" },
      { input: "3", expectedOutput: "3" },
      { input: "4", expectedOutput: "5" },
      { input: "5", expectedOutput: "8" },
      { input: "10", expectedOutput: "89" }
    ]
  },
  {
    title: "Best Time to Buy and Sell Stock",
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    difficulty: "Easy",
    tags: ["array", "dynamic-programming"],
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
        explanation: "In this case, no transactions are done and the max profit = 0."
      }
    ],
    constraints: "1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4",
    testCases: [
      { input: "7 1 5 3 6 4", expectedOutput: "5" },
      { input: "7 6 4 3 1", expectedOutput: "0" },
      { input: "1 2", expectedOutput: "1" },
      { input: "2 1 2 1 0 1 2", expectedOutput: "2" },
      { input: "1", expectedOutput: "0" }
    ]
  },
  {
    title: "Single Number",
    description: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.\n\nYou must implement a solution with a linear runtime complexity and use only constant extra space.",
    difficulty: "Easy",
    tags: ["array", "bit-manipulation"],
    examples: [
      {
        input: "nums = [2,2,1]",
        output: "1",
        explanation: ""
      },
      {
        input: "nums = [4,1,2,1,2]",
        output: "4",
        explanation: ""
      },
      {
        input: "nums = [1]",
        output: "1",
        explanation: ""
      }
    ],
    constraints: "1 <= nums.length <= 3 * 10^4\n-3 * 10^4 <= nums[i] <= 3 * 10^4\nEach element in the array appears twice except for one element which appears only once.",
    testCases: [
      { input: "2 2 1", expectedOutput: "1" },
      { input: "4 1 2 1 2", expectedOutput: "4" },
      { input: "1", expectedOutput: "1" },
      { input: "0 1 0", expectedOutput: "1" },
      { input: "1 2 3 2 1", expectedOutput: "3" }
    ]
  },
  {
    title: "Move Zeroes",
    description: "Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements.\n\nNote that you must do this in-place without making a copy of the array.",
    difficulty: "Easy",
    tags: ["array", "two-pointers"],
    examples: [
      {
        input: "nums = [0,1,0,3,12]",
        output: "[1,3,12,0,0]",
        explanation: ""
      },
      {
        input: "nums = [0]",
        output: "[0]",
        explanation: ""
      }
    ],
    constraints: "1 <= nums.length <= 10^4\n-2^31 <= nums[i] <= 2^31 - 1",
    testCases: [
      { input: "0 1 0 3 12", expectedOutput: "1 3 12 0 0" },
      { input: "0", expectedOutput: "0" },
      { input: "1", expectedOutput: "1" },
      { input: "1 0", expectedOutput: "1 0" },
      { input: "0 0 1", expectedOutput: "1 0 0" }
    ]
  },
  {
    title: "3Sum",
    description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.\n\nNotice that the solution set must not contain duplicate triplets.",
    difficulty: "Medium",
    tags: ["array", "two-pointers", "sorting"],
    examples: [
      {
        input: "nums = [-1,0,1,2,-1,-4]",
        output: "[[-1,-1,2],[-1,0,1]]",
        explanation: "nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.\nnums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.\nnums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0.\nThe distinct triplets are [-1,0,1] and [-1,-1,2]."
      },
      {
        input: "nums = [0,1,1]",
        output: "[]",
        explanation: "The only possible triplet does not sum up to 0."
      },
      {
        input: "nums = [0,0,0]",
        output: "[[0,0,0]]",
        explanation: "The only possible triplet sums up to 0."
      }
    ],
    constraints: "3 <= nums.length <= 3000\n-10^5 <= nums[i] <= 10^5",
    testCases: [
      { input: "-1 0 1 2 -1 -4", expectedOutput: "2" },
      { input: "0 1 1", expectedOutput: "0" },
      { input: "0 0 0", expectedOutput: "1" },
      { input: "-2 0 1 1 2", expectedOutput: "2" },
      { input: "1 -1 -1 0", expectedOutput: "1" }
    ]
  },
  {
    title: "Container With Most Water",
    description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container that can hold the most water.\n\nReturn the maximum amount of water a container can store.\n\nNotice that you may not slant the container.",
    difficulty: "Medium",
    tags: ["array", "two-pointers", "greedy"],
    examples: [
      {
        input: "height = [1,8,6,2,5,4,8,3,7]",
        output: "49",
        explanation: "The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water the container can contain is 49."
      },
      {
        input: "height = [1,1]",
        output: "1",
        explanation: ""
      }
    ],
    constraints: "n == height.length\n2 <= n <= 10^5\n0 <= height[i] <= 10^4",
    testCases: [
      { input: "1 8 6 2 5 4 8 3 7", expectedOutput: "49" },
      { input: "1 1", expectedOutput: "1" },
      { input: "1 2 1", expectedOutput: "2" },
      { input: "2 1", expectedOutput: "1" },
      { input: "1 2 4 3", expectedOutput: "4" }
    ]
  },
  {
    title: "Group Anagrams",
    description: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    difficulty: "Medium",
    tags: ["array", "hash-table", "string", "sorting"],
    examples: [
      {
        input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
        output: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
        explanation: ""
      },
      {
        input: 'strs = [""]',
        output: '[[""]]',
        explanation: ""
      },
      {
        input: 'strs = ["a"]',
        output: '[["a"]]',
        explanation: ""
      }
    ],
    constraints: "1 <= strs.length <= 10^4\n0 <= strs[i].length <= 100\nstrs[i] consists of lowercase English letters only.",
    testCases: [
      { input: "eat tea tan ate nat bat", expectedOutput: "3" },
      { input: "a", expectedOutput: "1" },
      { input: "ab ba", expectedOutput: "1" },
      { input: "abc bca cab xyz", expectedOutput: "2" },
      { input: "a aa aaa", expectedOutput: "3" }
    ]
  },
  {
    title: "Unique Paths",
    description: "There is a robot on an m x n grid. The robot is initially located at the top-left corner (i.e., grid[0][0]). The robot tries to move to the bottom-right corner (i.e., grid[m - 1][n - 1]). The robot can only move either down or right at any point in time.\n\nGiven the two integers m and n, return the number of possible unique paths that the robot can take to reach the bottom-right corner.",
    difficulty: "Medium",
    tags: ["math", "dynamic-programming", "combinatorics"],
    examples: [
      {
        input: "m = 3, n = 7",
        output: "28",
        explanation: ""
      },
      {
        input: "m = 3, n = 2",
        output: "3",
        explanation: "From the top-left corner, there are a total of 3 ways to reach the bottom-right corner:\n1. Right -> Down -> Down\n2. Down -> Down -> Right\n3. Down -> Right -> Down"
      }
    ],
    constraints: "1 <= m, n <= 100",
    testCases: [
      { input: "3 7", expectedOutput: "28" },
      { input: "3 2", expectedOutput: "3" },
      { input: "1 1", expectedOutput: "1" },
      { input: "2 2", expectedOutput: "2" },
      { input: "4 4", expectedOutput: "20" }
    ]
  }
];

async function addMoreProblems() {
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

    console.log('Adding more diverse programming problems...');
    
    for (const problemData of moreProblems) {
      const existingProblem = await Problem.findOne({ title: problemData.title });
      if (!existingProblem) {
        await Problem.create({
          ...problemData,
          createdBy: adminUser._id,
          timeLimit: 5000, // 5 seconds
          memoryLimit: 128 // 128 MB
        });
        console.log(`✓ Created problem: ${problemData.title} (${problemData.difficulty})`);
      } else {
        console.log(`- Problem already exists: ${problemData.title}`);
      }
    }

    console.log('\n=== More Programming Problems Added! ===');
    
    const totalProblems = await Problem.countDocuments();
    console.log(`Total problems in database: ${totalProblems}`);

    // Show problem distribution by difficulty
    const difficultyStats = await Problem.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\nProblem distribution:');
    difficultyStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} problems`);
    });

  } catch (error) {
    console.error('Error adding more problems:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addMoreProblems();
