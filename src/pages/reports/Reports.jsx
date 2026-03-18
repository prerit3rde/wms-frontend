import { useEffect, useState } from "react";
import axios from "../../services/axios";
import Card from "../../components/global/Card";
import Button from "../../components/global/Button";
import Table from "../../components/global/Table";
import toast from "react-hot-toast";

const Reports = () => {
  const [district, setDistrict] = useState("");
  const [branch, setBranch] = useState("");
  const [warehouseType, setWarehouseType] = useState("");
  const [warehouseName, setWarehouseName] = useState("");

  const [selectedMonth, setSelectedMonth] = useState("");
  const [month, setMonth] = useState("");
  const [financialYear, setFinancialYear] = useState("");

  const [status, setStatus] = useState("");

  const [filterOptions, setFilterOptions] = useState({
    districts: [],
    branches: [],
    warehouseNames: [],
  });

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH FILTER OPTIONS ================= */
  useEffect(() => {
    const fetchFilters = async () => {
      const res = await axios.get("/warehouses/filters");
      setFilterOptions(res.data.data);
    };

    fetchFilters();
  }, []);

  /* ================= FETCH REPORT HISTORY ================= */
  const fetchHistory = async () => {
    const res = await axios.get("/reports/history");
    setHistory(res.data.data || []);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  /* ================= GENERATE REPORT ================= */
  const generateReport = async () => {
    try {
      setLoading(true);

      await axios.post("/reports/claims/generate", {
        filters: {
          district_name: district,
          branch_name: branch,
          warehouse_name: warehouseName,
          warehouse_type: warehouseType,
          month,
          financial_year: financialYear,
          status,
        },
      });

      fetchHistory();

      toast.success("Report generated successfully");
    } catch (err) {
      toast.error("Report generation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DOWNLOAD REPORT ================= */
  const downloadReport = async (id) => {
    try {
      const res = await axios.get(`/reports/download/${id}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute("download", `claims-report-${id}.xlsx`);

      document.body.appendChild(link);

      link.click();

      link.remove();
    } catch (error) {
      alert("Download failed");
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = [

    { key: "report_name", label: "Report Name" },

    { key: "report_type", label: "Type" },

    {
      key: "created_at",
      label: "Created At",
      render: (value) =>
        new Date(value).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },

    {
      key: "download",
      label: "Download",
      render: (_, row) => (
        <Button
          onClick={() => downloadReport(row.id)}
          className="text-blue-600"
        >
          Download
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Claims Report Generation
        </h1>

        <p className="text-gray-500 mt-1">
          Filter, generate and export claims data
        </p>
      </div>

      {/* FILTER CARD */}
      <Card className="p-6 space-y-4">
        {/* CASCADING FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* District */}
          <select
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
              setBranch("");
              setWarehouseType("");
              setWarehouseName("");
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

          {/* Branch */}
          <select
            value={branch}
            disabled={!district}
            onChange={(e) => {
              setBranch(e.target.value);
              setWarehouseType("");
              setWarehouseName("");
            }}
            className={`px-4 py-2 border rounded-lg ${
              !district ? "bg-gray-100" : ""
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

          {/* Type */}
          <select
            value={warehouseType}
            disabled={!branch}
            onChange={(e) => {
              setWarehouseType(e.target.value);
              setWarehouseName("");
            }}
            className={`px-4 py-2 border rounded-lg ${
              !branch ? "bg-gray-100" : ""
            }`}
          >
            <option value="">Select Type</option>

            {[
              ...new Set(
                filterOptions.warehouseNames
                  .filter(
                    (w) =>
                      w.district_name === district && w.branch_name === branch
                  )
                  .map((w) => w.warehouse_type)
              ),
            ].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Warehouse */}
          <select
            value={warehouseName}
            disabled={!warehouseType}
            onChange={(e) => setWarehouseName(e.target.value)}
            className={`px-4 py-2 border rounded-lg ${
              !warehouseType ? "bg-gray-100" : ""
            }`}
          >
            <option value="">Select Warehouse</option>

            {filterOptions.warehouseNames
              .filter(
                (w) =>
                  w.district_name === district &&
                  w.branch_name === branch &&
                  w.warehouse_type === warehouseType
              )
              .map((w) => (
                <option key={w.warehouse_name} value={w.warehouse_name}>
                  {w.warehouse_name}
                </option>
              ))}
          </select>
        </div>

        {/* MONTH + FY + STATUS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Month Picker */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);

              const date = new Date(e.target.value);
              const monthName = date.toLocaleString("default", {
                month: "long",
              });

              setMonth(monthName);
            }}
            className="px-4 py-2 border rounded-lg"
          />

          {/* Financial Year Auto */}
          <input
            placeholder="Financial Year (eg: 2024-2025)"
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* GENERATE BUTTON */}
        <Button onClick={generateReport} disabled={loading}>
          {loading ? "Generating..." : "Generate Report"}
        </Button>
      </Card>

      {/* REPORT HISTORY */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Report History</h2>

        <Table columns={columns} data={history} />
      </Card>
    </div>
  );
};

export default Reports;
