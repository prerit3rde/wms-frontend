import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchWarehouseById } from "../../redux/slices/warehouseSlice";
import { ArrowLeft, Edit } from "lucide-react";
import Button from "../../components/global/Button";

// ✅ SAME LOGIC — ONLY UI CHANGED

const ViewWarehouse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentWarehouse, loading, error } = useSelector(
    (state) => state.warehouse,
  );

  useEffect(() => {
    dispatch(fetchWarehouseById(id));
  }, [dispatch, id]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading warehouse</div>;
  }

  if (!currentWarehouse) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ✅ HEADER (MATCH PAYMENT) */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Warehouse Details</h1>

        <div className="flex gap-3">
          <Button className="flex gap-2" variant="secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back To List
          </Button>

          <Button className="flex gap-2 tracking-wide" onClick={() => navigate(`/admin/warehouses/edit/${id}`)}>
            <Edit size={16} /> Edit
          </Button>
        </div>
      </div>

      {/* ✅ CARD DESIGN SAME AS PAYMENT */}
      <div className="bg-white border rounded-xl p-6 space-y-8">
        <Section title="Basic Information">
          <Field label="District" value={currentWarehouse.district_name} />
          <Field label="Branch" value={currentWarehouse.branch_name} />
          <Field
            label="Warehouse Name"
            value={currentWarehouse.warehouse_name}
          />
          <Field
            label="Warehouse Owner"
            value={currentWarehouse.warehouse_owner_name}
          />
          <Field
            label="Warehouse Type"
            value={currentWarehouse.warehouse_type}
          />
          <Field label="Warehouse No" value={currentWarehouse.warehouse_no} />
          <Field label="GST No" value={currentWarehouse.gst_no} />
        </Section>

        <Section title="Scheme & Capacity">
          <Field label="Scheme" value={currentWarehouse.scheme} />
          <Field
            label="Scheme Rate Amount"
            value={currentWarehouse.scheme_rate_amount}
          />
          <Field
            label="Actual Storage Capacity"
            value={currentWarehouse.actual_storage_capacity}
          />
          <Field
            label="Approved Storage Capacity"
            value={currentWarehouse.approved_storage_capacity}
          />
        </Section>

        <Section title="Bank Solvency">
          <Field
            label="Bank Solvency Affidavit Amount"
            value={currentWarehouse.bank_solvency_affidavit_amount}
          />
          <Field
            label="Bank Solvency Certificate Amount"
            value={currentWarehouse.bank_solvency_certificate_amount}
          />
          <Field
            label="Bank Solvency Deduction by Bill"
            value={currentWarehouse.bank_solvency_deduction_by_bill}
          />
          <Field
            label="Balance Amount Bank Solvancy"
            value={currentWarehouse.bank_solvency_balance_amount}
          />
        </Section>

        <Section title="EMI">
          <Field label="Total EMI" value={currentWarehouse.total_emi} />
          <Field
            label="EMI Deduction by Bill"
            value={currentWarehouse.emi_deduction_by_bill}
          />
          <Field
            label="EMI Balance"
            value={currentWarehouse.balance_amount_emi}
          />
        </Section>

        <Section title="PAN Details">
          <Field
            label="PAN Card Holder"
            value={currentWarehouse.pan_card_holder}
          />
          <Field
            label="PAN Card Number"
            value={currentWarehouse.pan_card_number}
          />
        </Section>
      </div>
    </div>
  );
};

const Card = ({ children }) => (
  <div className="bg-white p-6 rounded-xl border space-y-6">{children}</div>
);

const Section = ({ title, children }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold border-b pb-2">{title}</h2>
      {children}
    </div>
  );
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

export default ViewWarehouse;
