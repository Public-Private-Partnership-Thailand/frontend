'use client'

import type { ReactNode } from 'react'
import Lucide from '@/components/Base/Lucide'
import { appConfig } from '@/app/configs/appConfig'
import type { InfoData, RiskSourceEntry } from '@/app/hooks/useInfo'

const THAI_FLAG_ICON_SRC = '/assets/icons/thai_flag.png'

function resolveApiHref(pathOrUrl: string | null | undefined): string | null {
  if (pathOrUrl == null || pathOrUrl === '') return null
  const t = pathOrUrl.trim()
  if (!t) return null
  if (/^https?:\/\//i.test(t)) return t
  const base = appConfig.apiUrl.replace(/\/$/, '')
  const path = t.startsWith('/') ? t : `/${t}`
  return `${base}${path}`
}

type Bucket = 'global' | 'thailand'

function RiskSourceReferenceCard({
  entry,
  bucket,
}: {
  entry: RiskSourceEntry
  bucket: Bucket
}) {
  const fileHref = resolveApiHref(entry.referenceFileUrl ?? undefined)
  const extUrl = entry.referenceUrl?.trim() || null
  const refText = entry.reference?.trim() || null
  const fileLabel = entry.referenceFile?.trim() || null
  const hasAttachmentBlock = Boolean(fileLabel || fileHref)

  return (
    <article
      className="box p-4 sm:p-5 flex flex-col gap-3 border border-gray-200 bg-white rounded-xl shadow-sm"
      aria-labelledby={`risk-ref-title-${bucket}-${entry.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 gap-y-1">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {bucket === 'global' ? (
            <Lucide
              icon="Globe"
              className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              aria-hidden
            />
          ) : (
            <img
              src={THAI_FLAG_ICON_SRC}
              alt=""
              width={20}
              height={20}
              className="mt-0.5 h-5 w-5 shrink-0 object-contain"
            />
          )}
          <h3
            id={`risk-ref-title-${bucket}-${entry.id}`}
            className="min-w-0 text-base font-semibold text-gray-900 leading-snug"
          >
            {entry.value}
          </h3>
        </div>
      </div>

      {refText ? (
        <p className="text-sm text-gray-700 leading-relaxed border-l-2 border-slate-200 pl-3">{refText}</p>
      ) : (
        <p className="text-sm text-gray-400 italic">ไม่มีข้อความอ้างอิงแบบเต็มจากระบบ</p>
      )}

      <div className="flex flex-col gap-4 text-sm">
        {hasAttachmentBlock && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-900">
              <Lucide icon="FileText" className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <span className="font-medium">ไฟล์แนบ</span>
            </div>
            <div className="flex min-w-0 flex-col gap-2.5 pl-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                {fileLabel ? (
                  <p className="text-sm text-gray-700 leading-snug break-words">{fileLabel}</p>
                ) : fileHref ? (
                  <p className="text-sm text-gray-600 italic leading-snug">เอกสารอ้างอิง (PDF)</p>
                ) : null}
              </div>
              {fileHref && (
                <a
                  href={fileHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                >
                  <Lucide icon="Download" className="h-4 w-4 shrink-0" aria-hidden />
                  ดาวน์โหลด PDF
                </a>
              )}
            </div>
          </div>
        )}
        {extUrl && (
          <div
            className={`flex flex-col gap-2 ${hasAttachmentBlock ? 'border-t border-gray-100 pt-4' : ''}`}
          >
            <div className="flex items-center gap-2 text-gray-900">
              <Lucide icon="ExternalLink" className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <span className="font-medium">ลิงก์ภายนอก</span>
            </div>
            <div className="min-w-0 pl-6">
              <a
                href={extUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 font-medium break-all underline-offset-2 hover:text-blue-800 hover:underline"
              >
                {extUrl}
              </a>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

function BucketColumn({
  title,
  icon,
  entries,
  bucket,
}: {
  title: string
  icon: ReactNode
  entries: RiskSourceEntry[]
  bucket: Bucket
}) {
  if (!entries.length) return null
  return (
    <div className="min-w-0">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="flex flex-col gap-4">
        {entries.map((e) => (
          <RiskSourceReferenceCard key={`${bucket}-${e.id}`} entry={e} bucket={bucket} />
        ))}
      </div>
    </div>
  )
}

export default function RiskSourceReferencesSection({
  riskSource,
}: {
  riskSource: NonNullable<InfoData['riskSource']>
}) {
  const global = riskSource.global ?? []
  const thailand = riskSource.thailand ?? []
  if (!global.length && !thailand.length) return null

  return (
    <section className="mb-8" aria-labelledby="risk-source-refs-heading">
      <div className="mb-4">
        <h2 id="risk-source-refs-heading" className="text-xl font-bold text-gray-900">
          รายการอ้างอิงและเอกสารประกอบ
        </h2>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        <BucketColumn
          title="แหล่งอ้างอิงนานาชาติ"
          icon={<Lucide icon="Globe" className="h-5 w-5 shrink-0 text-primary" aria-hidden />}
          entries={global}
          bucket="global"
        />
        <BucketColumn
          title="แหล่งอ้างอิงประเทศไทย"
          icon={
            <img src={THAI_FLAG_ICON_SRC} alt="" width={20} height={20} className="h-5 w-5 shrink-0 object-contain" />
          }
          entries={thailand}
          bucket="thailand"
        />
      </div>
    </section>
  )
}
