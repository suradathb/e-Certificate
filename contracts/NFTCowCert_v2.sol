// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCowCert is ERC721URIStorage, Ownable {
    uint256 public adminCount;
    uint256 public certCount;

    struct Admin {
        uint256 id;
        address account;
        string username;
    }

    struct Cert {
        uint256 id;
        string metadataCID;
        bool isBlocked; // ✅ ถ้า true จะไม่สามารถโอนได้
    }

    struct CertIndex {
        uint256 tokenId;
        string cowId;
        bytes32 cowHash;
    }

    mapping(uint256 => Admin) public admins;
    mapping(uint256 => Cert) public certs;
    mapping(address => bool) public isAdmin;
    mapping(string => uint256) public cowIdToToken;
    mapping(bytes32 => uint256[]) public hashToTokens;

    event AdminAdded(
        uint256 indexed id,
        address indexed account,
        string username
    );
    event CertIssued(
        uint256 indexed id,
        address indexed to,
        string metadataCID
    );
    event CertBlocked(uint256 indexed id);
    event CertUnblocked(uint256 indexed id);

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Not authorized");
        _;
    }

     constructor(address initialOwner) ERC721("NFT Cow Certificate V2", "NFTCC2") {
        _transferOwnership(initialOwner);

        adminCount++;
        admins[adminCount] = Admin(adminCount, initialOwner, "SuperAdmin");
        isAdmin[initialOwner] = true;
        emit AdminAdded(adminCount, initialOwner, "SuperAdmin");
    }

    function addAdmin(address _account, string memory _username)
        public
        onlyOwner
    {
        require(!isAdmin[_account], "Already an admin");
        adminCount++;
        admins[adminCount] = Admin(adminCount, _account, _username);
        isAdmin[_account] = true;
        emit AdminAdded(adminCount, _account, _username);
    }

    function issueCert(
        address _to,
        string memory _metadataCID,
        string memory _cowId,
        bytes32 _cowHash
    ) public onlyAdmin {
        certCount++;
        certs[certCount] = Cert(certCount, _metadataCID, false); // isBlocked เริ่มต้น false

        cowIdToToken[_cowId] = certCount;
        hashToTokens[_cowHash].push(certCount);

        _mint(_to, certCount);
        _setTokenURI(
            certCount,
            string(abi.encodePacked("ipfs://", _metadataCID))
        );
        emit CertIssued(certCount, _to, _metadataCID);
    }

    // ✅ บล็อกใบรับรอง ไม่ให้สามารถโอนได้
    function blockCert(uint256 tokenId) public onlyAdmin {
        require(_existsPublic(tokenId), "Token does not exist");
        certs[tokenId].isBlocked = true;
        emit CertBlocked(tokenId);
    }

    // ✅ ปลดบล็อกใบรับรอง ให้สามารถโอนได้อีกครั้ง
    function unblockCert(uint256 tokenId) public onlyAdmin {
        require(_existsPublic(tokenId), "Token does not exist");
        certs[tokenId].isBlocked = false;
        emit CertUnblocked(tokenId);
    }

    // ✅ ตรวจสอบว่าใบรับรองถูกบล็อกหรือไม่
    function isCertBlocked(uint256 tokenId) public view returns (bool) {
        require(_existsPublic(tokenId), "Token does not exist");
        return certs[tokenId].isBlocked;
    }

    // ✅ แสดงสถานะเจ้าของ/URI/บล็อกหรือไม่
    function getCertStatus(uint256 tokenId)
        public
        view
        returns (
            address owner,
            string memory metadataURI,
            bool blocked
        )
    {
        require(_existsPublic(tokenId), "Token does not exist");
        owner = ownerOf(tokenId);
        metadataURI = tokenURI(tokenId);
        blocked = certs[tokenId].isBlocked;
    }

    function _existsPublic(uint256 tokenId) internal view returns (bool) {
        try this.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }

    function getTokenIdByCowId(string memory _cowId)
        public
        view
        returns (uint256)
    {
        return cowIdToToken[_cowId];
    }

    function getTokenIdsByHash(bytes32 _hash)
        public
        view
        returns (uint256[] memory)
    {
        return hashToTokens[_hash];
    }

    // ✅ เพิ่มการป้องกันไม่ให้โอน NFT ถ้าใบรับรองถูกบล็อก
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        require(!certs[tokenId].isBlocked, "This certificate is blocked and cannot be transferred");
    }
}
