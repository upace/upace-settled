(function (window, document, $, Parse, api) {

    var currentUser = api.getCurrentUser(),
        classesByDate,
        reservedClassSlots,
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

        initializeClasses = function() {
            $(document).on('date_carousel:date_selected', dateSelected);
            var date = getUrlParameter('dt');
            if (!date) {
                date = formatDateForParse(new Date());
            }
            refreshClasses(date);
        },

        refreshClasses = function(date) {
            Parse.Promise.when(
                    api.getClassesByUniversityAndDate(currentUser.get('universityId'), date),
                    api.getClassReservationsByUniversityAndDate(currentUser.get('universityId'), date)
                )
                .then(function(a, b) {
                    classesByDate = a;
                    reservedClassSlots = [];
                    for (var i = 0; i < b.length; i++) {
                        reservedClassSlots.push(b[i].get('slot'));
                    }
                    renderClasses();
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
                    reserved : ($.inArray(classesByDate[i].id, reservedClassSlots) !== -1),
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
            console.log(classDetails);
        },

        dateSelected = function(evt, el) {
            var parseDate = $(el).data('parse-date');
            refreshClasses(parseDate);
        };

    initializeClasses();
    // loadClassDetails('ZeGQRFqoe1');

})(this, document, jQuery, Parse, api);
