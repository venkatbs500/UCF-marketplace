export const YEAR_OPTIONS = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate Student",
] as const;

export type YearOption = (typeof YEAR_OPTIONS)[number];

export const CAMPUS_AREA_OPTIONS = [
  "Main Campus",
  "Knights Circle",
  "The Pointe",
  "Plaza on University",
  "NorthView",
  "Downtown Orlando",
  "Other",
] as const;

export type CampusAreaOption = (typeof CAMPUS_AREA_OPTIONS)[number];

export const INTEREST_OPTIONS = [
  "Buying & Selling",
  "Housing",
  "Tutoring",
  "Campus Jobs",
  "Events",
  "AI Study Tools",
  "Student Discounts",
  "Lost & Found",
  "Gaming",
  "Fitness",
  "Research",
  "Startups",
] as const;

export type InterestOption = (typeof INTEREST_OPTIONS)[number];

export type OnboardingData = {
  name: string;
  major: string;
  year: YearOption;
  campusArea: CampusAreaOption;
  interests: InterestOption[];
};
