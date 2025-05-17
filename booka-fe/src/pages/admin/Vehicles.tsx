import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Vehicle {
  id: number;
  plateNumber: string;
  type: string;
  size: string;
  color: string;
  owner: string;
  status: string;
  registeredAt: string;
}

const Vehicles = () => {
  const [filters, setFilters] = useState<{
    type: string;
    status: string;
    search: string;
  }>({
    type: "all",
    status: "all",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([]);
  const [modalState, setModalState] = useState<{
    viewVehicle: Vehicle | null;
    editVehicle: Vehicle | null;
    registerVehicle: boolean;
    banVehicle: Vehicle | null;
    deleteVehicle: Vehicle | null;
  }>({
    viewVehicle: null,
    editVehicle: null,
    registerVehicle: false,
    banVehicle: null,
    deleteVehicle: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const vehiclesPerPage: number = 10;

  // Mock data
  const [vehicles, setVehicles] = useState<Vehicle[]>(
    Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      plateNumber: `ABC-${Math.floor(Math.random() * 9000 + 1000)}`,
      type: ["Car", "Motorcycle", "Truck"][Math.floor(Math.random() * 3)],
      size: ["Small", "Medium", "Large"][Math.floor(Math.random() * 3)],
      color: ["Red", "Blue", "Black", "White", "Silver"][
        Math.floor(Math.random() * 5)
      ],
      owner: `User ${Math.floor(Math.random() * 50) + 1}`,
      status: ["Active", "Inactive", "Banned"][Math.floor(Math.random() * 3)],
      registeredAt: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
    }))
  );

  // Filter vehicles
  const filteredVehicles: Vehicle[] = vehicles.filter((vehicle) => {
    return (
      (filters.type === "all" || vehicle.type === filters.type) &&
      (filters.status === "all" || vehicle.status === filters.status) &&
      (filters.search === "" ||
        vehicle.plateNumber
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        vehicle.owner.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  // Pagination logic
  const indexOfLastVehicle: number = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle: number = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles: Vehicle[] = filteredVehicles.slice(
    indexOfFirstVehicle,
    indexOfLastVehicle
  );
  const totalPages: number = Math.ceil(
    filteredVehicles.length / vehiclesPerPage
  );

  // Modal Handlers
  const openModal = (type: string, data: Vehicle | boolean = false) => {
    setModalState((prev) => ({ ...prev, [type]: data }));
  };

  const closeModal = (type: string) => {
    setModalState((prev) => ({ ...prev, [type]: false }));
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

  // Toggle vehicle selection
  const toggleVehicleSelection = (vehicleId: number) => {
    setSelectedVehicles((prev) =>
      prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  // Toggle all vehicles selection
  const toggleAllVehiclesSelection = () => {
    if (selectedVehicles.length === currentVehicles.length) {
      setSelectedVehicles([]);
    } else {
      setSelectedVehicles(currentVehicles.map((vehicle) => vehicle.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedVehicles.length === 0) {
      toast.error("Please select at least one vehicle");
      return;
    }

    if (action === "apply") {
      toast.error("Please select a bulk action");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      let updatedVehicles = [...vehicles];
      if (action === "activate") {
        updatedVehicles = updatedVehicles.map((vehicle) =>
          selectedVehicles.includes(vehicle.id)
            ? { ...vehicle, status: "Active" }
            : vehicle
        );
        toast.success(`${selectedVehicles.length} vehicles activated`);
      } else if (action === "deactivate") {
        updatedVehicles = updatedVehicles.map((vehicle) =>
          selectedVehicles.includes(vehicle.id)
            ? { ...vehicle, status: "Inactive" }
            : vehicle
        );
        toast.success(`${selectedVehicles.length} vehicles deactivated`);
      } else if (action === "ban") {
        updatedVehicles = updatedVehicles.map((vehicle) =>
          selectedVehicles.includes(vehicle.id)
            ? { ...vehicle, status: "Banned" }
            : vehicle
        );
        toast.success(`${selectedVehicles.length} vehicles banned`);
      } else if (action === "delete") {
        updatedVehicles = updatedVehicles.filter(
          (vehicle) => !selectedVehicles.includes(vehicle.id)
        );
        toast.success(`${selectedVehicles.length} vehicles deleted`);
      }
      setVehicles(updatedVehicles);
      setSelectedVehicles([]);
    } catch (error) {
      toast.error("Failed to perform bulk action");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle register vehicle
  const handleRegisterVehicle = async (
    vehicleData: Omit<Vehicle, "id" | "registeredAt" | "status">
  ) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newVehicle: Vehicle = {
        id: vehicles.length + 1,
        ...vehicleData,
        status: "Active",
        registeredAt: new Date().toLocaleDateString(),
      };
      setVehicles((prev) => [...prev, newVehicle]);
      toast.success(`Vehicle ${vehicleData.plateNumber} registered`);
      closeModal("registerVehicle");
    } catch (error) {
      toast.error("Failed to register vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit vehicle
  const handleEditVehicle = async (
    vehicleId: number,
    vehicleData: Omit<Vehicle, "id" | "registeredAt" | "status">
  ) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === vehicleId ? { ...vehicle, ...vehicleData } : vehicle
        )
      );
      toast.success(`Vehicle ${vehicleData.plateNumber} updated`);
      closeModal("editVehicle");
    } catch (error) {
      toast.error("Failed to update vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle ban vehicle
  const handleBanVehicle = async (vehicleId: number, reason: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === vehicleId ? { ...vehicle, status: "Banned" } : vehicle
        )
      );
      setSelectedVehicles((prev) => prev.filter((id) => id !== vehicleId));
      toast.success(
        `Vehicle ${vehicleId} banned${reason ? `: ${reason}` : ""}`
      );
      closeModal("banVehicle");
    } catch (error) {
      toast.error("Failed to ban vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete vehicle
  const handleDeleteVehicle = async (vehicleId: number) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== vehicleId));
      setSelectedVehicles((prev) => prev.filter((id) => id !== vehicleId));
      toast.success(`Vehicle ${vehicleId} deleted`);
      closeModal("deleteVehicle");
    } catch (error) {
      toast.error("Failed to delete vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  // Modal Components
  const ViewVehicleModal = ({ vehicle }: { vehicle: Vehicle }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Vehicle Details
          </h3>
          <button
            onClick={() => closeModal("viewVehicle")}
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
              Plate Number
            </label>
            <p className="mt-1 text-sm text-gray-900">{vehicle.plateNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <p className="mt-1 text-sm text-gray-900">{vehicle.type}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Size
            </label>
            <p className="mt-1 text-sm text-gray-900">{vehicle.size}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <div className="mt-1 flex items-center">
              <div
                className={`h-4 w-4 rounded-full mr-2 bg-${vehicle.color.toLowerCase()}-500`}
              ></div>
              <p className="text-sm text-gray-900">{vehicle.color}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Owner
            </label>
            <p className="mt-1 text-sm text-gray-900">{vehicle.owner}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <span
              className={`mt-1 px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${
                vehicle.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : vehicle.status === "Banned"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {vehicle.status}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Registered At
            </label>
            <p className="mt-1 text-sm text-gray-900">{vehicle.registeredAt}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => closeModal("viewVehicle")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              closeModal("viewVehicle");
              openModal("editVehicle", vehicle);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Edit
          </button>
          {vehicle.status !== "Banned" && (
            <button
              onClick={() => {
                closeModal("viewVehicle");
                openModal("banVehicle", vehicle);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Ban
            </button>
          )}
          <button
            onClick={() => {
              closeModal("viewVehicle");
              openModal("deleteVehicle", vehicle);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const RegisterVehicleModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Register Vehicle
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            handleRegisterVehicle({
              plateNumber: formData.get("plateNumber") as string,
              type: formData.get("type") as string,
              size: formData.get("size") as string,
              color: formData.get("color") as string,
              owner: formData.get("owner") as string,
            });
          }}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="plateNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Plate Number
              </label>
              <input
                type="text"
                id="plateNumber"
                name="plateNumber"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700"
              >
                Type
              </label>
              <select
                id="type"
                name="type"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="Car">Car</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Truck">Truck</option>
              </select>
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
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="color"
                className="block text-sm font-medium text-gray-700"
              >
                Color
              </label>
              <select
                id="color"
                name="color"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
                <option value="Black">Black</option>
                <option value="White">White</option>
                <option value="Silver">Silver</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="owner"
                className="block text-sm font-medium text-gray-700"
              >
                Owner
              </label>
              <input
                type="text"
                id="owner"
                name="owner"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => closeModal("registerVehicle")}
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
              {isLoading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const EditVehicleModal = ({ vehicle }: { vehicle: Vehicle }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Edit Vehicle
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            handleEditVehicle(vehicle.id, {
              plateNumber: formData.get("plateNumber") as string,
              type: formData.get("type") as string,
              size: formData.get("size") as string,
              color: formData.get("color") as string,
              owner: formData.get("owner") as string,
            });
          }}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="plateNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Plate Number
              </label>
              <input
                type="text"
                id="plateNumber"
                name="plateNumber"
                defaultValue={vehicle.plateNumber}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700"
              >
                Type
              </label>
              <select
                id="type"
                name="type"
                defaultValue={vehicle.type}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="Car">Car</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Truck">Truck</option>
              </select>
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
                defaultValue={vehicle.size}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="color"
                className="block text-sm font-medium text-gray-700"
              >
                Color
              </label>
              <select
                id="color"
                name="color"
                defaultValue={vehicle.color}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
                <option value="Black">Black</option>
                <option value="White">White</option>
                <option value="Silver">Silver</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="owner"
                className="block text-sm font-medium text-gray-700"
              >
                Owner
              </label>
              <input
                type="text"
                id="owner"
                name="owner"
                defaultValue={vehicle.owner}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => closeModal("editVehicle")}
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

  const BanVehicleModal = ({ vehicle }: { vehicle: Vehicle }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ban Vehicle
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Ban vehicle {vehicle.plateNumber}? You can provide a reason
          (optional).
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const reason = formData.get("reason") as string;
            handleBanVehicle(vehicle.id, reason);
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
              onClick={() => closeModal("banVehicle")}
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
              {isLoading ? "Banning..." : "Ban"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const DeleteVehicleModal = ({ vehicle }: { vehicle: Vehicle }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Delete Vehicle
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete vehicle {vehicle.plateNumber}? This
          action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => closeModal("deleteVehicle")}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteVehicle(vehicle.id)}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage all registered vehicles. View details, update status, or
            assign to users.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => openModal("registerVehicle", true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
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
            Register Vehicle
          </button>
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
                placeholder="Search vehicles..."
                value={filters.search}
                onChange={handleFilterChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm transition duration-150 ease-in-out sm:text-sm"
              />
            </div>
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Banned">Banned</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() =>
                setFilters({
                  type: "all",
                  status: "all",
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
            <option value="activate">Activate Selected</option>
            <option value="deactivate">Deactivate Selected</option>
            <option value="ban">Ban Selected</option>
            <option value="delete">Delete Selected</option>
          </select>
          <button
            onClick={() => handleBulkAction("apply")}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
          >
            Apply
          </button>
        </div>
        <div className="text-sm text-gray-700">
          {selectedVehicles.length > 0 ? (
            <span className="font-medium text-indigo-600">
              {selectedVehicles.length} selected
            </span>
          ) : (
            <>
              Showing{" "}
              <span className="font-medium">{indexOfFirstVehicle + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastVehicle, filteredVehicles.length)}
              </span>{" "}
              of <span className="font-medium">{filteredVehicles.length}</span>{" "}
              vehicles
            </>
          )}
        </div>
      </div>

      {/* Vehicles Table */}
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
                      selectedVehicles.length === currentVehicles.length &&
                      currentVehicles.length > 0
                    }
                    onChange={toggleAllVehiclesSelection}
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Plate Number
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
                  Size
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Color
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Owner
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
                  Registered
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
              {currentVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={selectedVehicles.includes(vehicle.id)}
                      onChange={() => toggleVehicleSelection(vehicle.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {vehicle.plateNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vehicle.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vehicle.size}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`h-4 w-4 rounded-full mr-2 bg-${vehicle.color.toLowerCase()}-500`}
                      ></div>
                      <div className="text-sm text-gray-900">
                        {vehicle.color}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vehicle.owner}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        vehicle.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : vehicle.status === "Banned"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {vehicle.registeredAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openModal("viewVehicle", vehicle)}
                        className="text-indigo-600 hover:text-indigo-900"
                        aria-label="View vehicle"
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
                        onClick={() => openModal("banVehicle", vehicle)}
                        className="text-red-600 hover:text-red-900"
                        aria-label="Ban vehicle"
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
                            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.828-2.829m0 0l2.829-2.829m0 0L5.636 5.636"
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
                <span className="font-medium">{indexOfFirstVehicle + 1}</span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastVehicle, filteredVehicles.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredVehicles.length}</span>{" "}
                vehicles
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
      {modalState.viewVehicle && (
        <ViewVehicleModal vehicle={modalState.viewVehicle} />
      )}
      {modalState.editVehicle && (
        <EditVehicleModal vehicle={modalState.editVehicle} />
      )}
      {modalState.registerVehicle && <RegisterVehicleModal />}
      {modalState.banVehicle && (
        <BanVehicleModal vehicle={modalState.banVehicle} />
      )}
      {modalState.deleteVehicle && (
        <DeleteVehicleModal vehicle={modalState.deleteVehicle} />
      )}
    </div>
  );
};

export default Vehicles;
