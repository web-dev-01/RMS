"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyResetCodePage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Auto-fill email from localStorage if available
  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(
          `/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`
        );
      } else {
        setMessage(data.message || "Verification failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "auto",
        padding: 20,
        textAlign: "center",
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "#0A0F19",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      {/* Logo */}
      <img
        src="/logo.png"
        alt="Logo"
        style={{ width: 100, marginBottom: 20 }}
      />

      <h1 style={{ marginBottom: 15 }}>Verify Reset Code</h1>

      <form onSubmit={handleVerify}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        />
        <input
          type="text"
          placeholder="Enter reset code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      {message && (
        <p style={{ color: "red", marginTop: 10 }}>{message}</p>
      )}
    </div>
  );
}
