// app/api/register/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const data = await req.json();

  console.log('Received mock registration:', data); // You’ll see it in the terminal

  return NextResponse.json({ success: true, message: 'Mock registration complete' });
}
