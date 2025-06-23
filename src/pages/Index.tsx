import { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface Note {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('notepad-notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        completed: note.completed || false,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
      setNotes(parsedNotes);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('notepad-notes', JSON.stringify(notes));
  }, [notes]);

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    setIsEditing(true);
    setIsCreating(true);
  };

  const saveNote = () => {
    if (selectedNote) {
      const updatedNotes = notes.map(note =>
        note.id === selectedNote.id
          ? {
              ...note,
              title: editTitle || 'Untitled',
              content: editContent,
              updatedAt: new Date(),
            }
          : note
      );
      setNotes(updatedNotes);
      setSelectedNote({
        ...selectedNote,
        title: editTitle || 'Untitled',
        content: editContent,
        updatedAt: new Date(),
      });
    }
    setIsEditing(false);
    setIsCreating(false);
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
      setIsCreating(false);
    }
  };

  const editNote = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(true);
  };

  const toggleNoteCompletion = (noteId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, completed: !note.completed, updatedAt: new Date() }
        : note
    );
    setNotes(updatedNotes);
    
    // Update selected note if it's the one being toggled
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote({
        ...selectedNote,
        completed: !selectedNote.completed,
        updatedAt: new Date(),
      });
    }
  };

  const cancelEdit = () => {
    if (isCreating && selectedNote) {
      deleteNote(selectedNote.id);
    }
    setIsEditing(false);
    setIsCreating(false);
    setEditTitle('');
    setEditContent('');
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              My Notepad
            </h1>
            <p className="text-white/80 text-sm sm:text-base">
              Your thoughts, organized beautifully
            </p>
          </div>
          <Button
            onClick={createNote}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 w-full sm:w-auto"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Notes List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm focus:bg-white/20 transition-all duration-300"
              />
            </div>

            {/* Notes List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-white/10 scrollbar-thumb-white/30">
              {filteredNotes.length === 0 ? (
                <Card className="p-6 bg-white/10 border-white/20 backdrop-blur-sm text-center">
                  <p className="text-white/70">
                    {searchTerm ? 'No notes found' : 'No notes yet. Create your first note!'}
                  </p>
                </Card>
              ) : (
                filteredNotes.map((note) => (
                  <Card
                    key={note.id}
                    className={`p-4 cursor-pointer transition-all duration-300 bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 ${
                      selectedNote?.id === note.id ? 'ring-2 ring-white/50 bg-white/20' : ''
                    } ${note.completed ? 'opacity-75' : ''}`}
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <Checkbox
                          checked={note.completed}
                          onCheckedChange={() => toggleNoteCompletion(note.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="border-white/30 data-[state=checked]:bg-white/30 data-[state=checked]:border-white/50"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-white truncate mb-1 ${
                          note.completed ? 'line-through' : ''
                        }`}>
                          {note.title}
                        </h3>
                        <p className={`text-white/70 text-sm line-clamp-2 mb-2 ${
                          note.completed ? 'line-through' : ''
                        }`}>
                          {note.content || 'No content'}
                        </p>
                        <p className="text-white/50 text-xs">
                          {formatDate(note.updatedAt)}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            editNote(note);
                          }}
                          className="h-8 w-8 p-0 hover:bg-white/20 text-white/70 hover:text-white"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                          className="h-8 w-8 p-0 hover:bg-red-500/20 text-white/70 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Note Editor */}
          <div className="lg:col-span-2">
            {selectedNote ? (
              <Card className="h-full bg-white/10 border-white/20 backdrop-blur-sm">
                {isEditing ? (
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-white">
                        Edit Note
                      </h2>
                      <div className="flex gap-2">
                        <Button
                          onClick={saveNote}
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-100 border-green-400/30"
                          size="sm"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          variant="ghost"
                          className="hover:bg-red-500/20 text-white/70 hover:text-red-300"
                          size="sm"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                    <Input
                      placeholder="Note title..."
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="mb-4 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                    />
                    <Textarea
                      placeholder="Start writing your note..."
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="flex-1 resize-none bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 min-h-[400px]"
                    />
                  </div>
                ) : (
                  <div className="p-6 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedNote.completed}
                          onCheckedChange={() => toggleNoteCompletion(selectedNote.id)}
                          className="border-white/30 data-[state=checked]:bg-white/30 data-[state=checked]:border-white/50"
                        />
                        <div>
                          <h2 className={`text-2xl font-bold text-white mb-1 ${
                            selectedNote.completed ? 'line-through' : ''
                          }`}>
                            {selectedNote.title}
                          </h2>
                          <p className="text-white/50 text-sm">
                            Last updated: {formatDate(selectedNote.updatedAt)}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => editNote(selectedNote)}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <div className={`text-white/90 whitespace-pre-wrap leading-relaxed ${
                        selectedNote.completed ? 'line-through' : ''
                      }`}>
                        {selectedNote.content || (
                          <span className="text-white/50 italic">
                            This note is empty. Click Edit to add content.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="h-full bg-white/10 border-white/20 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Edit3 className="w-8 h-8 text-white/70" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Select a note to view
                  </h3>
                  <p className="text-white/70 mb-4">
                    Choose a note from the list or create a new one to get started.
                  </p>
                  <Button
                    onClick={createNote}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Note
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
