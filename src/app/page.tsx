'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Calendar, BookOpen, Trophy, Target, Sparkles, Clock, Users, Star, Zap, Brain, Heart } from 'lucide-react';

interface DailyWord {
  id: string;
  date: string;
  word1: string;
  meaning1: string;
  example1?: string;
  word2: string;
  meaning2: string;
  example2?: string;
  difficulty: string;
  category?: string;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  featured: boolean;
  readTime: number;
  createdAt: string;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
  difficulty: string;
}

interface Quiz {
  id: string;
  question: string;
  type: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: string;
  points: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  type: string;
  isOnline: boolean;
  tags: string[];
}

interface UserProgress {
  userId: string;
  streak: number;
  totalWords: number;
  totalBlogsRead: number;
  totalQuizzesTaken: number;
  totalQuizzesCorrect: number;
  level: string;
  points: number;
  dailyGoal: number;
}

export default function Home() {
  const [dailyWord, setDailyWord] = useState<DailyWord | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showFlashcardBack, setShowFlashcardBack] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || 'user_' + Date.now() : 'user_' + Date.now();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', userId);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch today's words
      const today = new Date().toISOString().split('T')[0];
      const wordResponse = await fetch(`/api/daily-words?date=${today}`);
      if (wordResponse.ok) {
        const wordData = await wordResponse.json();
        setDailyWord(wordData);
      }

      // Fetch blogs
      const blogsResponse = await fetch('/api/blogs?published=true&limit=3');
      if (blogsResponse.ok) {
        const blogsData = await blogsResponse.json();
        setBlogs(blogsData);
      }

      // Fetch flashcards
      const flashcardsResponse = await fetch('/api/flashcards?limit=5');
      if (flashcardsResponse.ok) {
        const flashcardsData = await flashcardsResponse.json();
        setFlashcards(flashcardsData);
      }

      // Fetch quizzes
      const quizzesResponse = await fetch('/api/quizzes?limit=3');
      if (quizzesResponse.ok) {
        const quizzesData = await quizzesResponse.json();
        setQuizzes(quizzesData);
      }

      // Fetch events
      const eventsResponse = await fetch('/api/events?upcoming=true&limit=3');
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData);
      }

      // Fetch user progress
      const progressResponse = await fetch(`/api/progress?userId=${userId}`);
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setUserProgress(progressData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markWordAsLearned = async () => {
    if (!dailyWord) return;
    
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          activityType: 'word_learned',
          content: { words: [dailyWord.word1, dailyWord.word2] },
          points: 10
        })
      });
      fetchData(); // Refresh progress
    } catch (error) {
      console.error('Error marking word as learned:', error);
    }
  };

  const nextFlashcard = () => {
    setShowFlashcardBack(false);
    setCurrentFlashcardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const submitQuizAnswer = async () => {
    if (!quizzes[currentQuizIndex]) return;
    
    const isCorrect = selectedAnswer === quizzes[currentQuizIndex].correctAnswer;
    if (isCorrect) setQuizScore(quizScore + 1);
    
    setShowQuizResult(true);
    
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          activityType: isCorrect ? 'quiz_correct' : 'quiz_taken',
          content: { quizId: quizzes[currentQuizIndex].id, correct: isCorrect },
          points: isCorrect ? quizzes[currentQuizIndex].points : 0
        })
      });
    } catch (error) {
      console.error('Error submitting quiz answer:', error);
    }
  };

  const nextQuiz = () => {
    setShowQuizResult(false);
    setSelectedAnswer('');
    setCurrentQuizIndex((prev) => (prev + 1) % quizzes.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center py-8 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-pink-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Daily English Learning
            </h1>
            <Heart className="h-8 w-8 text-pink-500" />
          </div>
          <p className="text-gray-600 text-lg">Learn 2 words daily • Flashcards • Quizzes • Blogs • Events</p>
          
          {/* User Progress Bar */}
          {userProgress && (
            <Card className="mt-6 max-w-md mx-auto">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Daily Progress</span>
                  <Badge variant="secondary">{userProgress.points} points</Badge>
                </div>
                <Progress value={(userProgress.totalWords % userProgress.dailyGoal) / userProgress.dailyGoal * 100} className="mb-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>🔥 {userProgress.streak} day streak</span>
                  <span>Level: {userProgress.level}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </header>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="blogs" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Blogs
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Events
            </TabsTrigger>
          </TabsList>

          {/* Daily Words Tab */}
          <TabsContent value="daily">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Today's Words - {new Date().toLocaleDateString()}
                </CardTitle>
                <CardDescription>Learn and practice today's vocabulary</CardDescription>
              </CardHeader>
              <CardContent>
                {dailyWord ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="text-xl font-bold text-blue-800 mb-2">{dailyWord.word1}</h3>
                        <p className="text-blue-600 mb-2">{dailyWord.meaning1}</p>
                        {dailyWord.example1 && (
                          <p className="text-sm text-gray-600 italic">Example: {dailyWord.example1}</p>
                        )}
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h3 className="text-xl font-bold text-green-800 mb-2">{dailyWord.word2}</h3>
                        <p className="text-green-600 mb-2">{dailyWord.meaning2}</p>
                        {dailyWord.example2 && (
                          <p className="text-sm text-gray-600 italic">Example: {dailyWord.example2}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button onClick={markWordAsLearned} className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Mark as Learned (+10 points)
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No words available for today. Check back later!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Flashcards - Spaced Repetition
                </CardTitle>
                <CardDescription>Review vocabulary with smart flashcards</CardDescription>
              </CardHeader>
              <CardContent>
                {flashcards.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-center text-sm text-gray-500">
                      Card {currentFlashcardIndex + 1} of {flashcards.length}
                    </div>
                    <div 
                      className="min-h-[200px] flex items-center justify-center p-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg cursor-pointer"
                      onClick={() => setShowFlashcardBack(!showFlashcardBack)}
                    >
                      <div className="text-center">
                        <p className="text-lg font-medium">
                          {showFlashcardBack ? flashcards[currentFlashcardIndex].back : flashcards[currentFlashcardIndex].front}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          {showFlashcardBack ? 'Answer' : 'Question'} (Click to flip)
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" onClick={nextFlashcard}>
                        Next Card
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No flashcards available yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Quick Quiz - Test Your Knowledge
                </CardTitle>
                <CardDescription>Challenge yourself with interactive quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                {quizzes.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-center text-sm text-gray-500">
                      Question {currentQuizIndex + 1} of {quizzes.length} • Score: {quizScore}
                    </div>
                    <div className="p-6 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">{quizzes[currentQuizIndex].question}</h3>
                      {quizzes[currentQuizIndex].type === 'multiple_choice' && (
                        <div className="space-y-2">
                          {quizzes[currentQuizIndex].options.map((option, index) => (
                            <label key={index} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="quiz-answer"
                                value={option}
                                checked={selectedAnswer === option}
                                onChange={(e) => setSelectedAnswer(e.target.value)}
                                disabled={showQuizResult}
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {showQuizResult && (
                      <div className={`p-4 rounded-lg ${selectedAnswer === quizzes[currentQuizIndex].correctAnswer ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className="font-medium">
                          {selectedAnswer === quizzes[currentQuizIndex].correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Correct answer: {quizzes[currentQuizIndex].correctAnswer}
                        </p>
                        {quizzes[currentQuizIndex].explanation && (
                          <p className="text-sm text-gray-500 mt-1">{quizzes[currentQuizIndex].explanation}</p>
                        )}
                      </div>
                    )}
                    <div className="flex justify-center">
                      {!showQuizResult ? (
                        <Button onClick={submitQuizAnswer} disabled={!selectedAnswer}>
                          Submit Answer
                        </Button>
                      ) : (
                        <Button onClick={nextQuiz}>Next Question</Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No quizzes available yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blogs Tab */}
          <TabsContent value="blogs">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Card key={blog.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{blog.category}</Badge>
                      {blog.featured && <Star className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <CardTitle className="text-lg">{blog.title}</CardTitle>
                    <CardDescription>{blog.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {blog.readTime} min read
                      </span>
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{event.type}</Badge>
                      {event.isOnline && <Zap className="h-4 w-4 text-blue-500" />}
                    </div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>📅 {new Date(event.startDate).toLocaleDateString()}</p>
                      {event.endDate && <p>🏁 {new Date(event.endDate).toLocaleDateString()}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}