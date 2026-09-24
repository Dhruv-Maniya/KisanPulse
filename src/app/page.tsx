'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootHomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user has an existing selected role
    const savedRole = typeof window !== 'undefined' ? localStorage.getItem('kisan_role') : null
    if (savedRole === 'trader') {
      router.replace('/trader')
    } else if (savedRole === 'farmer') {
      router.replace('/farmer')
    } else {
      // User first lands on the login page
      router.replace('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#f5f8f4] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="size-8 animate-spin rounded-full border-3 border-[#1b4d1e]/20 border-t-[#1b4d1e]" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Loading KisanPulse Portal...
        </p>
      </div>
    </div>
  )
}