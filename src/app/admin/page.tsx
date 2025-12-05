'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

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
  content: string;
  excerpt?: string;
  coverImage?: string;
  category: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  readTime?: number;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
  difficulty: string;
  imageUrl?: string;
  audioUrl?: string;
}

interface Quiz {
  id: string;
  question: string;
  type: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: string;
  category?: string;
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
  maxParticipants?: number;
  tags: string[];
}

export default function AdminPanel() {
  const [dailyWords, setDailyWords] = useState<DailyWord[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [wordsRes, blogsRes, cardsRes, quizzesRes, eventsRes] = await Promise.all([
        fetch('/api/daily-words?limit=50'),
        fetch('/api/blogs?limit=50'),
        fetch('/api/flashcards?limit=50'),
        fetch('/api/quizzes?limit=50'),
        fetch('/api/events?limit=50')
      ]);

      if (wordsRes.ok) setDailyWords(await wordsRes.json());
      if (blogsRes.ok) setBlogs(await blogsRes.json());
      if (cardsRes.ok) setFlashcards(await cardsRes.json());
      if (quizzesRes.ok) setQuizzes(await quizzesRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDailyWord = async (word: Partial<DailyWord>) => {
    try {
      const response = await fetch('/api/daily-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(word)
      });
      if (response.ok) {
        setEditingItem(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving daily word:', error);
    }
  };

  const saveBlog = async (blog: Partial<Blog>) => {
    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blog)
      });
      if (response.ok) {
        setEditingItem(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving blog:', error);
    }
  };

  const saveFlashcard = async (card: Partial<Flashcard>) => {
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card)
      });
      if (response.ok) {
        setEditingItem(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving flashcard:', error);
    }
  };

  const saveQuiz = async (quiz: Partial<Quiz>) => {
    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quiz)
      });
      if (response.ok) {
        setEditingItem(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
    }
  };

  const saveEvent = async (event: Partial<Event>) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      if (response.ok) {
        setEditingItem(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Manage your English learning platform content</p>
        </header>

        <Tabs defaultValue="daily-words" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="daily-words">Daily Words</TabsTrigger>
            <TabsTrigger value="blogs">Blogs</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          {/* Daily Words Management */}
          <TabsContent value="daily-words">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Add New Daily Words</CardTitle>
                    <Button onClick={() => setEditingItem({ type: 'daily-word' })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Words
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {editingItem?.type === 'daily-word' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Daily Words</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={editingItem.date || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select value={editingItem.difficulty || 'medium'} onValueChange={(value) => setEditingItem({ ...editingItem, difficulty: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="word1">Word 1</Label>
                        <Input
                          id="word1"
                          value={editingItem.word1 || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, word1: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="word2">Word 2</Label>
                        <Input
                          id="word2"
                          value={editingItem.word2 || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, word2: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="meaning1">Meaning 1</Label>
                        <Input
                          id="meaning1"
                          value={editingItem.meaning1 || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, meaning1: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="meaning2">Meaning 2</Label>
                        <Input
                          id="meaning2"
                          value={editingItem.meaning2 || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, meaning2: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="example1">Example 1</Label>
                        <Textarea
                          id="example1"
                          value={editingItem.example1 || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, example1: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="example2">Example 2</Label>
                        <Textarea
                          id="example2"
                          value={editingItem.example2 || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, example2: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={() => saveDailyWord(editingItem)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingItem(null)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Existing Daily Words</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dailyWords.map((word) => (
                      <div key={word.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{new Date(word.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{word.word1} • {word.word2}</p>
                          <Badge variant="secondary">{word.difficulty}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingItem(word)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Flashcards Management */}
          <TabsContent value="flashcards">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Add New Flashcard</CardTitle>
                    <Button onClick={() => setEditingItem({ type: 'flashcard' })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Flashcard
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {editingItem?.type === 'flashcard' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Flashcard</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="front">Front (Question)</Label>
                      <Textarea
                        id="front"
                        value={editingItem.front || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, front: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="back">Back (Answer)</Label>
                      <Textarea
                        id="back"
                        value={editingItem.back || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, back: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={editingItem.category || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select value={editingItem.difficulty || 'medium'} onValueChange={(value) => setEditingItem({ ...editingItem, difficulty: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={() => saveFlashcard(editingItem)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingItem(null)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Existing Flashcards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {flashcards.map((card) => (
                      <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{card.front}</p>
                          <p className="text-sm text-gray-600">{card.back}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{card.category}</Badge>
                            <Badge variant="outline">{card.difficulty}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingItem(card)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quizzes Management */}
          <TabsContent value="quizzes">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Add New Quiz</CardTitle>
                    <Button onClick={() => setEditingItem({ type: 'quiz', options: [] })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Quiz
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {editingItem?.type === 'quiz' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Quiz</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="question">Question</Label>
                      <Textarea
                        id="question"
                        value={editingItem.question || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, question: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select value={editingItem.type || 'multiple_choice'} onValueChange={(value) => setEditingItem({ ...editingItem, type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                            <SelectItem value="true_false">True/False</SelectItem>
                            <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select value={editingItem.difficulty || 'medium'} onValueChange={(value) => setEditingItem({ ...editingItem, difficulty: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {(editingItem.type === 'multiple_choice') && (
                      <div>
                        <Label>Options (one per line)</Label>
                        <Textarea
                          value={editingItem.options ? editingItem.options.join('\n') : ''}
                          onChange={(e) => setEditingItem({ ...editingItem, options: e.target.value.split('\n').filter(o => o.trim()) })}
                          placeholder="Option 1&#10;Option 2&#10;Option 3&#10;Option 4"
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="correctAnswer">Correct Answer</Label>
                      <Input
                        id="correctAnswer"
                        value={editingItem.correctAnswer || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, correctAnswer: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="explanation">Explanation</Label>
                      <Textarea
                        id="explanation"
                        value={editingItem.explanation || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, explanation: e.target.value })}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={() => saveQuiz(editingItem)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingItem(null)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Existing Quizzes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quizzes.map((quiz) => (
                      <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{quiz.question}</p>
                          <p className="text-sm text-gray-600">Type: {quiz.type} • Points: {quiz.points}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{quiz.category}</Badge>
                            <Badge variant="outline">{quiz.difficulty}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingItem(quiz)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Events Management */}
          <TabsContent value="events">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Add New Event</CardTitle>
                    <Button onClick={() => setEditingItem({ type: 'event', tags: [] })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {editingItem?.type === 'event' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Event</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={editingItem.title || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editingItem.description || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={editingItem.startDate || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={editingItem.endDate || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select value={editingItem.type || 'webinar'} onValueChange={(value) => setEditingItem({ ...editingItem, type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="webinar">Webinar</SelectItem>
                            <SelectItem value="workshop">Workshop</SelectItem>
                            <SelectItem value="challenge">Challenge</SelectItem>
                            <SelectItem value="competition">Competition</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="maxParticipants">Max Participants</Label>
                        <Input
                          id="maxParticipants"
                          type="number"
                          value={editingItem.maxParticipants || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, maxParticipants: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={() => saveEvent(editingItem)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingItem(null)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Existing Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-600">{new Date(event.startDate).toLocaleDateString()}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{event.type}</Badge>
                            {event.isOnline && <Badge variant="outline">Online</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingItem(event)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Blogs Management - Simplified for space */}
          <TabsContent value="blogs">
            <Card>
              <CardHeader>
                <CardTitle>Blog Management</CardTitle>
                <CardDescription>Blog management interface would go here</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Blog management with rich text editor would be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}