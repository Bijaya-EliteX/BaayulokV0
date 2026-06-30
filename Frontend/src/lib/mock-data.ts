import medical from "@/assets/campaign-medical.jpg";
import dialysis from "@/assets/campaign-dialysis.png";
import icu from "@/assets/campaign-icu.png";
import maternity from "@/assets/campaign-maternity.png";

export type Category =
  | "Surgery"
  | "Cancer Care"
  | "Emergency Care"
  | "Maternity & Newborn"
  | "Child Health"
  | "Chronic Illness"
  | "Transplant";

export const categories: { name: Category; emoji: string; count: number }[] = [
  { name: "Surgery", emoji: "🫀", count: 64 },
  { name: "Cancer Care", emoji: "🎗️", count: 48 },
  { name: "Emergency Care", emoji: "🚑", count: 39 },
  { name: "Maternity & Newborn", emoji: "🍼", count: 27 },
  { name: "Child Health", emoji: "🧸", count: 33 },
  { name: "Chronic Illness", emoji: "💊", count: 41 },
  { name: "Transplant", emoji: "🩸", count: 18 },
];

export type Campaign = {
  slug: string;
  title: string;
  category: Category;
  cover: string;
  goal: number;
  raised: number;
  donors: number;
  daysLeft: number;
  location: string;
  beneficiary: string;
  story: string;
  verified: boolean;
};

export const campaigns: Campaign[] = [
  {
    slug: "save-aarav-heart-surgery",
    title: "Help 6-year-old Aarav get life-saving heart surgery",
    category: "Surgery",
    cover: medical,
    goal: 1500000,
    raised: 968400,
    donors: 412,
    daysLeft: 18,
    location: "Kathmandu",
    beneficiary: "Aarav Sharma",
    story:
      "Aarav was born with a congenital heart defect. Doctors at Manmohan Cardiothoracic Center have recommended an urgent valve repair. The family has exhausted their savings — your support can give him a full childhood.",
    verified: true,
  },
  {
    slug: "dialysis-support-for-kamala",
    title: "Ongoing dialysis for Kamala — chronic kidney failure",
    category: "Chronic Illness",
    cover: dialysis,
    goal: 450000,
    raised: 312500,
    donors: 188,
    daysLeft: 32,
    location: "Jumla",
    beneficiary: "Kamala Bohara",
    story:
      "Kamala, 58, needs dialysis three times a week after both her kidneys failed. Each session costs more than her family earns in a week. We are raising funds for six months of treatment at Karnali Academy of Health Sciences.",
    verified: true,
  },
  {
    slug: "trauma-icu-care-bishal",
    title: "ICU care for Bishal after a highway accident",
    category: "Emergency Care",
    cover: icu,
    goal: 2200000,
    raised: 745000,
    donors: 256,
    daysLeft: 45,
    location: "Sindhupalchok",
    beneficiary: "Bishal Magar",
    story:
      "Bishal, a 24-year-old electrician, suffered severe head and chest trauma in a bus accident. He is on ventilator support in the ICU. The family needs NPR 22 lakh to cover surgery and weeks of intensive care.",
    verified: true,
  },
  {
    slug: "cancer-treatment-sita",
    title: "Sita's chemotherapy — Stage 2 breast cancer",
    category: "Cancer Care",
    cover: medical,
    goal: 800000,
    raised: 240000,
    donors: 97,
    daysLeft: 60,
    location: "Pokhara",
    beneficiary: "Sita Gurung",
    story:
      "Sita, a single mother of two, was diagnosed with Stage 2 breast cancer in March. She needs six cycles of chemotherapy at Bhaktapur Cancer Hospital.",
    verified: false,
  },
  {
    slug: "nicu-care-for-baby-meera",
    title: "NICU care for premature baby Meera",
    category: "Maternity & Newborn",
    cover: maternity,
    goal: 350000,
    raised: 280000,
    donors: 134,
    daysLeft: 12,
    location: "Biratnagar",
    beneficiary: "Baby Meera Tamang",
    story:
      "Born at just 29 weeks, baby Meera needs at least three more weeks in the neonatal intensive care unit. Her father, a daily-wage worker, cannot afford the incubator and specialist care costs.",
    verified: true,
  },
  {
    slug: "liver-transplant-for-dorje",
    title: "Liver transplant for Dorje — end-stage liver disease",
    category: "Transplant",
    cover: icu,
    goal: 600000,
    raised: 410000,
    donors: 302,
    daysLeft: 22,
    location: "Mustang",
    beneficiary: "Dorje Lama",
    story:
      "Dorje, 46, has end-stage liver disease and his doctors have approved a living-donor liver transplant. His sister is a matched donor. We are raising funds for the surgery and post-operative medication.",
    verified: true,
  },
];

export const stats = {
  campaigns: 360,
  donors: 12480,
  raised: 48_320_000,
};

export const alliances = [
  "eSewa",
  "Khalti",
  "NamastePay",
  "Fonepay",
  "IME Pay",
  "ConnectIPS",
  "NIC ASIA",
  "NMB Bank",
];

export const formatNpr = (n: number) =>
  `NPR ${new Intl.NumberFormat("en-IN").format(n)}`;
