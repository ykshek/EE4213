(function () {
    'use strict';

    const data = window.EE4213Data;
    if (!data || !Array.isArray(data.courses)) {
        throw new Error('Course Comparator requires EE4213Data to be loaded first.');
    }

    const assessmentLoadRank = { Low: 10, Moderate: 20, High: 30, 'Very High': 45 };
    const courses = data.courses;
    const presets = data.comparatorSemesterPresets;
    const majors = Array.isArray(data.majors) ? data.majors : [];
    if (!courses.length || !presets || !majors.length) {
        throw new Error('Course Comparator data is missing from EE4213Data.');
    }

    const progressStorageKey = 'cityuEE4213DegreeAuditStatusV2';
    const majorById = new Map(majors.map(major => [major.majorId, major]));
    const commonCurriculum = (majors[0]?.curriculum || []).filter(course =>
        ['GE', '1A', '1B'].includes(course.semester) &&
        majors.every(major => major.curriculum.some(item => item.courseId === course.courseId))
    );
    const commonMajor = {
        majorId: 'COMMON',
        name: { zh: '共同一年級（尚未選擇主修）', en: 'Common Year 1 (major not selected)' },
        curriculum: commonCurriculum
    };
    let auditProgress = readAuditProgress();
    let currentMajorId = auditProgress.activeMajor === 'COMMON' || majorById.has(auditProgress.activeMajor) ? auditProgress.activeMajor : 'COMMON';

    const days = [
        { key: 'M', zh: '星期一', en: 'Monday' },
        { key: 'T', zh: '星期二', en: 'Tuesday' },
        { key: 'W', zh: '星期三', en: 'Wednesday' },
        { key: 'Th', zh: '星期四', en: 'Thursday' },
        { key: 'F', zh: '星期五', en: 'Friday' }
    ];
    const messages = {
        zh: {
            conflict: '發現時間衝突',
            conflictCount: count => `有 ${count} 項時間重疊。`,
            clear: '未發現示範時間表重疊',
            clearDetail: '目前選擇的示範上課時間沒有重疊。',
            choose: '請選擇課程或載入示範學期，以查看時間表。',
            oneCourse: '已選課程的示範時間沒有重疊；加入其他課程以比較。',
            noSchedule: '所選課程沒有可用的示範上課時間。',
            noCompare: '選擇至少兩項課程以比較負擔。',
            noSharedValue: '共享示範資料未提供',
            noCode: '請輸入一個或多個課程編號。',
            notFound: codes => `找不到示範課程編號：${codes.join('、')}`,
            added: count => `已加入 ${count} 項課程。`,
            preset: semester => `已載入第 ${semester} 學期示範課程。`,
            cleared: '已清除課程選擇。',
            collision: (day, first, second) => `${day}：${first.course.courseId}（${first.time}）與 ${second.course.courseId}（${second.time}）重疊。`,
            courseName: '課程',
            studyHours: '每週自修時數（示範）',
            assessment: '評估負擔（示範）',
            difficulty: '難度（示範，5 分制）',
            workload: '示範負擔指數（自修時數 + 難度×10 + 評估等級）',
            sampleWorkload: '共享資料中的示範負擔評分',
            sampleGpa: '共享資料中的示範平均 GPA',
            grading: '評分組成（示範）',
            assessmentLabel: { Low: '低', Moderate: '中等', High: '高', 'Very High': '非常高' },
            gradingLabels: { assignments: '作業', midterm: '期中考', final: '期末考', project: '專題' },
            time: '時間',
            selectionLabel: (code, title) => `選擇 ${code} ${title}`,
            notInMajor: major => `不屬於所選主修（${major}）的課程`,
            completedReason: '已在學位審核標記為已完成',
            failedReason: '已在學位審核標記為不合格；請先處理重修安排',
            prerequisiteReason: (code, failed, chain) => `未能選擇：先修科目 ${code}${failed ? ' 不合格' : ' 尚未標記為已完成'}。課程鏈：${chain}`,
            noAuditProgress: '尚未找到學位審核紀錄。請先在 Degree Audit 標記已完成／不合格課程；未完成先修科目的後續課程會保持鎖定。',
            auditSync: (major, completed, failed) => `已連結學位審核：${major} · 已完成 ${completed} 門 · 不合格 ${failed} 門。狀態會在同一網站的頁面之間同步。`,
            blockedSummary: (codes) => `以下課程因狀態或先修要求而略過：${codes.join('、')}`,
            timeSlot: (type, time, place) => [type, time, place].filter(Boolean).join(' · ')
        },
        en: {
            conflict: 'Schedule overlap detected',
            conflictCount: count => `${count} overlapping time slot${count === 1 ? '' : 's'} found.`,
            clear: 'No overlap in the sample timetable',
            clearDetail: 'The selected sample meeting times do not overlap.',
            choose: 'Choose courses or load a sample semester to see the timetable.',
            oneCourse: 'No overlap in this course’s sample times. Add another course to compare.',
            noSchedule: 'No sample meeting times are available for the selected courses.',
            noCompare: 'Select at least two courses to compare workload.',
            noSharedValue: 'Not available in shared sample data',
            noCode: 'Enter one or more course codes.',
            notFound: codes => `Sample course code not found: ${codes.join(', ')}`,
            added: count => `Added ${count} course${count === 1 ? '' : 's'}.`,
            preset: semester => `Loaded the Semester ${semester} sample courses.`,
            cleared: 'Course selection cleared.',
            collision: (day, first, second) => `${day}: ${first.course.courseId} (${first.time}) overlaps ${second.course.courseId} (${second.time}).`,
            courseName: 'Course',
            studyHours: 'Study hours per week (sample)',
            assessment: 'Assessment load (sample)',
            difficulty: 'Difficulty (sample, out of 5)',
            workload: 'Sample workload index (study hours + difficulty × 10 + assessment tier)',
            sampleWorkload: 'Sample workload rating in shared data',
            sampleGpa: 'Sample mean GPA in shared data',
            grading: 'Grading components (sample)',
            assessmentLabel: { Low: 'Low', Moderate: 'Moderate', High: 'High', 'Very High': 'Very high' },
            gradingLabels: { assignments: 'Assignments', midterm: 'Midterm', final: 'Final', project: 'Project' },
            time: 'Time',
            selectionLabel: (code, title) => `Select ${code} ${title}`,
            notInMajor: major => `Not part of the selected ${major} curriculum`,
            completedReason: 'Marked as completed in Degree Audit',
            failedReason: 'Marked as failed in Degree Audit; handle the retake first',
            prerequisiteReason: (code, failed, chain) => `Unavailable: prerequisite ${code} is ${failed ? 'marked as failed' : 'not marked as completed'}. Course chain: ${chain}`,
            noAuditProgress: 'No Degree Audit record was found. Mark completed / failed courses in Degree Audit first; courses with unmet prerequisites will remain locked.',
            auditSync: (major, completed, failed) => `Linked to Degree Audit: ${major} · ${completed} completed · ${failed} failed. Status is shared across pages on this website.`,
            blockedSummary: codes => `Skipped because of course status or prerequisites: ${codes.join(', ')}`,
            timeSlot: (type, time, place) => [type, time, place].filter(Boolean).join(' · ')
        }
    };

    const courseByCode = new Map(courses.map(course => [course.courseId, course]));
    if (courseByCode.size !== courses.length) {
        throw new Error('Course Comparator data contains duplicate course IDs.');
    }
    Object.entries(presets).forEach(([semester, courseIds]) => {
        if (!Array.isArray(courseIds) || courseIds.some(courseId => !courseByCode.has(courseId))) {
            throw new Error(`Course Comparator preset ${semester} references an unknown course.`);
        }
    });
    const elements = {
        courseCodes: document.getElementById('course-codes'),
        courseList: document.getElementById('course-list'),
        addCourses: document.getElementById('add-courses'),
        inputMessage: document.getElementById('input-message'),
        preset: document.getElementById('semester-preset'),
        importPreset: document.getElementById('import-timetable'),
        reset: document.getElementById('reset-selection'),
        sort: document.getElementById('sort-key'),
        status: document.getElementById('status-message'),
        timetable: document.getElementById('timetable-wrapper'),
        comparison: document.getElementById('comparison-table-wrapper'),
        auditMajor: document.getElementById('audit-major'),
        auditSync: document.getElementById('audit-sync-status')
    };
    let selectedCodes = [];
    let sortKey = 'workloadScore';

    function language() {
        return document.body.dataset.lang === 'en' ? 'en' : 'zh';
    }

    function copy() {
        return messages[language()];
    }

    function courseTitle(course) {
        return course.titles?.[language()] || course.titles?.en || course.courseId;
    }

    function readAuditProgress() {
        try {
            const raw = localStorage.getItem(progressStorageKey);
            const parsed = raw ? JSON.parse(raw) : null;
            if (parsed && parsed.version === 2 && parsed.byMajor && typeof parsed.byMajor === 'object') return parsed;
        } catch (error) {
            console.warn('Unable to read shared Degree Audit status.', error);
        }
        return { version: 2, activeMajor: null, byMajor: {} };
    }

    function majorName(majorId) {
        if (majorId === 'COMMON') {
            return language() === 'zh'
                ? '共同一年級（尚未選擇主修）'
                : 'Common Year 1 (major not selected)';
        }
        if (language() === 'zh') {
            const zhNames = {
                CDE: '電子計算機及數據工程學',
                INFE: '資訊工程學',
                ELEL: '電子及電機工程學',
                MEE: '微電子工程學'
            };
            if (zhNames[majorId]) return zhNames[majorId];
        }
        const major = majorById.get(majorId);
        return major?.name?.[language()] || major?.name?.en || majorId;
    }

    function getMajorCurriculum(majorId = currentMajorId) {
        if (majorId === 'COMMON') return commonMajor.curriculum;
        return majorById.get(majorId)?.curriculum || [];
    }

    function getMajorCourseIndex(majorId = currentMajorId) {
        const curriculum = getMajorCurriculum(majorId);
        return {
            courseIds: new Set(curriculum.map(course => course.courseId)),
            prerequisites: new Map(curriculum.map(course => [course.courseId, course.prerequisiteCourseIds || []]))
        };
    }

    function getMajorStatuses(majorId = currentMajorId) {
        // Year 1 statuses are shared by all majors and remain relevant before a major is selected.
        const commonYearStatuses = auditProgress.byMajor?.COMMON || {};
        const majorSpecificStatuses = auditProgress.byMajor?.[majorId] || {};
        return { ...commonYearStatuses, ...majorSpecificStatuses };
    }

    function findUnmetPrerequisite(courseId, visited = new Set(), majorIndex = getMajorCourseIndex()) {
        if (visited.has(courseId)) return null;
        const nextVisited = new Set(visited);
        nextVisited.add(courseId);
        const prereqs = majorIndex.prerequisites.get(courseId) || [];
        const statuses = getMajorStatuses();

        for (const prerequisiteCode of prereqs) {
            const status = statuses[prerequisiteCode] || 'not-taken';
            if (status === 'completed') continue;

            if (status === 'failed') {
                return { rootCode: prerequisiteCode, failed: true, chain: [prerequisiteCode, courseId] };
            }

            const upstream = findUnmetPrerequisite(prerequisiteCode, nextVisited, majorIndex);
            if (upstream) {
                return { ...upstream, chain: [...upstream.chain, courseId] };
            }
            return { rootCode: prerequisiteCode, failed: false, chain: [prerequisiteCode, courseId] };
        }
        return null;
    }

    function getCourseAvailability(course) {
        const majorIndex = getMajorCourseIndex();
        if (!majorIndex.courseIds.has(course.courseId)) {
            return { allowed: false, reason: copy().notInMajor(majorName(currentMajorId)), kind: 'not-in-major' };
        }

        const status = getMajorStatuses()[course.courseId] || 'not-taken';
        if (status === 'completed') {
            return { allowed: false, reason: copy().completedReason, kind: 'completed' };
        }
        if (status === 'failed') {
            return { allowed: false, reason: copy().failedReason, kind: 'failed' };
        }

        const unmet = findUnmetPrerequisite(course.courseId, new Set(), majorIndex);
        if (unmet) {
            return {
                allowed: false,
                reason: copy().prerequisiteReason(unmet.rootCode, unmet.failed, unmet.chain.join(' → ')),
                kind: 'prerequisite'
            };
        }
        return { allowed: true, reason: '', kind: 'available' };
    }

    function updateAuditSyncStatus() {
        if (!elements.auditSync) return;
        const statuses = Object.values(getMajorStatuses());
        const completedCount = statuses.filter(status => status === 'completed').length;
        const failedCount = statuses.filter(status => status === 'failed').length;
        const hasRecord = Object.prototype.hasOwnProperty.call(auditProgress.byMajor || {}, currentMajorId) ||
            Object.prototype.hasOwnProperty.call(auditProgress.byMajor || {}, 'COMMON');
        const auditMajorLabel = auditProgress.activeMajor === 'COMMON' &&
            !Object.prototype.hasOwnProperty.call(auditProgress.byMajor || {}, currentMajorId)
            ? (language() === 'zh' ? '共同一年級（尚未選擇主修）' : 'Common Year 1 (major not selected)')
            : majorName(currentMajorId);
        elements.auditSync.textContent = hasRecord
            ? copy().auditSync(auditMajorLabel, completedCount, failedCount)
            : copy().noAuditProgress;
    }

    function applyAuditProgress(nextProgress, followActiveMajor = false) {
        auditProgress = nextProgress || readAuditProgress();
        if (followActiveMajor && (auditProgress.activeMajor === 'COMMON' || majorById.has(auditProgress.activeMajor))) {
            currentMajorId = auditProgress.activeMajor;
            if (elements.auditMajor) elements.auditMajor.value = currentMajorId;
        }
        selectedCodes = selectedCodes.filter(code => {
            const course = courseByCode.get(code);
            return course && getCourseAvailability(course).allowed;
        });
        render();
    }

    function setInputMessage(message, isError = false) {
        elements.inputMessage.textContent = message;
        elements.inputMessage.classList.toggle('is-error', isError);
    }

    function workloadScore(course) {
        const comparison = course.comparator;
        if (!comparison || comparison.expectedStudyHoursPerWeek == null || comparison.difficulty == null || !comparison.assessmentLoad) {
            return null;
        }
        return comparison.expectedStudyHoursPerWeek + comparison.difficulty * 10 + (assessmentLoadRank[comparison.assessmentLoad] || 0);
    }

    function getSortedSelectedCourses() {
        return selectedCodes
            .map(code => courseByCode.get(code))
            .filter(course => course && getCourseAvailability(course).allowed)
            .sort((a, b) => {
                const first = sortValue(a);
                const second = sortValue(b);
                if (first == null) return second == null ? 0 : 1;
                if (second == null) return -1;
                if (typeof first === 'string') return first.localeCompare(second);
                return Number(second) - Number(first);
            });
    }

    function sortValue(course) {
        if (sortKey === 'workloadScore') return workloadScore(course);
        if (sortKey === 'assessmentLoad') return assessmentLoadRank[course.comparator?.assessmentLoad] || 0;
        if (sortKey === 'courseCode') return course.courseId;
        return course.comparator?.[sortKey];
    }

    function setSelectLanguage() {
        const lang = language();
        [elements.preset, elements.sort, elements.auditMajor].filter(Boolean).forEach(select => {
            Array.from(select.options).forEach(option => {
                if (option.dataset[lang]) option.textContent = option.dataset[lang];
            });
        });
        elements.courseCodes.placeholder = lang === 'zh' ? '例如：EE1001, EE2002' : 'e.g. EE1001, EE2002';
    }

    function renderCourseList() {
        elements.courseList.replaceChildren();
        const visibleCourses = getMajorCurriculum()
            .map(item => courseByCode.get(item.courseId))
            .filter(Boolean);
        visibleCourses.forEach(course => {
            const availability = getCourseAvailability(course);
            const label = document.createElement('label');
            label.className = `comparator-course-option${availability.allowed ? '' : ' is-disabled'}`;
            if (!availability.allowed) label.title = availability.reason;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = course.courseId;
            checkbox.checked = selectedCodes.includes(course.courseId) && availability.allowed;
            checkbox.disabled = !availability.allowed;
            checkbox.setAttribute('aria-label', `${copy().selectionLabel(course.courseId, courseTitle(course))}${availability.reason ? ` — ${availability.reason}` : ''}`);
            checkbox.addEventListener('change', () => {
                selectedCodes = checkbox.checked
                    ? [...selectedCodes, course.courseId]
                    : selectedCodes.filter(code => code !== course.courseId);
                setInputMessage('');
                renderResults();
            });

            const labelContent = document.createElement('span');
            const code = document.createElement('strong');
            code.textContent = course.courseId;
            const name = document.createElement('small');
            name.textContent = courseTitle(course);
            labelContent.append(code, name);
            if (!availability.allowed) {
                const reason = document.createElement('small');
                reason.className = 'comparator-course-reason';
                reason.textContent = availability.reason;
                labelContent.appendChild(reason);
            } else if (!course.comparator) {
                const dataNote = document.createElement('small');
                dataNote.className = 'comparator-course-data-note';
                dataNote.textContent = language() === 'zh' ? '未有示範比較／時間表資料' : 'No sample workload or timetable data';
                labelContent.appendChild(dataNote);
            }
            label.append(checkbox, labelContent);
            elements.courseList.appendChild(label);
        });
        updateAuditSyncStatus();
    }

    function parseCodes(value) {
        return value.split(/[\s,，;；]+/).map(code => code.trim().toUpperCase()).filter(Boolean);
    }

    function addCourses() {
        const codes = parseCodes(elements.courseCodes.value);
        if (!codes.length) {
            setInputMessage(copy().noCode, true);
            return;
        }
        const known = codes.filter(code => courseByCode.has(code));
        const invalid = codes.filter(code => !courseByCode.has(code));
        const blocked = known.filter(code => !getCourseAvailability(courseByCode.get(code)).allowed);
        const valid = known.filter(code => getCourseAvailability(courseByCode.get(code)).allowed);
        selectedCodes = [...new Set([...selectedCodes, ...valid])];
        elements.courseCodes.value = '';
        render();
        const parts = [];
        if (valid.length) parts.push(copy().added(valid.length));
        if (blocked.length) parts.push(copy().blockedSummary(blocked.map(code => `${code} (${getCourseAvailability(courseByCode.get(code)).reason})`)));
        if (invalid.length) parts.push(copy().notFound(invalid));
        setInputMessage(parts.join(' '), blocked.length > 0 || invalid.length > 0);
    }

    function timeToMinutes(value) {
        const matches = [...value.matchAll(/(\d{1,2}):(\d{2})\s*(am|pm)?/gi)];
        if (matches.length < 2) return null;
        const toMinutes = match => {
            let hours = Number(match[1]);
            const minutes = Number(match[2]);
            const meridiem = match[3]?.toLowerCase();
            if (meridiem) {
                hours %= 12;
                if (meridiem === 'pm') hours += 12;
            }
            return hours * 60 + minutes;
        };
        const start = toMinutes(matches[0]);
        let end = toMinutes(matches[1]);
        if (end <= start) end += 24 * 60;
        if (start >= 23 * 60 || end <= 8 * 60) return null;
        return { start: Math.max(start, 8 * 60), end: Math.min(end, 23 * 60) };
    }

    function normalizedDays(value) {
        const map = {
            m: 'M', mo: 'M', mon: 'M', monday: 'M',
            t: 'T', tu: 'T', tue: 'T', tues: 'T', tuesday: 'T',
            w: 'W', we: 'W', wed: 'W', wednesday: 'W',
            th: 'Th', thu: 'Th', thur: 'Th', thurs: 'Th', thursday: 'Th',
            f: 'F', fr: 'F', fri: 'F', friday: 'F'
        };
        return [...new Set(String(value).split(/[\s,/&]+/).map(token => map[token.toLowerCase()]).filter(Boolean))];
    }

    function allEvents(selected) {
        return selected.flatMap(course => (course.comparator?.scheduledMeetingTimes || []).flatMap(meeting => {
            const interval = timeToMinutes(meeting.time);
            if (!interval) return [];
            return normalizedDays(meeting.days).map(day => ({
                ...meeting,
                ...interval,
                course,
                day
            }));
        }));
    }

    function findConflicts(events) {
        const conflicts = [];
        days.forEach(day => {
            const dayEvents = events.filter(event => event.day === day.key)
                .sort((a, b) => a.start - b.start || a.end - b.end);
            dayEvents.forEach((event, index) => {
                dayEvents.slice(index + 1).forEach(other => {
                    if (event.course.courseId === other.course.courseId || event.start >= other.end || other.start >= event.end) return;
                    conflicts.push({ first: event, second: other, day });
                });
            });
        });
        return conflicts;
    }

    function appendStatus(selected, events, conflicts) {
        elements.status.replaceChildren();
        const status = document.createElement('div');
        status.className = 'schedule-status-card';
        const title = document.createElement('strong');
        const detail = document.createElement('p');
        const lang = copy();

        if (!selected.length) {
            status.classList.add('is-empty');
            title.textContent = lang.choose;
            status.appendChild(title);
        } else if (!events.length) {
            status.classList.add('is-empty');
            title.textContent = lang.noSchedule;
            status.appendChild(title);
        } else if (conflicts.length) {
            status.classList.add('has-conflicts');
            title.textContent = lang.conflict;
            detail.textContent = lang.conflictCount(conflicts.length);
            status.append(title, detail);
            const list = document.createElement('ul');
            conflicts.forEach(conflict => {
                const item = document.createElement('li');
                item.textContent = lang.collision(conflict.day[language()], conflict.first, conflict.second);
                list.appendChild(item);
            });
            status.appendChild(list);
        } else {
            status.classList.add('is-clear');
            title.textContent = lang.clear;
            detail.textContent = selected.length === 1 ? lang.oneCourse : lang.clearDetail;
            status.append(title, detail);
        }
        elements.status.appendChild(status);
    }

    function assignLanes(events) {
        const laneEnds = [];
        events.sort((a, b) => a.start - b.start || a.end - b.end).forEach(event => {
            let lane = laneEnds.findIndex(end => end <= event.start);
            if (lane === -1) lane = laneEnds.length;
            laneEnds[lane] = event.end;
            event.lane = lane;
        });
        events.forEach(event => {
            event.laneCount = Math.max(laneEnds.length, 1);
        });
    }

    function renderTimetable(events, conflicts, selected) {
        elements.timetable.replaceChildren();
        if (!events.length) {
            const empty = document.createElement('p');
            empty.className = 'timetable-empty';
            empty.textContent = selected.length ? copy().noSchedule : copy().choose;
            elements.timetable.appendChild(empty);
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'timetable-grid';
        grid.setAttribute('role', 'group');
        grid.setAttribute('aria-label', language() === 'zh' ? '每週示範課程時間表' : 'Weekly sample course timetable');

        const corner = document.createElement('div');
        corner.className = 'timetable-corner';
        corner.textContent = copy().time;
        grid.appendChild(corner);

        days.forEach(day => {
            const header = document.createElement('div');
            header.className = 'timetable-day-header';
            const heading = document.createElement('h4');
            heading.id = `timetable-day-${day.key}`;
            heading.textContent = day[language()];
            header.appendChild(heading);
            grid.appendChild(header);
        });

        const timeAxis = document.createElement('div');
        timeAxis.className = 'timetable-time-axis';
        timeAxis.setAttribute('aria-hidden', 'true');
        for (let hour = 8; hour < 23; hour += 1) {
            const slot = document.createElement('div');
            slot.className = 'timetable-time-slot';
            slot.textContent = `${String(hour).padStart(2, '0')}:00`;
            timeAxis.appendChild(slot);
        }
        grid.appendChild(timeAxis);

        days.forEach(day => {
            const dayColumn = document.createElement('section');
            dayColumn.className = 'timetable-day-column';
            dayColumn.setAttribute('aria-labelledby', `timetable-day-${day.key}`);

            const hourSlots = document.createElement('div');
            hourSlots.className = 'timetable-hour-slots';
            hourSlots.setAttribute('aria-hidden', 'true');
            for (let hour = 0; hour < 15; hour += 1) {
                const slot = document.createElement('div');
                slot.className = 'timetable-hour-slot';
                hourSlots.appendChild(slot);
            }

            const eventLayer = document.createElement('div');
            eventLayer.className = 'timetable-events';
            const dayEvents = events.filter(event => event.day === day.key);
            assignLanes(dayEvents);
            dayEvents.forEach(event => {
                const article = document.createElement('article');
                const hasConflict = conflicts.some(conflict =>
                    (conflict.first === event || conflict.second === event)
                );
                article.className = `timetable-event${hasConflict ? ' timetable-event-conflict' : ''}`;
                const start = ((event.start - 8 * 60) / (15 * 60)) * 100;
                const height = ((event.end - event.start) / (15 * 60)) * 100;
                article.style.setProperty('--event-top', `${start}%`);
                article.style.setProperty('--event-height', `${height}%`);
                article.style.setProperty('--event-left', `${(event.lane / event.laneCount) * 100}%`);
                article.style.setProperty('--event-width', `${100 / event.laneCount}%`);
                const title = `${event.course.courseId} ${event.type} ${event.time} ${event.location}`;
                article.setAttribute('aria-label', title);
                article.title = title;
                const code = document.createElement('strong');
                code.textContent = event.course.courseId;
                const detail = document.createElement('span');
                detail.textContent = copy().timeSlot(event.type, event.time, event.location);
                article.append(code, detail);
                eventLayer.appendChild(article);
            });
            dayColumn.append(hourSlots, eventLayer);
            grid.appendChild(dayColumn);
        });
        elements.timetable.appendChild(grid);
    }

    function appendCell(row, value, isHeader = false) {
        const cell = document.createElement(isHeader ? 'th' : 'td');
        if (isHeader) cell.scope = 'col';
        cell.textContent = value;
        row.appendChild(cell);
    }

    function renderComparison(selected) {
        elements.comparison.replaceChildren();
        if (selected.length < 2) {
            const empty = document.createElement('p');
            empty.className = 'comparison-empty';
            empty.textContent = copy().noCompare;
            elements.comparison.appendChild(empty);
            return;
        }

        const table = document.createElement('table');
        table.className = 'comparison-table';
        const head = document.createElement('thead');
        const headerRow = document.createElement('tr');
        appendCell(headerRow, copy().courseName, true);
        selected.forEach(course => {
            appendCell(headerRow, `${course.courseId} · ${courseTitle(course)}`, true);
        });
        head.appendChild(headerRow);
        table.appendChild(head);

        const rows = [
            { label: copy().studyHours, value: course => course.comparator?.expectedStudyHoursPerWeek == null ? copy().noSharedValue : `${course.comparator.expectedStudyHoursPerWeek} h` },
            { label: copy().assessment, value: course => copy().assessmentLabel[course.comparator?.assessmentLoad] || course.comparator?.assessmentLoad || copy().noSharedValue },
            { label: copy().difficulty, value: course => course.comparator?.difficulty == null ? copy().noSharedValue : `${course.comparator.difficulty}/5` },
            { label: copy().workload, value: course => workloadScore(course) ?? copy().noSharedValue },
            {
                label: copy().grading,
                value: course => Object.entries(course.comparator?.gradingComponents || {})
                    .map(([key, value]) => `${copy().gradingLabels[key] || key}: ${value}%`)
                    .join('; ') || copy().noSharedValue
            },
            { label: copy().sampleWorkload, value: course => course.sampleWorkload ?? copy().noSharedValue },
            { label: copy().sampleGpa, value: course => course.sampleMeanGpa ?? copy().noSharedValue }
        ];
        const body = document.createElement('tbody');
        rows.forEach(metric => {
            const row = document.createElement('tr');
            const heading = document.createElement('th');
            heading.scope = 'row';
            heading.textContent = metric.label;
            row.appendChild(heading);
            selected.forEach(course => appendCell(row, String(metric.value(course))));
            body.appendChild(row);
        });
        table.appendChild(body);
        elements.comparison.appendChild(table);
    }

    function renderResults() {
        const selected = getSortedSelectedCourses();
        const events = allEvents(selected);
        const conflicts = findConflicts(events);
        appendStatus(selected, events, conflicts);
        renderTimetable(events, conflicts, selected);
        renderComparison(selected);
    }

    function render() {
        setSelectLanguage();
        renderCourseList();
        renderResults();
    }

    elements.addCourses.addEventListener('click', addCourses);
    elements.courseCodes.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') addCourses();
    });
    elements.importPreset.addEventListener('click', () => {
        const semester = elements.preset.value;
        const presetCodes = [...presets[semester]];
        const skipped = presetCodes.filter(code => !getCourseAvailability(courseByCode.get(code)).allowed);
        selectedCodes = presetCodes.filter(code => getCourseAvailability(courseByCode.get(code)).allowed);
        render();
        const message = [copy().preset(semester), ...(skipped.length ? [copy().blockedSummary(skipped.map(code => `${code} (${getCourseAvailability(courseByCode.get(code)).reason})`))] : [])].join(' ');
        setInputMessage(message, skipped.length > 0);
    });
    elements.reset.addEventListener('click', () => {
        selectedCodes = [];
        render();
        setInputMessage(copy().cleared);
    });
    elements.sort.addEventListener('change', () => {
        sortKey = elements.sort.value;
        renderResults();
    });
    if (elements.auditMajor) {
        elements.auditMajor.value = currentMajorId;
        elements.auditMajor.addEventListener('change', () => {
            currentMajorId = elements.auditMajor.value || 'COMMON';
            selectedCodes = selectedCodes.filter(code => {
                const course = courseByCode.get(code);
                return course && getCourseAvailability(course).allowed;
            });
            render();
            setInputMessage(language() === 'zh' ? `已切換至 ${majorName(currentMajorId)}。` : `Switched to ${majorName(currentMajorId)}.`);
        });
    }
    window.addEventListener('storage', event => {
        if (event.key !== progressStorageKey) return;
        applyAuditProgress(readAuditProgress(), true);
    });
    document.addEventListener('portal:languagechange', render);

    render();
})();
