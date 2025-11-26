
import React, { useState, useEffect, useMemo } from 'react';
import { api, generateId } from './services/api';
import { generateNoteFromText } from './services/geminiService';
import { Note, User, ViewMode, Language, SortOption, NoteType } from './types';
import { translations } from './translations';
import { NoteCard } from './components/NoteCard';
import { InputArea } from './components/InputArea';
import { AuthScreen } from './components/AuthScreen';
import { LogOut, Users, FileText, Share2, Loader2, Search, Filter, SortDesc, Folder, Plus, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteTypes, setNoteTypes] = useState<NoteType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  
  // View State
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [isInitializing, setIsInitializing] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Type Creation State
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  // Initialize app
  useEffect(() => {
    const init = async () => {
      try {
        const user = await api.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          // Load initial data if logged in
          const [fetchedNotes, fetchedUsers, fetchedTypes] = await Promise.all([
            api.getNotes('all', user.id),
            api.getUsers(),
            api.getNoteTypes(user.id)
          ]);
          setNotes(fetchedNotes);
          setAllUsers(fetchedUsers);
          setNoteTypes(fetchedTypes);
        }
      } catch (e) {
        console.error("Initialization error:", e);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  // Fetch notes when view mode or user changes
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchNotes = async () => {
      setIsLoadingNotes(true);
      try {
        // If viewing a specific type, we treat it like 'all' for the fetch, then filter in memory/UI 
        // OR fetch properly. Since mock API is simple, let's fetch 'all' and filter.
        // Actually, the API supports filtering, let's use it.
        const modeForApi = viewMode === 'type' ? 'type' : viewMode;
        const fetchedNotes = await api.getNotes(modeForApi, currentUser.id, selectedTypeId || undefined);
        setNotes(fetchedNotes);
      } catch (e) {
        console.error("Failed to fetch notes:", e);
      } finally {
        setIsLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [viewMode, currentUser, selectedTypeId]);

  const t = translations[lang];

  // Derived State: All unique tags from current notes
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [notes]);

  // Derived State: Filtered and Sorted Notes
  const filteredAndSortedNotes = useMemo(() => {
    let result = [...notes];

    // Filter by Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(query) || 
        n.content.toLowerCase().includes(query)
      );
    }

    // Filter by Tag
    if (selectedTag) {
      result = result.filter(n => n.tags.includes(selectedTag));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest': return b.createdAt - a.createdAt;
        case 'oldest': return a.createdAt - b.createdAt;
        case 'updated_newest': return b.updatedAt - a.updatedAt;
        case 'updated_oldest': return a.updatedAt - b.updatedAt;
        default: return 0;
      }
    });

    return result;
  }, [notes, searchQuery, selectedTag, sortOption]);


  // Auth Handlers
  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    const [users, types] = await Promise.all([
      api.getUsers(),
      api.getNoteTypes(user.id)
    ]);
    setAllUsers(users);
    setNoteTypes(types);
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setNotes([]);
    setNoteTypes([]);
  };

  // AI Generation Handler
  const handleGenerateNote = async (text: string) => {
    if (!currentUser) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const generatedData = await generateNoteFromText(text);
      
      const newNoteData: Note = {
        id: '', // Will be generated by API
        userId: currentUser.id,
        // Auto-assign to current type if selected
        typeId: (viewMode === 'type' && selectedTypeId) ? selectedTypeId : undefined,
        title: generatedData.title,
        content: generatedData.content,
        tags: generatedData.tags,
        // Assign a random pastel color initially, or default to white
        color: 'white', 
        todos: generatedData.todos.map(t => ({
          id: generateId(),
          text: t.text,
          completed: false,
          reminder: t.reminder
        })),
        createdAt: 0,
        updatedAt: 0,
        sharedWith: []
      };

      const createdNote = await api.createNote(newNoteData);
      setNotes(prev => [createdNote, ...prev]);
    } catch (e) {
      setError("Failed to generate note. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateNote = async (updatedNote: Note) => {
    // Optimistic update
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
    try {
      await api.updateNote(updatedNote);
    } catch (e) {
      console.error("Failed to update note", e);
    }
  };

  const handleDeleteNote = async (id: string) => {
    // Optimistic update
    const previousNotes = [...notes];
    setNotes(prev => prev.filter(n => n.id !== id));
    
    try {
      await api.deleteNote(id);
    } catch (e) {
      console.error("Failed to delete note", e);
      setNotes(previousNotes);
    }
  };

  // Type Management
  const handleCreateType = async () => {
    if (!currentUser || !newTypeName.trim()) return;
    try {
      const newType = await api.createNoteType(newTypeName, currentUser.id);
      setNoteTypes(prev => [...prev, newType]);
      setNewTypeName('');
      setIsCreatingType(false);
    } catch (e) {
      console.error("Failed to create type", e);
    }
  };

  const handleDeleteType = async (typeId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the type
    if (!window.confirm(t.confirm_delete_type)) return;

    try {
      await api.deleteNoteType(typeId);
      setNoteTypes(prev => prev.filter(t => t.id !== typeId));
      // If we deleted the current type, switch to All Notes
      if (selectedTypeId === typeId) {
        setViewMode('all');
        setSelectedTypeId(null);
      } else {
        // Refresh notes to update uncategorized ones if needed
        // For simplicity, just refetch
        const fetchedNotes = await api.getNotes(viewMode === 'type' ? 'type' : viewMode, currentUser!.id, selectedTypeId || undefined);
        setNotes(fetchedNotes);
      }
    } catch (e) {
      console.error("Failed to delete type", e);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  // If not authenticated, show Auth Screen
  if (!currentUser) {
    return (
      <>
         <div className="fixed top-4 right-4 z-50 flex gap-2">
            {(['en', 'pt', 'es'] as Language[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded text-sm font-bold ${lang === l ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
         </div>
         <AuthScreen onLogin={handleLogin} lang={lang} />
      </>
    );
  }

  const selectedTypeName = selectedTypeId 
    ? noteTypes.find(t => t.id === selectedTypeId)?.name 
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900">
      
      {/* Sidebar / Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 sticky top-0 z-20 md:h-screen h-auto">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20">
            C
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {t.app_name}
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto no-scrollbar">
          <button 
            onClick={() => { setViewMode('all'); setSelectedTypeId(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${viewMode === 'all' ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <FileText size={20} />
            {t.all_notes}
          </button>
          <button 
            onClick={() => { setViewMode('personal'); setSelectedTypeId(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${viewMode === 'personal' ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Users size={20} />
            {t.my_personal}
          </button>
          <button 
            onClick={() => { setViewMode('shared'); setSelectedTypeId(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${viewMode === 'shared' ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Share2 size={20} />
            {t.shared_with_me}
          </button>

          {/* Types Section */}
          <div className="pt-6 pb-2">
             <div className="flex justify-between items-center px-4 mb-2">
               <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.types}</h3>
               <button 
                 onClick={() => setIsCreatingType(!isCreatingType)}
                 className="text-gray-400 hover:text-orange-600 transition-colors p-1"
                 title={t.create_type}
               >
                 <Plus size={16} />
               </button>
             </div>

             {/* Create Type Input */}
             {isCreatingType && (
               <div className="px-4 mb-3 animate-fade-in-up">
                 <div className="flex gap-2">
                   <input
                    type="text"
                    autoFocus
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateType()}
                    placeholder={t.type_name_placeholder}
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-orange-500"
                   />
                   <button 
                    onClick={handleCreateType}
                    className="bg-orange-500 text-white p-1 rounded-md hover:bg-orange-600"
                   >
                     <Plus size={16} />
                   </button>
                 </div>
               </div>
             )}

             <div className="space-y-1">
               {noteTypes.map(type => (
                 <button
                  key={type.id}
                  onClick={() => { setViewMode('type'); setSelectedTypeId(type.id); }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2 rounded-xl transition-all text-sm group ${selectedTypeId === type.id ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                 >
                   <div className="flex items-center gap-3 overflow-hidden">
                      <Folder size={18} className={selectedTypeId === type.id ? 'text-orange-500' : 'text-gray-400'} />
                      <span className="truncate">{type.name}</span>
                   </div>
                   <div 
                      onClick={(e) => handleDeleteType(type.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                   >
                     <Trash2 size={14} />
                   </div>
                 </button>
               ))}
               {noteTypes.length === 0 && (
                 <div className="px-4 py-2 text-xs text-gray-400 italic text-center">No folders yet</div>
               )}
             </div>
          </div>
        </nav>

        {/* User & Settings */}
        <div className="p-4 border-t border-gray-200 space-y-4">
           {/* Language Selector */}
           <div className="flex justify-center gap-2 p-1 bg-gray-100 rounded-lg">
              {(['en', 'pt', 'es'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`flex-1 py-1 rounded-md text-xs font-bold transition-all ${lang === l ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
           </div>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 border border-gray-100">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full border border-gray-200" />
            <div className="flex-1 text-left overflow-hidden">
              <div className="text-sm font-semibold truncate text-gray-900">{currentUser.name}</div>
              <div className="text-xs text-gray-500 truncate">{currentUser.email}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title={t.logout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              {viewMode === 'all' && `${t.welcome}, ${currentUser.name.split(' ')[0]}`}
              {viewMode === 'personal' && t.my_personal}
              {viewMode === 'shared' && t.shared_with_me}
              {viewMode === 'type' && selectedTypeName && (
                <>
                  <Folder className="text-orange-500" />
                  {selectedTypeName}
                </>
              )}
            </h2>
            <p className="text-gray-500 mt-1">
              {viewMode === 'all' && t.welcome_subtitle}
              {viewMode === 'personal' && "Private thoughts and tasks."}
              {viewMode === 'shared' && "Collaboration from your team."}
              {viewMode === 'type' && "Notes in this folder."}
            </p>
          </div>
        </header>

        {/* Input Area */}
        <InputArea onGenerate={handleGenerateNote} isGenerating={isGenerating} lang={lang} />

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center justify-center">
            {error}
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder={t.search_placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white placeholder-gray-400 text-gray-900"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative min-w-[160px]">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                 <SortDesc size={18} />
              </div>
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white appearance-none cursor-pointer text-gray-900"
              >
                <option value="newest">{t.sort_newest}</option>
                <option value="oldest">{t.sort_oldest}</option>
                <option value="updated_newest">{t.sort_updated}</option>
              </select>
            </div>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <Filter size={16} className="text-gray-400 shrink-0" />
              <button 
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${!selectedTag ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${selectedTag === tag ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-orange-600 hover:bg-orange-50'}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes Grid */}
        {isLoadingNotes ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3].map(i => (
               <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
             ))}
           </div>
        ) : filteredAndSortedNotes.length === 0 ? (
          <div className="text-center py-20 opacity-60">
            <div className="bg-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-600">{searchQuery ? 'No notes found' : t.no_notes_title}</h3>
            <p className="text-gray-400 max-w-sm mx-auto mt-2">{searchQuery ? 'Try different keywords or filters.' : t.no_notes_desc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
            {filteredAndSortedNotes.map(note => (
              <div key={note.id} className="h-full">
                <NoteCard 
                  note={note} 
                  currentUser={currentUser}
                  allUsers={allUsers}
                  allTypes={noteTypes}
                  onUpdate={handleUpdateNote}
                  onDelete={handleDeleteNote}
                  lang={lang}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
