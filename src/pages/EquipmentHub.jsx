import { useState } from 'react';
import { Wrench, Users, Building, Star, MapPin, CheckCircle, Clock, XCircle, Calendar, Phone, CheckCircle2, X, Tractor, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../api';
import { LoadingGrid, ErrorState } from '../components/LoadingCard';
import { usePreferences } from '../contexts/PreferencesContext';
import { useTranslation } from 'react-i18next';
function parseRateNumber(rateStr) {
  if (!rateStr) return 500;
  const match = String(rateStr).replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 500;
}
function EquipmentBookingInlineForm({
  item,
  onClose,
  onBookingSuccess
}) {
  const {
    t
  } = useTranslation();
  const [hours, setHours] = useState(2);
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [deliveryOption, setDeliveryOption] = useState('delivery');
  const [farmerName, setFarmerName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const unitRate = parseRateNumber(item.rate);
  const deliveryFee = deliveryOption === 'delivery' ? 150 : 0;
  const totalAmount = unitRate * hours + deliveryFee;
  const handleConfirm = e => {
    e.preventDefault();
    const id = `RENT-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingId(id);
    setConfirmed(true);
    onBookingSuccess(item.id);
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
        }}>{item.icon}</span>
          <div>
            <h4 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            margin: 0,
            color: 'var(--primary)'
          }}>{t("book")}{item.name}</h4>
            <small className="text-muted">{t("owner")}{item.owner} · {item.distance}</small>
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
      }}>{t("equipment_booking_confirmed")}</h4>
          <p className="text-muted" style={{
        fontSize: '0.85rem',
        lineHeight: 1.5,
        margin: 0
      }}>{t("booking_reference")}<strong style={{
          color: 'var(--primary)'
        }}>#{bookingId}</strong>
            <br />
            <strong>{item.owner}</strong>{t("will_prepare_the")}<strong>{item.name}</strong>{t("for")}<strong>{bookingDate}</strong>.
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
            <div>🚜 <strong>{t("equipment")}</strong> {item.name}</div>
            <div>⏱️ <strong>{t("duration")}</strong> {hours} {item.rate.includes('week') ? 'week(s)' : item.rate.includes('acre') ? 'acre(s)' : 'hour(s)'}</div>
            <div>💰 <strong>{t("total_amount")}</strong> ₹{totalAmount.toLocaleString()}</div>
            <div>📞 <strong>{t("owner_contact")}</strong>{t("919876543210")}</div>
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
              <small className="text-muted">{t("rental_rate")}</small>
              <div style={{
            fontWeight: 800,
            fontSize: '1rem',
            color: 'var(--primary)'
          }}>{item.rate}</div>
            </div>
            <div>
              <small className="text-muted">{t("condition")}</small>
              <div style={{
            fontWeight: 600,
            fontSize: '0.85rem'
          }}>{item.condition}</div>
            </div>
          </div>

          <div>
            <label style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.35rem'
        }}>{t("duration")}{item.rate.includes('week') ? 'Weeks' : item.rate.includes('acre') ? 'Acres' : 'Hours'}):
            </label>
            <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
              <button type="button" onClick={() => setHours(h => Math.max(1, h - 1))} style={{
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
          }}>{hours}</span>
              <button type="button" onClick={() => setHours(h => h + 1)} style={{
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
        }}>{t("required_date")}</label>
            <input type="date" required value={bookingDate} onChange={e => setBookingDate(e.target.value)} style={{
          width: '100%',
          padding: '0.55rem 0.75rem',
          borderRadius: 8,
          border: '1px solid var(--glass-border)',
          background: 'var(--control-bg)',
          color: 'var(--text-main)',
          fontSize: '0.85rem'
        }} />
          </div>

          <div>
            <label style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.35rem'
        }}>{t("transport_option")}</label>
            <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem'
        }}>
              <button type="button" onClick={() => setDeliveryOption('delivery')} style={{
            padding: '0.45rem',
            borderRadius: 8,
            border: `1px solid ${deliveryOption === 'delivery' ? 'var(--primary)' : 'var(--glass-border)'}`,
            background: deliveryOption === 'delivery' ? 'rgba(16,185,129,0.15)' : 'var(--control-bg)',
            color: deliveryOption === 'delivery' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.78rem',
            cursor: 'pointer'
          }}>{t("owner_delivery_150")}</button>
              <button type="button" onClick={() => setDeliveryOption('pickup')} style={{
            padding: '0.45rem',
            borderRadius: 8,
            border: `1px solid ${deliveryOption === 'pickup' ? 'var(--primary)' : 'var(--glass-border)'}`,
            background: deliveryOption === 'pickup' ? 'rgba(16,185,129,0.15)' : 'var(--control-bg)',
            color: deliveryOption === 'pickup' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.78rem',
            cursor: 'pointer'
          }}>{t("self_pickup_free")}</button>
            </div>
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
              <small className="text-muted">{t("total_payable")}</small>
              <div style={{
            fontWeight: 800,
            fontSize: '1.15rem',
            color: 'var(--primary)'
          }}>₹{totalAmount.toLocaleString()}</div>
            </div>
            <button type="submit" className="btn-primary" style={{
          padding: '0.55rem 1.2rem',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: '0.85rem'
        }}>{t("confirm_booking")}</button>
          </div>
        </form>}
    </div>;
}
function LaborBookingInlineForm({
  team,
  onClose,
  onBookingSuccess
}) {
  const {
    t
  } = useTranslation();
  const [days, setDays] = useState(1);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [cropTask, setCropTask] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const dailyRatePerWorker = parseRateNumber(team.rate);
  const totalCost = dailyRatePerWorker * team.workers * days;
  const handleConfirm = e => {
    e.preventDefault();
    const id = `LABOR-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingId(id);
    setConfirmed(true);
    onBookingSuccess(team.id);
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
        <div>
          <h4 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          margin: 0,
          color: 'var(--primary)'
        }}>{t("hire")}{team.name}</h4>
          <small className="text-muted">{team.workers}{t("workers")}{team.distance}</small>
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
      }}>{t("labor_team_hired")}</h4>
          <p className="text-muted" style={{
        fontSize: '0.85rem',
        lineHeight: 1.5,
        margin: 0
      }}>{t("booking_reference")}<strong style={{
          color: 'var(--primary)'
        }}>#{bookingId}</strong>
            <br />
            <strong>{team.name}</strong> ({team.workers}{t("workers_will_arrive_on")}<strong>{startDate}</strong>{t("for")}<strong>{days}{t("days")}</strong>.
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
            <div>👷 <strong>{t("team")}</strong> {team.name} ({team.workers}{t("workers")}</div>
            <div>📅 <strong>{t("start_date")}</strong> {startDate} ({days}{t("days")}</div>
            <div>💰 <strong>{t("total_labor_wages")}</strong> ₹{totalCost.toLocaleString()}</div>
            <div>📞 <strong>{t("supervisor_helpline")}</strong>{t("919876543210")}</div>
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
              <small className="text-muted">{t("daily_rate")}</small>
              <div style={{
            fontWeight: 800,
            fontSize: '1rem',
            color: 'var(--primary)'
          }}>{team.rate}</div>
            </div>
            <div>
              <small className="text-muted">{t("team_size")}</small>
              <div style={{
            fontWeight: 600,
            fontSize: '0.85rem'
          }}>{team.workers}{t("workers")}</div>
            </div>
          </div>

          <div>
            <label style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.35rem'
        }}>{t("duration_days")}</label>
            <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
              <button type="button" onClick={() => setDays(d => Math.max(1, d - 1))} style={{
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
          }}>{days}{t("days")}</span>
              <button type="button" onClick={() => setDays(d => d + 1)} style={{
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
        }}>{t("required_date")}</label>
            <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} style={{
          width: '100%',
          padding: '0.55rem 0.75rem',
          borderRadius: 8,
          border: '1px solid var(--glass-border)',
          background: 'var(--control-bg)',
          color: 'var(--text-main)',
          fontSize: '0.85rem'
        }} />
          </div>

          <div>
            <label style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.35rem'
        }}>{t("farm_work_crop_description")}</label>
            <input type="text" placeholder="e.g. Paddy Transplanting, Wheat Harvest..." value={cropTask} onChange={e => setCropTask(e.target.value)} style={{
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
              <small className="text-muted">{t("estimated_wages")}</small>
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
        }}>{t("confirm_booking")}</button>
          </div>
        </form>}
    </div>;
}
function GroupPurchaseInlineForm({
  purchase,
  onClose,
  onSuccess
}) {
  const {
    t
  } = useTranslation();
  const [qty, setQty] = useState(1);
  const [farmerName, setFarmerName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [paymentMode, setPaymentMode] = useState('cod');
  const [confirmed, setConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');
  const estimatedUnitPrice = purchase.item.includes('DAP') ? 1250 : purchase.item.includes('Wheat') ? 450 : 850;
  const unitSavings = purchase.item.includes('DAP') ? 90 : purchase.item.includes('Wheat') ? 25 : 82;
  const totalPrice = estimatedUnitPrice * qty;
  const totalSavings = unitSavings * qty;
  const handleConfirm = e => {
    e.preventDefault();
    const id = `COOP-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(id);
    setConfirmed(true);
    onSuccess(purchase.item);
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
        <div>
          <h4 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          margin: 0,
          color: 'var(--primary)'
        }}>{t("join_group_purchase")}{purchase.item}</h4>
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
      }}>{t("group_order_placed")}</h4>
          <p className="text-muted" style={{
        fontSize: '0.85rem',
        lineHeight: 1.5,
        margin: 0
      }}>{t("order_id")}<strong style={{
          color: 'var(--primary)'
        }}>#{orderId}</strong>
            <br />{t("your_order_for")}<strong>{qty}{t("units")}</strong>{t("of")}<strong>{purchase.item}</strong>{t("has_been_added_to_the_coop_bat")}</p>
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
            <div>📦 <strong>{t("item")}</strong> {purchase.item} ({qty}{t("units")}</div>
            <div>💰 <strong>{t("total_amount")}</strong> ₹{totalPrice.toLocaleString()}</div>
            <div>🎉 <strong>{t("coop_group_savings")}</strong> ₹{totalSavings.toLocaleString()}</div>
            <div>⏰ <strong>{t("batch_deadline")}</strong> {purchase.deadline}</div>
            <div>📍 <strong>{t("collection_point")}</strong>{t("village_agricultural_cooperati")}</div>
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
              <small className="text-muted">{t("item_rate")}</small>
              <div style={{
            fontWeight: 800,
            fontSize: '1rem',
            color: 'var(--primary)'
          }}>₹{estimatedUnitPrice.toLocaleString()}{t("unit")}</div>
            </div>
            <div style={{
          textAlign: 'right'
        }}>
              <small className="text-muted">{t("batch_total_goal")}</small>
              <div style={{
            fontWeight: 600,
            fontSize: '0.85rem'
          }}>{purchase.quantity}</div>
            </div>
          </div>

          <div>
            <label style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.35rem'
        }}>{t("purchase_quantity_unitsbags")}</label>
            <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
              <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} style={{
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
          }}>{qty}{t("units")}</span>
              <button type="button" onClick={() => setQty(q => q + 1)} style={{
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

          <input type="text" required placeholder="Village / Delivery Address *" value={village} onChange={e => setVillage(e.target.value)} style={{
        padding: '0.55rem 0.75rem',
        borderRadius: 8,
        border: '1px solid var(--glass-border)',
        background: 'var(--control-bg)',
        color: 'var(--text-main)',
        fontSize: '0.85rem'
      }} />

          <div>
            <label style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.35rem'
        }}>{t("payment_option")}</label>
            <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem'
        }}>
              <button type="button" onClick={() => setPaymentMode('cod')} style={{
            padding: '0.45rem',
            borderRadius: 8,
            border: `1px solid ${paymentMode === 'cod' ? 'var(--primary)' : 'var(--glass-border)'}`,
            background: paymentMode === 'cod' ? 'rgba(16,185,129,0.15)' : 'var(--control-bg)',
            color: paymentMode === 'cod' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.78rem',
            cursor: 'pointer'
          }}>{t("pay_at_coop_center")}</button>
              <button type="button" onClick={() => setPaymentMode('upi')} style={{
            padding: '0.45rem',
            borderRadius: 8,
            border: `1px solid ${paymentMode === 'upi' ? 'var(--primary)' : 'var(--glass-border)'}`,
            background: paymentMode === 'upi' ? 'rgba(16,185,129,0.15)' : 'var(--control-bg)',
            color: paymentMode === 'upi' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.78rem',
            cursor: 'pointer'
          }}>{t("online_upi_pay")}</button>
            </div>
          </div>

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
              <small className="text-muted">{t("total_order_value")}</small>
              <div style={{
            fontWeight: 800,
            fontSize: '1.15rem',
            color: 'var(--primary)'
          }}>₹{totalPrice.toLocaleString()}</div>
            </div>
            <button type="submit" className="btn-primary" style={{
          padding: '0.55rem 1.2rem',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: '0.85rem'
        }}>{t("confirm_purchase")}</button>
          </div>
        </form>}
    </div>;
}
function EquipmentShare({
  equipment,
  localizeString
}) {
  const {
    t
  } = useTranslation();
  const [activeEquipmentId, setActiveEquipmentId] = useState(null);
  const [bookedIds, setBookedIds] = useState([]);
  const handleBookingSuccess = id => {
    setBookedIds(prev => [...prev, id]);
  };
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
      }}>{t("peertopeer_equipment_rental")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t("rent_specialized_equipment_fro")}</p>
      </div>

      <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1rem'
    }}>
        {equipment.map(item => {
        const isBooked = bookedIds.includes(item.id) || !item.available;
        const isExpanded = activeEquipmentId === item.id;
        return <div key={item.id} className="glass-card" style={{
          padding: '1.5rem',
          opacity: isBooked ? 0.75 : 1
        }}>
              <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.75rem'
          }}>
                <div style={{
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'center'
            }}>
                  <span style={{
                fontSize: '1.6rem'
              }}>{item.icon}</span>
                  <div>
                    <div style={{
                  fontWeight: 700
                }}>{item.name}</div>
                    <div className="text-muted" style={{
                  fontSize: '0.78rem'
                }}>{item.owner}</div>
                  </div>
                </div>
                <span style={{
              padding: '0.2rem 0.5rem',
              borderRadius: 20,
              background: !isBooked ? 'rgba(16,185,129,0.15)' : 'rgba(223,48,48,0.15)',
              color: !isBooked ? 'var(--primary)' : 'var(--danger)',
              fontSize: '0.65rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}>
                  {!isBooked ? <><CheckCircle size={11} />{t("available")}</> : <><XCircle size={11} />{t("reserved")}</>}
                </span>
              </div>
              <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginTop: '0.5rem'
          }}>
                <div><div className="text-muted" style={{
                fontSize: '0.72rem'
              }}>{t("rate")}</div><div style={{
                fontWeight: 700,
                color: 'var(--primary)'
              }}>{localizeString ? localizeString(item.rate) : item.rate}</div></div>
                <div><div className="text-muted" style={{
                fontSize: '0.72rem'
              }}>{t("distance")}</div><div style={{
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}><MapPin size={12} /> {localizeString ? localizeString(item.distance) : item.distance}</div></div>
                <div><div className="text-muted" style={{
                fontSize: '0.72rem'
              }}>{t("condition")}</div><div style={{
                fontWeight: 600
              }}>{item.condition}</div></div>
                <div><div className="text-muted" style={{
                fontSize: '0.72rem'
              }}>{t("rating")}</div><div style={{
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}><Star size={12} fill="var(--accent)" color="var(--accent)" /> {localizeString ? localizeString(item.rating) : item.rating}</div></div>
              </div>

              {!isBooked ? <button onClick={() => setActiveEquipmentId(isExpanded ? null : item.id)} style={{
            marginTop: '1rem',
            width: '100%',
            padding: '0.6rem',
            textAlign: 'center',
            borderRadius: '8px',
            justifyContent: 'center',
            fontWeight: 700,
            border: '1.5px solid var(--primary)',
            background: isExpanded ? 'rgba(16,185,129,0.15)' : 'transparent',
            color: 'var(--primary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
                  {isExpanded ? 'Hide Booking Form ▲' : 'Book Now'}
                </button> : <button disabled className="btn-ghost" style={{
            marginTop: '1rem',
            width: '100%',
            padding: '0.6rem',
            textAlign: 'center',
            borderRadius: '8px',
            opacity: 0.6
          }}>{t("reserved_unavailable")}</button>}

              {isExpanded && !isBooked && <EquipmentBookingInlineForm item={item} onClose={() => setActiveEquipmentId(null)} onBookingSuccess={handleBookingSuccess} />}
            </div>;
      })}
      </div>
    </div>;
}
function LaborExchange({
  labor,
  localizeString
}) {
  const {
    t
  } = useTranslation();
  const [activeLaborId, setActiveLaborId] = useState(null);
  const [bookedTeamIds, setBookedTeamIds] = useState([]);
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
      }}>{t("labor_pool")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t("connect_with_skilled_labor_tea")}</p>
      </div>
      {labor.map(team => {
      const isHired = bookedTeamIds.includes(team.id);
      const isExpanded = activeLaborId === team.id;
      return <div key={team.id} className="glass-card" style={{
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
            }}>{team.name}</div>
                <div className="text-muted" style={{
              fontSize: '0.8rem'
            }}>{localizeString ? localizeString(team.workers) : team.workers}{t("workers")}{localizeString ? localizeString(team.distance) : team.distance}{t("away")}</div>
              </div>
              <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: 'var(--accent)'
          }}>
                <Star size={14} fill="var(--accent)" /> {localizeString ? localizeString(team.rating) : team.rating}
              </div>
            </div>
            <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem'
        }}>
              <div><div className="text-muted" style={{
              fontSize: '0.72rem'
            }}>{t("rate")}</div><div style={{
              fontWeight: 700,
              color: 'var(--primary)'
            }}>{localizeString ? localizeString(team.rate) : team.rate}</div></div>
              <div><div className="text-muted" style={{
              fontSize: '0.72rem'
            }}>{t("available")}</div><div style={{
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}><Clock size={12} /> {team.available_from}</div></div>
            </div>
            <div style={{
          display: 'flex',
          gap: '0.4rem',
          flexWrap: 'wrap',
          marginTop: '0.75rem'
        }}>
              {team.skills.map((skill, i) => <span key={i} style={{
            padding: '0.2rem 0.5rem',
            borderRadius: '6px',
            background: 'var(--soft-bg)',
            border: '1px solid var(--glass-border)',
            fontSize: '0.72rem'
          }}>{skill}</span>)}
            </div>

            <button onClick={() => setActiveLaborId(isExpanded ? null : team.id)} disabled={isHired} style={{
          marginTop: '1rem',
          padding: '0.55rem 1.2rem',
          borderRadius: '8px',
          fontWeight: 600,
          border: isHired ? '1px solid var(--glass-border)' : '1.5px solid var(--primary)',
          background: isHired ? 'var(--control-bg)' : isExpanded ? 'rgba(16,185,129,0.15)' : 'transparent',
          color: isHired ? 'var(--text-muted)' : 'var(--primary)',
          cursor: isHired ? 'default' : 'pointer',
          transition: 'all 0.2s ease'
        }}>
              {isHired ? '✓ Team Hired' : isExpanded ? 'Hide Booking Form ▲' : 'Contact & Book Team →'}
            </button>

            {isExpanded && !isHired && <LaborBookingInlineForm team={team} onClose={() => setActiveLaborId(null)} onBookingSuccess={id => setBookedTeamIds(prev => [...prev, id])} />}
          </div>;
    })}
    </div>;
}
function CooperativeTools({
  cooperative,
  localizeString
}) {
  const {
    t
  } = useTranslation();
  const [activePurchaseItem, setActivePurchaseItem] = useState(null);
  const [joinedPurchases, setJoinedPurchases] = useState([]);
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  }}>
      <div className="glass-card" style={{
      padding: '1.5rem',
      borderLeft: '4px solid var(--primary)'
    }}>
        <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
          <div>
            <h3 style={{
            fontSize: '1.2rem'
          }}>{cooperative.name}</h3>
            <div className="text-muted" style={{
            fontSize: '0.85rem'
          }}>{localizeString ? localizeString(cooperative.members) : cooperative.members}{t("members")}{localizeString ? localizeString(cooperative.shared_equipment) : cooperative.shared_equipment}{t("shared_equipment")}</div>
          </div>
          <div style={{
          textAlign: 'right'
        }}>
            <div className="text-muted" style={{
            fontSize: '0.72rem'
          }}>{t("fund_balance")}</div>
            <div style={{
            fontWeight: 800,
            fontSize: '1.3rem',
            color: 'var(--primary)'
          }}>{localizeString ? localizeString(cooperative.fund_balance) : cooperative.fund_balance}</div>
          </div>
        </div>
      </div>

      <h3 style={{
      fontSize: '1.1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>{t("active_group_purchases")}</h3>
      {cooperative.group_purchases.map((gp, i) => {
      const isJoined = joinedPurchases.includes(gp.item);
      const isExpanded = activePurchaseItem === gp.item;
      return <div key={i} className="glass-card" style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
            <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
              <div>
                <div style={{
              fontWeight: 700,
              fontSize: '1.05rem'
            }}>{gp.item}</div>
                <div className="text-muted" style={{
              fontSize: '0.8rem',
              marginTop: '0.2rem'
            }}>{t("quantity")}{localizeString ? localizeString(gp.quantity) : gp.quantity}</div>
              </div>
              <div style={{
            textAlign: 'right'
          }}>
                <div style={{
              fontWeight: 700,
              color: 'var(--primary)'
            }}>{localizeString ? localizeString(gp.savings) : gp.savings}</div>
                <div className="text-muted" style={{
              fontSize: '0.75rem'
            }}>{t("deadline")}{gp.deadline}</div>
              </div>
            </div>

            <div>
              <button disabled={isJoined} onClick={() => setActivePurchaseItem(isExpanded ? null : gp.item)} style={{
            padding: '0.5rem 1.1rem',
            fontSize: '0.85rem',
            borderRadius: 8,
            fontWeight: 600,
            border: isJoined ? '1px solid var(--glass-border)' : '1.5px solid var(--primary)',
            background: isJoined ? 'rgba(16,185,129,0.15)' : isExpanded ? 'rgba(16,185,129,0.15)' : 'transparent',
            color: 'var(--primary)',
            cursor: isJoined ? 'default' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s ease'
          }}>
                {isJoined ? '✓ Joined Purchase' : isExpanded ? 'Hide Order Form ▲' : 'Join Purchase →'}
              </button>
            </div>

            {isExpanded && !isJoined && <GroupPurchaseInlineForm purchase={gp} onClose={() => setActivePurchaseItem(null)} onSuccess={itemName => setJoinedPurchases(prev => [...prev, itemName])} />}
          </div>;
    })}
    </div>;
}
export default function EquipmentHub() {
  const [tab, setTab] = useState(0);
  const {
    preferences
  } = usePreferences();
  const {
    t
  } = useTranslation();
  const {
    data,
    loading,
    error,
    refetch
  } = useApi(() => api.equipment(), [preferences.location.latitude, preferences.location.longitude]);
  const localizeString = str => {
    if (!str) return str;
    const formatter = new Intl.NumberFormat(preferences.language, {
      useGrouping: false
    });
    return String(str).replace(/\d/g, match => formatter.format(match));
  };
  return <div className="animate-fade-in" style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  }}>
      <header>
        <h1 style={{
        fontSize: '2.5rem',
        marginBottom: '0.4rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
          <Wrench size={30} style={{
          color: 'var(--primary)'
        }} />
          {t('laborAndEquipment', 'Labor & Equipment')}
        </h1>
        <p className="text-muted">{t("share_equipment_find_labor_gro")}</p>
      </header>

      <div className="hub-tabs">
        {['Equipment Share', 'Labor Exchange', 'Cooperative'].map((t, i) => <button key={t} className={`hub-tab ${tab === i ? 'hub-tab-active' : ''}`} onClick={() => setTab(i)}>
            {t}
          </button>)}
      </div>

      {loading && !data ? <LoadingGrid count={4} cols={2} /> : error ? <ErrorState message={error} onRetry={refetch} /> : <>
          {tab === 0 && <EquipmentShare equipment={data.equipment} localizeString={localizeString} />}
          {tab === 1 && <LaborExchange labor={data.labor} localizeString={localizeString} />}
          {tab === 2 && <CooperativeTools cooperative={data.cooperative} localizeString={localizeString} />}
        </>}
    </div>;
}