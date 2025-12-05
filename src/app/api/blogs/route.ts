import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') || '10';
    
    const where: any = {};
    if (published !== null) where.published = published === 'true';
    if (featured === 'true') where.featured = true;
    if (category) where.category = category;
    
    const blogs = await db.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        tags: true,
        featured: true,
        readTime: true,
        createdAt: true
      }
    });
    
    // Parse JSON strings for tags
    const parsedBlogs = blogs.map(blog => ({
      ...blog,
      tags: JSON.parse(blog.tags || '[]')
    }));
    
    return NextResponse.json(parsedBlogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { title, slug, content, excerpt, coverImage, category, tags, published, featured, readTime } = data;
    
    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const blog = await db.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        category: category || 'vocabulary',
        tags: JSON.stringify(tags || []),
        published: published || false,
        featured: featured || false,
        readTime: readTime || null
      }
    });
    
    return NextResponse.json({
      ...blog,
      tags: JSON.parse(blog.tags)
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}