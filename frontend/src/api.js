/**
 * AIML Batchfolio — API Service
 * All student data is fetched exclusively from the FastAPI backend.
 * Backend URL: http://localhost:8000
 */
import { BATCH_INFO } from './students-data.js';

const API_BASE = window.BATCHFOLIO_API_BASE || 'http://127.0.0.1:8000/api';
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
    year:     row.year,
    avatar:   row.profile_picture_url || avatarFallback,
    role:     'AIML Scholar',
    category: 'AI/ML',
    skills:   ['Python', 'Machine Learning', 'Deep Learning', 'Data Science'],
    bio:      `${row.name} is an AIML scholar at MITE (Batch 2024-2028, ${row.usn}), actively building expertise in Artificial Intelligence and Machine Learning under the mentorship of HOD Dr. Sunil Kumar and the ARTIFERA student forum.`,
    projects: [
      {
        title: 'AI Research Initiative',
        description: 'End-to-end machine learning pipeline designed for real-world intelligent inference.',
        tech: ['Python', 'TensorFlow', 'FastAPI'],
      },
    ],
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
   * identifier: USN or email
   * password: DDMMYYYY (derived from DOB)
   */
  async login({ identifier, password }) {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    if (data.access_token) saveToken(data.access_token);
    return { success: true, ...data };
  },

  /**
   * POST /api/auth/signup
   * Password is NOT sent — the backend derives it from dob (DDMMYYYY).
   */
  async signup({ name, usn, email, dob, phone_no, year, branch = 'AIML' }) {
    const res = await apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, usn, email, dob, phone_no, year, dept: branch }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Signup failed');
    if (data.access_token) saveToken(data.access_token);
    return { success: true, message: 'Account registered on AIML Batchfolio!', ...data };
  },

  /** PUT /api/students/{usn} — Edit own profile (JWT required) */
  async updateProfile(usn, updates) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated. Please log in.');
    const res = await apiFetch(`/students/${usn}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Update failed');
    return data;
  },
};
