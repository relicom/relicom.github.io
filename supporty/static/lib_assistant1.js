//document.addEventListener('DOMContentLoaded', function () {

var s61linkTypeEnum = Object.freeze({"organic": 1, "profile": 2}), s61Ver = 1,
        s61w = s61f("#s61w"), s61im = s61f(s61w.dataset.i), s61ti = s61f(s61w.dataset.t),
        s61ti = (s61ti !== null ? s61ti.textContent.trim() : null), s61numid = Number(s61w.dataset.numid),
        s61Valid = s61im !== null && s61ti !== null, s61ga = s61w.dataset.ga,
        s61ls = localStorage, s61b = s61w.dataset.base, s61self = window.self.location.origin,
        s61top = window.top.location.origin,
        //*** for test i must be uncommet below line
//        s61r = s61w.dataset.basis,
        s61r = "http://localhost:8383",
        /*change my site in future*/s61y = "http://localhost:8383", s61url = location.pathname, s61hash = s61hashCode(s61url);
function s61f(e) {
    return document.querySelector(e);
}
function s61x() {
    s61w.style.display = "none";
}
function s61d(e, b) {
    e = e.classList;
    e.add("s61o");
    if (b) {
        e.remove("s61o")
    }
}
function s61Init() {
    var s61m = s61f("#s61m"), s61a = s61f("#s61a"), s61n = s61f("#s61n"), s61s = s61f("#s61s"), s61v = s61f("#s61v")// s61l = s61f("#s61l"),
            , s61vp = s61f("#s61v>span"), s61p = 1;
    var s61css = document.createElement("link");
    s61css.type = "text/css";
    s61css.rel = "stylesheet";
    s61css.href = s61b + "lib_assistant1.css";
    document.head.appendChild(s61css);
    var s61t1 = Number(s61ls.getItem("s61s")), s61t2 = Number(s61ls.getItem("s61d")), s61t3 = new Date() * 1;
    if ((s61t1 > 0 && s61t2 + 3000 > s61t3) || (s61t1 === -1 && s61t2 + (2 * 600) > s61t3) || (s61t1 === -2 && s61t2 + (24 * 600) > s61t3)) {
        console.log("if");
        s61cb(null, JSON.parse(s61ls.getItem("s61j")));
    } else {
        console.log("else");
        //*** this link is for test in future it's replaced with s61w.dataset.sid + .json
        fetch('/supporty_template_rtl/json/supporters.json').then(function (r) {
            //fetch('supporters.json').then(r => r.json()).then(j => s61cb(null, j)).catch(e => s61cb(e, null));
            return r.json();
        }).then(function (j) {
//            console.log("j", j);
            s61ls.setItem("s61d", s61t3);
            s61ls.setItem("s61j", JSON.stringify(j));
            s61ls.setItem("s61s", j.status);
            s61cb(null, j)
        }).catch(function (e) {
            s61cb(e, null)
        });
    }
    function s61cb(e, j) {
        console.log(s61cb.name, e, j, j.status);
        if (j && !e) {
            s61d(s61m, 1);
            if (j.status < 0) {
                s61d(s61a);
                s61d(s61v);
                s61s.textContent = (j.msg ? j.msg : (j.status === -2 ? "سرویس غیر فعال است" : "سرویس موقتا غیر فعال است"));
            } else {
                var l = j.list, c = s61Ran(0, l.length - 1);
                if (l.length > 0) {
                    s61q(l[c++]);
                    s61m.onmouseenter = s61m.onmouseleave = function (e) {
                        s61p = e.type === "mouseleave" ? 1 : 0;
                        console.log("mouse event : ", e, e.type, s61p);
                    };
                    s61m.onclick = function (e) {
                        console.log("s61mcc clicked");
                        window.open(s61f("#s61t").href, '_blank');
                    };
                    if (l.length > 1) {
                        setInterval(function () {
                            if (s61p) {
                                if (c >= l.length) {
                                    c = 0;
                                }
                                s61q(l[c++]);
                            }
                        }, 10000);
                    }
                }
            }
        } else {
            console.log("دیتا دریافت نشد");
        }
    }
    function s61q(r) {
        s61h();
        setTimeout(function () {
            s61h();
            if (r[0]) {
                s61s.textContent = r[4];
//                s61v.classList.remove("s61o");
                s61d(s61v, 1);
                s61vp.textContent = r[5] + " بیننده";
                s61m.style.background = "#cfff5a";
            } else {
                s61s.textContent = "الان لایو نیستم اینجا یک نگاه به ساعت برنامه هام بنداز";
//                s61v.classList.add("s61o");
                s61d(s61v, 1);
                s61m.style.background = "white";
            }
            s61m.dataset.i = r[1];
//            s61a.src = r[2];
            s61a.src = s61b + "pic_" + r[2] + ".jpg";
            s61n.textContent = r[3];
        }, 800);
    }
    function s61Ran(l, h) {
        l = Math.ceil(l);
        return Math.floor(Math.random() * (Math.floor(h) - l + 1)) + l;
    }
    function s61h() {
        s61m.classList.toggle('s61h')
    }
//    function b64EncodeUnicode(str) {
//        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
//            return String.fromCharCode('0x' + p1);
//        }))
//    }
    if (s61Valid) {
        var s61e = s61f("#s61e");
        s61d(s61e, 1);
        s61e.onclick = function () {
            console.log("s61ecc clicked");
            //*** change target url
//            var b64 = b64EncodeUnicode('{"link":"' + location.origin + location.pathname + '","hash":' + s61hash + ',"title":"' + s61ti + '","numid":' + s61numid + '}');
//            window.open('http://localhost:8383/supporty_template_rtl/motherpage_home.html?p=' + b64 + '#external_favorite',
//                    'addfav', 'height=500,width=500,status=no,menubar=no,toolbar=no');
            window.open('http://localhost:8383/supporty_template_rtl/motherpage_home.html?p=' + s61enc() + '#external_favorite',
                    'addfav', 'height=600,width=500,status=no,menubar=no,toolbar=no');
        }
    }
}

//*** for test
//var server2;
function s61SessionTracker(linkType) {
    if (s61Valid) {
        var t1 = new Date() * 1, t2, isPageVisited = false,
                totalDuration = 0, server, ms = t1 - 604800000/* 1 week */,
                pageId, intervalId;
        //https://github.com/aaronpowell/db.js
        db.open({
            server: 'supporty',
            version: 1,
            schema: {
                link: {key: {keyPath: 'hash'}},
                visit: {key: {keyPath: 'id', autoIncrement: true}},
                etc: {key: {keyPath: 'id'}}
            }
        }).then(function (s) {
            server = s;
//            server2 = s;
            server.link.update({
                hash: s61hash,
                url: s61url,
                img: s61im.src,
                title: s61ti
            });

            cleanDB();
            //*** just for test it's will be removed in production stage
            setTimeout(function () {
                getVisitStatistics(showArr);
            }, 3000);
            setIntervalPersistence(true);
        });
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

        function setIntervalPersistence(isStart) {
            if (isStart) {
                intervalId = setInterval(function () {
//                console.log(setIntervalPersistence.name, new Date());
                    setDuration();
                    persistNewVisit();
                }, 5100)//interval update current visit statistics
            } else if (intervalId) {
                clearInterval(intervalId);
                persistNewVisit();
            }
        }
        function persistNewVisit() {
            var ti = parseInt(totalDuration / 1000); //time in second not millisecond
//        console.log(persistNewVisit.name, ti);
            if (ti > 3) {//5 seconds is minimum valuable user visit that i could to count that handled by interval function
                var obj = {
                    hash: s61hash,
                    type: linkType, // type for defining link source { type of 1 : organic , type of 2 : profile}
                    date: new Date() * 1,
                    duration: ti
                }
                if (pageId) {
                    obj.id = pageId;
                    server.visit.update(obj);
                } else {
                    server.visit.add(obj).then(function (i) {
                        i = i[0];
                        pageId = i.id;
//                    console.log("this is persisted :", i.id, i.hash, i.type, i.date, i.duration)
                    });
                }
            }
        }
        function setDuration() {
            t2 = new Date() * 1;
            totalDuration += (t2 - t1);
            t1 = t2;
        }

        function cleanDB() {
//        console.log("cleanDB fnction ");
            server.etc.get(1).then(function (result) {
//            console.log("etc table:  ", result);
                if (!result) {
                    updateLastCleanDate();
                } else if (result.v1 < ms) {
                    server.visit.query().all().execute().then(function (result) {
                        result.forEach(function (item) {
                            console.log("cleanDB item: ", item);
                            if (item.date < ms) {
                                console.log("this item ^ is old and must be remove");
                                server.visit.remove(item.id);
                                console.log("item removed: ", item);
                            }
                        })
                    })
                    updateLastCleanDate();
                }
            })
        }
        function updateLastCleanDate() {
            console.log("updateLastCleanDate fnction ");
            server.etc.update({
                "id": 1,
                "v1": new Date() * 1
            })
        }
        function getVisitStatistics(callBack) {
            if (callBack) {
//            console.log(getVisitStatistics.name);
//            console.log(callBack.name);
                server.link.query().all().execute().then(function (result) {
                    var arr = [], len = 0;
                    result.forEach(function (item) {
//                    console.log(getVisitStatistics.name, "link", item);
                        server.visit.query().filter('hash', item.hash).execute()
//                                .catch(function () {
//                            len++;
//                            if (len >= result.length)
//                                callBack(arr)
//                        console.log(getVisitStatistics.name, " catch , len: ", len);
//                        })
                                .then(function (value) {
//                                    console.log(getVisitStatistics.name, "all hash values", "hash: " + item.hash, "values: ", value);
                                    var cOrganic = 0, dOrganic = 0, maxDOrganic = 0, cProfile = 0, dProfile = 0, maxDProfile = 0;
//                            var testCounter = 0;
                                    value.forEach(function (item) {
                                        if (item.date > ms) {
//                                    if (testCounter++ >= value.length - 2)
//                                            console.log(getVisitStatistics.name, "foreach value: ", item);
                                            if (item.type === s61linkTypeEnum.organic) {
                                                cOrganic++;
                                                dOrganic += item.duration;
                                                if (maxDOrganic < item.duration) {
                                                    maxDOrganic = item.duration;
                                                }
                                            } else if (item.type === s61linkTypeEnum.profile) {
                                                cProfile++;
                                                dProfile += item.duration;
                                                if (maxDProfile < item.duration) {
                                                    maxDProfile = item.duration;
                                                }
                                            }
                                        }
                                    })
                                    if ((cOrganic + cProfile) > 0) {
//[[url1,quantity of organic,organic total duration,organic maximum duration,quantity of profile,profile total duration,profile maximum duration,img src,title],[]]
                                        arr.push([item.hash, item.url, cOrganic, dOrganic, maxDOrganic, cProfile, dProfile, maxDProfile, item.img, item.title]);
                                    }
                                    len++;
//                        console.log(getVisitStatistics.name, " then , len: ", len);
                                    if (len >= result.length) {
                                        var obj = {"ver": s61Ver, "data": arr};
                                        callBack(obj)
                                    }
                                })
                    })
                }
                )
            }
        }
//*** just for test and show array members of getVisitStatistics() result
        function showArr(arr) {
            // [url,qty,duration]
            if (typeof arr == "object")
                arr = arr.data;
            arr.forEach(function (item, idx) {
                console.log(idx, item);
            })
        }
    }
}
function s61enc() {
    var str = '{"link":"' + location.origin + location.pathname + '","hash":' + s61hash + ',"title":"' + s61ti + '","img":"' + s61im.src + '","numid":' + s61numid + '}';
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (m, p1) {
        return String.fromCharCode('0x' + p1);
    }))

}
function s61hashCode(s) {
    s=s.toLowerCase();
    var h = 0, l = s.length, i = 0;
    if (l > 0)
        while (i < l) {
            h = (h << 5) - h + s.charCodeAt(i++) | 0;
        }
    return h;
}

//console.log("condition", s61self, s61top, s61w.dataset.basis, s61Valid, s61self === s61top, window.top.frames.length, window.self.frames.length);
//just to check is this library loaded in legal target site , this can to remove because admin could to change s61u by himself
//*** i will be delete true conditon
//var con = 3;
if (true || s61self === s61r) {
    //*** user is in live page and url of self and top related to target site
    var b1 = s61self === s61top && s61top === s61r;
    //*** user is in profile page and url of itself is related to target site and url of top related to supporty.com
    var b2 = s61self !== s61top && s61top === s61y;
    console.log("is top===self?", window.top === window.self, "b1 ", b1, " b2 ", b2, " s61self ", s61self, " s61top ", s61top, " s61r ", s61r, " s61y ", s61y, " s61top === s61y ", s61top === s61y);
    if (window.top !== window.self && (b1 || b2)) {// && window.top.frames.length > 0   con === 1 || 
        console.log("if condition was true");
        s61x();
        s61ch();
        if (b2) {
            s61SessionTracker(s61linkTypeEnum.profile);
            s61r = s61y;
        }
        function pm(e) {
            //*** i comment it because postmessage and receiver are in same origin and makes infinity message loop
            window.top.postMessage(e, s61r);
        }
        window.addEventListener('message', function (e) {
            console.log("lib_assistant message", "data: ", e.data, "origin: ", e.origin);
            if (e.origin === s61r) { //*** change origin url to my site
                e = e.data;
                //*** maybe not required because in any page load i send it immediately
                if (e.c === "url") {
                    pm({c: "url", isvalid: s61Valid, host: location.origin, path: location.pathname, title: s61ti, numid: s61numid, img: s61im.src, hash: s61hash, b64: s61enc()});
                } else if (e.c === "ga" && s61ga) {
//https://developers.google.com/analytics/devguides/collection/analyticsjs/cross-domain#iframes
                    ga('create', s61ga, 'auto', {clientId: e.gacid})
                }
            }
        });
        if (s61Valid) {
            pm({c: "url", isvalid: s61Valid, host: location.origin, path: location.pathname, title: s61ti, numid: s61numid, img: s61im.src, hash: s61hash, b64: s61enc()});
        } else {
            pm({c: "url", isvalid: s61Valid});
        }


    } else {
        //*** user is in target site without iframe
        s61SessionTracker(s61linkTypeEnum.organic);
        s61Init();
    }
    function s61ch() {
//        alert("s61ch");
        document.querySelectorAll("a").forEach(function (i) {
            i.setAttribute('target', '_self');
        });
    }
}
else {
//*** this library not used in proper target site
    console.log("library is read");
}
//})