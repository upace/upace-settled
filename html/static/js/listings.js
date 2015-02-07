if (!window.listings) {
    window.listings = {};
}

(function (window, document, $, Parse, api, listings) {

    var
        currentUser = api.getCurrentUser(),
        listingData = {},
        classesByDate, // All classes for provided date (Array of Parse objects).
        myReservedClassSlots, // My reserved slots ({slotId:reservationId}).
        startTime,
        selectedDate,

        selectors = {
            'classListings' : '#class-listings',
            'listingItem' : '.listing-item',
            'listingItemTemplate' : '#listing-item-template',
            'listingDetailTemplate' : '#listing-item-details-template',
            'reserveModal' : '#reserve-modal',
            'reserveTool' : '#collapse-reserve',
            'reserveModalItemDetails' : '#reserve-modal-item-details',
            'reserveModalListingInfo' : '.reserve-modal-details',
            'reserveModalBtnReserve' : '.reserve-modal-reserve-btn',
            'reserveModalBtnCancel' : '.reserve-modal-cancel-btn',
            'multiSelectButtons' : '.multi-select-btn',
            'multiCancelButtons' : '.multi-select-cancel-all-btn',
            'multiReserveButtons' : '.multi-select-reserve-all-btn',
            'startTimeFilterWrap' : '#collapse-add-time',
            'startTimeFilterForm' : '.listing-enter-time-form',
            'startTimeFilterInput' : '.listing-enter-time-form-input'
        },

        cssClasses = {
            'listingSelected' : 'listing-item-selected',
            'listingReserved' : 'listing-item-reserved'
        },

        templates = {
            'listingItem' : twig({
                data: $(selectors.listingItemTemplate).html()
            }),
            'listingDetailTemplate' : twig({
                data: $(selectors.listingDetailTemplate).html()
            })
        },

        spinner = '<div class="spinner"></div>',
        startTimeFilterRegex = new RegExp(/^((1[0-2])|^(0?[0-9])):[0-5][0-9](\s?)(pm|am)$/ig),

        // cache selectors where we can
        $classListings = $(selectors.classListings),
        $reserveModal = $(selectors.reserveModal),
        $reserveTool = $(selectors.reserveTool),
        $startTimeFilterWrap = $(selectors.startTimeFilterWrap),
        $startTimeFilterForm = $(selectors.startTimeFilterForm),

        initListings = function() {
            $(document).on('click', selectors.listingItem, onListingItemClick);
            $(document).on('click', selectors.multiCancelButtons, onMultiCancel);
            $(document).on('click', selectors.multiReserveButtons, onMultiReserve);
            $(document).on('click', selectors.reserveModalBtnReserve, onModalBtnClick);
            $(document).on('click', selectors.reserveModalBtnCancel, onModalBtnClick);
            $reserveTool.on('hide.bs.collapse', clearListingSelections);
            $(document).on('date_carousel:date_selected', dateSelected);
            $startTimeFilterWrap.on('show.bs.collapse', onOpenStartTimeFilter);
            $startTimeFilterWrap.on('hide.bs.collapse', onCloseStartTimeFilter);
            $startTimeFilterForm.on('submit', onStartTimeFormSubmit);
            $(document).on('input', selectors.startTimeFilterInput, onStartTimeInput);
        },

        // o = listing item
        saveReservation = function(o) {
            var $this = $(o),
                classId = $this.data('class-id'),
                slotId = $this.data('slot-id');
            if(classId){
                Parse.Promise.when(
                        api.saveClassReservation(currentUser, classId, slotId)
                    )
                    .then(function(r) {
                        $this.addClass(cssClasses.listingReserved).attr('data-reservation-id', r.id);
                        listingData[slotId].myReservation = r.id;
                    });
            }
        },

        cancelReservation = function(o) {
            var $this = $(o),
                classId = $this.data('class-id'),
                slotId = $this.data('slot-id'),
                resId = $this.data('reservation-id');
            if(resId) {
                if(classId) {
                    Parse.Promise.when(
                            api.deleteClassReservations(resId)
                        )
                        .then(function(a) {
                            $this.removeClass(cssClasses.listingReserved).removeAttr('data-reservation-id');
                            listingData[slotId].myReservation = false;
                        });
                }
            }
        },

        onMultiReserve = function() {
            $('.' + cssClasses.listingSelected)
                .not('.' + cssClasses.listingReserved)
                .each(function(i,o){
                    saveReservation(o);
                });
            clearListingSelections();
        },

        onMultiCancel = function() {
            $('.' + cssClasses.listingSelected + '.' + cssClasses.listingReserved)
                .each(function(i,o){
                    cancelReservation(o);
                });
            clearListingSelections();
        },

        clearListingSelections = function() {
            $('.' + cssClasses.listingSelected).removeClass(cssClasses.listingSelected);
        },

        onListingItemClick = function(e) {
            var $l = $(e.currentTarget);
            if($reserveTool.is(':visible')) {
                $l.toggleClass(cssClasses.listingSelected);
            } else {
                Parse.Promise.when(
                    api.getClassDetails($l.data('slot-id'))
                )
                .then(function(a) {
                    renderListingDetails(a.id);
                });
            }
        },

        renderListingDetails = function (slotId) {
            $(selectors.reserveModalItemDetails).html(templates.listingDetailTemplate.render(listingData[slotId]));
            $reserveModal.modal('show');
            // TODO: loop through classesData to get additional times.
        },

        onModalBtnClick = function() {
            var $info = $(this).closest(selectors.reserveModalListingInfo),
                $listing = $('#' + $info.data('slot-id'));
            if($info.data('reservation-id')) {
                cancelReservation($listing);
            } else {
                saveReservation($listing);
            }
            $reserveModal.modal('hide');
        },

        fetchClasses = listings.fetchClasses = function(parseDate) {
            $classListings.html(spinner);
            Parse.Promise.when(
                    api.getClassesByUniversityAndDate(currentUser.get('universityId'), parseDate),
                    api.getClassReservationsByUser(currentUser, parseDate)
                )
                .then(function(a, b, c) {
                    if(a.length) {
                        classesByDate = a;
                        classesByDate.sort(sortParseResultsByStartTime);
                        myReservedClassSlots = {};
                        for (var i = 0; i < b.length; i++) {
                            myReservedClassSlots[b[i].get('slotId')] = b[i].id;
                        }
                        renderClasses();
                    } else {
                        noClassesFound();
                    }
                });
        },

        renderClasses = function() {
            var renderDates = classesByDate,
                renderTime;
            if(startTime) {
                renderTime = startTime;
            } else {
                if(!selectedDate) {
                    renderTime = getTodayStartTime();
                } else if(selectedDate) {
                    if(isToday(selectedDate)) {
                        renderTime = getTodayStartTime();
                    }
                }
            }
            if(renderTime) {
                renderDates = filterParseResultsByStartTime(classesByDate, renderTime);
            }
            var html = '';
            if(renderDates.length > 0) {
                for (var i = 0; i < renderDates.length; i++) {
                    var c = renderDates[i],
                        slotData = {
                            classId : c.get('classId'),
                            slotId : c.id,
                            listingName : c.get('class').get('name'),
                            roomName : c.get('class').get('room').get('name'),
                            gymName : c.get('gym').get('name'),
                            startTime : c.get('start_time'),
                            endTime : c.get('end_time'),
                            timeRange : formatTimeRange(c.get('start_time'), c.get('end_time')),
                            myReservation : myReservedClassSlots[c.id] || false,
                            // TODO: availability and slots do not work currently, there is no c.get('reserved_spots')
                            available : (parseInt(c.get('reserved_spots')) < parseInt(c.get('class').get('spots'))),
                            totalOccupancy : c.get('class').get('room').get('totalOccupancy'),
                            reservedOccupancy : c.get('class').get('room').get('reservedOccupancy'),
                            description : c.get('class').get('description'),
                            date : c.get('class').get('date')
                        },
                        dateTime = new Date(slotData.date),
                        date = dateAbbr[dateTime.getDay()] + ' ' + dateTime.getDate() + '/' + (dateTime.getMonth() + 1);
                    slotData.date = date;
                    slotData.spotsRemaining = slotData.totalOccupancy - slotData.reservedOccupancy || 0;
                    html += templates.listingItem.render(slotData);
                    listingData[c.id] = slotData;
                }
                $classListings.hide().html(html).fadeIn(1000);
            } else {
                noClassesFound();
            }
        },

        dateSelected = function(evt, el) {
            var parseDate = $(el).data('parse-date');
            selectedDate = new Date($(el).data('full-date'));
            fetchClasses(parseDate);
        },

        noClassesFound = function() {
            var html = '<div class="no-classes-found">No classes found.</div>';
            $classListings.html(html);
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
            var $input = $(selectors.startTimeFilterInput);
            startTime = null;
            if($input.val() != '') {
                $input.val('');
                renderClasses();
            }
        },

        onStartTimeFormSubmit = function(e) {
            e.preventDefault();
        },

        onStartTimeInput = function(e) {
            var val = $(e.currentTarget).val();
            if(val.match(startTimeFilterRegex)) {
                if(val.indexOf(' ') == -1) {
                    // add a space before AM/PM since Parse is picky
                    val = val.slice(0, -2) + ' ' + val.slice(-2);
                }
                startTime = val;
                renderClasses();
            } else {
                startTime = null;
                if(val == '') {
                    renderClasses();
                }
            }
        },

        getTodayStartTime = function() {
            var d = new Date(),
                h = d.getHours(),
                ampm = (h >= 12)? 'PM' : 'AM',
                hh = ((h + 11) % 12 + 1);
            return hh + ':' + d.getMinutes() + ' ' + ampm;
        };

    initListings();

})(this, document, jQuery, Parse, api, listings);
