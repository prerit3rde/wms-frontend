import { useEffect, useState } from "react";
import {
  getWarehouseTypes,
  createWarehouseType,
  updateWarehouseType,
  deleteWarehouseType,
} from "./warehouseType.service";
import Button from "../../components/global/Button";
import Input from "../../components/global/Input";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

const AddWarehouseType = () => {
  const [typeName, setTypeName] = useState("");
  const [types, setTypes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  /* ================= FETCH ================= */
  const fetchTypes = async () => {
    try {
      const res = await getWarehouseTypes();
      setTypes(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setTypes([]);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  /* ================= EDIT ================= */
  const handleEdit = (type) => {
    setTypeName(type.name);
    setEditId(type.id);
    setError("");
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!typeName.trim()) {
      setError("Warehouse type is required");
      return;
    }

    try {
      if (editId) {
        await updateWarehouseType(editId, { name: typeName });
      } else {
        await createWarehouseType({ name: typeName });
      }

      setTypeName("");
      setEditId(null);
      setError("");
      fetchTypes();
    } catch (err) {
      setError(err.response?.data?.message || "Error occurred");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this warehouse type?")) return;

    try {
      await deleteWarehouseType(id);
      fetchTypes();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Warehouse Types</h1>

        <Button variant="outline" onClick={() => navigate("/admin/warehouses")}>
          ← Back to List
        </Button>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT SIDE - STICKY FORM */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold mb-4">
                {editId ? "Edit Warehouse Type" : "Add Warehouse Type"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  placeholder="Enter warehouse type"
                  value={typeName}
                  onChange={(e) => {
                    setTypeName(e.target.value);
                    setError("");
                  }}
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button type="submit" className="w-full">
                  {editId ? "Update Warehouse Type" : "Save Warehouse Type"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - TABLE */}
        <div className="lg:col-span-2">
          <div className="px-1 font-semibold text-gray-700 mb-2">
            All Warehouse Types
          </div>

          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {!types || types.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No warehouse types found
              </div>
            ) : (
              <table className="w-full">
                {/* HEADER */}
                <thead className="bg-gray-100 text-gray-600 text-sm">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium">
                      Warehouse Type Name
                    </th>
                    <th className="px-6 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody className="divide-y">
                  {types.map((type) => (
                    <tr key={type.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-800">{type.name}</td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {/* EDIT */}
                          <button
                            onClick={() => handleEdit(type)}
                            className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition"
                          >
                            <Pencil size={16} />
                          </button>

                          {/* DELETE */}
                          <button
                            onClick={() => handleDelete(type.id)}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddWarehouseType;
