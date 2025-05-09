import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const {
        primary_contact,
        participants,
        txn_id,
        amount,
        selected_events,
        attend_day1,
        attend_day2,
    } = await req.json()

    // Validate required fields
    if (!primary_contact?.email || !primary_contact?.organization || !primary_contact?.participant_category) {
        return NextResponse.json(
            { error: 'Primary contact email, organization, and participant category are required.' },
            { status: 400 }
        )
    }

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
        return NextResponse.json({ error: 'No participants provided.' }, { status: 400 })
    }

    if (!selected_events || !Array.isArray(selected_events) || selected_events.length === 0) {
        return NextResponse.json({ error: 'No events selected.' }, { status: 400 })
    }

    // Check for existing bulk registration
    const { data: existingEmail, error: emailError } = await supabase
        .from('participants')
        .select('id')
        .eq('email', primary_contact.email)
        .eq('Bulk', true)
        .maybeSingle()

    if (emailError) {
        return NextResponse.json(
            { error: 'Error checking existing registration: ' + emailError.message },
            { status: 500 }
        )
    }

    if (existingEmail) {
        return NextResponse.json(
            { error: 'Bulk registration already exists for this email.' },
            { status: 400 }
        )
    }

    // Prepare participants payload with correct attendance data
    const insertPayload = participants.map((p) => ({
        first_name: p.first_name,
        last_name: p.last_name,
        phone: primary_contact.phone.toString(),
        email: primary_contact.email,
        organization: primary_contact.organization,
        state: primary_contact.state,
        gender: p.gender,
        txn_id,
        amount,
        Bulk: true,
        participant_category: primary_contact.participant_category,
        attend_day1: primary_contact.attend_day1,  // Use primary_contact attendance data
        attend_day2: primary_contact.attend_day2,  // Use primary_contact attendance data
    }))

    // Insert participants
    const { data: insertedParticipants, error: insertError } = await supabase
        .from('participants')
        .insert(insertPayload)
        .select('id')

    if (insertError || !insertedParticipants) {
        return NextResponse.json(
            { error: insertError?.message ?? 'Failed to insert participants' },
            { status: 500 }
        )
    }

    // Create event registrations only if events are selected
    if (selected_events && selected_events.length > 0) {
        const eventRegistrations = insertedParticipants.flatMap(participant =>
            selected_events.map(event_id => ({
                event_id,
                participant_id: participant.id
            }))
        )

        const { error: regError } = await supabase
            .from('event_registrations')
            .insert(eventRegistrations)

        if (regError) {
            // Rollback participant insertion if event registration fails
            await supabase
                .from('participants')
                .delete()
                .in('id', insertedParticipants.map(p => p.id))

            return NextResponse.json(
                { error: 'Event registration failed: ' + regError.message },
                { status: 500 }
            )
        }
    }

    return NextResponse.json({
        success: true,
        message: `Registered ${participants.length} participants${selected_events?.length ? ` for ${selected_events.length} events` : ''}`,
        data: {
            transaction_id: txn_id,
            total_amount: amount,
            primary_contact: {
                email: primary_contact.email,
                organization: primary_contact.organization,
                participant_category: primary_contact.participant_category
            }
        }
    })
}