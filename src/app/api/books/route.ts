import { NextResponse } from 'next/server';
import { db } from '@/db';
import { books } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  try {
    let allBooks;
    if (userId) {
      // Return public books + user's private books
      // For simplicity, we filter in JS or just fetch all and let client handle
      // But let's be more efficient:
      allBooks = await db.select().from(books).orderBy(desc(books.createdAt));
    } else {
      allBooks = await db.select().from(books).orderBy(desc(books.createdAt));
    }
    return NextResponse.json(allBooks);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, size, date, cover, pdfData, isPublic, userId, isFavorite, isRead } = body;
    
    const newBook = await db.insert(books).values({
      name,
      size,
      date,
      cover,
      pdfData,
      isPublic: isPublic ?? false,
      isFavorite: isFavorite ?? false,
      isRead: isRead ?? false,
      userId: userId ?? 'guest',
    }).returning();

    return NextResponse.json(newBook[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save book' }, { status: 500 });
  }
}