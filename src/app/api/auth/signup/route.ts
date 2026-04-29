import { NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // Check if user exists
    const existing = await db.select().from(userProfiles).where(eq(userProfiles.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);

    const newProfile = await db.insert(userProfiles).values({
      userId,
      email,
      passwordHash,
    }).returning();

    const { passwordHash: _, ...userWithoutPassword } = newProfile[0];
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}