import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createNewPayment } from "../../redux/slices/paymentsSlice";
import axiosInstance from "../../services/axios";
import Card from "../../components/global/Card";
import Button from "../../components/global/Button";
import Input from "../../components/global/Input";
import toast from "react-hot-toast";

const steps = [
  "Warehouse Selection",
  "Billing Details",
  // "Scientific Capacity",
  "Deductions",
  // "Payment",
  // "Preview",
  "Remarks",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getDaysInMonth = (month) => {
  const map = {
    January: 31,
    February: 28,
    March: 31,
    April: 30,
    May: 31,
    June: 30,
    July: 31,
    August: 31,
    September: 30,
    October: 31,
    November: 30,
    December: 31,
  };
  return map[month] || 0;
};

const AddPayment = () => {
  const validateStep = () => {
    let newErrors = {};

    if (currentStep === 0) {
      if (!formData.district_name)
        newErrors.district_name = "District is required";
      if (!formData.branch_name) newErrors.branch_name = "Branch is required";
      if (!formData.warehouse_name)
        newErrors.warehouse_name = "Warehouse is required";
    }

    if (currentStep === 1) {
      if (!formData.month) newErrors.month = "Month is required";
      if (!formData.financial_year)
        newErrors.financial_year = "Financial year is required";
      if (!formData.from_date) newErrors.from_date = "From date is required";
      if (!formData.to_date) newErrors.to_date = "To date is required";
      if (!formData.commodity) newErrors.commodity = "Commodity is required";
      if (!formData.rate) newErrors.rate = "Rate is required";
      if (!formData.bill_amount)
        newErrors.bill_amount = "Bill amount is required";
      if (!formData.bill_amount)
        newErrors.bill_amount = "Bill amount is required";
      if (!formData.depositers_name)
        newErrors.depositers_name = "Depositers name is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validateAll = () => {
    let newErrors = {};

    const requiredFields = [
      "district_name",
      "branch_name",
      "warehouse_name",
      "month",
      "financial_year",
      "from_date",
      "to_date",
      "commodity",
      "rate",
      "bill_amount",
      "bill_amount",
      "depositers_name",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [warehouses, setWarehouses] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filteredBranches, setFilteredBranches] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);

  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const [isTdsEdited, setIsTdsEdited] = useState(false);

  const [formData, setFormData] = useState({
    district_name: "",
    branch_name: "",
    warehouse_name: "",
    warehouse_owner_name: "",
    warehouse_type: "",
    warehouse_no: "",
    gst_no: "",
    pan_card_holder: "",
    pan_card_number: "",

    scheme: "",
    scheme_rate_amount: 0,

    actual_storage_capacity: 0,
    approved_storage_capacity: 0,

    bank_solvency_affidavit_amount: 0,
    bank_solvency_certificate_amount: 0,
    bank_solvency_deduction_by_bill: 0,
    bank_solvency_balance: 0,

    total_emi: 0,
    emi_deduction_by_bill: 0,
    emi_balance: 0,

    rent_bill_number: "",
    bill_type: "",

    month: "",
    financial_year: "",
    from_date: "",
    to_date: "",

    commodity: "",
    crop_year: "",
    rate: 0,
    total_jv_amount: 0,

    bill_amount: 0,
    depositers_name: "",

    scientific_capacity: 0,
    number_of_days: "",
    per_day_rate: 0,
    rent_amount_on_scientific_capacity: 0,

    tds: "",
    amount_deducted_against_gain_loss: 0,
    emi_amount: 0,
    deduction_20_percent: 0,
    penalty: 0,
    medicine: 0,
    emi_fdr_interest: 0,
    gain_shortage_deduction: 0,
    stock_shortage_deduction: 0,
    bank_solvancy: 0,
    insurance: 0,
    other_deduction_amount: 0,

    other_deductions_reason: "",
    security_fund_amount: 0,

    pay_to_jvs_amount: "",
    payment_by: "",
    payment_date: "",
    qtr: "",

    // net_amount_payable: "",
    remarks: "",
  });

  const handleCropYearChange = (year) => {
    const selected = selectedWarehouse.cropData.find(
      (c) => c.crop_year === year,
    );

    setFormData({
      ...formData,
      crop_year: year,
      rate: selected?.scheme_rate_amount || 0,
    });
  };

  const searchedWarehouses = warehouses.filter((w) =>
    `${w.warehouse_name} ${w.district_name} ${w.branch_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const billAmount = Number(formData.bill_amount || 0);

    const calculatedTDS = billAmount * 0.1;

    const finalTDS = isTdsEdited
      ? Number(formData.tds || 0) // user value
      : calculatedTDS; // auto value

    const totalDeductions =
      finalTDS +
      Number(formData.amount_deducted_against_gain_loss || 0) +
      Number(formData.emi_amount || 0) +
      Number(formData.deduction_20_percent || 0) +
      Number(formData.penalty || 0) +
      Number(formData.medicine || 0) +
      Number(formData.emi_fdr_interest || 0) +
      Number(formData.gain_shortage_deduction || 0) +
      Number(formData.stock_shortage_deduction || 0) +
      Number(formData.bank_solvancy || 0) +
      Number(formData.insurance || 0) +
      Number(formData.other_deduction_amount || 0);

    const payToJVS = billAmount - totalDeductions;

    setFormData((prev) => ({
      ...prev,

      // ✅ ALWAYS UPDATE if NOT edited
      tds: isTdsEdited ? prev.tds : calculatedTDS.toFixed(2),

      actual_passed_amount: billAmount.toFixed(2),
      pay_to_jvs_amount: payToJVS.toFixed(2),
    }));
  }, [
    formData.bill_amount,
    formData.amount_deducted_against_gain_loss,
    formData.emi_amount,
    formData.deduction_20_percent,
    formData.penalty,
    formData.medicine,
    formData.emi_fdr_interest,
    formData.gain_shortage_deduction,
    formData.stock_shortage_deduction,
    formData.bank_solvancy,
    formData.insurance,
    formData.other_deduction_amount,
    isTdsEdited, // ✅ important
  ]);

  /* ================= FETCH WAREHOUSES ================= */
  useEffect(() => {
    const loadWarehouses = async () => {
      const res = await axiosInstance.get("/warehouses");
      setWarehouses(res.data.data || []);
    };
    loadWarehouses();
  }, []);

  /* ================= FILTER BRANCH BY DISTRICT ================= */
  useEffect(() => {
    if (!formData.district_name) {
      setFilteredBranches([]);
      return;
    }

    const branches = warehouses.filter(
      (w) => w.district_name === formData.district_name,
    );

    setFilteredBranches([...new Set(branches.map((w) => w.branch_name))]);
  }, [formData.district_name, warehouses]);

  /* ================= FILTER TYPE BY BRANCH ================= */
  useEffect(() => {
    if (!formData.branch_name) {
      setFilteredTypes([]);
      return;
    }

    const types = warehouses.filter(
      (w) =>
        w.branch_name === formData.branch_name &&
        w.district_name === formData.district_name,
    );

    setFilteredTypes([...new Set(types.map((w) => w.warehouse_type))]);
  }, [formData.branch_name, formData.district_name, warehouses]);

  /* ================= FILTER WAREHOUSE ================= */
  useEffect(() => {
    const list = warehouses.filter(
      (w) =>
        w.district_name === formData.district_name &&
        w.branch_name === formData.branch_name &&
        w.warehouse_type === formData.warehouse_type,
    );

    setFilteredWarehouses(list);
  }, [
    formData.district_name,
    formData.branch_name,
    formData.warehouse_type,
    warehouses,
  ]);

  /* ================= AUTO SNAPSHOT ================= */
  const handleWarehouseSelect = (name) => {
    const selected = warehouses.find((w) => w.warehouse_name === name);

    if (selected) {
      setSelectedWarehouse(selected); // ✅ IMPORTANT

      setFormData((prev) => ({
        ...prev,
        district_name: selected.district_name,
        branch_name: selected.branch_name,
        warehouse_name: selected.warehouse_name,
        warehouse_owner_name: selected.warehouse_owner_name,
        warehouse_type: selected.warehouse_type,

        // ✅ AUTO SET BILL TYPE
        bill_type: selected.warehouse_type,

        warehouse_no: selected.warehouse_no,
        gst_no: selected.gst_no,
        pan_card_holder: selected.pan_card_holder,
        pan_card_number: selected.pan_card_number,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "tds") {
      setIsTdsEdited(true); // ✅ user manually changed
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const nextStep = () => {
    if (!validateStep()) {
      toast.error("Please fill all required fields");
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!validateAll()) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      setLoading(true);

      const payload = {
        ...formData,

        /* BILLING */
        rate: Number(formData.rate || 0),
        total_jv_amount: Number(formData.total_jv_amount || 0),

        bill_amount: Number(formData.bill_amount || 0),

        /* SCIENTIFIC CAPACITY */
        scientific_capacity: Number(formData.scientific_capacity || 0),
        number_of_days: Number(formData.number_of_days || 0),
        per_day_rate: Number(formData.per_day_rate || 0),
        rent_amount_on_scientific_capacity: Number(
          formData.rent_amount_on_scientific_capacity || 0,
        ),

        /* DEDUCTIONS */
        tds: Number(formData.tds || 0),
        amount_deducted_against_gain_loss: Number(
          formData.amount_deducted_against_gain_loss || 0,
        ),
        emi_amount: Number(formData.emi_amount || 0),
        deduction_20_percent: Number(formData.deduction_20_percent || 0),
        penalty: Number(formData.penalty || 0),
        medicine: Number(formData.medicine || 0),
        emi_fdr_interest: Number(formData.emi_fdr_interest || 0),
        gain_shortage_deduction: Number(formData.gain_shortage_deduction || 0),
        stock_shortage_deduction: Number(
          formData.stock_shortage_deduction || 0,
        ),
        bank_solvancy: Number(formData.bank_solvancy || 0),
        insurance: Number(formData.insurance || 0),
        other_deduction_amount: Number(formData.other_deduction_amount || 0),

        /* SECURITY */
        security_fund_amount: Number(formData.security_fund_amount || 0),

        /* PAYMENT */
        pay_to_jvs_amount: Number(formData.pay_to_jvs_amount || 0),

        /* FINAL */
        // net_amount_payable: Number(formData.net_amount_payable || 0),
      };

      const result = await dispatch(createNewPayment(payload));

      if (result.meta.requestStatus === "fulfilled") {
        navigate("/admin/payments");
        toast.success("Payment created successfully");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add Payment</h1>

      {/* ================= STEPPER ================= */}
      <div className="relative mb-10 w-[50%]">
        <div className="flex justify-between relative z-10">
          {steps.map((_, i) => (
            <div key={i}>
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-semibold ${
                  i <= currentStep
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-400 border-gray-300"
                }`}
              >
                {i + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="absolute top-5 left-5 right-5 h-1 bg-gray-300"></div>
        <div
          className="absolute top-5 left-5 h-1 bg-blue-600 transition-all"
          style={{
            width: `calc(${(currentStep / (steps.length - 1)) * 100}% - 20px)`,
          }}
        />
      </div>

      <Card className="space-y-6">
        {/* STEP TITLE */}
        <div>
          <h2 className="text-lg font-semibold">
            Step {currentStep + 1}: {steps[currentStep]}
          </h2>
          <div className="h-px bg-gray-300 mt-2"></div>
        </div>

        {/* ================= STEP 1 Warehouse Details ================= */}
        {currentStep === 0 && (
          <>
            {/* 🔍 SEARCH WAREHOUSE */}
            <FormField label="Search Warehouse *" error={errors.warehouse_name}>
              <Input
                type="text"
                placeholder="Search by warehouse name / district / branch..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true); // show when typing
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 150);
                }}
                onFocus={() => {
                  if (searchTerm) setShowSuggestions(true);
                }}
              />
            </FormField>

            {/* 🔽 SEARCH RESULTS */}
            {searchTerm && showSuggestions && (
              <div className="col-span-2 border rounded-lg max-h-60 overflow-y-auto">
                {searchedWarehouses.length > 0 ? (
                  searchedWarehouses.map((w) => (
                    <div
                      key={w.id}
                      onClick={() => {
                        handleWarehouseSelect(w.warehouse_name);
                        setSearchTerm(w.warehouse_name);
                        setShowSuggestions(false); // ✅ hide dropdown
                      }}
                      className="p-3 cursor-pointer hover:bg-gray-100 border-b"
                    >
                      <div className="font-medium">{w.warehouse_name}</div>
                      <div className="text-sm text-gray-500">
                        {w.branch_name}, {w.district_name}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-gray-500">No warehouse found</div>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DISTRICT */}
              <FormField label="District *" error={errors.district_name}>
                <select
                  name="district_name"
                  value={formData.district_name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      district_name: e.target.value,
                      branch_name: "",
                      warehouse_type: "",
                      warehouse_name: "",
                    });
                  }}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">Select District</option>
                  {[...new Set(warehouses.map((w) => w.district_name))].map(
                    (d) => (
                      <option key={d}>{d}</option>
                    ),
                  )}
                </select>
              </FormField>

              {/* BRANCH */}
              <FormField label="Branch *" error={errors.branch_name}>
                <select
                  name="branch_name"
                  value={formData.branch_name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      branch_name: e.target.value,
                      warehouse_type: "",
                      warehouse_name: "",
                    });
                  }}
                  className="w-full border rounded-lg p-2"
                  disabled={!formData.district_name}
                >
                  <option value="">Select Branch</option>
                  {filteredBranches.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </FormField>

              {/* TYPE */}
              <FormField label="Warehouse Type *">
                <select
                  name="warehouse_type"
                  value={formData.warehouse_type}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      warehouse_type: e.target.value,
                      warehouse_name: "",
                    });
                  }}
                  className="w-full border rounded-lg p-2"
                  disabled={!formData.branch_name}
                >
                  <option value="">Select Type</option>
                  {filteredTypes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </FormField>

              {/* WAREHOUSE NAME */}
              <FormField label="Warehouse Name *" error={errors.warehouse_name}>
                <select
                  value={formData.warehouse_name}
                  onChange={(e) => handleWarehouseSelect(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  disabled={!formData.warehouse_type}
                >
                  <option value="">Select Warehouse</option>
                  {filteredWarehouses.map((w) => (
                    <option key={w.id}>{w.warehouse_name}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Warehouse No">
                <Input
                  value={formData.warehouse_no}
                  readOnly
                  placeholder="Warehouse No"
                />
              </FormField>

              <FormField label="PAN Number">
                <Input
                  value={formData.pan_card_number}
                  readOnly
                  placeholder="PAN Number"
                />
              </FormField>
            </div>
          </>
        )}

        {/* ================= STEP 2 Bill Details ================= */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Rent Bill Number">
              <Input
                name="rent_bill_number"
                value={formData.rent_bill_number}
                onChange={handleChange}
                placeholder="Rent Bill Number"
              />
            </FormField>

            <FormField label="Bill Type">
              <Input
                name="bill_type"
                value={formData.bill_type}
                readOnly
                className="bg-gray-100"
                placeholder="Auto selected from warehouse"
              />
            </FormField>

            <FormField label="Month *" error={errors.month}>
              <select
                name="month"
                value={formData.month}
                onChange={(e) => {
                  const month = e.target.value;

                  const days = getDaysInMonth(month);

                  // Extract year from financial year (2026-27 → 2026)
                  const year = formData.financial_year
                    ? formData.financial_year.split("-")[0]
                    : "";

                  const monthIndex = months.indexOf(month) + 1;
                  const formattedMonth = String(monthIndex).padStart(2, "0");

                  let fromDate = "";
                  let toDate = "";

                  if (month && year) {
                    fromDate = `01/${formattedMonth}/${year}`;
                    toDate = `${days}/${formattedMonth}/${year}`;
                  }

                  setFormData({
                    ...formData,
                    month,
                    number_of_days: days,
                    from_date: fromDate,
                    to_date: toDate,
                  });
                }}
                className="w-full border rounded-lg p-2"
              >
                <option value="">Select Month</option>
                {months.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Financial Year" error={errors.financial_year}>
              <Input
                name="financial_year"
                value={formData.financial_year}
                onChange={(e) => {
                  const financial_year = e.target.value;

                  const month = formData.month;
                  const days = getDaysInMonth(month);

                  const year = financial_year
                    ? financial_year.split("-")[0]
                    : "";

                  const monthIndex = months.indexOf(month) + 1;
                  const formattedMonth = String(monthIndex).padStart(2, "0");

                  let fromDate = "";
                  let toDate = "";

                  if (month && year) {
                    fromDate = `01/${formattedMonth}/${year}`;
                    toDate = `${days}/${formattedMonth}/${year}`;
                  }

                  setFormData({
                    ...formData,
                    financial_year,
                    from_date: fromDate,
                    to_date: toDate,
                  });
                }}
                placeholder="Financial Year"
              />
            </FormField>

            {/* <FormField label="From Date" error={errors.from_date}>
              <Input
                type="text"
                name="from_date"
                value={formData.from_date}
                onChange={handleChange}
                placeholder="From Date"
              />
            </FormField>

            <FormField label="To Date" error={errors.to_date}>
              <Input
                type="text"
                name="to_date"
                value={formData.to_date}
                onChange={handleChange}
                placeholder="To Date"
              />
            </FormField> */}

            <FormField label="Commodity *" error={errors.commodity}>
              <Input
                name="commodity"
                value={formData.commodity}
                onChange={handleChange}
                placeholder="Commodity"
              />
            </FormField>

            <FormField label="Crop Year *">
              <select
                name="crop_year"
                value={formData.crop_year}
                onChange={(e) => {
                  const cropYear = e.target.value;

                  const cropData = selectedWarehouse?.cropData?.find(
                    (c) => c.crop_year === cropYear,
                  );

                  setFormData({
                    ...formData,
                    crop_year: cropYear,

                    // ✅ BILLING
                    rate: cropData?.scheme_rate_amount || 0,

                    // ✅ IMPORTANT FIELDS FOR DB
                    scheme: cropData?.scheme || "",
                    scheme_rate_amount: cropData?.scheme_rate_amount || 0,

                    actual_storage_capacity:
                      cropData?.actual_storage_capacity || 0,
                    approved_storage_capacity:
                      cropData?.approved_storage_capacity || 0,

                    bank_solvency_affidavit_amount:
                      cropData?.bank_solvency_affidavit_amount || 0,

                    bank_solvency_certificate_amount:
                      cropData?.bank_solvency_certificate_amount || 0,

                    bank_solvency_deduction_by_bill:
                      cropData?.bank_solvency_deduction_by_bill || 0,

                    bank_solvency_balance:
                      cropData?.bank_solvency_balance_amount || 0,

                    total_emi: cropData?.total_emi || 0,
                    emi_deduction_by_bill: cropData?.emi_deduction_by_bill || 0,
                    emi_balance: cropData?.balance_amount_emi || 0,
                  });
                }}
                className="w-full border rounded-lg p-2"
                disabled={!selectedWarehouse}
              >
                <option value="">Select Crop Year</option>

                {selectedWarehouse?.cropData?.map((c) => (
                  <option key={c.crop_year} value={c.crop_year}>
                    {c.crop_year}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Rate *" error={errors.rate}>
              <Input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                placeholder="Rate"
              />
            </FormField>

            <FormField label="Bill Amount *" error={errors.bill_amount}>
              <Input
                type="number"
                name="bill_amount"
                value={formData.bill_amount}
                onChange={handleChange}
                placeholder="Bill Amount"
              />
            </FormField>

            <FormField label="Total JV Amount">
              <Input
                type="number"
                name="total_jv_amount"
                value={formData.total_jv_amount}
                onChange={handleChange}
                placeholder="Total JV Amount"
              />
            </FormField>

            <FormField label="Actual Passed Amount">
              <Input
                type="number"
                name="actual_passed_amount"
                value={formData.actual_passed_amount}
                className="bg-gray-100"
                placeholder="Actual Passed Amount"
                onChange={handleChange}
              />
            </FormField>

            <FormField label="Depositers Name *" error={errors.depositers_name}>
              <Input
                name="depositers_name"
                value={formData.depositers_name}
                onChange={handleChange}
                placeholder="Depositers Name"
              />
            </FormField>
          </div>
        )}

        {/* ================= STEP 3 Scientific Capacity ================= */}
        {/* {currentStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Scientific Capacity">
              <Input
                type="number"
                name="scientific_capacity"
                value={formData.scientific_capacity}
                onChange={handleChange}
                placeholder="Scientific Capacity"
              />
            </FormField>

            <FormField label="Number of Days">
              <Input
                name="number_of_days"
                value={formData.number_of_days}
                onChange={handleChange}
                className="bg-gray-100"
              />
            </FormField>

            <FormField label="Per Day Rate">
              <Input
                type="number"
                name="per_day_rate"
                value={formData.per_day_rate}
                onChange={handleChange}
                placeholder="Per Day Rate"
              />
            </FormField>

            <FormField label="Rent Amount On Scientific Capacity">
              <Input
                type="number"
                name="rent_amount_on_scientific_capacity"
                value={formData.rent_amount_on_scientific_capacity}
                onChange={handleChange}
                placeholder="Rent Amount On Scientific Capacity"
              />
            </FormField>
          </div>
        )} */}

        {/* ================= STEP 4 Deductions ================= */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="TDS">
              <Input
                type="number"
                name="tds"
                value={formData.tds}
                onChange={handleChange}
                placeholder="TDS"
              />
            </FormField>

            <FormField label="Amount Deducted Against Gain/Loss">
              <Input
                type="number"
                name="amount_deducted_against_gain_loss"
                value={formData.amount_deducted_against_gain_loss}
                onChange={handleChange}
                placeholder="Amount Deducted Against Gain/Loss"
              />
            </FormField>

            <FormField label="EMI Amount">
              <Input
                type="number"
                name="emi_amount"
                value={formData.emi_amount}
                onChange={handleChange}
                placeholder="EMI Amount"
              />
            </FormField>

            <FormField label="20% Deduction">
              <Input
                type="number"
                name="deduction_20_percent"
                value={formData.deduction_20_percent}
                onChange={handleChange}
                placeholder="20% Deduction"
              />
            </FormField>

            <FormField label="Penalty">
              <Input
                type="number"
                name="penalty"
                value={formData.penalty}
                onChange={handleChange}
                placeholder="Penalty"
              />
            </FormField>

            <FormField label="Medicine">
              <Input
                type="number"
                name="medicine"
                value={formData.medicine}
                onChange={handleChange}
                placeholder="Medicine"
              />
            </FormField>

            <FormField label="EMI FDR Interest">
              <Input
                type="number"
                name="emi_fdr_interest"
                value={formData.emi_fdr_interest}
                onChange={handleChange}
                placeholder="EMI FDR Interest"
              />
            </FormField>

            <FormField label="Gain Shortage Deduction">
              <Input
                type="number"
                name="gain_shortage_deduction"
                value={formData.gain_shortage_deduction}
                onChange={handleChange}
                placeholder="Gain Shortage Deduction"
              />
            </FormField>

            <FormField label="Stock Shortage Deduction">
              <Input
                type="number"
                name="stock_shortage_deduction"
                value={formData.stock_shortage_deduction}
                onChange={handleChange}
                placeholder="Stock Shortage Deduction"
              />
            </FormField>

            <FormField label="Bank Solvancy">
              <Input
                type="number"
                name="bank_solvancy"
                value={formData.bank_solvancy}
                onChange={handleChange}
                placeholder="Bank Solvancy"
              />
            </FormField>

            <FormField label="Insurance">
              <Input
                type="number"
                name="insurance"
                value={formData.insurance}
                onChange={handleChange}
                placeholder="Insurance"
              />
            </FormField>

            <FormField label="Other Deduction Amount">
              <Input
                type="number"
                name="other_deduction_amount"
                value={formData.other_deduction_amount}
                onChange={handleChange}
                placeholder="Other Deduction Amount"
              />
            </FormField>

            <FormField label="Other Deduction Reason">
              <textarea
                name="other_deductions_reason"
                value={formData.other_deductions_reason}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
                placeholder="Other Deduction Reason"
              />
            </FormField>

            <FormField label="Pay To JVS Amount">
              <Input
                type="number"
                name="pay_to_jvs_amount"
                value={formData.pay_to_jvs_amount}
                onChange={handleChange}
                placeholder="Pay To JVS Amount"
              />
            </FormField>

            {/* <FormField label="Security Fund Amount">
              <Input
                type="number"
                name="security_fund_amount"
                value={formData.security_fund_amount}
                onChange={handleChange}
                placeholder="Security Fund Amount"
              />
            </FormField> */}
          </div>
        )}

        {/* ================= STEP 5 Payments ================= */}
        {/* {currentStep === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Payment By">
              <Input
                name="payment_by"
                value={formData.payment_by}
                onChange={handleChange}
                placeholder="Payment Method"
              />
            </FormField>

            <FormField label="Payment Date">
              <Input
                type="text"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
                placeholder="Payment Date"
              />
            </FormField>

            <FormField label="QTR">
              <Input
                name="qtr"
                value={formData.qtr}
                onChange={handleChange}
                placeholder="Quarter"
              />
            </FormField>
          </div>
        )} */}

        {/* ================= STEP 6 Preview ================= */}
        {/* {currentStep === 5 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Rent Bill Amount">
              <Input
                value={formData.rent_bill_amount}
                onChange={handleChange}
                placeholder="Rent Bill Amount"
              />
            </FormField>

            <FormField label="Total Deduction Amount">
              <Input
                value={formData.total_deduction_amount}
                onChange={handleChange}
                placeholder="Total Deduction Amount"
              />
            </FormField>

            <FormField label="TDS">
              <Input value={formData.tds} readOnly placeholder="TDS" />
            </FormField>

            <FormField label="Net Amount Payable">
              <Input
                type="number"
                name="net_amount_payable"
                value={formData.net_amount_payable}
                onChange={handleChange}
                placeholder="Net Amount Payable"
              />
            </FormField>
          </div>
        )} */}

        {/* ================= STEP 7 Remarks ================= */}
        {currentStep === 3 && (
          <FormField label="Remarks">
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              rows={4}
              placeholder="Remarks"
            />
          </FormField>
        )}

        {/* NAVIGATION */}
        <div className="flex justify-between pt-6">
          {currentStep > 0 ? (
            <Button variant="secondary" onClick={prevStep}>
              Previous
            </Button>
          ) : (
            <div />
          )}

          {currentStep < steps.length - 1 ? (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate("/admin/payments")}
              >
                Cancel
              </Button>
              <Button onClick={nextStep}>Next</Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate("/admin/payments")}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Adding..." : "Add Payment"}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const FormField = ({ label, children, error }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-2 text-gray-700">{label}</label>
    {children}
    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
  </div>
);

export default AddPayment;
