import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const limit = searchParams.get('limit') || '30';
    
    if (date) {
      // Get specific date's words - try to match just the date part
      const dailyWord = await db.dailyWord.findFirst({
        where: { 
          date: {
            gte: new Date(date + 'T00:00:00.000Z'),
            lt: new Date(date + 'T23:59:59.999Z')
          }
        }
      });
      return NextResponse.json(dailyWord);
    } else {
      // Get recent words
      const dailyWords = await db.dailyWord.findMany({
        orderBy: { date: 'desc' },
        take: parseInt(limit),
        select: {
          id: true,
          date: true,
          word1: true,
          word2: true,
          difficulty: true,
          category: true
        }
      });
      return NextResponse.json(dailyWords);
    }
  } catch (error) {
    console.error('Error fetching daily words:', error);
    return NextResponse.json({ error: 'Failed to fetch daily words' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { date, word1, meaning1, example1, word2, meaning2, example2, difficulty, category } = data;
    
    if (!date || !word1 || !meaning1 || !word2 || !meaning2) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const dailyWord = await db.dailyWord.upsert({
      where: { date: new Date(date) },
      update: { word1, meaning1, example1, word2, meaning2, example2, difficulty, category },
      create: {
        date: new Date(date),
        word1,
        meaning1,
        example1,
        word2,
        meaning2,
        example2,
        difficulty: difficulty || 'medium',
        category
      }
    });
    
    return NextResponse.json(dailyWord);
  } catch (error) {
    console.error('Error creating daily word:', error);
    return NextResponse.json({ error: 'Failed to create daily word' }, { status: 500 });
  }
}