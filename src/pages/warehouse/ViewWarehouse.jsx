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
    (state) => state.warehouse
  );

  useEffect(() => {
    dispatch(fetchWarehouseById(id));
  }, [dispatch, id]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600 bg-red-50 rounded-lg">Failed to load warehouse</div>;
  }

  if (!currentWarehouse) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-10">

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Warehouse Details
          </h1>
          <p className="text-gray-500 mt-1">
            {currentWarehouse.district_name} • {currentWarehouse.branch_name}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft size={16} /> Back
          </Button>

          <Button onClick={() => navigate(`/admin/warehouses/edit/${id}`)} className="flex items-center gap-2">
            <Edit size={16} /> Edit
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y">

        <Section>
          <Field label="Warehouse Owner" value={currentWarehouse.warehouse_owner_name} />
          <Field label="Warehouse Type" value={currentWarehouse.warehouse_type} />
          <Field label="Warehouse No" value={currentWarehouse.warehouse_no} />
          <Field label="SR No" value={currentWarehouse.sr_no} />
          <Field label="Warehouse Name" value={currentWarehouse.warehouse_name} />
          <Field label="Deposit Name" value={currentWarehouse.deposit_name} />
        </Section>

        <Section>
          <Field label="PAN Card Holder" value={currentWarehouse.pan_card_holder} />
          <Field label="PAN Card Number" value={currentWarehouse.pan_card_number} />
        </Section>

      </div>
    </div>
  );
};

export default ViewWarehouse;

const Section = ({ children }) => (
  <div className="p-6 space-y-6">{children}</div>
);

const Field = ({ label, value }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="text-gray-500 text-sm">{label}</div>
    <div className="font-medium text-gray-800">{value || "-"}</div>
  </div>
);