"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const email = params.get("email");
  const code = params.get("code");

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, code, newPassword }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.success) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setMessage(data.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", padding: 20, textAlign: "center", border: "1px solid #ccc", borderRadius: 8 }}>
      <img src="/logo.png" alt="Logo" style={{ width: 80, marginBottom: 20 }} />
      <h1>Reset Password</h1>
      <form onSubmit={handleReset} style={{ marginTop: 20 }}>
        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          type="password"
          required
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: "#0070f3",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: 4,
          }}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      <button
        onClick={() => router.push("/login")}
        style={{
          marginTop: 15,
          padding: "10px 20px",
          background: "#28a745",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: 4,
        }}
      >
        Go to Login
      </button>
      {message && <p style={{ color: message.includes("successfully") ? "green" : "red", marginTop: 10 }}>{message}</p>}
    </div>
  );
}
