/**
 * AIML Batchfolio — API Service
 * All student data is fetched exclusively from the FastAPI backend.
 * Configure NEXT_PUBLIC_API_BASE_URL for deployed environments.
 */
import { BATCH_INFO } from './students-data.js';

const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
if (process.env.NODE_ENV === 'production' && !configuredApiBase) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL must be set to the deployed API URL.');
}

const API_BASE = (configuredApiBase || 'http://127.0.0.1:8000/api').replace(/\/+$/, '');
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

// ── Token helpers ─────────────────────────────────────────────────────────────
export function saveToken(token) {
  sessionStorage.setItem('batchfolio_token', token);
}
export function clearToken() {
  sessionStorage.removeItem('batchfolio_token');
  sessionStorage.removeItem('batchfolio_user');
}
export function getToken() {
  return sessionStorage.getItem('batchfolio_token') || null;
}
export function getLoggedInUser() {
  try {
    const raw = sessionStorage.getItem('batchfolio_user');
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
  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=6366f1&color=fff&size=200`;

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
    if (data.user) sessionStorage.setItem('batchfolio_user', JSON.stringify(data.user));
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
    if (data.usn) {
      sessionStorage.setItem('batchfolio_user', JSON.stringify({ name: data.name, usn: data.usn, id: data.id }));
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
};
