import { expect } from "chai";
import { ethers } from "hardhat";
import { GovernanceToken } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("GovernanceToken", function () {
  let govToken: GovernanceToken;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addr3: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const GovernanceTokenFactory = await ethers.getContractFactory("GovernanceToken");
    govToken = await GovernanceTokenFactory.deploy();
    await govToken.deployed();
  });

  describe("Deployment", function () {
    it("Should have correct name and symbol", async function () {
      expect(await govToken.name()).to.equal("Governance Token");
      expect(await govToken.symbol()).to.equal("GOV");
    });

    it("Should have correct decimals", async function () {
      expect(await govToken.decimals()).to.equal(18);
    });

    it("Should mint initial supply to deployer", async function () {
      const initialSupply = ethers.utils.parseEther("500000"); // 500k tokens
      expect(await govToken.totalSupply()).to.equal(initialSupply);
      expect(await govToken.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("Should set the deployer as owner", async function () {
      expect(await govToken.owner()).to.equal(owner.address);
    });
  });

  describe("Basic ERC20 Functionality", function () {
    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.utils.parseEther("1000");
      
      await govToken.transfer(addr1.address, transferAmount);
      expect(await govToken.balanceOf(addr1.address)).to.equal(transferAmount);
    });

    it("Should approve and transferFrom", async function () {
      const approveAmount = ethers.utils.parseEther("1000");
      const transferAmount = ethers.utils.parseEther("500");
      
      await govToken.approve(addr1.address, approveAmount);
      await govToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);
      
      expect(await govToken.balanceOf(addr2.address)).to.equal(transferAmount);
      expect(await govToken.allowance(owner.address, addr1.address)).to.equal(
        approveAmount.sub(transferAmount)
      );
    });
  });

  describe("Voting Functionality", function () {
    beforeEach(async function () {
      // Distribute tokens for testing
      await govToken.transfer(addr1.address, ethers.utils.parseEther("10000"));
      await govToken.transfer(addr2.address, ethers.utils.parseEther("20000"));
    });

    it("Should have zero voting power initially", async function () {
      expect(await govToken.getCurrentVotingPower(addr1.address)).to.equal(0);
      expect(await govToken.getCurrentVotingPower(addr2.address)).to.equal(0);
    });

    it("Should allow self-delegation to activate voting power", async function () {
      await govToken.connect(addr1).delegate(addr1.address);
      
      const votingPower = await govToken.getCurrentVotingPower(addr1.address);
      expect(votingPower).to.equal(ethers.utils.parseEther("10000"));
    });

    it("Should allow delegation to another address", async function () {
      await govToken.connect(addr1).delegateVotes(addr2.address);
      
      expect(await govToken.getCurrentVotingPower(addr1.address)).to.equal(0);
      expect(await govToken.getCurrentVotingPower(addr2.address)).to.equal(
        ethers.utils.parseEther("10000")
      );
    });

    it("Should emit VotingPowerDelegated event", async function () {
      await expect(govToken.connect(addr1).delegateVotes(addr2.address))
        .to.emit(govToken, "VotingPowerDelegated")
        .withArgs(addr1.address, addr2.address, ethers.utils.parseEther("10000"));
    });

    it("Should aggregate voting power from multiple delegators", async function () {
      await govToken.connect(addr1).delegate(addr3.address);
      await govToken.connect(addr2).delegate(addr3.address);
      
      const totalVotingPower = await govToken.getCurrentVotingPower(addr3.address);
      expect(totalVotingPower).to.equal(ethers.utils.parseEther("30000"));
    });

    it("Should update voting power when tokens are transferred", async function () {
      // addr1 delegates to themselves
      await govToken.connect(addr1).delegate(addr1.address);
      expect(await govToken.getCurrentVotingPower(addr1.address)).to.equal(
        ethers.utils.parseEther("10000")
      );
      
      // Transfer half the tokens to addr3
      await govToken.connect(addr1).transfer(addr3.address, ethers.utils.parseEther("5000"));
      
      // Voting power should be reduced
      expect(await govToken.getCurrentVotingPower(addr1.address)).to.equal(
        ethers.utils.parseEther("5000")
      );
    });
  });

  describe("Snapshots and Past Votes", function () {
    it("Should track past voting power correctly", async function () {
      await govToken.transfer(addr1.address, ethers.utils.parseEther("10000"));
      await govToken.connect(addr1).delegate(addr1.address);
      
      // Mine a block to have a reference point
      await ethers.provider.send("evm_mine", []);
      const blockNumber = await ethers.provider.getBlockNumber();
      
      // Transfer tokens to change voting power
      await govToken.connect(addr1).transfer(addr2.address, ethers.utils.parseEther("5000"));
      
      // Check current vs past voting power
      const currentVotingPower = await govToken.getCurrentVotingPower(addr1.address);
      const pastVotingPower = await govToken.getPastVotingPower(addr1.address, blockNumber);
      
      expect(currentVotingPower).to.equal(ethers.utils.parseEther("5000"));
      expect(pastVotingPower).to.equal(ethers.utils.parseEther("10000"));
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      
      await expect(govToken.mint(addr1.address, mintAmount))
        .to.emit(govToken, "TokensMinted")
        .withArgs(addr1.address, mintAmount);
      
      expect(await govToken.balanceOf(addr1.address)).to.equal(mintAmount);
      
      const newTotalSupply = ethers.utils.parseEther("500000").add(mintAmount);
      expect(await govToken.totalSupply()).to.equal(newTotalSupply);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      
      await expect(
        govToken.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should update voting power when minting to delegated address", async function () {
      await govToken.connect(addr1).delegate(addr1.address);
      
      const mintAmount = ethers.utils.parseEther("5000");
      await govToken.mint(addr1.address, mintAmount);
      
      expect(await govToken.getCurrentVotingPower(addr1.address)).to.equal(mintAmount);
    });
  });

  describe("EIP-712 Domain", function () {
    it("Should have correct domain separator", async function () {
      const domainSeparator = await govToken.DOMAIN_SEPARATOR();
      expect(domainSeparator).to.not.equal(ethers.constants.HashZero);
    });
  });
});