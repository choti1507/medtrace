const express = require("express");
const ScanLog = require("../models/ScanLog");
const { getChain, getBlocksByMedicineId, verifyChain } = require("../blockchain/chain");

const router = express.Router();

router.get("/blockchain/chain", async (req, res, next) => {
  try {
    return res.json({
      success: true,
      data: {
        chain: getChain(),
        isValid: verifyChain(),
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/blockchain/medicine/:medicineId", async (req, res, next) => {
  try {
    const { medicineId } = req.params;
    return res.json({
      success: true,
      data: getBlocksByMedicineId(medicineId),
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/scan/logs", async (req, res, next) => {
  try {
    const { dbState } = req.app.locals;
    if (dbState.isMongoConnected) {
      const logs = await ScanLog.find().sort({ scanTimestamp: -1 }).limit(50);
      return res.json({ success: true, data: logs });
    }
    const logs = [...dbState.mock.scanLogs]
      .sort((a, b) => new Date(b.scanTimestamp) - new Date(a.scanTimestamp))
      .slice(0, 50);
    return res.json({ success: true, data: logs });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
