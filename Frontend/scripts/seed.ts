// scripts/seed.ts
import { campaignsApi } from "@/lib/api";

const sampleCampaigns = [
  {
    title: "Heart Surgery for Baby",
    category: "Surgery",
    goal: 500000,
    province: "Bagmati",
    district: "Kathmandu",
    beneficiaryName: "Baby A",
    relationship: "Child",
    hospital: "Hospital A",
    story: "A newborn needs urgent heart surgery.",
    coverImage: null,
  },
  {
    title: "Cancer Treatment for Mom",
    category: "Cancer Care",
    goal: 800000,
    province: "Gandaki",
    district: "Pokhara",
    beneficiaryName: "Mrs. B",
    relationship: "Mother",
    hospital: "Hospital B",
    story: "She is battling cancer and needs support.",
    coverImage: null,
  },
  {
    title: "Emergency Care for Accident Victim",
    category: "Emergency Care",
    goal: 300000,
    province: "Lumbini",
    district: "Kapilvastu",
    beneficiaryName: "John Doe",
    relationship: "Friend",
    hospital: "Hospital C",
    story: "Accident victim needs immediate care.",
    coverImage: null,
  },
  {
    title: "Maternity & Newborn Support",
    category: "Maternity & Newborn",
    goal: 250000,
    province: "Koshi",
    district: "Sunsari",
    beneficiaryName: "Mrs. C",
    relationship: "Mother",
    hospital: "Hospital D",
    story: "Support safe delivery and newborn care.",
    coverImage: null,
  },
  {
    title: "Child Health Vaccination Camp",
    category: "Child Health",
    goal: 150000,
    province: "Province 1",
    district: "Bhojpur",
    beneficiaryName: "Community",
    relationship: "Children",
    hospital: "Hospital E",
    story: "Vaccination drive for children.",
    coverImage: null,
  },
  {
    title: "Chronic Illness Management",
    category: "Chronic Illness",
    goal: 400000,
    province: "Madhesh",
    district: "Dhanusha",
    beneficiaryName: "Mr. D",
    relationship: "Relative",
    hospital: "Hospital F",
    story: "Long-term care for chronic condition.",
    coverImage: null,
  },
];

async function seed() {
  for (const data of sampleCampaigns) {
    try {
      await campaignsApi.create(data);
      console.log(`Created campaign: ${data.title}`);
    } catch (e) {
      console.error(`Failed to create ${data.title}:`, e);
    }
  }
}

seed();
