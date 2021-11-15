var CMD = Object.freeze({
    INTERVAL_INFO: Object.freeze({cmd: 1, isDirectional: false, isEnc: false, enc: null}),
    PUBLIC_MSG: Object.freeze({cmd: 2, isDirectional: false, isEnc: false, enc: null}),
    PRIVATE_MSG: Object.freeze({cmd: 3, isDirectional: true, isEnc: true, enc: "rc4"}),
    MSG_ACK: Object.freeze({cmd: 4, isDirectional: true, isEnc: true, enc: "rc4"}),
    CLEAN_CHAT_BOX: Object.freeze({cmd: 5, isDirectional: false, isEnc: false, enc: null}),
    ACCEPT_VIEWER_TALK: Object.freeze({cmd: 6, isDirectional: true, isEnc: true, enc: "rc4"}),
    ACCEPT_VIEWER_TALK_ACK: Object.freeze({cmd: 7, isDirectional: true, isEnc: true, enc: "rc4"}),
    PUBLISH_CUSTOMER_MSG: Object.freeze({cmd: 8, isDirectional: false, isEnc: false, enc: null}),
    SET_TALK_REQUEST: Object.freeze({cmd: 10, isDirectional: true, isEnc: true, enc: "rc4"}),
    REMOVE_TALK_REQUEST: Object.freeze({cmd: 11, isDirectional: true, isEnc: true, enc: "rc4"}),
    TALK_RESPONSE_ACK: Object.freeze({cmd: 12, isDirectional: true, isEnc: true, enc: "rc4"}),
    CHECK_VIEWER_IS_EXIST: Object.freeze({cmd: 13, isDirectional: true, isEnc: true, enc: "rc4"}),
    VIEWER_IS_EXIST_ACK: Object.freeze({cmd: 14, isDirectional: true, isEnc: true, enc: "rc4"}),
    VIEWER_STATISTICS_REQUEST: Object.freeze({cmd: 15, isDirectional: true, isEnc: true, enc: "rc4"}),
    VIEWER_STATISTICS_ACK: Object.freeze({cmd: 16, isDirectional: true, isEnc: true, enc: "rc4"}),
    SET_PARTICIPANT_PASS: Object.freeze({cmd: 17, isDirectional: true, isEnc: true, enc: "rsa"}),
    PARTICIPANT_PASS_ACK: Object.freeze({cmd: 18, isDirectional: true, isEnc: true, enc: "rc4"}),
    VIEWER_TALK_END: Object.freeze({cmd: 19, isDirectional: true, isEnc: true, enc: "rc4"})
});
var USER_TYPE = Object.freeze({
    SUPPORTER: 3,
    PARTICIPANT: 7,
    GUEST_PARTICIPANT: 8
});
// // Helper to parse query string
//function getQueryStringValue(name) {
//    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
//    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
//            results = regex.exec(location.search);
//    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
//}
//function getHashParameterValue(name, u) {
//    u = u || window.location.href;
//    var url = new URL(u.replace("#", "?"));
//    return url.searchParams.get(name);
//}
//function getURLSearchParams(urlSearchParamsObj,name){
//    if(urlSearchParamsObj&&name){
//        return urlSearchParamsObj.get(name);
//    }
//    return null;
//}
//===============================================utility fuctions===============================================
function g(e, f, m) {//selector , father , ismultipe
    if (!f) {
        f = document;
    }
    if (m) {
        return f.querySelectorAll(e);
    }
    return f.querySelector(e);
}
function toggleFullScreen() {
    if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) ||
            (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
        var elem = document.documentElement;
        if (elem.requestFullScreen) {
            elem.requestFullScreen();
        } else if (elem.webkitRequestFullScreen) {
            elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        return true;
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
        return false;
    }
}
function findClassByStartName(elem, startName) {
    var arr = elem.classList, i;
    for (var r = 0; r < arr.length; r++) {
        i = arr[r];
        if (i.startsWith(startName)) {
            return i;
        }
    }
    return null;
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
function b64DecodeUnicode(str) {
    try {
        return decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
    } catch (e) {
        return null
    }
}
function rc4(k, s) {
    var g = [], i, j = 0, x, r = '', l = 0400;
    for (i = 0; i < l; i++) {
        g[i] = i;
    }
    for (i = 0; i < l; i++) {
        j = (j + g[i] + k.charCodeAt(i % k.length)) % l;
        x = g[i];
        g[i] = g[j];
        g[j] = x;
    }
    i = 0;
    j = 0;
    for (var y = 0; y < s.length; y++) {
        i = (i + 1) % l;
        j = (j + g[i]) % l;
        x = g[i];
        g[i] = g[j];
        g[j] = x;
        r += String.fromCharCode(s.charCodeAt(y) ^ g[(g[i] + g[j]) % l]);
    }
    return r;
}
function removeHtml(e) {
    while (e.firstChild) {
        e.removeChild(e.firstChild);
    }
}
function removeChildren(ch, i) {
    if (typeof i === "number" && i > -1 && ch.length) {
        for (; i < ch.length; i++) {
            ch[i].remove();
        }
    }
}
function showAlert(title, body, closeTxt) {
    if (title) {
        dialogTitle.innerHTML = '<span class="dialog_title"><i class="fas fa-exclamation-triangle"></i> ' + title + '</span>';
    }
    if (body) {
        dialogBody.innerHTML = '<span>' + body + '</span>';
    }
    closeBt.textContent = closeTxt ? closeTxt : "متوجه شدم";
    modal.classList.remove(hide);
}
function runAfterDelay(func, time) {
    if (typeof func === "function") {
        setTimeout(function () {
            func();
        }, time ? time : 3000);
    }
}
function sortArrayByNumber(numericIndex, arr, isAsc) {
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
//========================================================= ===========================================
function createHtml(html) {
    return new DOMParser().parseFromString(html, 'text/html').body.childNodes[0];
}
function getBackToProfile(error,time) {
    if(error){
        toast.error(error);
    }
    toast.info("تا چند لحظه دیگر به صفحه پروفایل سایت منتقل خواهید شد");
    runAfterDelay(function(){
        var domain = window.location.hostname;
    if (domain.split("\.").length > 2) {
        domain = domain.lastIndexOf(".", domain.lastIndexOf(".") - 1);
    }
    //*** change to supporty address
    window.location.href = "http://daum.net/s/" + domain;
    },time||5000);
}
function orchesterSend(jsonParam,endpoint, callback) {
    if(jsonParam&&endpoint){
//    if (!endpoint) {
//        endpoint = myInfo ? myInfo.endpoint : null;
//        if (!endpoint) {
//            if (callback) {
//                callback(false, "no endpoint exist");
//            }
//            return false;
//        }
//    }
    endpoint=myInfo.endpoint+endpoint;
    var data = new FormData();
    data.append("siteId", myInfo.siteId);
    data.append("supporterId", myInfo.supporterId);
    data.append("serverSession", myInfo.serverSession);
    Object.keys(jsonParam).forEach(function(e){
        data.append(e, jsonParam[e]);
    });
//    data.append("param", JSON.stringify(jsonParam));
//        fetch('http://qwer/live/' + (amICustomer ? 'customer' : 'supporter'), {
    fetch(endpoint, {
        method: 'POST',
        credentials: 'omit',
        mode: 'cors',
        cache: 'no-cache',
        body: data
    }).then(function (b) {
        return b.json();
    }).then(function (d) {
        if (callback) {
            callback(true, d);
        }
    }).catch(function (e) {
        if (callback) {
            callback(false, e);
        }
    });
}
}
//========================================================= Modal Dialog ===========================================
function showDialog(j) {
    var m = '<div id="modal_div">' +
            (j.notClose ? '' : '<i class="fas fa-times modal_close_bt corner_close"></i>') +
            '<div id="modal_dialog">' +
            '<div id="dialog_title">' + (j.title ? '<span class="dialog_title">' + j.title + '</span>' : '') + '</div>' +
            '<div id="dialog_body">' + (j.body ? j.body : '') + '</div>' +
            '<div id="dialog_control">' + (j.control ? j.control : '') + '</div>' +
            (j.notClose ? '' :
                    '<div class="dialog_close">' +
                    '<span class="button_ctr2 bg-css-orange modal_close_bt bt"><i class="fas fa-times"></i> <span id="close_bt">فعلا نه</span></span>' +
                    '</div>') +
            '</div>' +
            '</div>';
    g('body').append(createHtml(m));
    if (!j.notClose) {
        g(".modal_close_bt", 0, 1).forEach(function (i) {
            i.onclick = closeDialog;
        })
    }
    return g("#modal_div");
}
function closeDialog() {
    if (typeof dialogInterval !== 'undefined') {
        clearInterval(dialogInterval)
    }
    var modal = g("#modal_div");
    if (modal) {
        modal.remove();
    }
}
//========================================================= Media Devices Permission ===========================================
function checkMediaPermission(permissionCallback) {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        // Firefox 38+ seems having support of enumerateDevicesx
        navigator.enumerateDevices = function (callback) {
            navigator.mediaDevices.enumerateDevices().then(callback);
        }
    }
    var MediaDevices = [];
    var isHTTPs = location.protocol === 'https:';
    var result = {canEnumerate: false, hasMicrophone: false, hasSpeakers: false, hasWebcam: false, withMicrophonePermission: false, withWebcamPermission: false};
    if (typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
        result.canEnumerate = true;
    } else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
        result.canEnumerate = true;
    }
    if (!result.canEnumerate) {
        permissionCallback(result);
        return;
    }
    if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
        navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
    }
    if (!navigator.enumerateDevices && navigator.enumerateDevices) {
        navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
    }
    if (!navigator.enumerateDevices) {
        permissionCallback(result);
        return;
    }
    MediaDevices = [];
    navigator.enumerateDevices(function (devices) {
        devices.forEach(function (_device) {
            var device = {};
            for (var d in _device) {
                device[d] = _device[d];
            }
            if (device.kind === 'audio') {
                device.kind = 'audioinput';
            }
            if (device.kind === 'video') {
                device.kind = 'videoinput';
            }
            var skip;
            MediaDevices.forEach(function (d) {
                if (d.id === device.id && d.kind === device.kind) {
                    skip = true;
                }
            });
            if (skip) {
                return;
            }
            if (!device.deviceId) {
                device.deviceId = device.id;
            }
            if (!device.id) {
                device.id = device.deviceId;
            }
            if (!device.label) {
                device.label = 'Please invoke getUserMedia once.';
                if (!isHTTPs) {
                    device.label = 'HTTPs is required to get label of this ' + device.kind + ' device.';
                }
            } else {
                if (device.kind === 'videoinput' && !result.withWebcamPermission) {
                    result.withWebcamPermission = true;
                }
                if (device.kind === 'audioinput' && !result.withMicrophonePermission) {
                    result.withMicrophonePermission = true;
                }
            }
            if (device.kind === 'audioinput') {
                result.hasMicrophone = true;
            }
            if (device.kind === 'audiooutput') {
                result.hasSpeakers = true;
            }
            if (device.kind === 'videoinput') {
                result.hasWebcam = true;
            }
            // there is no 'videoouput' in the spec.
            MediaDevices.push(device);
        });
        permissionCallback(result);
    });
}
function getCamAndMicPermission(permissionCallback) {
//*** need to have ssl in out of localhost    
//    if (location.protocol === 'https:') {
    navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(
            function () {
//                console.log("success");
                permissionCallback(true);
            },
            function () {
//                console.log("error");
                permissionCallback(false);
            })
//    } else {
//
//    }
}

























