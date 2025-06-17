const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');
const User = require('./src/models/User');
require('dotenv').config();

const hardProblems = [
  {
    title: "Median of Two Sorted Arrays",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).",
    difficulty: "Hard",
    tags: ["array", "binary-search", "divide-and-conquer"],
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000",
        explanation: "merged array = [1,2,3] and median is 2."
      },
      {
        input: "nums1 = [1,2], nums2 = [3,4]",
        output: "2.50000",
        explanation: "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5."
      }
    ],
    constraints: "nums1.length == m\nnums2.length == n\n0 <= m <= 1000\n0 <= n <= 1000\n1 <= m + n <= 2000\n-10^6 <= nums1[i], nums2[i] <= 10^6",    testCases: [
      { input: "1 3\n2", expectedOutput: "2.0" },
      { input: "1 2\n3 4", expectedOutput: "2.5" },
      { input: "0 0\n0 0", expectedOutput: "0.0" },
      { input: "EMPTY\n1", expectedOutput: "1.0" },
      { input: "2\nEMPTY", expectedOutput: "2.0" }
    ]
  },
  {
    title: "Trapping Rain Water",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    difficulty: "Hard",
    tags: ["array", "two-pointers", "dynamic-programming", "stack", "monotonic-stack"],
    examples: [
      {
        input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        output: "6",
        explanation: "The above elevation map (black section) is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water (blue section) are being trapped."
      },
      {
        input: "height = [4,2,0,3,2,5]",
        output: "9",
        explanation: ""
      }
    ],
    constraints: "n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 3 * 10^4",
    testCases: [
      { input: "0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "6" },
      { input: "4 2 0 3 2 5", expectedOutput: "9" },
      { input: "3 0 2 0 4", expectedOutput: "5" },
      { input: "0 2 0", expectedOutput: "0" },
      { input: "3 2 1", expectedOutput: "0" }
    ]
  },
  {
    title: "Regular Expression Matching",
    description: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where:\n\n'.' Matches any single character.\n'*' Matches zero or more of the preceding element.\n\nThe matching should cover the entire input string (not partial).",
    difficulty: "Hard",
    tags: ["string", "dynamic-programming", "recursion"],
    examples: [
      {
        input: 's = "aa", p = "a"',
        output: "false",
        explanation: '"a" does not match the entire string "aa".'
      },
      {
        input: 's = "aa", p = "a*"',
        output: "true",
        explanation: "'*' means zero or more of the preceding element, 'a'. Therefore, by repeating 'a' once, it becomes \"aa\"."
      },
      {
        input: 's = "ab", p = ".*"',
        output: "true",
        explanation: '".*" means "zero or more (*) of any character (.)\".'
      }
    ],
    constraints: "1 <= s.length <= 20\n1 <= p.length <= 30\ns contains only lowercase English letters.\np contains only lowercase English letters, '.', and '*'.\nIt is guaranteed for each appearance of the character '*', there will be a previous valid character to match.",
    testCases: [
      { input: "aa\na", expectedOutput: "false" },
      { input: "aa\na*", expectedOutput: "true" },
      { input: "ab\n.*", expectedOutput: "true" },
      { input: "aab\nc*a*b", expectedOutput: "true" },
      { input: "mississippi\nmis*is*p*.", expectedOutput: "false" }
    ]
  },
  {
    title: "Merge k Sorted Lists",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
    difficulty: "Hard",
    tags: ["linked-list", "divide-and-conquer", "heap-priority-queue", "merge-sort"],
    examples: [
      {
        input: 'lists = [[1,4,5],[1,3,4],[2,6]]',
        output: "[1,1,2,3,4,4,5,6]",
        explanation: "The linked-lists are:\n[\n  1->4->5,\n  1->3->4,\n  2->6\n]\nmerging them into one sorted list:\n1->1->2->3->4->4->5->6"
      },
      {
        input: "lists = []",
        output: "[]",
        explanation: ""
      },
      {
        input: "lists = [[]]",
        output: "[]",
        explanation: ""
      }
    ],
    constraints: "k == lists.length\n0 <= k <= 10^4\n0 <= lists[i].length <= 500\n-10^4 <= lists[i][j] <= 10^4\nlists[i] is sorted in ascending order.\nThe sum of lists[i].length will not exceed 10^4.",    testCases: [
      { input: "1 4 5\n1 3 4\n2 6", expectedOutput: "1 1 2 3 4 4 5 6" },
      { input: "EMPTY", expectedOutput: "EMPTY" },
      { input: "1", expectedOutput: "1" },
      { input: "1 2\n3 4", expectedOutput: "1 2 3 4" },
      { input: "0\n1\n2", expectedOutput: "0 1 2" }
    ]
  },
  {
    title: "Longest Valid Parentheses",
    description: "Given a string containing just the characters '(' and ')', find the length of the longest valid (well-formed) parentheses substring.",
    difficulty: "Hard",
    tags: ["string", "dynamic-programming", "stack"],
    examples: [
      {
        input: 's = "(()"',
        output: "2",
        explanation: "The longest valid parentheses substring is \"()\"."
      },
      {
        input: 's = ")()())"',
        output: "4",
        explanation: "The longest valid parentheses substring is \"()()\"."
      },
      {
        input: 's = ""',
        output: "0",
        explanation: ""
      }
    ],
    constraints: "0 <= s.length <= 3 * 10^4\ns[i] is '(', or ')'.",    testCases: [
      { input: "(()", expectedOutput: "2" },
      { input: ")()())", expectedOutput: "4" },
      { input: "EMPTY", expectedOutput: "0" },
      { input: "()", expectedOutput: "2" },
      { input: "(())", expectedOutput: "4" },
      { input: "()(()", expectedOutput: "2" }
    ]
  }
];

async function addHardProblems() {
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

    console.log('Adding challenging Hard-level problems...');
    
    for (const problemData of hardProblems) {
      const existingProblem = await Problem.findOne({ title: problemData.title });
      if (!existingProblem) {
        await Problem.create({
          ...problemData,
          createdBy: adminUser._id,
          timeLimit: 5000, // 5 seconds
          memoryLimit: 128 // 128 MB
        });
        console.log(`✓ Created Hard problem: ${problemData.title}`);
      } else {
        console.log(`- Problem already exists: ${problemData.title}`);
      }
    }

    console.log('\n=== Hard Programming Problems Added! ===');
    
    const totalProblems = await Problem.countDocuments();
    console.log(`Total problems in database: ${totalProblems}`);

    // Show final problem distribution by difficulty
    const difficultyStats = await Problem.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\nFinal problem distribution:');
    difficultyStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} problems`);
    });

    // Show some popular tags
    const tagStats = await Problem.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    console.log('\nPopular problem tags:');
    tagStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} problems`);
    });

  } catch (error) {
    console.error('Error adding hard problems:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addHardProblems();
