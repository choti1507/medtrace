# MedTrace

MedTrace is a full-stack counterfeit medicine detection system for hackathon demos. It verifies medicines with multi-proof checks, fraud behavior analysis, and a blockchain-style event trail.

## Unique Idea

MedTrace adds a **Packaging Fingerprint Check**:
- Manufacturer provides a packaging image URL/name while registering medicine
- Backend generates `packagingFingerprint = SHA-256(imageName + medicineName + batchNumber)`
- During verification, user can optionally enter packaging image/sample name
- System compares generated fingerprint with stored fingerprint as **Proof 4**

This catches copied QR stickers with mismatched physical packaging.

## Tech Stack

- Frontend: React (Vite) + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose (with in-memory fallback when MongoDB is offline)
- QR Scanner: html5-qrcode
- QR Render: qrcode.react
- Blockchain simulation: in-memory hash chain persisted to JSON
- Process runner: concurrently

## How Hash & Blockchain Work in MedTrace

**Hash**: A Hash is a digital fingerprint of medicine data. Even a tiny change to the medicine details changes the entire hash completely.
**Blockchain**: The Blockchain is a chain of scan and manufacture records where each block securely stores the `previousHash`. If someone tries to tamper with an old record, the next block's hash check will fail, breaking the chain. Scanning adds a new `SCANNED` block but does not alter the original manufacturer hash.

## Installation

```bash
# root
npm install

# backend
cd backend
npm install
cd ..

# frontend
cd frontend
npm install
cd ..
```

## Run

Start MongoDB (optional, app still works with fallback mode):

```bash
mongod --dbpath "C:\data\db"
```

Start both frontend and backend:

```bash
npm start
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Judge Demo Flow (2 minutes)

1. Open home page and show premium hero + "Why MedTrace is different".
2. Click **Demo Mode** or copy a seeded ID and open Scanner.
3. Verify once with city `Delhi`, then again with same ID in city `Mumbai` to trigger cloned QR alert.
4. Show Result page sections:
   - Verdict (Genuine/Suspicious/Counterfeit)
   - Trust Score
   - 4 Proofs
   - Fraud Alerts + Verification Alerts
   - Blockchain Trail + Medicine Details
5. Open Manufacturer Portal and register a medicine with packaging sample name.
6. Re-verify with wrong packaging sample to show packaging mismatch detection.
7. Open Blockchain Explorer and show chain validity + new scan blocks.

## Seeded IDs

Get seeded IDs directly from API:

```bash
curl http://localhost:5000/api/demo/seeded-ids
```

Or use:
- `GET /api/demo/seeded-ids`

## API quick list

- `GET /api/stats`
- `GET /api/medicine/all`
- `GET /api/demo/seeded-ids`
- `POST /api/manufacturer/register`
- `GET /api/manufacturer/all`
- `POST /api/medicine/register`
- `GET /api/medicine/verify/:medicineId?city=Mumbai&packagingImageName=pack.png`
- `GET /api/blockchain/chain`
- `GET /api/blockchain/medicine/:medicineId`
- `GET /api/scan/logs`

## Notes

- No API key required.
- Backward compatibility exists for older data using `cdscaLicenseNumber`.
