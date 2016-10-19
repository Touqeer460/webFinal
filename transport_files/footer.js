'use strict';

(function ($, uship) {
    if (!uship.recorder) {
        return;
    }

    function addExitLinkAnalytics() {
        // uship.recorder.proxy('event', uship.recorder.proxies.consoleLogEvent);
        // uship.recorder.proxy('linkClick', uship.recorder.proxies.consoleLogLinkClick);
        uship.recorder.linkClick('.iOS-app-footer-link', 'App Download Apple Store', { 'type': 'Exit Link Click' }, ['GA']);
        uship.recorder.linkClick('.android-app-footer-link', 'App Download Google Play', { 'type': 'Exit Link Click' }, ['GA']);
        uship.recorder.linkClick('.careers-footer-link', 'Careers', { 'type': 'Exit Link Click' }, ['GA']);
        uship.recorder.linkClick('.press-footer-link', 'Press', { 'type': 'Exit Link Click' }, ['GA']);
        uship.recorder.linkClick('.facebook-footer-link', 'Facebook', { 'type': 'Exit Link Click' }, ['GA']);
        uship.recorder.linkClick('.twitter-footer-link', 'Twitter', { 'type': 'Exit Link Click' }, ['GA']);
        uship.recorder.linkClick('.youtube-footer-link', 'Youtube', { 'type': 'Exit Link Click' }, ['GA']);
        uship.recorder.linkClick('.linkedin-footer-link', 'Linkedin', { 'type': 'Exit Link Click' }, ['GA']);
        uship.recorder.linkClick('.howitworks-footer-link', 'How it Works (Footer)', { 'type': 'Exit Link Click' }, ['GA']);
        uship.recorder.linkClick('.company-footer-link', 'Company', { 'type': 'Exit Link Click' }, ['GA']);
    }

    addExitLinkAnalytics();
})(jQuery, uship);