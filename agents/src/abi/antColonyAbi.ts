// Generated from contracts/src/AntColony.sol.
export const antColonyAbi = [
  {
    "type": "receive",
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "MAX_TASKS_PER_COLONY",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "SKILL_IMAGE_COLORIZE",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "SKILL_IMAGE_REPAIR",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "SKILL_STORY_WRITE",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "SKILL_VERIFY",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "agents",
    "inputs": [
      {
        "name": "agent",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "skills",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "metadataHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "active",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "cancelExpiredTask",
    "inputs": [
      {
        "name": "taskId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimTask",
    "inputs": [
      {
        "name": "taskId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimableRewards",
    "inputs": [
      {
        "name": "worker",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "colonyRequesters",
    "inputs": [
      {
        "name": "colonyId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "requester",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "computeTaskId",
    "inputs": [
      {
        "name": "requester",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "colonyId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "subtaskIndex",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "inputHash",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "createColony",
    "inputs": [
      {
        "name": "colonyId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "taskInputs",
        "type": "tuple[]",
        "internalType": "struct AntColony.TaskInput[]",
        "components": [
          {
            "name": "taskId",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "requiredSkill",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "inputHash",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "reward",
            "type": "uint96",
            "internalType": "uint96"
          },
          {
            "name": "deadline",
            "type": "uint40",
            "internalType": "uint40"
          }
        ]
      },
      {
        "name": "verifier",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "registerAgent",
    "inputs": [
      {
        "name": "skills",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "metadataHash",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "rejectAndRefund",
    "inputs": [
      {
        "name": "taskId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "reasonHash",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "submitResult",
    "inputs": [
      {
        "name": "taskId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "outputHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "outputURI",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "tasks",
    "inputs": [
      {
        "name": "taskId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "colonyId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "requester",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "worker",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "verifier",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "requiredSkill",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "inputHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "outputHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "reward",
        "type": "uint96",
        "internalType": "uint96"
      },
      {
        "name": "deadline",
        "type": "uint40",
        "internalType": "uint40"
      },
      {
        "name": "status",
        "type": "uint8",
        "internalType": "enum AntColony.TaskStatus"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "verifyResult",
    "inputs": [
      {
        "name": "taskId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawReward",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "AgentRegistered",
    "inputs": [
      {
        "name": "agent",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "skills",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ColonyCreated",
    "inputs": [
      {
        "name": "colonyId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "requester",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "taskCount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ResultSubmitted",
    "inputs": [
      {
        "name": "taskId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "worker",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "outputHash",
        "type": "bytes32",
        "indexed": false,
        "internalType": "bytes32"
      },
      {
        "name": "outputURI",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ResultVerified",
    "inputs": [
      {
        "name": "taskId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "verifier",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RewardCredited",
    "inputs": [
      {
        "name": "taskId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "worker",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "reward",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RewardWithdrawn",
    "inputs": [
      {
        "name": "worker",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TaskCancelled",
    "inputs": [
      {
        "name": "taskId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TaskClaimed",
    "inputs": [
      {
        "name": "taskId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "worker",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TaskCreated",
    "inputs": [
      {
        "name": "colonyId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "taskId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "skill",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "reward",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TaskRejected",
    "inputs": [
      {
        "name": "taskId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "reasonHash",
        "type": "bytes32",
        "indexed": false,
        "internalType": "bytes32"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "AgentInactive",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ColonyAlreadyExists",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DeadlineExpired",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DeadlineNotExpired",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DirectPaymentNotAllowed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidRewardTotal",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidSkills",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidTaskCount",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidTaskInput",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NothingToWithdraw",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "SkillMismatch",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TaskAlreadyExists",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TaskNotClaimed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TaskNotOpen",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TaskNotSubmitted",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TransferFailed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UnauthorizedRequester",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UnauthorizedVerifier",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UnauthorizedWorker",
    "inputs": []
  }
] as const;
