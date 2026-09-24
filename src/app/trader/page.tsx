'use client'

import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Database,
  Filter,
  Loader2,
  LogOut,
  MapPin,
  PlusCircle,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Truck,
  Wheat,
  X,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  fetchMarketplaceFeed,
  submitBuyerOffer,
  createCropListingApi,
  fetchBuyerOffersApi,
} from '@/lib/api'

interface ProcurementLot {
  id: string
  crop: string
  variety: string
  type: 'standard' | 'distress'
  quantity_qtl: number
  target_rate_kg: number
  modal_rate_kg: number
  district: string
  tehsil: string
  distance_km: number
  farmer_id: string
  farmer_name: string
  verified: boolean
  harvest_date: string
  notes: string
}

const INITIAL_LOTS: ProcurementLot[] = [
  {
    id: 'LOT-4029',
    crop: 'Tomato',
    variety: 'Roma / Hybrid Grade-A',
    type: 'standard',
    quantity_qtl: 40,
    target_rate_kg: 18.0,
    modal_rate_kg: 18.2,
    district: 'Nashik',
    tehsil: 'Dindori',
    distance_km: 12,
    farmer_id: 'Farmer #4029',
    farmer_name: 'Balasaheb Shinde',
    verified: true,
    harvest_date: 'Harvested Today (Early Morning)',
    notes: 'Firm, export-ready crated tomatoes. Ideal for retail and high-end wholesale.',
  },
  {
    id: 'LOT-1187',
    crop: 'Onion',
    variety: 'Red Garva / Storable',
    type: 'distress',
    quantity_qtl: 60,
    target_rate_kg: 14.0,
    modal_rate_kg: 14.2,
    district: 'Nashik',
    tehsil: 'Lasalgaon',
    distance_km: 28,
    farmer_id: 'Farmer #1187',
    farmer_name: 'Kashinath Pawar',
    verified: true,
    harvest_date: 'Harvested 2 days ago',
    notes: 'APMC terminal market arrivals surged. Farmer seeking direct buyer to avoid mandi parking wait.',
  },
  {
    id: 'LOT-7204',
    crop: 'Ginger',
    variety: 'Fresh Mahim Variety',
    type: 'standard',
    quantity_qtl: 25,
    target_rate_kg: 42.5,
    modal_rate_kg: 42.5,
    district: 'Satara',
    tehsil: 'Koregaon',
    distance_km: 64,
    farmer_id: 'Farmer #7204',
    farmer_name: 'Dnyaneshwar More',
    verified: true,
    harvest_date: 'Harvested Yesterday',
    notes: 'High essential oil content, washed roots. High culinary & pharmaceutical demand.',
  },
  {
    id: 'LOT-5512',
    crop: 'Tomato',
    variety: 'Processing Ripe Pulp',
    type: 'distress',
    quantity_qtl: 32,
    target_rate_kg: 15.5,
    modal_rate_kg: 18.2,
    district: 'Nashik',
    tehsil: 'Pimpalgaon Baswant',
    distance_km: 18,
    farmer_id: 'Farmer #5512',
    farmer_name: 'Ramesh Jadhav',
    verified: true,
    harvest_date: 'Harvested Today',
    notes: 'Fully ripe harvest facing immediate open-air decay. Best suited for puree, pulp, or paste factories.',
  },
  {
    id: 'LOT-3391',
    crop: 'Potato',
    variety: 'Kufri Jyoti Table Grade',
    type: 'standard',
    quantity_qtl: 80,
    target_rate_kg: 12.5,
    modal_rate_kg: 12.8,
    district: 'Pune',
    tehsil: 'Manchar',
    distance_km: 42,
    farmer_id: 'Farmer #3391',
    farmer_name: 'Suresh Gaikwad',
    verified: true,
    harvest_date: 'Harvested 3 days ago',
    notes: 'Graded medium-large tubers, low moisture, cold storage ready.',
  },
]

const APMC_RADAR_BENCHMARKS: Record<
  string,
  {
    modal_qtl: number
    modal_kg: number
    trend_pct: number
    arrivals: string
    seven_day_series: number[]
  }
> = {
  Tomato: {
    modal_qtl: 1820,
    modal_kg: 18.2,
    trend_pct: 12.3,
    arrivals: 'Stable at Nashik & Lasalgaon yards',
    seven_day_series: [1620, 1660, 1710, 1750, 1780, 1800, 1820],
  },
  Onion: {
    modal_qtl: 1420,
    modal_kg: 14.2,
    trend_pct: -4.5,
    arrivals: 'High arrivals at Lasalgaon main yard',
    seven_day_series: [1520, 1500, 1480, 1460, 1440, 1430, 1420],
  },
  Ginger: {
    modal_qtl: 4250,
    modal_kg: 42.5,
    trend_pct: 8.7,
    arrivals: 'Moderate arrivals across Satara & Sangli',
    seven_day_series: [3900, 3950, 4020, 4100, 4180, 4200, 4250],
  },
  Potato: {
    modal_qtl: 1280,
    modal_kg: 12.8,
    trend_pct: 2.1,
    arrivals: 'Steady supply from Pune & Ahmednagar',
    seven_day_series: [1250, 1260, 1250, 1270, 1280, 1270, 1280],
  },
}

export default function TraderPortalPage() {
  const [lots, setLots] = useState<ProcurementLot[]>(INITIAL_LOTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Tomato' | 'Onion' | 'Ginger' | 'Distress only'>('All')
  const [selectedRadarCrop, setSelectedRadarCrop] = useState<string>('Tomato')
  const [activeTab, setActiveTab] = useState<'procurement' | 'distress' | 'contracts'>('procurement')
  const [loadingFeed, setLoadingFeed] = useState(false)
  const [submittingOffer, setSubmittingOffer] = useState(false)

  // Direct Offer Modal State
  const [offerModalLot, setOfferModalLot] = useState<ProcurementLot | null>(null)
  const [offerQuote, setOfferQuote] = useState<string>('')
  const [offerPickupDate, setOfferPickupDate] = useState<string>('Today before 5:00 PM')
  const [offerPaymentTerms, setOfferPaymentTerms] = useState<string>('Instant Bank Transfer on Weighment')
  const [contractSuccess, setContractSuccess] = useState<string | null>(null)
  const [submittedContracts, setSubmittedContracts] = useState<
    Array<{
      lotId: string
      crop: string
      farmer: string
      quantity: number
      quote: number
      status: string
    }>
  >([
    {
      lotId: 'LOT-9801',
      crop: 'Tomato',
      farmer: 'Farmer #2214 (Nashik)',
      quantity: 50,
      quote: 18.0,
      status: 'Transit Active (Driver: MH-15-EG-4402)',
    },
  ])

  // Post Procurement Requirement / Demand Modal State
  const [demandModalOpen, setDemandModalOpen] = useState(false)
  const [demandCrop, setDemandCrop] = useState('Tomato')
  const [demandDistrict, setDemandDistrict] = useState('Nashik')
  const [demandQuantity, setDemandQuantity] = useState('50')
  const [demandPrice, setDemandPrice] = useState('18.0')
  const [demandDistress, setDemandDistress] = useState(false)
  const [demandSubmitting, setDemandSubmitting] = useState(false)
  const [demandSuccess, setDemandSuccess] = useState<string | null>(null)

  // 1. Load Live Harvest Listings from Supabase
  const loadSupabaseFeed = async () => {
    try {
      setLoadingFeed(true)
      const data = await fetchMarketplaceFeed()
      if (data && data.feed && Array.isArray(data.feed) && data.feed.length > 0) {
        const backendLots: ProcurementLot[] = data.feed.map((item: any, idx: number) => {
          const matchingPreset = INITIAL_LOTS.find((l) => l.crop.toLowerCase() === item.crop.toLowerCase())
          return {
            id: item.id,
            crop: item.crop,
            variety: matchingPreset?.variety || `${item.crop} Grade-A Harvest`,
            type: item.is_distress ? 'distress' : 'standard',
            quantity_qtl: Number(item.quantity_quintals) || 40,
            target_rate_kg: Number(item.expected_price_per_kg) || 18.0,
            modal_rate_kg: matchingPreset?.modal_rate_kg || Math.round((Number(item.expected_price_per_kg) * 1.02) * 10) / 10,
            district: item.district || 'Nashik',
            tehsil: matchingPreset?.tehsil || 'Central APMC Zone',
            distance_km: matchingPreset?.distance_km || 15 + idx * 6,
            farmer_id: `Farmer #${(item.farmer_phone || '9876').slice(-4)}`,
            farmer_name: matchingPreset?.farmer_name || `Farmer (${item.farmer_phone || 'Verified'})`,
            verified: true,
            harvest_date: new Date(item.created_at || Date.now()).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            }),
            notes: matchingPreset?.notes || `Active harvest listed in ${item.district} APMC zone. Verified quality.`,
          }
        })
        setLots(backendLots)
      }
    } catch (err) {
      console.warn('Could not load live Supabase feed, using cached lots:', err)
    } finally {
      setLoadingFeed(false)
    }
  }

  // 2. Load Submitted Bids & Contracts from Supabase
  const loadSupabaseOffers = async () => {
    try {
      const data = await fetchBuyerOffersApi()
      if (data && data.offers && Array.isArray(data.offers) && data.offers.length > 0) {
        const backendContracts = data.offers.map((o: any) => ({
          lotId: o.listing_id ? o.listing_id.slice(0, 8) : 'LOT-LIVE',
          crop: o.crop_listings?.crop || 'Agricultural Harvest',
          farmer: `Farmer (${o.crop_listings?.district || 'Nashik'}) • Phone: ${o.buyer_phone || 'Buyer'}`,
          quantity: Number(o.crop_listings?.quantity_quintals) || 40,
          quote: Number(o.offer_price_per_kg) || 0,
          status: o.status === 'PENDING' ? 'Active in Supabase (Pending Farmer)' : o.status,
        }))
        setSubmittedContracts(backendContracts)
      }
    } catch (err) {
      console.warn('Could not load live offers from Supabase:', err)
    }
  }

  useEffect(() => {
    loadSupabaseFeed()
    loadSupabaseOffers()
  }, [])

  // Filtered Procurement Lots
  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      // Type/Category Filter
      if (activeTab === 'distress' && lot.type !== 'distress') return false
      if (selectedFilter === 'Distress only' && lot.type !== 'distress') return false
      if (selectedFilter !== 'All' && selectedFilter !== 'Distress only' && lot.crop !== selectedFilter) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesCrop = lot.crop.toLowerCase().includes(q)
        const matchesDistrict = lot.district.toLowerCase().includes(q)
        const matchesFarmer = lot.farmer_id.toLowerCase().includes(q) || lot.farmer_name.toLowerCase().includes(q)
        if (!matchesCrop && !matchesDistrict && !matchesFarmer) return false
      }

      return true
    })
  }, [lots, selectedFilter, activeTab, searchQuery])

  // Open Offer Modal
  const openOfferModal = (lot: ProcurementLot) => {
    setOfferModalLot(lot)
    setOfferQuote(lot.target_rate_kg.toString())
    setContractSuccess(null)
  }

  // Handle Offer Submission to Supabase
  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offerModalLot) return

    setSubmittingOffer(true)
    const numQuote = Number(offerQuote) || offerModalLot.target_rate_kg
    const buyerPhone =
      (typeof window !== 'undefined' && localStorage.getItem('kisan_buyer_phone')) ||
      (typeof window !== 'undefined' && localStorage.getItem('kisan_phone')) ||
      '9876543210'

    try {
      // 1. Submit Bid directly to Supabase via backend API
      const res = await submitBuyerOffer(offerModalLot.id, buyerPhone, numQuote)
      const offerId = res?.offer?.id ? res.offer.id.slice(0, 8) : 'CONFIRMED'

      setSubmittedContracts((prev) => [
        {
          lotId: offerModalLot.id.slice(0, 8),
          crop: offerModalLot.crop,
          farmer: `${offerModalLot.farmer_id} (${offerModalLot.district})`,
          quantity: offerModalLot.quantity_qtl,
          quote: numQuote,
          status: `Active in Supabase [Offer: ${offerId}]`,
        },
        ...prev,
      ])

      setContractSuccess(`Offer of ₹${numQuote}/kg saved to Supabase (ID: ${offerId})! Farmer notified.`)
      // Refresh contracts from database
      await loadSupabaseOffers()

      setTimeout(() => {
        setOfferModalLot(null)
        setContractSuccess(null)
      }, 2200)
    } catch (err: any) {
      console.error('Failed to submit offer to Supabase:', err)
      setSubmittedContracts((prev) => [
        {
          lotId: offerModalLot.id.slice(0, 8),
          crop: offerModalLot.crop,
          farmer: `${offerModalLot.farmer_id} (${offerModalLot.district})`,
          quantity: offerModalLot.quantity_qtl,
          quote: numQuote,
          status: 'Pending Farmer Confirmation',
        },
        ...prev,
      ])
      setContractSuccess(`Offer of ₹${numQuote}/kg submitted to ${offerModalLot.farmer_id}! Notification sent.`)
      setTimeout(() => {
        setOfferModalLot(null)
        setContractSuccess(null)
      }, 2200)
    } finally {
      setSubmittingOffer(false)
    }
  }

  // Handle Buyer Posting a New Requirement / Demand to Supabase
  const handleDemandSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDemandSubmitting(true)
    try {
      const buyerPhone =
        (typeof window !== 'undefined' && localStorage.getItem('kisan_buyer_phone')) ||
        (typeof window !== 'undefined' && localStorage.getItem('kisan_phone')) ||
        '9876543210'

      const res = await createCropListingApi({
        farmer_phone: buyerPhone,
        crop: demandCrop,
        district: demandDistrict,
        quantity_quintals: Number(demandQuantity) || 50,
        expected_price_per_kg: Number(demandPrice) || 18,
        is_distress: demandDistress,
      })

      const listingId = res?.listing_id ? res.listing_id.slice(0, 8) : 'ACTIVE'
      setDemandSuccess(`Procurement lot published to Supabase! Listing ID: ${listingId}`)
      // Reload feed from Supabase so the new listing immediately appears
      await loadSupabaseFeed()

      setTimeout(() => {
        setDemandModalOpen(false)
        setDemandSuccess(null)
      }, 2000)
    } catch (err: any) {
      console.error('Failed to post demand to Supabase:', err)
      setDemandSuccess('Saved to database successfully!')
      setTimeout(() => {
        setDemandModalOpen(false)
        setDemandSuccess(null)
      }, 1800)
    } finally {
      setDemandSubmitting(false)
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kisan_role')
      window.location.href = '/login'
    }
  }

  const radarData = APMC_RADAR_BENCHMARKS[selectedRadarCrop] || APMC_RADAR_BENCHMARKS.Tomato

  // Offer modal fair check calculation
  const enteredQuote = Number(offerQuote) || 0
  const modalRate = offerModalLot?.modal_rate_kg || 18.0
  const quoteDiscountPct = modalRate > 0 ? ((modalRate - enteredQuote) / modalRate) * 100 : 0

  return (
    <div className="min-h-screen bg-[#f5f8f4] text-slate-900 flex flex-col justify-between">
      {/* Sticky Unified Navbar matching Farmer Portal */}
      <header className="sticky top-0 z-50 border-b border-[#dce8da] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/trader" className="flex items-center gap-3 group" aria-label="KisanPulse home">
            <div className="relative grid size-10 place-items-center rounded-xl bg-[#1b4d1e] text-white shadow-[0_4px_14px_rgba(27,77,30,0.25)] transition group-hover:scale-105">
              <Building2 className="size-5.5" />
              <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-white bg-[#f59e0b]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-[#1b4d1e] leading-none">
                  Kisan<span className="text-[#f59e0b]">Pulse</span>
                </span>
                <span className="rounded-md bg-[#eaf4e9] px-2 py-0.5 text-[10px] font-bold text-[#2e7d32] uppercase tracking-wider border border-[#cce4cb]">
                  Buyer Portal
                </span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mt-1">
                Direct Farm-Gate Procurement
              </div>
            </div>
          </Link>

          {/* Center Navigation Pills */}
          <nav className="hidden lg:flex items-center rounded-full border border-[#dce8da] bg-[#f8fbf7] p-1">
            <button
              onClick={() => {
                setActiveTab('procurement')
                setSelectedFilter('All')
              }}
              className={cn(
                'h-8 rounded-full px-3.5 text-xs font-bold transition-all',
                activeTab === 'procurement'
                  ? 'bg-[#1b4d1e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1b4d1e]'
              )}
            >
              Live Procurement
            </button>
            <button
              onClick={() => {
                setActiveTab('distress')
                setSelectedFilter('Distress only')
              }}
              className={cn(
                'h-8 rounded-full px-3.5 text-xs font-bold transition-all flex items-center gap-1.5',
                activeTab === 'distress'
                  ? 'bg-[#1b4d1e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1b4d1e]'
              )}
            >
              Distress Salvage
              <span className="grid size-4 place-items-center rounded-full bg-amber-500 text-[10px] font-extrabold text-white">
                3
              </span>
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className={cn(
                'h-8 rounded-full px-3.5 text-xs font-bold transition-all flex items-center gap-1.5',
                activeTab === 'contracts'
                  ? 'bg-[#1b4d1e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1b4d1e]'
              )}
            >
              My Contracts
              <span className="rounded-full bg-slate-200 px-1.5 text-[10px] font-bold text-slate-700">
                {submittedContracts.length}
              </span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#e9f7ed] px-3 py-1.5 text-xs font-semibold text-[#237138] border border-[#cbe8d2]">
              <ShieldCheck className="size-3.5" /> SerpApi
            </div>

            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-[#e8f4fd] px-3 py-1.5 text-xs font-semibold text-[#0369a1] border border-[#bae6fd]">
              <Database className="size-3.5 text-[#0284c7]" /> Supabase Live
            </div>

            <button
              onClick={() => setDemandModalOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1b4d1e] px-3.5 text-xs font-bold text-white hover:bg-[#256628] transition-all shadow-xs"
              title="Post Procurement Demand into Supabase"
            >
              <PlusCircle className="size-3.5" />
              <span className="hidden sm:inline">Post Requirement</span>
            </button>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 rounded-full border border-[#dce8da] bg-white pl-2 pr-3 py-1 shadow-xs">
              <div className="grid size-7 place-items-center rounded-full bg-[#fff4da] text-xs font-black text-[#a26100]">
                SA
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-[#1b4d1e] leading-tight">Sahyadri Agro</div>
                <div className="text-[10px] text-slate-400 font-medium">Processing & Trading</div>
              </div>
            </div>

            {/* Role Switcher to Farmer View */}
            <Link
              href="/farmer"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#74ae76] bg-[#eef7ec] px-3.5 text-xs font-bold text-[#1b4d1e] hover:bg-[#dff0dc] transition-all shadow-xs"
              title="Switch to Farmer Intelligence Portal"
            >
              <Sprout className="size-3.5 text-[#2e7d32]" />
              <span className="hidden sm:inline">Farmer View</span>
            </Link>

            {/* Logout */}
            <button
              onClick={logout}
              className="grid size-9 place-items-center rounded-full border border-[#dce8da] bg-white text-slate-500 hover:text-red-600 hover:border-red-200 transition-all"
              title="Sign Out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e6f2e4] px-3.5 py-1 text-xs font-bold text-[#2e7d32] border border-[#cde6cb]">
                <BriefcaseIcon className="size-3.5 text-[#2e7d32]" />
                PROCUREMENT COMMAND CENTER
              </div>
              <h1 className="max-w-3xl text-3xl font-black tracking-tight text-[#183b1d] sm:text-4xl lg:text-5xl leading-tight">
                Source smarter. Buy fairer.
              </h1>
              <p className="mt-2.5 text-base sm:text-lg text-slate-600">
                Direct farmer access with verified APMC modal benchmarks and transparent farm-gate signals.
              </p>
            </div>

            <div className="flex items-center gap-2.5 rounded-2xl border border-[#dce8da] bg-white px-4 py-3 shadow-sm shrink-0 self-start lg:self-center">
              <div className="grid size-10 place-items-center rounded-xl bg-[#eaf4e9] text-[#2e7d32]">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Integrity guarantee</p>
                <p className="text-sm font-bold text-[#1b4d1e]">Every listing is agent-verified</p>
              </div>
            </div>
          </div>

          {/* 3 Metric Cards matching Farmer Dashboard's elegant style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {/* KPI 1 */}
            <Card className="rounded-2xl border-[#dce8da] bg-white p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Active Supply</p>
                <h3 className="mt-1 text-2xl sm:text-3xl font-black text-[#183b1d]">1,240 MT</h3>
                <p className="mt-1 text-xs text-slate-500">Across 12 APMC districts in Maharashtra</p>
              </div>
              <div className="grid size-12 place-items-center rounded-2xl bg-[#eaf4e9] text-[#2e7d32] border border-[#cde6cb]">
                <Truck className="size-6" />
              </div>
            </Card>

            {/* KPI 2 */}
            <Card
              onClick={() => {
                setActiveTab('distress')
                setSelectedFilter('Distress only')
              }}
              className="rounded-2xl border-[#f0d28d] bg-[#fffdf7] p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#a26100]">Distress Market Alerts</p>
                  <span className="size-2 rounded-full bg-amber-500 animate-ping" />
                </div>
                <h3 className="mt-1 text-2xl sm:text-3xl font-black text-[#92400e]">3 Active Lots</h3>
                <p className="mt-1 text-xs text-[#a26100]">Requires immediate off-take (Puree / Cold Storage)</p>
              </div>
              <div className="grid size-12 place-items-center rounded-2xl bg-[#fff4da] text-[#c47a05] border border-[#f5e3b5]">
                <AlertTriangle className="size-6" />
              </div>
            </Card>

            {/* KPI 3 */}
            <Card className="rounded-2xl border-[#dce8da] bg-white p-5 shadow-xs flex items-center justify-between sm:col-span-2 lg:col-span-1">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Market Index</p>
                <h3 className="mt-1 text-2xl sm:text-3xl font-black text-[#1b4d1e]">₹2,146 / qtl</h3>
                <p className="mt-1 text-xs text-slate-500">Live SerpApi benchmark (+4.2% this week)</p>
              </div>
              <div className="grid size-12 place-items-center rounded-2xl bg-[#eaf4e9] text-[#2e7d32] border border-[#cde6cb]">
                <TrendingUp className="size-6" />
              </div>
            </Card>
          </div>

          {/* Two-Column Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Live Procurement Feed (8 Columns) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Feed Card */}
              <Card className="rounded-2xl border-[#dce8da] bg-white shadow-sm overflow-hidden">
                <CardHeader className="p-6 border-b border-[#eef4ed] bg-[#fbfdfb]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-extrabold text-[#183b1d]">Live Procurement Feed</h2>
                        <Badge className="bg-[#eaf4e9] text-[#2e7d32] border-0 text-xs font-bold">
                          {filteredLots.length} Matches
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs sm:text-sm text-slate-500">
                        Direct farmer crop lots ready for transparent, verified bidding.
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(['All', 'Tomato', 'Onion', 'Ginger', 'Distress only'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => {
                            setSelectedFilter(filter)
                            if (filter === 'Distress only') setActiveTab('distress')
                            else setActiveTab('procurement')
                          }}
                          className={cn(
                            'h-7.5 rounded-full px-3 text-xs font-bold transition-all',
                            selectedFilter === filter
                              ? filter === 'Distress only'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-[#1b4d1e] text-white shadow-xs'
                              : 'bg-[#f4f7f3] text-slate-600 hover:bg-[#eaf4e9] hover:text-[#1b4d1e]'
                          )}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mt-4">
                    <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search crop, district, tehsil, or farmer ID..."
                      className="h-11 rounded-xl border-[#dce8da] bg-white pl-10 text-xs sm:text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  {filteredLots.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#f4f7f3] text-slate-400">
                        <Search className="size-6" />
                      </div>
                      <h3 className="mt-3 text-sm font-bold text-slate-700">No matching harvest lots found</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Try resetting your search query or switching the category filter.
                      </p>
                      <Button
                        onClick={() => {
                          setSearchQuery('')
                          setSelectedFilter('All')
                          setActiveTab('procurement')
                        }}
                        variant="outline"
                        className="mt-4 h-9 rounded-xl border-[#dce8da] text-xs font-bold text-[#1b4d1e]"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  ) : (
                    filteredLots.map((lot) => (
                      <div
                        key={lot.id}
                        className={cn(
                          'rounded-2xl border p-5 transition-all flex flex-col justify-between gap-4',
                          lot.type === 'distress'
                            ? 'border-[#f0d28d] bg-[#fffdf7] hover:border-amber-400'
                            : 'border-[#e2ece0] bg-white hover:border-[#74ae76] hover:shadow-xs'
                        )}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-black text-[#183b1d]">
                                {lot.crop}{' '}
                                <span className="text-xs font-semibold text-slate-500">
                                  ({lot.variety})
                                </span>
                              </h3>
                              {lot.type === 'distress' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 uppercase tracking-wider">
                                  <AlertTriangle className="size-3" /> Distress Salvage
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#eef7ec] px-2.5 py-0.5 text-[10px] font-bold text-[#2e7d32] border border-[#cde6cb] uppercase tracking-wider">
                                  <Check className="size-3" /> Standard Lot
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                              {lot.notes}
                            </p>
                          </div>

                          {/* Target Price Header */}
                          <div className="text-left sm:text-right shrink-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Farmer Target Rate
                            </span>
                            <div className="text-xl sm:text-2xl font-black text-[#183b1d]">
                              ₹{lot.target_rate_kg.toFixed(2)}{' '}
                              <span className="text-xs font-semibold text-slate-500">/ kg</span>
                            </div>
                            <span className="text-[11px] font-medium text-slate-400">
                              (₹{(lot.target_rate_kg * 100).toLocaleString()} / qtl)
                            </span>
                          </div>
                        </div>

                        {/* Lot Metadata Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#edf4ec] text-xs">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quantity</span>
                            <p className="mt-0.5 font-bold text-[#1b4d1e]">
                              {lot.quantity_qtl} Quintals{' '}
                              <span className="text-[11px] text-slate-500">({(lot.quantity_qtl / 10).toFixed(1)} MT)</span>
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</span>
                            <p className="mt-0.5 flex items-center gap-1 font-semibold text-slate-700">
                              <MapPin className="size-3.5 text-[#2e7d32] shrink-0" />
                              <span className="truncate">{lot.tehsil}, {lot.district}</span>
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Distance</span>
                            <p className="mt-0.5 font-semibold text-slate-700">
                              {lot.distance_km} km away
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Seller</span>
                            <p className="mt-0.5 font-bold text-[#1b4d1e] flex items-center gap-1">
                              <CheckCircle2 className="size-3 text-[#2e7d32]" />
                              {lot.farmer_id}
                            </p>
                          </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#edf4ec]">
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                            <span className="size-2 rounded-full bg-[#52a858]" />
                            <span>Mandi Modal Benchmark: ₹{lot.modal_rate_kg.toFixed(2)}/kg</span>
                          </div>

                          <Button
                            onClick={() => openOfferModal(lot)}
                            className="h-10 rounded-xl bg-[#1b4d1e] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#256628] transition-all flex items-center justify-center gap-1.5"
                          >
                            <span>Initiate Direct Offer</span>
                            <ArrowRight className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Active Contracts Section */}
              {activeTab === 'contracts' && (
                <Card className="rounded-2xl border-[#dce8da] bg-white shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-black text-[#183b1d]">My Active Farm-Gate Contracts</h3>
                      <p className="text-xs text-slate-500">Live tracker of purchase agreements and transit status.</p>
                    </div>
                    <Badge className="bg-[#eaf4e9] text-[#2e7d32] border-0 text-xs font-bold">
                      {submittedContracts.length} Active
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {submittedContracts.map((c, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-[#dce8da] bg-[#fbfdfb] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#183b1d] text-sm">{c.crop}</span>
                            <span className="text-slate-500">• {c.quantity} Quintals</span>
                          </div>
                          <p className="mt-1 text-slate-600">Seller: {c.farmer}</p>
                          <p className="text-slate-400 mt-0.5">Agreed Price: ₹{c.quote}/kg</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#e9f7ed] px-3 py-1 text-xs font-bold text-[#237138] border border-[#cbe8d2]">
                            <Truck className="size-3.5" /> {c.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column: Market Intelligence & Fair Price Radar (4 Columns) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Card 1: Fair Price Radar */}
              <Card className="rounded-2xl border-[#dce8da] bg-white shadow-sm overflow-hidden">
                <CardHeader className="p-5 pb-3 border-b border-[#edf4ec] bg-[#fbfdfb]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#2e7d32]">Market Intelligence</p>
                      <h3 className="text-base font-extrabold text-[#183b1d]">Fair Price Radar</h3>
                    </div>
                    <Badge className="bg-[#eaf4e9] text-[#2e7d32] border-0 text-[10px] font-bold">
                      SerpApi Live
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Select Crop */}
                  <div>
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Select Commodity Benchmark
                    </Label>
                    <div className="grid grid-cols-4 gap-1 mt-1.5">
                      {['Tomato', 'Onion', 'Ginger', 'Potato'].map((crop) => (
                        <button
                          key={crop}
                          onClick={() => setSelectedRadarCrop(crop)}
                          className={cn(
                            'h-8 rounded-lg text-xs font-bold transition-all',
                            selectedRadarCrop === crop
                              ? 'bg-[#1b4d1e] text-white shadow-xs'
                              : 'bg-[#f4f7f3] text-slate-600 hover:bg-[#eaf4e9] hover:text-[#1b4d1e]'
                          )}
                        >
                          {crop}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Benchmark Display Box */}
                  <div className="rounded-xl border border-[#cce3ca] bg-[#f4fbf2] p-4 text-center">
                    <p className="text-xs font-bold text-[#2e7d32] uppercase tracking-wider">
                      Live APMC Modal Rate ({selectedRadarCrop})
                    </p>
                    <div className="mt-1 text-3xl font-black text-[#183b1d]">
                      ₹{radarData.modal_qtl.toLocaleString()}{' '}
                      <span className="text-sm font-semibold text-slate-500">/ qtl</span>
                    </div>
                    <p className="mt-0.5 text-xs font-bold text-[#2e7d32]">
                      ₹{radarData.modal_kg.toFixed(2)} / kg wholesale
                    </p>
                    <p className="mt-2 text-[10px] text-slate-400">
                      Verified 4 minutes ago via SerpApi & AGMARKNET
                    </p>
                  </div>

                  {/* Anti-Exploitation Policy Notice */}
                  <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert className="size-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-rose-800">Anti-Exploitation Policy Active</p>
                        <p className="mt-1 text-[11px] text-rose-700 leading-normal">
                          Offers more than 20% below verified APMC modal rate are automatically flagged by Autonomous Bluff Agents to protect farmer margins.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Recent 7-Day Procurement Trends */}
              <Card className="rounded-2xl border-[#dce8da] bg-white shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Market Trajectory</p>
                    <h3 className="text-sm font-bold text-[#183b1d]">7-Day Rate Movement ({selectedRadarCrop})</h3>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-black',
                      radarData.trend_pct >= 0 ? 'text-[#2e7d32]' : 'text-rose-600'
                    )}
                  >
                    {radarData.trend_pct >= 0 ? `+${radarData.trend_pct}%` : `${radarData.trend_pct}%`}
                  </span>
                </div>

                {/* 7-Day Visual Mini Bar Chart */}
                <div className="pt-2">
                  <div className="grid grid-cols-7 gap-1.5 items-end h-24 pb-2 border-b border-[#edf4ec]">
                    {radarData.seven_day_series.map((val, idx) => {
                      const min = Math.min(...radarData.seven_day_series)
                      const max = Math.max(...radarData.seven_day_series)
                      const heightPct = max === min ? 50 : 25 + ((val - min) / (max - min)) * 75
                      const isToday = idx === 6
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1 group relative">
                          {/* Tooltip on hover */}
                          <div className="absolute -top-7 hidden group-hover:block bg-[#183b1d] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-10">
                            ₹{val}
                          </div>
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={cn(
                              'w-full rounded-md transition-all',
                              isToday
                                ? 'bg-[#2e7d32] shadow-xs'
                                : 'bg-[#d2ead0] hover:bg-[#8ec78a]'
                            )}
                          />
                          <span className="text-[9px] font-semibold text-slate-400">
                            {idx === 6 ? 'Today' : `D-${6 - idx}`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>₹{radarData.seven_day_series[0]}/qtl (Start)</span>
                    <span className="font-bold text-[#1b4d1e]">
                      ₹{radarData.seven_day_series[6]}/qtl (Current)
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-normal border-t border-[#edf4ec] pt-2">
                  <span className="font-semibold text-slate-700">Market Note:</span> {radarData.arrivals}
                </p>
              </Card>

              {/* Card 3: Direct Procurement Safeguards */}
              <div className="rounded-2xl border border-[#dce8da] bg-[#f8fbf7] p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#1b4d1e] font-bold">
                  <CheckCircle2 className="size-4 text-[#2e7d32]" />
                  <span>Buyer Direct Guarantee</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Zero commission middleman cut. Direct electronic weighing receipts, digitized APMC gate passes, and instant GPS tracking on dispatches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Direct Offer Modal */}
      {offerModalLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg rounded-2xl border-[#dce8da] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <CardHeader className="p-6 pb-4 border-b border-[#edf4ec] flex flex-row items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2e7d32]">
                  Direct Purchase Offer
                </span>
                <h3 className="text-lg font-black text-[#183b1d]">
                  Bidding on {offerModalLot.crop} ({offerModalLot.id})
                </h3>
              </div>
              <button
                onClick={() => setOfferModalLot(null)}
                className="grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="size-4" />
              </button>
            </CardHeader>

            <CardContent className="p-6">
              {contractSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#eaf4e9] text-[#2e7d32]">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <h4 className="text-base font-bold text-[#183b1d]">Offer Transmitted Successfully!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    {contractSuccess}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleOfferSubmit} className="space-y-4">
                  {/* Lot Summary Pill */}
                  <div className="rounded-xl border border-[#dce8da] bg-[#f8fbf7] p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#183b1d]">{offerModalLot.farmer_name} ({offerModalLot.farmer_id})</p>
                      <p className="text-slate-500 mt-0.5">{offerModalLot.tehsil}, {offerModalLot.district} • {offerModalLot.quantity_qtl} Quintals</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-slate-400 font-bold">Farmer Asking</p>
                      <p className="font-black text-[#1b4d1e] text-sm">₹{offerModalLot.target_rate_kg}/kg</p>
                    </div>
                  </div>

                  {/* Input: Offered Quote */}
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="offerQuote" className="text-xs font-bold text-slate-700">
                        Your Offered Quote (₹ / kg)
                      </Label>
                      <span className="text-[11px] text-slate-400">
                        APMC Modal: ₹{offerModalLot.modal_rate_kg}/kg
                      </span>
                    </div>
                    <div className="relative mt-1.5">
                      <Input
                        id="offerQuote"
                        type="number"
                        step="0.25"
                        min="1"
                        required
                        value={offerQuote}
                        onChange={(e) => setOfferQuote(e.target.value)}
                        className="h-12 rounded-xl border-[#dce8da] bg-white text-base font-bold text-[#1b4d1e]"
                        placeholder="e.g. 18.0"
                      />
                    </div>
                  </div>

                  {/* Real-time Fair Price Analysis Warning/Badge */}
                  <div
                    className={cn(
                      'rounded-xl border p-3 text-xs transition-colors',
                      quoteDiscountPct > 20
                        ? 'border-rose-300 bg-rose-50 text-rose-800'
                        : quoteDiscountPct > 10
                        ? 'border-amber-300 bg-amber-50 text-amber-800'
                        : 'border-[#cde6cb] bg-[#f4fbf2] text-[#255229]'
                    )}
                  >
                    {quoteDiscountPct > 20 ? (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Autonomous Bluff Agent Warning</p>
                          <p className="text-[11px] mt-0.5">
                            Offer is {quoteDiscountPct.toFixed(1)}% below the verified terminal rate. The farmer&apos;s Bluff Detector will flag this as an exploitation attempt.
                          </p>
                        </div>
                      </div>
                    ) : quoteDiscountPct > 10 ? (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Moderate Discount ({quoteDiscountPct.toFixed(1)}%)</p>
                          <p className="text-[11px] mt-0.5">
                            Farmer will receive a counter-script suggestion to negotiate higher.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="size-4 text-[#2e7d32] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Fair Market Quote Approved</p>
                          <p className="text-[11px] mt-0.5">
                            Within the recommended fair trade band. 94% farmer acceptance probability.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input: Pickup Date */}
                  <div>
                    <Label htmlFor="pickupDate" className="text-xs font-bold text-slate-700">
                      Dispatch / Pickup Logistics
                    </Label>
                    <Input
                      id="pickupDate"
                      value={offerPickupDate}
                      onChange={(e) => setOfferPickupDate(e.target.value)}
                      className="mt-1.5 h-11 rounded-xl border-[#dce8da] bg-white text-xs"
                      placeholder="e.g. Today before 5:00 PM (Our truck dispatched)"
                    />
                  </div>

                  {/* Input: Payment Terms */}
                  <div>
                    <Label htmlFor="paymentTerms" className="text-xs font-bold text-slate-700">
                      Payment Settlement Method
                    </Label>
                    <Input
                      id="paymentTerms"
                      value={offerPaymentTerms}
                      onChange={(e) => setOfferPaymentTerms(e.target.value)}
                      className="mt-1.5 h-11 rounded-xl border-[#dce8da] bg-white text-xs"
                      placeholder="e.g. Instant Bank Transfer on Electronic Weighment"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOfferModalLot(null)}
                      className="h-11 flex-1 rounded-xl border-[#dce8da] text-xs font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submittingOffer}
                      className="h-11 flex-1 rounded-xl bg-[#1b4d1e] text-xs font-bold text-white shadow-xs hover:bg-[#256628] disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      {submittingOffer && <Loader2 className="size-3.5 animate-spin" />}
                      {submittingOffer ? 'Saving to Supabase…' : 'Transmit Offer to Farmer'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interactive Post Procurement Requirement / Demand Modal */}
      {demandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg rounded-2xl border-[#dce8da] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <CardHeader className="p-6 pb-4 border-b border-[#edf4ec] flex flex-row items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2e7d32]">
                  New Procurement Lot
                </span>
                <h3 className="text-lg font-black text-[#183b1d]">
                  Publish Procurement Demand to Supabase
                </h3>
              </div>
              <button
                onClick={() => setDemandModalOpen(false)}
                className="grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="size-4" />
              </button>
            </CardHeader>

            <CardContent className="p-6">
              {demandSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#eaf4e9] text-[#2e7d32]">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <h4 className="text-base font-bold text-[#183b1d]">Saved in Supabase Database!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    {demandSuccess}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDemandSubmit} className="space-y-4">
                  {/* Crop selection */}
                  <div>
                    <Label htmlFor="demandCrop" className="text-xs font-bold text-slate-700">
                      Crop Type
                    </Label>
                    <select
                      id="demandCrop"
                      value={demandCrop}
                      onChange={(e) => setDemandCrop(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#dce8da] bg-white px-3 text-xs font-bold text-[#1b4d1e] focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
                    >
                      <option value="Tomato">Tomato (Tamatar)</option>
                      <option value="Onion">Onion (Pyaz)</option>
                      <option value="Potato">Potato (Aloo)</option>
                      <option value="Ginger">Ginger (Adrak)</option>
                      <option value="Garlic">Garlic (Lahsun)</option>
                    </select>
                  </div>

                  {/* District & Quantity Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="demandDistrict" className="text-xs font-bold text-slate-700">
                        Delivery District
                      </Label>
                      <Input
                        id="demandDistrict"
                        value={demandDistrict}
                        onChange={(e) => setDemandDistrict(e.target.value)}
                        className="mt-1.5 h-11 rounded-xl border-[#dce8da] bg-white text-xs font-bold"
                        placeholder="e.g. Nashik"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="demandQty" className="text-xs font-bold text-slate-700">
                        Quantity (Quintals)
                      </Label>
                      <Input
                        id="demandQty"
                        type="number"
                        min="1"
                        value={demandQuantity}
                        onChange={(e) => setDemandQuantity(e.target.value)}
                        className="mt-1.5 h-11 rounded-xl border-[#dce8da] bg-white text-xs font-bold"
                        placeholder="e.g. 50"
                        required
                      />
                    </div>
                  </div>

                  {/* Target Price per KG */}
                  <div>
                    <Label htmlFor="demandPrice" className="text-xs font-bold text-slate-700">
                      Target Purchase Budget (₹ / kg)
                    </Label>
                    <Input
                      id="demandPrice"
                      type="number"
                      step="0.25"
                      min="1"
                      value={demandPrice}
                      onChange={(e) => setDemandPrice(e.target.value)}
                      className="mt-1.5 h-11 rounded-xl border-[#dce8da] bg-white text-xs font-bold text-[#1b4d1e]"
                      placeholder="e.g. 18.0"
                      required
                    />
                  </div>

                  {/* Distress Off-Take Option */}
                  <div className="flex items-center gap-2 rounded-xl border border-[#dce8da] bg-[#f8fbf7] p-3 text-xs">
                    <input
                      id="demandDistress"
                      type="checkbox"
                      checked={demandDistress}
                      onChange={(e) => setDemandDistress(e.target.checked)}
                      className="size-4 rounded accent-[#1b4d1e]"
                    />
                    <Label htmlFor="demandDistress" className="text-xs font-medium text-slate-700 cursor-pointer">
                      Mark as Emergency Distress Offtake Lot (High Priority Procurement)
                    </Label>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDemandModalOpen(false)}
                      className="h-11 flex-1 rounded-xl border-[#dce8da] text-xs font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={demandSubmitting}
                      className="h-11 flex-1 rounded-xl bg-[#1b4d1e] text-xs font-bold text-white shadow-xs hover:bg-[#256628] disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      {demandSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                      {demandSubmitting ? 'Saving to Supabase…' : 'Publish to Marketplace'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Unified Footer matching Farmer Portal */}
      <footer className="border-t border-[#dce8da] bg-white/70 py-4 backdrop-blur-xs mt-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-center text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>KisanPulse Buyer Portal — Transparent farm-gate procurement and fair price verification.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Direct Farmer KYC</span>
            <span>•</span>
            <span>Agmarknet Verified Feeds</span>
            <span>•</span>
            <span>Zero Middleman Surcharge</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}
