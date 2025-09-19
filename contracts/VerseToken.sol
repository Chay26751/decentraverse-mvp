// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VerseToken
 * @dev $VERSE - ERC20 utility token for Decentraverse platform
 * Features:
 * - Fixed initial supply of 1,000,000 tokens
 * - Burnable tokens to reduce supply
 * - Owner can mint additional tokens if needed
 */
contract VerseToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18; // 1 million tokens

    event TokensMinted(address indexed to, uint256 amount);

    constructor() ERC20("Verse Token", "VERSE") {
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
     * @dev Returns the number of decimals used for token display
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
}