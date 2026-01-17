"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Download,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  Users,
  Save,
  Copy,
  Check,
  LogOut,
} from "lucide-react";

interface Partner {
  id: number;
  name: string;
  contribution: number;
}

interface PartnerAllocation {
  name: string;
  contribution: number;
  ownership: number;
  allocation: number;
  balance: number;
}

interface Period {
  id: number;
  date: string;
  totalValue: number;
  totalContributions: number;
  managementFee: number;
  netValue: number;
  profitLoss: number;
  notes: string;
  partners: PartnerAllocation[];
}

interface CurrentPeriod {
  date: string;
  totalValue: number | string;
  notes: string;
}

const defaultPartners: Partner[] = [
  { id: 1, name: "George Bierwirth", contribution: 0 },
  { id: 2, name: "Desmond Leahy", contribution: 0 },
  { id: 3, name: "Byron Smith", contribution: 0 },
  { id: 4, name: "Richard Starick", contribution: 0 },
  { id: 5, name: "James Warner", contribution: 0 },
];

interface PartnershipTrackerProps {
  loggedInPartner: string;
  onLogout: () => void;
}

const PartnershipTracker: React.FC<PartnershipTrackerProps> = ({
  loggedInPartner,
  onLogout,
}) => {
  const [partners, setPartners] = useState<Partner[]>(defaultPartners);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [copyStatus, setCopyStatus] = useState<boolean>(false);
  const [showCSV, setShowCSV] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [currentPeriod, setCurrentPeriod] = useState<CurrentPeriod>({
    date: new Date().toISOString().split("T")[0],
    totalValue: "",
    notes: "",
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-save when partners or periods change (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      saveData();
    }
  }, [partners, periods, isLoaded]);

  const loadData = () => {
    try {
      const savedPartners = localStorage.getItem("cbc-partners");
      const savedPeriods = localStorage.getItem("cbc-periods");

      if (savedPartners) {
        setPartners(JSON.parse(savedPartners));
      }
      if (savedPeriods) {
        setPeriods(JSON.parse(savedPeriods));
      }
      setSaveStatus("Data loaded");
      setTimeout(() => setSaveStatus(""), 2000);
      setIsLoaded(true);
    } catch (error) {
      console.log("No saved data found or error loading:", error);
      setIsLoaded(true);
    }
  };

  const saveData = () => {
    try {
      localStorage.setItem("cbc-partners", JSON.stringify(partners));
      localStorage.setItem("cbc-periods", JSON.stringify(periods));
      setSaveStatus("Saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (error) {
      console.error("Error saving data:", error);
      setSaveStatus("Save failed");
    }
  };

  const managementFeeRate = 0.02; // 2% annual

  const totalContributions = partners.reduce(
    (sum, p) => sum + Number(p.contribution || 0),
    0,
  );

  const calculateOwnership = (contribution: number): number => {
    if (totalContributions === 0) return 0;
    return (Number(contribution) / totalContributions) * 100;
  };

  const updatePartner = (
    id: number,
    field: keyof Partner,
    value: string | number,
  ) => {
    setPartners(
      partners.map((p) =>
        p.id === id
          ? { ...p, [field]: field === "contribution" ? Number(value) : value }
          : p,
      ),
    );
  };

  const addPeriod = () => {
    const totalValue = Number(currentPeriod.totalValue);
    if (totalValue === 0 || totalContributions === 0) {
      alert("Please enter partner contributions and total account value");
      return;
    }

    const managementFee = (totalValue * managementFeeRate) / 12; // Monthly
    const netValue = totalValue - managementFee;
    const profitLoss = netValue - totalContributions;

    const partnerAllocations: PartnerAllocation[] = partners.map((p) => {
      const ownership = calculateOwnership(p.contribution);
      const allocation = (profitLoss * ownership) / 100;
      const balance = Number(p.contribution) + allocation;

      return {
        name: p.name,
        contribution: Number(p.contribution),
        ownership: ownership,
        allocation: allocation,
        balance: balance,
      };
    });

    const newPeriod: Period = {
      id: Date.now(),
      date: currentPeriod.date,
      totalValue: totalValue,
      totalContributions: totalContributions,
      managementFee: managementFee,
      netValue: netValue,
      profitLoss: profitLoss,
      notes: currentPeriod.notes,
      partners: partnerAllocations,
    };

    setPeriods([...periods, newPeriod]);
    setCurrentPeriod({
      date: new Date().toISOString().split("T")[0],
      totalValue: "",
      notes: "",
    });
  };

  const deletePeriod = (id: number) => {
    setPeriods(periods.filter((p) => p.id !== id));
  };

  const generateCSVText = (): string => {
    let csv =
      "Period,Date,Total Account Value,Total Contributions,Management Fee,Net Value,Profit/Loss,Notes\n";

    periods.forEach((period, idx) => {
      csv += `${idx + 1},${period.date},${period.totalValue.toFixed(2)},${period.totalContributions.toFixed(2)},${period.managementFee.toFixed(2)},${period.netValue.toFixed(2)},${period.profitLoss.toFixed(2)},"${period.notes}"\n`;
    });

    csv += "\n\nPartner Allocations by Period\n";
    csv +=
      "Period,Date,Partner,Contribution,Ownership %,P&L Allocation,Account Balance\n";

    periods.forEach((period, idx) => {
      period.partners.forEach((p) => {
        csv += `${idx + 1},${period.date},${p.name},${p.contribution.toFixed(2)},${p.ownership.toFixed(2)}%,${p.allocation.toFixed(2)},${p.balance.toFixed(2)}\n`;
      });
    });

    return csv;
  };

  const exportToCSV = () => {
    const csv = generateCSVText();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `covered-bridge-capital-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    const csv = generateCSVText();
    try {
      await navigator.clipboard.writeText(csv);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setShowCSV(true);
    }
  };

  const latestPeriod = periods[periods.length - 1];

  const formatCurrency = (value: number): string => {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b-2 border-black pb-4">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 border-2 border-black flex items-center justify-center bg-white relative overflow-hidden">
                <Image
                  src="/cbc_logo.png"
                  alt="CBC Logo"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-black mb-2">
                  Covered Bridge Capital
                </h1>
                <p className="text-gray-600">
                  Partnership Tracking & P&L Calculator
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Logged in as</p>
                <p className="font-semibold text-black">
                  Welcome, {loggedInPartner}!
                </p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 border-2 border-black text-black px-4 py-2 font-medium transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                Logout
              </button>
              {saveStatus && (
                <div className="flex items-center gap-2 bg-gray-100 border-2 border-black text-black px-4 py-2">
                  <Save size={16} />
                  <span className="text-sm font-medium">{saveStatus}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border-2 border-black p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">
                Total Capital
              </span>
              <DollarSign className="text-black" size={20} />
            </div>
            <div className="text-2xl font-bold text-black">
              ${formatCurrency(totalContributions)}
            </div>
          </div>

          <div className="bg-white border-2 border-black p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">
                Active Partners
              </span>
              <Users className="text-black" size={20} />
            </div>
            <div className="text-2xl font-bold text-black">
              {partners.filter((p) => p.contribution > 0).length}
            </div>
          </div>

          <div className="bg-white border-2 border-black p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">
                Total P&L
              </span>
              <TrendingUp className="text-black" size={20} />
            </div>
            <div
              className={`text-2xl font-bold ${latestPeriod && latestPeriod.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {latestPeriod
                ? `${latestPeriod.profitLoss >= 0 ? "+" : "-"}$${formatCurrency(Math.abs(latestPeriod.profitLoss))}`
                : "$0.00"}
            </div>
          </div>
        </div>

        {/* Partner Contributions */}
        <div className="bg-white border-2 border-black p-6 mb-8">
          <h2 className="text-xl font-bold text-black mb-4">
            Partner Contributions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-3 px-4 text-black font-bold">
                    Partner
                  </th>
                  <th className="text-left py-3 px-4 text-black font-bold">
                    Capital Contribution
                  </th>
                  <th className="text-left py-3 px-4 text-black font-bold">
                    Ownership %
                  </th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner, idx) => (
                  <tr
                    key={partner.id}
                    className={
                      idx < partners.length - 1
                        ? "border-b border-gray-300"
                        : ""
                    }
                  >
                    <td className="py-3 px-4 text-black font-medium">
                      {partner.name}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">$</span>
                        <input
                          type="number"
                          value={partner.contribution || ""}
                          onChange={(e) =>
                            updatePartner(
                              partner.id,
                              "contribution",
                              e.target.value,
                            )
                          }
                          className="bg-white text-black px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-gray-400 w-32"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-black font-bold">
                      {calculateOwnership(partner.contribution).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Record New Period */}
        <div className="bg-white border-2 border-black p-6 mb-8">
          <h2 className="text-xl font-bold text-black mb-4">
            Record New Period (Monthly/Quarterly)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-black text-sm font-bold mb-2">
                Date
              </label>
              <input
                type="date"
                value={currentPeriod.date}
                onChange={(e) =>
                  setCurrentPeriod({ ...currentPeriod, date: e.target.value })
                }
                className="bg-white text-black px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-gray-400 w-full"
              />
            </div>
            <div>
              <label className="block text-black text-sm font-bold mb-2">
                Total Account Value
              </label>
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">$</span>
                <input
                  type="number"
                  value={currentPeriod.totalValue}
                  onChange={(e) =>
                    setCurrentPeriod({
                      ...currentPeriod,
                      totalValue: e.target.value,
                    })
                  }
                  className="bg-white text-black px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-gray-400 flex-1"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <label className="block text-black text-sm font-bold mb-2">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={currentPeriod.notes}
                onChange={(e) =>
                  setCurrentPeriod({ ...currentPeriod, notes: e.target.value })
                }
                className="bg-white text-black px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-gray-400 w-full"
                placeholder="Market conditions, notable trades..."
              />
            </div>
          </div>
          <button
            onClick={addPeriod}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 font-bold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} />
            Record Period
          </button>
        </div>

        {/* Historical Periods */}
        {periods.length > 0 && (
          <div className="bg-white border-2 border-black p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <h2 className="text-xl font-bold text-black">
                Historical Performance
              </h2>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowCSV(!showCSV)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 font-bold transition-colors text-sm cursor-pointer"
                >
                  {showCSV ? "Hide" : "Show"} CSV Data
                </button>
                <button
                  onClick={copyToClipboard}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 font-bold transition-colors flex items-center gap-2 text-sm cursor-pointer"
                >
                  {copyStatus ? <Check size={16} /> : <Copy size={16} />}
                  {copyStatus ? "Copied!" : "Copy CSV"}
                </button>
                <button
                  onClick={exportToCSV}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 font-bold transition-colors flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Download size={16} />
                  Download CSV
                </button>
              </div>
            </div>

            {showCSV && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Select all the text below (Ctrl+A / Cmd+A), copy it (Ctrl+C /
                  Cmd+C), then paste into Excel or Google Sheets:
                </p>
                <textarea
                  readOnly
                  value={generateCSVText()}
                  className="w-full h-64 p-3 border-2 border-black font-mono text-xs bg-gray-50"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
              </div>
            )}

            {periods.map((period, idx) => (
              <div
                key={period.id}
                className="mb-6 pb-6 border-b-2 border-black last:border-b-0 last:mb-0 last:pb-0"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-black mb-1">
                      Period {idx + 1} -{" "}
                      {new Date(period.date).toLocaleDateString()}
                    </h3>
                    {period.notes && (
                      <p className="text-gray-600 text-sm">{period.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deletePeriod(period.id)}
                    className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <div className="text-gray-600 text-sm font-medium mb-1">
                      Account Value
                    </div>
                    <div className="text-black font-bold">
                      ${formatCurrency(period.totalValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm font-medium mb-1">
                      Management Fee
                    </div>
                    <div className="text-black font-bold">
                      -${formatCurrency(period.managementFee)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm font-medium mb-1">
                      Net Value
                    </div>
                    <div className="text-black font-bold">
                      ${formatCurrency(period.netValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm font-medium mb-1">
                      Total P&L
                    </div>
                    <div
                      className={`font-bold ${period.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {period.profitLoss >= 0 ? "+" : "-"}$
                      {formatCurrency(Math.abs(period.profitLoss))}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm font-medium mb-1">
                      Return %
                    </div>
                    <div
                      className={`font-bold ${period.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {period.profitLoss >= 0 ? "+" : ""}
                      {(
                        (period.profitLoss / period.totalContributions) *
                        100
                      ).toFixed(2)}
                      %
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-black">
                        <th className="text-left py-2 px-3 text-black text-sm font-bold">
                          Partner
                        </th>
                        <th className="text-left py-2 px-3 text-black text-sm font-bold">
                          Ownership
                        </th>
                        <th className="text-left py-2 px-3 text-black text-sm font-bold">
                          P&L Allocation
                        </th>
                        <th className="text-left py-2 px-3 text-black text-sm font-bold">
                          Account Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {period.partners.map((p, i) => (
                        <tr
                          key={i}
                          className={
                            i < period.partners.length - 1
                              ? "border-b border-gray-300"
                              : ""
                          }
                        >
                          <td className="py-2 px-3 text-black text-sm font-medium">
                            {p.name}
                          </td>
                          <td className="py-2 px-3 text-black text-sm">
                            {p.ownership.toFixed(2)}%
                          </td>
                          <td
                            className={`py-2 px-3 text-sm font-bold ${p.allocation >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {p.allocation >= 0 ? "+" : "-"}$
                            {formatCurrency(Math.abs(p.allocation))}
                          </td>
                          <td className="py-2 px-3 text-black text-sm font-bold">
                            ${formatCurrency(p.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnershipTracker;
