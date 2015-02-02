(function (window, document, $, Parse, api) {

    var currentUser = api.getCurrentUser(),
        classesByDate,
        myReservedClassSlots,
        classDetails,
        startTime,

        selectors = {
            'classListings' : '#class-listings',
            'classListingsItem' : '.listing-item',
            'classItemTemplate' : '#class-listings-item',
            'reserveModal' : '#reserve-modal',
            'multiSelectButtons' : '.multi-select-btn',
            'multiCancelButtons' : '.multi-select-cancel-all-btn',
            'multiReserveButtons' : '.multi-select-reserve-all-btn',
            'reserveTool' : '#collapse-reserve',
            'startTimeFilterWrap' : '#collapse-add-time',
            'startTimeFilterForm' : '.listing-enter-time-form',
            'startTimeFilterInput' : '.form-add-time'
        },

        classes = {
            'multiBtnSelected' : 'listing-item-selected'
        },

        templates = {
            'classListingsItem' : twig({
                data: $(selectors.classItemTemplate).html()
            })
        },

        // cache selectors where we can
        $classListings = $(selectors.classListings),
        $reserveTool = $(selectors.reserveTool),
        $startTimeFilterWrap = $(selectors.startTimeFilterWrap),
        $startTimeFilterForm = $(selectors.startTimeFilterForm),

        spinner = '<div class="spinner"></div>',
        startTimeFilterRegex = new RegExp(/^((1[0-2])|^(0?[0-9])):[0-5][0-9](\s?)(pm|am)$/ig),

        initializeClasses = function() {

            // bind event handlers
            $(document).on('date_carousel:date_selected', dateSelected);
            $(document).on('click', selectors.classListingsItem, onListingItemClick);
            $(document).on('click', selectors.multiCancelButtons, onMultiCancel);
            $(document).on('click', selectors.multiReserveButtons, onMultiReserve);
            $reserveTool.on('hide.bs.collapse', onCollapseReserveTool);
            $startTimeFilterWrap.on('show.bs.collapse', onOpenStartTimeFilter);
            $startTimeFilterWrap.on('hide.bs.collapse', onCloseStartTimeFilter);
            $startTimeFilterForm.on('submit', onStartTimeFormSubmit);

            var date = getUrlParameter('dt');
            if (!date) {
                date = formatDateForParse(new Date());
            }
            resetStartTime();
            refreshClasses(date);
        },

        refreshClasses = function(date) {
            $classListings.html(spinner);
            Parse.Promise.when(
                    api.getClassesByUniversityAndDate(currentUser.get('universityId'), date),
                    api.getClassReservationsByUser(currentUser, date)
                )
                .then(function(a, b) {
                    if(a.length) {
                        classesByDate = a;
						classesByDate.sort(sortParseResultsByStartTime);
                        if(startTime) {
                            classesByDate = filterParseResultsByStartTime(classesByDate, startTime);
                        }
                        myReservedClassSlots = [];
                        for (var i = 0; i < b.length; i++) {
                            myReservedClassSlots.push(b[i].get('slotId'));
                        }
                        renderClasses();
                    } else {
                        noClassesFound(date);
                    }
                });
        },

        renderClasses = function () {
            console.log('All Classes', classesByDate);
            var html = '';
            for (var i = 0; i < classesByDate.length; i++) {
                var c = classesByDate[i];
                var slotData = {
                    classId : c.get('classId'),
                    slotId : c.id,
                    className : c.get('class').get('name'),
                    roomName : c.get('class').get('room').get('name'),
                    gymName : c.get('gym').get('name'),
                    startTime : c.get('start_time'),
                    endTime : c.get('end_time'),
                    timeRange : formatTimeRange(c.get('start_time'), c.get('end_time')),
                    reservedByMe : ($.inArray(c.id, myReservedClassSlots) !== -1),
                    available : (parseInt(c.get('reserved_spots')) < parseInt(c.get('class').get('spots'))),
                    totalOccupancy : c.get('class').get('room').get('totalOccupancy'),
                    reservedOccupancy : c.get('class').get('room').get('reservedOccupancy')
                };
                slotData.spotsRemaining = slotData.totalOccupancy - slotData.reservedOccupancy || 0;
                html += templates.classListingsItem.render(slotData);
            }
            $classListings.html(html);
        },

        loadClassDetails = function (slotId) {
            api.getClassDetails(slotId).then(function(a) {
                classDetails = a;
                renderClassDetails();
            });
        },

        renderClassDetails = function () {
            var available = (parseInt(classDetails.get('reserved_spots')) < parseInt(classDetails.get('class').get('spots'))),
                reservedByMe = ($.inArray(classDetails.id, myReservedClassSlots) !== -1);
            console.log(classDetails);
        },

        dateSelected = function(evt, el) {
            var parseDate = $(el).data('parse-date');
            refreshClasses(parseDate);
        },

        noClassesFound = function(date) {
            var html = '<div class="no-classes-found">No classes available on '+ date + '.</div>';
            $classListings.html(html);
        },

        onListingItemClick = function(e) {
            var $l = $(e.currentTarget);
            if($reserveTool.is(':visible')) {
                $l.toggleClass(classes.multiBtnSelected);
                return;
            }
            Parse.Promise.when(
                    api.saveClassReservation(currentUser, $l.data('class-id'), $l.data('slot-id'))
                )
                .then(function(a) {
                    console.log(a);
                });
            $(selectors.reserveModal).modal('show');
        },

        onCollapseReserveTool = function() {
            $classListings.find('.' + classes.multiBtnSelected).removeClass(classes.multiBtnSelected);
        },

        onMultiReserve = function() {
            console.log('reserve all');
        },

        onMultiCancel = function() {
            console.log('cancel all');
        },

        formatTimeRange = function(start, end) {
            if(!start && !end){
                return '';
            }
            var s = start.replace(/\s+|pm|am/gi, ''),
                e = end.replace(/\s+/g, '');
            if (s.charAt(0) === '0') s = s.substr(1);
            if (e.charAt(0) === '0') e = e.substr(1);
            return s + '-' + e;
        },

        onOpenStartTimeFilter = function() {
            $('html, body').animate({ scrollTop: 0 }, 200);
        },

        onCloseStartTimeFilter = function() {
            $(selectors.startTimeFilterInput).val('');
            resetStartTime();
        },

        resetStartTime = function() {
            var d = new Date();
            if(isToday(d)) {
                var h = d.getHours(),
                    ampm = (h >= 12)? 'PM' : 'AM',
                    h = ((h + 11) % 12 + 1);
                startTime = h + ':' + d.getMinutes() + ' ' + ampm;
            } else {
                startTime = null;
            }
        },

        onStartTimeFormSubmit = function(e) {
            e.preventDefault();
            var val = $(e.currentTarget).find(selectors.startTimeFilterInput).val();
            if(!val) {
                startTime = null;
                $(selectors.startTimeFilterWrap).collapse('hide');
            } else if(val.match(startTimeFilterRegex)) {
                if(val.indexOf(' ') == -1) {
                    // add a space before AM/PM since Parse is picky
                    val = val.slice(0, -2) + ' ' + val.slice(-2);
                }
                startTime = val;
            }
        };

        initializeClasses();
    // loadClassDetails('ZeGQRFqoe1');

})(this, document, jQuery, Parse, api);
