'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X, Loader2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// --- Interfaces ---
interface DailyWord { id?: string; date: string; word1: string; meaning1: string; example1?: string; word2: string; meaning2: string; example2?: string; difficulty: string; }
interface Blog { id?: string; title: string; slug: string; content: string; category: string; tags: string[]; published: boolean; }
interface Flashcard { id?: string; front: string; back: string; category?: string; difficulty: string; }
interface Quiz { id?: string; question: string; type: string; options: string[]; correctAnswer: string; explanation?: string; difficulty: string; category?: string; points: number; }
interface Event { id?: string; title: string; description: string; startDate: string; endDate?: string; type: string; isOnline: boolean; maxParticipants?: number; tags: string[]; }

export default function AdminPanel() {
  const { toast } = useToast();
  
  // --- AUTH STATE ---
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // Data States
  const [dailyWords, setDailyWords] = useState<DailyWord[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Check Local Storage on Load
  useEffect(() => {
    const unlocked = localStorage.getItem('admin_unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
      fetchData();
    } else {
      setLoading(false); // Stop loading to show lock screen
    }
  }, []);

  // --- PASSWORD HANDLER ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // SET YOUR ADMIN PASSWORD HERE
    const ADMIN_PASSWORD = "admin123"; 

    if (passwordInput === ADMIN_PASSWORD) {
      setIsUnlocked(true);
      localStorage.setItem('admin_unlocked', 'true');
      fetchData();
      toast({ title: "Welcome back!", className: "bg-green-500 text-white" });
    } else {
      toast({ title: "Wrong Password", variant: "destructive" });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const fetchResource = async (path: string, setter: Function) => {
      try {
        const origin = window.location.origin;
        const url = new URL(path, origin).toString();
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setter(data);
        }
      } catch (err) { console.warn(err); }
    };

    try {
      await Promise.all([
        fetchResource('/api/daily-words?limit=50', setDailyWords),
        fetchResource('/api/blogs?limit=50', setBlogs),
        fetchResource('/api/flashcards?limit=50', setFlashcards),
        fetchResource('/api/quizzes?limit=50', setQuizzes),
        fetchResource('/api/events?limit=50', setEvents)
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (path: string, data: any, typeName: string) => {
    try {
      setSaving(true);
      const isEditing = !!data.id;
      const method = isEditing ? 'PUT' : 'POST';
      const origin = window.location.origin;
      const url = new URL(path, origin).toString();

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to save');

      toast({ title: "Success!", description: `${typeName} saved.`, className: "bg-green-500 text-white" });
      setEditingItem(null);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save. Are you logged in as Admin?", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (path: string, id: string) => {
    if(!confirm("Delete this?")) return;
    try {
        const origin = window.location.origin;
        const url = new URL(`${path}?id=${id}`, origin).toString();
        const response = await fetch(url, { method: 'DELETE' });
        if(!response.ok) throw new Error("Failed");
        toast({ title: "Deleted", description: "Item removed." });
        fetchData();
    } catch (error) {
        toast({ title: "Error", variant: "destructive" });
    }
  }

  // --- LOCK SCREEN UI ---
  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Lock className="w-6 h-6" /> Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Enter Admin Password</Label>
                <Input 
                  type="password" 
                  value={passwordInput} 
                  onChange={(e) => setPasswordInput(e.target.value)} 
                  placeholder="Password..."
                />
              </div>
              <Button type="submit" className="w-full">Unlock Dashboard</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage Content</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = '/'}>Go to Site</Button>
            <Button variant="destructive" onClick={() => {
              localStorage.removeItem('admin_unlocked');
              setIsUnlocked(false);
            }}>Lock</Button>
          </div>
        </header>

        <Tabs defaultValue="daily-words" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="daily-words">Daily Words</TabsTrigger>
            <TabsTrigger value="blogs">Blogs</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          {/* DAILY WORDS */}
          <TabsContent value="daily-words">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Daily Words</CardTitle>
                <Button onClick={() => setEditingItem({ type: 'daily-word', difficulty: 'medium' })}><Plus className="mr-2 h-4 w-4"/> Add New</Button>
              </CardHeader>
              <CardContent>
                {editingItem?.type === 'daily-word' && (
                  <div className="bg-white p-6 border rounded-lg shadow-sm mb-6 space-y-4">
                    <h3 className="font-bold border-b pb-2">Word Editor</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Date</Label><Input type="date" value={editingItem.date ? new Date(editingItem.date).toISOString().split('T')[0] : ''} onChange={(e) => setEditingItem({...editingItem, date: new Date(e.target.value).toISOString()})} /></div>
                      <div className="space-y-2"><Label>Difficulty</Label><Select value={editingItem.difficulty} onValueChange={(v) => setEditingItem({...editingItem, difficulty: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent></Select></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2 p-3 bg-blue-50 rounded"><Label>Word 1</Label><Input placeholder="Word" value={editingItem.word1 || ''} onChange={(e) => setEditingItem({...editingItem, word1: e.target.value})} /><Input placeholder="Meaning" value={editingItem.meaning1 || ''} onChange={(e) => setEditingItem({...editingItem, meaning1: e.target.value})} /><Textarea placeholder="Example" value={editingItem.example1 || ''} onChange={(e) => setEditingItem({...editingItem, example1: e.target.value})} /></div>
                      <div className="space-y-2 p-3 bg-purple-50 rounded"><Label>Word 2</Label><Input placeholder="Word" value={editingItem.word2 || ''} onChange={(e) => setEditingItem({...editingItem, word2: e.target.value})} /><Input placeholder="Meaning" value={editingItem.meaning2 || ''} onChange={(e) => setEditingItem({...editingItem, meaning2: e.target.value})} /><Textarea placeholder="Example" value={editingItem.example2 || ''} onChange={(e) => setEditingItem({...editingItem, example2: e.target.value})} /></div>
                    </div>
                    <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button><Button disabled={saving} onClick={() => handleSave('/api/daily-words', editingItem, 'Daily Word')}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save</Button></div>
                  </div>
                )}
                <div className="space-y-2">
                  {dailyWords.map((item) => (
                    <div key={item.id} className="flex justify-between p-3 border rounded items-center bg-white">
                      <div><div className="font-bold">{item.word1} & {item.word2}</div><div className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</div></div>
                      <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => setEditingItem({ ...item, type: 'daily-word' })}><Edit className="h-4 w-4" /></Button><Button size="sm" variant="ghost" className="text-red-500" onClick={() => item.id && handleDelete('/api/daily-words', item.id)}><Trash2 className="h-4 w-4" /></Button></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QUIZZES */}
          <TabsContent value="quizzes">
            <Card>
              <CardHeader className="flex justify-between items-center"><CardTitle>Quizzes</CardTitle><Button onClick={() => setEditingItem({ type: 'quiz', options: [], points: 10 })}><Plus className="mr-2 h-4 w-4"/> Add</Button></CardHeader>
              <CardContent>
                {editingItem?.type === 'quiz' && (
                  <div className="bg-white p-6 border rounded-lg shadow-sm mb-6 space-y-4">
                    <h3 className="font-bold">Quiz Editor</h3>
                    <Label>Question</Label><Textarea value={editingItem.question || ''} onChange={(e) => setEditingItem({...editingItem, question: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4"><div><Label>Answer</Label><Input value={editingItem.correctAnswer || ''} onChange={(e) => setEditingItem({...editingItem, correctAnswer: e.target.value})} /></div><div><Label>Points</Label><Input type="number" value={editingItem.points || 10} onChange={(e) => setEditingItem({...editingItem, points: parseInt(e.target.value)})} /></div></div>
                    <div><Label>Options (One per line)</Label><Textarea rows={4} value={Array.isArray(editingItem.options) ? editingItem.options.join('\n') : editingItem.options} onChange={(e) => setEditingItem({...editingItem, options: e.target.value.split('\n')})} /></div>
                    <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button><Button disabled={saving} onClick={() => handleSave('/api/quizzes', editingItem, 'Quiz')}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save</Button></div>
                  </div>
                )}
                <div className="space-y-2">{quizzes.map((q) => (<div key={q.id} className="flex justify-between p-3 border rounded items-center"><p className="truncate w-1/2">{q.question}</p><div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => setEditingItem({ ...q, type: 'quiz' })}><Edit className="h-4 w-4"/></Button><Button size="sm" variant="ghost" className="text-red-500" onClick={() => q.id && handleDelete('/api/quizzes', q.id)}><Trash2 className="h-4 w-4"/></Button></div></div>))}</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
             <Card>
              <CardHeader className="flex justify-between items-center"><CardTitle>Events</CardTitle><Button onClick={() => setEditingItem({ type: 'event', tags: [] })}><Plus className="mr-2 h-4 w-4"/> Add</Button></CardHeader>
              <CardContent>
                {editingItem?.type === 'event' && (
                  <div className="bg-white p-6 border rounded-lg shadow-sm mb-6 space-y-4">
                    <h3 className="font-bold">Event Editor</h3>
                    <Label>Title</Label><Input value={editingItem.title || ''} onChange={(e) => setEditingItem({...editingItem, title: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4"><div><Label>Start</Label><Input type="datetime-local" value={editingItem.startDate || ''} onChange={(e) => setEditingItem({...editingItem, startDate: e.target.value})} /></div><div><Label>End</Label><Input type="datetime-local" value={editingItem.endDate || ''} onChange={(e) => setEditingItem({...editingItem, endDate: e.target.value})} /></div></div>
                    <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button><Button disabled={saving} onClick={() => handleSave('/api/events', editingItem, 'Event')}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save</Button></div>
                  </div>
                )}
                <div className="space-y-2">{events.map((e) => (<div key={e.id} className="flex justify-between p-3 border rounded items-center"><p>{e.title}</p><div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => setEditingItem({ ...e, type: 'event' })}><Edit className="h-4 w-4"/></Button><Button size="sm" variant="ghost" className="text-red-500" onClick={() => e.id && handleDelete('/api/events', e.id)}><Trash2 className="h-4 w-4"/></Button></div></div>))}</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flashcards"><div className="p-4 text-center text-gray-500">Flashcard manager coming soon.</div></TabsContent>
          <TabsContent value="blogs"><div className="p-4 text-center text-gray-500">Blog manager coming soon.</div></TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
