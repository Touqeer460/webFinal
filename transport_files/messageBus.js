'use strict';

;(function (_ref) {
    var $ = _ref.jQuery;
    var uship = _ref.uship;
    var utils = uship.utils;


    var channels = {};
    var DEFAULT_CHANNEL = 'defaultChannel';
    var NAMESPACE_DELIMITER = '.';
    var NAMESPACE_WILDCARD = '*';
    var WILDCARD_EVENT_NAME = '_allEvents';

    function Channel(channelName) {
        this.name = channelName;
        this.broker = $({});
    }

    utils.extend(Channel.prototype, {
        publish: function publish(topic) {
            var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            utils.assert(topic, 'You must specify a topic on which to publish.');

            // Remove namespaces from full topic
            var eventName = topic.split(NAMESPACE_DELIMITER)[0];

            var message = {
                channel: this.name,
                timestamp: new Date(),
                topic: topic,
                eventName: eventName,
                data: data
            };

            var triggerList = makeTriggerListFromTopic(topic);

            utils.forEach(triggerList, function (topicToTrigger) {
                this.broker.trigger(topicToTrigger, message);
            }.bind(this));

            return this;
        },


        publishOnce: function publishOnce(topic, data) {
            if (utils.hasProp(publishOnce, topic)) return;
            this.publish(topic, data);
            publishOnce[topic] = true;
        },

        resetTopic: function resetTopic(topic) {
            if (this.publishOnce && utils.hasProp(this.publishOnce, topic)) {
                delete this.publishOnce[topic];
            }
        },

        /**
         * Subscribes a handler function to a topic published by the messageBus
         * @param  {string} topic           The name of the topic the handler should receive updates for
         * @param  {function} handler       The function to handle published updates about the topic
         * @param  {Object=} scope          `this` value to assign when executing the handler
         * @return {{dispose: function}}    A reference to remove the subscription
         */
        subscribe: function subscribe(topic, handler, scope) {
            utils.assert(topic, 'You must specify a topic to subscribe to.');
            utils.assert(handler && utils.isFunction(handler), 'You must specify a handler function for subscriptions.');

            // Support subscriptions of the form channel.subscribe('*.widget')
            if (topic.charAt(0) === NAMESPACE_WILDCARD) {
                topic = WILDCARD_EVENT_NAME + topic.substr(1);
            }

            var wrappedHandler = this._constructHandler(handler, scope);
            var broker = this.broker;

            broker.on(topic, wrappedHandler);

            return {
                dispose: function dispose() {
                    broker.off(topic, wrappedHandler);
                }
            };
        },
        unsubscribe: function unsubscribe(topic, handler, scope) {
            this.broker.off(topic, this._constructHandler(handler, scope));
        },
        _constructHandler: function _constructHandler(handler, scope) {
            return function (jqEv, message) {
                return handler.call(scope, message.data, message, jqEv);
            };
        }
    });

    function makeTriggerListFromTopic(topic) {

        var triggerList = [
        // Always trigger with the unaltered topic
        topic,
        // Always trigger for wildcard subscriptions to the entire channel
        WILDCARD_EVENT_NAME];

        var namespaces = topic.split(NAMESPACE_DELIMITER).slice(1);

        // Trigger for wildcard subscriptions to a particular namespace
        if (namespaces.length) {
            namespaces.shift(WILDCARD_EVENT_NAME);
            triggerList.push(namespaces.join(NAMESPACE_DELIMITER));
        }

        return triggerList;
    }

    function getChannel(channelOrChannelName) {
        if (channelOrChannelName instanceof Channel) return channelOrChannelName;

        var channelName = channelOrChannelName || DEFAULT_CHANNEL;

        if (!utils.hasProp(channels, channelName)) {
            channels[channelName] = new Channel(channelName);
        }

        return channels[channelName];
    }

    uship.messageBus = getChannel;

    uship.messageBus.publish = function (message) {
        getChannel(message.channel).publish(message.topic, message.data);
    };

    uship.messageBus.publishOnce = function (message) {
        getChannel(message.channel).publishOnce(message.topic, message.data);
    };

    uship.messageBus.resetTopic = function (message) {
        getChannel(message.channel).resetTopic(message.topic);
    };

    uship.messageBus.subscribe = function (options) {
        getChannel(options.channel).subscribe(options.topic, options.handler);
    };

    uship.messageBus.unsubscribe = function (options) {
        getChannel(options.channel).unsubscribe(options.topic, options.handler);
    };
})(window);