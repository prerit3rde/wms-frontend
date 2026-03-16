import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWarehouses } from "../../redux/slices/warehouseSlice";
import { fetchClaims } from "../../redux/slices/claimsSlice";
import { useNavigate } from "react-router-dom";
import { Warehouse, FileText, Clock, Plus } from "lucide-react";
import Card from "../../components/global/Card";

const DashboardHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* ================= SELECT REDUX DATA ================= */

  const { items: warehouses = [], total: warehouseTotal } = useSelector(
    (state) => state.warehouse,
  );

  const { items: claims = [], total: claimTotal } = useSelector(
    (state) => state.claims,
  );

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    dispatch(fetchWarehouses({ limit: 1000 }));
    dispatch(fetchClaims({ limit: 1000 }));
  }, [dispatch]);

  /* ================= DASHBOARD STATS ================= */

  const pendingClaims = claims.filter(
    (claim) => claim.status === "Pending",
  ).length;

  const recentClaims = claims.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>

      {/* TOP STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Warehouses</p>
            <p className="text-3xl font-bold text-blue-600">{warehouseTotal}</p>
          </div>
          <Warehouse size={34} className="text-blue-500" />
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Claims</p>
            <p className="text-3xl font-bold text-purple-600">{claimTotal}</p>
          </div>
          <FileText size={34} className="text-purple-500" />
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Pending Claims</p>
            <p className="text-3xl font-bold text-yellow-500">
              {pendingClaims}
            </p>
          </div>
          <Clock size={34} className="text-yellow-500" />
        </Card>
      </div>

      {/* MAIN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT CLAIMS */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} />
            <h2 className="text-lg font-semibold">Recent Claims</h2>
          </div>

          <div className="space-y-3">
            {recentClaims.length === 0 && (
              <p className="text-gray-400 text-sm">No recent claims found</p>
            )}

            {recentClaims.map((claim) => (
              <div
                key={claim.id}
                onClick={() => navigate(`/admin/claims/view/${claim.id}`)}
                className="flex justify-between items-center border-b pb-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
              >
                <p className="text-gray-700">{claim.warehouse_name}</p>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium
                  ${
                    claim.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : claim.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {claim.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* QUICK ACTIONS */}
        <Card className="flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 mb-4">
            <Plus className="text-blue-600" size={28} />
          </div>

          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => navigate("/admin/warehouses/add")}
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Add Warehouse
            </button>

            <button
              onClick={() => navigate("/admin/claims/add")}
              className="bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition cursor-pointer"
            >
              Add Claim
            </button>
          </div>
        </Card>
      </div>

      {/* FOOTER */}
      <div className="text-center text-sm text-gray-500 pt-6">
        Design & Developed by{" "}
        <a
          href="https://thirdessential.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-medium hover:underline"
        >
          ThirdEssential IT Solution
        </a>
      </div>
    </div>
  );
};

export default DashboardHome;
