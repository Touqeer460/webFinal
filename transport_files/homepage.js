'use strict';

(function () {

    var lederhosenIsShowing = false;

    //Feature detection hack for hero video background
    // At least Safari 3+: "[object HTMLElementConstructor]"
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    if (isSafari) {
        $('.hero-wrapper').css('background-color', '#f7f7f7');
    }
    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    if (isIE) {
        $('.hero video').css('display', 'none');
        window.innerWidth > 1024 ? $('.hero-static').css('display', 'block') : $('.hero-static').css('display', 'none');
        $(window).resize(function () {
            window.innerWidth > 1024 ? $('.hero-static').css('display', 'block') : $('.hero-static').css('display', 'none');
        });
        $(".odometer").css({ "top": "4px" });
    }
    // Useragent is iOS
    var isIOS = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        $(".odometer").css({ "top": "-1px" });
    }

    // Helper Functions
    function isElementInViewport(el) {
        var rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
    }
    function onVisible(el, callback) {
        if (el !== undefined) {
            return function () {
                var visible = isElementInViewport(el);
                if (visible && typeof callback == 'function') {
                    callback();
                }
            };
        }
    }
    function addClass(el, className) {
        if (el.classList) {
            el.classList.add(className);
        } else if (!hasClass(el, className)) {
            el.className += ' ' + className;
        }
    }

    function removeClass(el, className) {
        if (el.classList) {
            el.classList.remove(className);
        } else if (hasClass(el, className)) {
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
            el.className = el.className.replace(reg, ' ');
        }
    }

    function detectMobile() {
        if (window.matchMedia('(max-width: 767px)').matches) {
            return true;
        } else {
            return false;
        }
    }

    // Rolling Numbers
    var collection = document.getElementsByClassName('odometer');
    var el = collection[0];
    var handler = onVisible(el, function () {
        for (var i = 0; i < collection.length; i++) {
            collection[i].innerHTML = collection[i].getAttribute('data-value');
            collection[i].addEventListener('odometerdone', function () {
                $('.odometer').addClass('no-shadow');
            });
        }
    });

    if (window.addEventListener) {
        addEventListener('DOMContentLoaded', handler, false);
        addEventListener('load', handler, false);
        addEventListener('scroll', handler, false);
        addEventListener('resize', handler, false);
    } else if (window.attachEvent) {
        attachEvent('onDOMContentLoaded', handler); // IE9+
        attachEvent('onload', handler);
        attachEvent('onscroll', handler);
        attachEvent('onresize', handler);
    }

    //Check if Mobile and disable controls
    var interactiveMap = true;

    if (detectMobile()) {
        interactiveMap = false;
    }

    //US and Worldwide controls
    var usButton = document.getElementById('usSelector');
    var globalButton = document.getElementById('globalSelector');
    var mapCenter = [-97, 39]; //US/American default
    var mapZoom = 3; //US/American default

    if (globalButton.className.indexOf('active') >= 0) {
        mapCenter = [-10, 30];
        if (window.innerWidth < 600) {
            mapZoom = 0;
        } else if (window.innerWidth < 1100) {
            mapZoom = 1;
        } else {
            mapZoom = 2;
        }
    }

    var lederhosenNick = document.createElement('div');
    lederhosenNick.className = 'parker-marker';
    lederhosenNick.addEventListener('click', function () {
        window.alert('Well hello there.');
    });

    $.getScript("https://api.tiles.mapbox.com/mapbox-gl-js/v0.23.0/mapbox-gl.js", function () {
        $.getScript(uship.bootstrap.routes.geoJsonUrl, function () {
            //mapbox gl defined and imported via the above mapbox-gl.js
            //Initializing Map
            mapboxgl.accessToken = 'pk.eyJ1IjoidXNoaXAiLCJhIjoiSzNwTkpaMCJ9.ibcmzj7-eiivBarcYBqwHw';

            var map = new mapboxgl.Map({
                container: 'map', // container id
                style: 'mapbox://styles/uship/cisunrla6003y2ytcfbacn7u5', //stylesheet location
                center: mapCenter,
                zoom: mapZoom,
                attributionControl: false,
                maxBounds: [[-180, -85], [180, 85]],
                interactive: interactiveMap
            });

            //mapGeoJsonData defined and imported via the above geoJsonUrl
            //Painting all the layers for cluster sizes
            map.on('load', function () {
                map.addSource('markers', {
                    'type': 'geojson',
                    'data': mapGeoJsonData
                });
                map.addLayer({
                    'id': 'non-cluster-markers',
                    'type': 'circle',
                    'source': 'markers',
                    'paint': {
                        'circle-radius': {
                            stops: [[8, 3], [11, 6], [16, 40]]
                        },
                        'circle-opacity': 0.8,
                        'circle-color': '#02AAF3'
                    }
                });

                map.on('zoom', function () {
                    if (map.getZoom() > 13 && !lederhosenIsShowing) {
                        new mapboxgl.Marker(lederhosenNick, { offset: [-40, -40] }).setLngLat(mapGeoJsonData.features[0].geometry.coordinates).addTo(map);
                        lederhosenIsShowing = true;
                    }
                    if (map.getZoom() < 13 && lederhosenIsShowing) {
                        $('.parker-marker').remove();
                        lederhosenIsShowing = false;
                    }
                });

                var compassControl = document.getElementsByClassName('mapboxgl-ctrl-compass')[0];
                if (compassControl !== undefined) compassControl.parentNode.removeChild(compassControl);

                document.getElementsByClassName('mapboxgl-canvas')[0].onmousedown = function () {
                    return false;
                };
            });

            //Adding map controls
            map.addControl(new mapboxgl.Navigation({ position: 'bottom-right' }));
            map.scrollZoom.disable();

            usButton.addEventListener('click', function (e) {
                map.flyTo({
                    center: [-97, 39],
                    zoom: 3
                });
                addClass(this, 'active');
                removeClass(globalButton, 'active');
                e.preventDefault();
            });

            globalButton.addEventListener('click', function (e) {
                var zoomValue = void 0;
                if (window.innerWidth < 600) {
                    zoomValue = 0;
                } else if (window.innerWidth < 1100) {
                    zoomValue = 1;
                } else {
                    zoomValue = 2;
                }
                map.flyTo({
                    center: [-10, 30],
                    zoom: zoomValue
                });
                addClass(this, 'active');
                removeClass(usButton, 'active');
                e.preventDefault();
            });
        });
    });

    // Initialize events
    $(function () {
        // window.uship.recorder.proxy('event', window.uship.recorder.proxies.consoleLogEvent);
        // window.uship.recorder.proxy('linkClick', window.uship.recorder.proxies.consoleLogLinkClick);
        window.uship.recorder.linkClick('#ship-main-cta', 'Get an Estimate', { 'type': 'CTA button' }, ['MP', 'GA']);
        window.uship.recorder.linkClick('#become-carrier-cta', 'Become a carrier', { 'type': 'CTA button' }, ['GA']);
        window.uship.recorder.linkClick('#ship-header-link', 'Ship Header', { 'type': 'CTA button' }, ['MP']);
        window.uship.recorder.linkClick('#ship-clt-cta', 'Ship Vehicle', { 'type': 'CTA button' }, ['MP']);
    });
}).call(this);