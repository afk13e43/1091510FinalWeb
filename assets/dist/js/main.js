// === 全域狀態 ===
let all = [];
let wish = JSON.parse(localStorage.getItem('wishlist') || '[]');
let chartCtx;
let chart;
let dateLabels = [];        // chart x 軸：所有日期由舊到新
let labelIndex = new Map(); // 'YYYY/M/D' -> dateLabels 中的 index
let chartData = { all: [], ps: [], ns: [], xbox: [] };

// === 平台判定 ===
const PLATFORM_TESTS = {
    '1': () => true,
    '2': (it) => /\bPS\s*[345]?\b/i.test(it['品項']),
    '3': (it) => /\b(XBOX|XSX|XSS)\b/i.test(it['品項']),
    '4': (it) => /\b(NS|Switch|任天堂)\b/i.test(it['品項']),
};

// === 共用 helper ===
const pad2 = (n) => String(n).padStart(2, '0');

function formatDate(ts) {
    if (typeof ts !== 'number') return '未知';
    const d = new Date(ts * 1000);
    return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())} ` +
           `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function dateKey(ts) {
    if (typeof ts !== 'number') return null;
    const d = new Date(ts * 1000);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

function currentPlatformTest() {
    const v = $('input[name=game_type]:checked').val() || '1';
    return PLATFORM_TESTS[v] || PLATFORM_TESTS['1'];
}

// === 渲染表格 ===
function rowHtml(item, actionLabel) {
    return `<tr>
        <td style="border:solid">${item.id}</td>
        <td width="20%" style="border:solid">${escapeHtml(formatDate(item['日期']))}</td>
        <td width="40%" style="border:solid">
            <a target="_blank" rel="noopener" href="${escapeHtml(item['商品網址'])}">${escapeHtml(item['品項'])}</a>
            <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" data-action="${actionLabel}" data-id="${item.id}">${actionLabel}</button>
        </td>
        <td width="100%" style="border:solid">${escapeHtml(item['售價'])}</td>
    </tr>`;
}

function renderTable(items) {
    if (!items.length) {
        $('#gameTable').html(
            `<tr><td colspan="4" style="text-align:center;padding:2em;color:#888;border:solid">沒有符合條件的資料</td></tr>`
        );
        return;
    }
    $('#gameTable').html(items.map((it) => rowHtml(it, '新增')).join(''));
}

function renderWishlist() {
    if (!wish.length) {
        $('#wish_list').html(
            `<tr><td colspan="4" style="text-align:center;padding:2em;color:#888">關注清單目前是空的</td></tr>`
        );
        return;
    }
    $('#wish_list').html(wish.map((it) => rowHtml(it, '刪除')).join(''));
}

// === 篩選 ===
function filterItems() {
    const test = currentPlatformTest();
    const q = ($('#game_name').val() || '').trim().toLowerCase();
    return all.filter((it) => {
        if (!test(it)) return false;
        if (q && !String(it['品項']).toLowerCase().includes(q)) return false;
        return true;
    });
}

// === 圖表 ===
function recomputeChart(items) {
    const len = dateLabels.length;
    const counts = {
        all:  new Array(len).fill(0),
        ps:   new Array(len).fill(0),
        ns:   new Array(len).fill(0),
        xbox: new Array(len).fill(0),
    };
    for (const it of items) {
        const key = dateKey(it['日期']);
        if (key == null || !labelIndex.has(key)) continue;
        const idx = labelIndex.get(key);
        counts.all[idx] += 1;
        if (PLATFORM_TESTS['2'](it)) counts.ps[idx]   += 1;
        if (PLATFORM_TESTS['3'](it)) counts.xbox[idx] += 1;
        if (PLATFORM_TESTS['4'](it)) counts.ns[idx]   += 1;
    }
    chartData = counts;
    drawChart();
}

function drawChart() {
    if (chart instanceof Chart) chart.destroy();
    chart = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: [
                { label: '全平台每日討論量', data: chartData.all,  borderColor: '#707038', backgroundColor: '#707038', borderWidth: 4, lineTension: 0, fill: false },
                { label: 'PS 平台討論量',    data: chartData.ps,   borderColor: '#2828FF', backgroundColor: '#2828FF', borderWidth: 4, lineTension: 0, fill: false },
                { label: 'NS 平台討論量',    data: chartData.ns,   borderColor: '#FF0000', backgroundColor: '#FF0000', borderWidth: 4, lineTension: 0, fill: false },
                { label: 'XBOX 平台討論量',  data: chartData.xbox, borderColor: '#00EC00', backgroundColor: '#00EC00', borderWidth: 4, lineTension: 0, fill: false },
            ],
        },
        options: { responsive: true, maintainAspectRatio: true, aspectRatio: 2.5 },
    });
}

// === 事件 ===
function applyTableOnly() {
    renderTable(filterItems());
}

function applyFull() {
    const items = filterItems();
    renderTable(items);
    recomputeChart(items);
}

function bindEvents() {
    $('input[name=game_type]').on('change', applyTableOnly);
    $('#game_name_button').on('click', applyFull);
    $('#game_name').on('keydown', (e) => { if (e.key === 'Enter') applyFull(); });
    $('#clear_search').on('click', () => {
        $('#game_name').val('');
        $('#alll').prop('checked', true);
        applyFull();
    });
    $('#haka_button').on('click', () => {
        if (!all.length) return;
        const i = Math.floor(Math.random() * all.length);
        window.open(all[i]['商品網址']);
    });
    $('#gameTable').on('click', 'button[data-action="新增"]', function () {
        const id = parseInt($(this).attr('data-id'), 10);
        const item = all.find((it) => it.id === id);
        if (!item) return;
        if (wish.some((w) => w['商品網址'] === item['商品網址'])) {
            alert('已經加入清單！');
            return;
        }
        wish.push(item);
        localStorage.setItem('wishlist', JSON.stringify(wish));
        renderWishlist();
    });
    $('#wish_list').on('click', 'button[data-action="刪除"]', function () {
        const url = all.find((it) => it.id === parseInt($(this).attr('data-id'), 10))?.['商品網址'];
        wish = wish.filter((it) => it['商品網址'] !== url);
        localStorage.setItem('wishlist', JSON.stringify(wish));
        renderWishlist();
    });
}

// === 啟動 ===
window.onload = function () {
    chartCtx = $('#canvas1')[0];
    renderWishlist();

    $.getJSON('./ptt_game.json')
        .done(function (msg) {
            all = (msg && msg.game_list) || [];

            // 建立 chart 的 x 軸：所有出現過的日期，由舊到新
            const dateSet = new Set();
            for (const it of all) {
                const key = dateKey(it['日期']);
                if (key !== null) dateSet.add(key);
            }
            dateLabels = Array.from(dateSet).sort((a, b) => {
                const [ya, ma, da] = a.split('/').map(Number);
                const [yb, mb, db] = b.split('/').map(Number);
                return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
            });
            labelIndex = new Map(dateLabels.map((k, i) => [k, i]));

            applyFull();
            bindEvents();
        })
        .fail(function () {
            console.error('Failed to load ptt_game.json');
            $('#gameTable').html(
                `<tr><td colspan="4" style="text-align:center;padding:2em;color:#c00;border:solid">資料載入失敗</td></tr>`
            );
        });
};
