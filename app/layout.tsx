import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '머니그라운드 — 카지노 & 스포츠',
  description: '카지노·스포츠·라이브 게임을 한 곳에서 탐색하는 프리미엄 엔터테인먼트 라운지',
  openGraph: {
    title: 'MONEYGROUND — PLAY YOUR GROUND',
    description: '프리미엄 카지노와 실시간 스포츠를 한 화면에서 탐색하는 멤버 라운지',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MONEYGROUND — PLAY YOUR GROUND',
    description: '프리미엄 카지노와 실시간 스포츠를 한 화면에서 탐색하는 멤버 라운지',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
