(function (window, document, $, Parse, api) {

    var currentUser = api.getCurrentUser(),
        classesByDate, // All classes for provided date (Array of Parse objects).
        myReservedClassSlots, // My reserved slots ({slotId:reservationId}).
		classesData, // Classes converted into template-digestible objects (Array).
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
            'startTimeFilterInput' : '.listing-enter-time-form-input'
        },

        cssClasses = {
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
            $startTimeFilterForm.on('submit', onStartTimeFormSubmit);
            $(document).on('input', selectors.startTimeFilterInput, onStartTimeInputKeyup);

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
                        myReservedClassSlots = {};
                        for (var i = 0; i < b.length; i++) {
                            myReservedClassSlots[b[i].get('slotId')] = b[i].id;
                        }
                        renderClasses();
                    } else {
                        noClassesFound(date);
                    }
                });
        },

        renderClasses = function () {
            var renderDates = classesByDate;
            if(startTime) {
                renderDates = filterParseResultsByStartTime(classesByDate, startTime);
            }
            console.log('All Classes', renderDates);
            var html = '';
			classesData = [];
            for (var i = 0; i < renderDates.length; i++) {
                var c = renderDates[i];
                var slotData = {
                    classId : c.get('classId'),
                    slotId : c.id,
                    className : c.get('class').get('name'),
                    roomName : c.get('class').get('room').get('name'),
                    gymName : c.get('gym').get('name'),
                    startTime : c.get('start_time'),
                    endTime : c.get('end_time'),
                    timeRange : formatTimeRange(c.get('start_time'), c.get('end_time')),
                    myReservation : myReservedClassSlots[c.id] || false,
                    available : (parseInt(c.get('reserved_spots')) < parseInt(c.get('class').get('spots'))),
                    totalOccupancy : c.get('class').get('room').get('totalOccupancy'),
                    reservedOccupancy : c.get('class').get('room').get('reservedOccupancy')
                };
                slotData.spotsRemaining = slotData.totalOccupancy - slotData.reservedOccupancy || 0;
                html += templates.classListingsItem.render(slotData);
				classesData.push(slotData);
            }
            $classListings.html(html);
        },

        loadClassDetails = function (slotId) {
            api.getClassDetails(slotId).then(function(a) {
                renderClassDetails(a);
            });
        },

        renderClassDetails = function (classDetails) {
            var slotData;
			for (var i = 0; i < classesData.length; i++) {
				if (classesData[i].slotId === classDetails.id) {
					slotData = classesData[i];
					break;
				}
			}
            // console.log(classDetails);
			// console.log(slotData);
			// TODO: loop through classesData to get additional times.
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
                $l.toggleClass(cssClasses.multiBtnSelected);
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
            $classListings.find('.' + cssClasses.multiBtnSelected).removeClass(cssClasses.multiBtnSelected);
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

        resetStartTime = function() {
            var d = new Date();
            if(isToday(d)) {
                var h = d.getHours(),
                    ampm = (h >= 12)? 'PM' : 'AM',
                    hh = ((h + 11) % 12 + 1);
                startTime = hh + ':' + d.getMinutes() + ' ' + ampm;
            } else {
                startTime = null;
            }
        },

        onStartTimeFormSubmit = function(e) {
            e.preventDefault();
        },

        onStartTimeInputKeyup = function(e) {
            var val = $(e.currentTarget).val();
            if(val.length >= 6) {
                if(val.match(startTimeFilterRegex)) {
                    if(val.indexOf(' ') == -1) {
                        // add a space before AM/PM since Parse is picky
                        val = val.slice(0, -2) + ' ' + val.slice(-2);
                    }
                    startTime = val;
                    renderClasses();
                }
            }
        };

        initializeClasses();
    // loadClassDetails('ZeGQRFqoe1');

})(this, document, jQuery, Parse, api);
