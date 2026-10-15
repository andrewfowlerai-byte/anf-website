// SHARED: keep identical in anf-crm/src/lib/onboardingTypes.ts and anf-website/src/lib/onboarding/types.ts
//
// Client onboarding form: template types, answer shapes and the API shapes of the
// token RPCs (contract v1, sections 4.1 to 4.3). Shared files import nothing
// except each other, so the template types are defined here and the CRM's
// src/lib/onboardingTemplates/types.ts re-exports them.

// ---------------------------------------------------------------------------
// Template (4.1)
// ---------------------------------------------------------------------------

export type QType = 'text' | 'longtext' | 'number' | 'money' | 'email' | 'phone' | 'url' | 'date' | 'time'
  | 'address' | 'choice' | 'multi' | 'yesno' | 'file' | 'table' | 'check'
export type ColType = 'text' | 'longtext' | 'number' | 'money' | 'email' | 'phone' | 'url' | 'date' | 'time' | 'yesno'
export type Phase = 'ALL' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'APP'
export type Gate = string | string[]

export interface OnboardingColumn {
  key: string
  label: string
  type: ColType
  help?: string
  audience?: 'owner'
  pickFrom?: { question: string; column: string }
}

export interface OnboardingQuestion {
  key: string
  label: string
  type: QType
  phase: Phase
  help?: string
  required?: boolean
  options?: string[]
  showIf?: Gate
  answeredIf?: Gate
  audience?: 'owner'
  checkLabel?: string
  columns?: OnboardingColumn[]
  rowsFrom?: { question: string; sourceColumn: string; targetColumn: string }
  /**
   * Rows a table starts with (for example Monday to Sunday). Each shows as a
   * prefilled row until someone edits or removes it. Ids start with "d_", so
   * two people never create the same row twice.
   */
  defaultRows?: { id: string; cells: Record<string, string> }[]
  /** File questions: the one-line note above the drop zone. Without it, the blank-forms note shows. */
  fileNote?: string
  /**
   * Per form only (the CRM's prefill): what we already found, for example on
   * the client's website. Shown as "Is this right?" until someone answers. Never
   * saved as an answer until the client taps "Use this" or types.
   */
  suggest?: string | string[]
  /** Authoring only: the help the team link shows instead. buildFormSnapshot applies it and removes it. */
  helpTeam?: string
}

export interface OnboardingSection {
  part: string
  key: string
  title: string
  /** Lines that start with "- " show as a bulleted list. */
  intro: string
  audience?: 'owner'
  /** Authoring only: what the team link shows instead. buildFormSnapshot applies them and removes them. */
  titleTeam?: string
  introTeam?: string
  questions: OnboardingQuestion[]
}

export interface OnboardingTemplate {
  version: string
  title: string
  intro: string
  conventions?: Record<string, string>
  phase1Essentials: string[]
  collapseWhen?: { showIf: Gate; phases: Phase[] } | null
  sensitivePatterns?: { name: string; rule: string }[]
  phaseLabels?: Record<Phase, string>
  sections: OnboardingSection[]
  /** Per form only: which stage and parts this form holds (the CRM's onboardingScope). The website ignores it. */
  scope?: FormScope
}

export interface FormScope {
  /** 1-based stage number, and how many stages the template has. */
  stage: number
  stages: number
  stageLabel: string
  /** The optional parts switched on. */
  modules: string[]
  /** The prefill set used, or null. */
  prefill: string | null
}

/** What a form stores and the website renders: no conventions, no sensitivePatterns, phaseLabels always set. */
export type OnboardingSnapshot = Omit<OnboardingTemplate, 'conventions' | 'sensitivePatterns'> & { phaseLabels: Record<Phase, string> }

export const PHASES: Phase[] = ['ALL', 'P1', 'P2', 'P3', 'P4', 'P5', 'APP']

export const PHASE_LABELS_DEFAULT: Record<Phase, string> = {
  ALL: 'Before we start',
  P1: 'Phase 1',
  P2: 'Phase 2',
  P3: 'Phase 3',
  P4: 'Phase 4',
  P5: 'Phase 5',
  APP: 'The app',
}

// ---------------------------------------------------------------------------
// Answer values (4.2)
// ---------------------------------------------------------------------------

/** One table row as stored. Column keys never start with "_". */
export interface TableRowValue {
  _pos?: number
  _removed?: true
  _by?: string
  _at?: string
  [col: string]: string | number | boolean | null | undefined
}

export interface TableValue { rows: Record<string, TableRowValue> }
export interface FileValue { links: string[] }

// ---------------------------------------------------------------------------
// API shapes (4.3)
// ---------------------------------------------------------------------------

export type Role = 'owner' | 'team'
export type FormStatus = 'open' | 'submitted' | 'closed'
export type AnswerState = 'not_sure' | 'will_send' | null

export interface Answer { v: unknown; s: AnswerState; by: string | null; at: string }
export type AnswerMap = Record<string, Answer>

export interface FileItem { id: string; key: string; name: string; size: number; type: string; by: string | null; at: string; removed?: boolean }
export interface SectionState { ready: boolean; by: string | null; at: string }
export interface Person { name: string; link: Role; first_at: string; last_at: string }

export interface FormMeta {
  title: string
  status: FormStatus
  submitted_at: string | null
  submitted_by_name: string | null
  section_state: Record<string, SectionState>
  people: Person[]
  collapsed_phases: Phase[]
}

export type ErrorCode = 'not_found' | 'closed' | 'not_open' | 'owner_only' | 'unknown_key' | 'unknown_section' | 'wrong_type'
  | 'bad_value' | 'too_long' | 'too_many' | 'bad_row' | 'bad_column' | 'bad_name' | 'sensitive' | 'file_not_found'
  | 'limit_reached' | 'too_big' | 'bad_file_type'

export interface Fail { ok: false; code: ErrorCode; title?: string }

export interface GetFormOk {
  ok: true
  role: Role
  preview: boolean
  server_time: string
  form: FormMeta
  template_hash: string
  template: OnboardingSnapshot | null
  answers: AnswerMap
  files: FileItem[]
  /** Owner link only: the team link's token, so the owner can copy the link that hides Owner only questions. */
  team_token?: string
}

export interface ChangesOk {
  ok: true
  server_time: string
  cursor: string
  form: FormMeta
  answers: AnswerMap
  files: FileItem[]
  /** Owner link only (as in GetFormOk), so a replaced team link reaches the owner's page. */
  team_token?: string
}

export interface SaveAnswerOk { ok: true; at: string; by: string }
export interface SaveCellsOk { ok: true; at: string; rows: Record<string, TableRowValue> }
export interface RowRemovedOk { ok: true; at: string }
export interface MarkSectionOk { ok: true; section_state: Record<string, SectionState> }
export interface SubmitOk { ok: true; submitted_at?: string; already?: boolean }
export interface PlainOk { ok: true }

/** One cell write for onboarding_save_cells. */
export interface CellWrite { row: string; col: string; v: string | null }

export const ONBOARD_LIMITS = {
  nameMax: 80, textMax: 1000, longMax: 20000, shortMax: 40, multiMax: 60, optionMax: 500,
  linksMax: 20, linkMax: 2000, cellMax: 1000, cellLongMax: 4000, rowsMax: 400, tableCharsMax: 400000, cellsPerCall: 500,
  fileBytesMax: 52428800, filesPerQuestion: 60, filesPerForm: 600,
} as const

/** Row ids: new rows use "r_" plus 10 base36 characters; rowsFrom rows use "rf_<sourceRowId>"; defaultRows use "d_<name>". */
export const ROW_ID_RE = /^[A-Za-z0-9_]{3,48}$/
