//room: ["http://ubun.tu:8088/janus", 1234, "token1234", "pin1234","displayname"]

function sendDataChannel(msg, callback) {
    console.log("sendDataChannel", " msg: " + msg);
    handler[0].data({
//    myOwnHandler.data({
        text: JSON.stringify(msg),
        error: function (reason) {
//            alert(reason);
            if (callback) {
                callback(false, reason);
            }
        },
        success: function () {
            if (callback) {
                callback(true, msg);
            }
//            console.log("message is sent");
//            setMsgProcess(msg, true);
//            chatInput.val('');
        }
    });
}


function receiveDataChannel(json) {
    console.log("received msg is : ", json);
    decapsulateMsg(json);
}

function streamingIsUp(d) {
    console.log("ctreamingIsUp function", d);
    if (d.status == 200) {
        firstCheck.classList.add("hide");
    }
    if (d.msg) {
        toast.success(d.msg);
    }
}

var //janus, handler, 
        janus = [null, null], handler = [null, null], /*myOwnHandler,*/
        plugin = Object.freeze({VIDEOROOM: "janus.plugin.videoroom", STREAMING: "janus.plugin.streaming"}),
        videoElem = [g("#supporter_video video"), g("#customer_video video")],
        nameElem = [g("#supporter_video .name"), g("#customer_video .name")],
        roomCap = 2, //roomServer = "http://ubun.tu:8088/janus",
        opaqueId = "l-" + Janus.randomString(12),
        returnedMyId = null, mypvtid = null, feeds = [], bitrateTimer = [],
//        sellerName = g("#supporter_video .name"), sellerVideo = g("#supporter_video video"),
//        customerName = g("#customer_video .name"), customerVideo = g("#customer_video video"),
        customerBitrate = g("#customer_video .speed"), displayName, mystream = null,
        firstCheck = g("#first_check"), firstCheckTxt = g("#first_check p");

//var pinVal = "pin12345", tokenVal = "token12345";//, userIdVal = (Math.floor(Math.random() * 100) + 1)
//        , roomIdVal = 1234, usernameVal = "usernameVal" + Janus.randomString(1), videoRoomHandle;

function destroyServer(idx) {
    if (janus[idx] && janus[idx].isConnected()) {
        janus[idx].destroy();
    }
}

//==================================== Start Of VideoRoom ======================================================
function videoRoomInit(address, idx, roomId, token, pin, name) {
    Janus.init({
        debug: "all",
//        debug: false,
        callback: function () {
            if (!Janus.isWebrtcSupported()) {
                showAlert("این مرورگر از امکانات لایو پشتیبانی نمیکند", "لطفا از مرورگرهای بهتر مثل کروم بروز استفاده کنید");
                return;
            }
            janus = new Janus({
//                server: myInfo.videoRoomAddress,
                server: address,
                success: function () {
                    attachRoom(idx, roomId, token, pin, name);
                },
                error: function (error) {
                    console.error(error);
                    toast.error("ارتباط با سرور میسر نیست ، اینترنت رو چک کن ببین وصله و دوباره اقدام کن");
                    runAfterDelay(function () {
                        //*** can to redirect to profile of site                        
//***                        window.location.reload()
                    });
                },
                destroyed: function () {
                    toast.error("اتاق بسته میشود");
                    runAfterDelay(function () {
                        //*** can to redirect to profile of site
//***                        window.location.reload()
                    });
                }
            })
        }});
}
function attachRoom(idx, roomId, token, pin, name) {
    janus.attach({
        plugin: plugin.VIDEOROOM,
        opaqueId: opaqueId,
        success: function (h) {
            handler[idx] = h;
            Janus.log("Plugin attached! (" + handler[idx].getPlugin() + ", id=" + handler[idx].getId() + ")");
            Janus.log("  -- This is a publisher/manager");
            var join = {"request": "join", "room": roomId, "ptype": "publisher",
                "token": token, "pin": pin, "display": name};
            Janus.log(join);
            handler[idx].send({"message": join});
        },
        error: function (error) {
            console.error("  -- Error attaching plugin...", error);
            showAlert("انگار وصل نمیشه", "اینترنت را چک کنید که قطع نباشه، یکمی صبر کن دوباره امتحان کن اگر وصل نشد منتظر باش که مشکل رو برطرف کنیم ");
        },
        consentDialog: function (on) {
            Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
            if (on) {
                //*** see on original code of videoroom.js
            }
        },
        mediaState: function (medium, on) {
            Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
        },
        webrtcState: function (on) {
            Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
            if (!on)
                return;
//            togglePublishBt(true, attachRoom.name + " > webrtcState ");
        },
        onmessage: function (msg, jsep) {
            Janus.debug(" ::: Got a message (publisher) :::");
            Janus.debug(msg);
            var event = msg["videoroom"];
            Janus.debug("Event: " + event);
            if (event != undefined && event != null) {
                if (event === "joined") {
                    // Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
                    returnedMyId = msg["id"];
                    mypvtid = msg["private_id"];
                    Janus.log("Successfully joined room " + msg["room"] + " with ID " + returnedMyId);
                    console.log("publisher ID: ", returnedMyId, "myPvtId: ", mypvtid);
                    createOfferAndPublishOwnFeed(idx);
                    orchesterSend({"cmd": SUPPORTER_CMD.REQUEST_VIDEO_ROOM_PUBLISHER_ID_FOR_STREAMING, "supporterVideoRoomId": returnedMyId}, streamingIsUp);
//                    // Any new feed to attach to?
//                    if (msg["publishers"] !== undefined && msg["publishers"] !== null) {
//                        var list = msg["publishers"];
//                        if (list.length > 1) {
//                            toast.success('یک نفر به گفتگو پیوست');
//                        } else if (list.length == 1) {
//                            Janus.debug("Got a list of available publishers/feeds:");
//                            Janus.debug(list);
//                            Janus.log("Got a list of available publishers/feeds:");
//                            Janus.log(list);
//                            var id = list[0]["id"];
//                            var displayName = list[0]["display"];
//                            var audio = list[0]["audio_codec"];
//                            var video = list[0]["video_codec"];
//                            Janus.debug("  >> [" + id + "] " + displayName + " (audio: " + audio + ", video: " + video + ")");
//                            newRemoteFeed(id, displayName, audio, video);
//                        }
//                    }
// Any new feed to attach to?
                    if (msg["publishers"]) {
                        var list = msg["publishers"];
                        Janus.debug("Got a list of available publishers/feeds:", list);
                        for (var f in list) {
                            var id = list[f]["id"];
                            var display = list[f]["display"];
                            var audio = list[f]["audio_codec"];
                            var video = list[f]["video_codec"];
                            Janus.debug("  >>>>>> event === joined >>>>>> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                            console.log("  >>>>>> event === joined >>>>>> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                            newRemoteFeed(id, display, audio, video);
                        }
                    }

                } else if (event === "destroyed") {
                    // The room has been destroyed
                    Janus.warn("The room has been destroyed!");
                    toast.success('لایو تمام شد');
//*** go to site profile after 3seconds    window.location.reload();
                    runAfterDelay(function () {
                        //*** can to redirect to profile of site
                        window.location.reload()
                    });
                } else if (event === "event") {

//                    // Any new feed to attach to?
//                    if (msg["publishers"] !== undefined && msg["publishers"] !== null) {
//                    
//                        var list = msg["publishers"];
//                        if (list.length > 0) {
//                            toast.success('یک نفر به گفتگو پیوست');
////                        } else if (list.length == 1) {
//                            Janus.debug("Got a list of available publishers/feeds:");
//                            Janus.debug(list);
//                            var id = list[0]["id"];
//                            var displayName = list[0]["display"];
//                            var audio = list[0]["audio_codec"];
//                            var video = list[0]["video_codec"];
//                            Janus.debug("  >> [" + id + "] " + displayName + " (audio: " + audio + ", video: " + video + ")");
//                            newRemoteFeed(id, displayName, audio, video);
//                        }
                    // Any new feed to attach to?
                    if (msg["publishers"]) {
                        var list = msg["publishers"];
                        Janus.debug("Got a list of available publishers/feeds:", list);
                        for (var f in list) {
                            var id = list[f]["id"];
                            var display = list[f]["display"];
                            var audio = list[f]["audio_codec"];
                            var video = list[f]["video_codec"];
                            Janus.debug("  >>>>>> event === event >>>>>> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                            console.log("  >>>>>> event === event >>>>>> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                            newRemoteFeed(id, display, audio, video);
                        }

                    } else if (msg["leaving"]) {
//                        // One of the publishers has gone away?
//                        var leaving = msg["leaving"];
//                        Janus.log("Publisher left: " + leaving);
//                        if (feeds != null) {
//                            var remoteFeed = feeds;
//                            Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
//////*** customer is leaving and i can to spanding seller video
//                            feeds = null;
//                            remoteFeed.detach();
//                        }

                        // One of the publishers has gone away?
                        var leaving = msg["leaving"];
                        Janus.log("Publisher left: " + leaving);
                        var remoteFeed = null;
                        for (var i = 1; i < roomCap; i++) {
                            if (feeds[i] && feeds[i].rfid == leaving) {
                                remoteFeed = feeds[i];
                                break;
                            }
                        }
                        if (remoteFeed != null) {
                            Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                            // *** hide participant video element and supporter video element got bigger here 
                            feeds[remoteFeed.rfindex] = null;
                            remoteFeed.detach();
                        }

                    } else if (msg["unpublished"]) {
//                        // One of the publishers has unpublished?
//                        var unpublished = msg["unpublished"];
//                        Janus.log("Publisher left: " + unpublished);
//                        if (unpublished === 'ok') {
//                            // That's us
//                            handler[idx].hangup();
//                            return;
//                        }
//                        if (feeds != null) {
//                            var remoteFeed = feeds;
//                            Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
////                            $('#remote' + remoteFeed.rfindex).empty().hide();
////                            $('#videoremote' + remoteFeed.rfindex).empty();
//                            feeds = null;
//                            remoteFeed.detach();
//                        }

                        // One of the publishers has unpublished?
                        var unpublished = msg["unpublished"];
                        Janus.log("Publisher left: " + unpublished);
                        if (unpublished === 'ok') {
                            // That's us
                            handler[idx].hangup();
                            return;
                        }
                        var remoteFeed = null;
                        for (var i = 1; i < roomCap; i++) {
                            if (feeds[i] && feeds[i].rfid == unpublished) {
                                remoteFeed = feeds[i];
                                break;
                            }
                        }
                        if (remoteFeed != null) {
                            Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                            // *** hide participant video element and supporter video element got bigger here 
                            feeds[remoteFeed.rfindex] = null;
                            remoteFeed.detach();
                        }


                    } else if (msg["error"] !== undefined && msg["error"] !== null) {
                        if (msg["error_code"] === 426) {
                            showAlert("مطمئنی با اطلاعات درست اومد؟", "بنظر میاد با تنظیمات اشتباه وارد اتاق شده اید یکبار دیگه برای ورود اقدام کن ببین درست میشه");
                        } else {
                            toast.error('مشکل پیش اومده دوباره تلاش کن اگر نشد به ما خبر بده مشکل رو بررسی کنیم');
                        }
                    }
                }
            }
            if (jsep !== undefined && jsep !== null) {
                Janus.debug("Handling SDP as well...");
                Janus.debug(jsep);
                Janus.log("Handling SDP as well...");
                Janus.log(jsep);
                Janus.log(msg);
                handler[idx].handleRemoteJsep({jsep: jsep});
                // Check if any of the media we wanted to publish has
                // been rejected (e.g., wrong or unsupported codec)
                var audio = msg["audio_codec"];
                if (mystream && mystream.getAudioTracks() && mystream.getAudioTracks().length > 0 && !audio) {
                    // Audio has been rejected
                    toastr.warning("Our audio stream has been rejected, viewers won't hear us");
                }
                var video = msg["video_codec"];
                if (mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
                    // Video has been rejected //*** i can to show video not showing state to user
                    toastr.warning("Our video stream has been rejected, viewers won't see us");
                    // Hide the webcam video
                }
            }
        },
        onlocalstream: function (stream) {
            console.log(" ::: Got a local stream :::");
            mystream = stream;
            Janus.debug(stream);
//            sellerName.textContent = displayName;
            nameElem[idx].textContent = displayName;
//            Janus.attachMediaStream(sellerVideo, stream);
//            sellerVideo.muted = "muted";
            Janus.attachMediaStream(videoElem[idx], stream);
            videoElem[idx].muted = "muted";
            var videoTracks = stream.getVideoTracks();
            if (videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
                // No webcam
//***          showAlert("وبکم پیدا نشد", "بدون وبکم که نمیشه ارتباط تصویری برقرار کرد");
            } else {
                //*** event for webcam is exist
            }
        },
        onremotestream: function (stream) {
            // The publisher stream is sendonly, we don't expect anything here
        },
        oncleanup: function () {
            Janus.log(" ::: Got a cleanup notification: we are unpublished now :::");
            mystream = null;
//            togglePublishBt(false, attachRoom.name + " > oncleanup ");
        }
    })
}
function createOfferAndPublishOwnFeed(idx) {
// Publish our stream
//*** sendMedia flag just used for test
    var sendMedia = true;
    handler[idx].createOffer({
        media: {audioRecv: false, videoRecv: false, audioSend: sendMedia, videoSend: sendMedia, data: true,
            "audio": true, "video": "lowres", "audiocodec": "opus", "videocodec": "vp8", "bitrate": 10000}, // Publishers are sendonly
        simulcast: false,
        simulcast2: false,
        success: function (jsep) {
            Janus.debug("Got publisher SDP!");
            Janus.debug(jsep);
            var publish = {"request": "configure", "audio": true, "video": true};
            Janus.log(publish);
            Janus.log(jsep);
            handler[idx].send({"message": publish, "jsep": jsep});
        },
        error: function (error) {
            console.error("WebRTC error:", error);
            toast.error("خطا هنگام برقراری ارتباط رخ داده لطفا از مرورگر کروم بروز استفاده کنید");
            createOfferAndPublishOwnFeed(idx);
        }
    });
}
function newRemoteFeed(id, displayName, audio, video) {
// A new feed has been published, create a new plugin handle and attach to it as a subscriber
    var remoteFeed = null;
    janus.attach({
        plugin: "janus.plugin.videoroom",
        opaqueId: opaqueId,
        success: function (pluginHandle) {
            remoteFeed = pluginHandle;
            remoteFeed.simulcastStarted = false;
            console.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
            console.log("  -- This is a subscriber");
            console.log("id: ", id, " myprvid: ", mypvtid);
            var subscribe = {"request": "join", "room": myInfo.videoRoomId, "ptype": "subscriber",
                "feed": id, "private_id": mypvtid, token: myInfo.token, pin: myInfo.pin};
            if (Janus.webRTCAdapter.browserDetails.browser === "safari" &&
                    (video === "vp9" || (video === "vp8" && !Janus.safariVp8))) {
                if (video) {
                    video = video.toUpperCase()
                }
                toast.error("مرورگر سافاری از همه قابلیت های لایو پشتیبانی نمیکند لطفا از مرورگر کروم بروز استفاده کنید");
                subscribe["offer_video"] = false;
            }
            remoteFeed.videoCodec = video;
            remoteFeed.send({"message": subscribe});
        },
        error: function (error) {
            console.error("  -- Error attaching plugin...", error);
            toast.error("خطا هنگام اتصال به سرور رخ داده دوباره تلاش کنید");
        },
        onmessage: function (msg, jsep) {
            Janus.debug(" ::: Got a message (subscriber) :::");
            Janus.debug(msg);
            Janus.log(" ::: Got a message (subscriber) :::");
            Janus.log(msg);
            var event = msg["videoroom"];
            Janus.debug("Event: " + event);
            if (msg["error"] !== undefined && msg["error"] !== null) {
//                alert(msg["error"]);
                toast.error("در هنگام دریافت پیام مشکلی پیش اومده بررسی کنید که پیام شما ارسال میشود و از طرف مقابل پیام دریافت میکنید یا نه");
            } else if (event != undefined && event != null) {
                if (event === "attached") {
//                    // Subscriber created and attached
//                    if (feeds === undefined || feeds === null) {
//                        feeds = remoteFeed;
//                        remoteFeed.rfindex = 1;
//                    }
//                    remoteFeed.rfid = msg["id"];
//                    remoteFeed.rfdisplay = msg["display"];
//                    Janus.log("Successfully attached to feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") in room " + msg["room"]);
//                    customerName.textContent = remoteFeed.rfdisplay;

// Subscriber created and attached
                    for (var i = 1; i < roomCap; i++) {
                        if (!feeds[i]) {
                            feeds[i] = remoteFeed;
                            remoteFeed.rfindex = i;
                            break;
                        }
                    }
                    remoteFeed.rfid = msg["id"];
                    remoteFeed.rfdisplay = msg["display"];

                    Janus.log("Successfully attached to feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") in room " + msg["room"]);
                    // *** set participant display name here 
                    // $('#remote' + remoteFeed.rfindex).removeClass('hide').html(remoteFeed.rfdisplay).show();

                } else if (event === "event") {
                    // Check if we got an event on a simulcast-related event from this publisher
                    var substream = msg["substream"];
                    var temporal = msg["temporal"];
                    if ((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
                        toast.error("خطای استریمی ، این خطا نباید رخ میداده پشتیبانی رو با خبر کنید");
                    } else {
//                            // What has just happened?
                    }
                }
            }

            if (jsep !== undefined && jsep !== null) {
                Janus.debug("Handling SDP as well...");
                Janus.debug(jsep);
                // Answer and attach
                remoteFeed.createAnswer({
                    jsep: jsep,
                    // Add data:true here if you want to subscribe to datachannels as well
                    // (obviously only works if the publisher offered them in the first place)
                    media: {audioSend: false, videoSend: false, data: true}, // We want recvonly audio/video
                    success: function (jsep) {
                        Janus.debug("Got SDP!");
                        Janus.debug(jsep);
                        var body = {"request": "start", "room": myInfo.videoRoomId};
                        remoteFeed.send({"message": body, "jsep": jsep});
                    },
                    error: function (error) {
                        console.error("WebRTC error:", error);
                        toast.error("هنگام دریافت ویدیوی طرف مقابل خطا بوجود آمد چک کنید که شرکت کننده لایو از مرورگر کروم بروز شده استفاده میکند");
                    }
                });
            }
        },
        webrtcState: function (on) {
            Janus.log("Janus says this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") is " + (on ? "up" : "down") + " now");
        },
        onlocalstream: function (stream) {
            // The subscriber stream is recvonly, we don't expect anything here
        },
        onremotestream: function (stream) {
            Janus.debug("Remote feed #" + remoteFeed.rfindex);
//            Janus.attachMediaStream(customerVideo, stream);
//*** when i changed seller/customerVideo to videoElem[] and when user is viewer/participant and supporter how to use videoElem members ?
            Janus.attachMediaStream(videoElem[1], stream);
            var videoTracks = stream.getVideoTracks();
            if (videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
                customerBitrate.textContent = "بدون تصویر";
            } else {
                customerBitrate.textContent = "";
            }
            if (Janus.webRTCAdapter.browserDetails.browser === "chrome" || Janus.webRTCAdapter.browserDetails.browser === "firefox" ||
                    Janus.webRTCAdapter.browserDetails.browser === "safari") {

//                var bitrate;//, width, height;

                if (bitrateTimer[remoteFeed.rfindex]) {
                    clearInterval(bitrateTimer[remoteFeed.rfindex]);
                    bitrateTimer[remoteFeed.rfindex] = null;
                }
                bitrateTimer[remoteFeed.rfindex] = setInterval(function () {
                    // Display updated bitrate, if supported
                    console.log("inside interval ", remoteFeed, " self interval id : ", this);
//                    bitrate = remoteFeed.getBitrate();
//                    customerBitrate.textContent = bitrate;
                    customerBitrate.textContent = remoteFeed.getBitrate();
                }, 10000);
//                alert(bitrateTimer[remoteFeed.rfindex]);
//                console.log("////////////////// INTERVAL //////////////////  ", remoteFeed.rfindex + " bitrateTimer : " + bitrateTimer);
            }
        },
        ondata: function (data) {
//                    Janus.debug("We got data from the DataChannel! " + data);
            console.log("We got data from the DataChannel! " + data);
            var json = JSON.parse(data);
            Janus.log("We got data from the DataChannel! " + json);
            if (json["error"] !== undefined && json["error"] !== null) {
                toast.error("هنگام دریافت پیام شرکت کننده مشکلی پیش اومد لطفا بگید دوباره پیام رو ارسال کنه");
            }
            else {
//                setMsgProcess(json, false);
                receiveDataChannel(json);
            }
        },
        oncleanup: function () {
            //*** when customer was gone i could to hide customer panel
            Janus.log(" ::: Got a cleanup notification (remote feed " + id + ") :::");
            console.log(" ::: Got a cleanup notification (remote feed " + id + ") :::");
//            console.log("////////////////// on Clean Up //////////////////", remoteFeed.rfindex + " bitrateTimer : " + bitrateTimer);
            if (bitrateTimer[remoteFeed.rfindex]) {
                clearInterval(bitrateTimer[remoteFeed.rfindex]);
                bitrateTimer[remoteFeed.rfindex] = null;
            }
        }
    });
}
//==================================== End Of VideoRoom ======================================================
//
//
function getRoomData() {
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('p')) {
        try {
            var p = urlParams.get('p').replaceAll(" ", "+");
            //*** remove url string query data in future
//            window.history.replaceState(null, null, window.location.pathname);
            p = b64DecodeUnicode(p);
            console.log("received query string1:" + p);
//        console.log("received query string2:",atob(p));
//            p = rc4(location.pathname, atob(p));
//            p = rc4(location.origin, p);
            var j = JSON.parse(p);
//              { userType: 1-2-3-4 , pin : j.pin , orchester : j.orchester , mainSession : j.mainSession , talkSession : j. talkSession , 
//            { siteId: j.siteId, supporterSocialUserId: j.supporterSocialUserId, anonymousAllowed: j.anonymousAllowed,
//             videoRoomAddress: j.videoRoomAddress,
//              videoRoomId: j.videoRoomId, token: j.token, pin: j.pin, orchester: j.orchester, mainSession: j.mainSession, key: j.key, displayName: j.displayName}

            if (j) {
                myInfo = j;

                if (j.userType === USERTYPE.SUPPORTER && j.siteId && j.supporterSocialUserId && j.supporterId && j.videoRoomAddress && j.videoRoomId &&
                        j.token && j.pin && j.orchester && j.mainSession && j.key && j.displayName && j.anonymousAllowed !== undefined) {
                    //videoroom for supporter 
                    videoRoomInit(j.videoRoomAddress, 0, j.videoRoomId, j.token, j.pin, j.displayName);

                } else if ((j.userType === USERTYPE.AUTHENTICATED_PARTICIPANT || j.userType === USERTYPE.ANONYMOUS_PARTICIPANT) &&
                        j.orchester && j.siteId && j.supporterId && j.viewerLiveAddress && j.pin && j.streamAddress &&
                        j.streamId && j.mainSession && j.username !== undefined && j.amIAnonymous !== undefined && j.userId !== undefined) {
                    //stream for participant
                    streamInit(0, j.streamAddress,j.streamId, j.pin);
                } else {
                    firstCheckTxt.textContent = "اطلاعات دریافت شده صحیح نمیباشد لطفا دوباره اقدام کنید";
                    console.log("اطلاعات دریافت شده صحیح نمیباشد لطفا دوباره اقدام کنید");
                }
            }


        } catch (e) {
            console.log("error on url parameter >>", e);
            firstCheckTxt.textContent = "در هنگام بررسی اطلاعات خطایی رخ داد لطفا دوباره وارد شوید";
        }
    } else {
        firstCheckTxt.textContent = "اطلاعات ورود منقضی شده یا صحیح نمیباشد لطفا این صفحه را ببندید و دوباره وارد اتاق گفتگو شوید";
    }
}

getRoomData();

//*** for test
firstCheck.classList.add("hide");

