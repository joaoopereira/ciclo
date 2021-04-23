function requestFullscreen() {
    if (this.requestFullscreen) {
        this.requestFullscreen();
    }
    else if (this.msRequestFullscreen) {
        this.msRequestFullscreen();
    }
    else if (this.mozRequestFullScreen) {
        this.mozRequestFullScreen();
    }
    else if (this.webkitRequestFullScreen) {
        this.webkitRequestFullScreen();
    }
}

function playAll() {
    $('video').each(function () {
        this.play();
        this.muted = false;
    });
}

function playOnlyMe(me) {
    $('video').each(function () {
        this.pause();
    });
    me.currentTime = 0;
    me.muted = false;
    me.play();
}

function fullScreenChange() {
    var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
    var event = state ? 'FullscreenOn' : 'FullscreenOff';
    if (event == "FullscreenOn") {
        playOnlyMe(this);
    }
    else {
        playAll();
    }
}

function bindEvents() {
    $('video').each(function () {
        $(this).click(requestFullscreen);
        $(this).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', fullScreenChange);
    });

    $('#playButton').click(function () {
        $('#overlay').css("display", "none");
        playAll();
    });
}

function columns(colCount) {
    var columns = "";
    for (i = 0; i < colCount; i++) {
        columns += '<div class="col"><video loop muted playsinline></video></div>';
    }

    return columns;
}

function buildContent() {
    // first row 4 columns
    $("#row1").append(columns(4));

    // second row 3 columns
    $("#row2").append(columns(3));

    // third row 4 columns
    $("#row3").append(columns(4));
}

function setVideoSources() {
    var url = "https://api.cloudflare.com/client/v4/accounts/46a374782a8c8d7e7fc54d80120af5d5/stream";
    var token = "uTLFxsXbVu-1eRsfxvvFopRAI6R52Tj0zg2_zQVi";
    $.ajax({
        type: "GET",
        url: url,
        headers:
        {
            "content-type": "application/json",
            "authorization": "Bearer " + token
        },
        cache: true,
        // async: false,
        success: function (data) {
            var i = 0;
            $('video').each(function () {
                var video = this;
                var result = data.result[i] ? data.result[i] : data.result[1];
                var videoSrc = result.playback.hls;
                if (Hls.isSupported()) {
                    var hls = new Hls();
                    hls.loadSource(videoSrc);
                    hls.attachMedia(video);
                }
                // hls.js is not supported on platforms that do not have Media Source
                // Extensions (MSE) enabled.
                //
                // When the browser has built-in HLS support (check using `canPlayType`),
                // we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video
                // element through the `src` property. This is using the built-in support
                // of the plain video element, without using hls.js.
                //
                // Note: it would be more normal to wait on the 'canplay' event below however
                // on Safari (where you are most likely to find built-in HLS support) the
                // video.src URL must be on the user-driven white-list before a 'canplay'
                // event will be emitted; the last video event that can be reliably
                // listened-for when the URL is not on the white-list is 'loadedmetadata'.
                else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = videoSrc;
                }
                video.poster = result.preview;
                i++;
            });
        },
        error: function () {
            console.log('Error occured');
        }
    });
}

function timeoutForVideoBuffering()
{
    setTimeout(() => {
        $("#loadingSpinner").css("display", "none");
        $("#playButton").css("visibility", "visible");
    }, 7000);
}


$(document).ready(function () {

    buildContent();

    setVideoSources();

    bindEvents();

    timeoutForVideoBuffering()
});