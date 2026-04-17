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
    { key: "Bank Solvancy का प्रमाण पत्र की राशि", label: "BS प्रमाण पत्र", field: "bs_cert" },
    { key: "Bank Solvancy के शपथ पत्र की राशि", label: "BS शपथ पत्र", field: "bs_aff" },
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
    "WAREHOUSE", "LOGISTICS", "PARK", "AGRO", "PVT", "LTD", "PART", "GODOWN", "DISTRICT", "BRANCH", "EMI", "PAN", "HOLDER", "BILL", "NO", "NAME", "PMS", "WMS", "JVS", "SCHEME"
  ];

  const handleKruToUni = (text, fieldName = "") => {
    if (text === null || text === undefined || text === "") return text;
    if (typeof text === "number") return text;

    const str = text.toString().trim();

    // 1. STRICT PROTECTED FIELDS (Numbers/Codes that must be English)
    const PROTECTED_FIELDS = [
      "pan_card_number", "gst_no", "emi_deduction_by_bill", "storage_capacity",
      "total_emi", "scheme_rate_amount", "warehouse_no",
      "bank_solvency_deduction_by_bill", "bank_solvency_balance_amount", "balance_amount_emi"
    ];
    if (PROTECTED_FIELDS.includes(fieldName)) return str;

    // 2. BASIC FORMAT PROTECTION
    if (str.length === 1) return str;
    if (!isNaN(str) && !isNaN(parseFloat(str))) return str;

    // 3. PRIORITY DIRECT LOOKUP
    if (krutiDevMapping[str]) return krutiDevMapping[str];

    const upperStr = str.toUpperCase();

    // 4. PAN NUMBER DETECTION (5 letters, 4 numbers, 1 letter)
    if (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(upperStr)) return str;

    // 5. ALL CAPS PROTECTION (Acronyms, English Names)
    const isAllCaps = /^[A-Z0-9\s,./&()*'#_-]+$/.test(str) && str.length > 2;
    if (isAllCaps) return str;

    // 6. WHITELIST CHECK
    const isWhitelisted = ENGLISH_WHITELIST.some(word => upperStr.includes(word));
    if (isWhitelisted) return str;

    // 7. ENGLISH CASE ANALYSIS (e.g. "Burhanpur", "Amjhera")
    const isProperCase = /^[A-Z][a-z0-9.]+ (\s+[A-Z][a-z0-9.]+)*$/.test(str) || /^[A-Z][a-z0-9.]+$/.test(str);
    const vowels = (str.match(/[aeiou]/gi) || []).length;
    const ratio = vowels / str.length;
    // English names have healthy vowel density (>20%)
    if (isProperCase && ratio > 0.20) return str;

    // 8. FORCED KRUTIDEV SIGNATURES
    if (str.startsWith("'") || /[\[\]\\;{}=?+]/.test(str)) {
      try { return kru2uni(str).trim(); } catch (e) { return str; }
    }

    // 9. AUTOMATIC CONVERSION FALLBACK (For everything else that lacks healthy vowels)
    if (ratio < 0.20 || /[^aeiou]{4,}/i.test(str)) {
      try {
        return kru2uni(str).trim();
      } catch (e) {
        return str;
      }
    }

    return str;
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
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await axios.get("/warehouses/filters");
        setFilterOptions(response.data.data);
      } catch (error) {
        console.error("Failed to load filter options");
      }
    };
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
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to delete this warehouse?",
                )
              ) {
                dispatch(deleteWarehouse(row.id));
                toast.success("Warehouse deleted successfully");
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

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      setWorkbook(wb);
      setAvailableSheets(wb.SheetNames);

      const firstSheetName = wb.SheetNames[0];
      setSelectedSheet(firstSheetName);

      const sheet = wb.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { range: 1 });

      setPreviewData(jsonData);
      setShowPreview(true);

      fileInputRef.current.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSheetChange = (sheetName) => {
    if (!workbook) return;
    setSelectedSheet(sheetName);
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { range: 1 });
    setPreviewData(jsonData);
    setPreviewPage(1); // Reset to first page
  };

  const handleBulkInsert = async () => {
    try {
      await axios.post("/warehouses/bulk-insert", {
        data: previewData,
      });

      toast.success("Warehouses imported successfully!");

      setShowPreview(false);
      setPreviewData([]);

      // ✅ RESET FILE INPUT AGAIN
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }

      dispatch(fetchWarehouses({ page, limit }));
    } catch (error) {
      toast.error("Import failed!");
    }
  };

  // Filter out columns that we don't want to show in the preview table (like contract_date)
  const previewColumns = REQUIRED_MAPPING
    .filter(m => m.field !== "contract_date")
    .map(m => ({
      key: m.field,
      label: m.label
    }));

  return (
    <div className="space-y-6">
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
        <Card className="p-6 max-w-[1217px] overflow-x-auto overflow-y-hidden whitespace-nowrap w-full border-blue-100 shadow-md">
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
            data={previewData.slice((previewPage - 1) * previewLimit, previewPage * previewLimit).map(row => {
              const cleanRow = {};
              Object.keys(row).forEach(excelKey => {
                // 1. Convert Excel key to Unicode (Hindi) if it's KrutiDev
                // We pass an empty string as fieldName so it doesn't apply protection to the header itself
                const unicodeKey = handleKruToUni(excelKey);

                // 2. STRIP ALL SPACES for exact key matching across different Excel versions
                const strippedUnicodeKey = unicodeKey.replace(/\s+/g, '').toLowerCase();
                const strippedExcelKey = excelKey.replace(/\s+/g, '').toLowerCase();

                // 3. PRIORITIZED MATCHING LOGIC
                // First try exact matches, then try partial matches
                let match = REQUIRED_MAPPING.find(m => {
                  const strippedMappingKey = m.key.replace(/\s+/g, '').toLowerCase();
                  return strippedMappingKey === strippedUnicodeKey || strippedMappingKey === strippedExcelKey;
                });

                // If no exact match, try inclusion check (partial match)
                if (!match) {
                  match = REQUIRED_MAPPING.find(m => {
                    const strippedMappingKey = m.key.replace(/\s+/g, '').toLowerCase();
                    return strippedMappingKey.includes(strippedUnicodeKey) ||
                      strippedUnicodeKey.includes(strippedMappingKey);
                  });
                }

                if (match) {
                  // Pass the field name to correctly apply column-based protection logic
                  let val = handleKruToUni(row[excelKey], match.field);

                  // Fix floating point errors for numeric fields in the preview
                  const numericFields = [
                    "scheme_rate_amount", "storage_capacity", "bs_cert", "bs_aff",
                    "bank_solvency_deduction_by_bill", "bank_solvency_balance_amount",
                    "total_emi", "emi_deduction_by_bill", "balance_amount_emi"
                  ];

                  if (numericFields.includes(match.field) && !isNaN(val) && val !== "" && val !== null) {
                    val = Math.round(parseFloat(val) * 100) / 100;
                  }

                  cleanRow[match.field] = val;
                }
              });
              return cleanRow;
            })}
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
