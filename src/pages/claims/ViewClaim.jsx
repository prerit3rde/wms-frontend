import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchClaimById,
  approveExistingClaim,
  rejectExistingClaim,
} from "../../redux/slices/claimsSlice";
import Button from "../../components/global/Button";
import toast from "react-hot-toast";

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

const Field = ({ label, value }) => {
  if (value === null || value === "" || value === undefined) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-3">
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
};

const Section = ({ title, children }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold border-b pb-2">{title}</h2>
      {children}
    </div>
  );
};

const ViewClaim = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentClaim } = useSelector((state) => state.claims);

  useEffect(() => {
    dispatch(fetchClaimById(id));
  }, [dispatch, id]);

  const handleApprove = async () => {
    await dispatch(approveExistingClaim(id));
    dispatch(fetchClaimById(id));
    toast.success("Claim approved successfully!");
  };

  const handleReject = async () => {
    await dispatch(rejectExistingClaim(id));
    dispatch(fetchClaimById(id));
    toast.success("Claim rejected successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  if (!currentClaim) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading claim...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back to List
        </Button>

        <div className="flex gap-3">
          <Button onClick={handlePrint}>Print</Button>

          <Button
            variant="success"
            disabled={currentClaim.status !== "Pending"}
            onClick={handleApprove}
          >
            Approve
          </Button>

          <Button
            variant="danger"
            disabled={currentClaim.status !== "Pending"}
            onClick={handleReject}
          >
            Reject
          </Button>
        </div>
      </div>

      {/* CLAIM DETAILS */}
      <div className="bg-white border rounded-xl p-6 space-y-8">

        {/* Warehouse Details */}
        <Section title="Warehouse Details">
          <Field label="Reference Number" value={currentClaim.reference_number} />
          <Field label="District Name" value={currentClaim.district_name} />
          <Field label="Branch Name" value={currentClaim.branch_name} />
          <Field label="Warehouse Name" value={currentClaim.warehouse_name} />
          <Field label="Warehouse Owner Name" value={currentClaim.warehouse_owner_name} />
          <Field label="Warehouse Type" value={currentClaim.warehouse_type} />
          <Field label="Warehouse No" value={currentClaim.warehouse_no} />
          <Field label="SR No" value={currentClaim.sr_no} />
          <Field label="PAN Card Holder" value={currentClaim.pan_card_holder} />
          <Field label="PAN Card Number" value={currentClaim.pan_card_number} />
          <Field label="Deposit Name" value={currentClaim.deposit_name} />
        </Section>

        {/* Billing Details */}
        <Section title="Billing Details">
          <Field label="Rent Bill Number" value={currentClaim.rent_bill_number} />
          <Field label="Bill Type" value={currentClaim.bill_type} />
          <Field label="Month" value={currentClaim.month} />
          <Field label="Financial Year" value={currentClaim.financial_year} />
          <Field label="From Date" value={formatDate(currentClaim.from_date)} />
          <Field label="To Date" value={formatDate(currentClaim.to_date)} />
          <Field label="Commodity" value={currentClaim.commodity} />
          <Field label="Rate" value={currentClaim.rate} />
          <Field label="Rent Bill Amount" value={currentClaim.rent_bill_amount} />
          <Field label="Total JV Amount" value={currentClaim.total_jv_amount} />
          <Field label="Actual Passed Amount" value={currentClaim.actual_passed_amount} />
          <Field label="Total Deduction Amount" value={currentClaim.total_deduction_amount} />
        </Section>

        {/* Scientific Capacity */}
        <Section title="Scientific Capacity">
          <Field label="Scientific Capacity" value={currentClaim.scientific_capacity} />
          <Field label="Number of Days" value={currentClaim.number_of_days} />
          <Field label="Per Day Rate" value={currentClaim.per_day_rate} />
          <Field label="Rent Amount On Scientific Capacity" value={currentClaim.rent_amount_on_scientific_capacity}/>
        </Section>

        {/* Deductions */}
        <Section title="Deductions">
          <Field label="TDS" value={currentClaim.tds} />
          <Field label="Amount Deducted Against Gain/Loss" value={currentClaim.amount_deducted_against_gain_loss} />
          <Field label="EMI Amount" value={currentClaim.emi_amount} />
          <Field label="20% Deduction Amount" value={currentClaim.deduction_20_percent} />
          <Field label="Penalty" value={currentClaim.penalty} />
          <Field label="Medicine" value={currentClaim.medicine} />
          <Field label="EMI FDR Interest" value={currentClaim.emi_fdr_interest} />
          <Field label="Gain Shortage Deduction" value={currentClaim.gain_shortage_deducton} />
          <Field label="Stock Shortage Deduction" value={currentClaim.stock_shortage_deduction} />
          <Field label="Bank Solvancy" value={currentClaim.bank_solvancy} />
          <Field label="Insurance" value={currentClaim.insurance} />
          <Field label="Other Deduction Amount" value={currentClaim.other_deduction_amount} />
          <Field label="Other Deduction Reason" value={currentClaim.other_deductions_reason} />
          <Field label="Security Fund Amount" value={currentClaim.security_fund_amount} />
        </Section>

        {/* Payment Details */}
        <Section title="Payment Details">
          <Field label="Pay To JVS Amount" value={currentClaim.pay_to_jvs_amount} />
          <Field label="Payment By" value={currentClaim.payment_by} />
          <Field label="Payment Date" value={formatDate(currentClaim.payment_date)} />
          <Field label="QTR" value={currentClaim.qtr} />
          <Field label="Net Amount Payable" value={currentClaim.net_amount_payable} />
        </Section>

        {/* Remarks */}
        <Section title="Remarks">
          <Field label="Remarks" value={currentClaim.remarks} />
          <Field label="Status" value={currentClaim.status} />
        </Section>

        {/* Approval Info */}
        <Section title="Approval / Rejection Information">
          <Field label="Approved By" value={currentClaim.approved_by_name} />
          <Field label="Approved At" value={formatDate(currentClaim.approved_at)} />
          <Field label="Rejected By" value={currentClaim.rejected_by_name} />
          <Field label="Rejected At" value={formatDate(currentClaim.rejected_at)} />
          <Field label="Created At" value={formatDate(currentClaim.created_at)} />
          <Field label="Updated At" value={formatDate(currentClaim.updated_at)} />
        </Section>

      </div>
    </div>
  );
};

export default ViewClaim;