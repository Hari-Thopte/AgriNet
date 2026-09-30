import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle2, Clock, RefreshCw, Trash2, Camera, FileText, AlertCircle, Wifi, WifiOff, CloudUpload, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { useConnectivity } from '../hooks/useConnectivity';
import { offlineSync } from '../utils/offlineSync';
export default function SyncManager() {
  const {
    t
  } = useTranslation();
  const {
    online
  } = useConnectivity();
  const [queue, setQueue] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedType, setSelectedType] = useState('Scouting Report');
  const [noteText, setNoteText] = useState('');
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');
  const refreshQueue = () => {
    setQueue(offlineSync.getQueue());
  };
  useEffect(() => {
    refreshQueue();
    const interval = setInterval(refreshQueue, 2000);
    return () => clearInterval(interval);
  }, []);
  const handleAddSampleUpload = e => {
    e.preventDefault();
    const payload = {
      type: selectedType,
      title: `${selectedType} - ${new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })}`,
      notes: noteText || 'Field photo & scouting observations saved offline.',
      fileName: selectedType === 'Field Photo' ? 'field_leaf_spot_042.jpg' : 'scouting_block_b.json',
      sizeKB: Math.floor(Math.random() * 800) + 200
    };
    offlineSync.queueAction('data_upload', payload);
    setNoteText('');
    refreshQueue();
  };
  const handleSyncAll = async () => {
    if (!online || queue.length === 0) return;
    setSyncing(true);
    setSyncSuccessMsg('');

    // Simulate progress per item
    for (const item of queue) {
      setUploadProgress(prev => ({
        ...prev,
        [item.id]: 20
      }));
      await new Promise(r => setTimeout(r, 200));
      setUploadProgress(prev => ({
        ...prev,
        [item.id]: 60
      }));
      await new Promise(r => setTimeout(r, 250));
      setUploadProgress(prev => ({
        ...prev,
        [item.id]: 100
      }));
      await new Promise(r => setTimeout(r, 150));
    }
    const count = await offlineSync.flushQueue();
    setSyncSuccessMsg(`Successfully uploaded & synced ${count} data file${count > 1 ? 's' : ''} to AgriNet servers.`);
    setUploadProgress({});
    setSyncing(false);
    refreshQueue();
  };
  const handleClear = () => {
    offlineSync.clearQueue();
    refreshQueue();
  };
  return <div className="animate-fade-in" style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  }}>
      <header>
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.4rem'
      }}>
          <CloudUpload size={32} color="var(--primary)" />
          <h1 style={{
          fontSize: '2.4rem',
          margin: 0
        }}>{t("sync_manager")}</h1>
        </div>
        <p className="text-muted">{t("offline_data_queue_manager_aut")}</p>
      </header>

      {/* Connectivity Status Banner */}
      <div className="glass-card" style={{
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderLeft: `4px solid ${online ? 'var(--primary)' : 'var(--danger)'}`,
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
          {online ? <Wifi size={26} color="var(--primary)" /> : <WifiOff size={26} color="var(--danger)" />}
          <div>
            <strong style={{
            fontSize: '1.05rem',
            display: 'block'
          }}>
              {online ? '🟢 Network Online — Auto-Sync Enabled' : '🔴 Network Offline — Action Queue Active'}
            </strong>
            <span className="text-muted" style={{
            fontSize: '0.85rem'
          }}>
              {online ? 'Connected to 4G/Wi-Fi. Queued media and field data upload automatically.' : 'No internet connection. New photos and reports are saved locally until back online.'}
            </span>
          </div>
        </div>

        <div style={{
        display: 'flex',
        gap: '0.75rem'
      }}>
          <button onClick={handleSyncAll} disabled={!online || syncing || queue.length === 0} className="btn-primary" style={{
          fontSize: '0.85rem',
          padding: '0.6rem 1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
            <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Uploading Data...' : 'Sync Queue Now'}
          </button>
          {queue.length > 0 && <button onClick={handleClear} className="btn-ghost text-danger" style={{
          fontSize: '0.85rem',
          padding: '0.6rem 1rem'
        }}>
              <Trash2 size={15} />{t("clear_queue")}</button>}
        </div>
      </div>

      {syncSuccessMsg && <div className="glass-card animate-fade-in" style={{
      padding: '1rem 1.25rem',
      background: 'rgba(16,185,129,0.12)',
      color: 'var(--primary)',
      borderLeft: '4px solid var(--primary)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      fontWeight: 600
    }}>
          <CheckCircle2 size={18} /> {syncSuccessMsg}
        </div>}

      {/* Grid Layout: Queue List + Add Offline Upload Form */}
      <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '1.5rem'
    }}>
        
        {/* Left Column: Queued Uploads List */}
        <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
          <h3 style={{
          fontSize: '1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
            <Upload size={18} color="var(--secondary)" />{t("queued_upload_items")}{queue.length})
          </h3>

          {queue.length === 0 ? <div className="glass-card" style={{
          padding: '3rem 1.5rem',
          textAlign: 'center'
        }}>
              <CheckCircle2 size={40} color="var(--primary)" style={{
            margin: '0 auto 0.75rem auto'
          }} />
              <h4 style={{
            fontSize: '1.1rem',
            fontWeight: 700
          }}>{t("queue_is_clean")}</h4>
              <p className="text-muted" style={{
            fontSize: '0.85rem',
            marginTop: '0.3rem'
          }}>{t("all_field_photos_pest_diagnost")}</p>
            </div> : queue.map((item, index) => {
          const progress = uploadProgress[item.id] || 0;
          const isPhoto = item.payload?.type === 'Field Photo' || item.payload?.fileName?.endsWith('.jpg');
          return <div key={item.id || index} className="glass-card" style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
                  <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
                    <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                      {isPhoto ? <ImageIcon size={22} color="var(--primary)" /> : <FileText size={22} color="var(--secondary)" />}
                      <div>
                        <strong style={{
                    fontSize: '0.95rem',
                    display: 'block'
                  }}>
                          {item.payload?.title || item.payload?.type || 'Field Observation Data'}
                        </strong>
                        <span className="text-muted" style={{
                    fontSize: '0.78rem'
                  }}>
                          {item.payload?.fileName || 'report.json'} · {item.payload?.sizeKB || 350}{t("kb")}{new Date(item.timestamp || item.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <span style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: progress === 100 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                color: progress === 100 ? 'var(--primary)' : 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                      {progress === 100 ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                      {progress === 100 ? 'Synced' : progress > 0 ? `Uploading ${progress}%` : 'Pending'}
                    </span>
                  </div>

                  {item.payload?.notes && <p style={{
              fontSize: '0.82rem',
              color: 'var(--text-main)',
              background: 'var(--soft-bg)',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              margin: 0
            }}>
                      "{item.payload.notes}"
                    </p>}

                  {/* Progress Bar */}
                  {progress > 0 && progress < 100 && <div style={{
              width: '100%',
              height: '6px',
              background: 'var(--glass-border)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
                      <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'var(--primary)',
                transition: 'width 0.2s ease'
              }} />
                    </div>}
                </div>;
        })}
        </div>

        {/* Right Column: Simulate Queueing New Offline Data */}
        <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
          <h3 style={{
          fontSize: '1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
            <Camera size={18} color="var(--primary)" />{t("queue_new_offline_data")}</h3>

          <form onSubmit={handleAddSampleUpload} className="glass-card" style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem'
        }}>
            <div>
              <label style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'block',
              marginBottom: '0.4rem'
            }}>{t("data_upload_category")}</label>
              <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{
              width: '100%',
              padding: '0.6rem 0.8rem',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              outline: 'none'
            }}>
                <option value="Field Photo">{t("field_photo_crop_leaf_inspecti")}</option>
                <option value="Scouting Report">{t("field_scouting_report_block_in")}</option>
                <option value="Soil Diagnostic">{t("soil_moisture_ph_sensor_dump")}</option>
                <option value="Equipment Request">{t("machinery_service_request")}</option>
              </select>
            </div>

            <div>
              <label style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'block',
              marginBottom: '0.4rem'
            }}>{t("field_notes_pest_observations")}</label>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3} placeholder="e.g. Yellowing observed on lower leaves of Block C wheat..." style={{
              width: '100%',
              padding: '0.6rem 0.8rem',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              outline: 'none',
              resize: 'none',
              fontSize: '0.88rem'
            }} />
            </div>

            <button type="submit" className="btn-primary" style={{
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: 700
          }}>
              <Upload size={16} />{t("save_to_offline_queue")}</button>

            <div style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            background: 'rgba(59,130,246,0.08)',
            padding: '0.75rem',
            borderRadius: '8px',
            borderLeft: '3px solid var(--secondary)'
          }}>
              <strong>{t("offline_queue_behavior")}</strong>{t("items_saved_while_offline_will")}</div>
          </form>
        </div>

      </div>
    </div>;
}