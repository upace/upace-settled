(function (window, document, $, Parse, api) {

    var currentUser = api.getCurrentUser(),
        currentUniversityId = currentUser.get('universityId'),
        currentGymId = currentUser.get('universityGymId'),
        currentUniversity,
        currentAllGyms,
        currentGym,
        currentRooms,
        currentOccupancy,

        selectors = {
            'roomOccupancyItemTemplate' : '#room-occupancy-item-template',
            'roomOccupancyItem' : '.land-room-occupied-spots-wrap',
            'deckItem' : '.land-ondeck-item .ondecksequence',
            'reserveModal' : '#reserve-modal'
        },

        templates = {
            'roomOccupancyItem' : twig({
                data: $(selectors.roomOccupancyItemTemplate).html()
            })
        },

        // cache selectors wherever possible
        $roomCarousel = $('.owl-current'),
        $gymsCarousel = $('.owl-other-gyms'),
        $deckCarousel = $('.owl-ondeck'),

        initializeDashboard = function() {

            $(document).on('click', selectors.deckItem, handleDeckClick);

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
                    renderOtherGyms();
                });
        },

        renderCurrentGym = function() {
            var percentage = Math.floor(currentOccupancy / currentGym.get('capacity') * 100);
            $('#land-data-average').text(percentage);
            $('#land-current-member').text(currentOccupancy);
            $('#land-total-member').text(currentGym.get('capacity'));
            $('#land-current-gym').text(currentGym.get('name'));
            $('#land-data-color').addClass('land-data-' + getOccupancyColor(percentage)).show();
        },

        renderRooms = function() {
            var roomHtml = '';
            for (var i = 0; i < currentRooms.length; i++) {
                var occupiedSpots = parseInt(currentRooms[i].get('male')) + parseInt(currentRooms[i].get('female')),
                    percentage = Math.floor(occupiedSpots / parseInt(currentRooms[i].get('reservedOccupancy')) * 100),
                    data = {
                        'roomName' : currentRooms[i].get('name'),
                        'perc' : percentage,
                        'percColor' : getOccupancyColor(percentage),
                        'occupiedSpots' : occupiedSpots,
                        'roomId' : currentRooms[i].id
                    };
                roomHtml += templates.roomOccupancyItem.render(data);
            }
            $roomCarousel.html(roomHtml);
            activateRoomCarousel();
        },

        renderDeck = function() {
            activateDeckCarousel();
        },

        renderOtherGyms = function() {
            console.log(currentAllGyms);
            activateGymsCarousel();
        },

        handleDeckClick = function(e) {
            $(selectors.reserveModal).modal('show');
        },

        activateRoomCarousel = function() {
            $roomCarousel.owlCarousel({
                stagePadding: 50,
                loop: true,
                margin: 0,
                nav: false,
                responsive: {
                    0: {
                        items: 2
                    },
                    768: {
                        items: 3
                    },
                    915: {
                        items: 4
                    },
                    1600: {
                        items: 5
                    }
                }
            });
        },

        activateGymsCarousel = function() {
            $gymsCarousel.owlCarousel({
                stagePadding: 20,
                loop: true,
                margin: 0,
                nav: false,
                responsive: {
                    0: {
                        items: 4
                    },
                    768: {
                        items: 4
                    },
                    915: {
                        items: 5
                    },
                    1200: {
                        items: 6
                    },
                    1600: {
                        items: 7
                    }
                }
            });
        },

        activateDeckCarousel = function() {
            $deckCarousel.owlCarousel({
                stagePadding: 0,
                loop: true,
                margin: 0,
                nav: false,
                center: false,
                responsive: {
                    0: {
                        items: 4
                    },
                    768: {
                        items: 4
                    },
                    915: {
                        items: 5
                    },
                    1200: {
                        items: 6
                    },
                    1600: {
                        items: 7
                    }
                }
            });
        },

        getOccupancyColor = function(percentage) {
            var color = 'g';
            if (percentage > 50) color = 'y';
            if (percentage > 90) color = 'r';
            return color;
        };

    initializeDashboard();

})(this, document, jQuery, Parse, api);
