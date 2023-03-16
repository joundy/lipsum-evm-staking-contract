import { ethers } from "hardhat";

async function main() {
  const StakingRewards = await ethers.getContractFactory("StakingRewards");

  const owner = "0x08F4e83d3286d689944016372e78a80aed4aF34a";
  const rewardsDistribution = "0x08F4e83d3286d689944016372e78a80aed4aF34a";
  const rewardsToken = "0x08F4e83d3286d689944016372e78a80aed4aF34a";
  const stakingToken = "0x08F4e83d3286d689944016372e78a80aed4aF34a";

  const stakingRewards = await StakingRewards.deploy(
    owner,
    rewardsDistribution,
    rewardsToken,
    stakingToken
  );
  await stakingRewards.deployed();
  console.log(`Successfully deployed to ${stakingRewards.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
