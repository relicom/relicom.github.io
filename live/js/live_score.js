var dialogInterval;
var scoreEmojiList = ["tired", "angry", "frown", "meh-blank", "meh-rolling-eyes", "grimace", "smile", "grin-alt", "grin-wink", "grin-beam", "grin-hearts", "grin-stars"];
var scoreEmojiColor = ["rosybrown", "#a0a28c", "#9ca7b4", "#8ca28f", "#b69aba", "#a9bd69", "#87b8da", "orchid", "#189fff", "yellowgreen", "dodgerblue", "blueviolet"];
var scoreMsg = ["اصلا قابل تحمل نیست", "شاکیم این چه وضعشه ؟ مزخرف بود", "ارزش نداشت", "علاقه ای نداشتم", "نا امیدم کرد انتظارم بیشتر بود", "بد نبود ولی میتونست بهتر بشه", "ای بگی نگی خوب بود", "به به خوب بود", "جالب بود همونی بود که انتظار داشتم", "لذت بردم خیلی خوب بود", "عالی بود حرف نداشت", "سوپرایز شدم اصلا یک وضعی"];

// *** scoring to live discussion is just related to registered users NOT Anonymouses

function setEfficiencyScore(callback) {
//    dialogTitle.innerHTML = '<span class="dialog_title"><i class="fas fa-question-cirlce"></i> این گفتگو چطور بود؟</span>';
//    dialogBody.innerHTML = '<div class="star_rating">' +
//            '<i class="emoji far"></i>' +
//            '<span class="score_name"></span>' +
//            '<div>' +
//            '<i class="fas fa-star star_score" data-score="1"></i>' +
//            '<i class="fas fa-star star_score" data-score="2"></i>' +
//            '<i class="fas fa-star star_score" data-score="3"></i>' +
//            '<i class="fas fa-star star_score" data-score="4"></i>' +
//            '<i class="fas fa-star star_score" data-score="5"></i>' +
//            '<i class="fas fa-star star_score" data-score="6"></i>' +
//            '<i class="fas fa-star star_score" data-score="7"></i>' +
//            '<i class="fas fa-star star_score" data-score="8"></i>' +
//            '<i class="fas fa-star star_score" data-score="9"></i>' +
//            '<i class="fas fa-star star_score" data-score="10"></i>' +
//            '<i class="fas fa-star star_score" data-score="11"></i>' +
//            '<i class="fas fa-star star_score" data-score="12"></i>' +
//            '</div>' +
//            '</div>';
//    dialogControl.innerHTML = '<span id="score_bt" class="button_ctr2 bg-css-blue bt"><i class="fas fa-check-circle"></i> ارسال امتیاز</span>'+
//            '<span id="score_bt" class="button_ctr2 bg-css-blue bt"><i class="fas fa-check-circle"></i> ارسال امتیاز</span>';
    var j = {title: ' این گفتگو چطور بود؟', notClose: 1};
    j.body = '<div class="star_rating">' +
            '<i class="emoji far"></i>' +
            '<span class="score_name"></span>' +
            '<div>' +
            '<i class="fas fa-star star_score" data-score="1"></i>' +
            '<i class="fas fa-star star_score" data-score="2"></i>' +
            '<i class="fas fa-star star_score" data-score="3"></i>' +
            '<i class="fas fa-star star_score" data-score="4"></i>' +
            '<i class="fas fa-star star_score" data-score="5"></i>' +
            '<i class="fas fa-star star_score" data-score="6"></i>' +
            '<i class="fas fa-star star_score" data-score="7"></i>' +
            '<i class="fas fa-star star_score" data-score="8"></i>' +
            '<i class="fas fa-star star_score" data-score="9"></i>' +
            '<i class="fas fa-star star_score" data-score="10"></i>' +
            '<i class="fas fa-star star_score" data-score="11"></i>' +
            '<i class="fas fa-star star_score" data-score="12"></i>' +
            '</div>' +
            '</div>';
    j.control = '<span id="score_bt" class="button_ctr2 bg-css-blue bt"><i class="fas fa-check-circle"></i> ارسال امتیاز</span>' +
            '<span id="not_complete_bt" class="button_ctr2 bg-css-orangered bt"><i class="fas fa-times-circle"></i> گفتگو کامل نبود</span>';
    var dialog = showDialog(j);
    g("#not_complete_bt", dialog).onclick = function () {
        closeDialog();
        callback();
    }

    var starScore = g(".star_score", dialog, 1), scoreEmoji = g(".emoji", dialog), scoreName = g(".score_name", dialog), scoreVal;
    starScore.forEach(function (i) {
        i.onmouseenter = function () {
            if (dialogInterval) {
                clearInterval(dialogInterval);
                dialogInterval = null;
            }
            scoreVal = Number(this.dataset.score);
            setScoreValue(scoreVal);
        }
    });

    var scoreIntervalMinRange = 6;
    setScoreValue(12);
    dialogInterval = setInterval(function () {
        setScoreValue(scoreIntervalMinRange++);
        console.log("interval" + scoreIntervalMinRange);
        if (scoreIntervalMinRange > 12) {
            scoreIntervalMinRange = 6;
        }
    }, 1500);

    function setScoreValue(val) {
        val--;
        scoreName.textContent = scoreMsg[val];
        scoreName.style.color = scoreEmojiColor[val];
        scoreEmoji.classList.remove(findClassByStartName(scoreEmoji, "fa-"));
        scoreEmoji.classList.add("fa-" + scoreEmojiList[val]);
        scoreEmoji.style.color = scoreEmojiColor[val];
        starScore.forEach(function (i, idx) {
            if (idx > val) {
                i.classList.remove("fg-css-gold");
            } else {
                i.classList.add("fg-css-gold");
            }
        });
    }
    g("#score_bt", dialog).onclick = function () {
        if (scoreVal) {
            var req = {score: scoreVal};
            orchesterSend(req, function (isSucceed, result) {
                if (isSucceed) {
                    closeDialog();
                    toast.success("خیلی ممنونیم که ما را در هر چه بهتر کردن کیفیت کارشناس مشاوران و سرویس دهیمون کمک میکنید");
                    callback();
                } else {
                    toast.error("ارتباط اینترنتی برقرار نیست یکبار اینترنت خود را چک کنید و دوباره امتیاز را ارسال کنید");
                }
            });
//        send to supporty server
            console.log(req);
//            cleanModal();

        } else {
            toast.info("لطفا با رفتن روی یکی از ستاره ها مقدار امتیاز را مشخص کنید");
        }
    }

//    dialog.classList.remove(hide);
}
