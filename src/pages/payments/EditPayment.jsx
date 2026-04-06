import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchPaymentById,
  updateExistingPayment,
} from "../../redux/slices/paymentsSlice";
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

const EditPayment = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentPayment, loading } = useSelector((state) => state.payments);

  const isLocked =
    currentPayment?.status === "Approved" ||
    currentPayment?.status === "Rejected";

  const [currentStep, setCurrentStep] = useState(0);

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
    deposit_name: "",

    rent_bill_number: "",
    bill_type: "",

    month: "",
    financial_year: "",
    from_date: "",
    to_date: "",

    commodity: "",
    rate: "",
    rent_bill_amount: "",
    actual_passed_amount: "",

    scientific_capacity: "",
    number_of_days: "",
    per_day_rate: "",
    rent_amount_on_scientific_capacity: "",

    tds: "",
    amount_deducted_against_gain_loss: "",
    emi_amount: "",
    deduction_20_percent: "",
    penalty: "",
    medicine: "",
    emi_fdr_interest: "",
    gain_shortage_deduction: "",
    stock_shortage_deduction: "",
    bank_solvancy: "",
    insurance: "",
    other_deduction_amount: "",

    other_deductions_reason: "",
    security_fund_amount: "",

    pay_to_jvs_amount: "",
    payment_by: "",
    payment_date: "",
    qtr: "",

    // net_amount_payable: "",
    remarks: "",
  });

  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [filteredTypes, setFilteredTypes] = useState([]);

  const [isTdsManual, setIsTdsManual] = useState(false);
  const [isDeductionManual, setIsDeductionManual] = useState(false);

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

  useEffect(() => {
    const loadWarehouses = async () => {
      const res = await axiosInstance.get("/warehouses");
      setWarehouses(res.data.data || []);
    };
    loadWarehouses();
  }, []);

  useEffect(() => {
    const billAmount = Number(formData.bill_amount || 0);

    const tdsValue = Number(formData.tds || 0);

    const totalDeductions =
      tdsValue +
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
      actual_passed_amount: billAmount.toFixed(2),
      pay_to_jvs_amount: payToJVS.toFixed(2),
    }));
  }, [
    formData.bill_amount,
    formData.tds, // ✅ IMPORTANT (this was missing logic behavior)
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
  ]);

  /* ================= FETCH PAYMENT ================= */
  useEffect(() => {
    dispatch(fetchPaymentById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentPayment) {
      setFormData(currentPayment);

      if (
        currentPayment.status === "Approved" ||
        currentPayment.status === "Rejected"
      ) {
        setCurrentStep(6); // Jump to Remarks
      }

      const selected = warehouses.find(
        (w) => w.warehouse_name === currentPayment.warehouse_name,
      );

      if (selected) {
        setSelectedWarehouse(selected);
      }
    }
  }, [currentPayment, warehouses]);

  useEffect(() => {
    if (!formData.branch_name) return;

    const types = warehouses.filter(
      (w) =>
        w.branch_name === formData.branch_name &&
        w.district_name === formData.district_name,
    );

    setFilteredTypes([...new Set(types.map((w) => w.warehouse_type))]);
  }, [formData.branch_name, formData.district_name, warehouses]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // detect manual override
    if (name === "tds") setIsTdsManual(true);
    if (name === "deduction_20_percent") setIsDeductionManual(true);

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    try {
      const payload = {
        ...formData,

        rate: Number(formData.rate || 0),
        rent_bill_amount: Number(formData.rent_bill_amount || 0),
        actual_passed_amount: Number(formData.actual_passed_amount || 0),

        bill_amount: Number(formData.bill_amount || 0),
        actual_passed_amount: Number(formData.actual_passed_amount || 0),

        scientific_capacity: Number(formData.scientific_capacity || 0),
        number_of_days: Number(formData.number_of_days || 0),
        per_day_rate: Number(formData.per_day_rate || 0),
        rent_amount_on_scientific_capacity: Number(
          formData.rent_amount_on_scientific_capacity || 0,
        ),

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

        security_fund_amount: Number(formData.security_fund_amount || 0),
        pay_to_jvs_amount: Number(formData.pay_to_jvs_amount || 0),

        // net_amount_payable: Number(formData.net_amount_payable || 0),
      };

      const result = await dispatch(
        updateExistingPayment({
          id,
          data: payload,
        }),
      );

      if (updateExistingPayment.fulfilled.match(result)) {
        toast.success("Payment updated successfully");
        navigate("/admin/payments");
      } else {
        toast.error("Failed to update payment");
      }
    } catch (error) {
      toast.error("Failed to update payment");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Payment</h1>

      {/* ================= STEPPER ================= */}
      <div className="relative mb-10">
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
        <div>
          <h2 className="text-lg font-semibold">
            Step {currentStep + 1}: {steps[currentStep]}
          </h2>
          <div className="h-px bg-gray-300 mt-2"></div>
        </div>

        {/* ================= STEP 1 ================= */}
        {currentStep === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="District">
              <Input
                name="district_name"
                value={formData.district_name}
                disabled
              />
            </FormField>

            <FormField label="Branch">
              <Input name="branch_name" value={formData.branch_name} disabled />
            </FormField>

            <FormField label="Warehouse Type">
              <Input
                name="warehouse_type"
                value={formData.warehouse_type}
                disabled
              />
            </FormField>

            <FormField label="Warehouse Name">
              <Input
                name="warehouse_name"
                value={formData.warehouse_name}
                disabled
              />
            </FormField>

            <FormField label="Warehouse No">
              <Input
                name="warehouse_no"
                value={formData.warehouse_no}
                disabled
              />
            </FormField>

            <FormField label="PAN Number">
              <Input
                name="pan_card_number"
                value={formData.pan_card_number}
                disabled
              />
            </FormField>
          </div>
        )}

        {/* ================= STEP 2 ================= */}
        {/* ================= STEP 2 ================= */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Rent Bill Number">
              <Input
                name="rent_bill_number"
                value={formData.rent_bill_number}
                onChange={handleChange}
                placeholder="Rent Bill Number"
                disabled={isLocked}
              />
            </FormField>

            <FormField label="Bill Type">
              <select
                name="bill_type"
                value={formData.bill_type}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                disabled={isLocked}
              >
                <option value="">Select Bill Type</option>
                {filteredTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Month">
              <select
                name="month"
                value={formData.month}
                onChange={(e) => {
                  const month = e.target.value;
                  const days = getDaysInMonth(month);

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
                disabled={isLocked}
              >
                <option value="">Select Month</option>
                {months.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Financial Year">
              <Input
                name="financial_year"
                value={formData.financial_year}
                placeholder="Financial Year"
                disabled={isLocked}
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
              />
            </FormField>

            <FormField label="From Date">
              <Input
                type="text"
                name="from_date"
                value={formData.from_date}
                onChange={handleChange}
                disabled={isLocked}
              />
            </FormField>

            <FormField label="To Date">
              <Input
                type="text"
                name="to_date"
                value={formData.to_date}
                onChange={handleChange}
                disabled={isLocked}
              />
            </FormField>

            <FormField label="Commodity">
              <Input
                name="commodity"
                value={formData.commodity}
                onChange={handleChange}
                placeholder="Commodity"
                disabled={isLocked}
              />
            </FormField>

            <FormField label="Crop Year">
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
                    rate: cropData?.scheme_rate_amount || 0,
                  });
                }}
                className="w-full border rounded-lg p-2"
              >
                <option value="">Select Crop Year</option>
                {selectedWarehouse?.cropData?.map((c) => (
                  <option key={c.crop_year} value={c.crop_year}>
                    {c.crop_year}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Rate">
              <Input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                placeholder="Rate"
                disabled={isLocked}
              />
            </FormField>

            <FormField label="Rent Bill Amount">
              <Input
                type="number"
                name="rent_bill_amount"
                value={formData.rent_bill_amount}
                onChange={handleChange}
                placeholder="Rent Bill Amount"
                disabled={isLocked}
              />
            </FormField>

            <FormField label="Bill Amount">
              <Input
                type="number"
                name="bill_amount"
                value={formData.bill_amount}
                onChange={handleChange}
                disabled={isLocked}
              />
            </FormField>

            <FormField label="Actual Passed Amount">
              <Input
                type="number"
                name="actual_passed_amount"
                value={formData.actual_passed_amount}
                onChange={handleChange}
                placeholder="Actual Passed Amount"
                disabled={isLocked}
              />
            </FormField>

            <FormField label="Depositers Name *">
              <Input
                name="depositers_name"
                value={formData.depositers_name}
                onChange={handleChange}
                placeholder="Depositers Name"
              />
            </FormField>
          </div>
        )}

        {/* ================= STEP 3 ================= */}
        {/* {currentStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Scientific Capacity">
              <Input
                disabled={isLocked}
                type="number"
                name="scientific_capacity"
                value={formData.scientific_capacity}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="Number of Days">
              <Input
                disabled={isLocked}
                type="number"
                name="number_of_days"
                value={formData.number_of_days}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="Per Day Rate">
              <Input
                disabled={isLocked}
                type="number"
                name="per_day_rate"
                value={formData.per_day_rate}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="Rent Amount On Scientific Capacity">
              <Input
                type="number"
                name="rent_amount_on_scientific_capacity"
                value={formData.rent_amount_on_scientific_capacity}
                onChange={handleChange}
                placeholder="Rent Amount On Scientific Capacity"
                disabled={isLocked}
              />
            </FormField>
          </div>
        )} */}

        {/* ================= STEP 4 ================= */}
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
                placeholder="Pay To JVS Amount"
                onChange={handleChange}
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

        {/* ================= STEP 5 ================= */}
        {/* {currentStep === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Rent Bill Amount">
              <Input
                disabled={isLocked}
                value={formData.rent_bill_amount}
                readOnly
              />
            </FormField>

            <FormField label="Bill Amount">
              <Input
                type="number"
                name="bill_amount"
                value={formData.bill_amount}
                onChange={handleChange}
                disabled={isLocked}
              />
            </FormField>

            <FormField label="Actual Passed Amount">
              <Input
                type="number"
                name="actual_passed_amount"
                value={formData.actual_passed_amount}
                className="bg-gray-100"
                disabled
              />
            </FormField>

            <FormField label="Total Deduction Amount">
              <Input
                disabled={isLocked}
                value={formData.total_deduction_amount}
                readOnly
              />
            </FormField>

            <FormField label="TDS">
              <Input disabled={isLocked} value={formData.tds} readOnly />
            </FormField>

            <FormField label="Net Amount Payable">
              <Input
                disabled={isLocked}
                type="number"
                name="net_amount_payable"
                value={formData.net_amount_payable}
                onChange={handleChange}
              />
            </FormField>
          </div>
        )} */}

        {/* {currentStep === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Payment By">
              <Input
                name="payment_by"
                value={formData.payment_by}
                onChange={handleChange}
                placeholder="Payment Method"
                disabled={isLocked}
              />
            </FormField>

            <FormField label="Payment Date">
              <Input
                type="text"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
                disabled={isLocked}
              />
            </FormField>

            <FormField label="QTR">
              <Input
                name="qtr"
                value={formData.qtr}
                onChange={handleChange}
                placeholder="Quarter"
                disabled={isLocked}
              />
            </FormField>
          </div>
        )} */}

        {/* ================= STEP 6 ================= */}
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

              <Button onClick={handleUpdate} disabled={loading}>
                {loading ? "Updating..." : "Update Payment"}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const FormField = ({ label, children }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-2 text-gray-700">{label}</label>
    {children}
  </div>
);

export default EditPayment;
