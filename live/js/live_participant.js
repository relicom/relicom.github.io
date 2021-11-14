if (window.top === window.self) {
//    document.addEventListener('DOMContentLoaded', function () {
//    
//===============================================general section===============================================

    var hide = "hide", mHide = "m_hide", modal = g("#modal_div"),
            message_input_js = g("#message"),
            textDiv = g("#text_div"), talkNumberDiv = g("#talk_number"),
            addRemoveTalkBt = g("#add_remove_request_bt"),
            iframe = g("#iframe"), chatSub2 = g("#chat_sub2"), isChatShow = true,
            mobilePmBt = g("#mobile_pm_bt"), mobilePmTxt = g("span", mobilePmBt),
            mobilePmIcon = g("i", mobilePmBt), mobilePmQty = 0, chatDiv = g(".chat_div"),
            iframeDiv = g(".iframe_div"), lockAutoOpenOffers = false,
            amICustomer = true, offerBt = g("#offer_bt"), offer = {}, msgLock = 0,
            msgLockTimeOut, myMsgForAck,
            pmDiv = g(".pm_div"), currentMyMsg, customerVideo = g("#customer_video"),
            viewerCount = g("#viewer_count"), maxPmQty = 100,
            productFavoriteBt = g("#product_favorite_bt"), productFavoritePrefix = "S61F";

    message_input_js.focus();

    g("#close_live_bt").onclick = function () {
        var j = {title: ' آیا میخواهید از اتاق خارج شوید؟'};
        j.control = '<span id="close_live_page" class="button_ctr2 bg-css-red bt"><i class="fas fa-walking"></i> بله صفحه لایو را میبندم</span>';
        showDialog(j);
        g("#close_live_page").onclick = function () {
            console.log("openProfile", new Date());
            //*** redirect current page to site supporty profile
            window.location = "/supporty_template_rtl/motherpage_home.html#profile_site";
        }
    }
    g("#close_customer_bt").onclick = function () {
        if (talkObj.isTalkRightNow) {
            var j = {title: ' میخواهید به گفتگو خاتمه دهید ؟'};
            j.control = '<span id="close_customer_live" class="button_ctr2 bg-css-red bt"><i class="fas fa-walking"></i> بله گفتگو را میبندم</span>';
            showDialog(j);
            g("#close_customer_live").onclick = function () {
                setEndTalk();
                closeDialog();
            }
        } else {
            toast.info("اکنون در حال گفتگو با کارشناس مشاور نیستید");
        }
    }
    g("#min_max_bt").onclick = function () {
        var isFullScreen = toggleFullScreen();
        var e = g("i", this);
        if (isFullScreen) {
            e.classList.remove("fa-expand");
            e.classList.add("fa-compress");
        } else {
            e.classList.remove("fa-compress");
            e.classList.add("fa-expand");
        }
    }
    productFavoriteBt.onclick = function () {
        try {
            if (offer && offer.hash) {
                var favs = localStorage.getItem(productFavoritePrefix + offer.hash);
                if (favs) {
                    toast.info("قبلا " + offer.title + " اضافه شده");
                } else {
                    var j = {hash: offer.hash, path: offer.path, title: offer.title, img: offer.img, time: new Date() * 1};
                    localStorage.setItem(productFavoritePrefix + offer.hash, JSON.stringify(j));
                    toast.success(offer.title + " به لیست منتخب اضافه شد");
                }
            }
        } catch (e) {
            console.error(e);
            toast.error("اضافه شدن این محصول به لیست منتخب شما به مشکل خورد!!");
        }
    }
    offerBt.onclick = function () {
        if (!msgLock && offer) {
            message_input_js.insertAdjacentHTML("beforeend", "<img src='" + offer.img + "' data-title='" + offer.title + "' data-link='" + offer.host + offer.path + "'>");
            setCursorToEnd(message_input_js);
        }
    }
    mobilePmBt.onclick = function () {
        if (isChatShow) {
            isChatShow = false;
            mobilePmIcon.classList.remove("fa-window-minimize");
            mobilePmIcon.classList.add("fa-window-maximize");
            chatSub2.classList.add(mHide);
            mobilePmTxt.classList.remove(hide);
            mobilePmTxt.textContent = mobilePmQty;
            chatDiv.classList.add("heigth_auto");
            iframeDiv.classList.remove(mHide);
        } else {
            isChatShow = true;
            mobilePmIcon.classList.remove("fa-window-maximize");
            mobilePmIcon.classList.add("fa-window-minimize");
            chatSub2.classList.remove(mHide);
            mobilePmTxt.classList.add(hide);
            chatDiv.classList.remove("heigth_auto");
            iframeDiv.classList.add(mHide);
        }
    }
    g("#private_bt").onclick = function () {
        var body = packMessage(1);
        if (body) {
            if (checkMsgLock()) {
                var j = {data: {body: body, userType: USER_TYPE.PARTICIPANT, talkSession: myInfo.talkSession, mid: getRandom(4)}};
                currentMyMsg = j;
                participantEncryptAgent(CMD.PRIVATE_MSG, j);
            }
        } else {
            toast.error("پیام شما ارسال نشد احتمالا هنوز چیزی ننوشتید یا متن پیام ساختار درستی ندارد");
        }
    }
    window.addEventListener('message', function (e) {
        console.log("parent message received", e);
        console.log("parent message", "data: ", e.data, "origin: ", e.origin, e.data.hasOwnProperty("c"), e.data.c === "url", e.data.path);
        offer = null;
        if (e.origin === window.location.origin && e.data.hasOwnProperty("c") &&
                e.data.c === "url" && e.data.isvalid) {
            offer = e.data;
        }
        setOfferKeys();
    });

    function getMsgFromBuffer(attrName, val, isRemovable) {
        var j;
        for (var f = 0; f < msgBuffer.length; f++) {
            j = msgBuffer[f];
            if (j[attrName] === val) {
                if (isRemovable) {
                    msgBuffer.splice(f, 1);
                }
                return j;
            }
        }
        return null;
    }
    function checkMsgLock() {
        if (!msgLock) {
            msgLockTimeOut = setTimeout(function () {
                clearMsgLock(1);
                toast.error("بعد از 7 ثانیه هنوز پیام به مخاطب نرسیده میخوای دوباره بفرست یا بررسی کن ببین ارتباط برقرار است یا نه");
            }, 7000);
            msgLock = 1;
            message_input_js.contentEditable = false;
            return true;
        } else {
            toast.info("پیام جاری ارسال شده لطفا کمی صبر کنيد")
        }
        return false;
    }
    function clearMsgLock(isNotText) {
        clearTimeout(msgLockTimeOut);
        msgLock = 0;
        message_input_js.contentEditable = true;
        if (!isNotText) {
            removeHtml(message_input_js);
        }
    }
    function setOfferKeys() {
        if (offer) {
            offerBt.classList.remove(hide);
            productFavoriteBt.classList.remove(hide);
        } else {
            offerBt.classList.add(hide);
            productFavoriteBt.classList.add(hide);
        }
    }
    function openOfferInIframe(e) {
        e = e.dataset.link;
        if (e && e.startsWith(myInfo.siteBaseUrl)) {
            iframe.src = e;
        }
    }
    function packMessage() {
        var r = [], slice, isCorrectStructure = {flag: true};
        var txt = message_input_js.innerHTML.replace(/&nbsp;/gim, "").split("<br>");
        console.log("pack message txt : " + txt);
        for (var f = 0; f < txt.length; f++) {
            slice = txt[f].trim();
            if (slice.length < 1) {
                continue;
            }
            console.log("new Slice : " + slice);
            processPackSlice(r, slice, isCorrectStructure);
        }
        console.log(r, isCorrectStructure);
        if (r.length > 0 && isCorrectStructure.flag) {
            return r;
        }
        return null;
    }
    function processPackSlice(res, slice, isCorrectStructure) {
        var i1, i2;
        if (slice.includes("<img src=")) {
            var arr, flag, str, src, link, title, check;
            for (var d = 0; d < slice.length; d++) {
                arr = [];
                i1 = slice.indexOf("<img src=", d);
                i2 = slice.indexOf(">", i1);
//                        console.log("img   d: " + d, "i1: " + i1, "i2: " + i2);
                if (i1 > d) {
                    processPackSlice(res, slice.substring(d, i1).replace(/<br>/gim, ""), isCorrectStructure);
                }
                if (i1 < 0) {
                    processPackSlice(res, slice.substring(d, slice.length).replace(/<br>/gim, ""), isCorrectStructure);
                    d = slice.length;
                } else {
                    str = slice.substring(i1, i2 + 1);
                    flag = true;
                    var el = new DOMParser().parseFromString(str, 'text/html').body.firstChild;
//                    console.log('getCleanSlice str : ',str,new DOMParser().parseFromString(str, 'text/html').body.firstChild);
                    console.log("el : ", el, "typeof el : ", typeof el, 'el len; ', el.length, "str : " + str);
                    if (typeof el === 'object') {
                        src = el.src;
                        title = el.dataset.title;
                        link = el.dataset.link;
                        if (!link.startsWith(myInfo.siteBaseUrl)) {
                            flag = false;
                            console.log("link : " + link)
                            toast.error("لینک پیشنهاد مربوط به این سایت نمیباشد");
                        }
                        check = isInputValidate(src);
                        if (!check) {
                            flag = false;
                            toast.error("عکس پیشنهاد ساختار درستی ندارد");
                        } else if (!check[0]) {
                            flag = false;
                            toast.error("در آدرس عکس پیشنهاد حروف غیر مجاز پیدا شده : " + check[1]);
                        }
                        check = isInputValidate(title);
                        if (!check) {
                            flag = false;
                            toast.error("عنوان پیشنهاد ساختار درستی ندارد");
                        } else if (!check[0]) {
                            flag = false;
                            toast.error("در متن عنوان پیشنهاد حروف غیر مجاز پیدا شده : " + check[1]);
                        }
                        check = isInputValidate(link);
                        if (!check) {
                            flag = false;
                            toast.error("لینک پیشنهاد ساختار درستی ندارد");
                        } else if (!check[0]) {
                            flag = false;
                            toast.error("در لینک پیشنهاد حروف غیر مجاز پیدا شده : " + check[1]);
                        }
                        if (flag) {
                            res.push(["offer", link, title, src]);
                        } else {
                            isCorrectStructure.flag = false;
                        }
                    } else {
                        isCorrectStructure.flag = false;
                        toast.error("پیشنهاد ساختار معتبری ندارد!");
                    }
                    d = i2;
                }
            }
        } else if (slice.includes("http")) {
            slice += "<br>";
            for (var d = 0; d < slice.length; d++) {
                i1 = slice.indexOf("http", d);
                i2 = slice.indexOf("<br>", i1);
                if (i1 > d) {
                    str = slice.substring(d, i1).replace(/<br>/gim, "");
                    console.log(str);
                    check = isInputValidate(str);
                    if (!check) {
                        isCorrectStructure.flag = false;
                        toast.error("جزییات ساختار درستی ندارد");
                    } else if (!check[0]) {
                        isCorrectStructure.flag = false;
                        toast.error("در جزییات حروف غیر مجاز پیدا شده : " + check[1]);
                    } else {
                        str = str.replaceAll('\n', '').trim();
                        if (!str.startsWith(myInfo.siteBaseUrl)) {
                            isCorrectStructure.flag = false;
                            toast.error("لینک ارسال شده مربوط به این سایت نمیباشد");
                        } else {
                            res.push(["span", str]);
                        }
                    }
                }
                if (i1 < 0 || i2 < 1) {
                    continue;
                }
                str = slice.substring(i1, i2);
                check = isInputValidate(str);
                if (!check) {
                    isCorrectStructure.flag = false;
                    toast.error("لینک ارسالی ساختار درستی ندارد");
                } else if (!check[0]) {
                    isCorrectStructure.flag = false;
                    toast.error("در لینک ارسالی حروف غیر مجاز پیدا شده : " + check[1]);
                } else if (!str.startsWith(myInfo.siteBaseUrl)) {
                    isCorrectStructure.flag = false;
                    toast.error("لینک ارسال شده مربوط به این سایت نمیباشد");
                } else {
                    res.push(["a", str]);
                }
                d = i2 + 3;
            }
        } else {
            console.log("span    ", slice);
            str = slice;
            check = isInputValidate(str);
            if (!check) {
                isCorrectStructure.flag = false;
                toast.error("متن ارسالی ساختار درستی ندارد");
            } else if (!check[0]) {
                isCorrectStructure.flag = false;
                toast.error("در متن ارسالی حروف غیر مجاز پیدا شده : " + check[1]);
            } else {
                res.push(["span", str.replaceAll('\n', '').trim()]);
            }
        }
    }
    function unpackMessage(body) {
        var msgArr = [], check, flag = true;
        if (body && body.length > 0) {
            body.forEach(function (e) {
                if (e[0] === "span") {
                    check = isInputValidate(e[1]);
                    if (check == undefined) {
                        flag = false;
                        toast.error("پیام دریافت شده خالی است!");
                    } else if (!check[0]) {
                        flag = false;
                        toast.error("در پیام دریافت شده حروف غیر مجاز پیدا شده : " + check[1]);
                    } else {
                        msgArr.push(["span", e[1]]);
                    }
                } else if (e[0] === "a") {
                    check = isInputValidate(e[1]);
                    if (check == undefined) {
                        flag = false;
                        toast.error("لینک دریافت شده خالی است!");
                    } else if (!check[0]) {
                        flag = false;
                        toast.error("در لینک دریافت شده حروف غیر مجاز پیدا شده : " + check[1]);
                    } else if (!e[1].startsWith(myInfo.siteBaseUrl)) {
                        flag = false;
                        toast.error("لینک ارسال شده به این سایت مرتبط نمی باشد");
                    } else {
                        msgArr.push(["a", e[1]]);
                    }
                } else if (e[0] === "offer") {
                    if (!e[1].startsWith(myInfo.siteBaseUrl)) {
                        flag = false;
                        toast.error("لینک دریافت شده مربوط به این سایت نمیباشد و دارای ریسک بیشتری است : " + e[1]);
                    }
                    check = isInputValidate(e[1]);
                    if (!check) {
                        flag = false;
                        toast.error("لینک پیشنهاد ساختار درستی ندارد");
                    } else if (!check[0]) {
                        flag = false;
                        toast.error("در لینک پیشنهاد دریافت شده حروف غیر مجاز پیدا شده : " + check[1]);
                    }
                    check = isInputValidate(e[2]);
                    if (!check) {
                        flag = false;
                        toast.error("عنوان پیشنهاد ساختار درستی ندارد");
                    } else if (!check[0]) {
                        flag = false;
                        toast.error("در عنوان پیشنهاد دریافت شده حروف غیر مجاز پیدا شده : " + check[1]);
                    }
                    check = isInputValidate(e[3]);
                    if (!check) {
                        flag = false;
                        toast.error("لینک عکس پیشنهاد ساختار درستی ندارد");
                    } else if (!check[0]) {
                        flag = false;
                        toast.error("در لینک عکس پیشنهاد دریافت شده حروف غیر مجاز پیدا شده : " + check[1]);
                    }
                    if (flag) {
                        msgArr.push(["offer", e[1], e[2], e[3]]);
                    }
                } else {
                    flag = false;
                }
            });
            return flag ? msgArr : null;
        } else {
            return null;
        }
    }

    function processUnpackHtmlMessage(userType, body, customerMsgNum) {//, withoutFirstOffer
        if (userType && body) {
            var flag = true, firstOffer, isSupporterType = userType === USER_TYPE.SUPPORTER;
            var h = '<div class="msg ' + (isSupporterType ? 'supporter"' : 'customer" data-id="' + customerMsgNum + '"') + '>' +
                    '<div class="msg_header"><span class="name">' + (isSupporterType ? ' کارشناس مشاور ' : ' مشتری ') + '</span>' +
                    '</div>';
            body.forEach(function (e) {
                if (e[0] === "span") {
                    h += '<span class="msg_txt">' + e[1] + '</span>';
                } else if (e[0] === "a") {
                    h += '<a class="msg_link" href="' + e[1] + '" target="_blank"><i class="fas fa-external-link-alt"></i>' + e[1] + '</a>';
                } else if (e[0] === "offer") {//link, title, src
                    if (!firstOffer) {
                        firstOffer = e[1];
                    }
                    h += '<div class="msg_offer" data-link="' + e[1] + '" onclick="openOfferInIframe(this)"><img src="' + e[3] + '"><span>' + e[2] + '</span></div>'
                } else {
                    flag = false;
                }
            });
            h += '</div>';
            if (flag && body.length > 0) {
                textDiv.insertAdjacentHTML("afterbegin", h);
                if (firstOffer && isSupporterType && amICustomer && !lockAutoOpenOffers) {
                    iframe.src = firstOffer;
                }
                removeChildren(g(".msg", textDiv, 1), maxPmQty);
                return true;
            }
        }
        return false;
    }

    function sendDataChannelCallback(isSuccessful, data) {
        if (isSuccessful) {
            myMsgForAck = data;
        } else {
            toast.error("پیام ارسال نشد ارتباط با سرور را چک کنید")
        }
    }

    function ackMsgCallback(j) {
        console.log("participant ackMsgCallback ", j);
        if (j && j.data.mid && j.data.mid === currentMyMsg.data.mid) {
            var body = unpackMessage(currentMyMsg.data.body);
            var flag = processUnpackHtmlMessage(currentMyMsg.data.userType, body, currentMyMsg.data.msgNumber);
            currentMyMsg = null;
            clearMsgLock(0);
            if (!flag) {
                toast.error("پیام شما ساختار درستی ندارد و قابل نمایش نیست");
            }
        }
    }
    function writeMsgToChatList(j) {
        console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD  ", j, typeof j);
        var body = unpackMessage(j.data.body);
        if (body) {
            var flag = processUnpackHtmlMessage(j.data.userType, body);
            if (talkObj.isTalkRightNow) {
                if (flag) {
                    var j2 = {data: {talkSession: myInfo.talkSession, mid: j.data.mid}};
                    participantEncryptAgent(CMD.MSG_ACK, j2);
                } else {
                    toast.error("پیام دریافت شد اما ساختار درستی ندارد");
                }
            }
        } else {
            toast.error("ساختار پیام فرستنده استاندارد نبود و قابل نمایش نیست");
        }
    }

//===============================================customer section===============================================

////    if (isCustomer) {
    addRemoveTalkBt.onclick = function () {
        var j = {};
        if (talkObj.isTalkWaitingNow && talkObj.talkNumber) {
            j.title = ' آیا میخواهید درخواست گفتگوی خود را حذف کنید ؟';
            j.control = '<span id="talk_request_bt" class="button_ctr2 bg-css-red bt"><i class="fas fa-walking"></i> بله درخواست گفتگو را حذف کن</span>';
            showDialog(j);
            g("#talk_request_bt").onclick = function () {
                toast.info("درخواست حذف کردن گفتگو در حال بررسی است و ممکن است کمی طول بکشد");
                removeTalkRequestToSupporter();
                closeDialog();
            }
        } else {
            j.title = ' میخواهید کارشناس مشاور با شما بصورت لایو ،گفتگویی داشته باشد ؟';
            j.control = '<span id="talk_request_bt" class="button_ctr2 bg-css-green bt"><i class="fas fa-walking"></i> بله درخواست گفتگو را ارسال کن</span>';
            showDialog(j);
            g("#talk_request_bt").onclick = function () {
                toast.info("در حال بررسی وضعیت میکروفن و دوربین");
                checkMediaPermission(function (r) {
                    if (r.canEnumerate) {
                        var flag = true;
                        if (!r.hasSpeakers) {
                            flag = false;
                            toast.error("این دستگاه فاقد خروجی صدا یا بلندگو برای مکالمه است");
                        }
                        if (!r.hasMicrophone) {
                            flag = false;
                            toast.error("این دستگاه فاقد ورودی صدا یا میکروفن برای مکالمه است");
                        }
                        if (!r.hasWebcam) {
                            flag = false;
                            toast.error("این دستگاه فاقد ورودی تصویر یا دوربین برای مکالمه است");
                        }
                        if (flag) {
                            if (!r.withMicrophonePermission) {
                                flag = false;
                                toast.error("در این مرورگر دسترسی میکروفن داده نشده است لطفا آنرا فعال کنید");
                            }
                            if (!r.withWebcamPermission) {
                                flag = false;
                                toast.error("در این مرورگر دسترسی دوربین وبکم داده نشده است لطفا آنرا فعال کنید");
                            }
                            if (flag) {
                                toast.success("اجازه دسترسی وجود دارد، در حال اتصال به اتاق");
                                setTalkRequestToSupporter();
                                closeDialog();
                            } else {
                                getCamAndMicPermission(function (isAllowed) {
                                    if (isAllowed) {
                                        toast.success("اجازه دسترسی داده شده است، در حال اتصال به اتاق");
                                        setTalkRequestToSupporter();
                                        closeDialog();
                                    } else {
                                        closeDialog();
                                        toast.error("اجازه دسترسی به میکروفن و یا دوربین وبکم بسته شده است لطفا از طریق راهنما دسترسی را فعال کنید");
                                        var j = {title: ' راهنمای دسترسی میکروفن و دوربین:'};
                                        j.control = '<span id="media_help" class="button_ctr2 bg-css-blue bt"><i class="fas fa-walking"></i> راهنما را باز کن</span>';
                                        showDialog(j);
                                        g("#media_help").onclick = function () {
                                            openLinkInNewTab("http://qwer/help/media_permission");
                                        }
                                    }
                                });
                            }
                        }
                    } else {
                        toast.error("میکروفن و دوربین قابل شناسایی نبود! از آخرین ورژن مرورگر کروم و یا دستگاه دیگر استفاده کنید");
                    }
                });








//                setTalkRequestToSupporter();
//                closeDialog();
            }
        }
    }
    function getStatisticData() {
        var arr = [], k, v, j = {}, prefix = "S61P";
        var keys = Object.keys(localStorage);
        for (var b = 0; b < keys.length; b++) {
            k = keys[b];
            if (k.startsWith(prefix)) {
                v = JSON.parse(localStorage.getItem(k));
                if (v && v.url && v.img && v.title && v.time) {
                    j[k] = v;
                } else {
                    localStorage.removeItem(k);
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
                arr.push([k.substr(prefix.length), j[k].url, j[k].title, j[k].img, totalTime * 1000, timeKeys.length]);
            }
        }
        if(arr.length>0){
        arr = sortArrayByNumber(4, arr);
        arr = arr.slice(0, 100);
        }
        return arr;
    }
    g("#lock_bt").onclick = function () {
        var e = g("i", this), s = g("span", this);
        if (lockAutoOpenOffers) {
            lockAutoOpenOffers = false;
            s.textContent = "قفل";
            e.classList.remove("fa-lock-open");
            e.classList.add("fa-lock");
            toast.info("مشاهده پیشنهادهای مشاور خودکار شد");
        } else {
            lockAutoOpenOffers = true;
            s.textContent = "آزاد";
            e.classList.remove("fa-lock");
            e.classList.add("fa-lock-open");
            toast.info("مشاهده خودکار پیشنهادهای مشاور لغو شد");
        }
    }
    function cleanChatBox() {
        removeChildren(g(".msg", textDiv, 1), 0);
    }
//    }

    function getIntervalInfo(data) {
        viewerCount.textContent = data.viewerCount;
    }
//    });
} else {
    document.querySelector("html").innerHTML = "";
}
