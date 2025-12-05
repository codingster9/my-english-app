import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const upcoming = searchParams.get('upcoming');
    const limit = searchParams.get('limit') || '10';
    
    const where: any = {};
    if (type) where.type = type;
    if (upcoming === 'true') {
      where.startDate = { gte: new Date() };
    }
    
    const events = await db.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      take: parseInt(limit)
    });
    
    // Parse JSON strings for tags
    const parsedEvents = events.map(event => ({
      ...event,
      tags: JSON.parse(event.tags || '[]')
    }));
    
    return NextResponse.json(parsedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { title, description, startDate, endDate, type, isOnline, maxParticipants, tags } = data;
    
    if (!title || !description || !startDate) {
      return NextResponse.json({ error: 'Title, description, and start date are required' }, { status: 400 });
    }
    
    const event = await db.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        type: type || 'webinar',
        isOnline: isOnline !== undefined ? isOnline : true,
        maxParticipants,
        tags: JSON.stringify(tags || [])
      }
    });
    
    return NextResponse.json({
      ...event,
      tags: JSON.parse(event.tags)
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}