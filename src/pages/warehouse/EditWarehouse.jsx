import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWarehouseById,
  updateWarehouse,
} from "../../redux/slices/warehouseSlice";
import Card from "../../components/global/Card";
import Button from "../../components/global/Button";
import Input from "../../components/global/Input";
import toast from "react-hot-toast";

const EditWarehouse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentWarehouse, loading, error } = useSelector(
    (state) => state.warehouse
  );

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

  useEffect(() => {
    dispatch(fetchWarehouseById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentWarehouse) {
      setForm({
        district_name: currentWarehouse.district_name || "",
        branch_name: currentWarehouse.branch_name || "",
        warehouse_name: currentWarehouse.warehouse_name || "",
        warehouse_owner_name: currentWarehouse.warehouse_owner_name || "",
        warehouse_type: currentWarehouse.warehouse_type || "",
        warehouse_no: currentWarehouse.warehouse_no || "",
        sr_no: currentWarehouse.sr_no || "",
        deposit_name: currentWarehouse.deposit_name || "",
        pan_card_holder: currentWarehouse.pan_card_holder || "",
        pan_card_number: currentWarehouse.pan_card_number || "",
      });
    }
  }, [currentWarehouse]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateWarehouse({ id, data: form }));
    if (result.payload) navigate("/admin/warehouses");
    toast.success("Warehouse updated successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Edit Warehouse</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Go Back
        </Button>
      </div>

      <Card>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {typeof error === "string" ? error : "Failed to load warehouse"}
          </div>
        )}

        {loading && !currentWarehouse ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input name="district_name" value={form.district_name} onChange={handleChange} placeholder="District Name" />
              <Input name="branch_name" value={form.branch_name} onChange={handleChange} placeholder="Branch Name" />
              <Input name="warehouse_name" value={form.warehouse_name} onChange={handleChange} placeholder="Warehouse Name" />
              <Input name="warehouse_owner_name" value={form.warehouse_owner_name} onChange={handleChange} placeholder="Warehouse Owner Name" />
              <Input name="warehouse_type" value={form.warehouse_type} onChange={handleChange} placeholder="Warehouse Type" />
              <Input name="warehouse_no" value={form.warehouse_no} onChange={handleChange} placeholder="Warehouse No" />
              <Input name="sr_no" value={form.sr_no} onChange={handleChange} placeholder="SR No" />
              <Input name="deposit_name" value={form.deposit_name} onChange={handleChange} placeholder="Deposit Name" />
              <Input name="pan_card_holder" value={form.pan_card_holder} onChange={handleChange} placeholder="PAN Card Holder" />
              <Input name="pan_card_number" value={form.pan_card_number} onChange={handleChange} placeholder="PAN Card Number" />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Warehouse"}
              </Button>
              <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default EditWarehouse;