import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Bot, CalendarDays, Check, ChevronRight, CircleDollarSign, CloudOff, HeartHandshake, Leaf, MapPin, Mic, Phone, Plus, ShieldAlert, Speaker, Sprout, ThumbsDown, ThumbsUp, Users, Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useApi } from '../hooks/useApi';
import { useConnectivity } from '../hooks/useConnectivity';
import { useFarmState } from '../hooks/useFarmState';
import { useVoice } from '../hooks/useVoice';
import { usePreferences } from '../contexts/PreferencesContext';
import './FarmerEssentials.css';
const CROP_KEYS = ['wheat', 'rice', 'maize', 'cotton', 'soybean'];
function ActionCard({
  action,
  status,
  onStatus,
  onAsk,
  onSpeak,
  t
}) {
  return <article className={`week-action week-action-${action.tone} ${status === 'done' ? 'week-action-done' : ''}`}>
      <div className="week-action-top">
        <span className="week-action-icon">{action.icon}</span>
        <span className="week-action-when">{t(action.when)}</span>
        <button className="icon-voice" onClick={() => onSpeak(action.text)} aria-label={t('listen')}><Speaker size={17} /></button>
      </div>
      <p>{action.text}</p>
      <div className="week-action-buttons">
        <button className={status === 'done' ? 'selected' : ''} onClick={() => onStatus('done')}><Check size={15} /> {t('done')}</button>
        <button className={status === 'remind' ? 'selected' : ''} onClick={() => onStatus('remind')}><Bell size={15} /> {t('remindMe')}</button>
        <button onClick={onAsk}><Bot size={15} /> {t('askMore')}</button>
      </div>
    </article>;
}
function Profitability({
  price,
  t
}) {
  const [area, setArea] = useState(1);
  const traditionalCost = Math.round(area * 6800);
  const recommendedCost = Math.round(area * 5100);
  const saved = traditionalCost - recommendedCost;
  const extraYield = Number((area * 0.18).toFixed(2));
  const mandiRate = Math.round((price?.price || 245) * 83 / 10) * 10;
  const extraIncome = Math.round(extraYield * mandiRate);
  return <section className="farmer-tool-card profitability-card">
      <div className="farmer-tool-title"><span><CircleDollarSign size={21} /> {t('profitability')}</span><b>₹{(saved + extraIncome).toLocaleString()}</b></div>
      <label className="area-control">{t('farmArea')} <input type="range" min="0.5" max="10" step="0.5" value={area} onChange={event => setArea(Number(event.target.value))} /><strong>{area}{t("ha")}</strong></label>
      <div className="cost-compare">
        <div><small>{t('recommendedCost')}</small><strong>₹{recommendedCost.toLocaleString()}</strong></div>
        <div><small>{t('traditionalCost')}</small><strong>₹{traditionalCost.toLocaleString()}</strong></div>
      </div>
      <div className="money-result">
        <span><small>{t('inputSaved')}</small><strong>₹{saved.toLocaleString()}</strong></span>
        <span><small>{t('extraYield')}</small><strong>+{extraYield}{t("t")}</strong></span>
        <span><small>{t('extraIncome')}</small><strong>₹{extraIncome.toLocaleString()}</strong></span>
      </div>
      <p>{t('mandiRate')}: ₹{mandiRate.toLocaleString()}{t("t")}</p>
    </section>;
}
function SeasonCalendar({
  crop,
  setCrop,
  t
}) {
  const [alertsOn, setAlertsOn] = useState(() => typeof Notification !== 'undefined' && Notification.permission === 'granted');
  const phases = [{
    key: 'sowingWindow',
    day: 0,
    state: 'done'
  }, {
    key: 'criticalIrrigation',
    day: 18,
    state: 'now'
  }, {
    key: 'fertilizerTiming',
    day: 34,
    state: 'next'
  }, {
    key: 'flowering',
    day: 58,
    state: 'next'
  }, {
    key: 'harvest',
    day: 92,
    state: 'next'
  }];
  return <section className="farmer-tool-card calendar-card">
      <div className="farmer-tool-title"><span><CalendarDays size={21} /> {t('seasonCalendar')}</span>
        <select value={crop} onChange={event => setCrop(event.target.value)}>{CROP_KEYS.map(key => <option key={key} value={key}>{t(key)}</option>)}</select>
      </div>
      <div className="season-line">
        {phases.map(phase => <div key={phase.key} className={`season-step ${phase.state}`}>
            <span>{phase.state === 'done' ? <Check size={13} /> : phase.day}</span>
            <div><strong>{t(phase.key)}</strong><small>{phase.state === 'now' ? t('dueSoon') : t('dayNumber', {
              number: phase.day
            })}</small></div>
          </div>)}
      </div>
      <button className="inline-action" onClick={async () => {
      if (!('Notification' in window)) return;
      const permission = await Notification.requestPermission();
      setAlertsOn(permission === 'granted');
      if (permission === 'granted') new Notification('AgriN', {
        body: t('criticalAlertsOn'),
        icon: '/favicon.svg'
      });
    }}><Bell size={15} /> {t(alertsOn ? 'criticalAlertsOn' : 'enableCriticalAlerts')}</button>
    </section>;
}
function ProgressTracker({
  progress,
  onCheckIn,
  t
}) {
  const items = [{
    label: 'organicMatter',
    value: progress.organicMatter,
    color: '#10b981'
  }, {
    label: 'waterHolding',
    value: progress.waterHolding,
    color: '#3b82f6'
  }, {
    label: 'chemicalSaved',
    value: progress.chemicalSaved,
    color: '#f59e0b'
  }];
  return <section className="farmer-tool-card progress-card">
      <div className="farmer-tool-title"><span><Sprout size={21} /> {t('regenerativeProgress')}</span><small>{t('thisSeason')}</small></div>
      {items.map(item => <div className="simple-progress" key={item.label}><div><span>{t(item.label)}</span><b>+{item.value}%</b></div><i><span style={{
          width: `${Math.min(100, 38 + item.value)}%`,
          background: item.color
        }} /></i></div>)}
      <p><Leaf size={15} /> {t('progressEncouragement')}</p>
      <button className="inline-action" onClick={onCheckIn}><Plus size={15} /> {t('logObservation')}</button>
    </section>;
}
function WholeFarm({
  state,
  update,
  t
}) {
  const [familyName, setFamilyName] = useState('');
  const toggleCrop = crop => update(current => ({
    ...current,
    crops: current.crops.includes(crop) ? current.crops.filter(item => item !== crop) : [...current.crops, crop]
  }));
  const addFamily = () => {
    if (!familyName.trim()) return;
    update(current => ({
      ...current,
      family: [...current.family, {
        name: familyName.trim(),
        role: 'family'
      }]
    }));
    setFamilyName('');
  };
  return <section className="farmer-tool-card whole-farm-card">
      <div className="farmer-tool-title"><span><Leaf size={21} /> {t('wholeFarm')}</span><small>{t('sharedProfile')}</small></div>
      <h4>{t('myCrops')}</h4>
      <div className="choice-chips">{CROP_KEYS.map(crop => <button key={crop} className={state.crops.includes(crop) ? 'active' : ''} onClick={() => toggleCrop(crop)}>{state.crops.includes(crop) && <Check size={13} />}{t(crop)}</button>)}</div>
      <div className="system-loop"><span>🌾 {t('cropResidue')}</span><ChevronRight size={15} /><span>🐄 {t('animalFodder')}</span><ChevronRight size={15} /><span>🌱 {t('manureForSoil')}</span></div>
      <h4><Users size={16} /> {t('familyAccess')} ({state.family.length})</h4>
      <div className="family-add"><input value={familyName} onChange={event => setFamilyName(event.target.value)} placeholder={t('familyName')} /><button onClick={addFamily}><Plus size={16} /> {t('add')}</button></div>
    </section>;
}
function EmergencySupport({
  location,
  rain,
  t
}) {
  const heavyRisk = rain >= 70;
  return <section className="farmer-tool-card emergency-card">
      <div className="farmer-tool-title"><span><ShieldAlert size={21} /> {t('emergencySupport')}</span><b className={heavyRisk ? 'risk' : 'safe'}>{heavyRisk ? t('highRisk') : t('noImmediateRisk')}</b></div>
      <div className="emergency-weather"><CloudOff size={22} /><div><strong>{t(heavyRisk ? 'heavyRainPlan' : 'contingencyReady')}</strong><small>{t('next48Hours')}</small></div></div>
      <p style={{
      marginTop: '.6rem',
      color: 'var(--text-muted)',
      fontSize: '.72rem',
      lineHeight: 1.45
    }}>{t(heavyRisk ? 'alertRainAction' : 'healthyRecommendation')}</p>
      <div className="emergency-links">
        <a href="tel:18001801551"><Phone size={17} /><span><strong>{t('kisanHelpline')}</strong><small>{t("18001801551")}</small></span></a>
        <a href={`https://www.google.com/maps/search/KVK+agro+clinic+near+${encodeURIComponent(location)}`} target="_blank" rel="noreferrer"><MapPin size={17} /><span><strong>{t('nearestClinic')}</strong><small>{location}</small></span></a>
        <a href={`https://www.google.com/maps/search/agriculture+input+dealer+near+${encodeURIComponent(location)}`} target="_blank" rel="noreferrer"><MapPin size={17} /><span><strong>{t('nearestDealer')}</strong><small>{location}</small></span></a>
        <a href="https://pmfby.gov.in/" target="_blank" rel="noreferrer"><HeartHandshake size={17} /><span><strong>{t('insuranceHelp')}</strong><small>{t('checkClaim')}</small></span></a>
      </div>
    </section>;
}
export default function FarmerEssentials({
  weather
}) {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const {
    preferences
  } = usePreferences();
  const {
    data: prices
  } = useApi(() => api.prices(), [preferences.location.latitude, preferences.location.longitude]);
  const {
    online,
    lowData,
    setLowData,
    constrained
  } = useConnectivity();
  const {
    state,
    update,
    syncStatus
  } = useFarmState();
  const {
    listen,
    speak,
    listening,
    speaking,
    canListen
  } = useVoice();
  const [crop, setCrop] = useState(state.crops[0] || 'wheat');
  const rain = weather?.rain_chance ?? 30;
  const humidity = weather?.humidity ?? 65;
  const bestPrice = prices?.commodities?.[0];
  const actions = useMemo(() => [{
    id: 'irrigate',
    icon: '💧',
    tone: 'blue',
    when: rain > 45 ? 'thisWeek' : 'today',
    text: t(rain > 45 ? 'irrigationHold' : 'irrigationIncrease')
  }, {
    id: 'disease',
    icon: '🍃',
    tone: humidity > 74 ? 'red' : 'green',
    when: 'today',
    text: t(humidity > 74 ? 'recommendWheatRust' : 'healthyRecommendation')
  }, {
    id: 'compost',
    icon: '🌱',
    tone: 'green',
    when: 'thisWeek',
    text: t('coverCropAdvice')
  }, {
    id: 'market',
    icon: '₹',
    tone: 'amber',
    when: 'thisWeek',
    text: t(bestPrice?.desc_key || 'priceDescHold', bestPrice?.values || {
      change: 0
    })
  }], [bestPrice, humidity, rain, t]);
  const setActionStatus = (id, status) => update(current => ({
    ...current,
    actions: {
      ...current.actions,
      [id]: status
    },
    reminders: status === 'remind' ? [...new Set([...current.reminders, id])] : current.reminders.filter(item => item !== id)
  }));
  const askMore = action => {
    sessionStorage.setItem('agrin_voice_prompt', action.text);
    navigate('/agrobot');
  };
  const speakBriefing = () => speak(`${t('thisWeek')}. ${actions.filter(item => state.actions[item.id] !== 'done').map(item => item.text).join('. ')}`);
  return <div className="farmer-essentials">
      <section className="voice-briefing">
        <div className="voice-briefing-copy">
          <div className="connection-row">
            <span className={online ? 'online' : 'offline'}>{online ? <Wifi size={14} /> : <WifiOff size={14} />}{t(online ? 'online' : 'offline')}</span>
            <button onClick={() => setLowData(!lowData)} className={lowData ? 'active' : ''}>{lowData ? <Check size={13} /> : null}{t('lowDataMode')}</button>
            <span>{syncStatus === 'pending' ? t('syncPending') : t('saved')}</span>
          </div>
          <p>{t('simpleFarmAssistant')}</p>
          <h2>{t('whatToDoThisWeek')}</h2>
          <small><MapPin size={14} /> {preferences.location.label} · {t(crop)} · {constrained ? t('offlineReady') : t('liveData')}</small>
        </div>
        <div className="voice-main-actions">
          <button className={`big-listen ${speaking ? 'speaking' : ''}`} onClick={speakBriefing}><Speaker size={26} /><span>{t('hearMyPlan')}</span></button>
          <button className={`big-ask ${listening ? 'listening' : ''}`} onClick={() => listen(transcript => {
          sessionStorage.setItem('agrin_voice_prompt', transcript);
          navigate('/agrobot');
        })} disabled={!canListen}><Mic size={26} /><span>{listening ? t('listening') : t('askByVoice')}</span></button>
        </div>
      </section>

      <div className="weekly-actions">
        {actions.map(action => <ActionCard key={action.id} action={action} status={state.actions[action.id]} onStatus={status => setActionStatus(action.id, status)} onAsk={() => askMore(action)} onSpeak={speak} t={t} />)}
      </div>

      <div className="advice-feedback">
        <span>{t('wasUseful')}</span>
        <button className={state.feedback.weekly === true ? 'active' : ''} onClick={() => update(current => ({
        ...current,
        feedback: {
          ...current.feedback,
          weekly: true
        }
      }))}><ThumbsUp size={16} /> {t('yes')}</button>
        <button className={state.feedback.weekly === false ? 'active' : ''} onClick={() => update(current => ({
        ...current,
        feedback: {
          ...current.feedback,
          weekly: false
        }
      }))}><ThumbsDown size={16} /> {t('no')}</button>
      </div>

      <div className="farmer-tools-grid">
        <Profitability price={bestPrice} t={t} />
        <SeasonCalendar crop={crop} setCrop={setCrop} t={t} />
        <ProgressTracker progress={state.progress} onCheckIn={() => update(current => ({
        ...current,
        progress: {
          organicMatter: Math.min(60, current.progress.organicMatter + 1),
          waterHolding: Math.min(60, current.progress.waterHolding + 1),
          chemicalSaved: current.progress.chemicalSaved
        }
      }))} t={t} />
        <EmergencySupport location={preferences.location.label} rain={rain} t={t} />
        <WholeFarm state={state} update={update} t={t} />
        <section className="farmer-tool-card peer-card">
          <div className="farmer-tool-title"><span><Users size={21} /> {t('nearbyFarmers')}</span><b>{t("87")}</b></div>
          <p>{t('peerResult', {
            district: preferences.location.label
          })}</p>
          <div className="peer-outcome"><span>{t("24")}{t('farmers')}</span><span>{t("31")}{t('chemicalUse')}</span><span>{t("14")}{t('yieldPredictor')}</span></div>
          <button className="inline-action" onClick={() => navigate('/knowledge')}>{t('seeLocalStories')} <ChevronRight size={15} /></button>
        </section>
      </div>
    </div>;
}