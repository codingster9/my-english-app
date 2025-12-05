import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const type = searchParams.get('type');
    const limit = searchParams.get('limit') || '10';
    
    const where: any = {};
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (type) where.type = type;
    
    const quizzes = await db.quiz.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });
    
    // Parse JSON strings for options
    const parsedQuizzes = quizzes.map(quiz => ({
      ...quiz,
      options: JSON.parse(quiz.options || '[]')
    }));
    
    return NextResponse.json(parsedQuizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { question, type, options, correctAnswer, explanation, difficulty, category, points } = data;
    
    if (!question || !type || !correctAnswer) {
      return NextResponse.json({ error: 'Question, type, and correct answer are required' }, { status: 400 });
    }
    
    const quiz = await db.quiz.create({
      data: {
        question,
        type: type || 'multiple_choice',
        options: JSON.stringify(options || []),
        correctAnswer,
        explanation,
        difficulty: difficulty || 'medium',
        category: category || 'vocabulary',
        points: points || 1
      }
    });
    
    return NextResponse.json({
      ...quiz,
      options: JSON.parse(quiz.options)
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
  }
}