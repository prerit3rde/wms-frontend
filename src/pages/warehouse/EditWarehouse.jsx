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
import { ArrowLeft } from "lucide-react";

const EditWarehouse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentWarehouse, loading, error } = useSelector(
    (state) => state.warehouse,
  );

  const [form, setForm] = useState({
    district_name: "",
    branch_name: "",
    warehouse_name: "",
    warehouse_owner_name: "",
    warehouse_type: "",
    warehouse_no: "",
    gst_no: "",
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
        gst_no: currentWarehouse.gst_no || "",
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
        <Button
          className="flex gap-2"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Go Back
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
              <FormField label="District">
                <Input
                  name="district_name"
                  value={form.district_name}
                  onChange={handleChange}
                  placeholder="District Name"
                />
              </FormField>
              <FormField label="Branch">
                <Input
                  name="branch_name"
                  value={form.branch_name}
                  onChange={handleChange}
                  placeholder="Branch Name"
                />
              </FormField>
              <FormField label="Warehouse Name">
                <Input
                  name="warehouse_name"
                  value={form.warehouse_name}
                  onChange={handleChange}
                  placeholder="Warehouse Name"
                />
              </FormField>
              <FormField label="Warehouse Owner Name">
                <Input
                  name="warehouse_owner_name"
                  value={form.warehouse_owner_name}
                  onChange={handleChange}
                  placeholder="Warehouse Owner Name"
                />
              </FormField>
              <FormField label="Warehouse Type">
                <Input
                  name="warehouse_type"
                  value={form.warehouse_type}
                  onChange={handleChange}
                  placeholder="Warehouse Type"
                />
              </FormField>
              <FormField label="Warehouse No">
                <Input
                  name="warehouse_no"
                  value={form.warehouse_no}
                  onChange={handleChange}
                  placeholder="Warehouse No"
                />
              </FormField>
              <FormField label="GST No">
                <Input
                  name="gst_no"
                  value={form.gst_no}
                  onChange={handleChange}
                  placeholder="GST No"
                />
              </FormField>
              <FormField label="PAN Card Holder">
                <Input
                  name="pan_card_holder"
                  value={form.pan_card_holder}
                  onChange={handleChange}
                  placeholder="PAN Card Holder"
                />
              </FormField>
              <FormField label="PAN Card Number">
                <Input
                  name="pan_card_number"
                  value={form.pan_card_number}
                  onChange={handleChange}
                  placeholder="PAN Card Number"
                />
              </FormField>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Warehouse"}
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

const FormField = ({ label, children }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1 text-gray-700">{label}</label>
    {children}
  </div>
);

export default EditWarehouse;
