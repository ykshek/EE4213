/* portal/assets/js/registration.js
   Registration Navigator page logic. Relies on:
   - window.Portal (from common.js) for language events
   - window.EE4213Data (from mock-data.js) for course and major data
   No server, no framework, no build step. */

(() => {
    'use strict';

    const SELECTED_COURSES_KEY = 'ee4213.registration.selectedCourses.v1';
    const UNDECLARED_ID = 'UNDECLARED';

    const state = {
        step: 0,
        profile: {
            major: UNDECLARED_ID,
            transfer: 'Associate Degree',
            year: 'Year 1'
        },
        goal: '',
        specialization: 'Data Engineering',
        selectedCourses: []
    };

    const checklistData = {
        must: [
            {
                title: {
                    zh: '決定你要註冊哪些課程',
                    en: 'Determine which courses you are going to register'
                },
                detail: {
                    zh: '查看課程比較器與學位審核輔助以取得推薦。',
                    en: 'View our Course Comparator & Degree Audit Helper to get recommendations.'
                }
            },
            {
                title: {
                    zh: '確認學分評估',
                    en: 'Confirm your credit assessment'
                },
                detail: {
                    zh: '確認已修學分是否正確套用至你的學位審核。',
                    en: 'Verify your completed credits are applied to your degree audit.'
                }
            },
            {
                title: {
                    zh: '完成一年級必修先修課程',
                    en: 'Complete Year 1 prerequisite courses'
                },
                detail: {
                    zh: '在選修進階課程前完成一年級必修。',
                    en: 'Complete Year 1 required courses before enrolling in advanced courses.'
                }
            }
        ],
        should: [
            {
                title: {
                    zh: '檢視評分基準',
                    en: 'Review grading benchmarks'
                },
                detail: {
                    zh: '了解所選方向的 GPA 期望。',
                    en: 'Understand GPA expectations for your chosen direction.'
                }
            }
        ]
    };

    // ---------- helpers ----------
    function getData() {
        return window.EE4213Data || null;
    }

    function getCourseById(courseId) {
        const data = getData();
        if (!data || !Array.isArray(data.courses)) return null;
        return data.courses.find((c) => c.courseId === courseId) || null;
    }

    function getCourseTitle(course) {
        if (!course || !course.titles) return '';
        return course.titles.zh || course.titles.en || '';
    }

    function getMajorById(majorId) {
        const data = getData();
        if (!data || !Array.isArray(data.majors)) return null;
        return data.majors.find((m) => m.majorId === majorId) || null;
    }

    function loadSelectedCourses() {
        try {
            const raw = sessionStorage.getItem(SELECTED_COURSES_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed.filter((v) => typeof v === 'string');
        } catch (err) {
            return [];
        }
    }

    function saveSelectedCourses() {
        try {
            sessionStorage.setItem(SELECTED_COURSES_KEY, JSON.stringify(state.selectedCourses));
        } catch (err) {
            /* sessionStorage may be unavailable under file:// in some browsers. */
        }
    }

    // ---------- step navigation ----------
    function goToStep(n) {
        if (typeof n !== 'number' || n < 0 || n > 5) return;
        state.step = n;

        for (let i = 0; i < 6; i++) {
            const sec = document.getElementById('step-' + i);
            if (sec) sec.classList.toggle('active', i === n);

            const pip = document.getElementById('pip-' + i);
            const dot = document.getElementById('pipdot-' + i);
            if (pip && dot) {
                pip.classList.toggle('active', i === n);
                pip.classList.toggle('done', i < n);
                dot.textContent = i < n ? '✓' : String(i + 1);
            }
        }

        if (n === 2) renderCourseList();
        if (n === 4) renderChecklist();
        if (n === 5) renderSummary();

        const mainEl = document.getElementById('mainContent');
        if (mainEl) mainEl.scrollTop = 0;
    }

    // ---------- Profile ----------
    function populateMajorSelect() {
        const select = document.getElementById('majorSelect');
        if (!select) return;
        select.textContent = '';

        const data = getData();
        const majors = (data && Array.isArray(data.majors)) ? data.majors : [];

        // UNDECLARED first
        const optUndeclared = document.createElement('option');
        optUndeclared.value = UNDECLARED_ID;
        optUndeclared.textContent = '尚未選擇主修（一年級學生）/ Not yet selected (Year 1 student)';
        select.appendChild(optUndeclared);

        majors.forEach((m) => {
            const opt = document.createElement('option');
            opt.value = m.majorId;
            const majorLabel = (m.name && (m.name.en || m.name.zh)) || m.majorId;
            opt.textContent = majorLabel + ' (' + m.majorId + ')';
            select.appendChild(opt);
        });

        select.value = state.profile.major;
        select.addEventListener('change', () => {
            state.profile.major = select.value;
        });
    }

    function bindProfileButtons() {
        document.querySelectorAll('[data-transfer]').forEach((btn) => {
            btn.addEventListener('click', () => {
                state.profile.transfer = btn.getAttribute('data-transfer');
                document.querySelectorAll('[data-transfer]').forEach((b) => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });

        document.querySelectorAll('#yearChips button').forEach((btn) => {
            btn.addEventListener('click', () => {
                state.profile.year = btn.getAttribute('data-year');
                document.querySelectorAll('#yearChips button').forEach((b) => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    }

    // ---------- Goals ----------
    function bindGoalButtons() {
        document.querySelectorAll('#goalChips button').forEach((btn) => {
            btn.addEventListener('click', () => {
                state.goal = btn.getAttribute('data-goal');
                document.querySelectorAll('#goalChips button').forEach((b) => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    }

    function renderCourseList() {
        const container = document.getElementById('courseList');
        if (!container) return;
        container.textContent = '';

        const data = getData();
        if (!data) {
            const p = document.createElement('p');
            p.textContent = 'Course data unavailable. / 課程資料暫不可用。';
            container.appendChild(p);
            updateSelectionCount();
            return;
        }

        const lang = document.documentElement.lang === 'en' ? 'en' : 'zh';
        const major = state.profile.major;

        if (major === UNDECLARED_ID) {
            const yearOne = collectYearOneCourses();
            addGroupTitle(container, lang === 'zh' ? '一年級必修課程' : 'Year 1 Required Courses');
            yearOne.forEach((course) => addCourseRow(container, course, lang));

            const majors = Array.isArray(data.majors) ? data.majors : [];
            majors.forEach((m) => {
                const majorCourses = collectMajorCourses(m, yearOne);
                if (majorCourses.length === 0) return;
                addGroupTitle(
                    container,
                    (lang === 'zh' ? (m.name && m.name.zh ? m.name.zh : m.majorId) : (m.name && m.name.en ? m.name.en : m.majorId))
                    + (lang === 'zh' ? ' 主修參考課程' : ' Reference Courses')
                );
                majorCourses.forEach((course) => addCourseRow(container, course, lang));
            });
        } else {
            const m = getMajorById(major);
            if (!m) {
                const p = document.createElement('p');
                p.textContent = 'Major not found. / 找不到主修資料。';
                container.appendChild(p);
            } else {
                const list = collectMajorCourses(m, []);
                list.forEach((course) => addCourseRow(container, course, lang));
            }
        }

        updateSelectionCount();
    }

    function collectYearOneCourses() {
        // Use CDE as the primary reference; dedupe by courseId.
        const data = getData();
        if (!data || !Array.isArray(data.majors)) return [];
        const cde = data.majors.find((m) => m.majorId === 'CDE') || data.majors[0];
        if (!cde || !Array.isArray(cde.curriculum)) return [];

        const seen = new Set();
        const out = [];
        cde.curriculum.forEach((entry) => {
            if (entry.semester !== '1A' && entry.semester !== '1B') return;
            if (seen.has(entry.courseId)) return;
            seen.add(entry.courseId);
            const course = getCourseById(entry.courseId);
            if (course) out.push(course);
            else {
                // Fallback: build a minimal course-like object from the curriculum entry
                out.push({
                    courseId: entry.courseId,
                    titles: { en: entry.curriculumTitle || entry.courseId }
                });
            }
        });
        return out;
    }

    function collectMajorCourses(majorObj, excludeCourses) {
        if (!majorObj || !Array.isArray(majorObj.curriculum)) return [];
        const exclude = new Set((excludeCourses || []).map((c) => c.courseId));
        const seen = new Set();
        const out = [];
        majorObj.curriculum.forEach((entry) => {
            if (entry.semester === 'GE') return;
            if (exclude.has(entry.courseId)) return;
            if (seen.has(entry.courseId)) return;
            seen.add(entry.courseId);
            const course = getCourseById(entry.courseId);
            if (course) out.push(course);
            else {
                out.push({
                    courseId: entry.courseId,
                    titles: { en: entry.curriculumTitle || entry.courseId }
                });
            }
        });
        return out;
    }

    function addGroupTitle(container, text) {
        const div = document.createElement('div');
        div.className = 'course-group-title';
        div.textContent = text;
        container.appendChild(div);
    }

    function addCourseRow(container, course, lang) {
        const label = document.createElement('label');
        label.className = 'course-row';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = course.courseId;
        cb.checked = state.selectedCourses.includes(course.courseId);
        cb.addEventListener('change', () => {
            if (cb.checked) {
                if (!state.selectedCourses.includes(course.courseId)) {
                    state.selectedCourses.push(course.courseId);
                }
            } else {
                state.selectedCourses = state.selectedCourses.filter((id) => id !== course.courseId);
            }
            updateSelectionCount();
            saveSelectedCourses();
        });

        const textWrap = document.createElement('span');
        const strong = document.createElement('strong');
        strong.textContent = course.courseId;

        const small = document.createElement('small');
        const titles = course.titles || {};
        small.textContent = (lang === 'zh' ? (titles.zh || titles.en || '') : (titles.en || titles.zh || '')) || '';

        textWrap.appendChild(strong);
        if (small.textContent) textWrap.appendChild(small);

        label.appendChild(cb);
        label.appendChild(textWrap);
        container.appendChild(label);
    }

    function updateSelectionCount() {
        const el = document.getElementById('selectedCount');
        if (el) el.textContent = String(state.selectedCourses.length);
    }

    // ---------- Interests ----------
    function bindSpecializationButtons() {
        document.querySelectorAll('#specGrid [data-spec]').forEach((btn) => {
            btn.addEventListener('click', () => {
                state.specialization = btn.getAttribute('data-spec');
                document.querySelectorAll('#specGrid [data-spec]').forEach((b) => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    }

    // ---------- Checklist ----------
    function renderChecklist() {
        const lang = document.documentElement.lang === 'en' ? 'en' : 'zh';
        renderChecklistList('mustList', checklistData.must, lang);
        renderChecklistList('shouldList', checklistData.should, lang);

        const mustBadge = document.getElementById('mustBadge');
        const shouldBadge = document.getElementById('shouldBadge');
        if (mustBadge) mustBadge.textContent = String(checklistData.must.length);
        if (shouldBadge) shouldBadge.textContent = String(checklistData.should.length);
    }

    function renderChecklistList(containerId, items, lang) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.textContent = '';

        items.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'check-item';

            const copy = document.createElement('div');
            copy.className = 'check-copy';

            const h4 = document.createElement('h4');
            h4.textContent = (item.title && (lang === 'zh' ? (item.title.zh || item.title.en) : (item.title.en || item.title.zh))) || '';

            const p = document.createElement('p');
            p.textContent = (item.detail && (lang === 'zh' ? (item.detail.zh || item.detail.en) : (item.detail.en || item.detail.zh))) || '';

            copy.appendChild(h4);
            copy.appendChild(p);
            row.appendChild(copy);
            container.appendChild(row);
        });
    }

    // ---------- Summary ----------
    function renderSummary() {
        const lang = document.documentElement.lang === 'en' ? 'en' : 'zh';

        const majorNames = {
            [UNDECLARED_ID]: lang === 'zh' ? '未選擇主修' : 'Not yet selected'
        };
        const data = getData();
        if (data && Array.isArray(data.majors)) {
            data.majors.forEach((m) => {
                const label = (m.name && (lang === 'zh' ? (m.name.zh || m.name.en) : (m.name.en || m.name.zh))) || m.majorId;
                majorNames[m.majorId] = label + ' (' + m.majorId + ')';
            });
        }

        const yearNames = {
            'Year 1': lang === 'zh' ? '一年級' : 'Year 1',
            'Year 2': lang === 'zh' ? '二年級' : 'Year 2',
            'Year 3': lang === 'zh' ? '三年級' : 'Year 3'
        };
        const transferNames = {
            'Associate Degree': lang === 'zh' ? '副學士' : 'Associate Degree',
            'Higher Diploma': lang === 'zh' ? '高級文憑' : 'Higher Diploma',
            'Direct Entry': lang === 'zh' ? '直接升讀 / 直升' : 'Direct Entry',
            'Department Transfer': lang === 'zh' ? '轉系 / 轉主修' : 'Department Transfer'
        };
        const specNames = {
            'Data Engineering': lang === 'zh' ? '資料工程' : 'Data Engineering',
            'Artificial Intelligence / Machine Learning': lang === 'zh' ? '人工智慧 / 機器學習' : 'Artificial Intelligence / Machine Learning',
            'Communications': lang === 'zh' ? '通訊工程' : 'Communications',
            'Microelectronics / IC Design': lang === 'zh' ? '微電子 / IC 設計' : 'Microelectronics / IC Design',
            'Embedded Systems': lang === 'zh' ? '嵌入式系統' : 'Embedded Systems',
            'Power and Energy': lang === 'zh' ? '電力與能源' : 'Power and Energy',
            'Networking and Security': lang === 'zh' ? '網路與資安' : 'Networking and Security',
            'Photonics': lang === 'zh' ? '光電工程' : 'Photonics',
            'Control Systems': lang === 'zh' ? '控制系統' : 'Control Systems',
            'Software Engineering': lang === 'zh' ? '軟體工程' : 'Software Engineering'
        };

        setText('summaryMajor', majorNames[state.profile.major] || '—');
        setText('summaryTransfer', transferNames[state.profile.transfer] || '—');
        setText('summaryYear', yearNames[state.profile.year] || '—');
        setText('summaryGoal', state.goal || (lang === 'zh' ? '未設定' : 'Not set'));
        setText('summarySpec', specNames[state.specialization] || '—');

        const coursesEl = document.getElementById('summaryCourses');
        if (coursesEl) {
            if (state.selectedCourses.length === 0) {
                coursesEl.textContent = lang === 'zh' ? '未選擇' : 'None selected';
            } else {
                coursesEl.textContent = state.selectedCourses.join(', ');
            }
        }
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    // ---------- Finish ----------
    function bindFinish() {
        const btn = document.getElementById('finishBtn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            window.location.href = '../student-profile/index.html';
        });
    }

    // ---------- Language change ----------
    function bindLanguageChange() {
        document.addEventListener('portal:languagechange', () => {
            if (state.step === 2) renderCourseList();
            if (state.step === 4) renderChecklist();
            if (state.step === 5) renderSummary();
        });
    }

    // ---------- Init ----------
    function init() {
        state.selectedCourses = loadSelectedCourses();
        populateMajorSelect();
        bindProfileButtons();
        bindGoalButtons();
        bindSpecializationButtons();
        bindFinish();
        bindLanguageChange();
        goToStep(0);
    }

    // Expose goToStep for inline onclick handlers in HTML.
    window.goToStep = goToStep;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
