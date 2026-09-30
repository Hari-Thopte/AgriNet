import { useRef, useState } from 'react';
import { Globe, ThumbsUp, MessageSquare, Bookmark, BookmarkCheck, Search, Plus, X, RefreshCw, Image, Mic, Square, MapPin, Users } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../api';
import { LoadingCard, ErrorState } from '../components/LoadingCard';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../contexts/PreferencesContext';
import { useLocalize } from '../hooks/useLocalize';

const BRICS_COUNTRIES = ['All', 'Brazil', 'Russia', 'India', 'China', 'South Africa'];
const CROP_FILTERS    = ['All', 'Wheat', 'Rice', 'Soybean', 'Maize', 'Cotton', 'Sunflower'];

function PostCard({ post, onVote, onSave, t, locale, localizeString }) {
  return (
    <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
            {post.avatar}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{post.author_key ? t(post.author_key) : post.author}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {post.flag} {t(post.country.toLowerCase().replaceAll(' ', ''))} · {new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-post.daysAgo, 'day')} · 🌾 {t(post.crop.toLowerCase())}
            </div>
          </div>
        </div>
        <button onClick={() => onSave(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: post.saved ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.2s' }}>
          {post.saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
        </button>
      </div>

      <div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>{t(`kpost_title_${post.id}`, post.title)}</h3>
        <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{t(`kpost_content_${post.id}`, post.content)}</p>
      </div>

      {post.photo && <img src={post.photo} alt={t('cropPhoto')} style={{width:'100%',maxHeight:280,objectFit:'cover',borderRadius:12}} />}
      {post.voice && <audio controls src={post.voice} style={{width:'100%',height:38}} />}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {post.tags.map(t => <span key={t} className="tag">#{t}</span>)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
        <button onClick={() => onVote(post.id)} className="btn-ghost" style={{ gap: '0.4rem', padding: '0.4rem 0.75rem' }}>
          <ThumbsUp size={16} /> <span style={{ fontWeight: 600 }}>{localizeString ? localizeString(post.votes) : post.votes}</span>
        </button>
        <button className="btn-ghost" style={{ gap: '0.4rem', padding: '0.4rem 0.75rem' }}>
          <MessageSquare size={16} /> {localizeString ? localizeString(post.comments) : post.comments} {t('replies')}
        </button>
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          🌍 {t('originalLanguage')}
        </span>
      </div>
    </div>
  );
}

export default function KnowledgeExchange() {
  const { t, i18n } = useTranslation();
  const { preferences } = usePreferences();
  const { localizeString } = useLocalize();
  const { data: posts, loading, error, refetch } = useApi(() => api.knowledge());
  const [localPosts, setLocalPosts]    = useState(null);
  const [country, setCountry]          = useState('All');
  const [crop, setCrop]                = useState('All');
  const [search, setSearch]            = useState('');
  const [showForm, setShowForm]        = useState(false);
  const [newPost, setNewPost]          = useState({ title: '', content: '', tags: '' });
  const [photo, setPhoto] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null);

  // Use local state once loaded (so votes/saves work client-side)
  const allPosts = localPosts ?? posts ?? [];

  const setPosts = (fn) => setLocalPosts(prev => fn(prev ?? posts ?? []));

  // Sync initial data
  if (posts && !localPosts) setLocalPosts(posts);

  const filtered = allPosts.filter(p =>
    (country === 'All' || p.country === country) &&
    (crop    === 'All' || p.crop    === crop) &&
    (search  === ''   || p.title.toLowerCase().includes(search.toLowerCase()) ||
                         p.content.toLowerCase().includes(search.toLowerCase()))
  );
  const countryStats = [['🇧🇷', 'brazil', 'Brazil'], ['🇷🇺', 'russia', 'Russia'], ['🇮🇳', 'india', 'India'], ['🇨🇳', 'china', 'China'], ['🇿🇦', 'southafrica', 'South Africa']];

  const handleVote = (id) => setPosts(ps => ps.map(p => p.id === id ? { ...p, votes: p.votes + 1 } : p));
  const handleSave = (id) => setPosts(ps => ps.map(p => p.id === id ? { ...p, saved: !p.saved } : p));

  const handleSubmit = () => {
    if (!newPost.title || !newPost.content) return;
    setLocalPosts(ps => [{
      id: Date.now(), country: 'India', flag: '🇮🇳', author_key: 'you', avatar: 'YO', crop: 'Wheat',
      votes: 0, comments: 0, saved: false, daysAgo: 0,
      title: newPost.title, content: newPost.content,
      tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),
      photo, voice: voiceUrl,
    }, ...(ps ?? [])]);
    setNewPost({ title: '', content: '', tags: '' });
    setPhoto('');
    setVoiceUrl('');
    setShowForm(false);
  };

  const toggleRecording = async () => {
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        setVoiceUrl(URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })));
        stream.getTracks().forEach((track) => track.stop());
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setRecording(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>
            <Globe size={32} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--secondary)' }} />
            {t('knowledgeExchange')}
          </h1>
          <p className="text-muted">{t('knowledgeSubtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-ghost" onClick={() => { setLocalPosts(null); refetch(); }}>
            <RefreshCw size={15} /> {t('refresh')}
          </button>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} /> {t('shareKnowledge')}
          </button>
        </div>
      </header>

      <section className="glass-panel" style={{padding:'1.15rem',background:'linear-gradient(135deg,rgba(16,185,129,.1),rgba(59,130,246,.08))'}}>
        <div style={{display:'flex',alignItems:'center',gap:'.7rem',marginBottom:'.8rem'}}><Users size={23} color="var(--primary)"/><div><h2 style={{fontSize:'1.05rem'}}>{t('localPeerProof', 'Local Peer Proof')}</h2><p className="text-muted" style={{fontSize:'.75rem'}}><MapPin size={12} style={{verticalAlign:'middle'}}/> {preferences.location.label} · {t('similarFarms', 'Similar farms')}</p></div></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'.6rem'}}>
          {[['F-24','wheat','−28%','chemicalUse'],['F-09','rice','+16%','yieldPredictor'],['F-31','maize','−22%','waterAvailability']].map(([farmer,cropName,value,resultKey]) => <div key={farmer} style={{padding:'.75rem',border:'1px solid rgba(16,185,129,.15)',borderRadius:10,background:'rgba(255,255,255,.72)'}}><strong style={{fontSize:'.78rem'}}>{localizeString(farmer)} · {t(cropName)}</strong><small style={{display:'block',marginTop:'.25rem',color:'var(--text-muted)'}}>{t('result')}: <b style={{color:'#047857'}}>{localizeString(value)}</b> {t(resultKey)}</small></div>)}
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {countryStats.map(([flag, key, countryName]) => (
          <div key={key} className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{localizeString(allPosts.filter((post) => post.country === countryName).length)}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>{flag} {t(key)} · {t('posts')}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-glass" placeholder={t('searchTechniques')} value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.2rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {BRICS_COUNTRIES.map(c => (
            <button key={c} onClick={() => setCountry(c)} style={{ padding: '0.4rem 0.9rem', borderRadius: '20px', border: `1px solid ${country === c ? 'var(--primary)' : 'var(--glass-border)'}`, background: country === c ? 'rgba(16,185,129,0.15)' : 'transparent', color: country === c ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}>
              {c === 'All' ? t('all') : t(c.toLowerCase().replaceAll(' ', ''))}
            </button>
          ))}
        </div>
        <select className="input-glass" style={{ width: 'auto' }} value={crop} onChange={e => setCrop(e.target.value)}>
          {CROP_FILTERS.map(c => <option key={c} value={c}>{c === 'All' ? t('all') : t(c.toLowerCase())}</option>)}
        </select>
      </div>

      {/* New Post Form */}
      {showForm && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{t('yourFarmingTechnique')}</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
          </div>
          <input className="input-glass" placeholder={t('title')} value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} />
          <textarea className="input-glass" rows={4} placeholder={t('content')} value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} style={{ resize: 'vertical' }} />
          <input className="input-glass" placeholder={t('tags')} value={newPost.tags} onChange={e => setNewPost(p => ({ ...p, tags: e.target.value }))} />
          <div style={{display:'flex',gap:'.65rem',flexWrap:'wrap',alignItems:'center'}}>
            <label className="btn-ghost" style={{cursor:'pointer'}}><Image size={16}/> {t('cropPhoto')}<input type="file" accept="image/*" capture="environment" hidden onChange={(event) => {const file=event.target.files?.[0];if(file)setPhoto(URL.createObjectURL(file))}}/></label>
            <button className="btn-ghost" onClick={toggleRecording}>{recording ? <Square size={15}/> : <Mic size={16}/>} {t(recording ? 'stopRecording' : 'recordVoice')}</button>
            {voiceUrl && <span style={{color:'var(--primary)',fontSize:'.75rem'}}>✓ {t('voiceNoteReady')}</span>}
          </div>
          {photo && <img src={photo} alt={t('cropPhoto')} style={{width:150,height:100,objectFit:'cover',borderRadius:10}}/>}
          {voiceUrl && <audio controls src={voiceUrl} style={{maxWidth:320}}/>}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>{t('cancel')}</button>
            <button className="btn-primary" onClick={handleSubmit}><Globe size={16} /> {t('publishToBrics')}</button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading && !localPosts ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3].map(i => <LoadingCard key={i} rows={5} height="200px" />)}
        </div>
      ) : error && !localPosts ? (
        <ErrorState message={error} onRetry={() => { setLocalPosts(null); refetch(); }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filtered.length === 0
            ? <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>{t('noPosts')}</div>
            : filtered.sort((a, b) => b.votes - a.votes).map(p => (
                <PostCard key={p.id} post={p} onVote={handleVote} onSave={handleSave} t={t} locale={i18n.resolvedLanguage} localizeString={localizeString} />
              ))
          }
        </div>
      )}
    </div>
  );
}
