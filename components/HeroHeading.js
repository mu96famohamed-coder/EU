'use client';

import {useEffect, useRef} from 'react';

// Keep the site's font; fit the two editorial lines to their actual container.
export default function HeroHeading({text}) {
 const heading = useRef(null);
 useEffect(() => {
  const node = heading.current;
  if (!node) return;
  let frame;
  let previousWidth = -1;
  let disposed = false;
  function fit(force = false) {
   if (disposed) return;
   const width = node.clientWidth;
   if (!width || (!force && width === previousWidth)) return;
   previousWidth = width;
   node.style.fontSize = '';
   const preferred = parseFloat(getComputedStyle(node).fontSize);
   let widest = 0;
   for (const line of node.querySelectorAll('.hero-title-line')) {
    line.style.whiteSpace = 'nowrap';
    const range = document.createRange();
    range.selectNodeContents(line);
    widest = Math.max(widest, range.getBoundingClientRect().width);
    line.style.whiteSpace = '';
   }
   // Longer translations may wrap on narrow screens to keep the text readable.
   const size = Math.max(24, Math.min(preferred, preferred * (width - 2) / Math.max(widest, 1)));
   node.style.fontSize = `${size}px`;
  }
  const observer = new ResizeObserver(() => {
   cancelAnimationFrame(frame);
   frame = requestAnimationFrame(() => fit());
  });
  observer.observe(node);
  fit(true);
  document.fonts?.ready.then(() => fit(true));
  return () => {disposed = true; observer.disconnect(); cancelAnimationFrame(frame);};
 }, [text]);
 return <h1 ref={heading} className="hero-heading">{text.split('\n').map((line, i) => <span className="hero-title-line" key={i}>{i > 0 ? '\n' : ''}{line}</span>)}</h1>;
}
