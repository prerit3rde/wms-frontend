import { useEffect, useState, useRef } from "react";
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

  // New filters
  const [warehouseName, setWarehouseName] = useState("");
  const [warehouseNames, setWarehouseNames] = useState([]);
  const [billType, setBillType] = useState("");
  const [billTypes, setBillTypes] = useState([]);
  const [warehouseType, setWarehouseType] = useState("");
  const [warehouseTypes, setWarehouseTypes] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [previewData, setPreviewData] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noDataMessage, setNoDataMessage] = useState("");

  const previewLimit = 50;
  const [previewPage, setPreviewPage] = useState(1);
  const previewTotalPages = Math.ceil(previewData.length / previewLimit);

  const fetchCropYears = async () => {
    const res = await axios.get("/warehouses");
    const years = res.data.data.flatMap(
      (w) => w.cropData?.map((c) => c.crop_year) || [],
    );
    setCropYears([...new Set(years)]);
  };

  useEffect(() => {
    fetchFilterData();
    fetchReports();
  }, []);

  const getReportLabel = (value) => {
    const found = reportTypes.find((r) => r.value === value);
    return found ? found.label : value;
  };

  /* ================= FETCH FILTER DATA ================= */
  const fetchFilterData = async () => {
    try {
      const res = await axios.get("/reports/financial-years");
      setFinancialYears(res.data.data.financialYears || []);
      setCropYears(res.data.data.cropYears || []);

      // Fetch warehouse/bill type filter options from payments
      const filterRes = await axios.get("/payments/filters");
      const filters = filterRes.data.data || {};
      setWarehouseNames(filters.warehouseNames?.map(w => w.warehouse_name).filter(Boolean) || []);
      setBillTypes(filters.billTypes || []);
      setWarehouseTypes(filters.warehouseTypes?.map(t => t.warehouse_type).filter(Boolean) || []);
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
    if (!reportType) {
      toast("Please select a report type", { icon: "⚠️" });
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get("/reports/preview", {
        params: { reportType, financialYear, month, cropYear, warehouseName, billType, warehouseType, fromDate, toDate },
      });

      const data = res.data.data || [];

      if (data.length === 0) {
        setPreviewData([]);
        setNoDataMessage(
          `No data found for ${getReportLabel(reportType)}${financialYear ? " for FY " + financialYear : ""}${month ? " of " + month : ""}`,
        );
      } else {
        setPreviewData(data);
        setPreviewPage(1); // ✅ reset page on new data
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
        warehouseName,
        billType,
        warehouseType,
        fromDate,
        toDate,
      });

      // 🔥 AUTO DOWNLOAD
      await handleDownload(res.data.file_path);

      toast.success("Report Generated & Downloaded");

      fetchReports();
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

  // useEffect(() => {
  //   fetchFinancialYears();
  //   fetchReports();
  // }, []);

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
      label: "Crop Year",
      key: "crop_year",
      render: (v, r) => (r.isNoData ? null : v),
    },
    {
      label: "Period",
      key: "period",
      render: (_, row) => {
        if (row.isNoData) return null;
        if (!row.from_date) return "";
        const d = new Date(row.from_date);
        return d.toLocaleString("en-IN", {
          month: "short",
          year: "2-digit",
        });
      },
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
    {
      label: "Financial Year",
      key: "financial_year",
      render: (v) => v || "---",
    },
    { label: "Month", key: "month", render: (v) => v || "---" },
    { label: "Crop Year", key: "crop_year", render: (v) => v || "---" },
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
        <div className="flex flex-col w-[20%] m-0">
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
        <div className="flex flex-col w-[20%] m-0">
          <FormField label="Financial Year">
            <select
              className="border rounded-lg px-3 py-2 cursor-pointer"
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
            >
              <option value="">Select</option>
              {financialYears.map((fy, index) => (
                <option key={index} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Month */}
        <div className="flex flex-col w-[20%] m-0">
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
        <div className="flex flex-col w-[20%] m-0">
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

        {/* Warehouse Name */}
        <div className="flex flex-col w-[20%] m-0">
          <FormField label="Warehouse Name">
            <SearchableSelect
              options={warehouseNames}
              value={warehouseName}
              onChange={setWarehouseName}
              placeholder="Select or search..."
            />
          </FormField>
        </div>

        {/* Bill Type */}
        <div className="flex flex-col w-[20%] m-0">
          <FormField label="Bill Type">
            <select
              className="border rounded-lg px-3 py-2 cursor-pointer"
              value={billType}
              onChange={(e) => setBillType(e.target.value)}
            >
              <option value="">Select</option>
              {billTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Warehouse Type */}
        <div className="flex flex-col w-[20%] m-0">
          <FormField label="Warehouse Type">
            <select
              className="border rounded-lg px-3 py-2 cursor-pointer"
              value={warehouseType}
              onChange={(e) => setWarehouseType(e.target.value)}
            >
              <option value="">Select</option>
              {warehouseTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* TDS-only: From Date & To Date */}
        {reportType === "TDS" && (
          <>
            <div className="flex flex-col w-[20%] m-0">
              <FormField label="From Date">
                <input
                  type="date"
                  className="border rounded-lg px-3 py-2 cursor-pointer"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </FormField>
            </div>
            <div className="flex flex-col w-[20%] m-0">
              <FormField label="To Date">
                <input
                  type="date"
                  className="border rounded-lg px-3 py-2 cursor-pointer"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </FormField>
            </div>
          </>
        )}

        {/* Preview Button */}
        <Button onClick={handlePreview} disabled={loading}>
          Generate Report
        </Button>
      </div>

      {/* ================= PREVIEW TABLE ================= */}
      {(previewData.length > 0 || noDataMessage) && (
        <div className="bg-white p-4 rounded-xl shadow p-6 w-full mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Preview Report of {getReportLabel(reportType)}
            </h2>
            {previewData.length > 0 && (
              <Button
                variant="success"
                onClick={handleGenerate}
                disabled={loading}
              >
                Generate & Save
              </Button>
            )}
          </div>

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
                    {reportType === "TDS" && groupHeader && (
                      <tr className="bg-gray-200 border-b border-gray-300">
                        {groupHeader.map((gh, idx) => (
                          <th
                            key={idx}
                            colSpan={gh.colSpan}
                            className={`px-6 py-2 text-center text-xs font-bold uppercase tracking-wider border-r border-gray-300 last:border-r-0 ${gh.label ? "bg-gray-300 text-gray-800" : ""
                              }`}
                          >
                            {gh.label}
                          </th>
                        ))}
                      </tr>
                    )}
                    <tr className="bg-gray-100 border-b border-gray-300">
                      {previewColumns.map((col) => (
                        <th
                          key={col.key}
                          className="px-6 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {previewData
                      .slice((previewPage - 1) * previewLimit, previewPage * previewLimit)
                      .map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          {previewColumns.map((column) => (
                            <td
                              key={column.key}
                              className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"
                            >
                              {column.render
                                ? column.render(row[column.key], row)
                                : row[column.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {previewTotalPages > 1 && (
                <div className="mt-4 flex flex-col md:flex-row items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 gap-4">
                  <span className="text-sm font-semibold text-slate-700">
                    Showing {(previewPage - 1) * previewLimit + 1} to{" "}
                    {Math.min(previewPage * previewLimit, previewData.length)} of{" "}
                    <span className="text-blue-600">{previewData.length}</span> records
                  </span>

                  <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1">
                    <button
                      disabled={previewPage === 1}
                      onClick={() => setPreviewPage(1)}
                      className="px-2 py-1 text-xs bg-white border rounded hover:bg-slate-100 disabled:opacity-30"
                    >
                      First
                    </button>
                    <button
                      disabled={previewPage === 1}
                      onClick={() => setPreviewPage((p) => p - 1)}
                      className="px-2 py-1 text-xs bg-white border rounded hover:bg-slate-100 disabled:opacity-30 mr-2"
                    >
                      Prev
                    </button>

                    {[...Array(previewTotalPages)].map((_, i) => {
                      const p = i + 1;
                      if (p === 1 || p === previewTotalPages || (p >= previewPage - 2 && p <= previewPage + 2)) {
                        return (
                          <button
                            key={p}
                            onClick={() => setPreviewPage(p)}
                            className={`min-w-[32px] px-2 py-1 text-xs border rounded transition ${
                              previewPage === p
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-slate-600 hover:bg-slate-100 border-slate-300"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      }
                      if (p === 2 && previewPage > 4) return <span key="dots1" className="px-1 text-slate-400">...</span>;
                      if (p === previewTotalPages - 1 && previewPage < previewTotalPages - 3) return <span key="dots2" className="px-1 text-slate-400">...</span>;
                      return null;
                    })}

                    <button
                      disabled={previewPage === previewTotalPages}
                      onClick={() => setPreviewPage((p) => p + 1)}
                      className="px-2 py-1 text-xs bg-white border rounded hover:bg-slate-100 disabled:opacity-30 ml-2"
                    >
                      Next
                    </button>
                    <button
                      disabled={previewPage === previewTotalPages}
                      onClick={() => setPreviewPage(previewTotalPages)}
                      className="px-2 py-1 text-xs bg-white border rounded hover:bg-slate-100 disabled:opacity-30"
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}

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

const SearchableSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className="border rounded-lg px-3 py-2 cursor-pointer bg-white flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-800 line-clamp-1" : "text-gray-500"}>{value || placeholder}</span>
        <span className="text-gray-400 text-xs ml-2">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          <div className="sticky top-0 bg-white p-2 border-b border-gray-100 z-10">
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Type to search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="py-1">
            <div
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${!value ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"}`}
              onClick={() => {
                onChange("");
                setIsOpen(false);
                setSearch("");
              }}
            >
              -- Select None --
            </div>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${value === opt ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"}`}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-gray-500 text-sm text-center">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

