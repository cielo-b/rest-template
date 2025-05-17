import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define validation schema with Zod
const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(50, { message: "Name must be less than 50 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would call your registration API here
      // await api.register(data);

      toast.success("Registration successful! Redirecting...");
      // Redirect logic would go here
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* <img
          className="mx-auto h-16 w-auto drop-shadow-lg"
          src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
          alt="Parking System"
        /> */}
        <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-800 tracking-tight">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-2 sm:px-0">
        <div className="bg-white/90 py-8 px-4 sm:py-10 sm:px-8 md:px-12 shadow-xl sm:rounded-2xl border border-indigo-100">
          <form className="space-y-7" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-indigo-700"
              >
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={`appearance-none block w-full px-4 py-2 border ${
                    errors.name ? "border-red-400" : "border-indigo-200"
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm transition`}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-indigo-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none block w-full px-4 py-2 border ${
                    errors.email ? "border-red-400" : "border-indigo-200"
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm transition`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-indigo-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className={`appearance-none block w-full px-4 py-2 border ${
                    errors.password ? "border-red-400" : "border-indigo-200"
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm transition`}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-indigo-700"
              >
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className={`appearance-none block w-full px-4 py-2 border ${
                    errors.confirmPassword
                      ? "border-red-400"
                      : "border-indigo-200"
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm transition`}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-indigo-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-indigo-500 font-medium">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-indigo-300 rounded-lg shadow-sm text-base font-semibold text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
