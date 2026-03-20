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
import axios from "../../services/axios";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

const EditWarehouse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentWarehouse, loading, error } = useSelector(
    (state) => state.warehouse,
  );

  const [types, setTypes] = useState([]);

  const [form, setForm] = useState({
    district_name: "",
    branch_name: "",
    warehouse_name: "",
    warehouse_owner_name: "",
    warehouse_type_id: "",
    warehouse_no: "",
    gst_no: "",

    scheme: "",
    scheme_rate_amount: "",
    actual_storage_capacity: "",
    approved_storage_capacity: "",

    bank_solvency_certificate_amount: "",
    bank_solvency_deduction_by_bill: "",
    emi_deduction_by_bill: "",

    is_affidavit: true,

    pan_card_holder: "",
    pan_card_number: "",
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    dispatch(fetchWarehouseById(id));

    axios.get("/warehouse-types").then((res) => {
      setTypes(res.data.data || []);
    });
  }, [dispatch, id]);

  useEffect(() => {
    if (currentWarehouse) {
      setForm({
        ...currentWarehouse,
        is_affidavit: currentWarehouse.bank_solvency_affidavit_amount > 0,
      });
    }
  }, [currentWarehouse]);

  /* ================= AUTO CALC ================= */
  const affidavitAmount = form.approved_storage_capacity * 50 || 0;

  const totalEMI =
    (form.actual_storage_capacity * form.scheme_rate_amount) / 2 || 0;

  const solvencyBase = form.is_affidavit
    ? affidavitAmount
    : form.bank_solvency_certificate_amount || 0;

  const solvencyBalance =
    solvencyBase - (form.bank_solvency_deduction_by_bill || 0);

  const emiBalance = totalEMI - (form.emi_deduction_by_bill || 0);

  /* ================= HANDLER ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "is_affidavit" ? value === "true" : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      bank_solvency_certificate_amount: form.is_affidavit
        ? 0
        : form.bank_solvency_certificate_amount,
    };

    const result = await dispatch(updateWarehouse({ id, data: payload }));

    if (result.payload) {
      toast.success("Warehouse updated successfully");
      navigate("/admin/warehouses");
    }
  };

  if (loading && !currentWarehouse) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Edit Warehouse</h1>
        <Button className="gap-2" variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go Back
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* BASIC */}
          <Section title="Basic Information">
            <Grid>
              <FormField label="District">
                <Input
                  name="district_name"
                  value={form.district_name}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="Branch">
                <Input
                  name="branch_name"
                  value={form.branch_name}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="Warehouse Name">
                <Input
                  name="warehouse_name"
                  value={form.warehouse_name}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="Warehouse Owner">
                <Input
                  name="warehouse_owner_name"
                  value={form.warehouse_owner_name}
                  onChange={handleChange}
                />
              </FormField>

              <FormField label="Warehouse Type">
                <select
                  name="warehouse_type_id"
                  value={form.warehouse_type_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-all duration-200"
                >
                  <option value="">Select Type</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Warehouse No">
                <Input
                  name="warehouse_no"
                  value={form.warehouse_no}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="GST No">
                <Input
                  name="gst_no"
                  value={form.gst_no}
                  onChange={handleChange}
                />
              </FormField>
            </Grid>
          </Section>

          {/* SCHEME */}
          <Section title="Scheme & Capacity">
            <Grid>
              <FormField label="Scheme">
                <Input
                  name="scheme"
                  value={form.scheme}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="Scheme Rate Amount">
                <Input
                  type="number"
                  name="scheme_rate_amount"
                  value={form.scheme_rate_amount}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="Actual Storage Capacity">
                <Input
                  type="number"
                  name="actual_storage_capacity"
                  value={form.actual_storage_capacity}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="Approved Storage Capacity">
                <Input
                  type="number"
                  name="approved_storage_capacity"
                  value={form.approved_storage_capacity}
                  onChange={handleChange}
                />
              </FormField>
            </Grid>
          </Section>

          {/* SOLVENCY */}
          <Section title="Bank Solvency">
            <Grid>
              <FormField label="Affidavit/Certificate">
                <select
                  name="is_affidavit"
                  value={form.is_affidavit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-all duration-200"
                >
                  <option value="true">Affidavit</option>
                  <option value="false">Certificate</option>
                </select>
              </FormField>

              {form.is_affidavit ? (
                <FormField label="Bank Solvency Affidavit Amount">
                  <Input value={affidavitAmount} readOnly />
                </FormField>
              ) : (
                <FormField label="Certificate Amount">
                  <Input
                    type="number"
                    name="bank_solvency_certificate_amount"
                    value={form.bank_solvency_certificate_amount}
                    onChange={handleChange}
                  />
                </FormField>
              )}

              <FormField label="Bank Solvency Deduction by Bill">
                <Input
                  type="number"
                  name="bank_solvency_deduction_by_bill"
                  value={form.bank_solvency_deduction_by_bill}
                  onChange={handleChange}
                />
              </FormField>

              <FormField label="Balance Amount Bank Solvancy">
                <Input value={solvencyBalance} readOnly />
              </FormField>
            </Grid>
          </Section>

          {/* EMI */}
          <Section title="EMI">
            <Grid>
              <FormField label="Total EMI">
                <Input value={totalEMI} readOnly />
              </FormField>
              <FormField label="EMI Deduction by Bill">
                <Input
                  type="number"
                  name="emi_deduction_by_bill"
                  value={form.emi_deduction_by_bill}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="EMI Balance">
                <Input value={emiBalance} readOnly />
              </FormField>
            </Grid>
          </Section>

          {/* PAN */}
          <Section title="PAN Details">
            <Grid>
              <FormField label="PAN Card Holder">
                <Input
                  name="pan_card_holder"
                  value={form.pan_card_holder}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="PAN Card Number">
                <Input
                  name="pan_card_number"
                  value={form.pan_card_number}
                  onChange={handleChange}
                />
              </FormField>
            </Grid>
          </Section>
          <div className="flex gap-3 mt-10">
            <Button type="submit">{loading ? "Updating..." : "Update Warehouse"}</Button>
            <Button
              variant="secondary"
              onClick={() => {
                navigate(-1);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div>
    <h2 className="font-semibold mb-4 border-b pb-2">{title}</h2>
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div className="grid md:grid-cols-3 gap-4">{children}</div>
);

const FormField = ({ label, children }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-2 text-gray-700">{label}</label>
    {children}
  </div>
);

export default EditWarehouse;
