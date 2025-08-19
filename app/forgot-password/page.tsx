"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setMessage(data.message);

      if (data.success) {
        localStorage.setItem("resetEmail", email);
        router.push("/verify-reset-code");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "50px auto",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 10,
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        background: "#0A0F19",
        textAlign: "center",
      }}
    >
      <Image
        src="/logo.png"
        alt="Logo"
        width={100}
        height={100}
        style={{ marginBottom: 20 }}
      />
      <h1 style={{ marginBottom: 20 }}>Forgot Password</h1>

      <form onSubmit={handleSubmit}>
        <input
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          style={{
            display: "block",
            width: "100%",
            marginBottom: 15,
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 14,
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
            borderRadius: 6,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          {loading ? "Sending..." : "Send Reset Code"}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: 15,
            color: message.toLowerCase().includes("success") ? "green" : "red",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}