(function (window, document, $, Parse, api) {

    var currentUser = api.getCurrentUser(),
        equipmentByDate,
        reservedEquipmentSlots,
        myReservedEquipmentSlots,
        equipmentDetails,

        initializeEquipment = function() {
            var date = getUrlParameter('dt');
            if (!date) {
                date = formatDateForParse(new Date());
            }

            Parse.Promise.when(
                    api.getEquipmentByUniversity(currentUser.get('universityId')),
                    api.getEquipmentReservationsByUniversityAndDate(currentUser.get('universityId'), date)
                )
                .then(function(a, b) {
                    var closeDates = [],
                        openOnDt = true;
                    try {
                        closeDates = a[0].get('gymId').get('closeDate').split(',');
                        openOnDt = ($.inArray(date, closeDates) === -1);
                    }
                    catch (ex) {}
                    if (openOnDt) {
                        equipmentByDate = a;
						equipmentByDate.sort(sortParseResultsByStartTime);
                    }
                    else {
                        equipmentByDate = [];
                    }
                    reservedEquipmentSlots = [];
                    myReservedEquipmentSlots = [];
                    for (var i = 0; i < b.length; i++) {
                        reservedEquipmentSlots.push(b[i].id);
                        if (b[i].get('userId').id === currentUser.id) {
                            myReservedEquipmentSlots.push(b[i].id);
                        }
                    }
                    renderEquipment();
                });
        },

        renderEquipment = function () {
            console.log('All Equipment', equipmentByDate);
            for (var i = 0; i < equipmentByDate.length; i++) {
                var slotData = {
                    slotId : equipmentByDate[i].id,
                    equipmentName : equipmentByDate[i].get('equipId').get('name'),
                    roomName : equipmentByDate[i].get('roomId').get('name'),
                    gymName : equipmentByDate[i].get('gymId').get('name'),
                    startTime : equipmentByDate[i].get('start_time'),
                    endTime : equipmentByDate[i].get('end_time'),
                    reservedByMe : ($.inArray(equipmentByDate[i].id, myReservedEquipmentSlots) === -1),
                    available : ($.inArray(equipmentByDate[i].id, reservedEquipmentSlots) === -1)
                };
            }
        },

        loadEquipmentDetails = function (slotId) {
            api.getEquipmentDetails(slotId).then(function(a) {
                equipmentDetails = a;
                renderEquipmentDetails();
            });
        },

        renderEquipmentDetails = function () {
            var available = ($.inArray(equipmentDetails.id, reservedEquipmentSlots)),
                reservedByMe = ($.inArray(equipmentDetails.id, myReservedEquipmentSlots) !== -1);
            console.log(equipmentDetails);
        };

    initializeEquipment();
    // loadEquipmentDetails('eWuGn4lZix');

})(this, document, jQuery, Parse, api);
