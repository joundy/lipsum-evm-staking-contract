pragma solidity ^0.5.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract MyToken is ERC20Detailed, ERC20  {
    constructor() ERC20Detailed("MyToken", "MTK", 18) public {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
