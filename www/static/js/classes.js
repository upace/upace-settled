(function (window, document, $, Parse, api) {

    var currentUser = api.getCurrentUser(),
        classesByDate,
        myReservedClassSlots,
        classDetails,

        selectors = {
            'classListings' : '#class-listings',
            'classItemTemplate' : '#class-listings-item'
        },

        templates = {
            'classListingsItem' : twig({
                data: $(selectors.classItemTemplate).html()
            })
        },

        spinner = '<div class="spinner"></div>',

        initializeClasses = function() {
            $(document).on('date_carousel:date_selected', dateSelected);
            var date = getUrlParameter('dt');
            if (!date) {
                date = formatDateForParse(new Date());
            }
            refreshClasses(date);
        },

        refreshClasses = function(date) {
            $(selectors.classListings).html(spinner);
            Parse.Promise.when(
                    api.getClassesByUniversityAndDate(currentUser.get('universityId'), date),
                    api.getClassReservationsByUser(currentUser, date)
                )
                .then(function(a, b) {
                    if(a.length) {
                        classesByDate = a;
                        myReservedClassSlots = [];
                        for (var i = 0; i < b.length; i++) {
                            myReservedClassSlots.push(b[i].get('slot'));
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
                var slotData = {
                    slotId : classesByDate[i].id,
                    className : classesByDate[i].get('class').get('name'),
                    roomName : classesByDate[i].get('class').get('room').get('name'),
                    gymName : classesByDate[i].get('gym').get('name'),
                    startTime : classesByDate[i].get('start_time'),
                    endTime : classesByDate[i].get('end_time'),
                    reservedByMe : ($.inArray(classesByDate[i].id, myReservedClassSlots) !== -1),
                    available : (parseInt(classesByDate[i].get('reserved_spots')) < parseInt(classesByDate[i].get('class').get('spots'))),
                    totalOccupancy : classesByDate[i].get('class').get('room').get('totalOccupancy'),
                    reservedOccupancy : classesByDate[i].get('class').get('room').get('reservedOccupancy')
                };
                slotData.spotsRemaining = slotData.totalOccupancy - slotData.reservedOccupancy || 0;
                html += templates.classListingsItem.render(slotData);
            }
            $(selectors.classListings).html(html);
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
            var html = '<div class="no-classes-found">No classes available on '+ date + '.<br/><br/>:(</div>';
            $(selectors.classListings).html(html);
        };


    initializeClasses();
    // loadClassDetails('ZeGQRFqoe1');

})(this, document, jQuery, Parse, api);
