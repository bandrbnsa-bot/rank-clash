import React, { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { 
  Swords, FlaskConical, Ship, Gamepad2, Globe, GripVertical, 
  CheckCircle2, Trophy, Crosshair, Target, Shield, MonitorPlay, 
  Tv, Coffee, Medal, Crown, Star, RotateCcw, Play, XCircle,
  Users, User, Plus, LogIn, ArrowRight, Car, Zap, Link,
  Volume2, VolumeX, Cpu, Flame, Sparkles, CloudRain, Sun
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, update } from 'firebase/database';

// -----------------------------------------
// 1. إعدادات Firebase
// -----------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDK1jePH_VwaoMl6mDiv5RZJGFYf5t5cK8",
  authDomain: "rank-clash-84320.firebaseapp.com",
  databaseURL: "https://rank-clash-84320-default-rtdb.firebaseio.com",
  projectId: "rank-clash-84320",
  storageBucket: "rank-clash-84320.firebasestorage.app",
  messagingSenderId: "509753660129",
  appId: "1:509753660129:web:aa5bc1df55da867d549da0"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// -----------------------------------------
// 2. محرك الصوتيات (نقرات ناعمة جداً)
// -----------------------------------------
const playSound = (type, isMuted) => {
  if (isMuted) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (!ctx) return;

    const playOsc = (freq, type, startTime, duration, vol) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    if (type === 'click') {
      playOsc(150, 'sine', now, 0.05, 0.03); 
    } else if (type === 'confirm') {
      playOsc(440, 'sine', now, 0.2, 0.03);
      playOsc(554, 'sine', now + 0.1, 0.3, 0.03);
    } else if (type === 'match') {
      playOsc(261.63, 'sine', now, 0.4, 0.04);
      playOsc(329.63, 'sine', now, 0.4, 0.04);
      playOsc(392.00, 'sine', now, 0.4, 0.04);
    } else if (type === 'fail') {
      playOsc(150, 'sine', now, 0.2, 0.04);
    }
  } catch (e) { console.error('Audio failed', e); }
};

// -----------------------------------------
// 3. بنوك البيانات (محدثة وصياغة احترافية)
// -----------------------------------------
const SOLO_GAME_DATA = {
  marvel_boxoffice: {
    title: 'إيرادات أفلام مارفل', criteria: 'حسب أعلى إيرادات في شباك التذاكر',
    items: [
      { id: 'endgame', nameAr: 'أفنجرز: إند قيم', nameEn: 'Avengers: Endgame', icon: <Globe className="w-5 h-5 text-purple-400" />, actualValue: '$2.79 مليار' },
      { id: 'infinity', nameAr: 'أفنجرز: إنفينيتي وور', nameEn: 'Avengers: Infinity War', icon: <Shield className="w-5 h-5 text-yellow-500" />, actualValue: '$2.05 مليار' },
      { id: 'nowayhome', nameAr: 'سبايدرمان: نو واي هوم', nameEn: 'No Way Home', icon: <Target className="w-5 h-5 text-red-500" />, actualValue: '$1.92 مليار' },
      { id: 'avengers1', nameAr: 'ذا أفنجرز (الأول)', nameEn: 'The Avengers', icon: <Star className="w-5 h-5 text-blue-400" />, actualValue: '$1.52 مليار' }
    ]
  },
  cars_speed: {
    title: 'سيارات خارقة', criteria: 'حسب التسارع من 0 إلى 100 كم/س (الأسرع أولاً)',
    items: [
      { id: 'rimac', nameAr: 'ريماك نيفيرا', nameEn: 'Rimac Nevera', icon: <Zap className="w-5 h-5 text-cyan-400" />, actualValue: '1.81 ثانية' },
      { id: 'tesla', nameAr: 'تيسلا بلايد', nameEn: 'Model S Plaid', icon: <Cpu className="w-5 h-5 text-blue-400" />, actualValue: '1.99 ثانية' },
      { id: 'porsche', nameAr: 'بورشه 911 تيربو إس', nameEn: '911 Turbo S', icon: <Target className="w-5 h-5 text-yellow-400" />, actualValue: '2.6 ثانية' },
      { id: 'lambo', nameAr: 'لامبورجيني أفينتادور', nameEn: 'Aventador SVJ', icon: <Star className="w-5 h-5 text-orange-400" />, actualValue: '2.8 ثانية' }
    ]
  },
  games_meta: {
    title: 'ألعاب أسطورية', criteria: 'حسب التقييم العالمي (Metacritic)',
    items: [
      { id: 'zelda', nameAr: 'زيلدا أوكارينا أوف تايم', nameEn: 'Zelda: Ocarina of Time', icon: <Crown className="w-5 h-5 text-yellow-500" />, actualValue: 'تقييم: 99' },
      { id: 'rdr2', nameAr: 'ريد ديد ريدمبشن 2', nameEn: 'Red Dead Redemption 2', icon: <Target className="w-5 h-5 text-red-500" />, actualValue: 'تقييم: 97' },
      { id: 're4', nameAr: 'ريزدنت إيفل 4', nameEn: 'Resident Evil 4 (2005)', icon: <Shield className="w-5 h-5 text-slate-300" />, actualValue: 'تقييم: 96' },
      { id: 'tlou', nameAr: 'ذا لاست أوف أس', nameEn: 'The Last of Us', icon: <Swords className="w-5 h-5 text-emerald-500" />, actualValue: 'تقييم: 95' }
    ]
  },
  tv_imdb: {
    title: 'مسلسلات أجنبية', criteria: 'حسب التقييم العالمي (IMDb)',
    items: [
      { id: 'bb', nameAr: 'بريكينق باد', nameEn: 'Breaking Bad', icon: <FlaskConical className="w-5 h-5 text-emerald-400" />, actualValue: 'تقييم: 9.5' },
      { id: 'wire', nameAr: 'ذا واير', nameEn: 'The Wire', icon: <Tv className="w-5 h-5 text-slate-300" />, actualValue: 'تقييم: 9.3' },
      { id: 'sopranos', nameAr: 'السوبرانوز', nameEn: 'The Sopranos', icon: <Target className="w-5 h-5 text-red-400" />, actualValue: 'تقييم: 9.2' },
      { id: 'peaky', nameAr: 'بيكي بلايندرز', nameEn: 'Peaky Blinders', icon: <MonitorPlay className="w-5 h-5 text-amber-600" />, actualValue: 'تقييم: 8.8' }
    ]
  },
  tech_age: {
    title: 'شركات التقنية', criteria: 'حسب سنة التأسيس (الأقدم أولاً)',
    items: [
      { id: 'ibm', nameAr: 'آي بي إم', nameEn: 'IBM', icon: <MonitorPlay className="w-5 h-5 text-blue-500" />, actualValue: 'تأسست 1911' },
      { id: 'microsoft', nameAr: 'مايكروسوفت', nameEn: 'Microsoft', icon: <Cpu className="w-5 h-5 text-blue-300" />, actualValue: 'تأسست 1975' },
      { id: 'apple', nameAr: 'أبل', nameEn: 'Apple', icon: <Target className="w-5 h-5 text-slate-300" />, actualValue: 'تأسست 1976' },
      { id: 'google', nameAr: 'قوقل', nameEn: 'Google', icon: <Globe className="w-5 h-5 text-red-400" />, actualValue: 'تأسست 1998' }
    ]
  },
  football_ballondor: {
    title: 'أساطير كرة القدم', criteria: 'حسب عدد الكرات الذهبية',
    items: [
      { id: 'messi', nameAr: 'ليونيل ميسي', nameEn: 'Lionel Messi', icon: <Trophy className="w-5 h-5 text-yellow-400" />, actualValue: '8 كرات' },
      { id: 'ronaldo', nameAr: 'كريستيانو رونالدو', nameEn: 'Cristiano Ronaldo', icon: <Medal className="w-5 h-5 text-slate-300" />, actualValue: '5 كرات' },
      { id: 'platini', nameAr: 'ميشيل بلاتيني', nameEn: 'Michel Platini', icon: <Star className="w-5 h-5 text-blue-400" />, actualValue: '3 كرات' },
      { id: 'zidane', nameAr: 'زين الدين زيدان', nameEn: 'Zinedine Zidane', icon: <Crown className="w-5 h-5 text-yellow-600" />, actualValue: 'كرة واحدة' }
    ]
  },
  anime_mal: {
    title: 'أنميات مشهورة', criteria: 'حسب التقييم العالمي (MAL)',
    items: [
      { id: 'fma', nameAr: 'فل ميتال ألكميست', nameEn: 'FMA: Brotherhood', icon: <FlaskConical className="w-5 h-5 text-amber-400" />, actualValue: 'تقييم: 9.10' },
      { id: 'hxh', nameAr: 'هنتر x هنتر', nameEn: 'Hunter x Hunter', icon: <Target className="w-5 h-5 text-green-400" />, actualValue: 'تقييم: 9.04' },
      { id: 'steins', nameAr: 'شتاينز جيت', nameEn: 'Steins;Gate', icon: <Cpu className="w-5 h-5 text-purple-400" />, actualValue: 'تقييم: 9.07' },
      { id: 'aot', nameAr: 'أتاك أون تايتان', nameEn: 'Attack on Titan', icon: <Swords className="w-5 h-5 text-red-400" />, actualValue: 'تقييم: 8.54' }
    ]
  }
};

const ONLINE_GAME_DATA = {
  marvel_heroes_fav: {
    title: 'أبطال مارفل', criteria: 'مين بطلك المفضل؟',
    items: [
      { id: 'ironman', nameAr: 'آيرون مان', nameEn: 'Iron Man', icon: <Zap className="w-5 h-5 text-red-500" /> },
      { id: 'thor', nameAr: 'ثور', nameEn: 'Thor', icon: <Flame className="w-5 h-5 text-yellow-400" /> },
      { id: 'cap', nameAr: 'كابتن أمريكا', nameEn: 'Captain America', icon: <Shield className="w-5 h-5 text-blue-500" /> },
      { id: 'spidey', nameAr: 'سبايدرمان', nameEn: 'Spider-Man', icon: <Target className="w-5 h-5 text-red-400" /> }
    ]
  },
  marvel_movies_fav: {
    title: 'أفلام مارفل', criteria: 'أفضل فيلم استمتعت فيه',
    items: [
      { id: 'endgame', nameAr: 'إند قيم', nameEn: 'Avengers: Endgame', icon: <Globe className="w-5 h-5 text-purple-400" /> },
      { id: 'infinity', nameAr: 'إنفينيتي وور', nameEn: 'Avengers: Infinity War', icon: <Shield className="w-5 h-5 text-yellow-500" /> },
      { id: 'nowayhome', nameAr: 'نو واي هوم', nameEn: 'Spider-Man: No Way Home', icon: <Target className="w-5 h-5 text-red-500" /> },
      { id: 'civilwar', nameAr: 'سيفيل وور', nameEn: 'Captain America: Civil War', icon: <Swords className="w-5 h-5 text-blue-400" /> }
    ]
  },
  gaming_icons_fav: {
    title: 'شخصيات الألعاب', criteria: 'الشخصية المفضلة لك',
    items: [
      { id: 'arthur', nameAr: 'آرثر مورغان', nameEn: 'Arthur Morgan', icon: <Target className="w-5 h-5 text-yellow-600" /> },
      { id: 'kratos', nameAr: 'كراتوس', nameEn: 'Kratos', icon: <Swords className="w-5 h-5 text-red-600" /> },
      { id: 'leon', nameAr: 'ليون كينيدي', nameEn: 'Leon Kennedy', icon: <Crosshair className="w-5 h-5 text-blue-400" /> },
      { id: 'joel', nameAr: 'جول ميلر', nameEn: 'Joel Miller', icon: <Shield className="w-5 h-5 text-emerald-500" /> }
    ]
  },
  anime_badass: {
    title: 'شخصيات الأنمي', criteria: 'أفضل شخصية بالنسبة لك',
    items: [
      { id: 'eren', nameAr: 'إيرين ييغر', nameEn: 'Eren Yeager', icon: <Flame className="w-5 h-5 text-red-500" /> },
      { id: 'thorfinn', nameAr: 'ثورفين', nameEn: 'Thorfinn', icon: <Swords className="w-5 h-5 text-slate-300" /> },
      { id: 'zoro', nameAr: 'رورونوا زورو', nameEn: 'Zoro', icon: <Swords className="w-5 h-5 text-green-400" /> },
      { id: 'levi', nameAr: 'ليفاي أكرمان', nameEn: 'Levi', icon: <Target className="w-5 h-5 text-slate-500" /> }
    ]
  },
  dream_cars: {
    title: 'سيارات الأحلام', criteria: 'لو بتختار سيارة أحلامك.. وش الترتيب؟',
    items: [
      { id: 'chiron', nameAr: 'بوغاتي شيرون', nameEn: 'Bugatti Chiron', icon: <Car className="w-5 h-5 text-blue-500" /> },
      { id: 'gt3rs', nameAr: 'بورشه 911 GT3 RS', nameEn: 'Porsche 911 GT3 RS', icon: <Target className="w-5 h-5 text-yellow-400" /> },
      { id: 'gclass', nameAr: 'مرسيدس جي كلاس', nameEn: 'Mercedes G-Class', icon: <Shield className="w-5 h-5 text-slate-300" /> },
      { id: 'rover', nameAr: 'رينج روفر', nameEn: 'Range Rover', icon: <Crown className="w-5 h-5 text-green-900" /> }
    ]
  },
  coffee_style: {
    title: 'قهوتك المفضلة', criteria: 'المزاج اليومي اللي تفضله',
    items: [
      { id: 'v60', nameAr: 'قهوة مقطرة (V60)', nameEn: 'V60 Filter Coffee', icon: <FlaskConical className="w-5 h-5 text-amber-500" /> },
      { id: 'espresso', nameAr: 'إسبرسو', nameEn: 'Espresso', icon: <Coffee className="w-5 h-5 text-slate-400" /> },
      { id: 'flatwhite', nameAr: 'فلات وايت', nameEn: 'Flat White', icon: <Coffee className="w-5 h-5 text-orange-200" /> },
      { id: 'icedlatte', nameAr: 'آيس لاتيه', nameEn: 'Iced Latte', icon: <Coffee className="w-5 h-5 text-blue-300" /> }
    ]
  },
  seasons_weather: {
    title: 'فصول السنة', criteria: 'الجو والفصل الأقرب لقلبك',
    items: [
      { id: 'winter', nameAr: 'شتاء ومطر', nameEn: 'Winter & Rain', icon: <CloudRain className="w-5 h-5 text-cyan-300" /> },
      { id: 'spring', nameAr: 'ربيع وأجواء حلوة', nameEn: 'Spring Breeze', icon: <Sparkles className="w-5 h-5 text-green-400" /> },
      { id: 'summer', nameAr: 'صيف وبحر', nameEn: 'Summer Beach', icon: <Sun className="w-5 h-5 text-yellow-500" /> },
      { id: 'autumn', nameAr: 'خريف وغيوم', nameEn: 'Autumn Winds', icon: <Target className="w-5 h-5 text-orange-400" /> }
    ]
  },
  day_times: {
    title: 'أوقات اليوم', criteria: 'الوقت اللي تروق فيه أكثر',
    items: [
      { id: 'dawn', nameAr: 'الفجر', nameEn: 'Dawn', icon: <Sparkles className="w-5 h-5 text-indigo-300" /> },
      { id: 'morning', nameAr: 'الصباح الباكر', nameEn: 'Early Morning', icon: <Coffee className="w-5 h-5 text-yellow-300" /> },
      { id: 'sunset', nameAr: 'وقت الغروب', nameEn: 'Sunset', icon: <Globe className="w-5 h-5 text-orange-500" /> },
      { id: 'night', nameAr: 'آخر الليل', nameEn: 'Late Night', icon: <Tv className="w-5 h-5 text-slate-400" /> }
    ]
  },
  tv_characters: {
    title: 'شخصيات المسلسلات', criteria: 'أفضل شخصية مسلسل',
    items: [
      { id: 'walter', nameAr: 'والتر وايت', nameEn: 'Walter White', icon: <FlaskConical className="w-5 h-5 text-emerald-400" /> },
      { id: 'tommy', nameAr: 'توماس شيلبي', nameEn: 'Thomas Shelby', icon: <Crown className="w-5 h-5 text-amber-600" /> },
      { id: 'saul', nameAr: 'ساول غودمان', nameEn: 'Saul Goodman', icon: <Target className="w-5 h-5 text-yellow-400" /> },
      { id: 'tyrion', nameAr: 'تيريون لانستر', nameEn: 'Tyrion Lannister', icon: <Star className="w-5 h-5 text-purple-400" /> }
    ]
  },
  gaming_genres: {
    title: 'تصنيف الألعاب', criteria: 'نوع الألعاب اللي تفضله',
    items: [
      { id: 'story', nameAr: 'قصة وتختيم', nameEn: 'Story Games', icon: <Gamepad2 className="w-5 h-5 text-yellow-500" /> },
      { id: 'shooter', nameAr: 'شوتر تنافسي', nameEn: 'Shooter', icon: <Crosshair className="w-5 h-5 text-red-500" /> },
      { id: 'openworld', nameAr: 'عالم مفتوح', nameEn: 'Open World', icon: <Globe className="w-5 h-5 text-green-400" /> },
      { id: 'horror', nameAr: 'رعب', nameEn: 'Horror', icon: <Flame className="w-5 h-5 text-purple-600" /> }
    ]
  }
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const generateRoomCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

const findItemGlobal = (id) => {
  for (const cat of Object.values(ONLINE_GAME_DATA)) {
    const found = cat.items.find((i) => i.id === id);
    if (found) return found;
  }
  return null;
};

// -----------------------------------------
// 4. المكون الرئيسي (بنية Mobile-First)
// -----------------------------------------
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [finalScore, setFinalScore] = useState(0);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('rankClashName') || '');
  const [roomCode, setRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [initialJoinCode, setInitialJoinCode] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
      setInitialJoinCode(room.toUpperCase());
      setCurrentScreen('online_setup');
    }
  }, []);

  const handleNameUpdate = (newName) => {
    setPlayerName(newName);
    localStorage.setItem('rankClashName', newName);
  };

  return (
    // تم إلغاء منع اللمس العام، وتحديد الارتفاع ليكون 100dvh مع إخفاء الأطراف لضمان بقاء الأزرار داخل الشاشة
    <div dir="rtl" className="h-[100dvh] w-full bg-[#0A0B1E] text-white font-sans overflow-hidden relative selection:bg-cyan-500/30 flex justify-center">
      
      {/* خلفية كحلي ليلي (Cosmic Velvet) */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[60%] bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[120%] h-[60%] bg-cyan-600/10 blur-[120px] pointer-events-none" />

      {/* زر الصوت */}
      <button 
        onClick={() => { playSound('click', !isMuted); setIsMuted(!isMuted); }} 
        className="absolute top-4 left-4 z-50 p-2.5 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-md text-slate-400 hover:text-white transition-all shadow-lg"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md h-full flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          {currentScreen === 'home' && (
            <HomeScreen key="home" onSoloStart={() => { playSound('click', isMuted); setCurrentScreen('solo_game'); }} onOnlineStart={() => { playSound('click', isMuted); setCurrentScreen('online_setup'); }} />
          )}
          
          {currentScreen === 'solo_game' && (
            <SoloGameArena key="solo_game" isMuted={isMuted} onBack={() => { playSound('click', isMuted); setCurrentScreen('home'); }} onEndGame={(score) => { setFinalScore(score); playSound('match', isMuted); setCurrentScreen('solo_result'); }} />
          )}
          
          {currentScreen === 'solo_result' && (
            <SoloResultScreen key="solo_result" score={finalScore} onRestart={() => { playSound('click', isMuted); setCurrentScreen('home'); }} />
          )}

          {currentScreen === 'online_setup' && (
            <OnlineSetupScreen key="online_setup" savedName={playerName} initialCode={initialJoinCode} isMuted={isMuted} onNameUpdate={handleNameUpdate} onBack={() => { playSound('click', isMuted); setCurrentScreen('home'); }} onRoomJoined={(code, hostStatus) => { playSound('confirm', isMuted); setRoomCode(code); setIsHost(hostStatus); setCurrentScreen('lobby'); window.history.replaceState({}, document.title, window.location.pathname); }} />
          )}

          {currentScreen === 'lobby' && (
            <LobbyScreen key="lobby" playerName={playerName} roomCode={roomCode} isHost={isHost} isMuted={isMuted} onBack={() => { playSound('click', isMuted); setCurrentScreen('online_setup'); }} onStartGame={() => { playSound('confirm', isMuted); setCurrentScreen('online_game'); }} />
          )}

          {currentScreen === 'online_game' && (
            <OnlineGameArena key="online_game" playerName={playerName} roomCode={roomCode} isHost={isHost} isMuted={isMuted} onEndGame={(compatibilityScore) => { setFinalScore(compatibilityScore); playSound('match', isMuted); setCurrentScreen('online_result'); }} onExit={() => { playSound('click', isMuted); setCurrentScreen('home'); }} />
          )}

          {currentScreen === 'online_result' && (
            <OnlineResultScreen key="online_result" score={finalScore} onRestart={() => { playSound('click', isMuted); setCurrentScreen('home'); }} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// -----------------------------------------
// الشاشات
// -----------------------------------------
function HomeScreen({ onSoloStart, onOnlineStart }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="w-full flex flex-col flex-1 px-4 py-8">
      <div className="flex flex-col items-center gap-4 mt-12 shrink-0">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="relative">
          <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
          <Trophy className="w-24 h-24 text-cyan-400 relative z-10 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
        </motion.div>
        <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-50 to-cyan-300 pb-1">رتبها صح</h1>
        <div className="bg-white/[0.03] border border-white/10 px-5 py-1.5 rounded-full backdrop-blur-md">
          <p className="text-cyan-200/80 text-[10px] font-bold tracking-widest uppercase">تحدي التقييم والذوق</p>
        </div>
      </div>

      <div className="w-full flex flex-col gap-3 mt-auto shrink-0 pb-6">
        <motion.button onClick={onSoloStart} whileTap={{ scale: 0.97 }} className="w-full flex items-center justify-center gap-3 bg-white/[0.03] p-4 rounded-2xl border border-white/10 hover:bg-white/[0.06] transition-colors backdrop-blur-md text-white shadow-lg">
          <Gamepad2 className="w-6 h-6 text-slate-300" />
          <div className="flex flex-col items-start">
            <span className="font-black text-lg">لعب فردي</span>
            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">أرقام وحقائق</span>
          </div>
        </motion.button>

        <motion.button onClick={onOnlineStart} whileTap={{ scale: 0.97 }} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-400/30 p-4 rounded-2xl text-white shadow-[0_0_20px_rgba(34,211,238,0.2)] backdrop-blur-md">
          <Globe className="w-6 h-6 text-cyan-100" />
          <div className="flex flex-col items-start">
            <span className="font-black text-lg">تحدى صديق</span>
            <span className="text-[10px] text-cyan-200/70 font-bold tracking-widest uppercase">قياس التوافق</span>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}

function OnlineSetupScreen({ savedName, initialCode, isMuted, onNameUpdate, onBack, onRoomJoined }) {
  const [joinCode, setJoinCode] = useState(initialCode || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!savedName.trim()) return setError('اكتب اسمك أولاً');
    playSound('click', isMuted); setIsLoading(true);
    const code = generateRoomCode();
    try {
      await set(ref(db, `rooms/${code}`), { status: 'waiting', host: savedName, players: { [savedName]: { score: 0 } } });
      onRoomJoined(code, true);
    } catch (err) { setError('خطأ في الاتصال'); setIsLoading(false); }
  };

  const handleJoinRoom = async () => {
    if (!savedName.trim()) return setError('اكتب اسمك أولاً');
    if (joinCode.length !== 4) return setError('الكود 4 أحرف');
    playSound('click', isMuted); setIsLoading(true);
    const upperCode = joinCode.toUpperCase();
    try {
      const snapshot = await get(ref(db, `rooms/${upperCode}`));
      if (snapshot.exists()) {
        const roomData = snapshot.val();
        if (roomData.status !== 'waiting') { setError('اللعبة بدأت'); setIsLoading(false); return; }
        if (Object.keys(roomData.players || {}).length >= 2) { setError('الغرفة مليانة'); setIsLoading(false); return; }
        await update(ref(db, `rooms/${upperCode}/players`), { [savedName]: { score: 0 } });
        onRoomJoined(upperCode, false);
      } else { setError('الغرفة غير موجودة'); setIsLoading(false); }
    } catch (err) { setError('خطأ في الانضمام'); setIsLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full flex flex-col flex-1 px-4 py-6">
      <header className="flex items-center shrink-0 mb-6">
        <button onClick={onBack} className="text-slate-400 bg-white/[0.03] p-2 rounded-xl border border-white/10 flex items-center gap-2 backdrop-blur-md"><ArrowRight className="w-5 h-5" /></button>
      </header>
      <div className="flex flex-col flex-1 justify-center gap-5 pb-10">
        <div className="text-center shrink-0">
          <h2 className="text-3xl font-black text-white mb-1">لعب أونلاين</h2>
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider">قياس التوافق بين لاعبين</p>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-2.5 rounded-xl text-center text-xs font-bold backdrop-blur-md shrink-0">{error}</div>}
        <div className="flex flex-col gap-2 shrink-0">
          <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-wider">اسمك (يظهر لخصمك)</label>
          <div className="relative">
            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="اكتب اسمك..." value={savedName} onChange={(e) => { onNameUpdate(e.target.value); setError(''); }} className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 pr-10 pl-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-black text-base backdrop-blur-md" maxLength={12} />
          </div>
        </div>
        <div className="flex flex-col gap-3 shrink-0 mt-4">
          <motion.button onClick={handleCreateRoom} disabled={isLoading} whileTap={{ scale: 0.97 }} className="w-full flex items-center justify-center gap-2 font-black text-base p-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-400/30 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Plus className="w-5 h-5" /><span>إنشاء غرفة جديدة</span>
          </motion.button>
          <div className="relative flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-white/10" /><span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">أو الانضمام بالكود</span><div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="كود الغرفة" value={joinCode} onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setError(''); }} className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl py-3 px-3 text-center text-white focus:outline-none focus:border-cyan-500/50 font-black uppercase tracking-widest text-xl backdrop-blur-md" maxLength={4} />
            <motion.button onClick={handleJoinRoom} disabled={isLoading} whileTap={{ scale: 0.97 }} className="p-3 rounded-xl flex items-center justify-center min-w-[70px] bg-white/[0.05] border border-white/10 text-cyan-400 hover:bg-white/10 transition-all">
              <LogIn className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LobbyScreen({ playerName, roomCode, isHost, isMuted, onBack, onStartGame }) {
  const [players, setPlayers] = useState([]);
  const [hostName, setHostName] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setHostName(data.host);
        if (data.players) {
          const currentPlayers = Object.keys(data.players);
          if (currentPlayers.length > players.length && players.length > 0) playSound('confirm', isMuted);
          setPlayers(currentPlayers);
        }
        if (data.status === 'playing') onStartGame();
      } else { onBack(); }
    });
    return () => unsubscribe();
  }, [roomCode, db, onBack, onStartGame, players.length, isMuted]);

  const handleCopyLink = () => {
    playSound('click', isMuted);
    navigator.clipboard.writeText(`${window.location.origin}?room=${roomCode}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = async () => {
    playSound('click', isMuted);
    try {
      const newPlayers = players.filter(p => p !== playerName);
      if (newPlayers.length === 0) await set(ref(db, `rooms/${roomCode}`), null);
      else {
        await set(ref(db, `rooms/${roomCode}/players/${playerName}`), null);
        if (isHost) await update(ref(db, `rooms/${roomCode}`), { host: newPlayers[0] });
      }
      onBack();
    } catch (err) { onBack(); }
  };

  const startMatch = async () => {
    playSound('click', isMuted);
    const selectedQuestionIds = shuffleArray(Object.keys(ONLINE_GAME_DATA)).slice(0, 10);
    await update(ref(db, `rooms/${roomCode}`), { status: 'playing', game: { questionIds: selectedQuestionIds, currentRound: 0, rounds: {} } });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full flex flex-col flex-1 px-4 py-6">
      <header className="flex items-center justify-between shrink-0 mb-6">
        <button onClick={handleLeaveRoom} className="text-red-400 text-[10px] font-bold bg-white/[0.03] px-3 py-2 rounded-full border border-white/10">مغادرة</button>
        <div className="flex items-center gap-1.5 bg-white/[0.03] px-3 py-2 rounded-full border border-white/10">
          <Users className="w-3.5 h-3.5 text-cyan-400" /><span className="font-bold text-[10px]">{players.length} / 2</span>
        </div>
      </header>

      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 mb-5 shadow-lg relative flex flex-col items-center backdrop-blur-md shrink-0">
        <span className="text-slate-400 text-[9px] font-bold mb-2 uppercase tracking-widest bg-white/[0.05] px-2.5 py-1 rounded-full">كود الغرفة</span>
        <div className="flex items-center justify-center w-full mb-4">
          <span className="text-4xl font-black tracking-[0.3em] text-white ml-2 drop-shadow-md">{roomCode}</span>
        </div>
        <button onClick={handleCopyLink} className={`w-full flex items-center justify-center gap-1.5 text-[11px] font-bold px-4 py-3 rounded-xl transition-all border ${copied ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}>
          {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
          {copied ? 'تم نسخ الرابط!' : 'انسخ رابط الدعوة'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5">
        <h3 className="text-slate-500 text-[9px] font-bold mb-0.5 ml-1 uppercase tracking-widest">اللاعبون:</h3>
        <AnimatePresence>
          {players.map((player) => (
            <motion.div key={player} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center justify-between bg-white/[0.02] border border-white/10 p-3 rounded-2xl backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${player === hostName ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/10'}`}>
                  {player === hostName ? <Crown className="w-4 h-4 text-cyan-400" /> : <User className="w-4 h-4 text-slate-500" />}
                </div>
                <div className="flex flex-col">
                  <span className={`font-black text-sm leading-tight ${player === playerName ? 'text-cyan-300' : 'text-slate-200'}`}>{player} {player === playerName && <span className="text-[8px] font-bold opacity-50 ml-1 bg-white/10 px-1.5 py-0.5 rounded uppercase">أنت</span>}</span>
                </div>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)] animate-pulse" />
            </motion.div>
          ))}
          {players.length === 1 && (
            <div className="flex items-center gap-3 bg-white/[0.01] border border-white/10 border-dashed p-3 rounded-2xl opacity-50 shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-black/20"><User className="w-4 h-4 text-slate-600" /></div>
              <span className="font-bold text-xs text-slate-500">في انتظار الخصم...</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 shrink-0 pb-6">
        {isHost ? (
          <motion.button onClick={startMatch} disabled={players.length !== 2} whileTap={players.length === 2 ? { scale: 0.97 } : {}} className={`w-full flex items-center justify-center gap-2 font-black text-base p-4 rounded-xl transition-all border ${players.length === 2 ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400/30 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-white/5 text-slate-500 border-white/10 cursor-not-allowed'}`}>
            <Play className="w-4 h-4 rotate-180" /><span>{players.length === 2 ? 'بدء اللعبة' : 'اكتمل العدد للبدء'}</span>
          </motion.button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 p-4 rounded-xl"><div className="w-3.5 h-3.5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /><span className="font-bold text-xs text-slate-400">في انتظار المضيف...</span></div>
        )}
      </div>
    </motion.div>
  );
}

// -----------------------------------------
// شاشة الأونلاين (تصميم مرن لا يقص الأزرار)
// -----------------------------------------
function OnlineGameArena({ playerName, roomCode, isHost, isMuted, onEndGame, onExit }) {
  const [gameData, setGameData] = useState(null);
  const [items, setItems] = useState([]);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [calculatedTotalScore, setCalculatedTotalScore] = useState(0);
  const [activeRoundIndex, setActiveRoundIndex] = useState(null);

  useEffect(() => {
    const gameRef = ref(db, `rooms/${roomCode}/game`);
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) { onExit(); return; }
      setGameData(data);

      if (activeRoundIndex !== null && data.currentRound !== activeRoundIndex) {
        setHasConfirmed(false);
        setRoundResult(null);
      }
      setActiveRoundIndex(data.currentRound);
      
      if (data.questionIds) {
        const qId = data.questionIds[data.currentRound];
        const currentQ = ONLINE_GAME_DATA[qId];
        if (items.length === 0 || !items.some(i => currentQ.items.map(ci => ci.id).includes(i.id))) {
          setItems(shuffleArray(currentQ.items));
        }
      }

      if (data.rounds) {
        let total = 0;
        let currentRoundMatches = null;
        const currentRoundData = data.rounds[data.currentRound];
        const playersWhoConfirmedCurrent = currentRoundData ? Object.keys(currentRoundData) : [];
        const opponentName = Object.keys(data.rounds[0] || {}).find(p => p !== playerName) || 
                             (playersWhoConfirmedCurrent.length === 2 ? playersWhoConfirmedCurrent.find(p => p !== playerName) : null);

        if (opponentName) {
           Object.keys(data.rounds).forEach(rIndex => {
               const rData = data.rounds[rIndex];
               if (rData[playerName] && rData[opponentName]) {
                   let matches = 0;
                   for(let i=0; i<4; i++) { if(rData[playerName][i] === rData[opponentName][i]) matches++; }
                   total += (matches * 25);
                   if (parseInt(rIndex) === data.currentRound && playersWhoConfirmedCurrent.length === 2 && !roundResult) {
                       currentRoundMatches = { matches, score: matches * 25, opponentName, myOrder: rData[playerName], oppOrder: rData[opponentName] };
                   }
               }
           });
        }
        
        setCalculatedTotalScore(total);

        if (currentRoundMatches && !roundResult) {
           if (currentRoundMatches.matches > 0) playSound('match', isMuted);
           else playSound('fail', isMuted);
           setRoundResult(currentRoundMatches);
        }
      }
    });
    return () => unsubscribe();
  }, [roomCode, playerName, items, onExit, roundResult, isMuted, activeRoundIndex]);

  if (!gameData || !gameData.questionIds) return null;

  const currentRound = gameData.currentRound;
  const qId = gameData.questionIds[currentRound];
  const currentQuestion = ONLINE_GAME_DATA[qId];
  const TOTAL_ROUNDS = 10;
  
  const currentRoundData = gameData.rounds?.[currentRound] || {};
  const playersWhoConfirmed = Object.keys(currentRoundData);
  const waitingForOther = hasConfirmed && playersWhoConfirmed.length < 2;

  const handleConfirm = async () => {
    playSound('confirm', isMuted);
    setHasConfirmed(true);
    await set(ref(db, `rooms/${roomCode}/game/rounds/${currentRound}/${playerName}`), items.map(i => i.id));
  };

  const handleNextRound = async () => {
    playSound('click', isMuted);
    if (currentRound < TOTAL_ROUNDS - 1) {
      setHasConfirmed(false); setRoundResult(null);
      await update(ref(db, `rooms/${roomCode}/game`), { currentRound: currentRound + 1 });
    } else {
      const finalCompatibility = (calculatedTotalScore / (TOTAL_ROUNDS * 100)) * 100;
      onEndGame(Math.round(finalCompatibility));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full flex flex-col flex-1 px-4 pt-4 pb-6">
      {/* العداد العلوي */}
      <header className="flex items-center justify-between shrink-0 mb-3">
        <button onClick={onExit} className="text-slate-400 text-[9px] font-bold uppercase tracking-widest bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">خروج</button>
        <div className="flex items-center gap-3 bg-white/[0.03] px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          <div className="flex flex-col items-center"><span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">الجولة</span><span className="text-sm font-black text-slate-200 leading-tight">{currentRound + 1}<span className="text-[10px] text-slate-500">/{TOTAL_ROUNDS}</span></span></div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex flex-col items-center"><span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">التوافق</span><span className="text-sm font-black text-cyan-400 leading-tight">{calculatedTotalScore}</span></div>
        </div>
      </header>

      {/* صندوق السؤال */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 mb-3 relative overflow-visible backdrop-blur-md shrink-0">
        <h2 className="text-cyan-400/80 text-[9px] font-bold uppercase tracking-widest mb-0.5">موضوع الجولة</h2>
        <p className="text-xl font-black text-white leading-tight drop-shadow-md">{currentQuestion.title}</p>
        <p className="text-[11px] font-bold text-slate-400 mt-1">{currentQuestion.criteria}</p>
      </div>

      {/* منطقة البطاقات (مرنة تقبل الضغط) */}
      <div className="flex-1 w-full flex flex-col justify-center relative min-h-0">
        {!roundResult ? (
          <Reorder.Group axis="y" values={items} onReorder={(newOrder) => { if (!hasConfirmed) { playSound('click', isMuted); setItems(newOrder); } }} className="flex flex-col gap-2 relative z-10 h-full justify-center">
            {items.map((item, index) => <OnlineSortableItem key={item.id} item={item} index={index} isConfirmed={hasConfirmed} />)}
          </Reorder.Group>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex w-full gap-2 h-full items-center">
            <div className="flex-1 flex flex-col gap-1.5 w-1/2">
              <div className="bg-white/[0.03] border border-white/10 text-center py-1.5 rounded-xl"><span className="font-bold text-[9px] text-slate-400 uppercase tracking-widest">أنت</span></div>
              {roundResult.myOrder.map((id, idx) => {
                const isMatch = id === roundResult.oppOrder[idx];
                const item = findItemGlobal(id);
                return (
                  <div key={`my-${idx}`} className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-colors h-14 ${isMatch ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/[0.02] border-white/10'}`}>
                    <span className={`font-black text-xs text-center leading-tight line-clamp-2 ${isMatch ? 'text-cyan-300' : 'text-slate-400'}`}>{item?.nameAr || '...'}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex-1 flex flex-col gap-1.5 w-1/2">
              <div className="bg-white/[0.03] border border-white/10 text-center py-1.5 rounded-xl"><span className="font-bold text-[9px] text-slate-400 truncate px-1 block">{roundResult.opponentName}</span></div>
              {roundResult.oppOrder.map((id, idx) => {
                const isMatch = id === roundResult.myOrder[idx];
                const item = findItemGlobal(id);
                return (
                  <div key={`opp-${idx}`} className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-colors h-14 ${isMatch ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/[0.02] border-white/10'}`}>
                    <span className={`font-black text-xs text-center leading-tight line-clamp-2 ${isMatch ? 'text-cyan-300' : 'text-slate-400'}`}>{item?.nameAr || '...'}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* الأزرار السفلية */}
      <div className="mt-3 shrink-0 relative z-20 flex flex-col justify-end">
        <AnimatePresence mode="wait">
          {!hasConfirmed && (
            <motion.button key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} whileTap={{ scale: 0.97 }} onClick={handleConfirm} className="w-full h-12 flex items-center justify-center gap-2 bg-white/10 text-white hover:bg-white/15 font-black text-base rounded-xl border border-white/10 backdrop-blur-md transition-colors">
              <CheckCircle2 className="w-4 h-4" /><span>تأكيد الترتيب</span>
            </motion.button>
          )}
          {waitingForOther && (
             <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-12 flex items-center justify-center gap-2 bg-white/[0.02] border border-white/10 rounded-xl backdrop-blur-md">
               <div className="w-3.5 h-3.5 border-2 border-cyan-500/50 border-t-transparent rounded-full animate-spin" /><span className="font-bold text-xs text-slate-400">في انتظار الخصم...</span>
             </motion.div>
          )}
          {roundResult && (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col gap-2">
              <div className="flex justify-between items-center bg-white/[0.03] border border-white/10 px-3 py-2 rounded-xl backdrop-blur-md">
                <span className="font-bold text-slate-300 text-[10px]">تطابقتوا في: <span className="text-cyan-400 font-black">{roundResult.matches}</span> كروت</span>
                <span className="font-black text-xs text-cyan-400">+{roundResult.score}</span>
              </div>
              {isHost ? (
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleNextRound} className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-sm rounded-xl border border-cyan-500/30">
                  <span>{currentRound === TOTAL_ROUNDS - 1 ? 'النتيجة النهائية' : 'التالي'}</span><Play className="w-3.5 h-3.5 rotate-180" />
                </motion.button>
              ) : (
                <div className="w-full h-12 flex items-center justify-center bg-white/[0.02] rounded-xl border border-white/10 text-[10px] font-bold text-slate-500">في انتظار المضيف...</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function OnlineSortableItem({ item, index, isConfirmed }) {
  const getRankStyle = (idx) => {
    switch(idx) {
      case 0: return 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 text-yellow-400 border-yellow-500/50';
      case 1: return 'bg-gradient-to-br from-slate-300/20 to-slate-500/20 text-slate-300 border-slate-400/50';
      case 2: return 'bg-gradient-to-br from-amber-700/20 to-amber-900/20 text-amber-500 border-amber-700/50';
      default: return 'bg-white/[0.05] text-slate-400 border-white/10';
    }
  };

  return (
    <Reorder.Item 
      value={item} id={item.id} dragListener={!isConfirmed} style={{ touchAction: 'none' }}
      className={`relative flex items-center gap-2.5 p-2.5 rounded-2xl border transition-colors ${isConfirmed ? 'bg-white/[0.02] border-white/10 opacity-50' : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.06] cursor-grab active:cursor-grabbing shadow-sm'}`}
    >
      <div className={`flex items-center justify-center p-1 rounded-md ${isConfirmed ? 'opacity-0' : 'text-slate-500'}`}><GripVertical className="w-4 h-4" /></div>
      <div className={`flex items-center justify-center w-7 h-7 rounded-lg border font-black text-xs flex-shrink-0 ${isConfirmed ? 'bg-transparent text-slate-600 border-white/10' : getRankStyle(index)}`}>{index + 1}</div>
      <div className="flex-1 flex items-center gap-2.5 overflow-hidden select-none">
        <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5 flex-shrink-0">{item.icon}</div>
        <div className="flex flex-col justify-center overflow-hidden">
          <span className="font-black text-sm text-slate-200 truncate leading-tight">{item.nameAr}</span>
          <span className="font-bold text-[8px] text-slate-500 truncate uppercase tracking-widest mt-0.5">{item.nameEn}</span>
        </div>
      </div>
    </Reorder.Item>
  );
}

// -----------------------------------------
// شاشة اللعب الفردي (محرك الـ Solo)
// -----------------------------------------
function SoloGameArena({ onBack, onEndGame, isMuted }) {
  const [questions, setQuestions] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [items, setItems] = useState([]);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const TOTAL_ROUNDS = 10;

  useEffect(() => {
    const allQuestions = Object.values(SOLO_GAME_DATA);
    const selectedQuestions = shuffleArray(allQuestions).slice(0, TOTAL_ROUNDS);
    setQuestions(selectedQuestions);
    setItems(shuffleArray(selectedQuestions[0].items));
  }, []);

  if (questions.length === 0) return null;
  const currentQuestion = questions[currentRound];

  const handleConfirm = () => {
    playSound('confirm', isMuted);
    if (hasConfirmed) return;
    let score = 0;
    items.forEach((item, index) => {
      const correctIndex = currentQuestion.items.findIndex(q => q.id === item.id);
      if (index === correctIndex) score += (4 - index); 
    });
    
    if(score > 0) setTimeout(() => playSound('match', isMuted), 200);
    else setTimeout(() => playSound('fail', isMuted), 200);
    setRoundScore(score); setTotalScore(prev => prev + score); setHasConfirmed(true);
  };

  const handleNextRound = () => {
    playSound('click', isMuted);
    if (currentRound < TOTAL_ROUNDS - 1) {
      setCurrentRound(prev => prev + 1);
      setItems(shuffleArray(questions[currentRound + 1].items));
      setHasConfirmed(false); setRoundScore(0);
    } else { onEndGame(totalScore); }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full flex flex-col flex-1 px-4 pt-4 pb-6">
      <header className="flex items-center justify-between mb-3 shrink-0">
        <button onClick={onBack} className="text-slate-400 text-[9px] font-bold uppercase tracking-widest bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">خروج</button>
        <div className="flex items-center gap-3 bg-white/[0.03] px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          <div className="flex flex-col items-center"><span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">الجولة</span><span className="text-sm font-black text-slate-200 leading-tight">{currentRound + 1}<span className="text-[10px] text-slate-500">/{TOTAL_ROUNDS}</span></span></div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex flex-col items-center"><span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">النقاط</span><span className="text-sm font-black text-cyan-400 leading-tight">{totalScore}</span></div>
        </div>
      </header>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 mb-3 relative overflow-visible backdrop-blur-md shrink-0">
        <h2 className="text-cyan-400/80 text-[9px] font-bold uppercase tracking-widest mb-0.5">المهمة</h2>
        <p className="text-xl font-black text-white leading-tight drop-shadow-md">{currentQuestion.title}</p>
        <p className="text-[11px] font-bold text-slate-400 mt-1">{currentQuestion.criteria}</p>
      </div>

      <div className="flex-1 w-full flex flex-col justify-center relative min-h-0">
        <Reorder.Group axis="y" values={items} onReorder={(newOrder) => { if (!hasConfirmed) { playSound('click', isMuted); setItems(newOrder); } }} className="flex flex-col gap-2 relative z-10 h-full justify-center">
          {items.map((item, index) => {
            const correctIndex = currentQuestion.items.findIndex(q => q.id === item.id);
            return <SoloSortableItem key={item.id} item={item} index={index} isConfirmed={hasConfirmed} correctRank={correctIndex + 1} />;
          })}
        </Reorder.Group>
      </div>

      <div className="mt-3 shrink-0 relative z-20 flex flex-col justify-end">
        <AnimatePresence mode="wait">
          {!hasConfirmed ? (
            <motion.button key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} whileTap={{ scale: 0.97 }} onClick={handleConfirm} className="w-full h-12 flex items-center justify-center gap-2 bg-white/10 text-white hover:bg-white/15 font-black text-base rounded-xl border border-white/10 backdrop-blur-md transition-colors">
              <CheckCircle2 className="w-4 h-4" /><span>تأكيد الترتيب</span>
            </motion.button>
          ) : (
            <motion.div key="next" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full flex items-center gap-2">
              <div className="h-12 flex items-center justify-center px-4 bg-white/[0.03] border border-white/10 rounded-xl"><span className="font-black text-cyan-400 text-sm">+{roundScore}</span></div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleNextRound} className="flex-1 h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-sm rounded-xl border border-cyan-500/30">
                <span>{currentRound === TOTAL_ROUNDS - 1 ? 'النتيجة' : 'التالي'}</span><Play className="w-3.5 h-3.5 rotate-180" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SoloSortableItem({ item, index, isConfirmed, correctRank }) {
  const isCorrect = isConfirmed && (index + 1 === correctRank);
  const isWrong = isConfirmed && !isCorrect;

  const getRankStyle = (idx) => {
    switch(idx) {
      case 0: return 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 text-yellow-400 border-yellow-500/50';
      case 1: return 'bg-gradient-to-br from-slate-300/20 to-slate-500/20 text-slate-300 border-slate-400/50';
      case 2: return 'bg-gradient-to-br from-amber-700/20 to-amber-900/20 text-amber-500 border-amber-700/50';
      default: return 'bg-white/[0.05] text-slate-400 border-white/10';
    }
  };

  const getCardStyle = () => {
    if (isCorrect) return 'bg-cyan-500/10 border-cyan-500/30';
    if (isWrong) return 'bg-red-500/10 border-red-500/30';
    return 'bg-white/[0.04] border-white/10 hover:bg-white/[0.06] shadow-sm';
  };

  return (
    <Reorder.Item value={item} id={item.id} dragListener={!isConfirmed} style={{ touchAction: 'none' }} className={`relative flex flex-col gap-1.5 p-2.5 rounded-2xl border transition-colors ${getCardStyle()} ${!isConfirmed ? 'cursor-grab active:cursor-grabbing' : ''}`}>
      <div className="flex items-center gap-2.5">
        <div className={`flex items-center justify-center p-1 rounded-md ${isConfirmed ? 'opacity-0' : 'text-slate-500'}`}><GripVertical className="w-4 h-4" /></div>
        <div className={`flex items-center justify-center w-7 h-7 rounded-lg border font-black text-xs flex-shrink-0 ${isConfirmed ? (isCorrect ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-red-500/20 text-red-300 border-red-500/50') : getRankStyle(index)}`}>{index + 1}</div>
        <div className="flex-1 flex items-center gap-2.5 overflow-hidden select-none">
          <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5 flex-shrink-0">{item.icon}</div>
          <div className="flex flex-col justify-center overflow-hidden">
            <span className={`font-black text-sm truncate leading-tight ${isConfirmed && isWrong ? 'text-red-300' : 'text-slate-200'}`}>{item.nameAr}</span>
            <span className={`font-bold text-[8px] truncate uppercase tracking-widest mt-0.5 ${isConfirmed && isWrong ? 'text-red-400/50' : 'text-slate-500'}`}>{item.nameEn}</span>
          </div>
        </div>
        {isWrong && (
          <div className="absolute left-2 top-2.5 flex items-center gap-1 bg-red-950/90 border border-red-500/30 px-2 py-1 rounded-md z-20">
            <XCircle className="w-3 h-3 text-red-400" /><span className="text-[9px] font-bold text-red-200 mt-0.5">الصح: {correctRank}</span>
          </div>
        )}
        {isCorrect && (
          <div className="absolute left-3 top-2.5 bg-cyan-500/20 p-1 rounded-full border border-cyan-500/30 z-20">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
          </div>
        )}
      </div>
      {isConfirmed && item.actualValue && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`text-center py-1 rounded-md text-[10px] font-bold tracking-widest border ${isCorrect ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' : 'bg-red-500/10 text-red-300 border-red-500/20'}`}>
          {item.actualValue}
        </motion.div>
      )}
    </Reorder.Item>
  );
}

// -----------------------------------------
// نتيجة الفردي
// -----------------------------------------
function SoloResultScreen({ score, onRestart }) {
  const getEvaluation = (s) => {
    if (s >= 32) return { text: "موسوعة!", color: "text-cyan-400", desc: "ما شاء الله، معلوماتك دقيقة جداً." };
    if (s >= 20) return { text: "مخضرم", color: "text-blue-400", desc: "مستواك بطل، بس ناقصك تركيز." };
    if (s >= 10) return { text: "مبتدئ", color: "text-slate-400", desc: "تحتاج تقرأ وتتابع أكثر." };
    return { text: "عشوائي", color: "text-red-400", desc: "تلعب على البركة يا وحش!" };
  };
  const evalData = getEvaluation(score);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center justify-center flex-1 px-4 py-8 text-center z-10">
      <div className="relative mb-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="w-36 h-36 bg-white/[0.03] rounded-full flex items-center justify-center border border-white/10 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.2)]">
          <span className="text-6xl font-black text-white">{score}</span>
        </motion.div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/10 border border-white/10 px-3 py-1 rounded-full"><span className="text-[9px] font-bold text-slate-300 tracking-widest uppercase">من 40 نقطة</span></div>
      </div>
      <div className="flex flex-col gap-2 mb-8">
        <h2 className={`text-3xl font-black ${evalData.color}`}>{evalData.text}</h2>
        <p className="text-slate-400 text-xs font-bold">{evalData.desc}</p>
      </div>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onRestart} className="w-full max-w-[250px] flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-black text-sm p-4 rounded-xl border border-white/10 transition-colors">
        <RotateCcw className="w-4 h-4" /><span>العب من جديد</span>
      </motion.button>
    </motion.div>
  );
}

// -----------------------------------------
// نتيجة الأونلاين
// -----------------------------------------
function OnlineResultScreen({ score, onRestart }) {
  const getEvaluation = (s) => {
    if (s >= 80) return { text: "توأم روح!", color: "text-cyan-400", desc: "تفكيركم واحد وذوقكم متطابق." };
    if (s >= 50) return { text: "تفاهم عالي", color: "text-blue-400", desc: "بينكم انسجام حلو." };
    if (s >= 30) return { text: "اختلاف أذواق", color: "text-slate-400", desc: "كل واحد له جوه ومزاجه." };
    return { text: "عالمين مختلفين!", color: "text-red-400", desc: "ولا شيء يربطكم ببعض حرفياً!" };
  };
  const evalData = getEvaluation(score);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center justify-center flex-1 px-4 py-8 text-center z-10">
      <div className="relative mb-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="w-36 h-36 bg-white/[0.03] rounded-full flex items-center justify-center border border-white/10 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.2)]">
          <span className="text-5xl font-black text-cyan-400">{score}%</span>
        </motion.div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/10 border border-white/10 px-3 py-1 rounded-full"><span className="text-[9px] font-bold text-slate-300 tracking-widest uppercase">نسبة التوافق</span></div>
      </div>
      <div className="flex flex-col gap-2 mb-8">
        <h2 className={`text-3xl font-black ${evalData.color}`}>{evalData.text}</h2>
        <p className="text-slate-400 text-xs font-bold">{evalData.desc}</p>
      </div>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onRestart} className="w-full max-w-[250px] flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-black text-sm p-4 rounded-xl border border-white/10 transition-colors">
        <RotateCcw className="w-4 h-4" /><span>الرئيسية</span>
      </motion.button>
    </motion.div>
  );
}