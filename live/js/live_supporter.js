if (window.top === window.self) {
//    document.addEventListener('DOMContentLoaded', function () {
//===============================================general section===============================================

    var hide = "hide", mHide = "m_hide",
            message_input_js = g("#message"),
            textDiv = g("#text_div"), viewerNumber = g("#viewer_number"),
            itemBarDiv = g(".item_bar_div"), talkNumber = 1,
            iframe = g("#iframe"), chatSub2 = g("#chat_sub2"), isChatShow = true,
            mobilePmBt = g("#mobile_pm_bt"), mobilePmTxt = g("span", mobilePmBt),
            mobilePmIcon = g("i", mobilePmBt), mobilePmQty = 0, chatDiv = g(".chat_div"),
            iframeDiv = g(".iframe_div"),
            amICustomer = false, offerBt = g("#offer_bt"), offer = {}, msgLock = 0,
            msgLockTimeOut, customerVideo = g("#customer_video"),
            customerMessageNum = 1, customerMsgBuffer = {},
            msgNumber = 1, currentMyMsg, viewerCount = g("#viewer_count"),
            myMsgForAck, maxPmQty = 100, currentParticipant, previousActiveParticipant;

    message_input_js.focus();

    g("#close_live_bt").onclick = function () {
        var j = {title: ' آیا میخواهید اتاق را ببندید؟'};
        j.control = '<span id="close_live_page" class="button_ctr2 bg-css-red bt"><i class="fas fa-walking"></i> بله صفحه لایو را میبندم</span>';
        showDialog(j);
        g("#close_live_page").onclick = function () {
            //*** close janus videoroom and stream 
            //*** close live session and calculate price in server and check to close videoroom and stream too
            //*** after catch close live message from server then redirect current page to site supporty profile
//            orchesterSend({},SERVER_ENDPOINT.END_LIVE,function(isSuccess,result){
//                if(isSuccess&&result.status=="ok"){
//                    destroySession();
//                }
//            });
            destroySession();
        }
    }
    g("#close_customer_bt").onclick = function () {
        if (currentParticipant) {
            var j = {title: ' میخواهید به گفتگو خاتمه دهید ؟'};
            j.body = '<span>شماره مشتری جاری : ' + currentParticipant.talkNumber + '</span>';
            j.control = '<span id="close_customer_live" class="button_ctr2 bg-css-red bt"><i class="fas fa-walking"></i> بله گفتگو را میبندم</span>';
            showDialog(j);
            g("#close_customer_live").onclick = function () {
//*** send request of kick off this custmer from videoroom
                console.log("current participant Number : " + currentParticipant.talkNumber);
                endParticipantTalk();
                cleanChatBox();
//                currentParticipant = null; //it's will be null when user leaved the room in videoroomtest.js > participantCounterCallback
                if (currentParticipant) {
                    orchesterSend({publisherId: currentParticipant.userRoomId}, SERVER_ENDPOINT.KICK_USER);
                }
                closeDialog();
            }
        } else {
            toast.info("هیچ مخاطبی پیدا نشد");
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
        if (currentParticipant) {
            if (checkMsgLock()) {
                var body = packMessage();
                if (body) {
                    var j = {receiverId: currentParticipant.userRoomId, data: {body: body, userType: USER_TYPE.SUPPORTER, talkSession: currentParticipant.talkSession, mid: getRandom(4)}};
                    currentMyMsg = j;
                    supporterEncryptAgent(CMD.PRIVATE_MSG, j);
                } else {
                    toast.error("پیام شما ارسال نشد احتمالا هنوز چیزی ننوشتید یا متن پیام ساختار درستی ندارد");
                }
            }
        } else {
            toast.error("مخاطب مستقیم برای گفتگوی خصوصی در اتاق وجود ندارد");
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
    function clearMsgLock(withoutTextInputClear) {
        clearTimeout(msgLockTimeOut);
        msgLock = 0;
        message_input_js.contentEditable = true;
        if (!withoutTextInputClear) {
            removeHtml(message_input_js);
        }
    }
    function setOfferKeys() {
        if (offer) {
            offerBt.classList.remove(hide);
        } else {
            offerBt.classList.add(hide);
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
                console.log("link with http ", slice);
                i1 = slice.indexOf("http", d);
                i2 = slice.indexOf("<br>", i1);
                if (i1 > d) {
                    str = slice.substring(d, i1).replace(/<br>/gim, "");
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
//        console.log("processUnpackHtmlMessage ", isSupporterType, amICustomer, userType, body, customerMsgNum)
            var h = '<div class="msg ' + (isSupporterType ? 'supporter"' : 'customer" data-id="' + customerMsgNum + '"') + '>' +
                    '<div class="msg_header"><span class="name">' + (isSupporterType ? ' کارشناس مشاور ' : ' مشتری ') + '</span>' +
                    (!isSupporterType && !amICustomer ?
                            '<span class="unlockbt button_ctr bg-css-darkblue" onclick="unlockPm(this)"><i class="fas fa-lock-open"></i> نمایش عمومی</span>' : '') +
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
        console.log("ackMsgCallback", currentMyMsg, j);
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
            var num = msgNumber++;
            if (!amICustomer) {
                customerMsgBuffer["num-" + num] = {data: {body: j.data.body, msgNumber: num, userType: USER_TYPE.PARTICIPANT}};
            }
            var flag = processUnpackHtmlMessage(j.data.userType, body, num);
//            console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD  flag", flag);
            if (flag) {
                if (currentParticipant) {
                    var j2 = {receiverId: currentParticipant.userRoomId, data: {mid: j.data.mid, msgNumber: num, talkSession: currentParticipant.talkSession}};
//                console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD  j2", j2);
                    supporterEncryptAgent(CMD.MSG_ACK, j2);
                }
            } else {
//                toast.error("پیام دریافت شد اما ساختار مشکوکی دارد ما برای امنیت شما جلوی نمایش آنرا میگیریم");
                toast.error("پیام دریافت شد اما ساختار درستی ندارد");
            }
        } else {
            toast.error("ساختار پیام فرستنده استاندارد نبود و قابل نمایش نیست");
        }
    }
    //=============================================== supporter section ===============================================
    if (!amICustomer) {
        var statisticsLock = false;
//*** for test it's need to have secret key too
        var waitingList = [["username1234", 22, 31243132, 1604419112463, 1], ["username1235", 12, 3123132, 1604419012463, 2], ["username1236", 22, 3243132, 1604418112463, 3], ["username1234", 22, 31243132, 1604419312463, 1], ["username1234", 22, 31243132, 1604419112463, 3], ["username1234", 22, 31243132, 1604419112463, 3], ["username1234", 22, 31243132, 1604419112463, 2]]; //*** set visited item list when supporter wants
//[img src,title,count,duration,link]
        var visitedItemList = null;

        g("#public_bt").onclick = function () {
            if (!currentParticipant || checkMsgLock()) {
                var body = packMessage();
                if (body) {
                    var j = {data: {body: body, userType: USER_TYPE.SUPPORTER, mid: getRandom(4), msgNumber: msgNumber++}};
//                    console.log("+++++++++++++++++++++++ public bt 1 +++++++++ currentMyMsg", currentMyMsg);
                    supporterEncryptAgent(CMD.PUBLIC_MSG, j);
//                    console.log("+++++++++++++++++++++++ public bt 2 +++++++++ currentMyMsg", currentMyMsg);
                    currentMyMsg = j;
                    if (!currentParticipant) {
                        ackMsgCallback(j);
                    }
                } else {
                    toast.error("پیام شما ارسال نشد احتمالا هنوز چیزی ننوشتید یا متن پیام ساختار درستی ندارد");
                }
            }
        }
        g("#clean_bt").onclick = function () {
            cleanChatBox();
        }
        g("#item_bar_close").onclick = function () {
            itemBarDiv.classList.add(hide);
            removeHtml(".item_bar_wrapper", itemBarDiv);
        }

        g("#item_bar_refresh").onclick = sendStatisticsRequest;

        g("#visited_bt").onclick = function () {
            if (visitedItemList && visitedItemList.length > 0) {
                receiveStatisticsResponse();
            } else {
                sendStatisticsRequest();
            }
        }
        function sendStatisticsRequest() {
            if (currentParticipant && currentParticipant.talkSession) {
                if (!statisticsLock) {
                    statisticsLock = true;
                    visitedItemList = null;
                    checkViewerStatistics(currentParticipant.talkSession);
//                    encapsulateMsg(CHAT_CMD.STATISTICS_REQUEST, ["list"]);
//                    toast.info("درخواست آمار بازدید کاربر ارسال شد لطفا صبور باشید ممکن است دریافت پاسخ آن زمان زیادی نیاز داشته باشد");
                    toast.info("تا زمان دریافت آمار بازدید مشتری کمی صبر کنید");
                    setTimeout(function () {
                        statisticsLock = false;
                    }, 60000);
                } else {
                    toast.info("لطفا صبور باشید این یک درخواست تحلیل و آنالیز است و اگر کاربر صفحات زیادی را بازدید کرده باشد طبیعتا بدست آوردن آن کمی بیشتر طول خواهد کشید");
                }
            } else {
                toast.error("ابتدا یکی از مشتریان در لیست انتظار برای گفتگو را تایید کنید");
            }
        }

        function receiveStatisticsResponse() {
            if (currentParticipant && visitedItemList) {
                statisticsLock = false;
                var elem = "";
                //[[hash,link,title,image,totalTime,days],...]
                visitedItemList.forEach(function (e) {
                    elem += '<div class="item_bar_item" data-link="' + e[1] + '">' +
                            '<img src="' + e[3] + '" class="item_bar_img" loading="lazy">' +
                            '<div class="item_bar_txt">' +
                            '<span class="item_bar_title">' + e[1] + '</span>' +
                            '<span>تعداد روز : ' + e[5] + '</span>' +
                            '<span>زمان : ' + (getDateDifferenceByHour(e[4])) + '</span>' +
                            '<span> میانگین : ' + (getDateDifferenceByMin(e[4] / e[5])) + '</span>' +
                            '</div>' +
                            '<div class="item_bar_inner_control">' +
                            '<i class="fas fa-eye open_here"></i>' +
                            '<i class="fas fa-external-link-alt open_new"></i>' +
                            '</div>' +
                            '</div>';
                });
                itemBarDiv.classList.remove(hide);
                g(".item_bar_wrapper", itemBarDiv).innerHTML = elem;
                g(".open_here", itemBarDiv, 1).forEach(function (i) {
                    i.onclick = function () {
                        var link = this.closest(".item_bar_item").dataset.link;
                        console.log("link is : " + link);
                        //*** this is need to complete in future by accepting users
                        //if( link.startsWith("site base url")){}
                        iframe.src = link;
                    }
                });
                g(".open_new", itemBarDiv, 1).forEach(function (i) {
                    i.onclick = function () {
                        var link = this.closest(".item_bar_item").dataset.link;
                        console.log("link is : " + link);
                        //*** this is need to complete in future by accepting users
                        //if( link.startsWith("site base url")){}
                        openLinkInNewTab(link);
                    }
                });
            } else {
                toast.error("ابتدا یکی از مشتریان در لیست انتظار برای گفتگو را تایید کنید");
            }
        }
        g("#ban_customer_bt").onclick = function () {
            if (previousActiveParticipant) {
                var j = {title: ' مطمئنی میخوای این کاربر را مسدود کنی ؟'};
                j.body = '<span>شماره مشتری : ' + previousActiveParticipant.talkNumber + '</span>' +
                        '<span>علت : <sub>(حداکثر 250 حرف)</sub></span>' +
                        '<textarea maxlength="250"></textarea>';
                j.control = '<span id="ban_user" class="button_ctr2 bg-css-red bt"><i class="fas fa-ban"></i> بله مسدود میکنم</span>';
                var dialog = showDialog(j);
                g("textarea", dialog).focus();
                g("#ban_user", dialog).onclick = function () {
                    console.log("accepted username is : " + previousActiveParticipant);
                    //*** send username to ban it
                    var reasons = g("textarea", dialog).value.trim();
                    var check = isInputValidate(reasons);
                    if (!check) {
                        toast.error("لطفا علت مسدود شدن را بفرمایید");
                    } else if (check[0]) {
                        if (reasons.length < 10) {
                            toast.error("متن علت مسدود کردن کاربر خیلی کوتاه است");
                        } else if (reasons.length > 250) {
                            toast.error("متن علت مسدود کردن کاربر خیلی زیاد است");
                        } else {
                            var json = {talkSession: previousActiveParticipant.talkSession, publisherId: previousActiveParticipant.userRoomId, reason: reasons};
                            orchesterSend(json, SERVER_ENDPOINT.BAN_USER, function (isSuccess, result) {
                                if (isSuccess) {
                                    if (result.status === "ok") {
                                        toast.success("کاربر با موفقیت مسدود شد");
                                    }
                                }
                            });
//$.POST currentUserName , reasons
//*** after to send request and get succeed result ban dialog must be removed
                            closeDialog();
                        }
                    } else {
                        toast.error("در متن علت مسدود کردن کاربر حروف غیر مجاز : " + check[1] + " دیده شده لطفا اصلاح کنید");
                    }
                }
            } else {
                toast.error("هنوز کسی به گفتگو با شما نپرداخته است");
            }
        }
        var talkLock = 0, talkLockTimeOut;
        function checkTalkLock() {
            if (!talkLock) {
                if (!currentParticipant) {
                    talkLockTimeOut = setTimeout(function () {
                        clearTalkLock();
                        toast.error("بعد از 12 ثانیه هنوز مشتری دعوت به گفتگو را تایید نکرده است");
                        currentParticipant = null;
                    }, 12000);
                    talkLock = 1;
                    return true;
                } else {
                    toast.info("در حال حاضر با مشتری شماره " + currentParticipant.talkNumber + " در حال گفتگو هستید و وقتی گفتگو به پایان رسید میتوانید نوبت گفتگو را به مشتری بعدی بدهید");
                }
            } else {
                toast.info("دعوت به گفتگو ارسال شده لطفا کمی صبر کنيد");
            }
            return false;
        }
        function clearTalkLock() {
            clearTimeout(talkLockTimeOut);
            talkLock = 0;
        }
        g("#open_link_bt").onclick = function () {
            var j = {title: ' باز کردن یک صفحه از سایت خود:'};
            j.body = '<input type="url" id="site_link" placeholder="آدرس را وارد کنید">';
            j.control = '<span id="enter_link_bt" class="button_ctr2 bg-css-blue bt"><i class="fas fa-link"></i> صفحه باز شود</span>';
            var dialog = showDialog(j);
            g("#site_link", dialog).focus();
            g("#enter_link_bt", dialog).onclick = function () {
                var link = g("#site_link", dialog).value.trim();
                if (link.length < 10) {
                    toast.error("لینک ورودی خیلی کوتاه است");
                } else if (!link.startsWith(myInfo.siteBaseUrl)) {
                    toast.error("لینک باید متعلق به این سایت باشد");
                } else {
                    iframe.src = link;
                    closeDialog();
                }
            }
        }
        g("#add_remove_customer_bt").onclick = function () {
            if (talkWaitingQueue && talkWaitingQueue.length > 0) {
                var nowTime = new Date() * 1;
                var j = {title: 'برای گفتگو یکی رو از لیست انتخاب کنید:'};
                var elem = '<div class="w_item_wrapper">';
                talkWaitingQueue.forEach(function (e) {
                    //{data: {talkSession: myInfo.talkSession,itemCount:qty,totalDuration:time,userType:myInfo.userType}}
                    elem += '<div class="waiting_item" data-name="' + e.name + '" data-talkSession="' + e.talkSession + '" data-talkNumber="' + e.talkNumber + '">' +
//                        '<span class="w_i_title">شماره: ' + e.talkNumber + '</span>' +
                            '<span class="w_i_time">' + (getDateDifferenceByHour(e.time, nowTime)) + ' قبل</span>' +
                            '<div class="w_i_statistics">' +
                            '<span> شماره: ' + e.talkNumber + '</span>' +
                            '<span>نوع کاربری : ' + getUserType(e.userType) + '</span>' +
                            '<span>تعداد صفحات : ' + e.itemCount + '</span>' +
                            '<span>زمان کل بازدید : ' + (getDateDifferenceByHour(e.totalDuration)) + '</span>' +
                            '<span>میانگین بازدید از صفحات : ' + (getDateDifferenceByMin(e.totalDuration / e.itemCount)) + '</span>' +
                            '</div><div class="controller_div">' +
                            '<span class="button_ctr bg-css-blue accept_talk_bt"><i class="fas fa-check"></i> تایید</span>' +
                            '<span class="button_ctr bg-css-green check_talk_bt"><i class="fas fa-check"></i> بررسی</span>' +
                            '<span class="button_ctr bg-css-red remove_talk_bt"><i class="fas fa-check"></i> حذف</span>' +
                            '</div></div>';
                });
                elem += '</div>';
                j.body = elem;
                var dialog = showDialog(j);
                g(".accept_talk_bt", dialog, 1).forEach(function (i) {
                    i.onclick = function () {
                        if (checkTalkLock()) {
                            var who = this.closest(".waiting_item"), talkNumber = Number(who.dataset.talknumber), talkSession = who.dataset.talksession;
                            console.log("accept_talk_bt", who, talkNumber, talkSession);
                            if (talkNumber && talkSession) {
                                var waitViewer = findInArray(talkWaitingQueue, "talkSession", talkSession);
                                currentParticipant = waitViewer;
                                previousActiveParticipant = currentParticipant;
                                console.log("accepted user, talkNumber", talkNumber, "talkSession", talkSession);
                                var j = {receiverId: waitViewer.userRoomId, talkNumber: talkNumber, data: {talkSession: talkSession}};
                                supporterEncryptAgent(CMD.ACCEPT_VIEWER_TALK, j);
                                toast.info("دعوت به گفتگو ارسال شد");
                            }
                        }
                    }
                });
                g(".check_talk_bt", dialog, 1).forEach(function (i) {
                    i.onclick = function () {
                        var talkSession = this.closest(".waiting_item").dataset.talksession;
                        console.log("check_talk_bt", talkSession);
                        checkViewerIsExist(talkSession);
                    }
                });
                g(".remove_talk_bt", dialog, 1).forEach(function (i) {
                    i.onclick = function () {
                        currentParticipant = null;
                        var talkSession = this.closest(".waiting_item").dataset.talksession;
                        console.log("remove_talk_bt", talkSession);
                        removeTalkRequestToCustomer(talkSession);
                    }
                })
            } else {
                toast.info("هنوز کسی درخواست گفتگو نداده است");
            }
        }
        function getUserType(type) {
            switch (type) {
                case 8:
                    return "مهمان";
                case 7:
                    return "اجتماعی";
//                case 3:
//                    return "اجتماعی";
                default :
                    return "هیچی پیدا نشد";
            }
        }
        function unlockPm(e) {
            var parent = e.closest(".customer.msg");
            var msgId = Number(parent.dataset.id);
            if (msgId && msgId > 0) {
                var data = customerMsgBuffer["num-" + msgId];
                if (data) {
                    parent.querySelector(".unlockbt").remove();
                    supporterEncryptAgent(CMD.PUBLISH_CUSTOMER_MSG, data);
                } else {
                    toast.error("شاید عجیب باشه ولی ما این پیام رو در حافظه پیدا نکردیم اگر پیام مهمی بوده که میخواستید برای دیگران هم ارسال کنید به مخاطبتون بگید که دوباره ارسال کند")
                }
            }
        }
    }
    function cleanChatBox() {
        var j = {data: {body: "erase"}};
        supporterEncryptAgent(CMD.CLEAN_CHAT_BOX, j);
        removeChildren(g(".msg", textDiv, 1), 0);
    }
} else {
    document.querySelector("html").innerHTML = "";
}

