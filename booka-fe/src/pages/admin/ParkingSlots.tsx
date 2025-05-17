import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ParkingSlots = () => {
  // State for filters, pagination, modals, and selections
  const [filters, setFilters] = useState<any>({
    status: "all",
    size: "all",
    type: "all",
    location: "all",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [modalState, setModalState] = useState({
    viewSlot: null,
    editSlot: null,
    deleteSlot: null,
    bulkAction: null,
    addBulkSlots: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const slotsPerPage = 10;

  // Mock data
  const [parkingSlots, setParkingSlots] = useState(
    Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      slotNumber: `SL-${String(i + 1).padStart(3, "0")}`,
      size: ["Small", "Medium", "Large"][Math.floor(Math.random() * 3)],
      type: ["Car", "Motorcycle", "Truck"][Math.floor(Math.random() * 3)],
      location: ["North", "South", "East", "West"][
        Math.floor(Math.random() * 4)
      ],
      status: ["Available", "Occupied", "Maintenance"][
        Math.floor(Math.random() * 3)
      ],
      assignedTo:
        Math.random() > 0.5
          ? `User-${Math.floor(Math.random() * 50) + 1}`
          : null,
    }))
  );

  // Filter slots
  const filteredSlots = parkingSlots.filter((slot) => {
    return (
      (filters.status === "all" || slot.status === filters.status) &&
      (filters.size === "all" || slot.size === filters.size) &&
      (filters.type === "all" || slot.type === filters.type) &&
      (filters.location === "all" || slot.location === filters.location) &&
      (filters.search === "" ||
        slot.slotNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        (slot.assignedTo &&
          slot.assignedTo.toLowerCase().includes(filters.search.toLowerCase())))
    );
  });

  // Pagination logic
  const indexOfLastSlot = currentPage * slotsPerPage;
  const indexOfFirstSlot = indexOfLastSlot - slotsPerPage;
  const currentSlots = filteredSlots.slice(indexOfFirstSlot, indexOfLastSlot);
  const totalPages = Math.ceil(filteredSlots.length / slotsPerPage);

  // Modal Handlers
  const openModal = (type: any, data?: any) => {
    setModalState((prev) => ({ ...prev, [type]: data || true }));
  };

  const closeModal = (type: any) => {
    setModalState((prev) => ({ ...prev, [type]: null }));
  };

  // Handle filter changes
  const handleFilterChange = (e: any) => {
    const { name, value } = e.target;
    setFilters((prev: any) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  // Toggle slot selection
  const toggleSlotSelection = (slotId: number) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  };

  // Toggle all slots selection
  const toggleAllSlotsSelection = () => {
    if (selectedSlots.length === currentSlots.length) {
      setSelectedSlots([]);
    } else {
      setSelectedSlots(currentSlots.map((slot) => slot.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: any) => {
    if (selectedSlots.length === 0) {
      toast.error("Please select at least one slot");
      return;
    }
    openModal("bulkAction", action);
  };

  const confirmBulkAction = async (action: any) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      let updatedSlots = [...parkingSlots];
      if (action === "mark-available") {
        updatedSlots = updatedSlots.map((slot) =>
          selectedSlots.includes(slot.id)
            ? { ...slot, status: "Available", assignedTo: null }
            : slot
        );
        toast.success(`${selectedSlots.length} slots marked as available`);
      } else if (action === "mark-maintenance") {
        updatedSlots = updatedSlots.map((slot) =>
          selectedSlots.includes(slot.id)
            ? { ...slot, status: "Maintenance", assignedTo: null }
            : slot
        );
        toast.success(`${selectedSlots.length} slots marked for maintenance`);
      } else if (action === "delete") {
        updatedSlots = updatedSlots.filter(
          (slot) => !selectedSlots.includes(slot.id)
        );
        toast.success(`${selectedSlots.length} slots deleted`);
      }
      setParkingSlots(updatedSlots);
      setSelectedSlots([]);
      closeModal("bulkAction");
    } catch (error) {
      toast.error("Failed to perform bulk action");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle add bulk slots
  const handleAddBulkSlots = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.target);
      const startSlot = formData.get("startSlot");
      const endSlot = formData.get("endSlot");
      const size = formData.get("size");
      const type = formData.get("type");
      const location = formData.get("location");

      // Validate slot numbers (expecting format like SL-001)
      const slotRegex = /^SL-\d{3}$/;
      if (
        !startSlot ||
        !endSlot ||
        !slotRegex.test(startSlot as string) ||
        !slotRegex.test(endSlot as string)
      ) {
        throw new Error(
          "Slot numbers must be in the format SL-XXX (e.g., SL-001)"
        );
      }

      const startNum = parseInt((startSlot as string).split("-")[1]);
      const endNum = parseInt((endSlot as string).split("-")[1]);
      if (endNum < startNum) {
        throw new Error(
          "End slot number must be greater than or equal to start slot number"
        );
      }

      // Check for duplicate slot numbers
      const existingSlots = parkingSlots.map((slot) => slot.slotNumber);
      const newSlots: any = [];
      for (let i = startNum; i <= endNum; i++) {
        const slotNumber = `SL-${String(i).padStart(3, "0")}`;
        if (existingSlots.includes(slotNumber)) {
          throw new Error(`Slot ${slotNumber} already exists`);
        }
        newSlots.push({
          id: parkingSlots.length + i - startNum + 1,
          slotNumber,
          size,
          type,
          location,
          status: "Available",
          assignedTo: null,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setParkingSlots((prev) => [...prev, ...newSlots]);
      toast.success(`${newSlots.length} slots added successfully`);
      closeModal("addBulkSlots");
    } catch (error: any) {
      toast.error(error.message || "Failed to add slots");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit slot
  const handleEditSlot = async (e: any, slotId: any) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.target);
      const updatedSlot = {
        size: (formData.get("size") as string) || "",
        type: (formData.get("type") as string) || "",
        location: (formData.get("location") as string) || "",
        status: (formData.get("status") as string) || "",
      };
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setParkingSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, ...updatedSlot } : slot
        )
      );
      toast.success("Slot updated successfully");
      closeModal("editSlot");
    } catch (error) {
      toast.error("Failed to update slot");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete slot
  const handleDeleteSlot = async (slotId: any) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setParkingSlots((prev) => prev.filter((slot) => slot.id !== slotId));
      setSelectedSlots((prev) => prev.filter((id) => id !== slotId));
      toast.success("Slot deleted successfully");
      closeModal("deleteSlot");
    } catch (error) {
      toast.error("Failed to delete slot");
    } finally {
      setIsLoading(false);
    }
  };

  // Modal Components
  const AddBulkSlotsModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Add Parking Slots in Bulk
          </h3>
          <button
            onClick={() => closeModal("addBulkSlots")}
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
        <form onSubmit={handleAddBulkSlots}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="startSlot"
                className="block text-sm font-medium text-gray-700"
              >
                Start Slot Number
              </label>
              <input
                type="text"
                id="startSlot"
                name="startSlot"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., SL-101"
                required
              />
            </div>
            <div>
              <label
                htmlFor="endSlot"
                className="block text-sm font-medium text-gray-700"
              >
                End Slot Number
              </label>
              <input
                type="text"
                id="endSlot"
                name="endSlot"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., SL-110"
                required
              />
            </div>
            <div>
              <label
                htmlFor="size"
                className="block text-sm font-medium text-gray-700"
              >
                Size
              </label>
              <select
                id="size"
                name="size"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700"
              >
                Vehicle Type
              </label>
              <select
                id="type"
                name="type"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="Car">Car</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Truck">Truck</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Location
              </label>
              <select
                id="location"
                name="location"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => closeModal("addBulkSlots")}
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
              {isLoading ? "Adding..." : "Add Slots"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const ViewSlotModal = ({ slot }: { slot: any }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Slot Details</h3>
          <button
            onClick={() => closeModal("viewSlot")}
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
              Slot Number
            </label>
            <p className="mt-1 text-sm text-gray-900">{slot.slotNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Size
            </label>
            <p className="mt-1 text-sm text-gray-900">{slot.size}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vehicle Type
            </label>
            <p className="mt-1 text-sm text-gray-900">{slot.type}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <p className="mt-1 text-sm text-gray-900">{slot.location}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <span
              className={`mt-1 px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${
                slot.status === "Available"
                  ? "bg-green-100 text-green-800"
                  : slot.status === "Occupied"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {slot.status}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Assigned To
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {slot.assignedTo || "Not assigned"}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => closeModal("viewSlot")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              closeModal("viewSlot");
              openModal("editSlot", slot);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );

  const EditSlotModal = ({ slot }: { slot: any }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Slot</h3>
          <button
            onClick={() => closeModal("editSlot")}
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
        <form onSubmit={(e) => handleEditSlot(e, slot.id)}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="size"
                className="block text-sm font-medium text-gray-700"
              >
                Size
              </label>
              <select
                id="size"
                name="size"
                defaultValue={slot.size}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700"
              >
                Vehicle Type
              </label>
              <select
                id="type"
                name="type"
                defaultValue={slot.type}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="Car">Car</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Truck">Truck</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Location
              </label>
              <select
                id="location"
                name="location"
                defaultValue={slot.location}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={slot.status}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => closeModal("editSlot")}
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
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const DeleteSlotModal = ({ slotId }: { slotId: any }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Delete Slot
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this parking slot? This action cannot
          be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => closeModal("deleteSlot")}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteSlot(slotId)}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );

  const BulkActionModal = ({ action }: { action: any }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Confirm Bulk Action
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to{" "}
          {action === "mark-available"
            ? "mark as available"
            : action === "mark-maintenance"
            ? "mark for maintenance"
            : "delete"}{" "}
          {selectedSlots.length} selected slots?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => closeModal("bulkAction")}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => confirmBulkAction(action)}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parking Slots</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage all parking slots in the facility. View status, assign slots,
            and handle maintenance.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => openModal("addBulkSlots")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add New Slots
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
                placeholder="Search slots..."
                value={filters.search}
                onChange={handleFilterChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 sm:text-sm"
              />
            </div>
          </div>
          {[
            {
              id: "status",
              label: "Status",
              options: [
                { value: "all", label: "All Statuses" },
                { value: "Available", label: "Available" },
                { value: "Occupied", label: "Occupied" },
                { value: "Maintenance", label: "Maintenance" },
              ],
            },
            {
              id: "size",
              label: "Size",
              options: [
                { value: "all", label: "All Sizes" },
                { value: "Small", label: "Small" },
                { value: "Medium", label: "Medium" },
                { value: "Large", label: "Large" },
              ],
            },
            {
              id: "type",
              label: "Vehicle Type",
              options: [
                { value: "all", label: "All Types" },
                { value: "Car", label: "Car" },
                { value: "Motorcycle", label: "Motorcycle" },
                { value: "Truck", label: "Truck" },
              ],
            },
            {
              id: "location",
              label: "Location",
              options: [
                { value: "all", label: "All Locations" },
                { value: "North", label: "North" },
                { value: "South", label: "South" },
                { value: "East", label: "East" },
                { value: "West", label: "West" },
              ],
            },
          ].map(({ id, label, options }) => (
            <div key={id}>
              <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {label}
              </label>
              <select
                id={id}
                name={id}
                value={filters[id]}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 sm:text-sm"
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="flex items-end">
            <button
              onClick={() =>
                setFilters({
                  status: "all",
                  size: "all",
                  type: "all",
                  location: "all",
                  search: "",
                })
              }
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <svg
                className="-ml-1 mr-2 h-4 w-4"
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            onChange={(e) => handleBulkAction(e.target.value)}
            defaultValue=""
            className="block w-48 pl-3 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 sm:text-sm"
          >
            <option value="" disabled>
              Bulk Actions
            </option>
            <option value="mark-available">Mark as Available</option>
            <option value="mark-maintenance">Mark for Maintenance</option>
            <option value="delete">Delete Selected</option>
          </select>
          <button
            onClick={() => handleBulkAction("apply")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Apply
          </button>
        </div>
        <div className="text-sm text-gray-700">
          {selectedSlots.length > 0 ? (
            <span className="font-medium text-indigo-600">
              {selectedSlots.length} selected
            </span>
          ) : (
            <>
              Showing{" "}
              <span className="font-medium">{indexOfFirstSlot + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastSlot, filteredSlots.length)}
              </span>{" "}
              of <span className="font-medium">{filteredSlots.length}</span>{" "}
              slots
            </>
          )}
        </div>
      </div>

      {/* Parking Slots Table */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
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
                      selectedSlots.length === currentSlots.length &&
                      currentSlots.length > 0
                    }
                    onChange={toggleAllSlotsSelection}
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Slot Number
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Size
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Vehicle Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Location
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
                  Assigned To
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
              {currentSlots.map((slot) => (
                <tr
                  key={slot.id}
                  className={`${
                    slot.status === "Occupied"
                      ? "bg-blue-50 hover:bg-blue-100"
                      : "hover:bg-gray-50"
                  } transition-colors duration-150`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={selectedSlots.includes(slot.id)}
                      onChange={() => toggleSlotSelection(slot.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-800 font-medium">
                        {slot.slotNumber.substring(3)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {slot.slotNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {slot.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {slot.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {slot.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${
                        slot.status === "Available"
                          ? "bg-green-100 text-green-800"
                          : slot.status === "Occupied"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {slot.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {slot.assignedTo ? (
                      <span className="text-gray-900">{slot.assignedTo}</span>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => openModal("viewSlot", slot)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        aria-label="View slot"
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
                      <button
                        onClick={() => openModal("editSlot", slot)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        aria-label="Edit slot"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => openModal("deleteSlot", slot.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        aria-label="Delete slot"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M4 7h16"
                          />
                        </svg>
                      </button>
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
        <div className="bg-white px-4 py-4 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-xl shadow-sm mt-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{indexOfFirstSlot + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastSlot, filteredSlots.length)}
                </span>{" "}
                of <span className="font-medium">{filteredSlots.length}</span>{" "}
                results
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
                  className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
                  let pageNum;
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
                      } transition-colors duration-200`}
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
                  className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
      {modalState.viewSlot && <ViewSlotModal slot={modalState.viewSlot} />}
      {modalState.editSlot && <EditSlotModal slot={modalState.editSlot} />}
      {modalState.deleteSlot && (
        <DeleteSlotModal slotId={modalState.deleteSlot} />
      )}
      {modalState.bulkAction && (
        <BulkActionModal action={modalState.bulkAction} />
      )}
      {modalState.addBulkSlots && <AddBulkSlotsModal />}
    </div>
  );
};

export default ParkingSlots;
