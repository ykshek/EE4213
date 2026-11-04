const courseData = [
  {
    courseCode: 'EE1001',
    courseSession: 'C01',
    crn: '12345',
    courseName: 'Introduction to Electrical Engineering',
    instructor: 'Dr. CHAN Tai Man',
    term: 'Semester A 2026/27',
    expectedStudyHoursPerWeek: 8,
    assessmentLoad: 'High',
    difficulty: 4,
    gradingComponents: {
      assignments: 30,
      midterm: 20,
      final: 50,
    },
    scheduledMeetingTimes: [
      {
        type: 'Class',
        time: '12:00 pm - 2:50 pm',
        days: 'W',
        where: 'Li Dak Sum Yip Yio Chin A Bldg 4307',
        scheduleType: 'Second room',
        instructors: 'Dr. CHAN Tai Man',
      },
      {
        type: 'Class',
        time: '12:00 pm - 2:50 pm',
        days: 'T',
        where: 'Yeung Kin Man Acad Building P4701',
        scheduleType: 'First room',
        instructors: 'Dr. CHAN Tai Man',
      },
    ],
    prerequisites: [],
    description: 'Basic circuits, signals, and engineering practice.',
  },
  {
    courseCode: 'EE2002',
    courseSession: 'C01',
    crn: '23456',
    courseName: 'Circuit Theory',
    instructor: 'Prof. WONG Kai',
    term: 'Semester A 2026/27',
    expectedStudyHoursPerWeek: 10,
    assessmentLoad: 'High',
    difficulty: 5,
    gradingComponents: {
      assignments: 25,
      midterm: 25,
      final: 50,
    },
    scheduledMeetingTimes: [
      {
        type: 'Class',
        time: '9:30 am - 11:20 am',
        days: 'M',
        where: 'Academic 1 2001',
        scheduleType: 'Main room',
        instructors: 'Prof. WONG Kai',
      },
      {
        type: 'Tutorial',
        time: '1:30 pm - 2:20 pm',
        days: 'F',
        where: 'Academic 1 2512',
        scheduleType: 'Tutorial room',
        instructors: 'Prof. WONG Kai',
      },
    ],
    prerequisites: ['EE1001'],
    description: 'Analysis of circuits and transient responses.',
  },
  {
    courseCode: 'EE3101',
    courseSession: 'C02',
    crn: '34567',
    courseName: 'Signals and Systems',
    instructor: 'Dr. LEE Siu Ming',
    term: 'Semester A 2026/27',
    expectedStudyHoursPerWeek: 12,
    assessmentLoad: 'Very High',
    difficulty: 5,
    gradingComponents: {
      assignments: 20,
      midterm: 30,
      final: 50,
    },
    scheduledMeetingTimes: [
      {
        type: 'Class',
        time: '10:30 am - 12:20 pm',
        days: 'T',
        where: 'YEUNG Kin Man Building P4704',
        scheduleType: 'Lecture hall',
        instructors: 'Dr. LEE Siu Ming',
      },
      {
        type: 'Lab',
        time: '3:30 pm - 5:20 pm',
        days: 'Th',
        where: 'EEE Laboratory 3',
        scheduleType: 'Lab room',
        instructors: 'Dr. LEE Siu Ming',
      },
    ],
    prerequisites: ['EE2002'],
    description: 'Discrete and continuous systems and signal processing.',
  },
  {
    courseCode: 'EE3201',
    courseSession: 'C01',
    crn: '45678',
    courseName: 'Electromagnetic Fields',
    instructor: 'Dr. TSE Mei Ling',
    term: 'Semester A 2026/27',
    expectedStudyHoursPerWeek: 9,
    assessmentLoad: 'Moderate',
    difficulty: 4,
    gradingComponents: {
      assignments: 35,
      midterm: 15,
      final: 50,
    },
    scheduledMeetingTimes: [
      {
        type: 'Class',
        time: '2:30 pm - 4:20 pm',
        days: 'W',
        where: 'CSE Labs 1',
        scheduleType: 'Teaching room',
        instructors: 'Dr. TSE Mei Ling',
      },
      {
        type: 'Tutorial',
        time: '11:30 am - 12:20 pm',
        days: 'F',
        where: 'Academic 2 3030',
        scheduleType: 'Tutorial room',
        instructors: 'Dr. TSE Mei Ling',
      },
    ],
    prerequisites: ['EE1001'],
    description: 'Electromagnetic theory and field behaviour.',
  },
  {
    courseCode: 'EE4213',
    courseSession: 'C02',
    crn: '56789',
    courseName: 'Programming for Engineers',
    instructor: 'Prof. CHAN Wai Yan',
    term: 'Semester A 2026/27',
    expectedStudyHoursPerWeek: 11,
    assessmentLoad: 'High',
    difficulty: 4,
    gradingComponents: {
      assignments: 40,
      midterm: 20,
      final: 40,
    },
    scheduledMeetingTimes: [
      {
        type: 'Class',
        time: '1:30 pm - 3:20 pm',
        days: 'T',
        where: 'YEUNG Kin Man Building P4701',
        scheduleType: 'Workshop room',
        instructors: 'Prof. CHAN Wai Yan',
      },
      {
        type: 'Lab',
        time: '4:30 pm - 5:20 pm',
        days: 'Th',
        where: 'Innovation Hub 3104',
        scheduleType: 'Lab room',
        instructors: 'Prof. CHAN Wai Yan',
      },
    ],
    prerequisites: ['EE2002'],
    description: 'Engineering computation and practical programming in Python/C++.',
  },
  {
    courseCode: 'EE4301',
    courseSession: 'C01',
    crn: '67890',
    courseName: 'Power Electronics',
    instructor: 'Dr. NG Pui Shan',
    term: 'Semester A 2026/27',
    expectedStudyHoursPerWeek: 14,
    assessmentLoad: 'Very High',
    difficulty: 5,
    gradingComponents: {
      assignments: 25,
      midterm: 25,
      final: 50,
    },
    scheduledMeetingTimes: [
      {
        type: 'Class',
        time: '9:00 am - 10:50 am',
        days: 'M',
        where: 'Energy Centre 3402',
        scheduleType: 'Lecture theatre',
        instructors: 'Dr. NG Pui Shan',
      },
      {
        type: 'Lab',
        time: '11:00 am - 12:50 pm',
        days: 'F',
        where: 'Energy Centre 3405',
        scheduleType: 'Lab room',
        instructors: 'Dr. NG Pui Shan',
      },
    ],
    prerequisites: ['EE3101'],
    description: 'Power conversion, control systems, and converter design.',
  },
  {
    courseCode: 'EE2201',
    courseSession: 'C01',
    crn: '78901',
    courseName: 'Electronic Devices and Circuits',
    instructor: 'Dr. LAM Ho Yin',
    term: 'Semester A 2026/27',
    expectedStudyHoursPerWeek: 10,
    assessmentLoad: 'High',
    difficulty: 4,
    gradingComponents: {
      assignments: 30,
      midterm: 20,
      final: 50,
    },
    scheduledMeetingTimes: [
      {
        type: 'Class',
        time: '10:00 am - 11:50 am',
        days: 'W',
        where: 'YEUNG Kin Man Building P4701',
        scheduleType: 'Lecture room',
        instructors: 'Dr. LAM Ho Yin',
      },
      {
        type: 'Tutorial',
        time: '2:30 pm - 3:20 pm',
        days: 'F',
        where: 'Academic 2 3505',
        scheduleType: 'Tutorial room',
        instructors: 'Dr. LAM Ho Yin',
      },
    ],
    prerequisites: ['EE1001'],
    description: 'Semiconductor devices, analog circuits, and circuit applications.',
  },
  {
    courseCode: 'EE3302',
    courseSession: 'C01',
    crn: '89012',
    courseName: 'Control Systems',
    instructor: 'Prof. HO Chun Kit',
    term: 'Semester A 2026/27',
    expectedStudyHoursPerWeek: 11,
    assessmentLoad: 'High',
    difficulty: 4,
    gradingComponents: {
      assignments: 25,
      midterm: 25,
      final: 50,
    },
    scheduledMeetingTimes: [
      {
        type: 'Class',
        time: '11:00 am - 12:50 pm',
        days: 'M',
        where: 'Academic 1 2102',
        scheduleType: 'Lecture room',
        instructors: 'Prof. HO Chun Kit',
      },
      {
        type: 'Tutorial',
        time: '3:30 pm - 4:20 pm',
        days: 'W',
        where: 'YEUNG Kin Man Building P4704',
        scheduleType: 'Tutorial room',
        instructors: 'Prof. HO Chun Kit',
      },
    ],
    prerequisites: ['EE2002'],
    description: 'Feedback, stability, and design methods for dynamic systems.',
  },
  {
    courseCode: 'EE4402',
    courseSession: 'C01',
    crn: '90123',
    courseName: 'Renewable Energy Systems',
    instructor: 'Dr. AU Ka Man',
    term: 'Semester A 2026/27',
    expectedStudyHoursPerWeek: 10,
    assessmentLoad: 'Moderate',
    difficulty: 3,
    gradingComponents: {
      assignments: 35,
      project: 25,
      final: 40,
    },
    scheduledMeetingTimes: [
      {
        type: 'Class',
        time: '2:00 pm - 3:50 pm',
        days: 'Th',
        where: 'Energy Centre 3402',
        scheduleType: 'Lecture room',
        instructors: 'Dr. AU Ka Man',
      },
      {
        type: 'Project',
        time: '10:00 am - 11:50 am',
        days: 'F',
        where: 'Energy Centre 3405',
        scheduleType: 'Project room',
        instructors: 'Dr. AU Ka Man',
      },
    ],
    prerequisites: ['EE3201'],
    description: 'Renewable generation, storage, and grid integration.',
  },
];

const semesterPresets = {
  '2A': ['EE1001', 'EE2002', 'EE2201'],
  '2B': ['EE1001', 'EE2201', 'EE3201', 'EE3302'],
  '3A': ['EE2002', 'EE3101', 'EE3201', 'EE3302'],
  '3B': ['EE3101', 'EE3302', 'EE4213', 'EE4301'],
  '4A': ['EE3101', 'EE4213', 'EE4301', 'EE4402'],
  '4B': ['EE3201', 'EE4213', 'EE4301', 'EE4402'],
};

const assessmentLoadMap = {
  Low: 10,
  Moderate: 20,
  High: 30,
  'Very High': 45,
};

const state = {
  selectedCodes: loadSelectedCodes(),
  sortKey: 'workloadScore',
};

const courseMap = new Map(courseData.map((course) => [course.courseCode, course]));

const courseCodeInput = document.getElementById('course-codes');
const courseList = document.getElementById('course-list');
const comparisonTableWrapper = document.getElementById('comparison-table-wrapper');
const timetableWrapper = document.getElementById('timetable-wrapper');
const statusMessage = document.getElementById('status-message');
const sortKeySelect = document.getElementById('sort-key');
const resetButton = document.getElementById('reset-selection');
const importButton = document.getElementById('import-timetable');
const semesterPresetSelect = document.getElementById('semester-preset');
const courseForm = document.getElementById('course-form');

function loadSelectedCodes() {
  try {
    const saved = JSON.parse(localStorage.getItem('courseComparisonSelection') || '[]');
    if (Array.isArray(saved)) {
      return saved.filter((code) => courseMap.has(code)).slice(0, 6);
    }
  } catch (error) {
    console.warn('Unable to parse saved course selection', error);
  }
  return [];
}

function saveSelectedCodes() {
  localStorage.setItem('courseComparisonSelection', JSON.stringify(state.selectedCodes));
}

function getWorkloadScore(course) {
  return course.expectedStudyHoursPerWeek + course.difficulty * 10 + (assessmentLoadMap[course.assessmentLoad] || 0);
}

function getSortValue(course, key) {
  switch (key) {
    case 'expectedStudyHoursPerWeek':
      return course.expectedStudyHoursPerWeek;
    case 'difficulty':
      return course.difficulty;
    case 'assessmentLoadRank':
      return assessmentLoadMap[course.assessmentLoad] || 0;
    case 'courseCode':
      return course.courseCode;
    case 'workloadScore':
    default:
      return getWorkloadScore(course);
  }
}

function compareCourses(a, b, key) {
  const aValue = getSortValue(a, key);
  const bValue = getSortValue(b, key);

  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return aValue.localeCompare(bValue);
  }

  return Number(bValue) - Number(aValue);
}

function showStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
}

function renderCourseCheckboxes() {
  courseList.innerHTML = '';

  courseData.forEach((course) => {
    const wrapper = document.createElement('label');
    wrapper.className = 'course-option';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = state.selectedCodes.includes(course.courseCode);
    input.value = course.courseCode;
    input.setAttribute('aria-label', `Select ${course.courseCode}`);

    input.addEventListener('change', (event) => {
      const { value, checked } = event.target;
      const next = new Set(state.selectedCodes);
      if (checked) {
        next.add(value);
      } else {
        next.delete(value);
      }
      state.selectedCodes = [...next];
      saveSelectedCodes();
      renderCourseCheckboxes();
      updateComparison();
    });

    const labelText = document.createElement('span');
    labelText.className = 'course-option-label';
    labelText.innerHTML = `
      <strong>${course.courseCode}</strong>
      <span>${course.courseName}</span>
    `;

    wrapper.append(input, labelText);
    courseList.appendChild(wrapper);
  });
}

function parseCourseInput(value) {
  return value
    .split(/[\n,]+/)
    .map((part) => part.trim().toUpperCase())
    .filter(Boolean);
}

function addCourseCodes() {
  const parsed = parseCourseInput(courseCodeInput.value);

  if (!parsed.length) {
    showStatus('Course code not found.', 'error');
    return;
  }

  const validCodes = [];
  const invalidCodes = [];

  parsed.forEach((code) => {
    if (courseMap.has(code)) {
      validCodes.push(code);
    } else {
      invalidCodes.push(code);
    }
  });

  if (validCodes.length) {
    state.selectedCodes = [...new Set([...state.selectedCodes, ...validCodes])];
    saveSelectedCodes();
    renderCourseCheckboxes();
    courseCodeInput.value = '';
  }

  if (invalidCodes.length) {
    showStatus(`Course code not found: ${invalidCodes.join(', ')}`, 'error');
  } else {
    showStatus(`Loaded ${validCodes.length} course${validCodes.length > 1 ? 's' : ''}.`, 'success');
  }

  updateComparison();
}

function importTimetableSelection() {
  const sampleCodes = semesterPresets[semesterPresetSelect.value];
  state.selectedCodes = sampleCodes.filter((code) => courseMap.has(code));
  saveSelectedCodes();
  renderCourseCheckboxes();
  showStatus(`Loaded the Semester ${semesterPresetSelect.value} mock timetable preset.`, 'success');
  updateComparison();
}

function resetSelection() {
  state.selectedCodes = [];
  saveSelectedCodes();
  renderCourseCheckboxes();
  showStatus('Selection cleared. Choose at least two courses to compare.', 'info');
  updateComparison();
}

function getSortedSelectedCourses() {
  const selectedCourses = state.selectedCodes
    .map((code) => courseMap.get(code))
    .filter(Boolean)
    .sort((a, b) => compareCourses(a, b, state.sortKey));

  return selectedCourses;
}

function renderGradingChart(course) {
  const colors = ['#2d5bff', '#f97316', '#16a085', '#a855f7', '#e11d48'];
  const components = Object.entries(course.gradingComponents);
  const total = components.reduce((sum, [, value]) => sum + value, 0);
  let accumulated = 0;
  const slices = components.map(([name, value], index) => {
    const start = (accumulated / total) * 100;
    accumulated += value;
    const end = (accumulated / total) * 100;
    return `${colors[index % colors.length]} ${start}% ${end}%`;
  });
  const description = components
    .map(([name, value]) => `${name[0].toUpperCase() + name.slice(1)} ${value}%`)
    .join(', ');
  const legend = components
    .map(
      ([name, value], index) => `
        <li>
          <span class="grading-legend-color" style="--component-color: ${colors[index % colors.length]}" aria-hidden="true"></span>
          <span>${name[0].toUpperCase() + name.slice(1)}</span>
          <strong>${value}%</strong>
        </li>
      `,
    )
    .join('');

  return `
    <div class="grading-chart">
      <span
        class="grading-pie"
        role="img"
        aria-label="${course.courseCode} grading components: ${description}"
        style="--grading-pie: conic-gradient(${slices.join(', ')})"
      ></span>
      <ul class="grading-legend" aria-label="Grading component breakdown">${legend}</ul>
    </div>
  `;
}

const timetableDays = [
  { key: 'M', label: 'Monday' },
  { key: 'T', label: 'Tuesday' },
  { key: 'W', label: 'Wednesday' },
  { key: 'Th', label: 'Thursday' },
  { key: 'F', label: 'Friday' },
  { key: 'Sa', label: 'Saturday' },
  { key: 'Su', label: 'Sunday' },
];
const timetableStartMinutes = 8 * 60;
const timetableEndMinutes = 23 * 60;
const timetableSlotCount = (timetableEndMinutes - timetableStartMinutes) / 60;

function parseMeetingTime(timeRange) {
  const times = [...timeRange.matchAll(/(\d{1,2}):(\d{2})\s*(am|pm)?/gi)];
  if (times.length < 2) {
    return null;
  }

  const toMinutes = (match) => {
    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const meridiem = match[3]?.toLowerCase();

    if (meridiem) {
      hours %= 12;
      if (meridiem === 'pm') {
        hours += 12;
      }
    }

    return hours * 60 + minutes;
  };

  const start = toMinutes(times[0]);
  let end = toMinutes(times[1]);
  if (end <= start) {
    end += 24 * 60;
  }

  if (start >= timetableEndMinutes || end <= timetableStartMinutes) {
    return null;
  }

  return {
    start: Math.max(start, timetableStartMinutes),
    end: Math.min(end, timetableEndMinutes),
  };
}

function normalizeMeetingDays(value) {
  const dayMap = {
    m: 'M',
    mo: 'M',
    mon: 'M',
    monday: 'M',
    t: 'T',
    tu: 'T',
    tue: 'T',
    tues: 'T',
    tuesday: 'T',
    w: 'W',
    we: 'W',
    wed: 'W',
    wednesday: 'W',
    th: 'Th',
    thu: 'Th',
    thur: 'Th',
    thurs: 'Th',
    thursday: 'Th',
    f: 'F',
    fr: 'F',
    fri: 'F',
    friday: 'F',
    sa: 'Sa',
    sat: 'Sa',
    saturday: 'Sa',
    su: 'Su',
    sun: 'Su',
    sunday: 'Su',
  };
  const tokens = String(value)
    .trim()
    .split(/[\s,/&]+/)
    .filter(Boolean);
  const days = new Set();

  tokens.forEach((token) => {
    const normalized = token.toLowerCase();
    if (dayMap[normalized]) {
      days.add(dayMap[normalized]);
      return;
    }

    const compactToken = normalized.replace(/[^a-z]/g, '');
    const abbreviations = compactToken.match(/th|tu|sa|su|m|t|w|f/g) || [];
    abbreviations.forEach((abbreviation) => {
      if (dayMap[abbreviation]) {
        days.add(dayMap[abbreviation]);
      }
    });
  });

  return [...days];
}

function getDayEvents(courses, dayKey) {
  const events = [];

  courses.forEach((course, courseIndex) => {
    course.scheduledMeetingTimes.forEach((meeting) => {
      const time = parseMeetingTime(meeting.time);
      if (!time || !normalizeMeetingDays(meeting.days).includes(dayKey)) {
        return;
      }

      events.push({
        ...meeting,
        ...time,
        course,
        courseIndex,
      });
    });
  });

  events.sort((a, b) => a.start - b.start || a.end - b.end);

  const laneEnds = [];
  events.forEach((event) => {
    let lane = laneEnds.findIndex((end) => end <= event.start);
    if (lane === -1) {
      lane = laneEnds.length;
    }
    laneEnds[lane] = event.end;
    event.lane = lane;
  });

  events.forEach((event) => {
    event.laneCount = Math.max(laneEnds.length, 1);
  });

  return events;
}

function findTimetableConflicts(events, day) {
  const conflicts = [];

  events.forEach((event, index) => {
    events.slice(index + 1).forEach((otherEvent) => {
      if (
        event.course.courseCode === otherEvent.course.courseCode ||
        event.start >= otherEvent.end ||
        otherEvent.start >= event.end
      ) {
        return;
      }

      event.conflict = true;
      otherEvent.conflict = true;
      conflicts.push(
        `${day.label}: ${event.course.courseCode} (${event.time}) overlaps ${otherEvent.course.courseCode} (${otherEvent.time})`,
      );
    });
  });

  return conflicts;
}

function renderComparisonTable(courses) {
  const highestCourse = courses.reduce((top, course) => {
    return getWorkloadScore(course) > getWorkloadScore(top) ? course : top;
  }, courses[0]);
  const highestScore = getWorkloadScore(highestCourse);

  const rows = [
    { label: 'Course code', value: (course) => course.courseCode },
    { label: 'Course name', value: (course) => course.courseName },
    { label: 'Instructor', value: (course) => course.instructor },
    { label: 'Expected study hours per week', value: (course) => `${course.expectedStudyHoursPerWeek} hrs/week` },
    { label: 'Assessment load', value: (course) => course.assessmentLoad },
    { label: 'Difficulty', value: (course) => `${course.difficulty}/5` },
    { label: 'Grading components', value: renderGradingChart },
    { label: 'Workload score', value: (course) => `${getWorkloadScore(course)}` },
  ];

  const headerCells = courses
    .map(
      (course) => `
        <th>
          <div class="course-header">
            <span>${course.courseCode}</span>
            ${course.courseCode === highestCourse.courseCode ? '<span class="course-badge top">Highest workload</span>' : '<span class="course-badge">Course</span>'}
          </div>
        </th>
      `,
    )
    .join('');

  const sectionRows = rows
    .map((row) => {
      const cells = courses
        .map((course) => {
          const renderedValue = row.value(course);
          const isTop = course.courseCode === highestCourse.courseCode && row.label === 'Workload score';
          return `<td class="${isTop ? 'metric-highlight top' : ''}">${renderedValue}</td>`;
        })
        .join('');

      return `
        <tr>
          <th>${row.label}</th>
          ${cells}
        </tr>
      `;
    })
    .join('');

  comparisonTableWrapper.innerHTML = `
    <table class="comparison-table" style="min-width: ${Math.max(720, 170 + courses.length * 180)}px">
      <thead>
        <tr>
          <th>Metric</th>
          ${headerCells}
        </tr>
      </thead>
      <tbody>
        ${sectionRows}
      </tbody>
    </table>
  `;
}

function renderTimetable(courses) {
  if (!courses.length) {
    timetableWrapper.innerHTML = '<div class="empty-state">Select at least two courses to preview a timetable.</div>';
    return;
  }

  const timeLabels = Array.from({ length: timetableSlotCount }, (_, index) => {
    const hour = 8 + index;
    return `<div class="timetable-time-slot">${String(hour).padStart(2, '0')}:00-${String(hour).padStart(2, '0')}:50</div>`;
  }).join('');
  const conflicts = [];
  const dayColumns = timetableDays
    .map((day) => {
      const slots = Array.from({ length: timetableSlotCount }, () => '<div class="timetable-hour-slot" aria-hidden="true"></div>').join('');
      const dayEvents = getDayEvents(courses, day.key);
      conflicts.push(...findTimetableConflicts(dayEvents, day));
      const events = dayEvents
        .map((event) => {
          const visibleMinutes = timetableEndMinutes - timetableStartMinutes;
          const top = ((event.start - timetableStartMinutes) / visibleMinutes) * 100;
          const height = ((event.end - event.start) / visibleMinutes) * 100;
          const colorIndex = event.courseIndex % 6;
          const left = (event.lane / event.laneCount) * 100;
          const width = 100 / event.laneCount;
          const details = [
            event.course.crn,
            `${event.course.courseCode}-${event.course.courseSession}`,
            event.where,
          ].filter(Boolean);

          return `
            <article
              class="timetable-event color-${colorIndex}${event.conflict ? ' timetable-event-conflict' : ''}"
              style="--event-top: ${top}%; --event-height: ${height}%; --event-left: ${left}%; --event-width: ${width}%"
              title="${event.course.courseCode} ${event.type} • ${event.days} ${event.time} • ${event.where}"
              aria-label="${event.course.courseCode} ${event.type}, ${event.days}, ${event.time}, ${event.where}"
            >
              ${details.map((detail) => `<span>${detail}</span>`).join('')}
            </article>
          `;
        })
        .join('');

      return `
        <section class="timetable-day-column" aria-label="${day.label} schedule">
          <div class="timetable-hour-slots" aria-hidden="true">${slots}</div>
          <div class="timetable-events">${events}</div>
        </section>
      `;
    })
    .join('');
  const headers = timetableDays
    .map((day) => `<div class="timetable-day-header" role="columnheader">${day.label}</div>`)
    .join('');
  const warning = conflicts.length
    ? `
      <aside class="timetable-warning" role="alert">
        <strong>Schedule conflict${conflicts.length > 1 ? 's' : ''} detected</strong>
        <ul>${conflicts.map((conflict) => `<li>${conflict}</li>`).join('')}</ul>
      </aside>
    `
    : '';

  timetableWrapper.innerHTML = `
    ${warning}
    <div class="timetable-grid" role="grid" aria-label="Weekly course timetable">
      <div class="timetable-corner" role="columnheader">Time</div>
      ${headers}
      <div class="timetable-time-axis" aria-hidden="true">${timeLabels}</div>
      ${dayColumns}
    </div>
  `;
}

function updateComparison() {
  const selectedCourses = getSortedSelectedCourses();

  if (selectedCourses.length < 2) {
    comparisonTableWrapper.innerHTML = '<div class="empty-state">Select at least two courses to compare.</div>';
    renderTimetable([]);
    return;
  }

  renderComparisonTable(selectedCourses);
  renderTimetable(selectedCourses);
}

courseForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addCourseCodes();
});

sortKeySelect.addEventListener('change', (event) => {
  state.sortKey = event.target.value;
  updateComparison();
});

resetButton.addEventListener('click', resetSelection);
importButton.addEventListener('click', importTimetableSelection);

sortKeySelect.value = state.sortKey;
renderCourseCheckboxes();
updateComparison();

if (state.selectedCodes.length) {
  showStatus(`${state.selectedCodes.length} course${state.selectedCodes.length > 1 ? 's' : ''} selected.`, 'success');
} else {
  showStatus('Select at least two courses to compare.', 'info');
}
