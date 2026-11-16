(() => {
    'use strict';

    // Fictional starting records for the Group Project presentation and usability tests.
    // The course ID seeds the generator so the records never need browser storage.
    const terms = [
        ['2024/25 A', Date.UTC(2025, 0, 15)],
        ['2024/25 B', Date.UTC(2025, 5, 15)],
        ['2025/26 A', Date.UTC(2026, 0, 15)],
        ['2025/26 B', Date.UTC(2026, 5, 15)]
    ];
    const comments = [
        {
            weeks: [5, 6],
            zh: '第五、六週最花時間。我把練習分成幾晚做，每晚集中處理一部分，比週末一次過做輕鬆。',
            en: 'Weeks 5 and 6 took the most time. Spreading the practice over a few evenings was easier than doing it all on the weekend.'
        },
        {
            weeks: [7, 8],
            zh: '學期中段有幾個概念要重溫。我先把不懂的地方記下來，下一次上課前再集中處理。',
            en: 'I had a few concepts to revisit around the middle of term. Keeping a list of questions helped me focus before the next class.'
        },
        {
            weeks: [9, 11],
            zh: '第九和第十一週特別忙，主要時間用在整理筆記和重做不熟的部分。',
            en: 'Weeks 9 and 11 were busiest for me. Most of the extra time went into organising my notes and redoing the parts I found harder.'
        },
        {
            weeks: [10, 12],
            zh: '後半學期要多預留一晚。我把每週未完成的工作提早列出來，最後兩週就比較容易安排。',
            en: 'I needed an extra evening most weeks in the second half. Keeping a list of unfinished work made the last two weeks easier to plan.'
        },
        {
            weeks: [11, 12],
            zh: '第十一、十二週比平時忙。我在週初先處理最難的部分，後來才有時間回頭檢查。',
            en: 'Weeks 11 and 12 were busier than usual. Starting the hardest parts early in the week left me time to check my work.'
        },
        {
            weeks: [12, 13],
            zh: '最後兩週最忙。如果同一學期還有其他課，我會提早一週開始整理這門課的內容。',
            en: 'The final two weeks were the busiest. If I were taking it alongside other courses, I would start reviewing the material a week earlier.'
        }
    ];
    const busyPeriods = [[3, 4], [5, 6], [7, 8], [9, 10], [10, 12], [11, 12], [12, 13], [12, 13]];
    const levels = ['Low', 'Medium', 'High'];
    const labs = ['None', 'None', 'Monthly', 'Every 2 weeks', 'Weekly'];
    const grades = ['A+', 'A', 'A-', 'A-', 'B+', 'B+', 'B', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

    window.EE4213SeedReviews = course => {
        let state = 2166136261;
        for (const char of course.courseId) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
        const next = limit => {
            state = (Math.imul(1664525, state) + 1013904223) >>> 0;
            return Math.floor(state / 4294967296 * limit);
        };
        const count = 24 + next(13);
        const typicalHours = Number.isFinite(course.sampleWorkload) ? Math.round(course.sampleWorkload * 2) : 4 + next(5);
        const commentStart = next(comments.length);

        return Array.from({ length: count }, (_, index) => {
            const termIndex = index % terms.length;
            const [term, timestamp] = terms[termIndex];
            // Give each term a written review. The remaining entries contribute structured ratings.
            const note = index + terms.length >= count ? comments[(commentStart + termIndex) % comments.length] : null;
            return {
                term,
                time: timestamp + index * 3600000,
                hours: Math.max(1, typicalHours + next(7) - 3),
                project: levels[next(levels.length)],
                assignment: levels[next(levels.length)],
                pressure: levels[next(levels.length)],
                labs: labs[next(labs.length)],
                weeks: note?.weeks || busyPeriods[next(busyPeriods.length)],
                grade: grades[next(grades.length)],
                comment: note && { zh: note.zh, en: note.en }
            };
        });
    };
})();
