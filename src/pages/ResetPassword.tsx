import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { getForgotEmail, clearForgotEmail } from "../utils/forgotSession";
import axiosClient from "../api/axiosClient";

export default function ResetPassword() {
  const navigate = useNavigate();
  const savedEmail = getForgotEmail();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!savedEmail) navigate("/forgot-password");
  }, [savedEmail]);

  const rules = useMemo(() => ({
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
    match: newPassword === confirmPassword && newPassword.length > 0,
  }), [newPassword, confirmPassword]);

  const allPassed = Object.values(rules).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allPassed) {
      toast.error("Please meet all password rules.");
      return;
    }

    setLoading(true);

    try {
      await axiosClient.post("/auth/reset-password", {
        email: savedEmail,
        newPassword,
        confirmPassword,
      });

      toast.success("Password reset successful!");
      clearForgotEmail();
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Reset error");
    } finally {
      setLoading(false);
    }
  };

  const ruleUI = (ok: boolean, text: string) => (
    <li className={`text-sm flex items-center gap-2 ${ok ? "text-green-600" : "text-red-500"}`}>
      <span>{ok ? "✔" : "✘"}</span> {text}
    </li>
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Toaster />

      <div className="p-8 bg-white rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
        <p className="text-center text-gray-600 mb-4">
          Resetting password for: <strong>{savedEmail}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-3 border rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 border rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <ul className="bg-gray-50 p-3 rounded border">
            {ruleUI(rules.length, "At least 8 characters")}
            {ruleUI(rules.uppercase, "One uppercase letter")}
            {ruleUI(rules.lowercase, "One lowercase letter")}
            {ruleUI(rules.number, "One number")}
            {ruleUI(rules.special, "One special character")}
            {ruleUI(rules.match, "Passwords match")}
          </ul>

          <button
            type="submit"
            disabled={!allPassed || loading}
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Saving..." : "Save New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
