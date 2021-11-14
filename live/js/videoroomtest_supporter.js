//var ttest;
var SERVER_CMD=Object.freeze({
    SET_STATISTICS_DATA:9,
   SET_RSA_AND_PUBLISHER_ID:10,
   SET_RSA_AND_PUBLISHER_ID_RESPONSE:11,
   KICK_USER:15,
   BAN_USER:16,
   END_LIVE:17
});
var supporterCrypt = new JSEncrypt();
supporterCrypt.getKey();
//supporterCrypt.setPrivateKey('-----BEGIN RSA PRIVATE KEY-----\nMIICXgIBAAKBgQChsTH1BMLitw1i8tv5LODyBk6/hMWozT+YNHXN/7vJ5Z2T10bK\nM1vL2H+oUZy5XkrcaVqc16VJBz/apQ49cm52t+uoDbavYXRXO34dBYzvvk8Avt+b\nuX24fsJ92tGApljOvRW82nT/qtmeRXEiXK8KB9NB7nv1zxYaLJy4C+TiKQIDAQAB\nAoGAQ9kCyXmR/WgqadbWjxxR17zl1l90QXy+rrN0q1ggCHwdPygaQEaEwmi6SHrW\ndMIoT4y1xRKH/LjaBnk0HHyj9Oe5I6WV/uphDdmRWH0q0U9bR3ShR7OspIxhIYe1\nVKOsuR6OArRD4vTeOynXj5G4IlChKUynN2kHyvTnwPlLLcECQQDxpPhdDS89dBst\nbqt625qNP1vGuRIPEzpfoJ003zZzkBY6B/9p0uaxjwGm39cSAKPxPgPejD0WAogG\nIGgTJrzlAkEAq0xHEVmDHbVQGdWiL7GIe61jgjdUCVQJfOC7vTrSspELhLzGw96d\nJ+Z7oJcW//zkiSoFXyIjlsoHecITamL/9QJBALObsx821Y4P5sN2Ju9CmzWxij3D\nAbFC0XiSoUbTQl3TEzI/D5FQuTfw24F1jx5Ka5C8T5PzGNRrPT+Qhsr1WCECQQCH\naeVEcd6UvaB0y81Kpq2eF5NyfQqR1T0q2v2OudGWF9NjO1hlvrW9tRZF/SrRcrm3\nNODKM9KugUcnmaR/lYOBAkEAu4r6BIXlEXxKc69Ew9u3FPTD4Wk4gLRQbd6X/7Gr\nvDe1GB0oOD57s5ZpbLH7ETWpiosBYepWd4Zt2lBmHhMgrw==\n-----END RSA PRIVATE KEY-----');
//var myPublicKey = supporterCrypt.getPublicKey();
function rsaDecrypt(msg) {
    return supporterCrypt.decrypt(msg);
}
function rsaEncryptMsg(msg) {
    return supporterCrypt.encrypt(msg);
}

var trio;
var participantIds = [];
var firstCheck = g("#first_check")//, firstCheckTxt = g("#first_check p");
var videoElems = [g("#supporter_video video"), g("#customer_video video")];
var myInfo = {supporterRsaPublicKey: supporterCrypt.getPublicKey()};
//$(document).ready(function () {
function checkParams() {
    // url = ?baseurl=http://localhost:8383&siteid=312312&talksession=321dsadas&serversession=312bdfhsb&usertype=1&cap=6&host=ubun.tu&roomid=1234&token=token1234&pin=pin1234&endpoint=http://www.google.com/endpoint1/supporter
    var c = {};
    var urlParam = window.location.hash;
    if (urlParam && urlParam.length > 10 && urlParam.startsWith('#')) {
        urlParam = b64DecodeUnicode(urlParam.substr(1));
        if (urlParam) {
            urlParam = new URLSearchParams(urlParam);
            myInfo.siteId = Number(urlParam.get("siteid"));
            myInfo.supporterId = Number(urlParam.get("supporterid"));
            myInfo.talkSession = urlParam.get("talksession");
            myInfo.serverSession = urlParam.get("serversession");
            myInfo.userType = Number(urlParam.get("usertype"));
            myInfo.siteBaseUrl = urlParam.get("baseurl");
            myInfo.endpoint = urlParam.get("endpoint");

            var c = {
                host: urlParam.get("host"),
                roomId: urlParam.get("roomid"),
                token: urlParam.get("token"),
                pin: urlParam.get("pin"),
                maxCap: Number(urlParam.get("cap")),
                isPublisher: true,
                isSupporter: true,
                videoElems: [g("#supporter_video video"), g("#customer_video video")],
                videoRoomCallback: videoRoomCallback,
                videoElemCallback: videoElemCallback,
                sendMsgCallback: sendMsgCallback,
                receiveMsgCallback: receiveMsgCallback,
                outOfCapacityRoomCallback: outOfCapacityRoomCallback,
                participantCounterCallback: participantCounterCallback,
                peerConnectionCallback: peerConnectionCallback,
                lostConnectionCallback: lostConnectionCallback
            }
        }
    }
//    ttest = c;
    if (myInfo.siteId && myInfo.supporterId && myInfo.supporterRsaPublicKey && myInfo.talkSession && myInfo.serverSession &&
            myInfo.userType === USER_TYPE.SUPPORTER && c.host && c.roomId && c.token && c.pin && c.maxCap) {
        trio = startLive(c);
    } else {
        toast.error("اطلاعات ورود به اتاق کامل نیست لطفا مجدد برای ورود اقدام فرمایید");
    }
}
function lostConnectionCallback() {
    getBackToProfile("ارتباط اینترنتی دچار مشکل شد و ارتباط با اتاق قطع است");
}
function peerConnectionCallback(isOn, remoteFeed) {
    console.log("============== peerConnectionCallback isOn? ==============", isOn);
}
function videoRoomCallback(myId) {
    console.log("============== videoRoomCallback I'm joined successfully ==============", "myId:" + myId);
    if (myId) {
        myInfo.supporterRoomId = myId;
        var j = {cmd:SERVER_CMD.SET_RSA_AND_PUBLISHER_ID,rsaKey: myInfo.supporterRsaPublicKey, supporterRoomId: myInfo.supporterRoomId};
        orchesterSend(j, function (isSent, result) {
            //*** true because just for test, orchester endpoint is not ready yet and i got always error so with true i pass this step
            if (isSent&&result&&result.status==="ok") {
                //*** check result object to open live page
                //
                //*** just for test, i must be check successful result from orchester server then start to working
                toast.success("به اتاق مشاوره متصل شدید ، خوش آمدید");
                if(result.msg){
                    toast.success(result.msg);
                }
                firstCheck.classList.add("hide");
                //*** just for test, set participant page data :
                //siteid=3213&supporterid=3213&supporterroomid=312-31231-321-321&talksession=321dsadas&serversession=312bdfhsb&usertype=1&cap=6&host=ubun.tu&roomid=1234&token=token1234&pin=pin1234&endpoint=http://www.google.com/endpoint1/supporter&rsakey=-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQChsTH1BMLitw1i8tv5LODyBk6/\nhMWozT+YNHXN/7vJ5Z2T10bKM1vL2H+oUZy5XkrcaVqc16VJBz/apQ49cm52t+uo\nDbavYXRXO34dBYzvvk8Avt+buX24fsJ92tGApljOvRW82nT/qtmeRXEiXK8KB9NB\n7nv1zxYaLJy4C+TiKQIDAQAB\n-----END PUBLIC KEY-----
//                g("#test_participant_page").href = "http://localhost:8383/VideoRoom/live/live_page_participants_purejs.html#" +
//                        b64EncodeUnicode("baseurl=" + myInfo.siteBaseUrl + "&siteid=123&supporterid=1234&supporterroomid=" + myInfo.supporterRoomId + "&talksession=talksession1234&serversession=serversession1234&usertype=" + USER_TYPE.PARTICIPANT + "&cap=6&host=https://ubun.tu:8089/janus&roomid=1234&token=token1234&pin=pin1234&endpoint=http://qwer/live/customer&rsakey=" + b64EncodeUnicode(myInfo.supporterRsaPublicKey));
                setInterval(function () {
                    var j = {data: {viewerCount: participantIds.length + 1}};
                    supporterEncryptAgent(CMD.INTERVAL_INFO, j);
                    viewerCount.textContent = j.data.viewerCount;
                }, 5000);
            } else {
                toast.error("ارسال اطلاعات به سرور با خطا روبرو شد لطفا اتصال اینترنت خود را چک کنید و دوباره به برگزاری لایو اقدام فرمایید");
                destroySession();
            }
        });
    } else {
        toast.error("بدرستی به اتاق متصل نشدید لطفا دوباره برای ورود به اتاق اقدام فرمایید");
    }
}
function destroySession() {
    trio.destroyServer();
    pmDiv.classList.add(hide);
    getBackToProfile();
}
var currentParticipantRoomId = -1;
function videoElemCallback(isLocalStream, isGone, remoteFeed) {
    console.log("============== videoElemCallback ==============", "isLocalStream:" + isLocalStream, "isGone:" + isGone, "remoteFeed:", remoteFeed);
    if (!isGone) {
    var isSupporterJoined = remoteFeed ? remoteFeed.rfdisplay === "s" : true;
    var id = remoteFeed ? remoteFeed.rfid : 0;
    if ((amICustomer && (isLocalStream || (isTalkRightNow && isSupporterJoined) || (!isSupporterJoined && (currentParticipantRoomId === -1 || currentParticipantRoomId === id)))) ||
//            (!amICustomer && id && id !== trio.userRoomId)) {
    (!amICustomer && id && id === currentParticipant.userRoomId)) {
//        var c = customerVideo.classList;
//        if (isGone) {
////            c.add(hide);
////            currentParticipantRoomId = -1;
//        } else {
//            c.remove(hide);
//            currentParticipantRoomId = isLocalStream ? -1 : remoteFeed.rfid;
//            cleanChatBox();
//        }

            customerVideo.classList.remove(hide);
            currentParticipantRoomId = isLocalStream ? -1 : remoteFeed.rfid;
            cleanChatBox();
        }
    }
}
function sendMsgCallback(msg, isMyOwn) {
//    console.log("============== sendMsgCallback ==============", "msg:", msg, "isMyOwn:", isMyOwn);
}
function receiveMsgCallback(msg, id) {
    console.log("============== receiveMsgCallback ==============", "msg:", msg, "isMyOwn:", id);
    processReceivedMsg(msg, id);
}
function outOfCapacityRoomCallback() {
    console.log("============== outOfCapacityRoomCallback ==============");
}
function participantCounterCallback(id, isJoin) {
    console.log("============== participantNumber:", "isJoin", isJoin, "id", id);
    if (id) {
        if (isJoin && !participantIds.includes(id)) {
            participantIds.push(id);
        } else if (!isJoin && participantIds.includes(id)) {
            if (typeof currentParticipant !== 'undefined' && currentParticipant.userRoomId === id) {
                currentParticipant = null;
                        
             customerVideo.classList.add(hide);
            currentParticipantRoomId = -1;
            
                toast.error("ارتباط مشتری جاری قطع شد");
                cleanChatBox();
            }
            participantIds = participantIds.filter(function (e) {
//                console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ filter id:",id," e:",e,id===e);
                return e !== id;
            })
        }
    }
}













//in this object I store talk requests in queue
// {   { time:312341232, userRoomId:32123-3213-321-32131", talkSession:"31fdsfe3d", publicKey:"sdfsrweredf", statisticsSummary:{},  }   }
var talkWaitingQueue = [];
// this is who talking right now with supporter
//var currentParticipant={talkSession:"customer_talksession"};
var viewerTalkInfo = [];
var ttest;
function processReceivedMsg(j, id) {
    try {
        j = JSON.parse(j);
        ttest = j;
        console.log(processReceivedMsg.name, j, id);
        if (checkReceivedMsgIsHealthy(j, id)) {
            if (j.isEnc) {
                if (j.enc === "rsa") {
                    j.data = rsaDecrypt(j.data);
                } else if (j.enc === "rc4") {
//                    var viewer = findInArray(viewerTalkInfo, "talkSession", j.data.talkSession);
                    var viewer = findInArray(viewerTalkInfo, "userRoomId", id);
                    j.data = viewer ? rc4(viewer.pass, b64DecodeUnicode(j.data)) : null;
                }
            }
            if (j.data) {
                j.data = JSON.parse(j.data);
                console.log("++++++++++++++++++++++++++ before switch case", j);
                if (j.data.z === 9) {
                    switch (j.cmd) {
//                        case CMD.PUBLIC_MSG.cmd:
                        case CMD.PRIVATE_MSG.cmd:
                            writeMsgToChatList(j, 0);
                            break;
                        case CMD.MSG_ACK.cmd:
//                            console.log("+++++++++++++++++++++++ CMD.MSG_ACK.cmd +++++++++ currentMyMsg",currentMyMsg);
                            ackMsgCallback(j);
                            break;
                        case CMD.REMOVE_TALK_REQUEST.cmd:
                            removeTalkWaitingQueue(j.data);
                            break;
                        case CMD.SET_TALK_REQUEST.cmd:
                            setTalkWaitingQueue(j.data, id);
                            break;
                        case CMD.VIEWER_STATISTICS_ACK.cmd:
                            viewerStatisticsAck(j.data);
                            break;
                        case CMD.VIEWER_IS_EXIST_ACK.cmd:
                            viewerIsExistAck(j.data);
                            break;
                        case CMD.SET_PARTICIPANT_PASS.cmd:
                            console.log("++++++++++++++++++++++++++ CMD.SET_PARTICIPANT_PASS.cmd", j);
                            // {userRoomId:xxx-xx-xxxx, isRsa:true, cmd: CMD.SET_PARTICIPANT_PASS, data:{pass: talkPass, talkSession: myInfo.talkSession}}
                            if (j.data.pass && j.data.talkSession) {
                                viewerTalkInfo = removeInArray(viewerTalkInfo, "talkSession", j.data.talkSession);
                                j.data.userRoomId = id;
                                viewerTalkInfo.push(j.data);
                                var res = {receiverId: id, data: {talkSession: j.data.talkSession, state: "ok"}};
                                supporterEncryptAgent(CMD.PARTICIPANT_PASS_ACK, res);
                            }
                            break;
                        case CMD.ACCEPT_VIEWER_TALK_ACK.cmd:
                            if (currentParticipant && currentParticipant.userRoomId === id && currentParticipant.talkSession === j.data.talkSession) {
                                talkWaitingQueue = removeInArray(talkWaitingQueue, "talkSession", currentParticipant.talkSession);
                                toast.success("مشتری با شماره " + currentParticipant.talkNumber + " به گفتگو پیوست");
                                clearTalkLock();
                                closeDialog();
                            } else {
                                toast.info("");
                            }
                            break;

                        default :
                    }
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
}
function checkReceivedMsgIsHealthy(j, id) {
    var flag = false;
    if (j.cmd && j.userRoomId && j.userRoomId === id && j.data) {
        Object.keys(CMD).some(function (e) {
            var c = CMD[e];
//            console.log("checkReceivedMsgIsHealthy ", c);
            if (c.cmd === j.cmd) {
                flag = c.isEnc === j.isEnc && c.enc === j.enc;
                return true;
            }
        })
    }
    return flag;
}
function removeTalkWaitingQueue(data) {
    if (data.talkSession) {
        var viewer = findInArray(viewerTalkInfo, "talkSession", data.talkSession);
        if (viewer) {
            var waitViewer = findInArray(talkWaitingQueue, "talkSession", data.talkSession);
            var j = {receiverId: waitViewer.userRoomId, data: {talkSession: data.talkSession}};
            if (waitViewer) {
                j.data.state = "remove";
                talkWaitingQueue = removeInArray(talkWaitingQueue, "talkSession", data.talkSession);
            } else {
                j.data.state = "error";
                j.data.msg = "شما در لیست انتظار مشاوره قرار نگرفته اید";
            }
            supporterEncryptAgent(CMD.TALK_RESPONSE_ACK, j);
        }
    }
}
function setTalkWaitingQueue(data, id) {
    if (data.talkSession) {
        var viewer = findInArray(viewerTalkInfo, "talkSession", data.talkSession);
        if (viewer) {
            var waitViewer = findInArray(talkWaitingQueue, "talkSession", data.talkSession);
            var j = {data: {talkSession: data.talkSession}};
            if (waitViewer) {
                j.data.state = "exist";
                j.data.talkNumber = waitViewer.talkNumber;
                j.receiverId = waitViewer.userRoomId;
            } else {
                data.time = new Date() * 1;
                data.talkNumber = talkNumber++;
                data.userRoomId = viewer.userRoomId;
                j.data.state = "ok";
                j.data.talkNumber = data.talkNumber;
                j.receiverId = id;
                talkWaitingQueue.push(data);
            }
            supporterEncryptAgent(CMD.TALK_RESPONSE_ACK, j);
        }
    }
}
function removeTalkRequestToCustomer(talkSession) {
    if (talkSession) {
        var waitViewer = findInArray(talkWaitingQueue, "talkSession", talkSession);
        talkWaitingQueue = removeInArray(talkWaitingQueue, "talkSession", talkSession);
        var j = {receiverId: waitViewer.userRoomId, data: {talkSession: talkSession}};
        supporterEncryptAgent(CMD.REMOVE_TALK_REQUEST, j);
        toast.info("درخواست گفتگوی مشتری به شماره " + waitViewer.talkNumber + " حذف شد");
        closeDialog();
    }
}
function checkViewerStatistics(talkSession) {
    var viewer = findInArray(viewerTalkInfo, "talkSession", talkSession);
    if (viewer && viewer.pass) {
        var j = {receiverId: viewer.userRoomId, data: {talkSession: talkSession}};
        console.log("checkViewerStatistics", viewer, j);
        supporterEncryptAgent(CMD.VIEWER_STATISTICS_REQUEST, j);
    } else {
        toast.error("این بیننده در لیست شما موجود نیست");
    }
}
function viewerStatisticsAck(data) {
    if (currentParticipant.talkSession === data.talkSession && data.state === "ok") {
        //data.statistics = [[hash,link,title,image,totalTime,days],...]
        visitedItemList = data.statistics;
        receiveStatisticsResponse();
        console.log(" viewerStatisticsAck ", data);
    }
}
function checkViewerIsExist(talkSession) {
    var viewer = findInArray(viewerTalkInfo, "talkSession", talkSession);
    if (viewer && viewer.pass) {
        var j = {receiverId: viewer.userRoomId, data: {talkSession: talkSession}};
        console.log("checkViewerIsExist", viewer, j);
        supporterEncryptAgent(CMD.CHECK_VIEWER_IS_EXIST, j);
        toast.info("درخواست بررسی حضور مشتری در اتاق ارسال شد اگر پاسخی دریافت نشد مشتری حضور ندارد");
    } else {
        toast.error("این بیننده در لیست شما موجود نیست و میتوانید آنرا حذف کنید");
    }
}
function viewerIsExistAck(data) {
    if (data.state === "ok") {
        console.log(" viewerIsExistAck ", data.talkSession, data.state);
        var waitViewer = findInArray(talkWaitingQueue, "talkSession", data.talkSession);
        toast.success("مشتری در انتظار گفتگو با شماره " + waitViewer.talkNumber + " در اتاق حضور دارد");
    }
}
function endParticipantTalk() {
    if (currentParticipant) {
        var j = {receiverId: currentParticipant.userRoomId, data: {talkSession: currentParticipant.talkSession, talkNumber: currentParticipant.talkNumber}};
        supporterEncryptAgent(CMD.VIEWER_TALK_END, j);
    } else {
        toast.error("اطلاعات مخاطب جاری گفتگو پیدا نشد");
    }
}

function supporterEncryptAgent(...o) {
//function supporterEncryptAgent(o) {
    try {
        var obj = {};
        o.forEach(function (e) {
//            obj = {...obj, ...e};
            obj = Object.assign(obj, e);
        });
//        console.log("supporterEncryptAgent obj total:", obj);
        if (obj.data) {
            obj.data.z = 9;
            var talkSession = obj.data.talkSession;
            obj.data = JSON.stringify(obj.data);
            if (obj.isEnc) {
                if (obj.enc === "rsa") {
                    obj.data = rsaEncrypt(obj.data);
                } else if (obj.enc === "rc4" && talkSession) {
                    console.log("supporterEncryptAgent obj total:", obj);
                    var viewer = findInArray(viewerTalkInfo, "talkSession", talkSession);
                    console.log("supporterEncryptAgent viewer:", viewer, "talkSession ", talkSession);
                    obj.data = viewer ? b64EncodeUnicode(rc4(viewer.pass, obj.data)) : null;
                } else {
                    obj.data = null;
                }
            }
            if (obj.data) {
                trio.sendDataChannel(obj);
            }
        }
    } catch (err) {
        console.error(err);
    }
}
//============================================ message send / receive ================================== END


//*** just for test :
//setTimeout(function () {
//    g("#test_participant_page").href = "http://localhost:8383/VideoRoom/live/live_page_participants_purejs.html#supporterid=" + trio.userRoomId;
//}, 3000)

function preSupporterLiveCheck() {
    var j = {title: ' برای ورود به اتاق آماده هستید ؟'};
    j.body = '<span>برای ورود به اتاق اجازه دسترسی به میکروفن و دوربین دستگاه شما مورد نیاز است</span>';
    j.control = '<span id="precheck_bt" class="button_ctr2 bg-css-blue bt"><i class="fas fa-walking"></i> بله اجازه میدهم و لایو را شروع میکنم</span>';
    showDialog(j);
    g("#precheck_bt").onclick = function () {
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
                        checkParams();
                        closeDialog();
                    } else {
                        getCamAndMicPermission(function (isAllowed) {
                            if (isAllowed) {
                                toast.success("اجازه دسترسی داده شده است، در حال اتصال به اتاق");
                                checkParams();
                                closeDialog();
                            } else {
                                closeDialog();
                                toast.error("اجازه دسترسی به میکروفن و یا دوربین وبکم بسته شده است لطفا از طریق راهنما دسترسی را فعال کنید");
                                var j = {notClose: true, title: ' راهنمای دسترسی میکروفن و دوربین:'};
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
    }
}
preSupporterLiveCheck();
