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
    });
    // $('audio').get(0).play();
}

function playOnlyMe(me) {
    $('video').each(function () {
        this.pause();
    });
    me.currentTime = 0;
    me.muted = false;
    me.play();

    // $('audio').get(0).pause();
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
        $(this).bind('click', requestFullscreen);
        $(this).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', fullScreenChange);
    });
}

function trmarkup(colCount)
{
    var trmarkup = '<tr class="table-dark">';
    for (i = 0; i < colCount; i++) {
        trmarkup += '<td><video width="100%" autoplay loop muted playsinline><source></video></td>';
    }
    trmarkup += '</tr>';

    return trmarkup;
}

function buildTable() {
    // first row 4 columns
    $(".table1 tbody").append(trmarkup(4));

    // second row 3 columns
    $(".table2 tbody").append(trmarkup(3));

    // third row 4 columns
    $(".table3 tbody").append(trmarkup(4));
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
                var videoSrc = data.result[i] ? data.result[i].playback.hls : data.result[0].playback.hls;
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
                
                i++;
            });
        },
        error: function() {
            console.log('Error occured');
        }
    });
}


$(document).ready(function () {
    buildTable();

    setVideoSources();

    bindEvents();
});

