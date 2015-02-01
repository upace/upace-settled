(function (window, document, $, Parse, api) {

    var currentUser = api.getCurrentUser(),
        currentUniversityId = currentUser.get('universityId'),
        currentGymId = currentUser.get('universityGymId'),
        currentUniversity,
        currentAllGyms,
        currentGym,
        currentRooms,
        currentOccupancy,

        initializeDashboard = function() {
            Parse.Promise.when(
                    api.getUniversityById(currentUniversityId),
                    api.getGymsByUniversity(currentUniversityId),
                    api.getRoomsByGym(currentGymId)
                ).then(function(a, b, c) {
                    currentUniversity = a;
                    currentAllGyms = b;
                    currentRooms = c;
                    for (var i = 0; i < currentAllGyms.length; i++) {
                        if (currentAllGyms[i].id === currentGymId) {
                            currentGym = currentAllGyms[i];
                            break;
                        }
                    }
                    currentOccupancy = 0;
                    for (var i = 0; i < currentRooms.length; i++) {
                        currentOccupancy += parseInt(currentRooms[i].get('male'));
                        currentOccupancy += parseInt(currentRooms[i].get('female'));
                    }

                    renderCurrentGym();
                    renderRooms();
                    renderDeck();
                });
        },

        renderCurrentGym = function() {
            var percentage = Math.floor(currentOccupancy / currentGym.get('capacity') * 100),
                color = 'g';
            if (percentage > 50) color = 'y';
            if (percentage > 90) color = 'r';
            // TODO: use templating system instead
            var gymHtml = '<center><span class="land-data-average" id="land-data-average">'
            gymHtml += percentage;
            gymHtml += '</span><span class="land-data-average" style="font-weight:100">%</span></center></br><center class="land-data-members"><span id="land-current-member">';
            gymHtml += currentOccupancy;
            gymHtml += '</span>/<span id="land-total-member">';
            gymHtml += currentGym.get('capacity');
            gymHtml += '</span> <span>MEMBERS</span></center></br><center class="land-data-occupancy"><span>TOTAL OCCUPANCY</span></center></br><center class="land-data-gym"><span id="land-current-gym">';
            gymHtml += currentGym.get('name');
            gymHtml += '</span></center></br>';
            $('#land-data-color')
                .html(gymHtml)
                .addClass('land-data-' + color)
            ;
        },

        renderRooms = function() {
            // TODO: use templating system instead
            var roomHtml = '';
            for (var i = 0; i < currentRooms.length; i++) {
                roomHtml += '<div><div class="land-data-placeholder"><center><span id="land-data-figure" class="land-data-figure">';
                roomHtml += parseInt(currentRooms[i].get('male')) + parseInt(currentRooms[i].get('female'));
                roomHtml += '</span></center></div><center><span id="land-gymname" class="gymname">';
                roomHtml += currentRooms[i].get('name');
                roomHtml += '</span></center></div>';
            }
            $('.owl-current').html(roomHtml);
            activateRoomCarousel();
        },

        renderDeck = function() {
            activateDeckCarousel();
        },

        activateRoomCarousel = function() {
            $('.owl-current').owlCarousel({
                stagePadding: 50,
                loop:true,
                margin:0,
                nav:false,
                responsive:{
                    0:{
                        items:2
                    },

                    420:{
                        items:3
                    },

                    600:{
                        items:3
                    },
                    1000:{
                        items: 3
                    }
                }
            });
        },

        activateDeckCarousel = function() {
            $('.owl-ondeck').owlCarousel({
                stagePadding: 50,
                loop:true,
                margin:0,
                nav:false,
                responsive:{
                    0:{
                        items:3
                    },

                    420:{
                        items:3
                    },

                    600:{
                        items:3
                    },
                    1000:{
                        items: 3
                    }
                }
            });
        };

    initializeDashboard();

})(this, document, jQuery, Parse, api);
