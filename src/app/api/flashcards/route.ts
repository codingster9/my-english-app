import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const limit = searchParams.get('limit') || '20';
    const due = searchParams.get('due'); // for spaced repetition
    
    const where: any = {};
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (due === 'true') {
      where.nextReview = { lte: new Date() };
    }
    
    const flashcards = await db.flashcard.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });
    
    return NextResponse.json(flashcards);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { front, back, category, difficulty, imageUrl, audioUrl } = data;
    
    if (!front || !back) {
      return NextResponse.json({ error: 'Front and back are required' }, { status: 400 });
    }
    
    const flashcard = await db.flashcard.create({
      data: {
        front,
        back,
        category: category || 'vocabulary',
        difficulty: difficulty || 'medium',
        imageUrl,
        audioUrl,
        nextReview: new Date() // due immediately
      }
    });
    
    return NextResponse.json(flashcard);
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return NextResponse.json({ error: 'Failed to create flashcard' }, { status: 500 });
  }
}