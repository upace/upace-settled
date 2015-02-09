(function (window, document, $, Parse, api) {

    var currentUser = api.getCurrentUser(),
        currentNotifications,

        selectors = {
            'universityItemTemplate': '#university-item-template',
            'gymItemTemplate': '#gym-item-template',
            'universityItems': '#university-items',
            'statusProfile': '#settings-modal-status-profile',
            'statusPassword': '#settings-modal-status-password',
            'statusNotifications': '#settings-modal-status-notifications'
        },

        templates = {
            'universityItem': twig({
                data: $(selectors.universityItemTemplate).html()
            }),
            'gymItem': twig({
                data: $(selectors.gymItemTemplate).html()
            })
        },

        $statusProfile = $(selectors.statusProfile),
        $statusPassword = $(selectors.statusPassword),
        $statusNotifications = $(selectors.statusNotifications),

        initSettings = function() {
            var html = '',
                university;
            Parse.Promise.when(
                api.getUniversities(),
                api.getGyms(),
                api.getProfileNotificationsByUser(currentUser)
            ).then(function(a, b, c) {
                for(var i = 0; i < a.length; i++) {
                    university = {
                        'name': a[i].get('name'),
                        'id': a[i].id,
                        'counter': i,
                        'gyms' : ''
                    };
                    for(var ii = 0; ii < b.length; ii++) {
                        if(a[i].id == b[ii].get('universityId')) {
                            university['gyms'] += templates.gymItem.render({
                                'id': b[ii].id,
                                'name': b[ii].get('name')
                            });
                        }
                    }
                    html += templates.universityItem.render(university);
                }
                $(selectors.universityItems).html(html);

                currentNotifications = c;
                renderProfile();
                if (currentNotifications) renderNotifications();
            });
        },

        renderProfile = function() {
            var $profileForm = $('#profilechange-form'),
                profile = currentUser.attributes;

            for (var k in profile) {
                if (profile.hasOwnProperty(k)) {
                    var $input = $profileForm.find('input[name="' + k + '"]');
                    if ($input.is(':radio')) {
                        $input.filter('[value="' + profile[k] + '"]').prop('checked', profile[k]).trigger('change');
                    } else {
                        $input.val(profile[k]);
                    }
                }
            }
            $("[class='settings-notifications']").bootstrapSwitch();
        },

        renderNotifications = function() {
            var $notificationsForm = $('#notificationchange-form'),
                notifications = currentNotifications.attributes;

            for (var k in notifications) {
                if (notifications.hasOwnProperty(k)) {
                    var $input = $notificationsForm.find('input[name=' + k + ']');
                    $input.prop('checked', notifications[k]).trigger('change');
                }
            }
        },

        statusMessage = function(target, message, type) {
            // target - status container (jquery object)
            // type - warning, danger, success, info
            target.html('');
            var $html = $('<div style="margin-top: 1em;" class="alert alert-' + type + '" role="alert"><strong>' + message + '</strong></div>');
            $html.appendTo(target);
            window.setTimeout(function() {
                $html.fadeTo(500, 0).slideUp(500, function(){
                    $(this).remove();
                });
            }, 3000);
        };

    $('#profilechange-form').on('submit', function(evt) {
        evt.preventDefault();

        var f = flattenFormArray($(this).serializeArray());

        api.saveUserSettings(null, f).then(
            function(user) {
                statusMessage($statusProfile, 'settings saved!', 'success');
            },
            function() {
                statusMessage($statusProfile, 'unable to save settings.', 'danger');
            }
        );
    });

    $('#passwordchange-form').on('submit', function(evt) {
        evt.preventDefault();

        var f = flattenFormArray($(this).serializeArray());

        if (f.password !== f.retypepassword) {
            statusMessage($statusPassword, 'passwords do not match.', 'danger');
            return;
        }

        // The only way to verify an old password with
        // Parse is to log in again in the background.
        api.login(api.getCurrentUser().getUsername(), f.oldpassword).then(
            function(user) {
                return api.saveUserPassword(user, f.password).then(
                    function(user) {
                        statusMessage($statusPassword, 'password saved.', 'success');
                    }
                );
            },
            function() {
                statusMessage($statusPassword, 'change password failed.', 'danger');
            }
        );
    });

    $('#notificationchange-form').on('submit', function(evt) {
        evt.preventDefault();

        var f = flattenFormArray($(this).serializeArray()),
            notifications = {
                'class_noti' : false,
                'daily_exercise' : false,
                'general_noti' : false,
                'via_email' : false,
                'via_text' : false
            };

        for (var k in f) {
            if (f.hasOwnProperty(k) && f[k] === 'on') {
                notifications[k] = true;
            }
        }

        api.saveUserNotifications(null, notifications).then(
            function(user) {
                statusMessage($statusNotifications, 'notifications saved.', 'success');
            },
            function() {
                statusMessage($statusNotifications, 'unable to save notifications.', 'danger');
            }
        );
    });

    initSettings();

})(this, document, jQuery, Parse, api);
