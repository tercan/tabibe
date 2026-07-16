import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation.js';

/**
 * 1. Date formatting helpers
 */

function format_time(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function format_date(date, translations) {
  const day_name = translations.day_names[date.getDay()];
  const day = date.getDate();
  const month = translations.month_names[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}, ${day_name}`;
}

/**
 * 2. Clock component
 */

function Clock() {
  const [now, set_now] = useState(new Date());
  const { t, translations } = useTranslation();

  useEffect(() => {
    const timer_id = setInterval(() => {
      set_now(new Date());
    }, 1000);

    return () => clearInterval(timer_id);
  }, []);

  return (
    <section className="clock" aria-label={t('clock_aria_label')}>
      <time className="clock-time" dateTime={now.toISOString()}>
        {format_time(now)}
      </time>
      <p className="clock-date">{format_date(now, translations)}</p>
      {/* /.clock */}
    </section>
  );
}

export default Clock;
