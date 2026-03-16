import * as XLSX from "xlsx";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchClaims,
  removeClaim,
  setPage,
} from "../../redux/slices/claimsSlice";
import { Eye, Pencil, Trash2, Plus, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "../../services/axios";
import Button from "../../components/global/Button";
import Card from "../../components/global/Card";
import Table from "../../components/global/Table";
import Input from "../../components/global/Input";
import Pagination from "../../components/global/Pagination";
import toast from "react-hot-toast";

const ClaimList = () => {
  const dispatch = useDispatch();
  const { items, totalPages, page, limit, loading } = useSelector(
    (state) => state.claims,
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

  const [filterOptions, setFilterOptions] = useState({
    districts: [],
    branches: [],
    warehouseNames: [],
  });

  /* ================= FETCH FILTER OPTIONS ================= */
  useEffect(() => {
    const fetchFilters = async () => {
      const res = await axios.get("/claims/filters");
      setFilterOptions(res.data.data);
    };
    fetchFilters();
  }, []);

  /* ================= FETCH CLAIMS ================= */
  useEffect(() => {
    dispatch(
      fetchClaims({
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
      const res = await axios.get("/claims", {
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

      let allClaims = res.data.data;

      if (!allClaims || allClaims.length === 0) {
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

      const hasApproved = allClaims.some((c) => c.approved_by || c.approved_at);

      const hasRejected = allClaims.some((c) => c.rejected_by || c.rejected_at);

      const cleanedData = allClaims.map((claim) => {
        const obj = { ...claim };

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

      /* ================= FORMAT DATA ================= */

      const formattedData = cleanedData.map((row) => {
        const formattedRow = {};

        Object.keys(row).forEach((key) => {
          let value = row[key];

          /* FORMAT DATE FIELDS */
          if (
            key === "approved_at" ||
            key === "rejected_at" ||
            key === "created_at" ||
            key === "updated_at"
          ) {
            value = formatDate(value);
          }

          /* REPLACE ADMIN ID WITH ADMIN NAME */
          if (key === "approved_by" || key === "rejected_by") {
            value = value ? adminName : "";
          }

          /* FORMAT HEADER NAME */
          const formattedKey = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

          formattedRow[formattedKey] = value;
        });

        return formattedRow;
      });

      /* ================= EXPORT HEADER INFO ================= */

      const exportDate = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      /* ================= CREATE HEADER ROWS ================= */

      const headerRows = [
        ["Warehouse Management System"],
        ["Claims Report"],
        [`Exported By: ${adminName}`],
        [`Export Date: ${exportDate}`],
        [],
      ];

      /* ================= CREATE WORKSHEET ================= */

      const worksheet = XLSX.utils.aoa_to_sheet(headerRows);

      /* ================= ADD TABLE ================= */

      XLSX.utils.sheet_add_json(worksheet, formattedData, {
        origin: "A6",
        skipHeader: false,
      });

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

      /* ================= FREEZE TABLE HEADER ================= */

      worksheet["!freeze"] = {
        xSplit: 0,
        ySplit: 6,
      };

      /* ================= CREATE WORKBOOK ================= */

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Claims");

      XLSX.writeFile(workbook, "claims_report.xlsx");

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
    { key: "id", label: "ID" },
    { key: "district_name", label: "District" },
    { key: "branch_name", label: "Branch" },
    { key: "warehouse_name", label: "Warehouse" },
    { key: "rent_bill_number", label: "Bill No" },
    {
      key: "status",
      label: "Status",
      render: (value) => getStatusBadge(value),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => {
        const isLocked = row.status === "Approved" || row.status === "Rejected";

        return (
          <div className="flex gap-2">
            {/* VIEW */}
            <Link
              to={`/admin/claims/view/${row.id}`}
              className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
            >
              <Eye size={16} />
            </Link>

            {/* EDIT */}
            <Link
              to={`/admin/claims/edit/${row.id}`}
              onClick={() => {
                if (isLocked) {
                  toast("Approved and rejected claims can edit remark only.", {
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
                  });
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
                    "Approved and rejected claims can't be deleted.",
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

                const confirmDelete = window.confirm("Delete this claim?");

                if (!confirmDelete) return;

                await dispatch(removeClaim(row.id));
                dispatch(fetchClaims({ page, limit }));
                toast.success("Claim deleted successfully");
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

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Claim Management</h1>

        <div className="flex gap-3">
          {/* EXPORT BUTTON (ONLY WHEN FILTER ACTIVE) */}
          {isFilterActive && (
            <Button variant="success" onClick={handleExport}>
              Export Excel
            </Button>
          )}

          <Link to="/admin/claims/add">
            <Button>
              <Plus size={18} className="mr-1" />
              Add Claim
            </Button>
          </Link>
        </div>
      </div>

      {/* FILTER SECTION */}
      <Card className="p-6 space-y-4">
        {/* TOP ROW */}
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition
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
            <Input
              placeholder="Search claim..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                dispatch(setPage(1));
              }}
            />
          </div>

          {/* DATE FILTER (NOW TOP ROW) */}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              dispatch(setPage(1));
            }}
            className="px-4 py-2 border rounded-lg"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              dispatch(setPage(1));
            }}
            className="px-4 py-2 border rounded-lg"
          />

          {/* SORT */}
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              dispatch(setPage(1));
            }}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="date_desc">Newest</option>
            <option value="date_asc">Oldest</option>
            <option value="status_Pending">Pending</option>
            <option value="status_Approved">Approved</option>
            <option value="status_Rejected">Rejected</option>
          </select>

          <button
            onClick={handleReset}
            className={`px-4 py-2 rounded-lg transition ${
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
          className={`transition-all duration-500 overflow-hidden ${
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

      {/* TABLE */}
      <Card>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No claims found</div>
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

export default ClaimList;
