import { useState, useEffect } from "react";

// ── SUPABASE CONFIG ──
const SUPABASE_URL = "https://escaqwyowrenrsikbvvh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzY2Fxd3lvd3JlbnJzaWtidnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjcyMDEsImV4cCI6MjA5NTY0MzIwMX0.9OXNxsJUmahr2fkarQqGRmdwS1-qkxkXnzic8Wa7LDo";

const sbFetch = async (path, method="GET", body=null) => {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts);
  if (!res.ok) { const e = await res.text(); console.error("SB error:", e); return null; }
  try { return await res.json(); } catch { return null; }
};

const BARANG_DAGANGAN = [
  { id: 1, nama: "Susu", harga: 13000 },
  { id: 2, nama: "Mentega", harga: 7000 },
  { id: 3, nama: "Susu Jahe", harga: 13000 },
  { id: 4, nama: "Keju", harga: 14000 },
  { id: 5, nama: "Milo", harga: 20000 },
  { id: 6, nama: "Bengbeng", harga: 22000 },
  { id: 7, nama: "Teh Lemon", harga: 20000 },
  { id: 8, nama: "Teh", harga: 7000 },
  { id: 9, nama: "Extrajoss", harga: 17000 },
  { id: 10, nama: "Areng", harga: 10000 },
  { id: 11, nama: "Sawi", harga: 5000 },
  { id: 12, nama: "Telur Puyuh", harga: 20000 },
  { id: 13, nama: "Usus", harga: 12000 },
  { id: 14, nama: "Sayap", harga: 20000 },
  { id: 15, nama: "Bawang Putih", harga: 35000 },
  { id: 16, nama: "Cabe Setan 1/2", harga: 33000 },
  { id: 17, nama: "Cabe Merah 1/2", harga: 23000 },
  { id: 18, nama: "Dumpling Ayam", harga: 28000 },
  { id: 19, nama: "Dumpling Keju", harga: 30000 },
  { id: 20, nama: "Roti", harga: 6000 },
  { id: 21, nama: "Minyak", harga: 22000 },
  { id: 22, nama: "Gula", harga: 19000 },
  { id: 23, nama: "Kopi Besar", harga: 36000 },
  { id: 24, nama: "Air Galon", harga: 5000 },
  { id: 25, nama: "Meses", harga: 8500 },
  { id: 26, nama: "Totole", harga: 15000 },
  { id: 27, nama: "Pisang", harga: 8000 },
  { id: 28, nama: "Good Day", harga: 22000 },
  { id: 29, nama: "Kecap Bango", harga: 10000 },
  { id: 30, nama: "Paha Fillet 0.5kg", harga: 25000 },
  { id: 31, nama: "Saikoro 1kg", harga: 190000 },
  { id: 32, nama: "Kulit 0.5kg", harga: 12000 },
  { id: 33, nama: "Bumbu Ungkep", harga: 10000 },
  { id: 34, nama: "Bakso", harga: 12000 },
  { id: 35, nama: "Chikuwa", harga: 28000 },
];

const KATEGORI_LAIN = ["Operasional","Peralatan","Gaji Karyawan","Marketing","Lain-lain"];
const HARI = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const formatRp = (n) => "Rp " + (n||0).toLocaleString("id-ID");
const toDateKey = (d) => { const x=new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`; };
const today = toDateKey(new Date());

export default function PengeluaranSAe() {
  const [view, setView] = useState("input");
  const [tab, setTab] = useState("barang");
  const [cart, setCart] = useState({}); // {id: qty}
  const [search, setSearch] = useState("");
  const [pengeluaran, setPengeluaran] = useState([]);
  const [filterDate, setFilterDate] = useState(today);

  // Lain form
  const [namaLain, setNamaLain] = useState("");
  const [kategoriLain, setKategoriLain] = useState("Operasional");
  const [nominalLain, setNominalLain] = useState("");
  const [catatanLain, setCatatanLain] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from Supabase
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await sbFetch("pengeluaran?select=*&order=timestamp.desc");
      if (data) setPengeluaran(data.map(d => ({
        id: d.id, tanggal: d.tanggal, timestamp: d.timestamp,
        type: d.type, nama: d.nama, qty: d.qty,
        hargaSatuan: d.harga_satuan, total: d.total,
        kategori: d.kategori, catatan: d.catatan,
      })));
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const updateCart = (id, delta) => {
    setCart(prev => {
      const cur = prev[id] || 0;
      const next = cur + delta;
      if (next <= 0) { const c = {...prev}; delete c[id]; return c; }
      return {...prev, [id]: next};
    });
  };

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const b = BARANG_DAGANGAN.find(b => b.id === parseInt(id));
    return { ...b, qty };
  });
  const cartTotal = cartItems.reduce((s, i) => s + i.harga * i.qty, 0);

  const simpanBelanja = async () => {
    if (cartItems.length === 0) return;
    const items = cartItems.map(i => ({
      id: Date.now() + Math.random(),
      tanggal: today,
      timestamp: new Date().toISOString(),
      type: "barang",
      nama: i.nama,
      qty: i.qty,
      hargaSatuan: i.harga,
      total: i.harga * i.qty,
    }));
    setPengeluaran(prev => [...items, ...prev]);
    setCart({});
    // Save to Supabase
    for (const item of items) {
      await sbFetch("pengeluaran", "POST", {
        id: item.id, tanggal: item.tanggal, timestamp: item.timestamp,
        type: item.type, nama: item.nama, qty: item.qty,
        harga_satuan: item.hargaSatuan, total: item.total,
      });
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const tambahLain = async () => {
    if (!namaLain || !nominalLain) return;
    const item = {
      id: Date.now(),
      tanggal: today,
      timestamp: new Date().toISOString(),
      type: "lain",
      nama: namaLain,
      kategori: kategoriLain,
      total: parseInt(nominalLain) || 0,
      catatan: catatanLain,
    };
    setPengeluaran(prev => [item, ...prev]);
    setNamaLain(""); setNominalLain(""); setCatatanLain("");
    await sbFetch("pengeluaran", "POST", {
      id: item.id, tanggal: item.tanggal, timestamp: item.timestamp,
      type: item.type, nama: item.nama, total: item.total,
      kategori: item.kategori, catatan: item.catatan,
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const hapus = async (id) => {
    setPengeluaran(prev => prev.filter(p => p.id !== id));
    setConfirmId(null);
    await sbFetch(`pengeluaran?id=eq.${id}`, "DELETE");
  };

  const filtered = pengeluaran.filter(p => !filterDate || p.tanggal === filterDate);
  const totalFiltered = filtered.reduce((s,p) => s+p.total, 0);
  const totalBarang = filtered.filter(p=>p.type==="barang").reduce((s,p)=>s+p.total,0);
  const totalLain = filtered.filter(p=>p.type==="lain").reduce((s,p)=>s+p.total,0);

  const grouped = {};
  pengeluaran.forEach(p => { if(!grouped[p.tanggal])grouped[p.tanggal]=[]; grouped[p.tanggal].push(p); });
  const sortedDates = Object.keys(grouped).sort((a,b)=>b.localeCompare(a));

  const filteredBarang = BARANG_DAGANGAN.filter(b => b.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ fontFamily:"'Nunito','Segoe UI',sans-serif", background:"#fdf6ec", minHeight:"100vh", color:"#2d1a00" }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#1a0a00,#3d1f00)", padding:"13px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 3px 12px rgba(0,0,0,0.3)" }}>
        <div>
          <div style={{ fontSize:18, fontWeight:900, color:"#f5c842" }}>SAe Angkringan</div>
          <div style={{ fontSize:10, color:"#c9a96e" }}>📒 Buku Pengeluaran</div>
        </div>
        <div style={{ display:"flex", gap:7 }}>
          {[["input","✏️ Input"],["rekap","📊 Rekap"]].map(([v,label])=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:"6px 12px", borderRadius:20, border:"none", cursor:"pointer", fontWeight:700, fontSize:11, background:view===v?"#f5c842":"rgba(255,255,255,0.1)", color:view===v?"#1a0a00":"#f5c842" }}>{label}</button>
          ))}
        </div>
      </div>

      {showSuccess && (
        <div style={{ position:"fixed", top:68, left:"50%", transform:"translateX(-50%)", background:"#22c55e", color:"#fff", padding:"11px 26px", borderRadius:30, fontWeight:800, fontSize:14, zIndex:999 }}>✅ Tersimpan!</div>
      )}

      {/* INPUT VIEW */}
      {view === "input" && (
        <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 58px)" }}>
          {/* Tab */}
          <div style={{ display:"flex", borderBottom:"2px solid #f0e0c0", background:"#fff" }}>
            {[["barang","🛒 Barang"],["lain","📝 Lainnya"]].map(([t,label])=>(
              <button key={t} onClick={()=>setTab(t)} style={{ flex:1, padding:"10px 0", border:"none", cursor:"pointer", fontWeight:700, fontSize:12, background:tab===t?"#fff":"#fdf6ec", color:tab===t?"#c47a1e":"#aaa", borderBottom:tab===t?"2px solid #c47a1e":"none" }}>{label}</button>
            ))}
          </div>

          {tab === "barang" && (
            <>
              <div style={{ padding:"10px 14px 0" }}>
                <input placeholder="🔍 Cari barang..." value={search} onChange={e=>setSearch(e.target.value)}
                  style={{ width:"100%", padding:"8px 13px", borderRadius:20, border:"2px solid #e8d5b0", background:"#fff", fontSize:13, outline:"none", boxSizing:"border-box", color:"#2d1a00" }} />
              </div>

              {/* Barang grid */}
              <div style={{ flex:1, overflowY:"auto", padding:"10px 14px", display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:9, alignContent:"start" }}>
                {filteredBarang.map(b => {
                  const qty = cart[b.id] || 0;
                  return (
                    <div key={b.id} style={{ background:"#fff", borderRadius:13, padding:"11px 10px", boxShadow: qty>0 ? "0 0 0 2px #c47a1e, 0 2px 8px rgba(0,0,0,0.08)" : "0 2px 8px rgba(0,0,0,0.06)", position:"relative" }}>
                      {qty > 0 && (
                        <div style={{ position:"absolute", top:7, right:7, background:"#c47a1e", color:"#fff", borderRadius:"50%", width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900 }}>{qty}</div>
                      )}
                      <div style={{ fontSize:12, fontWeight:700, marginBottom:3, lineHeight:1.3, paddingRight:qty>0?18:0 }}>{b.nama}</div>
                      <div style={{ fontSize:12, fontWeight:900, color:"#ef4444", marginBottom:7 }}>{formatRp(b.harga)}</div>
                      <div style={{ display:"flex", gap:5 }}>
                        <button onClick={()=>updateCart(b.id,-1)} style={{ width:28, height:28, borderRadius:7, border:"none", background:qty>0?"#fee2e2":"#f0f0f0", color:qty>0?"#ef4444":"#ccc", fontWeight:900, fontSize:15, cursor:qty>0?"pointer":"default" }}>−</button>
                        <button onClick={()=>updateCart(b.id,1)} style={{ flex:1, height:28, borderRadius:7, border:"none", background:"#c47a1e", color:"#fff", fontWeight:700, fontSize:11, cursor:"pointer" }}>+ Tambah</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cart summary */}
              {cartItems.length > 0 && (
                <div style={{ background:"#fff", borderTop:"2px solid #f0e0c0", padding:"12px 14px", boxShadow:"0 -4px 20px rgba(0,0,0,0.08)" }}>
                  <div style={{ maxHeight:80, overflowY:"auto", marginBottom:8 }}>
                    {cartItems.map(i => (
                      <div key={i.id} style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#555", padding:"2px 0" }}>
                        <span>{i.nama} x{i.qty}</span>
                        <span style={{ fontWeight:700 }}>{formatRp(i.harga*i.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontWeight:900, fontSize:15, marginBottom:10, color:"#2d1a00" }}>
                    <span>Total Belanja</span>
                    <span style={{ color:"#ef4444" }}>{formatRp(cartTotal)}</span>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={()=>setCart({})} style={{ padding:"10px 16px", borderRadius:10, border:"none", background:"#fee2e2", color:"#ef4444", fontWeight:700, fontSize:13, cursor:"pointer" }}>🗑 Batal</button>
                    <button onClick={simpanBelanja} style={{ flex:1, padding:"10px 0", borderRadius:10, border:"none", background:"linear-gradient(135deg,#c47a1e,#f5a623)", color:"#fff", fontWeight:900, fontSize:15, cursor:"pointer" }}>✅ Simpan Belanja</button>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "lain" && (
            <div style={{ padding:14, overflowY:"auto" }}>
              <div style={{ background:"#fff", borderRadius:14, padding:14, boxShadow:"0 2px 10px rgba(0,0,0,0.08)" }}>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:11, color:"#999", marginBottom:4 }}>Nama Pengeluaran</div>
                  <input placeholder="Contoh: Bayar listrik..." value={namaLain} onChange={e=>setNamaLain(e.target.value)}
                    style={{ width:"100%", padding:"9px 12px", borderRadius:10, border:"2px solid #e8d5b0", fontSize:13, outline:"none", boxSizing:"border-box", color:"#2d1a00" }} />
                </div>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:11, color:"#999", marginBottom:6 }}>Kategori</div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {KATEGORI_LAIN.map(k=>(
                      <button key={k} onClick={()=>setKategoriLain(k)} style={{ padding:"6px 12px", borderRadius:20, border:"none", cursor:"pointer", fontWeight:700, fontSize:11, background:kategoriLain===k?"#c47a1e":"#f5ead6", color:kategoriLain===k?"#fff":"#7a4a00" }}>{k}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:11, color:"#999", marginBottom:4 }}>Nominal</div>
                  <input type="number" placeholder="Masukkan nominal..." value={nominalLain} onChange={e=>setNominalLain(e.target.value)}
                    style={{ width:"100%", padding:"9px 12px", borderRadius:10, border:"2px solid #e8d5b0", fontSize:14, outline:"none", boxSizing:"border-box", color:"#2d1a00" }} />
                </div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11, color:"#999", marginBottom:4 }}>Catatan (opsional)</div>
                  <input placeholder="Catatan tambahan..." value={catatanLain} onChange={e=>setCatatanLain(e.target.value)}
                    style={{ width:"100%", padding:"9px 12px", borderRadius:10, border:"2px solid #e8d5b0", fontSize:13, outline:"none", boxSizing:"border-box", color:"#2d1a00" }} />
                </div>
                <button onClick={tambahLain} disabled={!namaLain||!nominalLain} style={{ width:"100%", padding:"12px 0", borderRadius:12, border:"none", background:namaLain&&nominalLain?"linear-gradient(135deg,#c47a1e,#f5a623)":"#ddd", color:"#fff", fontWeight:900, fontSize:15, cursor:"pointer" }}>+ Tambah Pengeluaran</button>
              </div>

              {/* List lainnya hari ini */}
              {pengeluaran.filter(p=>p.tanggal===today&&p.type==="lain").length > 0 && (
                <div style={{ marginTop:14 }}>
                  <div style={{ fontWeight:800, fontSize:13, color:"#7a4a00", marginBottom:8 }}>Pengeluaran Lain Hari Ini</div>
                  {pengeluaran.filter(p=>p.tanggal===today&&p.type==="lain").map(p=>(
                    <div key={p.id} style={{ background:"#fff", borderRadius:12, padding:"10px 13px", marginBottom:8, boxShadow:"0 1px 6px rgba(0,0,0,0.07)" }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <div>
                          <div style={{ fontWeight:800, fontSize:13 }}>{p.nama}</div>
                          <div style={{ fontSize:11, color:"#999" }}>{p.kategori}{p.catatan?` · ${p.catatan}`:""}</div>
                        </div>
                        <span style={{ fontWeight:900, color:"#ef4444" }}>{formatRp(p.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* REKAP VIEW */}
      {view === "rekap" && (
        <div style={{ padding:14, overflowY:"auto", height:"calc(100vh - 58px)" }}>
          <div style={{ background:"linear-gradient(135deg,#3d1f00,#c47a1e)", borderRadius:16, padding:"16px 18px", marginBottom:12, color:"#fff", boxShadow:"0 4px 16px rgba(196,122,30,0.3)" }}>
            <div style={{ fontSize:12, opacity:0.8 }}>{filterDate===today?"Pengeluaran Hari Ini":filterDate||"Total Semua"}</div>
            <div style={{ fontSize:26, fontWeight:900, marginTop:3 }}>{formatRp(totalFiltered)}</div>
            <div style={{ display:"flex", gap:16, marginTop:6 }}>
              <div style={{ fontSize:11, opacity:0.8 }}>🛒 Barang: {formatRp(totalBarang)}</div>
              <div style={{ fontSize:11, opacity:0.8 }}>📝 Lain: {formatRp(totalLain)}</div>
            </div>
          </div>

          <div style={{ background:"#fff", borderRadius:12, padding:"12px 14px", marginBottom:14, boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#7a4a00", marginBottom:8 }}>📅 Filter Tanggal</div>
            <div style={{ display:"flex", gap:8 }}>
              <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)}
                style={{ flex:1, padding:"8px 11px", borderRadius:10, border:"2px solid #e8d5b0", fontSize:13, outline:"none", color:"#2d1a00" }} />
              {filterDate&&<button onClick={()=>setFilterDate("")} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#fff0dc", color:"#c47a1e", fontWeight:700, fontSize:12, cursor:"pointer" }}>Semua</button>}
            </div>
            <div style={{ display:"flex", gap:6, marginTop:8 }}>
              {[["Hari ini",today],["Kemarin",toDateKey(new Date(Date.now()-86400000))]].map(([label,dk])=>(
                <button key={label} onClick={()=>setFilterDate(dk)} style={{ padding:"5px 12px", borderRadius:20, border:"none", cursor:"pointer", background:filterDate===dk?"#c47a1e":"#f5ead6", color:filterDate===dk?"#fff":"#7a4a00", fontWeight:700, fontSize:11 }}>{label}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0
            ? <div style={{ textAlign:"center", padding:40, color:"#aaa" }}><div style={{fontSize:36}}>📭</div><div style={{fontWeight:700,marginTop:8}}>Belum ada pengeluaran</div></div>
            : sortedDates.filter(dk=>!filterDate||dk===filterDate).map(dk=>{
              const dayItems = grouped[dk];
              const d = new Date(dk+"T00:00:00");
              const dayTotal = dayItems.reduce((s,p)=>s+p.total,0);
              return (
                <div key={dk}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontWeight:800, fontSize:13, color:"#3d1f00" }}>{HARI[d.getDay()]}, {d.toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</span>
                    <span style={{ fontWeight:900, fontSize:13, color:"#ef4444" }}>{formatRp(dayTotal)}</span>
                  </div>
                  {dayItems.map(p=>(
                    <div key={p.id} style={{ background:"#fff", borderRadius:12, padding:"10px 13px", marginBottom:8, boxShadow:"0 1px 6px rgba(0,0,0,0.07)" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                        <div>
                          <div style={{ fontWeight:800, fontSize:13 }}>{p.nama}</div>
                          <div style={{ fontSize:11, color:"#999" }}>{p.type==="barang"?`${p.qty}x ${formatRp(p.hargaSatuan)}`:p.kategori}{p.catatan?` · ${p.catatan}`:""}</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontWeight:900, color:"#ef4444", fontSize:14 }}>{formatRp(p.total)}</div>
                          {confirmId===p.id
                            ? <div style={{display:"flex",gap:4,marginTop:3}}>
                                <button onClick={()=>hapus(p.id)} style={{padding:"3px 8px",borderRadius:6,border:"none",background:"#ef4444",color:"#fff",fontWeight:800,fontSize:10,cursor:"pointer"}}>Hapus</button>
                                <button onClick={()=>setConfirmId(null)} style={{padding:"3px 8px",borderRadius:6,border:"none",background:"#e5e7eb",color:"#555",fontWeight:700,fontSize:10,cursor:"pointer"}}>Batal</button>
                              </div>
                            : <button onClick={()=>setConfirmId(p.id)} style={{fontSize:10,color:"#ef4444",background:"#fee2e2",border:"none",borderRadius:6,padding:"2px 8px",cursor:"pointer",marginTop:3}}>🗑 Hapus</button>
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          }
        </div>
      )}
    </div>
  );
}
