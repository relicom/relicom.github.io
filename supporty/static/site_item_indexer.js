if (window.top === window.self) {
    var body = g('body'), LINK_LIMIT = 2, o = location.pathname/*"http://localhost:8383"*/,
            userId, siteId, token, titleSelector = "#titr", imgSelector = "#item-pic",
            fromLink = 0, toLink = 0, sendSeries = 0,
            storedLinks, itemCheckList = {}, linkObj = {}, linkArr = [], sitemapObj = {},
            selectorCheckLock = false, sendLock = false, linkLock = false, sitemapLock = false,
            sitemapTableBody = g("#sitemap_div .tbody"), linkTableBody = g("#link_table_parent .tbody"),
            linkCheckBt = g("#link_check_bt"), textareaDiv = g("#textarea_div"),
            linkArea = g("#link_area"), linkControlDiv = g("#link_control"),
            registerReport = g("#register_report"), reportDiv = g("#report"),
            linkAcceptBt = g("#link_accept_bt"), linkTableParent = g('#link_table_parent'),
            selectorCheckBt = g("#selector_check_bt"), sendBt = g("#send_bt"),
            txtArea = TLN.append_line_numbers('link_area'),
            sitemapFile = g("#sitemap_file"), sitemapDiv = g('#sitemap_div'),
            sitemapTable = g("#sitemap_table"), sitemapLinkListBt = g("#sitemap_link_list_bt"),
            sitemapLinkCheckBt = g("#sitemap_link_check_bt"), sitemapUrl = g("#sitemap_url"),
            filterElem = document.querySelectorAll(".filter"), linkFilterBt = g('#link_filter_bt'),
            sitemapCtrClass = document.querySelectorAll(".sitemap_ctr"), exitBt = g("#exit_bt"),
            sitemapControlDiv = g("#sitemap_control"), nextBt = g("#next_check_bt");

    function getUrl(url) {
        try {
            return new URL(url);
        } catch (e) {
            return null;
        }
    }
    function g(e) {
        return document.querySelector(e);
    }
    function hide(e, b) {
        if (e.length > 1) {
            e.forEach(function (d) {
                hide(d, b);
            })
        } else {
            if (b) {
                e.classList.add("hide");
            } else {
                e.classList.remove("hide");
            }
        }
    }
    function report(pm, isInf, isClean) {
        if (isClean) {
            reportDiv.innerHTML = "";
        }
        if (pm) {
            reportDiv.insertAdjacentHTML("afterbegin", "<p class='" + (isInf ? "inf" : "err") + "'>" + pm + "</p>");
            body.style.background = "yellow";
            setTimeout(function () {
                body.style.background = "white";
            }, 500);
        }
    }
    function refreshTextArea() {
        TLN.update_line_numbers(txtArea[0], txtArea[1]);
    }
    linkCheckBt.onclick = function () {
        checkLinks(0)
    }
    function checkLinks(filter) {
        hide(linkAcceptBt, 1);
        if (!linkLock) {
            linkLock = true;
            linkArea.readOnly = true;
            report(0, 0, 1);
            document.querySelectorAll(".tln-line").forEach(function (e) {
                e.classList.remove("link_error")
            });
            linkArr = linkArea.value.split("\n");
            var l = 0, u, b = true, a = "";
            for (var e = 0; e < linkArr.length; e++) {
                linkArr[e] = linkArr[e].trim();
                if (linkArr[e].length < 10 || !linkArr[e].startsWith('http')) {
                    report("لینک شماره " + (e + 1) + " با محتوای \"" + linkArr[e] + " \" چون ساختار آدرس درستی نداشت حذف شد");
                    linkArr.splice(e, 1);
                    e--;
                }
                if (filter && !linkArr[e].includes(filter)) {
                    linkArr.splice(e, 1);
                    e--;
                    l++;
                }
            }
            if (filter) {
                report("تعداد " + l + " لینک توسط کلمه مشخص شده شما فیلتر شد و تعداد کل لینک ها به " + linkArr.length + " عدد رسید", 1);
            }
            l = linkArr.length - 1;
            linkArea.value = "";
            if (linkArr.length < 1) {
                b = false;
                linkErrFn("شما هنوز هیچ لینکی را وارد نکرده اید");
            }
            linkArr.forEach(function (e, i) {
                e = decodeURIComponent(e);
                linkArr[i] = e;
                u = hashCode(e);
                if (!e.startsWith(o)) {
                    b = false;
                    linkErrFn(" با" + o + " شروع نشده است و ناشناخته است", i);
                } else if (e.length > 256) {
                    b = false;
                    linkErrFn(" آدرسش بسیار طولانی است حداکثر طول آدرس باید 256 حرف باشد", i);
                } else if (e.includes(" ")) {
                    b = false;
                    linkErrFn(" در خود فاصله دارد که غیر مجاز است", i);
                } else if (e.split("://").length > 2) {
                    b = false;
                    linkErrFn(" احتمالا بیشتر از یک لینک قرار دادید و باید هر خط تنهای یک لینک قرار گرفته باشد", i);
                } else if ((u = getUrl(e)) === null) {
                    b = false;
                    linkErrFn(" ساختار آدرسش صحیح نیست", i);
                } else if (u.hash) {
                    b = false;
                    linkErrFn(" دارای پارامتر hash است که مجاز نیست", i);
                } else if (u.search) {
                    b = false;
                    linkErrFn(" دارای پارامتر query است که مجاز نیست", i);
                } else if ((u = hashCode(u.pathname)) !== null && storedLinks.find(function (d) {
                    return d === u;
                })) {
                    b = false;
                    linkErrFn(" قبلا در سیستم ثبت شده و موجود است", i);
                }
                if (i !== l) {
                    e += '\n';
                }
                a += e;
            });
            linkArea.value = a;
            refreshTextArea();
            for (u = 0; u < linkArr.length; u++) {
                e = linkArr[u];
                for (var v = u + 1; v < linkArr.length; v++) {
                    if (e === linkArr[v]) {
                        b = false;
                        linkErrFn(" با لینک شماره " + (u + 1) + "یکسان است و بصورت تکراری وارد شده ", v);
                    }
                }
            }
            if (b) {
                if (linkArr.length > LINK_LIMIT) {
                    report('در هر بار درخواست ثبت ،تعداد ' + LINK_LIMIT + ' لینک برای ثبت ارسال میشود و چون تعداد لینک ها ' + linkArr.length + ' عدد است لینک ها در ' + (Math.ceil(linkArr.length / LINK_LIMIT)) + ' نوبت با نظارت شما بررسی و بعد ثبت خواهد شد', 1);
                }
                report('بنظر میاد همه چیز درسته بریم برای مرحله بعدی ؟ هر وقت آماده ای بزن بریم', 1);
                hide(linkAcceptBt, 0);
                hide(linkCheckBt, 1);
                hide(filterElem, 0);
            } else {
                linkArea.readOnly = false;
                report('لطفا خطاهای موجود را بررسی کنید');
            }
            linkLock = false;
        } else {
            report('لیست لینک ها داره بررسی میشه کمی صبر کنید تا عملیات تمام شود', 1, 0);
        }
    }
    linkFilterBt.onclick = function () {
        var filterStr = g('#link_filter_input').value.trim();
        if (filterStr.length > 0) {
            checkLinks(filterStr);
        } else {
            report("هیچ عبارتی برای فیلتر دریافت نشد ابتدا عبارت مشترک برای صفحات محصول را وارد کنید");
        }
    }
    function linkErrFn(t, i) {
        if (i !== undefined && i > -1) {
            i++;
            t = "لینک شماره " + (i) + t;
            g(".tln-line:nth-child(" + i + ")").classList.add("link_error");
        }
        report(t);
    }
    linkAcceptBt.onclick = function () {
        linkArea.value = "";
        report(0, 0, 1);
        hide(textareaDiv, 1);
        hide(linkControlDiv, 1);
        hide(filterElem, 1);
        var h, s;
        linkArr.forEach(function (e, i) {
            i++;
            e = new URL(e).pathname;
            h = hashCode(e);
            s = 1;
            linkObj["idx" + i] = {idx: i, link: e, hash: h, state: 1};
        });
        setLinkTableBody();
    }
    nextBt.onclick = function () {
        sendSeries++;
        setLinkTableBody();
    }
    function setLinkTableBody(isReadyForNextRange) {
        hide(linkTableParent, 0);
        hide(sendBt, 1);
        hide(nextBt, 1);
        linkTableBody.innerHTML = "";
        var z, l, t = "", e, err = 0, inspectReady = 0, registerReady = 0, arr = Object.keys(linkObj);
        if (isReadyForNextRange) {
            hide(nextBt, 0);
        }
        z = sendSeries * LINK_LIMIT;
        l = z + LINK_LIMIT;
        if (l > arr.length) {
            l = arr.length;
        }
        fromLink = z;
        toLink = l;
        t = "سری " + (sendSeries + 1) + " از لینک ها و " + Math.ceil((arr.length - l) / LINK_LIMIT) + " سری باقی مانده ";
        if (z >= arr.length) {
            t = "تبریک لینک صفحه محصول دیگری باقی نمانده"
        }
        registerReport.textContent = t;
        for (; z < l; z++) {
            e = linkObj[arr[z]];
            if (e.state < 0) {
                err++;
                report("در ایتم " + e.idx + " خطای : \" " + getLinkState(e.state) + " \" دریافت شد لطفا آنرا بررسی کنید");
            } else if (e.state === 1) {
                inspectReady++;
            } else if (e.state === 2) {
                registerReady++;
            }
            linkTableBody.insertAdjacentHTML("beforeend",
                    "<tr data-idx='" + e.idx + "' class='" + (e.state < 0 ? "bg_red" : "state" + e.state) + "'>" +
                    "<td class='fix_column'>" + e.idx + "</td>" +
                    "<td>" + getLinkState(e.state) + "</td>" +
                    "<td><a class='long_content' href='" + e.link + "' target='_blank'>" + (e.title ? e.title : e.link) + "</a></td>" +
                    "<td>" + (e.img ? "<img loading='lazy' src='" + e.img + "'>" : "") + "</td>" +
                    "<td>" +
                    ([3, 4].includes(e.state) ? "" :
                            "<span title='بررسی دوباره' class='button_ctr bgpurple' onclick='refreshIdx(this)'>بررسی دوباره</span>" +
                            "<span title='حذف این آیتم' class='button_ctr bgred' onclick='removeIdx(this)'>حذف</span>") +
                    "</td>" +
                    "</tr>")
        }
        if (err > 0) {
            report("لطفا خطاهای موجود را بررسی کنید");
            hide(selectorCheckBt, 0);
        } else if (inspectReady > 0) {
            report("تعداد " + inspectReady + " لینک آماده بررسی هستند", 1, 0);
            hide(selectorCheckBt, 0);
        } else if (registerReady > 0) {
            report("تعداد " + registerReady + " لینک آماده ثبت هستند", 1, 0);
            hide(selectorCheckBt, 1);
            hide(sendBt, 0);
        } else if (z >= arr.length) {
            report("بررسی و ثبت کلیه لینک ها به اتمام رسید اگر ثبت صفحه محصول دیگری ندارید حتما برای موارد امنیتی با استفاده از گزینه خروج از این صفحه خارج شوید");
            hide(selectorCheckBt, 1);
            hide(sendBt, 1);
            hide(linkTableParent, 1);
            hide(nextBt, 1);
            hide(exitBt, 0);
        }
        selectorCheckLock = false;
    }
    selectorCheckBt.onclick = function () {
        if (!selectorCheckLock) {
            selectorCheckLock = true;
            report("رفتیم برای بررسی عنوان و عکس اصلی صفحات، لطفا صبور باش یکمی طول میکشه تا بررسی تمام شود", 1, 1);
            hide(selectorCheckBt, 1);
            var arr = Object.keys(linkObj);
            itemCheckList = {};
            var z = fromLink, q;
            for (; z < toLink; z++) {
                q = arr[z];
                if (![2, 3, 4, -8].includes(linkObj[q].state)) {
                    itemCheckList[q] = 0;
                    checkIdx(q);
                }
            }
        } else {
            report("در حال بررسی لینک ها برای بررسی عنوان ها و عکس های صفحات محصول میباشد لطفا تا پایان عملیات صبر کنید", 1, 0);
        }
    }
    function checkDuplicateObj(idx, property) {
        var dup = [], o = linkObj[idx];
        if (idx && property && o) {
            Object.keys(linkObj).forEach(function (e) {
                if (e !== idx && linkObj[e][property] === o[property]) {
                    dup.push(e);
                }
            })
        }
        return dup;
    }
    function itemCheckListFn(q, state) {
        itemCheckList[q] = state;
        var arr = Object.keys(itemCheckList), notTested = 0;
        arr.forEach(function (e) {
            if (itemCheckList[e] === 0) {
                notTested++;
            }
        });
        report("تعداد " + (arr.length - notTested) + " لینک بررسی شده اند و تعداد " + notTested + " باقی مانده است", 1, 1);
        if (notTested === 0) {
            setLinkTableBody();
        }
    }
    function checkIdx(q) {
        var x, h, t, i, e;
        e = linkObj[q];
        x = checkDuplicateObj(q, "hash");
        if (x && x.length > 0) {
            linkObj[q].state = -6;
            x.forEach(function (e) {
                linkObj[e].state = -6;
            });
            itemCheckListFn(q, -1);
        } else {
            try {
                x = new XMLHttpRequest();
                x.onreadystatechange = function () {
                    if (x.readyState === 4 && x.status !== 200) {
                        linkObj[q].state = -7;
                        x = null;
                        itemCheckListFn(q, -1);
                    }
                }
                x.onerror = function () {
                    linkObj[q].state = -7;
                    x = null;
                    itemCheckListFn(q, -1);
                }
                x.open('GET', e.link, false);
                x.send();
            } catch (r) {
                linkObj[q].state = -7;
                x = null;
                itemCheckListFn(q, -1);
            }
            if (x && x.response) {
                x = x.response
                        .replaceAll(/src *= *"/gim, "src=\"NOT")
                        .replaceAll(/src *= *'/gim, "src=\'NOT")
                        .replaceAll(/href *= *"/gim, "href=\"NOT")
                        .replaceAll(/href *= *'/gim, "href=\'NOT");
                h = document.createElement("html");
                h.innerHTML = x;
                t = h.querySelector(titleSelector);
                i = h.querySelector(imgSelector);
                if (!t) {
                    linkObj[q].state = -1;
                    itemCheckListFn(q, -1);
                } else if ((t = t.textContent.trim()).length < 2) {
                    linkObj[q].state = -2;
                    itemCheckListFn(q, -1);
                } else if (!i) {
                    linkObj[q].state = -3;
                    itemCheckListFn(q, -1);
                } else {
                    i = i.getAttribute("src").substring(3);
                    if (!i.toLowerCase().startsWith("http")) {
                        i = new URL(i, o + e.link.substring(0, e.link.lastIndexOf("/") + 1)).href;
                    }
                    h = document.createElement("img");
                    h.onload = function () {
                        if (h.complete && h.naturalWidth > 0) {
                            linkObj[q].state = 2;
                            linkObj[q].title = t;
                            linkObj[q].img = i;
                            itemCheckListFn(q, 1);
                        } else {
                            linkObj[q].state = -4;
                            linkObj[q].img = null;
                            itemCheckListFn(q, -1);
                        }
                    }
                    h.onerror = function () {
                        linkObj[q].state = -5;
                        linkObj[q].img = null;
                        itemCheckListFn(q, -1);
                    }
                    h.src = i;
                }
            } else {
                itemCheckListFn(q, -1);
            }
        }
    }
    function removeIdx(e) {
        if (!sendLock) {
            var idx = e.closest("tr").dataset.idx;
            delete linkObj['idx' + idx];
            report("ایتم شماره " + idx + " حذف شد", 1, 0);
            setLinkTableBody();
        } else {
            report('درخواست ثبت ارسال شده لطفا صبر کنید تا جواب ثبت لینک ها دریافت شود', 1, 0);
        }
    }
    function refreshIdx(e) {
        if (!selectorCheckLock) {
            if (!sendLock) {
                var i = e.closest("tr").dataset.idx, idx = 'idx' + i;
                itemCheckList = {};
                itemCheckList[idx] = 0;
                report("ایتم شماره " + i + " دوباره برای بررسی ارسال شد", 1, 0);
                checkIdx(idx);
            } else {
                report('درخواست ثبت ارسال شده لطفا صبر کنید تا جواب ثبت لینک ها دریافت شود', 1, 0);
            }
        } else {
            report("در حال بررسی لینک ها برای بررسی عنوان ها و عکس های صفحات محصول میباشد لطفا تا پایان عملیات صبر کنید", 1, 0);
        }
    }
    function b64EncodeUnicode(str) {
        try {
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (m, p) {
                return String.fromCharCode('0x' + p)
            }))
        } catch (e) {
            return null
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
    sendBt.onclick = function () {
        sendLock = true;
        var z, array = [], q, arr = Object.keys(linkObj);
        z = fromLink;
        for (; z < toLink; z++) {
            q = linkObj[arr[z]];
            if (q.state === 2) {
                array.push([q.idx, q.title, q.link, q.hash, q.img])
            }
        }

        var req = {key: token, siteid: siteId, data: b64EncodeUnicode(JSON.stringify(array))};
        hide(sendBt, 1);
        report("تا الان از " + arr.length + " لینک تعداد " + z + " لینک برای ثبت اقدام شده و تعداد " + (arr.length - z) + " لینک باقی مانده است تا رسیدن نتیجه ثبت منتظر باشید", 1, 1);
        console.log("send request: ", req);
    }
//*** this array (chArr) is used for checking registration state from server ,and just for test
    var chArr1 = [[1, 3], [2, 4]];
    var chArr2 = [[3, 4], [4, 3]];
    var chArr3 = [[5, 3]];
    function checkRegistrationState(arr) {
        if (arr && arr.length > 0) {
            arr.forEach(function (e) {
                linkObj["idx" + e[0]].state = e[1];
            });
            setLinkTableBody(1);
            sendLock = false;
        }
    }
    function getLinkState(s) {
        switch (s) {
            case 4:
                return "اینکه قبلا ثبت شده بود!";
            case 3:
                return "این لینک ثبت شد";
            case 2:
                return "آماده برای ثبت";
            case 1:
                return "آماده بررسی";
            case -1:
                return "تگ عنوان ندارد";
            case -2:
                return "عنوان خالی است";
            case -3:
                return "تگ عکس ندارد";
            case -4:
                return "عکس محتوا ندارد";
            case -5:
                return "عکس لود نمیشود";
            case -6:
                return "آیتم تکراری است";
            case -7:
                return "لینک باز نشد";
            case -8:
                return "این لینک قبلا ثبت شده";
        }
    }
    g("#new_bt").onclick = reset;
    function reset() {
        if (selectorCheckLock) {
            report("در حال بررسی لینک ها برای بررسی عنوان ها و عکس های صفحات محصول میباشد لطفا تا پایان عملیات صبر کنید", 1, 0);
        } else if (linkLock) {
            report('لیست لینک ها داره بررسی میشه کمی صبر کنید تا عملیات تمام شود', 1, 0);
        } else if (sendLock) {
            report('درخواست ثبت ارسال شده لطفا صبر کنید تا جواب ثبت لینک ها دریافت شود', 1, 0);
        } else {
            report(0, 0, 1);

            storedLinks = null;
            linkArr = [];
            itemCheckList = {};
            linkObj = {};
            sitemapObj = {};

            fromLink = 0;
            toLink = 0;
            sendSeries = 0;

            sitemapLock = false;
            linkLock = false;
            selectorCheckLock = false;
            sendLock = false;

            hide(linkTableParent, 1);
            hide(textareaDiv, 1);
            hide(linkControlDiv, 1);
            hide(linkAcceptBt, 1);
            hide(sitemapLinkListBt, 1);
            hide(linkCheckBt, 1);
            hide(sitemapDiv, 1);
            hide(sitemapCtrClass, 0);
            hide(exitBt, 1);

            linkTableBody.innerHTML = "";
            sitemapTableBody.innerHTML = "";
//        *** for test i need inside links
//        linkArea.value = "";
            sitemapFile.value = "";
        }
    }
    function init() {
        var isDataOk = true;
        var search = location.search;
        if (search.length < 20) {
            isDataOk = false;
            console.log("isDateOk1 : ",isDataOk,search);
        } else {
            search = new URLSearchParams(search);
            if (!search) {
                isDataOk = false;
                console.log("isDateOk2 : ",isDataOk,search);
            } else {
                siteId = search.get("siteid");
                userId = search.get("userid");
                token = search.get("token");
//                    console.log("isDateOk4 : ",userId,siteId,token);
                if (siteId && userId && token) {
                    var xhr = new XMLHttpRequest();
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            if (xhr.status === 200) {
//                                var res = JSON.parse(xhr.responseText);
                                responseCallback(xhr.responseText);
                            } else {
                                report("متاسفانه نتوانستیم اطلاعات مورد نظر را دریافت کنیم، بررسی کنید که آیا شما ادمین سایت هستید و ورود به این صفحه از طریق داشبورد و منوی \"سایت های من\" بوده است ؟ آیا اینترنت شما مشکلی ندارد و میتوانید سایت ها را مشاهده کنید ؟ اگر بررسی شما نتیجه ای نداشت با پشتیبانی در میان بزارید تا کمک کنیم ", 0, 1);
                            }
                        }
                    }
                    xhr.open("POST", "http://qwer/link/check_token", true);
                    xhr.setRequestHeader('Content-type', 'application/json');
                    xhr.send(JSON.stringify({userId:userId,siteId:siteId,token: token}));
                } else {
                    isDataOk = false;
                    console.log("isDateOk3 : ",isDataOk);
                }
            }
        }
        if (!isDataOk) {
            report("اطلاعات صحیح نمیباشد اگر مدیر این سایت هستید لطفا از طریق پنل کاربری خود بخش مدیریت صفحات محصول از طریق لینکی که برای ورود ساخته میشود اقدام به ورود کنید", 0, 1);
        }
    }
    sitemapLinkCheckBt.onclick = function () {
        var u = sitemapUrl.value.trim();
        if (u.length > 0) {
            if (u.length > 10 && u.startsWith('http') && u.endsWith(".xml")) {
                sitemapObj = {};
                sitemapUrlCheck(u, 0);
            } else {
                report("آدرس سایت مپ قابل قبول نبود، سایت مپ باید با ادرس سایت شما شروع شود و دارای پسوند xml باشد", 0, 1);
            }
        } else if (sitemapFile.files.length > 0) {
            sitemapObj = {};
            sitemapFileCheck();
        } else {
            report("نه از طریق لینک و نه از طریق فایل ما هنوز اطلاعات سایت مپ را وارد نکرده اید")
        }
    }
    function sitemapUrlCheck(url, idx, isLast) {
        if (url.startsWith(o)) {
            report(0, 0, 1);
            var x, e;
            try {
                x = new XMLHttpRequest();
                x.onreadystatechange = function () {
                    if (x.readyState === 4 && x.status === 200) {
                        if (idx === 0) {
                            e = x.responseXML;
                            if (e.documentElement.nodeName === "sitemapindex") {
                                checkMainSitemap(e.getElementsByTagName("sitemapindex"));
                            } else if (e.documentElement.nodeName === "urlset") {
                                checkSitemapLinks(idx, url, x.response);
                            } else {
                                report("لینک سایت مپی که وارد کردید نه سایت مپ اصلی است و نه لینک صفحات سایت شما در آن قرار دارد لطفا محتوای سایت مپ به آدرس \"" + url + " \"که ارسال کردید را بررسی کنید")
                            }
                        } else {
                            checkSitemapLinks(idx, url, x.response);
                            if (isLast) {
                                setSitemapTableBody();
                            }
                        }
                    }
                }
                x.onerror = function () {
                    report("لینک سایت مپی که وارد کردید احتمالا درست نمیباشد لطفا محتوای سایت مپ به آدرس \"" + url + " \"که ارسال کردید را بررسی کنید")
                }
                x.open('GET', url, false);
                x.send();
            } catch (r) {
                report("لینک سایت مپی که وارد کردید احتمالا درست نمیباشد لطفا محتوای سایت مپ به آدرس \"" + url + " \"که ارسال کردید را بررسی کنید")
            }
        } else {
            report("لینک سایت مپی که وارد کردید باید با آدرس سایت شما \"" + o + " \"مطابقت داشته باشد")
        }
    }
    function checkMainSitemap(e) {
        e = e[0].getElementsByTagName("sitemap");
        var u;
        if (e.length > 0) {
            sitemapLock = false;
            for (var i = 0; i < e.length; i++) {
                u = e[i].getElementsByTagName("loc")[0].textContent;
                sitemapUrlCheck(u, i, i === e.length - 1);
            }
        } else {
            report("سایت مپ اصلی دارای هیچ سایت مپ داخلی نیست");
        }
    }
    function sitemapFileCheck() {
        if (!sitemapLock) {
            sitemapObj = {};
            report(0, 0, 1);
            sitemapLock = true;
            var f, fArr = sitemapFile.files, l = fArr.length, b = l > 0;
            for (var h = 0; h < l; h++) {
                f = fArr[h];
                if (!f.name.endsWith(".xml")) {
                    b = false;
                    report("فایل " + f.name + " از نوع xml نیست");
                }
            }
            if (!b) {
                report("ابتدا خطاهای مربوط به فایل را برطرف کن تا ادامه اش رو بریم");
                sitemapLock = false;
            } else {
                var fr = new FileReader(), c = 0, sitemapLink = fArr[c++];
                fr.onload = function () {
                    checkSitemapLinks(c - 1, sitemapLink.name, fr.result);
                    if (c < l) {
                        sitemapLink = fArr[c++];
                        fr.readAsText(sitemapLink);
                    } else {
                        setSitemapTableBody();
                    }
                }
                fr.readAsText(sitemapLink);
            }
        }
    }
    function checkSitemapLinks(i, sitemapLink, xmlTxt) {
        i++;
        var xml = new DOMParser(), e, arr = [], state = 1;
        xml = xml.parseFromString(xmlTxt, "text/xml");
        if (xml.documentElement.nodeName === "html") {
            state = -1;
        } else {
            xml = xml.getElementsByTagName("urlset");
            if (xml.length < 1) {
                state = -1
            } else {
                xml = xml[0].children;
                for (var j = 0; j < xml.length; j++) {
                    if (xml[j].nodeName === "url") {
                        e = xml[j].getElementsByTagName('loc');
                        if (e.length < 1) {
                            state = -1;
                            break;
                        } else {
                            e = e[0].textContent.trim();
                            if (e.startsWith(o)) {
                                arr.push(e);
                            } else {
                                state = -2;
                                break;
                            }
                        }
                    } else {
                        state = -1;
                        break;
                    }
                }
            }
        }
        sitemapObj["idx" + i] = {idx: i, state: state, link: sitemapLink, qty: arr.length, arr: arr};
    }
    function removeSitemap(e) {
        if (!sitemapLock) {
            var idx = e.closest("tr").dataset.idx;
            delete sitemapObj['idx' + idx];
            report("سایت مپ شماره " + idx + " حذف شد", 1, 1);
            setSitemapTableBody();
        } else {
            report('صبر کنید تا محتوا سایت مپ ها بررسی شوند', 1, 0);
        }
    }
    function setSitemapTableBody() {
        hide(sitemapDiv, 0);
        hide(sitemapTable, 0);
        hide(sitemapLinkListBt, 1);
        hide(sitemapCtrClass, 1);
        sitemapTableBody.innerHTML = "";
//{"idx1":{idx:1,state:2,link:"https",qty:1312}}
        var e, err = 0, inspectReady = 0, arr = Object.keys(sitemapObj);
        arr.forEach(function (q) {
            e = sitemapObj[q];
            if (e.state < 0) {
                err++;
                report("در فایل سایت مپ شماره " + e.idx + " خطای : \" " + getSitemapState(e.state) + " \" دریافت شد لطفا آنرا بررسی کنید");
            } else if (e.state === 1) {
                inspectReady++;
            }
            sitemapTableBody.insertAdjacentHTML("beforeend",
                    "<tr data-idx='" + e.idx + "' class='" + (e.state < 0 ? "bg_red" : "") + "'>" +
                    "<td>" + e.idx + "</td>" +
                    "<td>" + getSitemapState(e.state) + "</td>" +
                    "<td><span class='long_content ltr' title='" + e.link + "'>" + e.link + "</span></td>" +
                    "<td>" + e.qty + "</td>" +
                    "<td><span class='button_ctr bgred' onclick='removeSitemap(this)'>حذف</span></td>" +
                    "</tr>");
        });
        if (err > 0) {
            report("لطفا خطاهای موجود را بررسی کنید");
        } else if (inspectReady > 0) {
            report("تعداد " + inspectReady + " سایت مپ آماده بررسی هستند", 1, 0);
            hide(sitemapLinkListBt, 0);
        }
        sitemapLock = false;
    }
    function getSitemapState(s) {
        switch (s) {
            case 2:
                return "قابل قبول";
            case 1:
                return "دریافت شده";
            case -1:
                return "فایل ساختار سایت مپ ندارد";
            case -2:
                return "لینک غیر مرتبط با سایت شما دارد";
        }
    }
    sitemapLinkListBt.onclick = function () {
        hide(sitemapDiv, 1);
        hide(textareaDiv, 0);
        hide(linkControlDiv, 0);
        hide(linkCheckBt, 0);
        hide(sitemapLinkListBt, 1);
        report(0, 0, 1);
        var r = "", arr = Object.keys(sitemapObj), arr2, l;
        arr.forEach(function (e) {
            e = sitemapObj[e];
            arr2 = e.arr;
            l = arr2.length - 1;
            arr2.forEach(function (w, i) {
                r += w + '\n';
            })
        });
        linkArea.value = r;
        refreshTextArea();
    }
    g("#sitemap_ignore_bt").onclick = function () {
        hide(sitemapDiv, 1);
        hide(textareaDiv, 0);
        hide(linkControlDiv, 0);
        hide(linkCheckBt, 0);
        hide(sitemapLinkListBt, 1);
        hide(sitemapCtrClass, 1);
    }
    exitBt.onclick = function () {
        console.log("EXXXXXXXXXXXXXXXIIIIIIIIIIIIIIIIIIIIIIIITTTTTTTTTTTTTTTTTT");
        //*** send request of exit of this page, token must be destroyed and not valid anymore
        window.location.href = "http://go-to-home-page/"
    }
    function setExistLinkList(param) {
        reset();
        storedLinks = param.linklist;
        if (storedLinks) {
            hide(sitemapControlDiv, 0);
        }
    }
    function callFunction(funcName, param) {
        if (typeof window[funcName] === "function") {
            window[funcName](param);
        }
    }
    function responseCallback(data) {
        try {
            if (data) {
                if (typeof data != "object") {
                    data = JSON.parse(data);
                }
                if (data.msg) {
                    if (data.status == 1) {
                        report(data.msg, 1, 0);
                    } else {
                        report(data.msg, 0, 0);
                    }
                }
                if (data.param) {
                    console.log("reponseCallback data.param: ", data.param);
                    data.param = JSON.parse(data.param);
                    data.param.forEach(function (i) {
                        console.log("reponseCallback func: ", i.func, " item: ", i);
                        callFunction(i.func, i);
                    })
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    init();
} else {
    document.querySelector("html").innerHTML = "";
}
