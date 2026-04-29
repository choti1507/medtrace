const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    medicineId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    manufacturer: { type: String, required: true, trim: true },
    batchNumber: { type: String, required: true, trim: true },
    manufactureDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    cdscoLicenseNumber: {
      type: String,
      required: true,
      trim: true,
      match: /^CDL\/[A-Z]{2}\/\d{4}\/\d{4}$/,
    },
    // Backward-compatible field for older data snapshots.
    cdscaLicenseNumber: { type: String, trim: true },
    drugType: { type: String, required: true, trim: true },
    composition: { type: String, required: true, trim: true },
    packagingImageName: { type: String, default: "", trim: true },
    packagingFingerprint: { type: String, default: "", trim: true },
    qrCode: { type: String, required: true, trim: true },
    blockchainHash: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Medicine || mongoose.model("Medicine", medicineSchema);
