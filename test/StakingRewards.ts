import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Staking Rewards", function () {
  async function deployStakingRewards() {
    const [owner, otherAccount] = await ethers.getSigners();

    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy();
    await myToken.deployed();

    const ownerAddress = owner.address;
    const rewardsDistributionAddress = owner.address;
    const rewardsTokenAddress = myToken.address;
    const stakingTokenAddress = myToken.address;

    const StakingRewards = await ethers.getContractFactory("StakingRewards");
    const stakingRewards = await StakingRewards.deploy(
      ownerAddress,
      rewardsDistributionAddress,
      rewardsTokenAddress,
      stakingTokenAddress
    );
    await stakingRewards.deployed();

    return { owner, otherAccount, stakingRewards, myToken };
  }

  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const { owner, otherAccount, stakingRewards, myToken } =
        await loadFixture(deployStakingRewards);

      console.log("Owner: ", owner.address);
      console.log("OtherAccount: ", otherAccount.address);
      console.log("StakingRewards: ", stakingRewards.address);
      console.log("MyToken: ", myToken.address);
    });
  });

  describe("Staking", function () {
    it("Should stake otherAccount balance to StakingRewards", async () => {
      const { owner, otherAccount, stakingRewards, myToken } =
        await loadFixture(deployStakingRewards);

      // mint token for staking reward and other account
      await myToken
        .connect(owner)
        .mint(stakingRewards.address, ethers.utils.parseUnits("10000000")); //10m
      await myToken
        .connect(otherAccount)
        .mint(otherAccount.address, ethers.utils.parseUnits("10000")); //10k

      // set reward distribution by rewardsDistributionAddress (owner)
      await stakingRewards
        .connect(owner)
        .notifyRewardAmount(ethers.utils.parseUnits("1000000")); //1m

      // approve otherAccount's token to StakingRewards for staking
      // stake otherAccount's token to stakingRewards
      await myToken
        .connect(otherAccount)
        .approve(stakingRewards.address, ethers.utils.parseUnits("1000")); // 1k
      await stakingRewards
        .connect(otherAccount)
        .stake(ethers.utils.parseUnits("1000")); //1k

      // the otherAccount balance should be 10k - 1k
      const otherAccountBalance = await myToken
        .connect(otherAccount)
        .balanceOf(otherAccount.address);
      expect(otherAccountBalance).is.equal("9000000000000000000000");

      await time.increase(3600 * 24 * 7); // after 7days

      const otherAccountEarned = await stakingRewards.earned(
        otherAccount.address
      );

      const expectOtherAccountEarned = "999996693121693121600000"; // compesate 2 blocktime in seconds when the owner notifity reward to the contract and the user stake
      expect(otherAccountEarned).is.equal(expectOtherAccountEarned);

      // claim the reward and withdraw
      // check balance after claim the reward
      await stakingRewards.connect(otherAccount).exit();
      const otherAccountBalanceAfterClaimReward = await myToken
        .connect(otherAccount)
        .balanceOf(otherAccount.address);

      const finalOtherAccountBalance = "1009996693121693121600000"; // initial account + staking reward
      expect(otherAccountBalanceAfterClaimReward).is.equal(
        finalOtherAccountBalance
      );
    });
  });
});
