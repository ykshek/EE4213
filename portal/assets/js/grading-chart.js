(() => {
    'use strict';

    const categoryOrder = ['assignments', 'midterm', 'final', 'project', 'other'];
    const categoryColors = {
        assignments: '#800020',
        midterm: '#b7791f',
        final: '#315b7d',
        project: '#a34d68',
        other: '#6b7280'
    };
    const fallbackColors = ['#8a5a2b', '#4f6d8c', '#7b4b5e', '#2f6f5e', '#8b6f47'];

    function percentText(value) {
        const rounded = Math.round(value * 10) / 10;
        return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
    }

    function categoryRank(key) {
        const index = categoryOrder.indexOf(key);
        return index === -1 ? categoryOrder.length : index;
    }

    function colorFor(key, index) {
        return categoryColors[key] || fallbackColors[index % fallbackColors.length];
    }

    function labelFor(labels, key, language) {
        const label = labels[key];
        if (!label) return key;
        if (typeof label === 'string') return label;
        return label[language] || label.en || label.zh || key;
    }

    function create(components, options = {}) {
        const wrapper = document.createElement('div');
        wrapper.className = 'grading-chart' + (options.compact ? ' grading-chart-compact' : '');
        const entries = Object.entries(components || {})
            .filter(([, value]) => Number.isFinite(value) && value > 0)
            .sort((first, second) => categoryRank(first[0]) - categoryRank(second[0]) || first[0].localeCompare(second[0]));

        if (!entries.length) {
            const empty = document.createElement('p');
            empty.className = 'grading-chart-empty';
            empty.textContent = options.noData || 'No grading breakdown available.';
            wrapper.appendChild(empty);
            return wrapper;
        }

        const total = entries.reduce((sum, [, value]) => sum + value, 0);
        const language = options.language === 'en' ? 'en' : 'zh';
        const labels = options.labels || {};
        let cursor = 0;
        const stops = entries.map(([key, value], index) => {
            const start = cursor;
            cursor += value / total * 100;
            return `${colorFor(key, index)} ${start}% ${cursor}%`;
        });

        const pie = document.createElement('div');
        pie.className = 'grading-pie';
        pie.style.background = `conic-gradient(${stops.join(', ')})`;
        pie.setAttribute('role', 'img');
        const parts = entries.map(([key, value]) => `${labelFor(labels, key, language)} ${percentText(value)}`);
        pie.setAttribute('aria-label', (language === 'en' ? 'Grading components: ' : '評分組成：') + parts.join(language === 'en' ? ', ' : '，'));

        const legend = document.createElement('ul');
        legend.className = 'grading-legend';
        entries.forEach(([key, value], index) => {
            const item = document.createElement('li');
            const swatch = document.createElement('span');
            swatch.className = 'grading-swatch';
            swatch.style.background = colorFor(key, index);
            swatch.setAttribute('aria-hidden', 'true');

            const label = document.createElement('span');
            label.className = 'grading-legend-label';
            const labelValue = labels[key];
            if (labelValue && typeof labelValue === 'object') {
                const chinese = document.createElement('span');
                chinese.className = 'lang-zh';
                chinese.textContent = labelValue.zh || labelValue.en || key;
                const english = document.createElement('span');
                english.className = 'lang-en';
                english.lang = 'en';
                english.textContent = labelValue.en || labelValue.zh || key;
                label.append(chinese, english);
            } else {
                label.textContent = labelFor(labels, key, language);
            }

            const amount = document.createElement('strong');
            amount.className = 'grading-legend-value';
            amount.textContent = percentText(value);
            item.append(swatch, label, amount);
            legend.appendChild(item);
        });

        wrapper.append(pie, legend);
        if (Math.abs(total - 100) > 0.5) {
            const note = document.createElement('p');
            note.className = 'grading-chart-note';
            note.textContent = language === 'en'
                ? `Chart shares are normalized; recorded components total ${percentText(total)}.`
                : `圖表按比例顯示；記錄的評分組成合共 ${percentText(total)}。`;
            wrapper.appendChild(note);
        }
        return wrapper;
    }

    window.EE4213GradingChart = Object.freeze({ create });
})();
