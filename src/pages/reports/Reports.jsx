import { useEffect, useState } from "react";
import Button from "../../components/global/Button";
import Table from "../../components/global/Table";
import axios from "../../services/axios";
import toast from "react-hot-toast";

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

  const [noDataMessage, setNoDataMessage] = useState("");

  const getReportLabel = (value) => {
    const found = reportTypes.find((r) => r.value === value);
    return found ? found.label : value;
  };

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
      toast("Please select both fields", {
        icon: "⚠️",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get("/reports/preview", {
        params: { reportType, financialYear },
      });

      const data = res.data.data || [];

      if (data.length === 0) {
        setPreviewData([]);
        setNoDataMessage(
          `No data found for ${getReportLabel(reportType)} for financial year ${financialYear}`,
        );
      } else {
        setPreviewData(data);
        setNoDataMessage("");
      }
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

      toast.success("Report Generated Successfully");

      fetchReports(); // refresh list

      // ✅ CLEAR PREVIEW (IMPORTANT)
      setPreviewData([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DOWNLOAD ================= */
  const handleDownload = async (filePath) => {
    try {
      const baseURL = import.meta.env.VITE_API_URL; // ✅ correct env

      const response = await axios.get(`/reports/download`, {
        params: { file: filePath },
        responseType: "blob", // 🔥 VERY IMPORTANT
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filePath.split("/").pop();
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  useEffect(() => {
    fetchFinancialYears();
    fetchReports();
  }, []);

  /* ================= TABLE COLUMNS ================= */

  const previewColumns = [
    {
      label: "Sr No",
      key: "id",
      render: (value, row) => {
        if (row.isNoData) {
          return (
            <div className="text-red-500 font-medium w-[1200px]">
              {row.message}
            </div>
          );
        }
        return value;
      },
    },
    {
      label: "Bill Type",
      key: "bill_type",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "District",
      key: "district_name",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Branch",
      key: "branch_name",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Warehouse",
      key: "warehouse_name",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Warehouse No",
      key: "warehouse_no",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "PAN Holder",
      key: "pan_card_holder",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "PAN Number",
      key: "pan_card_number",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Depositer",
      key: "depositers_name",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Commodity",
      key: "commodity",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Period",
      key: "period",
      render: (_, row) =>
        row.isNoData ? null : `${row.from_date || ""} to ${row.to_date || ""}`,
    },
    {
      label: "Bill Amount",
      key: "bill_amount",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Actual Passed",
      key: "actual_passed_amount",
      render: (v, r) => (r.isNoData ? null : v),
    },
    { label: "TDS", key: "tds", render: (v, r) => (r.isNoData ? null : v) },
    {
      label: "EMI",
      key: "emi_amount",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "20% Deduction",
      key: "deduction_20_percent",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Penalty",
      key: "penalty",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Medicine",
      key: "medicine",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "EMI FDR Interest",
      key: "emi_fdr_interest",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Gain Shortage",
      key: "gain_shortage_deduction",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Stock Shortage",
      key: "stock_shortage_deduction",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Bank Solvancy",
      key: "bank_solvancy",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Insurance",
      key: "insurance",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Other Deduction",
      key: "other_deduction_amount",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Other Deduction Reason",
      key: "other_deductions_reason",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Pay to JVS",
      key: "pay_to_jvs_amount",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Payment By",
      key: "payment_by",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Payment Date",
      key: "payment_date",
      render: (v, r) => (r.isNoData ? null : v),
    },
    { label: "QTR", key: "qtr", render: (v, r) => (r.isNoData ? null : v) },
    {
      label: "Remarks",
      key: "remarks",
      render: (v, r) => (r.isNoData ? null : v),
    },
  ];

  const reportColumns = [
    // { label: "ID", key: "id" },
    {
      label: "Report Type",
      key: "report_type",
      render: (value) => getReportLabel(value),
    },
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
    <div className="">
      {/* ================= FILTER SECTION ================= */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Reports Management
      </h1>
      <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4 items-end mb-6 p-6 p-6 space-y-4">
        {/* Report Type */}
        <div className="flex flex-col w-[35%] m-0">
          <FormField label="Report Type">
            <select
              className="border rounded-lg px-3 py-2 cursor-pointer"
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
          </FormField>
        </div>

        {/* Financial Year */}
        <div className="flex flex-col w-[35%] m-0">
          <FormField label="Financial Year">
            <select
              className="border rounded-lg px-3 py-2 cursor-pointer"
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
          </FormField>
        </div>

        {/* Preview Button */}
        <Button onClick={handlePreview} disabled={loading}>
          Generate Report
        </Button>
      </div>

      {/* ================= PREVIEW TABLE ================= */}
      {(previewData.length > 0 || noDataMessage) && (
        <div className="bg-white p-4 rounded-xl shadow p-6 max-w-[1217px] overflow-x-auto overflow-y-hidden whitespace-nowrap w-full mb-6">
          <h2 className="text-xl font-semibold mb-4">Preview Report Data</h2>

          {/* ✅ SHOW MESSAGE */}
          {noDataMessage && (
            <div className="text-red-500 font-medium">{noDataMessage}</div>
          )}

          {/* ✅ SHOW TABLE */}
          {previewData.length > 0 && (
            <>
              <Table columns={previewColumns} data={previewData} />

              <Button
                variant="success"
                onClick={handleGenerate}
                disabled={loading}
                className="mt-5"
              >
                Generate & Save
              </Button>
            </>
          )}
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

const FormField = ({ label, children, error }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-2 text-gray-700">{label}</label>
    {children}
    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
  </div>
);
