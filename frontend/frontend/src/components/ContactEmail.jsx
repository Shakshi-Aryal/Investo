import React from 'react';
import { Mail } from 'lucide-react';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '../constants/contact';

/**
 * Styled mailto link for official support touchpoints.
 */
export default function ContactEmail({ style = {}, showIcon = true, className = '' }) {
  return (
    <a
      href={SUPPORT_MAILTO}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: 'var(--accent)',
        fontWeight: 600,
        fontSize: 15,
        textDecoration: 'none',
        wordBreak: 'break-word',
        ...style,
      }}
    >
      {showIcon && <Mail size={16} />}
      {SUPPORT_EMAIL}
    </a>
  );
}
