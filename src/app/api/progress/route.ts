import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    let progress = await db.userProgress.findUnique({
      where: { userId }
    });
    
    if (!progress) {
      // Create new user progress
      progress = await db.userProgress.create({
        data: {
          userId,
          streak: 0,
          totalWords: 0,
          totalBlogsRead: 0,
          totalQuizzesTaken: 0,
          totalQuizzesCorrect: 0,
          level: 'beginner',
          points: 0,
          dailyGoal: 2,
          notificationsEnabled: true
        }
      });
    }
    
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json({ error: 'Failed to fetch user progress' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userId, activityType, content, points } = data;
    
    if (!userId || !activityType) {
      return NextResponse.json({ error: 'User ID and activity type are required' }, { status: 400 });
    }
    
    // Update user progress
    const progress = await db.userProgress.upsert({
      where: { userId },
      update: {
        lastActive: new Date(),
        points: { increment: points || 0 },
        ...(activityType === 'word_learned' && { totalWords: { increment: 1 } }),
        ...(activityType === 'blog_read' && { totalBlogsRead: { increment: 1 } }),
        ...(activityType === 'quiz_taken' && { totalQuizzesTaken: { increment: 1 } }),
        ...(activityType === 'quiz_correct' && { totalQuizzesCorrect: { increment: 1 } })
      },
      create: {
        userId,
        streak: 0,
        totalWords: activityType === 'word_learned' ? 1 : 0,
        totalBlogsRead: activityType === 'blog_read' ? 1 : 0,
        totalQuizzesTaken: activityType === 'quiz_taken' ? 1 : 0,
        totalQuizzesCorrect: activityType === 'quiz_correct' ? 1 : 0,
        level: 'beginner',
        points: points || 0,
        dailyGoal: 2,
        notificationsEnabled: true
      }
    });
    
    // Log activity
    await db.activity.create({
      data: {
        userId,
        type: activityType,
        content: JSON.stringify(content || {}),
        points: points || 0
      }
    });
    
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating user progress:', error);
    return NextResponse.json({ error: 'Failed to update user progress' }, { status: 500 });
  }
}