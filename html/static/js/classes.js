(function (window, document, $, Parse, api, listings) {

    var
        currentUser = api.getCurrentUser(),
        classesByDate, // All classes for provided date (Array of Parse objects).
        myReservedClassSlots, // My reserved slots ({slotId:reservationId}).

        selectors = {
            'classListings' : '#class-listings'
        },

        // cache selectors where we can
        $classListings = $(selectors.classListings),

        initClasses = function() {
            var parseDate = formatDateForParse(new Date());
            $(document).on('listings.datechange', handleDateChange);
            $(document).on('listings.render', renderClassListings);
            getClassListings(parseDate);
        },

        getClassListings = listings.getClassListings = function(parseDate) {
            $classListings.html(listings.loadingSpinner);
            Parse.Promise.when(
                    api.getClassesByUniversityAndDate(currentUser.get('universityId'), parseDate),
                    api.getClassReservationsByUser(currentUser, parseDate)
                )
                .then(function(a, b) {
                    if(a.length) {
                        classesByDate = a;
                        classesByDate.sort(sortParseResultsByStartTime);
                        myReservedClassSlots = {};
                        for (var i = 0; i < b.length; i++) {
                            myReservedClassSlots[b[i].get('slotId')] = b[i].id;
                        }
                        renderClassListings();
                    } else {
                        noClassListingsFound();
                    }
                });
        },

        // TODO: Try and move this into listings.js
        renderClassListings = function() {
            var renderDates = classesByDate,
                renderTime;
            if(listings.startTime) {
                renderTime = listings.startTime;
            } else {
                if(!listings.selectedDate) {
                    renderTime = listings.getTodayStartTime();
                } else if(listings.selectedDate) {
                    if(isToday(listings.selectedDate)) {
                        renderTime = listings.getTodayStartTime();
                    }
                }
            }
            if(renderTime) {
                renderDates = filterParseResultsByStartTime(classesByDate, renderTime);
            }
            var html = '';
            if(renderDates.length) {
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
                            timeRange : listings.formatTimeRange(c.get('start_time'), c.get('end_time')),
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
                    html += listings.templates.listingItem.render(slotData);
                    listings.listingData[c.id] = slotData;
                }
                $classListings.hide().html(html).fadeIn(1000);
            } else {
                noClassListingsFound();
            }
        },

        handleDateChange = function(e, parseDate) {
            getClassListings(parseDate);
        },

        noClassListingsFound = function() {
            var html = '<div class="no-listings-found">No classes found.</div>';
            $classListings.html(html);
        };

    initClasses();

})(this, document, jQuery, Parse, api, listings);
