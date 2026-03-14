import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Timer, Trophy, Calculator, Activity, Users, Play, Square, RotateCcw, Cloud, RefreshCw, Check } from 'lucide-react';

// Firebase 설정 (환경 변수 활용)
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'diet-challenge-app';

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [rawLogs, setRawLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 타이머 관련 상태
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [cycleTime, setCycleTime] = useState(300);
  const [isResting, setIsResting] = useState(false);
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0);

  // 상수
  const MET_EXERCISE = 8.0;
  const MET_REST = 1.0;
  const KCAL_PER_KG = 7700;

  // 1. Firebase 인증 처리 (Rule 3 준수)
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("인증 오류:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // 2. Firestore 데이터 실시간 동기화 (Rule 1, 2 준수)
  useEffect(() => {
    if (!user) return;

    // 공용 데이터 경로: /artifacts/{appId}/public/data/diet_logs
    const logsRef = collection(db, 'artifacts', appId, 'public', 'data', 'diet_logs');
    
    // 복합 쿼리 없이 전체 데이터를 가져와 클라이언트에서 처리 (Rule 2)
    const unsubscribe = onSnapshot(logsRef, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // 시간순 정렬
        const sortedData = data.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        setRawLogs(sortedData);
        setLoading(false);
      },
      (error) => {
        console.error("데이터 불러오기 오류:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 데이터 가공
  const userData = useMemo(() => {
    const momLogs = rawLogs.filter(l => l.userKey === 'mom');
    const daughterLogs = rawLogs.filter(l => l.userKey === 'daughter');

    const getLatestWeight = (logs, defaultWeight) => 
      logs.length > 0 ? logs[logs.length - 1].weight : defaultWeight;

    return {
      mom: {
        name: '엄마',
        weight: 74,
        targetWeight: 69,
        currentWeight: getLatestWeight(momLogs, 74),
        logs: momLogs,
        totalBurned: momLogs.reduce((acc, l) => acc + (l.burnedKcal || 0), 0)
      },
      daughter: {
        name: '딸',
        weight: 60,
        targetWeight: 55,
        currentWeight: getLatestWeight(daughterLogs, 60),
        logs: daughterLogs,
        totalBurned: daughterLogs.reduce((acc, l) => acc + (l.burnedKcal || 0), 0)
      }
    };
  }, [rawLogs]);

  // 타이머 로직
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        setCycleTime(prev => {
          if (prev <= 1) {
            const nextIsResting = !isResting;
            setIsResting(nextIsResting);
            return nextIsResting ? 60 : 300;
          }
          return prev - 1;
        });
        setTotalSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, isResting]);

  const calculateBurnedKcal = (weight, seconds) => {
    const mins = seconds / 60;
    const exerciseMins = Math.min(mins, 25);
    const restMins = Math.max(0, mins - exerciseMins);
    return Math.round((MET_EXERCISE * 3.5 * weight * exerciseMins / 200) + (MET_REST * 3.5 * weight * restMins / 200));
  };

  const saveLog = async (userKey, measuredWeight) => {
    if (!user) return;
    const weight = parseFloat(measuredWeight);
    if (isNaN(weight)) return;

    const burnedKcal = calculateBurnedKcal(userData[userKey].weight, 1800);
    
    try {
      const logsRef = collection(db, 'artifacts', appId, 'public', 'data', 'diet_logs');
      await addDoc(logsRef, {
        userKey,
        weight,
        burnedKcal,
        date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        timestamp: Date.now(),
        creator: user.uid
      });
    } catch (err) {
      console.error("저장 오류:", err);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const getProgress = (user) => {
    const totalToLose = user.weight - user.targetWeight;
    const lostSoFar = user.weight - user.currentWeight;
    return Math.min(Math.max((lostSoFar / totalToLose) * 100, 0), 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <RefreshCw className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-gray-500 font-bold">기록을 불러오고 있어요...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-gray-900">
      <header className="bg-white px-6 pt-10 pb-6 rounded-b-[40px] shadow-sm flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">모녀 찰떡 다이어트 🚲</h1>
          <p className="text-gray-500 text-sm">함께라서 더 즐거운 5kg 감량!</p>
        </div>
        <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold shadow-sm">
          <Cloud size={14} /> 클라우드 연결됨
        </div>
      </header>

      <main className="px-5 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {['mom', 'daughter'].map(key => {
              const data = userData[key];
              const progress = getProgress(data);
              return (
                <div key={key} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${key === 'mom' ? 'bg-orange-100 text-orange-600' : 'bg-pink-100 text-pink-600'}`}>
                        <Users size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{data.name}</h3>
                        <p className="text-xs text-gray-500">목표: {data.targetWeight}kg</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-gray-900">{data.currentWeight}</span>
                      <span className="text-gray-500 ml-1">kg</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">목표 달성률</span>
                      <span className="text-indigo-600 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${key === 'mom' ? 'bg-orange-400' : 'bg-pink-400'}`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-3 rounded-2xl">
                      <p className="text-[10px] text-gray-400 mb-1">누적 소모</p>
                      <p className="font-bold text-sm">{data.totalBurned} kcal</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl">
                      <p className="text-[10px] text-gray-400 mb-1">성실도</p>
                      <p className="font-bold text-sm">{data.logs.length}일째</p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="bg-indigo-600 text-white p-6 rounded-[32px] shadow-lg flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">싸이클 챌린지</h3>
                <p className="text-indigo-100 text-xs mt-1">5분 열정 + 1분 휴식 (30분)</p>
              </div>
              <button onClick={() => setActiveTab('timer')} className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black shadow-md active:scale-95 transition-transform">
                시작!
              </button>
            </div>
          </div>
        )}

        {activeTab === 'timer' && (
          <div className="flex flex-col items-center py-4 animate-in zoom-in-95 duration-300">
            <div className="bg-white w-full rounded-[40px] p-8 shadow-xl text-center border border-gray-100 relative overflow-hidden">
              <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-6 ${isResting ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {isResting ? '꿀맛 휴식 중...' : '열심히 달리는 중!'}
              </span>
              
              <div className="relative mb-8">
                <svg className="w-64 h-64 mx-auto">
                  <circle className="text-gray-100" strokeWidth="10" stroke="currentColor" fill="transparent" r="110" cx="128" cy="128" />
                  <circle 
                    className={`${isResting ? 'text-green-500' : 'text-indigo-600'} transition-all duration-1000`} 
                    strokeWidth="10" strokeDasharray={2 * Math.PI * 110}
                    strokeDashoffset={2 * Math.PI * 110 * (1 - (isResting ? cycleTime/60 : cycleTime/300))}
                    strokeLinecap="round" stroke="currentColor" fill="transparent" r="110" cx="128" cy="128" transform="rotate(-90 128 128)"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <p className="text-5xl font-black text-gray-900 tabular-nums">{formatTime(cycleTime)}</p>
                  <p className="text-gray-400 mt-2 font-medium">남은 전체 {formatTime(timeLeft)}</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={() => setTimerActive(!timerActive)} className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-all ${timerActive ? 'bg-orange-500' : 'bg-indigo-600'}`}>
                  {timerActive ? <Square fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
                </button>
                <button onClick={() => {setTimerActive(false); setTimeLeft(1800); setCycleTime(300); setIsResting(false); setTotalSecondsElapsed(0);}} className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 active:scale-90 transition-all">
                  <RotateCcw size={24} />
                </button>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4 w-full">
              <div className="bg-white p-5 rounded-3xl shadow-sm text-center">
                <p className="text-[10px] text-gray-400 mb-1">엄마 소모(예상)</p>
                <p className="text-xl font-black text-orange-600">{calculateBurnedKcal(userData.mom.weight, totalSecondsElapsed)} <span className="text-xs">kcal</span></p>
              </div>
              <div className="bg-white p-5 rounded-3xl shadow-sm text-center">
                <p className="text-[10px] text-gray-400 mb-1">딸 소모(예상)</p>
                <p className="text-xl font-black text-pink-600">{calculateBurnedKcal(userData.daughter.weight, totalSecondsElapsed)} <span className="text-xs">kcal</span></p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-[32px] shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calculator size={20} className="text-indigo-600" /> 오늘의 기록 남기기
              </h3>
              <div className="space-y-6">
                {['mom', 'daughter'].map(key => (
                  <div key={key} className={key === 'daughter' ? 'border-t pt-4' : ''}>
                    <label className="text-xs font-bold text-gray-500 block mb-2">{userData[key].name} 몸무게 (kg)</label>
                    <div className="flex gap-2">
                      <input id={`${key}-weight-input`} type="number" step="0.1" placeholder="00.0" className="flex-1 bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-bold" />
                      <button onClick={() => {const el = document.getElementById(`${key}-weight-input`); if(el.value){ saveLog(key, el.value); el.value = ''; }}} className={`px-6 rounded-2xl font-bold text-white shadow-md active:scale-95 ${key === 'mom' ? 'bg-orange-500' : 'bg-pink-500'}`}>저장</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] shadow-sm overflow-hidden">
              <h3 className="font-bold text-lg mb-4">함께 만드는 그래프</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={
                    Array.from(new Set(rawLogs.map(l => l.date))).map(date => ({
                      name: date,
                      mom: rawLogs.find(l => l.date === date && l.userKey === 'mom')?.weight,
                      daughter: rawLogs.find(l => l.date === date && l.userKey === 'daughter')?.weight,
                    }))
                  }>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Legend />
                    <Line type="monotone" dataKey="mom" name="엄마" stroke="#f97316" strokeWidth={4} dot={{r: 5, fill: '#f97316', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
                    <Line type="monotone" dataKey="daughter" name="딸" stroke="#ec4899" strokeWidth={4} dot={{r: 5, fill: '#ec4899', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl h-20 rounded-[30px] shadow-2xl border border-white/20 flex items-center justify-around px-6 z-50">
        {[
          { id: 'dashboard', icon: Activity, label: '현황' },
          { id: 'timer', icon: Timer, label: '운동' },
          { id: 'logs', icon: Calculator, label: '기록' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === tab.id ? 'text-indigo-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <tab.icon size={activeTab === tab.id ? 28 : 24} />
            <span className="text-[10px] font-bold">{tab.label}</span>
            {activeTab === tab.id && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-0.5"></div>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
