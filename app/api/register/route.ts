import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const {
        first_name,
        last_name,
        email,
        phone,
        organization,
        state,
        gender,
        is_nit_student,
        txn_id,
        selected_events,
        amount,
        attend_day1,
        attend_day2,
        participant_category,
        photo_url,
        "SPOC NAME": SPOC_NAME, // ✅ new field
        "SPOC PHONE": SPOC_PHONE, // ✅ new field
        "SPOC EMAIL": SPOC_EMAIL, // ✅ new field
        "INSTITUTE NAME": INSTITUTE_NAME, // ✅ new field
    } = await req.json()

    // ✅ Check if email already registered
    const { data: existingEmail } = await supabase
        .from('participants')
        .select('id')
        .eq('email', email)
        .maybeSingle()

    if (existingEmail) {
        return NextResponse.json(
            { error: 'This email is already registered.' },
            { status: 400 }
        )
    }

    // ✅ Insert participant including photo URL and SPOC data
    const { data: participant, error: insertError } = await supabase
        .from('participants')
        .insert([
            {
                first_name,
                last_name,
                email,
                phone,
                organization,
                state,
                gender,
                nit: is_nit_student,
                txn_id,
                amount,
                attend_day1,
                attend_day2,
                participant_category,
                photo_url,
                "SPOC NAME": SPOC_NAME, // ✅ added here
                "SPOC PHONE": SPOC_PHONE, // ✅ added here
                "SPOC EMAIL": SPOC_EMAIL, // ✅ added here
                "INSTITUTE NAME": INSTITUTE_NAME, // ✅ added here
            },
        ])
        .select()
        .single()

    if (insertError || !participant) {
        return NextResponse.json(
            { error: insertError?.message ?? 'Failed to insert participant.' },
            { status: 500 }
        )
    }

    // ✅ Register selected events
    const registrations = selected_events.map((event_id: string) => ({
        event_id,
        participant_id: participant.id,
    }))

    const { error: regError } = await supabase
        .from('event_registrations')
        .insert(registrations)

    if (regError) {
        return NextResponse.json({ error: regError.message }, { status: 500 })
    }

    // ✅ Days attending summary
    let daysAttending = ""
    if (attend_day1 && attend_day2) {
        daysAttending = "both days"
    } else if (attend_day1) {
        daysAttending = "day 1"
    } else if (attend_day2) {
        daysAttending = "day 2"
    }

    return NextResponse.json({
        success: true,
        message: 'Registration successful',
        details: {
            name: `${first_name} ${last_name}`,
            events_registered: selected_events.length,
            attending: daysAttending,
            total_amount: amount,
        },
    })
}