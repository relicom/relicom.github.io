//document.addEventListener('DOMContentLoaded', function () {

var s61Ver = 1, //s61linkTypeEnum = Object.freeze({"organic": 1, "profile": 2}), 
        s61Day = Math.floor((new Date() * 1 - new Date(2021, 2, 21) * 1) / 86400000),
        s61w = s61Select("#s61w"), s61im = s61Select(s61w.dataset.i), s61ti = s61Select(s61w.dataset.t),
        s61ti = (s61ti !== null ? s61ti.textContent.trim() : null), s61numid = Number(s61w.dataset.numid),
        s61Valid = (s61Day > 70 && s61im !== null && s61ti !== null), s61ga = s61w.dataset.ga,
        s61ls = localStorage, s61b = "/supporty/", s61Prefix = "S61-",
        s61self = window.self.location.origin, s61top = window.top.location.origin,
        s61SiteBase = s61w.dataset.base, s61url = location.pathname, s61hash = s61hashCode(s61url),
        /*change my site in future*/s61Supporty = "http://qwer";

function s61Select(e) {
    return document.querySelector(e);
}
function s61Deactive() {
    s61w.style.display = "none";
}
function s61Hide(e, b) {
    e = e.classList;
    e.add("s61o");
    if (b) {
        e.remove("s61o")
    }
}
function s61Init() {
    var s61m = s61Select("#s61m"), s61a = s61Select("#s61a"), s61n = s61Select("#s61n"), s61s = s61Select("#s61s"), s61v = s61Select("#s61v")// s61l = s61Select("#s61l"),
            , /*s61vp = s61Select("#s61v>span"),*/ s61p = 1;
    var s61css = document.createElement("link");
    s61css.type = "text/css";
    s61css.rel = "stylesheet";
    s61css.href = s61b + "static/lib_assistant.css";
    document.head.appendChild(s61css);

    var s61t1 = Number(s61ls.getItem("s61s")), s61t2 = Number(s61ls.getItem("s61d")), s61t3 = new Date() * 1;

    //*** in code of "s61t2 + 3000 > s61t3" I check if consultants state are 3 seconds old then needs to get new state, in future it must be increase to 3 minuets not 3 seconds of test

    if ((s61t1 > 0 && s61t2 + 3000 > s61t3) || (s61t1 === -1 && s61t2 + (2 * 600) > s61t3) || (s61t1 === -2 && s61t2 + (24 * 600) > s61t3)) {
        console.log("if");
        s61OnlineOfflineState(null, JSON.parse(s61ls.getItem("s61j")));
    } else {
        console.log("else");
        //*** this link is for test in future it's replaced with s61w.dataset.sid + .json
        fetch('/lib_assistant/json/supporters.json').then(function (r) {
            //fetch('supporters.json').then(r => r.json()).then(j => s61cb(null, j)).catch(e => s61cb(e, null));
            return r.json();
        }).then(function (j) {
//            console.log("j", j);
            s61ls.setItem("s61d", s61t3);
            s61ls.setItem("s61j", JSON.stringify(j));
            s61ls.setItem("s61s", j.status);
            s61OnlineOfflineState(null, j)
        }).catch(function (e) {
            s61OnlineOfflineState(e, null)
        });
    }
    function s61OnlineOfflineState(e, j) {
        console.log(s61OnlineOfflineState.name, e, j, j.status);
        if (j && !e) {
            s61Hide(s61m, 1);
            if (j.status < 0) {
                s61Hide(s61a);
                s61Hide(s61v);
                s61s.textContent = (j.msg ? j.msg : (j.status === -2 ? "سرویس غیر فعال است" : "سرویس موقتا غیر فعال است"));
            } else {
                var l = j.list, c = s61Ran(0, l.length - 1);
                if (l.length > 0) {
                    s61LiveState(l[c++]);
                    s61m.onmouseenter = s61m.onmouseleave = function (e) {
                        s61p = e.type === "mouseleave" ? 1 : 0;
                        console.log("mouse event : ", e, e.type, s61p);
                    };
                    s61m.onclick = function (e) {
                        console.log("s61mcc clicked");
                        window.open(s61Select("#s61t").href, '_blank');
                    };
                    if (l.length > 1) {
                        setInterval(function () {
                            if (s61p) {
                                if (c >= l.length) {
                                    c = 0;
                                }
                                s61LiveState(l[c++]);
                            }
                        }, 10000);
                    }
                }
            }
        } else {
            console.log("دیتا دریافت نشد");
        }
    }
    function s61LiveState(r) {
        s61FadeLiveState();
        setTimeout(function () {
            s61FadeLiveState();
            if (r[0]) {
                s61s.textContent = r[4];
                s61Hide(s61v, 1);
                s61v.textContent = "لایو با " + r[5] + " بیننده";
            } else {
                s61s.textContent = "الان لایو نیستم اینجا یک نگاه به ساعت برنامه هام بنداز";
                s61Hide(s61v, 1);
            }
            s61m.dataset.i = r[1];
            s61a.src = s61b + "karshenas/pic_" + r[2] + ".jpg";
            s61n.textContent = r[3];
        }, 800);
    }
    function s61Ran(l, h) {
        l = Math.ceil(l);
        return Math.floor(Math.random() * (Math.floor(h) - l + 1)) + l;
    }
    function s61FadeLiveState() {
        s61m.classList.toggle('s61h')
    }
//    function b64EncodeUnicode(str) {
//        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
//            return String.fromCharCode('0x' + p1);
//        }))
//    }
    if (s61Valid) {
        var s61e = s61Select("#s61e");
        s61Hide(s61e, 1);
        s61e.onclick = function () {
            console.log("s61ecc clicked");
            //*** change target url
//            var b64 = b64EncodeUnicode('{"link":"' + location.origin + location.pathname + '","hash":' + s61hash + ',"title":"' + s61ti + '","numid":' + s61numid + '}');
//            window.open('http://localhost:8383/supporty_template_rtl/motherpage_home.html?p=' + b64 + '#external_favorite',
//                    'addfav', 'height=500,width=500,status=no,menubar=no,toolbar=no');
            window.open('http://qwer/external/favorite?p=' + s61ProductDetail(),
                    'addfav', 'height=600,width=500,status=no,menubar=no,toolbar=no');
        }
    }
}

function s61SessionTracker() {
    if (s61Valid) {
        var t1 = new Date() * 1, t2, totalDuration = 0,
                isPageVisited = false, intervalId;
        function cleanDB() {
            try {
                var size = JSON.stringify(s61ls).length / 1024 / 1204;
                if (size > 4.2) {
                    var keys = Object.keys(s61l), v, t, d = s61Day - 30;//*** is 30 days enough ?
                    for (var f = 0; f < keys.length; f++) {
                        if (keys[f].startsWith(s61Prefix)) {
                            v = JSON.parse(s61ls.getItem(keys[f]));
                            t = Object.keys(v.time);
                            for (var g = 1; g < d; g++) {
                                delete t.time["d" + g];
                            }
                            s61ls.setItem(keys[f], t);
                        }
                    }
                }
                var size = JSON.stringify(s61ls).length / 1024 / 1204;
                if (size > 3.5) {
                    clearLs();
                }
            } catch (r) {
                console.error(r);
                clearLs();
            }
        }
        function clearLs() {
            s61ls.clear();
            location.reload();
        }
        cleanDB();
        document.addEventListener('visibilitychange', function () {
            if (isPageVisited) {
                if (document.visibilityState === 'hidden') {
                    setDuration();
                    setIntervalPersistence(false);

                } else if (document.visibilityState === 'visible') {
                    t1 = new Date() * 1;
                    setIntervalPersistence(true);
                }
//            console.log(isPageVisited + ' | Tab state :' + document.visibilityState + " | duration : " + totalDuration + " Date: " + (new Date().getTime()));
            } else {
                setDuration();
//            console.log(isPageVisited + ' | Tab state :' + document.visibilityState + " | duration : " + totalDuration + " Date: " + (new Date().getTime()));
                isPageVisited = true;
                setIntervalPersistence(false);
            }
        });

        function setIntervalPersistence(isPageVisisble) {
            if (isPageVisisble) {
                intervalId = setInterval(function () {
//                console.log(setIntervalPersistence.name, new Date());
                    setDuration();
                    persistNewVisit();
                }, 5000)//interval update current visit statistics
            } else if (intervalId) {
                clearInterval(intervalId);
                persistNewVisit();
            }
        }
        function persistNewVisit() {
            var ti = parseInt(totalDuration / 1000); //time in second not millisecond
//        console.log(persistNewVisit.name, ti);
            if (ti > 3) {//3 seconds is minimum valuable user visit that i could to count that handled by interval function
                var obj = s61ls.getItem(s61Prefix + s61hash);
//                console.log("persistNewVisit +++++ ",obj,s61Prefix + s61hash,localStorage.getItem(s61Prefix + s61hash));
                if (obj) {
                    obj = JSON.parse(obj);
                    var prevoiusTime = 0;
                    if (obj.time["d" + s61Day]) {
                        prevoiusTime = obj.time["d" + s61Day];
                        if (typeof prevoiusTime !== "number") {
                            prevoiusTime = 0;
                        }
                    }
                    obj.time["d" + s61Day] = prevoiusTime + ti;
                } else {
                    obj = {
                        url: s61url,
                        img: s61im.src,
                        title: s61ti,
                        time: {}
                    }
                    obj.time["d" + s61Day] = ti
                }
                obj = JSON.stringify(obj);
                s61ls.setItem(s61Prefix + s61hash, obj);
            }
        }
        function setDuration() {
            t2 = new Date() * 1;
//            totalDuration += (t2 - t1);
            totalDuration = (t2 - t1);
            t1 = t2;
        }
        setIntervalPersistence(true);
    }
}
function s61ProductDetail() {
    var str = '{"link":"' + location.origin + location.pathname + '","hash":' + s61hash + ',"title":"' + s61ti + '","img":"' + s61im.src + '","numid":' + s61numid + '}';
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (m, p1) {
        return String.fromCharCode('0x' + p1);
    }))

}
function s61hashCode(s) {
    s = s.toLowerCase();
    var h = 0, l = s.length, i = 0;
    if (l > 0)
        while (i < l) {
            h = (h << 5) - h + s.charCodeAt(i++) | 0;
        }
    return h;
}
function s61SortArrayByNumber(numericIndex, arr, isAsc) {
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


//*** just for test it's will be removed in production stage
setTimeout(function () {
//    s61VisitStatistics();
}, 3000);

function s61VisitStatistics() {
    var arr = [], k, v, j = {};
    var keys = Object.keys(s61ls);
    for (var b = 0; b < keys.length; b++) {
        k = keys[b];
        if (k.startsWith(s61Prefix)) {
            v = JSON.parse(s61ls.getItem(k));
            if (v && v.url && v.img && v.title && v.time) {
                j[k] = v;
            } else {
                s61ls.removeItem(k);
            }
        }
    }
    keys = Object.keys(j);
    var timeKeys, totalTime;
    for (var b = 0; b < keys.length; b++) {
        k = keys[b];
        timeKeys = Object.keys(j[k].time);
        totalTime = 0;
        for (var p = 0; p < timeKeys.length; p++) {
            totalTime += j[k].time[timeKeys[p]];
        }
        if (totalTime > 0) {
            arr.push([k.substr(s61Prefix.length), j[k].url, j[k].title, j[k].img, totalTime]);
        }
    }
    arr = s61SortArrayByNumber(4, arr);
    arr = arr.slice(0, 100);
    s61ShowArr(arr);
    return arr;
}

//*** just for test and show array members of getVisitStatistics() result
function s61ShowArr(arr) {
    console.log("Show Arr", arr);
    // [hash,url,title,imgSrc,duration]
    if (typeof arr == "object")
//                arr = arr.data;
        arr.forEach(function (item, idx) {
            console.log(idx, item);
        })
}
function s61ChangeAnchorTarget() {
    document.querySelectorAll("a").forEach(function (i) {
        i.setAttribute('target', '_self');
    });
}

console.log("condition", "s61self: ", s61self, "s61top: ", s61top, "s61w.dataset.base: ", s61w.dataset.base, "s61Valid: ", s61Valid, "s61self === s61top: ", s61self === s61top, "window.top.frames.length: ", window.top.frames.length, "window.self.frames.length: ", window.self.frames.length);
//****just to check is this library loaded in legal target site
if (s61self === s61SiteBase) {//true ||

    //*** user opened site in self origin without iframe, so s61SessionTracker() and s61Init() are called
    // this condition will be implemented in }else{ } section

    //*** user is in live page and url of self and top related to target site, so s61SessionTracker() and s61Init() MUST BE NOT call
    var b1 = s61self === s61top && s61top === s61SiteBase;
    //*** user is in profile page and url of itself is related to target site and url of top related to supporty.com, so s61SessionTracker() called but s61Init() must be not called
    var b2 = s61self !== s61top && s61top === s61Supporty;
    console.log("is top===self?", window.top === window.self, "b1 ", b1, " b2 ", b2, " s61self ", s61self, " s61top ", s61top, " s61r ", s61SiteBase, " s61y ", s61Supporty, " s61top === s61y ", s61top === s61Supporty);

//    if (b1) {
//        s61Deactive();
//        s61ChangeAnchorTarget();
//    } else if (b2) {
//        s61Deactive();
//        s61ChangeAnchorTarget();
//        s61SessionTracker();
//        s61SiteBase = s61Supporty;
//    }else{
//        s61SessionTracker();
//        s61Init();
//    }

    if (window.top !== window.self && (b1 || b2)) {// && window.top.frames.length > 0   con === 1 || 
        console.log("if condition was true");
        s61Deactive();
        s61ChangeAnchorTarget();
        if (b2) {
            //*** after
            s61SessionTracker();
            s61SiteBase = s61Supporty;
        }
        function pm(e) {
            //*** i comment it because postmessage and receiver are in same origin and makes infinity message loop
            window.top.postMessage(e, s61SiteBase);
        }
        window.addEventListener('message', function (e) {
            console.log("lib_assistant message", "data: ", e.data, "origin: ", e.origin);
            if (e.origin === s61SiteBase) { //*** change origin url to my site
                e = e.data;
                //*** maybe not required because in any page load i send it immediately
                if (e.c === "url") {
                    pm({c: "url", isvalid: s61Valid, host: location.origin, path: location.pathname, title: s61ti, numid: s61numid, img: s61im.src, hash: s61hash, b64: s61ProductDetail()});
                } else if (e.c === "ga" && s61ga) {
//https://developers.google.com/analytics/devguides/collection/analyticsjs/cross-domain#iframes
                    ga('create', s61ga, 'auto', {clientId: e.gacid})
                }
            }
        });
        if (s61Valid) {
            pm({c: "url", isvalid: s61Valid, host: location.origin, path: location.pathname, title: s61ti, numid: s61numid, img: s61im.src, hash: s61hash, b64: s61ProductDetail()});
        } else {
            pm({c: "url", isvalid: s61Valid});
        }


    } else {
        //*** user is in target site without iframe
        //*** after 
        s61SessionTracker();
        s61Init();
    }

} else {
    console.log("library is not related to site");
}
//})
