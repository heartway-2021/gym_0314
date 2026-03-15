<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>모녀 찰떡 다이어트 🚲</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- React & ReactDOM -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <!-- Prop-Types (Recharts dependency) -->
    <script src="https://unpkg.com/prop-types@15.8.1/prop-types.min.js"></script>
    <!-- Recharts -->
    <script src="https://unpkg.com/recharts@2.12.2/umd/Recharts.js"></script>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- Babel for JSX -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;700;900&display=swap');
        body { font-family: 'Pretendard', sans-serif; overflow-x: hidden; -webkit-tap-highlight-color: transparent; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        input[type="number"]::-webkit-inner-spin-button, 
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    </style>
</head>
<body class="bg-slate-50">
    <div id="root"></div>

    <!-- Firebase SDKs -->
    <script type="importmap">
    {
      "imports": {
        "firebase/app": "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js",
        "firebase/auth": "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js",
        "firebase/firestore": "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"
      }
    }
    </script>

    <script type="text/babel" data-type="module">
        import { initializeApp } from "firebase/app";
        import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
        import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";

        const { useState, useEffect, useMemo } = React;
        const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } = Recharts;

        // 1. Firebase 설정값 안전하게 가져오기
        let firebaseConfig;
        try {
            firebaseConfig = (typeof __firebase_config !== 'undefined' && __firebase_config) 
                ? JSON.parse(__firebase_config) 
                : {
                    apiKey: "AIzaSyAs-PlaceholderKey12345", 
                    authDomain: "diet-challenge-app.firebaseapp.com",
                    projectId: "diet-challenge-app",
                    storageBucket: "diet-challenge-app.appspot.com",
                    messagingSenderId: "1234567890",
                    appId: "1:1234567890:web:abc123def456"
                };
        } catch (e) {
            console.error("Firebase 설정 파싱 오류:", e);
        }

        const currentAppId = typeof __app_id !== 'undefined' ? __app_id : "diet-challenge-app";

        // 2. Firebase 초기화
        const firebaseApp = initializeApp(firebaseConfig);
        const auth = getAuth(firebaseApp);
        const db = getFirestore(firebaseApp);

        const App = () => {
            const [user, setUser] = useState(null);
            const [activeTab, setActiveTab] = useState('dashboard');
            const [rawLogs, setRawLogs] = useState([]);
            const [loading, setLoading] = useState(true);
            const [errorMsg, setErrorMsg] = useState(null);

            // 타이머 상태
            const [timerActive, setTimerActive] = useState(false);
            const [timeLeft, setTimeLeft] = useState(1800);
            const [cycleTime, setCycleTime] = useState(300);
            const [isResting, setIsResting] = useState(false);
            const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0);

            const MET_EXERCISE = 8.0;

            // 필수 규칙 3: 인증 처리를 가장 먼저 수행
            useEffect(() => {
                const initAuth = async () => {
                    try {
                        await signInAnonymously(auth);
                    } catch (err) {
                        console.error("인증 실패:", err);
                        setErrorMsg("인증에 실패했습니다. 설정을 확인해주세요.");
                    }
                };
                initAuth();
                const unsubscribe = onAuthStateChanged(auth, (u) => {
                    setUser(u);
                    if (!u) setLoading(false);
                });
                return () => unsubscribe();
            }, []);

            // 필수 규칙 1 & 2: 인증 완료 후 데이터 수신
            useEffect(() => {
                if (!user) return; // 인증되지 않았으면 실행 중단

                const logsPath = ['artifacts', currentAppId, 'public', 'data', 'diet_logs'];
                const logsRef = collection(db, ...logsPath);
                
                const unsubscribe = onSnapshot(logsRef, 
                    (snapshot) => {
                        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        setRawLogs(data.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)));
                        setLoading(false);
                        setErrorMsg(null);
                    },
                    (err) => {
                        console.error("Firestore 수신 오류:", err);
                        setErrorMsg("데이터를 가져올 권한이 없거나 오류가 발생했습니다.");
                        setLoading(false);
                    }
                );

                return () => unsubscribe();
            }, [user]);

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
                } else { clearInterval(interval); }
                return () => clearInterval(interval);
            }, [timerActive, timeLeft, isResting]);

            // 아이콘 업데이트
            useEffect(() => {
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }, [activeTab, loading, errorMsg]);

            const userData = useMemo(() => {
                const momLogs = rawLogs.filter(l => l.userKey === 'mom');
                const daughterLogs = rawLogs.filter(l => l.userKey === 'daughter');
                const getW = (logs, def) => logs.length > 0 ? logs[logs.length-1].weight : def;
                return {
                    mom: { name: '엄마', weight: 74, target: 69, current: getW(momLogs, 74), logs: momLogs, burned: momLogs.reduce((a,c)=>a+(c.burnedKcal||0),0) },
                    daughter: { name: '딸', weight: 60, target: 55, current: getW(daughterLogs, 60), logs: daughterLogs, burned: daughterLogs.reduce((a,c)=>a+(c.burnedKcal||0),0) }
                };
            }, [rawLogs]);

            const saveLog = async (key, val) => {
                const weight = parseFloat(val);
                if (isNaN(weight) || !user) return;
                
                const burnedKcal = Math.round((MET_EXERCISE * 3.5 * userData[key].weight * 25 / 200));
                
                try {
                    const logsRef = collection(db, 'artifacts', currentAppId, 'public', 'data', 'diet_logs');
                    await addDoc(logsRef, {
                        userKey: key, 
                        weight, 
                        burnedKcal, 
                        timestamp: Date.now(),
                        date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
                        uid: user.uid
                    });
                } catch (e) { 
                    console.error("저장 실패:", e); 
                    alert("기록 저장 권한이 없거나 오류가 발생했습니다.");
                }
            };

            const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

            if (loading && !errorMsg) return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400 font-bold text-sm">연결 중...</p>
                </div>
            );

            return (
                <div className="max-w-md mx-auto min-h-screen pb-24 relative bg-slate-50 shadow-2xl shadow-gray-200">
                    <header className="bg-white p-6 pt-12 rounded-b-[40px] shadow-sm flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">모녀 찰떡 다이어트 🚲</h1>
                            <p className="text-xs text-gray-400 font-medium">함께라서 즐거운 한 달 5kg 감량!</p>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${user ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                             {user ? 'CLOUD SYNC' : 'OFFLINE'}
                        </div>
                    </header>

                    <main className="p-5 animate-fade-in">
                        {errorMsg && (
                            <div className="bg-red-50 text-red-500 p-4 rounded-2xl mb-4 font-bold text-sm border border-red-100">
                                {errorMsg}
                            </div>
                        )}

                        {activeTab === 'dashboard' && (
                            <div className="space-y-4">
                                {['mom', 'daughter'].map(k => {
                                    const d = userData[k];
                                    const prog = Math.min(Math.max(((d.weight - d.current) / (d.weight - d.target)) * 100, 0), 100).toFixed(1);
                                    return (
                                        <div key={k} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100/50">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${k==='mom'?'bg-orange-100 text-orange-600':'bg-pink-100 text-pink-600'}`}>
                                                        <span className="font-black text-lg">{d.name[0]}</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-gray-800 text-lg">{d.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Target: {d.target}kg</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-gray-900">{d.current}<span className="text-sm font-bold text-gray-400 ml-0.5">kg</span></div>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-2">
                                                <div className={`h-full transition-all duration-1000 ease-out rounded-full ${k === 'mom' ? 'bg-orange-400' : 'bg-pink-400'}`} style={{width: `${prog}%`}}></div>
                                            </div>
                                            <div className="flex justify-between text-[11px] text-gray-500 font-black">
                                                <span>남은 감량: {(d.current - d.target).toFixed(1)}kg</span>
                                                <span className="text-indigo-600">{prog}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-7 rounded-[35px] text-white flex justify-between items-center shadow-xl relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="text-lg font-black mb-1">오늘의 집중 싸이클</div>
                                        <div className="text-[11px] font-medium opacity-90">5분 열정 주행 + 1분 꿀맛 휴식</div>
                                    </div>
                                    <button onClick={()=>setActiveTab('timer')} className="relative z-10 bg-white text-indigo-600 px-7 py-3 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg">
                                        시작!
                                    </button>
                                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'timer' && (
                            <div className="bg-white p-10 rounded-[45px] shadow-sm text-center border border-gray-100 animate-fade-in">
                                <div className={`inline-block px-5 py-1.5 rounded-full text-xs font-black mb-8 shadow-sm ${isResting ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600 animate-pulse'}`}>
                                    {isResting ? '꿀맛 휴식 중 🍵' : '힘차게 주행 중 🚲'}
                                </div>
                                <div className="text-7xl font-black mb-4 text-gray-900 tracking-tighter tabular-nums">{formatTime(cycleTime)}</div>
                                <div className="text-sm font-bold text-gray-300 mb-12">전체 운동 종료까지 {formatTime(timeLeft)}</div>
                                <div className="flex justify-center gap-6">
                                    <button onClick={()=>setTimerActive(!timerActive)} className={`w-24 h-24 rounded-full text-white font-black text-xl flex items-center justify-center shadow-xl active:scale-90 transition-all ${timerActive?'bg-orange-500':'bg-indigo-600'}`}>
                                        {timerActive ? '정지' : '시작'}
                                    </button>
                                    <button onClick={()=>{setTimerActive(false); setTimeLeft(1800); setCycleTime(300); setIsResting(false);}} className="w-24 h-24 rounded-full bg-slate-100 text-gray-400 font-black text-sm active:scale-90 transition-all">
                                        리셋
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'logs' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="bg-white p-7 rounded-[35px] shadow-sm border border-gray-100">
                                    <h3 className="font-black text-gray-900 text-lg mb-6 flex items-center gap-2">
                                        오늘의 몸무게 기록
                                    </h3>
                                    {['mom', 'daughter'].map(k => (
                                        <div key={k} className={`mb-6 ${k==='daughter'?'border-t border-gray-50 pt-6':''}`}>
                                            <div className="text-[11px] text-gray-400 font-black mb-2 uppercase tracking-widest">{userData[k].name}'s Weight</div>
                                            <div className="flex gap-3">
                                                <input id={`in-${k}`} type="number" step="0.1" className="bg-slate-50 flex-1 p-5 rounded-2xl border-0 text-xl font-black focus:ring-4 focus:ring-indigo-100 outline-none transition-all" placeholder="00.0" />
                                                <button onClick={()=>{const i=document.getElementById(`in-${k}`); if(i.value){saveLog(k,i.value); i.value='';}}} className={`px-8 rounded-2xl text-white font-black shadow-lg active:scale-95 transition-all ${k==='mom'?'bg-orange-500':'bg-pink-500'}`}>저장</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white p-7 rounded-[35px] shadow-sm border border-gray-100 h-72">
                                    <h3 className="font-black text-gray-800 mb-6 text-sm flex justify-between items-center">
                                        <span>모녀 체중 추이</span>
                                        <div className="flex gap-3 text-[10px]">
                                            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-400 rounded-full"></span>엄마</span>
                                            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-pink-400 rounded-full"></span>딸</span>
                                        </div>
                                    </h3>
                                    <ResponsiveContainer width="100%" height="80%">
                                        <LineChart data={
                                            Array.from(new Set(rawLogs.map(l => l.date))).map(date => ({
                                                name: date,
                                                mom: rawLogs.find(l => l.date === date && l.userKey === 'mom')?.weight,
                                                daughter: rawLogs.find(l => l.date === date && l.userKey === 'daughter')?.weight,
                                            }))
                                        }>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#cbd5e1', fontWeight: 700}} />
                                            <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                                            <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold'}} />
                                            <Line type="monotone" dataKey="mom" name="엄마" stroke="#fb923c" strokeWidth={4} dot={{r: 5, fill: '#fb923c', strokeWidth: 3, stroke: '#fff'}} activeDot={{r: 8}} />
                                            <Line type="monotone" dataKey="daughter" name="딸" stroke="#f472b6" strokeWidth={4} dot={{r: 5, fill: '#f472b6', strokeWidth: 3, stroke: '#fff'}} activeDot={{r: 8}} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </main>

                    <nav className="fixed bottom-6 left-6 right-6 bg-white/95 backdrop-blur-xl h-20 rounded-[32px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] border border-white/20 flex justify-around items-center px-6 z-50">
                        {[
                            { id: 'dashboard', label: '현황' },
                            { id: 'timer', label: '운동' },
                            { id: 'logs', label: '기록' }
                        ].map(t => (
                            <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab===t.id?'text-indigo-600 scale-110':'text-gray-300 hover:text-gray-400'}`}>
                                 <div className={`w-1.5 h-1.5 rounded-full transition-all ${activeTab===t.id?'bg-indigo-600 scale-150':'bg-transparent'}`}></div>
                                 <span className="text-[11px] font-black uppercase tracking-tighter">{t.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
