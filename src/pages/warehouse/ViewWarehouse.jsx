import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchWarehouseById } from "../../redux/slices/warehouseSlice";
import { ArrowLeft, Edit } from "lucide-react";
import Button from "../../components/global/Button";

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
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Warehouse Details</h1>

        <div className="flex gap-2">
          <Button
            className="gap-2"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} /> Back
          </Button>

          <Button
            className="gap-2"
            onClick={() => navigate(`/admin/warehouses/edit/${id}`)}
          >
            <Edit size={16} /> Edit
          </Button>
        </div>
      </div>

      <Card>
        <Section title="Basic Information">
          <Field label="District" value={currentWarehouse.district_name} />
          <Field label="Branch" value={currentWarehouse.branch_name} />
          <Field
            label="Warehouse Name"
            value={currentWarehouse.warehouse_name}
          />
          <Field label="Owner" value={currentWarehouse.warehouse_owner_name} />
          <Field label="Type" value={currentWarehouse.warehouse_type} />
          <Field label="Warehouse No" value={currentWarehouse.warehouse_no} />
          <Field label="GST No" value={currentWarehouse.gst_no} />
        </Section>

        <Section title="Scheme & Capacity">
          <Field label="Scheme" value={currentWarehouse.scheme} />
          <Field
            label="Scheme Rate"
            value={currentWarehouse.scheme_rate_amount}
          />
          <Field
            label="Actual Capacity"
            value={currentWarehouse.actual_storage_capacity}
          />
          <Field
            label="Approved Capacity"
            value={currentWarehouse.approved_storage_capacity}
          />
        </Section>

        <Section title="Bank Solvency">
          <Field
            label="Affidavit Amount"
            value={currentWarehouse.bank_solvency_affidavit_amount}
          />
          <Field
            label="Certificate Amount"
            value={currentWarehouse.bank_solvency_certificate_amount}
          />
          <Field
            label="Deduction"
            value={currentWarehouse.bank_solvency_deduction_by_bill}
          />
          <Field
            label="Balance"
            value={currentWarehouse.bank_solvency_balance_amount}
          />
        </Section>

        <Section title="EMI">
          <Field label="Total EMI" value={currentWarehouse.total_emi} />
          <Field
            label="EMI Deduction"
            value={currentWarehouse.emi_deduction_by_bill}
          />
          <Field
            label="EMI Balance"
            value={currentWarehouse.balance_amount_emi}
          />
        </Section>

        <Section title="PAN Details">
          <Field label="PAN Holder" value={currentWarehouse.pan_card_holder} />
          <Field label="PAN Number" value={currentWarehouse.pan_card_number} />
        </Section>
      </Card>
    </div>
  );
};

const Card = ({ children }) => (
  <div className="bg-white p-6 rounded-xl border space-y-6">{children}</div>
);

const Section = ({ title, children }) => (
  <div>
    <h2 className="font-semibold mb-4">{title}</h2>
    <div className="space-y-3">{children}</div>
  </div>
);

const Field = ({ label, value }) => (
  <div className="flex justify-between border-b pb-2">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium">{value || "-"}</span>
  </div>
);

export default ViewWarehouse;
