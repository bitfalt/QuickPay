// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/// @dev Minimal reentrancy guard to protect external calls without external dependencies.
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

/// @dev Lightweight Merkle proof verifier (same interface as OpenZeppelin's) to avoid extra dependencies.
library MerkleProof {
    function verify(bytes32[] memory proof, bytes32 root, bytes32 leaf) internal pure returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == root;
    }
}

/// @title BillSplitEscrow
/// @notice Escrow contract that coordinates splitting a bill across a group of friends.
/// @dev Sessions use Merkle proofs to ensure only pre-approved participants can contribute.
///      Leaves should be constructed with domain separators (e.g. keccak256(abi.encodePacked(sessionId, participant, salt)))
///      to resist replay across sessions and support privacy by keeping the participant list off-chain.
///      Future zero-knowledge enhancements could replace the Merkle proof with a zk membership proof that hides
///      the exact participant while proving membership, or incorporate shielded balances so contributions remain private.
contract BillSplitEscrow is ReentrancyGuard {
    struct Session {
        address payer;
        uint256 billAmount;
        uint256 sharePerParticipant;
        uint256 participantCount;
        uint256 amountCollected;
        uint256 contributionsCount;
        bytes32 merkleRoot;
        bool cancelled;
        bool payerWithdrawn;
    }

    /// @notice Incremental identifier assigned to each session when created.
    uint256 public nextSessionId;

    /// @dev Storage for created sessions.
    mapping(uint256 => Session) private sessions;

    /// @dev Tracks whether a participant has already contributed for a given session.
    mapping(uint256 => mapping(address => bool)) private hasContributed;

    /// @dev Records the amount contributed by a participant, enabling refunds on cancellation.
    mapping(uint256 => mapping(address => uint256)) private contributions;

    event SessionCreated(
        uint256 indexed sessionId,
        address indexed payer,
        uint256 billAmount,
        uint256 participantCount,
        uint256 sharePerParticipant,
        bytes32 merkleRoot
    );

    event ContributionReceived(uint256 indexed sessionId, address indexed contributor, uint256 amount);

    event SessionWithdrawn(uint256 indexed sessionId, address indexed payer, uint256 amount);

    event SessionCancelled(uint256 indexed sessionId);

    event RefundClaimed(uint256 indexed sessionId, address indexed contributor, uint256 amount);

    error SessionDoesNotExist(uint256 sessionId);
    error InvalidParameters();
    error NotAuthorized();
    error AlreadyContributed();
    error IncorrectContribution();
    error SessionSettled(uint256 sessionId);
    error SessionNotCancellable(uint256 sessionId);
    error NoRefundAvailable();

    /// @notice Creates a new bill split session controlled by the caller (the payer).
    /// @param billAmount Total amount of the bill that should be reimbursed to the payer.
    /// @param participantCount Number of participants expected to contribute.
    /// @param merkleRoot Merkle root committing to approved participant leaves.
    /// @return sessionId The identifier of the newly created session.
    function createSession(
        uint256 billAmount,
        uint256 participantCount,
        bytes32 merkleRoot
    ) external returns (uint256 sessionId) {
        if (billAmount == 0 || participantCount == 0 || merkleRoot == bytes32(0)) {
            revert InvalidParameters();
        }

        if (billAmount % participantCount != 0) {
            revert InvalidParameters();
        }

        sessionId = nextSessionId;
        nextSessionId += 1;

        Session storage session = sessions[sessionId];
        session.payer = msg.sender;
        session.billAmount = billAmount;
        session.participantCount = participantCount;
        session.sharePerParticipant = billAmount / participantCount;
        session.merkleRoot = merkleRoot;

        emit SessionCreated(
            sessionId,
            msg.sender,
            billAmount,
            participantCount,
            session.sharePerParticipant,
            merkleRoot
        );
    }

    /// @notice Returns public information about a session.
    function getSessionInfo(uint256 sessionId) external view returns (Session memory info) {
        Session storage session = sessions[sessionId];
        if (session.payer == address(0)) {
            revert SessionDoesNotExist(sessionId);
        }
        info = session;
    }

    /// @notice Checks whether an address has already contributed to a session.
    function hasParticipantContributed(uint256 sessionId, address account) external view returns (bool) {
        return hasContributed[sessionId][account];
    }

    /// @notice Allows an approved participant to contribute their share via Merkle proof.
    /// @param sessionId Identifier of the session to fund.
    /// @param merkleProof Proof verifying that the sender is part of the approved participant set.
    function contribute(uint256 sessionId, bytes32[] calldata merkleProof) external payable nonReentrant {
        Session storage session = sessions[sessionId];
        if (session.payer == address(0)) {
            revert SessionDoesNotExist(sessionId);
        }
        if (session.cancelled || session.payerWithdrawn) {
            revert SessionSettled(sessionId);
        }
        if (session.contributionsCount >= session.participantCount) {
            revert SessionSettled(sessionId);
        }

        bytes32 leaf = keccak256(abi.encodePacked(sessionId, msg.sender));
        if (!MerkleProof.verify(merkleProof, session.merkleRoot, leaf)) {
            revert NotAuthorized();
        }

        if (hasContributed[sessionId][msg.sender]) {
            revert AlreadyContributed();
        }

        if (msg.value != session.sharePerParticipant) {
            revert IncorrectContribution();
        }

        hasContributed[sessionId][msg.sender] = true;
        contributions[sessionId][msg.sender] = msg.value;
        session.amountCollected += msg.value;
        session.contributionsCount += 1;

        emit ContributionReceived(sessionId, msg.sender, msg.value);
    }

    /// @notice Allows the payer to withdraw the collected funds once the bill is fully funded.
    /// @param sessionId Identifier of the session to settle.
    function withdrawPayer(uint256 sessionId) external nonReentrant {
        Session storage session = sessions[sessionId];
        if (session.payer == address(0)) {
            revert SessionDoesNotExist(sessionId);
        }
        if (msg.sender != session.payer) {
            revert NotAuthorized();
        }
        if (session.cancelled || session.payerWithdrawn) {
            revert SessionSettled(sessionId);
        }
        if (session.amountCollected != session.billAmount) {
            revert IncorrectContribution();
        }

        session.payerWithdrawn = true;
        uint256 amount = session.amountCollected;
        session.amountCollected = 0;

        (bool success, ) = session.payer.call{value: amount}("");
        require(success, "Payer transfer failed");

        emit SessionWithdrawn(sessionId, session.payer, amount);
    }

    /// @notice Allows the payer to cancel an ongoing session before it is fully funded.
    /// @param sessionId Identifier of the session to cancel.
    function cancelSession(uint256 sessionId) external {
        Session storage session = sessions[sessionId];
        if (session.payer == address(0)) {
            revert SessionDoesNotExist(sessionId);
        }
        if (msg.sender != session.payer) {
            revert NotAuthorized();
        }
        if (session.cancelled || session.payerWithdrawn) {
            revert SessionNotCancellable(sessionId);
        }
        if (session.amountCollected == session.billAmount) {
            revert SessionNotCancellable(sessionId);
        }

        session.cancelled = true;

        emit SessionCancelled(sessionId);
    }

    /// @notice Allows contributors to reclaim their funds after a session is cancelled.
    /// @param sessionId Identifier of the session for which to claim a refund.
    function claimRefund(uint256 sessionId) external nonReentrant {
        Session storage session = sessions[sessionId];
        if (session.payer == address(0)) {
            revert SessionDoesNotExist(sessionId);
        }
        if (!session.cancelled) {
            revert SessionNotCancellable(sessionId);
        }

        uint256 contributed = contributions[sessionId][msg.sender];
        if (contributed == 0) {
            revert NoRefundAvailable();
        }

        contributions[sessionId][msg.sender] = 0;
        session.amountCollected -= contributed;

        (bool success, ) = msg.sender.call{value: contributed}("");
        require(success, "Refund transfer failed");

        emit RefundClaimed(sessionId, msg.sender, contributed);
    }
}

