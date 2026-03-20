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

    scheme: "",
    scheme_rate_amount: "",
    actual_storage_capacity: "",
    approved_storage_capacity: "",

    bank_solvency_deduction_by_bill: "",
    emi_deduction_by_bill: "",

    is_affidavit: true,

    pan_card_holder: "",
    pan_card_number: "",
  });

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

    /* ================= SCHEME ================= */
    if (!form.scheme) newErrors.scheme = "Scheme is required";
    if (!form.scheme_rate_amount)
      newErrors.scheme_rate_amount = "Scheme rate is required";

    if (!form.actual_storage_capacity)
      newErrors.actual_storage_capacity = "Actual capacity is required";

    if (!form.approved_storage_capacity)
      newErrors.approved_storage_capacity = "Approved capacity is required";

    /* ================= SOLVENCY ================= */
    if (form.is_affidavit === null || form.is_affidavit === undefined) {
      newErrors.is_affidavit = "Select affidavit or certificate";
    }

    // If certificate selected → require amount
    if (!form.is_affidavit && !form.bank_solvency_certificate_amount) {
      newErrors.bank_solvency_certificate_amount =
        "Certificate amount is required";
    }

    if (
      form.bank_solvency_deduction_by_bill === undefined ||
      form.bank_solvency_deduction_by_bill === ""
    ) {
      newErrors.bank_solvency_deduction_by_bill = "Deduction is required";
    }

    /* ================= EMI ================= */
    if (
      form.emi_deduction_by_bill === undefined ||
      form.emi_deduction_by_bill === ""
    ) {
      newErrors.emi_deduction_by_bill = "EMI deduction is required";
    }

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

    const result = await dispatch(createWarehouse(preparedData));
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
          <Section title="Scheme & Capacity">
            <Grid>
              <FormField label="Scheme">
                <Input
                  name="scheme"
                  placeholder="Scheme"
                  value={form.scheme}
                  onChange={handleChange}
                />
                {errors.scheme && (
                  <p className="text-red-500 text-sm mt-1">{errors.scheme}</p>
                )}
              </FormField>
              <FormField label="Scheme Rate Amount">
                <Input
                  type="number"
                  name="scheme_rate_amount"
                  placeholder="Scheme Rate"
                  value={form.scheme_rate_amount}
                  onChange={handleChange}
                />
                {errors.scheme_rate_amount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.scheme_rate_amount}
                  </p>
                )}
              </FormField>
              <FormField label="Actual Storage Capacity">
                <Input
                  type="number"
                  name="actual_storage_capacity"
                  placeholder="Actual Capacity"
                  value={form.actual_storage_capacity}
                  onChange={handleChange}
                />
                {errors.actual_storage_capacity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.actual_storage_capacity}
                  </p>
                )}
              </FormField>
              <FormField label="Approved Storage Capacity">
                <Input
                  type="number"
                  name="approved_storage_capacity"
                  placeholder="Approved Capacity"
                  value={form.approved_storage_capacity}
                  onChange={handleChange}
                />
                {errors.approved_storage_capacity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.approved_storage_capacity}
                  </p>
                )}
              </FormField>
            </Grid>
          </Section>

          {/* SOLVENCY */}
          <Section title="Bank Solvency">
            <Grid>
              <FormField label="Affidavit/Certificate">
                <select
                  name="is_affidavit"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-all duration-200"
                >
                  <option value="true">Affidavit</option>
                  <option value="false">Certificate</option>
                </select>
                {errors.is_affidavit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.is_affidavit}
                  </p>
                )}
              </FormField>

              {form.is_affidavit ? (
                <FormField label="Bank Solvency Affidavit Amount">
                  <Input
                    placeholder="Affidavit Amount (Auto)"
                    value={
                      form.bank_solvency_affidavit_amount ?? affidavitAmount
                    }
                    onChange={handleChange}
                    name="bank_solvency_affidavit_amount"
                  />
                  {errors.affidavitAmount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.affidavitAmount}
                    </p>
                  )}
                </FormField>
              ) : (
                <FormField label="Bank Solvency Certificate Amount">
                  <Input
                    type="number"
                    name="bank_solvency_certificate_amount"
                    value={form.bank_solvency_certificate_amount}
                    placeholder="Certificate Amount"
                    onChange={handleChange}
                  />
                  {errors.bank_solvency_certificate_amount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.bank_solvency_certificate_amount}
                    </p>
                  )}
                </FormField>
              )}
              <FormField label="Bank Solvency Deduction by Bill">
                <Input
                  type="number"
                  name="bank_solvency_deduction_by_bill"
                  value={form.bank_solvency_deduction_by_bill}
                  placeholder="Deduction"
                  onChange={handleChange}
                />
                {errors.bank_solvency_deduction_by_bill && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.bank_solvency_deduction_by_bill}
                  </p>
                )}
              </FormField>
              <FormField label="Balance Amount Bank Solvancy">
                <Input
                  value={form.bank_solvency_balance_amount ?? solvencyBalance}
                  onChange={handleChange}
                  placeholder="Balance (Auto)"
                  name="bank_solvency_balance_amount"
                />
                {errors.solvencyBalance && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.solvencyBalance}
                  </p>
                )}
              </FormField>
            </Grid>
          </Section>

          {/* EMI */}
          <Section title="EMI">
            <Grid>
              <FormField label="Total EMI">
                <Input
                  value={form.total_emi ?? totalEMI}
                  onChange={handleChange}
                  placeholder="Total EMI"
                  name="total_emi"
                />
                {errors.totalEMI && (
                  <p className="text-red-500 text-sm mt-1">{errors.totalEMI}</p>
                )}
              </FormField>
              <FormField label="EMI Deduction by Bill">
                <Input
                  type="number"
                  name="emi_deduction_by_bill"
                  value={form.emi_deduction_by_bill}
                  placeholder="EMI Deduction by Bill"
                  onChange={handleChange}
                />
                {errors.emi_deduction_by_bill && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.emi_deduction_by_bill}
                  </p>
                )}
              </FormField>
              <FormField label="EMI Balance">
                <Input
                  value={form.balance_amount_emi ?? emiBalance}
                  onChange={handleChange}
                  placeholder="EMI Balance"
                  name="balance_amount_emi"
                />
                {errors.emiBalance && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.emiBalance}
                  </p>
                )}
              </FormField>
            </Grid>
          </Section>

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
