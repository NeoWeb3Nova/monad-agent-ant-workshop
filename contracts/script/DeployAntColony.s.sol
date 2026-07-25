// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Script, console2 } from "forge-std/Script.sol";
import { AntColony } from "../src/AntColony.sol";

contract DeployAntColony is Script {
    function run() external returns (AntColony colony) {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("Chain ID:", block.chainid);
        console2.log("Deployer:", deployer);
        console2.log("Deployer balance:", deployer.balance);
        console2.log("[1/1] Deploying AntColony...");

        vm.startBroadcast(deployerPrivateKey);
        colony = new AntColony();
        vm.stopBroadcast();

        console2.log("ANT_COLONY_ADDRESS=", address(colony));
        console2.log("VITE_ANT_COLONY_ADDRESS=", address(colony));
    }
}
