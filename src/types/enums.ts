export const ACTIVITY_TYPES = [
  "phone",
  "email",
  "meeting_online",
  "meeting_in_person",
  "follow_up",
  "offer_prep",
  "other",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_STATUSES = [
  "planned",
  "completed",
  "rescheduled",
  "not_done",
  "cancelled",
] as const;
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export const ACTIVITY_RESULTS = [
  "contact_made",
  "no_response",
  "next_contact_scheduled",
  "meeting_scheduled",
  "materials_sent",
  "offer_agreed",
  "no_interest",
  "wrong_contact",
  "lead_disqualified",
  "other",
] as const;
export type ActivityResult = (typeof ACTIVITY_RESULTS)[number];

export const CANCELLATION_REASONS = [
  "client_cancelled",
  "salesperson_cancelled",
  "no_interest",
  "priority_change",
  "topic_outdated",
  "lead_disqualified",
  "created_by_mistake",
  "other",
] as const;
export type CancellationReason = (typeof CANCELLATION_REASONS)[number];

export const LEAD_SOURCES = [
  "marketing",
  "web_form",
  "webinar",
  "linkedin",
  "referral",
  "prospecting",
  "partner",
  "vendor",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const INTEREST_AREAS = [
  "lan_wlan",
  "cybersecurity",
  "nis2",
  "ai",
  "voip",
  "conference_rooms",
  "isp",
] as const;
export type InterestArea = (typeof INTEREST_AREAS)[number];

export const LEAD_STATUSES = [
  "new",
  "in_progress",
  "qualified",
  "proposal",
  "won",
  "lost",
  "disqualified",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const ACTIVE_LEAD_STATUSES: LeadStatus[] = [
  "new",
  "in_progress",
  "qualified",
  "proposal",
];

export const SALESPERSON_STATUSES = ["active", "inactive"] as const;
export type SalespersonStatus = (typeof SALESPERSON_STATUSES)[number];

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  phone: "Telefon",
  email: "E-mail / kontakt mailowy",
  meeting_online: "Spotkanie online",
  meeting_in_person: "Spotkanie osobiste",
  follow_up: "Follow-up",
  offer_prep: "Przygotowanie oferty",
  other: "Inne działanie",
};

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  planned: "Zaplanowane",
  completed: "Wykonane",
  rescheduled: "Przełożone",
  not_done: "Niewykonane",
  cancelled: "Anulowane",
};

export const ACTIVITY_RESULT_LABELS: Record<ActivityResult, string> = {
  contact_made: "Kontakt nawiązany",
  no_response: "Brak odpowiedzi",
  next_contact_scheduled: "Umówiono kolejny kontakt",
  meeting_scheduled: "Umówiono spotkanie",
  materials_sent: "Wysłano materiały",
  offer_agreed: "Ustalono przygotowanie oferty",
  no_interest: "Brak zainteresowania",
  wrong_contact: "Niewłaściwa osoba kontaktowa",
  lead_disqualified: "Lead zdyskwalifikowany",
  other: "Inny",
};

export const CANCELLATION_REASON_LABELS: Record<CancellationReason, string> = {
  client_cancelled: "Klient odwołał",
  salesperson_cancelled: "Handlowiec odwołał",
  no_interest: "Brak zainteresowania",
  priority_change: "Zmiana priorytetów klienta",
  topic_outdated: "Temat nieaktualny",
  lead_disqualified: "Lead zdyskwalifikowany",
  created_by_mistake: "Błędnie utworzone wydarzenie",
  other: "Inny",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  marketing: "Marketing",
  web_form: "Formularz WWW",
  webinar: "Webinar",
  linkedin: "LinkedIn",
  referral: "Polecenie",
  prospecting: "Prospecting",
  partner: "Partner",
  vendor: "Producent",
};

export const INTEREST_AREA_LABELS: Record<InterestArea, string> = {
  lan_wlan: "LAN/WLAN",
  cybersecurity: "Cyberbezpieczeństwo",
  nis2: "NIS2",
  ai: "AI",
  voip: "VoIP",
  conference_rooms: "Sale konferencyjne",
  isp: "ISP",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nowy",
  in_progress: "W trakcie",
  qualified: "Zakwalifikowany",
  proposal: "Oferta",
  won: "Wygrany",
  lost: "Przegrany",
  disqualified: "Zdyskwalifikowany",
};
