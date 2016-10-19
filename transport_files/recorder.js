'use strict';

;(function (root, $, uship) {
    'use strict';

    var shouldTrack = true;
    var MP = 'MP';
    var GA = 'GA';

    // mixpanel obj could be set async set.
    // So,lets do root.mixpanel instead of using closure.
    function hasMixpanel() {
        return typeof root.mixpanel !== 'undefined';
    }

    function hasGA() {
        return typeof root._gaq !== 'undefined';
    }

    function trackEvent(eventName, data, callback) {
        if (!hasMixpanel()) {
            return proxy('event').apply(null, arguments);
        }

        if (!shouldTrack) return;

        root.mixpanel.track(eventName, data, callback);
    }

    function trackEventAsync(eventName, data, resolveWithData) {
        var dfd = $.Deferred();
        if (!hasMixpanel()) {
            dfd.resolve(resolveWithData);
        } else {
            if (!shouldTrack) return;

            root.mixpanel.track(eventName, data, function () {
                dfd.resolve(resolveWithData);
            });
        }

        return dfd.promise();
    }

    function registerProperties(props) {
        if (!hasMixpanel()) {
            return proxy('register').apply(null, arguments);
        }
        if (!shouldTrack) return;

        root.mixpanel.register(props);
    }

    function registerOnce(props) {
        if (!hasMixpanel()) {
            return proxy('registerOnce').apply(null, arguments);
        }
        if (!shouldTrack) return;

        root.mixpanel.register_once(props);
    }

    function identifyUser(id) {
        if (!hasMixpanel()) {
            return proxy('identifyUser').apply(null, arguments);
        }
        if (!shouldTrack) return;

        root.mixpanel.identify(id);
    }

    function trackClick(linkSelector, eventName, data) {
        var providers = arguments.length <= 3 || arguments[3] === undefined ? [MP] : arguments[3];
        var callback = arguments[4];

        var isGA = providers.indexOf(GA) > -1;
        var isMixpanel = providers.indexOf(MP) > -1;

        if (isMixpanel && !hasMixpanel()) {
            return proxy('linkClick').apply(null, arguments);
        }

        if (!shouldTrack) return;

        if (isMixpanel) {
            root.mixpanel.track_links(linkSelector, eventName, data, callback);
        }

        if (isGA) {
            $(linkSelector).click(function (event) {
                event.preventDefault();
                event.stopPropagation();
                root._gaq.push(['_trackEvent', data.type, eventName, event.currentTarget.getAttribute('href')]);

                if (!isMixpanel) {
                    window.location = event.currentTarget.href;
                }
            });
        }
    }

    function proxy(name, fn) {
        if (arguments.length === 2) {
            proxy[name] = uship.utils.asCallable(fn);
        }

        return proxy[name] || uship.utils.noop;
    }

    // Proxies

    function consoleLogEvent(eventName, data, callback) {
        console.log(eventName, data);
        uship.utils.asCallable(callback)();
    }

    function consoleLogLinkClick(linkSelector, eventName, data, callback) {
        if (!$) return;
        $(linkSelector).on('click', function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            trackEvent(eventName, data, function (response) {
                uship.utils.asCallable(callback).call(null, response);
                console.log('Navigating to ', event.currentTarget.getAttribute('href'));
                simulateHyperlinkClick(event);
            });
        });
    }

    function simulateHyperlinkClick(event) {
        var link = $(event.currentTarget),
            href = link.attr('href'),
            target = link.attr('target');

        if ($.trim(target).length || event.which === 2) {
            root.open(href, target);
        } else {
            root.location = href;
        }
    }

    //Investigate: the significance of randomly throttling tracking as opposed to either tracking or no tracking
    // This function takes in a value between 0 and 1 to throttle mixpanel events on a page. It works on a per page not a per event basis. So call on page load.
    function setThrottle(throttlePercent) {

        if (Math.random() < throttlePercent) {
            shouldTrack = true;
        } else {
            shouldTrack = false;
        }
        //TODO: determine why we are returning true.
        return true;
    }

    uship.namespace('recorder').extend({
        event: trackEvent,
        linkClick: trackClick,
        async: trackEventAsync,
        register: registerProperties,
        registerOnce: registerOnce,
        identify: identifyUser,
        proxy: proxy,
        proxies: {
            consoleLogEvent: consoleLogEvent,
            consoleLogLinkClick: consoleLogLinkClick
        },
        throttle: setThrottle
    });
})(window, jQuery, uship);