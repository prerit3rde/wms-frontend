import { useEffect, useState } from "react";
import Button from "../../components/global/Button";
import Table from "../../components/global/Table";
import axios from "../../services/axios";

const reportTypes = [
  { label: "Bank Solvancy Reports", value: "BANK_SOLVANCY" },
  { label: "TDS Reports", value: "TDS" },
  { label: "EMI Reports", value: "EMI" },
  { label: "20% Deduction Reports", value: "DEDUCTION_20" },
];

export default function Reports() {
  const [reportType, setReportType] = useState("");
  const [financialYear, setFinancialYear] = useState("");

  const [financialYears, setFinancialYears] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(false);

  /* ================= FETCH FINANCIAL YEARS ================= */
  const fetchFinancialYears = async () => {
    try {
      const res = await axios.get("/reports/financial-years");
      setFinancialYears(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FETCH SAVED REPORTS ================= */
  const fetchReports = async () => {
    try {
      const res = await axios.get("/reports");
      setReports(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= PREVIEW REPORT ================= */
  const handlePreview = async () => {
    if (!reportType || !financialYear) {
      alert("Please select both fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get("/reports/preview", {
        params: { reportType, financialYear },
      });

      setPreviewData(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= GENERATE REPORT ================= */
  const handleGenerate = async () => {
    if (!previewData.length) {
      alert("No data to generate");
      return;
    }

    try {
      setLoading(true);

      await axios.post("/reports/generate", {
        reportType,
        financialYear,
      });

      alert("Report Generated Successfully");

      fetchReports(); // refresh list
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DOWNLOAD ================= */
  const handleDownload = (filePath) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    window.open(`${baseURL}/${filePath}`, "_blank");
  };

  useEffect(() => {
    fetchFinancialYears();
    fetchReports();
  }, []);

  /* ================= TABLE COLUMNS ================= */

  const previewColumns = [
    { label: "Sr No", key: "id" },
    { label: "District", key: "district_name" },
    { label: "Branch", key: "branch_name" },
    { label: "Warehouse", key: "warehouse_name" },
    { label: "Bill Amount", key: "bill_amount" },
    { label: "TDS", key: "tds" },
    { label: "EMI", key: "emi_amount" },
    { label: "Bank Solvancy", key: "bank_solvancy" },
  ];

  const reportColumns = [
    { label: "ID", key: "id" },
    { label: "Report Type", key: "report_type" },
    { label: "Financial Year", key: "financial_year" },
    {
      label: "Created At",
      key: "created_at",
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      label: "Download",
      key: "download",
      render: (_, row) => (
        <Button onClick={() => handleDownload(row.file_path)}>Download</Button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ================= FILTER SECTION ================= */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4 items-end">
        {/* Report Type */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Report Type</label>
          <select
            className="border rounded-lg px-3 py-2"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="">Select</option>
            {reportTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Financial Year */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Financial Year</label>
          <select
            className="border rounded-lg px-3 py-2"
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
          >
            <option value="">Select</option>
            {financialYears.map((fy, index) => (
              <option key={index} value={fy.financial_year}>
                {fy.financial_year}
              </option>
            ))}
          </select>
        </div>

        {/* Preview Button */}
        <Button onClick={handlePreview} disabled={loading}>
          Generate Report
        </Button>

        {/* Generate Button */}
        {previewData.length > 0 && (
          <Button variant="success" onClick={handleGenerate} disabled={loading}>
            Generate & Save
          </Button>
        )}
      </div>

      {/* ================= PREVIEW TABLE ================= */}
      {previewData.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Preview Report Data</h2>

          <Table columns={previewColumns} data={previewData} />
        </div>
      )}

      {/* ================= GENERATED REPORTS ================= */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Generated Reports</h2>

        <Table columns={reportColumns} data={reports} />
      </div>
    </div>
  );
}
