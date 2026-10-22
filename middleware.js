import { NextResponse } from 'next/server';
import langs from './lib/langs.json';

const CODES = langs.map((l) => l.code);
const ALIAS = { nb: 'no', nn: 'no' };

export function middleware(req) {
  const p = req.nextUrl.pathname;
  if (p === '/icon' || p === '/apple-icon') return;
  if (CODES.includes(p.split('/')[1])) return;
  const wanted = (req.headers.get('accept-language') || '')
    .split(',')
    .map((s) => s.split(';')[0].trim().slice(0, 2).toLowerCase())
    .map((c) => ALIAS[c] || c);
  const lang = wanted.find((c) => CODES.includes(c)) || 'en';
  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${p === '/' ? '' : p}`;
  return NextResponse.redirect(url, 307);
}

export const config = { matcher: ['/((?!_next|api|.*\\..*).*)'] };
