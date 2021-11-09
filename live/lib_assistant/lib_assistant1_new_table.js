var s61linkTypeEnum = Object.freeze({"organic": 1, "profile": 2}), s61Ver = 1,
        s61w = s61f("#s61w"), s61im = s61f(s61w.dataset.i), s61ti = s61f(s61w.dataset.t),
        s61Valid = s61im && s61ti, s61ga = s61w.dataset.ga, s61u = s61w.dataset.url, s61ls = localStorage,
        /*change my site in future*/s61y = "http://daum.net:8383";
function s61f(e) {
    return document.querySelector(e);
}
function s61x() {
    s61w.style.display = "none";
}
function s61Init() {
    var s61m = s61f("#s61m"), s61a = s61f("#s61a"), s61n = s61f("#s61n"), s61s = s61f("#s61s"), s61v = s61f("#s61v")// s61l = s61f("#s61l"),
            , s61vp = s61f("#s61v>span"), s61t = s61f("#s61t"), s61p = 1;
    var s61css = document.createElement("link");
    s61css.type = "text/css";
    s61css.rel = "stylesheet";
    s61css.href = s61w.dataset.css;
    document.head.appendChild(s61css);
    if (Number(s61ls.getItem("s61d")) + 10000 > new Date().getTime()) {//180000
        s61cb(null, JSON.parse(s61ls.getItem("s61j")));
    } else {
        fetch('/supporty_template_rtl/json/supporters.json').then(function (r) {
            //fetch('supporters.json').then(r => r.json()).then(j => s61cb(null, j)).catch(e => s61cb(e, null));
            return r.json();
        }).then(function (j) {
//                console.log("j", j);
            s61ls.setItem("s61d", new Date().getTime());
            s61ls.setItem("s61j", JSON.stringify(j));
            s61cb(null, j)
        }).catch(function (e) {
            s61cb(e, null)
        });
    }
    function s61cb(e, j) {
//            console.log(e, j);
        if (j && !e) {
            s61m.classList.remove("s61o");
            var l = j.list, c = s61Ran(0, l.length - 1);
            s61q(l[c++]);
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
        } else {
            console.log("دیتایی دریافت نشده");
        }
    }
    function s61q(r) {
        s61h();
        setTimeout(function () {
            s61h();
            if (r[0]) {
//                s61l.classList.remove("s61o");
                s61s.textContent = r[4];
                s61v.classList.remove("s61o");
                s61vp.textContent = r[5] + " بیننده";
                s61m.style.background = "#cfff5a";
            } else {
//                s61l.classList.add("s61o");
                s61s.textContent = "الان لایو نیستم اینجا یک نگاه به ساعت برنامه هام بنداز";
                s61v.classList.add("s61o");
                s61m.style.background = "white";
            }
            s61m.dataset.i = r[1];
            s61a.src = r[2];
            s61n.textContent = r[3];
        }, 500);
    }
    function s61Ran(l, h) {
        l = Math.ceil(l);
        return Math.floor(Math.random() * (Math.floor(h) - l + 1)) + l;
    }
    function s61h() {
        s61m.classList.toggle('s61h')
    }
    s61Init.s61mcc = function () {
        console.log("s61mcc clicked");
        //*** change target site profile url and specialist ID
        window.open(s61t.href + "?kid=" + s61m.dataset.i, '_blank');
    }
    s61Init.s61mm = function (v) {
        console.log("s61mm mouse event");
        s61p = v;
    }
//    function s61mm(v) {
//        console.log("s61mm mouse event");
//        s61p = v;
//    }
    s61Init.s61ecc = function () {
        console.log("s61ecc clicked");
        //*** change target url
        window.open("http://daum.net:8383/supporty_template_rtl/save_favorite_item.html?site=" + location.host + "&path=" + location.pathname, '_blank');
    }
}
var server;
function s61SessionTracker(linkType) {
    if (s61Valid) {
        var t1 = new Date().getTime(), t2, isPageVisited = false,
                totalDuration = 0, ms = t1 - 604800000/* 1 week */,
                pageId, intervalId, url = location.pathname, hash = hashCode(url);
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
            server.link.update({
                hash: hash,
                url: url
            });

            cleanDB();
            //*** just for test it's will be removed in production stage
            setTimeout(function(){
                getVisitStatistics(showArr);            
            },3000);
            
        });
        document.addEventListener('visibilitychange', function () {
            if (isPageVisited) {
                if (document.visibilityState === 'hidden') {
                    setDuration();
                    setIntervalPersistence(false);

                } else if (document.visibilityState === 'visible') {
                    t1 = new Date().getTime();
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

        setIntervalPersistence(true);
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
                    hash: hash,
                    type: linkType, // type for defining link source { type of 1 : organic , type of 2 : profile}
                    date: new Date().getTime(),
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
            t2 = new Date().getTime();
            totalDuration += (t2 - t1);
            t1 = t2;
        }
        function hashCode(s) {
            s=s.toLowerCase();
            var h = 0, l = s.length, i = 0;
            if (l > 0)
                while (i < l) {
                    h = (h << 5) - h + s.charCodeAt(i++) | 0;
                }
            return h;
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
                "v1": new Date().getTime()
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
                        console.log(getVisitStatistics.name, "all hash values", "hash: " + item.hash, "values: ", value);
                            var cOrganic = 0, dOrganic = 0, maxDOrganic = 0, cProfile = 0, dProfile = 0, maxDProfile = 0;
//                            var testCounter = 0;
                            value.forEach(function (item) {
                                if (item.date > ms) {
//                                    if (testCounter++ >= value.length - 2)
                                    console.log(getVisitStatistics.name, "foreach value: ", item);
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
//[[url1,quantity of organic,organic total duration,organic maximum duration,quantity of profile,profile total duration,profile maximum duration],[]]
                                arr.push([item.hash, item.url, cOrganic, dOrganic, maxDOrganic, cProfile, dProfile, maxDProfile]);
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
                arr = arr.data
            arr.forEach(function (item, idx) {
                console.log(idx, item);
            })
        }
    }
}


if (window.self.location.origin === s61u) {//just to check is this library loaded in legal target site , this can to remove because admin could to change s61u by himself
    if (window.self === window.top && window.top.frames.length > 0) {
        //*** user is in live page and url of self and top related to target site
        s61x();
        s61ch();
    } else if (window.self !== window.top && window.top.frames.length > 0) {
        //*** user is in profile page and url of itself is related to target site and url of top related to supporty.com
        s61x();
        s61ch();
        function pm(e) {
            window.top.postMessage(e, s61y);
        }

        window.addEventListener('message', function (e) {
            console.log("lib_assistant message", "data: ", e.data, "origin: ", e.origin);
            if (e.origin === s61y) { //*** change origin url to my site
                e = e.data;
                //*** maybe not required because in any page load i send it immediately
                if (e.c === "url") {
                    pm({c: "url", isvalid: s61Valid, path: location.pathname, title: s61ti.textContent.trim()});
                } else if (e.c === "ga" && s61ga) {
//https://developers.google.com/analytics/devguides/collection/analyticsjs/cross-domain#iframes
                    ga('create', s61ga, 'auto', {clientId: e.gacid})
                }
            }
        });
        pm({c: "url", isvalid: s61Valid, "path": location.pathname, title: s61ti.textContent.trim()});
        s61SessionTracker(s61linkTypeEnum.profile);
    } else {
        //*** user is in target site without iframe
//        s61Init();
        s61SessionTracker(s61linkTypeEnum.organic);
        s61Init();
    }
    function s61ch() {
        document.querySelectorAll("a").forEach(function (i) {
            i.setAttribute('target', '_self');
        });
    }
}
else {
//*** this library not used in proper target site

}