"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { z } from "zod";

const registrationSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z
    .string()
    .length(10, "Phone number must be only 10 digits")
    .regex(/^\d+$/, "Phone must contain only numbers")
    .transform((val) => Number(val)),
  organization: z.string().min(1, "Organization is required"),
  state: z.string().min(1, "State is required"),
  gender: z.string().min(1, "Gender is required"),
  is_nit_student: z.boolean(),
  participant_category: z.string().optional(),
  selected_events: z.array(z.string()),

  agree_to_rules: z.boolean().refine((val) => val === true, {
    message: "You must agree to the event rules",
  }),
  attend_day1: z.boolean().optional(),
  attend_day2: z.boolean().optional(),
});

type PrimaryContactRegistrationData = z.input<typeof registrationSchema>;

interface Event {
  id: string | number;
  name: string;
  description: string;
  sub_category: string;
  fee: number;
  category: string;
  day: string;
}

interface Participant {
  first_name: string;
  last_name: string;
  gender: string;
}

interface PrimaryContact {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  organization: string;
  state: string;
  attend_day1: boolean;
  attend_day2: boolean;
}

const participantCategories = [
  { id: "school", name: "School Student (till Class 10)", fee: 20 },
  { id: "college", name: "College Student (Including Class 11 & 12)", fee: 29 },
  { id: "alumni", name: "NIT Alumni ", fee: 299 },
  { id: "others", name: "Others (With Any govt ID)", fee: 999 },
];

export default function BulkRegistration() {
  const router = useRouter();

  // Event selection state
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [activeDay, setActiveDay] = useState("1");
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  const [showRules, setShowRules] = useState(false);

  // Fee calculation
  const [feePerParticipant, setFeePerParticipant] = useState(0);
  const [entryFee, setEntryFee] = useState(0);
  const [eventsFee, setEventsFee] = useState(0);
  const [totalFee, setTotalFee] = useState(0);

  // Primary contact info
  const [primary, setPrimary] = useState<PrimaryContactRegistrationData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    organization: "",
    state: "",
    gender: "",
    is_nit_student: false,
    participant_category: "college", // Default to college student
    selected_events: [],
    agree_to_rules: false,
    attend_day1: true,
    attend_day2: false,
  });

  // Participants
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipant, setNewParticipant] = useState<Participant>({
    first_name: "",
    last_name: "",
    gender: "",
  });

  // Payment
  const [txnId, setTxnId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upiLink, setUpiLink] = useState("");
  const upiId = "jkbmerc00173818@jkb";

  // Calculate total participants (including primary contact)
  const totalParticipants = participants.length + 1;

  // Load events
  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data: Event[]) => {
        setEvents(data);
        setFilteredEvents(
          data.filter((event) => event.day.includes(activeDay))
        );
      });
  }, []);

  // Auto-select days based on selected events
  useEffect(() => {
    if (selectedEvents.length > 0) {
      // Check if any selected event requires day1 or day2
      let needsDay1 = false;
      let needsDay2 = false;

      selectedEvents.forEach(eventId => {
        const event = events.find(e => String(e.id) === eventId);
        if (!event) return;

        if (event.day.includes("1")) needsDay1 = true;
        if (event.day.includes("2")) needsDay2 = true;
      });

      // Update day selection based on events
      setPrimary(prev => ({
        ...prev,
        attend_day1: needsDay1 ? true : prev.attend_day1,
        attend_day2: needsDay2 ? true : prev.attend_day2
      }));
    }
  }, [selectedEvents, events]);

  // Filter events based on selected day and category
  useEffect(() => {
    setFilteredEvents(
      events
        .filter((e) => e.day.includes(activeDay))
        .filter((e) =>
          categoryFilter === "All" ? true : e.category === categoryFilter
        )
    );
  }, [categoryFilter, events, activeDay]);

  // Helper function to check if an event is a haunted house event
  const isHauntedHouseEvent = (event: Event) => {
    return event.name.toLowerCase().includes("haunted house");
  };

  // Fee calculation logic with day-based pricing
  useEffect(() => {
    // Initialize event fees
    let newEventsFee = 0;
    let newEntryFee = 0;
    
    // Calculate entry fee based on participant category and selected days
    if (!primary.is_nit_student) {
      const selectedCategory = participantCategories.find(
        (cat) => cat.id === primary.participant_category
      );
      
      if (selectedCategory) {
        // Calculate entry fee based on which days are selected
        if (primary.attend_day1 && primary.attend_day2) {
          // Both days selected - charge full fee (2x)
          newEntryFee = selectedCategory.fee * 2;
        } else if (primary.attend_day1 || primary.attend_day2) {
          // One day selected - charge single day fee (1x)
          newEntryFee = selectedCategory.fee;
        }
      }
    }

    // Calculate event fees if events are selected
    if (selectedEvents.length > 0) {
      const selectedEventObjs = events.filter((event) =>
        selectedEvents.includes(String(event.id))
      );

      if (primary.is_nit_student) {
        // For NIT students: Charge for Workshop category AND Haunted House events
        newEventsFee = selectedEventObjs
          .filter(
            (event) =>
              event.category === "Workshop" || isHauntedHouseEvent(event)
          )
          .reduce((sum, ev) => sum + ev.fee, 0);
      } else {
        // For non-NIT participants: Charge for event fees
        newEventsFee = selectedEventObjs.reduce((sum, ev) => sum + ev.fee, 0);
      }
    }

    const fee = newEventsFee + newEntryFee;
    setEventsFee(newEventsFee);
    setEntryFee(newEntryFee);
    setFeePerParticipant(fee);
    setTotalFee(fee * totalParticipants);

    if (fee * totalParticipants > 0) {
      setUpiLink(
        `upi://pay?pa=${upiId}&pn=Rang-e-chinar&am=${
          fee * totalParticipants
        }&cu=INR&tn=Bulk Registration`
      );
    } else {
      setUpiLink("");
    }
  }, [
    selectedEvents,
    events,
    totalParticipants,
    primary.is_nit_student,
    primary.participant_category,
    primary.attend_day1,
    primary.attend_day2,
  ]);

  const handleInput = (
    key: keyof PrimaryContactRegistrationData,
    value: string | boolean
  ) => {
    setPrimary((prev) => ({ ...prev, [key]: value }));
  };

  // Add participant
  const addParticipant = () => {
    if (
      !newParticipant.first_name ||
      !newParticipant.last_name ||
      !newParticipant.gender
    ) {
      alert("Fill all participant fields correctly.");
      return;
    }
    setParticipants([...participants, newParticipant]);
    setNewParticipant({
      first_name: "",
      last_name: "",
      gender: "",
    });
  };

  // Remove participant
  const removeParticipant = (idx: number) => {
    setParticipants(participants.filter((_, i) => i !== idx));
  };

  // Handle event selection
  const handleEventSelection = (eventId: string) => {
    const event = events.find(e => String(e.id) === eventId);
    if (!event) return;
    
    // Get current selected events
    let updatedSelectedEvents;
    if (selectedEvents.includes(eventId)) {
      // Remove the event if it's already selected
      updatedSelectedEvents = selectedEvents.filter(id => id !== eventId);
    } else {
      // Add the event if it's not selected
      updatedSelectedEvents = [...selectedEvents, eventId];
    }
    
    // Update selected events
    setSelectedEvents(updatedSelectedEvents);
    setPrimary(prev => ({ ...prev, selected_events: updatedSelectedEvents }));
  };

  // Submit bulk registration (includes primary contact as participant)
  const handleSubmit = async () => {
    if (
      !primary.first_name ||
      !primary.last_name ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(primary.email) ||
      !/^\d{10}$/.test(primary.phone) ||
      !primary.gender ||
      !primary.organization ||
      !primary.state
    ) {
      alert("Fill all primary contact fields correctly.");
      return;
    }
    if (participants.length === 0) {
      alert("Add at least one participant.");
      return;
    }
    if (selectedEvents.length === 0) {
      alert("Select at least one event.");
      return;
    }
    if (totalFee > 0 && !txnId) {
      alert("Enter transaction ID.");
      return;
    }

    setIsSubmitting(true);

    // Prepare participant list: primary contact first, then others
    const allParticipants: Participant[] = [
      {
        first_name: primary.first_name,
        last_name: primary.last_name,
        gender: primary.gender,
      },
      ...participants,
    ];

    try {
      const res = await fetch("/api/bulk/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primary_contact: primary,
          participants: allParticipants,
          txn_id: totalFee > 0 ? txnId : "FREE",
          amount: totalFee,
          selected_events: selectedEvents,
          attend_day1: primary.attend_day1,
          attend_day2: primary.attend_day2,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        router.push("/success?bulk=true");
      } else {
        alert(result.error || "Bulk registration failed.");
        setIsSubmitting(false);
      }
    } catch (e) {
      alert("Network error.");
      setIsSubmitting(false);
    }
  };

  const uniqueCategories = ["All", ...new Set(events.map((e) => e.category))];
  const switchDay = (day: string) => {
    setActiveDay(day);
    setCategoryFilter("All");
  };

  const isZeroFee = feePerParticipant === 0;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-10 text-center text-indigo-900">
        🌟 Bulk Registration - Rang-e-Chinar 2.0
      </h1>

      {/* Primary Contact Information */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-8">
        <h2 className="text-xl font-semibold text-indigo-800 mb-4">
          <span className="mr-2">👤</span> Primary Contact Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name*
            </label>
            <input
              type="text"
              value={primary.first_name}
              onChange={(e) =>
                setPrimary({ ...primary, first_name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="First name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name*
            </label>
            <input
              type="text"
              value={primary.last_name}
              onChange={(e) =>
                setPrimary({ ...primary, last_name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Last name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email*
            </label>
            <input
              type="email"
              value={primary.email}
              onChange={(e) =>
                setPrimary({ ...primary, email: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone* (10 digits)
            </label>
            <input
              type="tel"
              value={primary.phone}
              onChange={(e) =>
                setPrimary({ ...primary, phone: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="10-digit number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender*
            </label>
            <select
              value={primary.gender}
              onChange={(e) =>
                setPrimary({
                  ...primary,
                  gender: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization*
            </label>
            <input
              type="text"
              value={primary.organization}
              onChange={(e) =>
                setPrimary({ ...primary, organization: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Organization name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State*
            </label>
            <input
              type="text"
              value={primary.state}
              onChange={(e) =>
                setPrimary({ ...primary, state: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="State"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center">
            <div className="flex items-center mr-6 mb-2 sm:mb-0">
              <input
                type="checkbox"
                id="is_nit_student"
                checked={primary.is_nit_student}
                onChange={(e) =>
                  handleInput("is_nit_student", e.target.checked)
                }
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 mr-2"
              />
              <label
                htmlFor="is_nit_student"
                className="text-sm font-medium text-gray-700"
              >
                NIT Srinagar Student
              </label>
            </div>

            {/* Participant Category Dropdown - Only show when not an NIT student */}
            {!primary.is_nit_student && (
              <div className="w-full">
                <select
                  value={primary.participant_category}
                  onChange={(e) =>
                    handleInput("participant_category", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all text-sm"
                >
                  {participantCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} - ₹{category.fee} per day
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {/* Day selection checkboxes */}
          <div className="col-span-1 sm:col-span-2 mt-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <p className="text-sm font-medium text-gray-700">
                Select Days to Attend:
              </p>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="attend_day1"
                    checked={primary.attend_day1}
                    onChange={(e) =>
                      handleInput("attend_day1", e.target.checked)
                    }
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 mr-2"
                  />
                  <label
                    htmlFor="attend_day1"
                    className="text-sm font-medium text-gray-700"
                  >
                    Day 1
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="attend_day2"
                    checked={primary.attend_day2}
                    onChange={(e) =>
                      handleInput("attend_day2", e.target.checked)
                    }
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 mr-2"
                  />
                  <label
                    htmlFor="attend_day2"
                    className="text-sm font-medium text-gray-700"
                  >
                    Day 2
                  </label>
                </div>
              </div>
              <div className="text-sm text-indigo-600">
                {primary.attend_day1 && primary.attend_day2 ? 
                  "Entry fee for both days: 2x rate" : 
                  "Entry fee for one day: base rate"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Selection */}
      <section className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-xl font-semibold text-indigo-800 flex items-center mb-2 sm:mb-0">
            <span className="mr-2">🎯</span> Select Events for All Participants
          </h2>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {uniqueCategories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => switchDay("1")}
            className={`py-2 px-4 font-medium transition-all ${
              activeDay === "1"
                ? "border-b-2 border-indigo-500 text-indigo-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Day 1
          </button>
          <button
            onClick={() => switchDay("2")}
            className={`py-2 px-4 font-medium transition-all ${
              activeDay === "2"
                ? "border-b-2 border-indigo-500 text-indigo-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Day 2
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredEvents.map((event) => {
            const eventId = String(event.id);
            
            return (
              <label
                key={eventId}
                className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedEvents.includes(eventId)
                    ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200"
                    : "bg-white border-gray-200 hover:border-indigo-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 text-indigo-600 rounded"
                    checked={selectedEvents.includes(eventId)}
                    onChange={() => handleEventSelection(eventId)}
                  />
                  <div>
                    <h3 className="font-bold text-lg text-indigo-900">
                      {event.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {event.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Category:</span>{" "}
                      {event.sub_category}
                    </p>
                    <p className="text-sm font-medium text-indigo-600">
                      Fee: ₹{event.fee}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Day: {event.day.includes("1") && event.day.includes("2") ? "Both days" : 
                            event.day.includes("1") ? "Day 1" : "Day 2"}
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
        <div className="mt-4 bg-indigo-50 p-3 rounded-lg">
          <p className="text-sm text-indigo-600">
            All participants in this bulk registration will be registered for
            the same events. Days will be auto-selected based on your event choices.
          </p>
        </div>
      </section>

      {/* Participant Management Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-8">
        <h2 className="text-xl font-semibold text-indigo-800 mb-4">
          <span className="mr-2">👥</span> Manage Participants
        </h2>
        {participants.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">
              Added Participants ({participants.length})
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {participants.map((participant, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {participant.first_name} {participant.last_name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {participant.gender}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => removeParticipant(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-3">
            Add New Participant
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name*
              </label>
              <input
                type="text"
                value={newParticipant.first_name}
                onChange={(e) =>
                  setNewParticipant({
                    ...newParticipant,
                    first_name: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name*
              </label>
              <input
                type="text"
                value={newParticipant.last_name}
                onChange={(e) =>
                  setNewParticipant({
                    ...newParticipant,
                    last_name: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Last name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender*
              </label>
              <select
                value={newParticipant.gender}
                onChange={(e) =>
                  setNewParticipant({
                    ...newParticipant,
                    gender: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={addParticipant}
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700"
            >
              Add Participant
            </button>
          </div>
        </div>
      </div>
      {/* Fee Summary */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-8">
        <h2 className="text-xl font-semibold text-indigo-800 mb-4">
          Fee Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Entry Fee</p>
            <p className="text-2xl font-bold text-indigo-700">₹{entryFee}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Events Fee</p>
            <p className="text-2xl font-bold text-indigo-700">₹{eventsFee}</p>
          </div>
          <div className="bg-indigo-100 p-4 rounded-lg">
            <p className="text-sm text-gray-700">Total per Participant</p>
            <p className="text-2xl font-bold text-indigo-900">
              ₹{feePerParticipant}
            </p>
          </div>
        </div>
        <div className="mt-4 bg-amber-50 p-3 rounded-lg">
          <p className="font-medium text-amber-700 text-center">
            Total Fee for {totalParticipants} Participants (including primary
            contact): ₹{totalFee}
          </p>
        </div>
      </div>
      {/* Payment Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-8">
        <h2 className="text-xl font-semibold text-indigo-800 flex items-center mb-4">
          <span className="mr-2">💳</span> Payment
        </h2>
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="flex-1 sm:border-r sm:pr-8 border-gray-200">
            <h3 className="font-medium text-gray-700 mb-3">
              Scan QR Code to Pay
            </h3>
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
              <div className="mt-2 bg-amber-50 p-3 rounded-lg text-sm w-full">
                <p className="font-medium text-amber-700">
                  Bulk Payment: ₹{totalFee} (₹{feePerParticipant} ×{" "}
                  {totalParticipants} participants)
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-700 mb-3">Verify Payment</h3>
            <div className="space-y-6">
              <div>
                <p className="text-gray-600 mb-2">
                  Once you've made the payment, enter the UPI transaction ID to
                  complete your bulk registration.
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UPI Transaction ID
                </label>
                <input
                  type="text"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="Enter UPI Transaction ID"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting || !txnId.trim() || participants.length === 0
                }
                className={`w-full bg-indigo-600 text-white py-3 rounded-lg font-medium transition-all
                  ${
                    isSubmitting || !txnId.trim() || participants.length === 0
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-indigo-700"
                  }`}
              >
                {isSubmitting ? "Processing..." : "Confirm Bulk Registration"}
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