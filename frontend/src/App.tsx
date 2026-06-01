import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Play, CheckCircle2, XCircle, ChevronRight, Server } from 'lucide-react';
import './index.css';

interface Student {
  id: string;
  name: string;
  gpa: number;
  major: string;
  year: string;
  credits: number;
}

interface Predicate {
  id: string;
  text: string;
}

interface Minterm {
  id: string;
  text: string;
}

interface Fragment {
  id: string;
  minterm: Minterm;
  students: Student[];
}

interface FragmentationResponse {
  originalPredicates: Predicate[];
  minimalPredicates: Predicate[];
  dropReasons: string[];
  minterms: Minterm[];
  fragments: Fragment[];
  students: Student[];
}

function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [predicates, setPredicates] = useState<string[]>(['GPA > 3.5', "Major = 'CS'", 'GPA <= 3.5', "Year = 'Senior'"]);
  const [newPredicate, setNewPredicate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FragmentationResponse | null>(null);
  const [reconstructedStudents, setReconstructedStudents] = useState<Student[] | null>(null);
  const [reconstructing, setReconstructing] = useState(false);
  const [deadNodes, setDeadNodes] = useState<string[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleAddPredicate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPredicate.trim()) {
      setPredicates([...predicates, newPredicate.trim()]);
      setNewPredicate('');
    }
  };

  const handleRemovePredicate = (index: number) => {
    setPredicates(predicates.filter((_, i) => i !== index));
  };

  const runFragmentation = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/fragment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ predicates }),
      });
      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setReconstructedStudents(null); // Reset when running new fragmentation
        setDeadNodes([]); // Reset dead nodes
      }
    } catch (error) {
      console.error('Error fragmenting data:', error);
      alert('Lỗi kết nối tới Backend. Spring Boot đã được bật chưa?');
    } finally {
      setLoading(false);
    }
  };

  const isDropped = (pText: string) => {
    if (!result) return false;
    return !result.minimalPredicates.some(p => p.text === pText);
  };

  const getDropReason = (pText: string) => {
    if (!result) return null;
    return result.dropReasons.find(r => r.includes(pText));
  };

  const handleReconstruct = async () => {
    setReconstructing(true);
    try {
      const response = await fetch('http://localhost:8080/api/reconstruct');
      if (response.ok) {
        const data = await response.json();
        setReconstructedStudents(data);
      }
    } catch (error) {
      console.error('Error reconstructing data:', error);
      alert('Lỗi kết nối tới Backend khi thực hiện Tái tạo dữ liệu.');
    } finally {
      setReconstructing(false);
    }
  };

  const handleKillNode = async (fragmentId: string) => {
    if (window.confirm(`Bạn có chắc muốn giả lập đánh sập Node chứa Phân mảnh ${fragmentId} không?`)) {
      try {
        await fetch(`http://localhost:8080/api/site/${fragmentId}`, { method: 'DELETE' });
        setDeadNodes(prev => [...prev, fragmentId]);
      } catch (error) {
        console.error('Error killing node:', error);
      }
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Predicate Tester</h1>
        <p>Tuyển sinh Đại học - Kiểm tra tính Tối thiểu trong Phân mảnh ngang</p>
      </header>

      <div className="grid-layout">
        {/* Left Column: Input and Original Data */}
        <div className="left-panel">
          <div className="glass-panel">
            <h2 className="section-title">
              <Database className="w-6 h-6 text-indigo-400" />
              Nhập Vị từ (Predicates)
            </h2>
            
            <form onSubmit={handleAddPredicate} className="input-group">
              <input 
                type="text" 
                className="input-field" 
                placeholder="ví dụ: GPA > 3.5" 
                value={newPredicate}
                onChange={(e) => setNewPredicate(e.target.value)}
              />
              <button type="submit" className="btn">
                <Plus className="w-5 h-5" /> Thêm
              </button>
            </form>

            <div className="predicate-list">
              {predicates.map((p, index) => (
                <div key={index} className="predicate-tag">
                  <span>{p}</span>
                  <button type="button" className="btn-danger" onClick={() => handleRemovePredicate(index)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {predicates.length === 0 && (
                <p style={{ color: 'var(--text-muted)' }}>Chưa có vị từ nào được thêm.</p>
              )}
            </div>

            <button 
              className="btn" 
              style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
              onClick={runFragmentation}
              disabled={loading || predicates.length === 0}
            >
              {loading ? 'Đang xử lý...' : <><Play className="w-5 h-5" /> Chạy thuật toán Phân mảnh</>}
            </button>
          </div>

          <div className="glass-panel" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">
              <Server className="w-6 h-6 text-indigo-400" />
              Dữ liệu: Sinh viên ({students.length})
            </h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>MÃ SV</th>
                    <th>HỌ TÊN</th>
                    <th>ĐIỂM (GPA)</th>
                    <th>NGÀNH</th>
                    <th>NĂM HỌC</th>
                    <th>TÍN CHỈ</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.name}</td>
                      <td>
                        <span className={`badge ${s.gpa >= 3.5 ? 'badge-success' : 'badge-warning'}`}>
                          {s.gpa.toFixed(2)}
                        </span>
                      </td>
                      <td>{s.major}</td>
                      <td>{s.year}</td>
                      <td>{s.credits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="right-panel">
          {result ? (
            <div className="glass-panel" style={{ animation: 'fadeIn 0.5s ease' }}>
              <div className="card-header">
                <h2 className="section-title">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  Kết quả Phân tích
                </h2>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Kiểm tra Tính Tối thiểu (Minimality)</h3>
                <div className="predicate-list">
                  {result.originalPredicates.map((p) => {
                    const dropped = isDropped(p.text);
                    const reason = getDropReason(p.text);
                    return (
                      <div key={p.id} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="predicate-tag" style={{ borderLeft: `4px solid ${dropped ? 'var(--danger)' : 'var(--success)'}` }}>
                          <span style={{ textDecoration: dropped ? 'line-through' : 'none', opacity: dropped ? 0.6 : 1 }}>
                            {p.text}
                          </span>
                          {dropped ? (
                            <XCircle className="w-5 h-5 text-red-400" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          )}
                        </div>
                        {dropped && reason && (
                          <div className="drop-reason">{reason}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                  Minterms Hợp lệ ({result.minterms.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {result.minterms.map((m) => (
                    <div key={m.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', fontFamily: 'monospace' }}>
                      <span className="badge badge-primary" style={{ marginRight: '0.5rem' }}>{m.id}</span>
                      {m.text}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                  Các Phân mảnh Dữ liệu ({result.fragments.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {result.fragments.map(f => {
                  const isDead = deadNodes.includes(f.id);
                  return (
                  <div key={f.id} className="fragment-card" style={{ opacity: isDead ? 0.5 : 1, filter: isDead ? 'grayscale(100%)' : 'none', position: 'relative' }}>
                    {isDead && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.5rem', fontWeight: 'bold', zIndex: 10, border: '2px solid white' }}>
                        NODE OFFLINE (BỊ SẬP)
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Phân mảnh {f.id} (Lưu tại Node {f.id})</h4>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span className="badge badge-success">{f.students.length} bản ghi</span>
                        {!isDead && (
                          <button onClick={() => handleKillNode(f.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                            [X] Đánh sập Node này
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Minterm: {f.minterm.text}
                    </div>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>MÃ SV</th>
                            <th>GPA</th>
                            <th>NGÀNH</th>
                            <th>NĂM HỌC</th>
                            <th>TÍN CHỈ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {f.students.map(s => (
                            <tr key={s.id}>
                              <td>{s.id}</td>
                              <td>{s.gpa.toFixed(2)}</td>
                              <td>{s.major}</td>
                              <td>{s.year}</td>
                              <td>{s.credits}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

              {/* Reconstruction Section */}
              <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                  Quy tắc Tái tạo (Reconstruction)
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  Các phân mảnh đã được lưu thành các file `Site_F*.csv` riêng biệt (đại diện cho các trạm phân tán). Nhấn nút dưới đây để mô phỏng quá trình gộp (UNION) dữ liệu từ các trạm về lại bảng gốc.
                </p>
                <button 
                  className="btn" 
                  style={{ background: '#10b981', marginBottom: '1.5rem' }}
                  onClick={handleReconstruct}
                  disabled={reconstructing}
                >
                  {reconstructing ? 'Đang Tái tạo...' : <><Database className="w-5 h-5" /> Tái tạo Dữ liệu (Reconstruct)</>}
                </button>

                {reconstructedStudents && (
                  <div className="fragment-card" style={{ background: reconstructedStudents.length < 30 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)', borderColor: reconstructedStudents.length < 30 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: reconstructedStudents.length < 30 ? '#ef4444' : '#10b981' }}>
                        Dữ liệu Đã Tái tạo {reconstructedStudents.length < 30 ? '(THẤT BẠI - MẤT MÁT DỮ LIỆU)' : '(THÀNH CÔNG)'}
                      </h4>
                      <span className="badge" style={{ background: reconstructedStudents.length < 30 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: reconstructedStudents.length < 30 ? '#ef4444' : '#10b981' }}>
                        {reconstructedStudents.length} / 30 bản ghi
                      </span>
                    </div>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>MÃ SV</th>
                            <th>HỌ TÊN</th>
                            <th>ĐIỂM (GPA)</th>
                            <th>NGÀNH</th>
                            <th>NĂM HỌC</th>
                            <th>TÍN CHỈ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reconstructedStudents.map(s => (
                            <tr key={s.id}>
                              <td>{s.id}</td>
                              <td>{s.name}</td>
                              <td>{s.gpa.toFixed(2)}</td>
                              <td>{s.major}</td>
                              <td>{s.year}</td>
                              <td>{s.credits}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', opacity: 0.7 }}>
              <Database className="w-16 h-16 mb-4" style={{ color: 'var(--border-color)' }} />
              <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Nhấn "Chạy thuật toán" để xem kết quả</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
