// import * as XLSX from "xlsx";
import * as XLSX from "xlsx-js-style";
import { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPayments,
  removePayment,
  setPage,
} from "../../redux/slices/paymentsSlice";
import { Eye, Pencil, Trash2, Plus, Filter, Import } from "lucide-react";
import { Form, Link } from "react-router-dom";
import axios from "../../services/axios";
import Button from "../../components/global/Button";
import Card from "../../components/global/Card";
import Table from "../../components/global/Table";
import Input from "../../components/global/Input";
import Pagination from "../../components/global/Pagination";
import toast from "react-hot-toast";
import kru2uni from "@anthro-ai/krutidev-unicode";

const PaymentList = () => {
  const dispatch = useDispatch();
  const { items, totalPages, page, limit, loading, total } = useSelector(
    (state) => state.payments,
  );

  const isInitialMount = useRef(true);
  const isReturning = localStorage.getItem("from_payment_list") === "true";

  /* ================= STATE ================= */
  /* ================= STATE ================= */
  const [search, setSearch] = useState(() => (isReturning ? localStorage.getItem("payment_search") : "") || "");
  const [sortOption, setSortOption] = useState(() => (isReturning ? localStorage.getItem("payment_sortOption") : "date_desc") || "date_desc");
  const [showFilters, setShowFilters] = useState(() => isReturning ? (localStorage.getItem("payment_showFilters") === "true") : false);

  const [district, setDistrict] = useState(() => (isReturning ? localStorage.getItem("payment_district") : "") || "");
  const [branch, setBranch] = useState(() => (isReturning ? localStorage.getItem("payment_branch") : "") || "");
  const [warehouseType, setWarehouseType] = useState(() => (isReturning ? localStorage.getItem("payment_warehouseType") : "") || "");
  const [warehouseName, setWarehouseName] = useState(() => (isReturning ? localStorage.getItem("payment_warehouseName") : "") || "");
  const [billType, setBillType] = useState(() => (isReturning ? localStorage.getItem("payment_billType") : "") || "");

  const [fromDate, setFromDate] = useState(() => (isReturning ? localStorage.getItem("payment_fromDate") : "") || "");
  const [toDate, setToDate] = useState(() => (isReturning ? localStorage.getItem("payment_toDate") : "") || "");

  const [cropYear, setCropYear] = useState(() => (isReturning ? localStorage.getItem("payment_cropYear") : "") || "");
  const [cropYears, setCropYears] = useState([]);

  const [importMode, setImportMode] = useState("update"); // default

  const [filterOptions, setFilterOptions] = useState({
    districts: [],
    branches: [],
    warehouseNames: [],
    billTypes: [],
  });

  const formatToYMD = (date) => {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatExcelDate = (value) => {
    if (!value) return null;

    // ✅ Excel serial number
    if (typeof value === "number" || (!isNaN(value) && !isNaN(parseFloat(value)))) {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + Number(value) * 86400000);
      return formatToYMD(date);
    }

    // ✅ Already Date object
    if (value instanceof Date) {
      return formatToYMD(value);
    }

    if (typeof value === "string") {
      // Try to detect common DD/MM/YYYY or MM/DD/YYYY
      const parts = value.split(/[-/]/);
      if (parts.length === 3) {
        let [d, m, y] = parts;
        // If year is 2 digits, assume 20xx
        if (y.length === 2) y = "20" + y;

        // Try creating date from parts (handling both DD/MM and MM/DD common cases)
        // Defaulting to Indian style DD/MM/YYYY usually preferred in this context
        const parsed = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
        if (!isNaN(parsed)) return formatToYMD(parsed);
      }

      const parsed = new Date(value);
      if (!isNaN(parsed)) {
        return formatToYMD(parsed);
      }
    }

    return null;
  };

  const removeEmptyColumns = (data) => {
    return data.map((row) => {
      const newRow = {};

      Object.keys(row).forEach((key) => {
        const value = row[key];

        if (
          key &&
          !key.toLowerCase().includes("empty") &&
          value !== null &&
          value !== ""
        ) {
          newRow[key] = value;
        }
      });

      return newRow;
    });
  };

  const fetchCropYears = async () => {
    try {
      const res = await axios.get("/warehouses");

      const allYears = res.data.data.flatMap(
        (w) => w.cropData?.map((c) => c.crop_year) || [],
      );

      // const uniqueYears = [...new Set(allYears)];
      // setCropYears(uniqueYears);
    } catch (error) {
      console.error("Failed to fetch crop years");
    }
  };

  const fetchFilters = async () => {
    const res = await axios.get("/payments/filters");
    setFilterOptions(res.data.data);
    if (res.data.data.cropYears) {
      setCropYears(res.data.data.cropYears);
    }
  };
  useEffect(() => {
    fetchFilters();
    fetchCropYears();

    // ✅ Restore page from session on mount if returning
    if (isReturning) {
      const savedPage = localStorage.getItem("payment_page");
      if (savedPage) {
        dispatch(setPage(parseInt(savedPage)));
      }
    } else {
      // Clear persistence if not returning from View/Edit
      const keys = [
        "payment_search", "payment_sortOption", "payment_showFilters",
        "payment_district", "payment_branch", "payment_warehouseType",
        "payment_warehouseName", "payment_billType", "payment_fromDate",
        "payment_toDate", "payment_cropYear", "payment_page"
      ];
      keys.forEach(k => localStorage.removeItem(k));
      dispatch(setPage(1));
    }

    // Clean up the flag
    localStorage.removeItem("from_payment_list");

    // Set mounted to true after initial setup
    setTimeout(() => {
      isInitialMount.current = false;
    }, 150);
  }, []);

  /* ================= PERSISTENCE ================= */
  useEffect(() => {
    if (isInitialMount.current) return;

    localStorage.setItem("payment_search", search);
    localStorage.setItem("payment_sortOption", sortOption);
    localStorage.setItem("payment_showFilters", showFilters);
    localStorage.setItem("payment_district", district);
    localStorage.setItem("payment_branch", branch);
    localStorage.setItem("payment_warehouseType", warehouseType);
    localStorage.setItem("payment_warehouseName", warehouseName);
    localStorage.setItem("payment_billType", billType);
    localStorage.setItem("payment_fromDate", fromDate);
    localStorage.setItem("payment_toDate", toDate);
    localStorage.setItem("payment_cropYear", cropYear);
    localStorage.setItem("payment_page", page);
  }, [
    search,
    sortOption,
    showFilters,
    district,
    branch,
    warehouseType,
    warehouseName,
    billType,
    fromDate,
    toDate,
    cropYear,
    page,
  ]);

  /* ================= FETCH PAYMENTS ================= */
  useEffect(() => {
    dispatch(
      fetchPayments({
        page,
        limit,
        search,
        sort: sortOption,
        district,
        branch,
        warehouse_name: warehouseName,
        warehouse_type: warehouseType,
        from_date: fromDate,
        to_date: toDate,
        crop_year: cropYear,
        bill_type: billType,
      }),
    );
  }, [
    dispatch,
    page,
    limit,
    search,
    sortOption,
    district,
    branch,
    warehouseName,
    warehouseType,
    fromDate,
    toDate,
    cropYear,
    billType,
  ]);

  /* ================= CASCADE LOGIC ================= */
  const filteredBranches = filterOptions.branches.filter(
    (b) => !district || b.district_name === district,
  );

  const filteredWarehouses = filterOptions.warehouseNames.filter(
    (w) =>
      (!district || w.district_name === district) &&
      (!branch || w.branch_name === branch),
  );

  const filteredTypes = filterOptions.warehouseNames
    .filter(
      (w) =>
        (!district || w.district_name === district) &&
        (!branch || w.branch_name === branch),
    )
    .map((w) => w.warehouse_type);

  const uniqueTypes = [...new Set(filteredTypes)];

  const uniqueBranches = [...new Map(filteredBranches.map(b => [b.branch_name, b])).values()];
  const uniqueWarehouses = [...new Map(filteredWarehouses.map(w => [w.warehouse_name, w])).values()];

  /* ================= RESET ACTIVE ================= */
  const isFilterActive = useMemo(() => {
    return (
      search ||
      district ||
      branch ||
      warehouseType ||
      warehouseName ||
      fromDate ||
      toDate ||
      cropYear ||
      billType ||
      sortOption !== "date_desc"
    );
  }, [
    search,
    district,
    branch,
    warehouseType,
    warehouseName,
    fromDate,
    toDate,
    cropYear,
    billType,
    sortOption,
  ]);

  const handleReset = () => {
    setSearch("");
    setSortOption("date_desc");
    setDistrict("");
    setBranch("");
    setWarehouseType("");
    setWarehouseName("");
    setFromDate("");
    setToDate("");
    setBillType("");
    dispatch(setPage(1));
    setCropYear("");
  };

  const formatDate = (date) => {
    if (!date) return "";

    const d = new Date(date);

    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ================= EXPORT EXCEL ================= */
  const handleExport = async () => {
    try {
      const res = await axios.get("/payments", {
        params: {
          page: 1,
          limit: 100000,
          search,
          sort: sortOption,
          district,
          branch,
          warehouse_name: warehouseName,
          warehouse_type: warehouseType,
          from_date: fromDate,
          to_date: toDate,
        },
      });

      const allPayments = res.data.data;

      if (!allPayments || allPayments.length === 0) {
        toast.error("No data to export");
        return;
      }

      /* ================= FORMAT ================= */
      const formatPeriod = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toLocaleString("en-IN", {
          month: "short",
          year: "2-digit",
        });
      };

      /* ================= TITLE ================= */
      const headerRows = [
        [
          "म. प्र. वेयरहाउसिंग एंड लॉजिस्टिक्स कॉर्पोरेशन, क्षेत्रीय कार्यालय, इन्दौर",
        ],
        [
          "2024-25 में जी.वी. स्कीम योजनान्तर्गत भंडारण शुल्क देयकों के भुगतान की जानकारी",
        ],
      ];

      /* ================= HEADERS ================= */
      const headers = [
        "ID",
        "Bill Type",
        "District",
        "Sr No",
        "Branch",
        "Name of Warehouse",
        "Godown type",
        "PAN Card Holder",
        "PAN Card Number",
        "Gdn No.",
        "Depositers Name",
        "Commodity",
        "Month",
        "Financial Year", // ✅ NEW
        "Crop Year", // ✅ NEW
        "Rate", // ✅ NEW
        "Bill Amount",
        "TOTAL JV Amount",
        "Actual Passed Amount",
        "TDS",
        "EMI Amount",
        "20% Deduction Amount against gain",
        "Penalty",
        "Medicine",
        "EMI FDR Interest",
        "Gain Shortage Deduction",
        "Stock Shortage Deduction",
        "Bank Solvancy",
        "Insurance",
        "Other Deduction",
        "Pay to JVS Amount",
        "Payment By",
        "Payment Date",
        "QTR",
        "Remarks",
      ];

      /* ================= DATA ================= */
      const data = allPayments.map((row, index) => {
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];

        let monthName = "";
        if (row.from_date) {
          const d = new Date(row.from_date);
          monthName = monthNames[d.getMonth()];
        } else if (row.month) {
          monthName = row.month;
        }

        return [
          row.id,
          row.bill_type || "",
          row.district_name || "",
          index + 1,
          row.branch_name || "",
          row.warehouse_name || "",
          row.warehouse_type || "",
          row.pan_card_holder || "",
          row.pan_card_number || "",
          row.warehouse_no || "",
          row.depositers_name || "",
          row.commodity || "",
          monthName,

          row.financial_year || "", // ✅
          row.crop_year || "", // ✅
          row.rate || "",

          row.bill_amount || 0,
          row.total_jv_amount || 0,
          row.actual_passed_amount || 0,
          row.tds || 0,
          row.emi_amount || 0,
          row.deduction_20_percent || 0,
          row.penalty || 0,
          row.medicine || 0,
          row.emi_fdr_interest || 0,
          row.gain_shortage_deduction || 0,
          row.stock_shortage_deduction || 0,
          row.bank_solvancy || 0,
          row.insurance || 0,
          row.other_deduction_amount || 0,
          row.pay_to_jvs_amount || 0,
          row.payment_by || "",
          row.payment_date
            ? new Date(row.payment_date).toLocaleDateString("en-IN")
            : "",
          row.qtr || "",
          row.remarks || "",
        ];
      });

      /* ================= DEDUCTION ================= */
      const deductionRow = new Array(headers.length).fill("");
      deductionRow[14] = "Deduction";

      /* ================= SHEET ================= */
      const sheetData = [...headerRows, deductionRow, headers, ...data];
      const ws = XLSX.utils.aoa_to_sheet(sheetData);

      /* ================= MERGES ================= */
      ws["!merges"] = [
        // 🔥 Start from column D but value comes from A
        { s: { r: 0, c: 3 }, e: { r: 0, c: headers.length - 1 } },
        { s: { r: 1, c: 3 }, e: { r: 1, c: headers.length - 1 } },

        { s: { r: 2, c: 14 }, e: { r: 2, c: 25 } },
      ];

      /* ================= ROW HEIGHT ================= */
      ws["!rows"] = [
        { hpx: 30 }, // Title
        { hpx: 28 }, // Subtitle
        { hpx: 22 }, // Deduction
        { hpx: 30 }, // Header (BIG like client)
      ];

      const range = XLSX.utils.decode_range(ws["!ref"]);

      /* ================= TITLE STYLE ================= */
      // Move title from A → D
      ws["D1"] = ws["A1"];
      ws["D2"] = { ...ws["A2"] };

      delete ws["A1"];
      delete ws["A2"];

      // ✅ APPLY STYLE AFTER MOVING
      ["D1", "D2"].forEach((cell) => {
        if (ws[cell]) {
          ws[cell].s = {
            font: {
              name: "Times New Roman",
              sz: 16,
              // bold: true,
            },
            alignment: {
              horizontal: "left",
              vertical: "center",
            },
          };
        }
      });

      /* ================= HEADER STYLE ================= */
      for (let c = 0; c <= range.e.c; c++) {
        const cell = XLSX.utils.encode_cell({ r: 3, c });

        if (ws[cell]) {
          ws[cell].s = {
            font: {
              name: "Times New Roman",
              sz: 11,
              // bold: true,
            },
            alignment: {
              horizontal: "center",
              vertical: "center",
            },
            border: {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            },
          };
        }
      }

      /* ================= DATA STYLE ================= */
      for (let r = 4; r <= range.e.r; r++) {
        for (let c = 0; c <= range.e.c; c++) {
          const cell = XLSX.utils.encode_cell({ r, c });

          if (ws[cell]) {
            ws[cell].s = {
              font: {
                name: "Times New Roman",
                sz: 11,
              },
              border: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
              },
            };
          }
        }
      }

      /* ================= DEDUCTION STYLE ================= */
      const deductionCell = XLSX.utils.encode_cell({ r: 2, c: 14 });

      if (ws[deductionCell]) {
        ws[deductionCell].s = {
          font: {
            name: "Times New Roman",
            sz: 13,
            bold: true,
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
          fill: {
            fgColor: { rgb: "D9D9D9" },
          },
          border: {
            bottom: { style: "thin" },
            right: { style: "thin" },
          },
        };
      }

      /* ================= EXPORT ================= */
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Payments");

      XLSX.writeFile(wb, "payments_report.xlsx", { cellStyles: true });

      toast.success("Excel exported successfully");
    } catch (error) {
      console.error(error);
      toast.error("Export failed");
    }
  };

  /* ================= STATUS BADGE ================= */
  const getStatusBadge = (value) => {
    let style = "";

    if (value === "Pending")
      style = "bg-yellow-100 text-yellow-700 border border-yellow-300";
    else if (value === "Approved")
      style = "bg-green-100 text-green-700 border border-green-300";
    else if (value === "Rejected")
      style = "bg-red-100 text-red-700 border border-red-300";

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${style}`}>
        {value}
      </span>
    );
  };

  /* ================= TABLE ================= */
  const columns = [
    { key: "district_name", label: "District" },
    { key: "branch_name", label: "Branch" },
    { key: "warehouse_name", label: "Warehouse" },
    { key: "warehouse_type", label: "Warehouse Type" },
    { key: "depositers_name", label: "Depositer Name" },
    { key: "commodity", label: "Commodity" },
    { key: "crop_year", label: "Crop Year" },
    { key: "financial_year", label: "Financial Year" },
    { key: "month", label: "Month" },
    { key: "bill_amount", label: "Bill Amount" },
    { key: "remarks", label: "Remarks" },
    // {
    //   key: "status",
    //   label: "Status",
    //   render: (value) => getStatusBadge(value),
    // },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => {
        const isLocked = row.status === "Approved" || row.status === "Rejected";

        return (
          <div className="flex gap-2">
            {/* VIEW */}
            <Link
              to={`/admin/payments/view/${row.id}`}
              onClick={() => localStorage.setItem("from_payment_list", "true")}
              className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
            >
              <Eye size={16} />
            </Link>

            {/* EDIT */}
            <Link
              to={`/admin/payments/edit/${row.id}`}
              onClick={() => {
                localStorage.setItem("from_payment_list", "true");
                if (isLocked) {
                  toast(
                    "Approved and rejected payments can edit remark only.",
                    {
                      icon: "ℹ️",
                      style: {
                        borderRadius: "10px",
                        background: "#FEF3C7",
                        color: "#92400E",
                        padding: "12px 16px",
                        fontSize: "14px",
                        fontWeight: "500",
                        maxWidth: "fit-content",
                      },
                    },
                  );
                }
              }}
              className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
            >
              <Pencil size={16} />
            </Link>

            {/* DELETE */}
            <button
              onClick={async () => {
                if (isLocked) {
                  toast.error(
                    "Approved and rejected payments can't be deleted.",
                    {
                      icon: "🗑️",
                      style: {
                        borderRadius: "10px",
                        background: "#FEE2E2",
                        color: "#7F1D1D",
                        border: "1px solid #FCA5A5",
                        padding: "12px 16px",
                        fontSize: "14px",
                        fontWeight: "500",
                        maxWidth: "fit-content",
                      },
                    },
                  );
                  return;
                }

                const confirmDelete = window.confirm("Delete this payment?");

                if (!confirmDelete) return;

                await dispatch(removePayment(row.id));
                dispatch(fetchPayments({ page, limit }));
                await fetchFilters(); // ✅ SYNC FILTERS AFTER DELETE
                await fetchCropYears(); // ✅ SYNC CROP YEARS AFTER DELETE
                toast.success("Payment deleted successfully");
              }}
              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [fullData, setFullData] = useState([]);
  const [workbook, setWorkbook] = useState(null);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [previewPage, setPreviewPage] = useState(1);

  // IMPORT PROGRESS STATE
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState("");
  const [importFileInfo, setImportFileInfo] = useState({ name: "", size: 0 });
  const [importLoadedSize, setImportLoadedSize] = useState(0);
  const previewLimit = 50;
  const previewTotalPages = Math.ceil(fullData.length / previewLimit);

  const fileInputRef = useRef(null);

  const fieldLabels = {
    // ================= WAREHOUSE =================
    district_name: "District",
    branch_name: "Branch",
    warehouse_name: "Name of Warehouse",
    warehouse_owner_name: "Warehouse Owner",
    warehouse_type: "Warehouse Type",
    warehouse_no: "Gdn No.",
    gst_no: "GST No",
    scheme: "Scheme",
    scheme_rate_amount: "Scheme Rate Amount",
    actual_storage_capacity: "Actual Storage Capacity",
    approved_storage_capacity: "Approved Storage Capacity",
    bank_solvency_affidavit_amount: "Bank Solvency Affidavit Amount",
    bank_solvency_certificate_amount: "Bank Solvency Certificate Amount",
    bank_solvency_deduction_by_bill: "Bank Solvency Deduction by Bill",
    bank_solvency_balance: "Balance Amount Bank Solvancy",
    total_emi: "Total EMI",
    emi_deduction_by_bill: "EMI Deduction by Bill",
    emi_balance: "EMI Balance",
    pan_card_holder: "PAN Card Holder",
    pan_card_number: "PAN Card Number",

    // ================= PAYMENT =================
    rent_bill_number: "Rent Bill Number",
    bill_type: "Bill Type",
    month: "Month",
    financial_year: "Financial Year",
    from_date: "From Date",
    to_date: "To Date",
    commodity: "Commodity",
    crop_year: "Crop Year",
    rate: "Rate",
    rent_bill_amount: "Rent Bill Amount",
    bill_amount: "Bill Amount",
    total_jv_amount: "TOTAL JV Amount",
    actual_passed_amount: "Actual Passed Amount",
    depositers_name: "Depositers Name",

    scientific_capacity: "Scientific Capacity",
    number_of_days: "Number of Days",
    per_day_rate: "Per Day Rate",
    rent_amount_on_scientific_capacity: "Rent Amount On Scientific Capacity",

    tds: "TDS",
    emi_amount: "EMI Amount",
    deduction_20_percent: "20% Deduction Amount against 1% gain",
    penalty: "Penalty",
    medicine: "Medicine",
    emi_fdr_interest: "EMI FDR Interest",
    gain_shortage_deduction: "Gain Shortage Deduction",
    stock_shortage_deduction: "Stock Shortage Deduction",
    bank_solvancy: "Bank Solvancy",
    insurance: "Insurance",
    other_deduction_amount: "Other Deduction",
    other_deductions_reason: "Other Deduction Reason",
    pay_to_jvs_amount: "Pay to JVS Amount",
    payment_by: "Payment By",
    payment_date: "Payment Date",
    qtr: "QTR",
    remarks: "Remarks",
    amount_deducted_against_gain_loss: "Amount Deducted Against Gain/Loss",
    emi_amount: "EMI Amount",
    deduction_20_percent: "20% Deduction",
    penalty: "Penalty",
    medicine: "Medicine",
    emi_fdr_interest: "EMI FDR Interest",
    gain_shortage_deduction: "Gain Shortage Deduction",
    stock_shortage_deduction: "Stock Shortage Deduction",
    bank_solvancy: "Bank Solvancy",
    insurance: "Insurance",
    other_deduction_amount: "Other Deduction Amount",
    other_deductions_reason: "Other Deduction Reason",

    pay_to_jvs_amount: "Pay To JVS Amount",
    security_fund_amount: "Security Fund Amount",

    payment_by: "Payment By",
    payment_date: "Payment Date",
    qtr: "QTR",
    remarks: "Remarks",
  };

  const krutiDevMapping = {
    "ftyk": "जिला",
    "'kk[kk": "शाखा",
    "osvjgkml": "वेअरहाउस",
    ";kstuk": "योजना",
    ";kstuk nj jkf'k": "योजना दर राशि",
    "vuqcaf/kr HkaMkj.k {kerk": "अनुबंधित भंडारण क्षमता",
    "okLrfod HkaMkj.k {kerk": "वास्तविक भंडारण क्षमता",
    "okLrfod HkaMkj.k": "वास्तविक भंडारण",
    "vuqca/k fnukad": "अनुबंध दिनांक",
    "xksnke dzekad": "गोदाम क्रमांक",
    "Jh": "श्री",
    ",aM": "एंड",
    ",M": "एंड",
    "jke": "राम",
    "nsokl": "देवास",
    "xksnke": "गोदाम",
    "ekrk": "माता",
    "ckck": "बाबा",
    "lkbZ": "साईं",
    "izk-": "प्रा.",
    "fy-": "लि.",
    "izk-fy-": "प्रा.लि.",
    "dksYM": "कोल्ड",
    "LVksjst": "स्टोरेज",
    ",xzks": "एग्रो",
    "xzks": "ग्रो",
    "d`f\"k": "कृषि",
    "dsUnz": "केन्द्र",
    "m|ksx": "उद्योग",
    "lgdkjh": "सहकारी",
    "lfefr": "समिति",
    "e;kZfnr": "मर्यादित",
    "vkn'kZ": "आदर्श",
    "foi.ku": "विपणन",
    "Bank Solvancy dk izek.k i= dh jkf'k": "Bank Solvancy का प्रमाण पत्र की राशि",
    "Bank Solvancy ds 'kiFk i= dh jkf'k": "Bank Solvancy के शपथ पत्र की राशि",
    "Bank Solvancy Diduction By Bill": "Bank Solvancy Diduction By Bill",
    "Balance Amount Bank Solvancy": "Balance Amount Bank Solvancy",
    "TOTAL EMI": "TOTAL EMI",
    "EMI Diduction By Bill": "EMI Deduction By Bill",
    "Balance Amount EMI": "Balance Amount EMI",
    "Pan Card Holder": "Pan Card Holder",
    "Pan Card No": "Pan Card No",
    "'kiFk i=": "शपथ पत्र",
    "izek.k i=": "प्रमाण पत्र",
    "'kifk i=": "शपथ पत्र",
    "izek.k i= ": "प्रमाण पत्र",
    "izek.k i= 450000": "प्रमाण पत्र 450000",
    "nsikyqj": "देपालपुर",
    "bUnkSj": "इन्दौर",
    "ekWa": "माँ",
    "jsok": "रेखा",
    "vUu iw.kkZ": "अन्नपूर्णा",
    ",e,aM": "एम एंड",
    "izk fy": "प्रा लि",
    "osvjgkmflax": "वेयरहाउसिंग",
    "dkWyst": "कॉलेज",
    "LVksjsज": "स्टोरेज",
  };

  // const convertHindi = (text, fieldName = "") => {
  //   if (text === null || text === undefined || text === "") return text;
  //   if (typeof text === "number") return text;

  //   const str = text.toString().trim();

  //   // 0. Unicode Detection (Skip if already Devnagri)
  //   if (/[\u0900-\u097F]/.test(str)) return str;

  //   // 1. Dictionary Match (Whole String)
  //   if (krutiDevMapping[str]) return krutiDevMapping[str];

  //   // 2. STRICT PROTECTED FIELDS
  //   const PROTECTED_FIELDS = [
  //     "pan_card_number", "gst_no", "financial_year", "crop_year", "id", "month",
  //     "district_name", "warehouse_no"
  //   ];
  //   if (PROTECTED_FIELDS.includes(fieldName)) return str;

  //   // 3. BASIC FORMAT PROTECTION
  //   if (str.length <= 1) return str;
  //   if (!isNaN(str) && !isNaN(parseFloat(str))) return str;

  //   const tokens = str.split(/(\s+)/);
  //   const convertedTokens = tokens.map(token => {
  //     if (!token.trim()) return token;

  //     // 1. Dictionary Match (Token Level)
  //     if (krutiDevMapping[token]) return krutiDevMapping[token];

  //     // 2. Unicode check
  //     if (/[\u0900-\u097F]/.test(token)) return token;

  //     // 3. PAN check
  //     if (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(token.toUpperCase())) return token;

  //     // 4. Skip short initials
  //     const letters = token.replace(/[^a-zA-Z]/g, '');
  //     if (letters.length <= 1) return token; 

  //     // 5. Positive KrutiDev Identification (Only convert if we are SURE it is KrutiDev)
  //     const isKrutiDev = () => {
  //       // Markers (excluding normal English punctuation like . , - ' ")
  //       if (/[¼½¾[\]\\;{}=?+¾¼½<>]/.test(token)) return true;

  //       // Middle uppercase (e.g. ekWa)
  //       if (/[a-z][A-Z]/.test(token)) return true;

  //       // Known KrutiDev clusters impossible/rare in English, plus 'k for 'kk[kk (शाखा)
  //       if (/(gk|hj|kj|qj|fnO|kfD|Hk|kS|Z|'k)/.test(token)) return true;

  //       // Extremely low vowel ratio
  //       if (letters.length > 3) {
  //           const vowels = (letters.match(/[aeiouy]/gi) || []).length;
  //           if (vowels / letters.length <= 0.15) return true;
  //       }
  //       return false;
  //     };

  //     if (isKrutiDev()) {
  //        try {
  //           const converted = kru2uni(token);
  //           if (/[\u0900-\u097F]/.test(converted)) return converted;
  //        } catch (err) {
  //           // ignore and return original token
  //        }
  //     }

  //     // Default: KEEP AS ENGLISH! This completely prevents English corruption.
  //     return token;
  //   });

  //   return convertedTokens.join("");
  // };

  const formatLocalDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const processPeriod = (period) => {
    if (!period) return {};

    const [mon, yr] = period.split("-");
    if (!mon || !yr) return {};

    const monthMap = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };

    const m = mon.toLowerCase();
    if (monthMap[m] === undefined) return {};

    const fullYear = parseInt("20" + yr);

    const firstDay = new Date(fullYear, monthMap[m], 1);
    const lastDay = new Date(fullYear, monthMap[m] + 1, 0);

    const format = (d) =>
      `${String(d.getDate()).padStart(2, "0")}/${String(
        d.getMonth() + 1,
      ).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;

    // 🔥 FINANCIAL YEAR LOGIC (APR–MAR)
    let fyStart = fullYear;
    let fyEnd = fullYear + 1;

    if (monthMap[m] < 3) {
      fyStart = fullYear - 1;
      fyEnd = fullYear;
    }

    return {
      from_date: formatLocalDate(firstDay),
      to_date: formatLocalDate(lastDay),
      month: firstDay.toLocaleString("en-IN", { month: "long" }),
      financial_year: `${fyStart}-${String(fyEnd).slice(-2)}`,
    };
  };

  const getCropYearFromCommodity = (commodity) => {
    if (!commodity) return "";

    // 1. Handle range like "Jowar '2018-2019'" or "2018-19"
    const rangeMatch = commodity.match(/(\d{4})[-\/\s]+(\d{2,4})/);
    if (rangeMatch) {
      const startYr = rangeMatch[1];
      let endYr = rangeMatch[2];
      if (endYr.length === 4) endYr = endYr.slice(-2);
      return `${startYr}-${endYr}`;
    }

    // 2. Handle single year like "Rice-2024" -> "2024-25" or "Rice 24" -> "2024-25"
    const singleMatch = commodity.match(/(\d{2,4})$/);
    if (singleMatch) {
      const yrStr = singleMatch[1];
      let yr = parseInt(yrStr);
      if (yrStr.length === 2) {
        yr = yr < 50 ? 2000 + yr : 1900 + yr;
      }
      return `${yr}-${String(yr + 1).slice(-2)}`;
    }

    return "";
  };

  const KRUTI_PATTERNS = [
    "vk", "vks", "d`", "iz", "'k", "xz",
    "gk", "jks", "drk", "oky", "Hkk",
    "fo", "ns", "ek", "la", "os", "jg",
    "dk", "ds", "esa", "dks", "HkaMkj",
    "izk", "fy", "os;j", "gkml",
    "js", "bU", "ih", "eS", "vU",
    "vkj", "dkW", "LV", "Mª", "xks",
    "e/k", "ik", "lk", "uk", "vkW"
  ];

  // const ENGLISH_WORDS = [
  //   "warehouse",
  //   "warehousing",
  //   "private",
  //   "limited",
  //   "ltd",
  //   "pvt",
  //   "bank",
  //   "rice",
  //   "wheat",
  //   "branch",
  //   "district",
  //   "godown",
  //   "storage",
  //   "cold",
  //   "fort",
  //   "online",
  //   "scheme",
  //   "payment",
  //   "commodity",
  //   "finance",
  //   "insurance",
  //   "solvancy",
  //   "emi",
  //   "amount",
  //   "bill",
  //   "deduction",
  //   "penalty"
  // ];

  const PROTECTED_FIELDS = [
    "pan_card_number",
    "gst_no",
    "financial_year",
    "crop_year",
    "id",
    "month",
    "payment_date",
    "from_date",
    "to_date",
    "warehouse_no",
    "rate",
    "bill_amount",
    "tds"
  ];

  // const cleanCellValue = (value) => {
  //   if (value === null || value === undefined) {
  //     return "";
  //   }

  //   return value
  //     .toString()
  //     .replace(/\s+/g, " ")
  //     .replace(/[\u0000-\u001F]/g, "")
  //     .trim();
  // };

  // const isUnicodeHindi = (text) => {
  //   return /[\u0900-\u097F]/.test(text);
  // };

  // const isProtectedField = (fieldName) => {
  //   return PROTECTED_FIELDS.includes(fieldName);
  // };

  // const isPanNumber = (text) => {
  //   return /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(text);
  // };

  // const isNumeric = (text) => {
  //   return /^\d+(\.\d+)?$/.test(text);
  // };

  // const isPureEnglish = (text) => {
  //   const lower = text.toLowerCase().trim();

  //   // Known English business words
  //   const matched = ENGLISH_WORDS.filter(word =>
  //     lower.includes(word)
  //   ).length;

  //   if (matched > 0) {
  //     return true;
  //   }

  //   // Strong KrutiDev indicators
  //   if (
  //     /(vk|vks|js|os|iz|fy|gk|ns|bU|d`|xz|jh|dj|dk|ds|Hk|la)/i.test(lower)
  //   ) {
  //     return false;
  //   }

  //   // Looks like real English sentence
  //   if (/^[a-zA-Z0-9 &().,/\-]+$/.test(text)) {
  //     const letters = text.replace(/[^a-zA-Z]/g, "");

  //     if (letters.length >= 4) {
  //       const vowels = (
  //         letters.match(/[aeiou]/gi) || []
  //       ).length;

  //       return vowels / letters.length >= 0.28;
  //     }
  //   }

  //   return false;
  // };

  // const getKrutiScore = (text) => {
  //   let score = 0;

  //   KRUTI_PATTERNS.forEach(pattern => {
  //     if (text.includes(pattern)) {
  //       score += 2;
  //     }
  //   });

  //   if (/[¼½¾]/.test(text)) {
  //     score += 5;
  //   }

  //   if ((text.match(/;/g) || []).length >= 1) {
  //     score += 2;
  //   }

  //   if (/[\\']/g.test(text)) {
  //     score += 2;
  //   }

  //   if (/(kS|ks|kj|jh|gk|vk|ns|xz|iz)/.test(text)) {
  //     score += 2;
  //   }

  //   return score;
  // };

  // const isValidHindiConversion = (text) => {
  //   const hindiChars = (
  //     text.match(/[\u0900-\u097F]/g) || []
  //   ).length;

  //   return hindiChars >= 2;
  // };

  // const convertKrutiChunk = (text) => {
  //   try {
  //     const converted = kru2uni(text);

  //     if (isValidHindiConversion(converted)) {
  //       return converted;
  //     }

  //     return text;
  //   } catch (err) {
  //     return text;
  //   }
  // };

  // const processMixedText = (text) => {
  //   if (!text) return text;

  //   // Already Hindi
  //   if (isUnicodeHindi(text)) {
  //     return text;
  //   }

  //   // Dictionary exact match
  //   if (krutiDevMapping[text]) {
  //     return krutiDevMapping[text];
  //   }

  //   // Pure English
  //   if (isPureEnglish(text)) {
  //     return text;
  //   }

  //   // PAN
  //   if (isPanNumber(text)) {
  //     return text;
  //   }

  //   // Numeric
  //   if (isNumeric(text)) {
  //     return text;
  //   }

  //   // Direct conversion attempt
  //   const converted = convertKrutiChunk(text);

  //   if (
  //     converted !== text &&
  //     isValidHindiConversion(converted)
  //   ) {
  //     return converted;
  //   }

  //   return text;
  // };

  // const ONLY_KRUTI_FIELDS = [
  //   "branch_name",
  //   "warehouse_name"
  // ];

  // const isValidHindiOutput = (text) => {

  //   if (!text) return false;

  //   const hindiChars =
  //     (text.match(/[\u0900-\u097F]/g) || []).length;

  //   return hindiChars >= 2;
  // };

  const STRICT_KRUTI_PATTERNS = [
    "vk",
    "vks",
    "js",
    "jks",
    "iz",
    "'k",
    "d`",
    "xz",
    "gk",
    "ns",
    "la",
    "os",
    "Hk",
    "dk",
    "ds",
    "esa",
    "dks",
    "fj",
    "f'k",
    "Qk",
    "xz",
    "Vª",
    "Mª",
    "ks",
    "kS",
    "jh",
    "dj",
    "dh",
    "ls",
    "es"
  ];

  const getKrutiScore = (text) => {

    const lower = text.toLowerCase();

    let score = 0;

    STRICT_KRUTI_PATTERNS.forEach(pattern => {

      if (lower.includes(pattern)) {
        score += 2;
      }

    });

    // Strong indicators
    if (/[¼½¾]/.test(text)) {
      score += 5;
    }

    if (/[;\\']/.test(text)) {
      score += 2;
    }

    // Impossible English clusters
    if (
      /(osvj|jgk|xzks|ekwa|jsok|dey|iqj|Hkk)/i.test(text)
    ) {
      score += 4;
    }

    // Low vowel suspicious text
    const letters =
      text.replace(/[^a-z]/gi, "");

    if (letters.length >= 6) {

      const vowels =
        (letters.match(/[aeiou]/gi) || []).length;

      const ratio = vowels / letters.length;

      if (ratio < 0.22) {
        score += 2;
      }
    }

    return score;
  };

  const ENGLISH_BUSINESS_WORDS = [
    "warehouse",
    "warehousing",
    "private",
    "limited",
    "pvt",
    "ltd",
    "bank",
    "rice",
    "wheat",
    "storage",
    "cold",
    "india",
    "traders",
    "company",
    "corporation",
    "agro",
    "industries",
    "godown",
    "enterprise",
    "associates"
  ];

  const getEnglishScore = (text) => {

    const lower = text.toLowerCase();

    let score = 0;

    // Business keywords
    ENGLISH_BUSINESS_WORDS.forEach(word => {
      if (lower.includes(word)) {
        score += 4;
      }
    });

    // Fully readable English chars
    if (/^[a-zA-Z0-9 &().,/-]+$/.test(text)) {
      score += 2;
    }

    const words = text.split(/\s+/);

    words.forEach(word => {

      const clean = word.replace(/[^a-z]/gi, "");

      if (clean.length >= 3) {

        const vowels =
          (clean.match(/[aeiou]/gi) || []).length;

        const ratio = vowels / clean.length;

        if (ratio >= 0.25) {
          score += 1;
        }
      }
    });

    return score;
  };

  const smartConvertHindi = (
    value,
    fieldName = ""
  ) => {

    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    const str = value.toString().trim();

    if (!str) {
      return "";
    }

    // Already Hindi
    if (/[\u0900-\u097F]/.test(str)) {
      return str;
    }

    // Protected fields
    if (PROTECTED_FIELDS.includes(fieldName)) {
      return str;
    }

    // PAN safe
    if (/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(str)) {
      return str;
    }

    // Only convert target fields
    if (
      fieldName !== "branch_name" &&
      fieldName !== "warehouse_name"
    ) {
      return str;
    }

    // Exact dictionary
    if (krutiDevMapping[str]) {
      return krutiDevMapping[str];
    }

    const englishScore =
      getEnglishScore(str);

    const krutiScore =
      getKrutiScore(str);

    // Strong English → KEEP
    if (
      englishScore >= 6 &&
      englishScore > krutiScore
    ) {
      return str;
    }

    // Weak Kruti → KEEP
    if (krutiScore < 4) {
      return str;
    }

    try {

      const converted = kru2uni(str);

      // Conversion validation
      const hindiChars =
        (
          converted.match(/[\u0900-\u097F]/g)
          || []
        ).length;

      if (hindiChars >= 2) {
        return converted;
      }

      return str;

    } catch {

      return str;

    }
  };

  const processSheetData = async (sheetName, wb) => {
    try {
      setLoadingImport(true);
      setImportStatus("Extracting sheet data...");
      setImportProgress(35);

      // Yield to UI
      await new Promise(resolve => setTimeout(resolve, 200));

      setImportStatus("Optimizing sheet range...");
      setImportProgress(40);
      await new Promise(resolve => setTimeout(resolve, 100));

      const sheet = wb.Sheets[sheetName];

      console.log("========== FONT DEBUG START ==========");

      Object.keys(sheet).forEach((cellAddress) => {

        // Skip metadata keys like !ref
        if (cellAddress.startsWith("!")) return;

        const cell = sheet[cellAddress];

        const value = cell.v;

        // Font info
        const fontName = cell?.s?.font?.name || "NO_FONT_FOUND";

        // Only log text cells
        if (typeof value === "string" && value.trim() !== "") {

          console.log({
            cell: cellAddress,
            value: value,
            font: fontName,
            style: cell.s,
          });

        }
      });

      console.log("========== FONT DEBUG END ==========");

      // DEFENSIVE RANGE DETECTION (Fixes "ghost" rows/columns in sparse sheets)
      const ref = XLSX.utils.decode_range(sheet['!ref'] || "A1:A1");
      let lastRow = ref.s.r;
      let lastCol = ref.s.c;

      for (let r = ref.e.r; r >= ref.s.r; r--) {
        for (let c = ref.e.c; c >= ref.s.c; c--) {
          if (sheet[XLSX.utils.encode_cell({ r, c })]) {
            if (r > lastRow) lastRow = r;
            if (c > lastCol) lastCol = c;
            break;
          }
        }
        if (lastRow > ref.s.r && r < lastRow - 100) break; // Optimization: stop if we found data and then 100 empty rows
      }
      sheet['!ref'] = XLSX.utils.encode_range({ s: ref.s, e: { r: lastRow, c: lastCol } });

      const jsonDataRaw = XLSX.utils.sheet_to_json(sheet, {
        range: 3,
        raw: true,
        defval: "",
      });

      // FILTER OUT EMPTY OR HEADER ROWS
      const jsonData = jsonDataRaw.filter(row => {
        const values = Object.values(row).filter(v => v !== null && v !== "");
        return values.length > 5; // A valid row should have at least 5 columns filled
      });

      setImportProgress(50);
      setImportStatus(`Processing ${jsonData.length} records...`);
      await new Promise(resolve => setTimeout(resolve, 200));

      setImportProgress(50);
      setImportStatus("Normalizing data...");
      await new Promise(resolve => setTimeout(resolve, 50));

      const keyMapping = {
        id: "id",
        bill_type: "bill_type",
        district: "district_name",
        branch: "branch_name",
        name_of_warehouse: "warehouse_name",
        godown_type: "warehouse_type",
        pan_card_holder: "pan_card_holder",
        pan_card_number: "pan_card_number",
        gdn_no: "warehouse_no",
        "gdn_no.": "warehouse_no",
        depositers_name: "depositers_name",
        commodity: "commodity",
        period: "period",
        financial_year: "financial_year",
        crop_year: "crop_year",
        rate: "rate",
        bill_amount: "bill_amount",
        total_jv_amount: "total_jv_amount",
        actual_passed_amount: "actual_passed_amount",
        tds: "tds",
        emi_amount: "emi_amount",
        "20_deduction_amount_against_1_gain": "deduction_20_percent",
        penalty: "penalty",
        medicine: "medicine",
        emi_fdr_interest: "emi_fdr_interest",
        gain_shortage_deduction: "gain_shortage_deduction",
        gain_shortage_deducton: "gain_shortage_deduction", // handle typo in sheet
        stock_shortage_deduction: "stock_shortage_deduction",
        bank_solvancy: "bank_solvancy",
        insurance: "insurance",
        other_deduction: "other_deduction_amount",
        other: "other_deduction_amount", // handle "Other" column
        pay_to_jvs_amount: "pay_to_jvs_amount",
        payment_by: "payment_by",
        payment_date: "payment_date",
        qtr: "qtr",
        remarks: "remarks",
        amount_deducted_against_gain: "amount_deducted_against_gain_loss",
        "20_deduction_amount_against_gain": "deduction_20_percent",
        "crop_year": "crop_year",
        "commodity": "commodity",
        "cropyear": "crop_year",
        "commodity_name": "commodity",
        "month": "month",
      };

      const normalizeKeys = (row) => {
        const newRow = {};
        Object.keys(row).forEach((key) => {
          const cleanKey = key.toString().trim().toLowerCase()
            .replace(/\s+/g, "_").replace(/[%()]/g, "").replace(/__+/g, "_");
          let mappedKey = keyMapping[cleanKey] || cleanKey;
          if (mappedKey === "gdn_no") mappedKey = "warehouse_no";
          newRow[mappedKey] = row[key];
        });
        return newRow;
      };

      setImportProgress(60);
      setImportStatus("Formatting data chunks...");

      const cleanCellValue = (value) => {
        if (value === null || value === undefined) {
          return "";
        }

        return value
          .toString()
          .replace(/\s+/g, " ")
          .replace(/[\u0000-\u001F]/g, "")
          .trim();
      };

      const formattedData = [];
      const CHUNK_SIZE = 500;
      for (let i = 0; i < jsonData.length; i += CHUNK_SIZE) {
        const chunk = jsonData.slice(i, i + CHUNK_SIZE);
        const processedChunk = chunk.map((row) => {
          const normalizedRow = normalizeKeys(row);
          Object.keys(normalizedRow).forEach(key => {
            normalizedRow[key] = cleanCellValue(normalizedRow[key]);
          });
          const periodData = processPeriod(normalizedRow.period);

          let financial_year = normalizedRow.financial_year || periodData.financial_year || "";
          const payment_date = formatExcelDate(normalizedRow.payment_date);

          if (payment_date && !financial_year) {
            const pd = new Date(payment_date);
            if (!isNaN(pd)) {
              const pMonth = pd.getMonth(); // 0-11
              const pYear = pd.getFullYear();
              if (pMonth >= 3) { // April or later
                financial_year = `${pYear}-${String(pYear + 1).slice(-2)}`;
              } else {
                financial_year = `${pYear - 1}-${String(pYear).slice(-2)}`;
              }
            }
          }

          return {
            ...normalizedRow,
            from_date: periodData.from_date || null,
            to_date: periodData.to_date || null,
            month: normalizedRow.month || periodData.month || "",
            financial_year,
            crop_year: normalizedRow.crop_year || getCropYearFromCommodity(normalizedRow.commodity) || "",
            payment_date,
          };
        });
        formattedData.push(...processedChunk);
        setImportProgress(60 + Math.round((i / jsonData.length) * 20));
        await new Promise(resolve => setTimeout(resolve, 50)); // Yield to UI
      }

      setImportProgress(85);
      setImportStatus("Converting text chunks...");
      const finalData = [];
      for (let i = 0; i < formattedData.length; i += CHUNK_SIZE) {
        const chunk = formattedData.slice(i, i + CHUNK_SIZE);
        const processedChunk = chunk.map((row) => ({
          ...row,
          branch_name: smartConvertHindi(
            row.branch_name,
            "branch_name"
          ),

          warehouse_name: smartConvertHindi(
            row.warehouse_name,
            "warehouse_name"
          ),
        }));
        finalData.push(...processedChunk);
        setImportProgress(85 + Math.round((i / formattedData.length) * 10));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setImportProgress(95);
      setImportStatus("Finalizing preview...");
      await new Promise(resolve => setTimeout(resolve, 200));

      const newCropYears = new Set(cropYears);
      finalData.forEach((row) => {
        if (row.crop_year) newCropYears.add(row.crop_year);
      });

      setCropYears([...newCropYears]);
      setFullData(finalData);
      setPreviewPage(1); // Reset to first page
      setPreviewData(finalData.slice(0, 50));
      setShowPreview(true);
      setImportProgress(100);
      setLoadingImport(false);
      setImportStatus("");
    } catch (err) {
      console.error("Sheet processing failed", err);
      toast.error("Sheet processing failed");
      setLoadingImport(false);
    }
  };

  const handleSheetChange = (sheetName) => {
    setSelectedSheet(sheetName);
    processSheetData(sheetName, workbook);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFileInfo({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2), // MB
    });
    setImportStatus("Reading file...");
    setImportProgress(0);
    setImportLoadedSize(0);
    setLoadingImport(true);
    const reader = new FileReader();

    reader.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const percent = Math.round((evt.loaded / evt.total) * 20); // First 20% for reading
        setImportProgress(percent);
        setImportLoadedSize((evt.loaded / (1024 * 1024)).toFixed(2));
      }
    };

    reader.onload = (evt) => {
      setImportStatus("Parsing workbook...");
      setImportProgress(25);

      // Delay to allow "Parsing workbook..." to show
      setTimeout(async () => {
        try {
          const data = new Uint8Array(evt.target.result)
          const wb = XLSX.read(data, {
            type: "array",
            cellStyles: true
          });
          setWorkbook(wb);
          setAvailableSheets(wb.SheetNames);

          const firstSheet = wb.SheetNames[0];
          setSelectedSheet(firstSheet);
          setImportProgress(30);

          // Delay to show 30%
          setTimeout(async () => {
            await processSheetData(firstSheet, wb);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }, 100);
        } catch (err) {
          console.error("File reading failed", err);
          toast.error("File reading failed");
          setLoadingImport(false);
          setImportStatus("");
        }
      }, 100);
    };

    reader.onerror = () => {
      toast.error("File reading failed");
      setLoadingImport(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleBulkInsert = async () => {
    try {
      setLoadingImport(true); // ✅ START LOADER
      setImportStatus("Uploading to server...");
      setImportProgress(0);

      const res = await axios.post("/payments/bulk-insert", {
        data: fullData,
        mode: importMode,
      }, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.min(Math.round((progressEvent.loaded * 100) / progressEvent.total), 99);
            setImportProgress(percentCompleted);
            setImportLoadedSize((progressEvent.loaded / (1024 * 1024)).toFixed(2));
            setImportFileInfo(prev => ({ ...prev, size: (progressEvent.total / (1024 * 1024)).toFixed(2) }));

            if (percentCompleted >= 99) {
              setImportStatus("Processing on server...");
            }
          }
        }
      });

      setImportProgress(100);

      toast.success(res.data.message || "Payment imported successfully!");

      setShowPreview(false);
      setPreviewData([]);
      setFullData([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }

      dispatch(fetchPayments({ page, limit }));
      await fetchFilters();
    } catch (error) {
      toast.error(error.response?.data?.message || "Import failed!");
    } finally {
      setLoadingImport(false); // ✅ STOP LOADER
      setImportProgress(0);
      setImportStatus("");
    }
  };

  const toTitleCase = (str) => {
    return str
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const requestedKeys = [
    "bill_type", "district_name", "branch_name", "warehouse_name",
    "pan_card_holder", "pan_card_number", "warehouse_no", "depositers_name",
    "commodity", "crop_year", "financial_year", "month",
    "bill_amount", "total_jv_amount", "actual_passed_amount", "tds",
    "emi_amount", "deduction_20_percent", "penalty", "medicine",
    "emi_fdr_interest", "gain_shortage_deduction", "stock_shortage_deduction",
    "bank_solvancy", "insurance", "other_deduction_amount", "other_deductions_reason",
    "pay_to_jvs_amount", "payment_by", "payment_date", "qtr", "remarks"
  ];

  let previewColumnsKeys = requestedKeys.filter(key => {
    // Critical fields to always show in import preview
    if (["commodity", "crop_year"].includes(key)) return true;

    // Only show if data exists for this key in the preview
    return previewData.some(row => row[key] !== undefined && row[key] !== null && row[key] !== "");
  });

  // If no data yet, show all requested keys
  if (previewColumnsKeys.length === 0) {
    previewColumnsKeys = requestedKeys;
  }

  // Add Sr No at the beginning
  previewColumnsKeys = ["sr_no", ...previewColumnsKeys];

  const previewColumns = previewColumnsKeys.map((key) => ({
    key,
    label: key === "sr_no" ? "Sr No" : (fieldLabels[key] || toTitleCase(key)),
    render: key === "sr_no" ? (v, r, idx) => (previewPage - 1) * previewLimit + idx + 1 : undefined
  }));

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Payment Management</h1>

        <div className="flex gap-3">
          {/* EXPORT BUTTON (ONLY WHEN FILTER ACTIVE) */}
          {isFilterActive && (
            <Button variant="success" onClick={handleExport}>
              Export Excel
            </Button>
          )}

          {/* IMPORT */}
          <input
            type="file"
            accept=".xlsx,.csv"
            ref={fileInputRef}
            onChange={handleImport}
            className="hidden"
          />

          <Button
            variant="secondary"
            onClick={() => fileInputRef.current.click()}
            className="flex gap-2"
          >
            <Import size={16} /> Import Payments
          </Button>

          <Link to="/admin/payments/add">
            <Button>
              <Plus size={18} className="mr-1" />
              Add Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* WINDOWS-STYLE LOADER OVERLAY */}
      {loadingImport && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Import size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Importing Payments</h3>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">
                {importStatus.split(' ')[0]}
              </span>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* File Info */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 flex justify-between">
                  <span>File Name:</span>
                  <span className="text-slate-800 truncate max-w-[200px]">{importFileInfo.name}</span>
                </p>
                {selectedSheet && (
                  <p className="text-sm font-medium text-slate-500 flex justify-between">
                    <span>Sheet Name:</span>
                    <span className="text-blue-600 font-bold truncate max-w-[200px]">{selectedSheet}</span>
                  </p>
                )}
                <p className="text-sm font-medium text-slate-500 flex justify-between">
                  <span>Total Size:</span>
                  <span className="text-slate-800">{importFileInfo.size} MB</span>
                </p>
              </div>

              {/* Progress Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-700">{importStatus}</p>
                    <p className="text-xs text-slate-500">
                      {importStatus.includes("Uploading")
                        ? `${importLoadedSize} MB of ${importFileInfo.size} MB`
                        : "Preparing data..."}
                    </p>
                  </div>
                  <span className="text-2xl font-black text-blue-600 leading-none">
                    {importProgress}%
                  </span>
                </div>

                {/* Progress Bar Container */}
                <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300 shadow-inner">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500 ease-out relative"
                    style={{ width: `${importProgress}%` }}
                  >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 w-full h-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <p className="text-[11px] text-center text-slate-400 italic">
                Please do not close this window or refresh the page until the process is complete.
              </p>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}} />
        </div>
      )}

      {/* FILTER SECTION */}
      <Card className="p-6 space-y-4">
        {/* TOP ROW */}
        <div className="flex flex-wrap gap-4 items-center items-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition
              ${showFilters
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 hover:bg-gray-200"
              }`}
          >
            <Filter size={16} />
            Filters
          </button>

          <div className="flex-1 min-w-[250px]">
            <FormField label="Search Payment">
              <Input
                placeholder="Search payment..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  dispatch(setPage(1));
                }}
              />
            </FormField>
          </div>

          {/* DATE FILTER (NOW TOP ROW) */}
          {/* <FormField label="From Date">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                dispatch(setPage(1));
              }}
              className="px-4 py-2 border rounded-lg cursor-pointer"
            />
          </FormField>
          <FormField label="To Date">
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                dispatch(setPage(1));
              }}
              className="px-4 py-2 border rounded-lg cursor-pointer"
            />
          </FormField> */}

          {/* Sort By Crop Year */}
          <FormField label="Sort By Crop Year">
            <select
              value={cropYear}
              onChange={(e) => {
                setCropYear(e.target.value);
                dispatch(setPage(1));
              }}
              className="px-4 py-2 border rounded-lg cursor-pointer"
            >
              <option value="">Select Crop Years</option>
              {cropYears?.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </FormField>

          {/* Bill Type Filter */}
          <FormField label="Bill Type">
            <select
              value={billType}
              onChange={(e) => {
                setBillType(e.target.value);
                dispatch(setPage(1));
              }}
              className="px-4 py-2 border rounded-lg cursor-pointer"
            >
              <option value="">Select Bill Type</option>
              {filterOptions.billTypes?.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FormField>

          {/* SORT */}
          <FormField label="Sort By">
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                dispatch(setPage(1));
              }}
              className="px-4 py-2 border rounded-lg cursor-pointer"
            >
              <option value="date_desc">Newest</option>
              <option value="date_asc">Oldest</option>
              <option value="imported">Imported</option>
              {/* <option value="status_Pending">Pending</option>
            <option value="status_Approved">Approved</option>
            <option value="status_Rejected">Rejected</option> */}
            </select>
          </FormField>

          <button
            onClick={handleReset}
            className={`px-4 py-2 rounded-lg cursor-pointer cursor-pointer transition ${isFilterActive
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-600"
              }`}
          >
            Reset
          </button>
        </div>

        {/* CASCADING PANEL */}
        <div
          className={`transition-all duration-500 overflow-hidden cursor-pointer ${showFilters ? "max-h-[400px] opacity-100 mt-4" : "max-h-0 opacity-0"
            }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setBranch("");
                setWarehouseType("");
                setWarehouseName("");
                dispatch(setPage(1));
              }}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">Select District</option>
              {filterOptions.districts?.map((d) => (
                <option key={d.district_name} value={d.district_name}>
                  {d.district_name}
                </option>
              ))}
            </select>

            <select
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                setWarehouseType("");
                setWarehouseName("");
                dispatch(setPage(1));
              }}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">Select Branch</option>
              {uniqueBranches?.map((b) => (
                <option key={`${b.branch_name}-${b.id || Math.random()}`} value={b.branch_name}>
                  {b.branch_name}
                </option>
              ))}
            </select>

            <select
              value={warehouseType}
              onChange={(e) => {
                setWarehouseType(e.target.value);
                setWarehouseName("");
                dispatch(setPage(1));
              }}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">Select Type</option>
              {uniqueTypes?.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={warehouseName}
              onChange={(e) => {
                setWarehouseName(e.target.value);
                dispatch(setPage(1));
              }}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">Select Warehouse</option>
              {uniqueWarehouses?.map((w) => (
                <option key={`${w.warehouse_name}-${w.id || Math.random()}`} value={w.warehouse_name}>
                  {w.warehouse_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {showPreview && (
        <Card className="p-6 overflow-x-auto overflow-y-hidden whitespace-nowrap w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Preview Imported Data</h2>

            {availableSheets.length > 1 && (
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-sm font-medium text-slate-600">Select Sheet:</span>
                <select
                  value={selectedSheet}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {availableSheets.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <Table columns={previewColumns} data={fullData.slice((previewPage - 1) * previewLimit, previewPage * previewLimit)} />

          {previewTotalPages > 1 && (
            <Pagination
              currentPage={previewPage}
              totalPages={previewTotalPages}
              totalRecords={fullData.length}
              limit={previewLimit}
              onPageChange={setPreviewPage}
            />
          )}

          <div className="mt-4 flex gap-2">
            <div className="flex gap-4 items-center">
              <select
                value={importMode}
                onChange={(e) => setImportMode(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="update">Update Existing</option>
                <option value="insert">Insert New</option>
              </select>

              <Button onClick={handleBulkInsert} disabled={loadingImport}>
                {loadingImport
                  ? "Importing..."
                  : importMode === "insert"
                    ? "Insert All"
                    : "Update Data"}
              </Button>
            </div>

            <Button
              variant="secondary"
              onClick={() => {
                setShowPreview(false);
                setPreviewData([]);
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* TABLE */}
      <Card>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payments found
          </div>
        ) : (
          <>
            <Table columns={columns} data={items} stickyActions={true} />
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalRecords={total}
                  limit={limit}
                  onPageChange={(newPage) => dispatch(setPage(newPage))}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

const FormField = ({ label, children, error }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1 text-gray-700">{label}</label>
    {children}
    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
  </div>
);

export default PaymentList;
