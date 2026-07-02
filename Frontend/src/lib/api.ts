const API_BASE = "http://localhost:5157/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function storeUser(u: UserProfile) {
  localStorage.setItem("user", JSON.stringify(u));
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  skipAuthRedirect = false
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && !skipAuthRedirect) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getToken()}`;
      const retry = await fetch(`${API_BASE}${path}`, { ...options, headers });
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({ message: "Request failed" }));
        throw new ApiError(err.message || "Request failed", retry.status);
      }
      return retry.json();
    }
    clearTokens();
    if (typeof window !== "undefined") {
      sessionStorage.setItem("openAuthModal", "1");
      window.location.href = "/";
    }
    throw new ApiError("Unauthorized", 401);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new ApiError(err.message || "Request failed", res.status);
  }

  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return false;
    const json = await res.json();
    if (json.success && json.data) {
      setTokens(json.data.accessToken, json.data.refreshToken);
      storeUser(json.data.user);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const formatNpr = (n: number) =>
  `NPR ${new Intl.NumberFormat("en-IN").format(n)}`;

const API_ORIGIN = API_BASE.replace("/api", "");
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_ORIGIN}${url}`;
}

// --- Types ---
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatar: string | null;
  role: string;
  kycStatus: string;
  createdAt: string;
}

export interface DocumentInfo {
  id: string;
  documentType: string;
  fileUrl: string;
  fileName: string;
}

export interface CampaignData {
  id: string;
  slug: string;
  title: string;
  category: string;
  categoryEmoji: string | null;
  coverImage: string | null;
  goal: number;
  raised: number;
  donorsCount: number;
  daysLeft: number;
  province: string;
  district: string;
  location: string;
  beneficiaryName: string;
  relationship: string;
  hospital: string;
  story: string;
  status: string;
  verified: boolean;
  rejectionReason: string | null;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
  images: string[];
  documents: DocumentInfo[];
}

export interface CategoryData {
  id: string;
  name: string;
  emoji: string | null;
  slug: string;
  campaignCount: number;
}

export interface DonationData {
  id: string;
  campaignSlug: string;
  campaignTitle: string;
  amount: number;
  donorName: string | null;
  message: string | null;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface EsewaPaymentData {
  donationId: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  transactionUuid: string;
  productCode: string;
  successUrl: string;
  failureUrl: string;
  signedFieldNames: string;
  signature: string;
  paymentUrl: string;
}

export interface DashboardStats {
  totalRaised: number;
  activeCampaigns: number;
  lifetimeDonated: number;
}

export interface UserCampaign {
  id: string;
  slug: string;
  title: string;
  category: string;
  goal: number;
  raised: number;
  donorsCount: number;
  status: string;
  createdAt: string;
}

export interface UserDonation {
  id: string;
  campaignSlug: string;
  campaignTitle: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface AdminCampaign {
  id: string;
  slug: string;
  title: string;
  category: string;
  coverImage: string | null;
  goal: number;
  raised: number;
  donorsCount: number;
  beneficiaryName: string;
  location: string;
  status: string;
  verified: boolean;
  creatorName: string;
  creatorEmail: string;
  createdAt: string;
  images: string[];
}

export interface PlatformStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalDonors: number;
  totalRaised: number;
}

export interface DonorInfo {
  name: string | null;
  amount: number;
  message: string | null;
  date: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserProfile;
}

interface ApiResult<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- Auth API ---
export const authApi = {
  signup: (fullName: string, email: string, password: string) =>
    request<ApiResult<AuthResponse>>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password }),
    }, true),
  login: (email: string, password: string) =>
    request<ApiResult<AuthResponse>>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, true),
  googleLogin: (idToken: string) =>
    request<ApiResult<AuthResponse>>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }, true),
  me: () => request<ApiResult<UserProfile>>("/auth/me", {}, true),
  refresh: (refreshToken: string) =>
    request<ApiResult<AuthResponse>>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }, true),
  logout: (refreshToken: string) =>
    request<ApiResult<object>>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
  updateProfile: (fullName: string, avatar?: string) =>
    request<ApiResult<UserProfile>>("/auth/me", {
      method: "PUT",
      body: JSON.stringify({ fullName, avatar }),
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<ApiResult<object>>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// --- Categories API ---
export const categoriesApi = {
  list: () => request<ApiResult<CategoryData[]>>("/categories"),
};

// --- Campaigns API ---
export const campaignsApi = {
  list: (params?: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.category) qs.set("category", params.category);
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();
    return request<PagedResult<CampaignData>>(`/campaigns${q ? `?${q}` : ""}`);
  },
  get: (slug: string) => request<ApiResult<CampaignData>>(`/campaigns/${slug}`),
  create: (data: {
    title: string;
    category: string;
    goal: number;
    province: string;
    district: string;
    beneficiaryName: string;
    relationship: string;
    hospital: string;
    story: string;
    coverImages: string[];
    citizenshipUrl: string;
    hospitalLetterUrl: string;
    medicalBillsUrls?: string[];
  }) =>
    request<ApiResult<CampaignData>>("/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (slug: string, data: { title?: string; story?: string; coverImage?: string }) =>
    request<ApiResult<CampaignData>>(`/campaigns/${slug}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  donors: (slug: string) => request<ApiResult<DonorInfo[]>>(`/campaigns/${slug}/donors`),
};

// --- Donations API ---
export const donationsApi = {
  create: (data: {
    campaignSlug: string;
    amount: number;
    donorName?: string;
    message?: string;
    paymentMethod: string;
  }) =>
    request<ApiResult<DonationData>>("/donations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  get: (id: string) => request<ApiResult<DonationData>>(`/donations/${id}`),
  getEsewaPayment: (id: string) =>
    request<ApiResult<EsewaPaymentData>>(`/donations/${id}/esewa-payment`, {
      method: "POST",
    }),
  verifyEsewaPayment: (id: string, refId: string) =>
    request<ApiResult<DonationData>>(`/donations/${id}/esewa-verify`, {
      method: "POST",
      body: JSON.stringify({ refId, oid: id }),
    }),
};

// --- Users API ---
export const usersApi = {
  myCampaigns: () => request<ApiResult<UserCampaign[]>>("/users/me/campaigns"),
  myDonations: () => request<ApiResult<UserDonation[]>>("/users/me/donations"),
  stats: () => request<ApiResult<DashboardStats>>("/users/me/stats"),
};

// --- Admin API ---
export const adminApi = {
  campaigns: (status?: string) => {
    const qs = status ? `?status=${status}` : "";
    return request<ApiResult<AdminCampaign[]>>(`/admin/campaigns${qs}`);
  },
  approve: (slug: string) =>
    request<ApiResult<AdminCampaign>>(`/admin/campaigns/${slug}/approve`, {
      method: "POST",
    }),
  reject: (slug: string, reason: string) =>
    request<ApiResult<AdminCampaign>>(`/admin/campaigns/${slug}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  stats: () => request<ApiResult<PlatformStats>>("/admin/stats"),
  delete: (slug: string) =>
    request<ApiResult<object>>(`/admin/campaigns/${slug}`, {
      method: "DELETE",
    }),
};

// --- Stats API ---
export const statsApi = {
  get: () => request<ApiResult<PlatformStats>>("/stats"),
};

// --- Upload API ---
export const uploadApi = {
  file: async (file: File): Promise<string> => {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) throw new ApiError("Upload failed", res.status);
    const json = await res.json();
    return json.data.url;
  },
};
