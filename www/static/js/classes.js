(function (window, document, $, Parse, api) {

    var currentUser = api.getCurrentUser(),
        classesByDate,
        myReservedClassSlots,
        classDetails,

        selectors = {
            'classListings' : '#class-listings',
            'classListingsItem' : '.listing-item',
            'classItemTemplate' : '#class-listings-item',
            'reserveModal' : '#reserve-modal',
            'multiSelectButtons' : '.multi-select-btn',
            'multiCancelButtons' : '.multi-select-cancel-all-btn',
            'multiReserveButtons' : '.multi-select-reserve-all-btn',
            'reserveTool' : '#collapse-reserve'
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

        spinner = '<div class="spinner"></div>',

        initializeClasses = function() {

            // bind event handlers
            $(document).on('date_carousel:date_selected', dateSelected);
            $(document).on('click', selectors.classListingsItem, onListingItemClick);
            $(document).on('click', selectors.multiCancelButtons, onMultiCancel);
            $(document).on('click', selectors.multiReserveButtons, onMultiReserve);
            $reserveTool.on('hide.bs.collapse', onCollapseReserveTool);

            var date = getUrlParameter('dt');
            if (!date) {
                date = formatDateForParse(new Date());
            }
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
            var s = start.replace(/\s+|PM|AM/g, ''),
                e = end.replace(/\s+/g, '');
            if (s.charAt(0) === '0') s = s.substr(1);
            if (e.charAt(0) === '0') e = e.substr(1);
            return s + '-' + e;
        };

        initializeClasses();
    // loadClassDetails('ZeGQRFqoe1');

})(this, document, jQuery, Parse, api);
