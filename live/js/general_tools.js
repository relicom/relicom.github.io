var hideClass = "hide", userTypeObj = {BUSINESS: "business", REGULAR: "regular", TEMPORARY: "temporary", GUEST: "guest"},
profileTypeObj = {BUSINESS: "business", SITE: "site"}, MAX_TEMPORARY_FAV = 100, MAX_TEMPORARY_PROFILE = 50,
        MAX_FOLLOW_SCROLL_QTY = 3, STATIC_FILE_PATH = {site: "/static/site/", profile: "/static/user/"},
postMessagePhrase = "utk", supportyStringQuery = "?reqag=supporty", smsNum = 50001000,
        /***serviceUrl is supporty url that i must be set in future*/serviceUrl = "http://daum.net:8383";
//*** change it in future
var temporaryStaticFilesHost = "/supporty_template_rtl/";

var baseUrlRegExp = new RegExp(/(http:\/\/|https:\/\/)([a-zA-Z0-9-]+\.)*[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,11}(:\d{1,5})?\/?/g);
function checkBaseUrlValidation(url) {
    baseUrlRegExp.lastIndex = 0;
    return baseUrlRegExp.exec(url);
}
function getExtractDomainFromBaseUrl(url) {
//    console.log(1, url);
    if (url.startsWith("http")) {
        url = url.substring(url.indexOf("//") + 2, url.length);
    }
//    console.log(2, url);
    if (url.includes(":")) {
        url = url.substring(0, url.indexOf(":"));
    }
//    console.log(3, url);
    if (url.includes("/")) {
        url = url.substring(0, url.indexOf("/"));
    }

//    console.log(4, url);
    if (url.split(".").length > 1) {
        var dotIdx = url.lastIndexOf(".");
        dotIdx = url.lastIndexOf(".", dotIdx - 1) + 1;
        url = url.substring(dotIdx);
    }
//    console.log(5,url);
    return url;
}
var ONE_DAY = 1000 * 60 * 60 * 24;
//var week = {d1: "یکشنبه", d2: "دوشنبه", d3: "سه شنبه", d4: "چهارشنبه", d5: "پنجشنبه", d6: "جمعه", d7: "شنبه"};
var week = {d1: "شنبه", d2: "یکشنبه", d3: "دوشنبه", d4: "سه شنبه", d5: "چهارشنبه", d6: "پنجشنبه", d7: "جمعه"};
function getTokenPercentage(token) {
    var perc = 0;
    if (token < 15001) {
        perc = (token / 15000) * 25;
    } else if (token < 50001) {
        perc = ((token / 50000) * 25) + 25;
    } else if (token < 100001) {
        perc = ((token / 100000) * 25) + 50;
    } else {
        perc = ((token / 1000000) * 25) + 75;
    }
    perc *= -1;
    return perc;
}
function getRoomSizePercentage(roomSize) {
    var perc = 100;
    if (roomSize < 51) {
        perc = (roomSize / 50) * 25;
    } else if (roomSize < 251) {
        perc = ((roomSize / 250) * 25) + 25;
    } else if (roomSize < 1001) {
        perc = ((roomSize / 1000) * 25) + 50;
    }
    return perc;
}
function getRandomCode() {
    return getRandomInt(12345, 99999)
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var ranArr = [], ranLength;
function setChar(from, to) {
    for (var c = from; c <= to; c++) {
        ranArr.push(String.fromCharCode(c));
    }
}
setChar(48, 57);
setChar(97, 122);
setChar(65, 90);
ranLength = ranArr.length;
function getRandom(moreLen) {
    var ran = "", time = new Date().getTime(), mod;
    while (time > ranLength) {
        mod = Math.floor(time % ranLength);
        time = Math.floor(time / ranLength);
        if (time < ranLength) {
            ran += ranArr[time];
        } else {
            ran += ranArr[mod];
        }
    }
    if (moreLen) {
        while (moreLen > 0) {
            ran += ranArr[Math.floor(Math.random() * ranLength)];
            moreLen--;
        }
    }
    return ran;
}
function shiftJsonObjectIndex(key, isMoveUp, obj) {
    if (key && obj) {
        var o = {};
        var idx;
        var keys = Object.keys(obj);
        var k;
        if ((idx = keys.indexOf(key)) > -1) {
            if ((!isMoveUp && idx + 1 === keys.length) || (isMoveUp && idx === 0)) {
                return [false, "فضای خالی برای حرکت وجود ندارد"];
            } else {
                for (var f = 0; f < keys.length; f++) {
                    if (isMoveUp && (idx - 1 === f)) {
                        k = keys[idx];
                        o[k] = obj[k];
                        k = keys[f];
                        o[k] = obj[k];
                        f++;
                    } else if (!isMoveUp && (idx === f)) {
                        k = keys[f + 1];
                        o[k] = obj[k];
                        k = keys[f];
                        o[k] = obj[k];
                        f++;
                    } else {
                        k = keys[f];
                        o[k] = obj[k];
                    }
                }
            }
            return [true, o];
        }
        return [false, "کلید پیدا نشد: " + key];
    }
    return [false, "مقدار خالی دریافت شده"];
}
function setReadonlyInput(elems, isReadOnly) {
    elems.forEach(function (elem) {
        elem.prop("readonly", isReadOnly);
    });
}
function setHiddenAndNonHiddenElem(hiddens, nonHiddens) {
    if (hiddens) {
        hiddens.each(function (i, e) {
            $(e).addClass(hideClass);
        });
    }
    if (nonHiddens) {
        nonHiddens.each(function (i, e) {
            $(e).removeClass(hideClass);
        });
    }
}
function setRmoveCheckedRadioInput(elems) {
    if (elems) {
        elems.each(function (i, e) {
            $(e).prop("checked", false);
        });
    }
}
function saveFile(filename, data) {
    var blob = new Blob([data]);
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}
function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
        return;
    }
    navigator.clipboard.writeText(text).then(function () {
        console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
        console.error('Async: Could not copy text: ', err);
    });
}
function isSelectorInputValidate(str) {
    var chars = ["script", "<", "\"", "'", ";", "&"];
    return checkNotHaveCharacters(str, chars);
}
function isInputValidate(str) {
    var chars = ["script", "<", ">", "\"", "'", ";", "&"];
    return checkNotHaveCharacters(str, chars);
}
function checkNotHaveCharacters(str, chars) {
    if (chars && chars.length > 0 && str && str.length > 0) {
        str = str.toLowerCase();
        var flag = [true, ''];
        chars.forEach(function (ch) {
//            console.log("ch: " + ch + "|str: " + str + "|idx: " + str.indexOf(ch));
            if (str.indexOf(ch) > -1) {
                flag = [false, ch];
            }
        });
        return flag;
    }
    return null;
}
function findInArray(arr, idx, value) {
//    if (!arr || !value || arr.length < 1 || idx < 0 && idx >= arr.length) {
//        return null;
//    }
    var res = null;
    if (arr && value && arr.length && idx !== undefined) {
//        console.log(arr, idx, value);
        arr.some(function (e) {
            if (e[idx] === value) {
                res = e;
                return true;
            }
        })
    }
    return res;
}
function removeInArray(arr, idx, value) {
    if (arr && value && arr.length && idx !== undefined) {
        console.log(arr, idx, value);
        arr = arr.filter(function (e) {
            return e[idx] !== value;
        })
    }
    return arr;
}
function sliceArray(arr, from, to) {
    if (arr && arr.length > 0) {
        if (!from) {
            from = 0;
        }
        if (!to || to < from) {
            to = arr.length;
        }
        var arr2 = [];
        for (; from < to && from < arr.length; from++) {
            arr2.push(arr[from]);
        }
        return arr2;
    }
    return null;
}
function sortArrayByNumber(numericIndex, arr, isAsc) {
    if (numericIndex !== undefined && numericIndex > -1 && arr && arr.length > 0) {
        arr.sort(function (a, b) {
            return a[numericIndex] - b[numericIndex]
        });
        if (!isAsc) {
            arr.reverse();
        }
        return arr;
    }
    return null;
}
function checkRegex(regex, str) {
    var res = new RegExp(regex).exec(str);
    if (res && res[0].length == str.length) {
        return true;
    }
    return false;
}
function usernameValidate(username) {
    return checkRegex(/[\w]{3,35}/, username);
}
//function formatDate_1(date, includesSecond) {
//    var d = new Date(date),
//            month = (d.getMonth() + 1),
//            day = d.getDate(),
//            year = d.getFullYear(),
//            hour = d.getHours(),
//            min = d.getMinutes(),
//            sec = d.getSeconds();
//    if (month < 10) {
//        month = '0' + month;
//    }
//    if (day < 10) {
//        day = '0' + day;
//    }
//    if (hour < 10) {
//        hour = '0' + hour;
//    }
//    if (min < 10) {
//        min = '0' + min;
//    }
//    if (sec < 10) {
//        sec = '0' + sec;
//    }
//    var res = year + "-" + month + "-" + day + " &nbsp;" + hour + ":" + min
//    if (includesSecond) {
//        res += ":" + sec;
//    }
//    return res;
//}
function formatDate_1(date, includesSecond) {
    var d = new Date(date),
            p = new jDateFunctions().gregorian_to_jalali(d),
            month = p.month,
            day = p.date,
            year = p.year,
            hour = d.getHours(),
            min = d.getMinutes(),
            sec = d.getSeconds();
    if (month < 10) {
        month = '0' + month;
    }
    if (day < 10) {
        day = '0' + day;
    }
    if (hour < 10) {
        hour = '0' + hour;
    }
    if (min < 10) {
        min = '0' + min;
    }
    if (sec < 10) {
        sec = '0' + sec;
    }
    var res = hour + ":" + min + (includesSecond ? ":" + sec : "") + " &nbsp;" + year + "/" + month + "/" + day;
    return res;
}
//function formatDate_2(date) {
//    var d = new Date(date),
//            month = (d.getMonth() + 1),
//            day = d.getDate(),
//            year = d.getFullYear();
//    if (month < 10) {
//        month = '0' + month;
//    }
//    if (day < 10) {
//        day = '0' + day;
//    }
//    return year + "-" + month + "-" + day;
//}
function formatDate_2(date) {
    var p = new jDateFunctions().gregorian_to_jalali(new Date(date)),
            month = p.month,
            day = p.date,
            year = p.year;
    if (month < 10) {
        month = '0' + month;
    }
    if (day < 10) {
        day = '0' + day;
    }
    return year + "/" + month + "/" + day;
}
function getDateDifferenceByTotal_1(date1, date2) {
    var res = getDateDiffrence(date1, date2);
//    var space = "&nbsp;";
    var e = "";
    var flag = false;
    if (res) {
        if (res.Y > 0) {
            e += res.Y + "Y "
            flag = true;
        }
        if (flag || res.M > 0) {
            e += res.M + "M "
            flag = true;
        }
        if (flag || res.D > 0) {
            e += res.D + "D "
            flag = true;
        }
        if (flag || res.h > 0) {
            e += res.h + "h "
            flag = true;
        }
        if (flag || res.m > 0) {
            e += res.m + "m "
            flag = true;
        }
        e += res.s + "s"
        return e;
    }
    return null;
}
function getDateDifferenceByHour(date1, date2) {
    var res = getDateDiffrence(date1, date2, {h: true, m: true, s: true});
    if (res) {
        if (res.h < 10)
            res.h = '0' + res.h;
        if (res.m < 10)
            res.m = '0' + res.m;
        if (res.s < 10)
            res.s = '0' + res.s;
        return res.h + "h:" + res.m + "m:" + res.s + "s";
    }
    return null;
}
function getDateDifferenceByMin(date1, date2) {
    var res = getDateDiffrence(date1, date2, {m: true, s: true});
    if (res) {
        return res.m + "m:" + res.s + "s";
    }
    return null;
}
function isHaveOneWeekDifference(date) {
    return isHaveDateDifference(timeRange.D * 7, date);
}
function isHaveDateDifference(amount, date1, date2) {
    if (date1 !== undefined) {
        if (date2 === undefined) {
            date2 = new Date().getTime();
        }
        console.log(amount, date1, date2, (date2 - date1), (date2 - date1) / 1000);
        date1 = (date2 - date1) / 1000;
        return date1 > amount;
    }
    return false;
}
var timeRange = {Y: 31536000, M: 2592000, D: 86400, h: 3600, m: 60};
var fixTimeItems = {Y: true, M: true, D: true, h: true, m: true, s: true};
function getDateDiffrence(date1, date2, timeItems) {
    if (date1 !== undefined) {
        if (!timeItems) {
            timeItems = fixTimeItems;
        }
        if (date2 === undefined) {
            date2 = 0
        }
        var res = {};
        var dif = Math.abs(Math.floor((date2 - date1) / 1000));
        if (timeItems.Y) {
            res.Y = Math.floor(dif / timeRange.Y);
            dif %= timeRange.Y;
        }
        if (timeItems.M) {
            res.M = Math.floor(dif / timeRange.M);
            dif %= timeRange.M;
        }
        if (timeItems.D) {
            res.D = Math.floor(dif / timeRange.D);
            dif %= timeRange.D;
        }
        if (timeItems.h) {
            res.h = Math.floor(dif / timeRange.h);
            dif %= timeRange.h;
        }
        if (timeItems.m) {
            res.m = Math.floor(dif / timeRange.m);
            dif %= timeRange.m;
        }
        if (timeItems.s) {
            res.s = Math.floor(dif);
        }
        return res
    }
    return null;
}
function getStarScore(score, noSpace, len) {
    if (score !== undefined) {
        if (!len) {
            len = 10;
        } else if (len < score) {
            return null;
        }
        var e = '';
        var space = noSpace ? '' : '\n';
        var isHavePointValue = (score % 1) !== 0;
        var fixScore = Math.floor(score);
        for (var f = 0; f < fixScore; f++) {
            e += '<i class="fas fa-star fg-css-gold"></i>' + space;
        }
        if (isHavePointValue) {
            len--;
            e += '<i class="fas fa-star-half-alt fg-css-lightgold"></i>' + space;
        }
        len -= score;
        for (var f = 0; f < len; f++) {
            e += '<i class="far fa-star fg-css-lightgray"></i>' + space;
        }
        return e;
    }
    return null;
}
function getRoundPointNumber(number, pointDigit) {
    if (number !== undefined) {
        if (pointDigit === undefined) {
            pointDigit = 2;
        }
        var factor = Math.pow(10, pointDigit);
        return Math.floor(number * factor) / factor;
    }
    return null;
}
function findClassByStartName(elem, startName) {
    var res = elem.attr("class").match(startName + "[\\w-]*\\b");
    if (res) {
        return res[0];
    }
    return null;
}
function getWidthCmToPx(widthCm) {
    var d = $("<div/>").css({position: 'absolute', top: '-2cm', left: '-2cm', height: '1cm', width: '1cm'}).appendTo('body');
    var w = d.width() * widthCm;
    var wAll = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    d.remove();
    if (w > wAll) {
        return wAll - 15;
    }
    return w;
}
function isCheckedOneOfCheckBoxes(chks) {
    if (chks && chks.length > 0) {
        for (var f = 0; f < chks.length; f++) {
            if ($(chks[f]).is(":checked")) {
                return true;
            }
        }
    }
    return false;
}
function openLinkInNewTab(link) {
    var win = window.open(link, '_blank');
    if (win) {
        win.focus();
    } else {
//        toast.error("شما باز شدن لینک ها را مسدود کردید لطفا اجازه بدید لینک ها باز شوند");
        show(MO.OPEN_LINK_NOTALLOWED);
    }
}
function openLinkInCurrentTab(link) {
    var win = window.open(link, '_self');
    if (win) {
        win.focus();
    } else {
//        toast.error("you blocked to open links, please allow me to show it");
        show(MO.OPEN_LINK_NOTALLOWED);
    }
}
function setCursorToEnd(target) {
    var range = document.createRange();
    var sel = window.getSelection();
    range.selectNodeContents(target);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    target.focus();
    range.detach(); // optimization

    // set scroll to the end if multiline
    target.scrollTop = target.scrollHeight;
}

function b64EncodeUnicode(str) {
// first we use encodeURIComponent to get percent-encoded UTF-8,
// then we convert the percent encodings into raw bytes which
// can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    }))
}
function b64DecodeUnicode(str) {
// Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function toggleFullScreen() {
    if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) ||
            (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
        var elem = document.documentElement;
        if (elem.requestFullScreen) {
            elem.requestFullScreen();
        } else if (elem.webkitRequestFullScreen) {
            elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        return true;
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
        return false;
    }
}
function setLeftCharInput(inputElem, counterElem) {
    if (inputElem && counterElem) {
        var maxLen = inputElem.attr("maxlength");
        if (maxLen && maxLen > 0) {
            var len;
            counterElem.text("(حداکثر " + maxLen + " حرف)");
            inputElem.on('input', function () {//change keyup paste
                len = maxLen - this.value.length;
//                console.log(len);
                counterElem.text("(" + len + " حرف جا داره)");
                if (len === 0) {
//                    toast.info("you reached to end of text size!");
//toast.info("به انتهای تعداد حروف رسیدید");
                    show(MO.END_TEXT_REACHED);
                }
            });
        }
    }
}
function cleanStringQuery(newPath) {
    //*** to remove string query from url for security reasons
    window.history.replaceState({}, document.title, newPath ? newPath : window.location.pathname);
}
function hideBodyScrollBar(isHide) {
    if (isHide) {
        $("body").addClass("overflow_hidden");
    } else {
        $("body").removeClass("overflow_hidden");
    }
}
function hashCode(s) {
    s = s.toLowerCase();
    var h = 0, l = s.length, i = 0;
    if (l > 0) {
        while (i < l) {
            h = (h << 5) - h + s.charCodeAt(i++) | 0;
        }
    }
    return h;
}
function hashCodeString(s) {
    var h = hashCode(s);
    h = h > 0 ? "+" + h : "" + h;
    return h;
}
function splitHashCode(hash) {
    var arr = null;
    if (hash && hash.length > 0) {
        console.log("arr", arr, hash, hash.length)
        if (hash.includes("+")) {
            arr = hash.split("+");
        } else if (hash.includes("-")) {
            arr = hash.split("-");
            arr[1] = "-" + arr[1];
        }
        arr = [Number(arr[0]), Number(arr[1])];
    }
    return arr;
}
function reloadPage() {
    location.reload();
}

var bcCh = new BroadcastChannel("bd-ch");
var bcTabQty = 0, bcCallbackQty = 0, bcTimeout, bcUniqueId = getRandom(3), bcReceivers = [];
bcCh.onmessage = function (msg) {
    console.log(msg);
    if (msg.origin === location.origin) {
        msg = msg.data;
        if (msg.cmd === 1) {//ping
            bcCh.postMessage({cmd: 2, msg: "pong", source: msg.source, target: bcUniqueId, param: msg.param});
        } else if (msg.cmd === 2) {//opened tab quantity
            bcChCallback(2, msg);
        } else if (msg.cmd === 3) {//server closed count in tabs
//for test : 
//bdChCallback(3, "param1",{name: "chPseudoFn", callback: "chPseudoCallbackFn", callbackParam: {cmd: 4,source: bcUniqueId, task: getRandom(3)}})
            console.log("my tab id: ", bcUniqueId, " source id: ", msg.source, " msg param: ", msg.param);
            if (typeof msg.func === 'object' && typeof window[msg.func.name] === 'function') {
                console.log("function of " + msg.func.name + " is exist");
                window[msg.func.name](msg.func.callback, msg.func.callbackParam);
            } else {
                bcCh.postMessage({cmd: 4, msg: "op_res", source: bcUniqueId, target: bcUniqueId, status: -1});
            }
        } else if (msg.cmd === 4) {//server closed count in tabs
            bcChCallback(4, msg);
        }
    }
}
function bcChCallback(cmd, msg, func) {
//    console.log("bdChCallback cmd: ", cmd, " msg: ", msg, " callback: ", callback);
    if (cmd === 1) {//send ping cmd
        bcTabQty = 0;
        bcCallbackQty = 0;
        clearTimeout(bcTimeout);
        bcReceivers = [];
        bcCh.postMessage({cmd: 1, msg: "ping", source: bcUniqueId, param: msg});
    } else if (cmd === 2) {//receive pong
        bcTabQty++;
        if (msg.target) {
            bcReceivers.push(msg.target)
        }
        clearTimeout(bcTimeout);
        bcTimeout = setTimeout(function () {
            if (msg && msg.source === bcUniqueId && msg.param) {
                if (msg.param.func && typeof window[msg.param.func] === 'function') {
                    window[msg.param.func](msg.param, msg.param.callbackParam);
                }
            }
        }, 300);
    } else if (cmd === 3) {
        bcCh.postMessage({cmd: 3, msg: "op_req", source: bcUniqueId, param: msg, func: func});
    } else if (cmd === 4) {
//        console.log("cmd 4 reached", msg,msg.source === bcUniqueId , msg.opFunc , typeof window[msg.opFunc] === 'function');
        clearTimeout(bcTimeout);
        bcTimeout = setTimeout(function () {
            if (msg.source === bcUniqueId && msg.opFunc && typeof window[msg.opFunc] === 'function') {
                window[msg.opFunc](msg.opFuncParam);
            }
        }, 500);

    }
}
function bcCallback(param, additionalParam) {
    if (param) {
        if (typeof additionalParam === 'object') {
            $.extend(param, additionalParam)
        }
//        console.log("function of: ", chPseudoCallbackFn.name, " my tab id: ", bcUniqueId, " with param of: ", param, " additionalParam: ", additionalParam);
        bcCh.postMessage(param);
    }
}
function chPseudoFn(param, callback, callbackParam) {
//    console.log("function of: ", chPseudoFn.name, " my tab id: ", bcUniqueId, " with param of: ", param, " callback: ", callback, " callbackParam: ", callbackParam);
    if (callback && typeof window[callback] === 'function') {
        window[callback](callbackParam, {target: bcUniqueId, status: 1});//1 = successful , -1 = not successful
    }
}
function chPseudoCallbackFn(param, additionalParam) {
    if (param) {
        if (typeof additionalParam === 'object') {
            $.extend(param, additionalParam)
        }
//        console.log("function of: ", chPseudoCallbackFn.name, " my tab id: ", bcUniqueId, " with param of: ", param, " additionalParam: ", additionalParam);
        bcCh.postMessage(param);
    }
}
