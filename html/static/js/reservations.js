(function (window, document, $, Parse, api) {

    var currentUser = api.getCurrentUser(),
        reservedClasses,
        reservedEquipment,

        initReservations = function() {
            var parseDate = formatDateForParse(new Date());
            $(document).on('listings.datechange', handleDateChange);
            $(document).on('listings.render', renderReservations);
            getReservations(parseDate);
        },

        getReservations = function(parseDate) {
            Parse.Promise.when(
                    api.getClassReservationsByUser(currentUser, parseDate),
                    api.getEquipmentReservationsByUser(currentUser, parseDate)
                ).then(function(a, b) {
                    console.log(a);
                    console.log(b);
                    reservedClasses = a;
                    reservedEquipment = b;
                    renderReservedClasses();
                    renderReservedEquipment();
                });
        },

        renderReservations = function() {

        },

        renderReservedClasses = function() {
            for (var i = 0; i < reservedClasses.length; i++) {
                var slotData = {
                    slotId : reservedClasses[i].id,
                    className : reservedClasses[i].get('class').get('name'),
                    roomName : reservedClasses[i].get('class').get('room').get('name'),
                    gymName : reservedClasses[i].get('gym').get('name'),
                    startTime : reservedClasses[i].get('start_time'),
                    endTime : reservedClasses[i].get('end_time')
                };
                // console.log(slotData);
            }
        },

        renderReservedEquipment = function() {
            for (var i = 0; i < reservedEquipment.length; i++) {
                var slotData = {
                    slotId : reservedEquipment[i].id,
                    equipmentName : reservedEquipment[i].get('equipmentId').get('name'),
                    roomName : reservedEquipment[i].get('slotId').get('roomId').get('name'),
                    gymName : reservedEquipment[i].get('gymId').get('name'),
                    startTime : reservedEquipment[i].get('slotId').get('start_time'),
                    endTime : reservedEquipment[i].get('slotId').get('end_time')
                };
                // console.log(slotData);
            }
        },

        handleDateChange = function() {

        };

    initReservations();

})(this, document, jQuery, Parse, api);
