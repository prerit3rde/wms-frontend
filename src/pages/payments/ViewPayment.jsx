import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPaymentById,
  approveExistingPayment,
  rejectExistingPayment,
} from "../../redux/slices/paymentsSlice";
import Button from "../../components/global/Button";
import toast from "react-hot-toast";
import { ArrowLeft, Printer } from "lucide-react";

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 🔹 MODERN FIELD (CARD STYLE)
const Field = ({ label, value }) => {
  if (value === null || value === "" || value === undefined) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-3 flex flex-col">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
};

// 🔹 MODERN SECTION (CARD + GRID)
const Section = ({ title, children }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  );
};

const ViewPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentPayment } = useSelector((state) => state.payments);

  useEffect(() => {
    dispatch(fetchPaymentById(id));
  }, [dispatch, id]);

  // const handleApprove = async () => {
  //   await dispatch(approveExistingPayment(id));
  //   dispatch(fetchPaymentById(id));
  //   toast.success("Payment approved successfully!");
  // };

  // const handleReject = async () => {
  //   await dispatch(rejectExistingPayment(id));
  //   dispatch(fetchPaymentById(id));
  //   toast.success("Payment rejected successfully!");
  // };

  const handlePrint = () => {
    window.print();
  };

  if (!currentPayment) {
    return (
      <div className="text-center py-10 text-gray-500">Loading payment...</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">

      {/* 🔥 HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-3 sticky top-0 bg-white z-10 py-3 border-b">
        <div>
          <h1 className="text-2xl font-bold">Payment Details</h1>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex gap-2"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} /> Back
          </Button>

          <Button className="flex gap-2" onClick={handlePrint}>
            <Printer size={16} /> Print
          </Button>

          {/* <Button
            variant="success"
            disabled={currentPayment.status !== "Pending"}
            onClick={handleApprove}
          >
            Approve
          </Button>

          <Button
            variant="danger"
            disabled={currentPayment.status !== "Pending"}
            onClick={handleReject}
          >
            Reject
          </Button> */}
        </div>
      </div>

      {/* 🔥 CONTENT */}
      <div className="space-y-5">

        {/* Warehouse */}
        <Section title="Warehouse Details">
          <Field label="District Name" value={currentPayment.district_name} />
          <Field label="Branch Name" value={currentPayment.branch_name} />
          <Field label="Warehouse Name" value={currentPayment.warehouse_name} />
          <Field label="Warehouse Owner" value={currentPayment.warehouse_owner_name} />
          <Field label="Warehouse Type" value={currentPayment.warehouse_type} />
          <Field label="Warehouse No" value={currentPayment.warehouse_no} />
          <Field label="SR No" value={currentPayment.sr_no} />
          <Field label="PAN Holder" value={currentPayment.pan_card_holder} />
          <Field label="PAN Number" value={currentPayment.pan_card_number} />
        </Section>

        {/* Billing */}
        <Section title="Billing Details">
          <Field label="Rent Bill Number" value={currentPayment.rent_bill_number} />
          <Field label="Bill Type" value={currentPayment.bill_type} />
          <Field label="Month" value={currentPayment.month} />
          <Field label="Financial Year" value={currentPayment.financial_year} />
          <Field label="Commodity" value={currentPayment.commodity} />
          <Field label="Crop Year" value={currentPayment.crop_year} />
          <Field label="Rate" value={currentPayment.rate} />
          <Field label="Bill Amount" value={currentPayment.bill_amount} />
          <Field label="Total JV Amount" value={currentPayment.total_jv_amount} />
          <Field label="Actual Passed Amount" value={currentPayment.actual_passed_amount} />
          <Field label="Depositer Name" value={currentPayment.depositers_name} />
        </Section>

        {/* Deductions */}
        <Section title="Deductions">
          <Field label="TDS" value={currentPayment.tds} />
          <Field label="EMI Amount" value={currentPayment.emi_amount} />
          <Field label="20% Deduction" value={currentPayment.deduction_20_percent} />
          <Field label="Penalty" value={currentPayment.penalty} />
          <Field label="Medicine" value={currentPayment.medicine} />
          <Field label="EMI FDR Interest" value={currentPayment.emi_fdr_interest} />
          <Field label="Gain Shortage Deduction" value={currentPayment.gain_shortage_deduction} />
          <Field label="Stock Shortage Deduction" value={currentPayment.stock_shortage_deduction} />
          <Field label="Bank Solvancy" value={currentPayment.bank_solvancy} />
          <Field label="Insurance" value={currentPayment.insurance} />
          <Field label="Other Deduction Amount" value={currentPayment.other_deduction_amount} />
          <Field label="Other Deductions Reason" value={currentPayment.other_deductions_reason} />
          <Field label="Pay To JVS Amount" value={currentPayment.pay_to_jvs_amount} />
        </Section>

        {/* Payment */}
        {currentPayment.payment_by && currentPayment.payment_date && currentPayment.qtr !== "0" && (
          <Section title="Payment Details">
            <Field label="Payment By" value={currentPayment.payment_by} />
            <Field label="Payment Date" value={currentPayment.payment_date} />
            <Field label="QTR" value={currentPayment.qtr} />
            <Field label="Net Payable" value={currentPayment.net_amount_payable} />
          </Section>
        )}

        {/* Remarks */}
        {currentPayment.remarks && (
          <Section title="Remarks">
            <Field label="Remarks" value={currentPayment.remarks} />
          </Section>
        )}

        {/* Approval Info */}
        {/* <Section title="Approval / Rejection Information">
          <Field label="Approved By" value={currentPayment.approved_by_name} />
          <Field label="Approved At" value={formatDate(currentPayment.approved_at)} />
          <Field label="Rejected By" value={currentPayment.rejected_by_name} />
          <Field label="Rejected At" value={formatDate(currentPayment.rejected_at)} />
          <Field label="Created At" value={formatDate(currentPayment.created_at)} />
          <Field label="Updated At" value={formatDate(currentPayment.updated_at)} />
        </Section> */}

      </div>
    </div>
  );
};

export default ViewPayment;