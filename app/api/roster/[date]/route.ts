import { NextResponse } from 'next/server';

export async function GET() {
	return NextResponse.json({ success: true, message: 'Roster by date API endpoint placeholder' });
}
