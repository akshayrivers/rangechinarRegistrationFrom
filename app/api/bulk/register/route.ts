import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// --- Initialize Supabase ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Upload to Cloudinary ---
const uploadToCloudinary = async (file: File | Blob) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!data.secure_url) throw new Error("Cloudinary upload failed");
  return data.secure_url;
};

export async function POST(req: Request) {
  try {
    const {
      primary_contact,
      participants,
      txn_id,
      amount,
      selected_events,
      attend_day1,
      attend_day2,
    } = await req.json();

    // --- Basic validation ---
    if (!primary_contact || !participants) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // --- Upload photos for all participants (including primary) ---
    const allParticipants = [
      primary_contact,
      ...participants,
    ];

    const participantsWithPhotos = await Promise.all(
      allParticipants.map(async (p: any) => ({
        ...p,
        photo_url: p.photo_url || (p.photo ? await uploadToCloudinary(p.photo) : null),
      }))
    );

    // --- Insert into Supabase ---
    const { data, error } = await supabase.from("participants").insert(
      participantsWithPhotos.map((p: any) => ({
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email || primary_contact.email || null,
        phone: p.phone || primary_contact.phone || null,
        organization: p.organization || primary_contact.organization || null,
        state: p.state || primary_contact.state || null,
        txn_id,
        gender: p.gender,
        nit: primary_contact.is_nit_student || false,
        amount,
        Bulk: true,
        participant_category: primary_contact.participant_category || null,
        attend_day1,
        attend_day2,
        vendor: false,
        avatar: null,
        photo_url: p.photo_url || null,
      }))
    );

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Registered ${participantsWithPhotos.length} participants successfully.`,
      data,
    });
  } catch (err: any) {
    console.error("Bulk registration error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}