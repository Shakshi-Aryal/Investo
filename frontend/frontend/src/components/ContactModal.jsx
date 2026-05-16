import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MessageSquare } from 'lucide-react';
import ContactEmail from './ContactEmail';
import { SUPPORT_MAILTO_FEEDBACK } from '../constants/contact';

export default function ContactModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            className="glass-strong modal-content"
            style={{ maxWidth: 440, textAlign: 'left', padding: 28 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="contact-modal-title"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 id="contact-modal-title" style={{ margin: '0 0 8px', fontFamily: 'var(--font-heading)', fontSize: 22 }}>
                  Contact Investo
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  Product support, account questions, and partnership inquiries.
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <div
              style={{
                padding: 20,
                borderRadius: 14,
                background: 'var(--input-bg)',
                border: '1px solid var(--card-border)',
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Official email
              </span>
              <div style={{ marginTop: 10 }}>
                <ContactEmail />
              </div>
            </div>

            <a
              href={SUPPORT_MAILTO_FEEDBACK}
              className="inv-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                textDecoration: 'none',
                borderRadius: 14,
                padding: '14px 20px',
              }}
            >
              <MessageSquare size={18} />
              Send Feedback
            </a>

            <p style={{ margin: '16px 0 0', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
              We respond to all messages at our official support address.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
