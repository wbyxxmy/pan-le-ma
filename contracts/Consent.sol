// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// @title Consent - A simple on-chain sexual consent record contract
/// @notice Stores consent records between two participants identified by their wallet addresses.
contract Consent {
    struct ConsentRecord {
        address initiator;    // Address of the party who initiated the consent
        address participant;  // Address of the second party
        bytes32 contentHash;  // Keccak256 hash of the consent details (e.g., video, timestamp, location)
        uint256 timestamp;    // Block timestamp when consent was recorded
        bool isRevoked;       // Whether this consent has been revoked
    }

    // agreementId => ConsentRecord
    mapping(bytes32 => ConsentRecord) public records;

    event ConsentCreated(
        bytes32 indexed agreementId,
        address indexed initiator,
        address indexed participant,
        uint256 timestamp
    );

    event ConsentRevoked(
        bytes32 indexed agreementId,
        address revokedBy,
        uint256 timestamp
    );

    /// @notice Create a new consent record on-chain.
    /// @param _participant The address of the second consenting party.
    /// @param _contentHash A hash of the off-chain consent material (video, audio, metadata, etc.).
    /// @return agreementId The unique identifier for this consent record.
    function createConsent(address _participant, bytes32 _contentHash)
        external
        returns (bytes32 agreementId)
    {
        require(_participant != address(0), "Invalid participant address");
        require(_participant != msg.sender, "Initiator and participant must be different");

        agreementId = keccak256(
            abi.encodePacked(msg.sender, _participant, _contentHash, block.timestamp)
        );

        records[agreementId] = ConsentRecord({
            initiator: msg.sender,
            participant: _participant,
            contentHash: _contentHash,
            timestamp: block.timestamp,
            isRevoked: false
        });

        emit ConsentCreated(agreementId, msg.sender, _participant, block.timestamp);
    }

    /// @notice Revoke an existing consent record. Only the initiator or participant may revoke.
    /// @param _agreementId The ID of the consent record to revoke.
    function revokeConsent(bytes32 _agreementId) external {
        ConsentRecord storage record = records[_agreementId];
        require(
            msg.sender == record.initiator || msg.sender == record.participant,
            "Not authorized to revoke"
        );
        require(!record.isRevoked, "Already revoked");

        record.isRevoked = true;
        emit ConsentRevoked(_agreementId, msg.sender, block.timestamp);
    }

    /// @notice Check whether a consent record exists and is still valid (not revoked).
    /// @param _agreementId The ID of the consent record.
    /// @return valid True if the record exists and has not been revoked.
    function isConsentValid(bytes32 _agreementId) external view returns (bool valid) {
        ConsentRecord storage record = records[_agreementId];
        valid = record.timestamp != 0 && !record.isRevoked;
    }
}
