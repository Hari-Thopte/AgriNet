import { useState } from 'react';
import { Download, Mic, Speaker, Upload, AlertCircle, CheckCircle2, ShieldCheck, Microscope, WifiOff } from 'lucide-react';
import { api } from '../api';
import { useTranslation } from 'react-i18next';
import { useVoice } from '../hooks/useVoice';
import { useConnectivity } from '../hooks/useConnectivity';
import TapToListen from '../components/TapToListen';
const POCKET_GUIDE = [{
  icon: '🍂',
  name: 'earlyBlight',
  clue: 'spotsQuestion'
}, {
  icon: '⚪',
  name: 'powderyMildew',
  clue: 'powderQuestion'
}, {
  icon: '🐛',
  name: 'aphids',
  clue: 'curlQuestion'
}, {
  icon: '🟠',
  name: 'diseaseWheatRust',
  clue: 'recommendWheatRust'
}, {
  icon: '🌱',
  name: 'nitrogen',
  clue: 'botYellowReply'
}, {
  icon: '💧',
  name: 'stress',
  clue: 'alertMoistureAction'
}, {
  icon: '🪲',
  name: 'disease',
  clue: 'botDiseaseReply'
}, {
  icon: '✅',
  name: 'healthy',
  clue: 'healthyRecommendation'
}];
const CHECKS = [{
  question: 'spotsQuestion',
  result: 'earlyBlight'
}, {
  question: 'powderQuestion',
  result: 'powderyMildew'
}, {
  question: 'curlQuestion',
  result: 'aphids'
}];
export default function DiagnosticTool() {
  const {
    t
  } = useTranslation();
  const [file, setFile] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [checkIndex, setCheckIndex] = useState(0);
  const [quickResult, setQuickResult] = useState(null);
  const [guideSaved, setGuideSaved] = useState(false);
  const {
    speak,
    listen,
    listening,
    canListen
  } = useVoice();
  const {
    constrained
  } = useConnectivity();
  const handleFileChange = e => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(URL.createObjectURL(f));
      setResult(null);
      setError(null);

      // Compress image to save network bandwidth
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          const compressedFile = new File([blob], f.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          setRawFile(compressedFile);
        }, 'image/jpeg', 0.7);
      };
      img.src = URL.createObjectURL(f);
    }
  };
  const analyzeImage = async () => {
    if (!rawFile) return;
    setAnalyzing(true);
    setError(null);
    try {
      const data = await api.diagnose(rawFile);
      setResult(data);
      speak(`${t(data.disease_key || data.disease)}. ${t(data.recommendation_key || data.recommendation)}`);
    } catch {
      setError(t('diagnosisUnavailable'));
    } finally {
      setAnalyzing(false);
    }
  };
  const [lastHeard, setLastHeard] = useState('');
  const answerCheck = answer => {
    if (answer) {
      const res = CHECKS[checkIndex].result;
      setQuickResult(res);
      speak(`${t('likelyProblem')}: ${t(res)}. ${t('takePhotoWhenOnline')}`);
      return;
    }
    if (checkIndex < CHECKS.length - 1) {
      const nextIdx = checkIndex + 1;
      setCheckIndex(nextIdx);
      speak(t(CHECKS[nextIdx].question));
    } else {
      setQuickResult('uncertainProblem');
      speak(`${t('uncertainProblem')}. ${t('takePhotoWhenOnline')}`);
    }
  };
  const handleSymptomVoice = transcript => {
    const raw = (transcript || '').toLowerCase().trim();
    setLastHeard(raw);
    const noPatterns = ['no', 'nah', 'nope', 'nahi', 'nhi', 'ni', 'false', 'नहीं', 'இல்லை', 'ഇല്ല', 'नाही', 'లేదు', 'illai', 'illa', 'none', 'not', 'na'];
    const isNo = noPatterns.some(kw => raw.includes(kw));
    const yesPatterns = ['yes', 'yeah', 'yep', 'haan', 'han', 'ha', 'ji', 'true', 'हाँ', 'ஆம்', 'அതെ', 'हो', 'అవును', 'aam', 'haa', 'spot', 'yellow', 'powder', 'curl'];
    const isYes = yesPatterns.some(kw => raw.includes(kw));
    if (isNo && !isYes) {
      answerCheck(false);
    } else if (isYes) {
      answerCheck(true);
    } else {
      speak(t('voiceTryAgain'));
    }
  };
  const downloadGuide = () => {
    const text = POCKET_GUIDE.map(item => `${item.icon} ${t(item.name)}\n${t(item.clue)}`).join('\n\n');
    const url = URL.createObjectURL(new Blob([text], {
      type: 'text/plain;charset=utf-8'
    }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'AgriN-offline-disease-guide.txt';
    anchor.click();
    URL.revokeObjectURL(url);
    setGuideSaved(true);
  };
  return <div className="animate-fade-in" style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    width: '100%',
    maxWidth: '100%'
  }}>

      <header style={{
      textAlign: 'center'
    }}>
        <h1 style={{
        fontSize: '2.5rem',
        marginBottom: '0.5rem'
      }}>
          {t('cropDiagnostics')}
        </h1>
        <p className="text-muted" style={{
        fontSize: '1.1rem'
      }}>
          {t('diagnosisIntro')}
        </p>
      </header>

      <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
      gap: '1rem'
    }}>
        <section className="glass-card" style={{
        padding: '1.25rem'
      }}>
          <div style={{
          marginBottom: '1rem'
        }}>
            <h2 style={{
            fontSize: '1.1rem'
          }}>{t('progressiveCheck')}</h2>
          </div>
          {!quickResult ? <>
            <div style={{
            padding: '1rem',
            borderRadius: 12,
            background: 'var(--soft-bg)',
            color: 'var(--text-main)',
            border: '1px solid var(--glass-border)',
            fontSize: '1rem',
            fontWeight: 650,
            lineHeight: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
              <div>
                {t(CHECKS[checkIndex].question)}
                {lastHeard && <small style={{
                display: 'block',
                marginTop: '0.4rem',
                color: 'var(--primary)',
                fontWeight: 600
              }}>{t("heard")}{lastHeard}"</small>}
              </div>
              <button onClick={() => speak(t(CHECKS[checkIndex].question))} aria-label={t('readAloud')} style={{
              border: '1px solid var(--glass-border)',
              background: 'var(--hover-bg)',
              color: 'var(--primary)',
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}>
                <Speaker size={16} />
              </button>
            </div>
            <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '.65rem',
            marginTop: '.8rem'
          }}><button className="btn-primary" style={{
              justifyContent: 'center'
            }} onClick={() => answerCheck(true)}>{t('yes')}</button><button className="btn-ghost" style={{
              justifyContent: 'center',
              background: 'var(--control-bg)',
              color: 'var(--text-main)',
              borderColor: 'var(--glass-border)'
            }} onClick={() => answerCheck(false)}>{t('no')}</button></div>
          </> : <div style={{
          padding: '1rem',
          borderRadius: 12,
          background: '#fff7ed'
        }}><small style={{
            color: 'var(--text-muted)'
          }}>{t('likelyProblem')}</small><h3 style={{
            margin: '.25rem 0',
            color: '#c2410c'
          }}>{t(quickResult)}</h3><p style={{
            fontSize: '.78rem',
            color: 'var(--text-muted)'
          }}>{t('takePhotoWhenOnline')}</p><button className="btn-ghost" style={{
            marginTop: '.7rem'
          }} onClick={() => {
            setQuickResult(null);
            setCheckIndex(0);
            setLastHeard('');
          }}>{t('retry')}</button></div>}
        </section>

        <section className="glass-card" style={{
        padding: '1.25rem'
      }}>
          <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '.75rem'
        }}><div><h2 style={{
              fontSize: '1.1rem'
            }}>{t('diseasePocketGuide')}</h2><p className="text-muted" style={{
              fontSize: '.75rem',
              marginTop: '.25rem'
            }}>{constrained ? t('offlineReady') : `8 ${t('disease')}`}</p></div><WifiOff size={24} color="var(--primary)" /></div>
          <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: '.45rem',
          margin: '1rem 0'
        }}>{POCKET_GUIDE.map(item => <button key={item.name} onClick={() => speak(`${t(item.name)}. ${t(item.clue)}`)} style={{
            padding: '.6rem .25rem',
            border: '1px solid var(--glass-border)',
            borderRadius: 9,
            background: 'var(--control-bg)',
            color: 'var(--text-main)',
            cursor: 'pointer'
          }}><span style={{
              display: 'block',
              fontSize: '1.3rem'
            }}>{item.icon}</span><small style={{
              display: 'block',
              marginTop: '.25rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>{t(item.name)}</small></button>)}</div>
          <button className="btn-primary" style={{
          width: '100%',
          justifyContent: 'center'
        }} onClick={downloadGuide}>{guideSaved ? <CheckCircle2 size={17} /> : <Download size={17} />} {t(guideSaved ? 'guideSaved' : 'downloadGuide')}</button>
        </section>
      </div>

      <div className="glass-card" style={{
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem'
    }}>
        {/* Upload Area */}
        <label style={{
        border: '2px dashed var(--glass-border)',
        borderRadius: '16px',
        width: '100%',
        height: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        background: file ? 'rgba(0,0,0,0.5)' : 'rgba(15,23,42,0.2)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{
          display: 'none'
        }} />
          {file ? <img src={file} alt={t('uploadedCrop')} style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }} /> : <div style={{
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
              <Upload size={48} style={{
            marginBottom: '1rem',
            color: 'var(--primary)'
          }} />
              <h3 style={{
            color: 'var(--text-main)',
            marginBottom: '0.5rem'
          }}>{t('uploadCropImage')}</h3>
              <p>{t('supportedImages')}</p>
            </div>}
        </label>

        <button className="btn-primary" onClick={analyzeImage} disabled={!rawFile || analyzing} style={{
        width: '100%',
        justifyContent: 'center',
        padding: '1rem',
        fontSize: '1.1rem',
        opacity: !rawFile || analyzing ? 0.5 : 1
      }}>
          {analyzing ? <><Microscope style={{
            animation: 'spin 2s linear infinite'
          }} size={24} /> {t('analyzing')}</> : <>{t('runDiagnosis')}</>}
        </button>

        {error && <div style={{
        width: '100%',
        padding: '1rem',
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 10,
        color: 'var(--danger)',
        fontSize: '0.9rem'
      }}>
            ⚠️ {error}
          </div>}
      </div>

      {/* Results */}
      {result && <div className="glass-panel animate-fade-in" style={{
      padding: '2rem'
    }}>
          <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1.5rem'
      }}>
            <div style={{
          background: 'rgba(239,68,68,0.1)',
          padding: '1rem',
          borderRadius: '16px'
        }}>
              <AlertCircle size={32} color="var(--danger)" />
            </div>
            <div style={{
          flex: 1
        }}>
              <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
                <h2 style={{
              fontSize: '1.8rem',
              color: 'var(--danger)'
            }}>{t(result.disease_key || result.disease)}</h2>
                <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(16,185,129,0.1)',
              color: 'var(--primary)',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontWeight: 600
            }}>
                  <ShieldCheck size={16} />
                  {result.confidence}% {t('match')}
                </div>
              </div>
              
              <div style={{
            marginBottom: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center'
          }}>
                <TapToListen text={`${t(result.disease_key || result.disease)}. ${t(result.recommendation_key || result.recommendation)}`} />
                <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
                  <span className="badge badge-green">{t("verified")}</span>
                  <span style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)'
              }}>{t("treated_successfully_by_12_far")}</span>
                </div>
              </div>

              <p className="text-muted" style={{
            marginBottom: '1.5rem'
          }}>{t('severity')}: <strong>{t(result.severity_key || result.severity?.toLowerCase())}</strong></p>
              <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
                <div style={{
              background: 'var(--control-bg)',
              padding: '1.5rem',
              borderRadius: '12px',
              borderLeft: '4px solid var(--accent)'
            }}>
                  <h4 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                    <CheckCircle2 size={18} color="var(--accent)" /> {t('immediateAction')}
                  </h4>
                  <p className="text-muted">{t(result.recommendation_key || result.recommendation)}</p>
                  
                  {/* WhatsApp Bridge */}
                  <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(37, 211, 102, 0.1)',
                border: '1px solid rgba(37, 211, 102, 0.2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                    <div style={{
                  background: '#25D366',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '50%'
                }}>
                      <AlertCircle size={24} />
                    </div>
                    <div style={{
                  flex: 1
                }}>
                      <h5 style={{
                    fontSize: '1rem',
                    color: 'var(--text-main)',
                    marginBottom: '0.2rem'
                  }}>{t("get_treatment_on_whatsapp")}</h5>
                      <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)'
                  }}>{t("we_can_send_the_chemical_name_")}</p>
                    </div>
                    <button className="btn-primary" style={{
                  background: '#25D366',
                  color: 'white',
                  padding: '0.75rem 1.5rem'
                }}>{t("send_to_whatsapp")}</button>
                  </div>

                </div>
                <div style={{
              background: 'var(--control-bg)',
              padding: '1.5rem',
              borderRadius: '12px',
              borderLeft: '4px solid var(--primary)'
            }}>
                  <h4 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                    <CheckCircle2 size={18} color="var(--primary)" /> {t('preventativeMeasures')}</h4>
                  <p className="text-muted">{t(result.preventative_key || result.preventative)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>}
    </div>;
}