export const RISK_PHASE_OPTIONS = [
  { value: 'pre-construction', label: 'Pre-construction' },
  { value: 'construction', label: 'Construction' },
  { value: 'operation', label: 'Operation' },
] as const

export const MITIGATION_STATUS_OPTIONS = [
  { value: 'planned', label: 'วางแผน (Planned)' },
  { value: 'in_progress', label: 'กำลังดำเนินการ (In Progress)' },
  { value: 'done_or_selected', label: 'ดำเนินการแล้ว / เลือกแล้ว (Done / Selected)' },
  { value: 'rejected', label: 'ไม่ดำเนินการ (Rejected)' },
] as const
