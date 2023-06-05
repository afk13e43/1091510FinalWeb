var all;
let myMap = new Map();

var temp2;
var data3 = [];
var dataPS4 = [];
var dataNS = [];
var dataXBOX = [];
var lineChartData = {
    labels: [], //顯示區間名稱
    datasets: [{
        label: '全平台每日討論量', // tootip 出現的名稱
        lineTension: 0, // 曲線的彎度，設0 表示直線
        backgroundColor: "#707038",
        borderColor: "#707038",
        borderWidth: 5,
        data: data3,
        fill: false, // 是否填滿色彩
    }, {
        label: 'PS平台討論量',
        lineTension: 0,
        fill: false,
        backgroundColor: "#2828FF",
        borderColor: "#2828FF",
        borderWidth: 5,
        data: dataPS4,
    }, {
        label: 'NS平台討論量',
        lineTension: 0,
        fill: false,
        backgroundColor: "#FF0000",
        borderColor: "#FF0000",
        borderWidth: 5,
        data: dataNS,
    }, {
        label: 'XBOX平台討論量',
        lineTension: 0,
        fill: false,
        backgroundColor: "#00EC00",
        borderColor: "#00EC00",
        borderWidth: 5,
        data: dataXBOX,
    },
    ]
};
function drawLineCanvas(ctx, data) {
    if (window.myLine instanceof Chart) {
        window.myLine.destroy();
    }
    window.myLine = new Chart(ctx, {  //先建立一個 chart
        type: 'line', // 型態
        data: data,
        options: {
            responsive: true,
            legend: { //是否要顯示圖示
                display: true,
            },
            tooltips: { //是否要顯示 tooltip
                enabled: true
            },
            scales: {  //是否要顯示 x、y 軸
                xAxes: [{
                    display: true
                }],
                yAxes: [{
                    display: true
                }]
            },
        }
    });
};
function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}
window.onload = function () {
    var Game;
    let url = "https://1091510-json-server-1.azurewebsites.net/game_list"
    // $.getJSON(url)
    // .done(function(msg){
    //     Game=msg;
    //     console.log(Game)
    // })
    // .fail(function(msg){
    //     console.log("Fail!");
    // });

    var set1 = new Set();
    $.getJSON(url)
        .done(function (msg) {
            all = msg;
            for (var t = 0; t < all.length; t++) {
                var date = new Date(all[t]['日期'] * 1000);
                var date2 = date.getFullYear() + '/' + (date.getMonth() + 1) + "/" + date.getDate();
                if (all[t]['日期'] != "未知") {
                    set1.add(date2);
                }
            }
            set1.forEach(function (da) {
                lineChartData.labels.push(da);
            }
            );
            for (var t = 0; t < all.length; t++) {
                var date = new Date(all[t]['日期'] * 1000);
                var date2 = date.getFullYear() + '/' + (date.getMonth() + 1) + "/" + date.getDate();
                if (set1.has(date2)) {
                    var ans = 0;
                    for (var e = 0; e < lineChartData.labels.length; e++) {
                        if (lineChartData.labels[e] == date2) {
                            ans = e;
                            break;
                        }
                    }
                    myMap.set(date2, ans);
                }
            }
            for (var j = 0; j < lineChartData.labels.length; j++) {
                data3.push(0);
                dataNS.push(0);
                dataPS4.push(0);
                dataXBOX.push(0);
            }
            for (var t = 0; t < all.length; t++) {
                var date = new Date(all[t]['日期'] * 1000);
                var date2 = date.getFullYear() + '/' + (date.getMonth() + 1) + "/" + date.getDate();
                if (set1.has(date2)) {
                    data3[myMap.get(date2)] = data3[myMap.get(date2)] + 1;
                    var str = all[t]['品項'];
                    if (str.includes("XBOX")) {
                        dataXBOX[myMap.get(date2)] = dataXBOX[myMap.get(date2)] + 1;
                    }
                    if (str.includes("PS")) {
                        dataPS4[myMap.get(date2)] = dataPS4[myMap.get(date2)] + 1;
                    }
                    if (str.includes("NS")) {
                        dataNS[myMap.get(date2)] = dataNS[myMap.get(date2)] + 1;
                    }
                }
            }
            lineChartData.labels = lineChartData.labels.reverse();
            data3 = data3.reverse();
            dataNS = dataNS.reverse();
            dataXBOX = dataXBOX.reverse();
            dataPS4 = dataPS4.reverse();
            var ctx = $('#canvas1')[0];
            drawLineCanvas(ctx, lineChartData);

            var tempurl;
            for (j = 0; j <= 50; j++) {
                tempurl = url + "/" + j
                $.getJSON(tempurl)
                    .done(function (msg) {
                        Game = msg;
                        console.log(Game);
                        if (Game['日期'] != "未知") {
                            var date = new Date(Game['日期'] * 1000);
                            $("#gameTable").append("<tr>"
                                + `<td  style="border:solid">${Game['id']}</td>`
                                + `<td width="20%" style=" border:solid">${date.getFullYear() +
                                "/" + (date.getMonth() + 1) +
                                "/" + (date.getDate()) +
                                " " + date.getHours() +
                                ":" + date.getMinutes() +
                                ":" + date.getSeconds()}</td>`
                                + `<td width="40%" style=" border:solid"><a  target="_blank" href="${Game['商品網址']}">${Game['品項']}</a>
                                <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${Game['id']}>${'新增'}</button></td>`
                                + `<td  width="100%" style="border:solid">${Game['售價']}</td>`
                                + "</tr>");
                        }
                        else {
                            $("#gameTable").append("<tr>"
                                + `<td  style="border:solid">${Game['id']}</td>`
                                + `<td width="10%" style=" border:solid">${Game['日期']}</td>`
                                + `<td width="30%" style=" border:solid"><a target="_blank" href="${Game['商品網址']}">${Game['品項']}</a>
                                <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${Game['id']}>${'新增'}</button></td>`
                                + `<td  width="100%" style="border:solid">${Game['售價']}</td>`
                                + "</tr>");
                        }

                    })
                    .fail(function (msg) {
                        console.log("Fail!");
                    });

            }
            $("#gameTable").css("border", "solid");
            $("#haka_button").on("click", function () {
                var ram = Math.floor(Math.random() * all.length) - 1;
                window.open(all[ram]['商品網址']);
            })
            $("#alll").on("click", function () {
                $("#gameTable").text("");
                drawLineCanvas(ctx, lineChartData);
                for (var t = 0; t < all.length; t++) {
                    console.log($('input[name=game_type]:checked').val());
                    if ($('input[name=game_type]:checked').val() == 1) {
                        if (all[t]['日期'] != "未知") {
                            var date1 = new Date(all[t]['日期'] * 1000);
                            $("#gameTable").append("<tr>"
                                + `<td  style="border:solid">${all[t]['id']}</td>`
                                + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                "/" + (date1.getMonth() + 1) +
                                "/" + (date1.getDate()) +
                                " " + date1.getHours() +
                                ":" + date1.getMinutes() +
                                ":" + date1.getSeconds()}</td>`
                                + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                + "</tr>");
                        }
                        else {
                            $("#gameTable").append("<tr>"
                                + `<td  style="border:solid">${all[t]['id']}</td>`
                                + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                + "</tr>");
                        }
                    }
                    else if ($('input[name=game_type]:checked').val() == 2) {
                        if (all[t]['品項'].includes("PS")) {
                            if (all[t]['日期'] != "未知") {
                                var date1 = new Date(all[t]['日期'] * 1000);
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                    "/" + (date1.getMonth() + 1) +
                                    "/" + (date1.getDate()) +
                                    " " + date1.getHours() +
                                    ":" + date1.getMinutes() +
                                    ":" + date1.getSeconds()}</td>`
                                    + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                            else {
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                    + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                        }
                    }
                    else if ($('input[name=game_type]:checked').val() == 3) {
                        if (all[t]['品項'].includes("XBOX")) {
                            if (all[t]['日期'] != "未知") {
                                var date1 = new Date(all[t]['日期'] * 1000);
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                    "/" + (date1.getMonth() + 1) +
                                    "/" + (date1.getDate()) +
                                    " " + date1.getHours() +
                                    ":" + date1.getMinutes() +
                                    ":" + date1.getSeconds()}</td>`
                                    + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                            else {
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                    + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                        }

                    } else if ($('input[name=game_type]:checked').val() == 4) {
                        if (all[t]['品項'].includes("NS")) {
                            if (all[t]['日期'] != "未知") {
                                var date1 = new Date(all[t]['日期'] * 1000);
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                    "/" + (date1.getMonth() + 1) +
                                    "/" + (date1.getDate()) +
                                    " " + date1.getHours() +
                                    ":" + date1.getMinutes() +
                                    ":" + date1.getSeconds()}</td>`
                                    + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                            else {
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                    + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                        }
                    }
                }

            });
            $("#ps").on("click", function () {

                $("#gameTable").text("");
                drawLineCanvas(ctx, lineChartData);
                for (var t = 0; t < all.length; t++) {
                    console.log($('input[name=game_type]:checked').val());
                    if ($('input[name=game_type]:checked').val() == 1) {
                        if (all[t]['日期'] != "未知") {
                            var date1 = new Date(all[t]['日期'] * 1000);
                            $("#gameTable").append("<tr>"
                                + `<td  style="border:solid">${all[t]['id']}</td>`
                                + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                "/" + (date1.getMonth() + 1) +
                                "/" + (date1.getDate()) +
                                " " + date1.getHours() +
                                ":" + date1.getMinutes() +
                                ":" + date1.getSeconds()}</td>`
                                + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                + "</tr>");
                        }
                        else {
                            $("#gameTable").append("<tr>"
                                + `<td  style="border:solid">${all[t]['id']}</td>`
                                + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                + "</tr>");
                        }
                    }
                    else if ($('input[name=game_type]:checked').val() == 2) {
                        if (all[t]['品項'].includes("PS")) {
                            if (all[t]['日期'] != "未知") {
                                var date1 = new Date(all[t]['日期'] * 1000);
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                    "/" + (date1.getMonth() + 1) +
                                    "/" + (date1.getDate()) +
                                    " " + date1.getHours() +
                                    ":" + date1.getMinutes() +
                                    ":" + date1.getSeconds()}</td>`
                                    + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                            else {
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                    + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                        }
                    }
                    else if ($('input[name=game_type]:checked').val() == 3) {
                        if (all[t]['品項'].includes("XBOX")) {
                            if (all[t]['日期'] != "未知") {
                                var date1 = new Date(all[t]['日期'] * 1000);
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                    "/" + (date1.getMonth() + 1) +
                                    "/" + (date1.getDate()) +
                                    " " + date1.getHours() +
                                    ":" + date1.getMinutes() +
                                    ":" + date1.getSeconds()}</td>`
                                    + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                            else {
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                    + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                        }

                    } else if ($('input[name=game_type]:checked').val() == 4) {
                        if (all[t]['品項'].includes("NS")) {
                            if (all[t]['日期'] != "未知") {
                                var date1 = new Date(all[t]['日期'] * 1000);
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                    "/" + (date1.getMonth() + 1) +
                                    "/" + (date1.getDate()) +
                                    " " + date1.getHours() +
                                    ":" + date1.getMinutes() +
                                    ":" + date1.getSeconds()}</td>`
                                    + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                            else {
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                    + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                        }

                    }
                }
            });
            $("#xbox").on("click", function () {
                $("#gameTable").text("");
                drawLineCanvas(ctx, lineChartData);
                for (var t = 0; t < all.length; t++) {
                    console.log($('input[name=game_type]:checked').val());
                    if ($('input[name=game_type]:checked').val() == 1) {
                        if (all[t]['日期'] != "未知") {
                            var date1 = new Date(all[t]['日期'] * 1000);
                            $("#gameTable").append("<tr>"
                                + `<td  style="border:solid">${all[t]['id']}</td>`
                                + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                "/" + (date1.getMonth() + 1) +
                                "/" + (date1.getDate()) +
                                " " + date1.getHours() +
                                ":" + date1.getMinutes() +
                                ":" + date1.getSeconds()}</td>`
                                + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                + "</tr>");
                        }
                        else {
                            $("#gameTable").append("<tr>"
                                + `<td  style="border:solid">${all[t]['id']}</td>`
                                + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                + "</tr>");
                        }
                    }
                    else if ($('input[name=game_type]:checked').val() == 2) {
                        if (all[t]['品項'].includes("PS")) {
                            if (all[t]['日期'] != "未知") {
                                var date1 = new Date(all[t]['日期'] * 1000);
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                    "/" + (date1.getMonth() + 1) +
                                    "/" + (date1.getDate()) +
                                    " " + date1.getHours() +
                                    ":" + date1.getMinutes() +
                                    ":" + date1.getSeconds()}</td>`
                                    + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                            else {
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                    + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                        }
                    }
                    else if ($('input[name=game_type]:checked').val() == 3) {
                        if (all[t]['品項'].includes("XBOX")) {
                            if (all[t]['日期'] != "未知") {
                                var date1 = new Date(all[t]['日期'] * 1000);
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                    "/" + (date1.getMonth() + 1) +
                                    "/" + (date1.getDate()) +
                                    " " + date1.getHours() +
                                    ":" + date1.getMinutes() +
                                    ":" + date1.getSeconds()}</td>`
                                    + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                            else {
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                    + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                        }

                    } else if ($('input[name=game_type]:checked').val() == 4) {
                        if (all[t]['品項'].includes("NS")) {
                            if (all[t]['日期'] != "未知") {
                                var date1 = new Date(all[t]['日期'] * 1000);
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                    "/" + (date1.getMonth() + 1) +
                                    "/" + (date1.getDate()) +
                                    " " + date1.getHours() +
                                    ":" + date1.getMinutes() +
                                    ":" + date1.getSeconds()}</td>`
                                    + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                            else {
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                    + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                        }

                    }
                }
            });
            $("#ns").on("click", function () {
                $("#gameTable").text("");
                drawLineCanvas(ctx, lineChartData);
                for (var t = 0; t < all.length; t++) {
                    console.log($('input[name=game_type]:checked').val());
                    if ($('input[name=game_type]:checked').val() == 1) {
                        if (all[t]['日期'] != "未知") {
                            var date1 = new Date(all[t]['日期'] * 1000);
                            $("#gameTable").append("<tr>"
                                + `<td  style="border:solid">${all[t]['id']}</td>`
                                + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                "/" + (date1.getMonth() + 1) +
                                "/" + (date1.getDate()) +
                                " " + date1.getHours() +
                                ":" + date1.getMinutes() +
                                ":" + date1.getSeconds()}</td>`
                                + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                + "</tr>");
                        }
                        else {
                            $("#gameTable").append("<tr>"
                                + `<td  style="border:solid">${all[t]['id']}</td>`
                                + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                + "</tr>");
                        }
                    }
                    else if ($('input[name=game_type]:checked').val() == 2) {
                        if (all[t]['品項'].includes("PS")) {
                            if (all[t]['日期'] != "未知") {
                                var date1 = new Date(all[t]['日期'] * 1000);
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                    "/" + (date1.getMonth() + 1) +
                                    "/" + (date1.getDate()) +
                                    " " + date1.getHours() +
                                    ":" + date1.getMinutes() +
                                    ":" + date1.getSeconds()}</td>`
                                    + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                            else {
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                    + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                        }
                    }
                    else if ($('input[name=game_type]:checked').val() == 3) {
                        if (all[t]['品項'].includes("XBOX")) {
                            if (all[t]['日期'] != "未知") {
                                var date1 = new Date(all[t]['日期'] * 1000);
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                    "/" + (date1.getMonth() + 1) +
                                    "/" + (date1.getDate()) +
                                    " " + date1.getHours() +
                                    ":" + date1.getMinutes() +
                                    ":" + date1.getSeconds()}</td>`
                                    + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                            else {
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                    + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                        }

                    } else if ($('input[name=game_type]:checked').val() == 4) {
                        if (all[t]['品項'].includes("NS")) {
                            if (all[t]['日期'] != "未知") {
                                var date1 = new Date(all[t]['日期'] * 1000);
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                    "/" + (date1.getMonth() + 1) +
                                    "/" + (date1.getDate()) +
                                    " " + date1.getHours() +
                                    ":" + date1.getMinutes() +
                                    ":" + date1.getSeconds()}</td>`
                                    + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                            else {
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                    + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                        }
                    }
                }
            });
            $("#clear_search").on("click", function () {
                for (var j = 0; j < lineChartData.labels.length; j++) {
                    data3[j] = 0;
                    dataNS[j] = 0;
                    dataPS4[j] = 0;
                    dataXBOX[j] = 0;
                }
                $("#game_name").val("");
                for (var t = 0; t < all.length; t++) {
                    var date = new Date(all[t]['日期'] * 1000);
                    var date2 = date.getFullYear() + '/' + (date.getMonth() + 1) + "/" + date.getDate();
                    if (set1.has(date2)) {
                        data3[myMap.get(date2)] = data3[myMap.get(date2)] + 1;
                        var str = all[t]['品項'];
                        if (str.includes("XBOX")) {
                            dataXBOX[myMap.get(date2)] = dataXBOX[myMap.get(date2)] + 1;
                        }
                        if (str.includes("PS")) {
                            dataPS4[myMap.get(date2)] = dataPS4[myMap.get(date2)] + 1;
                        }
                        if (str.includes("NS")) {
                            dataNS[myMap.get(date2)] = dataNS[myMap.get(date2)] + 1;
                        }
                    }
                }
                data3 = data3.reverse();
                dataNS = dataNS.reverse();
                dataXBOX = dataXBOX.reverse();
                dataPS4 = dataPS4.reverse();
                ctx.width = ctx.width;
                $("#game_name").text("");
                $("#gameTable").text("");
                drawLineCanvas(ctx, lineChartData);
                for (var t = 0; t < all.length; t++) {
                    console.log($('input[name=game_type]:checked').val());
                    if ($('input[name=game_type]:checked').val() == 1) {
                        if (all[t]['日期'] != "未知") {
                            var date1 = new Date(all[t]['日期'] * 1000);
                            $("#gameTable").append("<tr>"
                                + `<td  style="border:solid">${all[t]['id']}</td>`
                                + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                "/" + (date1.getMonth() + 1) +
                                "/" + (date1.getDate()) +
                                " " + date1.getHours() +
                                ":" + date1.getMinutes() +
                                ":" + date1.getSeconds()}</td>`
                                + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                + "</tr>");
                        }
                        else {
                            $("#gameTable").append("<tr>"
                                + `<td  style="border:solid">${all[t]['id']}</td>`
                                + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                + "</tr>");
                        }
                    }
                    else if ($('input[name=game_type]:checked').val() == 2) {
                        if (all[t]['品項'].includes("PS")) {
                            if (all[t]['日期'] != "未知") {
                                var date1 = new Date(all[t]['日期'] * 1000);
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                    "/" + (date1.getMonth() + 1) +
                                    "/" + (date1.getDate()) +
                                    " " + date1.getHours() +
                                    ":" + date1.getMinutes() +
                                    ":" + date1.getSeconds()}</td>`
                                    + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                            else {
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                    + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                        }
                    }
                    else if ($('input[name=game_type]:checked').val() == 3) {
                        if (all[t]['品項'].includes("XBOX")) {
                            if (all[t]['日期'] != "未知") {
                                var date1 = new Date(all[t]['日期'] * 1000);
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                    "/" + (date1.getMonth() + 1) +
                                    "/" + (date1.getDate()) +
                                    " " + date1.getHours() +
                                    ":" + date1.getMinutes() +
                                    ":" + date1.getSeconds()}</td>`
                                    + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                            else {
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                    + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                        }

                    } else if ($('input[name=game_type]:checked').val() == 4) {
                        if (all[t]['品項'].includes("NS")) {
                            if (all[t]['日期'] != "未知") {
                                var date1 = new Date(all[t]['日期'] * 1000);
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                    "/" + (date1.getMonth() + 1) +
                                    "/" + (date1.getDate()) +
                                    " " + date1.getHours() +
                                    ":" + date1.getMinutes() +
                                    ":" + date1.getSeconds()}</td>`
                                    + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                            else {
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                    + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                        }
                    }

                }
            })

            $("#game_name_button").on("click", function () {

                if ($("#game_name").val() == "") {
                    return;
                }
                for (var j = 0; j < lineChartData.labels.length; j++) {
                    data3[j] = 0;
                    dataNS[j] = 0;
                    dataPS4[j] = 0;
                    dataXBOX[j] = 0;
                }
                for (var t = 0; t < all.length; t++) {
                    var date = new Date(all[t]['日期'] * 1000);
                    var date2 = date.getFullYear() + '/' + (date.getMonth() + 1) + "/" + date.getDate();
                    var str3 = all[t]['品項'];
                    if (str3.includes($("#game_name").val())) {
                        if (set1.has(date2)) {
                            data3[myMap.get(date2)] = data3[myMap.get(date2)] + 1;
                            if (str3.includes("XBOX")) {
                                dataXBOX[myMap.get(date2)] = dataXBOX[myMap.get(date2)] + 1;
                            }
                            if (str3.includes("PS")) {
                                dataPS4[myMap.get(date2)] = dataPS4[myMap.get(date2)] + 1;
                            }
                            if (str3.includes("NS")) {
                                dataNS[myMap.get(date2)] = dataNS[myMap.get(date2)] + 1;
                            }
                        }
                    }
                }
                data3 = data3.reverse();
                dataNS = dataNS.reverse();
                dataXBOX = dataXBOX.reverse();
                dataPS4 = dataPS4.reverse();
                ctx.width = ctx.width;
                drawLineCanvas(ctx, lineChartData);
                $("#gameTable").text("");
                for (var t = 0; t < all.length; t++) {
                    var str3 = all[t]['品項'];
                    if ($('input[name=game_type]:checked').val() == 1) {

                        if (str3.includes($("#game_name").val())) {
                            if (all[t]['日期'] != "未知") {
                                var date1 = new Date(all[t]['日期'] * 1000);
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                    "/" + (date1.getMonth() + 1) +
                                    "/" + (date1.getDate()) +
                                    " " + date1.getHours() +
                                    ":" + date1.getMinutes() +
                                    ":" + date1.getSeconds()}</td>`
                                    + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                            else {
                                $("#gameTable").append("<tr>"
                                    + `<td  style="border:solid">${all[t]['id']}</td>`
                                    + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                    + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                    <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                    + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                    + "</tr>");
                            }
                        }
                    }
                    else if ($('input[name=game_type]:checked').val() == 2) {
                        if (str3.includes("PS")) {
                            if (str3.includes($("#game_name").val())) {
                                if (all[t]['日期'] != "未知") {
                                    var date1 = new Date(all[t]['日期'] * 1000);
                                    $("#gameTable").append("<tr>"
                                        + `<td  style="border:solid">${all[t]['id']}</td>`
                                        + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                        "/" + (date1.getMonth() + 1) +
                                        "/" + (date1.getDate()) +
                                        " " + date1.getHours() +
                                        ":" + date1.getMinutes() +
                                        ":" + date1.getSeconds()}</td>`
                                        + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                        <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                        + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                        + "</tr>");
                                }
                                else {
                                    $("#gameTable").append("<tr>"
                                        + `<td  style="border:solid">${all[t]['id']}</td>`
                                        + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                        + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                        <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                        + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                        + "</tr>");
                                }
                            }
                        }
                    }
                    else if ($('input[name=game_type]:checked').val() == 3) {
                        if (str3.includes("XBOX")) {
                            if (str3.includes($("#game_name").val())) {
                                if (all[t]['日期'] != "未知") {
                                    var date1 = new Date(all[t]['日期'] * 1000);
                                    $("#gameTable").append("<tr>"
                                        + `<td  style="border:solid">${all[t]['id']}</td>`
                                        + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                        "/" + (date1.getMonth() + 1) +
                                        "/" + (date1.getDate()) +
                                        " " + date1.getHours() +
                                        ":" + date1.getMinutes() +
                                        ":" + date1.getSeconds()}</td>`
                                        + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                        <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                        + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                        + "</tr>");
                                }
                                else {
                                    $("#gameTable").append("<tr>"
                                        + `<td  style="border:solid">${all[t]['id']}</td>`
                                        + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                        + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                        <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                        + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                        + "</tr>");
                                }
                            }
                        }
                    }
                    else if ($('input[name=game_type]:checked').val() == 4) {
                        if (str3.includes("NS")) {
                            if (str3.includes($("#game_name").val())) {
                                if (all[t]['日期'] != "未知") {
                                    var date1 = new Date(all[t]['日期'] * 1000);
                                    $("#gameTable").append("<tr>"
                                        + `<td  style="border:solid">${all[t]['id']}</td>`
                                        + `<td width="20%" style=" border:solid">${date1.getFullYear() +
                                        "/" + (date1.getMonth() + 1) +
                                        "/" + (date1.getDate()) +
                                        " " + date1.getHours() +
                                        ":" + date1.getMinutes() +
                                        ":" + date1.getSeconds()}</td>`
                                        + `<td width="40%" style=" border:solid"><a  target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                        <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                        + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                        + "</tr>");
                                }
                                else {
                                    $("#gameTable").append("<tr>"
                                        + `<td  style="border:solid">${all[t]['id']}</td>`
                                        + `<td width="10%" style=" border:solid">${all[t]['日期']}</td>`
                                        + `<td width="30%" style=" border:solid"><a target="_blank" href="${all[t]['商品網址']}">${all[t]['品項']}</a>
                                        <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[t]['id']}>${'新增'}</button></td>`
                                        + `<td  width="100%" style="border:solid">${all[t]['售價']}</td>`
                                        + "</tr>");
                                }
                            }
                        }
                    }

                }

            });
            $('#gameTable').on('click', 'button', function () {
               if($("#wish_list").html().includes(all[($(this).attr("id") - 1)]['品項'])==false|| $("#wish_list").html().includes(all[($(this).attr("id") - 1)]['售價'])==false)
              {
                $("#wish_list").append("<tr>"
                    + `<td id=${$(this).attr("id")} style="border:solid">${all[($(this).attr("id") - 1)]['id']}</td>`
                    + `<td id=${$(this).attr("id")} width="10%" style=" border:solid">${all[$(this).attr("id")]['日期']}</td>`
                    + `<td id=${$(this).attr("id")}  width="50%" style=" border:solid"><a target="_blank" href="${all[($(this).attr("id") - 1)]['商品網址']}">${all[($(this).attr("id") - 1)]['品項']}</a>
                <button type="button" style="float:right;" class="btn btn-outline-secondary d-inline-flex align-items-center" id = ${all[($(this).attr("id") - 1)]['id']}>${'刪除'}</button></td>`
                    + `<td id=${$(this).attr("id")}  width="40%" style="border:solid">${all[($(this).attr("id") - 1)]['售價']}</td>`
                    + "</tr>");
              }
              else
              {
                alert("已經加入清單！");
              }

            });
            $('#wish_list').on('click', 'button', function () {
                console.log($(this).attr("id"));
                $(this).closest('tr').remove();
            });
        })
        .fail(function (msg) {
            console.log("Fail!");
        });
};