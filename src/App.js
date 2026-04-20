import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Savings from "./pages/Savings";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <div className="min-h-screen text-slate-700">
        <Navbar />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddTransaction />} />
            <Route path="/history" element={<History />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/savings" element={<Savings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
