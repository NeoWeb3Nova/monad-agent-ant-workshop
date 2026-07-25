// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { AntColony } from "../src/AntColony.sol";

contract AntColonyTest is Test {
    AntColony internal colony;

    address internal requester = makeAddr("requester");
    address internal repairWorker = makeAddr("repair-worker");
    address internal colorWorker = makeAddr("color-worker");
    address internal storyWorker = makeAddr("story-worker");
    address internal guard = makeAddr("guard");
    address internal rogue = makeAddr("rogue");
    address internal stranger = makeAddr("stranger");

    uint256 internal constant REPAIR = 1 << 0;
    uint256 internal constant COLOR = 1 << 1;
    uint256 internal constant STORY = 1 << 2;
    uint256 internal constant GUARD = 1 << 3;
    uint256 internal constant ROGUE = 1 << 4;

    bytes32 internal constant COLONY_ID = keccak256("antforge-demo-colony");
    bytes32 internal constant REPAIR_INPUT_HASH = keccak256("damaged-photo");
    bytes32 internal constant COLOR_INPUT_HASH = keccak256("repaired-photo");
    bytes32 internal constant STORY_INPUT_HASH = keccak256("photo-context");

    bytes32 internal repairTaskId;
    bytes32 internal colorTaskId;
    bytes32 internal storyTaskId;
    uint40 internal deadline;

    function setUp() public {
        colony = new AntColony();
        vm.deal(requester, 100 ether);
        deadline = uint40(block.timestamp + 1 days);
        repairTaskId = colony.computeTaskId(requester, COLONY_ID, 0, REPAIR_INPUT_HASH);
        colorTaskId = colony.computeTaskId(requester, COLONY_ID, 1, COLOR_INPUT_HASH);
        storyTaskId = colony.computeTaskId(requester, COLONY_ID, 2, STORY_INPUT_HASH);

        _register(repairWorker, REPAIR);
        _register(colorWorker, COLOR);
        _register(storyWorker, STORY);
        _register(guard, GUARD);
        _register(rogue, ROGUE);
    }

    function test_RegisterAgentStoresProfile() public view {
        (uint256 skills, bytes32 metadataHash, bool active) = colony.agents(repairWorker);

        assertEq(skills, REPAIR);
        assertEq(metadataHash, keccak256(abi.encodePacked(repairWorker)));
        assertTrue(active);
    }

    function test_CreateColonyEscrowsExactRewardsAndOpensTasks() public {
        AntColony.TaskInput[] memory inputs = _threeTaskInputs();
        uint256 totalReward = 6 ether;

        vm.prank(requester);
        colony.createColony{ value: totalReward }(COLONY_ID, inputs, guard);

        assertEq(address(colony).balance, totalReward);
        assertEq(colony.colonyRequesters(COLONY_ID), requester);
        assertEq(uint256(_taskStatus(repairTaskId)), uint256(AntColony.TaskStatus.Open));
        assertEq(uint256(_taskStatus(colorTaskId)), uint256(AntColony.TaskStatus.Open));
        assertEq(uint256(_taskStatus(storyTaskId)), uint256(AntColony.TaskStatus.Open));
    }

    function test_CreateColonyRejectsIncorrectRewardTotal() public {
        AntColony.TaskInput[] memory inputs = _singleTaskInput(repairTaskId, REPAIR, 1 ether);

        vm.prank(requester);
        vm.expectRevert(AntColony.InvalidRewardTotal.selector);
        colony.createColony{ value: 0.5 ether }(COLONY_ID, inputs, guard);

        assertEq(address(colony).balance, 0);
        assertEq(uint256(_taskStatus(repairTaskId)), uint256(AntColony.TaskStatus.None));
    }

    function test_CreateColonyRejectsNonDeterministicTaskId() public {
        AntColony.TaskInput[] memory inputs = _singleTaskInput(repairTaskId, REPAIR, 1 ether);
        inputs[0].taskId = keccak256("attacker-chosen-task-id");

        vm.prank(requester);
        vm.expectRevert(AntColony.InvalidTaskInput.selector);
        colony.createColony{ value: 1 ether }(COLONY_ID, inputs, guard);
    }

    function test_CreateColonyRequiresVerifierSkill() public {
        AntColony.TaskInput[] memory inputs = _singleTaskInput(repairTaskId, REPAIR, 1 ether);

        vm.prank(requester);
        vm.expectRevert(AntColony.SkillMismatch.selector);
        colony.createColony{ value: 1 ether }(COLONY_ID, inputs, colorWorker);
    }

    function test_RogueAgentCannotClaimSkillMismatchedTask() public {
        _createSingleTask(repairTaskId, REPAIR, 1 ether);

        vm.prank(rogue);
        vm.expectRevert(AntColony.SkillMismatch.selector);
        colony.claimTask(repairTaskId);
    }

    function test_DifferentWorkersClaimIndependentTasks() public {
        _createThreeTasks();

        vm.prank(repairWorker);
        colony.claimTask(repairTaskId);
        vm.prank(colorWorker);
        colony.claimTask(colorTaskId);
        vm.prank(storyWorker);
        colony.claimTask(storyTaskId);

        assertEq(_taskWorker(repairTaskId), repairWorker);
        assertEq(_taskWorker(colorTaskId), colorWorker);
        assertEq(_taskWorker(storyTaskId), storyWorker);
    }

    function test_SameTaskCannotBeClaimedTwice() public {
        _createSingleTask(repairTaskId, REPAIR, 1 ether);

        vm.prank(repairWorker);
        colony.claimTask(repairTaskId);

        vm.prank(repairWorker);
        vm.expectRevert(AntColony.TaskNotOpen.selector);
        colony.claimTask(repairTaskId);
    }

    function test_OnlyAssignedWorkerCanSubmit() public {
        _createSingleTask(repairTaskId, REPAIR, 1 ether);
        vm.prank(repairWorker);
        colony.claimTask(repairTaskId);

        vm.prank(stranger);
        vm.expectRevert(AntColony.UnauthorizedWorker.selector);
        colony.submitResult(repairTaskId, keccak256("result"), "ipfs://result");
    }

    function test_OnlyVerifierCanVerify() public {
        _createAndSubmitRepairTask();

        vm.prank(stranger);
        vm.expectRevert(AntColony.UnauthorizedVerifier.selector);
        colony.verifyResult(repairTaskId);
    }

    function test_VerifyCreditsRewardAndWorkerWithdrawsMON() public {
        _createAndSubmitRepairTask();
        uint256 workerBalanceBefore = repairWorker.balance;

        vm.prank(guard);
        colony.verifyResult(repairTaskId);

        assertEq(colony.claimableRewards(repairWorker), 1 ether);
        assertEq(repairWorker.balance, workerBalanceBefore);
        assertEq(uint256(_taskStatus(repairTaskId)), uint256(AntColony.TaskStatus.Settled));

        vm.prank(repairWorker);
        colony.withdrawReward();

        assertEq(colony.claimableRewards(repairWorker), 0);
        assertEq(repairWorker.balance, workerBalanceBefore + 1 ether);
        assertEq(address(colony).balance, 0);
    }

    function test_SettledTaskCannotCreditRewardTwice() public {
        _createAndSubmitRepairTask();
        vm.prank(guard);
        colony.verifyResult(repairTaskId);

        vm.prank(guard);
        vm.expectRevert(AntColony.TaskNotSubmitted.selector);
        colony.verifyResult(repairTaskId);

        assertEq(colony.claimableRewards(repairWorker), 1 ether);
    }

    function test_ZeroRewardCannotBeWithdrawn() public {
        vm.prank(repairWorker);
        vm.expectRevert(AntColony.NothingToWithdraw.selector);
        colony.withdrawReward();
    }

    function test_GuardRejectsSubmittedTaskAndRefundsRequester() public {
        _createAndSubmitRepairTask();
        uint256 requesterBalanceBefore = requester.balance;

        vm.prank(guard);
        colony.rejectAndRefund(repairTaskId, keccak256("quality-check-failed"));

        assertEq(requester.balance, requesterBalanceBefore + 1 ether);
        assertEq(address(colony).balance, 0);
        assertEq(uint256(_taskStatus(repairTaskId)), uint256(AntColony.TaskStatus.Rejected));
    }

    function test_RequesterCancelsOnlyAfterDeadlineAndReceivesRefund() public {
        _createSingleTask(repairTaskId, REPAIR, 1 ether);

        vm.warp(deadline);
        vm.prank(requester);
        vm.expectRevert(AntColony.DeadlineNotExpired.selector);
        colony.cancelExpiredTask(repairTaskId);

        uint256 requesterBalanceBefore = requester.balance;
        vm.warp(deadline + 1);
        vm.prank(requester);
        colony.cancelExpiredTask(repairTaskId);

        assertEq(requester.balance, requesterBalanceBefore + 1 ether);
        assertEq(uint256(_taskStatus(repairTaskId)), uint256(AntColony.TaskStatus.Cancelled));
    }

    function test_DirectPaymentIsRejected() public {
        vm.deal(stranger, 1 ether);
        vm.prank(stranger);
        (bool success, bytes memory returnData) = address(colony).call{ value: 1 ether }("");

        assertFalse(success);
        assertEq(returnData, abi.encodeWithSelector(AntColony.DirectPaymentNotAllowed.selector));
        assertEq(address(colony).balance, 0);
    }

    function _register(address agent, uint256 skill) internal {
        vm.prank(agent);
        colony.registerAgent(skill, keccak256(abi.encodePacked(agent)));
    }

    function _createThreeTasks() internal {
        AntColony.TaskInput[] memory inputs = _threeTaskInputs();
        vm.prank(requester);
        colony.createColony{ value: 6 ether }(COLONY_ID, inputs, guard);
    }

    function _createSingleTask(bytes32 taskId, uint256 skill, uint96 reward) internal {
        AntColony.TaskInput[] memory inputs = _singleTaskInput(taskId, skill, reward);
        vm.prank(requester);
        colony.createColony{ value: reward }(COLONY_ID, inputs, guard);
    }

    function _createAndSubmitRepairTask() internal {
        _createSingleTask(repairTaskId, REPAIR, 1 ether);
        vm.prank(repairWorker);
        colony.claimTask(repairTaskId);
        vm.prank(repairWorker);
        colony.submitResult(repairTaskId, keccak256("restored-photo"), "ipfs://restored-photo");
    }

    function _singleTaskInput(bytes32 taskId, uint256 skill, uint96 reward)
        internal
        view
        returns (AntColony.TaskInput[] memory inputs)
    {
        inputs = new AntColony.TaskInput[](1);
        inputs[0] = AntColony.TaskInput({
            taskId: taskId,
            requiredSkill: skill,
            inputHash: REPAIR_INPUT_HASH,
            reward: reward,
            deadline: deadline
        });
    }

    function _threeTaskInputs() internal view returns (AntColony.TaskInput[] memory inputs) {
        inputs = new AntColony.TaskInput[](3);
        inputs[0] = AntColony.TaskInput({
            taskId: repairTaskId,
            requiredSkill: REPAIR,
            inputHash: REPAIR_INPUT_HASH,
            reward: 1 ether,
            deadline: deadline
        });
        inputs[1] = AntColony.TaskInput({
            taskId: colorTaskId,
            requiredSkill: COLOR,
            inputHash: COLOR_INPUT_HASH,
            reward: 2 ether,
            deadline: deadline
        });
        inputs[2] = AntColony.TaskInput({
            taskId: storyTaskId,
            requiredSkill: STORY,
            inputHash: STORY_INPUT_HASH,
            reward: 3 ether,
            deadline: deadline
        });
    }

    function _taskStatus(bytes32 taskId) internal view returns (AntColony.TaskStatus status) {
        (,,,,,,,,, status) = colony.tasks(taskId);
    }

    function _taskWorker(bytes32 taskId) internal view returns (address worker) {
        (,, worker,,,,,,,) = colony.tasks(taskId);
    }
}
