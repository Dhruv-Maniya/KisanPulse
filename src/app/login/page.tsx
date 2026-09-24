'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Check, Lock, Phone, RefreshCw, ShieldCheck, Sprout, UserCheck, Wheat, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type Language = 'en' | 'hi' | 'mr'
type Mode = 'otp' | 'trader'

const copy = {
  en: {
    welcomeFarmer: 'Welcome back to smarter farming',
    subtitleFarmer: 'Sign in to unlock verified mandi intelligence, real-time arbitrage, and AI negotiation scripts.',
    welcomeTrader: 'Welcome to KisanPulse Buyer Portal',
    subtitleTrader: 'Access live farm-gate harvest listings with verified APMC modal benchmarks and transparent supply signals.',
    cardTitleOtp: 'Farmer Sign In',
    cardDescOtp: 'Enter your 10-digit mobile number to receive an instant OTP.',
    cardTitleTrader: 'Market Buyer Access',
    cardDescTrader: 'Sign in with your trader credentials or APMC license number.',
    phone: 'Mobile number',
    send: 'Send OTP',
    otpTitle: 'Enter the 6-digit OTP',
    otpHint: 'Demo OTP: 123456',
    verify: 'Verify & Open Farmer Dashboard',
    resend: 'Resend OTP',
    email: 'Email or APMC License ID',
    password: 'Password',
    remember: 'Remember this device',
    trader: 'Sign In as Market Buyer',
    guestFarmer: 'Explore as Guest Farmer',
    guestTrader: 'Explore as Guest Trader / Buyer',
    guestHint: 'Instant one-click access without phone/password.',
    invalidPhone: 'Enter a valid 10-digit mobile number.',
    invalidOtp: 'That OTP is incorrect. Try 123456 for the demo.',
    verified: 'Verified! Opening your dashboard…',
  },
  hi: {
    welcomeFarmer: 'स्मार्ट खेती में आपका स्वागत है',
    subtitleFarmer: 'सत्यापित मंडी जानकारी, रीयल-टाइम आर्बिट्रेज और AI बातचीत स्क्रिप्ट पाने के लिए लॉगिन करें।',
    welcomeTrader: 'किसानपल्स खरीदार पोर्टल में स्वागत है',
    subtitleTrader: 'सत्यापित APMC दरों के साथ किसानों से सीधे खरीद और पारदर्शी आपूर्ति प्राप्त करें।',
    cardTitleOtp: 'किसान लॉगिन',
    cardDescOtp: 'तत्काल ओटीपी प्राप्त करने के लिए अपना 10 अंकों का मोबाइल नंबर दर्ज करें।',
    cardTitleTrader: 'मार्केट खरीदार पहुंच',
    cardDescTrader: 'अपने व्यापारी क्रेडेंशियल या मंडी लाइसेंस नंबर से लॉगिन करें।',
    phone: 'मोबाइल नंबर',
    send: 'ओटीपी भेजें',
    otpTitle: '6 अंकों का ओटीपी दर्ज करें',
    otpHint: 'डेमो ओटीपी: 123456',
    verify: 'सत्यापित करें और किसान डैशबोर्ड खोलें',
    resend: 'ओटीपी फिर भेजें',
    email: 'ईमेल या मंडी लाइसेंस आईडी',
    password: 'पासवर्ड',
    remember: 'इस डिवाइस को याद रखें',
    trader: 'मार्केट खरीदार के रूप में लॉगिन',
    guestFarmer: 'बिना लॉगिन सीधे किसान डेमो देखें',
    guestTrader: 'बिना लॉगिन सीधे व्यापारी पोर्टल देखें',
    guestHint: 'डेमो के लिए किसी लॉगिन की आवश्यकता नहीं है।',
    invalidPhone: '10 अंकों का सही मोबाइल नंबर दर्ज करें।',
    invalidOtp: 'ओटीपी गलत है। डेमो के लिए 123456 डालें।',
    verified: 'सत्यापित! आपका डैशबोर्ड खुल रहा है…',
  },
  mr: {
    welcomeFarmer: 'स्मार्ट शेतीमध्ये आपले स्वागत आहे',
    subtitleFarmer: 'सत्यापित बाजार माहिती, थेट बाजारभाव आणि AI सल्ला मिळवण्यासाठी लॉगिन करा.',
    welcomeTrader: 'किसानपल्स खरेदीदार पोर्टलमध्ये आपले स्वागत आहे',
    subtitleTrader: 'अधिकृत बाजारभावासह थेट शेतकरी खरेदी आणि पारदर्शक पुरवठा माहिती मिळवा.',
    cardTitleOtp: 'शेतकरी लॉगिन',
    cardDescOtp: 'त्वरित ओटीपी मिळविण्यासाठी आपला 10 अंकी मोबाइल नंबर टाका.',
    cardTitleTrader: 'मार्केट खरेदीदार प्रवेश',
    cardDescTrader: 'आपल्या व्यापारी ओळख किंवा परवाना क्रमांकाने लॉगिन करा.',
    phone: 'मोबाइल नंबर',
    send: 'ओटीपी पाठवा',
    otpTitle: '6 अंकी ओटीपी टाका',
    otpHint: 'डेमो ओटीपी: 123456',
    verify: 'सत्यापित करा आणि शेतकरी डॅशबोर्ड उघडा',
    resend: 'ओटीपी पुन्हा पाठवा',
    email: 'ईमेल किंवा परवाना आयडी',
    password: 'पासवर्ड',
    remember: 'हे डिव्हाइस लक्षात ठेवा',
    trader: 'मार्केट खरेदीदार म्हणून लॉगिन',
    guestFarmer: 'लॉगिनशिवाय शेतकरी डेमो पहा',
    guestTrader: 'लॉगिनशिवाय व्यापारी पोर्टल पहा',
    guestHint: 'लाइव्ह डेमोसाठी लॉगिनची गरज नाही.',
    invalidPhone: '10 अंकी योग्य मोबाइल नंबर टाका.',
    invalidOtp: 'ओटीपी चुकीचा आहे. डेमोसाठी 123456 टाका.',
    verified: 'सत्यापित! डॅशबोर्ड उघडत आहे…',
  },
}

export default function LoginPage() {
  const [language, setLanguage] = useState<Language>('en')
  const [mode, setMode] = useState<Mode>('otp')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [verified, setVerified] = useState(false)
  const [traderEmail, setTraderEmail] = useState('trader@sahyadriagro.com')
  const [traderPassword, setTraderPassword] = useState('••••••••')
  const t = copy[language]

  const enterAsFarmer = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kisan_role', 'farmer')
      window.location.href = '/farmer'
    }
  }

  const enterAsTrader = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kisan_role', 'trader')
      window.location.href = '/trader'
    }
  }

  const sendOtp = () => {
    if (!/^\d{10}$/.test(phone)) return setError(t.invalidPhone)
    setError('')
    setSent(true)
  }

  const updateOtp = (index: number, value: string) => {
    const next = [...otp]
    next[index] = value.replace(/\D/g, '').slice(-1)
    setOtp(next)
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus()
  }

  const verifyOtp = () => {
    if (otp.join('') !== '123456') return setError(t.invalidOtp)
    setError('')
    setVerified(true)
    window.setTimeout(() => {
      enterAsFarmer()
    }, 600)
  }

  const handleTraderSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setVerified(true)
    window.setTimeout(() => {
      enterAsTrader()
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#f5f8f4] text-slate-900 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#dce8da] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/login" className="flex items-center gap-3 group" aria-label="KisanPulse home">
            <div className="relative grid size-10 place-items-center rounded-xl bg-[#1b4d1e] text-white shadow-[0_4px_14px_rgba(27,77,30,0.25)] transition group-hover:scale-105">
              <Wheat className="size-5.5" />
              <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-white bg-[#f59e0b]" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-[#1b4d1e] leading-none">
                Kisan<span className="text-[#f59e0b]">Pulse</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mt-1">
                Farmer & Buyer Intelligence Network
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#e9f7ed] px-3.5 py-1.5 text-xs font-semibold text-[#237138] border border-[#cbe8d2]">
              <ShieldCheck className="size-3.5" /> SerpApi Verified
            </div>
            <div className="flex items-center rounded-full border border-[#dce8da] bg-[#f8fbf7] p-0.5" aria-label="Select language">
              {(['en', 'hi', 'mr'] as Language[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setLanguage(item)}
                  className={cn(
                    'h-7.5 rounded-full px-3 text-xs font-bold transition-all',
                    language === item ? 'bg-[#1b4d1e] text-white shadow-xs' : 'text-slate-500 hover:text-[#1b4d1e]'
                  )}
                >
                  {item === 'en' ? 'English' : item === 'hi' ? 'हिंदी' : 'मराठी'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Symmetrical Split Layout */}
      <main className="flex-1 flex items-center">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Hero Column */}
            <section className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#eaf4e9] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2e7d32] border border-[#cce4cb]">
                {mode === 'otp' ? (
                  <>
                    <Sprout className="size-4" /> Built for Bharat&apos;s farmers
                  </>
                ) : (
                  <>
                    <Building2 className="size-4" /> Direct Agribusiness Procurement
                  </>
                )}
              </div>
              <h1 className="max-w-xl text-4xl xl:text-5xl font-black leading-[1.12] tracking-tight text-[#183b1d]">
                {mode === 'otp' ? t.welcomeFarmer : t.welcomeTrader}
              </h1>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-600">
                {mode === 'otp' ? t.subtitleFarmer : t.subtitleTrader}
              </p>

              {/* Value Proposition Cards */}
              <div className="mt-8 grid max-w-lg gap-3">
                {mode === 'otp'
                  ? [
                      { title: '100% Free for Indian Farmers', sub: 'Zero subscription, zero agent commission' },
                      { title: 'Real-Time APMC Mandi Rates', sub: 'Direct live feeds with true transport net yield' },
                      { title: 'Autonomous Bluff Detector', sub: 'Instant verification of trader claims before sale' },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start gap-3.5 rounded-xl border border-[#dce8da] bg-white/70 p-3.5 backdrop-blur-xs shadow-xs">
                        <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#eaf4e9] text-[#2e7d32]">
                          <Check className="size-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#1b4d1e] leading-snug">{item.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{item.sub}</div>
                        </div>
                      </div>
                    ))
                  : [
                      { title: 'Direct Farm-Gate Access', sub: 'Verified crop lots across 12 APMC districts' },
                      { title: 'SerpApi Market Radar', sub: 'Fair wholesale benchmarks with 7-day rate trends' },
                      { title: 'Distress Salvage Off-Take', sub: 'Instant routing for processing plants & cold storage' },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start gap-3.5 rounded-xl border border-[#dce8da] bg-white/70 p-3.5 backdrop-blur-xs shadow-xs">
                        <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#eaf4e9] text-[#2e7d32]">
                          <Check className="size-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#1b4d1e] leading-snug">{item.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{item.sub}</div>
                        </div>
                      </div>
                    ))}
              </div>
            </section>

            {/* Right Form Card Column */}
            <div className="lg:col-span-6 xl:col-span-5 flex justify-center">
              <Card className="w-full max-w-md rounded-2xl border-[#dce8da] bg-white shadow-[0_16px_45px_rgba(27,77,30,0.08)]">
                <CardHeader className="pb-4 pt-6 px-6 sm:px-8">
                  {/* Mode Tabs */}
                  <div className="mb-5 grid grid-cols-2 rounded-xl bg-[#f1f6f0] p-1 border border-[#e2ece0]">
                    <button
                      onClick={() => {
                        setMode('otp')
                        setError('')
                      }}
                      className={cn(
                        'h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5',
                        mode === 'otp' ? 'bg-white text-[#1b4d1e] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      )}
                    >
                      <Sprout className="size-3.5" />
                      Farmer / Seller
                    </button>
                    <button
                      onClick={() => {
                        setMode('trader')
                        setError('')
                      }}
                      className={cn(
                        'h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5',
                        mode === 'trader' ? 'bg-white text-[#1b4d1e] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      )}
                    >
                      <Building2 className="size-3.5" />
                      Trader / Buyer
                    </button>
                  </div>

                  <CardTitle className="text-2xl font-black text-[#183b1d]">
                    {mode === 'otp' ? t.cardTitleOtp : t.cardTitleTrader}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-1">
                    {mode === 'otp' ? t.cardDescOtp : t.cardDescTrader}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-6 pb-6 sm:px-8">
                  {mode === 'otp' ? (
                    <div className="flex flex-col gap-4">
                      <div>
                        <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
                          {t.phone}
                        </Label>
                        <div className="mt-1.5 flex h-12">
                          <div className="flex h-12 items-center rounded-l-xl border border-r-0 border-[#dce8da] bg-[#f8fbf7] px-3.5 text-sm font-bold text-[#315c35]">
                            +91
                          </div>
                          <Input
                            id="phone"
                            inputMode="numeric"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value.replace(/\D/g, ''))
                              setError('')
                            }}
                            placeholder="98765 43210"
                            className="h-12 rounded-l-none rounded-r-xl border-[#dce8da] bg-[#fbfdfb] text-base font-semibold tracking-wide"
                            disabled={sent}
                          />
                        </div>
                      </div>

                      {sent ? (
                        <div className="flex flex-col gap-4">
                          <div>
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-bold text-slate-700">{t.otpTitle}</Label>
                              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                {t.otpHint}
                              </span>
                            </div>
                            <div className="mt-2 grid grid-cols-6 gap-2">
                              {otp.map((digit, index) => (
                                <Input
                                  key={index}
                                  id={`otp-${index}`}
                                  aria-label={`OTP digit ${index + 1}`}
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => updateOtp(index, e.target.value)}
                                  className="h-12 px-0 text-center text-lg font-bold rounded-xl border-[#dce8da] bg-[#fbfdfb]"
                                />
                              ))}
                            </div>
                          </div>

                          <Button
                            onClick={verifyOtp}
                            className="h-12 w-full rounded-xl bg-[#2e7d32] text-sm font-bold text-white shadow-sm hover:bg-[#1b4d1e] transition-all flex items-center justify-center gap-2"
                          >
                            <ShieldCheck className="size-4" />
                            {verified ? t.verified : t.verify}
                          </Button>

                          <button
                            type="button"
                            onClick={() => setSent(false)}
                            className="flex h-9 items-center justify-center gap-1.5 text-xs font-bold text-[#2e7d32] hover:underline"
                          >
                            <RefreshCw className="size-3.5" />
                            {t.resend}
                          </button>
                        </div>
                      ) : (
                        <Button
                          onClick={sendOtp}
                          disabled={phone.length !== 10}
                          className="h-12 w-full rounded-xl bg-[#2e7d32] text-sm font-bold text-white shadow-sm hover:bg-[#1b4d1e] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Phone className="size-4" />
                          {t.send}
                          <ArrowRight className="size-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleTraderSubmit} className="flex flex-col gap-4">
                      <div>
                        <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                          {t.email}
                        </Label>
                        <Input
                          id="email"
                          value={traderEmail}
                          onChange={(e) => setTraderEmail(e.target.value)}
                          className="mt-1.5 h-12 rounded-xl border-[#dce8da] bg-[#fbfdfb]"
                          placeholder="trader@mandi.gov.in"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                          {t.password}
                        </Label>
                        <div className="relative mt-1.5">
                          <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="password"
                            type="password"
                            value={traderPassword}
                            onChange={(e) => setTraderPassword(e.target.value)}
                            className="h-12 rounded-xl border-[#dce8da] bg-[#fbfdfb] pl-10"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-600 select-none cursor-pointer">
                        <input type="checkbox" defaultChecked className="size-4 rounded accent-[#2e7d32]" />
                        {t.remember}
                      </label>
                      <Button
                        type="submit"
                        className="h-12 w-full rounded-xl bg-[#1b4d1e] text-sm font-bold text-white shadow-sm hover:bg-[#256628] transition-all flex items-center justify-center gap-2"
                      >
                        <UserCheck className="size-4" />
                        {verified ? 'Opening Buyer Portal…' : t.trader}
                      </Button>
                    </form>
                  )}

                  {error && (
                    <p role="alert" className="mt-4 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-bold text-red-700">
                      {error}
                    </p>
                  )}

                  <div className="my-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <div className="h-px flex-1 bg-[#e5ebe3]" />
                    or instant demo
                    <div className="h-px flex-1 bg-[#e5ebe3]" />
                  </div>

                  {mode === 'otp' ? (
                    <button
                      type="button"
                      onClick={enterAsFarmer}
                      className="flex h-12 w-full items-center justify-center rounded-xl border border-[#dce8da] bg-[#fff8e8] px-4 text-center text-xs font-bold text-[#8f5c0a] transition hover:bg-[#fff2d0] shadow-xs"
                    >
                      {t.guestFarmer}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={enterAsTrader}
                      className="flex h-12 w-full items-center justify-center rounded-xl border border-[#dce8da] bg-[#eef7ec] px-4 text-center text-xs font-bold text-[#1b4d1e] transition hover:bg-[#dff0dc] shadow-xs"
                    >
                      {t.guestTrader}
                    </button>
                  )}
                  <p className="mt-2 text-center text-[11px] font-medium text-slate-400">
                    {t.guestHint}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Unified Footer */}
      <footer className="border-t border-[#dce8da] bg-white/70 py-4 backdrop-blur-xs">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-center text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>KisanPulse gives you verified signals — the final decision stays with you.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Direct Farmer KYC</span>
            <span>•</span>
            <span>Agmarknet Verified APMC Rates</span>
            <span>•</span>
            <span>Zero Middleman Surcharge</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
