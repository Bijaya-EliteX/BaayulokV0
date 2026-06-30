import medical from "@/assets/campaign-medical.jpg";
import education from "@/assets/campaign-education.jpg";
import disaster from "@/assets/campaign-disaster.jpg";

export type Category =
  | "Medical"
  | "Education"
  | "Disaster Relief"
  | "Animals"
  | "Community"
  | "Sports"
  | "Memorial";

export const categories: { name: Category; emoji: string; count: number }[] = [
  { name: "Medical", emoji: "🩺", count: 124 },
  { name: "Education", emoji: "🎓", count: 86 },
  { name: "Disaster Relief", emoji: "⛑️", count: 41 },
  { name: "Animals", emoji: "🐾", count: 22 },
  { name: "Community", emoji: "🤝", count: 58 },
  { name: "Sports", emoji: "⚽", count: 17 },
  { name: "Memorial", emoji: "🕊️", count: 12 },
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
    category: "Medical",
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
    slug: "books-for-jumla-school",
    title: "Books and benches for 200 students in Jumla",
    category: "Education",
    cover: education,
    goal: 450000,
    raised: 312500,
    donors: 188,
    daysLeft: 32,
    location: "Jumla",
    beneficiary: "Saraswati Primary School",
    story:
      "Saraswati Primary has 200 students sharing 40 textbooks. We are raising funds for a full classroom library and 30 new wooden benches built by local carpenters.",
    verified: true,
  },
  {
    slug: "rebuild-sindhupalchok-homes",
    title: "Rebuild 12 homes destroyed by Sindhupalchok landslide",
    category: "Disaster Relief",
    cover: disaster,
    goal: 2200000,
    raised: 745000,
    donors: 256,
    daysLeft: 45,
    location: "Sindhupalchok",
    beneficiary: "Melamchi Ward 4 families",
    story:
      "The August monsoon triggered a landslide that wiped out twelve homes in our ward. Families are sheltering in a school. We need NPR 22 lakh to rebuild simple, safe houses before winter.",
    verified: true,
  },
  {
    slug: "cancer-treatment-sita",
    title: "Sita's chemotherapy — Stage 2 breast cancer",
    category: "Medical",
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
    slug: "scholarship-meera-engineering",
    title: "Send Meera to engineering college",
    category: "Education",
    cover: education,
    goal: 350000,
    raised: 280000,
    donors: 134,
    daysLeft: 12,
    location: "Biratnagar",
    beneficiary: "Meera Tamang",
    story:
      "Meera scored in the top 1% of the IOE entrance. Her father, a daily-wage worker, cannot afford the 4-year tuition at Pulchowk Engineering Campus.",
    verified: true,
  },
  {
    slug: "winter-blankets-mustang",
    title: "1,000 winter blankets for Upper Mustang families",
    category: "Community",
    cover: disaster,
    goal: 600000,
    raised: 410000,
    donors: 302,
    daysLeft: 22,
    location: "Mustang",
    beneficiary: "Lo Manthang community",
    story:
      "Winters in Upper Mustang drop to -20°C. We are distributing 1,000 thick wool blankets sourced from a local weaver cooperative.",
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