const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const Manufacturer = require("./models/Manufacturer");
const Medicine = require("./models/Medicine");
const ScanLog = require("./models/ScanLog");
const { addBlock } = require("./blockchain/chain");
const errorHandler = require("./middleware/errorHandler");

const manufacturerRoutes = require("./routes/manufacturer");
const medicineRoutes = require("./routes/medicine");
const scanRoutes = require("./routes/scan");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/medtrace";
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5175", "http://127.0.0.1:5175"],
  })
);
app.use(express.json());

const dbState = {
  isMongoConnected: false,
  mock: {
    manufacturers: [],
    medicines: [],
    scanLogs: [],
  },
  seededMedicineIds: [],
};

const ipCityMap = {
  "::1": "Delhi",
  "127.0.0.1": "Delhi",
  "203.0.113.1": "Mumbai",
  "203.0.113.2": "Bengaluru",
};

function getCityFromIp(ipAddress) {
  if (!ipAddress) return "Delhi";
  return ipCityMap[ipAddress] || "Delhi";
}

function buildBlockchainHash(medicineData) {
  const licenseNumber = medicineData.cdscoLicenseNumber || medicineData.cdscaLicenseNumber || "";
  const raw = [
    medicineData.medicineId,
    medicineData.name,
    medicineData.manufacturer,
    medicineData.batchNumber,
    new Date(medicineData.manufactureDate).toISOString(),
    new Date(medicineData.expiryDate).toISOString(),
    licenseNumber,
    medicineData.drugType,
    medicineData.composition,
  ].join("|");
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function buildPackagingFingerprint({ imageName, medicineName, batchNumber }) {
  const raw = `${String(imageName || "").trim().toLowerCase()}|${String(medicineName || "")
    .trim()
    .toLowerCase()}|${String(batchNumber || "").trim().toLowerCase()}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

app.locals.dbState = dbState;
app.locals.utils = {
  uuidv4,
  buildBlockchainHash,
  buildPackagingFingerprint,
  getCityFromIp,
};

async function seedInitialData() {
  const seedManufacturers = [
    {
      companyName: "Astra Heal Pvt Ltd",
      cdscoLicenseNumber: "CDL/MH/2028/1001",
      cdscaLicenseNumber: "CDL/MH/2028/1001",
      licenseType: "Allopathic",
      licenseExpiry: new Date("2028-12-31"),
      approvedDrugTypes: ["Tablet", "Capsule"],
      isVerified: true,
    },
    {
      companyName: "BioCare Labs",
      cdscoLicenseNumber: "CDL/DL/2029/1002",
      cdscaLicenseNumber: "CDL/DL/2029/1002",
      licenseType: "Ayurvedic",
      licenseExpiry: new Date("2029-08-20"),
      approvedDrugTypes: ["Syrup", "Tablet"],
      isVerified: true,
    },
    {
      companyName: "MediSure Pharma",
      cdscoLicenseNumber: "CDL/KA/2027/1003",
      cdscaLicenseNumber: "CDL/KA/2027/1003",
      licenseType: "Allopathic",
      licenseExpiry: new Date("2027-11-11"),
      approvedDrugTypes: ["Injection", "Tablet"],
      isVerified: true,
    },
  ];

  const seedMedicinesBase = [
    {
      medicineId: "MEDTRACE-PARA-650",
      name: "Paracetamol 650mg",
      manufacturer: "Astra Heal Pvt Ltd",
      batchNumber: "BATCH-A1",
      manufactureDate: new Date("2026-01-15"),
      expiryDate: new Date("2028-01-15"),
      cdscoLicenseNumber: "CDL/MH/2028/1001",
      cdscaLicenseNumber: "CDL/MH/2028/1001",
      drugType: "Tablet",
      composition: "Paracetamol 650mg",
      packagingImageName: "pack_paracetamol_a1.png",
    },
    {
      medicineId: "MEDTRACE-VITC-500",
      name: "Vitamin C Tablets",
      manufacturer: "BioCare Labs",
      batchNumber: "BATCH-B2",
      manufactureDate: new Date("2026-02-12"),
      expiryDate: new Date("2027-12-12"),
      cdscoLicenseNumber: "CDL/DL/2029/1002",
      cdscaLicenseNumber: "CDL/DL/2029/1002",
      drugType: "Tablet",
      composition: "Vitamin C 500mg",
      packagingImageName: "pack_vitc_b2.png",
    },
    {
      medicineId: "MEDTRACE-AMOX-500",
      name: "Amoxicillin 500mg",
      manufacturer: "Astra Heal Pvt Ltd",
      batchNumber: "BATCH-A3",
      manufactureDate: new Date("2026-03-01"),
      expiryDate: new Date("2028-03-01"),
      cdscoLicenseNumber: "CDL/MH/2028/1001",
      cdscaLicenseNumber: "CDL/MH/2028/1001",
      drugType: "Capsule",
      composition: "Amoxicillin 500mg",
      packagingImageName: "pack_amox_a3.png",
    },
    {
      medicineId: "MEDTRACE-IBU-400",
      name: "Ibuprofen 400mg",
      manufacturer: "MediSure Pharma",
      batchNumber: "BATCH-C4",
      manufactureDate: new Date("2026-01-10"),
      expiryDate: new Date("2027-06-10"),
      cdscoLicenseNumber: "CDL/KA/2027/1003",
      cdscaLicenseNumber: "CDL/KA/2027/1003",
      drugType: "Tablet",
      composition: "Ibuprofen 400mg",
      packagingImageName: "pack_ibu_c4.png",
    },
    {
      medicineId: "MEDTRACE-AZITH-250",
      name: "Azithromycin 250mg",
      manufacturer: "BioCare Labs",
      batchNumber: "BATCH-B5",
      manufactureDate: new Date("2026-03-09"),
      expiryDate: new Date("2027-10-09"),
      cdscoLicenseNumber: "CDL/DL/2029/1002",
      cdscaLicenseNumber: "CDL/DL/2029/1002",
      drugType: "Tablet",
      composition: "Azithromycin 250mg",
      packagingImageName: "pack_azith_b5.png",
    },
  ];

  if (dbState.isMongoConnected) {
    const manufacturerCount = await Manufacturer.countDocuments();
    if (manufacturerCount === 0) {
      await Manufacturer.insertMany(seedManufacturers);
    }

    const medicineCount = await Medicine.countDocuments();
    if (medicineCount === 0) {
      const medicines = seedMedicinesBase.map((item) => {
        const medicineId = uuidv4();
        const qrCode = `MEDTRACE::${medicineId}`;
        const record = {
          ...item,
          medicineId,
          qrCode,
          isActive: true,
        };
        record.packagingFingerprint = buildPackagingFingerprint({
          imageName: record.packagingImageName,
          medicineName: record.name,
          batchNumber: record.batchNumber,
        });
        record.blockchainHash = buildBlockchainHash(record);
        addBlock({
          medicineId,
          batchNumber: item.batchNumber,
          action: "MANUFACTURED",
        });
        return record;
      });
      await Medicine.insertMany(medicines);
      dbState.seededMedicineIds = medicines.map((m) => m.medicineId);
      console.log("Seeded medicineIds:", medicines.map((m) => m.medicineId).join(", "));
    }

    const scanLogCount = await ScanLog.countDocuments();
    if (scanLogCount === 0) {
      const medicines = await Medicine.find().limit(2);
      if (medicines.length > 0) {
        await ScanLog.insertMany([
          {
            medicineId: medicines[0].medicineId,
            ipAddress: "203.0.113.1",
            city: "Mumbai",
            scanResult: "genuine",
            proofsPassed: 3,
          },
          {
            medicineId: medicines[0].medicineId,
            ipAddress: "203.0.113.2",
            city: "Bengaluru",
            scanResult: "suspicious",
            proofsPassed: 3,
          },
          {
            medicineId: medicines[1] ? medicines[1].medicineId : medicines[0].medicineId,
            ipAddress: "::1",
            city: "Delhi",
            scanResult: "genuine",
            proofsPassed: 3,
          },
        ]);
      }
    }
    return;
  }

  if (dbState.mock.manufacturers.length === 0) {
    dbState.mock.manufacturers = seedManufacturers.map((m) => ({
      _id: uuidv4(),
      ...m,
    }));
  }
  if (dbState.mock.medicines.length === 0) {
    dbState.mock.medicines = seedMedicinesBase.map((item) => {
      const medicineId = uuidv4();
      const qrCode = `MEDTRACE::${medicineId}`;
      const record = {
        _id: uuidv4(),
        ...item,
        medicineId,
        qrCode,
        isActive: true,
        createdAt: new Date(),
      };
      record.packagingFingerprint = buildPackagingFingerprint({
        imageName: record.packagingImageName,
        medicineName: record.name,
        batchNumber: record.batchNumber,
      });
      record.blockchainHash = buildBlockchainHash(record);
      addBlock({
        medicineId,
        batchNumber: item.batchNumber,
        action: "MANUFACTURED",
      });
      return record;
    });
    console.log(
      "Seeded medicineIds:",
      dbState.mock.medicines.map((m) => m.medicineId).join(", ")
    );
    dbState.seededMedicineIds = dbState.mock.medicines.map((m) => m.medicineId);
  }
  if (dbState.mock.scanLogs.length === 0) {
    const first = dbState.mock.medicines[0];
    const second = dbState.mock.medicines[1];
    dbState.mock.scanLogs = [
      {
        _id: uuidv4(),
        medicineId: first.medicineId,
        scanTimestamp: new Date(),
        ipAddress: "203.0.113.1",
        city: "Mumbai",
        scanResult: "genuine",
        proofsPassed: 3,
      },
      {
        _id: uuidv4(),
        medicineId: first.medicineId,
        scanTimestamp: new Date(),
        ipAddress: "203.0.113.2",
        city: "Bengaluru",
        scanResult: "suspicious",
        proofsPassed: 3,
      },
      {
        _id: uuidv4(),
        medicineId: second.medicineId,
        scanTimestamp: new Date(),
        ipAddress: "::1",
        city: "Delhi",
        scanResult: "genuine",
        proofsPassed: 3,
      },
    ];
  }
}

async function connectAndStart() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    dbState.isMongoConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    dbState.isMongoConnected = false;
    console.warn("MongoDB not connected. Falling back to in-memory mode.");
  }

  await seedInitialData();
  app.use("/api/manufacturer", manufacturerRoutes);
  app.use("/api/medicine", medicineRoutes);
  app.use("/api", scanRoutes);

  app.get("/api/health", (req, res) => {
    console.log("Health check OK");
    res.json({ success: true, message: "MedTrace backend running" });
  });

  app.get("/api/stats", async (req, res, next) => {
    try {
      if (dbState.isMongoConnected) {
        const medicines = await Medicine.countDocuments();
        const manufacturers = await Manufacturer.countDocuments();
        const counterfeits = await ScanLog.countDocuments({ scanResult: "counterfeit" });
        return res.json({ success: true, data: { medicines, manufacturers, counterfeits } });
      }
      return res.json({
        success: true,
        data: {
          medicines: dbState.mock.medicines.length,
          manufacturers: dbState.mock.manufacturers.length,
          counterfeits: dbState.mock.scanLogs.filter((s) => s.scanResult === "counterfeit").length,
        },
      });
    } catch (err) {
      return next(err);
    }
  });

  app.get("/api/demo/seeded-ids", async (req, res, next) => {
    try {
      if (dbState.seededMedicineIds.length > 0) {
        return res.json({ success: true, data: dbState.seededMedicineIds });
      }
      if (dbState.isMongoConnected) {
        const meds = await Medicine.find().sort({ createdAt: 1 }).limit(5);
        return res.json({ success: true, data: meds.map((m) => m.medicineId) });
      }
      return res.json({
        success: true,
        data: dbState.mock.medicines.map((m) => m.medicineId).slice(0, 5),
      });
    } catch (err) {
      return next(err);
    }
  });

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`MedTrace backend running on port ${PORT} in ${NODE_ENV}`);
  });
}

connectAndStart();
