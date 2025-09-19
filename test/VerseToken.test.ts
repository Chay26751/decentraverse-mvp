import { expect } from "chai";
import { ethers } from "hardhat";
import { VerseToken } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("VerseToken", function () {
  let verseToken: VerseToken;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const VerseTokenFactory = await ethers.getContractFactory("VerseToken");
    verseToken = await VerseTokenFactory.deploy();
    await verseToken.deployed();
  });

  describe("Deployment", function () {
    it("Should have correct name and symbol", async function () {
      expect(await verseToken.name()).to.equal("Verse Token");
      expect(await verseToken.symbol()).to.equal("VERSE");
    });

    it("Should have correct decimals", async function () {
      expect(await verseToken.decimals()).to.equal(18);
    });

    it("Should mint initial supply to deployer", async function () {
      const initialSupply = ethers.utils.parseEther("1000000"); // 1M tokens
      expect(await verseToken.totalSupply()).to.equal(initialSupply);
      expect(await verseToken.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("Should set the deployer as owner", async function () {
      expect(await verseToken.owner()).to.equal(owner.address);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.utils.parseEther("100");
      
      await verseToken.transfer(addr1.address, transferAmount);
      expect(await verseToken.balanceOf(addr1.address)).to.equal(transferAmount);
      
      const ownerBalance = await verseToken.balanceOf(owner.address);
      const expectedOwnerBalance = ethers.utils.parseEther("1000000").sub(transferAmount);
      expect(ownerBalance).to.equal(expectedOwnerBalance);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await verseToken.balanceOf(owner.address);
      
      await expect(
        verseToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      
      expect(await verseToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should update balances after transfers", async function () {
      const transferAmount = ethers.utils.parseEther("100");
      
      await verseToken.transfer(addr1.address, transferAmount);
      await verseToken.transfer(addr2.address, transferAmount);
      
      const finalOwnerBalance = await verseToken.balanceOf(owner.address);
      const expectedBalance = ethers.utils.parseEther("1000000").sub(transferAmount.mul(2));
      
      expect(finalOwnerBalance).to.equal(expectedBalance);
      expect(await verseToken.balanceOf(addr1.address)).to.equal(transferAmount);
      expect(await verseToken.balanceOf(addr2.address)).to.equal(transferAmount);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      
      await expect(verseToken.mint(addr1.address, mintAmount))
        .to.emit(verseToken, "TokensMinted")
        .withArgs(addr1.address, mintAmount);
      
      expect(await verseToken.balanceOf(addr1.address)).to.equal(mintAmount);
      
      const newTotalSupply = ethers.utils.parseEther("1000000").add(mintAmount);
      expect(await verseToken.totalSupply()).to.equal(newTotalSupply);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      
      await expect(
        verseToken.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Burning", function () {
    it("Should allow token holders to burn their tokens", async function () {
      const transferAmount = ethers.utils.parseEther("1000");
      const burnAmount = ethers.utils.parseEther("500");
      
      // Transfer tokens to addr1 first
      await verseToken.transfer(addr1.address, transferAmount);
      
      // Burn tokens
      await verseToken.connect(addr1).burn(burnAmount);
      
      expect(await verseToken.balanceOf(addr1.address)).to.equal(transferAmount.sub(burnAmount));
      
      const newTotalSupply = ethers.utils.parseEther("1000000").sub(burnAmount);
      expect(await verseToken.totalSupply()).to.equal(newTotalSupply);
    });

    it("Should not allow burning more tokens than balance", async function () {
      const transferAmount = ethers.utils.parseEther("100");
      const burnAmount = ethers.utils.parseEther("200");
      
      await verseToken.transfer(addr1.address, transferAmount);
      
      await expect(
        verseToken.connect(addr1).burn(burnAmount)
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });

    it("Should allow burning tokens from allowance", async function () {
      const approveAmount = ethers.utils.parseEther("1000");
      const burnAmount = ethers.utils.parseEther("500");
      
      // Owner approves addr1 to spend tokens
      await verseToken.approve(addr1.address, approveAmount);
      
      // addr1 burns from owner's balance
      await verseToken.connect(addr1).burnFrom(owner.address, burnAmount);
      
      const ownerBalance = await verseToken.balanceOf(owner.address);
      const expectedBalance = ethers.utils.parseEther("1000000").sub(burnAmount);
      expect(ownerBalance).to.equal(expectedBalance);
      
      const newTotalSupply = ethers.utils.parseEther("1000000").sub(burnAmount);
      expect(await verseToken.totalSupply()).to.equal(newTotalSupply);
    });
  });
});