'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fmtDate } from '@/lib/utils'
import {
  ListChecks, Clock, CheckCircle2, XCircle, AlertCircle,
  Mail, RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react'

const ROUND_LABELS: Record<number, string> = {
  1: 'Round 1 — Initial Dispute',
  2: 'Round 2 — Method of Verification',
  3: 'Round 3 — Legal Escalation',
  4: 'Round 4 — Final Demand',
}

const OUTCOME_BADGE: Record<string, string> = {
  deleted:     'badge-green',
  updated:     'badge-blue',
  verified:    'badge-red',
  no_response: 'badge-red',
}

const OUTCOME_LABEL: Record<string, string> = {
  deleted:     'Deleted ✓',
  updated:     'Updated ✓',
  verified:    'Bureau Verified',
  no_response: 'No Response',
}

function statusIcon(status: string) {
  switch (status) {
    case 'sent':           return <Mail className="w-4 h-4 text-blue-400" />
    case 'approved':
    case 'delivered':
    case 'resolved':       return <CheckCircle2 className="w-4 h-4 text-status-active" />
    case 'rejected':       return <XCircle className="w-4 h-4 text-status-cancelled" />
    case 'needs_rewrite':  return <AlertCircle className="w-4 h-4 text-brand-gold" />
    default:               return <Clock className="w-4 h-4 text-slate-500" />
  }
}

function statusLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

interface Letter {
  letter_id: number
  bureau: string
  round: number
  letter_status: string
  created_at: string
  tracking_number?: string | null
  admin_note?: string | null
  response_outcome?: string | null
  bureau_response_at?: string | null
  re_dispute_triggered?: boolean
  parent_letter_id?: number | null
  requires_notarization?: boolean
}

interface ReDisputeForm {
  letterId: number
  bureau: string
  outcome: 'verified' | 'no_response'
  responseText: string
}

export default function DisputesPage() {
  const [letters, setLetters] = useState<Letter[]>([])
  const [negItemCount, setNegItemCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expandedResponse, setExpandedResponse] = useState<Record<number, boolean>>({})
  const [reDisputeForm, setReDisputeForm] = useState<ReDisputeForm | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const { data: cases } = await supabase
        .from('cases').select('case_id').eq('email', user.email).order('created_at', { ascending: false }).limit(1)
      const caseId = cases?.[0]?.case_id
      if (!caseId) { setLoading(false); return }

      const [lr, nir] = await Promise.all([
        supabase.from('dispute_letters').select('*').eq('case_id', caseId).order('round').order('created_at'),
        supabase.from('negative_items').select('item_id').eq('case_id', caseId),
      ])
      setLetters((lr.data ?? []) as Letter[])
      setNegItemCount(nir.data?.length ?? 0)
      setLoading(false)
    }
    load()
  }, [])

  const byRound: Record<number, Letter[]> = {}
  for (const l of letters) {
    const r = l.round ?? 1
    if (!byRound[r]) byRound[r] = []
    byRound[r].push(l)
  }
  const rounds = Object.keys(byRound).map(Number).sort()

  async function triggerReDispute() {
    if (!reDisputeForm) return
    setSubmitting(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/dispute/re-dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          letterId:           reDisputeForm.letterId,
          bureauResponseText: reDisputeForm.responseText,
          responseOutcome:    reDisputeForm.outcome,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error ?? 'Failed to generate re-dispute'); return }
      setSuccessMsg(`Round ${data.round} letter generated for ${reDisputeForm.bureau}. Status: Pending Review.`)
      setReDisputeForm(null)
      // Refresh letters
      window.location.reload()
    } catch {
      setErrorMsg('Network error — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-slate-400">
        <Clock className="w-5 h-5 animate-spin" />
        <span>Loading disputes…</span>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <p className="section-label mb-1">Dispute Management</p>
        <h1 className="text-2xl font-bold text-white">Dispute Tracker</h1>
        <p className="text-slate-400 text-sm mt-1">Multi-round dispute timeline with bureau responses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Letters',   value: letters.length },
          { label: 'Negative Items',  value: negItemCount },
          { label: 'Deleted / Fixed', value: letters.filter(l => l.response_outcome === 'deleted' || l.response_outcome === 'updated').length },
          { label: 'Rounds Active',   value: rounds.length },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card">
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Success / error banners */}
      {successMsg && (
        <div className="card p-4 border border-status-active/30 bg-status-active/10">
          <p className="text-sm text-status-active">{successMsg}</p>
        </div>
      )}
      {errorMsg && (
        <div className="card p-4 border border-status-cancelled/30 bg-status-cancelled/10">
          <p className="text-sm text-status-cancelled">{errorMsg}</p>
        </div>
      )}

      {/* Re-dispute form modal */}
      {reDisputeForm && (
        <div className="card p-5 border border-brand-gold/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Trigger Re-Dispute — {reDisputeForm.bureau}</h3>
            <button onClick={() => setReDisputeForm(null)} className="text-slate-500 hover:text-white text-xs">✕ Cancel</button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Bureau Response Outcome</label>
              <select
                value={reDisputeForm.outcome}
                onChange={e => setReDisputeForm(f => f ? { ...f, outcome: e.target.value as 'verified' | 'no_response' } : f)}
                className="w-full bg-navy-800 border border-white/10 rounded px-3 py-2 text-sm text-white"
              >
                <option value="verified">Bureau Verified (claims item is accurate)</option>
                <option value="no_response">No Response (bureau did not reply in 30 days)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Bureau Response Text (optional)</label>
              <textarea
                rows={3}
                placeholder="Paste the bureau's response or investigation results here…"
                value={reDisputeForm.responseText}
                onChange={e => setReDisputeForm(f => f ? { ...f, responseText: e.target.value } : f)}
                className="w-full bg-navy-800 border border-white/10 rounded px-3 py-2 text-sm text-white resize-none"
              />
            </div>
            <button
              onClick={triggerReDispute}
              disabled={submitting}
              className="btn-gold w-full text-sm flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Generating…</>
              ) : (
                <><RefreshCw className="w-4 h-4" /> Generate Next-Round Letter</>
              )}
            </button>
          </div>
        </div>
      )}

      {letters.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-center">
          <ListChecks className="w-10 h-10 text-slate-600" />
          <p className="text-slate-400 text-sm">No dispute letters yet. Letters appear here once your case is processed.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {rounds.map((round) => (
            <section key={round} aria-label={`Round ${round} disputes`}>
              <div className="gold-bar mb-4">
                <h2 className="text-sm font-semibold text-white">{ROUND_LABELS[round] ?? `Round ${round}`}</h2>
                <span className="text-xs text-slate-500">{byRound[round].length} letter{byRound[round].length !== 1 ? 's' : ''}</span>
              </div>

              <ol className="relative border-l border-white/[0.08] ml-3 space-y-6">
                {byRound[round].map((letter) => {
                  const canReDispute =
                    !letter.re_dispute_triggered &&
                    letter.round < 4 &&
                    (letter.response_outcome === 'verified' || letter.response_outcome === 'no_response' ||
                      letter.letter_status === 'mailed')

                  return (
                    <li key={letter.letter_id} className="ml-6">
                      <span className="absolute -left-2 flex items-center justify-center w-4 h-4">
                        {statusIcon(letter.letter_status)}
                      </span>
                      <div className="card p-4 space-y-3">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {letter.bureau}
                              {letter.parent_letter_id && (
                                <span className="text-xs text-slate-500 ml-2">↳ escalated from Round {round - 1}</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{fmtDate(letter.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`${letter.letter_status === 'approved' || letter.letter_status === 'resolved' ? 'badge-green' : letter.letter_status === 'rejected' ? 'badge-red' : 'badge-blue'} text-xs`}>
                              {statusLabel(letter.letter_status)}
                            </span>
                            {letter.response_outcome && (
                              <span className={`${OUTCOME_BADGE[letter.response_outcome] ?? 'badge-blue'} text-xs`}>
                                {OUTCOME_LABEL[letter.response_outcome] ?? letter.response_outcome}
                              </span>
                            )}
                            {letter.requires_notarization && (
                              <span className="badge-blue text-xs">Notarization Required</span>
                            )}
                          </div>
                        </div>

                        {/* Tracking + notes */}
                        {letter.tracking_number != null && (
                          <p className="text-xs text-slate-500">
                            Tracking: <span className="font-mono text-slate-400">{letter.tracking_number}</span>
                          </p>
                        )}
                        {letter.admin_note != null && (
                          <p className="text-xs text-slate-400 italic">Note: {letter.admin_note}</p>
                        )}

                        {/* Bureau response date */}
                        {letter.bureau_response_at && (
                          <p className="text-xs text-slate-500">
                            Bureau responded: {fmtDate(letter.bureau_response_at)}
                          </p>
                        )}

                        {/* Response expand toggle */}
                        {letter.response_outcome && (
                          <button
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                            onClick={() => setExpandedResponse(prev => ({ ...prev, [letter.letter_id]: !prev[letter.letter_id] }))}
                          >
                            {expandedResponse[letter.letter_id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {expandedResponse[letter.letter_id] ? 'Hide' : 'Show'} response detail
                          </button>
                        )}
                        {expandedResponse[letter.letter_id] && letter.response_outcome && (
                          <div className="bg-white/[0.04] rounded p-3 text-xs text-slate-400">
                            Outcome: <span className="text-white">{OUTCOME_LABEL[letter.response_outcome]}</span>
                          </div>
                        )}

                        {/* Re-dispute button */}
                        {canReDispute && !reDisputeForm && (
                          <button
                            onClick={() => setReDisputeForm({
                              letterId:     letter.letter_id,
                              bureau:       letter.bureau,
                              outcome:      letter.response_outcome === 'no_response' ? 'no_response' : 'verified',
                              responseText: '',
                            })}
                            className="btn-ghost text-xs flex items-center gap-1.5 mt-1"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Escalate to Round {letter.round + 1}
                          </button>
                        )}

                        {letter.re_dispute_triggered && (
                          <p className="text-xs text-brand-gold flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" /> Round {letter.round + 1} letter generated
                          </p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
