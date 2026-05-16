import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, TrendingUp, Wallet, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePortfolio } from '../../context/PortfolioContext';
import { showAppToast } from '../../utils/notify';
import { formatNpr } from '../../utils/nepalFormat';
import '../../styles/market.css';

function formatPrice(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BuyStockModal({ stock, open, onClose }) {
  const navigate = useNavigate();
  const { buyStock, walletBalance, fetchWallet } = usePortfolio();
  const [kitta, setKitta] = useState('10');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setKitta('10');
      fetchWallet();
    }
  }, [open, stock?.symbol, fetchWallet]);

  const quickLots = [10, 50, 100, 500];

  if (!open || !stock) return null;

  const price = parseFloat(stock.current_price) || 0;
  const qty = parseInt(kitta, 10) || 0;
  const total = price * qty;
  const balance = walletBalance ?? 0;
  const insufficient = walletBalance != null && total > balance;

  const handleConfirm = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      toast.error('Please sign in to invest');
      navigate('/login');
      return;
    }
    if (qty <= 0) {
      toast.error('Enter a valid number of kitta (units)');
      return;
    }
    if (insufficient) {
      toast.error('Insufficient trading balance');
      return;
    }

    setSubmitting(true);
    try {
      await buyStock({ symbol: stock.symbol, shares: qty });
      showAppToast(
        `Purchased ${qty} kitta of ${stock.symbol} — added to your portfolio`,
        'success',
      );
      onClose();
    } catch (err) {
      toast.error(err.message || 'Purchase failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay buy-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="buy-checkout-modal glass-strong"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="buy-modal-title"
      >
        <div className="buy-modal-header">
          <div>
            <h2 id="buy-modal-title" className="buy-modal-title">
              Invest / Buy Stock
            </h2>
            <p className="buy-modal-subtitle">
              {stock.symbol} · {stock.company_name}
            </p>
          </div>
          <button type="button" className="buy-modal-close" onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="buy-modal-price-block">
          <span className="buy-modal-label">Live NEPSE price</span>
          <p className="buy-modal-price">Rs. {formatPrice(price)}</p>
          <span className="buy-modal-per">per kitta</span>
        </div>

        <div className="buy-modal-wallet">
          <Wallet size={16} />
          <span>Available balance</span>
          <strong>{walletBalance != null ? formatNpr(balance) : '—'}</strong>
        </div>

        <div className="bento-form-group">
          <label htmlFor="buy-kitta">Number of kitta (units)</label>
          <input
            id="buy-kitta"
            className="inv-input"
            type="number"
            min="1"
            step="1"
            value={kitta}
            onChange={(e) => setKitta(e.target.value)}
          />
          <div className="buy-quick-lots">
            {quickLots.map((n) => (
              <button
                key={n}
                type="button"
                className="buy-lot-chip"
                onClick={() => setKitta(String(n))}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className={`buy-modal-total ${insufficient ? 'buy-modal-total--warn' : ''}`}>
          <span>Total cost</span>
          <span>Rs. {formatPrice(total)}</span>
        </div>

        {insufficient && (
          <p className="buy-modal-insufficient">
            <AlertTriangle size={14} />
            Insufficient balance for this order
          </p>
        )}

        <div className="buy-modal-actions">
          <button type="button" className="modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="inv-btn-primary"
            disabled={submitting || qty <= 0 || insufficient}
            onClick={handleConfirm}
          >
            <TrendingUp size={18} />
            {submitting ? 'Processing…' : 'Confirm Purchase'}
          </button>
        </div>

        <p className="buy-modal-footnote">
          Holdings update instantly on your Portfolio — no page reload.
        </p>
      </div>
    </div>
  );
}
