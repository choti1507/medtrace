const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const BLOCKCHAIN_FILE = path.join(__dirname, "blockchain.json");
let chain = [];

function calculateHash(block) {
  return crypto
    .createHash("sha256")
    .update(
      `${block.index}${block.timestamp}${block.medicineId || ""}${block.previousHash}`
    )
    .digest("hex");
}

function createGenesisBlock() {
  const block = {
    index: 0,
    timestamp: new Date().toISOString(),
    medicineId: "GENESIS",
    batchNumber: "GENESIS",
    action: "GENESIS",
    previousHash: "0",
    hash: "",
  };
  block.hash = calculateHash(block);
  return block;
}

function persistChain() {
  try {
    fs.writeFileSync(BLOCKCHAIN_FILE, JSON.stringify(chain, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to persist blockchain:", error.message);
  }
}

function loadChain() {
  try {
    if (fs.existsSync(BLOCKCHAIN_FILE)) {
      const data = JSON.parse(fs.readFileSync(BLOCKCHAIN_FILE, "utf-8"));
      if (Array.isArray(data) && data.length > 0) {
        chain = data;
        return;
      }
    }
  } catch (error) {
    console.error("Failed to load blockchain file, rebuilding genesis:", error.message);
  }
  chain = [createGenesisBlock()];
  persistChain();
}

function addBlock(data) {
  const previousBlock = chain[chain.length - 1];
  const block = {
    index: chain.length,
    timestamp: new Date().toISOString(),
    medicineId: data.medicineId || "UNKNOWN",
    batchNumber: data.batchNumber || "N/A",
    action: data.action || "UNKNOWN",
    previousHash: previousBlock.hash,
    hash: "",
  };
  block.hash = calculateHash(block);
  chain.push(block);
  persistChain();
  return block;
}

function getChain() {
  return chain;
}

function verifyChain() {
  if (chain.length === 0) return false;
  
  const genesis = chain[0];
  if (genesis.previousHash !== "0" || genesis.hash !== calculateHash(genesis)) {
    return false;
  }

  for (let i = 1; i < chain.length; i += 1) {
    const current = chain[i];
    const previous = chain[i - 1];
    if (current.previousHash !== previous.hash) {
      return false;
    }
    if (current.hash !== calculateHash(current)) {
      return false;
    }
  }
  return true;
}

function getBlocksByMedicineId(medicineId) {
  return chain.filter((block) => block.medicineId === medicineId);
}

loadChain();

module.exports = {
  addBlock,
  getChain,
  verifyChain,
  getBlocksByMedicineId,
};
