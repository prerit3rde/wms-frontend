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
  const { items, totalPages, page, limit, loading } = useSelector(
    (state) => state.payments,
  );

  /* ================= STATE ================= */
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("date_desc");
  const [showFilters, setShowFilters] = useState(false);

  const [district, setDistrict] = useState("");
  const [branch, setBranch] = useState("");
  const [warehouseType, setWarehouseType] = useState("");
  const [warehouseName, setWarehouseName] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [cropYear, setCropYear] = useState("");
  const [cropYears, setCropYears] = useState([]);

  const [importMode, setImportMode] = useState("update"); // default

  const [filterOptions, setFilterOptions] = useState({
    districts: [],
    branches: [],
    warehouseNames: [],
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
    if (!isNaN(value)) {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + value * 86400000);
      return formatToYMD(date);
    }

    // ✅ Already Date object
    if (value instanceof Date) {
      return formatToYMD(value);
    }

    if (typeof value === "string") {
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
}, []);

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
      "Period",
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
    const data = allPayments.map((row, index) => [
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
      formatPeriod(row.from_date),

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
    ]);

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
  { key: "commodity", label: "Commodity" },
  { key: "depositers_name", label: "Depositer Name" },
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
            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
          >
            <Eye size={16} />
          </Link>

          {/* EDIT */}
          <Link
            to={`/admin/payments/edit/${row.id}`}
            onClick={() => {
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
const previewLimit = 50;
const previewTotalPages = Math.ceil(fullData.length / previewLimit);

const fileInputRef = useRef(null);

const fieldLabels = {
  // ================= WAREHOUSE =================
  district_name: "District",
  branch_name: "Branch",
  warehouse_name: "Warehouse Name",
  warehouse_owner_name: "Warehouse Owner",
  warehouse_type: "Warehouse Type",
  warehouse_no: "Warehouse No",
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
  actual_passed_amount: "Actual Passed Amount",
  depositers_name: "Depositers Name",

  scientific_capacity: "Scientific Capacity",
  number_of_days: "Number of Days",
  per_day_rate: "Per Day Rate",
  rent_amount_on_scientific_capacity: "Rent Amount On Scientific Capacity",

  tds: "TDS",
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

const ENGLISH_WHITELIST = [
  "INDORE", "DHAR", "KHANDWA", "KHARGONE", "JHABUA", "BURHANPUR", "BADWANI", "BARWANI", "DEWAS", "RATLAM", "UJJAIN", "BHOPAL", "GWALIOR", "JABALPUR",
  "WAREHOUSE", "LOGISTICS", "PARK", "AGRO", "PVT", "LTD", "PART", "GODOWN", "DISTRICT", "BRANCH", "EMI", "PAN", "HOLDER", "BILL", "NO"
];

const convertHindi = (text, fieldName = "") => {
  if (text === null || text === undefined || text === "") return text;
  if (typeof text === "number") return text;
  
  const str = text.toString().trim();
  
  // 1. STRICT COLUMN PROTECTION
  // These fields are always English in your sheets.
  const PROTECTED_FIELDS = [
    "district_name", "scheme", "pan_no", "pan_holder", 
    "total_amount", "amount_paid", "balance_amount", 
    "crop_year", "processed_period", "warehouse_no"
  ];
  if (PROTECTED_FIELDS.includes(fieldName)) return str;

  // 2. Length-1 Protection (Protects A, B schemes and single digits)
  if (str.length === 1) return str;

  // 3. Numeric/Serial Date/ID check
  if (!isNaN(str) && !isNaN(parseFloat(str))) return str;

  // 4. Forced KrutiDev Symbols (High Confidence)
  if (str.startsWith("'") || /[\[\]\\;{}=?+]/.test(str)) {
    try { return kru2uni(str).trim(); } catch (e) { return str; }
  }

  const upperStr = str.toUpperCase();

  // 5. Whitelist Check (District names and common WMS words)
  const isWhitelisted = ENGLISH_WHITELIST.some(word => upperStr.includes(word));
  if (isWhitelisted) return str;

  // 6. Consonant Cluster Check (KrutiDev often has 3+ consonants without vowels)
  const hasWeirdCluster = /[^aeiou]{3,}/i.test(str);
  if (hasWeirdCluster && !isWhitelisted) {
    try { return kru2uni(str).trim(); } catch (e) { return str; }
  }

  // 7. Case & Vowel Analysis
  const isProperCase = /^[A-Z][a-z0-9]+(\s+[A-Z][a-z0-9]+)*$/.test(str);
  const isAllCaps = /^[A-Z0-9\s,./&()*'#_-]+$/.test(str) && str.length > 2;

  // Higher threshold (38%) for English names
  const vowels = (str.match(/[aeiou]/gi) || []).length;
  const ratio = vowels / str.length;
  const hasHealthyVowels = ratio > 0.38 && str.length > 3;

  if (isAllCaps) return str;
  if (isProperCase && hasHealthyVowels) return str;

  // 8. Default to Conversion
  try {
    return kru2uni(str).trim();
  } catch (err) {
    return str;
  }
};

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

  const match = commodity.match(/-(\d{2,4})$/); // handle Rice-2023 or moong-24
  if (!match) return "";

  const yrStr = match[1];
  const yr = parseInt(yrStr.slice(-2));
  const fullYear = 2000 + yr;

  return `${fullYear - 1}-${String(fullYear).slice(-2)}`;
};

  const processSheetData = async (sheetName, wb) => {
    try {
      setLoadingImport(true);
      const sheet = wb.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, {
        range: 3, // 🔥 skip first 3 rows (0-based index)
        raw: false,
        defval: "", // avoid undefined values
      });

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
        stock_shortage_deduction: "stock_shortage_deduction",
        bank_solvancy: "bank_solvancy",
        insurance: "insurance",
        other_deduction: "other_deduction_amount",
        pay_to_jvs_amount: "pay_to_jvs_amount",
        payment_by: "payment_by",
        payment_date: "payment_date",
        qtr: "qtr",
        remarks: "remarks",
        amount_deducted_against_gain: "amount_deducted_against_gain_loss",
      };

      const normalizeKeys = (row) => {
        const newRow = {};
        Object.keys(row).forEach((key) => {
          const cleanKey = key.toString().trim().toLowerCase()
            .replace(/\s+/g, "_").replace(/[.%()]/g, "").replace(/__+/g, "_");
          let mappedKey = keyMapping[cleanKey] || cleanKey;
          if (mappedKey === "gdn_no") mappedKey = "warehouse_no";
          newRow[mappedKey] = row[key];
        });
        return newRow;
      };

      const formattedData = jsonData.map((row) => {
        const normalizedRow = normalizeKeys(row);
        const periodData = processPeriod(normalizedRow.period);
        return {
          ...normalizedRow,
          from_date: periodData.from_date || null,
          to_date: periodData.to_date || null,
          month: periodData.month || "",
          financial_year: periodData.financial_year || "",
          crop_year: normalizedRow.crop_year || getCropYearFromCommodity(normalizedRow.commodity) || "",
          payment_date: formatExcelDate(normalizedRow.payment_date),
        };
      });

      const cleanedData = removeEmptyColumns(formattedData);

      const finalData = cleanedData.map((row) => ({
        ...row,
        branch_name: convertHindi(row.branch_name),
        warehouse_name: convertHindi(row.warehouse_name),
        district_name: row.district_name,
      }));

      let warehouses = [];
      try {
        const warehousesRes = await axios.get("/warehouses");
        warehouses = warehousesRes.data.data;
      } catch (err) {
        console.error("Failed to fetch warehouses", err);
      }

      const enrichedData = finalData.map((row) => {
        const match = warehouses.find(
          (w) => w.warehouse_name === row.warehouse_name && w.branch_name === row.branch_name
        );
        return { ...row, cropData: match?.cropData || [] };
      });

      const newCropYears = new Set(cropYears);
      finalData.forEach((row) => {
        if (row.crop_year) newCropYears.add(row.crop_year);
      });

      setCropYears([...newCropYears]);
      setFullData(enrichedData);
      setPreviewPage(1); // Reset to first page
      setPreviewData(enrichedData.slice(0, 50));
      setShowPreview(true);
      setLoadingImport(false);
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

    setLoadingImport(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: "array" });
        setWorkbook(wb);
        setAvailableSheets(wb.SheetNames);
        
        const firstSheet = wb.SheetNames[0];
        setSelectedSheet(firstSheet);
        await processSheetData(firstSheet, wb);

        fileInputRef.current.value = "";
      } catch (err) {
        console.error("File reading failed", err);
        toast.error("File reading failed");
        setLoadingImport(false);
      }
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

    const res = await axios.post("/payments/bulk-insert", {
      data: fullData,
      mode: importMode,
    });

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
  }
};

const toTitleCase = (str) => {
  return str
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const previewColumns = Object.keys(previewData[0] || {}).map((key) => ({
  key,
  label: fieldLabels[key] || toTitleCase(key),
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

    {/* LOADER OVERLAY */}
    {loadingImport && (
      <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-semibold text-blue-800">Processing File, Please wait...</p>
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
            {cropYears.map((year) => (
              <option key={year} value={year}>
                {year}
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
            {filterOptions.districts.map((d) => (
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
            {filteredBranches.map((b) => (
              <option key={b.branch_name} value={b.branch_name}>
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
            {uniqueTypes.map((type) => (
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
            {filteredWarehouses
              .map((w) => (
                <option key={w.warehouse_name} value={w.warehouse_name}>
                  {w.warehouse_name}
                </option>
              ))}
          </select>
        </div>
      </div>
    </Card>

    {showPreview && (
      <Card className="p-6 max-w-[1217px] overflow-x-auto overflow-y-hidden whitespace-nowrap w-full">
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
          <div className="mt-4 flex flex-col md:flex-row items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 gap-4">
            <span className="text-sm font-semibold text-slate-700">
              Showing {(previewPage - 1) * previewLimit + 1} to {Math.min(previewPage * previewLimit, fullData.length)} of <span className="text-blue-600">{fullData.length}</span> records
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
                onClick={() => setPreviewPage(prev => prev - 1)}
                className="px-2 py-1 text-xs bg-white border rounded hover:bg-slate-100 disabled:opacity-30 mr-2"
              >
                Prev
              </button>

              {/* Numbered pagination with dots */}
              {[...Array(previewTotalPages)].map((_, i) => {
                const p = i + 1;
                // Show first, last, current, and pages around current
                if (p === 1 || p === previewTotalPages || (p >= previewPage - 2 && p <= previewPage + 2)) {
                  return (
                    <button
                      key={p}
                      onClick={() => setPreviewPage(p)}
                      className={`min-w-[32px] px-2 py-1 text-xs border rounded transition ${
                        previewPage === p ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 hover:bg-slate-100 border-slate-300"
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
                onClick={() => setPreviewPage(prev => prev + 1)}
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
          <Table columns={columns} data={items} />
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
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
