import { useEffect, useState } from "react";
import Button from "../../components/global/Button";
import Table from "../../components/global/Table";
import axios from "../../services/axios";
import toast from "react-hot-toast";
import { Download, Trash2 } from "lucide-react";

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

  const [month, setMonth] = useState("");

  const [cropYear, setCropYear] = useState("");
  const [cropYears, setCropYears] = useState([]);

  const [previewData, setPreviewData] = useState([]);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(false);

  const [noDataMessage, setNoDataMessage] = useState("");

  const fetchCropYears = async () => {
    const res = await axios.get("/warehouses");
    const years = res.data.data.flatMap(
      (w) => w.cropData?.map((c) => c.crop_year) || [],
    );

    setCropYears([...new Set(years)]);
  };

  useEffect(() => {
    fetchFinancialYears();
    fetchReports();
    fetchCropYears(); // 🔥 ADD THIS
  }, []);

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
        params: { reportType, financialYear, month, cropYear },
      });

      const data = res.data.data || [];

      if (data.length === 0) {
        setPreviewData([]);
        setNoDataMessage(
          `No data found for ${getReportLabel(reportType)} for financial year ${financialYear} of month ${month}`,
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

      const res = await axios.post("/reports/generate", {
        reportType,
        financialYear,
        month,
        cropYear,
      });

      // 🔥 AUTO DOWNLOAD
      await handleDownload(res.data.file_path);

      toast.success("Report Generated & Downloaded");

      // refresh
      fetchReports();

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
      label: "Generated Date",
      key: "created_at",
      render: (value) => {
        if (!value) return "";

        const d = new Date(value);

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        return `${day}-${month}-${year}`; // ✅ NO TIME
      },
    },
    // {
    //   label: "Download",
    //   key: "download",
    //   render: (_, row) => (
    //     <Button onClick={() => handleDownload(row.file_path)}>Download</Button>
    //   ),
    // },
    // {
    //   label: "Delete",
    //   key: "delete",
    //   render: (_, row) => (
    //     <Button
    //       variant="danger"
    //       onClick={async () => {
    //         if (!window.confirm("Delete this report?")) return;

    //         await axios.delete(`/reports/${row.id}`);
    //         toast.success("Report deleted");
    //         fetchReports();
    //       }}
    //     >
    //       Delete
    //     </Button>
    //   ),
    // },
    {
      label: "Actions",
      key: "actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {/* DOWNLOAD */}
          <button
            onClick={() => handleDownload(row.file_path)}
            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition cursor-pointer"
            title="Download"
          >
            <Download size={16} />
          </button>

          {/* DELETE */}
          <button
            onClick={async () => {
              if (!window.confirm("Delete this report?")) return;

              await axios.delete(`/reports/${row.id}`);
              toast.success("Report deleted");
              fetchReports();
            }}
            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition cursor-pointer"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const deductionStartIndex = previewColumns.findIndex(
    (c) => c.key === "emi_amount",
  );
  const deductionEndIndex = previewColumns.findIndex(
    (c) => c.key === "other_deductions_reason",
  );

  const groupHeader =
    reportType === "TDS"
      ? [
          { label: "", colSpan: deductionStartIndex },
          {
            label: "Deductions",
            colSpan: deductionEndIndex - deductionStartIndex + 1,
          },
          {
            label: "",
            colSpan: previewColumns.length - deductionEndIndex - 1,
          },
        ]
      : null;

  return (
    <div className="">
      {/* ================= FILTER SECTION ================= */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Reports Management
      </h1>
      <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4 items-end mb-6 p-6 p-6 space-y-4">
        {/* Report Type */}
        <div className="flex flex-col w-[25%] m-0">
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
        <div className="flex flex-col w-[25%] m-0">
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

        {/* Month */}
        <div className="flex flex-col w-[25%] m-0">
          <FormField label="Month">
            <select
              className="border rounded-lg px-3 py-2 cursor-pointer"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">Select</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Crop Year */}
        <div className="flex flex-col w-[25%] m-0">
          <FormField label="Crop Year">
            <select
              className="border rounded-lg px-3 py-2 cursor-pointer"
              value={cropYear}
              onChange={(e) => setCropYear(e.target.value)}
            >
              <option value="">Select</option>
              {cropYears.map((y) => (
                <option key={y} value={y}>
                  {y}
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
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    {/* ✅ DEDUCTION HEADER (MATCH STYLE) */}
                    {reportType === "TDS" && (
                      <tr>
                        {/* BEFORE */}
                        <th colSpan={deductionStartIndex}></th>

                        {/* ONLY DEDUCTION HAS BACKGROUND */}
                        <th
                          colSpan={deductionEndIndex - deductionStartIndex + 1}
                          className="bg-gray-200 text-center text-sm font-semibold text-gray-700 border-b border-gray-300 px-6 py-3"
                        >
                          Other Deductions
                        </th>

                        {/* AFTER */}
                        <th
                          colSpan={
                            previewColumns.length - deductionEndIndex - 1
                          }
                        ></th>
                      </tr>
                    )}

                    {/* ✅ NORMAL HEADER (EXACT SAME AS GLOBAL) */}
                    <tr className="bg-gray-100 border-b border-gray-300">
                      {previewColumns.map((col) => (
                        <th
                          key={col.key}
                          className="px-6 py-3 text-left text-sm font-semibold text-gray-700"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {previewData.length > 0 ? (
                      previewData.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          {previewColumns.map((column) => (
                            <td
                              key={column.key}
                              className="px-6 py-4 text-sm text-gray-700"
                            >
                              {column.render
                                ? column.render(row[column.key], row)
                                : row[column.key]}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={previewColumns.length}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

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
