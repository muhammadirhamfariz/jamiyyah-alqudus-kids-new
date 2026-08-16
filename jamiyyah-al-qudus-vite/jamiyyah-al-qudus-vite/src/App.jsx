import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, CheckSquare, Wallet, Receipt, LayoutDashboard, 
  LogOut, Search, Plus, Edit2, Trash2, Check, X, AlertCircle, 
  Menu, X as CloseIcon, UserCircle, Clock
} from 'lucide-react';

// IMPORTANT: To use this in your local Vite project, uncomment the following line
// and install the package: npm install @supabase/supabase-js
// import { createClient } from '@supabase/supabase-js';

// --- INISIALISASI SUPABASE ---
// Mendapatkan env secara aman untuk menghindari error pada environment tertentu
const getEnv = (key) => {
  try { return typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env[key] : ''; } catch (e) { return ''; }
};
const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_PUBLISHABLE_KEY');

// --- MOCK SUPABASE CLIENT UNTUK PREVIEW ---
// Menggunakan LocalStorage agar sistem tetap berfungsi penuh di dalam browser preview ini.
// Ganti `createMockSupabaseClient()` dengan `createClient(supabaseUrl, supabaseKey)` saat dipasang di project lokal Anda.
function createMockSupabaseClient() {
  const getStorage = (table) => JSON.parse(localStorage.getItem(`mock_supa_${table}`) || '[]');
  const setStorage = (table, data) => localStorage.setItem(`mock_supa_${table}`, JSON.stringify(data));
  const genId = () => Math.random().toString(36).substr(2, 9);
  const listeners = {};
  const notify = (table) => { if(listeners[table]) listeners[table].forEach(cb => cb()); };

  return {
    from: (table) => ({
      select: (cols) => {
        let result = getStorage(table);
        const chain = {
          eq: (field, value) => { result = result.filter(item => item[field] === value); return chain; },
          single: () => ({ then: (res, rej) => Promise.resolve({ data: result[0] || null, error: null }).then(res).catch(rej) }),
          then: (res, rej) => Promise.resolve({ data: result, error: null }).then(res).catch(rej)
        };
        return chain;
      },
      insert: (payload) => {
        const data = getStorage(table);
        const newItems = Array.isArray(payload) ? payload.map(p => ({id: genId(), ...p})) : [{id: genId(), ...payload}];
        setStorage(table, [...data, ...newItems]);
        notify(table);
        const res = { data: newItems, error: null };
        return { select: () => ({ then: (cb) => Promise.resolve(res).then(cb) }), then: (cb) => Promise.resolve(res).then(cb) };
      },
      update: (payload) => ({
        eq: async (field, value) => {
            let data = getStorage(table);
            data = data.map(item => item[field] === value ? { ...item, ...payload } : item);
            setStorage(table, data);
            notify(table);
            return { data: [], error: null };
        }
      }),
      delete: () => ({
        eq: async (field, value) => {
            let data = getStorage(table);
            data = data.filter(item => item[field] !== value);
            setStorage(table, data);
            notify(table);
            return { data: [], error: null };
        }
      }),
      upsert: async (payload) => {
        let data = getStorage(table);
        const itemIdx = data.findIndex(i => i.id === payload.id);
        if (itemIdx >= 0) { data[itemIdx] = { ...data[itemIdx], ...payload }; } 
        else { data.push({ id: payload.id || genId(), ...payload }); }
        setStorage(table, data);
        notify(table);
        return { data: [], error: null };
      }
    }),
    channel: (name) => {
        const table = name.split(':')[1];
        let cb;
        const chain = {
            on: (type, filter, callback) => { cb = callback; return chain; },
            subscribe: () => {
                if(!listeners[table]) listeners[table] = [];
                if (cb) listeners[table].push(cb);
                return { topic: name };
            }
        };
        return chain;
    },
    removeChannel: () => {}
  }
}

const supabase = createMockSupabaseClient();

// --- HOOK REALTIME SUPABASE ---
// Pengganti onSnapshot Firebase untuk auto-sync data dari tabel
function useSupabaseData(tableName) {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const { data: res, error } = await supabase.from(tableName).select('*');
      if (error) {
         console.error(`Error fetching ${tableName}:`, error);
         return;
      }
      if (isMounted) setData(res || []);
    };
    
    fetchData();
    
    const channel = supabase.channel(`public:${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
        fetchData();
      })
      .subscribe();
      
    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [tableName]);
  
  return data;
}

// --- DAFTAR AKUN ADMIN ---
const ADMIN_LIST = [
  { username: 'irhamfariz', password: 'alqudushebat' },
  { username: 'buumi', password: 'guru' },
  { username: 'admin1', password: 'pengurus1' },
  { username: 'admin2', password: 'pengurus2' }
];

// --- 60 DATA PESERTA AWAL ---
const INITIAL_PARTICIPANTS = [
  { nama: "Amel", username: "amel001" }, { nama: "Aqilah", username: "aqilah002" }, { nama: "Alika", username: "alika003" }, { nama: "Naila", username: "naila004" }, { nama: "Auliya B", username: "auliyab005" }, { nama: "Sakila", username: "sakila006" }, { nama: "Nia", username: "nia007" }, { nama: "Liana", username: "liana008" }, { nama: "Auliya A", username: "auliyaa009" }, { nama: "Fulanita", username: "fulanita010" }, { nama: "Alesa", username: "alesa011" }, { nama: "Almira", username: "almira012" }, { nama: "Kanza A", username: "kanzaa013" }, { nama: "Noria", username: "noria014" }, { nama: "Dara", username: "dara015" }, { nama: "Najwa", username: "najwa016" }, { nama: "Hanny", username: "hanny017" }, { nama: "Adzkia", username: "adzkia018" }, { nama: "Desyla", username: "desyla019" }, { nama: "Wawa", username: "wawa020" }, { nama: "Rania", username: "rania021" }, { nama: "Maira", username: "maira022" }, { nama: "Luluk", username: "luluk023" }, { nama: "Izza", username: "izza024" }, { nama: "Ulya", username: "ulya025" }, { nama: "Raisa", username: "raisa026" }, { nama: "Putri", username: "putri027" }, { nama: "Alya", username: "alya028" }, { nama: "Naya", username: "naya029" }, { nama: "Nabila", username: "nabila030" }, { nama: "Aisyah", username: "aisyah031" }, { nama: "Sasa", username: "sasa032" }, { nama: "Sawala", username: "sawala033" }, { nama: "Ainun", username: "ainun034" }, { nama: "Kalila", username: "kalila035" }, { nama: "Shanum", username: "shanum036" }, { nama: "Kanza B", username: "kanzab037" }, { nama: "Haidar", username: "haidar038" }, { nama: "Ilham", username: "ilham039" }, { nama: "Azzam", username: "azzam040" }, { nama: "Vindra", username: "vindra041" }, { nama: "Kenzo", username: "kenzo042" }, { nama: "Saka", username: "saka043" }, { nama: "Yusuf", username: "yusuf044" }, { nama: "Ghaisan", username: "ghaisan045" }, { nama: "Azmil", username: "azmil046" }, { nama: "Rafka", username: "rafka047" }, { nama: "Jaya", username: "jaya048" }, { nama: "Arya", username: "arya049" }, { nama: "Firdaus", username: "firdaus050" }, { nama: "Rendy", username: "rendy051" }, { nama: "Atta", username: "atta052" }, { nama: "Nasyid", username: "nasyid053" }, { nama: "Izzan", username: "izzan054" }, { nama: "Yumna", username: "yumna055" }, { nama: "Nayif", username: "nayif056" }, { nama: "Meysa", username: "meysa057" }, { nama: "Arseno", username: "arseno058" }, { nama: "Rafanda", username: "rafanda059" }, { nama: "Zaka", username: "zaka060" }
];

// --- KOMPONEN PENDUKUNG ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-emerald-600';
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg text-white ${bgColor} transition-opacity duration-300`}>
      {type === 'error' ? <AlertCircle className="w-5 h-5 mr-2" /> : <Check className="w-5 h-5 mr-2" />}
      <p className="font-medium">{message}</p>
      <button onClick={onClose} className="ml-4 hover:opacity-75"><X className="w-4 h-4" /></button>
    </div>
  );
};

const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50">
          <h3 className="text-lg font-bold text-emerald-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => (
  <Modal isOpen={isOpen} title="Konfirmasi" onClose={onCancel}>
    <p className="text-gray-700 mb-6">{message}</p>
    <div className="flex justify-end space-x-3">
      <button onClick={onCancel} className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium">Batal</button>
      <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 font-medium">Ya, Hapus</button>
    </div>
  </Modal>
);

const Card = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
    <div className={`p-4 rounded-full ${colorClass} bg-opacity-10 mr-4`}>
      <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const NavButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 rounded-lg font-medium transition-colors ${
      active ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
    }`}
  >
    <Icon className="w-5 h-5 mr-3" />
    {label}
  </button>
);

// --- KOMPONEN UTAMA ---
export default function App() {
  const [view, setView] = useState('landing'); 
  const [adminNav, setAdminNav] = useState('dashboard');
  const [parentData, setParentData] = useState(null); 
  const [toast, setToast] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Pengecekan Firebase Auth telah dihapus, langsung merender Main App Shell
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {view === 'landing' && (
        <LandingView 
          onAdminLogin={() => setView('admin')} 
          onParentLogin={(data) => { setParentData(data); setView('parent'); }}
          showToast={showToast}
        />
      )}

      {view === 'admin' && (
        <div className="flex h-screen overflow-hidden">
          <aside className="hidden md:flex flex-col w-64 bg-emerald-900 text-white transition-all duration-300">
            <div className="p-6 border-b border-emerald-800">
              <h1 className="text-xl font-bold leading-tight">JAMIYYAH<br/>AL QUDUS KIDS</h1>
              <p className="text-emerald-400 text-xs mt-1">Panel Administrator</p>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              <NavButton icon={LayoutDashboard} label="Dashboard" active={adminNav === 'dashboard'} onClick={() => setAdminNav('dashboard')} />
              <NavButton icon={Users} label="Peserta" active={adminNav === 'peserta'} onClick={() => setAdminNav('peserta')} />
              <NavButton icon={CheckSquare} label="Kehadiran" active={adminNav === 'kehadiran'} onClick={() => setAdminNav('kehadiran')} />
              <NavButton icon={Wallet} label="Kas" active={adminNav === 'kas'} onClick={() => setAdminNav('kas')} />
              <NavButton icon={Receipt} label="Iuran" active={adminNav === 'iuran'} onClick={() => setAdminNav('iuran')} />
              <NavButton icon={Calendar} label="Jadwal Acara" active={adminNav === 'jadwal'} onClick={() => setAdminNav('jadwal')} />
            </nav>
            <div className="p-4 border-t border-emerald-800">
              <button onClick={() => setView('landing')} className="flex items-center w-full px-4 py-2 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors">
                <LogOut className="w-5 h-5 mr-3" /> Keluar
              </button>
            </div>
          </aside>

          <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-emerald-900 text-white z-40 flex items-center justify-between px-4 shadow-md">
            <h1 className="text-lg font-bold">AL QUDUS KIDS</h1>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
              {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-30 bg-emerald-900 text-white pt-16">
              <nav className="p-4 space-y-2">
                 <NavButton icon={LayoutDashboard} label="Dashboard" active={adminNav === 'dashboard'} onClick={() => { setAdminNav('dashboard'); setIsMobileMenuOpen(false); }} />
                 <NavButton icon={Users} label="Peserta" active={adminNav === 'peserta'} onClick={() => { setAdminNav('peserta'); setIsMobileMenuOpen(false); }} />
                 <NavButton icon={CheckSquare} label="Kehadiran" active={adminNav === 'kehadiran'} onClick={() => { setAdminNav('kehadiran'); setIsMobileMenuOpen(false); }} />
                 <NavButton icon={Wallet} label="Kas" active={adminNav === 'kas'} onClick={() => { setAdminNav('kas'); setIsMobileMenuOpen(false); }} />
                 <NavButton icon={Receipt} label="Iuran" active={adminNav === 'iuran'} onClick={() => { setAdminNav('iuran'); setIsMobileMenuOpen(false); }} />
                 <NavButton icon={Calendar} label="Jadwal Acara" active={adminNav === 'jadwal'} onClick={() => { setAdminNav('jadwal'); setIsMobileMenuOpen(false); }} />
                 <button onClick={() => { setView('landing'); setIsMobileMenuOpen(false); }} className="flex items-center w-full px-4 py-3 mt-4 text-emerald-200 bg-emerald-800 rounded-lg">
                  <LogOut className="w-5 h-5 mr-3" /> Keluar
                </button>
              </nav>
            </div>
          )}

          <main className="flex-1 flex flex-col h-screen overflow-hidden pt-16 md:pt-0 bg-gray-50">
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              {adminNav === 'dashboard' && <AdminDashboard setAdminNav={setAdminNav} showToast={showToast} />}
              {adminNav === 'peserta' && <AdminPeserta showToast={showToast} />}
              {adminNav === 'kehadiran' && <AdminKehadiran showToast={showToast} />}
              {adminNav === 'kas' && <AdminKas showToast={showToast} />}
              {adminNav === 'iuran' && <AdminIuran showToast={showToast} />}
              {adminNav === 'jadwal' && <AdminJadwal showToast={showToast} />}
            </div>
          </main>
        </div>
      )}

      {view === 'parent' && parentData && (
        <ParentDashboard 
          participant={parentData} 
          onBack={() => { setView('landing'); setParentData(null); }} 
        />
      )}
    </div>
  );
}

function LandingView({ onAdminLogin, onParentLogin, showToast }) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    const found = ADMIN_LIST.find(a => a.username === username.trim() && a.password === password);
    if (found) {
      onAdminLogin();
    } else {
      showToast('Username atau password admin salah!', 'error');
    }
    setLoading(false);
  };

  const handleParentLogin = async (e) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;
    setLoading(true);
    try {
      // Menggunakan Supabase API untuk mencari data pada tabel peserta
      const { data, error } = await supabase.from('peserta').select('*');
      if (error) throw error;
      
      let found = null;
      data.forEach((doc) => {
        if (doc.username.toLowerCase() === searchUsername.toLowerCase().trim()) {
          found = doc;
        }
      });

      if (found) {
        onParentLogin(found);
      } else {
        showToast('Username peserta tidak ditemukan. Silakan periksa kembali username yang dimasukkan.', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Gagal terhubung ke database.', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 p-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-900 tracking-tight mb-2">JAMIYYAH AL QUDUS KIDS</h1>
        <p className="text-emerald-700 font-medium text-lg">Sistem Administrasi & Informasi</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button 
            className={`flex-1 py-4 font-semibold text-center transition-colors ${!isAdminMode ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setIsAdminMode(false)}
          >
            👨‍👩‍👧 Orang Tua
          </button>
          <button 
            className={`flex-1 py-4 font-semibold text-center transition-colors ${isAdminMode ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setIsAdminMode(true)}
          >
            🔐 Admin
          </button>
        </div>

        <div className="p-8">
          {!isAdminMode ? (
            <form onSubmit={handleParentLogin}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Masukkan Username Peserta</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-gray-800" 
                    placeholder="Contoh: amel001" 
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                {loading ? 'Mencari...' : 'Lihat Data Peserta'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Username Admin</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-gray-50" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input 
                  type="password" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-gray-50" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-900 transition-colors"
              >
                {loading ? 'Memproses...' : 'Masuk sebagai Admin'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ setAdminNav, showToast }) {
  const [stats, setStats] = useState({ totalPeserta: 0, hadir: 0, sakit: 0, izin: 0, tk: 0, kasLunas: 0, totalIuran: 0, jadwalTerdekat: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatsAndSeed = async () => {
      try {
        const { data: pData } = await supabase.from('peserta').select('*');
        let totalP = pData?.length || 0;
        
        // Auto-seed data jika kosong
        if (totalP === 0) {
          showToast('Menginisialisasi 60 data peserta...', 'success');
          const seedData = INITIAL_PARTICIPANTS.map(p => ({ nama: p.nama, username: p.username, createdAt: new Date().toISOString() }));
          await supabase.from('peserta').insert(seedData);
          totalP = INITIAL_PARTICIPANTS.length;
        }

        const { data: aData } = await supabase.from('attendances').select('status');
        let h = 0, s = 0, i = 0, tk = 0;
        (aData || []).forEach(doc => {
          const stat = doc.status;
          if(stat === 'hadir') h++;
          if(stat === 'sakit') s++;
          if(stat === 'izin') i++;
          if(stat === 'tanpa_keterangan') tk++;
        });

        const { data: kData } = await supabase.from('kas').select('status');
        let kl = 0;
        (kData || []).forEach(doc => { if(doc.status === 'sudah_bayar') kl++; });

        const { data: iSnap } = await supabase.from('iurans').select('id');
        const { data: jSnap } = await supabase.from('activities').select('*'); // Supabase activities
        
        let schedules = jSnap || [];
        schedules.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
        const upcoming = schedules.find(sched => new Date(sched.tanggal) >= new Date()) || schedules[0] || null;

        setStats({ totalPeserta: totalP, hadir: h, sakit: s, izin: i, tk, kasLunas: kl, totalIuran: iSnap?.length || 0, jadwalTerdekat: upcoming });
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchStatsAndSeed();
  }, [showToast]);

  if (loading) return <div className="text-center py-10 text-emerald-700">Memuat dashboard...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => setAdminNav('peserta')} className="cursor-pointer transition hover:scale-105"><Card title="Total Peserta" value={stats.totalPeserta} icon={Users} colorClass="bg-blue-500 text-blue-600" /></div>
        <div onClick={() => setAdminNav('jadwal')} className="cursor-pointer transition hover:scale-105"><Card title="Jadwal Acara" value={stats.jadwalTerdekat ? 'Ada' : '0'} icon={Calendar} colorClass="bg-purple-500 text-purple-600" /></div>
        <div onClick={() => setAdminNav('kas')} className="cursor-pointer transition hover:scale-105"><Card title="Kas Lunas" value={stats.kasLunas} icon={Wallet} colorClass="bg-emerald-500 text-emerald-600" /></div>
        <div onClick={() => setAdminNav('iuran')} className="cursor-pointer transition hover:scale-105"><Card title="Jenis Iuran" value={stats.totalIuran} icon={Receipt} colorClass="bg-amber-500 text-amber-600" /></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><CheckSquare className="w-5 h-5 mr-2 text-emerald-600" /> Rekap Kehadiran</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 p-4 rounded-lg text-center"><span className="block text-sm text-emerald-700 font-medium">Hadir</span><span className="text-2xl font-bold text-emerald-700">{stats.hadir}</span></div>
            <div className="bg-amber-50 p-4 rounded-lg text-center"><span className="block text-sm text-amber-700 font-medium">Izin</span><span className="text-2xl font-bold text-amber-700">{stats.izin}</span></div>
            <div className="bg-red-50 p-4 rounded-lg text-center"><span className="block text-sm text-red-700 font-medium">Sakit</span><span className="text-2xl font-bold text-red-700">{stats.sakit}</span></div>
            <div className="bg-gray-100 p-4 rounded-lg text-center"><span className="block text-sm text-gray-700 font-medium">Alpha</span><span className="text-2xl font-bold text-gray-700">{stats.tk}</span></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Clock className="w-5 h-5 mr-2 text-emerald-600" /> Jadwal Acara Terdekat</h3>
          {stats.jadwalTerdekat ? (
            <div className="bg-emerald-900 text-white p-5 rounded-xl">
              <h4 className="font-bold text-xl mb-1">{stats.jadwalTerdekat.nama_acara}</h4>
              <p className="text-emerald-200 text-sm mb-3">{new Date(stats.jadwalTerdekat.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<br/>{stats.jadwalTerdekat.waktu_mulai} - {stats.jadwalTerdekat.waktu_selesai}</p>
              <p className="bg-emerald-800 p-3 rounded-lg text-sm text-emerald-50">"{stats.jadwalTerdekat.catatan}"</p>
            </div>
          ) : <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">Belum ada jadwal acara.</div>}
        </div>
      </div>
    </div>
  );
}

function AdminPeserta({ showToast }) {
  const participantsData = useSupabaseData('peserta');
  const participants = [...participantsData].sort((a, b) => a.nama.localeCompare(b.nama));
  
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, nama: '', username: '' });
  const [deleteId, setDeleteId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.username.trim()) return;
    if (participants.find(p => p.username === formData.username && p.id !== formData.id)) {
      showToast('Username sudah digunakan peserta lain!', 'error');
      return;
    }
    try {
      if (formData.id) {
        await supabase.from('peserta').update({ nama: formData.nama, username: formData.username }).eq('id', formData.id);
        showToast('Data berhasil diperbarui.');
      } else {
        await supabase.from('peserta').insert({ nama: formData.nama, username: formData.username, createdAt: new Date().toISOString() });
        showToast('Peserta berhasil ditambahkan.');
      }
      setIsModalOpen(false);
      setFormData({ id: null, nama: '', username: '' });
    } catch (err) { showToast('Gagal menyimpan data!', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await supabase.from('peserta').delete().eq('id', deleteId);
      showToast('Data berhasil dihapus.');
      setDeleteId(null);
    } catch (err) { showToast('Gagal menghapus.', 'error'); }
  };

  const filtered = participants.filter(p => p.nama.toLowerCase().includes(search.toLowerCase()) || p.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">Kelola Peserta ({participants.length})</h2>
        <button onClick={() => { setFormData({ id: null, nama: '', username: '' }); setIsModalOpen(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Tambah Peserta
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Cari nama atau username..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
        </div>
        <div className="overflow-x-auto h-[calc(100vh-280px)]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr className="text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold w-16">No</th>
                <th className="p-4 font-semibold">Nama Peserta</th>
                <th className="p-4 font-semibold">Username</th>
                <th className="p-4 font-semibold text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filtered.map((p, idx) => (
                <tr key={p.id} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="p-4">{idx + 1}</td>
                  <td className="p-4 font-medium">{p.nama}</td>
                  <td className="p-4 text-emerald-700 font-mono text-sm">{p.username}</td>
                  <td className="p-4 flex justify-center space-x-2">
                    <button onClick={() => { setFormData(p); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={isModalOpen} title={formData.id ? "Edit Peserta" : "Tambah Peserta"} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama</label><input type="text" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full p-2.5 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Username</label><input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-2.5 border rounded-lg font-mono text-sm" /></div>
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg mt-4">Simpan</button>
        </form>
      </Modal>
      <ConfirmModal isOpen={!!deleteId} message="Yakin hapus peserta ini?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}

function AdminKehadiran({ showToast }) {
  const meetingsData = useSupabaseData('meetings');
  const meetings = [...meetingsData].sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const participantsData = useSupabaseData('peserta');
  const participants = [...participantsData].sort((a, b) => a.nama.localeCompare(b.nama));
  
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [attendances, setAttendances] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const attendancesData = useSupabaseData('attendances');

  useEffect(() => {
    if (!selectedMeetingId) { setAttendances({}); return; }
    const atts = {};
    attendancesData.forEach(data => {
      if (data.meetingId === selectedMeetingId) atts[data.participantId] = { id: data.id, status: data.status };
    });
    setAttendances(atts);
  }, [attendancesData, selectedMeetingId]);

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('meetings').insert({ tanggal: newDate, createdAt: new Date().toISOString() }).select();
      if (error) throw error;
      showToast('Pertemuan dibuat.');
      setIsModalOpen(false);
      if (data && data[0]) setSelectedMeetingId(data[0].id);
      setNewDate('');
    } catch (err) { showToast('Gagal.', 'error'); }
  };

  const handleDeleteMeeting = async () => {
    if (!deleteId) return;
    try {
      await supabase.from('meetings').delete().eq('id', deleteId);
      showToast('Dihapus.');
      if (selectedMeetingId === deleteId) setSelectedMeetingId(null);
      setDeleteId(null);
    } catch (err) { showToast('Gagal.', 'error'); }
  };

  const handleStatusChange = async (participantId, newStatus) => {
    const existing = attendances[participantId];
    try {
      if (existing) {
        await supabase.from('attendances').update({ status: newStatus }).eq('id', existing.id);
      } else {
        await supabase.from('attendances').insert({ meetingId: selectedMeetingId, participantId, status: newStatus });
      }
    } catch (err) { showToast('Gagal.', 'error'); }
  };

  const statusOptions = [
    { value: 'hadir', label: 'Hadir', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'sakit', label: 'Sakit', color: 'bg-red-100 text-red-800' },
    { value: 'izin', label: 'Izin', color: 'bg-amber-100 text-amber-800' },
    { value: 'tanpa_keterangan', label: 'Alpha', color: 'bg-gray-100 text-gray-800' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">Kehadiran</h2>
        <button onClick={() => { setNewDate(''); setIsModalOpen(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Buat Pertemuan
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-4 lg:col-span-1 h-[calc(100vh-250px)] overflow-y-auto">
          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Daftar Pertemuan</h3>
          <div className="space-y-2">
            {meetings.map(m => (
              <div key={m.id} className="flex items-center justify-between group">
                <button onClick={() => setSelectedMeetingId(m.id)} className={`flex-1 text-left px-3 py-2 rounded-lg text-sm ${selectedMeetingId === m.id ? 'bg-emerald-600 text-white font-medium' : 'hover:bg-emerald-50 text-gray-700'}`}>
                  {new Date(m.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </button>
                <button onClick={() => setDeleteId(m.id)} className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border lg:col-span-3 h-[calc(100vh-250px)] flex flex-col">
          {!selectedMeetingId ? <div className="flex-1 flex items-center justify-center text-gray-400">Pilih pertemuan di samping.</div> : (
            <>
              <div className="p-4 border-b bg-emerald-50 flex justify-between items-center">
                <h3 className="font-bold text-emerald-900">Pertemuan: {meetings.find(m=>m.id===selectedMeetingId)?.tanggal}</h3>
                <span className="text-sm font-medium bg-white px-3 py-1 rounded-full text-emerald-700 border">{Object.keys(attendances).length} / {participants.length} Terisi</span>
              </div>
              <div className="overflow-y-auto flex-1 p-0">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr><th className="p-4 text-sm font-semibold">Nama Peserta</th><th className="p-4 text-sm font-semibold">Status Kehadiran</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {participants.map(p => {
                      const cur = attendances[p.id]?.status || '';
                      return (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-4 font-medium">{p.nama}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {statusOptions.map(opt => (
                                <button key={opt.value} onClick={() => handleStatusChange(p.id, opt.value)} className={`px-3 py-1.5 text-xs font-medium rounded-md border ${cur === opt.value ? `${opt.color} border-transparent ring-2` : 'bg-white border-gray-300'}`}>
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
      <Modal isOpen={isModalOpen} title="Buat Pertemuan Baru" onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleCreateMeeting} className="space-y-4">
          <div><label className="block text-sm mb-1">Tanggal</label><input type="date" required value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full p-2.5 border rounded-lg" /></div>
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg mt-4">Buat</button>
        </form>
      </Modal>
      <ConfirmModal isOpen={!!deleteId} message="Yakin hapus pertemuan?" onConfirm={handleDeleteMeeting} onCancel={() => setDeleteId(null)} />
    </div>
  );
}

function AdminKas({ showToast }) {
  const participantsData = useSupabaseData('peserta');
  const participants = [...participantsData].sort((a,b) => a.nama.localeCompare(b.nama));
  const kasDataList = useSupabaseData('kas');
  
  const [kasData, setKasData] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    const k = {};
    kasDataList.forEach(doc => k[doc.id] = doc.status);
    setKasData(k);
  }, [kasDataList]);

  const toggleKasStatus = async (participantId) => {
    const next = (kasData[participantId] === 'sudah_bayar') ? 'belum_bayar' : 'sudah_bayar';
    try { 
      await supabase.from('kas').upsert({ id: participantId, status: next, updatedAt: new Date().toISOString() }); 
    } catch (err) { showToast('Gagal.', 'error'); }
  };

  const filtered = participants.filter(p => p.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center"><Wallet className="w-6 h-6 mr-3 text-emerald-600" /> Pengelolaan Kas</h2>
        <p className="text-gray-500 text-sm mt-1">Klik tombol status untuk mengubah.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <input type="text" placeholder="Cari peserta..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full max-w-sm px-4 py-2 border rounded-lg outline-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-t h-[calc(100vh-250px)] overflow-y-auto content-start">
          {filtered.map(p => {
            const isLunas = kasData[p.id] === 'sudah_bayar';
            return (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 border-b">
                <span className="font-medium text-gray-700 truncate w-32">{p.nama}</span>
                <button onClick={() => toggleKasStatus(p.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${isLunas ? 'bg-emerald-500 text-white' : 'bg-white text-red-600 border border-red-200'}`}>
                  {isLunas ? '🟢 Sudah Bayar' : '🔴 Belum Bayar'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AdminIuran({ showToast }) {
  const iuransData = useSupabaseData('iurans');
  const iurans = [...iuransData];
  const participantsData = useSupabaseData('peserta');
  const participants = [...participantsData].sort((a,b)=>a.nama.localeCompare(b.nama));
  const paymentsData = useSupabaseData('iuran_payments');

  const [selectedIuranId, setSelectedIuranId] = useState(null);
  const [payments, setPayments] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, nama: '', catatan: '' });
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (!selectedIuranId) return;
    const pym = {};
    paymentsData.forEach(data => {
      if (data.iuranId === selectedIuranId) pym[data.participantId] = { id: data.id, status: data.status };
    });
    setPayments(pym);
  }, [paymentsData, selectedIuranId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await supabase.from('iurans').update({ nama: formData.nama, catatan: formData.catatan }).eq('id', formData.id);
        showToast('Iuran diperbarui.');
      } else {
        const { data, error } = await supabase.from('iurans').insert({ nama: formData.nama, catatan: formData.catatan, createdAt: new Date().toISOString() }).select();
        if (error) throw error;
        if (data && data[0]) setSelectedIuranId(data[0].id);
        showToast('Iuran dibuat.');
      }
      setIsModalOpen(false);
      setFormData({ id: null, nama: '', catatan: '' });
    } catch (err) { showToast('Gagal.', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await supabase.from('iurans').delete().eq('id', deleteId);
      showToast('Dihapus.');
      if(selectedIuranId === deleteId) setSelectedIuranId(null);
      setDeleteId(null);
    } catch (err) { showToast('Gagal.', 'error'); }
  };

  const togglePaymentStatus = async (participantId) => {
    const existing = payments[participantId];
    const newStatus = existing?.status === 'sudah_bayar' ? 'belum_bayar' : 'sudah_bayar';
    try {
      if (existing) {
        await supabase.from('iuran_payments').update({ status: newStatus }).eq('id', existing.id);
      } else {
        await supabase.from('iuran_payments').insert({ iuranId: selectedIuranId, participantId, status: newStatus });
      }
    } catch (err) { showToast('Gagal.', 'error'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
        <div><h2 className="text-2xl font-bold text-gray-800 flex items-center"><Receipt className="w-6 h-6 mr-3 text-emerald-600" /> Iuran Khusus</h2></div>
        <button onClick={() => { setFormData({ id: null, nama: '', catatan: '' }); setIsModalOpen(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Buat Iuran Baru
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-4 lg:col-span-1 h-[calc(100vh-250px)] overflow-y-auto">
          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Daftar Iuran</h3>
          <div className="space-y-3">
            {iurans.map(i => (
              <div key={i.id} className={`p-3 rounded-lg border cursor-pointer ${selectedIuranId === i.id ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-gray-200'}`} onClick={() => setSelectedIuranId(i.id)}>
                <h4 className="font-bold text-sm text-gray-800">{i.nama}</h4>
                <div className="flex justify-between items-center mt-2">
                  <button onClick={(e) => { e.stopPropagation(); setFormData(i); setIsModalOpen(true); }} className="text-xs text-blue-600">Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteId(i.id); }} className="text-xs text-red-600">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border lg:col-span-3 h-[calc(100vh-250px)] flex flex-col">
          {!selectedIuranId ? <div className="flex-1 flex items-center justify-center text-gray-400">Pilih iuran di samping.</div> : (
            <>
              <div className="p-5 border-b bg-gray-50">
                <h3 className="font-bold text-xl text-gray-800">{iurans.find(i=>i.id===selectedIuranId)?.nama}</h3>
                <p className="text-sm text-gray-600 italic mt-1 bg-white p-2 border rounded-md">« {iurans.find(i=>i.id===selectedIuranId)?.catatan || '-'} »</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr><th className="p-3 pl-5 text-sm font-semibold">Nama Peserta</th><th className="p-3 pr-5 text-right text-sm font-semibold">Status</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {participants.map(p => {
                      const isLunas = payments[p.id]?.status === 'sudah_bayar';
                      return (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-3 pl-5 font-medium">{p.nama}</td>
                          <td className="p-3 pr-5 text-right">
                            <button onClick={() => togglePaymentStatus(p.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${isLunas ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500 border'}`}>
                              {isLunas ? '🟢 Sudah Bayar' : '🔴 Belum Bayar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
      <Modal isOpen={isModalOpen} title={formData.id ? "Edit Iuran" : "Buat Iuran"} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm mb-1">Nama Iuran</label><input type="text" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full p-2.5 border rounded-lg" /></div>
          <div><label className="block text-sm mb-1">Catatan</label><textarea required value={formData.catatan} onChange={e => setFormData({...formData, catatan: e.target.value})} className="w-full p-2.5 border rounded-lg" rows="3" /></div>
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg mt-4">Simpan</button>
        </form>
      </Modal>
      <ConfirmModal isOpen={!!deleteId} message="Yakin hapus iuran?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}

function AdminJadwal({ showToast }) {
  const schedulesData = useSupabaseData('activities'); // Sesuai permintaan tabel 'activities'
  const schedules = [...schedulesData].sort((a,b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, nama_acara: '', tanggal: '', waktu_mulai: '', waktu_selesai: '', catatan: '' });
  const [deleteId, setDeleteId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nama_acara: formData.nama_acara,
        tanggal: formData.tanggal,
        waktu_mulai: formData.waktu_mulai,
        waktu_selesai: formData.waktu_selesai,
        catatan: formData.catatan
      };

      if (formData.id) {
        await supabase.from('activities').update(payload).eq('id', formData.id);
        showToast('Jadwal Acara diperbarui.');
      } else {
        await supabase.from('activities').insert({ ...payload, createdAt: new Date().toISOString() });
        showToast('Jadwal Acara berhasil ditambahkan.');
      }
      setIsModalOpen(false);
      setFormData({ id: null, nama_acara: '', tanggal: '', waktu_mulai: '', waktu_selesai: '', catatan: '' });
    } catch (err) { 
      console.error(err);
      showToast('Gagal menyimpan jadwal rutinan.', 'error'); 
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await supabase.from('activities').delete().eq('id', deleteId);
      showToast('Jadwal Acara dihapus.');
      setDeleteId(null);
    } catch (err) { showToast('Gagal menghapus.', 'error'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center"><Calendar className="w-6 h-6 mr-3 text-emerald-600" /> Jadwal Acara</h2>
        <button onClick={() => { setFormData({ id: null, nama_acara: '', tanggal: '', waktu_mulai: '', waktu_selesai: '', catatan: '' }); setIsModalOpen(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Tambah Jadwal Acara
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {schedules.length === 0 ? <div className="col-span-full text-center py-12 bg-white rounded-xl border text-gray-500">Belum ada jadwal acara.</div> : schedules.map(s => (
          <div key={s.id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
            <div className="bg-emerald-900 text-white p-4">
              <h3 className="font-bold text-lg">{s.nama_acara}</h3>
              <p className="text-emerald-200 text-sm mt-1">{new Date(s.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-emerald-200 text-sm">{s.waktu_mulai} - {s.waktu_selesai}</p>
            </div>
            <div className="p-4 flex-1 bg-emerald-50/30"><p className="text-sm text-gray-700">« {s.catatan} »</p></div>
            <div className="p-3 bg-gray-50 border-t flex justify-end space-x-2">
              <button onClick={() => { setFormData(s); setIsModalOpen(true); }} className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md text-sm">Edit</button>
              <button onClick={() => setDeleteId(s.id)} className="text-red-600 bg-red-50 px-3 py-1.5 rounded-md text-sm">Hapus</button>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={isModalOpen} title={formData.id ? "Edit Jadwal Acara" : "Tambah Jadwal Acara"} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm mb-1">Nama Kegiatan/Acara</label><input type="text" required value={formData.nama_acara} onChange={e => setFormData({...formData, nama_acara: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="Contoh: Kajian Pekanan" /></div>
          <div><label className="block text-sm mb-1">Tanggal</label><input type="date" required value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="w-full p-2.5 border rounded-lg" /></div>
          <div className="flex gap-4">
            <div className="flex-1"><label className="block text-sm mb-1">Waktu Mulai</label><input type="time" required value={formData.waktu_mulai} onChange={e => setFormData({...formData, waktu_mulai: e.target.value})} className="w-full p-2.5 border rounded-lg" /></div>
            <div className="flex-1"><label className="block text-sm mb-1">Waktu Selesai</label><input type="time" required value={formData.waktu_selesai} onChange={e => setFormData({...formData, waktu_selesai: e.target.value})} className="w-full p-2.5 border rounded-lg" /></div>
          </div>
          <div><label className="block text-sm mb-1">Catatan</label><textarea required value={formData.catatan} onChange={e => setFormData({...formData, catatan: e.target.value})} className="w-full p-2.5 border rounded-lg" rows="3" placeholder="Kajian rutin anak-anak." /></div>
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg mt-4">Simpan Jadwal Acara</button>
        </form>
      </Modal>
      <ConfirmModal isOpen={!!deleteId} message="Yakin hapus jadwal acara ini?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}

function ParentDashboard({ participant, onBack }) {
  const [activeTab, setActiveTab] = useState('kehadiran');
  const [attendances, setAttendances] = useState([]);
  const [kasStatus, setKasStatus] = useState('belum_bayar');
  const [iurans, setIurans] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchParentData = async () => {
      try {
        const { data: snapM } = await supabase.from('meetings').select('*');
        const { data: snapA } = await supabase.from('attendances').select('*').eq('participantId', participant.id);
        
        let ms = snapM || [];
        ms.sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

        const attMap = {};
        (snapA || []).forEach(d => { attMap[d.meetingId] = d.status; });

        const history = [];
        ms.forEach(m => { if(attMap[m.id]) history.push({ tanggal: m.tanggal, status: attMap[m.id] }); });
        setAttendances(history);

        const { data: kasDoc } = await supabase.from('kas').select('*').eq('id', participant.id).single();
        if (kasDoc) setKasStatus(kasDoc.status);

        const { data: snapI } = await supabase.from('iurans').select('*');
        const { data: snapPym } = await supabase.from('iuran_payments').select('*').eq('participantId', participant.id);
        const pymMap = {};
        (snapPym || []).forEach(d => { pymMap[d.iuranId] = d.status; });

        setIurans((snapI || []).map(d => ({ nama: d.nama, catatan: d.catatan, status: pymMap[d.id] || 'belum_bayar' })));

        const { data: snapS } = await supabase.from('activities').select('*');
        let scheds = snapS || [];
        scheds.sort((a,b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
        
        setSchedules(scheds);
      } catch(err) { console.error(err); }
    };
    fetchParentData();
  }, [participant.id]);

  const TabButton = ({ id, label, icon: Icon }) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center justify-center flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === id ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
      <Icon className="w-4 h-4 mr-2 hidden sm:block" /> {label}
    </button>
  );

  const StatusBadge = ({ status }) => {
    if (status === 'hadir' || status === 'sudah_bayar') return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">🟢 {status === 'hadir' ? 'Hadir' : 'Sudah Bayar'}</span>;
    if (status === 'sakit') return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">🔴 Sakit</span>;
    if (status === 'belum_bayar') return <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full text-xs font-bold">🔴 Belum Bayar</span>;
    if (status === 'izin') return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">🟡 Izin</span>;
    return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">⚪ Alpha</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-emerald-900 text-white p-4 shadow-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="text-emerald-200 hover:text-white flex items-center font-medium"><LogOut className="w-5 h-5 mr-2 rotate-180" /> Keluar</button>
          <h1 className="font-bold text-lg hidden sm:block">PORTAL ORANG TUA</h1>
          <div className="font-mono text-sm text-emerald-300">JAMIYYAH AL QUDUS</div>
        </div>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6 flex items-center space-x-6 relative overflow-hidden">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-3xl font-bold shadow-inner">
            {participant.nama.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">{participant.nama}</h2>
            <p className="text-emerald-600 font-mono text-sm mt-1">@{participant.username}</p>
          </div>
        </div>
        <div className={`rounded-2xl shadow-sm border p-6 flex justify-between items-center ${kasStatus === 'sudah_bayar' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <div><h3 className="font-bold text-gray-800 text-lg flex items-center"><Wallet className="w-5 h-5 mr-2" /> Status Kas Rutin</h3></div>
          <div><StatusBadge status={kasStatus} /></div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="flex border-b bg-white sticky top-[68px] z-10">
            <TabButton id="kehadiran" label="Kehadiran" icon={CheckSquare} />
            <TabButton id="iuran" label="Iuran" icon={Receipt} />
            <TabButton id="jadwal" label="Jadwal Acara" icon={Calendar} />
          </div>
          <div className="p-0">
            {activeTab === 'kehadiran' && (
              <div className="divide-y">
                {attendances.length === 0 ? <p className="p-8 text-center text-gray-500">Belum ada riwayat kehadiran.</p> : attendances.map((att, i) => (
                  <div key={i} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <span className="font-medium text-gray-700">{new Date(att.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <StatusBadge status={att.status} />
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'iuran' && (
              <div className="divide-y">
                {iurans.length === 0 ? <p className="p-8 text-center text-gray-500">Tidak ada iuran khusus.</p> : iurans.map((iuran, i) => (
                  <div key={i} className="p-5 hover:bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div><h4 className="font-bold text-gray-800">{iuran.nama}</h4><p className="text-sm text-gray-500 italic mt-1">« {iuran.catatan} »</p></div>
                    <div><StatusBadge status={iuran.status} /></div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'jadwal' && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50">
                {schedules.length === 0 ? <p className="col-span-full py-8 text-center text-gray-500">Tidak ada jadwal acara.</p> : schedules.map((s, idx) => (
                  <div key={idx} className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm">
                    <h4 className="font-bold text-lg text-emerald-900">{s.nama_acara}</h4>
                    <p className="text-sm text-gray-600 mt-2">{new Date(s.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-sm text-gray-600">{s.waktu_mulai} - {s.waktu_selesai} WIB</p>
                    <div className="mt-3 bg-emerald-50 p-2 rounded text-sm text-emerald-800 border">Catatan: {s.catatan}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
