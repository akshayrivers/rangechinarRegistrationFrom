// app/api/events/route.ts
import { supabaseServer } from '@/lib/supabaseServer' // <-- use server client
import { NextResponse } from 'next/server'

export async function GET() {
    const { data, error } = await supabaseServer
        .from('events')           // <-- use supabaseServer here
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
