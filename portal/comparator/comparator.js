(function () {
    'use strict';

    const data = window.EE4213Data;
    if (!data || !Array.isArray(data.courses)) {
        throw new Error('Course Comparator requires EE4213Data to be loaded first.');
    }

    const assessmentLoadRank = { Low: 10, Moderate: 20, High: 30, 'Very High': 45 };
    const courses = data.courses.filter(course => course.comparator);
    const presets = data.comparatorSemesterPresets;
    if (!courses.length || !presets) {
        throw new Error('Course Comparator data is missing from EE4213Data.');
    }

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
        comparison: document.getElementById('comparison-table-wrapper')
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
            .filter(Boolean)
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
        [elements.preset, elements.sort].forEach(select => {
            Array.from(select.options).forEach(option => {
                option.textContent = option.dataset[lang];
            });
        });
        elements.courseCodes.placeholder = lang === 'zh' ? '例如：EE1001, EE2002' : 'e.g. EE1001, EE2002';
    }

    function renderCourseList() {
        elements.courseList.replaceChildren();
        courses.forEach(course => {
            const label = document.createElement('label');
            label.className = 'comparator-course-option';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = course.courseId;
            checkbox.checked = selectedCodes.includes(course.courseId);
            checkbox.setAttribute('aria-label', copy().selectionLabel(course.courseId, courseTitle(course)));
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
            label.append(checkbox, labelContent);
            elements.courseList.appendChild(label);
        });
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
        const valid = codes.filter(code => courseByCode.has(code));
        const invalid = codes.filter(code => !courseByCode.has(code));
        selectedCodes = [...new Set([...selectedCodes, ...valid])];
        elements.courseCodes.value = '';
        render();
        setInputMessage(invalid.length ? copy().notFound(invalid) : copy().added(valid.length), invalid.length > 0);
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
        return selected.flatMap(course => (course.comparator.scheduledMeetingTimes || []).flatMap(meeting => {
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
            { label: copy().studyHours, value: course => course.comparator.expectedStudyHoursPerWeek == null ? copy().noSharedValue : `${course.comparator.expectedStudyHoursPerWeek} h` },
            { label: copy().assessment, value: course => copy().assessmentLabel[course.comparator.assessmentLoad] || course.comparator.assessmentLoad || copy().noSharedValue },
            { label: copy().difficulty, value: course => course.comparator.difficulty == null ? copy().noSharedValue : `${course.comparator.difficulty}/5` },
            { label: copy().workload, value: course => workloadScore(course) ?? copy().noSharedValue },
            {
                label: copy().grading,
                value: course => Object.entries(course.comparator.gradingComponents || {})
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
        selectedCodes = [...presets[semester]];
        render();
        setInputMessage(copy().preset(semester));
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
    document.addEventListener('portal:languagechange', render);

    render();
})();
