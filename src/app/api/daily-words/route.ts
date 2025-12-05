import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// FORCE DYNAMIC: This tells Next.js to never cache this data.
// It will fetch fresh data from Neon every single time.
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const words = await prisma.dailyWord.findMany({
      orderBy: { date: 'desc' },
      take: limit,
    });

    // If no words found, return empty array instead of crashing
    if (!words) return NextResponse.json([]);

    return NextResponse.json(words);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // NUCLEAR FIX: No admin check. Just save.
    
    if (body.id) {
      // UPDATE existing
      const updatedWord = await prisma.dailyWord.update({
        where: { id: body.id },
        data: {
          date: new Date(body.date),
          word1: body.word1,
          meaning1: body.meaning1,
          example1: body.example1,
          word2: body.word2,
          meaning2: body.meaning2,
          example2: body.example2,
          difficulty: body.difficulty,
          category: body.category,
        },
      });
      return NextResponse.json(updatedWord);
    } else {
      // CREATE new
      const newWord = await prisma.dailyWord.create({
        data: {
          date: new Date(body.date),
          word1: body.word1,
          meaning1: body.meaning1,
          example1: body.example1,
          word2: body.word2,
          meaning2: body.meaning2,
          example2: body.example2,
          difficulty: body.difficulty,
          category: body.category,
        },
      });
      return NextResponse.json(newWord);
    }

  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: 'Database failed to save' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.dailyWord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
