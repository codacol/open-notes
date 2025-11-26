
import React, { useState } from 'react';
import { Note, User, Language, NoteColor, NoteType } from '../types';
import { Share2, Trash2, CheckCircle, Circle, User as UserIcon, Edit2, X, Check, Clock, Eye, PenTool, Palette, Folder } from 'lucide-react';
import { translations } from '../translations';

interface NoteCardProps {
  note: Note;
  currentUser: User;
  allUsers: User[];
  allTypes: NoteType[]; // Added prop
  onUpdate: (note: Note) => void;
  onDelete: (id: string) => void;
  lang: Language;
}

const NOTE_COLORS: Record<NoteColor, string> = {
  white: 'bg-white border-gray-100',
  blue: 'bg-blue-50 border-blue-100',
  red: 'bg-red-50 border-red-100',
  green: 'bg-green-50 border-green-100',
  orange: 'bg-orange-50 border-orange-100',
  purple: 'bg-purple-50 border-purple-100'
};

const COLOR_OPTIONS: { id: NoteColor; class: string }[] = [
  { id: 'white', class: 'bg-white border border-gray-200' },
  { id: 'blue', class: 'bg-blue-200' },
  { id: 'red', class: 'bg-red-200' },
  { id: 'green', class: 'bg-green-200' },
  { id: 'orange', class: 'bg-orange-200' },
  { id: 'purple', class: 'bg-purple-200' },
];

// Simple Markdown Renderer
const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  
  return (
    <div className="font-sans text-sm leading-relaxed space-y-2">
      {lines.map((line, idx) => {
        if (line.startsWith('# ')) return <h4 key={idx} className="text-lg font-bold text-gray-800">{line.replace('# ', '')}</h4>;
        if (line.startsWith('## ')) return <h5 key={idx} className="text-md font-bold text-gray-800">{line.replace('## ', '')}</h5>;
        
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          const listContent = line.trim().substring(2);
          return (
            <div key={idx} className="flex items-start ml-2">
              <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-gray-500 rounded-full shrink-0"></span>
              <span>{parseBold(listContent)}</span>
            </div>
          );
        }
        if (!line.trim()) return <div key={idx} className="h-2"></div>;
        return <p key={idx}>{parseBold(line)}</p>;
      })}
    </div>
  );
};

const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export const NoteCard: React.FC<NoteCardProps> = ({ note, currentUser, allUsers, allTypes, onUpdate, onDelete, lang }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState<'write' | 'preview'>('write');
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  
  const t = translations[lang];
  
  const toggleTodo = (todoId: string) => {
    const updatedTodos = note.todos.map(t =>
      t.id === todoId ? { ...t, completed: !t.completed } : t
    );
    onUpdate({ ...note, todos: updatedTodos });
  };

  const handleShare = (userIdToShare: string) => {
    const alreadyShared = note.sharedWith.includes(userIdToShare);
    let newSharedWith = [...note.sharedWith];
    
    if (alreadyShared) {
      newSharedWith = newSharedWith.filter(id => id !== userIdToShare);
    } else {
      newSharedWith.push(userIdToShare);
    }

    onUpdate({ ...note, sharedWith: newSharedWith });
  };

  const handleStartEditing = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditMode('write');
    setIsEditing(true);
    setIsShareOpen(false);
    setIsColorOpen(false);
    setIsTypeOpen(false);
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    
    onUpdate({
      ...note,
      title: editTitle,
      content: editContent
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const changeColor = (color: NoteColor) => {
    onUpdate({ ...note, color });
    setIsColorOpen(false);
  };

  const changeType = (typeId?: string) => {
    onUpdate({ ...note, typeId });
    setIsTypeOpen(false);
  };

  const isOwner = note.userId === currentUser.id;
  const owner = allUsers.find(u => u.id === note.userId);
  const currentType = allTypes.find(t => t.id === note.typeId);

  return (
    <div className={`rounded-2xl shadow-sm border hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden h-full group ${NOTE_COLORS[note.color] || NOTE_COLORS.white}`}>
      {/* Header */}
      <div className="p-5 pb-2">
        <div className="flex justify-between items-start mb-2">
          {isEditing ? (
             <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-xl font-bold text-gray-900 w-full border-b border-gray-400 focus:border-orange-500 focus:outline-none bg-transparent px-1 pb-1 mr-2"
              placeholder="Title"
              autoFocus
             />
          ) : (
             <h3 className="text-xl font-bold text-gray-900 leading-tight break-words">{note.title}</h3>
          )}
          
          <div className="flex flex-col items-end gap-1">
             {!isOwner && owner && !isEditing && (
              <div className="flex items-center text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full shrink-0">
                 <UserIcon size={12} className="mr-1"/>
                 {owner.name}
              </div>
            )}
            {/* Type Badge */}
            {currentType && !isEditing && (
              <div className="flex items-center text-xs text-orange-700 bg-orange-100/50 px-2 py-1 rounded-full font-medium shrink-0 border border-orange-100">
                <Folder size={10} className="mr-1"/>
                {currentType.name}
              </div>
            )}
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-2">
          {note.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-md bg-black/5 text-gray-700 text-xs font-medium">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-2 text-gray-700 flex-grow relative">
        {isEditing ? (
          <div className="h-full min-h-[150px] flex flex-col">
             {/* Edit/Preview Toggle */}
             <div className="flex border-b border-gray-300/50 mb-2">
                <button
                  onClick={() => setEditMode('write')}
                  className={`px-3 py-1 text-xs font-medium flex items-center gap-1 ${editMode === 'write' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <PenTool size={12}/> {t.write}
                </button>
                <button
                  onClick={() => setEditMode('preview')}
                  className={`px-3 py-1 text-xs font-medium flex items-center gap-1 ${editMode === 'preview' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Eye size={12}/> {t.preview}
                </button>
             </div>
             
             {editMode === 'write' ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none text-sm font-sans bg-white/50"
                  placeholder="Write your note here... (Markdown supported)"
                />
             ) : (
                <div className="w-full flex-grow p-2 bg-white/50 rounded-lg border border-gray-200 overflow-y-auto">
                   <SimpleMarkdown content={editContent} />
                </div>
             )}
          </div>
        ) : (
          <SimpleMarkdown content={note.content} />
        )}
      </div>

      {/* Action Items */}
      {note.todos.length > 0 && !isEditing && (
        <div className="px-5 py-3 bg-black/5 border-t border-black/5 mt-auto">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">{t.action_items}</h4>
          <ul className="space-y-2">
            {note.todos.map(todo => (
              <li key={todo.id} className="flex flex-col group/todo">
                <div className="flex items-start cursor-pointer" onClick={() => toggleTodo(todo.id)}>
                   <div className={`mt-0.5 mr-2 transition-colors ${todo.completed ? 'text-green-600' : 'text-gray-400 group-hover/todo:text-gray-600'}`}>
                    {todo.completed ? <CheckCircle size={16} /> : <Circle size={16} />}
                  </div>
                  <span className={`text-sm ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {todo.text}
                  </span>
                </div>
                {/* Reminder Display */}
                {todo.reminder && !todo.completed && (
                  <div className="ml-6 mt-1 flex items-center text-xs text-orange-600 font-medium">
                    <Clock size={10} className="mr-1" />
                    {todo.reminder}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer / Actions */}
      <div className="p-4 border-t border-black/5 flex justify-between items-center bg-white/40 h-[60px]">
        <div className="text-xs text-gray-500">
          {new Date(note.createdAt).toLocaleDateString()}
        </div>
        
        {isOwner && (
          <div className="flex gap-2 relative">
             {isEditing ? (
               <>
                 <button 
                  onClick={handleSave}
                  className="p-2 rounded-full hover:bg-green-100 text-green-600 transition-colors"
                  title={t.save}
                >
                  <Check size={18} />
                </button>
                <button 
                  onClick={handleCancel}
                  className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                  title={t.cancel}
                >
                  <X size={18} />
                </button>
               </>
             ) : (
               <div className="flex opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button 
                  onClick={() => setIsTypeOpen(!isTypeOpen)}
                  className={`p-2 rounded-full hover:bg-black/5 transition-colors ${note.typeId ? 'text-orange-600' : 'text-gray-500'}`}
                  title={t.move_to_type}
                >
                  <Folder size={18} />
                </button>
                <button 
                  onClick={() => setIsColorOpen(!isColorOpen)}
                  className="p-2 rounded-full hover:bg-black/5 text-gray-500 hover:text-orange-600 transition-colors"
                  title="Change Color"
                >
                  <Palette size={18} />
                </button>
                <button 
                  onClick={handleStartEditing}
                  className="p-2 rounded-full hover:bg-black/5 text-gray-500 hover:text-orange-600 transition-colors"
                  title={t.edit_note}
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => setIsShareOpen(!isShareOpen)}
                  className={`p-2 rounded-full hover:bg-black/5 transition-colors ${note.sharedWith.length > 0 ? 'text-orange-600' : 'text-gray-500'}`}
                  title={t.share_note}
                >
                  <Share2 size={18} />
                </button>
                <button 
                  onClick={() => onDelete(note.id)}
                  className="p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                  title={t.delete_note}
                >
                  <Trash2 size={18} />
                </button>
               </div>
             )}

            {/* Type/Folder Popover */}
            {isTypeOpen && !isEditing && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-10 animate-fade-in-up p-1">
                 <button
                  onClick={() => changeType(undefined)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 flex items-center"
                 >
                   <Folder size={14} className="mr-2 text-gray-300" />
                   {t.no_type}
                   {!note.typeId && <Check size={12} className="ml-auto" />}
                 </button>
                 <div className="h-px bg-gray-100 my-1"></div>
                 {allTypes.map(type => (
                   <button
                    key={type.id}
                    onClick={() => changeType(type.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center ${note.typeId === type.id ? 'bg-orange-50 text-orange-700' : 'text-gray-700 hover:bg-gray-50'}`}
                   >
                     <Folder size={14} className={`mr-2 ${note.typeId === type.id ? 'text-orange-500' : 'text-gray-400'}`} />
                     <span className="truncate">{type.name}</span>
                     {note.typeId === type.id && <Check size={12} className="ml-auto" />}
                   </button>
                 ))}
                 {allTypes.length === 0 && (
                   <div className="px-3 py-2 text-xs text-gray-400 italic">No folders created</div>
                 )}
              </div>
            )}

            {/* Color Palette Popover */}
            {isColorOpen && !isEditing && (
               <div className="absolute bottom-full right-0 mb-2 p-2 bg-white rounded-xl shadow-xl border border-gray-100 z-10 animate-fade-in-up flex gap-2">
                  {COLOR_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => changeColor(opt.id)}
                      className={`w-6 h-6 rounded-full ${opt.class} ${note.color === opt.id ? 'ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'} transition-transform`}
                      title={opt.id}
                    />
                  ))}
               </div>
            )}

            {/* Share Popover */}
            {isShareOpen && !isEditing && (
              <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-10 animate-fade-in-up">
                <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-1">{t.share_with}</div>
                {allUsers.filter(u => u.id !== currentUser.id).length === 0 && (
                  <div className="text-xs text-gray-400 px-2 py-2 text-center">No other users found</div>
                )}
                {allUsers.filter(u => u.id !== currentUser.id).map(u => {
                   const isShared = note.sharedWith.includes(u.id);
                   return (
                    <button
                      key={u.id}
                      onClick={() => handleShare(u.id)}
                      className={`w-full text-left flex items-center px-2 py-2 rounded-lg text-sm transition-colors ${isShared ? 'bg-orange-50 text-orange-700' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full mr-2" />
                      <span className="flex-1 truncate">{u.name}</span>
                      {isShared && <CheckCircle size={14} className="ml-2" />}
                    </button>
                   );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
