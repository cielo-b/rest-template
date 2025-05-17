import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Stat {
  name: string;
  value: string;
  icon: string;
  trend: "up" | "down";
}

interface Request {
  id: number;
  user: string;
  vehicle: string;
  type: string;
  size: string;
  status: string;
  slotNumber: string;
  requestedAt: string;
}

interface Activity {
  id: number;
  action: string;
  user: string;
  time: string;
  icon: string;
}

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalState, setModalState] = useState<{
    viewRequest: Request | null;
    approveRequest: number | null;
    rejectRequest: number | null;
    addSlot: boolean;
    logout: boolean;
  }>({
    viewRequest: null,
    approveRequest: null,
    rejectRequest: null,
    addSlot: false,
    logout: false,
  });
  const navigate = useNavigate();

  // Mock data
  const [stats, setStats] = useState<Stat[]>([
    { name: "Total Parking Slots", value: "245", icon: "🚗", trend: "up" },
    { name: "Occupied Slots", value: "189", icon: "🅿️", trend: "up" },
    { name: "Available Slots", value: "56", icon: "🔓", trend: "down" },
    { name: "Pending Requests", value: "23", icon: "⏳", trend: "up" },
  ]);

  const [recentRequests, setRecentRequests] = useState<Request[]>([
    {
      id: 1,
      user: "John Doe",
      vehicle: "ABC-1234",
      type: "Car",
      size: "Medium",
      status: "Pending",
      slotNumber: "A-12",
      requestedAt: "2025-05-17 10:30",
    },
    {
      id: 2,
      user: "Jane Smith",
      vehicle: "XYZ-5678",
      type: "Motorcycle",
      size: "Small",
      status: "Approved",
      slotNumber: "B-05",
      requestedAt: "2025-05-17 09:15",
    },
    {
      id: 3,
      user: "Robert Johnson",
      vehicle: "DEF-9012",
      type: "Truck",
      size: "Large",
      status: "Rejected",
      slotNumber: "C-03",
      requestedAt: "2025-05-16 15:45",
    },
  ]);

  const [recentActivities, setRecentActivities] = useState<Activity[]>([
    {
      id: 1,
      action: "Approved parking request",
      user: "Jane Smith",
      time: "2 minutes ago",
      icon: "✅",
    },
    {
      id: 2,
      action: "Added new parking slots",
      user: "System Admin",
      time: "1 hour ago",
      icon: "➕",
    },
    {
      id: 3,
      action: "Updated vehicle details",
      user: "John Doe",
      time: "3 hours ago",
      icon: "✏️",
    },
  ]);

  // Modal Handlers
  const openModal = (
    type: keyof typeof modalState,
    data: Request | number | boolean | null = null
  ) => {
    setModalState((prev) => ({ ...prev, [type]: data ?? true }));
  };

  const closeModal = (type: keyof typeof modalState) => {
    setModalState((prev) => ({ ...prev, [type]: null }));
  };

  // Action Handlers
  const handleApproveRequest = async (requestId: number) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setRecentRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "Approved" } : req
        )
      );
      setStats((prev) =>
        prev.map((stat) =>
          stat.name === "Pending Requests"
            ? { ...stat, value: String(Number(stat.value) - 1) }
            : stat.name === "Occupied Slots"
            ? { ...stat, value: String(Number(stat.value) + 1) }
            : stat
        )
      );
      setRecentActivities((prev) => [
        {
          id: prev.length + 1,
          action: "Approved parking request",
          user:
            recentRequests.find((req) => req.id === requestId)?.user ||
            "Unknown User",
          time: "Just now",
          icon: "✅",
        },
        ...prev,
      ]);
      toast.success("Request approved successfully!");
      closeModal("approveRequest");
    } catch (error) {
      toast.error("Failed to approve request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setRecentRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "Rejected" } : req
        )
      );
      setStats((prev) =>
        prev.map((stat) =>
          stat.name === "Pending Requests"
            ? { ...stat, value: String(Number(stat.value) - 1) }
            : stat
        )
      );
      setRecentActivities((prev) => [
        {
          id: prev.length + 1,
          action: "Rejected parking request",
          user:
            recentRequests.find((req) => req.id === requestId)?.user ||
            "Unknown User",
          time: "Just now",
          icon: "❌",
        },
        ...prev,
      ]);
      toast.success("Request rejected successfully!");
      closeModal("rejectRequest");
    } catch (error) {
      toast.error("Failed to reject request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStats((prev) =>
        prev.map((stat) =>
          stat.name === "Total Parking Slots"
            ? { ...stat, value: String(Number(stat.value) + 1) }
            : stat.name === "Available Slots"
            ? { ...stat, value: String(Number(stat.value) + 1) }
            : stat
        )
      );
      setRecentActivities((prev) => [
        {
          id: prev.length + 1,
          action: "Added new parking slot",
          user: "System Admin",
          time: "Just now",
          icon: "➕",
        },
        ...prev,
      ]);
      toast.success("Parking slot added successfully!");
      closeModal("addSlot");
    } catch (error) {
      toast.error("Failed to add parking slot");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    closeModal("logout");
    navigate("/login");
    toast.info("Logged out successfully");
  };

  // Modal Components
  const ViewRequestModal = ({ request }: { request: Request }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Request Details</h3>
          <button
            onClick={() => closeModal("viewRequest")}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User
            </label>
            <p className="mt-1 text-sm text-gray-900">{request.user}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vehicle
            </label>
            <p className="mt-1 text-sm text-gray-900">{request.vehicle}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <p className="mt-1 text-sm text-gray-900">{request.type}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Size
            </label>
            <p className="mt-1 text-sm text-gray-900">{request.size}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Slot
            </label>
            <p className="mt-1 text-sm text-gray-900">{request.slotNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Requested At
            </label>
            <p className="mt-1 text-sm text-gray-900">{request.requestedAt}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <span
              className={`mt-1 px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                request.status === "Approved"
                  ? "bg-green-100 text-green-800"
                  : request.status === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {request.status}
            </span>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => closeModal("viewRequest")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          {request.status === "Pending" && (
            <>
              <button
                onClick={() => {
                  closeModal("viewRequest");
                  openModal("approveRequest", request.id);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  closeModal("viewRequest");
                  openModal("rejectRequest", request.id);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const ApproveRequestModal = ({ requestId }: { requestId: number }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Approve Request
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to approve this parking request?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => closeModal("approveRequest")}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => handleApproveRequest(requestId)}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Approving..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );

  const RejectRequestModal = ({ requestId }: { requestId: number }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Reject Request
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to reject this parking request?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => closeModal("rejectRequest")}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => handleRejectRequest(requestId)}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );

  const AddSlotModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Add Parking Slot
          </h3>
          <button
            onClick={() => closeModal("addSlot")}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleAddSlot}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="slotNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Slot Number
              </label>
              <input
                type="text"
                id="slotNumber"
                name="slotNumber"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., A-01"
                required
              />
            </div>
            <div>
              <label
                htmlFor="slotType"
                className="block text-sm font-medium text-gray-700"
              >
                Slot Type
              </label>
              <select
                id="slotType"
                name="slotType"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="Car">Car</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Truck">Truck</option>
                <option value="Handicap">Handicap</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="slotSize"
                className="block text-sm font-medium text-gray-700"
              >
                Slot Size
              </label>
              <select
                id="slotSize"
                name="slotSize"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => closeModal("addSlot")}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Adding..." : "Add Slot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const LogoutModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Confirm Logout
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to log out?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => closeModal("logout")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen ${
          sidebarOpen ? "w-64" : "w-20"
        } bg-indigo-800 text-white transition-all duration-300 ease-in-out flex flex-col z-40 shadow-lg`}
      >
        <div className="p-4 flex items-center justify-between border-b border-indigo-700">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold tracking-tight">Parking Admin</h1>
          ) : (
            <h1 className="text-xl font-bold">PA</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-indigo-700 transition-colors"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {[
              {
                to: "/admin",
                tab: "dashboard",
                icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V W6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
                label: "Dashboard",
              },
              {
                to: "/admin/parking-slots",
                tab: "parking-slots",
                icon: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z",
                label: "Parking Slots",
              },
              {
                to: "/admin/requests",
                tab: "requests",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                label: "Slot Requests",
              },
              {
                to: "/admin/users",
                tab: "users",
                icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
                label: "Users",
              },
              {
                to: "/admin/vehicles",
                tab: "vehicles",
                icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
                label: "Vehicles",
              },
            ].map((item) => (
              <Link
                key={item.tab}
                to={item.to}
                onClick={() => setActiveTab(item.tab)}
                className={`flex items-center px-4 py-3 rounded-lg mx-2 transition-colors ${
                  activeTab === item.tab
                    ? "bg-indigo-900 text-white shadow-md"
                    : "text-indigo-100 hover:bg-indigo-700"
                }`}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                {sidebarOpen && (
                  <span className="ml-3 font-medium">{item.label}</span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-indigo-700 bg-indigo-900">
          <button
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 font-medium"
            onClick={() => openModal("logout")}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-30">
          <div
            className={`flex justify-between items-center px-6 py-4 ${
              sidebarOpen ? "ml-64" : "ml-20"
            } transition-all duration-300`}
          >
            <h2 className="text-xl font-semibold text-gray-800">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "parking-slots" && "Parking Slots Management"}
              {activeTab === "requests" && "Slot Requests Management"}
              {activeTab === "users" && "User Management"}
              {activeTab === "vehicles" && "Vehicle Management"}
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => openModal("addSlot")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Slot
              </button>
              <div className="relative">
                <button
                  className="flex items-center space-x-2 focus:outline-none"
                  aria-label="User profile"
                >
                  <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-medium text-sm">
                    AU
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          className="flex-1 overflow-y-auto bg-gray-50 pt-20"
          style={{ paddingTop: "5rem" }} // Accounts for fixed header height
        >
          {activeTab === "dashboard" ? (
            <div className="p-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => {
                  const statLinks = [
                    "/admin/parking-slots",
                    "/admin/parking-slots",
                    "/admin/parking-slots",
                    "/admin/requests",
                  ];
                  return (
                    <Link
                      to={statLinks[idx]}
                      key={stat.name}
                      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow block focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      tabIndex={0}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                          {stat.name}
                        </h3>
                        <span className="text-2xl">{stat.icon}</span>
                      </div>
                      <div className="mt-4 flex items-baseline">
                        <p className="text-3xl font-semibold text-gray-900">
                          {stat.value}
                        </p>
                        {stat.trend === "up" ? (
                          <span className="ml-2 text-sm font-medium text-green-600 flex items-center">
                            <svg
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>5%</span>
                          </span>
                        ) : (
                          <span className="ml-2 text-sm font-medium text-red-600 flex items-center">
                            <svg
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>3%</span>
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Requests */}
                <div className="lg:col-span-2">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        Recent Slot Requests
                      </h3>
                      <Link
                        to="/admin/requests"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                      >
                        View all →
                      </Link>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              User
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Vehicle
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Type
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Status
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentRequests.map((request) => (
                            <tr key={request.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {request.user}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 font-mono">
                                  {request.vehicle}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {request.type}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {request.size}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    request.status === "Approved"
                                      ? "bg-green-100 text-green-800"
                                      : request.status === "Pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {request.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() =>
                                      openModal("viewRequest", request)
                                    }
                                    className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                  >
                                    View
                                  </button>
                                  {request.status === "Pending" && (
                                    <>
                                      <button
                                        onClick={() =>
                                          openModal(
                                            "approveRequest",
                                            request.id
                                          )
                                        }
                                        className="text-green-600 hover:text-green-900 transition-colors"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() =>
                                          openModal("rejectRequest", request.id)
                                        }
                                        className="text-red-600 hover:text-red-900 transition-colors"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Recent Activities */}
                <div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">
                      Recent Activities
                    </h3>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start">
                          <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2 text-indigo-600">
                            <span className="text-lg">{activity.icon}</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.action}
                            </p>
                            <p className="text-sm text-gray-500">
                              by {activity.user} •{" "}
                              <span className="text-gray-400">
                                {activity.time}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6">
                      <Link
                        to="#"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                      >
                        View all activity →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      {/* Render Modals */}
      {modalState.viewRequest && (
        <ViewRequestModal request={modalState.viewRequest} />
      )}
      {modalState.approveRequest && (
        <ApproveRequestModal requestId={modalState.approveRequest} />
      )}
      {modalState.rejectRequest && (
        <RejectRequestModal requestId={modalState.rejectRequest} />
      )}
      {modalState.addSlot && <AddSlotModal />}
      {modalState.logout && <LogoutModal />}
    </div>
  );
};

export default AdminDashboard;
