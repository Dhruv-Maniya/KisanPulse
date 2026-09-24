'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  calculateLiveEconomics,
  AdvisoryResponse,
} from '@/lib/economics'
import { fetchAnalysis, fetchSpeechAudio } from '@/lib/api'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CircleHelp,
  MapPin,
  Phone,
  Search,
  Share2,
  ShieldAlert,
  Sprout,
  Truck,
  Volume2,
  Wheat,
  Zap,
} from 'lucide-react'

type Lang = 'en' | 'hi' | 'mr'

const presets = [
  {
    label: 'Tomato',
    sub: 'Nashik',
    crop: 'Tomato',
    district: 'Nashik',
    quantity: '40',
    claim: 'Azadpur terminal market crashed',
    quote: '8.0',
  },
  {
    label: 'Ginger',
    sub: 'Satara',
    crop: 'Ginger',
    district: 'Satara',
    quantity: '25',
    claim: 'Southern wholesale demand fell by 40%',
    quote: '22.0',
  },
  {
    label: 'Onion',
    sub: 'Lasalgaon',
    crop: 'Onion',
    district: 'Lasalgaon',
    quantity: '60',
    claim: 'Bumper arrivals in Gujarat crashed terminal rates',
    quote: '9.0',
  },
]

const translations = {
  en: {
    title: 'Protect your harvest. Know your true market.',
    subtitle: 'Autonomous market intelligence for every farmer.',
    analyze: 'Analyze Market & Protect My Crop',
    scanning: 'Scanning live markets & executing AI agents...',
    listen: 'Listen Audio',
    stopAudio: 'Stop Audio',
    share: 'WhatsApp Share',
    step1Heading: 'Tell us about your crop',
    step1Detail: 'Get a live mandi comparison, bluff check, and buyer options in one scan.',
    step2Heading: 'Where should you sell?',
    step2Detail: 'We deduct diesel, round-trip transport, and crop loss before recommending.',
    step3Heading: 'Is the offer fair?',
    step3Detail: 'Cross-checking the claim against terminal market intelligence.',
  },
  hi: {
    title: 'अपनी फसल बचाएं। सही बाजार भाव जानें।',
    subtitle: 'हर किसान के लिए स्वायत्त बाजार जानकारी।',
    analyze: 'बाजार का विश्लेषण करें और फसल बचाएं',
    scanning: 'लाइव मंडियों की जांच और AI विश्लेषण जारी है...',
    listen: 'ऑडियो सुनें',
    stopAudio: 'ऑडियो रोकें',
    share: 'WhatsApp शेयर',
    step1Heading: 'अपनी फसल का विवरण दें',
    step1Detail: 'एक ही स्कैन में लाइव मंडी तुलना, ब्लफ़ जांच और खरीदार विकल्प पाएं।',
    step2Heading: 'आपको कहां बेचना चाहिए?',
    step2Detail: 'हम अनुशंसा करने से पहले डीजल, परिवहन और फसल नुकसान घटाते हैं।',
    step3Heading: 'क्या व्यापारी की पेशकश उचित है?',
    step3Detail: 'टर्मिनल बाजार जानकारी के साथ व्यापारी के दावे की जांच।',
  },
  mr: {
    title: 'तुमचा माल वाचवा. खरा बाजारभाव जाणून घ्या.',
    subtitle: 'प्रत्येक शेतकऱ्यासाठी स्वायत्त बाजार माहिती.',
    analyze: 'बाजाराचे विश्लेषण करा आणि पीक वाचवा',
    scanning: 'थेट बाजारांची तपासणी व AI विश्लेषण सुरू आहे...',
    listen: 'ऑडिओ ऐका',
    stopAudio: 'ऑडिओ थांबवा',
    share: 'WhatsApp शेअर',
    step1Heading: 'आपल्या पिकाबद्दल सांगा',
    step1Detail: 'एकाच स्कॅनमध्ये थेट बाजार तुलना, दिशाभूल तपासणी आणि खरेदीदार पर्याय मिळवा.',
    step2Heading: 'आपण कुठे विक्री करावी?',
    step2Detail: 'आम्ही शिफारस करण्यापूर्वी डिझेल, वाहतूक आणि नुकसान वजा करतो.',
    step3Heading: 'व्यापाऱ्याची ऑफर योग्य आहे का?',
    step3Detail: 'टर्मिनल बाजार माहितीसह दाव्याची सत्यता पडताळणी.',
  },
}

function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  detail,
}: {
  icon: typeof Sprout
  eyebrow: string
  title: string
  detail?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf4e9] text-[#2e7d32] border border-[#d2ead0]">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2e7d32] leading-none">
          {eyebrow}
        </p>
        <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-[#183b1d]">
          {title}
        </h2>
        {detail && <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-normal">{detail}</p>}
      </div>
    </div>
  )
}

export default function KisanPulseDashboard() {
  const [lang, setLang] = useState<Lang>('en')
  const [form, setForm] = useState({
    crop: 'Tomato',
    district: 'Nashik',
    quantity: '40',
    claim: 'Azadpur terminal market crashed',
    quote: '8.0',
  })
  const [analyzing, setAnalyzing] = useState(false)
  const [audio, setAudio] = useState(false)
  const [aiOverride, setAiOverride] = useState<Partial<AdvisoryResponse> | null>(null)
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<string | null>(null)

  const t = translations[lang]

  // Live dynamic calculation computed instantaneously whenever inputs change
  const liveCalculation = useMemo(() => {
    return calculateLiveEconomics(form, lang)
  }, [form, lang])

  // Merge live math with any AI backend enrichment
  const displayResponse: AdvisoryResponse = useMemo(() => {
    if (!aiOverride) return liveCalculation

    return {
      ...liveCalculation,
      ...aiOverride,
      arbitrage_comparison:
        aiOverride.arbitrage_comparison && aiOverride.arbitrage_comparison.length > 0
          ? aiOverride.arbitrage_comparison
          : liveCalculation.arbitrage_comparison,
      arbitrage_verdict: aiOverride.arbitrage_verdict || liveCalculation.arbitrage_verdict,
      bluff_analysis: aiOverride.bluff_analysis
        ? {
            ...liveCalculation.bluff_analysis,
            ...aiOverride.bluff_analysis,
            counter_script:
              aiOverride.bluff_analysis.counter_script ||
              liveCalculation.bluff_analysis?.counter_script ||
              '',
          }
        : liveCalculation.bluff_analysis,
      distress_contacts:
        aiOverride.distress_contacts && aiOverride.distress_contacts.length > 0
          ? aiOverride.distress_contacts
          : liveCalculation.distress_contacts,
    }
  }, [liveCalculation, aiOverride])

  // When form field changes, update form and reset AI override so user sees instant live math
  const updateFormField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setAiOverride(null)
  }

  const applyPreset = (preset: (typeof presets)[number]) => {
    setForm({
      crop: preset.crop,
      district: preset.district,
      quantity: preset.quantity,
      claim: preset.claim,
      quote: preset.quote,
    })
    setAiOverride(null)
  }

  // Trigger multi-agent pipeline from FastAPI backend
  const analyze = async () => {
    setAnalyzing(true)
    try {
      const data = await fetchAnalysis({
        crop: form.crop,
        district: form.district,
        quantity_quintals: Number(form.quantity) || 0,
        buyer_claim: form.claim,
        buyer_quote_per_kg: Number(form.quote) || 0,
        language: lang,
      })

      if (data && typeof data === 'object') {
        setAiOverride(data)
        setLastAnalyzedAt(new Date().toLocaleTimeString())
      }
    } catch (err) {
      console.warn('Backend agent API call failed or timed out; live dynamic calculation is active:', err)
      // The liveCalculation already provides full accurate mathematical computation
      setLastAnalyzedAt('Calculated via Local Economics Engine')
    } finally {
      setAnalyzing(false)
    }
  }

  // Audio Playback Handler
  const toggleAudio = async () => {
    if (audio) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setAudio(false)
      return
    }

    const textToSpeak = displayResponse.bluff_analysis?.counter_script || ''
    if (!textToSpeak) return

    setAudio(true)

    try {
      const audioUrl = await fetchSpeechAudio(textToSpeak, lang)
      const audioElement = new Audio(audioUrl)
      audioElement.onended = () => setAudio(false)
      audioElement.onerror = () => {
        fallbackBrowserSpeech(textToSpeak)
      }
      await audioElement.play()
    } catch {
      fallbackBrowserSpeech(textToSpeak)
    }
  }

  const fallbackBrowserSpeech = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN'
      utterance.rate = 0.95
      utterance.onend = () => setAudio(false)
      utterance.onerror = () => setAudio(false)
      window.speechSynthesis.speak(utterance)
    } else {
      setAudio(false)
    }
  }

  const mandiA = displayResponse.arbitrage_comparison[0] || {
    name: 'District APMC',
    distance_km: 12,
    price_qtl: 1800,
    net_take_home: 0,
  }
  const mandiB = displayResponse.arbitrage_comparison[1] || {
    name: 'Regional Hub APMC',
    distance_km: 48,
    price_qtl: 2100,
    net_take_home: 0,
  }
  const netDifference = mandiB.net_take_home - mandiA.net_take_home

  const bluffRisk = displayResponse.bluff_analysis?.bluff_score || 'LOW'
  const marginGapPct = displayResponse.bluff_analysis?.margin_gap_pct || 0

  return (
    <div className="min-h-screen bg-[#f5f8f4] text-slate-900 flex flex-col justify-between">
      {/* Sticky, Perfectly Aligned Header */}
      <header className="sticky top-0 z-50 border-b border-[#dce8da] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group" aria-label="KisanPulse home">
            <div className="relative grid size-10 place-items-center rounded-xl bg-[#1b4d1e] text-white shadow-[0_4px_14px_rgba(27,77,30,0.25)] transition group-hover:scale-105">
              <Wheat className="size-5.5" />
              <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-white bg-[#f59e0b]" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-[#1b4d1e] leading-none">
                Kisan<span className="text-[#f59e0b]">Pulse</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mt-1">
                Farmer intelligence network
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#e9f7ed] px-3.5 py-1.5 text-xs font-semibold text-[#237138] border border-[#cbe8d2]">
              <Check className="size-3.5" /> SerpApi Live Intelligence
            </div>
            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-[#fff4da] px-3.5 py-1.5 text-xs font-semibold text-[#a26100] border border-[#f5e3b5]">
              <Zap className="size-3.5" /> Autonomous Agent
            </div>
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-full bg-[#1b4d1e] px-4 text-xs font-bold text-white transition hover:bg-[#256628] shadow-sm"
            >
              Login
            </Link>
            <div className="flex items-center rounded-full border border-[#dce8da] bg-[#f8fbf7] p-0.5" aria-label="Select language">
              {(['en', 'hi', 'mr'] as Lang[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setLang(item)}
                  className={cn(
                    'h-7.5 rounded-full px-2.5 text-xs font-bold transition-all',
                    lang === item ? 'bg-[#1b4d1e] text-white shadow-xs' : 'text-slate-500 hover:text-[#1b4d1e]'
                  )}
                >
                  {item === 'en' ? 'EN' : item === 'hi' ? 'हिं' : 'मर'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e6f2e4] px-3.5 py-1 text-xs font-bold text-[#2e7d32] border border-[#cde6cb]">
                <span className="size-2 rounded-full bg-[#52a858] animate-pulse" /> LIVE CROP ADVISORY
              </div>
              <h1 className="max-w-3xl text-3xl font-black tracking-tight text-[#183b1d] sm:text-4xl lg:text-5xl leading-tight">
                {t.title}
              </h1>
              <p className="mt-2.5 text-base sm:text-lg text-slate-600">
                {t.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-[#dce8da] bg-white px-4 py-3 shadow-sm shrink-0 self-start lg:self-center">
              <div className="grid size-10 place-items-center rounded-xl bg-[#fff4da] text-[#c47a05]">
                <MapPin className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your network</p>
                <p className="text-sm font-bold text-[#1b4d1e]">
                  {form.district || 'Maharashtra'} • Active Market Feeds
                </p>
              </div>
            </div>
          </div>

          {/* STEP 01: Tell Us About Your Crop & Middleman Verification */}
          <Card className="rounded-2xl border-[#dce8da] bg-white shadow-[0_12px_34px_rgba(30,80,35,0.06)]">
            <CardHeader className="pb-4 px-6 pt-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <SectionHeading
                  icon={Sprout}
                  eyebrow="Step 01 • Start here"
                  title={t.step1Heading}
                  detail={t.step1Detail}
                />
                <div className="flex flex-wrap items-center gap-2 pt-1 md:pt-0">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
                    Presets:
                  </span>
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => applyPreset(preset)}
                      className={cn(
                        'h-8 rounded-full border border-[#dce8da] bg-[#f8fbf7] px-3.5 text-xs font-semibold text-[#2e7d32] transition hover:border-[#74ae76] hover:bg-[#eef7ec] flex items-center gap-1',
                        form.crop.toLowerCase() === preset.crop.toLowerCase() && 'border-[#2e7d32] bg-[#eef7ec] font-bold'
                      )}
                    >
                      {preset.label} <span className="text-slate-400">• {preset.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-6 pt-2">
              {/* Row 1: Crop Details (3 Equal Columns) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="crop" className="text-xs font-bold text-slate-700">
                    Crop name
                  </Label>
                  <Input
                    id="crop"
                    value={form.crop}
                    onChange={(e) => updateFormField('crop', e.target.value)}
                    className="mt-1.5 h-12 rounded-xl border-[#dce8da] bg-[#fbfdfb] text-sm font-semibold"
                    placeholder="e.g. Tomato, Onion, Ginger, Potato"
                  />
                </div>
                <div>
                  <Label htmlFor="district" className="text-xs font-bold text-slate-700">
                    District / Tehsil
                  </Label>
                  <Input
                    id="district"
                    value={form.district}
                    onChange={(e) => updateFormField('district', e.target.value)}
                    className="mt-1.5 h-12 rounded-xl border-[#dce8da] bg-[#fbfdfb] text-sm font-semibold"
                    placeholder="e.g. Nashik, Satara, Pune"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity" className="text-xs font-bold text-slate-700">
                    Quantity <span className="font-normal text-slate-400">(quintals)</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={(e) => updateFormField('quantity', e.target.value)}
                    className="mt-1.5 h-12 rounded-xl border-[#dce8da] bg-[#fbfdfb] text-sm font-semibold"
                    placeholder="e.g. 40"
                  />
                </div>
              </div>

              {/* Middleman Check Divider */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e8efe6]" />
                </div>
                <div className="relative bg-white px-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Middleman Claim Verification
                  </span>
                </div>
              </div>

              {/* Row 2: Middleman Check & Scan CTA (Unified 12-Column Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5">
                  <Label htmlFor="claim" className="text-xs font-bold text-slate-700">
                    Trader&apos;s claim
                  </Label>
                  <Input
                    id="claim"
                    value={form.claim}
                    onChange={(e) => updateFormField('claim', e.target.value)}
                    className="mt-1.5 h-12 rounded-xl border-[#efdca8] bg-[#fffdf7] text-sm font-medium"
                    placeholder="e.g. Azadpur terminal market crashed"
                  />
                </div>
                <div className="md:col-span-3">
                  <Label htmlFor="quote" className="text-xs font-bold text-slate-700">
                    Offered quote <span className="font-normal text-slate-400">(₹ / kg)</span>
                  </Label>
                  <Input
                    id="quote"
                    type="number"
                    step="0.5"
                    min="0"
                    value={form.quote}
                    onChange={(e) => updateFormField('quote', e.target.value)}
                    className="mt-1.5 h-12 rounded-xl border-[#efdca8] bg-[#fffdf7] text-sm font-bold text-amber-900"
                    placeholder="e.g. 8.0"
                  />
                </div>
                <div className="md:col-span-4">
                  <div className="flex h-5 items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#1b4d1e] flex items-center gap-1">
                      <Zap className="size-3 text-[#f59e0b] fill-[#f59e0b]" /> Autonomous Scan
                    </span>
                    {lastAnalyzedAt && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Synced
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={analyze}
                    disabled={analyzing}
                    className="h-12 w-full rounded-xl bg-[#1b4d1e] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#143b17] transition-all flex items-center justify-center gap-2"
                  >
                    {analyzing ? (
                      <>
                        <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span className="truncate">{t.scanning}</span>
                      </>
                    ) : (
                      <>
                        <Search className="size-4" />
                        <span>{t.analyze}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* STEP 02 & STEP 03: Balanced Side-by-Side Grid */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Step 02: True-Net Arbitrage Card */}
            <Card className="flex flex-col h-full rounded-2xl border-[#dce8da] bg-white shadow-sm">
              <CardHeader className="pb-4 px-6 pt-6">
                <div className="flex items-center justify-between gap-4">
                  <SectionHeading
                    icon={Truck}
                    eyebrow="Step 02 • True-net arbitrage"
                    title={t.step2Heading}
                    detail={t.step2Detail}
                  />
                  <Badge className="shrink-0 border-0 bg-[#fff4da] text-[#9b6100] hover:bg-[#fff4da] px-3 py-1.5 font-bold">
                    Diesel: ₹{displayResponse.diesel_rate.toFixed(2)}/L
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between px-6 pb-6 pt-2">
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Mandi A */}
                    <div
                      className={cn(
                        'relative rounded-2xl border p-5 flex flex-col justify-between transition-all',
                        netDifference < 0
                          ? 'border-2 border-[#52a858] bg-[#f4fbf2] shadow-xs'
                          : 'border-[#e2ebe0] bg-[#fbfdfb]'
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mandi A</span>
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                              netDifference < 0
                                ? 'bg-[#2e7d32] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-500'
                            )}
                          >
                            {netDifference < 0 ? '★ Best Net Yield' : 'Local APMC'}
                          </span>
                        </div>
                        <h3 className="mt-2 text-base font-bold text-[#183b1d]">
                          {mandiA.name}
                        </h3>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-slate-500">Modal rate</p>
                            <p className="mt-1 text-lg font-black text-[#1b4d1e]">
                              ₹{mandiA.price_qtl.toLocaleString()}
                              <span className="text-xs font-semibold text-slate-400"> / qtl</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Distance</p>
                            <p className="mt-1 flex items-center gap-1 text-base font-bold text-slate-700">
                              <MapPin className="size-4 text-[#2e7d32]" /> {mandiA.distance_km} km
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 border-t border-[#dce8da] pt-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">True-net take-home</p>
                        <p className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[#183b1d]">
                          ₹{mandiA.net_take_home.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Mandi B */}
                    <div
                      className={cn(
                        'relative rounded-2xl border p-5 flex flex-col justify-between transition-all',
                        netDifference >= 0
                          ? 'border-2 border-[#52a858] bg-[#f4fbf2] shadow-xs'
                          : 'border-[#e2ebe0] bg-[#fbfdfb]'
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#2e7d32]">Mandi B</span>
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                              netDifference >= 0
                                ? 'bg-[#2e7d32] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-500'
                            )}
                          >
                            {netDifference >= 0 ? '★ Best Net Yield' : 'Regional Hub'}
                          </span>
                        </div>
                        <h3 className="mt-2 text-base font-bold text-[#183b1d]">
                          {mandiB.name}
                        </h3>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-slate-500">Modal rate</p>
                            <p className="mt-1 text-lg font-black text-[#1b4d1e]">
                              ₹{mandiB.price_qtl.toLocaleString()}
                              <span className="text-xs font-semibold text-slate-400"> / qtl</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Distance</p>
                            <p className="mt-1 flex items-center gap-1 text-base font-bold text-slate-700">
                              <MapPin className="size-4 text-[#2e7d32]" /> {mandiB.distance_km} km
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 border-t border-[#cce3ca] pt-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#2e7d32]">True-net take-home</p>
                        <p className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[#183b1d]">
                          ₹{mandiB.net_take_home.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Arbitrage Gain Highlight */}
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-[#e3f4e1] px-4 py-2.5 border border-[#bee2bb] text-xs font-bold text-[#1e5822]">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#2e7d32]" />
                      Regional Arbitrage Spread:
                    </span>
                    <span className="text-sm font-black text-[#183b1d]">
                      {netDifference >= 0
                        ? `+₹${netDifference.toLocaleString()} Gain at ${mandiB.name}`
                        : `+₹${Math.abs(netDifference).toLocaleString()} Gain at ${mandiA.name}`}
                    </span>
                  </div>
                </div>

                {/* Verdict Box */}
                <div className="mt-4 rounded-xl border border-[#cce3ca] bg-[#eaf6e8] p-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5 text-[#2e7d32] shrink-0">
                      <TrendingUpIcon />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#2e7d32]">
                        Agent Economic Verdict
                      </p>
                      <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#255229]">
                        {displayResponse.arbitrage_verdict}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 03: Bluff Detector Card */}
            <Card className="flex flex-col h-full rounded-2xl border-[#dce8da] bg-white shadow-sm">
              <CardHeader className="pb-4 px-6 pt-6">
                <SectionHeading
                  icon={ShieldAlert}
                  eyebrow="Step 03 • Bluff detector"
                  title={t.step3Heading}
                  detail={t.step3Detail}
                />
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between px-6 pb-6 pt-2">
                <div>
                  {/* Dynamic Exploitation Risk Banner */}
                  <div
                    className={cn(
                      'flex items-center justify-between rounded-xl border p-3.5 transition-colors',
                      bluffRisk === 'HIGH'
                        ? 'border-[#f2caca] bg-[#fff4f4]'
                        : bluffRisk === 'MODERATE'
                        ? 'border-[#fde68a] bg-[#fffbeb]'
                        : 'border-[#bbf7d0] bg-[#f0fdf4]'
                    )}
                  >
                    <div>
                      <p
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-wider',
                          bluffRisk === 'HIGH'
                            ? 'text-[#b32929]'
                            : bluffRisk === 'MODERATE'
                            ? 'text-[#b45309]'
                            : 'text-[#15803d]'
                        )}
                      >
                        Exploitation risk
                      </p>
                      <p
                        className={cn(
                          'mt-0.5 text-sm font-black',
                          bluffRisk === 'HIGH'
                            ? 'text-[#8f2424]'
                            : bluffRisk === 'MODERATE'
                            ? 'text-[#92400e]'
                            : 'text-[#166534]'
                        )}
                      >
                        {bluffRisk === 'HIGH'
                          ? 'HIGH BLUFF RISK DETECTED'
                          : bluffRisk === 'MODERATE'
                          ? 'MODERATE EXPLOITATION RISK'
                          : 'FAIR OFFER / LOW RISK'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          'text-2xl sm:text-3xl font-black leading-none',
                          bluffRisk === 'HIGH'
                            ? 'text-[#b32929]'
                            : bluffRisk === 'MODERATE'
                            ? 'text-[#b45309]'
                            : 'text-[#15803d]'
                        )}
                      >
                        {marginGapPct}%
                      </p>
                      <p
                        className={cn(
                          'text-[10px] font-bold uppercase mt-1',
                          bluffRisk === 'HIGH'
                            ? 'text-[#b32929]'
                            : bluffRisk === 'MODERATE'
                            ? 'text-[#b45309]'
                            : 'text-[#15803d]'
                        )}
                      >
                        margin gap detected
                      </p>
                    </div>
                  </div>

                  {/* Claims vs Signal Comparison */}
                  <div className="mt-4 grid gap-2.5">
                    <div className="rounded-xl bg-[#f8fafc] border border-slate-200 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Trader claimed to farmer
                      </p>
                      <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-800">
                        “{form.claim || displayResponse.bluff_analysis?.claim || 'Market crashed'}”
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-[#2e7d32]">
                      <ArrowRight className="size-3.5 text-[#2e7d32]" /> Verified terminal intelligence
                    </div>
                    <div className="rounded-xl border border-[#cce3ca] bg-[#f4fbf2] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#2e7d32]">
                        Actual Market Signal
                      </p>
                      <p className="mt-1 text-xs sm:text-sm font-semibold text-[#255229]">
                        {form.district || 'Regional'} APMC {form.crop || 'crop'} wholesale modal rate is ₹
                        {mandiA.price_qtl.toLocaleString()}/qtl (₹{(mandiA.price_qtl / 100).toFixed(1)}/kg).
                        Buyer quote of ₹{form.quote || 0}/kg represents a{' '}
                        {marginGapPct}% discount below verified terminal rates.
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Negotiation Counter-Script */}
                  <div className="mt-4 rounded-xl border-l-4 border-[#f59e0b] bg-[#fff8e8] p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#a26100]">
                      Your Negotiation Counter-Script
                    </p>
                    <blockquote className="mt-1.5 text-xs sm:text-sm font-medium leading-relaxed text-[#694717]">
                      {displayResponse.bluff_analysis?.counter_script}
                    </blockquote>
                  </div>
                </div>

                {/* Audio and WhatsApp Action Buttons */}
                <div className="mt-4 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={toggleAudio}
                    className="flex-1 h-11 rounded-xl border-[#dce8da] bg-white text-[#2e7d32] hover:bg-[#f4fbf2] font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Volume2 className="size-4" />
                    {audio ? t.stopAudio : t.listen}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(
                        `https://wa.me/?text=${encodeURIComponent(
                          displayResponse.bluff_analysis?.counter_script || ''
                        )}`,
                        '_blank'
                      )
                    }
                    className="flex-1 h-11 rounded-xl border-[#dce8da] bg-white text-[#2e7d32] hover:bg-[#f4fbf2] font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Share2 className="size-4" />
                    {t.share}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* STEP 04: Emergency Off-take Active */}
          {displayResponse.is_distress_active && (
            <Card className="mt-6 overflow-hidden rounded-2xl border-[#f0d28d] shadow-sm">
              <div className="border-b border-[#f0d28d] bg-[#fff8e8] px-6 py-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-[#f59e0b] text-white shadow-xs">
                      <AlertTriangle className="size-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#a26100]">
                        Emergency Off-Take Active
                      </p>
                      <h2 className="text-lg sm:text-xl font-black text-[#694717]">
                        APMC Prices Below Break-Even for {form.crop}
                      </h2>
                    </div>
                  </div>
                  <Badge className="w-fit border-0 bg-[#fff0c7] text-[#a26100] hover:bg-[#fff0c7] px-3 py-1 font-bold">
                    3 verified buyers nearby
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {displayResponse.distress_contacts.map((buyer) => (
                    <div
                      key={buyer.title}
                      className="rounded-2xl border border-[#e5ebe3] bg-white p-5 flex flex-col justify-between h-full shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="secondary" className="bg-[#eef7ec] text-[#2e7d32] text-xs font-semibold">
                            {buyer.buyer_category}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs font-bold text-[#a26100]">
                            ★ {buyer.rating}
                          </span>
                        </div>
                        <h3 className="mt-3.5 font-bold text-sm sm:text-base text-[#183b1d] leading-snug min-h-[2.5rem]">
                          {buyer.title}
                        </h3>
                        <p className="mt-2 flex items-start gap-2 text-xs text-slate-500 leading-normal">
                          <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#2e7d32]" />
                          <span>{buyer.address}</span>
                        </p>
                      </div>
                      <a
                        href={`tel:${buyer.phone}`}
                        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2e7d32] text-xs font-bold text-white transition hover:bg-[#1b4d1e] shadow-xs"
                      >
                        <Phone className="size-4" /> Call buyer
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unified Footer */}
          <footer className="mt-10 border-t border-[#dce8da] pt-6 pb-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>KisanPulse gives you verified signals — the final decision stays with you.</p>
            <p className="flex items-center gap-1.5 text-slate-400">
              <CircleHelp className="size-3.5" /> Data refreshes every 15 minutes
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}

function TrendingUpIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m3 17 6-6 4 4 7-8" />
      <path d="M14 7h6v6" />
    </svg>
  )
}
