import { useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface SlotRequest {
  id: number;
  requestNumber: string;
  user: string;
  vehicle: string;
  type: string;
  requestedAt: string;
  status: string;
  assignedSlot: string | null;
}

const SlotRequests = () => {
  const [filters, setFilters] = useState<{
    status: string;
    type: string;
    search: string;
  }>({
    status: "all",
    type: "all",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [modalState, setModalState] = useState<{
    viewRequest: SlotRequest | null;
    approveRequest: SlotRequest | null;
    rejectRequest: SlotRequest | null;
    assignSlot: SlotRequest | null;
  }>({
    viewRequest: null,
    approveRequest: null,
    rejectRequest: null,
    assignSlot: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const requestsPerPage: number = 10;

  // Mock data
  const [slotRequests, setSlotRequests] = useState<SlotRequest[]>(
    Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      requestNumber: `REQ-${String(i + 1).padStart(4, "0")}`,
      user: `User ${Math.floor(Math.random() * 100) + 1}`,
      vehicle: `VH-${Math.floor(Math.random() * 1000) + 1000}`,
      type: ["Car", "Motorcycle", "Truck"][Math.floor(Math.random() * 3)],
      requestedAt: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      status: ["Pending", "Approved", "Rejected"][
        Math.floor(Math.random() * 3)
      ],
      assignedSlot:
        Math.random() > 0.3
          ? `SL-${Math.floor(Math.random() * 200) + 1}`
          : null,
    }))
  );

  // Mock available slots (in a real app, fetch from API)
  const availableSlots: string[] = Array.from(
    { length: 50 },
    (_, i) => `SL-${String(i + 201).padStart(3, "0")}`
  );

  // Filter requests
  const filteredRequests: SlotRequest[] = slotRequests.filter((request) => {
    return (
      (filters.status === "all" || request.status === filters.status) &&
      (filters.type === "all" || request.type === filters.type) &&
      (filters.search === "" ||
        request.requestNumber
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        request.user.toLowerCase().includes(filters.search.toLowerCase()) ||
        (request.vehicle &&
          request.vehicle.toLowerCase().includes(filters.search.toLowerCase())))
    );
  });

  // Pagination logic
  const indexOfLastRequest: number = currentPage * requestsPerPage;
  const indexOfFirstRequest: number = indexOfLastRequest - requestsPerPage;
  const currentRequests: SlotRequest[] = filteredRequests.slice(
    indexOfFirstRequest,
    indexOfLastRequest
  );
  const totalPages: number = Math.ceil(
    filteredRequests.length / requestsPerPage
  );

  // Modal Handlers
  const openModal = (type: string, data: SlotRequest | null = null) => {
    setModalState((prev) => ({ ...prev, [type]: data }));
  };

  const closeModal = (type: string) => {
    setModalState((prev) => ({ ...prev, [type]: null }));
  };

  // Handle filter changes
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  // Toggle request selection
  const toggleRequestSelection = (requestId: number) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  // Toggle all requests selection
  const toggleAllRequestsSelection = () => {
    if (selectedRequests.length === currentRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(currentRequests.map((request) => request.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedRequests.length === 0) {
      toast.error("Please select at least one request");
      return;
    }

    if (action === "apply") {
      toast.error("Please select a bulk action");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      let updatedRequests = [...slotRequests];
      if (action === "approve") {
        updatedRequests = updatedRequests.map((request) =>
          selectedRequests.includes(request.id)
            ? { ...request, status: "Approved" }
            : request
        );
        toast.success(`${selectedRequests.length} requests approved`);
      } else if (action === "reject") {
        updatedRequests = updatedRequests.map((request) =>
          selectedRequests.includes(request.id)
            ? { ...request, status: "Rejected", assignedSlot: null }
            : request
        );
        toast.success(`${selectedRequests.length} requests rejected`);
      } else if (action === "assign") {
        openModal("assignSlot", {
          id: 0,
          requestNumber: "Bulk Assign",
        } as SlotRequest);
        setIsLoading(false);
        return;
      }
      setSlotRequests(updatedRequests);
      setSelectedRequests([]);
    } catch (error) {
      toast.error("Failed to perform bulk action");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle approve request
  const handleApproveRequest = async (
    requestId: number,
    slot: string | null
  ) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSlotRequests((prev) =>
        prev.map((request) =>
          request.id === requestId
            ? { ...request, status: "Approved", assignedSlot: slot }
            : request
        )
      );
      setSelectedRequests((prev) => prev.filter((id) => id !== requestId));
      toast.success(`Request ${requestId} approved`);
      closeModal("approveRequest");
    } catch (error) {
      toast.error("Failed to approve request");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reject request
  const handleRejectRequest = async (requestId: number, reason: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSlotRequests((prev) =>
        prev.map((request) =>
          request.id === requestId
            ? { ...request, status: "Rejected", assignedSlot: null }
            : request
        )
      );
      setSelectedRequests((prev) => prev.filter((id) => id !== requestId));
      toast.success(
        `Request ${requestId} rejected${reason ? `: ${reason}` : ""}`
      );
      closeModal("rejectRequest");
    } catch (error) {
      toast.error("Failed to reject request");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle assign slot
  const handleAssignSlot = async (requestId: number, slot: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (requestId === 0) {
        // Bulk assign
        setSlotRequests((prev) =>
          prev.map((request) =>
            selectedRequests.includes(request.id)
              ? { ...request, assignedSlot: slot, status: "Approved" }
              : request
          )
        );
        toast.success(
          `${selectedRequests.length} requests assigned to ${slot}`
        );
        setSelectedRequests([]);
      } else {
        setSlotRequests((prev) =>
          prev.map((request) =>
            request.id === requestId
              ? { ...request, assignedSlot: slot, status: "Approved" }
              : request
          )
        );
        toast.success(`Request ${requestId} assigned to ${slot}`);
      }
      closeModal("assignSlot");
    } catch (error) {
      toast.error("Failed to assign slot");
    } finally {
      setIsLoading(false);
    }
  };

  // Modal Components
  const ViewRequestModal = ({ request }: { request: SlotRequest }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Request Details
          </h3>
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
              Request Number
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {request.requestNumber}
            </p>
          </div>
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
              Vehicle Type
            </label>
            <p className="mt-1 text-sm text-gray-900">{request.type}</p>
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
              className={`mt-1 px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Assigned Slot
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {request.assignedSlot || "Not assigned"}
            </p>
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
                  openModal("approveRequest", request);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  closeModal("viewRequest");
                  openModal("rejectRequest", request);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
            </>
          )}
          {(request.status === "Approved" || request.status === "Pending") &&
            !request.assignedSlot && (
              <button
                onClick={() => {
                  closeModal("viewRequest");
                  openModal("assignSlot", request);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Assign Slot
              </button>
            )}
        </div>
      </div>
    </div>
  );

  const ApproveRequestModal = ({ request }: { request: SlotRequest }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Approve Request
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Approve request {request.requestNumber}? You can optionally assign a
          slot.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const slot = formData.get("slot") as string;
            handleApproveRequest(request.id, slot || null);
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="slot"
              className="block text-sm font-medium text-gray-700"
            >
              Assign Slot (Optional)
            </label>
            <select
              id="slot"
              name="slot"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">No slot</option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => closeModal("approveRequest")}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Approving..." : "Approve"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const RejectRequestModal = ({ request }: { request: SlotRequest }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reject Request
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Reject request {request.requestNumber}? You can provide a reason
          (optional).
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const reason = formData.get("reason") as string;
            handleRejectRequest(request.id, reason);
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700"
            >
              Reason (Optional)
            </label>
            <textarea
              id="reason"
              name="reason"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              rows={4}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => closeModal("rejectRequest")}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Rejecting..." : "Reject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const AssignSlotModal = ({ request }: { request: SlotRequest }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Assign Slot
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Assign a slot to {request.requestNumber}.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const slot = formData.get("slot") as string;
            handleAssignSlot(request.id, slot);
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="slot"
              className="block text-sm font-medium text-gray-700"
            >
              Select Slot
            </label>
            <select
              id="slot"
              name="slot"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="" disabled>
                Select a slot
              </option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => closeModal("assignSlot")}
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
              {isLoading ? "Assigning..." : "Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Slot Requests</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage all parking slot requests from users. Approve, reject, or
            assign slots.
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                placeholder="Search requests..."
                value={filters.search}
                onChange={handleFilterChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm transition duration-150 ease-in-out sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm transition duration-150 ease-in-out"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Vehicle Type
            </label>
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm transition duration-150 ease-in-out"
            >
              <option value="all">All Types</option>
              <option value="Car">Car</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Truck">Truck</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() =>
                setFilters({
                  status: "all",
                  type: "all",
                  search: "",
                })
              }
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
            >
              <svg
                className="-ml-0.5 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions and Results Count */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <select
            onChange={(e) => handleBulkAction(e.target.value)}
            defaultValue=""
            className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm transition duration-150 ease-in-out"
          >
            <option value="" disabled>
              Bulk Actions
            </option>
            <option value="approve">Approve Selected</option>
            <option value="reject">Reject Selected</option>
            <option value="assign">Assign Slots</option>
          </select>
          <button
            onClick={() => handleBulkAction("apply")}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
          >
            Apply
          </button>
        </div>
        <div className="text-sm text-gray-700">
          {selectedRequests.length > 0 ? (
            <span className="font-medium text-indigo-600">
              {selectedRequests.length} selected
            </span>
          ) : (
            <>
              Showing{" "}
              <span className="font-medium">{indexOfFirstRequest + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastRequest, filteredRequests.length)}
              </span>{" "}
              of <span className="font-medium">{filteredRequests.length}</span>{" "}
              requests
            </>
          )}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={
                      selectedRequests.length === currentRequests.length &&
                      currentRequests.length > 0
                    }
                    onChange={toggleAllRequestsSelection}
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Request #
                </th>
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
                  Requested At
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Assigned Slot
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={selectedRequests.includes(request.id)}
                      onChange={() => toggleRequestSelection(request.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.requestNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.user}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.vehicle}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.requestedAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.assignedSlot || (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openModal("viewRequest", request)}
                        className="text-indigo-600 hover:text-indigo-900"
                        aria-label="View request"
                      >
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      {request.status === "Pending" && (
                        <>
                          <button
                            onClick={() => openModal("approveRequest", request)}
                            className="text-green-600 hover:text-green-900"
                            aria-label="Approve request"
                          >
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => openModal("rejectRequest", request)}
                            className="text-red-600 hover:text-red-900"
                            aria-label="Reject request"
                          >
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </>
                      )}
                      {(request.status === "Approved" ||
                        request.status === "Pending") &&
                        !request.assignedSlot && (
                          <button
                            onClick={() => openModal("assignSlot", request)}
                            className="text-indigo-600 hover:text-indigo-900"
                            aria-label="Assign slot"
                          >
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
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{indexOfFirstRequest + 1}</span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastRequest, filteredRequests.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredRequests.length}</span>{" "}
                requests
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      } transition-colors duration-150`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                )}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Render Modals */}
      {modalState.viewRequest && (
        <ViewRequestModal request={modalState.viewRequest} />
      )}
      {modalState.approveRequest && (
        <ApproveRequestModal request={modalState.approveRequest} />
      )}
      {modalState.rejectRequest && (
        <RejectRequestModal request={modalState.rejectRequest} />
      )}
      {modalState.assignSlot && (
        <AssignSlotModal request={modalState.assignSlot} />
      )}
    </div>
  );
};

export default SlotRequests;
