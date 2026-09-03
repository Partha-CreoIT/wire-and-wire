'use client';

import { useState, type FormEvent } from 'react';
import styles from './ContactForm.module.css';

const CONTACT_EMAIL = 'info@wireproducts.cc';

/* The legacy Joomla contact form (name / e-mail / subject / message),
   rebuilt. The site is static, so submit composes the message in the
   visitor's own mail app, addressed to the enquiry inbox. */
export function ContactForm() {
  const [opened, setOpened] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const subject = String(data.get('subject') ?? '').trim() || 'Enquiry';
    const message = String(data.get('message') ?? '').trim();

    const body = `Name: ${name}\nE-mail: ${email}\n\n${message}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `${subject} — ${name}`,
    )}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className={`mono-sm ${styles.label}`}>Your name</span>
          <input
            className={styles.input}
            type="text"
            name="name"
            autoComplete="name"
            required
          />
        </label>
        <label className={styles.field}>
          <span className={`mono-sm ${styles.label}`}>E-mail address</span>
          <input
            className={styles.input}
            type="email"
            name="email"
            autoComplete="email"
            required
          />
        </label>
      </div>
      <label className={styles.field}>
        <span className={`mono-sm ${styles.label}`}>Message subject</span>
        <input className={styles.input} type="text" name="subject" />
      </label>
      <label className={styles.field}>
        <span className={`mono-sm ${styles.label}`}>Your message</span>
        <textarea className={styles.input} name="message" rows={7} required />
      </label>
      <div className={styles.actions}>
        <button className={styles.submit} type="submit">
          Send message
        </button>
        <p className={`mono-sm ${styles.note}`}>
          {opened
            ? `Your e-mail app should now be open — just press send.`
            : `Opens your e-mail app, addressed to ${CONTACT_EMAIL}.`}
        </p>
      </div>
    </form>
  );
}
