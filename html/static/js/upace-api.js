if (!window.api) {
    window.api = {};
}

(function (window, document, $, Parse, api) {

    var
        facebookAppId = '513297188812943', // App ID from the app dashboard
        facebookChannelUrl = '//localhost.local/XXXXX/channel.html', // Channel file for x-domain comms
		facebookPluginUrl = '//connect.facebook.net/en_US/all.js',

    // Login used on login page (originally in functions.php)
        login = api.login = function (username, password) {
            var User = Parse.Object.extend('User');
            return Parse.User.logIn(username, password);
        },

        logout = api.logout = function () {
            return Parse.User.logOut();
        },
		
	// Facebook login pulled from login page
		initializeFacebookPlugin = api.initializeFacebookPlugin = function() {
			return $.getScript(facebookPluginUrl).then(initializeFacebookUtils);
		},
		
		initializeFacebookUtils = function() {
			return Parse.FacebookUtils.init({
				appId : facebookAppId, // App ID from the app dashboard
				channelUrl : facebookChannelUrl, // Channel file for x-domain comms
				status : false, // Check Facebook Login status
				xfbml : true, // Look for social plugins on the page
				logging : true
			});
		},
	
		// TODO: can we replace the next three methods with this?
		loginWithFacebook = api.loginWithFacebook = function() {
			return Parse.FacebookUtils.logIn('email');
		};
	
		loginWithFacebookOld = function() {
			var promise = new Parse.Promise.as();
			FB.login(function (response) {
				if (!response || response.status !== 'connected') {
					promise.reject('Facebook login failed');
					return;
				} 
				promise = promise.then(getUserDataFromFacebook);
			}, {
				scope : 'email'
			});
			return promise;
		},
		
		getUserDataFromFacebook = function() {
			var promise = new Parse.Promise.as();
			FB.api('/me', function (fbdata) {
				console.log(fbdata);
				promise = promise.then(function() {
					return loginWithFacebookData(fbdata.email, fbdata.id);
				});
			});
			return promise;
		},
		
		loginWithFacebookData = function (email, fbId) {
			var o = Parse.Object.extend('User');
			var q = new Parse.Query(o);
			q.equalTo('email', email);
			q.equalTo('fbId', fbId);
			return q.first().then(
				function(result) {
					console.log(result);
					if (result) {
						return Parse.FacebookUtils.logIn();
					}
				}
			);
		},

    // Registration used on login page (originally in functions.php)
        registerNewUser = api.registerNewUser = function (params) {
            var user = new Parse.User();
            user.set('lastname', params.lastname);
            user.set('firstname', params.firstname);
            user.set('email', params.email);
            user.set('phone', params.phone);
            user.set('sex', params.sex);
            user.set('username', params.username);
            user.set('password', params.password);
			user.set('universityGymId', params.universityGymId);
            user.set('memberType', params.memberType);
            user.set('gymFrequency', params.gymFrequency);
            user.set('userType', 'user');
			
			return getGymById(params.universityGymId).then(
				function(result) {
					user.set('universityId', result.get('universityId'));
					return user.signUp().then(
						function (user) {
							user.setACL(new Parse.ACL(user));
							user.save();
							// TODO: this can be parallel
							return $.ajax({
								url : '/include/ajax.php',
								type : 'POST',
								data : {
									method : 'send_mail_verification',
									firstName : params.firstName,
									Email : params.email,
									userId : user.id
								}
							});
						}
					);
				}
			);
        },

    // Registration found in site.js for Facebook users
        registerNewUserWithFacebook = api.registerNewUserWithFacebook = function (params) {
            var user = new Parse.User();
            user.set('lastname', params.lastname);
            user.set('firstname', params.firstname);
            user.set('email', params.email);
            user.set('phone', params.phone);
            user.set('sex', params.sex);
            user.set('username', params.username);
            user.set('password', params.password);
            user.set('universityId', params.universityId);
			user.set('universityGymId', params.gymId);
            user.set('memberType', params.memberType);
            user.set('gymFrequency', params.gymFrequency);
            user.set('userType', 'user');
            user.set('isActive', 1);
            user.set('fbId', params.fbId);

            // FINISH
            return user.signUp().then(
                function (user) {
					user.setACL(new Parse.ACL(user));
					user.save();
                    if (!Parse.FacebookUtils.isLinked(user)) {
                        Parse.FacebookUtils.link(user, null, {
                            success : function (user) {
                                onSuccess(user);
                            },
                            error : function (user, error) {
                                onError(user, error);
                            }
                        });
                    }

                    var r1 = Parse.Object('user_payment');
                    r1.set('user', user);
                    r1.set('userId', user.id);
                    r1.set('isPaid', false);
                    if (r1.save()) {
                        showSuccess('You have Successfully registered. ');
                        $('#loginForm')[0].reset();
                        document.getElementById('signup').style.pointerEvents = 'auto';
                        document.getElementById('signup').style.opacity = '1';

                        //var Login = Parse.Object.extend('User');
                        Parse.User.logIn(username, password, {
                            success : function (login) {
                                //alert(user.get('email'));
                                //if(user.get('isActive')==1)
                                //{
                                window.location = 'landing';
                                //}
                            }
                        });
                    }
                }
            );
        },

        resetPassword = api.resetPassword = function (email) {
            return Parse.User.requestPasswordReset(email);
        },

    // Found in functions.php -- don't know what this does yet
    // FINISH
        checkUrl = function (data) {
            var User = Parse.Object.extend('User');
            var q = new Parse.Query(User);
            q.equalTo('objectId', data);
            q.first().then(
                function (user) {
                    var isActive = user.get('isActive');
                    if (isActive == 1) {
                        window.location = '/index.php?broken=true';
                    } else {
                        var User = Parse.Object.extend('User');
                        var query = new Parse.Query(User);
                        query.equalTo('objectId', data);
                        query.first({
                            success : function (user) {

                                user.set('isActive', 1);

                                user.save(null, {
                                    success : function (user) {
                                        //alert('You are successfully registered.');
                                        console.log(user.get('username'));
                                        // alert(user.get('email'));
                                        window.location = '/index.php?login=true';

                                    },
                                    error : function (user, error) {
                                        console.log(error.message);
                                        alert('Error: ' + error.code + ' ' + error.message);
                                    }
                                });
                            }
                        });
                    }
                }
            );
        },

        getCurrentUser = api.getCurrentUser = function () {
            return Parse.User.current();
        },

        getProfileNotifications = api.getProfileNotifications = function () {
            var user = getCurrentUser();
            var o = Parse.Object.extend('notifications');
            var q = new Parse.Query(o);
            q.equalTo('user', user);
            return q.first();
        },

        getUniversities = api.getUniversities = function () {
            var o = Parse.Object.extend('university');
            var q = new Parse.Query(o);
            q.notEqualTo('is_deleted', true);
            q.equalTo('isActive', 1);
			q.limit(1000);
            return q.find();
        },

        getUniversityById = api.getUniversityById = function (universityId) {
            return getRowById(universityId, 'university');
        },
		
		getGyms = api.getGyms = function () {
            var o = Parse.Object.extend('university_gym');
            var q = new Parse.Query(o);
            q.equalTo('isActive', 1);
            q.equalTo('isDelete', 0);
            q.include('university');
			q.limit(1000);
            return q.find();
        },
		
		getGymById = api.getGymById = function (gymId) {
			return getRowById(gymId, 'university_gym', ['university']);
		},

        getGymsByUniversity = api.getGymsByUniversity = function (universityId) {
            var o = Parse.Object.extend('university_gym');
            var q = new Parse.Query(o);
            q.equalTo('universityId', universityId);
            q.equalTo('isActive', 1);
            q.equalTo('isDelete', 0);
            // q.descending('createdAt');
            q.include('university');
            return q.find();
        },
		
		getRoomsByUniversity = api.getRoomsByUniversity = function (universityId) {
		    var o = Parse.Object.extend('room');
            var q = new Parse.Query(o);
            q.equalTo('universityId', universityId);
            q.include('university');
            q.include('university_gym');
            return q.find();
		},

        getRoomsByGym = api.getRoomsByGym = function (gymId) {
            var o = Parse.Object.extend('room');
            var q = new Parse.Query(o);
            q.equalTo('universityGymId', gymId);
            q.include('university');
            q.include('university_gym');
            return q.find();
        },

        getClassesByUniversityAndDate = api.getClassesByUniversityAndDate = function (universityId, date) {
            var o = Parse.Object.extend('classes');
            var q = new Parse.Query(o);
            var dbDate = dbFormattedDate(date);
            q.equalTo('universityId', universityId);
            q.equalTo('date', dbDate);
			q.limit(1000);
            return q.find().then(function(results) {
                return getClassSlotsByClasses(results);
            });
        },
		
		getClassesByGymAndDate = api.getClassesByGymAndDate = function (gymId, date) {
			var o = Parse.Object.extend('classes');
            var q = new Parse.Query(o);
            var dbDate = dbFormattedDate(date);
            q.equalTo('gymId', gymId);
            q.equalTo('date', dbDate);
			q.limit(1000);
            return q.find().then(function(results) {
                return getClassSlotsByClasses(results);
            });
		},

        getClassSlotsByClasses = api.getClassSlotsByClasses = function (classes) {
            var o = Parse.Object.extend('class_slot');
            var q = new Parse.Query(o);
            q.containedIn('class', classes);
			q.limit(1000);
            q.include('gym');
            q.include('class');
            q.include('class.room');
            return q.find();
        },
		
		getClassSlotReservationCount = api.getClassSlotReservationCount = function (slotId) {
		    var o = Parse.Object.extend('class_reservation');
            var q = new Parse.Query(o);
            q.equalTo('slotId', slotId);
            q.equalTo('isActive', true);
            return q.count();
		},

        getClassReservationsByUniversityAndDate = api.getClassReservationsByUniversityAndDate = function (universityId, date) {
            var o = Parse.Object.extend('class_reservation');
            var q = new Parse.Query(o);
            var dbDate = dbFormattedDate(date);
            q.equalTo('universityId', universityId);
            q.equalTo('date', date);
            q.equalTo('isActive', 1);
			q.limit(1000);
            q.include('slot');
            q.include('gym');
            q.include('class');
            q.include('class.room');
            return q.find();
        },

        getClassReservations = api.getClassReservations = function (date) {
            var user = getCurrentUser();
            var o = Parse.Object.extend('class_reservation');
            var q = new Parse.Query(o);
            if (date) {
                q.equalTo('date', dbFormattedDate(date));
            }
            q.equalTo('user', user);
			q.limit(1000);
            q.include('slot');
            q.include('gym');
            q.include('class');
            q.include('class.room');
            return q.find();
        },

        getEquipmentByUniversity = api.getEquipmentByUniversity = function (universityId, dayIndex) {
            var o = Parse.Object.extend('slots');
            var q = new Parse.Query(o);
            q.equalTo('universityId', universityId);
			if (typeof dayIndex === 'number') {
				q.equalTo('dayIndex', dayIndex);
			}
			q.limit(1000);
            q.include('gymId');
            q.include('equipId');
            q.include('roomId');
            q.descending('equipId');
            return q.find();
        },
		
		getEquipmentByGym = api.getEquipmentByGym = function (gymId) {
            var o = Parse.Object.extend('slots');
            var q = new Parse.Query(o);
            q.equalTo('gymId', gymId);
			q.limit(1000);
            q.include('equipId');
            q.include('roomId');
            q.descending('equipId');
            return q.find();
        },

        getEquipmentReservationsByUniversityAndDate = api.getEquipmentReservationsByUniversityAndDate = function (universityId, date) {
            var o = Parse.Object.extend('equipment_occupancy');
            var q = new Parse.Query(o);
            q.equalTo('universityId', universityId);
            q.equalTo('reservationDate', date);
			q.limit(1000);
            q.include('slotId');
            q.include('slotId.roomId');
            q.include('gymId');
            q.include('equipmentId');
            return q.find();
        },

        getEquipmentReservations = api.getEquipmentReservations = function (date) {
            var user = getCurrentUser();
            var o = Parse.Object.extend('equipment_occupancy');
            var q = new Parse.Query(o);
            if (date) {
                q.equalTo('reservationDate', date);
            }
            q.equalTo('userId', user);
			q.limit(1000);
            q.include('slotId');
            q.include('slotId.roomId');
            q.include('gymId');
            q.include('slotId.room');
            q.include('equipmentId');
            return q.find();
        },

        getClassDetails = api.getClassDetails = function (slotId) {
            var o = Parse.Object.extend('class_slot');
            var q = new Parse.Query(o);
            q.equalTo('objectId', slotId);
            q.include('gym');
            q.include('class');
            q.include('class.room');
            q.include('instructor');
            return q.first();
        },

        getEquipmentDetails = api.getEquipmentDetails = function (slotId) {
            var o = Parse.Object.extend('slots');
            var q = new Parse.Query(o);
            q.equalTo('objectId', slotId);
            q.include('gymId');
            q.include('equipId');
            q.include('roomId');
            return q.first();
        },

        saveUserSettings = api.saveUserSettings = function (settings) {
            var user = getCurrentUser();
            user.set('firstname', settings.firstname);
            user.set('lastname', settings.lastname);
            user.set('email', settings.email);
            user.set('phone', settings.phone);
            user.set('sex', settings.sex);
            user.set('memberType', settings.memberType);
            user.set('gymFrequency', settings.gymFrequency);
            user.set('universityGymId', settings.universityGymId);
			return getGymById(settings.universityGymId).then(
				function(result) {
					user.set('universityId', result.get('universityId'));
					return user.save();
				}
			);
        },

        saveUserNotifications = api.saveUserNotifications = function (notifications) {
            var user = getCurrentUser();
            var o = Parse.Object.extend('notifications');
            var q = new Parse.Query(o);
            q.equalTo('user', user);
            return q.first().then(
                function (result) {
                    var o = result || Parse.Object('notifications'),
						acl = new Parse.ACL();
					acl.setReadAccess(user.id, true);
					acl.setWriteAccess(user.id, true);
					o.setACL(acl);
                    if (result) {
                        o.id = result.id;
                    }
                    o.set('user', user);
                    o.set('userId', user.id);
                    o.set('class_noti', notifications.class_noti);
                    o.set('daily_exercise', notifications.daily_exercise);
                    o.set('general_noti', notifications.general_noti);
                    o.set('via_email', notifications.via_email);
                    o.set('via_text', notifications.via_text);
                    return o.save();
                }
            );
        },

        saveUserPassword = api.saveUserPassword = function (password) {
            var user = getCurrentUser();
            user.set('password', password);
            return user.save();
        },

        saveClassReservation = api.saveClassReservation = function (classId, slotId) {
            var user = getCurrentUser(),
				promise = new Parse.Promise.as(),
				resUniversity,
                resGym,
                resClass,
				resCount,
				resSlot;

			promise = promise.then(
				function() {
					return getRowById(classId, 'classes');
				}
			);
			
            promise = promise.then(
                function (clazz) {
                    resClass = clazz;
                    return getRowById(user.get('universityGymId'), 'university_gym', ['university']);
                }
            );
			
			promise = promise.then(
                function (gym) {
                    resGym = gym;
                    resUniversity = resGym.get('university');
					return getClassSlotReservationCount(slotId);
				}	
			);
			
			promise = promise.then(
				function (reservationCount) {
					var totalSpots = parseInt(resClass.get('spots'));
					resCount = reservationCount;
					if (resCount >= totalSpots) {
						// TODO: figure out how to reject this properly.
						promise.reject('All class spots are reserved.');
						return;
					}
                    return getRowById(slotId, 'class_slot');
                }
            );
			
			promise = promise.then(
                function (slot) {
					resSlot = slot;
                    var o = Parse.Object('class_reservation'),
						acl = new Parse.ACL();
					acl.setPublicReadAccess(true);
					acl.setWriteAccess(user.id, true);
					o.setACL(acl);
                    o.set('university', resUniversity);
                    o.set('gym', resGym);
                    o.set('class', resClass);
                    o.set('date', resClass.get('date'));
                    o.set('slot', slot);
                    o.set('user', user);
                    o.set('start_time', slot.get('start_time'));
                    o.set('end_time', slot.get('end_time'));
                    o.set('universityId', resUniversity.id);
                    o.set('gymId', resGym.id);
                    o.set('userId', user.id);
                    o.set('slotId', slot.id);
                    o.set('classId', resClass.id);
                    o.set('isActive', true);
                    return o.save();
                }
            );
			
			promise = promise.then(
				function (reservation) {
					if (reservation) {
						resSlot.set('reserved_spots', resCount + 1);
						resSlot.save();
					}
					return reservation;
				}
			);
			
			return promise;
        },

        saveEquipmentReservation = api.saveEquipmentReservation = function (equipmentId, slotId, date) {
            var user = getCurrentUser(),
				promise = new Parse.Promise.as(),
				resUniversity,
                resGym,
                resEquipment,
				resSlot;

            promise = promise.then(
				function () {
					return getRowById(equipmentId, 'gym_equipment');
				}
			);
			
			promise = promise.then(
                function (equipment) {
                    resEquipment = equipment;
                    return getRowById(user.get('universityGymId'), 'university_gym', ['university']);
                }
            );
			
			promise = promise.then(
                function (gym) {
                    resGym = gym;
                    resUniversity = gym.get('university');
                    return getRowById(slotId, 'slots');
                }
            );
			
			promise = promise.then(
                function (slot) {
					resSlot = slot;
					if (resSlot.get('is_occupied')) {
						// TODO: figure out how to reject this properly.
						promise.reject('Equipment is already reserved.');
						return;
					}
                    var d = (date) ? new Date(date) : new Date(),
                        df = ('0' + (d.getMonth()+1)).slice(-2) + '/' + ('0' + d.getDate()).slice(-2) + '/' + d.getFullYear(),
                        o = Parse.Object('equipment_occupancy'),
						acl = new Parse.ACL();
					acl.setPublicReadAccess(true);
					acl.setWriteAccess(user.id, true);
					o.setACL(acl);
                    o.set('userId', user);
                    o.set('slot', slot.id);
                    o.set('slotId', slot);
                    o.set('equipment', resEquipment.id);
                    o.set('equipmentId', resEquipment);
                    o.set('gymId', resGym);
                    o.set('university', resUniversity);
                    o.set('universityId', resUniversity.id);
                    o.set('universityGymId', resGym.id);
                    o.set('reservationDate', df);
                    return o.save();
                }
            );
			
			promise = promise.then(
				function (reservation) {
					if (reservation) {
						resSlot.set('is_occupied', true);
						resSlot.set('occupancy', reservation);
						resSlot.set('occupancyId', reservation.id);
						resSlot.save();
					}
					return reservation;
				}
			);
			
			return promise;
        },

        saveNotifyOfEquipmentAvailability = api.saveNotifyOfEquipmentAvailability = function(eoId) {
            var user = getCurrentUser();
            return getRowById(eoId, 'equipment_occupancy').then(
                function (result) {
                    var o = Parse.Object('equipment_notification'),
						acl = new Parse.ACL();
					acl.setPublicReadAccess(false);
					acl.setWriteAccess(user.id, true);
					o.setACL(acl);
                    o.set('occupancy', result);
                    o.set('user', user);
                    o.set('occupancyId', result.id);
                    o.set('userId', user.id);
                    return o.save();
                }
            );
        },

        saveFeedback = api.saveFeedback = function (clazz, slot, params) {
            var user = getCurrentUser();
            var staff = slot.get('instructor');
            var o = Parse.Object('feedback'),
				acl = new Parse.ACL();
			acl.setPublicReadAccess(true);
			acl.setWriteAccess(user.id, true);
			o.setACL(acl);
            o.set('class', clazz);
            o.set('staff', staff);
            o.set('user', user);
            o.set('classId', clazz.id);
            o.set('staffId', staff.id);
            o.set('userId', user.id);
            o.set('rating', parseFloat(params.ratings));
            o.set('comment', params.feedback);
            o.set('gymId', user.get('universityGymId'));
            o.set('universityId', user.get('universityId'));
            o.set('start_time', slot.get('start_time'));
            o.set('end_time', slot.get('end_time'));
            o.set('slot', slot);
            // o.set('post_date', date);
            o.set('slotId', params.slotId);
            return o.save();
        },

        deleteRow = api.deleteRow = function (objId, objType) {
            var o = Parse.Object.extend(objType);
            var q = new Parse.Query(o);
            return q.get(objId).then(
                function (row) {
                    return row.destroy({});
                }
            );
        },

        deleteRows = api.deleteRows = function (objIds, objType) {
            var o = Parse.Object.extend(objType);
            var q = new Parse.Query(o);
            q.containedIn('objectId', objIds);
            return q.find().then(
                function(rows) {
					for (var i = 0; i < rows.length; i++) {
						// Can't return a promise with this one, so we probably won't use it.
						row[i].destroy({});
					}
                }
            );
        },

        deleteClassReservations = api.deleteClassReservations = function (resId) {
            if ($.isArray(resId)) {
                return deleteRows(resId, 'class_reservation');
            } else {
                return deleteRow(resId, 'class_reservation');
            }
        },

        deleteEquipmentReservations = api.deleteEquipmentReservations = function (resId) {
            if ($.isArray(resId)) {
                return deleteRows(resId, 'equipment_occupancy');
            } else {
                return deleteRow(resId, 'equipment_occupancy');
            }
        },

        sendNotificationEmail = api.sendNotificationEmail = function (email, subject, message) {
            return $.ajax({
                type : 'post',
                dataType : 'json',
                url : '/include/send_mail.php',
                data : {
                    receiver : email,
                    subject : subject,
                    content : message
                },
                async : false
            });
        },

        getRowById = function(id, objType, includes) {
            var o = Parse.Object.extend(objType);
            var q = new Parse.Query(o);
            q.equalTo('objectId', id);
            if (includes) {
                q.include(includes.toString());
            }
            return q.first();
        },

        dbFormattedDate = function (date) {
            var s = date.split('/');
            return s[1] + '.' + s[0] + '.' + s[2];
        };

})(this, document, jQuery, Parse, api);
