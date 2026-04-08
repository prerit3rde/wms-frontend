import * as XLSX from "xlsx";
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

  const formatExcelDate = (value) => {
    if (!value) return "";

    // ✅ If already formatted string → return
    if (isNaN(value)) return value;

    // ✅ Convert Excel serial → JS date
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 86400000);

    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const fetchCropYears = async () => {
    try {
      const res = await axios.get("/warehouses");

      const allYears = res.data.data.flatMap(
        (w) => w.cropData?.map((c) => c.crop_year) || [],
      );

      const uniqueYears = [...new Set(allYears)];

      setCropYears(uniqueYears);
    } catch (error) {
      console.error("Failed to fetch crop years");
    }
  };

  /* ================= FETCH FILTER OPTIONS ================= */
  const fetchFilters = async () => {
    const res = await axios.get("/payments/filters");
    setFilterOptions(res.data.data);
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

      let allPayments = res.data.data;

      if (!allPayments || allPayments.length === 0) {
        toast.error("No data to export");
        return;
      }

      /* ================= GET ADMIN NAME FROM TOKEN ================= */

      const token = localStorage.getItem("token");
      let adminName = "Admin";

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          adminName = payload.name || "Admin";
        } catch (error) {
          console.error("Invalid token");
        }
      }

      /* ================= DATE FORMATTER ================= */

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

      /* ================= REMOVE EMPTY APPROVED/REJECTED ================= */

      const hasApproved = allPayments.some(
        (c) => c.approved_by || c.approved_at,
      );

      const hasRejected = allPayments.some(
        (c) => c.rejected_by || c.rejected_at,
      );

      const cleanedData = allPayments.map((payment) => {
        const obj = { ...payment };

        // ❌ REMOVE THESE FIELDS
        delete obj.status;
        delete obj.created_at;
        delete obj.updated_at;
        delete obj.is_imported;

        // existing logic
        if (!hasApproved) {
          delete obj.approved_by;
          delete obj.approved_at;
        }

        if (!hasRejected) {
          delete obj.rejected_by;
          delete obj.rejected_at;
        }

        return obj;
      });

      const fieldOrder = [
        "id",
        "district_name",
        "branch_name",
        "warehouse_name",
        "warehouse_owner_name",
        "warehouse_type",
        "warehouse_no",
        "gst_no",
        "scheme",
        "scheme_rate_amount",
        "actual_storage_capacity",
        "approved_storage_capacity",
        "bank_solvency_affidavit_amount",
        "bank_solvency_certificate_amount",
        "bank_solvency_deduction_by_bill",
        "bank_solvency_balance",
        "total_emi",
        "emi_deduction_by_bill",
        "emi_balance",
        "pan_card_holder",
        "pan_card_number",
        "rent_bill_number",
        "bill_type",
        "month",
        "financial_year",
        "from_date",
        "to_date",
        "commodity",
        "rate",
        "rent_bill_amount",
        "bill_amount",
        "actual_passed_amount",
        "depositers_name",
        "scientific_capacity",
        "number_of_days",
        "per_day_rate",
        "rent_amount_on_scientific_capacity",
        "tds",
        "amount_deducted_against_gain_loss",
        "emi_amount",
        "deduction_20_percent",
        "penalty",
        "medicine",
        "emi_fdr_interest",
        "gain_shortage_deduction",
        "stock_shortage_deduction",
        "bank_solvancy",
        "insurance",
        "other_deduction_amount",
        "other_deductions_reason",
        "pay_to_jvs_amount",
        "security_fund_amount",
        "payment_by",
        "payment_date",
        "qtr",
        "remarks",
      ];

      /* ================= FORMAT DATA ================= */

      const formattedData = cleanedData.map((row) => {
        const formattedRow = {};

        fieldOrder.forEach((key) => {
          let value = row[key];

          if (
            key === "approved_at" ||
            key === "rejected_at" ||
            key === "payment_date"
          ) {
            value = formatDate(value);
          }

          formattedRow[key] = value ?? "";
        });

        return formattedRow;
      });

      /* ================= EXPORT HEADER INFO ================= */

      const exportDate = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      /* ================= CREATE WORKSHEET ================= */
      const worksheet = XLSX.utils.json_to_sheet(formattedData);

      /* ================= AUTO COLUMN WIDTH ================= */

      const columnWidths = Object.keys(formattedData[0]).map((key) => {
        const maxLength = Math.max(
          key.length,
          ...formattedData.map((row) =>
            row[key] ? row[key].toString().length : 0,
          ),
        );

        return { wch: Math.min(maxLength + 4, 40) };
      });

      worksheet["!cols"] = columnWidths;

      /* ================= CREATE WORKBOOK ================= */

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

      XLSX.writeFile(workbook, "payments_report.xlsx");

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

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, {
        raw: false, // ✅ IMPORTANT
      });

      const formattedData = jsonData.map((row) => ({
        ...row,
        payment_date: formatExcelDate(row.payment_date),
      }));

      setPreviewData(formattedData);
      setShowPreview(true);

      // ✅ RESET INPUT (IMPORTANT)
      // e.target.value = null;
      fileInputRef.current.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  const handleBulkInsert = async () => {
    try {
      const res = await axios.post("/payments/bulk-insert", {
        data: previewData,
        mode: importMode,
      });

      // ✅ show backend message
      toast.success(res.data.message || "Payment imported successfully!", {
        style: {
          maxWidth: "fit-content",
        },
      });

      // ✅ reset UI
      setShowPreview(false);
      setPreviewData([]);

      // ✅ reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }

      // ❗ IMPORTANT: refresh PAYMENTS (not warehouses)
      dispatch(fetchPayments({ page, limit }));

      // 🔥 FIX: refresh filters ALSO
      await fetchFilters();
    } catch (error) {
      // ✅ show actual backend error
      toast.error(error.response?.data?.message || "Import failed!", {
        style: {
          maxWidth: "fit-content",
        },
      });
    }
  };

  const previewColumns = Object.keys(previewData[0] || {}).map((key) => ({
    key,
    label: fieldLabels[key] || key,
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

      {/* FILTER SECTION */}
      <Card className="p-6 space-y-4">
        {/* TOP ROW */}
        <div className="flex flex-wrap gap-4 items-center items-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition
              ${
                showFilters
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
            className={`px-4 py-2 rounded-lg cursor-pointer cursor-pointer transition ${
              isFilterActive
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            Reset
          </button>
        </div>

        {/* CASCADING PANEL */}
        <div
          className={`transition-all duration-500 overflow-hidden cursor-pointer ${
            showFilters ? "max-h-[400px] opacity-100 mt-4" : "max-h-0 opacity-0"
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
              disabled={!district}
              onChange={(e) => {
                setBranch(e.target.value);
                setWarehouseType("");
                setWarehouseName("");
                dispatch(setPage(1));
              }}
              className="px-4 py-2 border rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              disabled={!branch}
              onChange={(e) => {
                setWarehouseType(e.target.value);
                setWarehouseName("");
                dispatch(setPage(1));
              }}
              className="px-4 py-2 border rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              disabled={!warehouseType}
              onChange={(e) => {
                setWarehouseName(e.target.value);
                dispatch(setPage(1));
              }}
              className="px-4 py-2 border rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Warehouse</option>
              {filteredWarehouses
                .filter((w) => w.warehouse_type === warehouseType)
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
          <h2 className="text-xl font-semibold mb-4">Preview Imported Data</h2>

          <Table columns={previewColumns} data={previewData} />

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

              <Button onClick={handleBulkInsert}>
                {importMode === "insert" ? "Insert All" : "Update Data"}
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
