// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ConsentRecord {
    struct Agreement {
        address initiator;
        address participant;
        bytes32 contentHash;
        uint256 timestamp;
        bool isRevoked;
    }

    mapping(bytes32 => Agreement) public agreements;
    mapping(address => uint256) private nonces;

    event ConsentLogged(bytes32 indexed agreementId, address indexed initiator, address indexed participant, uint256 timestamp);
    event ConsentRevoked(bytes32 indexed agreementId, uint256 timestamp);

    function createConsent(address _participant, bytes32 _contentHash) public returns (bytes32) {
        require(_participant != address(0), "Invalid participant address");
        require(_participant != msg.sender, "Initiator and participant must differ");

        uint256 nonce = nonces[msg.sender]++;
        bytes32 agreementId = keccak256(abi.encodePacked(msg.sender, _participant, _contentHash, block.timestamp, nonce));

        agreements[agreementId] = Agreement({
            initiator: msg.sender,
            participant: _participant,
            contentHash: _contentHash,
            timestamp: block.timestamp,
            isRevoked: false
        });

        emit ConsentLogged(agreementId, msg.sender, _participant, block.timestamp);
        return agreementId;
    }

    function revokeConsent(bytes32 _agreementId) public {
        Agreement storage agree = agreements[_agreementId];
        require(agree.initiator != address(0), "Agreement does not exist");
        require(msg.sender == agree.initiator || msg.sender == agree.participant, "Not authorized");
        require(!agree.isRevoked, "Already revoked");
        agree.isRevoked = true;
        emit ConsentRevoked(_agreementId, block.timestamp);
    }
}
