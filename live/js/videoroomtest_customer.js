var ttest;

var supporterCrypt = new JSEncrypt();
var trio;
var participantIds = [];
var firstCheck = g("#first_check");//, firstCheckTxt = g("#first_check p");
var talkObj = {talkPass: getRandom(20), isTalkReady: false, isTalkRightNow: false, isTalkWaitingNow: false, talkNumber: null,isTalkEnd:false,startTime:null};
//var myInfo = {talkSession: getRandom(1), userType: USER_TYPE.PARTICIPANT,rsaKey:null,myUserRoomId:null};
var myInfo = {isSupporterConnected: false};
//$(document).ready(function () {

function checkParams() {
    // url = ?baseurl=http://localhost:8383&siteid=3213&supporterid=3213&supporterroomid=312-31231-321-321&talksession=321dsadas&serversession=312bdfhsb&usertype=1&cap=6&host=ubun.tu&roomid=1234&token=token1234&pin=pin1234&endpoint=http://www.google.com/endpoint1/supporter&rsakey=-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQChsTH1BMLitw1i8tv5LODyBk6/\nhMWozT+YNHXN/7vJ5Z2T10bKM1vL2H+oUZy5XkrcaVqc16VJBz/apQ49cm52t+uo\nDbavYXRXO34dBYzvvk8Avt+buX24fsJ92tGApljOvRW82nT/qtmeRXEiXK8KB9NB\n7nv1zxYaLJy4C+TiKQIDAQAB\n-----END PUBLIC KEY-----
    var c = {};
    var urlParam = window.location.hash;
    if (urlParam && urlParam.length > 10 && urlParam.startsWith('#')) {
        urlParam = b64DecodeUnicode(urlParam.substr(1));
        if (urlParam) {
            urlParam = new URLSearchParams(urlParam);
            myInfo.siteId = Number(urlParam.get("siteid"));
            myInfo.supporterId = Number(urlParam.get("supporterid"));
            myInfo.supporterRoomId = urlParam.get("supporterroomid");
            myInfo.talkSession = urlParam.get("talksession");
            myInfo.serverSession = urlParam.get("serversession");
            myInfo.userType = Number(urlParam.get("usertype"));
            myInfo.rsaKey = b64DecodeUnicode(urlParam.get("rsakey"));
            myInfo.siteBaseUrl = urlParam.get("baseurl");
            myInfo.endpoint = urlParam.get("endpoint");

            c = {
                host: urlParam.get("host"),
                roomId: urlParam.get("roomid"),
                token: urlParam.get("token"),
                pin: urlParam.get("pin"),
                maxCap: Number(urlParam.get("cap")),
                isPublisher: false,
                isSupporter: false,
                videoElems: [g("#supporter_video video"), g("#customer_video video")],
                videoRoomCallback: videoRoomCallback,
                videoElemCallback: videoElemCallback,
                sendMsgCallback: sendMsgCallback,
                receiveMsgCallback: receiveMsgCallback,
                outOfCapacityRoomCallback: outOfCapacityRoomCallback,
                participantCounterCallback: participantCounterCallback,
                peerConnectionCallback: peerConnectionCallback,
                lostConnectionCallback:lostConnectionCallback
            }
//*** fake parameter for test :
//            myInfo.talkSession = getRandom(1);
//            myInfo.talkServer = getRandom(1);
//*** ^^^^ above parameter is for test
        }
    }
    ttest = c;
    if (myInfo.siteId && myInfo.supporterId && myInfo.supporterRoomId && myInfo.talkSession && myInfo.serverSession &&
            ([USER_TYPE.PARTICIPANT, USER_TYPE.GUEST_PARTICIPANT].includes(myInfo.userType)) &&
            myInfo.rsaKey && c.host && c.roomId && c.token && c.pin && c.maxCap) {
        trio = startLive(c);
    } else {
        toast.error("اطلاعات ورود به اتاق کامل نیست لطفا مجدد برای ورود اقدام فرمایید");
    }
}
function lostConnectionCallback(){
    if(!talkObj.isTalkEnd){
    getBackToProfile("ارتباط اینترنتی دچار مشکل شد و ارتباط با اتاق قطع است");
    }
}
function peerConnectionCallback(id) {
    console.log("============== peerConnectionCallback isOn? ============== id:", id);
    if (amICustomer && !myInfo.isSupporterConnected && id === myInfo.supporterRoomId) {
        myInfo.isSupporterConnected = true;
        new Promise(function () {
            var passInterval = setInterval(function () {
                if (talkObj.isTalkReady) {
                    clearInterval(passInterval);
                } else {
                    setPasswordToSupporter();
                }
            }, 3000);
        })
    }
}

function videoRoomCallback(myId) {
    console.log("============== videoRoomCallback I'm joined successfully ==============", "myId:" + myId);
    if (myId) {
        myInfo.myUserRoomId = myId;
        supporterCrypt.setPublicKey(myInfo.rsaKey);
    } else {
        toast.error("بدرستی به اتاق متصل نشدید لطفا دوباره برای ورود به اتاق اقدام فرمایید");
    }
}
var currentParticipantRoomId = -1;
function videoElemCallback(isLocalStream, isGone, remoteFeed) {
//    //***just for test
//    if (remoteFeed) {
//        console.log("remoteFeed: ", JSON.stringify(remoteFeed));
//    }
    var isSupporterJoined = remoteFeed ? remoteFeed.rfdisplay === "s" : true;
    var id = remoteFeed ? remoteFeed.rfid : 0;
    console.log("============== videoElemCallback ==============", "isLocalStream:" + isLocalStream, "isGone:" + isGone, // "remoteFeed:", remoteFeed,
            "id", id, "isSupporterJoined", isSupporterJoined);
    if ((amICustomer && (isLocalStream ||
            (talkObj.isTalkRightNow && isSupporterJoined) || (!isSupporterJoined && (currentParticipantRoomId === -1 || currentParticipantRoomId === id)))) ||
            (!amICustomer && id && id !== trio.userRoomId)) {
        var c = customerVideo.classList;
        if (isGone) {
            c.add(hide);
            currentParticipantRoomId = -1;
        } else {
            c.remove(hide);
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
   getBackToProfile("ظرفیت اتاق تکمیل است لطفا زمان دیگری برای ورود اقدام کنید یا بعدا از مشاور بخواهید که ظرفیت اتاق را افزایش دهد");
}
function participantCounterCallback(id, isJoin) {
    console.log("============== participantNumber:", "isJoin", isJoin, "id", id);
    if (id) {
        if (isJoin && !participantIds.includes(id)) {
            participantIds.push(id);
        } else if (!isJoin && participantIds.includes(id)) {
            if (typeof currentParticipant !== 'undefined' && currentParticipant.userRoomId === id) {
                currentParticipant = null;
            }
            participantIds = participantIds.filter(function (e) {
                return e !== id;
            })
        }
    }
}

function rsaEncrypt(msg) {
    if (supporterCrypt.key.n) {
        return supporterCrypt.encrypt(msg);
    }
    toast.error("اطلاعات بدرستی دریافت نشده است لطفا این صفحه را ببندید و دوباره برای ورود به اتاق مشاوره اقدام نمایید");
    //*** destroy janus and redirect ro profile page 
    return null;
}
function processReceivedMsg(j, id) {
    try {
        j = JSON.parse(j);
        ttest = j;
        console.log(processReceivedMsg.name, j, id);
        if (checkReceivedMsgIsHealthy(j, id)) {
            if (j.isEnc) {
                if (j.enc === "rc4") {
                    j.data = rc4(talkObj.talkPass, b64DecodeUnicode(j.data));
                } else {
                    j.data = null;
                }
            }
            console.log(processReceivedMsg.name, j, id);
            if (j.data) {
                j.data = JSON.parse(j.data);
                if (j.data.z === 9) {
                    switch (j.cmd) {
                        case CMD.INTERVAL_INFO.cmd:
                            getIntervalInfo(j.data);
                            supporterAliveTime = new Date() * 1;
                            break;
                        case CMD.PUBLIC_MSG.cmd:
                        case CMD.PRIVATE_MSG.cmd:
                            writeMsgToChatList(j);
                            break;
                        case CMD.MSG_ACK.cmd:
                            ackMsgCallback(j);
                            break;
                        case CMD.PUBLISH_CUSTOMER_MSG.cmd:
                            if (!talkObj.isTalkRightNow) {
                                writeMsgToChatList(j);
                            }
                            break;
                        case CMD.TALK_RESPONSE_ACK.cmd:
                            if (j.data.talkSession === myInfo.talkSession) {
                                if (j.data.state === "ok") {
                                    setTalkState(1, j);
                                    toast.success("با موفقیت در لیست انتظار گفتگو با شماره " + talkObj.talkNumber + " قرار گرفته اید");
                                } else if (j.data.state === "exist") {
                                    setTalkState(1, j);
                                    toast.info("هم اکنون در لیست انتظار مشاوره با شماره " + talkObj.talkNumber + " قرار دارید و نیازی به درخواست مجدد نیست");
                                } else if (j.data.state === "remove") {
                                    setTalkState(0);
                                } else if (j.data.state === "error") {
                                    setTalkState(0);
//                                    isTalkWaitingNow=false;
                                    if (j.data.msg) {
                                        toast.error(j.data.msg);
                                    }
                                }
                            }
                            break;
                        case CMD.VIEWER_STATISTICS_REQUEST.cmd:
                            if (j.data.talkSession === myInfo.talkSession) {
                                var j = {data: {talkSession: myInfo.talkSession, state: "ok"}};
                                j.data.statistics = getStatisticData();
                                participantEncryptAgent(CMD.VIEWER_STATISTICS_ACK, j);
                            }
                            break;
                        case CMD.CHECK_VIEWER_IS_EXIST.cmd:
                            if (j.data.talkSession === myInfo.talkSession) {
                                var j = {data: {talkSession: myInfo.talkSession, state: "ok"}};
                                participantEncryptAgent(CMD.VIEWER_IS_EXIST_ACK, j);
                            }
                            break;
                        case CMD.PARTICIPANT_PASS_ACK.cmd:
                            if (j.data.state === "ok") {
                                talkObj.isTalkReady = true;
                                toast.success("به اتاق مشاوره متصل شدید ، خوش آمدید");
                                firstCheck.classList.add("hide");
                            }
                            break;
                        case CMD.ACCEPT_VIEWER_TALK.cmd:
                            if (talkObj.talkNumber && j.talkNumber === talkObj.talkNumber && j.data.talkSession === myInfo.talkSession) {
                                startToTalk();
                            }
                            break;
                        case CMD.VIEWER_TALK_END.cmd:
                            if (talkObj.talkNumber && j.data.talkNumber === talkObj.talkNumber) {
                                talkObj.isTalkEnd=true;
                                setEndTalk();
                            }
                            break;
                        case CMD.REMOVE_TALK_REQUEST.cmd:
                            if (j.data.talkSession === myInfo.talkSession) {
                                setTalkState(0);
                                toast.info("کارشناس مشاور شما را از لیست انتظار برای گفتگو حذف کرد");
                            }
                            break;
                        case CMD.CLEAN_CHAT_BOX.cmd:
                            cleanChatBox();
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
    if (j.cmd && j.userRoomId && j.userRoomId === id && id === myInfo.supporterRoomId && j.data &&
            (!j.isDirectional || (j.isDirectional && trio.userRoomId === j.receiverId))) {
        Object.keys(CMD).some(function (e) {
            var c = CMD[e];
//            console.log("checkReceivedMsgIsHealthy ",c);
            if (c.cmd === j.cmd) {
                flag = c.isEnc === j.isEnc && c.enc === j.enc;
                return true;
            }
        })
    }
    console.log("checkReceivedMsgIsHealthy", j, flag);
    return flag;
}
function setPasswordToSupporter() {
    if (!talkObj.isTalkReady && talkObj.talkPass && talkObj.talkPass.length > 20) {
        var j = {data: {pass: talkObj.talkPass, talkSession: myInfo.talkSession}};
        console.log("sendTalkPasswordToSupporter", j);
        participantEncryptAgent(CMD.SET_PARTICIPANT_PASS, j);
    } else {
        toast.error("رمز عبور مخصوص مکالمه ساخته نشده لطفا دوباره وارد اتاق مشاوره شوید");
    }
}
function setTalkState(isSuccessful, j) {
    var btClassList = g("i", addRemoveTalkBt).classList;
    if (isSuccessful && j.data.talkNumber) {
        btClassList.remove("fa-hand-pointer");
        btClassList.add("fa-minus-circle");
        talkObj.isTalkWaitingNow = true;
        talkObj.talkNumber = j.data.talkNumber;
        g("span", talkNumberDiv).textContent = talkObj.talkNumber;
        talkNumberDiv.classList.remove(hide);
    } else {
        btClassList.remove("fa-minus-circle");
        btClassList.add("fa-hand-pointer");
        talkObj.isTalkWaitingNow = false;
        talkObj.talkNumber = null;
        talkNumberDiv.classList.add(hide);
        toast.info("از لیست انتظار مشاوره حذف شدید");
    }
}
function setEndTalk() {
//    var j ={data:{talkSession:myInfo.talkSession,talkNumber:talkObj.talkNumber}};
//    trio.unpublishOwnFeed();
    trio.destroyServer();
    pmDiv.classList.add(hide);
    talkNumberDiv.classList.add(hide);
    talkObj.talkNumber = null;
    talkObj.isTalkRightNow = false;
    cleanChatBox();
    toast.info("مشاوره به انتها رسید");
    if(myInfo.userType===USER_TYPE.PARTICIPANT&& new Date()*1-talkObj.startTime>180000){//3 minutes 180000
        toast.success("به این مشاوره چه امتیازی میدهید ؟");
         setEfficiencyScore(openFavoriteList);
    }else{
    openFavoriteList();
    }
//    trio. publishOwnFeed(false);
//    participantEncryptAgent(CMD.VIEWER_TALK_END_ACK,j);
}
function openFavoriteList(){
    var j = {notClose:true,title: ' اتمام مشاوره'};
    j.body='<span> مشاوره به انتها رسیده است آیا میخواهید لیست محصولات منتخب را مشاهده کنید؟ در غیر اینصورت میتوانید صفحه را ببندید</span>'
    j.control = '<span id="open_favorite_list_bt" class="button_ctr2 bg-css-blue bt"><i class="fas fa-heart"></i> بله نشونم بده</span>'+
            '<span id="close_page_bt" class="button_ctr2 bg-css-orangered bt"><i class="fas fa-door-open"></i> صفحه را ببندید</span>';
    showDialog(j);
    g("#open_favorite_list_bt").onclick = function () {
            openLinkInCurrentTab("./favorite_list.html");
    }    
    g("#close_page_bt").onclick = function(){getBackToProfile();}
}
function startToTalk() {
    closeDialog();
    var t1 = new Date() * 1;
    var j = {title: ' تا 7 ثانیه گفتگو کردن با کارشناس را تایید کنید'};
    j.control = '<span id="talk_apply_bt" class="button_ctr2 bg-css-green bt"><i class="fas fa-walking"></i> شروع به گفتگو</span>';
    showDialog(j);
    g("#talk_apply_bt").onclick = function () {
        if (((new Date() * 1) - t1) < 7500) {
            trio.publishOwnFeed(true);
            pmDiv.classList.remove(hide);
            var j = {data: {state: "ok", talkNumber: talkObj.talkNumber, talkSession: myInfo.talkSession}};
            participantEncryptAgent(CMD.ACCEPT_VIEWER_TALK_ACK, j);
            talkObj.isTalkRightNow = true;
            talkObj.isTalkWaitingNow = false;
            talkObj.startTime=new Date()*1;
            var btClassList = g("i", addRemoveTalkBt).classList;
            btClassList.remove("fa-minus-circle");
            btClassList.add("fa-hand-pointer");
            talkNumberDiv.classList.add(hide);
        } else {
            toast.error("تایید کردن گفتگو بیشتر از 7 ثانیه طول کشید و درخواست رد شد");
        }
        closeDialog();
    }
}
function setTalkRequestToSupporter() {
    toast.info("درخواست گفتگو در حال بررسی است و ممکن است کمی طول بکشد لطفا صبور باشید");
    if (!talkObj.isTalkWaitingNow) {
        if (talkObj.isTalkReady && talkObj.talkPass && talkObj.talkPass.length > 20) {
            
            
            
            
            
            
            
            
            var statistics = getStatisticData();
            if (statistics) {
                var qty = 0, time = 0;
                statistics.forEach(function (e) {
                    qty++;
                    time += e[4]
                });
                var j = {data: {talkSession: myInfo.talkSession, itemCount: qty, totalDuration: time * 1000, userType: myInfo.userType}};
                console.log("sendTalkPasswordToSupporter", j);
                participantEncryptAgent(CMD.SET_TALK_REQUEST, j);
            } else {
                toast.info("لطفا ابتدا از صفحات محصول در سایت بازدید کنید و چنانچه نیاز به مشاوره بود درخواست گفتگو دهید");
            }
            
            
            
            
            
            
        } else {
            toast.error("رمز عبور مخصوص مکالمه ساخته نشده لطفا دوباره وارد اتاق مشاوره شوید");
        }
    } else {
        toast.error("در حال حاضر شما در لیست انتظار مشاوره هستید لطفا منتظر بمانید تا برای مشاوره انتخاب شوید");
    }
}
function removeTalkRequestToSupporter() {
    if (talkObj.isTalkWaitingNow) {
        if (talkObj.isTalkReady && talkObj.talkPass && talkObj.talkPass.length > 20) {
            var j = {data: {talkSession: myInfo.talkSession}};
            console.log("sendTalkPasswordToSupporter", j);
            participantEncryptAgent(CMD.REMOVE_TALK_REQUEST, j);
        } else {
            toast.error("رمز عبور مخصوص مکالمه ساخته نشده لطفا دوباره وارد اتاق مشاوره شوید");
        }
    } else {
        toast.error("در حال حاضر شما در لیست انتظار مشاوره قرار ندارید");
    }
}
function participantEncryptAgent(...o) {
//function participantEncryptAgent(o) {
    try {
        var obj = {};
        o.forEach(function (e) {
//            obj = {...obj, ...e};
            obj = Object.assign(obj, e);
        });
        if (obj.data) {
            obj.data.z = 9;
            console.log("participantEncryptAgent obj:", obj);
            obj.data = JSON.stringify(obj.data);
            if (obj.isEnc) {
                console.log("+++++++++++++++++++++ participantEncryptAgent obj.data:", obj);
                if (obj.enc === "rsa") {
                    obj.data = rsaEncrypt(obj.data);
                } else if (obj.enc === "rc4") {
                    obj.data = b64EncodeUnicode(rc4(talkObj.talkPass, obj.data));
                } else {
                    obj.data = null;
                }
            }
            if (obj.data) {
                trio.sendDataChannel(obj);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

//============================================ message send / receive ================================== END

// *** just for test : 
//setTimeout(function(){
//    setSupporterInfo(getHashParameterValue("supporterid"));
//console.log(getHashParameterValue("supporterid"));
//},2000);
    var supporterAliveInterval, supporterAliveTime = new Date() * 1;
    supporterAliveInterval = setInterval(function () {
        if (supporterAliveTime + 20000 < new Date() * 1) {
            clearInterval(supporterAliveInterval);
            trio.destroyServer();
            if(!talkObj.isTalkEnd){
            getBackToProfile(" ارتباط کارشناس مشاور قطع شد و اتاق نا معتبر است، لطفا از اتاق خارج شوید و زمانی که کارشناس مجددا لایو را برگزار کرد وارد اتاق شوید");
        }
    }
    }, 11000);

checkParams();
