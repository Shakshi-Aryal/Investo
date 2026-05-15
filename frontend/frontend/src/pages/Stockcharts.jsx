/**
 * Stockcharts.jsx — Legacy NEPSE Analytics page.
 * Redirects to the new Market Dashboard for a unified experience.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Stockcharts() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/market', { replace: true });
  }, [navigate]);

  return null;
}
