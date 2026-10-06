'use client';
import { useState, type FormEvent } from 'react';
export default function Signup() {
  const [message, setMessage] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setMessage('Đăng ký demo thành công. Email không được lưu hay gửi đi.'); }
  return <form onSubmit={submit} className="signup-form"><label htmlFor="email">Email của bạn</label><div className="input-row"><input id="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} aria-describedby="form-note"/><button type="submit">Đăng ký ↗</button></div><p id="form-note">Trải nghiệm concept. Chưa mở bán. Form demo không thu thập dữ liệu.</p><p role="status">{message}</p></form>;
}
