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
import { ArrowLeft, ChevronDown, Trash2 } from "lucide-react";

const EditWarehouse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentWarehouse, loading, error } = useSelector(
    (state) => state.warehouse,
  );

  const [types, setTypes] = useState([]);

  const [openAccordion, setOpenAccordion] = useState(0);

  const removeCropYear = (index) => {
    if (cropData.length === 1) return;

    const updated = cropData.filter((_, i) => i !== index);
    setCropData(updated);

    if (index > 0) {
      setOpenAccordion(index - 1);
    } else {
      setOpenAccordion(0);
    }
  };

  const [form, setForm] = useState({
    district_name: "",
    branch_name: "",
    warehouse_name: "",
    warehouse_owner_name: "",
    warehouse_type_id: "",
    warehouse_no: "",
    gst_no: "",

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
          scheme_rate_amount: item.scheme_rate_amount,
          actual_storage_capacity: item.actual_storage_capacity,
          approved_storage_capacity: item.approved_storage_capacity,
          is_affidavit: item.is_affidavit,
          bank_solvency_certificate_amount:
            item.bank_solvency_certificate_amount,
          bank_solvency_affidavit_amount: item.bank_solvency_affidavit_amount,
          bank_solvency_deduction_by_bill: item.bank_solvency_deduction_by_bill,
          emi_deduction_by_bill: item.emi_deduction_by_bill,
          total_emi: item.total_emi,
          balance_amount_emi: item.balance_amount_emi,
          bank_solvency_balance_amount: item.bank_solvency_balance_amount,
        })),
      );
    }
  }, [currentWarehouse]);

  const handleCropChange = (index, field, value) => {
    const updated = [...cropData];

    updated[index][field] =
      field === "is_affidavit"
        ? value === "true" || value === "1"
          ? 1
          : 0
        : value;

    /* ✅ Reset dependent fields when source fields change to trigger re-calculation */
    if (field === "actual_storage_capacity" || field === "scheme_rate_amount") {
      updated[index].total_emi = null;
      updated[index].balance_amount_emi = null;
    }

    if (field === "approved_storage_capacity") {
      updated[index].bank_solvency_affidavit_amount = null;
      updated[index].bank_solvency_balance_amount = null;
    }

    if (field === "total_emi" || field === "emi_deduction_by_bill") {
      updated[index].balance_amount_emi = null;
    }

    if (
      field === "bank_solvency_affidavit_amount" ||
      field === "bank_solvency_certificate_amount" ||
      field === "bank_solvency_deduction_by_bill"
    ) {
      updated[index].bank_solvency_balance_amount = null;
    }

    /* ✅ Handle Affidavit/Certificate switch - Simple solution: clear inactive amount */
    if (field === "is_affidavit") {
      const isAff = Number(updated[index].is_affidavit) === 1;
      if (isAff) {
        updated[index].bank_solvency_certificate_amount = 0;
      } else {
        updated[index].bank_solvency_affidavit_amount = 0;
        updated[index].bank_solvency_deduction_by_bill = 0;
        updated[index].bank_solvency_balance_amount = 0;
      }
    }

    setCropData(updated);
  };

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

    const preparedCropData = cropData.map((item) => {
      const affidavitAmount = (item.approved_storage_capacity * 50) || 0;

      const totalEMI =
        item.total_emi !== null &&
        item.total_emi !== undefined &&
        item.total_emi !== ""
          ? Number(item.total_emi)
          : (item.actual_storage_capacity * item.scheme_rate_amount) / 2 || 0;

      const emiBalance = totalEMI - (item.emi_deduction_by_bill || 0);

      const actualAffidavitAmount =
        item.bank_solvency_affidavit_amount !== undefined &&
        item.bank_solvency_affidavit_amount !== null &&
        item.bank_solvency_affidavit_amount !== ""
          ? Number(item.bank_solvency_affidavit_amount)
          : affidavitAmount;

      const isAff = Number(item.is_affidavit) === 1;

      const solvencyBase = isAff
        ? actualAffidavitAmount
        : Number(item.bank_solvency_certificate_amount || 0);

      const solvencyBalance =
        item.bank_solvency_balance_amount !== undefined &&
        item.bank_solvency_balance_amount !== null &&
        item.bank_solvency_balance_amount !== ""
          ? Number(item.bank_solvency_balance_amount)
          : solvencyBase - (item.bank_solvency_deduction_by_bill || 0);

      const finalAffidavitAmount = isAff ? actualAffidavitAmount : 0;
      const finalCertificateAmount = !isAff
        ? Number(item.bank_solvency_certificate_amount || 0)
        : 0;

      return {
        ...item,
        is_affidavit: isAff ? 1 : 0,
        bank_solvency_affidavit_amount: Number(finalAffidavitAmount || 0),
        bank_solvency_certificate_amount: Number(finalCertificateAmount || 0),
        bank_solvency_balance_amount: Number(solvencyBalance || 0),
        total_emi: Number(totalEMI || 0),
        balance_amount_emi: Number(emiBalance || 0),
      };
    });

    const payload = {
      ...form,
      cropData: preparedCropData,
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
          {cropData.map((item, index) => {
            const affidavitAmount = item.approved_storage_capacity * 50 || 0;

            const isAff = Number(item.is_affidavit) === 1;
            const isCertificate = !isAff;

            const totalEMI =
              (item.actual_storage_capacity * item.scheme_rate_amount) / 2 || 0;

            const solvencyBase = isAff
              ? affidavitAmount
              : item.bank_solvency_certificate_amount || 0;

            const solvencyBalance = isCertificate
              ? 0
              : solvencyBase - (item.bank_solvency_deduction_by_bill || 0);

            const emiBalance =
              (item.total_emi ?? totalEMI) - (item.emi_deduction_by_bill || 0);
            return (
              <div key={index} className="border rounded-lg overflow-hidden">
                {/* ✅ HEADER */}
                <div
                  className="flex justify-between items-center bg-gray-100 px-4 py-3 cursor-pointer"
                  onClick={() =>
                    setOpenAccordion(openAccordion === index ? null : index)
                  }
                >
                  <h2 className="font-semibold">Crop Year {index + 1}</h2>
                  <div className="flex gap-2 items-center">
                    {/* DELETE ICON */}
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCropYear(index);
                        }}
                        className="cursor-pointer text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    {/* CHEVRON */}
                    <span
                      className={`transition-transform duration-300 ${
                        openAccordion === index ? "rotate-180" : ""
                      }`}
                    >
                      <ChevronDown />
                    </span>
                  </div>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openAccordion === index
                      ? "max-h-[2000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-4 space-y-6 border-t">
                    {/* Crop Year */}
                    <Section className={"hidden"}>
                      <Grid>
                        <FormField label="Crop Year">
                          <Input
                            value={item.crop_year}
                            placeholder="e.g. 2024-25"
                            onChange={(e) =>
                              handleCropChange(
                                index,
                                "crop_year",
                                e.target.value,
                              )
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
                            value={String(item.is_affidavit)}
                            onChange={(e) =>
                              handleCropChange(
                                index,
                                "is_affidavit",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="1">Affidavit</option>
                            <option value="0">Certificate</option>
                          </select>
                        </FormField>

                        {item.is_affidavit ? (
                          <FormField label="Bank Solvency Affidavit Amount">
                            <Input
                              value={
                                item.bank_solvency_affidavit_amount ??
                                affidavitAmount
                              }
                              onChange={(e) =>
                                handleCropChange(
                                  index,
                                  "bank_solvency_affidavit_amount",
                                  e.target.value,
                                )
                              }
                            />
                          </FormField>
                        ) : (
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
                            />
                          </FormField>
                        )}

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
                            value={
                              item.bank_solvency_balance_amount ??
                              solvencyBalance
                            }
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
                            value={item.total_emi ?? totalEMI}
                            onChange={(e) =>
                              handleCropChange(
                                index,
                                "total_emi",
                                e.target.value,
                              )
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
                            value={item.balance_amount_emi ?? emiBalance}
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
                </div>
              </div>
            );
          })}

          <Button
            type="button"
            onClick={() => {
              const newData = [
                ...cropData,
                {
                  crop_year: "",
                  scheme: "",
                  scheme_rate_amount: "",
                  actual_storage_capacity: "",
                  approved_storage_capacity: "",
                  is_affidavit: true,
                  bank_solvency_certificate_amount: "",
                  bank_solvency_deduction_by_bill: "",
                  emi_deduction_by_bill: "",
                },
              ];

              setCropData(newData);
              setOpenAccordion(newData.length - 1);
            }}
          >
            + Add Crop Year
          </Button>

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

const Section = ({ title, children, className }) => (
  <div>
    <h2 className={`font-semibold mb-4 border-b pb-2 ${className}`}>{title}</h2>
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
