var loadedVideos = 0;

function requestFullscreen() {
  if (this.requestFullscreen) {
    this.requestFullscreen();
  } else if (this.msRequestFullscreen) {
    this.msRequestFullscreen();
  } else if (this.mozRequestFullScreen) {
    this.mozRequestFullScreen();
  } else if (this.webkitRequestFullScreen) {
    this.webkitRequestFullScreen();
  } else if (this.webkitEnterFullScreen) {
    this.webkitEnterFullScreen();
  }

  this.currentTime = 0;
  this.muted = false;
  this.play();
  $("#backgroundAudio").get(0).pause();
}

function fullScreenChange() {
  var state =
    document.fullScreen ||
    document.mozFullScreen ||
    document.webkitIsFullScreen;
  var event = state ? "FullscreenOn" : "FullscreenOff";
  if (event == "FullscreenOff") {
    this.muted = true;
    $("#backgroundAudio").get(0).play();
  }
}

function bindEvents() {
  $("video").each(function () {
    $(this).click(requestFullscreen);
    $(this).bind(
      "webkitendfullscreen webkitfullscreenchange mozfullscreenchange fullscreenchange",
      fullScreenChange
    );
    $(this).bind("canplaythrough", function () {
      loadedVideos++;
    });
  });

  $("#playButton").click(function () {
    $("#backgroundAudio").get(0).play();
    $("#overlay").fadeOut("slow");
    $("#middle").fadeIn("slow");
    setSameVideoHeight();
  });
}

function columns(colCount) {
  var columns = "";
  for (i = 0; i < colCount; i++) {
    columns += "<td><video autoplay loop muted playsinline></video></td>";
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
  var url =
    "https://api.cloudflare.com/client/v4/accounts/46a374782a8c8d7e7fc54d80120af5d5/stream";
  var token = "uTLFxsXbVu-1eRsfxvvFopRAI6R52Tj0zg2_zQVi";
  $.ajax({
    type: "GET",
    url: url,
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + token,
    },
    cache: true,
    // async: false,
    success: function (data) {
      var i = 0;
      $("video").each(function () {
        var video = this;
        var result = data.result[i] ? data.result[i] : data.result[5];
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
        else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoSrc;
        }
        video.poster = result.preview;
        i++;
      });
    },
    error: function () {
      console.log("Error occured");
    },
  });
}

function waitForVideoBuffering() {
  setTimeout(() => {
    if (loadedVideos == 11) {
      $("#loadingSpinner").css("display", "none");
      $("#playButton").css("visibility", "visible");
    } else {
      waitForVideoBuffering();
    }
  }, 100);
}

function setSameVideoHeight() {
  // Set all videos Height Equal
  var videos = $("video");
  var minHeight = Math.min.apply(
    Math,
    videos
      .map(function () {
        return $(this).height();
      })
      .get()
  );
  videos.height(minHeight);
}

$(document).ready(function () {
  buildContent();

  setVideoSources();

  bindEvents();

  waitForVideoBuffering();
});

$(window).resize(function () {
  setSameVideoHeight();
});
