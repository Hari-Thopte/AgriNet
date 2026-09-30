import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { Package, ShoppingCart, Truck, CheckCircle, Star, MapPin, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../api';
import { LoadingGrid, ErrorState } from '../components/LoadingCard';
import { usePreferences } from '../contexts/PreferencesContext';
import { useLocalize } from '../hooks/useLocalize';
function StorageAdvisor({
  storage
}) {
  const {
    t
  } = useTranslation();
  const {
    localizeString
  } = useLocalize();
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  }}>
      <div className="glass-panel" style={{
      padding: '1.25rem',
      background: 'rgba(245,158,11,0.06)',
      borderLeft: '3px solid var(--accent)'
    }}>
        <strong style={{
        color: 'var(--accent)'
      }}>{t("reduce_postharvest_losses")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t("2040_of_crops_are_lost_after_h")}</p>
      </div>
      <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1rem'
    }}>
        {storage.map(s => <div key={s.id} className="glass-card" style={{
        padding: '1.5rem'
      }}>
            <div style={{
          display: 'flex',
          gap: '0.6rem',
          alignItems: 'center',
          marginBottom: '0.75rem'
        }}>
              <span style={{
            fontSize: '1.6rem'
          }}>{s.icon}</span>
              <div>
                <div style={{
              fontWeight: 700
            }}>{s.method}</div>
                <span style={{
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              background: s.difficulty === 'Easy' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              color: s.difficulty === 'Easy' ? 'var(--primary)' : 'var(--accent)',
              fontSize: '0.65rem',
              fontWeight: 700
            }}>{s.difficulty}</span>
              </div>
            </div>
            <div style={{
          display: 'flex',
          gap: '0.3rem',
          flexWrap: 'wrap',
          marginBottom: '0.75rem'
        }}>
              {s.crops.map((crop, i) => <span key={i} style={{
            padding: '0.15rem 0.4rem',
            borderRadius: '4px',
            background: 'var(--soft-bg)',
            fontSize: '0.7rem'
          }}>{crop}</span>)}
            </div>
            <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem'
        }}>
              <div style={{
            padding: '0.5rem',
            background: 'rgba(16,185,129,0.08)',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
                <div style={{
              fontWeight: 800,
              color: 'var(--primary)',
              fontSize: '0.95rem'
            }}>{localizeString(s.loss_reduction)}</div>
                <div className="text-muted" style={{
              fontSize: '0.65rem'
            }}>{t("loss_reduction")}</div>
              </div>
              <div style={{
            padding: '0.5rem',
            background: 'rgba(59,130,246,0.08)',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
                <div style={{
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>{localizeString(s.cost)}</div>
                <div className="text-muted" style={{
              fontSize: '0.65rem'
            }}>{t("cost")}</div>
              </div>
            </div>
            <div className="text-muted" style={{
          fontSize: '0.78rem',
          marginTop: '0.5rem'
        }}>{t("duration")}{localizeString(s.duration)}</div>
          </div>)}
      </div>
    </div>;
}
function BuyerConnectInlineForm({
  buyer,
  onClose
}) {
  const {
    t
  } = useTranslation();
  const [crop, setCrop] = useState(buyer.crops[0] || '');
  const [quantity, setQuantity] = useState('10');
  const [farmerName, setFarmerName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState('');
  const handleSubmit = e => {
    e.preventDefault();
    setInquiryId(`INQ-${Math.floor(100000 + Math.random() * 900000)}`);
    setSubmitted(true);
  };
  return <div className="animate-fade-in" style={{
    marginTop: '1rem',
    padding: '1.25rem',
    background: 'var(--soft-bg)',
    borderRadius: '14px',
    border: '1.5px solid var(--primary)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  }}>
      <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      borderBottom: '1px solid var(--glass-border)',
      paddingBottom: '0.75rem'
    }}>
        <div>
          <h4 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          margin: 0,
          color: 'var(--primary)'
        }}>{t("connect_with")}{buyer.name}</h4>
          <small className="text-muted">{buyer.type} · {buyer.price_premium}</small>
        </div>
        <button onClick={onClose} style={{
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '0.2rem'
      }}>
          <X size={18} />
        </button>
      </div>

      {submitted ? <div style={{
      padding: '0.5rem 0',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem'
    }}>
          <CheckCircle2 size={48} color="var(--primary)" />
          <h4 style={{
        fontSize: '1.2rem',
        fontWeight: 800,
        margin: 0
      }}>{t("inquiry_sent_to_buyer")}</h4>
          <p className="text-muted" style={{
        fontSize: '0.85rem',
        lineHeight: 1.5,
        margin: 0
      }}>{t("reference_id")}<strong style={{
          color: 'var(--primary)'
        }}>#{inquiryId}</strong>
            <br />
            <strong>{buyer.name}</strong>{t("procurement_team_will_contact_")}</p>
          <div style={{
        padding: '0.85rem',
        background: 'rgba(16,185,129,0.1)',
        borderRadius: 10,
        border: '1px solid var(--primary)',
        width: '100%',
        textAlign: 'left',
        fontSize: '0.82rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem'
      }}>
            <div>🌾 <strong>{t("crop_offer")}</strong> {crop} ({quantity}{t("quintals")}</div>
            <div>💰 <strong>{t("expected_price_premium")}</strong> {buyer.price_premium}</div>
            <div>💳 <strong>{t("payment_terms")}</strong> {buyer.payment}</div>
            <div>📞 <strong>{t("helpline")}</strong> <a href={`tel:${buyer.phone}`} style={{
            color: 'var(--primary)',
            fontWeight: 700
          }}>{buyer.phone || '1800-270-0224'}</a></div>
            {buyer.website && <div>🌐 <strong>{t("portal")}</strong> <a href={buyer.website} target="_blank" rel="noopener noreferrer" style={{
            color: 'var(--primary)',
            textDecoration: 'underline'
          }}>{buyer.website}</a></div>}
          </div>
          <button className="btn-primary" onClick={onClose} style={{
        marginTop: '0.25rem',
        padding: '0.5rem 1.5rem',
        borderRadius: 8,
        fontSize: '0.85rem'
      }}>{t("close_form")}</button>
        </div> : <form onSubmit={handleSubmit} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem'
    }}>
          <div>
            <label style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.35rem'
        }}>{t("select_crop_produce")}</label>
            <select value={crop} onChange={e => setCrop(e.target.value)} style={{
          width: '100%',
          padding: '0.6rem',
          borderRadius: 8,
          border: '1px solid var(--glass-border)',
          background: 'var(--control-bg)',
          color: 'var(--text-main)',
          fontSize: '0.85rem'
        }}>
              {buyer.crops.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.35rem'
        }}>{t("available_produce_quantity_qui")}</label>
            <input type="number" required min="1" value={quantity} onChange={e => setQuantity(e.target.value)} style={{
          width: '100%',
          padding: '0.55rem 0.75rem',
          borderRadius: 8,
          border: '1px solid var(--glass-border)',
          background: 'var(--control-bg)',
          color: 'var(--text-main)',
          fontSize: '0.85rem'
        }} />
          </div>

          <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem'
      }}>
            <input type="text" required placeholder="Farmer Name *" value={farmerName} onChange={e => setFarmerName(e.target.value)} style={{
          padding: '0.55rem 0.75rem',
          borderRadius: 8,
          border: '1px solid var(--glass-border)',
          background: 'var(--control-bg)',
          color: 'var(--text-main)',
          fontSize: '0.85rem'
        }} />
            <input type="tel" required placeholder="Phone Number *" value={phone} onChange={e => setPhone(e.target.value)} style={{
          padding: '0.55rem 0.75rem',
          borderRadius: 8,
          border: '1px solid var(--glass-border)',
          background: 'var(--control-bg)',
          color: 'var(--text-main)',
          fontSize: '0.85rem'
        }} />
          </div>

          <button type="submit" className="btn-primary" style={{
        padding: '0.65rem',
        borderRadius: 8,
        fontWeight: 700,
        width: '100%',
        fontSize: '0.9rem',
        marginTop: '0.2rem'
      }}>{t("submit_crop_offer")}</button>
        </form>}
    </div>;
}
function BuyerConnect({
  buyers
}) {
  const {
    t
  } = useTranslation();
  const [activeBuyerId, setActiveBuyerId] = useState(null);
  const {
    localizeString
  } = useLocalize();
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  }}>
      <div className="glass-panel" style={{
      padding: '1.25rem',
      background: 'rgba(16,185,129,0.06)',
      borderLeft: '3px solid var(--primary)'
    }}>
        <strong style={{
        color: 'var(--primary)'
      }}>{t("direct_buyer_linkages")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t("skip_middlemen_connect_directl")}</p>
      </div>
      {buyers.map(buyer => {
      const isExpanded = activeBuyerId === buyer.id;
      return <div key={buyer.id} className="glass-card" style={{
        padding: '1.5rem'
      }}>
            <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.75rem'
        }}>
              <div>
                <div style={{
              fontWeight: 700,
              fontSize: '1.05rem'
            }}>{buyer.name}</div>
                <div className="text-muted" style={{
              fontSize: '0.8rem'
            }}>{buyer.type}</div>
              </div>
              <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
                {buyer.verified && <span style={{
              padding: '0.2rem 0.5rem',
              borderRadius: 20,
              background: 'rgba(16,185,129,0.15)',
              color: 'var(--primary)',
              fontSize: '0.65rem',
              fontWeight: 700
            }}>{t("verified")}</span>}
              </div>
            </div>
            <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem'
        }}>
              <div><div className="text-muted" style={{
              fontSize: '0.72rem'
            }}>{t("price_premium")}</div><div style={{
              fontWeight: 800,
              color: 'var(--primary)',
              fontSize: '1rem'
            }}>{localizeString(buyer.price_premium)}</div></div>
              <div><div className="text-muted" style={{
              fontSize: '0.72rem'
            }}>{t("distance")}</div><div style={{
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}><MapPin size={12} /> {localizeString(buyer.distance)}</div></div>
              <div><div className="text-muted" style={{
              fontSize: '0.72rem'
            }}>{t("min_quantity")}</div><div style={{
              fontWeight: 600
            }}>{localizeString(buyer.min_quantity)}</div></div>
              <div><div className="text-muted" style={{
              fontSize: '0.72rem'
            }}>{t("payment")}</div><div style={{
              fontWeight: 600
            }}>{buyer.payment}</div></div>
            </div>
            <div style={{
          display: 'flex',
          gap: '0.3rem',
          flexWrap: 'wrap',
          marginTop: '0.75rem'
        }}>
              {buyer.crops.map((crop, i) => <span key={i} style={{
            padding: '0.15rem 0.4rem',
            borderRadius: '4px',
            background: 'var(--soft-bg)',
            border: '1px solid var(--glass-border)',
            fontSize: '0.7rem'
          }}>{crop}</span>)}
            </div>

            {/* Official Helpline & Website */}
            <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginTop: '0.75rem',
          fontSize: '0.8rem',
          padding: '0.5rem 0.75rem',
          background: 'var(--soft-bg)',
          borderRadius: '8px'
        }}>
              {buyer.phone && <div>📞 <strong>{t("tollfree_helpline")}</strong> <a href={`tel:${buyer.phone}`} style={{
              color: 'var(--primary)',
              fontWeight: 700
            }}>{localizeString(buyer.phone)}</a></div>}
              {buyer.website && <div>🌐 <strong>{t("official_portal")}</strong> <a href={buyer.website} target="_blank" rel="noopener noreferrer" style={{
              color: 'var(--primary)',
              textDecoration: 'underline'
            }}>{t("visit_site")}</a></div>}
            </div>

            <div style={{
          marginTop: '0.85rem'
        }}>
              <button onClick={() => setActiveBuyerId(isExpanded ? null : buyer.id)} style={{
            padding: '0.55rem 1.2rem',
            fontSize: '0.85rem',
            borderRadius: '8px',
            fontWeight: 700,
            border: '1.5px solid var(--primary)',
            background: isExpanded ? 'rgba(16,185,129,0.15)' : 'transparent',
            color: 'var(--primary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s ease'
          }}>
                {isExpanded ? 'Hide Connect Form ▲' : <>{t("connect")}<ArrowRight size={14} /></>}
              </button>
            </div>

            {/* Inline Connect Form Pane */}
            {isExpanded && <BuyerConnectInlineForm buyer={buyer} onClose={() => setActiveBuyerId(null)} />}
          </div>;
    })}
    </div>;
}
function SpotBookingInlineForm({
  transport,
  onClose,
  onBookingSuccess
}) {
  const {
    t
  } = useTranslation();
  const [quintals, setQuintals] = useState(5);
  const [crop, setCrop] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupVillage, setPickupVillage] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const ratePerQuintal = parseInt(transport.cost.replace(/\D/g, '') || '15', 10);
  const totalCost = ratePerQuintal * quintals;
  const handleConfirm = e => {
    e.preventDefault();
    const id = `SPOT-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingId(id);
    setConfirmed(true);
    onBookingSuccess(transport.id, quintals);
  };
  return <div className="animate-fade-in" style={{
    marginTop: '1rem',
    padding: '1.25rem',
    background: 'var(--soft-bg)',
    borderRadius: '14px',
    border: '1.5px solid var(--primary)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  }}>
      <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      borderBottom: '1px solid var(--glass-border)',
      paddingBottom: '0.75rem'
    }}>
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem'
      }}>
          <span style={{
          fontSize: '1.5rem'
        }}>{transport.icon}</span>
          <div>
            <h4 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            margin: 0,
            color: 'var(--primary)'
          }}>{t("book_transport_spot")}{transport.type}</h4>
            <small className="text-muted">{transport.route}</small>
          </div>
        </div>
        <button onClick={onClose} style={{
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '0.2rem'
      }}>
          <X size={18} />
        </button>
      </div>

      {confirmed ? <div style={{
      padding: '0.5rem 0',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem'
    }}>
          <CheckCircle2 size={48} color="var(--primary)" />
          <h4 style={{
        fontSize: '1.2rem',
        fontWeight: 800,
        margin: 0
      }}>{t("transport_spot_booked")}</h4>
          <p className="text-muted" style={{
        fontSize: '0.85rem',
        lineHeight: 1.5,
        margin: 0
      }}>{t("booking_reference")}<strong style={{
          color: 'var(--primary)'
        }}>#{bookingId}</strong>
            <br />{t("spot_reserved_for")}<strong>{quintals}{t("quintals")}</strong>{t("on")}<strong>{transport.type}</strong>.
          </p>
          <div style={{
        padding: '0.85rem',
        background: 'rgba(16,185,129,0.1)',
        borderRadius: 10,
        border: '1px solid var(--primary)',
        width: '100%',
        textAlign: 'left',
        fontSize: '0.82rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem'
      }}>
            <div>🚛 <strong>{t("route")}</strong> {transport.route}</div>
            <div>🕐 <strong>{t("departure")}</strong> {transport.next_trip}</div>
            <div>⚖️ <strong>{t("booked_space")}</strong> {quintals}{t("quintals")}</div>
            <div>💰 <strong>{t("total_logistics_cost")}</strong> ₹{totalCost.toLocaleString()}</div>
            <div>📞 <strong>{t("driver_helpline")}</strong>{t("919876543210")}</div>
          </div>
          <button className="btn-primary" onClick={onClose} style={{
        marginTop: '0.25rem',
        padding: '0.5rem 1.5rem',
        borderRadius: 8,
        fontSize: '0.85rem'
      }}>{t("close_form")}</button>
        </div> : <form onSubmit={handleConfirm} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem'
    }}>
          <div style={{
        padding: '0.65rem 0.85rem',
        background: 'var(--control-bg)',
        borderRadius: 10,
        border: '1px solid var(--glass-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
            <div>
              <small className="text-muted">{t("transport_rate")}</small>
              <div style={{
            fontWeight: 800,
            fontSize: '1rem',
            color: 'var(--primary)'
          }}>{transport.cost}</div>
            </div>
            <div style={{
          textAlign: 'right'
        }}>
              <small className="text-muted">{t("trip_schedule")}</small>
              <div style={{
            fontWeight: 600,
            fontSize: '0.85rem'
          }}>{transport.next_trip}</div>
            </div>
          </div>

          <div>
            <label style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.35rem'
        }}>{t("produce_weight_quintals")}</label>
            <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
              <button type="button" onClick={() => setQuintals(q => Math.max(1, q - 1))} style={{
            padding: '0.35rem 0.7rem',
            borderRadius: 6,
            border: '1px solid var(--glass-border)',
            background: 'var(--control-bg)',
            color: 'var(--text-main)',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}>
                -
              </button>
              <span style={{
            fontSize: '1.05rem',
            fontWeight: 800
          }}>{quintals}{t("quintals")}</span>
              <button type="button" onClick={() => setQuintals(q => q + 1)} style={{
            padding: '0.35rem 0.7rem',
            borderRadius: 6,
            border: '1px solid var(--glass-border)',
            background: 'var(--control-bg)',
            color: 'var(--text-main)',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}>
                +
              </button>
            </div>
          </div>

          <div>
            <label style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.35rem'
        }}>{t("produce_crop_name")}</label>
            <input type="text" required placeholder="e.g. Wheat, Paddy, Potato, Tomato..." value={crop} onChange={e => setCrop(e.target.value)} style={{
          width: '100%',
          padding: '0.55rem 0.75rem',
          borderRadius: 8,
          border: '1px solid var(--glass-border)',
          background: 'var(--control-bg)',
          color: 'var(--text-main)',
          fontSize: '0.85rem'
        }} />
          </div>

          <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem'
      }}>
            <input type="text" required placeholder="Farmer Name *" value={farmerName} onChange={e => setFarmerName(e.target.value)} style={{
          padding: '0.55rem 0.75rem',
          borderRadius: 8,
          border: '1px solid var(--glass-border)',
          background: 'var(--control-bg)',
          color: 'var(--text-main)',
          fontSize: '0.85rem'
        }} />
            <input type="tel" required placeholder="Phone Number *" value={phone} onChange={e => setPhone(e.target.value)} style={{
          padding: '0.55rem 0.75rem',
          borderRadius: 8,
          border: '1px solid var(--glass-border)',
          background: 'var(--control-bg)',
          color: 'var(--text-main)',
          fontSize: '0.85rem'
        }} />
          </div>

          <input type="text" required placeholder="Pickup Village / Farm Address *" value={pickupVillage} onChange={e => setPickupVillage(e.target.value)} style={{
        width: '100%',
        padding: '0.55rem 0.75rem',
        borderRadius: 8,
        border: '1px solid var(--glass-border)',
        background: 'var(--control-bg)',
        color: 'var(--text-main)',
        fontSize: '0.85rem'
      }} />

          <div style={{
        padding: '0.65rem 0.85rem',
        borderRadius: 10,
        background: 'rgba(16,185,129,0.08)',
        border: '1px dashed var(--primary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
            <div>
              <small className="text-muted">{t("logistics_fare")}</small>
              <div style={{
            fontWeight: 800,
            fontSize: '1.15rem',
            color: 'var(--primary)'
          }}>₹{totalCost.toLocaleString()}</div>
            </div>
            <button type="submit" className="btn-primary" style={{
          padding: '0.55rem 1.2rem',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: '0.85rem'
        }}>{t("confirm_spot_booking")}</button>
          </div>
        </form>}
    </div>;
}
function TransportShare({
  transport
}) {
  const {
    t
  } = useTranslation();
  const [activeTransportId, setActiveTransportId] = useState(null);
  const [bookedSpots, setBookedSpots] = useState({});
  const {
    localizeString
  } = useLocalize();
  const handleBookingSuccess = (transportId, qtl) => {
    setBookedSpots(prev => ({
      ...prev,
      [transportId]: (prev[transportId] || 0) + qtl
    }));
  };
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  }}>
      <div className="glass-panel" style={{
      padding: '1.25rem',
      background: 'rgba(59,130,246,0.06)',
      borderLeft: '3px solid var(--secondary)'
    }}>
        <strong style={{
        color: 'var(--secondary)'
      }}>{t("shared_transport_to_market")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t("pool_transport_with_nearby_far")}</p>
      </div>
      {transport.map(t => {
      const bookedQuintals = bookedSpots[t.id] || 0;
      const availableSeats = Math.max(0, t.seats_left - bookedQuintals);
      const isBooked = bookedQuintals > 0;
      const isExpanded = activeTransportId === t.id;
      return <div key={t.id} className="glass-card" style={{
        padding: '1.5rem'
      }}>
            <div style={{
          display: 'flex',
          gap: '0.8rem',
          alignItems: 'flex-start'
        }}>
              <span style={{
            fontSize: '2rem'
          }}>{t.icon}</span>
              <div style={{
            flex: 1
          }}>
                <div style={{
              fontWeight: 700,
              fontSize: '1.05rem'
            }}>{t.type}</div>
                <div className="text-muted" style={{
              fontSize: '0.82rem',
              marginBottom: '0.5rem'
            }}>{t.route}</div>
                <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem'
            }}>
                  <div><div className="text-muted" style={{
                  fontSize: '0.72rem'
                }}>{t("cost")}</div><div style={{
                  fontWeight: 700,
                  color: 'var(--primary)'
                }}>{localizeString(t.cost)}</div></div>
                  <div><div className="text-muted" style={{
                  fontSize: '0.72rem'
                }}>{t("capacity")}</div><div style={{
                  fontWeight: 600
                }}>{localizeString(t.capacity)}</div></div>
                  <div><div className="text-muted" style={{
                  fontSize: '0.72rem'
                }}>{t("spots_left")}</div><div style={{
                  fontWeight: 700,
                  color: availableSeats > 10 ? 'var(--primary)' : 'var(--accent)'
                }}>{localizeString(availableSeats)}{t("quintals")}</div></div>
                </div>
                <div className="text-muted" style={{
              fontSize: '0.82rem',
              marginTop: '0.5rem'
            }}>{t("next_trip")}{localizeString(t.next_trip)}</div>
                
                <button onClick={() => setActiveTransportId(isExpanded ? null : t.id)} style={{
              marginTop: '0.75rem',
              padding: '0.55rem 1.25rem',
              fontSize: '0.85rem',
              borderRadius: '8px',
              fontWeight: 700,
              border: '1.5px solid var(--primary)',
              background: isExpanded ? 'rgba(16,185,129,0.15)' : 'transparent',
              color: 'var(--primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
                  {isExpanded ? 'Hide Spot Form ▲' : isBooked ? `✓ Spot Booked (${localizeString(bookedQuintals)} qtl)` : 'Book Spot'}
                </button>

                {isExpanded && <SpotBookingInlineForm transport={t} onClose={() => setActiveTransportId(null)} onBookingSuccess={handleBookingSuccess} />}
              </div>
            </div>
          </div>;
    })}
    </div>;
}
export default function PostHarvestHub() {
  const {
    t
  } = useTranslation();
  const [tab, setTab] = useState(0);
  const {
    preferences
  } = usePreferences();
  
  const {
    data,
    loading,
    error,
    refetch
  } = useApi(() => api.postHarvest(), [preferences.location.latitude, preferences.location.longitude]);
  return <div className="animate-fade-in" style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  }}>
      <header>
        <h1 style={{
        fontSize: '2.5rem',
        marginBottom: '0.4rem'
      }}>
          <Package size={30} style={{
          verticalAlign: 'middle',
          marginRight: '0.5rem',
          color: 'var(--accent)'
        }} />
          {t('postHarvest', 'Post-Harvest & Markets')}
        </h1>
        <p className="text-muted">{t("reduce_losses_find_buyers_shar")}</p>
      </header>

      <div className="hub-tabs">
        {['Storage Advisor', 'Buyer Connect', 'Transport Share'].map((t, i) => {
        const Icon = [Package, ShoppingCart, Truck][i];
        return <button key={t} className={`hub-tab ${tab === i ? 'hub-tab-active' : ''}`} onClick={() => setTab(i)}>
              <Icon size={16} /> {t}
            </button>;
      })}
      </div>

      {loading && !data ? <LoadingGrid count={4} cols={2} /> : error ? <ErrorState message={error} onRetry={refetch} /> : <>
          {tab === 0 && <StorageAdvisor storage={data.storage} />}
          {tab === 1 && <BuyerConnect buyers={data.buyers} />}
          {tab === 2 && <TransportShare transport={data.transport} />}
        </>}
    </div>;
}