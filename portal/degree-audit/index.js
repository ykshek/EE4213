/**
 * Degree Audit & Recovery Simulator v6 - Integrated Portal Module
 */

(function () {
    const defaultFailedCourse = ''; // Do not pre-mark a course as failed in a fresh audit.
    const semesters = ['GE', '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B'];
    const curriculumData = Object.fromEntries(window.EE4213Data.majors.map(major => [
        major.majorId,
        {
            name: major.name.en,
            courses: major.curriculum.map(course => ({
                code: course.courseId,
                name: course.curriculumTitle,
                cu: course.creditUnits,
                defaultSem: course.semester,
                day: course.day,
                slot: course.timeSlot,
                prereq: course.prerequisiteCourseIds?.[0],
                prereqs: course.prerequisiteCourseIds || [],
                blocks: course.blocksCourseId,
                downstream: course.downstreamCourseId,
                hasNoSlot: course.hasNoTimetableSlot,
                isGe: course.isGeneralEducation,
                isTe: course.isTechnicalElective
            }))
        }
    ]));

    // Year 1 is a common curriculum before students select a major in Year 2.
    // Build it from the courses shared by every major in GE, 1A and 1B.
    const majorIds = window.EE4213Data.majors.map(major => major.majorId);
    const commonSource = curriculumData[majorIds[0]];
    curriculumData.COMMON = {
        name: 'Common Year 1 (Major not selected)',
        courses: commonSource.courses.filter(course =>
            ['GE', '1A', '1B'].includes(course.defaultSem) &&
            majorIds.every(majorId => curriculumData[majorId]?.courses.some(item => item.code === course.code))
        )
    };

    const completedCourses = new Set();
    const failedCourses = new Set();
    const plannedTerms = { 1: [], 2: [], 3: [] };
    const progressStorageKey = 'cityuEE4213DegreeAuditStatusV2';
    let sharedProgress = readSharedProgress();
    let activeMajor;
    let lastChosenMajor = majorIds.includes(sharedProgress.activeMajor) ? sharedProgress.activeMajor : '';
    let courseSemMap = {};

    function readSharedProgress() {
        try {
            const raw = localStorage.getItem(progressStorageKey);
            const parsed = raw ? JSON.parse(raw) : null;
            if (parsed && parsed.version === 2 && parsed.byMajor && typeof parsed.byMajor === 'object') return parsed;
        } catch (error) {
            console.warn('Unable to read saved Degree Audit progress.', error);
        }
        return { version: 2, activeMajor: null, byMajor: {} };
    }

    function saveCurrentMajorProgress() {
        if (!activeMajor) return;
        const major = curriculumData[activeMajor];
        const statuses = {};
        const commonCodes = new Set(curriculumData.COMMON.courses.map(course => course.code));
        const commonStatuses = { ...(sharedProgress.byMajor?.COMMON || {}) };
        major.courses.forEach(course => {
            const status = failedCourses.has(course.code)
                ? 'failed'
                : completedCourses.has(course.code) ? 'completed' : 'not-taken';
            statuses[course.code] = status;
            // A common Year 1 course has one shared status, even after a student selects a major.
            if (commonCodes.has(course.code)) commonStatuses[course.code] = status;
        });
        sharedProgress.version = 2;
        sharedProgress.byMajor[activeMajor] = statuses;
        sharedProgress.byMajor.COMMON = commonStatuses;
        sharedProgress.activeMajor = activeMajor;
        try {
            localStorage.setItem(progressStorageKey, JSON.stringify(sharedProgress));
        } catch (error) {
            console.warn('Unable to save Degree Audit progress for Course Comparator.', error);
        }
    }

    function loadMajorProgress(majorKey) {
        completedCourses.clear();
        failedCourses.clear();
        const commonCodes = new Set(curriculumData.COMMON.courses.map(course => course.code));
        let commonStatuses = sharedProgress.byMajor?.COMMON || {};

        // Older saved sessions may only have a major-specific record. Recover its shared Year 1 statuses.
        if (majorKey === 'COMMON' && !Object.keys(commonStatuses).length) {
            const savedMajorId = lastChosenMajor || majorIds.find(id => sharedProgress.byMajor?.[id]);
            const savedMajorStatuses = savedMajorId ? (sharedProgress.byMajor?.[savedMajorId] || {}) : {};
            commonStatuses = Object.fromEntries(Object.entries(savedMajorStatuses).filter(([code]) => commonCodes.has(code)));
        }

        // Common Year 1 status carries into each selected Year 2+ major.
        const majorStatuses = majorKey === 'COMMON' ? {} : (sharedProgress.byMajor?.[majorKey] || {});
        const statuses = { ...commonStatuses, ...majorStatuses };
        if (!Object.keys(statuses).length) return false;
        Object.entries(statuses).forEach(([code, status]) => {
            if (status === 'completed') completedCourses.add(code);
            if (status === 'failed') failedCourses.add(code);
        });
        // Prevent saved downstream completions from contradicting a failed prerequisite.
        [...failedCourses].forEach(code => clearCompletedDependents(code));
        return true;
    }

    function syncRetakeCourse(preferredCode = '') {
        const select = document.getElementById('failedCourseSelect');
        if (!select) return;
        const current = select.value;
        if (preferredCode && failedCourses.has(preferredCode)) {
            select.value = preferredCode;
            return;
        }
        if (current && failedCourses.has(current)) return;
        select.value = [...failedCourses][0] || '';
    }

    function getFailedPrerequisiteChain(courseCode, visited = new Set()) {
        if (!activeMajor || visited.has(courseCode)) return null;
        const major = curriculumData[activeMajor];
        const course = major?.courses.find(item => item.code === courseCode);
        if (!course) return null;

        const nextVisited = new Set(visited);
        nextVisited.add(courseCode);
        for (const prerequisiteCode of course.prereqs || []) {
            if (failedCourses.has(prerequisiteCode)) {
                return [prerequisiteCode, courseCode];
            }
            const upstream = getFailedPrerequisiteChain(prerequisiteCode, nextVisited);
            if (upstream) return [...upstream, courseCode];
        }
        return null;
    }

    function getPlannerBlockInfo(courseCode) {
        const chain = getFailedPrerequisiteChain(courseCode);
        return chain ? { rootCode: chain[0], chain } : null;
    }

    function clearCompletedDependents(prerequisiteCode) {
        if (!activeMajor) return [];
        const major = curriculumData[activeMajor];
        const dependentsByPrerequisite = new Map();
        major.courses.forEach(course => {
            (course.prereqs || []).forEach(requiredCode => {
                if (!dependentsByPrerequisite.has(requiredCode)) dependentsByPrerequisite.set(requiredCode, []);
                dependentsByPrerequisite.get(requiredCode).push(course.code);
            });
        });

        const queue = [prerequisiteCode];
        const visited = new Set(queue);
        const clearedCourses = [];
        while (queue.length) {
            const currentCode = queue.shift();
            (dependentsByPrerequisite.get(currentCode) || []).forEach(dependentCode => {
                if (visited.has(dependentCode)) return;
                visited.add(dependentCode);
                // A dependent course cannot remain recorded as completed when its prerequisite is not passed.
                if (completedCourses.delete(dependentCode)) clearedCourses.push(dependentCode);
                for (const term in plannedTerms) {
                    plannedTerms[term] = plannedTerms[term].filter(code => code !== dependentCode);
                }
                queue.push(dependentCode);
            });
        }
        return clearedCourses;
    }

    function setAuditStatusFeedback(code, status, clearedCourses = []) {
        const feedback = document.getElementById('audit-status-feedback');
        if (!feedback || !code) return;
        const lang = document.body.dataset.lang === 'en' ? 'en' : 'zh';
        const label = lang === 'en'
            ? ({ completed: 'Completed', failed: 'Failed', 'not-taken': 'Not taken / planned' }[status])
            : ({ completed: '已完成', failed: '不合格', 'not-taken': '未修讀／規劃中' }[status]);
        if (clearedCourses.length) {
            feedback.textContent = lang === 'en'
                ? `${code} marked as ${label}. The completion status of dependent course(s) was reset: ${clearedCourses.join(', ')}.`
                : `${code} 已標記為「${label}」。以下後續課程的已完成狀態已重設：${clearedCourses.join('、')}。`;
        } else {
            feedback.textContent = lang === 'en'
                ? `${code} marked as ${label}. The change has been shared with Course Comparator.`
                : `${code} 已標記為「${label}」，並已同步至課程比較器。`;
        }
    }

    function markCourseFailed(code) {
        if (!code) return [];
        failedCourses.add(code);
        completedCourses.delete(code);
        return clearCompletedDependents(code);
    }

    function refreshAuditViews() {
        renderChecklist();
        renderFlowchart();
        renderRoadmapAndAudit();
        saveCurrentMajorProgress();
    }

    const timeSlots = [
        { time: "09:00 - 11:50", key: "09:00" },
        { time: "12:00 - 14:50", key: "12:00" },
        { time: "15:00 - 17:50", key: "15:00" },
        { time: "18:00 - 20:50", key: "18:00" }
    ];

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

    function getSelectedMajor() {
        // An empty Year 2+ selection still uses the common-year curriculum,
        // keeping Degree Audit and the timetable usable before a major is chosen.
        return document.getElementById('majorSelect').value || 'COMMON';
    }

    function configureMajorSelectionForYear() {
        const year = getSelectedYear();
        const majorSelect = document.getElementById('majorSelect');
        const hint = document.getElementById('majorSelectionHint');
        if (year === 1) {
            if (majorSelect.value && majorSelect.value !== 'COMMON') lastChosenMajor = majorSelect.value;
            majorSelect.value = 'COMMON';
            majorSelect.disabled = true;
            if (hint) hint.textContent = document.body.dataset.lang === 'en'
                ? 'Year 1 is a common year. Major selection is made in Year 2; the timetable is available now.'
                : '一年級為共同課程階段，學生於二年級選擇主修；目前仍可使用課表。';
        } else {
            majorSelect.disabled = false;
            if (majorSelect.value === 'COMMON') majorSelect.value = lastChosenMajor || '';
            if (majorSelect.value && majorSelect.value !== 'COMMON') lastChosenMajor = majorSelect.value;
            if (hint) hint.textContent = majorSelect.value
                ? (document.body.dataset.lang === 'en'
                    ? 'Major selected. The audit now shows the selected major curriculum.'
                    : '已選擇主修；學位審核現正顯示該主修的課程。')
                : (document.body.dataset.lang === 'en'
                    ? 'Major selection starts in Year 2. Until you choose one, the common Year 1 courses remain available in the audit and timetable.'
                    : '二年級起可選擇主修。選擇前仍可查看共同一年級課程及使用課表。');
        }
    }

    function getSelectedDegreeRoute() {
        return Number(document.getElementById('degreeRouteSelect').value);
    }

    function getSelectedYear() {
        return Number(document.getElementById('yearSelect').value);
    }

    function getSelectedFailedCourse() {
        return document.getElementById('failedCourseSelect').value;
    }

    function getActiveCurriculumData() {
        return curriculumData;
    }

    function initCourseSemMap() {
        const majorKey = getSelectedMajor();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];
        courseSemMap = {};
        major.courses.forEach(c => {
            courseSemMap[c.code] = c.defaultSem;
        });
        document.getElementById('flowchartCourse').replaceChildren(...major.courses.map(c =>
            new Option(`${c.code} - ${c.name}`, c.code)));
        document.getElementById('flowchartMoveStatus').textContent = '';
    }

    window.handleGlobalChange = function () {
        configureMajorSelectionForYear();
        const majorKey = getSelectedMajor();
        const major = curriculumData[majorKey] || curriculumData.COMMON;
        const majorChanged = activeMajor !== majorKey;

        if (majorChanged) {
            if (activeMajor) saveCurrentMajorProgress();
            activeMajor = majorKey;
            initCourseSemMap();

            const failedSelect = document.getElementById('failedCourseSelect');
            const currentFailed = failedSelect.value;
            const failCandidates = major.courses.filter(c => !c.isGe);
            const placeholder = new Option(
                document.body.dataset.lang === 'en' ? 'Select a failed course (optional)' : '選擇需重修課程（可選）',
                ''
            );
            failedSelect.replaceChildren(placeholder, ...failCandidates.map(c =>
                new Option(`${c.code} - ${c.name} (${c.cu} CU)`, c.code)));

            const hasSavedProgress = loadMajorProgress(majorKey);
            if (hasSavedProgress) {
                syncRetakeCourse(currentFailed);
                refreshAuditViews();
            } else {
                failedSelect.value = '';
                resetChecklistToDefault();
            }
            return;
        }

        const selectedFailed = getSelectedFailedCourse();
        if (selectedFailed) markCourseFailed(selectedFailed);
        refreshAuditViews();
    };

    window.switchTab = function (tabId, btn) {
        document.querySelectorAll('#pageContent[data-page="degree-audit"] .tab-content').forEach(tc => tc.classList.remove('active'));
        document.querySelectorAll('#pageContent[data-page="degree-audit"] .tab-btn').forEach(tab => {
            tab.classList.toggle('active', tab === btn);
            tab.setAttribute('aria-pressed', String(tab === btn));
        });
        document.getElementById(tabId).classList.add('active');
    };

    function renderChecklist() {
        const majorKey = getSelectedMajor();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];
        const lang = document.body.dataset.lang === 'en' ? 'en' : 'zh';
        const labels = lang === 'en'
            ? { completed: 'Completed', failed: 'Failed' }
            : { completed: '已完成', failed: '不合格／需重修' };

        const container = document.getElementById('completedChecklistContainer');
        if (!container) return;
        container.replaceChildren();

        const blockedItems = major.courses
            .map(course => ({ course, chain: getFailedPrerequisiteChain(course.code) }))
            // Keep the failed course itself visible so the student can clear or update its status.
            .filter(item => item.chain && !failedCourses.has(item.course.code));
        const hiddenCodes = new Set(blockedItems.map(item => item.course.code));
        const blockedNote = document.getElementById('audit-blocked-course-note');
        if (blockedNote) {
            blockedNote.hidden = blockedItems.length === 0;
            if (blockedItems.length) {
                const details = blockedItems.map(item => `${item.course.code} (${item.chain.join(' → ')})`);
                blockedNote.textContent = lang === 'en'
                    ? `Temporarily hidden because a prerequisite failed: ${details.join('; ')}. Pass the prerequisite first to show these courses again.`
                    : `以下課程因先修科目不合格而暫時隱藏：${details.join('；')}。請先通過先修科目，這些課程便會重新顯示。`;
            } else {
                blockedNote.textContent = '';
            }
        }

        major.courses.filter(course => !hiddenCodes.has(course.code)).forEach(c => {
            const isCompleted = completedCourses.has(c.code);
            const isFailed = failedCourses.has(c.code);
            const status = isFailed ? 'failed' : isCompleted ? 'completed' : 'not-taken';
            const row = document.createElement('div');
            row.className = `course-check-item ${c.isGe ? 'ge-item' : ''} status-${status}`;

            const courseText = document.createElement('div');
            courseText.className = 'course-check-name';
            const code = document.createElement('strong');
            code.textContent = c.code;
            const title = document.createTextNode(` ${c.name} ${c.isGe ? '(GE)' : '[' + c.defaultSem + ']'}`);
            courseText.append(code, title);

            const controls = document.createElement('div');
            controls.className = 'course-status-controls';

            const completedLabel = document.createElement('label');
            completedLabel.className = 'course-status-option is-completed';
            const completedCheckbox = document.createElement('input');
            completedCheckbox.type = 'checkbox';
            completedCheckbox.checked = isCompleted;
            completedCheckbox.setAttribute('aria-label', lang === 'en' ? `${c.code}: ${labels.completed}` : `${c.code}：${labels.completed}`);
            completedCheckbox.addEventListener('change', () => {
                const currentStatus = failedCourses.has(c.code) ? 'failed' : completedCourses.has(c.code) ? 'completed' : 'not-taken';
                if (completedCheckbox.checked) {
                    window.degreeAuditSetCourseStatus(c.code, 'completed');
                } else if (currentStatus === 'completed') {
                    window.degreeAuditSetCourseStatus(c.code, 'not-taken');
                }
            });
            const completedText = document.createElement('span');
            completedText.textContent = labels.completed;
            completedLabel.append(completedCheckbox, completedText);

            const failedLabel = document.createElement('label');
            failedLabel.className = 'course-status-option is-failed';
            const failedCheckbox = document.createElement('input');
            failedCheckbox.type = 'checkbox';
            failedCheckbox.checked = isFailed;
            failedCheckbox.setAttribute('aria-label', lang === 'en' ? `${c.code}: ${labels.failed}` : `${c.code}：${labels.failed}`);
            failedCheckbox.addEventListener('change', () => {
                const currentStatus = failedCourses.has(c.code) ? 'failed' : completedCourses.has(c.code) ? 'completed' : 'not-taken';
                if (failedCheckbox.checked) {
                    window.degreeAuditSetCourseStatus(c.code, 'failed');
                } else if (currentStatus === 'failed') {
                    window.degreeAuditSetCourseStatus(c.code, 'not-taken');
                }
            });
            const failedText = document.createElement('span');
            failedText.textContent = labels.failed;
            failedLabel.append(failedCheckbox, failedText);

            controls.append(completedLabel, failedLabel);

            const credit = document.createElement('span');
            credit.className = 'course-credit-units';
            credit.textContent = `${c.cu} CU`;
            row.append(courseText, controls, credit);
            container.appendChild(row);
        });
    }

    window.degreeAuditSetCourseStatus = function (code, status) {
        let clearedCourses = [];
        if (status === 'completed') {
            const failedChain = getFailedPrerequisiteChain(code);
            if (failedChain) {
                const feedback = document.getElementById('audit-status-feedback');
                if (feedback) feedback.textContent = document.body.dataset.lang === 'en'
                    ? `${code} cannot be marked Completed because prerequisite ${failedChain[0]} is Failed (${failedChain.join(' → ')}).`
                    : `${code} 不能標記為「已完成」，因為先修科目 ${failedChain[0]} 不合格（${failedChain.join(' → ')}）。`;
                refreshAuditViews();
                return;
            }
            completedCourses.add(code);
            failedCourses.delete(code);
            for (const term in plannedTerms) plannedTerms[term] = plannedTerms[term].filter(courseCode => courseCode !== code);
        } else if (status === 'failed') {
            failedCourses.add(code);
            completedCourses.delete(code);
            for (const term in plannedTerms) plannedTerms[term] = plannedTerms[term].filter(courseCode => courseCode !== code);
            clearedCourses = clearCompletedDependents(code);
        } else {
            completedCourses.delete(code);
            failedCourses.delete(code);
            clearedCourses = clearCompletedDependents(code);
        }
        syncRetakeCourse(status === 'failed' ? code : '');
        refreshAuditViews();
        setAuditStatusFeedback(code, status, clearedCourses);
    };

    // Backward-compatible wrapper for any older checklist markup.
    window.degreeAuditToggleCourse = function (code, isChecked) {
        window.degreeAuditSetCourseStatus(code, isChecked ? 'completed' : 'not-taken');
    };

    window.resetChecklistToDefault = function () {
        // The prototype must not assume that a student has taken any course.
        // Show the curriculum, but leave all Completed / Failed boxes unticked.
        completedCourses.clear();
        failedCourses.clear();
        const failedSelect = document.getElementById('failedCourseSelect');
        if (failedSelect) failedSelect.value = '';
        for (const term in plannedTerms) plannedTerms[term] = [];
        syncRetakeCourse('');
        refreshAuditViews();
    };

    function renderFlowchart() {
        const majorKey = getSelectedMajor();
        const failedCode = getSelectedFailedCourse();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];

        const titleEl = document.getElementById('flowchartTitle');
        if (titleEl) {
            titleEl.innerHTML = `<span class="lang-zh">課程結構流程圖</span><span class="lang-en">Curriculum flowchart</span> — ${major.name} (${majorKey})`;
        }

        const container = document.getElementById('flowchartGridContainer');
        if (!container) return;
        container.innerHTML = '';

        semesters.forEach(semLabel => {
            const semCourses = major.courses.filter(c => courseSemMap[c.code] === semLabel);

            let semCuTotal = 0;
            semCourses.forEach(c => semCuTotal += c.cu);

            let prereqViolations = [];
            semCourses.forEach(c => {
                (c.prereqs || []).forEach(prereqCode => {
                    if (!completedCourses.has(prereqCode)) {
                        const prereqSem = courseSemMap[prereqCode];
                        const currentSemIdx = semesters.indexOf(semLabel);
                        const prereqSemIdx = semesters.indexOf(prereqSem);
                        if (prereqSemIdx >= currentSemIdx || failedCourses.has(prereqCode)) {
                            prereqViolations.push(`<span class="lang-zh">${c.code} 須先完成 ${prereqCode}</span><span class="lang-en">${c.code} requires ${prereqCode} to be completed first</span>`);
                        }
                    }
                });
            });

            const isWarningRow = prereqViolations.length > 0;

            let rowHtml = `
                <div class="sem-row ${isWarningRow ? 'sem-warning-border' : ''}">
                    <div class="sem-label-container">
                        <div class="sem-label">${semLabel === "GE" ? '<span class="lang-zh">通識科目</span><span class="lang-en">GE Courses</span>' : semLabel}</div>
                        <div class="sem-cu-counter">${semCuTotal} CU</div>
                    </div>

                    <div class="sem-courses" 
                         ondragover="degreeAuditAllowDrop(event)" 
                         ondragleave="degreeAuditDragLeave(event)" 
                         ondrop="degreeAuditDropCourse(event, '${semLabel}')">
            `;

            if (isWarningRow) {
                rowHtml += `
                    <div class="prereq-warning-banner">
                        <span>⚠ ${prereqViolations.join(' · ')}</span>
                    </div>
                `;
            }

            semCourses.forEach(c => {
                const isCompleted = completedCourses.has(c.code);
                const isFailed = failedCourses.has(c.code) || c.code === failedCode;

                let boxClass = "flow-box ";
                if (isFailed) {
                    boxClass += "failed-highlight";
                } else if (isCompleted) {
                    boxClass += "completed";
                } else {
                    boxClass += "incomplete";
                }

                rowHtml += `
                    <div class="${boxClass}" 
                         draggable="true" 
                         ondragstart="degreeAuditDragStart(event, '${c.code}')">
                        <div><strong>${c.code}</strong></div>
                        <div style="font-size:0.7rem;">${c.name}</div>
                        <div style="font-size:0.65rem; margin-top:2px; opacity:0.8;">${c.cu} CU</div>
                    </div>
                `;
            });

            rowHtml += `</div></div>`;
            container.innerHTML += rowHtml;
        });
    }

    window.degreeAuditDragStart = function (ev, code) {
        ev.dataTransfer.setData("text/plain", code);
    };

    window.degreeAuditAllowDrop = function (ev) {
        ev.preventDefault();
        ev.currentTarget.classList.add('drag-over');
    };

    window.degreeAuditDragLeave = function (ev) {
        ev.currentTarget.classList.remove('drag-over');
    };

    window.degreeAuditDropCourse = function (ev, targetSem) {
        ev.preventDefault();
        ev.currentTarget.classList.remove('drag-over');
        const code = ev.dataTransfer.getData("text/plain");

        moveCourse(code, targetSem);
    };

    function moveCourse(code, targetSem) {
        if (Object.hasOwn(courseSemMap, code)) {
            courseSemMap[code] = targetSem;
            renderFlowchart();
            document.getElementById('flowchartMoveStatus').innerHTML = `
                <span class="lang-zh">${code} 已移至 ${targetSem}。</span>
                <span class="lang-en">${code} moved to ${targetSem}.</span>`;
        }
    }

    window.resetFlowchartLayout = function () {
        initCourseSemMap();
        renderFlowchart();
    };

    function updatePlannerDropdowns() {
        const majorKey = getSelectedMajor();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];

        // Keep a failed course itself available for retake planning, but hide any
        // downstream course whose prerequisite chain contains a failed course.
        const uncompleted = major.courses.filter(c =>
            !completedCourses.has(c.code) && !getPlannerBlockInfo(c.code)
        );
        const blocked = major.courses
            .map(c => ({ course: c, block: getPlannerBlockInfo(c.code) }))
            .filter(item => item.block);
        const plannerHint = document.getElementById('planner-eligibility-hint');
        if (plannerHint) {
            if (!blocked.length) {
                plannerHint.textContent = document.body.dataset.lang === 'en'
                    ? 'Courses blocked by failed prerequisites will be hidden here. A failed course itself can still be added for retake planning.'
                    : '如有先修科目不合格，相關後續課程會在此清單隱藏；不合格科目本身仍可加入以規劃重修。';
            } else {
                const details = blocked.map(item => `${item.course.code} (${item.block.chain.join(' → ')})`);
                plannerHint.textContent = document.body.dataset.lang === 'en'
                    ? `Hidden because a prerequisite failed: ${details.join('; ')}. Retake and pass the prerequisite first.`
                    : `因先修科目不合格而隱藏：${details.join('；')}。請先重修並通過先修科目。`;
            }
        }

        for (let t = 1; t <= 3; t++) {
            const select = document.getElementById(`term${t}Select`);
            if (!select) continue;
            select.innerHTML = `<option value="">${document.body.dataset.lang === 'en' ? 'Choose a course…' : '請選擇課程…'}</option>`;
            uncompleted.forEach(c => {
                let alreadyPlanned = false;
                for (let p in plannedTerms) {
                    if (plannedTerms[p].includes(c.code)) alreadyPlanned = true;
                }
                if (!alreadyPlanned) {
                    select.innerHTML += `<option value="${c.code}">${c.code} - ${c.name} (${c.cu} CU)</option>`;
                }
            });
        }
    }

    window.addCourseToTerm = function (termId) {
        const select = document.getElementById(`term${termId}Select`);
        if (!select) return;
        const code = select.value;
        if (code) {
            const blocked = getPlannerBlockInfo(code);
            if (blocked) {
                const hint = document.getElementById('planner-eligibility-hint');
                if (hint) hint.textContent = document.body.dataset.lang === 'en'
                    ? `${code} cannot be planned because prerequisite ${blocked.rootCode} is failed (${blocked.chain.join(' → ')}).`
                    : `${code} 暫時不能規劃，因為先修科目 ${blocked.rootCode} 不合格（${blocked.chain.join(' → ')}）。`;
                return;
            }
            if (!plannedTerms[termId].includes(code)) plannedTerms[termId].push(code);
            renderRoadmapAndAudit();
        }
    };

    window.removeCourseFromTerm = function (termId, code) {
        plannedTerms[termId] = plannedTerms[termId].filter(c => c !== code);
        renderRoadmapAndAudit();
        document.getElementById(`term${termId}Select`).focus();
    };

    function renderRoadmapAndAudit() {
        const majorKey = getSelectedMajor();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];
        const targetReq = getSelectedDegreeRoute();

        let completedCU = 0;
        major.courses.forEach(c => {
            if (completedCourses.has(c.code)) completedCU += c.cu;
        });

        let plannedCU = 0;
        for (let t in plannedTerms) {
            plannedTerms[t].forEach(code => {
                const cObj = major.courses.find(c => c.code === code);
                if (cObj) plannedCU += cObj.cu;
            });
        }

        const totalProjected = completedCU + plannedCU;
        const gap = targetReq - totalProjected;

        const reqEl = document.getElementById('metricDegreeReq');
        const compEl = document.getElementById('metricCompleted');
        const planEl = document.getElementById('metricPlanned');
        const remEl = document.getElementById('metricRemaining');

        if (reqEl) reqEl.innerText = `${targetReq} CU`;
        if (compEl) compEl.innerText = `${completedCU} CU`;
        if (planEl) planEl.innerText = `${plannedCU} CU`;
        if (remEl) remEl.innerText = `${gap > 0 ? gap : 0} CU`;

        const bannerContainer = document.getElementById('deferralStatusBanner');
        if (bannerContainer) {
            if (gap > 0) {
                bannerContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <div>
                            <strong><span class="lang-zh">尚欠 ${gap} 學分</span><span class="lang-en">${gap} credits remaining</span></strong>
                            <p style="font-size:0.85rem; margin-top:3px;">
                                <span class="lang-zh">距離 ${targetReq} 學分的模擬要求尚有差額。請在下方規劃餘下科目。</span>
                                <span class="lang-en">Add remaining courses below to work toward the sample ${targetReq}-credit requirement.</span>
                            </p>
                        </div>
                    </div>
                `;
            } else {
                bannerContainer.innerHTML = `
                    <div class="alert alert-success">
                        <div>
                            <strong><span class="lang-zh">已達模擬學分目標</span><span class="lang-en">Sample credit target met</span></strong>
                            <p style="font-size:0.85rem; margin-top:3px;">
                                <span class="lang-zh">已完成及已規劃合共 ${totalProjected} 學分，達到 ${targetReq} 學分目標。</span>
                                <span class="lang-en">Completed and planned credits total ${totalProjected} CU against a target of ${targetReq} CU.</span>
                            </p>
                        </div>
                    </div>
                `;
            }
        }

        for (let t = 1; t <= 3; t++) {
            const listEl = document.getElementById(`term${t}List`);
            const cuEl = document.getElementById(`term${t}Cu`);
            if (!listEl || !cuEl) continue;

            listEl.innerHTML = '';
            let termCu = 0;

            plannedTerms[t].forEach(code => {
                const cObj = major.courses.find(c => c.code === code);
                if (cObj) {
                    termCu += cObj.cu;
                    listEl.innerHTML += `
                        <span class="planned-tag">
                            ${cObj.code} (${cObj.cu} CU)
                            <button type="button" class="remove-btn" onclick="removeCourseFromTerm(${t}, '${cObj.code}')">
                                <span aria-hidden="true">×</span>
                                <span class="audit-sr-only"><span class="lang-zh">移除 ${cObj.code}</span><span class="lang-en">Remove ${cObj.code}</span></span>
                            </button>
                        </span>
                    `;
                }
            });
            cuEl.textContent = `${termCu} CU`;
        }

        updatePlannerDropdowns();
        renderVisualizerCheckboxes();
    }

    function renderVisualizerCheckboxes() {
        const majorKey = getSelectedMajor();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];
        const failedCode = getSelectedFailedCourse();

        const container = document.getElementById('visualizerCheckboxes');
        if (!container) return;
        const previouslySelectedCodes = new Set(
            Array.from(container.querySelectorAll('input:checked')).map(input => input.value)
        );
        container.innerHTML = '';

        // Keep all eligible courses available for timetable selection. Nothing is
        // checked automatically; only courses already added to a planned term are pre-ticked.
        const targetCourses = major.courses.filter(c =>
            !completedCourses.has(c.code) &&
            !failedCourses.has(c.code) &&
            !getPlannerBlockInfo(c.code) &&
            !c.isTe
        );
        const plannedCodes = new Set(Object.values(plannedTerms).flat());

        if (targetCourses.length === 0) {
            container.innerHTML = `<p><span class="lang-zh">沒有可加入課表的其他科目。</span><span class="lang-en">There are no other courses to show.</span></p>`;
            renderTimetable();
            return;
        }

        targetCourses.forEach((c) => {
            const slotLabel = c.hasNoSlot
                ? '<span class="lang-zh">無固定時段</span><span class="lang-en">No fixed time</span>'
                : `(${c.day} ${timeSlots.find(slot => slot.key === c.slot).time})`;

            container.innerHTML += `
                <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem;">
                    <input type="checkbox" value="${c.code}" ${previouslySelectedCodes.has(c.code) || plannedCodes.has(c.code) ? 'checked' : ''} onchange="renderTimetable()">
                    <span><strong>${c.code}</strong> ${slotLabel}</span>
                </label>
            `;
        });

        renderTimetable();
    }

    window.renderTimetable = function () {
        const sectionSelect = document.getElementById('sectionSelect');
        if (!sectionSelect) return;
        const section = sectionSelect.value;
        const majorKey = getSelectedMajor();
        const failedCode = getSelectedFailedCourse();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];

        const retakeSlot = failedCode
            ? ((section === "L01") ? { day: "Tue", timeKey: "09:00" } : { day: "Thu", timeKey: "15:00" })
            : null;
        const retakeTime = retakeSlot ? timeSlots.find(slot => slot.key === retakeSlot.timeKey).time : '';

        const selectedCodes = Array.from(document.querySelectorAll('#visualizerCheckboxes input:checked')).map(cb => cb.value);
        const activeCourses = major.courses.filter(c => selectedCodes.includes(c.code));

        let isClash = false;
        let clashingCode = "";

        activeCourses.forEach(c => {
            if (retakeSlot && !c.hasNoSlot && c.day === retakeSlot.day && c.slot === retakeSlot.timeKey) {
                isClash = true;
                clashingCode = c.code;
            }
        });

        const alertContainer = document.getElementById('clashAlertContainer');
        if (alertContainer) {
            if (!failedCode) {
                alertContainer.innerHTML = `
                    <div class="schedule-status-card is-empty">
                        <p><span class="lang-zh">未設定重修課程；仍可正常檢查目前勾選科目的上課時間及衝突。</span><span class="lang-en">No retake course is set. You can still check the meeting times and clashes of the selected courses.</span></p>
                    </div>
                `;
            } else if (isClash) {
                alertContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <div>
                            <strong><span class="lang-zh">⚠ 重修時段有衝突</span><span class="lang-en">⚠ Retake section clash</span></strong>
                            <p><span class="lang-zh">${failedCode}（${section}）與 ${clashingCode} 在 ${retakeTime} 重疊。</span><span class="lang-en">${failedCode} (${section}) overlaps with ${clashingCode} at ${retakeTime}.</span></p>
                        </div>
                        ${section === "L01" ? `<button type="button" class="btn-action" onclick="document.getElementById('sectionSelect').value='L02'; document.getElementById('sectionSelect').focus(); renderTimetable();"><span class="lang-zh">試用 L02 時段</span><span class="lang-en">Try section L02</span></button>` : ''}
                    </div>
                `;
            } else {
                alertContainer.innerHTML = `
                    <div class="alert alert-success">
                        <div>
                            <strong><span class="lang-zh">✓ 重修時段無衝突</span><span class="lang-en">✓ No retake section clash</span></strong>
                            <p><span class="lang-zh">${section} 與目前勾選的科目沒有重疊。</span><span class="lang-en">${section} does not overlap with the selected courses.</span></p>
                        </div>
                    </div>
                `;
            }
        }

        const tbody = document.getElementById('timetableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        timeSlots.forEach(ts => {
            let row = `<tr><th scope="row">${ts.time}</th>`;
            days.forEach(d => {
                let content = "";
                let cellClass = "";

                if (retakeSlot && d === retakeSlot.day && ts.key === retakeSlot.timeKey) {
                    content += `<div><span class="lang-zh">重修</span><span class="lang-en">Retake</span> ${failedCode}</div>`;
                    cellClass = "slot-active";
                }

                activeCourses.forEach(c => {
                    if (!c.hasNoSlot && c.day === d && c.slot === ts.key) {
                        if (content !== "") {
                            content += `<div>${c.code}</div>`;
                            cellClass = "slot-clash";
                        } else {
                            content = `<div>${c.code}</div>`;
                            cellClass = "slot-active";
                        }
                    }
                });

                const clashLabel = cellClass === 'slot-clash'
                    ? '<div><span class="lang-zh">時段衝突</span><span class="lang-en">Time clash</span></div>'
                    : '';
                row += `<td class="${cellClass}">${clashLabel}${content}</td>`;
            });
            row += `</tr>`;
            tbody.innerHTML += row;
        });
        document.getElementById('chkNoClash').checked = !isClash;
        renderOverrideTab();
    };

    window.renderOverrideTab = function () {
        const majorKey = getSelectedMajor();
        const failedCode = getSelectedFailedCourse();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];
        const failedObj = major.courses.find(c => c.code === failedCode);

        const chainContainer = document.getElementById('prereqChainContainer');
        if (chainContainer) {
            chainContainer.innerHTML = failedObj ? `
                <div class="chain-node failed">${failedObj.code} <span class="lang-zh">需重修</span><span class="lang-en">Retake</span></div>
                ${failedObj.blocks ? `<span aria-hidden="true">➔</span><div class="chain-node">${failedObj.blocks} <span class="lang-zh">先修要求未滿足</span><span class="lang-en">Prerequisite unmet</span></div>` : ''}
                ${failedObj.downstream ? `<span aria-hidden="true">➔</span><div class="chain-node">${failedObj.downstream}</div>` : ''}
            ` : `<p><span class="lang-zh">請先在課程清單標記不合格課程，或選擇重修模擬課程。</span><span class="lang-en">Mark a course as failed in the checklist or select a retake simulation course first.</span></p>`;
        }

        const gpaOk = document.getElementById('chkGpa').checked;
        const noClash = document.getElementById('chkNoClash').checked;
        const banner = document.getElementById('overrideEligibilityBanner');
        if (banner) {
            if (gpaOk && noClash) {
                banner.innerHTML = `
                    <div class="alert alert-success" style="margin-top:10px;">
                        <strong><span class="lang-zh">✓ 符合示範豁免條件</span><span class="lang-en">✓ Sample waiver checks passed</span></strong>
                    </div>
                `;
            } else {
                banner.innerHTML = `
                    <div class="alert alert-danger" style="margin-top:10px;">
                        <strong><span class="lang-zh">⚠ 尚未符合示範豁免條件</span><span class="lang-en">⚠ Sample waiver checks incomplete</span></strong>
                    </div>
                `;
            }
        }
    };

    window.downloadForm = function () {
        const majorKey = getSelectedMajor();
        const failedCode = getSelectedFailedCourse();
        alert(document.body.dataset.lang === 'en'
            ? `Sample waiver application\nMajor: ${majorKey}\nCourse to retake: ${failedCode}`
            : `示範豁免申請\n主修：${majorKey}\n需重修科目：${failedCode}`);
    };

    function translateOptions() {
        const language = document.body.dataset.lang === 'en' ? 'en' : 'zh';
        document.querySelectorAll('#pageContent option[data-en][data-zh]').forEach(option => {
            option.textContent = option.dataset[language];
        });
    }

    document.addEventListener('portal:languagechange', () => {
        translateOptions();
        configureMajorSelectionForYear();
        renderChecklist();
    });
    document.getElementById('failedCourseSelect').addEventListener('change', () => {
        const code = getSelectedFailedCourse();
        if (code) {
            const clearedCourses = markCourseFailed(code);
            refreshAuditViews();
            setAuditStatusFeedback(code, 'failed', clearedCourses);
        } else {
            refreshAuditViews();
        }
    });
    document.getElementById('flowchartSemester').replaceChildren(...semesters.map(semester => new Option(semester)));
    document.getElementById('flowchartMoveForm').addEventListener('submit', event => {
        event.preventDefault();
        moveCourse(document.getElementById('flowchartCourse').value, document.getElementById('flowchartSemester').value);
    });
    translateOptions();
    handleGlobalChange();
})();
