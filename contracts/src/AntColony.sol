// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title AntColony
/// @notice Monad-native microtask coordination and native MON settlement for autonomous agents.
contract AntColony is ReentrancyGuard {
    uint256 public constant MAX_TASKS_PER_COLONY = 8;
    uint256 public constant SKILL_IMAGE_REPAIR = 1 << 0;
    uint256 public constant SKILL_IMAGE_COLORIZE = 1 << 1;
    uint256 public constant SKILL_STORY_WRITE = 1 << 2;
    uint256 public constant SKILL_VERIFY = 1 << 3;

    enum TaskStatus {
        None,
        Open,
        Claimed,
        Submitted,
        Settled,
        Rejected,
        Cancelled
    }

    struct Agent {
        uint256 skills;
        bytes32 metadataHash;
        bool active;
    }

    struct Task {
        bytes32 colonyId;
        address requester;
        address worker;
        address verifier;
        uint256 requiredSkill;
        bytes32 inputHash;
        bytes32 outputHash;
        uint96 reward;
        uint40 deadline;
        TaskStatus status;
    }

    struct TaskInput {
        bytes32 taskId;
        uint256 requiredSkill;
        bytes32 inputHash;
        uint96 reward;
        uint40 deadline;
    }

    mapping(address agent => Agent profile) public agents;
    mapping(bytes32 taskId => Task task) public tasks;
    mapping(bytes32 colonyId => address requester) public colonyRequesters;
    mapping(address worker => uint256 amount) public claimableRewards;

    error AgentInactive();
    error SkillMismatch();
    error TaskNotOpen();
    error TaskNotClaimed();
    error TaskNotSubmitted();
    error UnauthorizedWorker();
    error UnauthorizedVerifier();
    error UnauthorizedRequester();
    error InvalidRewardTotal();
    error InvalidTaskCount();
    error InvalidTaskInput();
    error InvalidSkills();
    error InvalidAddress();
    error ColonyAlreadyExists();
    error TaskAlreadyExists();
    error DeadlineExpired();
    error DeadlineNotExpired();
    error NothingToWithdraw();
    error TransferFailed();
    error DirectPaymentNotAllowed();

    event AgentRegistered(address indexed agent, uint256 skills);
    event ColonyCreated(bytes32 indexed colonyId, address indexed requester, uint256 taskCount);
    event TaskCreated(bytes32 indexed colonyId, bytes32 indexed taskId, uint256 skill, uint256 reward);
    event TaskClaimed(bytes32 indexed taskId, address indexed worker);
    event ResultSubmitted(
        bytes32 indexed taskId, address indexed worker, bytes32 outputHash, string outputURI
    );
    event ResultVerified(bytes32 indexed taskId, address indexed verifier);
    event RewardCredited(bytes32 indexed taskId, address indexed worker, uint256 reward);
    event RewardWithdrawn(address indexed worker, uint256 amount);
    event TaskRejected(bytes32 indexed taskId, bytes32 reasonHash);
    event TaskCancelled(bytes32 indexed taskId);

    /// @notice Register or update the caller's agent profile.
    function registerAgent(uint256 skills, bytes32 metadataHash) external {
        if (skills == 0) revert InvalidSkills();

        agents[msg.sender] = Agent({ skills: skills, metadataHash: metadataHash, active: true });
        emit AgentRegistered(msg.sender, skills);
    }

    /// @notice Create up to eight independent tasks and escrow their exact total reward.
    function createColony(bytes32 colonyId, TaskInput[] calldata taskInputs, address verifier)
        external
        payable
    {
        uint256 taskCount = taskInputs.length;
        if (taskCount == 0 || taskCount > MAX_TASKS_PER_COLONY) revert InvalidTaskCount();
        if (colonyId == bytes32(0) || verifier == address(0)) revert InvalidAddress();
        if (colonyRequesters[colonyId] != address(0)) revert ColonyAlreadyExists();
        Agent storage verifierAgent = agents[verifier];
        if (!verifierAgent.active) revert AgentInactive();
        if ((verifierAgent.skills & SKILL_VERIFY) == 0) revert SkillMismatch();

        uint256 totalReward;
        for (uint256 i; i < taskCount; ++i) {
            TaskInput calldata input = taskInputs[i];
            if (
                input.taskId == bytes32(0) || input.requiredSkill == 0 || input.inputHash == bytes32(0)
                    || input.reward == 0
            ) revert InvalidTaskInput();
            if (input.taskId != computeTaskId(msg.sender, colonyId, i, input.inputHash)) {
                revert InvalidTaskInput();
            }
            // Deadlines intentionally use wall-clock time; minor validator skew is acceptable for this demo.
            // forge-lint: disable-next-line(block-timestamp)
            if (input.deadline <= block.timestamp) revert DeadlineExpired();
            if (tasks[input.taskId].status != TaskStatus.None) revert TaskAlreadyExists();

            totalReward += input.reward;
            tasks[input.taskId] = Task({
                colonyId: colonyId,
                requester: msg.sender,
                worker: address(0),
                verifier: verifier,
                requiredSkill: input.requiredSkill,
                inputHash: input.inputHash,
                outputHash: bytes32(0),
                reward: input.reward,
                deadline: input.deadline,
                status: TaskStatus.Open
            });

            emit TaskCreated(colonyId, input.taskId, input.requiredSkill, input.reward);
        }

        if (totalReward != msg.value) revert InvalidRewardTotal();

        colonyRequesters[colonyId] = msg.sender;
        emit ColonyCreated(colonyId, msg.sender, taskCount);
    }

    /// @notice Derive a requester-namespaced task ID without a global counter.
    function computeTaskId(address requester, bytes32 colonyId, uint256 subtaskIndex, bytes32 inputHash)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(requester, colonyId, subtaskIndex, inputHash));
    }

    /// @notice Claim an open task when the caller has at least one required skill bit.
    function claimTask(bytes32 taskId) external {
        Task storage task = tasks[taskId];
        if (task.status != TaskStatus.Open) revert TaskNotOpen();
        // forge-lint: disable-next-line(block-timestamp)
        if (block.timestamp > task.deadline) revert DeadlineExpired();

        Agent storage agent = agents[msg.sender];
        if (!agent.active) revert AgentInactive();
        if ((agent.skills & task.requiredSkill) == 0) revert SkillMismatch();

        task.worker = msg.sender;
        task.status = TaskStatus.Claimed;
        emit TaskClaimed(taskId, msg.sender);
    }

    /// @notice Commit an offchain result hash. The URI is emitted but not stored.
    function submitResult(bytes32 taskId, bytes32 outputHash, string calldata outputURI) external {
        Task storage task = tasks[taskId];
        if (task.worker != msg.sender) revert UnauthorizedWorker();
        if (task.status != TaskStatus.Claimed) revert TaskNotClaimed();
        // forge-lint: disable-next-line(block-timestamp)
        if (block.timestamp > task.deadline) revert DeadlineExpired();
        if (outputHash == bytes32(0)) revert InvalidTaskInput();

        task.outputHash = outputHash;
        task.status = TaskStatus.Submitted;
        emit ResultSubmitted(taskId, msg.sender, outputHash, outputURI);
    }

    /// @notice Approve a result and credit the worker without touching the shared escrow balance.
    function verifyResult(bytes32 taskId) external {
        Task storage task = tasks[taskId];
        if (task.verifier != msg.sender) revert UnauthorizedVerifier();
        if (task.status != TaskStatus.Submitted) revert TaskNotSubmitted();
        // forge-lint: disable-next-line(block-timestamp)
        if (block.timestamp > task.deadline) revert DeadlineExpired();

        task.status = TaskStatus.Settled;
        claimableRewards[task.worker] += task.reward;

        emit ResultVerified(taskId, msg.sender);
        emit RewardCredited(taskId, task.worker, task.reward);
    }

    /// @notice Reject a submitted result and return that task's escrow to the requester.
    function rejectAndRefund(bytes32 taskId, bytes32 reasonHash) external nonReentrant {
        Task storage task = tasks[taskId];
        if (task.verifier != msg.sender) revert UnauthorizedVerifier();
        if (task.status != TaskStatus.Submitted) revert TaskNotSubmitted();

        task.status = TaskStatus.Rejected;
        emit TaskRejected(taskId, reasonHash);
        _sendValue(task.requester, task.reward);
    }

    /// @notice Cancel an unsettled task after its deadline and refund its requester.
    function cancelExpiredTask(bytes32 taskId) external nonReentrant {
        Task storage task = tasks[taskId];
        if (task.requester != msg.sender) revert UnauthorizedRequester();
        // forge-lint: disable-next-line(block-timestamp)
        if (block.timestamp <= task.deadline) revert DeadlineNotExpired();
        if (
            task.status != TaskStatus.Open && task.status != TaskStatus.Claimed
                && task.status != TaskStatus.Submitted
        ) revert TaskNotOpen();

        task.status = TaskStatus.Cancelled;
        emit TaskCancelled(taskId);
        _sendValue(task.requester, task.reward);
    }

    /// @notice Withdraw all rewards previously credited to the caller.
    function withdrawReward() external nonReentrant {
        uint256 amount = claimableRewards[msg.sender];
        if (amount == 0) revert NothingToWithdraw();

        claimableRewards[msg.sender] = 0;
        _sendValue(msg.sender, amount);
        emit RewardWithdrawn(msg.sender, amount);
    }

    function _sendValue(address recipient, uint256 amount) private {
        (bool success,) = payable(recipient).call{ value: amount }("");
        if (!success) revert TransferFailed();
    }

    receive() external payable {
        revert DirectPaymentNotAllowed();
    }
}
