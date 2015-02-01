(function (window, document, $) {

    var selectors = {
            'dateCarousel' : '#classes-date-slider',
            'dateSlide' : '.date-placeholder',
            'dateItemTemplate' : '#date-scroller-item',
            'hdrDay' : '#header-active-day',
            'hdrMonth' : '#header-active-month',
            'hdrYear' : '#header-active-year'
        },

        activeDateClass = "date-active",

        templates = {
            'hdrScrollerItem' : twig({
                data: $(selectors.dateItemTemplate).html()
            })
        },

        initializeDateScroller = function() {
            updateHeaderDate(new Date());
            populateDateSlider();
            initDateCarousel();
        },

        initDateCarousel = function() {
            $(selectors.dateCarousel).owlCarousel({
                center: true,
                stagePadding: 10,
                loop: false,
                margin: 0,
                nav: false,
                responsive: {
                    0: {
                        items: 5
                    },
                    481: {
                        items: 6
                    },
                    768: {
                        items: 10
                    },
                    992: {
                        items: 12
                    },
                    1200: {
                        items: 14
                    },
                    1600: {
                        items: 16
                    }
                }
            });
            $(selectors.dateSlide).on('click', handleDateSlideClick);
        },

        populateDateSlider = function() {
            // addDays sets the number of future dates to fetch
            var dateArray = getDates(new Date(), (new Date()).addDays(62)),
                html = '';
            for (var i = 0; i < dateArray.length; i++) {
                html += templates.hdrScrollerItem.render({
                    pos: i,
                    parse_date: formatDateForParse(dateArray[i]),
                    full_date: dateArray[i],
                    active: (isToday(dateArray[i])) ? true : false,
                    day: dateArray[i].getDate(),
                    day_abbr: dateAbbr[dateArray[i].getDay()]
                });
            }
            $(selectors.dateCarousel).html(html);
        },

        updateHeaderDate = function(date) {
            var day = (isToday(date)) ? 'Today' : date.getDate();
            $(selectors.hdrDay).html(day);
            $(selectors.hdrMonth).html(months[date.getMonth()]);
            $(selectors.hdrYear).html(date.getFullYear());
        },

        handleDateSlideClick = function(e) {
            var $caro = $(selectors.dateCarousel),
                $el = $(this);
            $caro.find('.' + activeDateClass).removeClass(activeDateClass);
            $caro.trigger('to.owl.carousel', [$el.data('pos')]);
            $el.addClass(activeDateClass);
            updateHeaderDate(new Date($el.data('full-date')));
            $(document).trigger('date_carousel:date_selected', $el);
        }

    initializeDateScroller();

})(this, document, jQuery);
