"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import api from "@/lib/apiClient";
import Cookies from "js-cookie";
import toast from "react-hot-toast";


const loginSchema = z.object({
    emailOrMobile: z
        .string()
        .min(1, "Email or Mobile is required")
        .refine(
            (val) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^[0-9]{10}$/.test(val),
            "Enter valid email or 10-digit mobile number"
        ),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = loginSchema.extend({
    name: z.string().min(1, "Name is required"),
    confirmPassword: z.string().min(6, "Confirm Password is required"),
    role: z.enum(["Admin", "Admission Officer", "Management"]),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
});

type LoginFormInputs = z.infer<typeof loginSchema>;
type SignupFormInputs = z.infer<typeof signupSchema>;

export default function AuthForm() {
    const pathName = usePathname();
    const router = useRouter();
    const isSignup = pathName === "/signup";

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs | SignupFormInputs>({
        resolver: zodResolver(isSignup ? signupSchema : loginSchema),
    });

    const onSubmit = async (data: LoginFormInputs | SignupFormInputs) => {
        console.log(data);
        if (isSignup) {
            try {
                const res = await api.post("/signup", data);
                if (res.status === 201 || res.status === 200) {
                    Cookies.set("isLoggedIn", "true", { path: "/" });
                    // Store role for frontend UI control
                    if ("role" in data) {
                        Cookies.set("userRole", data.role as string, { path: "/" });
                    }
                    toast.success("Login successful 🎉");
                    router.push("/");
                } else {
                    toast.error("Invalid credentials ❌");
                    router.push("/login");
                }
            } catch (error: any) {
                console.log("Signup Error: ", error);
                // alert(error.response?.data?.error || "Signup failed. Please check form fields.");
                toast.error("Invalid credentials ❌");
            }

        } else {
            try {
                const res = await api.post("/login", data);
                console.log("Login Success: ", res.data);
                if (res.status === 200 || res.status === 201) {
                    Cookies.set("isLoggedIn", "true", { path: "/" });
                    // Store role from server response
                    if (res.data?.role) {
                        Cookies.set("userRole", res.data.role, { path: "/" });
                    }                    
                    toast.success("Login successful");
                    router.push("/");
                }
            } catch (error: any) {
                console.log("Login Error: ", error);
                // alert(error.response?.data?.error || "Login failed. Invalid credentials.");
                toast.error("Invalid credentials");

            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white p-6 sm:p-8 rounded-2xl shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {isSignup ? "Sign Up" : "Login"}
                </h2>
                {/* name */}
                {isSignup &&
                    <div className="mb-4">
                        <label className="block mb-1 font-medium" htmlFor="name">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            {...register("name")}
                            className={`w-full border focus:outline-none rounded px-3 py-2 ${(errors as any).name ? "border-red-500" : "border-gray-300"
                                }`}
                            placeholder="Enter your name"
                        />
                        {(errors as any).name && (
                            <p className="text-red-500 text-sm mt-1">
                                {(errors as any).name.message}
                            </p>
                        )}
                    </div>
                }

                {/* Email or Mobile */}
                <div className="mb-4">
                    <label className="block mb-1 font-medium" htmlFor="emailOrMobile">
                        Email or Mobile Number
                    </label>
                    <input
                        id="emailOrMobile"
                        type="text"
                        {...register("emailOrMobile")}
                        className={`w-full border focus:outline-none rounded px-3 py-2 ${errors.emailOrMobile ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="Enter email or mobile"
                    />
                    {errors.emailOrMobile && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.emailOrMobile.message}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div className="mb-4 relative">
                    <label className="block mb-1 font-medium" htmlFor="password">
                        Password
                    </label>

                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}  // ✅ FIXED
                        {...register("password")}
                        className={`w-full border focus:outline-none rounded px-3 py-2 pr-10 ${errors.password ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="Enter password"
                    />

                    {/* Eye Icon */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[38px] text-gray-500 cursor-pointer"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>

                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {/* Confirm Password (only for signup) */}
                {isSignup && (
                    <div className="mb-6 relative">
                        <label className="block mb-1 font-medium" htmlFor="confirmPassword">
                            Confirm Password
                        </label>

                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}  // ✅ FIXED
                            {...register("confirmPassword")}
                            className={`w-full border focus:outline-none rounded px-3 py-2 pr-10 ${(errors as any).confirmPassword ? "border-red-500" : "border-gray-300"
                                }`}
                            placeholder="Confirm your password"
                        />

                        {/* Eye Icon */}
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)} // ✅ FIXED
                            className="absolute right-3 top-[38px] text-gray-500 cursor-pointer"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>

                        {(errors as any).confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">
                                {(errors as any).confirmPassword.message}
                            </p>
                        )}
                    </div>
                )}

                {/* Role (only for signup) */}
                {isSignup && (
                    <div className="mb-6">
                        <label className="block mb-1 font-medium" htmlFor="role">
                            Role
                        </label>
                        <select
                            id="role"
                            {...register("role")}
                            className={`w-full border focus:outline-none rounded px-3 py-2 ${(errors as any).role ? "border-red-500" : "border-gray-300"}`}
                        >
                            <option value="Admin">Admin</option>
                            <option value="Admission Officer">Admission Officer</option>
                            <option value="Management">Management</option>
                        </select>
                        {(errors as any).role && (
                            <p className="text-red-500 text-sm mt-1">
                                {(errors as any).role.message}
                            </p>
                        )}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                    {isSignup ? "Sign Up" : "Login"}
                </button>

                {/* Footer Link */}
                <p className="mt-4 text-center text-sm">
                    {isSignup ? (
                        <>
                            Already have an account?{" "}
                            <Link href="/login" className="text-blue-600 hover:underline">
                                Login
                            </Link>
                        </>
                    ) : (
                        <>
                            Don’t have an account?{" "}
                            <Link href="/signup" className="text-blue-600 hover:underline">
                                Sign Up
                            </Link>
                        </>
                    )}
                </p>
            </form>
        </div>
    );
}