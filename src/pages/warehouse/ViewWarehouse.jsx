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
    <div className="max-w-7xl mx-auto px-4 space-y-6">

      {/* 🔥 HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-3 sticky top-0 bg-white z-10 py-3 border-b">
        <div>
          <h1 className="text-2xl font-bold">Warehouse Details</h1>
          <p className="text-sm text-gray-500">
            {currentWarehouse.warehouse_name}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex gap-2"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} /> Back
          </Button>

          <Button
            className="flex gap-2"
            onClick={() => navigate(`/admin/warehouses/edit/${id}`)}
          >
            <Edit size={16} /> Edit
          </Button>
        </div>
      </div>

      {/* 🔥 BASIC INFO */}
      <Section title="Basic Information">
        <Field label="District Name" value={currentWarehouse.district_name} />
        <Field label="Branch Name" value={currentWarehouse.branch_name} />
        <Field label="Warehouse Name" value={currentWarehouse.warehouse_name} />
        <Field label="Owner Name" value={currentWarehouse.warehouse_owner_name} />
        <Field label="Warehouse Type" value={currentWarehouse.warehouse_type} />
        <Field label="Warehouse No" value={currentWarehouse.warehouse_no} />
        <Field label="GST No" value={currentWarehouse.gst_no} />
      </Section>

      {/* 🔥 CROP YEARS */}
      {currentWarehouse.cropData?.map((item, index) => (
        <div key={index} className="space-y-4">

          <div className="bg-gray-100 px-4 py-2 rounded-lg font-semibold text-sm">
            Crop Year {index + 1} ({item.crop_year})
          </div>

          <Section title="Scheme & Capacity">
            <Field label="Scheme" value={item.scheme} />
            <Field label="Scheme Rate" value={item.scheme_rate_amount} />
            <Field label="Actual Capacity" value={item.actual_storage_capacity} />
            <Field label="Approved Capacity" value={item.approved_storage_capacity} />
          </Section>

          <Section title="Bank Solvency">
            <Field
              label="Type"
              value={item.is_affidavit ? "Affidavit" : "Certificate"}
            />
            <Field label="Affidavit Amount" value={item.bank_solvency_affidavit_amount} />
            <Field label="Certificate Amount" value={item.bank_solvency_certificate_amount} />
            <Field label="Deduction" value={item.bank_solvency_deduction_by_bill} />
            <Field label="Balance" value={item.bank_solvency_balance_amount} />
          </Section>

          <Section title="EMI">
            <Field label="Total EMI" value={item.total_emi} />
            <Field label="EMI Deduction" value={item.emi_deduction_by_bill} />
            <Field label="Balance EMI" value={item.balance_amount_emi} />
          </Section>

        </div>
      ))}

      {/* 🔥 PAN */}
      <Section title="PAN Details">
        <Field label="PAN Holder" value={currentWarehouse.pan_card_holder} />
        <Field label="PAN Number" value={currentWarehouse.pan_card_number} />
      </Section>

    </div>
  );
};

/* 🔥 SAME COMPONENTS AS PAYMENT PAGE */

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

const Field = ({ label, value }) => {
  if (value === null || value === "" || value === undefined) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-3 flex flex-col">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
};

export default ViewWarehouse;