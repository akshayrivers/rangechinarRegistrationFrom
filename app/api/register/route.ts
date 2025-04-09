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
        band_id,
        txn_id,
        selected_events,
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

    // ✅ Check for existing Band ID
    const { data: existingBandID } = await supabase
        .from('participants')
        .select('id')
        .eq('band_id', band_id)
        .maybeSingle()

    if (existingBandID) {
        return NextResponse.json(
            { error: 'This Band ID is already registered.' },
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
                band_id,
                txn_id,
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

    return NextResponse.json({
        success: true,
        message: 'Registration successful',
        details: {
            band_id,
            name: `${first_name} ${last_name}`,
            events_registered: selected_events.length,
        },
    })
}
