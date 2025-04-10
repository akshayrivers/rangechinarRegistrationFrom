"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface RegistrationData {
  uid?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  organization: string;
  state: string;
  selected_events: string[];
  selected_events_fee?: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const [data, setData] = useState<RegistrationData | null>(null);
  const [txnId, setTxnId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingQr, setLoadingQr] = useState(true); // New loading state

  const upiId = "jkbmerc00173818@jkb";

  useEffect(() => {
    const stored = localStorage.getItem("registration_data");
    if (stored) {
      const parsed: RegistrationData = JSON.parse(stored);
      setData(parsed);

      const fee = parsed.selected_events_fee ?? 0;
      const upiLink = `upi://pay?pa=${upiId}&pn=Techvaganza&am=${fee}&cu=INR`;

      fetch(
        `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
          upiLink
        )}&size=200x200`
      )
        .then((res) => res.url)
        .then((url) => {
          setQrCode(url);
          setLoadingQr(false); // QR code finished loading
        });
    }
  }, []);

  const handleSubmit = async () => {
    if (!txnId) {
      alert("Please enter transaction ID");
      return;
    }

    if (!data) return;

    setIsSubmitting(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, txn_id: txnId }),
    });

    const result = await res.json();
    if (res.ok) {
      localStorage.removeItem("registration_data");
      router.push("/success");
    } else {
      alert(result.error);
      setIsSubmitting(false);
    }
  };

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Step 2: Payment</h1>

      <div className="mb-6 bg-gray-50 p-4 rounded border">
        <h2 className="text-lg font-semibold mb-2">Summary</h2>
        <p>
          <strong>Name:</strong> {data.first_name} {data.last_name}
        </p>
        <p>
          <strong>Email:</strong> {data.email}
        </p>
        <p>
          <strong>Phone:</strong> {data.phone}
        </p>
        <p>
          <strong>Selected Events:</strong> {data.selected_events.length}
        </p>
        <p>
          <strong>Total Fee:</strong> ₹{data.selected_events_fee ?? 0}
        </p>
      </div>

      <div className="flex flex-col items-center mb-6">
        <h3 className="text-md mb-2 font-medium">Pay via UPI to:</h3>
        <p className="mb-2 text-sm">{upiId}</p>
        {loadingQr ? (
          <p className="text-sm text-gray-500">Generating QR code...</p>
        ) : (
          qrCode && (
            <img
              src={qrCode}
              alt="UPI QR Code"
              className="w-40 h-40 border rounded"
            />
          )
        )}
      </div>

      <input
        type="text"
        placeholder="Enter Transaction ID"
        value={txnId}
        onChange={(e) => setTxnId(e.target.value)}
        className="w-full border p-2 mb-4"
      />

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || loadingQr}
        className="bg-green-600 text-white w-full py-2 rounded disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Confirm Registration"}
      </button>
    </main>
  );
}
