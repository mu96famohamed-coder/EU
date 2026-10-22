'use client';
import { useEffect, useId, useRef, useState } from 'react';
import styles from './ContactForm.module.css';

export default function ServiceSelect({ name, label, placeholder, options, lang }) {
  const id = useId();
  const root = useRef(null);
  const trigger = useRef(null);
  const search = useRef({ text: '', time: 0 });
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [active, setActive] = useState(0);
  const selected = options.find(option => option.id === selectedId);
  const listId = `${id}-list`;
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;

  useEffect(() => {
    const dismiss = event => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    const reset = () => { setSelectedId(''); setOpen(false); setActive(0); };
    const form = root.current?.closest('form');
    document.addEventListener('pointerdown', dismiss);
    form?.addEventListener('reset', reset);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      form?.removeEventListener('reset', reset);
    };
  }, []);

  useEffect(() => {
    if (open) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, id]);

  function choose(index) {
    if (!options[index]) return;
    setSelectedId(options[index].id);
    setOpen(false);
    trigger.current?.focus();
  }

  function onKeyDown(event) {
    const selectedIndex = Math.max(0, options.findIndex(option => option.id === selectedId));
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive(open ? (active + step + options.length) % options.length : selectedIndex);
      setOpen(true);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActive(event.key === 'Home' ? 0 : options.length - 1);
      setOpen(true);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(active);
      else { setActive(selectedIndex); setOpen(true); }
    } else if (event.key === 'Escape') {
      if (open) event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Tab') {
      setOpen(false);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      const text = (now - search.current.time < 700 ? search.current.text : '') + event.key;
      search.current = { text, time: now };
      const index = options.findIndex(option => option.label.toLocaleLowerCase(lang).startsWith(text.toLocaleLowerCase(lang)));
      if (index >= 0) { event.preventDefault(); setActive(index); setOpen(true); }
    }
  }

  return <div className={styles.picker} ref={root} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <label id={labelId} htmlFor={id}>{label}</label>
    <input type="hidden" name={name} value={selected?.label || ''} />
    <button ref={trigger} id={id} type="button" role="combobox"
      className={styles.trigger} aria-expanded={open} aria-haspopup="listbox"
      aria-controls={listId} aria-labelledby={`${labelId} ${valueId}`}
      aria-activedescendant={open ? `${id}-option-${active}` : undefined}
      onKeyDown={onKeyDown} onClick={() => {
        setActive(Math.max(0, options.findIndex(option => option.id === selectedId)));
        setOpen(!open);
      }}>
      <span id={valueId}>{selected?.label || placeholder}</span>
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7 5 5 5-5" /></svg>
    </button>
    {open ? <ul id={listId} role="listbox" aria-labelledby={labelId} className={styles.options}>
      {options.map((option, index) => <li key={option.id} id={`${id}-option-${index}`}
        role="option" aria-selected={selectedId === option.id}
        data-active={active === index} onPointerMove={() => setActive(index)}
        onPointerDown={event => event.preventDefault()} onClick={() => choose(index)}>
        {option.label}
      </li>)}
    </ul> : null}
  </div>;
}
