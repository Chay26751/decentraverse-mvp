// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GovernanceToken
 * @dev $GOV - ERC20Votes governance token for Decentraverse DAO
 * Features:
 * - Voting and delegation capabilities
 * - Snapshot functionality for proposals
 * - Permit functionality for gasless approvals
 * - Fixed initial supply of 500,000 tokens
 */
contract GovernanceToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    uint256 public constant INITIAL_SUPPLY = 500_000 * 10**18; // 500k tokens

    event TokensMinted(address indexed to, uint256 amount);
    event VotingPowerDelegated(address indexed delegator, address indexed delegatee, uint256 amount);

    constructor() 
        ERC20("Governance Token", "GOV") 
        ERC20Permit("Governance Token") 
    {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Delegate voting power to another address
     * @param delegatee Address to delegate votes to
     */
    function delegateVotes(address delegatee) public {
        uint256 balance = balanceOf(msg.sender);
        delegate(delegatee);
        emit VotingPowerDelegated(msg.sender, delegatee, balance);
    }

    /**
     * @dev Get the current voting power of an account
     * @param account Address to check voting power for
     * @return Current voting power
     */
    function getCurrentVotingPower(address account) external view returns (uint256) {
        return getVotes(account);
    }

    /**
     * @dev Get past voting power at a specific block
     * @param account Address to check voting power for
     * @param blockNumber Block number to check at
     * @return Past voting power
     */
    function getPastVotingPower(address account, uint256 blockNumber) external view returns (uint256) {
        return getPastVotes(account, blockNumber);
    }

    /**
     * @dev Returns the number of decimals used for token display
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    // The following functions are overrides required by Solidity.
    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}