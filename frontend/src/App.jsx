import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Scanner from "./pages/Scanner";
import Result from "./pages/Result";
import ManufacturerPortal from "./pages/ManufacturerPortal";
import BlockchainExplorer from "./pages/BlockchainExplorer";

function App() {
  return (
    <div className="min-h-screen bg-dark-700">
      <Toaster
        position="top-right"
        toastOptions={{
          className: "toast-custom",
          duration: 3000,
        }}
      />
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/result" element={<Result />} />
          <Route path="/manufacturer" element={<ManufacturerPortal />} />
          <Route path="/blockchain" element={<BlockchainExplorer />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
