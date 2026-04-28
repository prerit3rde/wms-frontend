import { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWarehouses,
  deleteWarehouse,
  setPage,
} from "../../redux/slices/warehouseSlice";
import { Eye, Pencil, Trash2, Plus, Filter, Import } from "lucide-react";
import { Form, Link } from "react-router-dom";
import axios from "../../services/axios";
import Button from "../../components/global/Button";
import Card from "../../components/global/Card";
import Table from "../../components/global/Table";
import Input from "../../components/global/Input";
import Pagination from "../../components/global/Pagination";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import kru2uni from "@anthro-ai/krutidev-unicode";

const WarehouseList = () => {
  const dispatch = useDispatch();

  const {
    items: warehouses,
    totalPages,
    page,
    limit,
    loading,
    error,
  } = useSelector((state) => state.warehouse);

  /* ===============================
     STATE
  =============================== */
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("date_desc");
  const [showFilters, setShowFilters] = useState(false);

  const [district, setDistrict] = useState("");
  const [branch, setBranch] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [warehouseType, setWarehouseType] = useState("");

  const [cropYear, setCropYear] = useState("");

  /* ===============================
     IMPORT / EXPORT STATE
  =============================== */
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [workbook, setWorkbook] = useState(null);
  const [isImportLoading, setIsImportLoading] = useState(false);

  // IMPORT PROGRESS STATE
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState("");
  const [importFileInfo, setImportFileInfo] = useState({ name: "", size: 0 });
  const [importLoadedSize, setImportLoadedSize] = useState(0);

  const [filterOptions, setFilterOptions] = useState({
    districts: [],
    branches: [],
    warehouseNames: [],
    warehouseTypes: [],
    cropYears: [],
  });

  const [previewPage, setPreviewPage] = useState(1);
  const previewLimit = 50;
  const previewTotalPages = Math.ceil(previewData.length / previewLimit);

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
    "Bank Solvancy dk izek.k i= dh jkf'k": "Bank Solvancy का प्रमाण पत्र की राशि",
    "Bank Solvancy ds 'kiFk i= dh jkf'k": "Bank Solvancy के शपथ पत्र की राशि",
    "Bank Solvancy Diduction By Bill": "Bank Solvancy Diduction By Bill",
    "Balance Amount Bank Solvancy": "Balance Amount Bank Solvancy",
    "TOTAL EMI": "TOTAL EMI",
    "EMI Diduction By Bill": "EMI Diduction By Bill",
    "Balance Amount EMI": "Balance Amount EMI",
    "Pan Card Holder": "Pan Card Holder",
    "Pan Card No": "Pan Card No",
    "'kiFk i=": "शपथ पत्र",
    "izek.k i=": "प्रमाण पत्र",
    "'kifk i=": "शपथ पत्र",
    "izek.k i= ": "प्रमाण पत्र",
    "izek.k i= 450000": "प्रमाण पत्र 450000"
  };

  // Define exactly what we want to show in the preview (and store in DB)
  const REQUIRED_MAPPING = [
    { key: "जिला", label: "जिला", field: "district_name" },
    { key: "शाखा", label: "शाखा", field: "branch_name" },
    { key: "वेअरहाउस", label: "वेअरहाउस", field: "warehouse_name" },
    { key: "योजना", label: "Scheme", field: "scheme" },
    { key: "योजना दर राशि", label: "Scheme Rate Amount", field: "scheme_rate_amount" },
    { key: "अनुबंधित भंडारण क्षमता", label: "भंडारण क्षमता", field: "storage_capacity" },
    { key: "अनुबंध दिनांक", label: "अनुबंध दिनांक", field: "contract_date" },
    { key: "गोदाम क्रमांक", label: "गोदाम क्र.", field: "warehouse_no" },
    { key: "Bank Solvancy का प्रमाण पत्र की राशि", label: "BS Type Cell", field: "bs_cert_raw" },
    { key: "Bank Solvancy के शपथ पत्र की राशि", label: "BS Amount Cell", field: "bs_aff_raw" },
    { key: "Bank Solvancy Diduction By Bill", label: "BS Deduction", field: "bank_solvency_deduction_by_bill" },
    { key: "Balance Amount Bank Solvancy", label: "BS Balance", field: "bank_solvency_balance_amount" },
    { key: "TOTAL EMI", label: "TOTAL EMI", field: "total_emi" },
    { key: "EMI Diduction By Bill", label: "EMI Deduction", field: "emi_deduction_by_bill" },
    { key: "Balance Amount EMI", label: "EMI Balance", field: "balance_amount_emi" },
    { key: "Pan Card Holder", label: "PAN Holder", field: "pan_card_holder" },
    { key: "Pan Card No", label: "PAN No", field: "pan_card_number" },
  ];

  const ENGLISH_WHITELIST = [
    "INDORE", "DHAR", "KHANDWA", "KHARGONE", "JHABUA", "BURHANPUR", "BADWANI", "BARWANI", "DEWAS", "RATLAM", "UJJAIN", "BHOPAL", "GWALIOR", "JABALPUR",
    "WAREHOUSE", "LOGISTICS", "PARK", "AGRO", "PVT", "LTD", "PART", "GODOWN", "DISTRICT", "BRANCH", "EMI", "PAN", "HOLDER", "BILL", "NO", "NAME", "PMS", "WMS", "JVS", "SCHEME",
    "SHREE", "SHRI", "SAMITI", "MARYADIT", "ADARSH", "SHAKARI", "VIPNAN", "DEPALPUR", "WARE", "HOUSE", "SUPPLY"
  ];

  const handleKruToUni = (text, fieldName = "") => {
    if (text === null || text === undefined || text === "") return text;
    if (typeof text === "number") return text;

    const str = text.toString().trim();

    // 0. Dictionary Match (Highest Priority for Headers)
    const directMatch = krutiDevMapping[str];
    if (directMatch) return directMatch;

    // 1. Unicode Detection (Skip if already Devnagri)
    if (/[\u0900-\u097F]/.test(str)) return str;

    // 2. STRICT PROTECTED FIELDS
    const PROTECTED_FIELDS = [
      "pan_card_number", "gst_no", "emi_deduction_by_bill", "storage_capacity",
      "total_emi", "scheme_rate_amount", "warehouse_no",
      "bank_solvency_deduction_by_bill", "bank_solvency_balance_amount", "balance_amount_emi",
      "bs_cert", "bs_aff", "scheme", "scheme_rate_amount",
      "bank_solvency_certificate_amount", "bank_solvency_affidavit_amount",
      "bs_cert_raw", "bs_aff_raw"
    ];
    if (PROTECTED_FIELDS.includes(fieldName)) return str;

    // 3. BASIC FORMAT PROTECTION (NUMBERS & SINGLE CHARS)
    if (str.length <= 1) return str;
    if (!isNaN(str) && !isNaN(parseFloat(str))) return str;

    const hasKrutiMarkers = (s) => /[¼½¾[\]\\;{}/.]/.test(s);

    const isTokenEnglish = (token) => {
      const upper = token.toUpperCase();
      // Whitelist check
      if (ENGLISH_WHITELIST.some(word => upper.includes(word))) return true;
      // PAN check
      if (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(upper)) return true;

      // Pure numeric / codes protection
      if (/^[0-9./_-]+$/.test(token)) return true;

      const letters = token.replace(/[^a-zA-Z]/g, '');
      if (letters.length <= 1) return true; // Keep single letters (A, B) as English

      const vowels = (letters.match(/[aeiou]/gi) || []).length;
      const ratio = vowels / letters.length;

      // Increased thresholds for long KrutiDev words (even with many vowels)
      if (ratio >= 0.35 && letters.length > 5 && !hasKrutiMarkers(token)) return true;
      if (ratio >= 0.40 && !hasKrutiMarkers(token)) return true;

      // Consecutive consonants check
      if (/[b-df-hj-np-tv-z]{4,}/i.test(letters)) return false;

      return ratio >= 0.25;
    };

    // Initial check for whitelisted whole strings
    const upperStr = str.toUpperCase();
    if (ENGLISH_WHITELIST.some(word => upperStr.includes(word)) && !hasKrutiMarkers(str)) return str;

    const parts = str.split(/(\s+)/);
    return parts.map(part => {
      if (!part.trim()) return part;
      if (isTokenEnglish(part) && !hasKrutiMarkers(part)) return part;

      try {
        return kru2uni(part);
      } catch (e) {
        return part;
      }
    }).join("");
  };

  /* ===============================
     ACTIVE FILTER DETECTION
  =============================== */
  const isFilterActive = useMemo(() => {
    return (
      search ||
      district ||
      branch ||
      warehouseName ||
      warehouseType ||
      sortOption !== "date_desc" ||
      cropYear
    );
  }, [
    search,
    district,
    branch,
    warehouseName,
    warehouseType,
    sortOption,
    cropYear,
  ]);

  /* ===============================
     FETCH FILTER OPTIONS
  =============================== */
  const fetchFilters = async () => {
    try {
      const response = await axios.get("/warehouses/filters");
      setFilterOptions(response.data.data);
    } catch (error) {
      console.error("Failed to load filter options");
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  /* ===============================
     FETCH DATA
  =============================== */
  useEffect(() => {
    dispatch(
      fetchWarehouses({
        page,
        limit,
        search,
        sort: sortOption,
        district,
        branch,
        warehouse_name: warehouseName,
        warehouse_type: warehouseType,
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
    cropYear,
  ]);

  /* ===============================
     RESET
  =============================== */
  const handleReset = () => {
    setSearch("");
    setSortOption("date_desc");
    setDistrict("");
    setBranch("");
    setWarehouseName("");
    setWarehouseType("");
    dispatch(setPage(1));
    setCropYear("");
  };

  /* ===============================
     CASCADE LOGIC
  =============================== */
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
        (!branch || w.branch_name === branch) &&
        (!warehouseName || w.warehouse_name === warehouseName),
    )
    .map((w) => w.warehouse_type);

  const uniqueTypes = [...new Set(filteredTypes)];

  const uniqueBranches = [...new Map(filteredBranches.map(b => [b.branch_name, b])).values()];
  const uniqueWarehouses = [...new Map(filteredWarehouses.map(w => [w.warehouse_name, w])).values()];

  /* ===============================
     TABLE COLUMNS
  =============================== */
  const columns = [
    { key: "district_name", label: "District" },
    { key: "branch_name", label: "Branch" },
    { key: "warehouse_name", label: "Warehouse Name" },
    { key: "warehouse_owner_name", label: "Owner" },
    { key: "warehouse_type", label: "Type" },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <Link
            to={`/admin/warehouses/view/${row.id}`}
            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
          >
            <Eye size={16} />
          </Link>

          <Link
            to={`/admin/warehouses/edit/${row.id}`}
            className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition"
          >
            <Pencil size={16} />
          </Link>

          <button
            onClick={async () => {
              if (
                window.confirm(
                  "Are you sure you want to delete this warehouse?",
                )
              ) {
                await dispatch(deleteWarehouse(row.id));
                toast.success("Warehouse deleted successfully");
                await fetchFilters(); // ✅ SYNC FILTERS AFTER DELETE
              }
            }}
            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];


  const fileInputRef = useRef(null);

  const fieldLabels = {
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
    bank_solvency_balance_amount: "Balance Amount Bank Solvancy",
    total_emi: "Total EMI",
    emi_deduction_by_bill: "EMI Deduction by Bill",
    balance_amount_emi: "EMI Balance",
    pan_card_holder: "PAN Card Holder",
    pan_card_number: "PAN Card Number",
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
    setIsImportLoading(true);
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
      
      setTimeout(async () => {
        try {
          const data = new Uint8Array(evt.target.result);
          const wb = XLSX.read(data, { type: "array" });
          setWorkbook(wb);
          setAvailableSheets(wb.SheetNames);

          const firstSheetName = wb.SheetNames[0];
          setSelectedSheet(firstSheetName);
          setImportProgress(30);

          setTimeout(async () => {
            await processWarehouseSheet(firstSheetName, wb);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }, 100);
        } catch (error) {
          console.error("Import Error:", error);
          toast.error("Failed to parse Excel file");
          setIsImportLoading(false);
          setImportStatus("");
        }
      }, 100);
    };

    reader.onerror = () => {
      toast.error("Error reading file");
      setIsImportLoading(false);
      setImportStatus("");
    };

    reader.readAsArrayBuffer(file);
  };

  const processWarehouseSheet = async (sheetName, wb) => {
    try {
      setIsImportLoading(true);
      setImportStatus("Optimizing sheet...");
      setImportProgress(35);
      await new Promise(resolve => setTimeout(resolve, 100));

      const sheet = wb.Sheets[sheetName];
      const ref = XLSX.utils.decode_range(sheet['!ref'] || "A1:A1");
      let lastRow = ref.s.r;
      for (let r = ref.e.r; r >= ref.s.r; r--) {
        for (let c = ref.e.c; c >= ref.s.c; c--) {
          if (sheet[XLSX.utils.encode_cell({r, c})]) {
            if (r > lastRow) lastRow = r;
            break;
          }
        }
        if (lastRow > ref.s.r && r < lastRow - 100) break;
      }
      sheet['!ref'] = XLSX.utils.encode_range({ s: ref.s, e: { r: lastRow, c: ref.e.c } });

      const jsonDataRaw = XLSX.utils.sheet_to_json(sheet, { range: 1, raw: false });
      const jsonData = jsonDataRaw.filter(row => Object.values(row).filter(v => v !== "").length > 5);

      setImportProgress(50);
      setImportStatus(`Processing ${jsonData.length} records...`);
      await new Promise(resolve => setTimeout(resolve, 200));

      setImportProgress(75);
      setImportStatus("Mapping fields...");
      
      const transformedData = [];
      const CHUNK_SIZE = 500;
      for (let i = 0; i < jsonData.length; i += CHUNK_SIZE) {
        const chunk = jsonData.slice(i, i + CHUNK_SIZE);
        transformedData.push(...chunk.map(transformRow));
        setImportProgress(75 + Math.round((i / jsonData.length) * 20));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setPreviewData(jsonData); 
      setImportProgress(100);
      setShowPreview(true);
      setIsImportLoading(false);
      setImportStatus("");
    } catch (err) {
      console.error("Sheet processing failed", err);
      toast.error("Sheet processing failed");
      setIsImportLoading(false);
      setImportStatus("");
    }
  };

  const handleSheetChange = async (sheetName) => {
    if (!workbook) return;
    setSelectedSheet(sheetName);
    await processWarehouseSheet(sheetName, workbook);
    setPreviewPage(1); // Reset to first page
  };

  const transformRow = (row) => {
    const cleanRow = {};

    // Normalize mapping search
    Object.keys(row).forEach(excelKey => {
      const unicodeKey = handleKruToUni(excelKey);
      const normKey = unicodeKey.replace(/\s+/g, '').toLowerCase();
      const normExcel = excelKey.replace(/\s+/g, '').toLowerCase();

      const match = REQUIRED_MAPPING.find(m => {
        const mNorm = m.key.replace(/\s+/g, '').toLowerCase();
        return mNorm === normKey || mNorm === normExcel;
      });

      if (match) {
        const rawVal = row[excelKey];
        cleanRow[match.field] = handleKruToUni(rawVal, match.field);
      }
    });

    // --- CONDITIONAL BS LOGIC ---
    const bsTypeRaw = cleanRow.bs_cert_raw?.toString() || "";
    const bsTypeUnicode = handleKruToUni(bsTypeRaw);
    const bsAmountFromAffCol = parseFloat(cleanRow.bs_aff_raw?.toString().replace(/,/g, "")) || 0;

    if (bsTypeUnicode.includes("शपथ पत्र")) {
      cleanRow.is_affidavit = true;
      cleanRow.bs_type = "Affidavit";
      cleanRow.bank_solvency_affidavit_amount = bsAmountFromAffCol;
      cleanRow.bank_solvency_certificate_amount = 0;
    } else if (bsTypeUnicode.includes("प्रमाण पत्र")) {
      cleanRow.is_affidavit = false;
      cleanRow.bs_type = "Certificate";
      cleanRow.bank_solvency_affidavit_amount = 0;

      // Extract digits from the type cell (e.g. "प्रमाण पत्र 450000")
      const numericMatch = bsTypeUnicode.match(/(\d+)/);
      if (numericMatch) {
        cleanRow.bank_solvency_certificate_amount = parseFloat(numericMatch[1]);
      } else {
        // Fallback to the other column if no number in this cell
        cleanRow.bank_solvency_certificate_amount = bsAmountFromAffCol;
      }
    } else {
      // Default fallback
      const fallbackAmount = bsAmountFromAffCol || parseFloat(bsTypeUnicode.replace(/[^\d.]/g, "")) || 0;
      cleanRow.is_affidavit = false;
      cleanRow.bs_type = "Certificate";
      cleanRow.bank_solvency_certificate_amount = fallbackAmount;
      cleanRow.bank_solvency_affidavit_amount = 0;
    }

    return cleanRow;
  };

  const handleBulkInsert = async () => {
    setIsImportLoading(true);
    setImportStatus("Uploading to server...");
    setImportProgress(0);
    try {
      setImportProgress(10);
      setImportStatus("Transforming data...");
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const transformedData = previewData.map(transformRow);

      // Reverse order so first row of sheet appears first in newest-first sorted list
      transformedData.reverse();

      setImportProgress(30);
      setImportStatus("Starting upload...");

      const response = await axios.post("/warehouses/bulk-insert", {
        data: transformedData,
        default_crop_year: selectedSheet,
      }, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setImportProgress(percentCompleted);
            setImportLoadedSize((progressEvent.loaded / (1024 * 1024)).toFixed(2));
          }
        }
      });

      setImportProgress(100);
      toast.success(response.data.message || "Warehouses imported successfully!");

      setShowPreview(false);
      setPreviewData([]);

      // ✅ RESET FILE INPUT AGAIN
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }

      dispatch(fetchWarehouses({ page, limit }));
      await fetchFilters(); // ✅ SYNC FILTERS AFTER IMPORT
    } catch (error) {
      toast.error("Import failed!");
    } finally {
      setIsImportLoading(false);
      setImportStatus("");
      setImportProgress(0);
    }
  };

  // Reorder and transform columns for preview
  const previewColumns = [];
  REQUIRED_MAPPING.forEach(m => {
    if (["contract_date", "bs_cert_raw", "bs_aff_raw"].includes(m.field)) return;
    if (previewColumns.find(c => c.key === m.field)) return;

    previewColumns.push({ key: m.field, label: m.label });

    // Insert BS derived columns right after Warehouse No
    if (m.field === "warehouse_no") {
      previewColumns.push({ key: "bs_type", label: "BS Type" });
      previewColumns.push({ key: "bank_solvency_certificate_amount", label: "BS Certificate Amount" });
      previewColumns.push({ key: "bank_solvency_affidavit_amount", label: "Bank Solvency Affidavit Amount" });
    }
  });

  return (
    <div className="space-y-6 relative">
      {/* WINDOWS-STYLE LOADER OVERLAY */}
      {isImportLoading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Import size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Importing Warehouses</h3>
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

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}} />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Warehouse Management
        </h1>
        <div className="flex gap-2">
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
            <Import size={16} /> Import Warehouses
          </Button>

          {/* ADD */}
          <Link to="/admin/warehouses/add">
            <Button>
              <Plus size={18} className="mr-1" />
              Add Warehouse
            </Button>
          </Link>
        </div>
      </div>

      {showPreview && previewData.length > 0 && (
        <Card className="p-6 overflow-x-auto overflow-y-hidden whitespace-nowrap w-full border-blue-100 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              Preview Imported Data
            </h2>

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

          <Table
            columns={previewColumns}
            data={previewData.slice((previewPage - 1) * previewLimit, previewPage * previewLimit).map(transformRow)}
          />

          {previewTotalPages > 1 && (
            <div className="mt-4 flex flex-col md:flex-row items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 gap-4">
              <span className="text-sm font-semibold text-slate-700">
                Showing {(previewPage - 1) * previewLimit + 1} to {Math.min(previewPage * previewLimit, previewData.length)} of <span className="text-blue-600">{previewData.length}</span> records
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

                {[...Array(previewTotalPages)].map((_, i) => {
                  const p = i + 1;
                  if (p === 1 || p === previewTotalPages || (p >= previewPage - 2 && p <= previewPage + 2)) {
                    return (
                      <button
                        key={p}
                        onClick={() => setPreviewPage(p)}
                        className={`min-w-[32px] px-2 py-1 text-xs border rounded transition ${previewPage === p ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 hover:bg-slate-100 border-slate-300"
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

          <div className="mt-6 flex gap-3">
            <Button onClick={handleBulkInsert}>Insert All</Button>

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

      {/* Controls */}
      <Card className="p-6 space-y-4">
        {/* Top Row */}
        <div className="flex flex-wrap gap-4 items-end">
          {/* Filter Button */}
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

          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <FormField label="Search Warehouse">
              <Input
                type="text"
                placeholder="Search warehouse..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  dispatch(setPage(1));
                }}
              />
            </FormField>
          </div>

          {/* Crop Year */}
          <FormField label="Sort By Crop Year">
            <select
              value={cropYear}
              onChange={(e) => {
                setCropYear(e.target.value);
                dispatch(setPage(1));
              }}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">Select Crop Year</option>

              {filterOptions.cropYears.map((cy) => (
                <option key={cy.crop_year} value={cy.crop_year}>
                  {cy.crop_year}
                </option>
              ))}
            </select>
          </FormField>

          {/* Sort */}
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
              {/* <option value="district_asc">District A-Z</option>
            <option value="district_desc">District Z-A</option>
            <option value="name_asc">Warehouse A-Z</option>
            <option value="name_desc">Warehouse Z-A</option> */}
            </select>
          </FormField>

          {/* Reset (Active Color) */}
          <button
            onClick={handleReset}
            className={`px-4 py-2 rounded-lg cursor-pointer transition
              ${isFilterActive
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-600"
              }`}
          >
            Reset
          </button>
        </div>

        {/* Animated Filter Panel */}
        <div
          className={`transition-all duration-500 overflow-hidden ${showFilters ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
            }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
            {/* 1️⃣ District (Always Enabled) */}
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

            {/* 2️⃣ Branch (Enabled only if District selected) */}
            <select
              value={branch}
              disabled={!district}
              onChange={(e) => {
                setBranch(e.target.value);
                setWarehouseType("");
                setWarehouseName("");
                dispatch(setPage(1));
              }}
              className={`px-4 py-2 border rounded-lg ${!district ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
            >
              <option value="">Select Branch</option>
              {filterOptions.branches
                .filter((b) => b.district_name === district)
                .map((b) => (
                  <option key={b.branch_name} value={b.branch_name}>
                    {b.branch_name}
                  </option>
                ))}
            </select>

            {/* 3️⃣ Warehouse Type (Enabled only if Branch selected) */}
            <select
              value={warehouseType}
              disabled={!branch}
              onChange={(e) => {
                setWarehouseType(e.target.value);
                setWarehouseName("");
                dispatch(setPage(1));
              }}
              className={`px-4 py-2 border rounded-lg ${!branch ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
            >
              <option value="">Select Type</option>

              {filterOptions.warehouseTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

            {/* 4️⃣ Warehouse Name (Enabled only if Type selected) */}
            <select
              value={warehouseName}
              disabled={!warehouseType}
              onChange={(e) => {
                setWarehouseName(e.target.value);
                dispatch(setPage(1));
              }}
              className={`px-4 py-2 border rounded-lg ${!warehouseType ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
            >
              <option value="">Select Warehouse</option>

              {filterOptions.warehouseNames
                .filter(
                  (w) =>
                    w.district_name === district &&
                    w.branch_name === branch &&
                    w.warehouse_type_id == warehouseType, // ✅ FIX HERE
                )
                .map((w) => (
                  <option key={w.warehouse_name} value={w.warehouse_name}>
                    {w.warehouse_name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : warehouses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No warehouses found
          </div>
        ) : (
          <>
            <Table columns={columns} data={warehouses} />
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

export default WarehouseList;
