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
  gender: string;
  is_nit_student: boolean;
  participant_category?: string;
  selected_events: string[];
  total_fee: number;
  entry_fee: number;
  events_fee: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const [data, setData] = useState<RegistrationData | null>(null);
  const [txnId, setTxnId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingQr, setLoadingQr] = useState(true);
  
  // UPI ID for payment
  const upiId = "jkbmerc00173818@jkb";

  useEffect(() => {
    // Get data from localStorage
    const stored = localStorage.getItem("registration_data");
    if (stored) {
      try {
        const parsed: RegistrationData = JSON.parse(stored);
        setData(parsed);
        
        // Create UPI link and generate QR code
        const fee = parsed.total_fee ?? 0;
        const upiLink = `upi://pay?pa=${upiId}&pn=Rang-e-chinar&am=${fee}&cu=INR&tn=Event Registration`;
        
        // Generate QR code
        fetch(
          `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiLink)}&size=300x300`
        )
          .then((res) => res.url)
          .then((url) => {
            setQrCode(url);
            setLoadingQr(false);
          })
          .catch((err) => {
            console.error("Error generating QR code:", err);
            setLoadingQr(false);
          });
      } catch (e) {
        console.error("Error parsing registration data:", e);
      }
    } else {
      // If no data in localStorage, redirect to registration page
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async () => {
    if (!txnId.trim()) {
      alert("Please enter transaction ID");
      return;
    }
    
    if (!data) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          txn_id: txnId,
        }),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        // Clear local storage and redirect to success page
        localStorage.removeItem("registration_data");
        router.push("/success");
      } else {
        alert(result.error || "Something went wrong. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting registration:", error);
      alert("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };
  
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-10 text-center text-indigo-900">
        🌟 Payment Confirmation
      </h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-8">
        <h2 className="text-xl font-semibold text-indigo-800 mb-4">Registration Summary</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Full Name</p>
            <p className="font-medium text-gray-800">{data.first_name} {data.last_name}</p>
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
        
        {/* Fee Breakdown */}
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
            
            <div className="bg-indigo-50 p-3 rounded-lg">
              <p className="text-sm text-indigo-600">Total Amount</p>
              <p className="text-lg font-bold text-indigo-800">₹{data.total_fee}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Instructions */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
        <h2 className="text-xl font-semibold text-indigo-800 flex items-center mb-4">
          <span className="mr-2">💳</span> Complete Payment
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-8">
          {/* QR Code Section */}
          <div className="flex-1 sm:border-r sm:pr-8 border-gray-200">
            <h3 className="font-medium text-gray-700 mb-3">Scan QR Code to Pay</h3>
            
            <div className="flex flex-col items-center">
              {loadingQr ? (
                <div className="bg-gray-100 h-64 w-64 flex items-center justify-center rounded-lg">
                  <div>WAIT FOR QR TO LOAD OR REFRESH</div>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                qrCode && (
                  <div className="bg-white p-4 border border-gray-200 shadow-sm rounded-lg">
                    <img 
                      src={qrCode} 
                      alt="Payment QR Code" 
                      className="w-64 h-64 object-contain" 
                    />
                  </div>
                )
              )}
              
              <div className="mt-4 text-center">
                <p className="text-gray-600">UPI ID:</p>
                <p className="font-mono bg-gray-50 py-1 px-3 rounded border border-gray-200 select-all text-indigo-600">
                  {upiId}
                </p>
              </div>
            </div>
          </div>
          
          {/* Payment Verification */}
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
                />
              </div>
              
             
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !txnId.trim()}
                className={`w-full bg-indigo-600 text-white py-3 rounded-lg font-medium transition-all 
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
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
      
      {/* Back to Registration Button */}
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