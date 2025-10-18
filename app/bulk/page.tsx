"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

interface Participant {
  first_name: string;
  last_name: string;
  gender: string;
  photo?: File | null;
  photo_url?: string | null;
}

interface PrimaryContact extends Participant {
  email: string;
  phone: string;
  organization: string;
  state: string;
  is_nit_student: boolean;
  participant_category?: string;
  selected_events: string[];
  attend_day1: boolean;
  attend_day2: boolean;
}

interface Event {
  id: string | number;
  name: string;
  description: string;
  sub_category: string;
  fee: number;
  category: string;
  day: string;
}

const participantCategories = [
  { id: "school", name: "School Student (till Class 10)", fee: 20 },
  { id: "college", name: "College Student (Including Class 11 & 12)", fee: 29 },
  { id: "alumni", name: "NIT Alumni ", fee: 299 },
  { id: "others", name: "Others (With Any govt ID)", fee: 999 },
];

export default function BulkRegistration() {
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [activeDay, setActiveDay] = useState("1");
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  const [primary, setPrimary] = useState<PrimaryContact>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    organization: "",
    state: "",
    is_nit_student: false,
    participant_category: "college",
    selected_events: [],
    attend_day1: true,
    attend_day2: false,
    photo: null, // Ensure photo is part of initial state
  });

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipant, setNewParticipant] = useState<Participant>({
    first_name: "",
    last_name: "",
    gender: "",
    photo: null,
  });

  const [txnId, setTxnId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [totalFee, setTotalFee] = useState(0);
  const [upiLink, setUpiLink] = useState("");
  const upiId = "jkbmerc00173818@jkb";

  const CLOUDINARY_UPLOAD_PRESET = "Rang-e-chinar-photo"; // Make sure this preset exists in your Cloudinary
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  // --- Load Events ---
  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data: Event[]) => {
        setEvents(data);
        setFilteredEvents(data.filter((event) => event.day.includes(activeDay)));
      });
  }, [activeDay]);

  // --- Filter events by day/category ---
  useEffect(() => {
    setFilteredEvents(
      events
        .filter((e) => e.day.includes(activeDay))
        .filter((e) => (categoryFilter === "All" ? true : e.category === categoryFilter))
    );
  }, [events, activeDay, categoryFilter]);

  // --- Fee Calculation ---
  useEffect(() => {
    const totalParticipants = participants.length + 1;
    const cat = participantCategories.find((c) => c.id === primary.participant_category);
    let baseFee = cat ? cat.fee : 0;
    if (primary.attend_day1 && primary.attend_day2) baseFee *= 2;
    const fee = baseFee * totalParticipants;
    setTotalFee(fee);
    setUpiLink(
      fee > 0
        ? `upi://pay?pa=${upiId}&pn=Rang-e-chinar&am=${fee}&cu=INR&tn=Bulk Registration`
        : ""
    );
  }, [primary, participants]);

  // --- Input Handlers ---
  const handlePrimaryInput = (key: keyof PrimaryContact, value: any) => {
    setPrimary((prev) => ({ ...prev, [key]: value }));
  };

  const addParticipant = () => {
    // --- (MODIFIED) More specific alerts ---
    if (!newParticipant.first_name || !newParticipant.last_name || !newParticipant.gender) {
      alert("Fill all text fields for the participant (First Name, Last Name, Gender).");
      return;
    }
    if (!newParticipant.photo) {
      alert("Please upload a photo for this participant.");
      return;
    }
    // --- (END MODIFIED) ---
    setParticipants([...participants, newParticipant]);
    setNewParticipant({ first_name: "", last_name: "", gender: "", photo: null });
  };

  const removeParticipant = (idx: number) => {
    setParticipants(participants.filter((_, i) => i !== idx));
  };

  const handleEventSelection = (eventId: string) => {
    const updated = selectedEvents.includes(eventId)
      ? selectedEvents.filter((id) => id !== eventId)
      : [...selectedEvents, eventId];
    setSelectedEvents(updated);
    setPrimary((prev) => ({ ...prev, selected_events: updated }));
  };

  // --- Upload to Cloudinary ---
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (!result.secure_url) throw new Error("Cloudinary upload failed");
    return result.secure_url;
  };

  // --- Submit Registration ---
  const handleSubmit = async () => {
    // --- (MODIFIED) Added check for primary photo ---
    if (!primary.photo) {
      alert("Please upload a photo for the Primary Contact.");
      window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
      return;
    }
    // --- (END MODIFIED) ---

    try {
      setIsSubmitting(true);
  
      // ✅ Include the last participant if fields are filled
      let updatedParticipants = [...participants];
      if (newParticipant.first_name && newParticipant.last_name && newParticipant.gender && newParticipant.photo) {
        updatedParticipants.push(newParticipant);
      }
  
      // ✅ Upload all photos to Cloudinary
      // We know primary.photo exists from the check above
      const primaryPhotoUrl = await uploadToCloudinary(primary.photo);
  
      const participantsWithPhotoUrls = await Promise.all(
        updatedParticipants.map(async (p) => {
          if (!p.photo) {
            // This should not happen if `addParticipant` is used, but it's a good safeguard
            throw new Error(`Photo missing for participant ${p.first_name}`);
          }
          return {
            ...p,
            photo_url: await uploadToCloudinary(p.photo),
          };
        })
      );
  
      // ✅ Send everything to backend
      const res = await fetch("/api/bulk/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primary_contact: { ...primary, photo_url: primaryPhotoUrl },
          participants: participantsWithPhotoUrls,
          txn_id: totalFee > 0 ? txnId : "FREE",
          amount: totalFee,
          selected_events: selectedEvents,
          attend_day1: primary.attend_day1,
          attend_day2: primary.attend_day2,
        }),
      });
  
      const result = await res.json();
      if (res.ok) {
        alert(`Registered ${participantsWithPhotoUrls.length + 1} participants successfully!`);
        router.push("/success?bulk=true");
      } else {
        alert(result.error || "Bulk registration failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading images or saving data. Please ensure all photos are uploaded.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueCategories = ["All", ...new Set(events.map((e) => e.category))];
  const switchDay = (day: string) => {
    setActiveDay(day);
    setCategoryFilter("All");
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-10 text-center text-indigo-900">
        🌟 Bulk Registration - Rang-e-Chinar 2.0
      </h1>

      {/* Primary Contact */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-8">
        <h2 className="text-xl font-semibold text-indigo-800 mb-4">👤 Primary Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input placeholder="First Name*" value={primary.first_name} onChange={(e) => handlePrimaryInput("first_name", e.target.value)} className="border px-3 py-2 rounded-lg" required />
          <input placeholder="Last Name*" value={primary.last_name} onChange={(e) => handlePrimaryInput("last_name", e.target.value)} className="border px-3 py-2 rounded-lg" required />
          <input type="email" placeholder="Email*" value={primary.email} onChange={(e) => handlePrimaryInput("email", e.target.value)} className="border px-3 py-2 rounded-lg" required />
          <input placeholder="Phone*" value={primary.phone} onChange={(e) => handlePrimaryInput("phone", e.target.value)} className="border px-3 py-2 rounded-lg" required />
          <select value={primary.gender} onChange={(e) => handlePrimaryInput("gender", e.target.value)} className="border px-3 py-2 rounded-lg" required>
            <option value="">Select Gender*</option>
            <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
          </select>
          <input placeholder="Organization*" value={primary.organization} onChange={(e) => handlePrimaryInput("organization", e.target.value)} className="border px-3 py-2 rounded-lg" required />
          <input placeholder="State*" value={primary.state} onChange={(e) => handlePrimaryInput("state", e.target.value)} className="border px-3 py-2 rounded-lg" required />
          
          {/* --- (MODIFIED) Photo input with feedback --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Contact Photo*
            </label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handlePrimaryInput("photo", e.target.files?.[0] || null)} 
              className="border px-3 py-2 rounded-lg w-full text-sm" 
              required 
            />
            {!primary.photo && (
              <p className="text-sm text-red-600 mt-1">Photo is required for primary contact.</p>
            )}
          </div>
          {/* --- (END MODIFIED) --- */}
        </div>
      </div>

      {/* Events */}
      <section className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-8">
        <h2 className="text-xl font-semibold text-indigo-800 mb-4">🎯 Select Events for All Participants</h2>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border px-3 py-2 rounded-lg mb-4">
          {uniqueCategories.map((cat) => <option key={cat}>{cat}</option>)}
        </select>
        <div className="flex gap-4 mb-4">
          <button onClick={() => switchDay("1")} className={`px-3 py-2 rounded-md ${activeDay==="1"?"bg-indigo-200 text-indigo-800":"bg-gray-100"}`}>Day 1</button>
          <button onClick={() => switchDay("2")} className={`px-3 py-2 rounded-md ${activeDay==="2"?"bg-indigo-200 text-indigo-800":"bg-gray-100"}`}>Day 2</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => (
            <label key={event.id} className={`border p-4 rounded-xl cursor-pointer transition-all ${selectedEvents.includes(String(event.id))?"bg-indigo-50 border-indigo-300 shadow-sm":"bg-white hover:bg-gray-50"}`}>
              <input type="checkbox" checked={selectedEvents.includes(String(event.id))} onChange={() => handleEventSelection(String(event.id))} className="mr-2" />
              <span className="font-semibold text-gray-800">{event.name}</span>
              <p className="text-sm text-gray-600">{event.description}</p>
              <p className="text-sm font-medium text-gray-700 mt-1">Fee: ₹{event.fee}</p>
            </label>
          ))}
        </div>
      </section>

      {/* Participants */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-8">
        <h2 className="text-xl font-semibold text-indigo-800 mb-4">👥 Manage Participants</h2>
        {participants.map((p,i)=>(
          <div key={i} className="flex justify-between items-center mb-2 border p-2 rounded-lg bg-gray-50">
            <p className="text-gray-800">{p.first_name} {p.last_name} ({p.gender}) - <span className="text-green-600">Photo Added</span></p>
            <button onClick={()=>removeParticipant(i)} className="text-red-600 hover:text-red-800 font-medium text-sm">Remove</button>
          </div>
        ))}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 border-t pt-4">
          <input placeholder="First Name*" value={newParticipant.first_name} onChange={(e)=>setNewParticipant({...newParticipant, first_name:e.target.value})} className="border px-3 py-2 rounded-lg" />
          <input placeholder="Last Name*" value={newParticipant.last_name} onChange={(e)=>setNewParticipant({...newParticipant, last_name:e.target.value})} className="border px-3 py-2 rounded-lg" />
          <select value={newParticipant.gender} onChange={(e)=>setNewParticipant({...newParticipant, gender:e.target.value})} className="border px-3 py-2 rounded-lg">
            <option value="">Select Gender*</option>
            <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
          </select>
          <input type="file" accept="image/*" onChange={(e)=>setNewParticipant({...newParticipant, photo:e.target.files?.[0] || null})} className="border px-3 py-2 rounded-lg text-sm" required />
        </div>
        {/* --- (MODIFIED) Added feedback for new participant photo --- */}
        {newParticipant.first_name && newParticipant.last_name && newParticipant.gender && !newParticipant.photo && (
          <p className="text-sm text-red-600 mt-2">
            Please upload a photo for {newParticipant.first_name} before adding.
          </p>
        )}
        <button onClick={addParticipant} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all">
          + Add Participant
        </button>
      </div>

      {/* Payment */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-8">
        <h2 className="text-xl font-semibold text-indigo-800 mb-4">💳 Payment & Confirmation</h2>
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="flex-1 flex flex-col items-center">
            {upiLink ? (
              <QRCode value={upiLink} size={200} className="mb-2 border p-2 rounded-lg" />
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center border p-2 rounded-lg bg-gray-50 text-gray-500 text-center">
                <p>QR will appear once fee is calculated.</p>
              </div>
            )}
            <p className="font-mono bg-gray-50 py-1 px-3 rounded border border-gray-200 select-all text-indigo-600 mt-2">
              {upiId}
            </p>
            <p className="mt-2 text-2xl font-bold text-indigo-800">Total: ₹{totalFee}</p>
          </div>
          <div className="flex-1">
            <input placeholder="UPI Transaction ID (if applicable)" value={txnId} onChange={(e)=>setTxnId(e.target.value)} className="border px-3 py-2 rounded-lg w-full mb-4" />
            
            {/* --- (MODIFIED) Submit button disabled state --- */}
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !primary.photo} 
              className={`w-full text-white px-4 py-3 rounded-lg font-semibold transition-all ${
                isSubmitting || !primary.photo 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isSubmitting ? "Processing..." : "Confirm Bulk Registration"}
            </button>
            {!primary.photo && (
              <p className="text-sm text-red-600 mt-2 text-center">
                Please upload the Primary Contact's photo to enable submission.
              </p>
            )}
            {/* --- (END MODIFIED) --- */}
          </div>
        </div>
      </div>
    </main>
  );
}