(function (window, document, $, Parse, api) {

    var currentUser = api.getCurrentUser(),
        currentUniversityId = currentUser.get('universityId'),
        currentGymId = currentUser.get('universityGymId'),
        currentUniversity,
        currentAllGyms,
		currentAllRooms,
        currentGym,
        currentOccupancy,
        reservedClasses,
        reservedEquipment,
        upcomingReservations,

        selectors = {
            'roomOccupancyItemTemplate' : '#room-occupancy-item-template',
            'roomOccupancyItem' : '.land-room-occupied-spots-wrap',
            'deckItem' : '.land-ondeck-item .ondecksequence',
            'reserveModal' : '#reserve-modal',
            'otherGymItemTemplate' : '#other-gym-item-template'
        },

        templates = {
            'roomOccupancyItem' : twig({
                data: $(selectors.roomOccupancyItemTemplate).html()
            }),
            'otherGymItem' : twig({
                data: $(selectors.otherGymItemTemplate).html()
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
                    api.getRoomsByUniversity(currentUniversityId)
                ).then(function(a, b, c) {
                    currentUniversity = a;
                    currentAllGyms = b;
                    currentAllRooms = c;
                    for (var i = 0; i < currentAllGyms.length; i++) {
                        if (currentAllGyms[i].id === currentGymId) {
                            currentGym = currentAllGyms[i];
                            break;
                        }
                    }
                    currentOccupancy = 0;
                    for (var i = 0; i < currentAllRooms.length; i++) {
						if (currentAllRooms[i].get('universityGymId') === currentGymId) {
							currentOccupancy += parseInt(currentAllRooms[i].get('male'));
							currentOccupancy += parseInt(currentAllRooms[i].get('female'));
						}
                    }
                    renderCurrentGym();
                    renderRooms();
                    initDeck();
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
            for (var i = 0; i < currentAllRooms.length; i++) {
				if (currentAllRooms[i].get('universityGymId') === currentGymId) {
					var occupiedSpots = parseInt(currentAllRooms[i].get('male')) + parseInt(currentAllRooms[i].get('female')),
						percentage = Math.floor(occupiedSpots / parseInt(currentAllRooms[i].get('totalOccupancy')) * 100),
						data = {
							'roomName' : currentAllRooms[i].get('name'),
							'perc' : percentage,
							'percColor' : getOccupancyColor(percentage),
							'occupiedSpots' : occupiedSpots,
							'roomId' : currentAllRooms[i].id
						};
					roomHtml += templates.roomOccupancyItem.render(data);
				}
            }
            $roomCarousel.html(roomHtml);
            activateRoomCarousel();
        },

        initDeck = function() {
            Parse.Promise.when(
                    api.getClassReservationsByUser(currentUser),
                    api.getEquipmentReservationsByUser(currentUser)
                ).then(function(a, b) {
                    reservedClasses = a;
                    reservedEquipment = b;
					upcomingReservations = reservedClasses.concat(reservedEquipment);
					upcomingReservations = filterParseResultsByDateAndStartTime(upcomingReservations);
					upcomingReservations.sort(sortParseResultsByStartTime);
                    renderDeck();
                });
        },

        renderDeck = function() {
			console.log(upcomingReservations);
            activateDeckCarousel();
        },

        renderOtherGyms = function() {
			var occupancyByGym = {},
				otherGymHtml = '';
			for (var i = 0; i < currentAllRooms.length; i++) {
				var gymId = currentAllRooms[i].get('universityGymId');
				// if (gymId !== currentGymId) {
					if (!occupancyByGym[gymId]) {
						occupancyByGym[gymId] = 0;
					}
					occupancyByGym[gymId] += parseInt(currentAllRooms[i].get('male')) + parseInt(currentAllRooms[i].get('female'))
				// }
			}
			for (var j = 0; j < currentAllGyms.length; j++) {
				// if (currentAllGyms[j].id !== currentGymId) {
					var occupiedSpots = occupancyByGym[currentAllGyms[j].id],
						percentage = Math.floor(occupiedSpots / parseInt(currentAllGyms[j].get('capacity')) * 100),
						data = {
							'gymName' : currentAllGyms[j].get('name'),
							'perc' : percentage,
							'percColor' : getOccupancyColor(percentage),
							'gymId' : currentAllGyms[j].id
						};
                    otherGymHtml += templates.otherGymItem.render(data);
				// }
			}
			$gymsCarousel.html(otherGymHtml);
            // activateGymsCarousel();
        },

        handleDeckClick = function() {
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
                stagePadding: 15,
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
