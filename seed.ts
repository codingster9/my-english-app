import { db } from '@/lib/db';

export async function seedDatabase() {
  try {
    // Create sample daily words
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    await db.dailyWord.createMany({
      data: [
        {
          date: today,
          word1: 'Eloquent',
          meaning1: 'Fluent or persuasive in speaking or writing',
          example1: 'She gave an eloquent speech at the conference.',
          word2: 'Meticulous',
          meaning2: 'Showing great attention to detail; very careful and precise',
          example2: 'He is meticulous in his research and never misses any details.',
          difficulty: 'medium',
          category: 'vocabulary'
        },
        {
          date: yesterday,
          word1: 'Resilient',
          meaning1: 'Able to withstand or recover quickly from difficult conditions',
          example1: 'The community showed they were resilient after the natural disaster.',
          word2: 'Innovative',
          meaning2: 'Featuring new methods; advanced and original',
          example2: 'The company is known for its innovative approach to technology.',
          difficulty: 'easy',
          category: 'adjectives'
        },
        {
          date: twoDaysAgo,
          word1: 'Ubiquitous',
          meaning1: 'Present, appearing, or found everywhere',
          example1: 'Smartphones have become ubiquitous in modern society.',
          word2: 'Ephemeral',
          meaning2: 'Lasting for a very short time',
          example2: 'The beauty of cherry blossoms is ephemeral, lasting only a few weeks.',
          difficulty: 'hard',
          category: 'vocabulary'
        }
      ]
    });

    // Create sample flashcards
    await db.flashcard.createMany({
      data: [
        {
          front: 'What is the past tense of "go"?',
          back: 'Went',
          category: 'grammar',
          difficulty: 'easy'
        },
        {
          front: 'Define "serendipity"',
          back: 'The occurrence of events by chance in a happy way',
          category: 'vocabulary',
          difficulty: 'medium'
        },
        {
          front: 'Complete: "___ mind the gap"',
          back: 'Please',
          category: 'phrases',
          difficulty: 'easy'
        },
        {
          front: 'What does "procrastinate" mean?',
          back: 'To delay or postpone action; to put off doing something',
          category: 'vocabulary',
          difficulty: 'medium'
        },
        {
          front: 'Choose correct: "He is ___ than his brother." (taller/more tall)',
          back: 'Taller',
          category: 'grammar',
          difficulty: 'easy'
        }
      ]
    });

    // Create sample quizzes
    await db.quiz.createMany({
      data: [
        {
          question: 'Which sentence uses the correct grammar?',
          type: 'multiple_choice',
          options: JSON.stringify(['He don\'t like apples.', 'He doesn\'t like apples.', 'He doesn\'t likes apples.', 'He don\'t likes apples.']),
          correctAnswer: 'He doesn\'t like apples.',
          explanation: 'The correct form is "doesn\'t" for third person singular negative.',
          difficulty: 'easy',
          category: 'grammar',
          points: 1
        },
        {
          question: 'What does the idiom "break a leg" mean?',
          type: 'multiple_choice',
          options: JSON.stringify(['To literally break a leg', 'Good luck', 'To sit down', 'To run fast']),
          correctAnswer: 'Good luck',
          explanation: '"Break a leg" is an idiom used to wish someone good luck, especially before a performance.',
          difficulty: 'medium',
          category: 'idioms',
          points: 2
        },
        {
          question: 'The opposite of "optimistic" is ___.',
          type: 'fill_blank',
          options: JSON.stringify([]),
          correctAnswer: 'pessimistic',
          explanation: 'Pessimistic means having a tendency to see the worst aspect of things or believe that the worst will happen.',
          difficulty: 'medium',
          category: 'vocabulary',
          points: 1
        }
      ]
    });

    // Create sample events
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 7);
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 14);

    await db.event.createMany({
      data: [
        {
          title: 'English Pronunciation Workshop',
          description: 'Join our interactive workshop to improve your English pronunciation and reduce your accent.',
          startDate: futureDate1,
          endDate: new Date(futureDate1.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
          type: 'workshop',
          isOnline: true,
          maxParticipants: 50,
          tags: JSON.stringify(['pronunciation', 'workshop', 'online'])
        },
        {
          title: '30-Day English Challenge',
          description: 'Challenge yourself to speak English every day for 30 days. Win prizes and improve your fluency!',
          startDate: futureDate2,
          endDate: new Date(futureDate2.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days later
          type: 'challenge',
          isOnline: true,
          maxParticipants: 100,
          tags: JSON.stringify(['challenge', 'fluency', '30-days'])
        },
        {
          title: 'Business English Webinar',
          description: 'Learn essential business English phrases and etiquette for professional success.',
          startDate: new Date(futureDate1.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days after first event
          type: 'webinar',
          isOnline: true,
          maxParticipants: 75,
          tags: JSON.stringify(['business', 'professional', 'webinar'])
        }
      ]
    });

    // Create sample blogs
    await db.blog.createMany({
      data: [
        {
          title: '10 Common English Mistakes and How to Avoid Them',
          slug: 'common-english-mistakes',
          content: 'Learning English is a journey, and making mistakes is part of the process. In this article, we\'ll explore 10 common mistakes English learners make and provide practical tips to avoid them...',
          excerpt: 'Discover the most common English learning mistakes and learn how to avoid them for faster progress.',
          category: 'grammar',
          tags: JSON.stringify(['grammar', 'mistakes', 'learning-tips']),
          published: true,
          featured: true,
          readTime: 8
        },
        {
          title: 'How to Build Your English Vocabulary Effectively',
          slug: 'build-vocabulary-effectively',
          content: 'Building a strong vocabulary is essential for fluency in English. This comprehensive guide will show you the most effective strategies to learn and remember new words...',
          excerpt: 'Learn proven strategies to expand your English vocabulary quickly and effectively.',
          category: 'vocabulary',
          tags: JSON.stringify(['vocabulary', 'learning-strategies', 'tips']),
          published: true,
          featured: false,
          readTime: 12
        },
        {
          title: 'The Power of Phrasal Verbs in Everyday English',
          slug: 'power-phrasal-verbs',
          content: 'Phrasal verbs are an essential part of natural English conversation. Mastering them will make your speech sound more native and fluent...',
          excerpt: 'Master phrasal verbs to sound more natural and fluent in English conversations.',
          category: 'vocabulary',
          tags: JSON.stringify(['phrasal-verbs', 'conversation', 'fluency']),
          published: true,
          featured: false,
          readTime: 10
        }
      ]
    });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase();