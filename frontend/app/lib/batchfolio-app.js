/**
 * AIML Batchfolio (2024-2028)
 * Main Application Logic
 */
import { ApiService } from './api.js';

class BatchfolioApp {
  constructor() {
    this.students = [];
    this.filteredStudents = [];
    this.currentCategory = 'ALL';
    this.searchQuery = '';

    // DOM Elements
    this.studentsGrid = document.getElementById('students-grid');
    this.searchInput = document.getElementById('student-search-input');
    this.searchClearBtn = document.getElementById('search-clear-btn');
    this.filterChipsContainer = document.getElementById('filter-chips-container');
    this.visibleCountEl = document.getElementById('visible-count');
    this.totalCountEl = document.getElementById('total-count');
    this.strengthCounterEl = document.getElementById('strength-counter');
    this.footerStrengthEl = document.getElementById('footer-strength');
    this.noResultsEl = document.getElementById('no-results');
    this.resetSearchBtn = document.getElementById('reset-search-btn');

    // Modals
    this.studentModal = document.getElementById('student-modal');
    this.studentModalBody = document.getElementById('student-modal-body');
    this.closeStudentModalBtn = document.getElementById('close-student-modal');

    // Resumes Modal
    this.resumesModal = document.getElementById('resumes-modal');
    this.closeResumesModalBtn = document.getElementById('close-resumes-modal');
    this.navResumesBtn = document.getElementById('nav-btn-resumes');
    this.footerResumesLink = document.getElementById('footer-resumes-link');
    this.resumesListContainer = document.getElementById('resumes-list-container');
    this.resumesFilterInput = document.getElementById('resumes-filter-input');

    this.toastContainer = document.getElementById('toast-container');
  }

  async init() {
    this.attachEventListeners();
    await this.loadData();
    this.renderResumesList();
  }

  /**
   * Load students from backend API (real data only — no mocks)
   */
  async loadData() {
    this.studentsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
        <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
        <div style="font-size: 1.05rem; color: #94a3b8; margin-bottom: 0.5rem;">Loading AIML 2024-2028 Student Portfolios...</div>
        <div style="font-size: 0.85rem; color: #64748b;">Connecting to backend...</div>
      </div>
    `;

    try {
      this.students = await ApiService.getStudents();
      this.filteredStudents = [...this.students];
      this.totalCountEl.textContent = this.students.length;
      this.strengthCounterEl.textContent = this.students.length;
      this.footerStrengthEl.textContent = this.students.length;

      if (this.students.length === 0) {
        this.studentsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">🎓</div>
            <h3 style="font-size: 1.5rem; color: #f1f5f9; margin-bottom: 0.5rem;">No Students Yet</h3>
            <p style="color: #94a3b8; font-size: 0.95rem;">No student records are available yet.</p>
          </div>
        `;
        return;
      }

      this.renderStudents();
      this.renderResumesList();
    } catch (err) {
      console.error('Failed to load students:', err);
      this.studentsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">⚡</div>
          <h3 style="font-size: 1.5rem; color: #f1f5f9; margin-bottom: 0.5rem;">Backend Offline</h3>
          <p style="color: #94a3b8; font-size: 0.95rem; max-width: 480px; margin: 0 auto 1.5rem;">
            Could not reach the API server at <code style="color:#67e8f9;">localhost:8000</code>.
            Please start the backend:<br><br>
            <code style="background: rgba(99,102,241,0.15); padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.9rem;">
              backend\\venv\\Scripts\\uvicorn main:app --reload --port 8000
            </code>
          </p>
          <button class="btn btn-outline" onclick="window.batchfolioApp.loadData()">↺ Retry Connection</button>
        </div>
      `;
      this.showToast('⚡ Backend offline — start the FastAPI server', 'error');
    }
  }

  /**
   * Attach all UI interaction events
   */
  attachEventListeners() {
    // Search input
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.searchClearBtn.style.display = this.searchQuery ? 'flex' : 'none';
      this.applyFilter();
    });

    // Clear search
    this.searchClearBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.searchClearBtn.style.display = 'none';
      this.applyFilter();
      this.searchInput.focus();
    });

    // Reset button in empty state
    this.resetSearchBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.searchClearBtn.style.display = 'none';
      this.setActiveCategory('ALL');
      this.applyFilter();
    });

    // Category filter chips
    this.filterChipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      const category = chip.getAttribute('data-category');
      this.setActiveCategory(category);
      this.applyFilter();
    });

    // Student Modal Close handlers
    this.closeStudentModalBtn.addEventListener('click', () => this.closeModal(this.studentModal));
    this.studentModal.addEventListener('click', (e) => {
      if (e.target === this.studentModal) this.closeModal(this.studentModal);
    });

    // Resumes Modal Triggers
    this.navResumesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.openModal(this.resumesModal);
    });
    if (this.footerResumesLink) {
      this.footerResumesLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal(this.resumesModal);
      });
    }
    this.closeResumesModalBtn.addEventListener('click', () => this.closeModal(this.resumesModal));
    this.resumesModal.addEventListener('click', (e) => {
      if (e.target === this.resumesModal) this.closeModal(this.resumesModal);
    });
    this.resumesFilterInput.addEventListener('input', (e) => {
      this.renderResumesList(e.target.value.toLowerCase().trim());
    });

    // Global keyboard listener (Escape to close any modal)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal(this.studentModal);
        this.closeModal(this.resumesModal);
      }
    });
  }

  /**
   * Set active filter chip styling
   */
  setActiveCategory(category) {
    this.currentCategory = category;
    const chips = this.filterChipsContainer.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
      if (chip.getAttribute('data-category') === category) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  /**
   * Filter students by search term and category
   */
  applyFilter() {
    this.filteredStudents = this.students.filter(student => {
      // Category filter
      const matchesCategory = this.currentCategory === 'ALL' || student.category === this.currentCategory;
      if (!matchesCategory) return false;

      // Text query match
      if (!this.searchQuery) return true;

      const nameMatch = student.fullName.toLowerCase().includes(this.searchQuery);
      const usnMatch = student.usn.toLowerCase().includes(this.searchQuery);
      const roleMatch = student.role.toLowerCase().includes(this.searchQuery);
      const skillMatch = student.skills.some(skill => skill.toLowerCase().includes(this.searchQuery));

      return nameMatch || usnMatch || roleMatch || skillMatch;
    });

    this.renderStudents();
  }

  /**
   * Render student cards to the grid
   */
  renderStudents() {
    this.visibleCountEl.textContent = this.filteredStudents.length;
    this.totalCountEl.textContent = this.students.length;

    if (this.filteredStudents.length === 0) {
      this.studentsGrid.innerHTML = '';
      this.noResultsEl.style.display = 'block';
      return;
    }

    this.noResultsEl.style.display = 'none';

    this.studentsGrid.innerHTML = this.filteredStudents.map(student => `
      <article class="student-card" data-usn="${student.usn}" tabindex="0" role="button" aria-label="View profile of ${student.fullName}">
        
        <!-- Dull hover effect visual cue tag -->
        <div class="card-click-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
          <span>Tap to Expand</span>
        </div>

        <!-- Student Avatar -->
        <div class="card-avatar-wrapper">
          <img 
            src="${student.avatar}" 
            alt="${student.fullName}" 
            class="card-avatar-img"
            loading="lazy"
            onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName)}&background=6366f1&color=fff&size=150';"
          >
          <span class="avatar-badge-branch">${student.branch}</span>
        </div>

        <!-- Student Info -->
        <div class="card-info">
          <h3 class="card-name">${student.fullName}</h3>
          <span class="card-usn-badge">${student.usn}</span>
          <p class="card-role">${student.role}</p>

          <!-- Skills tags -->
          <div class="card-skills-row">
            ${student.skills.slice(0, 3).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>

          <!-- Bottom Card Action Row -->
          <div class="card-action-cue">
            <span class="card-batch-tag">Batch ${student.batch}</span>
            <span class="card-view-btn">
              View Profile
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </span>
          </div>
        </div>

      </article>
    `).join('');

    // Attach click listener to each card for Enlarged Pop-out Modal
    const cards = this.studentsGrid.querySelectorAll('.student-card');
    cards.forEach(card => {
      const usn = card.getAttribute('data-usn');
      const clickHandler = () => this.openEnlargedStudentModal(usn);

      card.addEventListener('click', clickHandler);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          clickHandler();
        }
      });
    });
  }

  /**
   * Open Enlarged Student Pop-out Card Modal in Middle of Page
   */
  openEnlargedStudentModal(usn) {
    const student = this.students.find(s => s.usn === usn);
    if (!student) return;

    this.studentModalBody.innerHTML = `
      <!-- Enlarged Header -->
      <div class="enlarged-profile-header">
        <div class="enlarged-avatar-box">
          <img 
            src="${student.avatar}" 
            alt="${student.fullName}" 
            class="enlarged-avatar-img"
            onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName)}&background=6366f1&color=fff&size=200';"
          >
        </div>

        <div class="enlarged-header-details">
          <h2 class="enlarged-name">${student.fullName}</h2>
          <div class="enlarged-usn-row">
            <span class="enlarged-usn-pill">${student.usn}</span>
            <span class="enlarged-batch-badge">Batch ${student.batch}</span>
            <span class="enlarged-batch-badge">Dept. of ${student.branch}</span>
          </div>
          <div class="enlarged-role">${student.role}</div>
        </div>
      </div>

      <!-- Student Bio -->
      <div class="modal-section-block">
        <div class="modal-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          Professional Summary
        </div>
        <p class="enlarged-bio">${student.bio}</p>
      </div>

      <!-- Technical Skills Cloud -->
      <div class="modal-section-block">
        <div class="modal-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          Core Technologies & Skills
        </div>
        <div class="enlarged-skills-cloud">
          ${student.skills.map(skill => `<span class="enlarged-skill-item">${skill}</span>`).join('')}
        </div>
      </div>

      <!-- Featured Projects -->
      <div class="modal-section-block">
        <div class="modal-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          Featured Academic & Industry Projects
        </div>
        <div class="modal-projects-grid">
          ${student.projects.length ? student.projects.map(proj => `
            <div class="project-card-mini">
              <h4>${proj.title}</h4>
              <p>${proj.description}</p>
              <div class="project-tech-tags">
                ${proj.tech.map(t => `<span class="tech-tag-mini">${t}</span>`).join('')}
              </div>
            </div>
          `).join('') : '<p class="enlarged-bio">No projects have been added yet.</p>'}
        </div>
      </div>

      <!-- Social & Resume Actions -->
      <div class="enlarged-actions-row">
        <div class="social-links-group">
          <a href="${student.social.github}" target="_blank" rel="noopener" class="social-btn" title="GitHub Profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
          </a>
          <a href="${student.social.linkedin}" target="_blank" rel="noopener" class="social-btn" title="LinkedIn Profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
          <a href="mailto:${student.social.email}" class="social-btn" title="Email Student">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </a>
        </div>

        <button class="btn btn-primary" onclick="window.batchfolioApp.downloadResume('${student.usn}', '${student.fullName}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Download Resume</span>
        </button>
      </div>
    `;

    this.openModal(this.studentModal);
  }

  /**
   * Render Resumes Repository list
   */
  renderResumesList(query = '') {
    const list = this.students.filter(student => {
      if (!query) return true;
      return student.fullName.toLowerCase().includes(query) || student.usn.toLowerCase().includes(query);
    });

    this.resumesListContainer.innerHTML = list.map(student => `
      <div class="resume-list-item">
        <div class="resume-student-meta">
          <img src="${student.avatar}" alt="${student.fullName}" class="resume-avatar-sm" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName)}&background=6366f1&color=fff';">
          <div class="resume-info-text">
            <h4>${student.fullName}</h4>
            <p>${student.usn} • ${student.role}</p>
          </div>
        </div>
        <button class="btn btn-secondary" onclick="window.batchfolioApp.downloadResume('${student.usn}', '${student.fullName}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Resume PDF</span>
        </button>
      </div>
    `).join('');
  }

  downloadResume(usn, name) {
    this.showToast(`Downloading verified resume for ${name} (${usn})...`, 'success');
  }

  /**
   * Modal Management Helpers
   */
  openModal(modalElement) {
    modalElement.classList.add('active');
    modalElement.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  closeModal(modalElement) {
    modalElement.classList.remove('active');
    modalElement.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /**
   * Display floating toast notification
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>${message}</span>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

export function initializeBatchfolioApp() {
  const studentsGrid = document.getElementById('students-grid');
  if (window.batchfolioApp?.studentsGrid === studentsGrid) {
    void window.batchfolioApp.loadData();
    return;
  }

  window.batchfolioApp = new BatchfolioApp();
  void window.batchfolioApp.init();
}
