"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

interface RegistrationData {
  uid?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  organization: string;
  state: string;
  gender: string;
  is_nit_student: boolean;
  participant_category?: string;
  selected_events: string[];
  total_fee: number;
  entry_fee: number;
  events_fee: number;
  attend_day1: boolean;
  attend_day2: boolean;
  photo_url?: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const [data, setData] = useState<RegistrationData | null>(null);
  const [txnId, setTxnId] = useState("");
  const [upiLink, setUpiLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // 👉 Replace this with your own Cloudinary credentials
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // UPI ID for payment
  const upiId = "jkbmerc00173818@jkb";
  const isZeroFee = data?.total_fee === 0;

  // -------------------- Load registration data --------------------
  useEffect(() => {
    const stored = localStorage.getItem("registration_data");
    if (stored) {
      try {
        const parsed: RegistrationData = JSON.parse(stored);
        setData(parsed);

        // restore photo preview if previously uploaded
        const localPhoto = localStorage.getItem("participant_photo");
        if (localPhoto) setPhotoPreview(localPhoto);
        
        // Note: We don't restore the photoFile, only the preview.
        // The user would need to re-select the file if they refresh.
        // To persist the file itself, more complex state (like IndexedDB) is needed.
        // For this flow, we assume the preview is enough to remind them,
        // but the `photoFile` state is what matters for submission.

        if (parsed.total_fee > 0) {
          const link = `upi://pay?pa=${upiId}&pn=Rang-e-chinar&am=${parsed.total_fee}&cu=INR&tn=Event Registration`;
          setUpiLink(link);
        }
      } catch (e) {
        console.error("Error parsing registration data:", e);
      }
    } else {
      router.push("/");
    }
  }, [router]);

  // -------------------- Handle photo upload --------------------
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(null);
      localStorage.removeItem("participant_photo");
      return;
    }

    setPhotoFile(file); // Set the File object

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64); // Set the preview string
      localStorage.setItem("participant_photo", base64);
    };
    reader.readAsDataURL(file);
  };

  // -------------------- Upload to Cloudinary --------------------
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file); // send the File object directly
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET!); // your unsigned preset
  
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
  
    const result = await res.json();
    console.log("Cloudinary response:", result);
  
    if (!result.secure_url) {
      throw new Error("Cloudinary upload failed");
    }
  
    return result.secure_url;
  };

  // -------------------- Handle Registration Submit --------------------
  const handleSubmit = async () => {
    if (!data) return;

    // --- (MODIFIED) ADDED CHECKS ---
    if (!photoFile) {
      alert("Please upload your photo to complete registration.");
      return; // Stop execution
    }

    if (!isZeroFee && !txnId.trim()) {
      alert("Please enter your UPI Transaction ID.");
      return; // Stop execution
    }
    // --- END OF MODIFICATION ---
    
    setIsSubmitting(true);
  
    try {
      // We now know photoFile is not null, so we can upload it directly
      const photoUrl = await uploadToCloudinary(photoFile);
  
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          txn_id: data.total_fee > 0 ? txnId : "FREE",
          amount: data.total_fee,
          photo_url: photoUrl, // Pass the new URL
        }),
      });
  
      const result = await res.json();
  
      if (res.ok) {
        // Clear local storage on success
        localStorage.removeItem("registration_data");
        localStorage.removeItem("participant_photo");
        router.push("/success");
      } else {
        alert(result.error || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      alert("Image upload failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading registration details...</p>
        </div>
      </div>
    );
  }

  // const isZeroFee = data.total_fee === 0; // Moved to top

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-10 text-center text-indigo-900">
        {isZeroFee ? "🌟 Registration Confirmation" : "🌟 Payment Confirmation"}
      </h1>

      {/* ---------- PHOTO UPLOAD SECTION ---------- */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-8">
        <h2 className="text-xl font-semibold text-indigo-800 mb-4">
          Upload Your Photo (Required)
        </h2>
        <div className="flex flex-col items-center gap-4">
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover border-2 border-indigo-500"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            required 
          />
          {/* --- (MODIFIED) ADDED FEEDBACK --- */}
          {!photoFile && (
            <p className="text-sm text-red-600 font-medium text-center">
              A photo is required to complete registration.
            </p>
          )}
          {/* --- END OF MODIFICATION --- */}
          <p className="text-sm text-gray-500 text-center">
            Your photo will be uploaded to the cloud once you confirm registration.
          </p>
        </div>
      </div>

      {/* ---------- REGISTRATION SUMMARY ---------- */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-8">
        <h2 className="text-xl font-semibold text-indigo-800 mb-4">Registration Summary</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Full Name</p>
            <p className="font-medium text-gray-800">
              {data.first_name} {data.last_name}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p className="font-medium text-gray-800">{data.email}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Phone</p>
            <p className="font-medium text-gray-800">{data.phone}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Organization</p>
            <p className="font-medium text-gray-800">{data.organization}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">State</p>
            <p className="font-medium text-gray-800">{data.state}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Participant Type</p>
            <p className="font-medium text-gray-800">
              {data.is_nit_student ? "NIT Srinagar Student" : data.participant_category}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Selected Events</p>
            <p className="font-medium text-gray-800">{data.selected_events.length} event(s)</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-700 mb-3">Fee Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Events Fee</p>
              <p className="text-lg font-bold text-gray-800">₹{data.events_fee}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Entry Fee</p>
              <p className="text-lg font-bold text-gray-800">₹{data.entry_fee}</p>
            </div>
            {/* --- THIS BLOCK IS NOW CORRECTED --- */}
            <div className="bg-indigo-50 p-3 rounded-lg">
              <p className="text-sm text-indigo-600">Total Amount</p>
              <p className="text-lg font-bold text-gray-800">
                {isZeroFee ? "FREE" : `₹${data.total_fee}`}
              </p>
            </div>
            {/* --- END OF CORRECTION --- */}
          </div>
        </div>
      </div>

      {/* ---------- PAYMENT SECTION ---------- */}
      {isZeroFee ? (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-indigo-800 mb-4">✨ Free Registration</h2>
            <p className="text-gray-600 mb-6">
              You qualify for free registration! Click the button below to confirm your registration.
            </p>
            <button
              onClick={handleSubmit}
              // --- (MODIFIED) ADDED !photoFile CHECK ---
              disabled={isSubmitting || !photoFile}
              className={`bg-indigo-600 text-white py-3 px-8 rounded-lg font-medium transition-all 
                ${isSubmitting || !photoFile ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-700"}`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Processing...
                </span>
              ) : (
                "Complete Registration"
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
          <h2 className="text-xl font-semibold text-indigo-800 flex items-center mb-4">
            💳 Complete Payment
          </h2>
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="flex-1 sm:border-r sm:pr-8 border-gray-200">
              <h3 className="font-medium text-gray-700 mb-3">Scan QR Code to Pay</h3>
              <div className="flex flex-col items-center">
                {upiLink && (
                  <div className="bg-white p-4 border border-gray-200 shadow-sm rounded-lg">
                    <QRCode
                      value={upiLink}
                      size={256}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 256 256`}
                    />
                  </div>
                )}
                <div className="mt-4 text-center">
                  <p className="text-gray-600">UPI ID:</p>
                  <p className="font-mono bg-gray-50 py-1 px-3 rounded border border-gray-200 select-all text-indigo-600">
                    {upiId}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-gray-700 mb-3">Verify Payment</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-gray-600 mb-2">
                    Once you've made the payment, enter the UPI transaction ID to complete your registration.
                  </p>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UPI Transaction ID
                  </label>
                  <input
                    type="text"
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                    placeholder="Enter UPI Transaction ID"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  // --- (MODIFIED) ADDED !photoFile CHECK ---
                  disabled={isSubmitting || !txnId.trim() || !photoFile}
                  className={`w-full bg-indigo-600 text-white py-3 rounded-lg font-medium transition-all 
                    ${isSubmitting || !txnId.trim() || !photoFile ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-700"}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      Processing...
                    </span>
                  ) : (
                    "Confirm Registration"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- BACK BUTTON ---------- */}
      <div className="mt-6 text-center">
        <button
          onClick={() => router.push("/")}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← Back to Registration
        </button>
      </div>
    </main>
  );
}