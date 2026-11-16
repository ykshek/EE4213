(function () {
    'use strict';

    const dayAliases = {
        m: 'M', mo: 'M', mon: 'M', monday: 'M',
        t: 'T', tu: 'T', tue: 'T', tues: 'T', tuesday: 'T',
        w: 'W', we: 'W', wed: 'W', wednesday: 'W',
        th: 'Th', thu: 'Th', thur: 'Th', thurs: 'Th', thursday: 'Th',
        r: 'Th',
        f: 'F', fr: 'F', fri: 'F', friday: 'F'
    };

    function normalizeDay(value) {
        return dayAliases[String(value || '').toLowerCase()] || null;
    }

    function findConflicts(events) {
        const byDay = new Map();
        events.forEach(event => {
            if (!event || !['M', 'T', 'W', 'Th', 'F'].includes(event.day) ||
                !Number.isFinite(event.start) || !Number.isFinite(event.end) ||
                event.end <= event.start) return;
            if (!byDay.has(event.day)) byDay.set(event.day, []);
            byDay.get(event.day).push(event);
        });

        const conflicts = [];
        byDay.forEach((dayEvents, day) => {
            dayEvents.sort((a, b) => a.start - b.start || a.end - b.end);
            dayEvents.forEach((event, index) => {
                dayEvents.slice(index + 1).forEach(other => {
                    if (event.start >= other.end || other.start >= event.end) return;
                    conflicts.push({ first: event, second: other, day });
                });
            });
        });
        return conflicts;
    }

    window.EE4213Timetable = Object.freeze({ normalizeDay, findConflicts });
})();
