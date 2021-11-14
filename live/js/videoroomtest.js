//var trio;
//var maxCap = 6;
////$(document).ready(function () {
//var host = "ubun.tu";
//var participantIds = [];
//var token = "r09enFXrFzJCR87J";
//var pin = "ENUenF44HLk";
//var roomId = "1234";
//var firstCheck = g("#first_check"), firstCheckTxt = g("#first_check p");
//var videoElems = [g("#supporter_video video"), g("#customer_video video")];
//var config = {
//    host: host,
//    roomId: roomId,
//    token: token,
//    pin: pin,
//    maxCap: maxCap,
//    isPublisher: true,
////    isPublisher: false,
////    isSupporter: true,
//    isSupporter: false,
//    videoElems: videoElems,
//    videoRoomCallback: videoRoomCallback,
//    videoElemCallback: videoElemCallback,
//    sendMsgCallback: sendMsgCallback,
//    receiveMsgCallback: receiveMsgCallback,
//    outOfCapacityRoomCallback: outOfCapacityRoomCallback,
//    participantCounterCallback: participantCounterCallback
//}
//config.isPublisher = (getHashParameterValue("isPublisher") === "yes" || getHashParameterValue("isPublisher") === "true");
//config.isSupporter = (getHashParameterValue("isSupporter") === "yes" || getHashParameterValue("isSupporter") === "true");
//isTalkRightNow = config.isPublisher;
//trio = startLive(config);
////});
//function videoRoomCallback(myId) {
//    console.log("============== videoRoomCallback I'm joined successfully ==============", "myId:" + myId);
//}
//var videoRoomCout = 0;
//var currentParticipantRoomId = -1;
//function videoElemCallback(isLocalStream, isGone, remoteFeed) {
//    console.log("============== videoElemCallback ==============", "isLocalStream:" + isLocalStream, "isGone:" + isGone, "remoteFeed:", remoteFeed);
//    //***just for test
//    if (remoteFeed) {
//        console.log("remoteFeed: ", JSON.stringify(remoteFeed));
//    }
////    if(trio.userRoomId&&id!==trio.userRoomId){
////        var c = customerVideo.classList;
////        if(isGone){
////            c.add(hide);
////        }else{
////            c.remove(hide);
////        }
////    }
//
////if((amICustomer&&(isTalkRightNow||index===2))||(!amICustomer&&id!==trio.userRoomId)){
////if(!isGone){
////    currentParticipantRoomId=remoteFeed.rfid;
////}
//
//    var isSupporterJoined = remoteFeed ? remoteFeed.rfdisplay === "s" : true;
//    var id = remoteFeed ? remoteFeed.rfid : 0;
////if((amICustomer&&((isTalkRightNow&&remoteFeed.rfdisplay==="s")||(remoteFeed.rfdisplay==="c"&&(currentParticipantRoomId===0||currentParticipantRoomId===remoteFeed.rfid))))||(!amICustomer&&remoteFeed.rfid!==trio.userRoomId)){
//    if ((amICustomer && (isLocalStream || (isTalkRightNow && isSupporterJoined) || (!isSupporterJoined && (currentParticipantRoomId === -1 || currentParticipantRoomId === id)))) ||
//            (!amICustomer && id && id !== trio.userRoomId)) {
//        var c = customerVideo.classList;
//        if (isGone) {
//            c.add(hide);
//            currentParticipantRoomId = -1;
////            videoRoomCout--;
//        } else {
//            c.remove(hide);
////            videoRoomCout++;
//            currentParticipantRoomId = isLocalStream ? -1 : remoteFeed.rfid;
//            cleanChatBox();
//        }
//    }
//
//}
//function sendMsgCallback(msg, isMyOwn) {
//    console.log("============== sendMsgCallback ==============", "msg:", msg, "isMyOwn:", isMyOwn);
//}
//function receiveMsgCallback(msg, id) {
//    console.log("============== receiveMsgCallback ==============", "msg:", msg, "isMyOwn:", id);
//    processReceivedMsg(msg, id);
//}
//function outOfCapacityRoomCallback() {
//    console.log("============== outOfCapacityRoomCallback ==============");
//}
//function participantCounterCallback(id, isJoin) {
//    if(id){
//    if (isJoin && !participantIds.includes(id)) {
//        participantIds.push(id);
//    } else if(!isJoin&&participantIds.includes(id)) {
//        if(typeof currentParticipant!=='undefined'&&currentParticipant.userRoomId===id){
//            currentParticipant=null;
//        }
//        participantIds = participantIds.filter(function (e) {
//            return e !== id;
//        })
//    }
//}
//    console.log("============== participantNumber:","isJoin",isJoin,"id",id);
//}
function startLive(config) {
console.log(config);
    var trio = {};
//    var server = null;
//    if (window.location.protocol === 'http:')
//        server = "http://" + config.host + ":8088/janus";
//    else
//        server = "https://" + config.host + ":8089/janus";

    var janus = null;
    var handler = null;
    var opaqueId = "videoroomtest-" + Janus.randomString(12);

    var myid = null;
    var mystream = null;
// We use this other ID just to map our subscriptions to us
    var mypvtid = null;
    var feeds = [];
//    var reservedVideoElem = config.isPublisher ? 0 : -1;

    // Initialize the library (all console debuggers enabled)
    Janus.init({debug: "all", callback: function () {
            // Make sure the browser supports WebRTC
            if (!Janus.isWebrtcSupported()) {
                // *** alert to user that their browser not supported WebRTC
                Janus.log("No WebRTC support... ");
                return;
            }
            // Create session
            janus = new Janus({
//                server: server,
                server:config.host ,
                success: function () {
                    //*** just for test :
                    trio.janus = janus;
                    // Attach to VideoRoom plugin
                    janus.attach({
                        plugin: "janus.plugin.videoroom",
                        opaqueId: opaqueId,
                        success: function (pluginHandle) {
                            //*** just for test :
                            trio.handler = pluginHandle;
                            handler = pluginHandle;
                            Janus.log("Plugin attached! (" + handler.getPlugin() + ", id=" + handler.getId() + ")");
                            Janus.log("  -- This is a publisher/manager");
                            registerUsername();
                        },
                        error: function (error) {
                            Janus.error("  -- Error attaching plugin...", error);
//                            bootbox.alert("Error attaching plugin... " + error);
                        },
                        consentDialog: function (on) {
                            Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
                        },
                        iceState: function (state) {
                            Janus.log("ICE state changed to " + state);
                            if(state==='disconnected'){
//                            toast.error("بنظر میاد ارتباط اینترنتی دچار مشکل شده است");
                            trio.destroyServer();
                            config.lostConnectionCallback();
                        }
                        },
                        mediaState: function (medium, on) {
                            Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
                        },
                        webrtcState: function (on) {
                            Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
                        },
                        onmessage: function (msg, jsep) {
                            Janus.debug(" ::: Got a message (publisher) :::", msg);
                            var event = msg["videoroom"];
                            Janus.debug("Event: " + event);
                            if (event) {
                                if (event === "joined") {
                                    // Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
                                    myid = msg["id"];
                                    mypvtid = msg["private_id"];
                                    Janus.log("Successfully joined room " + msg["room"] + " with ID " + myid + " and private ID of " + mypvtid);
                                    trio.userRoomId = myid;
                                    config.videoRoomCallback(myid);
                                    if (config.isPublisher) {
                                        trio.publishOwnFeed(true);
                                    } else {
                                        trio.publishOwnFeed(false);
                                    }
                                    // Any new feed to attach to?
                                    if (msg["publishers"]) {
                                        var list = msg["publishers"];
                                        Janus.debug("Got a list of available publishers/feeds:", list);
                                        for (var f in list) {
                                            var id = list[f]["id"];
                                            var display = list[f]["display"];
                                            var audio = list[f]["audio_codec"];
                                            var video = list[f]["video_codec"];
                                            Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                                            newRemoteFeed(id, display, audio, video);
                                        }
                                    }
                                } else if (event === "destroyed") {
                                    // The room has been destroyed
                                    Janus.error("The room has been destroyed!");
                                    toast.error("اتاق بسته شد");
                                    // *** redirect user to site profile page cause of live is finished
//                                    bootbox.alert("The room has been destroyed", function () {
//                                        window.location.reload();
//                                    });
                                } else if (event === "event") {
                                    // Any new feed to attach to?
                                    if (msg["publishers"]) {
                                        var list = msg["publishers"];
                                        Janus.debug("Got a list of available publishers/feeds:", list);
                                        for (var f in list) {
                                            var id = list[f]["id"];
                                            var display = list[f]["display"];
                                            var audio = list[f]["audio_codec"];
                                            var video = list[f]["video_codec"];
                                            Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                                            newRemoteFeed(id, display, audio, video);
                                        }
                                    } else if (msg["leaving"]) {
                                        // One of the publishers has gone away?
                                        var leaving = msg["leaving"];
                                        Janus.log("Publisher left: msg[leaving] " + leaving);
                                        console.log();
                                        config.participantCounterCallback(leaving, false);
                                        var remoteFeed = null;
                                        for (var i = 1; i < config.maxCap; i++) {
                                            if (feeds[i] && feeds[i].rfid === leaving) {
                                                remoteFeed = feeds[i];
                                                break;
                                            }
                                        }
                                        if (remoteFeed != null) {
                                            Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                                            //*** hide video element because participant is gone
                                            config.videoElemCallback(false, true, remoteFeed);
                                            feeds[remoteFeed.rfindex] = null;
                                            remoteFeed.detach();
                                        }
                                    } else if (msg["unpublished"]) {
                                        // One of the publishers has unpublished?
                                        var unpublished = msg["unpublished"];
                                        Janus.log("Publisher left: msg[unpublished]" + unpublished);
//                                        config.participantCounterCallback(unpublished, false);
                                        if (unpublished === 'ok') {
                                            // That's us
                                            handler.hangup();
                                            return;
                                        }
                                        var remoteFeed = null;
                                        for (var i = 1; i < config.maxCap; i++) {
                                            if (feeds[i] && feeds[i].rfid === unpublished) {
                                                remoteFeed = feeds[i];
                                                break;
                                            }
                                        }
                                        if (remoteFeed != null) {
                                            Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                                            //*** hide video element because participant is gone
                                            config.videoElemCallback(false, true, remoteFeed);
                                            feeds[remoteFeed.rfindex] = null;
                                            remoteFeed.detach();
                                        }
                                    } else if (msg["error"]) {
                                        if (msg["error_code"] === 426) {
                                            // This is a "no such room" error: give a more meaningful description
//                                            bootbox.alert("<p>Apparently room <code>" + config.roomId + "</code> (the one this demo uses as a test room) " +
//                                                    "does not exist...</p><p>Do you have an updated <code>janus.plugin.videoroom.jcfg</code> " +
//                                                    "configuration file? If not, make sure you copy the details of room <code>" + config.roomId + "</code> " +
//                                                    "from that sample in your current configuration file, then restart Janus and try again.");
                                            Janus.log("<p>Apparently room <code>" + config.roomId + "</code> (the one this demo uses as a test room) " +
                                                    "does not exist...</p><p>Do you have an updated <code>janus.plugin.videoroom.jcfg</code> " +
                                                    "configuration file? If not, make sure you copy the details of room <code>" + config.roomId + "</code> " +
                                                    "from that sample in your current configuration file, then restart Janus and try again.");
                                        } else if (msg["error_code"] === 432) {
//                                            console.log("MSG3:" + msg["error"], msg);
//                                            bootbox.alert("MSG3:" + msg["error"]);
                                             Janus.error("MSG3:" + msg["error"]);
                                            config.outOfCapacityRoomCallback();
                                            //*** room is full of capacity
                                            //*** be server ye payam ersal konam ke zarfiat otagh takmil budeh
//                                            trio.destroyServer(janus, handler);
                                            trio.destroyServer();
//                                            window.location.reload();
                                        } else if (msg["error_code"] === 433) {
                                            toast.error("شما دسترسی لازم برای ورود به اتاق را ندارید");
                                        } else {
//                                            console.log("MSG1:" + msg["error"], msg);
                                            Janus.error("MSG1:" + msg["error"],msg);
                                        }
                                    }
                                }
                            }
                            if (jsep) {
                                Janus.debug("Handling SDP as well...", jsep);
                                handler.handleRemoteJsep({jsep: jsep});
                                // Check if any of the media we wanted to publish has
                                // been rejected (e.g., wrong or unsupported codec)
                                var audio = msg["audio_codec"];
                                if (mystream && mystream.getAudioTracks() && mystream.getAudioTracks().length > 0 && !audio) {
                                    // Audio has been rejected
                                    toastr.warning("Our audio stream has been rejected, viewers won't hear us");
                                }
                                var video = msg["video_codec"];
                                if (mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
                                    // Video has been rejected
                                    toastr.warning("Our video stream has been rejected, viewers won't see us");
                                    //*** show error toast to participant because video stream is not accepted
                                    // Hide the webcam video
                                }
                            }
                        },
                        onlocalstream: function (stream) {
                            console.log("%%%%%%%%%%%%%%%%%%%%%%% onlocalstream in startlive");
                            Janus.debug(" ::: Got a local stream :::", stream);
                            config.videoElemCallback(true, false);
                            mystream = stream;
                            var vIdx = config.isSupporter ? 0 : 1;
                            Janus.attachMediaStream(config.videoElems[vIdx], stream);
                            config.videoElems[vIdx].muted = "muted";

                            if (handler.webrtcStuff.pc.iceConnectionState !== "completed" &&
                                    handler.webrtcStuff.pc.iceConnectionState !== "connected") {
                            }
                            var videoTracks = stream.getVideoTracks();
                            if (!videoTracks || videoTracks.length === 0) {
                                //*** show error toast to participant because no webcam there is
                                // No webcam
                            }
                        },
                        slowLink:function(){
                            toast.error("اینترنت شما ضعیف شد و احتمال قطعی وجود خواهد داشت");
                        },
                        onremotestream: function (stream) {
                            // The publisher stream is sendonly, we don't expect anything here
                            console.log("------------=============------------onremotestream", "stream", stream);
                        },
                        oncleanup: function () {
                            Janus.log(" ::: Got a cleanup notification: we are unpublished now :::");
                            config.videoElemCallback(true, true);
                            mystream = null;
                            config.lostConnectionCallback();
                        }
                    });
                },
                error: function (error) {
                    Janus.error(error);
                    trio.destroyServer();
                    config.lostConnectionCallback();
                    // *** got the janus error
//                    bootbox.alert(error, function () {
//                        window.location.reload();
//                    });
                },
                destroyed: function () {
                    Janus.error("destroyed room --");
                    trio.destroyServer();
                    config.lostConnectionCallback();
//                    bootbox.alert("destroyed --", function () {
// *** janus is destoyed (cause of room is not have free capacity) and I can to show a message to user for next lever
//                        window.location.reload();
//                    });
//                    window.location.reload();
                }
            });
//            });
        }});

    function registerUsername() {
        new Promise(function () {
            var register = {
                request: "join",
                room: config.roomId,
                ptype: "publisher",
                display: config.isSupporter ? "s" : "c"
//            display: displayName
            };
            if(config.pin){
                register.pin=config.pin;
            }
            if(config.token){
                register.token=config.token;
            }
            handler.send({message: register});
        });
    }

    trio.publishOwnFeed = function (withMedia) {
//     function publishOwnFeed(withMedia) {
        // Publish our stream
//        $('#publish').attr('disabled', true).unbind('click');
//        var media = {audioRecv: !withMedia, videoRecv: !withMedia, audioSend: withMedia, videoSend: withMedia, data: true};
//        if (withMedia) {
//            media.audio = withMedia;
//            media.video = "lowres";
//            media.audiocodec = "opus";
//            media.videocodec = "vp8"
//        }

//*** for test and this line will be disable video
//        var media = {audioRecv: !withMedia, videoRecv:!withMedia, audioSend: withMedia, videoSend: true,audiocodec : "opus",audio : withMedia,video:withMedia?"lowers":false, data: true};
        var media = {audioRecv: !withMedia, videoRecv: !withMedia, audioSend: withMedia, videoSend: true, audiocodec: "opus", audio: withMedia, video: false, data: true};
        if (withMedia) {
            media.videocodec = "vp8";
        }
        handler.createOffer({
            // Add data:true here if you want to publish datachannels as well
//            media: {audioRecv: false, videoRecv: false, audioSend: withMedia, videoSend: true, data: true
//                , audio: true, video: "lowres", audiocodec: "opus", videocodec: "vp8"}, //, bitrate: 10000   Publishers are sendonly
            media: media,
            // If you want to test simulcasting (Chrome and Firefox only), then
            // pass a ?simulcast=true when opening this demo page: it will turn
            // the following 'simulcast' property to pass to janus.js to true
            simulcast: false,
            simulcast2: false,
            success: function (jsep) {
                Janus.debug("Got publisher SDP!", jsep);
                var publish = {request: "configure", audio: withMedia, video: withMedia};
//*** for test and this line will be disable video
//                var publish = {request: "configure", audio: withMedia, video: false};
                // You can force a specific codec to use when publishing by using the
                // audiocodec and videocodec properties, for instance:
                // 		publish["audiocodec"] = "opus"
                // to force Opus as the audio codec to use, or:
                // 		publish["videocodec"] = "vp9"
                // to force VP9 as the videocodec to use. In both case, though, forcing
                // a codec will only work if: (1) the codec is actually in the SDP (and
                // so the browser supports it), and (2) the codec is in the list of
                // allowed codecs in a room. With respect to the point (2) above,
                // refer to the text in janus.plugin.videoroom.jcfg for more details.
                // We allow people to specify a codec via query string, for demo purposes
                // 
                handler.send({message: publish, jsep: jsep});
            },
            error: function (error) {
                //*** show permission dialog/help to release them
                Janus.error("WebRTC error:", error);
                if (withMedia) {
                    trio.publishOwnFeed(false);
                } else {
//                    bootbox.alert("WebRTC error... " + error.message);
//                    $('#publish').removeAttr('disabled').click(function () {
                    trio.publishOwnFeed(true);
//                    });
                }
            }
        });
    }

//    function toggleMute() {
//        var muted = sfutest.isAudioMuted();
//        Janus.log((muted ? "Unmuting" : "Muting") + " local stream...");
//        if (muted)
//            sfutest.unmuteAudio();
//        else
//            sfutest.muteAudio();
//        muted = sfutest.isAudioMuted();
//        $('#mute').html(muted ? "Unmute" : "Mute");
//    }

    trio.unpublishOwnFeed = function () {
//       function unpublishOwnFeed() {
        // Unpublish our stream
        var unpublish = {request: "unpublish"};
        handler.send({message: unpublish});
// Remove local video
//        handler.createOffer(
//                {
//                    media: {removeVideo: true, removeAudio: true},
//                    simulcast: false,
//                    simulcast2: false,
//                    success: function (jsep) {
//                        Janus.debug(jsep);
//                        handler.send({message: {audio: true, video: true}, "jsep": jsep});
//                    },
//                    error: function (error) {
//                        console.log("WebRTC error... " + JSON.stringify(error));
//                    }
//                });
    }

    function newRemoteFeed(id, display, audio, video) {
        console.log("newRemoteFeed id: " + id);
        // A new feed has been published, create a new plugin handle and attach to it as a subscriber
        var remoteFeed = null;
        janus.attach({
            plugin: "janus.plugin.videoroom",
            opaqueId: opaqueId,
            success: function (pluginHandle) {
                remoteFeed = pluginHandle;
                remoteFeed.simulcastStarted = false;
                Janus.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
                console.log(" ############ remoteFeed #################", remoteFeed);
                Janus.log("  -- This is a subscriber");
//                config.participantCounterCallback(remoteFeed.rfid, true);
                // We wait for the plugin to send us an offer
                var subscribe = {
                    request: "join",
                    room: config.roomId,
                    ptype: "subscriber",
                    feed: id,
                    pin:config.pin,
                    private_id: mypvtid
                };
                // In case you don't want to receive audio, video or data, even if the
                // publisher is sending them, set the 'offer_audio', 'offer_video' or
                // 'offer_data' properties to false (they're true by default), e.g.:
                // 		subscribe["offer_video"] = false;
                // For example, if the publisher is VP8 and this is Safari, let's avoid video
                if (Janus.webRTCAdapter.browserDetails.browser === "safari" &&
                        (video === "vp9" || (video === "vp8" && !Janus.safariVp8))) {
                    if (video)
                        video = video.toUpperCase()
                    toastr.warning("Publisher is using " + video + ", but Safari doesn't support it: disabling video");
                    subscribe["offer_video"] = false;
                }
                remoteFeed.videoCodec = video;
                remoteFeed.send({message: subscribe});
            },
            error: function (error) {
                Janus.error("  -- Error attaching plugin...", error);
//                bootbox.alert("Error attaching plugin... " + error);
            },
            onmessage: function (msg, jsep) {
                Janus.debug(" ::: Got a message (subscriber) :::", msg);
                var event = msg["videoroom"];
                Janus.debug("Event: " + event);
                if (msg["error"]) {
//                    bootbox.alert("MSG2:" + msg["error"]);
                    Janus.error("MSG2:" + msg["error"]);
                } else if (event) {
                    if (event === "attached") {
                        // Subscriber created and attached
                        for (var i = 1; i < config.maxCap; i++) {
                            if (!feeds[i]) {
                                feeds[i] = remoteFeed;
                                remoteFeed.rfindex = i;
                                break;
                            }
                        }
                        remoteFeed.rfid = msg["id"];
                        remoteFeed.rfdisplay = msg["display"];
                        Janus.log("Successfully attached to feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") in room " + msg["room"]);
                        config.participantCounterCallback(remoteFeed.rfid, true);
                    } else if (event === "event") {
//						// Check if we got a simulcast-related event from this publisher
                    } else {
                        // What has just happened?
                    }
                }
                if (jsep) {
                    Janus.debug("Handling SDP as well...", jsep);
                    // Answer and attach
                    remoteFeed.createAnswer({
                        jsep: jsep,
                        // Add data:true here if you want to subscribe to datachannels as well
                        // (obviously only works if the publisher offered them in the first place)
                        media: {audioSend: false, videoSend: false, data: true}, // We want recvonly audio/video
                        success: function (jsep) {
                            Janus.debug("Got SDP!", jsep);
                            var body = {request: "start", room: config.roomId};
                            remoteFeed.send({message: body, jsep: jsep});
                        },
                        error: function (error) {
                            Janus.error("WebRTC error:", error);
//                            bootbox.alert("WebRTC error... " + error.message);
                        }
                    });
                }
            },
            iceState: function (state) {
                Janus.log("ICE state of this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") changed to " + state);
            },
            webrtcState: function (on) {
                Janus.log("Janus says this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") is " + (on ? "up" : "down") + " now");
                console.log("~~~~~~~~~~ remoteFeed: ", remoteFeed);
                if (!on) {
                    config.videoElemCallback(false, !on, remoteFeed);
                }
//                else{
//                    config.peerConnectionCallback(on,remoteFeed);
//                }
            },
            onlocalstream: function (stream) {
                // The subscriber stream is recvonly, we don't expect anything here
                console.log("%%%%%%%%%%%%%%%%%%%%%%% onlocalstream in newremotefeed");
            },
            onremotestream: function (stream) {
                Janus.debug("Remote feed #" + remoteFeed.rfindex + ", stream:", stream);
//                console.log("---------------------------Remote feed #" + remoteFeed.rfindex, "reservedVideoElem: " + reservedVideoElem, ", stream:", stream);
                console.log("---------------------------Remote feed #" + remoteFeed.rfindex, "remoteFeed", remoteFeed, ", stream:", stream);
//                var vIdx = config.isSupporter || config.isPublisher ? 1 : remoteFeed.rfindex - 1;
//                var vIdx = config.isSupporter ? 1 : (config.isPublisher ? 0 : remoteFeed.rfindex - 1);
//                console.log("+++++++++++++++++++++ vIdx: " + vIdx + " ++++++++++++++++++++++++++");
//                Janus.attachMediaStream(config.videoElems[remoteFeed.rfindex + reservedVideoElem], stream);
//                Janus.attachMediaStream(config.videoElems[vIdx], stream);
                Janus.attachMediaStream(config.videoElems[remoteFeed.rfdisplay === "s" ? 0 : 1], stream);
                config.videoElemCallback(false, false, remoteFeed);
//                if (!config.isPublisher) {
//                    Janus.attachMediaStream(config.videoElems[remoteFeed.rfindex + reservedVideoElem], stream);
//                } else {
//                    Janus.attachMediaStream(config.videoElems[1], stream);
//                }
                var videoTracks = stream.getVideoTracks();
                if (videoTracks && videoTracks.length > 0) {
                    //*** show video element with stream and hidden video element without stream
                }
                return;
            },
            ondataopen: function (data) {//*** it's not necesorry and can to remove 
                    Janus.log("The DataChannel is available!");
                     config.peerConnectionCallback(remoteFeed.rfid);
            },
            ondata: function (data) {
//                    Janus.debug("We got data from the DataChannel! " + data);
                console.log("We got data from the DataChannel! data: ", data, " id: ", id);
                config.receiveMsgCallback(data, id);
//                    setMsgProcess(data, false);
            },
            oncleanup: function () {
                Janus.log(" ::: Got a cleanup notification (remote feed " + id + ") :::");
            }
        });
    }


//    trio.sendDataChannel("msg of " + new Date().getTime(), sendMsgCallback);

    trio.sendDataChannel = function sendDataChannel(j) {
//        console.log("sendDataChannel", " msg: " + j);
        if (typeof j === 'object') {
            j.userRoomId = myid;
            j = JSON.stringify(j);
        }
        handler.data({
            text: j,
            error: function (reason) {
                //*** toast = payam ersal nashud
                console.error(reason);
            },
            success: function () {
                config.sendMsgCallback(j, true);
//                chatInput.val('');
            }
        });
    }



    trio.switchPublisherSubscriber = function switchPublisherSubscriber(isToPublisher) {
        if (isToPublisher) {
            config.isPublisher = true;
//            reservedVideoElem = config.isPublisher ? 0 : -1;
            trio.publishOwnFeed(true);
        } else {
            config.isPublisher = false;
//            reservedVideoElem = config.isPublisher ? 0 : -1;
            trio.unpublishOwnFeed();
        }
    }
    trio.destroyServer=function destroyServer() {
        if (handler) {
            handler.hangup();
        }
        if (janus && janus.isConnected()) {
            janus.destroy();
        }
    }
    trio.getStreamInfo = function getStreamInfo() {
        // Send a request for more info on the mountpoint we subscribed to
//    var body = {"request": "info", "id": parseInt(selectedStream)};
        var body = {"request": "info", "id": myroom};
        handler.send({"message": body, success: function (result) {
                console.log("result:--", result);
            }});
    }
    return trio;
}
