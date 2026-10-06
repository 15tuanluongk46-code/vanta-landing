import type { Metadata } from 'next';
import { Barlow_Condensed, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
const display = Barlow_Condensed({ subsets: ['latin', 'vietnamese'], weight: ['800'], variable: '--font-display', display: 'swap' });
const body = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['400', '600'], variable: '--font-body', display: 'swap' });
export const metadata: Metadata = { title: 'VANTA — FORM 01 | Định chất riêng', description: 'Khám phá sneaker concept VANTA FORM 01 qua ba phối màu và trải nghiệm 3D.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="vi" className={`${display.variable} ${body.variable}`}><body>{children}</body></html>; }
