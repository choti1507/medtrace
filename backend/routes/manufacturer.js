const express = require("express");
const Manufacturer = require("../models/Manufacturer");

const router = express.Router();

router.get("/all", async (req, res, next) => {
  try {
    const { dbState } = req.app.locals;

    if (dbState.isMongoConnected) {
      const manufacturers = await Manufacturer.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: manufacturers });
    }

    return res.json({ success: true, data: dbState.mock.manufacturers });
  } catch (error) {
    return next(error);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const { dbState, utils } = req.app.locals;

    const {
      companyName,
      cdscoLicenseNumber,
      cdscaLicenseNumber,
      licenseType,
      licenseExpiry,
      approvedDrugTypes,
    } = req.body;

    const license = String(cdscoLicenseNumber || cdscaLicenseNumber || "").trim();

    if (!companyName || !license) {
      return res.status(400).json({
        success: false,
        error: "Company name and CDSCO license number are required",
      });
    }

    const expiryDate = licenseExpiry
      ? new Date(licenseExpiry)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    if (dbState.isMongoConnected) {
      const exists = await Manufacturer.findOne({
        $or: [
          { cdscoLicenseNumber: license },
          { cdscaLicenseNumber: license },
        ],
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          error: "License already registered",
        });
      }

      const manufacturer = await Manufacturer.create({
        companyName,
        cdscoLicenseNumber: license,
        cdscaLicenseNumber: license,
        licenseType: licenseType || "General",
        licenseExpiry: expiryDate,
        approvedDrugTypes: approvedDrugTypes || [],
        isVerified: true,
      });

      console.log("Manufacturer registered successfully");

      return res.status(201).json({
        success: true,
        manufacturer,
      });
    }

    const existsMock = dbState.mock.manufacturers.find(
      (item) =>
        item.cdscoLicenseNumber === license ||
        item.cdscaLicenseNumber === license
    );

    if (existsMock) {
      return res.status(400).json({
        success: false,
        error: "License already registered",
      });
    }

    const mockManufacturer = {
      _id: utils.uuidv4(),
      companyName,
      cdscoLicenseNumber: license,
      cdscaLicenseNumber: license,
      licenseType: licenseType || "General",
      licenseExpiry: expiryDate,
      approvedDrugTypes: approvedDrugTypes || [],
      isVerified: true,
      createdAt: new Date(),
    };

    dbState.mock.manufacturers.push(mockManufacturer);

    console.log("Manufacturer registered successfully");

    return res.status(201).json({
      success: true,
      manufacturer: mockManufacturer,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;