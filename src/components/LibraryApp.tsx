'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  BookOpen, 
  Plus, 
  Moon, 
  Sun, 
  Search, 
  Trash2, 
  MessageSquare,
  Globe,
  Settings,
  X,
  Send,
  Loader2,
  Star,
  CheckCircle2,
  Maximize2,
  LayoutGrid,
  Zap,
  Clock,
  ArrowRight,
  Download,
  User,
  LogOut,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';

// PDF worker setup
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

type Tab = 'home' | 'myLibrary' | 'zeko' | 'settings';
type Language = 'ar' | 'en';

interface Book {
  id: string;
  name: string;
  size: string;
  date: string;
  cover: string;
  pdfData: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const translations = {
  ar: {
    home: 'الرئيسية',
    myLibrary: 'مكتبتي',
    zeko: 'زيكو AI',
    settings: 'الإعدادات',
    upload: 'رفع كتاب',
    search: 'بحث عن كتاب...',
    recent: 'المضافة حديثاً',
    allBooks: 'مكتبتي الكاملة',
    noBooks: 'لا توجد كتب. اضغط على "رفع كتاب" للبدء!',
    deleteConfirm: 'هل أنت متأكد من حذف هذا الكتاب؟',
    online: 'متصل بالخادم',
    offline: 'وضع عدم الاتصال',
    close: 'إغلاق',
    chatPlaceholder: 'اسأل زيكو أي شيء عن كتبك...',
    language: 'اللغة',
    theme: 'المظهر',
    dark: 'داكن',
    light: 'فاتح',
    extracting: 'جاري استخراج الغلاف...',
    saving: 'جاري الحفظ...',
    accent: 'لون التمييز',
    public: 'الكتب العامة',
    makePublic: 'جعل الكتاب عاماً',
    postedBy: 'بواسطة',
    favorites: 'المفضلة',
    markRead: 'تمت القراءة',
    details: 'التفاصيل',
    density: 'كثافة العرض',
    compact: 'مدمج',
    comfortable: 'مريح',
    radius: 'زوايا العناصر',
    sharp: 'حادة',
    rounded: 'دائرية',
  },
  en: {
    home: 'Public Books',
    myLibrary: 'My Library',
    zeko: 'Zeko AI',
    settings: 'Settings',
    upload: 'Upload Book',
    search: 'Search...',
    recent: 'Recently Added',
    allBooks: 'My Full Library',
    noBooks: 'No books found. Click "Upload" to start!',
    deleteConfirm: 'Are you sure you want to delete this book?',
    online: 'Connected to server',
    offline: 'Offline mode',
    close: 'Close',
    chatPlaceholder: 'Ask Zeko anything about your books...',
    language: 'Language',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    extracting: 'Extracting cover...',
    saving: 'Saving...',
    accent: 'Accent Color',
    public: 'Public Books',
    makePublic: 'Make Public',
    postedBy: 'Posted by',
    favorites: 'Favorites',
    markRead: 'Mark Read',
    details: 'Details',
    density: 'Grid Density',
    compact: 'Compact',
    comfortable: 'Comfortable',
    radius: 'Border Radius',
    sharp: 'Sharp',
    rounded: 'Rounded',
  }
};

interface BookExtended extends Book {
  isPublic: boolean;
  isFavorite: boolean;
  isRead: boolean;
  userId: string;
}

const ACCENT_COLORS = [
  { name: 'Cyan', color: '#00e5ff' },
  { name: 'Red', color: '#ff4757' },
  { name: 'Green', color: '#2ed573' },
  { name: 'Purple', color: '#a55eea' },
  { name: 'Orange', color: '#ffa502' },
  { name: 'White', color: '#ffffff' },
  { name: 'Gold', color: '#FFD700' },
  { name: 'Pink', color: '#ff9ff3' },
];

const Logo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Clean Modern Book Logo */}
    <path 
      d="M25 20H70C75.5228 20 80 24.4772 80 30V75C80 80.5228 75.5228 85 70 85H30C24.4772 85 20 80.5228 20 75V30C20 24.4772 24.4772 20 30 20" 
      stroke="var(--accent-color)" 
      strokeWidth="6" 
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path 
      d="M35 20V85" 
      stroke="var(--accent-color)" 
      strokeWidth="6" 
      strokeLinecap="round"
      opacity="0.5"
    />
    <path 
      d="M50 35H65M50 50H65M50 65H60" 
      stroke="currentColor" 
      strokeWidth="4" 
      strokeLinecap="round"
      opacity="0.3"
    />
  </svg>
);

export default function LibraryApp() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [lang, setLang] = useState<Language>('ar');
  const [isDark, setIsDark] = useState(true);
  const [accent, setAccent] = useState('#00e5ff');
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [radius, setRadius] = useState<'sharp' | 'rounded'>('rounded');
  const [books, setBooks] = useState<BookExtended[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [selectedBook, setSelectedBook] = useState<BookExtended | null>(null);
  const [bookDetail, setBookDetail] = useState<BookExtended | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const currentUserId = user ? user.id : 'guest';

  // Persistence of guest ID if no user
  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      const savedId = localStorage.getItem('nixuvik_guest_id');
      if (!savedId) {
        const id = 'guest_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('nixuvik_guest_id', id);
      }
    }
  }, [user]);

  const getEffectiveUserId = () => {
    if (user) return user.id;
    if (typeof window !== 'undefined') return localStorage.getItem('nixuvik_guest_id') || 'guest';
    return 'guest';
  };
  
  // AI Chat state
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'مرحباً! أنا زيكو، مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('nixuvik_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      syncProfile(u.id);
    } else {
      // Load local settings for guest
      const savedLang = localStorage.getItem('lang') as Language;
      if (savedLang) setLang(savedLang);
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light') setIsDark(false);
      const savedAccent = localStorage.getItem('accent');
      if (savedAccent) setAccent(savedAccent);
      const savedDensity = localStorage.getItem('density') as 'compact' | 'comfortable';
      if (savedDensity) setDensity(savedDensity);
      const savedRadius = localStorage.getItem('radius') as 'sharp' | 'rounded';
      if (savedRadius) setRadius(savedRadius);
    }
    
    fetchBooks();
    
    const savedSearchHistory = localStorage.getItem('searchHistory');
    if (savedSearchHistory) setSearchHistory(JSON.parse(savedSearchHistory));
  }, []);

  const syncProfile = async (uid: string) => {
    try {
      const res = await fetch(`/api/profile?userId=${uid}`);
      if (res.ok) {
        const profile = await res.json();
        setLang(profile.lang);
        setIsDark(profile.theme === 'dark');
        setAccent(profile.accent);
        setDensity(profile.density);
        setRadius(profile.radius);
      }
    } catch (e) {
      console.error("Profile sync failed", e);
    }
  };

  const updateProfile = async (updates: any) => {
    if (!user) return;
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...updates })
      });
    } catch (e) {
      console.error("Profile update failed", e);
    }
  };

  const handleAuth = async () => {
    if (!authEmail.trim() || !authPassword.trim()) return;
    setLoading(true);
    
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const newUser = { id: data.userId, email: data.email };
        localStorage.setItem('nixuvik_user', JSON.stringify(newUser));
        setUser(newUser);
        
        // Settings are already in data for login/signup
        setLang(data.lang);
        setIsDark(data.theme === 'dark');
        setAccent(data.accent);
        setDensity(data.density);
        setRadius(data.radius);
        
        setShowAuth(false);
        setAuthPassword('');
        fetchBooks();
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (e) {
      console.error("Auth error", e);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nixuvik_user');
    setUser(null);
    window.location.reload();
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
    if (user) updateProfile({ lang });
  }, [lang]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const themeStr = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', themeStr);
    if (user) updateProfile({ theme: themeStr });
  }, [isDark]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accent);
    localStorage.setItem('accent', accent);
    if (user) updateProfile({ accent });
  }, [accent]);

  useEffect(() => {
    localStorage.setItem('density', density);
    if (user) updateProfile({ density });
  }, [density]);

  useEffect(() => {
    document.documentElement.setAttribute('data-radius', radius);
    localStorage.setItem('radius', radius);
    if (user) updateProfile({ radius });
  }, [radius]);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setLoadingText(t.extracting);

    try {
      const fileDataURL = await readFileAsDataURL(file);
      const coverDataURL = await extractPDFCover(fileDataURL);
      
      const newBook = {
        name: file.name.replace('.pdf', ''),
        size: formatSize(file.size),
        date: new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US'),
        cover: coverDataURL,
        pdfData: fileDataURL,
        isPublic: false, // Default to private
        userId: getEffectiveUserId()
      };

      setLoadingText(t.saving);

      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook)
      });

      if (res.ok) {
        const savedBook = await res.json();
        setBooks([savedBook, ...books]);
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + (err as Error).message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const updateBook = async (id: string, updates: Partial<BookExtended>) => {
    try {
      const res = await fetch(`/api/books/${id}/patch`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setBooks(books.map(b => b.id === id ? { ...b, ...updates } : b));
        if (bookDetail?.id === id) setBookDetail({ ...bookDetail, ...updates });
      }
    } catch (error) {
      console.error('Failed to update book:', error);
    }
  };

  const handleSearchSubmit = (q: string) => {
    if (!q.trim()) return;
    const newHistory = [q, ...searchHistory.filter(h => h !== q)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    setSearchQuery(q);
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = e => reject(e);
      reader.readAsDataURL(file);
    });
  };

  const extractPDFCover = async (dataUrl: string): Promise<string> => {
    try {
      const pdfData = atob(dataUrl.split(',')[1]);
      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const scale = 1.5;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas context failed');
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // @ts-ignore
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (e) {
      console.warn("Cover extraction failed", e);
      return "https://via.placeholder.com/300x450/0f0f0f/00e5ff?text=PDF";
    }
  };

  const deleteBook = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(t.deleteConfirm)) return;
    
    try {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBooks(books.filter(b => b.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  const formatSize = (b: number) => {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/zeko', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      }
    } catch (error) {
      console.error('AI Error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const isAdmin = user?.email === 'admin';

  const displayedBooks = books.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'home') return matchesSearch && b.isPublic;
    if (activeTab === 'myLibrary') return matchesSearch && b.userId === getEffectiveUserId();
    return matchesSearch;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-main text-main transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 h-full overflow-y-auto border-l border-custom p-4 hidden md:flex flex-col bg-sidebar">
        <div className="mb-8 px-2 flex items-center gap-3">
          <Logo className="w-8 h-8 text-accent" />
          <h1 className="text-xl font-extrabold tracking-tight">NIXUVIK</h1>
        </div>

        <nav className="space-y-1 flex-1">
          {[
            { id: 'home', icon: Home, label: t.home },
            { id: 'myLibrary', icon: BookOpen, label: t.myLibrary },
            { id: 'zeko', icon: MessageSquare, label: t.zeko },
            { id: 'settings', icon: Settings, label: t.settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-4 px-4 py-2 rounded-custom font-semibold transition-all ${
                activeTab === item.id 
                ? 'bg-hover text-main shadow-sm' 
                : 'hover:bg-hover text-gray-500'
              }`}
            >
              <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-accent' : ''}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="mt-auto pt-8 border-t border-custom w-full space-y-4">
          {user ? (
            <div className="p-3 bg-hover rounded-custom-lg border border-custom">
               <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-black font-bold">
                    {user.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold truncate">{user.email}</p>
                    <p className="text-[10px] text-gray-500">{lang === 'ar' ? 'عضو' : 'Member'}</p>
                  </div>
               </div>
               <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-1.5 rounded-custom-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all text-[10px] font-bold"
               >
                 <LogOut className="w-3 h-3" />
                 {lang === 'ar' ? 'خروج' : 'Logout'}
               </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuth(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-custom bg-accent text-black font-bold text-xs shadow-lg shadow-accent/20 active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" />
              {lang === 'ar' ? 'تسجيل دخول' : 'Sign In'}
            </button>
          )}

          <div className="text-sm font-semibold flex items-center gap-2 text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            {t.online}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative bg-main">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-custom shrink-0 bg-sidebar/50 backdrop-blur-md sticky top-0 z-10">
          <div className="md:hidden flex items-center gap-2">
            <Logo className="w-6 h-6 text-accent" />
            <h1 className="font-extrabold">NIXUVIK</h1>
          </div>

          <div className="flex-1 max-w-[280px] mx-auto">
             <div className="relative group">
                <input 
                  type="text" 
                  placeholder={t.search} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(searchQuery)}
                  className={`w-full h-8 bg-hover border border-custom rounded-custom px-4 py-1.5 pl-10 focus:outline-none focus:ring-1 focus:ring-accent transition-all text-[11px]`}
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                
                {searchHistory.length > 0 && !searchQuery && (
                  <div className={`absolute top-full left-0 right-0 mt-2 bg-main border border-custom shadow-xl rounded-custom p-2 hidden group-focus-within:block z-50`}>
                    <div className="text-[9px] font-bold text-gray-400 px-2 mb-1 flex items-center gap-1 uppercase tracking-wider"><Clock className="w-2.5 h-2.5"/> {lang === 'ar' ? 'البحوث الأخيرة' : 'Recent Searches'}</div>
                    {searchHistory.map((h, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleSearchSubmit(h)}
                        className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-hover rounded-custom-sm transition-colors flex items-center gap-2 ${lang === 'ar' ? 'text-right flex-row-reverse' : ''}`}
                      >
                        <ArrowRight className="w-2.5 h-2.5 text-gray-400" />
                        <span>{h}</span>
                      </button>
                    ))}
                  </div>
                )}
             </div>
          </div>

          <div className="flex items-center gap-3 ml-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-accent text-black px-4 py-1.5 rounded-custom-full font-bold transition hover:scale-105 active:scale-95 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.upload}</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf" 
              onChange={handleFileUpload} 
            />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="mb-6 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-4 rounded-lg font-bold flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{loadingText}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'home' || activeTab === 'myLibrary' ? (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-3xl font-black">
                    {activeTab === 'home' ? t.home : t.allBooks}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
                    <span>{displayedBooks.length}</span>
                    <span>{lang === 'ar' ? 'كتاب' : 'books'}</span>
                  </div>
                </div>
                
                {displayedBooks.length === 0 ? (
                  <div className={`col-span-full text-center py-24 bg-hover/30 rounded-custom-lg border-2 border-dashed border-custom`}>
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">
                      {t.noBooks}
                    </p>
                  </div>
                ) : (
                  <div className={`grid ${density === 'compact' ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8'}`}>
                    {displayedBooks.map((book) => (
                      <div 
                        key={book.id} 
                        className="book-card group flex flex-col"
                        onClick={() => setSelectedBook(book)}
                      >
                        <div className={`relative w-full overflow-hidden rounded-custom border border-custom bg-hover shadow-md transition-all group-hover:shadow-xl group-hover:shadow-accent/10 group-hover:-translate-y-1`}>
                          <img 
                            src={book.cover} 
                            className="book-thumbnail group-hover:scale-105 transition-transform duration-500" 
                            alt={book.name} 
                            loading="lazy" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-3">
                             <div className="flex gap-2 mb-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); updateBook(book.id, { isFavorite: !book.isFavorite }); }}
                                  className={`p-2 rounded-custom-full backdrop-blur-md transition-all ${book.isFavorite ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white hover:bg-white/40'}`}
                                >
                                  <Star className={`w-3.5 h-3.5 ${book.isFavorite ? 'fill-current' : ''}`} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); updateBook(book.id, { isRead: !book.isRead }); }}
                                  className={`p-2 rounded-custom-full backdrop-blur-md transition-all ${book.isRead ? 'bg-green-500 text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setBookDetail(book); }}
                                  className="p-2 rounded-custom-full bg-white/20 text-white backdrop-blur-md hover:bg-white/40 transition-all"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                             </div>
                          </div>
                          <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-custom-sm font-bold backdrop-blur-sm">
                            {book.size}
                          </div>
                          {book.isRead && (
                             <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-custom-full shadow-lg">
                               <CheckCircle2 className="w-2.5 h-2.5" />
                             </div>
                          )}
                        </div>
                        <div className={`mt-${density === 'compact' ? '2' : '4'} flex flex-col gap-1`}>
                            <h3 className={`font-bold ${density === 'compact' ? 'text-xs' : 'text-sm'} line-clamp-2 leading-tight group-hover:text-accent transition-colors`} title={book.name}>
                              {book.name}
                            </h3>
                            <div className="flex justify-between items-center">
                               <p className="text-[10px] text-gray-500 font-semibold">{book.date}</p>
                               {(activeTab === 'myLibrary' || isAdmin) && (
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     {activeTab === 'myLibrary' && (
                                       <button 
                                        onClick={(e) => { e.stopPropagation(); updateBook(book.id, { isPublic: !book.isPublic }); }}
                                        className={`p-1 transition-colors ${book.isPublic ? 'text-accent' : 'text-gray-400 hover:text-accent'}`}
                                        title={t.makePublic}
                                      >
                                        <Globe className="w-3 h-3" />
                                      </button>
                                     )}
                                    <button 
                                      onClick={(e) => deleteBook(book.id, e)}
                                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                      title={isAdmin ? (lang === 'ar' ? 'حذف (مشرف)' : 'Delete (Admin)') : ''}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                               )}
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'zeko' ? (
              <motion.div
                key="zeko"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full flex flex-col max-w-4xl mx-auto"
              >
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pb-4 px-2">
                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-5 rounded-2xl shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-accent text-black font-bold rounded-br-none shadow-md' 
                        : 'bg-hover text-main border border-custom rounded-bl-none shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-hover p-5 rounded-2xl rounded-bl-none border border-custom shadow-sm">
                        <div className="flex gap-1">
                           <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></span>
                           <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.2s]"></span>
                           <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="relative p-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t.chatPlaceholder}
                    className="w-full bg-main border border-custom rounded-2xl px-6 py-5 focus:outline-none focus:ring-4 focus:ring-accent/10 pr-20 shadow-lg"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-accent text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
                  >
                    <Send className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto space-y-10"
              >
                <h2 className="text-4xl font-black mb-10">{t.settings}</h2>
                
                <div className="space-y-6">
                  {/* Language Setting */}
                  <div className="flex items-center justify-between p-6 bg-hover/30 rounded-2xl border border-custom">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                        <Globe className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <span className="font-bold text-lg block">{t.language}</span>
                        <span className="text-xs text-gray-400">{lang === 'ar' ? 'اختر لغة الواجهة' : 'Select interface language'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       {['ar', 'en'].map((l) => (
                          <button
                            key={l}
                            onClick={() => setLang(l as Language)}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${
                              lang === l 
                              ? 'bg-accent text-black shadow-lg shadow-accent/20' 
                              : 'bg-hover text-gray-500'
                            }`}
                          >
                            {l === 'ar' ? 'العربية' : 'English'}
                          </button>
                       ))}
                    </div>
                  </div>

                  {/* Theme Setting */}
                  <div className="flex items-center justify-between p-6 bg-hover/30 rounded-2xl border border-custom">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                        {isDark ? <Moon className="w-6 h-6 text-accent" /> : <Sun className="w-6 h-6 text-accent" />}
                      </div>
                      <div>
                        <span className="font-bold text-lg block">{t.theme}</span>
                        <span className="text-xs text-gray-400">{lang === 'ar' ? 'تبديل بين المظهر الفاتح والداكن' : 'Switch between light and dark mode'}</span>
                      </div>
                    </div>
                    <div className="flex p-1 bg-main rounded-xl border border-custom">
                       <button 
                        onClick={() => setIsDark(false)}
                        className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-sm ${!isDark ? 'bg-accent text-black shadow-sm' : 'text-gray-500'}`}
                      >
                        <Sun className="w-3.5 h-3.5" />
                        {t.light}
                      </button>
                      <button 
                        onClick={() => setIsDark(true)}
                        className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-sm ${isDark ? 'bg-accent text-black shadow-sm' : 'text-gray-500'}`}
                      >
                        <Moon className="w-3.5 h-3.5" />
                        {t.dark}
                      </button>
                    </div>
                  </div>

                  {/* Accent Color Setting */}
                  <div className="flex flex-col gap-6 p-6 bg-hover/30 rounded-2xl border border-custom">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <span className="font-bold text-lg block">{t.accent}</span>
                        <span className="text-xs text-gray-400">{lang === 'ar' ? 'اختر لون التمييز للنظام' : 'Choose the system accent color'}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                       {ACCENT_COLORS.map((c) => (
                          <button
                            key={c.name}
                            onClick={() => setAccent(c.color)}
                            className={`w-10 h-10 rounded-xl transition-all hover:scale-110 active:scale-90 flex items-center justify-center ${accent === c.color ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-yt-dark' : ''}`}
                            style={{ backgroundColor: c.color }}
                          >
                             {accent === c.color && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                          </button>
                       ))}
                    </div>
                  </div>

                  {/* Display Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="flex flex-col gap-6 p-6 bg-hover/30 rounded-2xl border border-custom">
                        <div className="flex items-center gap-4">
                           <LayoutGrid className="w-6 h-6 text-accent" />
                           <span className="font-bold">{t.density}</span>
                        </div>
                        <div className="flex p-1 bg-main rounded-xl border border-custom w-fit">
                           <button onClick={() => setDensity('comfortable')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${density === 'comfortable' ? 'bg-accent text-black shadow-sm' : 'text-gray-500'}`}>{t.comfortable}</button>
                           <button onClick={() => setDensity('compact')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${density === 'compact' ? 'bg-accent text-black shadow-sm' : 'text-gray-500'}`}>{t.compact}</button>
                        </div>
                     </div>
                     <div className="flex flex-col gap-6 p-6 bg-hover/30 rounded-2xl border border-custom">
                        <div className="flex items-center gap-4">
                           <Maximize2 className="w-6 h-6 text-accent" />
                           <span className="font-bold">{t.radius}</span>
                        </div>
                        <div className="flex p-1 bg-main rounded-xl border border-custom w-fit">
                           <button onClick={() => setRadius('rounded')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${radius === 'rounded' ? 'bg-accent text-black shadow-sm' : 'text-gray-500'}`}>{t.rounded}</button>
                           <button onClick={() => setRadius('sharp')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${radius === 'sharp' ? 'bg-accent text-black shadow-sm' : 'text-gray-500'}`}>{t.sharp}</button>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Book Detail Modal */}
      <AnimatePresence>
        {bookDetail && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setBookDetail(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-2xl bg-main border border-custom shadow-2xl overflow-hidden ${radius === 'rounded' ? 'rounded-3xl' : 'rounded-lg'}`}
            >
              <div className="flex flex-col md:flex-row h-full">
                <div className="w-full md:w-1/2 bg-hover p-8 flex items-center justify-center">
                  <div className={`relative w-full max-w-[200px] shadow-2xl overflow-hidden ${radius === 'rounded' ? 'rounded-xl' : 'rounded-sm'}`}>
                    <img src={bookDetail.cover} className="w-full h-auto aspect-[2/3] object-cover" alt="" />
                    <div className="absolute top-2 left-2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{bookDetail.size}</div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 p-8 flex flex-col">
                  <button onClick={() => setBookDetail(null)} className="absolute top-4 right-4 p-2 hover:bg-hover rounded-full transition-colors"><X className="w-5 h-5"/></button>
                  <div className="flex-1">
                    <h2 className="text-2xl font-black mb-2 leading-tight">{bookDetail.name}</h2>
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-bold mb-6">
                       <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {bookDetail.date}</span>
                       <span className="flex items-center gap-1"><LayoutGrid className="w-3 h-3"/> {bookDetail.size}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-8">
                       <button 
                        onClick={() => updateBook(bookDetail.id, { isFavorite: !bookDetail.isFavorite })}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${bookDetail.isFavorite ? 'bg-yellow-400 text-black' : 'bg-hover text-main'}`}
                       >
                         <Star className={`w-4 h-4 ${bookDetail.isFavorite ? 'fill-current' : ''}`} />
                         {t.favorites}
                       </button>
                       <button 
                        onClick={() => updateBook(bookDetail.id, { isRead: !bookDetail.isRead })}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${bookDetail.isRead ? 'bg-green-500 text-white' : 'bg-hover text-main'}`}
                       >
                         <CheckCircle2 className="w-4 h-4" />
                         {t.markRead}
                       </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setSelectedBook(bookDetail); setBookDetail(null); }}
                      className="flex-1 bg-accent text-black py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/20 active:scale-95 transition-all"
                    >
                      <BookOpen className="w-5 h-5" />
                      {lang === 'ar' ? 'بدء القراءة' : 'Start Reading'}
                    </button>
                    <a 
                      href={bookDetail.pdfData} 
                      download={`${bookDetail.name}.pdf`}
                      className="p-4 bg-hover text-main rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAuth(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-sm bg-main border border-custom shadow-2xl p-8 ${radius === 'rounded' ? 'rounded-3xl' : 'rounded-lg'}`}
            >
              <button onClick={() => setShowAuth(false)} className="absolute top-4 right-4 p-2 hover:bg-hover rounded-full transition-colors"><X className="w-4 h-4"/></button>
              
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                  <Logo className="w-10 h-10 text-accent" />
                </div>
                <h2 className="text-xl font-black mb-1">{authMode === 'login' ? (lang === 'ar' ? 'تسجيل دخول' : 'Sign In') : (lang === 'ar' ? 'إنشاء حساب' : 'Create Account')}</h2>
                <p className="text-[10px] text-gray-400">{lang === 'ar' ? 'مرحباً بك في نيكسوفيك' : 'Welcome to NIXUVIK'}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                  <input 
                    type="email" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-10 bg-hover border border-custom rounded-custom px-4 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                  <input 
                    type="password" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 bg-hover border border-custom rounded-custom px-4 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <button 
                  onClick={handleAuth}
                  disabled={loading}
                  className="w-full h-10 bg-accent text-black font-black rounded-custom shadow-lg shadow-accent/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (authMode === 'login' ? <LogIn className="w-4 h-4" /> : <Zap className="w-4 h-4" />)}
                  {authMode === 'login' ? (lang === 'ar' ? 'دخول' : 'Login') : (lang === 'ar' ? 'إنشاء الحساب' : 'Create Account')}
                </button>
              </div>

              <div className="mt-6 flex flex-col items-center gap-2">
                 <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-[10px] font-bold text-accent hover:underline"
                 >
                   {authMode === 'login' ? (lang === 'ar' ? 'ليس لديك حساب؟ سجل الآن' : 'No account? Sign up') : (lang === 'ar' ? 'لديك حساب بالفعل؟ ادخل' : 'Have an account? Login')}
                 </button>
                 <p className="text-[9px] text-center text-gray-500 opacity-50">
                  {lang === 'ar' ? 'بالاستمرار، أنت توافق على شروط الاستخدام' : 'By continuing, you agree to our terms of service'}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF Viewer Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/98 z-50 flex flex-col">
          <div className="h-16 bg-black flex justify-between items-center px-6 text-white border-b border-gray-900">
            <div className="flex items-center gap-4 truncate">
               <div className="bg-accent text-black px-2 py-0.5 rounded text-[10px] font-black">PDF</div>
               <h3 className="font-bold truncate max-w-xl">{selectedBook.name}</h3>
            </div>
            <button 
              onClick={() => setSelectedBook(null)} 
              className="bg-white/10 hover:bg-red-500 text-white px-5 py-2 rounded-custom font-bold flex items-center gap-2 transition-all"
            >
              <span>{t.close}</span>
              <X className="w-4 h-4" />
            </button>
          </div>
          <iframe 
            src={selectedBook.pdfData} 
            className="w-full flex-1 border-none bg-white"
          />
        </div>
      )}
    </div>
  );
}