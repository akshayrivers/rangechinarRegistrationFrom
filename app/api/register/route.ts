// app/api/register/route.ts
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
        
    } = await req.json()

    // ✅ Check if UID/email already registered
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

    // ✅ Insert participant including UID
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
                nit: is_nit_student, // Renaming is_nit_student to nit as required
                txn_id,
                amount,
                attend_day1,
                attend_day2,
                participant_category,
                
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

    // ✅ Register event entries
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

    // Create a summary of days attending for the response
    let daysAttending = "";
    if (attend_day1 && attend_day2) {
        daysAttending = "both days";
    } else if (attend_day1) {
        daysAttending = "day 1";
    } else if (attend_day2) {
        daysAttending = "day 2";
    }

    return NextResponse.json({
        success: true,
        message: 'Registration successful',
        details: {
            name: `${first_name} ${last_name}`,
            events_registered: selected_events.length,
            attending: daysAttending,
            total_amount: amount
        },
    })
}