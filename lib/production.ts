export type DayType = "shoot" | "prep" | "post_deadline" | "delivery";

export const DAY_TYPES: DayType[] = ["shoot", "prep", "post_deadline", "delivery"];

export const DAY_TYPE_LABELS: Record<DayType, string> = {
  shoot: "Shoot",
  prep: "Prep",
  post_deadline: "Post production",
  delivery: "Delivery",
};

/** calendar color classes per day type — brand palette only */
export const DAY_TYPE_CLASSES: Record<DayType, string> = {
  shoot: "bg-[var(--brand-signal)] text-[var(--brand-cream)]",
  prep: "border border-foreground text-foreground",
  post_deadline: "bg-foreground text-background",
  delivery: "bg-foreground text-background underline",
};

export interface DayLocation {
  name: string;
  map_link: string;
}

export interface ProductionDay {
  id: string;
  project_id: string;
  day_date: string;
  day_type: DayType;
  title: string;
  locations: DayLocation[];
  notes: string;
  share_key: string;
}

export const SHOT_SIZES = [
  "WS",
  "MS",
  "MCU",
  "CU",
  "ECU",
  "OTS",
  "POV",
  "INSERT",
  "DRONE",
];

export interface Shot {
  id: string;
  production_day_id: string;
  sort_order: number;
  shot_number: string;
  scene: string;
  description: string;
  shot_size: string;
  camera_notes: string;
  location: string;
  cast_subjects: string;
  planned_time: string | null;
  estimated_minutes: number | null;
  status: "not_shot" | "done";
}

export interface KeyContact {
  role: string;
  name: string;
  phone: string;
}

export interface ScheduleRow {
  time: string;
  activity: string;
}

export interface CrewCall {
  name: string;
  role: string;
  phone: string;
  call_time: string;
}

export interface CastCall {
  name: string;
  role: string;
  call_time: string;
}

/** Call-sheet location row — free text name plus an optional map/info link. */
export interface CallSheetLocation {
  name: string;
  link: string;
}

export interface CallSheet {
  id: string;
  production_day_id: string;
  general_call_time: string | null;
  day_number: number | null;
  total_days: number | null;
  weather_note: string;
  key_contacts: KeyContact[];
  locations: CallSheetLocation[];
  schedule: ScheduleRow[];
  client_calls: CrewCall[];
  crew_calls: CrewCall[];
  cast_list: CastCall[];
  notes: string;
}

/** Non-shoot day types (prep / post / delivery) use a shared to-do list
 *  instead of shot list + call sheet. The list is keyed by
 *  (project_id, day_type), so every prep day of a project shows the same
 *  list — editing it on one day is editing it on all of them. */
export function isTodoDayType(type: DayType): boolean {
  return type !== "shoot";
}

export type TodoPriority = "low" | "medium" | "high";

export const TODO_PRIORITIES: TodoPriority[] = ["high", "medium", "low"];

export interface TodoItem {
  id: string;
  project_id: string;
  day_type: DayType;
  sort_order: number;
  title: string;
  notes: string;
  priority: TodoPriority;
  due_date: string | null;
  done: boolean;
}

/** Bilingual labels for the printable shot list / call sheet / schedule. */
export type SheetLang = "en" | "ar";

export const SHEET_LABELS = {
  shot_list: { en: "Shot list", ar: "قائمة اللقطات" },
  call_sheet: { en: "Call sheet", ar: "ورقة النداء" },
  todo_list: { en: "To-do list", ar: "قائمة المهام" },
  task_col: { en: "TASK", ar: "المهمة" },
  priority_col: { en: "PRIORITY", ar: "الأولوية" },
  due_col: { en: "DUE", ar: "الاستحقاق" },
  tasks_count: { en: "tasks", ar: "مهمة" },
  done_count: { en: "done", ar: "منجز" },
  priority_high: { en: "High", ar: "عالية" },
  priority_medium: { en: "Medium", ar: "متوسطة" },
  priority_low: { en: "Low", ar: "منخفضة" },
  no_todos: { en: "No tasks yet.", ar: "لا توجد مهام بعد." },
  schedule_title: { en: "Schedule", ar: "الجدول" },
  shots_count: { en: "shots", ar: "لقطة" },
  general_call: { en: "GENERAL CALL", ar: "النداء العام" },
  location: { en: "LOCATION", ar: "الموقع" },
  locations: { en: "LOCATIONS", ar: "المواقع" },
  weather: { en: "WEATHER", ar: "الطقس" },
  key_contacts: { en: "Key contacts", ar: "جهات الاتصال الرئيسية" },
  locations_section: { en: "Locations", ar: "المواقع" },
  client_calls: { en: "Client calls", ar: "نداءات العميل" },
  schedule: { en: "Schedule", ar: "الجدول" },
  crew: { en: "Crew", ar: "الطاقم" },
  cast: { en: "Cast", ar: "الممثلون" },
  notes: { en: "Notes", ar: "ملاحظات" },
  day_of: { en: "Day {n} of {total}", ar: "اليوم {n} من {total}" },
  map: { en: "map", ar: "خريطة" },
  name: { en: "NAME", ar: "الاسم" },
  role: { en: "ROLE", ar: "الدور" },
  phone: { en: "PHONE", ar: "الهاتف" },
  call: { en: "CALL", ar: "النداء" },
  date: { en: "DATE", ar: "التاريخ" },
  type: { en: "TYPE", ar: "النوع" },
  title_col: { en: "TITLE", ar: "العنوان" },
  locations_col: { en: "LOCATIONS", ar: "المواقع" },
  nothing_scheduled: { en: "Nothing scheduled yet.", ar: "لا شيء مجدول بعد." },
  scene: { en: "SC", ar: "مشهد" },
  size: { en: "SIZE", ar: "الحجم" },
  description: { en: "DESCRIPTION", ar: "الوصف" },
  camera: { en: "CAMERA", ar: "الكاميرا" },
  location_col: { en: "LOCATION", ar: "الموقع" },
  cast_col: { en: "CAST", ar: "الممثلون" },
  est: { en: "EST", ar: "المدة" },
  time_col: { en: "TIME", ar: "الوقت" },
  overview: { en: "Production overview", ar: "نظرة عامة على الإنتاج" },
  client: { en: "CLIENT", ar: "العميل" },
  status_l: { en: "STATUS", ar: "الحالة" },
  dates: { en: "DATES", ar: "التواريخ" },
  days_count: { en: "PRODUCTION DAYS", ar: "أيام الإنتاج" },
  finance: { en: "Finance", ar: "المالية" },
  budget_l: { en: "BUDGET", ar: "الميزانية" },
  spent_l: { en: "SPENT", ar: "المصروف" },
  remaining_l: { en: "REMAINING", ar: "المتبقي" },
  costs_l: { en: "Costs", ar: "التكاليف" },
  crew_l: { en: "Crew", ar: "الطاقم" },
  category: { en: "CATEGORY", ar: "الفئة" },
  amount_col: { en: "AMOUNT", ar: "المبلغ" },
  payment_col: { en: "PAYMENT", ar: "الدفع" },
  rate_col: { en: "RATE", ar: "الأجر" },
  days_col: { en: "DAYS", ar: "الأيام" },
  total_col: { en: "TOTAL", ar: "الإجمالي" },
  total_costs: { en: "Total costs", ar: "إجمالي التكاليف" },
  crew_total: { en: "Crew total", ar: "إجمالي الطاقم" },
  no_costs: { en: "No costs recorded.", ar: "لا توجد تكاليف مسجلة." },
  no_crew: { en: "No crew assigned.", ar: "لا يوجد طاقم." },
  pay_unpaid: { en: "Unpaid", ar: "غير مدفوع" },
  pay_partial: { en: "Partial", ar: "جزئي" },
  pay_paid: { en: "Paid", ar: "مدفوع" },
  flat_fee: { en: "flat", ar: "مقطوع" },
  crew_rollup: { en: "Crew total (from crew table)", ar: "إجمالي الطاقم (من جدول الطاقم)" },
} as const;

export function sheetLabel(
  key: keyof typeof SHEET_LABELS,
  lang: SheetLang
): string {
  return SHEET_LABELS[key][lang];
}

export const DAY_TYPE_LABELS_AR: Record<DayType, string> = {
  shoot: "تصوير",
  prep: "تحضير",
  post_deadline: "ما بعد الإنتاج",
  delivery: "تسليم",
};

export function dayTypeLabel(type: DayType, lang: SheetLang): string {
  return lang === "ar" ? DAY_TYPE_LABELS_AR[type] : DAY_TYPE_LABELS[type];
}
