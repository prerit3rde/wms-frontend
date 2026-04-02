import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createWarehouse } from "../../redux/slices/warehouseSlice";
import { useNavigate } from "react-router-dom";
import Card from "../../components/global/Card";
import Button from "../../components/global/Button";
import Input from "../../components/global/Input";
import axios from "../../services/axios";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const AddWarehouse = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.warehouse);

  const [types, setTypes] = useState([]);

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

  const [cropData, setCropData] = useState([
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
  ]);

  const handleCropChange = (index, field, value) => {
    const updated = [...cropData];

    const isBooleanField = field === "is_affidavit";

    updated[index][field] = isBooleanField ? value === "true" : value;

    /* ✅ If Certificate selected */
    if (field === "is_affidavit" && value === "false") {
      updated[index].bank_solvency_deduction_by_bill = 0;
      updated[index].bank_solvency_balance_amount = 0;
    }

    setCropData(updated);
  };

  const [filterOptions, setFilterOptions] = useState({
    districts: [],
    branches: [],
  });

  const [showDistrictSuggestions, setShowDistrictSuggestions] = useState(false);
  const [showBranchSuggestions, setShowBranchSuggestions] = useState(false);

  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};

    /* ================= BASIC ================= */
    if (!form.district_name) newErrors.district_name = "District is required";
    if (!form.branch_name) newErrors.branch_name = "Branch is required";
    if (!form.warehouse_name)
      newErrors.warehouse_name = "Warehouse name is required";
    if (!form.warehouse_owner_name)
      newErrors.warehouse_owner_name = "Owner is required";
    if (!form.warehouse_type_id)
      newErrors.warehouse_type_id = "Type is required";
    if (!form.warehouse_no)
      newErrors.warehouse_no = "Warehouse number is required";

    if (!form.pan_card_holder)
      newErrors.pan_card_holder = "PAN holder is required";
    if (!form.pan_card_number)
      newErrors.pan_card_number = "PAN number is required";

    cropData.forEach((item, index) => {
      if (!item.crop_year) {
        newErrors[`crop_year_${index}`] = "Crop year required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const preparedData = {
    ...form,
    bank_solvency_affidavit_amount: form.bank_solvency_affidavit_amount || 0,
    bank_solvency_certificate_amount:
      form.bank_solvency_certificate_amount || 0,
    bank_solvency_balance_amount: form.bank_solvency_balance_amount || 0,
    total_emi: form.total_emi || 0,
    balance_amount_emi: form.balance_amount_emi || 0,
  };

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await axios.get("/warehouses/filters");
        setFilterOptions(res.data.data);
      } catch (err) {
        console.error("Failed to load filters");
      }
    };

    fetchFilters();
  }, []);

  /* ================= FETCH TYPES ================= */
  useEffect(() => {
    axios.get("/warehouse-types").then((res) => {
      setTypes(res.data.data || []);
    });
  }, []);

  const filteredDistricts = filterOptions.districts.filter((d) =>
    d.district_name?.toLowerCase().includes(form.district_name.toLowerCase()),
  );

  const filteredBranches = filterOptions.branches.filter((b) =>
    b.branch_name?.toLowerCase().includes(form.branch_name.toLowerCase()),
  );

  /* ================= AUTO CALCULATIONS ================= */
  const affidavitAmount =
    form.bank_solvency_affidavit_amount ??
    (form.approved_storage_capacity * 50 || 0);

  const totalEMI =
    form.total_emi ??
    ((form.actual_storage_capacity * form.scheme_rate_amount) / 2 || 0);

  const solvencyBase = form.is_affidavit
    ? affidavitAmount
    : form.bank_solvency_certificate_amount || 0;

  const solvencyBalance =
    form.bank_solvency_balance_amount ??
    solvencyBase - (form.bank_solvency_deduction_by_bill || 0);

  const emiBalance =
    form.balance_amount_emi ?? totalEMI - (form.emi_deduction_by_bill || 0);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedForm = {
      ...form,
      [name]: name === "is_affidavit" ? value === "true" : value,
    };

    // ✅ If Certificate selected → reset values
    if (name === "is_affidavit" && value === "false") {
      updatedForm.bank_solvency_deduction_by_bill = 0;
      updatedForm.bank_solvency_balance_amount = 0;
    }

    setForm(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const finalData = {
      ...form,
      cropData,
    };

    const result = await dispatch(createWarehouse(finalData));

    toast.success("Warehouse added successfully!", {
      style: {
        maxWidth: "fit-content",
      },
    });
    if (result.payload) navigate("/admin/warehouses");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Add Warehouse</h1>
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
                <div className="relative">
                  <Input
                    name="district_name"
                    placeholder="District Name"
                    value={form.district_name}
                    onChange={(e) => {
                      handleChange(e);
                      setShowDistrictSuggestions(true);
                    }}
                    onBlur={() =>
                      setTimeout(() => setShowDistrictSuggestions(false), 200)
                    }
                  />

                  {errors.district_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.district_name}
                    </p>
                  )}

                  {showDistrictSuggestions &&
                    form.district_name &&
                    filteredDistricts.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border rounded-lg shadow mt-1 max-h-40 overflow-y-auto">
                        {filteredDistricts.map((d, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                            onClick={() => {
                              setForm({
                                ...form,
                                district_name: d.district_name,
                              });
                              setShowDistrictSuggestions(false);
                            }}
                          >
                            {d.district_name}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </FormField>
              <FormField label="Branch">
                <div className="relative">
                  <Input
                    name="branch_name"
                    placeholder="Branch Name"
                    value={form.branch_name}
                    onChange={(e) => {
                      handleChange(e);
                      setShowBranchSuggestions(true);
                    }}
                    onBlur={() =>
                      setTimeout(() => setShowBranchSuggestions(false), 200)
                    }
                  />

                  {errors.branch_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.branch_name}
                    </p>
                  )}

                  {showBranchSuggestions &&
                    form.branch_name &&
                    filteredBranches.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border rounded-lg shadow mt-1 max-h-40 overflow-y-auto">
                        {filteredBranches.map((b, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                            onClick={() => {
                              setForm({ ...form, branch_name: b.branch_name });
                              setShowBranchSuggestions(false);
                            }}
                          >
                            {b.branch_name}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </FormField>
              <FormField label="Warehouse Name">
                <Input
                  name="warehouse_name"
                  placeholder="Warehouse Name"
                  value={form.warehouse_name}
                  onChange={handleChange}
                />
                {errors.warehouse_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.warehouse_name}
                  </p>
                )}
              </FormField>
              <FormField label="Warehouse Owner">
                <Input
                  name="warehouse_owner_name"
                  placeholder="Owner"
                  value={form.warehouse_owner_name}
                  onChange={handleChange}
                />
                {errors.warehouse_owner_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.warehouse_owner_name}
                  </p>
                )}
              </FormField>

              {/* TYPE DROPDOWN */}
              <FormField label="Warehouse Type">
                <select
                  name="warehouse_type_id"
                  onChange={handleChange}
                  value={form.warehouse_type_id}
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
                {errors.warehouse_type_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.warehouse_type_id}
                  </p>
                )}
              </FormField>

              <FormField label="Warehouse No">
                <Input
                  name="warehouse_no"
                  placeholder="Warehouse No"
                  value={form.warehouse_no}
                  onChange={handleChange}
                />
                {errors.warehouse_no && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.warehouse_no}
                  </p>
                )}
              </FormField>
              <FormField label="GST No">
                <Input
                  name="gst_no"
                  placeholder="GST (Optional)"
                  value={form.gst_no}
                  onChange={handleChange}
                />
                {errors.gst_no && (
                  <p className="text-red-500 text-sm mt-1">{errors.gst_no}</p>
                )}
              </FormField>
            </Grid>
          </Section>

          {/* SCHEME */}
          {cropData.map((item, index) => {
            const affidavitAmount = item.approved_storage_capacity * 50 || 0;

            const isCertificate = item.is_affidavit === false;

            const totalEMI =
              (item.actual_storage_capacity * item.scheme_rate_amount) / 2 || 0;

            const solvencyBase = item.is_affidavit
              ? affidavitAmount
              : item.bank_solvency_certificate_amount || 0;

            const solvencyBalance = isCertificate
              ? 0
              : solvencyBase - (item.bank_solvency_deduction_by_bill || 0);

            const emiBalance =
              (item.total_emi ?? totalEMI) - (item.emi_deduction_by_bill || 0);

            return (
              <div key={index} className="p-4 rounded-lg space-y-6 border border-gray-300">
                {/* CROP YEAR */}
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
                          handleCropChange(
                            index,
                            "is_affidavit",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="true">Affidavit</option>
                        <option value="false">Certificate</option>
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
                          placeholder="Bank Solvency Affidavit Amount"
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
                          placeholder="Bank Solvency Certificate Amount"
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
                        placeholder="Bank Solvency Deduction by Bill"
                      />
                    </FormField>

                    <FormField label="Balance Amount Bank Solvancy">
                      <Input
                        value={
                          item.bank_solvency_balance_amount ?? solvencyBalance
                        }
                        onChange={(e) =>
                          handleCropChange(
                            index,
                            "bank_solvency_balance_amount",
                            e.target.value,
                          )
                        }
                        placeholder="Balance Amount Bank Solvancy"
                      />
                    </FormField>
                  </Grid>
                </Section>

                {/* EMI */}
                <Section title="EMI">
                  <Grid>
                    <FormField label="Total EMI">
                      <Input
                        value={item.total_emi ?? totalEMI}
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
            );
          })}
          <Button
            type="button"
            onClick={() =>
              setCropData([
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
              ])
            }
          >
            + Add Crop Year
          </Button>

          {/* PAN */}
          <Section title="PAN Details">
            <Grid>
              <FormField label="PAN Card Holder">
                <Input
                  name="pan_card_holder"
                  placeholder="PAN Card Holder"
                  value={form.pan_card_holder}
                  onChange={handleChange}
                />
                {errors.pan_card_holder && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.pan_card_holder}
                  </p>
                )}
              </FormField>
              <FormField label="PAN Card Number">
                <Input
                  name="pan_card_number"
                  placeholder="PAN Card Number"
                  value={form.pan_card_number}
                  onChange={handleChange}
                />
                {errors.pan_card_number && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.pan_card_number}
                  </p>
                )}
              </FormField>
            </Grid>
          </Section>
          <div className="flex gap-3 mt-10">
            <Button type="submit">
              {loading ? "Saving..." : "Save Warehouse"}
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

/* UI Helpers */
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

export default AddWarehouse;
