"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

const registrationSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone must contain only numbers")
    .transform((val) => Number(val)),
  organization: z.string().min(1, "Organization is required"),
  state: z.string().min(1, "State is required"),
  band_id: z.string().min(1, "Band ID is required"),
  selected_events: z
    .array(z.string())
    .min(1, "At least one event must be selected"),
});

type RegistrationData = z.input<typeof registrationSchema>;

interface Event {
  id: string | number;
  name: string;
  description: string;
  sub_category: string;
  fee: number;
  category: string;
}

export default function HomePage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [form, setForm] = useState<RegistrationData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    organization: "",
    state: "",
    band_id: "",
    selected_events: [],
  });

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data: Event[]) => {
        setEvents(data);
        setFilteredEvents(data);
      });
  }, []);

  const handleInput = (key: keyof RegistrationData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleEvent = (id: string | number) => {
    const idStr = String(id);
    setForm((prev) => {
      const updated = prev.selected_events.includes(idStr)
        ? prev.selected_events.filter((e) => e !== idStr)
        : [...prev.selected_events, idStr];
      return { ...prev, selected_events: updated };
    });
  };

  const handleSubmit = () => {
    const result = registrationSchema.safeParse(form);

    if (!result.success) {
      console.error("Validation error:", result.error.format());
      alert(result.error.errors[0].message);
      return;
    }

    const transformedData = result.data;
    console.log("Submitting transformed form:", transformedData);

    localStorage.setItem("registration_data", JSON.stringify(transformedData));
    router.push("/payment");
  };

  const uniqueCategories = ["All", ...new Set(events.map((e) => e.category))];

  useEffect(() => {
    setFilteredEvents(
      categoryFilter === "All"
        ? events
        : events.filter((e) => e.category === categoryFilter)
    );
  }, [categoryFilter, events]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-10 text-center text-blue-800">
        🌟 Techvaganza Event Registration
      </h1>

      {/* Personal Info */}
      <section className="space-y-6 bg-white p-6 rounded-2xl shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700">
          👤 Personal Information
        </h2>

        {(Object.keys(form) as (keyof RegistrationData)[])
          .filter((key) => key !== "selected_events")
          .map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {key.replace("_", " ").toUpperCase()}
              </label>
              <input
                type={key === "phone" ? "tel" : "text"}
                value={form[key] as string}
                onChange={(e) => handleInput(key, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              />
            </div>
          ))}
      </section>

      {/* Event Selection */}
      <section className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">
            🎯 Select Events
          </h2>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
          >
            {uniqueCategories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const eventId = String(event.id);
            return (
              <label
                key={eventId}
                className={`border rounded-xl p-5 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg ${
                  form.selected_events.includes(eventId)
                    ? "bg-blue-50 border-blue-500 ring-2 ring-blue-300"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={form.selected_events.includes(eventId)}
                    onChange={() => toggleEvent(event.id)}
                  />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {event.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {event.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      Sub Category: {event.sub_category}
                    </p>
                    <p className="text-sm text-gray-500">Fee: ₹{event.fee}</p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      <div className="text-center mt-10">
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white text-lg px-6 py-3 rounded-lg shadow-lg"
        >
          ✅ Proceed to Payment
        </button>
      </div>
    </main>
  );
}
