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

  const [cropData, setCropData] = useState([]);

  /* ================= FETCH ================= */
  useEffect(() => {
    dispatch(fetchWarehouseById(id));

    axios.get("/warehouse-types").then((res) => {
      setTypes(res.data.data || []);
    });
  }, [dispatch, id]);

  useEffect(() => {
    if (currentWarehouse) {
      const { cropData: backendCropData = [], ...basic } = currentWarehouse;

      setForm({
        district_name: basic.district_name || "",
        branch_name: basic.branch_name || "",
        warehouse_name: basic.warehouse_name || "",
        warehouse_owner_name: basic.warehouse_owner_name || "",
        warehouse_type_id: basic.warehouse_type_id || "",
        warehouse_no: basic.warehouse_no || "",
        gst_no: basic.gst_no || "",
        pan_card_holder: basic.pan_card_holder || "",
        pan_card_number: basic.pan_card_number || "",
      });

      setCropData(
        backendCropData.map((item) => ({
          crop_year: item.crop_year || "",
          scheme: item.scheme || "",
          scheme_rate_amount: item.scheme_rate_amount || "",
          actual_storage_capacity: item.actual_storage_capacity || "",
          approved_storage_capacity: item.approved_storage_capacity || "",
          is_affidavit: item.is_affidavit,
          bank_solvency_certificate_amount:
            item.bank_solvency_certificate_amount || "",
          bank_solvency_deduction_by_bill:
            item.bank_solvency_deduction_by_bill || "",
          emi_deduction_by_bill: item.emi_deduction_by_bill || "",
          total_emi: item.total_emi || "",
          balance_amount_emi: item.balance_amount_emi || "",
          bank_solvency_balance_amount: item.bank_solvency_balance_amount || "",
        })),
      );
    }
  }, [currentWarehouse]);

  const handleCropChange = (index, field, value) => {
    const updated = [...cropData];

    updated[index][field] = field === "is_affidavit" ? value === "true" : value;

    if (field === "is_affidavit" && value === "false") {
      updated[index].bank_solvency_deduction_by_bill = 0;
      updated[index].bank_solvency_balance_amount = 0;
    }

    setCropData(updated);
  };

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
      cropData,
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
        <Button
          className="gap-2"
          variant="outline"
          onClick={() => navigate(-1)}
        >
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
          {cropData.map((item, index) => (
            <div key={index} className="border rounded-lg border-gray-300 p-6 space-y-6">

              {/* Crop Year */}
              <Section title={`Crop Year ${index + 1}`}>
                <Grid>
                  <FormField label="Crop Year">
                    <Input
                      value={item.crop_year}
                      placeholder="e.g. 2024-25"
                      onChange={(e) =>
                        handleCropChange(index, "crop_year", e.target.value)
                      }
                    />
                  </FormField>
                </Grid>
              </Section>

              {/* SCHEME */}
              <Section title="Scheme & Capacity">
                <Grid>
                  <FormField label="Scheme">
                    <Input
                      value={item.scheme}
                      onChange={(e) =>
                        handleCropChange(index, "scheme", e.target.value)
                      }
                      placeholder="Scheme"
                    />
                  </FormField>

                  <FormField label="Scheme Rate Amount">
                    <Input
                      type="number"
                      value={item.scheme_rate_amount}
                      onChange={(e) =>
                        handleCropChange(
                          index,
                          "scheme_rate_amount",
                          e.target.value,
                        )
                      }
                      placeholder="Scheme Rate Amount"
                    />
                  </FormField>

                  <FormField label="Actual Storage Capacity">
                    <Input
                      type="number"
                      value={item.actual_storage_capacity}
                      onChange={(e) =>
                        handleCropChange(
                          index,
                          "actual_storage_capacity",
                          e.target.value,
                        )
                      }
                      placeholder="Actual Storage Capacity"
                    />
                  </FormField>

                  <FormField label="Approved Storage Capacity">
                    <Input
                      type="number"
                      value={item.approved_storage_capacity}
                      onChange={(e) =>
                        handleCropChange(
                          index,
                          "approved_storage_capacity",
                          e.target.value,
                        )
                      }
                      placeholder="Approved Storage Capacity"
                    />
                  </FormField>
                </Grid>
              </Section>

              {/* SOLVENCY */}
              <Section title="Bank Solvency">
                <Grid>
                  <FormField label="Affidavit/Certificate">
                    <select
                      value={item.is_affidavit}
                      onChange={(e) =>
                        handleCropChange(index, "is_affidavit", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="true">Affidavit</option>
                      <option value="false">Certificate</option>
                    </select>
                  </FormField>

                  <FormField label="Bank Solvency Certificate Amount">
                    <Input
                      type="number"
                      value={item.bank_solvency_certificate_amount}
                      onChange={(e) =>
                        handleCropChange(
                          index,
                          "bank_solvency_certificate_amount",
                          e.target.value,
                        )
                      }
                      placeholder="Certificate Amount"
                    />
                  </FormField>

                  <FormField label="Bank Solvency Deduction by Bill">
                    <Input
                      type="number"
                      value={item.bank_solvency_deduction_by_bill}
                      onChange={(e) =>
                        handleCropChange(
                          index,
                          "bank_solvency_deduction_by_bill",
                          e.target.value,
                        )
                      }
                      placeholder="Deduction"
                    />
                  </FormField>

                  <FormField label="Balance Amount Bank Solvancy">
                    <Input
                      type="number"
                      value={item.bank_solvency_balance_amount}
                      onChange={(e) =>
                        handleCropChange(
                          index,
                          "bank_solvency_balance_amount",
                          e.target.value,
                        )
                      }
                      placeholder="Balance"
                    />
                  </FormField>
                </Grid>
              </Section>

              {/* EMI */}
              <Section title="EMI">
                <Grid>
                  <FormField label="Total EMI">
                    <Input
                      type="number"
                      value={item.total_emi}
                      onChange={(e) =>
                        handleCropChange(index, "total_emi", e.target.value)
                      }
                      placeholder="Total EMI"
                    />
                  </FormField>

                  <FormField label="EMI Deduction by Bill">
                    <Input
                      type="number"
                      value={item.emi_deduction_by_bill}
                      onChange={(e) =>
                        handleCropChange(
                          index,
                          "emi_deduction_by_bill",
                          e.target.value,
                        )
                      }
                      placeholder="EMI Deduction by Bill"
                    />
                  </FormField>

                  <FormField label="EMI Balance">
                    <Input
                      type="number"
                      value={item.balance_amount_emi}
                      onChange={(e) =>
                        handleCropChange(
                          index,
                          "balance_amount_emi",
                          e.target.value,
                        )
                      }
                      placeholder="EMI Balance"
                    />
                  </FormField>
                </Grid>
              </Section>
            </div>
          ))}

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
            <Button type="submit">
              {loading ? "Updating..." : "Update Warehouse"}
            </Button>
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
