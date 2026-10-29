/**
 * AIML Batchfolio — API Service
 * All student data is fetched exclusively from the FastAPI backend.
 * Backend URL: http://localhost:8000
 */
import { BATCH_INFO } from './students-data.js';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
const TIMEOUT_MS = 10000;

// ── Internal: fetch with timeout ──────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
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
}
export function getToken() {
  return sessionStorage.getItem('batchfolio_token') || null;
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
    bio:      row.bio || 'No bio has been added yet.',
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
};
