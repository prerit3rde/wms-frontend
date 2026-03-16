import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createWarehouse } from "../../redux/slices/warehouseSlice";
import { useNavigate } from "react-router-dom";
import Card from "../../components/global/Card";
import Button from "../../components/global/Button";
import Input from "../../components/global/Input";

const AddWarehouse = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.warehouse);

  const [form, setForm] = useState({
    district_name: "",
    branch_name: "",
    warehouse_name: "",
    warehouse_owner_name: "",
    warehouse_type: "",
    warehouse_no: "",
    sr_no: "",
    deposit_name: "",
    pan_card_holder: "",
    pan_card_number: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createWarehouse(form));
    if (result.payload) navigate("/admin/warehouses");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Add Warehouse</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Go Back
        </Button>
      </div>

      <Card>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {typeof error === "string" ? error : "Failed to create warehouse"}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input name="district_name" placeholder="District Name" value={form.district_name} onChange={handleChange} />
              <Input name="branch_name" placeholder="Branch Name" value={form.branch_name} onChange={handleChange} />
              <Input name="warehouse_name" placeholder="Warehouse Name" value={form.warehouse_name} onChange={handleChange} />
              <Input name="warehouse_owner_name" placeholder="Warehouse Owner Name" value={form.warehouse_owner_name} onChange={handleChange} />
              <Input name="warehouse_type" placeholder="Warehouse Type" value={form.warehouse_type} onChange={handleChange} />
              <Input name="warehouse_no" placeholder="Warehouse No" value={form.warehouse_no} onChange={handleChange} />
              <Input name="sr_no" placeholder="SR No" value={form.sr_no} onChange={handleChange} />
              <Input name="deposit_name" placeholder="Deposit Name" value={form.deposit_name} onChange={handleChange} />
            </div>
          </div>

          {/* PAN Details */}
          <div>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">
              PAN Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="pan_card_holder" placeholder="PAN Card Holder" value={form.pan_card_holder} onChange={handleChange} />
              <Input name="pan_card_number" placeholder="PAN Card Number" value={form.pan_card_number} onChange={handleChange} />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Save Warehouse"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>

        </form>
      </Card>
    </div>
  );
};

export default AddWarehouse;