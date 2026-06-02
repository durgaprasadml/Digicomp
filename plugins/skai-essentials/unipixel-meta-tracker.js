document.addEventListener('DOMContentLoaded', function () {

    // Retrieve logging settings from the localized object, if available.
    // Fallback to true if the settings are not defined.
    var enableLogging_InitiateEvents = (typeof UniPixelSettings !== 'undefined' && typeof UniPixelSettings.enableLogging_InitiateEvents !== 'undefined')
        ? UniPixelSettings.enableLogging_InitiateEvents : true;
    var enableLogging_SendEvents = (typeof UniPixelSettings !== 'undefined' && typeof UniPixelSettings.enableLogging_SendEvents !== 'undefined')
        ? UniPixelSettings.enableLogging_SendEvents : true;

    function log_Initiate(message, data) {
        if (enableLogging_InitiateEvents) {
            console.log(message, data);
        }
    }

    function log_Send(message, data) {
        if (enableLogging_SendEvents) {
            console.log(message, data);
        }
    }

    var eventsToTrack = UniPixelEventDataMeta.eventsToTrack;
    var standardEvents = [
        "AddPaymentInfo", "AddToCart", "AddToWishlist", "CompleteRegistration",
        "Contact", "CustomizeProduct", "Donate", "FindLocation",
        "InitiateCheckout", "Lead", "PageView", "Purchase",
        "Schedule", "Search", "StartTrial", "SubmitApplication",
        "Subscribe", "ViewContent"
    ];

    log_Initiate('UniPixel | Meta: UniPixelEventDataMeta Obj:', UniPixelEventDataMeta);
    log_Initiate('UniPixel | Meta: Tracker Loaded');


    function trackEvent(event, element) {

        if (!window.unipixelCheckConsentForEvent()) {
            console.log('UniPixel | Meta: Consent not granted, blocking event:', event.name);
            return;
        }

        var event_id = event.event_id;
        var event_params = {};
        var isStandard = standardEvents.includes(event.name);

        // determine fbq method and label
        var fbqMethod = isStandard ? 'track' : 'trackCustom';
        var fbqLabel = isStandard ? 'standard' : 'custom';

        // fire the fbq call
        // NOTE: Meta Pixel automatically captures the page URL (event_source_url), user agent, IP, cookies, and action_source
        // this client-side code only needs to supply the eventID (and any explicit event_params) for deduplication.

        fbq(fbqMethod, event.name, event_params, { eventID: event_id });
        log_Send(
            'UniPixel | Meta: Client-side ' + fbqLabel + ' event sent:',
            { event_name: event.name, event_params: event_params, event_id: event_id }
        );

        // server-side AJAX
        jQuery.post(UniPixelEventDataMeta.ajaxurl, {
            action: 'track_dynamic_event_meta',
            eventName: event.name,
            elementRef: event.elementRef,
            eventTrigger: event.trigger,
            event_id: event_id,
            pageUrl: window.location.href,
            nonce: UniPixelEventDataMeta.nonce
        })
            .done(function (resp) {
                var jsn = JSON.parse(resp);
                log_Send('UniPixel | Meta: Server-side ' + fbqMethod + ' event sent:', jsn.dataSent);
                log_Send('UniPixel | Meta: Server-side ' + fbqMethod + ' event response:', jsn.platformResponse);
            })
            .fail(function (_, status, err) {
                log_Send('UniPixel | Meta: Server-side event error:', status, err);
            });
    }


    eventsToTrack.forEach(function (event) {
        log_Initiate('UniPixel | Meta: Setting up tracking for event:', event);

        document.querySelectorAll(event.elementRef).forEach(element => {
            if (event.trigger === "click") {
                element.addEventListener('click', function () {
                    trackEvent(event, element);
                });
            }

            if (event.trigger === "shown") {
                var shownTriggered = false;
                new IntersectionObserver(function (entries, observer) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting && !shownTriggered) {
                            trackEvent(event, element);
                            shownTriggered = true;
                            observer.disconnect();
                        }
                    });
                }).observe(element);

                var mutationObserver = new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        if (element.offsetParent !== null && !shownTriggered) {
                            trackEvent(event, element);
                            shownTriggered = true;
                            mutationObserver.disconnect(); // Use the correct reference
                        }
                    });
                });

                mutationObserver.observe(element, { attributes: true, childList: false, subtree: false });
            }
        });
    });
});
