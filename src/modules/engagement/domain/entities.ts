export const GOAL_TYPES = ['ARTICLES', 'PAGES', 'TIME', 'HIGHLIGHTS', 'WRITING'] as const;
export type GoalType = (typeof GOAL_TYPES)[number];

export const GOAL_FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY'] as const;
export type GoalFrequency = (typeof GOAL_FREQUENCIES)[number];

export const GOAL_METRICS = [
  'ARTICLES_COMPLETED',
  'PAGES_READ',
  'TIME_MINUTES',
  'HIGHLIGHTS_CREATED',
  'WRITING_CITATIONS',
  'WRITING_DOCUMENTS',
] as const;
export type GoalMetric = (typeof GOAL_METRICS)[number];

export const GOAL_TYPE_METRICS: Record<GoalType, { metric: GoalMetric; label: string; unit: string }[]> = {
  ARTICLES: [{ metric: 'ARTICLES_COMPLETED', label: 'Artigos concluídos', unit: 'artigo(s)' }],
  PAGES: [{ metric: 'PAGES_READ', label: 'Páginas lidas', unit: 'página(s)' }],
  TIME: [{ metric: 'TIME_MINUTES', label: 'Tempo de leitura', unit: 'minuto(s)' }],
  HIGHLIGHTS: [{ metric: 'HIGHLIGHTS_CREATED', label: 'Novos destaques', unit: 'destaque(s)' }],
  WRITING: [
    { metric: 'WRITING_CITATIONS', label: 'Citações no Painel de Escrita', unit: 'citação(ões)' },
    { metric: 'WRITING_DOCUMENTS', label: 'Novos documentos', unit: 'documento(s)' },
  ],
};

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  ARTICLES: 'Artigos',
  PAGES: 'Páginas',
  TIME: 'Tempo',
  HIGHLIGHTS: 'Destaques',
  WRITING: 'Escrita',
};

export const GOAL_FREQUENCY_LABELS: Record<GoalFrequency, string> = {
  DAILY: 'diária',
  WEEKLY: 'semanal',
  MONTHLY: 'mensal',
};

export interface GoalWithProgress {
  id: string;
  type: GoalType;
  metric: GoalMetric;
  frequency: GoalFrequency;
  target: number;
  active: boolean;
  pausedAt: string | null;
  startDate: string;
  progress: number;
  percent: number;
}

export type BadgeKey =
  | 'PRIMEIRA_LEITURA'
  | 'LEITOR_ASSIDUO'
  | 'CURIOSO'
  | 'PESQUISADOR'
  | 'ORGANIZADO'
  | 'CONSISTENCIA'
  | 'MARATONISTA'
  | 'MESTRE_LITERATURA'
  | 'CONECTOR_IDEIAS'
  | 'SINTESE'
  | 'CURADOR';

export interface BadgeDefinition {
  key: BadgeKey;
  emoji: string;
  label: string;
  description: string;
  threshold: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { key: 'PRIMEIRA_LEITURA', emoji: '📖', label: 'Primeira Leitura', description: 'Concluir o primeiro artigo.', threshold: 1 },
  { key: 'LEITOR_ASSIDUO', emoji: '📚', label: 'Leitor Assíduo', description: 'Concluir 10 artigos.', threshold: 10 },
  { key: 'CURIOSO', emoji: '🧠', label: 'Curioso', description: 'Criar 100 destaques.', threshold: 100 },
  { key: 'PESQUISADOR', emoji: '✍️', label: 'Pesquisador', description: 'Registrar 50 comentários.', threshold: 50 },
  { key: 'ORGANIZADO', emoji: '🎯', label: 'Organizado', description: 'Organizar todos os artigos da Inbox.', threshold: 1 },
  { key: 'CONSISTENCIA', emoji: '🔥', label: 'Consistência', description: 'Ler durante 7 dias consecutivos.', threshold: 7 },
  { key: 'MARATONISTA', emoji: '🌟', label: 'Maratonista', description: '30 dias consecutivos.', threshold: 30 },
  { key: 'MESTRE_LITERATURA', emoji: '🏛️', label: 'Mestre da Literatura', description: '100 artigos concluídos.', threshold: 100 },
  { key: 'CONECTOR_IDEIAS', emoji: '🧩', label: 'Conector de Ideias', description: 'Criar 50 conexões no Mapa do Conhecimento.', threshold: 50 },
  { key: 'SINTESE', emoji: '💡', label: 'Síntese', description: 'Utilizar 100 citações no Painel de Escrita.', threshold: 100 },
  { key: 'CURADOR', emoji: '🏷️', label: 'Curador', description: 'Criar 50 Eixos Temáticos.', threshold: 50 },
];

export interface BadgeStatus extends BadgeDefinition {
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;
  percent: number;
}

export type JourneyStageKey = 'EXPLORANDO' | 'APROFUNDANDO' | 'CONECTANDO' | 'SINTETIZANDO' | 'PUBLICANDO';

export interface JourneyStageDefinition {
  key: JourneyStageKey;
  label: string;
  description: string;
  minPoints: number;
}

// Points blend quantity (reading volume) with quality of engagement (highlights,
// connections, citations) — matching the intent of "Jornada do Pesquisador": progress
// reflects how deeply the researcher engages with the literature, not just page count.
export const JOURNEY_STAGES: JourneyStageDefinition[] = [
  { key: 'EXPLORANDO', label: 'Explorando', description: 'Começando a organizar suas leituras.', minPoints: 0 },
  { key: 'APROFUNDANDO', label: 'Aprofundando', description: 'Construindo o hábito de leitura ativa.', minPoints: 25 },
  { key: 'CONECTANDO', label: 'Conectando', description: 'Relacionando ideias entre artigos e projetos.', minPoints: 75 },
  { key: 'SINTETIZANDO', label: 'Sintetizando', description: 'Transformando leitura em argumentação própria.', minPoints: 150 },
  { key: 'PUBLICANDO', label: 'Publicando', description: 'Produção madura, pronta para compartilhar.', minPoints: 300 },
];

export interface JourneyStatus {
  points: number;
  stage: JourneyStageDefinition;
  nextStage: JourneyStageDefinition | null;
  pointsToNextStage: number | null;
}

export const REMINDER_TYPES = ['STALLED_ARTICLE', 'ALMOST_DONE', 'DAILY_GOAL', 'INBOX_PENDING'] as const;
export type ReminderType = (typeof REMINDER_TYPES)[number];

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  STALLED_ARTICLE: 'Leitura interrompida',
  ALMOST_DONE: 'Perto de concluir',
  DAILY_GOAL: 'Meta diária não atingida',
  INBOX_PENDING: 'Inbox pendente',
};

export interface Reminder {
  type: ReminderType;
  message: string;
}

export const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  MON: 'Seg',
  TUE: 'Ter',
  WED: 'Qua',
  THU: 'Qui',
  FRI: 'Sex',
  SAT: 'Sáb',
  SUN: 'Dom',
};

export interface EngagementSettingsData {
  gamificationEnabled: boolean;
  showBadges: boolean;
  remindersEnabled: boolean;
  enabledReminderTypes: ReminderType[];
  reminderDays: Weekday[];
  reminderTime: string | null;
  dailyGoalMinutes: number | null;
  weeklyGoalMinutes: number | null;
  monthlyGoalMinutes: number | null;
  pausedUntil: string | null;
}

export interface TimelineEntry {
  label: string;
}

export interface TimelineGroup {
  heading: string;
  entries: TimelineEntry[];
}

export interface HabitBarDatum {
  label: string;
  value: number;
}

export interface HabitStats {
  minutesByWeekday: HabitBarDatum[];
  minutesByHour: HabitBarDatum[];
  avgSessionMinutes: number;
  avgPagesPerSession: number;
  avgDaysToComplete: number | null;
  topThemes: HabitBarDatum[];
  topProjects: HabitBarDatum[];
}
