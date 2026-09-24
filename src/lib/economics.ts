export interface MandiComparison {
  name: string
  distance_km: number
  price_qtl: number
  net_take_home: number
  effective_price_per_kg?: number
  transport_cost?: number
  spoilage_loss?: number
}

export interface BluffAnalysis {
  claim: string
  bluff_score: 'LOW' | 'MODERATE' | 'HIGH'
  margin_gap_pct: number
  counter_script: string
}

export interface DistressContact {
  title: string
  address: string
  phone: string
  rating: string | number
  buyer_category: string
}

export interface AdvisoryResponse {
  crop: string
  district: string
  quantity_qtl: number
  diesel_rate: number
  is_distress_active: boolean
  arbitrage_comparison: MandiComparison[]
  arbitrage_verdict: string
  bluff_analysis: BluffAnalysis | null
  distress_contacts: DistressContact[]
}

export const CROP_BENCHMARKS: Record<
  string,
  {
    baseModal: number
    breakEven: number
    isPerishable: boolean
    regionalHub: string
    hubMultiplier: number
    distressCategory: string
  }
> = {
  tomato: {
    baseModal: 1820,
    breakEven: 600,
    isPerishable: true,
    regionalHub: 'Lasalgaon Regional Hub',
    hubMultiplier: 1.176,
    distressCategory: 'Processing factory',
  },
  onion: {
    baseModal: 1420,
    breakEven: 700,
    isPerishable: false,
    regionalHub: 'Lasalgaon APMC Main Yard',
    hubMultiplier: 1.15,
    distressCategory: 'Dehydration & Export Hub',
  },
  ginger: {
    baseModal: 4250,
    breakEven: 2500,
    isPerishable: false,
    regionalHub: 'Satara Regional Hub',
    hubMultiplier: 1.12,
    distressCategory: 'Bulk Spice & Kitchen Wholesaler',
  },
  potato: {
    baseModal: 1250,
    breakEven: 600,
    isPerishable: false,
    regionalHub: 'Manchar Cold Storage Hub',
    hubMultiplier: 1.14,
    distressCategory: 'Chips & Starch Processing',
  },
  garlic: {
    baseModal: 7500,
    breakEven: 3500,
    isPerishable: false,
    regionalHub: 'Mandsaur Terminal Yard',
    hubMultiplier: 1.1,
    distressCategory: 'Spice Extraction Facility',
  },
  chilli: {
    baseModal: 3800,
    breakEven: 2000,
    isPerishable: true,
    regionalHub: 'Byadgi Terminal Market',
    hubMultiplier: 1.16,
    distressCategory: 'Oleoresin & Pickle Processing',
  },
  wheat: {
    baseModal: 2275,
    breakEven: 2200,
    isPerishable: false,
    regionalHub: 'Khandwa Regional Yard',
    hubMultiplier: 1.08,
    distressCategory: 'Flour Mill & FCI Buffer Godown',
  },
}

export function getCropBenchmark(cropName: string) {
  const normalized = cropName.toLowerCase().trim()
  for (const [key, val] of Object.entries(CROP_BENCHMARKS)) {
    if (normalized.includes(key)) return { key, ...val }
  }
  return {
    key: 'custom',
    baseModal: 2000,
    breakEven: 800,
    isPerishable: false,
    regionalHub: 'Regional Terminal Mandi',
    hubMultiplier: 1.14,
    distressCategory: 'Agro Processing & Storage',
  }
}

export function calculateNetYield(
  crop: string,
  quantityQtl: number,
  modalPriceQtl: number,
  distanceKm: number,
  dieselRate: number = 99.05,
  vehicleMileage: number = 9.0
) {
  if (quantityQtl <= 0 || modalPriceQtl <= 0) {
    return {
      distance_km: distanceKm,
      price_qtl: modalPriceQtl,
      gross_revenue: 0,
      transport_cost: 0,
      spoilage_loss: 0,
      mandi_cess: 0,
      net_take_home: 0,
      effective_price_per_kg: 0,
    }
  }

  const grossRevenue = quantityQtl * modalPriceQtl
  const roundTripKm = distanceKm * 2
  const fuelLitres = roundTripKm / vehicleMileage
  const fuelCost = fuelLitres * dieselRate
  const driverTollLoading = distanceKm > 0 ? 400 : 0
  const transportCost = fuelCost + driverTollLoading

  const isPerishable = ['tomato', 'tamatar', 'chilli', 'mirchi', 'coriander', 'vegetable'].some((c) =>
    crop.toLowerCase().includes(c)
  )
  const spoilageRate = isPerishable ? (distanceKm / 100.0) * 0.03 : 0.005
  const spoilageLoss = grossRevenue * Math.min(spoilageRate, 0.15)
  const mandiCess = grossRevenue * 0.015

  const netTakeHome = Math.max(0, grossRevenue - transportCost - spoilageLoss - mandiCess)
  const effectivePricePerKg = quantityQtl > 0 ? netTakeHome / (quantityQtl * 100.0) : 0

  return {
    distance_km: distanceKm,
    price_qtl: Math.round(modalPriceQtl),
    gross_revenue: Math.round(grossRevenue),
    transport_cost: Math.round(transportCost),
    spoilage_loss: Math.round(spoilageLoss),
    mandi_cess: Math.round(mandiCess),
    net_take_home: Math.round(netTakeHome),
    effective_price_per_kg: Number(effectivePricePerKg.toFixed(2)),
  }
}

export function getCounterScript(
  crop: string,
  verifiedPriceKg: number,
  buyerQuoteKg: number,
  targetAskingKg: number,
  bestMandiName: string,
  lang: 'en' | 'hi' | 'mr'
): string {
  const modalPerQtl = Math.round(verifiedPriceKg * 100)
  const quote = Number(buyerQuoteKg) || 0
  const asking = targetAskingKg > quote ? targetAskingKg : Number((verifiedPriceKg * 0.95).toFixed(1))

  if (lang === 'hi') {
    return `“मुझे पता है कि ${crop} का टर्मिनल मंडी भाव ₹${modalPerQtl.toLocaleString()}/क्विंटल है। परिवहन और खर्च के बाद मेरी फसल ₹${verifiedPriceKg}/किलो की है। मैं आज कम से कम ₹${asking}/किलो में बेचूंगा — अन्यथा अपना माल सीधे ${bestMandiName} ले जाऊंगा।”`
  }
  if (lang === 'mr') {
    return `“मला माहीत आहे की ${crop} चा अधिकृत बाजारभाव ₹${modalPerQtl.toLocaleString()}/क्विंटल आहे. वाहतूक वजा जाता माझ्या मालाची किंमत ₹${verifiedPriceKg}/किलो आहे. मी आज ₹${asking}/किलोने विकू शकतो — अन्यथा थेट ${bestMandiName} ला घेऊन जाईन.”`
  }
  return `“I know the verified terminal rate for ${crop} is ₹${modalPerQtl.toLocaleString()}/qtl. After transport, my crop is worth ₹${verifiedPriceKg}/kg. I can sell today at ₹${asking}/kg — otherwise I will route it directly to ${bestMandiName}.”`
}

export function calculateLiveEconomics(
  form: {
    crop: string
    district: string
    quantity: string | number
    claim: string
    quote: string | number
  },
  lang: 'en' | 'hi' | 'mr' = 'en',
  dieselRate = 99.05
): AdvisoryResponse {
  const crop = form.crop.trim() || 'Tomato'
  const district = form.district.trim() || 'Nashik'
  const quantity = Math.max(0, Number(form.quantity) || 0)
  const quote = Math.max(0, Number(form.quote) || 0)
  const claim = form.claim.trim()

  const benchmark = getCropBenchmark(crop)
  const modalPriceA = benchmark.baseModal
  const modalPriceB = Math.round(benchmark.baseModal * benchmark.hubMultiplier)

  const mandiA = calculateNetYield(crop, quantity, modalPriceA, 12, dieselRate)
  const mandiB = calculateNetYield(crop, quantity, modalPriceB, 48, dieselRate)

  const mandiAName = `${district} APMC (Near)`
  const mandiBName = benchmark.regionalHub

  const netDiff = mandiB.net_take_home - mandiA.net_take_home
  const bestMandiName = netDiff >= 0 ? mandiBName : mandiAName

  let verdict = ''
  if (quantity === 0) {
    verdict = `Please enter your harvest quantity in quintals above to calculate the True-Net take-home yield between ${mandiAName} and ${mandiBName}.`
  } else if (netDiff > 0) {
    verdict = `${mandiBName} wins by ₹${netDiff.toLocaleString()} even after extra diesel, transit, and perishability risk. Route your load there early for the best auction window.`
  } else if (netDiff < 0) {
    verdict = `${mandiAName} wins by ₹${Math.abs(netDiff).toLocaleString()}! For a smaller volume of ${quantity} quintals, the extra round-trip transport to ${mandiBName} is not cost-effective. Sell locally at ${mandiAName}.`
  } else {
    verdict = `Both mandis yield equal net returns for ${quantity} quintals. Choose ${mandiAName} to save transit time and reduce road risk.`
  }

  // Middleman Bluff Analysis
  const verifiedPriceKg = Number((modalPriceA / 100).toFixed(2))
  const marginGap = quote > 0 ? verifiedPriceKg - quote : 0
  const marginGapPct = quote > 0 && verifiedPriceKg > 0 ? Math.max(0, (marginGap / verifiedPriceKg) * 100) : 0
  const bluffScore: 'LOW' | 'MODERATE' | 'HIGH' =
    marginGapPct >= 25 ? 'HIGH' : marginGapPct >= 10 ? 'MODERATE' : 'LOW'

  const effectiveNetKg = mandiA.effective_price_per_kg || verifiedPriceKg
  const targetAsking = Number(Math.max(quote + 2, (verifiedPriceKg * 0.95)).toFixed(1))

  const counterScript = getCounterScript(crop, verifiedPriceKg, quote, targetAsking, bestMandiName, lang)

  // Distress check
  const isDistress = modalPriceA < benchmark.breakEven || (quote > 0 && quote < benchmark.breakEven / 100)

  const distressContacts: DistressContact[] = [
    {
      title: `${district} Agro Puree & Processing Hub`,
      address: `MIDC Industrial Area, ${district}, Maharashtra`,
      phone: '+912532401122',
      rating: '4.8',
      buyer_category: benchmark.distressCategory,
    },
    {
      title: `${district} Bulk Kitchens & Food Consortium`,
      address: `Station Road, ${district}, Maharashtra`,
      phone: '+912532781900',
      rating: '4.6',
      buyer_category: 'Commercial kitchen / Bulk off-take',
    },
    {
      title: `FreshRoute Agro Cold Storage`,
      address: `State Highway 17, ${district}, Maharashtra`,
      phone: '+919823450870',
      rating: '4.7',
      buyer_category: 'Controlled Atmosphere Cold Storage',
    },
  ]

  return {
    crop,
    district,
    quantity_qtl: quantity,
    diesel_rate: dieselRate,
    is_distress_active: isDistress,
    arbitrage_comparison: [
      {
        name: mandiAName,
        distance_km: mandiA.distance_km,
        price_qtl: mandiA.price_qtl,
        net_take_home: mandiA.net_take_home,
        effective_price_per_kg: mandiA.effective_price_per_kg,
        transport_cost: mandiA.transport_cost,
        spoilage_loss: mandiA.spoilage_loss,
      },
      {
        name: mandiBName,
        distance_km: mandiB.distance_km,
        price_qtl: mandiB.price_qtl,
        net_take_home: mandiB.net_take_home,
        effective_price_per_kg: mandiB.effective_price_per_kg,
        transport_cost: mandiB.transport_cost,
        spoilage_loss: mandiB.spoilage_loss,
      },
    ],
    arbitrage_verdict: verdict,
    bluff_analysis: {
      claim: claim || 'Azadpur terminal market crashed',
      bluff_score: bluffScore,
      margin_gap_pct: Number(marginGapPct.toFixed(1)),
      counter_script: counterScript,
    },
    distress_contacts: distressContacts,
  }
}
