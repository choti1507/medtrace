const mongoose = require("mongoose");

const manufacturerSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    cdscoLicenseNumber: {
      type: String,
      required: true,
      trim: true
    },
    // Backward-compatible field for older data snapshots.
    cdscaLicenseNumber: { type: String, trim: true },
    licenseType: { type: String, required: true, trim: true },
    licenseExpiry: { type: Date, required: true },
    approvedDrugTypes: [{ type: String, required: true }],
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Manufacturer || mongoose.model("Manufacturer", manufacturerSchema);
