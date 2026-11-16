/**
 * Degree Audit & Recovery Simulator v6 - Integrated Portal Module
 */

(function () {
    const defaultFailedCourse = ''; // Do not pre-mark a course as failed in a fresh audit.
    const semesters = ['GE', '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B'];
    const expandedSemesters = new Set();
    let semesterExpansionInitialized = false;
    const data = window.EE4213Data;
    const coursePoolResolver = window.EE4213CoursePool;
    if (!data || !coursePoolResolver) {
        throw new Error('Degree Audit requires shared course and profile data.');
    }
    const courseRecordsByCode = new Map(data.courses.map(course => [course.courseId, course]));
    const comparatorTransferKey = 'ee4213.course-planner.transfer.v1';
    const preRegistrationLabels = {
        zh: '預先註冊（預計）',
        en: 'Pre-registered (projected)'
    };
    const slotSelectionStorageKey = 'ee4213.degree-audit.slot-selections.v1';
    const curriculumData = Object.fromEntries(data.majors.map(major => [
        major.majorId,
        {
            name: major.name.en,
            courses: major.curriculum.map(courseId => {
                const course = courseRecordsByCode.get(courseId);
                const curriculum = course?.curriculumByMajor?.[major.majorId];
                if (!course || !curriculum) {
                    throw new Error(`Missing ${major.majorId} curriculum data for ${courseId}.`);
                }
                return {
                    code: courseId,
                    name: curriculum.curriculumTitle,
                    cu: course.creditUnits,
                    defaultSem: curriculum.semester,
                    day: curriculum.day,
                    slot: curriculum.timeSlot,
                    prereq: curriculum.prerequisiteCourseIds?.[0],
                    prereqs: curriculum.prerequisiteCourseIds || [],
                    blocks: curriculum.blocksCourseId,
                    downstream: curriculum.downstreamCourseId,
                    hasNoSlot: curriculum.hasNoTimetableSlot,
                    isGe: curriculum.isGeneralEducation,
                    isTe: curriculum.isTechnicalElective
                };
            })
        }
    ]));

    // Year 1 is a common curriculum before students select a major in Year 2.
    // Build it from the courses shared by every major in GE, 1A and 1B.
    const majorIds = data.majors.map(major => major.majorId);
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
    const coursePlacements = {};
    const selectedSlotCourses = {};
    const progressStorageKey = 'cityuEE4213DegreeAuditStatusV2';
    let sharedProgress = readSharedProgress();
    let profileCoursePool = coursePoolResolver.resolve(data, coursePoolResolver.readProfile(), sharedProgress);
    let activeMajor;
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
        completedCourses.forEach(courseCode => {
            if (!Object.hasOwn(statuses, courseCode)) statuses[courseCode] = 'completed';
            if (activeMajor === 'COMMON') commonStatuses[courseCode] = 'completed';
        });
        failedCourses.forEach(courseCode => {
            if (!Object.hasOwn(statuses, courseCode)) statuses[courseCode] = 'failed';
            if (activeMajor === 'COMMON') commonStatuses[courseCode] = 'failed';
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
            const savedMajorId = majorIds.includes(sharedProgress.activeMajor)
                ? sharedProgress.activeMajor
                : majorIds.find(id => sharedProgress.byMajor?.[id]);
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
        resetManualClashConfirmation();
        saveCurrentMajorProgress();
        profileCoursePool = coursePoolResolver.resolve(data, coursePoolResolver.readProfile(), sharedProgress);
        renderFlowchart();
        renderRoadmapAndAudit();
    }

    function resetManualClashConfirmation() {
        const checkbox = document.getElementById('chkNoClash');
        if (checkbox) checkbox.checked = false;
    }

    function getSelectedMajor() {
        // An empty Year 2+ selection still uses the common-year curriculum,
        // keeping Degree Audit usable before a major is chosen.
        return document.getElementById('majorSelect').value || 'COMMON';
    }

    function getMajorLabel(majorKey) {
        if (majorKey === 'COMMON') {
            return document.body.dataset.lang === 'en'
                ? 'Common Year 1 (major not selected)'
                : '共同一年級（尚未選擇主修）';
        }
        const localizedNames = {
            CDE: '電子計算機及數據工程學',
            INFE: '資訊工程學',
            ELEL: '電子及電機工程學',
            MEE: '微電子工程學'
        };
        const major = data.majors.find(item => item.majorId === majorKey);
        return major?.name?.[document.body.dataset.lang] ||
            (document.body.dataset.lang === 'zh' && localizedNames[majorKey]) ||
            major?.name?.en || majorKey;
    }

    function configureMajorSelectionForYear() {
        profileCoursePool = coursePoolResolver.resolve(data, coursePoolResolver.readProfile(), sharedProgress);
        const year = profileCoursePool.year;
        const majorSelect = document.getElementById('majorSelect');
        const hint = document.getElementById('majorSelectionHint');
        const routeSelect = document.getElementById('degreeRouteSelect');
        const yearSelect = document.getElementById('yearSelect');
        majorSelect.value = profileCoursePool.majorId || '';
        routeSelect.value = String(profileCoursePool.routeCreditUnits);
        yearSelect.value = String(year);
        majorSelect.disabled = true;
        routeSelect.disabled = true;
        yearSelect.disabled = true;
        if (hint) hint.textContent = !profileCoursePool.majorId
            ? (document.body.dataset.lang === 'en'
                ? 'Choose a major in Student Profile to see courses for this year.'
                : '請先在學生資料選擇主修，才能查看本學年的課程。')
            : year === 1
                ? (document.body.dataset.lang === 'en'
                    ? 'Year 1 is a common curriculum shared by all majors.'
                    : '一年級為所有主修共用的共同課程。')
                : (document.body.dataset.lang === 'en'
                    ? 'The selected major curriculum follows Student Profile.'
                    : '目前主修課程會跟隨學生資料設定。');
    }

    function getSelectedDegreeRoute() {
        return Number(document.getElementById('degreeRouteSelect').value);
    }

    function createCourseInfoLink(code) {
        const link = document.createElement('a');
        link.className = 'audit-course-info-link';
        link.href = coursePoolResolver.courseInfoHref(code);
        link.textContent = '↗';
        link.setAttribute('aria-label', document.body.dataset.lang === 'en'
            ? `View ${code} course information`
            : `查看 ${code} 課程資訊`);
        return link;
    }

    function getCourseTitle(code, fallback) {
        const language = document.body.dataset.lang === 'en' ? 'en' : 'zh';
        return courseRecordsByCode.get(code)?.titles?.[language] || fallback;
    }

    function readSlotSelections(majorKey) {
        try {
            const raw = sessionStorage.getItem(slotSelectionStorageKey);
            const parsed = raw ? JSON.parse(raw) : null;
            const savedSelections = parsed?.version === 1 ? parsed.byMajor?.[majorKey] : null;
            if (!savedSelections || typeof savedSelections !== 'object') return {};

            const selections = {};
            Object.entries(savedSelections).forEach(([slotCode, courseCode]) => {
                const slot = curriculumData[majorKey]?.courses.find(course => course.code === slotCode);
                if (!slot || !isCourseSlot(slot) ||
                    !getSlotCourseOptions(slot, majorKey).some(course => course.courseId === courseCode)) return;
                selections[slotCode] = courseCode;
            });
            return selections;
        } catch (error) {
            console.warn('Unable to restore Degree Audit elective selections.', error);
            return {};
        }
    }

    function saveSlotSelections() {
        if (!activeMajor) return;
        try {
            const raw = sessionStorage.getItem(slotSelectionStorageKey);
            const parsed = raw ? JSON.parse(raw) : null;
            const byMajor = parsed?.version === 1 && parsed.byMajor && typeof parsed.byMajor === 'object'
                ? parsed.byMajor
                : {};
            byMajor[activeMajor] = { ...selectedSlotCourses };
            sessionStorage.setItem(slotSelectionStorageKey, JSON.stringify({ version: 1, byMajor }));
        } catch (error) {
            console.warn('Unable to save Degree Audit elective selections.', error);
        }
    }

    function getSlotCourseCode(slotCode) {
        return selectedSlotCourses[slotCode] || slotCode;
    }

    function getSlotCourse(slotCode) {
        const selectedCode = selectedSlotCourses[slotCode];
        return selectedCode ? courseRecordsByCode.get(selectedCode) : null;
    }

    function isCourseSlot(course) {
        return course.isTe || /^GE_AREA[123]$/.test(course.code) || course.code === 'GE_RANDOM';
    }

    function getGeneralEducationArea(courseId) {
        if (!/^GE\d{4}$/.test(courseId) || courseRecordsByCode.get(courseId)?.category === 'core') return null;
        const area = Number(courseId[3]);
        return area >= 1 && area <= 3 ? area : null;
    }

    function getSlotCourseOptions(slot, majorKey) {
        const major = curriculumData[majorKey] || curriculumData.COMMON;
        const requiredCourseCodes = new Set(major.courses.map(course => course.code));
        const selectedElsewhere = new Set(Object.entries(selectedSlotCourses)
            .filter(([slotCode]) => slotCode !== slot.code)
            .map(([, courseCode]) => courseCode));

        return data.courses
            .filter(course => {
                if (course.creditUnits !== slot.cu ||
                    requiredCourseCodes.has(course.courseId) ||
                    selectedElsewhere.has(course.courseId)) return false;
                if (slot.isTe) return course.category === 'elective';
                const area = getGeneralEducationArea(course.courseId);
                const requiredArea = slot.code === 'GE_RANDOM' ? null : Number(slot.code.slice(-1));
                return area !== null && (requiredArea === null || area === requiredArea);
            })
            .sort((first, second) => first.courseId.localeCompare(second.courseId));
    }

    function getCourseStatus(courseCode) {
        return failedCourses.has(courseCode)
            ? 'failed'
            : completedCourses.has(courseCode) ? 'completed' : 'not-taken';
    }

    function createCourseStatusControls(courseCode, displayCode, source) {
        const language = document.body.dataset.lang === 'en' ? 'en' : 'zh';
        const status = getCourseStatus(courseCode);
        const controls = document.createElement('div');
        controls.className = 'course-inline-status';
        controls.setAttribute('role', 'group');
        controls.setAttribute('aria-label', language === 'en'
            ? `Set status for ${displayCode}`
            : `設定 ${displayCode} 的修讀狀態`);

        [
            {
                value: 'completed',
                symbol: '✓',
                actionZh: status === 'completed' ? '取消已完成狀態' : '標記為已完成',
                actionEn: status === 'completed' ? 'Clear completed status' : 'Mark completed'
            },
            {
                value: 'failed',
                symbol: '!',
                actionZh: status === 'failed' ? '取消不合格狀態' : '標記為不合格',
                actionEn: status === 'failed' ? 'Clear failed status' : 'Mark failed'
            }
        ].forEach(option => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `course-status-action is-${option.value}`;
            button.dataset.statusCourse = courseCode;
            button.dataset.statusSource = source;
            button.dataset.statusValue = option.value;
            button.setAttribute('aria-pressed', String(status === option.value));
            button.setAttribute('aria-label', language === 'en'
                ? `${option.actionEn}: ${displayCode}`
                : `${option.actionZh}：${displayCode}`);
            button.title = button.getAttribute('aria-label');
            button.textContent = option.symbol;
            button.addEventListener('click', () => {
                window.degreeAuditSetCourseStatus(
                    courseCode,
                    status === option.value ? 'not-taken' : option.value
                );
                const nextFocus = Array.from(document.querySelectorAll('.course-status-action'))
                    .find(item => item.dataset.statusCourse === courseCode &&
                        item.dataset.statusValue === option.value &&
                        item.dataset.statusSource === source)
                    || Array.from(document.querySelectorAll('.course-status-action'))
                        .find(item => item.dataset.statusCourse === courseCode &&
                            item.dataset.statusValue === option.value);
                nextFocus?.focus();
            });
            controls.appendChild(button);
        });

        return controls;
    }

    function createSlotCourseSelector(slot, majorKey) {
        const language = document.body.dataset.lang === 'en' ? 'en' : 'zh';
        const wrapper = document.createElement('label');
        wrapper.className = 'flow-slot-course-control';
        const label = document.createElement('span');
        label.className = 'flow-control-label';
        const chineseLabel = document.createElement('span');
        chineseLabel.className = 'lang-zh';
        chineseLabel.textContent = `為 ${slot.code} 選擇課程`;
        const englishLabel = document.createElement('span');
        englishLabel.className = 'lang-en';
        englishLabel.textContent = `Choose a course for ${slot.code}`;
        label.append(chineseLabel, englishLabel);
        const select = document.createElement('select');
        select.dataset.slotCourse = slot.code;
        select.setAttribute('aria-label', language === 'en'
            ? `Choose a course for ${slot.code}`
            : `為 ${slot.code} 選擇課程`);
        select.appendChild(new Option(
            language === 'en' ? 'Choose a course…' : '選擇課程…',
            ''
        ));
        getSlotCourseOptions(slot, majorKey).forEach(course => {
            const title = getCourseTitle(course.courseId, course.courseId);
            select.appendChild(new Option(
                `${course.courseId} — ${title} (${course.creditUnits} CU)`,
                course.courseId
            ));
        });
        select.value = selectedSlotCourses[slot.code] || '';
        select.addEventListener('change', () => {
            const nextCode = select.value;
            if (nextCode) selectedSlotCourses[slot.code] = nextCode;
            else delete selectedSlotCourses[slot.code];
            saveSlotSelections();
            completedCourses.delete(slot.code);
            failedCourses.delete(slot.code);
            resetManualClashConfirmation();
            renderFlowchart();
            renderRoadmapAndAudit();
            const nextTrigger = document.querySelector(`.course-row-options-toggle[data-options-for="${slot.code}"]`);
            nextTrigger?.focus();
        });
        wrapper.append(label, select);
        return wrapper;
    }

    function hasProjectedPreRegistration(code, majorKey) {
        const preRegistration = courseRecordsByCode.get(code)?.preRegistration;
        if (preRegistration?.status !== 'projected' || !Array.isArray(preRegistration.majorIds)) return false;
        if (majorKey === 'COMMON') {
            return data.majors.every(major => preRegistration.majorIds.includes(major.majorId));
        }
        return preRegistration.majorIds.includes(majorKey);
    }

    function createFlowMarker(kind, symbol, label) {
        const marker = document.createElement('span');
        marker.className = `flow-card-marker is-${kind}`;
        marker.textContent = symbol;
        marker.setAttribute('role', 'img');
        marker.setAttribute('aria-label', label);
        marker.title = label;
        return marker;
    }

    function getSelectedFailedCourse() {
        return document.getElementById('failedCourseSelect').value;
    }

    function getActiveCurriculumData() {
        return curriculumData;
    }

    window.handleGlobalChange = function () {
        configureMajorSelectionForYear();
        const majorKey = getSelectedMajor();
        const major = curriculumData[majorKey] || curriculumData.COMMON;
        const majorChanged = activeMajor !== majorKey;

        if (majorChanged) {
            if (activeMajor) saveCurrentMajorProgress();
            activeMajor = majorKey;
            Object.keys(selectedSlotCourses).forEach(slotCode => delete selectedSlotCourses[slotCode]);
            Object.assign(selectedSlotCourses, readSlotSelections(majorKey));
            Object.keys(coursePlacements).forEach(courseCode => delete coursePlacements[courseCode]);

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
        document.querySelectorAll('#pageContent[data-page="degree-audit"] .tab-content').forEach(content => {
            const active = content.id === tabId;
            content.classList.toggle('active', active);
            content.hidden = !active;
        });
        document.querySelectorAll('#pageContent[data-page="degree-audit"] .tab-btn').forEach(tab => {
            const active = tab === btn;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
        });
        if (tabId === 'roadmapTab') scheduleCardEqualization();
        if (tabId === 'overrideTab') window.renderOverrideTab?.();
    };

    const auditTabs = [...document.querySelectorAll('#pageContent[data-page="degree-audit"] .tab-btn')];
    auditTabs.forEach((tab, index) => {
        tab.addEventListener('keydown', event => {
            const last = auditTabs.length - 1;
            let nextIndex = null;
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = index === last ? 0 : index + 1;
            else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = index === 0 ? last : index - 1;
            else if (event.key === 'Home') nextIndex = 0;
            else if (event.key === 'End') nextIndex = last;
            if (nextIndex === null) return;
            event.preventDefault();
            const next = auditTabs[nextIndex];
            window.switchTab(next.getAttribute('aria-controls'), next);
            next.focus();
        });
    });

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
        } else if (status === 'failed') {
            failedCourses.add(code);
            completedCourses.delete(code);
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

    window.resetChecklistToDefault = function () {
        // The prototype must not assume that a student has taken any course.
        // Clear all card status controls and semester overrides.
        completedCourses.clear();
        failedCourses.clear();
        const failedSelect = document.getElementById('failedCourseSelect');
        if (failedSelect) failedSelect.value = '';
        Object.keys(coursePlacements).forEach(courseCode => delete coursePlacements[courseCode]);
        syncRetakeCourse('');
        const feedback = document.getElementById('audit-status-feedback');
        if (feedback) feedback.textContent = '';
        refreshAuditViews();
    };

    function getCourseSemester(course) {
        return coursePlacements[course.code] || course.defaultSem;
    }

    function createCourseResetButton(course, isMoved) {
        const language = document.body.dataset.lang === 'en' ? 'en' : 'zh';
        const displayCode = getSlotCourseCode(course.code);
        const recommended = course.defaultSem === 'GE'
            ? (language === 'en' ? 'GE grouping' : '通識科目')
            : course.defaultSem;
        const label = language === 'en'
            ? `Reset ${displayCode} to recommended semester ${recommended}`
            : `將 ${displayCode} 重設至建議學期 ${recommended}`;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'flow-reset-button';
        button.dataset.resetCourse = course.code;
        button.textContent = '↺';
        button.setAttribute('aria-label', label);
        button.title = label;
        button.disabled = !isMoved;
        button.addEventListener('click', event => {
            event.stopPropagation();
            resetCourseSemester(course.code);
        });
        return button;
    }

    function setSemesterPanelOpen(panel, open, persist = true) {
        const body = panel.querySelector('.sem-body');
        const toggle = panel.querySelector('.sem-toggle');
        if (!body || !toggle) return;
        body.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.classList.toggle('is-open', open);
        panel.classList.toggle('is-open', open);
        if (!persist) return;
        if (open) expandedSemesters.add(panel.dataset.semester);
        else expandedSemesters.delete(panel.dataset.semester);
    }

    function closeCourseOptionsPopover(restoreFocus = false) {
        const popover = document.querySelector('.course-options-popover:not([hidden])');
        if (!popover) return;
        const row = popover.closest('.course-row');
        popover.hidden = true;
        row?.classList.remove('has-options-open');
        const trigger = row?.querySelector('.course-row-options-toggle');
        trigger?.setAttribute('aria-expanded', 'false');
        if (restoreFocus) trigger?.focus();
    }

    function toggleCourseOptions(trigger, popover, row) {
        const shouldOpen = popover.hidden;
        closeCourseOptionsPopover();
        if (!shouldOpen) return;
        popover.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        row.classList.add('has-options-open');
        const firstFocus = popover.querySelector('select, button');
        firstFocus?.focus();
    }

    document.addEventListener('click', event => {
        if (event.target.closest('.course-options-popover') ||
            event.target.closest('.course-row-options-toggle')) return;
        closeCourseOptionsPopover();
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        closeCourseOptionsPopover(true);
    });

    function renderFlowchart() {
            const majorKey = getSelectedMajor();
            const failedCode = getSelectedFailedCourse();
            const language = document.body.dataset.lang === 'en' ? 'en' : 'zh';
            const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];

            const titleEl = document.getElementById('flowchartTitle');
            if (titleEl) {
                titleEl.innerHTML = `<span class="lang-zh">課程結構與學期規劃</span><span class="lang-en">Curriculum and term plan</span> — ${getMajorLabel(majorKey)} (${majorKey})`;
            }

            const container = document.getElementById('flowchartGridContainer');
            if (!container) return;
            container.replaceChildren();

            if (!semesterExpansionInitialized) {
                semesters.forEach(semester => expandedSemesters.add(semester));
                semesterExpansionInitialized = true;
            }

            let popoverIndex = 0;
            semesters.forEach(semLabel => {
                const semCourses = major.courses.filter(course => getCourseSemester(course) === semLabel);
                if (!semCourses.length) return;

                const semCuTotal = semCourses.reduce((total, course) => total + course.cu, 0);
                const prereqViolationsByCourse = new Map();
                semCourses.forEach(course => {
                    (course.prereqs || []).forEach(prerequisiteCode => {
                        if (completedCourses.has(prerequisiteCode)) return;
                        const prerequisite = major.courses.find(item => item.code === prerequisiteCode);
                        const prerequisiteSemester = prerequisite ? getCourseSemester(prerequisite) : '';
                        const currentSemesterIndex = semesters.indexOf(semLabel);
                        const prerequisiteSemesterIndex = semesters.indexOf(prerequisiteSemester);
                        if ((prerequisiteSemesterIndex >= 0 && prerequisiteSemesterIndex >= currentSemesterIndex) ||
                            failedCourses.has(prerequisiteCode)) {
                            const violations = prereqViolationsByCourse.get(course.code) || [];
                            violations.push(prerequisiteCode);
                            prereqViolationsByCourse.set(course.code, violations);
                        }
                    });
                });
                const warningCount = semCourses.filter(course =>
                    (prereqViolationsByCourse.get(course.code) || []).length || Boolean(getPlannerBlockInfo(course.code))
                ).length;

                const panel = document.createElement('section');
                panel.className = 'sem-panel';
                panel.dataset.semester = semLabel;
                panel.addEventListener('dragover', event => {
                    if (!event.dataTransfer?.types.includes('text/plain')) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    panel.classList.add('drag-over');
                    setSemesterPanelOpen(panel, true);
                });
                panel.addEventListener('dragleave', event => {
                    if (!panel.contains(event.relatedTarget)) panel.classList.remove('drag-over');
                });
                panel.addEventListener('drop', event => {
                    event.preventDefault();
                    panel.classList.remove('drag-over');
                    const courseCode = event.dataTransfer.getData('text/plain');
                    moveCourseToSemester(courseCode, semLabel);
                });

                const summary = document.createElement('div');
                summary.className = 'sem-summary';

                const bodyId = `sem-body-${semLabel.replace(/[^A-Za-z0-9_-]/g, '-')}`;
                const toggle = document.createElement('button');
                toggle.type = 'button';
                toggle.className = 'sem-toggle';
                toggle.setAttribute('aria-expanded', String(expandedSemesters.has(semLabel)));
                toggle.setAttribute('aria-controls', bodyId);
                const chevron = document.createElement('span');
                chevron.className = 'sem-chevron';
                chevron.setAttribute('aria-hidden', 'true');
                chevron.textContent = '▸';
                const label = document.createElement('span');
                label.className = 'sem-label';
                if (semLabel === 'GE') {
                    const chineseLabel = document.createElement('span');
                    chineseLabel.className = 'lang-zh';
                    chineseLabel.textContent = '通識科目';
                    const englishLabel = document.createElement('span');
                    englishLabel.className = 'lang-en';
                    englishLabel.textContent = 'GE Courses';
                    label.append(chineseLabel, englishLabel);
                } else {
                    label.textContent = semLabel;
                }
                const meta = document.createElement('span');
                meta.className = 'sem-summary-meta';
                const credits = document.createElement('span');
                credits.className = 'sem-cu-counter';
                credits.textContent = `${semCuTotal} CU`;
                const courseCount = document.createElement('span');
                courseCount.textContent = language === 'en'
                    ? `${semCourses.length} course${semCourses.length === 1 ? '' : 's'}`
                    : `${semCourses.length} 門課程`;
                meta.append(credits, document.createTextNode(' · '), courseCount);
                toggle.append(chevron, label, meta);
                if (warningCount) {
                    const warning = document.createElement('span');
                    warning.className = 'sem-summary-warning';
                    warning.textContent = `⚠ ${warningCount}`;
                    warning.title = language === 'en'
                        ? `${warningCount} prerequisite warning${warningCount === 1 ? '' : 's'}`
                        : `${warningCount} 項先修警告`;
                    warning.setAttribute('aria-label', warning.title);
                    toggle.appendChild(warning);
                }
                toggle.addEventListener('click', () => {
                    setSemesterPanelOpen(panel, toggle.getAttribute('aria-expanded') !== 'true');
                });

                const actions = document.createElement('div');
                actions.className = 'sem-actions';
                const markAllButton = document.createElement('button');
                markAllButton.type = 'button';
                markAllButton.className = 'sem-compare-button sem-bulk-complete';
                markAllButton.innerHTML = '<span class="lang-zh">✓ 全部完成</span><span class="lang-en">✓ Mark all</span>';
                markAllButton.setAttribute('aria-label', language === 'en'
                    ? `Mark all courses in ${semLabel === 'GE' ? 'GE' : `Semester ${semLabel}`} as completed`
                    : `將 ${semLabel === 'GE' ? '通識科目' : `${semLabel} 學期`} 所有課程標記為已完成`);
                markAllButton.addEventListener('click', () => markSemesterCompleted(semLabel));
                actions.appendChild(markAllButton);
                if (semLabel !== 'GE') {
                    const compareButton = document.createElement('button');
                    compareButton.type = 'button';
                    compareButton.className = 'sem-compare-button';
                    compareButton.innerHTML = '<span class="lang-zh">時間表</span><span class="lang-en">Timetable</span>';
                    compareButton.setAttribute('aria-label', language === 'en'
                        ? `View the ${semLabel} timetable in Course Comparator`
                        : `在課程比較器查看 ${semLabel} 時間表`);
                    compareButton.addEventListener('click', () => transferSemesterToComparator(semLabel));
                    actions.appendChild(compareButton);
                }
                summary.append(toggle, actions);

                const body = document.createElement('div');
                body.className = 'sem-body';
                body.id = bodyId;
                const coursesContainer = document.createElement('div');
                coursesContainer.className = 'sem-courses';
                body.appendChild(coursesContainer);

                semCourses.forEach(course => {
                    const displayCode = getSlotCourseCode(course.code);
                    const isCompleted = completedCourses.has(displayCode);
                    const isFailed = failedCourses.has(displayCode) || displayCode === failedCode;
                    const blockInfo = getPlannerBlockInfo(course.code);
                    const canPlan = !isCompleted && !blockInfo;
                    const selectedCourse = getSlotCourse(course.code);
                    const isMoved = getCourseSemester(course) !== course.defaultSem;
                    const prerequisiteViolations = [...new Set(prereqViolationsByCourse.get(course.code) || [])];
                    const hasPrerequisiteWarning = prerequisiteViolations.length > 0 || Boolean(blockInfo);
                    const isPreRegistered = !isCompleted && !isFailed && !blockInfo &&
                        hasProjectedPreRegistration(course.code, majorKey);
                    let statusKey = 'planned';
                    let statusZh = '規劃中';
                    let statusEn = 'Planned';
                    if (isCompleted) {
                        statusKey = 'completed'; statusZh = '已完成'; statusEn = 'Completed';
                    } else if (blockInfo) {
                        statusKey = 'blocked'; statusZh = '先修受阻'; statusEn = 'Blocked';
                    } else if (isFailed) {
                        statusKey = 'failed'; statusZh = '不合格'; statusEn = 'Failed';
                    } else if (hasPrerequisiteWarning) {
                        statusKey = 'warning'; statusZh = '先修警告'; statusEn = 'Warning';
                    }

                    const row = document.createElement('article');
                    row.className = `course-row is-${statusKey}${canPlan ? ' planable' : ''}${isMoved ? ' is-moved' : ''}${isPreRegistered ? ' is-pre-registered' : ''}`;
                    row.draggable = canPlan;
                    row.dataset.courseSlot = course.code;
                    row.dataset.displayCode = displayCode;
                    row.addEventListener('dragend', () => {
                        document.querySelectorAll('.sem-panel.drag-over').forEach(item => item.classList.remove('drag-over'));
                    });
                    if (canPlan) {
                        row.addEventListener('dragstart', event => {
                            if (event.target.closest('button, summary, select, a')) {
                                event.preventDefault();
                                return;
                            }
                            window.degreeAuditDragStart(event, course.code);
                        });
                    }

                    const main = document.createElement('div');
                    main.className = 'course-row-main';
                    const identity = document.createElement('div');
                    identity.className = 'course-row-identity';
                    const codeLine = document.createElement('span');
                    codeLine.className = 'course-row-code';
                    const code = document.createElement('strong');
                    code.textContent = displayCode;
                    codeLine.appendChild(code);
                    if (courseRecordsByCode.has(displayCode)) codeLine.appendChild(createCourseInfoLink(displayCode));
                    const name = document.createElement('span');
                    name.className = 'course-row-title';
                    name.textContent = getCourseTitle(displayCode, course.name);
                    name.title = name.textContent;
                    identity.append(codeLine, name);

                    const creditsLabel = document.createElement('span');
                    creditsLabel.className = 'course-row-credits';
                    creditsLabel.textContent = `${course.cu} CU`;

                    const status = document.createElement('span');
                    status.className = `course-row-status is-${statusKey}`;
                    const statusZhText = document.createElement('span');
                    statusZhText.className = 'lang-zh';
                    statusZhText.textContent = statusZh;
                    const statusEnText = document.createElement('span');
                    statusEnText.className = 'lang-en';
                    statusEnText.textContent = statusEn;
                    status.append(statusZhText, statusEnText);

                    const markers = document.createElement('div');
                    markers.className = 'course-row-markers';
                    if (isPreRegistered) markers.appendChild(createFlowMarker('pre-registration', 'P', preRegistrationLabels[language]));
                    if (isCompleted) markers.appendChild(createFlowMarker('completed', '✓', language === 'en' ? 'Completed' : '已完成'));
                    else if (blockInfo) markers.appendChild(createFlowMarker('blocked', '⚠', language === 'en' ? 'Prerequisite blocked' : '先修受阻'));
                    else if (isFailed) markers.appendChild(createFlowMarker('failed', '!', language === 'en' ? 'Failed (retake may be planned)' : '不合格（可規劃重修）'));
                    if (isMoved) markers.appendChild(createFlowMarker('rescheduled', '↺', language === 'en' ? 'Rescheduled' : '已調整學期'));

                    const actions = document.createElement('div');
                    actions.className = 'course-row-actions';
                    actions.appendChild(createCourseStatusControls(displayCode, displayCode, 'flow'));
                    actions.appendChild(createCourseResetButton(course, isMoved));

                    const hasOptions = hasPrerequisiteWarning || isCourseSlot(course);
                    if (hasOptions) {
                        const popoverId = `course-options-${popoverIndex++}`;
                        const trigger = document.createElement('button');
                        trigger.type = 'button';
                        trigger.className = 'course-row-options-toggle';
                        trigger.setAttribute('aria-expanded', 'false');
                        trigger.setAttribute('aria-controls', popoverId);
                        trigger.setAttribute('aria-haspopup', 'dialog');
                        trigger.dataset.optionsFor = course.code;
                        trigger.setAttribute('aria-label', language === 'en'
                            ? `Course options for ${displayCode}`
                            : `${displayCode} 的課程選項`);
                        trigger.title = trigger.getAttribute('aria-label');
                        trigger.textContent = '⋯';
                        actions.appendChild(trigger);

                        const popover = document.createElement('div');
                        popover.className = 'course-options-popover';
                        popover.id = popoverId;
                        popover.hidden = true;
                        popover.setAttribute('role', 'dialog');
                        popover.setAttribute('aria-label', trigger.getAttribute('aria-label'));
                        const popoverHeader = document.createElement('div');
                        popoverHeader.className = 'course-options-header';
                        const popoverTitle = document.createElement('strong');
                        popoverTitle.innerHTML = '<span class="lang-zh">課程選項</span><span class="lang-en">Course options</span>';
                        const closeOptions = document.createElement('button');
                        closeOptions.type = 'button';
                        closeOptions.className = 'course-options-close';
                        closeOptions.textContent = '×';
                        closeOptions.setAttribute('aria-label', language === 'en'
                            ? `Close options for ${displayCode}`
                            : `關閉 ${displayCode} 的選項`);
                        closeOptions.title = closeOptions.getAttribute('aria-label');
                        closeOptions.addEventListener('click', () => closeCourseOptionsPopover(true));
                        popoverHeader.append(popoverTitle, closeOptions);
                        popover.appendChild(popoverHeader);

                        if (selectedCourse) {
                            const slotNote = document.createElement('span');
                            slotNote.className = 'flow-course-slot-note';
                            slotNote.textContent = language === 'en'
                                ? `Fulfills ${course.code}`
                                : `符合 ${course.code} 要求`;
                            popover.appendChild(slotNote);
                        }
                        if (hasPrerequisiteWarning) {
                            const warning = document.createElement('div');
                            warning.className = 'flow-prereq-warning';
                            warning.appendChild(document.createTextNode('⚠ '));
                            const chineseText = document.createElement('span');
                            chineseText.className = 'lang-zh';
                            const englishText = document.createElement('span');
                            englishText.className = 'lang-en';
                            if (blockInfo) {
                                const prerequisitePath = blockInfo.chain.slice(0, -1);
                                chineseText.textContent = `須先完成：${prerequisitePath.join(' → ')}`;
                                englishText.textContent = `Complete first: ${prerequisitePath.join(' → ')}`;
                            } else {
                                chineseText.textContent = `須先完成 ${prerequisiteViolations.join('、')}`;
                                englishText.textContent = `Complete ${prerequisiteViolations.join(', ')} first`;
                            }
                            warning.append(chineseText, englishText);
                            popover.appendChild(warning);
                        }
                        if (isCourseSlot(course)) {
                            popover.appendChild(createSlotCourseSelector(course, majorKey));
                        }

                        trigger.addEventListener('click', () => toggleCourseOptions(trigger, popover, row));
                        row.append(main, popover);
                    } else {
                        row.append(main);
                    }
                    const footer = document.createElement('div');
                    footer.className = 'course-row-footer';
                    footer.append(status, markers, actions);
                    main.append(identity, creditsLabel, footer);
                    coursesContainer.appendChild(row);
                });

                panel.append(summary, body);
                setSemesterPanelOpen(panel, expandedSemesters.has(semLabel), false);
                container.appendChild(panel);
            });
        }


    let cardEqualizeFrame = 0;

    function equalizeCourseCards() {
        document.querySelectorAll('#flowchartGridContainer .sem-courses').forEach(container => {
            const cards = [...container.querySelectorAll('.flow-box')];
            if (cards.length < 2) return;
            cards.forEach(card => { card.style.minHeight = ''; });
            const tallest = Math.max(...cards.map(card => card.getBoundingClientRect().height));
            if (!tallest) return;
            const height = `${Math.ceil(tallest)}px`;
            cards.forEach(card => { card.style.minHeight = height; });
        });
    }

    function scheduleCardEqualization() {
        if (typeof requestAnimationFrame !== 'function') return;
        if (cardEqualizeFrame) cancelAnimationFrame(cardEqualizeFrame);
        cardEqualizeFrame = requestAnimationFrame(() => {
            cardEqualizeFrame = 0;
            equalizeCourseCards();
        });
    }

    function markSemesterCompleted(semester) {
        const status = document.getElementById('planner-assignment-status');
        const major = getActiveCurriculumData()[getSelectedMajor()];
        const semesterCourses = (major?.courses || []).filter(course => getCourseSemester(course) === semester);
        if (!semesterCourses.length) return;

        let completedCount = 0;
        const skipped = [];
        // Clear failed courses in this semester first so they do not block their dependents.
        const orderedCourses = [...semesterCourses].sort((first, second) => {
            const firstFailed = failedCourses.has(getSlotCourseCode(first.code));
            const secondFailed = failedCourses.has(getSlotCourseCode(second.code));
            return Number(secondFailed) - Number(firstFailed);
        });
        orderedCourses.forEach(course => {
            const courseCode = getSlotCourseCode(course.code);
            const wasCompleted = completedCourses.has(courseCode);
            const wasFailed = failedCourses.has(courseCode);
            if (wasFailed) failedCourses.delete(courseCode);
            const failedChain = getFailedPrerequisiteChain(course.code);
            if (failedChain) {
                if (wasFailed) failedCourses.add(courseCode);
                if (!wasCompleted) skipped.push({ code: courseCode, chain: failedChain });
                return;
            }
            if (!wasCompleted) {
                completedCourses.add(courseCode);
                completedCount += 1;
            }
        });

        syncRetakeCourse('');
        resetManualClashConfirmation();
        refreshAuditViews();

        if (!status) return;
        const language = document.body.dataset.lang === 'en' ? 'en' : 'zh';
        const semesterName = semester === 'GE'
            ? (language === 'en' ? 'GE' : '通識科目')
            : semester;
        const skippedText = skipped
            .map(item => `${item.code} (${item.chain.join(' → ')})`)
            .join(language === 'en' ? '; ' : '、');

        if (completedCount && skipped.length) {
            status.textContent = language === 'en'
                ? `Marked ${completedCount} course(s) in ${semesterName} as completed. Could not mark: ${skippedText}.`
                : `已將 ${semesterName} 的 ${completedCount} 門課程標記為已完成。未能標記：${skippedText}。`;
        } else if (completedCount) {
            status.textContent = language === 'en'
                ? `Marked ${completedCount} course(s) in ${semesterName} as completed.`
                : `已將 ${semesterName} 的 ${completedCount} 門課程標記為已完成。`;
        } else if (skipped.length) {
            status.textContent = language === 'en'
                ? `No courses were marked. Could not mark: ${skippedText}.`
                : `未能標記任何課程：${skippedText}。`;
        } else {
            status.textContent = language === 'en'
                ? `All courses in ${semesterName} were already marked completed.`
                : `${semesterName} 的所有課程已標記為已完成。`;
        }
    }

    window.degreeAuditDragStart = function (ev, code) {
        ev.dataTransfer.setData("text/plain", code);
        ev.dataTransfer.effectAllowed = "move";
    };

    function moveCourseToSemester(courseCode, semester) {
        const status = document.getElementById('planner-assignment-status');
        const major = getActiveCurriculumData()[getSelectedMajor()];
        const course = major?.courses.find(item => item.code === courseCode);
        if (!semesters.includes(semester) || !courseCode || !course) {
            if (status) status.textContent = document.body.dataset.lang === 'en'
                ? 'Choose a curriculum course and a valid semester.'
                : '請選擇課程結構中的科目及有效學期。';
            return;
        }
        const displayCode = getSlotCourseCode(courseCode);
        if (completedCourses.has(displayCode)) {
            if (status) status.textContent = document.body.dataset.lang === 'en'
                ? `${displayCode} is marked completed and cannot be moved.`
                : `${displayCode} 已標記為完成，不能移動。`;
            return;
        }
        const blocked = getPlannerBlockInfo(courseCode);
        if (blocked) {
            if (status) status.textContent = document.body.dataset.lang === 'en'
                ? `${displayCode} is blocked by failed prerequisite ${blocked.rootCode}.`
                : `${displayCode} 因先修科目 ${blocked.rootCode} 不合格而暫時不能移動。`;
            return;
        }

        const previousSemester = getCourseSemester(course);
        if (previousSemester === semester) {
            if (status) status.textContent = document.body.dataset.lang === 'en'
                ? `${displayCode} is already in ${semester}.`
                : `${displayCode} 已位於 ${semester}。`;
            return;
        }
        if (semester === course.defaultSem) delete coursePlacements[courseCode];
        else coursePlacements[courseCode] = semester;
        resetManualClashConfirmation();
        expandedSemesters.add(semester);
        renderFlowchart();
        renderRoadmapAndAudit();
        focusCourseCard(courseCode);
        const destinationRow = document.querySelector(`.sem-panel[data-semester="${semester}"]`);
        const destinationCredits = destinationRow?.querySelector('.sem-cu-counter')?.textContent || '';
        if (status) status.textContent = document.body.dataset.lang === 'en'
            ? `${displayCode} moved from ${previousSemester} to ${semester}. ${semester} now has ${destinationCredits}.`
            : `${displayCode} 已由 ${previousSemester} 移至 ${semester}；該學期現有 ${destinationCredits}。`;
    };

    function focusCourseCard(courseCode) {
        const card = Array.from(document.querySelectorAll('.course-row'))
            .find(item => item.dataset.courseSlot === courseCode);
        if (!card) return;
        const panel = card.closest('.sem-panel');
        if (panel) setSemesterPanelOpen(panel, true);
        const focusTarget = card.querySelector('.flow-reset-button:not(:disabled)')
            || card.querySelector('.audit-course-info-link')
            || card.querySelector('.course-status-action');
        focusTarget?.focus();
    }

    function resetCourseSemester(courseCode) {
        const status = document.getElementById('planner-assignment-status');
        const major = getActiveCurriculumData()[getSelectedMajor()];
        const course = major?.courses.find(item => item.code === courseCode);
        if (!course) return;
        const displayCode = getSlotCourseCode(course.code);
        const previousSemester = getCourseSemester(course);
        if (previousSemester === course.defaultSem) {
            if (status) status.textContent = document.body.dataset.lang === 'en'
                ? `${displayCode} is already in its recommended semester (${course.defaultSem}).`
                : `${displayCode} 已位於建議學期（${course.defaultSem}）。`;
            return;
        }
        delete coursePlacements[courseCode];
        resetManualClashConfirmation();
        renderFlowchart();
        renderRoadmapAndAudit();
        focusCourseCard(courseCode);
        if (status) status.textContent = document.body.dataset.lang === 'en'
            ? `${displayCode} reset from ${previousSemester} to its recommended semester (${course.defaultSem}).`
            : `${displayCode} 已由 ${previousSemester} 重設至建議學期（${course.defaultSem}）。`;
    }

    function renderRoadmapAndAudit() {
        const majorKey = getSelectedMajor();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()["CDE"];
        const targetReq = getSelectedDegreeRoute();

        let completedCU = 0;
        major.courses.forEach(c => {
            if (completedCourses.has(c.code)) completedCU += c.cu;
        });

        const plannedCU = major.courses.reduce((total, course) => {
            const displayCode = getSlotCourseCode(course.code);
            return getCourseSemester(course) !== course.defaultSem &&
                !completedCourses.has(displayCode) &&
                !failedCourses.has(displayCode) &&
                !getPlannerBlockInfo(course.code)
                ? total + course.cu
                : total;
        }, 0);

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
                            <p class="alert-detail">
                                <span class="lang-zh">距離 ${targetReq} 學分的模擬要求尚有差額。把課程移至所選學期以計算規劃學分。</span>
                                <span class="lang-en">Move courses into selected semesters to count them toward the sample ${targetReq}-credit requirement.</span>
                            </p>
                        </div>
                    </div>
                `;
            } else {
                bannerContainer.innerHTML = `
                    <div class="alert alert-success">
                        <div>
                            <strong><span class="lang-zh">已達模擬學分目標</span><span class="lang-en">Sample credit target met</span></strong>
                            <p class="alert-detail">
                                <span class="lang-zh">已完成及已調整學期的課程合共 ${totalProjected} 學分，達到 ${targetReq} 學分目標。</span>
                                <span class="lang-en">Completed and rescheduled courses total ${totalProjected} CU against a target of ${targetReq} CU.</span>
                            </p>
                        </div>
                    </div>
                `;
            }
        }

        window.renderOverrideTab?.();
    }

    function getDownstreamCourses(failedCode, major) {
        const dependentsByPrerequisite = new Map();
        major.courses.forEach(course => {
            (course.prereqs || []).forEach(prerequisiteCode => {
                if (!dependentsByPrerequisite.has(prerequisiteCode)) {
                    dependentsByPrerequisite.set(prerequisiteCode, []);
                }
                dependentsByPrerequisite.get(prerequisiteCode).push(course);
            });
        });

        const direct = dependentsByPrerequisite.get(failedCode) || [];
        const all = [];
        const visited = new Set([failedCode]);
        const queue = [...direct];
        while (queue.length) {
            const course = queue.shift();
            if (visited.has(course.code)) continue;
            visited.add(course.code);
            all.push(course);
            (dependentsByPrerequisite.get(course.code) || []).forEach(dependent => queue.push(dependent));
        }
        return { direct, all };
    }

    function createChainNode(course, kind, note) {
        const displayCode = getSlotCourseCode(course.code);
        const node = document.createElement('div');
        node.className = `chain-node ${kind}`;
        const code = document.createElement('strong');
        code.textContent = displayCode;
        node.appendChild(code);
        if (courseRecordsByCode.has(displayCode)) {
            node.appendChild(createCourseInfoLink(displayCode));
        }
        if (note) {
            const noteElement = document.createElement('span');
            noteElement.className = 'chain-note';
            noteElement.textContent = note;
            node.appendChild(noteElement);
        }
        node.title = getCourseTitle(displayCode, course.name);
        return node;
    }

    function createChainArrow() {
        const arrow = document.createElement('span');
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '➔';
        return arrow;
    }

    function getOverrideState() {
        const language = document.body.dataset.lang === 'en' ? 'en' : 'zh';
        const majorKey = getSelectedMajor();
        const failedCode = getSelectedFailedCourse();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()['CDE'];
        const failedObj = failedCode ? major.courses.find(course => course.code === failedCode) : null;
        const downstream = failedObj
            ? getDownstreamCourses(failedObj.code, major)
            : { direct: [], all: [] };
        const gpaOk = Boolean(document.getElementById('chkGpa')?.checked);
        const noClash = Boolean(document.getElementById('chkNoClash')?.checked);
        const hasFailed = Boolean(failedObj);
        const hasBlockedCourse = downstream.direct.length > 0;
        const eligible = hasFailed && hasBlockedCourse && gpaOk && noClash;
        const missing = [];

        if (!hasFailed) {
            missing.push(language === 'en'
                ? 'Select a failed/retake course.'
                : '請選擇不合格／重修科目。');
        } else if (!hasBlockedCourse) {
            missing.push(language === 'en'
                ? 'This failed course does not block a downstream course in the current curriculum.'
                : '此科目在目前課程結構中沒有阻擋後續課程。');
        }
        if (!gpaOk) {
            missing.push(language === 'en'
                ? 'Confirm cumulative GPA ≥ 1.70.'
                : '請確認累積 GPA ≥ 1.70。');
        }
        if (hasFailed && !noClash) {
            missing.push(language === 'en'
                ? 'Confirm the retake section has no clash in Course Comparator.'
                : '請在課程比較器確認重修時段沒有衝突。');
        }

        return {
            language,
            majorKey,
            failedCode,
            major,
            failedObj,
            direct: downstream.direct,
            all: downstream.all,
            gpaOk,
            noClash,
            eligible,
            missing
        };
    }

    function renderOverrideBanner(state) {
        const banner = document.getElementById('overrideEligibilityBanner');
        if (!banner) return;
        banner.replaceChildren();

        const box = document.createElement('div');
        box.className = `alert ${state.eligible ? 'alert-success' : 'alert-danger'} override-eligibility-alert`;
        const title = document.createElement('strong');
        title.textContent = state.eligible
            ? (state.language === 'en'
                ? '✓ Eligible to request a sample concurrent enrollment waiver'
                : '✓ 符合申請示範同步修讀豁免的條件')
            : (state.language === 'en'
                ? '⚠ Not eligible yet'
                : '⚠ 尚未符合示範豁免條件');
        box.appendChild(title);

        if (state.eligible) {
            const blockedCodes = state.direct.map(course => course.code).join(', ');
            const detail = document.createElement('p');
            detail.className = 'waiver-banner-detail';
            detail.textContent = state.language === 'en'
                ? `The failed prerequisite blocks ${blockedCodes}. All sample criteria are confirmed; you can preview the waiver.`
                : `不合格的先修科目阻擋了 ${blockedCodes}。所有示範條件已確認，可以預覽豁免申請。`;
            box.appendChild(detail);
        } else {
            const list = document.createElement('ul');
            list.className = 'waiver-missing-list';
            state.missing.forEach(item => {
                const entry = document.createElement('li');
                entry.textContent = item;
                list.appendChild(entry);
            });
            box.appendChild(list);
        }
        banner.appendChild(box);
    }

    window.renderOverrideTab = function () {
        const priorAttempt = document.getElementById('chkPriorAttempt');
        const noClashCheckbox = document.getElementById('chkNoClash');
        const previewButton = document.getElementById('previewWaiverButton');
        const failedCode = getSelectedFailedCourse();
        const majorKey = getSelectedMajor();
        const major = getActiveCurriculumData()[majorKey] || getActiveCurriculumData()['CDE'];
        const failedObj = failedCode ? major.courses.find(course => course.code === failedCode) : null;

        if (priorAttempt) priorAttempt.checked = Boolean(failedObj);
        if (noClashCheckbox) {
            noClashCheckbox.disabled = !failedObj;
            if (!failedObj) noClashCheckbox.checked = false;
        }

        const state = getOverrideState();
        const chainContainer = document.getElementById('prereqChainContainer');
        if (chainContainer) {
            chainContainer.replaceChildren();
            if (!state.failedObj) {
                const prompt = document.createElement('p');
                prompt.textContent = state.language === 'en'
                    ? 'Mark a course as failed on its card or select a retake planning course first.'
                    : '請先在流程圖卡片標記不合格課程，或選擇重修規劃科目。';
                chainContainer.appendChild(prompt);
            } else {
                chainContainer.appendChild(createChainNode(
                    state.failedObj,
                    'failed',
                    state.language === 'en' ? 'Retake' : '需重修'
                ));

                if (state.direct.length) {
                    chainContainer.appendChild(createChainArrow());
                    const directGroup = document.createElement('div');
                    directGroup.className = 'chain-group';
                    state.direct.forEach(course => {
                        directGroup.appendChild(createChainNode(
                            course,
                            'blocked',
                            state.language === 'en' ? 'Prerequisite unmet' : '先修要求未滿足'
                        ));
                    });
                    chainContainer.appendChild(directGroup);
                }

                const directCodes = new Set(state.direct.map(course => course.code));
                const downstream = state.all.filter(course => !directCodes.has(course.code));
                if (downstream.length) {
                    chainContainer.appendChild(createChainArrow());
                    const downstreamGroup = document.createElement('div');
                    downstreamGroup.className = 'chain-group';
                    downstream.forEach(course => {
                        downstreamGroup.appendChild(createChainNode(
                            course,
                            'downstream',
                            state.language === 'en' ? 'Downstream' : '後續課程'
                        ));
                    });
                    chainContainer.appendChild(downstreamGroup);
                }

                if (!state.direct.length) {
                    const note = document.createElement('p');
                    note.className = 'chain-note';
                    note.textContent = state.language === 'en'
                        ? 'No downstream course is blocked by this failed course.'
                        : '此不合格科目目前沒有阻擋後續課程。';
                    chainContainer.appendChild(note);
                }
            }
        }

        if (previewButton) previewButton.disabled = !state.eligible;
        renderOverrideBanner(state);
    };

    window.previewWaiverApplication = function () {
        const state = getOverrideState();
        if (!state.eligible) {
            document.getElementById('overrideEligibilityBanner')?.focus();
            return;
        }

        const fields = document.getElementById('waiverPreviewFields');
        const note = document.getElementById('waiverPreviewNote');
        const dialog = document.getElementById('waiverPreviewDialog');
        if (!fields || !note || !dialog) return;
        fields.replaceChildren();

        const addRow = (label, value) => {
            const term = document.createElement('dt');
            term.textContent = label;
            const detail = document.createElement('dd');
            detail.textContent = value;
            fields.append(term, detail);
        };
        const language = state.language;
        const failedTitle = getCourseTitle(state.failedCode, state.failedObj.name);
        const blockedText = state.direct
            .map(course => `${course.code} — ${getCourseTitle(course.code, course.name)}`)
            .join('; ');
        const chainText = [state.failedCode, ...state.all.map(course => course.code)].join(' → ');
        const routeLabel = document.getElementById('degreeRouteSelect')?.selectedOptions?.[0]?.textContent.trim()
            || `${getSelectedDegreeRoute()} CU`;

        addRow(language === 'en' ? 'Major / entry route' : '主修／入學途徑',
            `${getMajorLabel(state.majorKey)} (${state.majorKey}) · ${routeLabel}`);
        addRow(language === 'en' ? 'Failed course' : '不合格科目',
            `${state.failedCode} — ${failedTitle}`);
        addRow(language === 'en' ? 'Blocked course(s)' : '受阻科目', blockedText);
        addRow(language === 'en' ? 'Prerequisite chain' : '先修科目鏈', chainText);
        addRow(language === 'en' ? 'Prior attempt' : '先修科目修讀紀錄',
            language === 'en' ? 'Confirmed' : '已確認');
        addRow(language === 'en' ? 'Cumulative GPA ≥ 1.70' : '累積 GPA ≥ 1.70',
            language === 'en' ? 'Confirmed' : '已確認');
        addRow(language === 'en' ? 'Retake section clash' : '重修時段衝突',
            language === 'en' ? 'Checked in Course Comparator' : '已於課程比較器檢查');
        addRow(language === 'en' ? 'Retake section' : '重修時段',
            language === 'en' ? 'L01/L02 selected in Course Comparator' : '已於課程比較器選擇 L01/L02');

        note.textContent = language === 'en'
            ? 'This is a sample prototype preview, not an official CityU application or approval.'
            : '此為示範原型預覽，並非城大正式申請或批准。';

        if (!dialog.open) {
            if (typeof dialog.showModal === 'function') dialog.showModal();
            else dialog.setAttribute('open', '');
        }
    };

    window.downloadForm = window.previewWaiverApplication;
    function translateOptions() {
        const language = document.body.dataset.lang === 'en' ? 'en' : 'zh';
        document.querySelectorAll('#pageContent option[data-en][data-zh]').forEach(option => {
            option.textContent = option.dataset[language];
        });
    }

    function openComparatorForConflicts(statusId = 'planner-comparator-status') {
        const status = document.getElementById(statusId);
        const major = getActiveCurriculumData()[getSelectedMajor()];
        const courseIds = [...new Set((major?.courses || [])
            .filter(course => getCourseSemester(course) !== course.defaultSem)
            .filter(course => {
                const courseCode = getSlotCourseCode(course.code);
                return !completedCourses.has(courseCode) &&
                    !failedCourses.has(courseCode) &&
                    !getPlannerBlockInfo(course.code);
            })
            .map(course => getSlotCourseCode(course.code))
            .filter(courseCode => courseRecordsByCode.has(courseCode)))];
        const retakeCourseId = getSelectedFailedCourse();
        try {
            sessionStorage.setItem(comparatorTransferKey, JSON.stringify({
                source: 'degree-audit',
                courseIds,
                retakeCourseId,
                retakeSection: 'L01'
            }));
        } catch (error) {
            console.error('Unable to pass the Degree Audit plan to Course Comparator.', error);
            if (status) status.textContent = document.body.dataset.lang === 'en'
                ? 'The timetable could not be transferred. Check that browser session storage is available and try again.'
                : '無法傳送課表。請確認瀏覽器工作階段儲存空間可用，然後再試一次。';
            return;
        }
        window.location.href = '../comparator/index.html';
    }

    function transferSemesterToComparator(semester) {
        const status = document.getElementById('planner-transfer-status');
        const language = document.body.dataset.lang === 'en' ? 'en' : 'zh';
        const major = getActiveCurriculumData()[getSelectedMajor()];
        const semesterCourses = (major?.courses || []).filter(course => getCourseSemester(course) === semester);
        const courseStatusByCode = new Map();
        const excluded = [];

        semesterCourses.forEach(course => {
            const courseCode = getSlotCourseCode(course.code);
            if (isCourseSlot(course) && !getSlotCourse(course.code)) {
                excluded.push({ courseId: course.code, label: course.name, reason: 'unassigned' });
                return;
            }
            if (!courseRecordsByCode.has(courseCode)) {
                excluded.push({ courseId: courseCode, label: course.name, reason: 'missing' });
                return;
            }

            let courseStatus = 'planned';
            let reason = '';
            if (completedCourses.has(courseCode)) {
                courseStatus = 'completed';
            } else if (failedCourses.has(courseCode)) {
                courseStatus = 'failed';
            } else {
                const blockInfo = getPlannerBlockInfo(course.code);
                if (blockInfo) {
                    courseStatus = 'blocked';
                    reason = blockInfo.chain.join(' → ');
                }
            }
            courseStatusByCode.set(courseCode, { courseId: courseCode, status: courseStatus, reason });
        });

        const courses = [...courseStatusByCode.values()];
        const courseIds = courses.map(course => course.courseId);
        if (!courseIds.length) {
            if (status) status.textContent = language === 'en'
                ? `${semester} has no concrete courses to compare. Assign a course to any unassigned elective/GE requirement first.`
                : `${semester} 沒有可比較的具體課程。請先為未指派的選修／通識要求選擇科目。`;
            return;
        }

        try {
            sessionStorage.setItem(comparatorTransferKey, JSON.stringify({
                source: 'degree-audit',
                semester,
                courseIds,
                courses,
                excluded
            }));
        } catch (error) {
            console.error('Unable to pass the Degree Audit semester to Course Comparator.', error);
            if (status) status.textContent = language === 'en'
                ? 'The courses could not be transferred. Check that browser session storage is available and try again.'
                : '無法傳送課程。請確認瀏覽器工作階段儲存空間可用，然後再試一次。';
            return;
        }
        window.location.href = '../comparator/index.html';
    }

    document.addEventListener('portal:languagechange', () => {
        document.getElementById('planner-assignment-status').textContent = '';
        document.getElementById('planner-transfer-status').textContent = '';
        document.getElementById('planner-comparator-status').textContent = '';
        document.getElementById('override-comparator-status').textContent = '';
        document.getElementById('waiverPreviewDialog')?.close();
        translateOptions();
        configureMajorSelectionForYear();
        renderFlowchart();
        renderRoadmapAndAudit();
    });
    window.addEventListener('pageshow', event => {
        if (!event.persisted) return;
        handleGlobalChange();
    });
    window.addEventListener('resize', scheduleCardEqualization);
    document.getElementById('openComparatorForConflicts')?.addEventListener('click', () => {
        openComparatorForConflicts('planner-comparator-status');
    });
    document.getElementById('openComparatorForRetake')?.addEventListener('click', () => {
        openComparatorForConflicts('override-comparator-status');
    });
    document.getElementById('waiverPreviewClose')?.addEventListener('click', () => {
        document.getElementById('waiverPreviewDialog')?.close();
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
    translateOptions();
    handleGlobalChange();
})();
