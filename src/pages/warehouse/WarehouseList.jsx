import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWarehouses,
  deleteWarehouse,
  setPage,
} from "../../redux/slices/warehouseSlice";
import { Eye, Pencil, Trash2, Plus, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "../../services/axios";
import Button from "../../components/global/Button";
import Card from "../../components/global/Card";
import Table from "../../components/global/Table";
import Input from "../../components/global/Input";
import Pagination from "../../components/global/Pagination";
import toast from "react-hot-toast";

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

  const [filterOptions, setFilterOptions] = useState({
    districts: [],
    branches: [],
    warehouseNames: [],
    warehouseTypes: [],
  });

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
      sortOption !== "date_desc"
    );
  }, [search, district, branch, warehouseName, warehouseType, sortOption]);

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
            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Warehouse Management
        </h1>
        <Link to="/admin/warehouses/add">
          <Button>
            <Plus size={18} className="mr-1" />
            Add Warehouse
          </Button>
        </Link>
      </div>

      {/* Controls */}
      <Card className="p-6 space-y-4">
        {/* Top Row */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Filter Button */}
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

          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <Input
              type="text"
              placeholder="Search warehouse..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                dispatch(setPage(1));
              }}
            />
          </div>

          {/* Sort */}
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
            <option value="district_asc">District A-Z</option>
            <option value="district_desc">District Z-A</option>
            <option value="name_asc">Warehouse A-Z</option>
            <option value="name_desc">Warehouse Z-A</option>
          </select>

          {/* Reset (Active Color) */}
          <button
            onClick={handleReset}
            className={`px-4 py-2 rounded-lg transition
              ${
                isFilterActive
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-600"
              }`}
          >
            Reset
          </button>
        </div>

        {/* Animated Filter Panel */}
        <div
          className={`transition-all duration-500 overflow-hidden ${
            showFilters ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
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
              className={`px-4 py-2 border rounded-lg ${
                !district ? "bg-gray-100 cursor-not-allowed" : ""
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
              className={`px-4 py-2 border rounded-lg ${
                !branch ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            >
              <option value="">Select Type</option>
              {[
                ...new Set(
                  filterOptions.warehouseNames
                    .filter(
                      (w) =>
                        w.district_name === district &&
                        w.branch_name === branch,
                    )
                    .map((w) => w.warehouse_type),
                ),
              ].map((type) => (
                <option key={type} value={type}>
                  {type}
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
              className={`px-4 py-2 border rounded-lg ${
                !warehouseType ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            >
              <option value="">Select Warehouse</option>
              {filterOptions.warehouseNames
                .filter(
                  (w) =>
                    w.district_name === district &&
                    w.branch_name === branch &&
                    w.warehouse_type === warehouseType,
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

export default WarehouseList;
