document.getElementById('app').innerHTML = '<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true"> <div class="pswp__bg"></div><div class="pswp__scroll-wrap"> <div class="pswp__container"> <div class="pswp__item"></div><div class="pswp__item"></div><div class="pswp__item"></div></div><div class="pswp__ui pswp__ui--hidden"> <div class="pswp__top-bar"> <div class="pswp__counter"></div><button class="pswp__button pswp__button--close" title="Close (Esc)"></button> <button class="pswp__button pswp__button--share" title="Share"></button> <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button> <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button> <div class="pswp__preloader"> <div class="pswp__preloader__icn"> <div class="pswp__preloader__cut"> <div class="pswp__preloader__donut"></div></div></div></div></div><div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap"> <div class="pswp__share-tooltip"></div></div><button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"> </button> <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"> </button> <div class="pswp__caption"> <div class="pswp__caption__center"></div></div></div></div></div>';

var target = document.getElementById('photos');

for (var i = 1; i <= ITEMS.length; i++) {
    var bucket = 'https://s3-us-west-1.amazonaws.com/paulbphoto/';
    var folder = 'folder-name';

    var imageNumber = 1000 + i;
    var imageName = folder + '-' + imageNumber + '.jpg';
    var host = bucket + folder + '/thumb/';
    var src = host + imageName;

    var img = document.createElement('div');

    img.setAttribute('style', 'background-image: url(\'' + src + '\')');
    img.setAttribute('class', 'thumbnail');
    img.setAttribute('data-index', i - 1);
    img.onclick = onThumbnailsClick;

    target.appendChild(img);
}


var hashData = photoswipeParseHash();
if (hashData.pid) {
    openPhotoSwipe(hashData.pid, true, true);
}

function parseImageDimensions(filename) {
    var regex = /\d+x\d+/;

    var dimensions = filename.match(regex)[0];
    var dimArray = dimensions.split('x');

    return {
        width: dimArray[0],
        height: dimArray[1]
    }
}

function getThumbBoundsFn(index) {
    var thumbnail = document.querySelectorAll('.thumbnail')[index];
    var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
    var rect = thumbnail.getBoundingClientRect();
    return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
}

function photoswipeParseHash() {
    var hash = window.location.hash.substring(1),
        params = {};

    if (hash.length < 5) {
        return params;
    }

    var vars = hash.split('&');
    for (var i = 0; i < vars.length; i++) {
        if(!vars[i]) {
            continue;
        }
        var pair = vars[i].split('=');
        if(pair.length < 2) {
            continue;
        }
        params[pair[0]] = pair[1];
    }

    if (params.gid) {
        params.gid = parseInt(params.gid, 10);
    }

    return params;
};

function onThumbnailsClick(e) {
    e = e || window.event;
    e.preventDefault ? e.preventDefault() : e.returnValue = false;

    var eTarget = e.target || e.srcElement;

    var index = eTarget.dataset.index;

    openPhotoSwipe(index);
};

function openPhotoSwipe(index, disableAnimation, fromURL) {
    var pswpElement = document.querySelectorAll('.pswp')[0];

    var options = {
        index: parseInt(index, 10),
        showHideOpacity: true,
        getThumbBoundsFn: getThumbBoundsFn
    };

    if (fromURL) {
        options.index = parseInt(index, 10) - 1;
    }

    if (isNaN(options.index) ) {
        return;
    }

    if (disableAnimation) {
        options.showAnimationDuration = 0;
    }

    // Pass data to PhotoSwipe and initialize it
    var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, ITEMS, options);

    var realViewportWidth;
    var useLargeImages = false;
    var firstResize = true;
    var imageSrcWillChange;

    gallery.listen('beforeResize', function () {
        realViewportWidth = gallery.viewportSize.x * window.devicePixelRatio;

        if (useLargeImages && realViewportWidth < 1000) {
            useLargeImages = false;
            imageSrcWillChange = true;
        } else if (!useLargeImages && realViewportWidth >= 1000) {
            useLargeImages = true;
            imageSrcWillChange = true;
        }

        if (imageSrcWillChange && !firstResize) {
            gallery.invalidateCurrItems();
        }

        if (firstResize) {
            firstResize = false;
        }

        imageSrcWillChange = false;
    });

    gallery.listen('gettingData', function(index, item) {
        console.log(index);
        console.log(item);
        if (useLargeImages) {
            item.src = item.desktop;

            var dimensions = parseImageDimensions(item.desktop);

            item.w = dimensions.width;
            item.h = dimensions.height;
        } else {
            item.src = item.mobile;

            var dimensions = parseImageDimensions(item.mobile);

            item.w = dimensions.width;
            item.h = dimensions.height;
        }
    });

    gallery.init();
};
