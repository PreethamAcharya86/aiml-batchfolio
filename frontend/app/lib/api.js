/**
 * AIML Batchfolio — API Service
 * All student data is fetched exclusively from the FastAPI backend.
 * Configure NEXT_PUBLIC_API_BASE_URL for deployed environments.
 */
import { BATCH_INFO } from './students-data.js';

const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();


const API_BASE = (configuredApiBase || 'http://127.0.0.1:8001/api').replace(/\/+$/, '');
const TIMEOUT_MS = 10000;

// ── Internal: fetch with timeout ──────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const defaultHeaders = isFormData ? {} : { 'Content-Type': 'application/json' };
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ── Token & Session helpers (SSR Safe, 24-Hour Multi-Tab Persistence) ────────
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function saveToken(token) {
  if (typeof window !== 'undefined') {
    const expiresAt = Date.now() + SESSION_TTL_MS;
    try {
      localStorage.setItem('batchfolio_token', token);
      localStorage.setItem('batchfolio_expires_at', String(expiresAt));
    } catch {}
    try {
      sessionStorage.setItem('batchfolio_token', token);
    } catch {}
  }
}

export function clearToken() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('batchfolio_token');
      localStorage.removeItem('batchfolio_user');
      localStorage.removeItem('batchfolio_expires_at');
      localStorage.removeItem('batchfolio_otp_verified');
    } catch {}
    try {
      sessionStorage.removeItem('batchfolio_token');
      sessionStorage.removeItem('batchfolio_user');
      sessionStorage.removeItem('batchfolio_otp_verified');
    } catch {}
  }
}

export function getToken() {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Check TTL expiration
    const expStr = localStorage.getItem('batchfolio_expires_at');
    if (expStr && Date.now() > Number(expStr)) {
      clearToken();
      return null;
    }

    // 2. Retrieve token from localStorage (persists across tabs) or sessionStorage fallback
    const token = localStorage.getItem('batchfolio_token') || sessionStorage.getItem('batchfolio_token');
    if (!token) return null;

    // 3. Validate JWT exp claim if present
    const payloadBase64 = token.split('.')[1];
    if (payloadBase64) {
      const decoded = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        clearToken();
        return null;
      }
    }

    return token;
  } catch {
    return localStorage.getItem('batchfolio_token') || sessionStorage.getItem('batchfolio_token') || null;
  }
}

export function isOtpVerified() {
  if (typeof window === 'undefined') return false;
  if (!getToken()) return false;
  try {
    return (
      localStorage.getItem('batchfolio_otp_verified') === 'true' ||
      sessionStorage.getItem('batchfolio_otp_verified') === 'true'
    );
  } catch {
    return false;
  }
}

export function setOtpVerified(verified = true) {
  if (typeof window === 'undefined') return;
  try {
    if (verified) {
      localStorage.setItem('batchfolio_otp_verified', 'true');
      sessionStorage.setItem('batchfolio_otp_verified', 'true');
    } else {
      localStorage.removeItem('batchfolio_otp_verified');
      sessionStorage.removeItem('batchfolio_otp_verified');
    }
  } catch {}
}

export function getLoggedInUser() {
  if (typeof window === 'undefined') return null;
  if (!getToken()) return null;

  try {
    const raw = localStorage.getItem('batchfolio_user') || sessionStorage.getItem('batchfolio_user');
    if (raw) return JSON.parse(raw);
  } catch {}

  const token = getToken();
  if (!token) return null;
  try {
    const payloadBase64 = token.split('.')[1];
    const decoded = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
    return {
      usn: decoded.sub || null,
      email: decoded.email || null,
      id: decoded.id || null,
    };
  } catch {
    return null;
  }
}

// ── Normalize a backend student row → frontend shape ─────────────────────────
function normalizeStudent(row) {
  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=00638E&color=FFFFFF&size=200`;

  return {
    id:       row.id,
    usn:      row.usn,
    fullName: row.name,
    email:    row.email,
    branch:   row.dept || 'AIML',
    batch:    '2024-2028',
    avatar:   row.profile_picture_url || avatarFallback,
    role:     `${row.dept || 'Student'} Student`,
    category: row.dept === 'AIML' ? 'AI/ML' : row.dept,
    skills:   Array.isArray(row.skills) ? row.skills : [],
    bio:      row.bio?.trim() || '',
    projects: [],
    social: {
      github:    row.github_url    || null,
      linkedin:  row.linkedin_url  || null,
      instagram: row.instagram_url || null,
      email:     row.email,
      portfolio: row.portfolio_website_url || null,
    },
    resumeUrl: row.resume_url || null,
    phone:     row.phone_no   || null,
    dob:       row.dob        || null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
export const ApiService = {

  /** GET /api/batch-info */
  async getBatchInfo() {
    try {
      const res = await apiFetch('/batch-info');
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return BATCH_INFO; // static fallback
    }
  },

  /**
   * GET /api/students
   * Returns all students from the DB. Shows empty state if none exist yet.
   */
  async getStudents() {
    const res = await apiFetch('/students');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to load students');
    }
    const rows = await res.json();
    return Array.isArray(rows) ? rows.map(normalizeStudent) : [];
  },

  /** GET /api/students/{usn} */
  async getStudentByUsn(usn) {
    const res = await apiFetch(`/students/${encodeURIComponent(usn)}`);
    if (!res.ok) throw new Error('Student not found');
    return normalizeStudent(await res.json());
  },

  /**
   * POST /api/auth/login
   * USN and DOB in DDMMYYYY format.
   */
  async login({ usn, password }) {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usn, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    if (data.access_token) saveToken(data.access_token);
    if (data.user && typeof window !== 'undefined') {
      try {
        localStorage.setItem('batchfolio_user', JSON.stringify(data.user));
        sessionStorage.setItem('batchfolio_user', JSON.stringify(data.user));
      } catch {}
    }
    return { success: true, ...data };
  },

  /** GET /api/students/me — current student's profile (JWT required) */
  async getMyProfile() {
    const token = getToken();
    if (!token) throw new Error('Not authenticated. Please log in.');
    const res = await apiFetch('/students/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) clearToken();
      throw new Error(data.detail || 'Failed to load profile');
    }
    if (data.usn && typeof window !== 'undefined') {
      try {
        const u = { name: data.name, usn: data.usn, id: data.id };
        localStorage.setItem('batchfolio_user', JSON.stringify(u));
        sessionStorage.setItem('batchfolio_user', JSON.stringify(u));
      } catch {}
    }
    return data;
  },

  /** PUT /api/students/{usn} — Edit own profile (JWT required) */
  async updateProfile(usn, updates) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated. Please log in.');
    const res = await apiFetch(`/students/${encodeURIComponent(usn)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Update failed');
    return data;
  },

  /** POST /api/students/{usn}/profile-picture (file upload) */
  async uploadProfilePicture(usn, file) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated. Please log in.');
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch(`/students/${encodeURIComponent(usn)}/profile-picture`, {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to upload profile picture');
    return data;
  },

  /** DELETE /api/students/{usn}/profile-picture */
  async removeProfilePicture(usn) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated. Please log in.');
    const res = await apiFetch(`/students/${encodeURIComponent(usn)}/profile-picture`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to remove profile picture');
    return data;
  },

  /** POST /api/students/{usn}/resume (PDF file upload) */
  async uploadResume(usn, file) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated. Please log in.');
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch(`/students/${encodeURIComponent(usn)}/resume`, {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to upload resume');
    return data;
  },

  /** DELETE /api/students/{usn}/resume */
  async removeResume(usn) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated. Please log in.');
    const res = await apiFetch(`/students/${encodeURIComponent(usn)}/resume`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to remove resume');
    return data;
  },

  /** DELETE /api/students/{usn}/profile — Delete/reset profile details (keeps login account) */
  async deleteProfile(usn) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated. Please log in.');
    const res = await apiFetch(`/students/${encodeURIComponent(usn)}/profile`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to delete profile');
    return data;
  },

  /** POST /api/auth/send-otp - send 6-digit OTP to student's email */
  async sendOtp(resend = false) {
    const token = getToken();
    if (!token) throw new Error('Authentication required. Please log in.');
    const query = resend ? '?resend=true' : '';
    const res = await apiFetch(`/auth/send-otp${query}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to send OTP verification code.');
    }
    return data;
  },

  /** POST /api/auth/verify-otp - verify 6-digit OTP */
  async verifyOtp(otp) {
    const token = getToken();
    if (!token) throw new Error('Authentication required. Please log in.');
    const res = await apiFetch('/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ otp: String(otp).trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Invalid or expired verification code.');
    }
    setOtpVerified(true);
    return data;
  },
};
