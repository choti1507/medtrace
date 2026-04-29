import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import api from "../utils/api";
import { toastSuccess, toastError } from "../utils/toast";

const drugTypes = ["Tablet", "Capsule", "Syrup", "Injection", "Ayurvedic"];

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20";

function ManufacturerPortal() {
  const [tab, setTab] = useState("manufacturer");
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [qrValue, setQrValue] = useState("");

  const [manufacturerForm, setManufacturerForm] = useState({
    companyName: "",
    cdscoLicenseNumber: "",
    licenseType: "Allopathic",
    licenseExpiry: "",
    approvedDrugTypes: [],
  });

  const [medicineForm, setMedicineForm] = useState({
    name: "",
    manufacturer: "",
    batchNumber: "",
    manufactureDate: "",
    expiryDate: "",
    drugType: "Tablet",
    composition: "",
    packagingImageName: "",
  });

  const loadManufacturers = () => {
    api
      .get("/api/manufacturer/all")
      .then((res) => setManufacturers(res.data?.data || []))
      .catch(() => setManufacturers([]));
  };

  useEffect(() => {
    loadManufacturers();
  }, []);

  const handleManufacturerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await api.post("/api/manufacturer/register", manufacturerForm);
      setMessage(`Registered: ${response.data.data.companyName} (Verified)`);
      toastSuccess("Manufacturer registered successfully");
      setManufacturerForm({
        companyName: "",
        cdscoLicenseNumber: "",
        licenseType: "Allopathic",
        licenseExpiry: "",
        approvedDrugTypes: [],
      });
      loadManufacturers();
    } catch (err) {
      const errMsg = err.response?.data?.error || "Failed to register manufacturer";
      setMessage(errMsg);
      toastError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setQrValue("");
    try {
      const response = await api.post("/api/medicine/register", medicineForm);
      setQrValue(response.data.data.medicine.medicineId);
      setMessage(`Medicine registered with ID: ${response.data.data.medicine.medicineId}`);
      toastSuccess("Medicine registered successfully");
      setMedicineForm({
        name: "",
        manufacturer: "",
        batchNumber: "",
        manufactureDate: "",
        expiryDate: "",
        drugType: "Tablet",
        composition: "",
        packagingImageName: "",
      });
    } catch (err) {
      const errMsg = err.response?.data?.error || "Failed to register medicine";
      setMessage(errMsg);
      toastError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 max-w-3xl mx-auto"
    >
      <h1 className="text-2xl font-bold text-slate-200">Manufacturer Portal</h1>

      {/* Tab Buttons */}
      <div className="flex gap-2">
        {[
          ["manufacturer", "Register Manufacturer"],
          ["medicine", "Register Medicine"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
              tab === key
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Form Card */}
      <section className="glass-card-strong p-5 sm:p-6">
        {tab === "manufacturer" ? (
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleManufacturerSubmit}>
            <input
              required
              placeholder="Company Name"
              value={manufacturerForm.companyName}
              onChange={(e) => setManufacturerForm({ ...manufacturerForm, companyName: e.target.value })}
              className={inputClass}
            />
            <input
              required
              placeholder="CDSCO License Number"
              value={manufacturerForm.cdscoLicenseNumber}
              onChange={(e) =>
                setManufacturerForm({ ...manufacturerForm, cdscoLicenseNumber: e.target.value.toUpperCase() })
              }
              className={inputClass}
            />
            <select
              value={manufacturerForm.licenseType}
              onChange={(e) => setManufacturerForm({ ...manufacturerForm, licenseType: e.target.value })}
              className={inputClass}
            >
              <option className="bg-dark-400">Allopathic</option>
              <option className="bg-dark-400">Ayurvedic</option>
              <option className="bg-dark-400">Homeopathic</option>
            </select>
            <input
              required
              type="date"
              value={manufacturerForm.licenseExpiry}
              onChange={(e) => setManufacturerForm({ ...manufacturerForm, licenseExpiry: e.target.value })}
              className={inputClass}
            />
            <select
              multiple
              value={manufacturerForm.approvedDrugTypes}
              onChange={(e) =>
                setManufacturerForm({
                  ...manufacturerForm,
                  approvedDrugTypes: Array.from(e.target.selectedOptions, (opt) => opt.value),
                })
              }
              className={`${inputClass} sm:col-span-2 min-h-[100px]`}
            >
              {drugTypes.map((drug) => (
                <option key={drug} value={drug} className="bg-dark-400 py-1">
                  {drug}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white sm:col-span-2 disabled:opacity-50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
            >
              {loading ? "Registering..." : "Register Manufacturer"}
            </button>
          </form>
        ) : (
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleMedicineSubmit}>
            <input
              required
              placeholder="Medicine Name"
              value={medicineForm.name}
              onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
              className={inputClass}
            />
            <select
              required
              value={medicineForm.manufacturer}
              onChange={(e) => setMedicineForm({ ...medicineForm, manufacturer: e.target.value })}
              className={inputClass}
            >
              <option value="" className="bg-dark-400">Select Manufacturer</option>
              {manufacturers.map((m) => (
                <option key={m._id} value={m.companyName} className="bg-dark-400">
                  {m.companyName}
                </option>
              ))}
            </select>
            <input
              required
              placeholder="Batch Number"
              value={medicineForm.batchNumber}
              onChange={(e) => setMedicineForm({ ...medicineForm, batchNumber: e.target.value })}
              className={inputClass}
            />
            <input
              required
              type="date"
              value={medicineForm.manufactureDate}
              onChange={(e) => setMedicineForm({ ...medicineForm, manufactureDate: e.target.value })}
              className={inputClass}
            />
            <input
              required
              type="date"
              value={medicineForm.expiryDate}
              onChange={(e) => setMedicineForm({ ...medicineForm, expiryDate: e.target.value })}
              className={inputClass}
            />
            <select
              value={medicineForm.drugType}
              onChange={(e) => setMedicineForm({ ...medicineForm, drugType: e.target.value })}
              className={inputClass}
            >
              {drugTypes.map((drug) => (
                <option key={drug} className="bg-dark-400">{drug}</option>
              ))}
            </select>
            <input
              required
              placeholder="Composition"
              value={medicineForm.composition}
              onChange={(e) => setMedicineForm({ ...medicineForm, composition: e.target.value })}
              className={`${inputClass} sm:col-span-2`}
            />
            <input
              placeholder="Packaging Image / sample name"
              value={medicineForm.packagingImageName}
              onChange={(e) => setMedicineForm({ ...medicineForm, packagingImageName: e.target.value })}
              className={`${inputClass} sm:col-span-2`}
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white sm:col-span-2 disabled:opacity-50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
            >
              {loading ? "Registering..." : "Register Medicine"}
            </button>
          </form>
        )}

        {message && (
          <p className="mt-4 text-sm text-slate-300 rounded-lg border border-white/5 bg-white/[0.02] p-3">
            {message}
          </p>
        )}

        {qrValue && (
          <div className="mt-4 inline-block rounded-xl border border-white/10 bg-white p-5">
            <p className="mb-2 text-sm font-semibold text-slate-800">Scannable QR Code</p>
            <QRCodeSVG value={qrValue} size={170} />
          </div>
        )}
      </section>
    </motion.div>
  );
}

export default ManufacturerPortal;
