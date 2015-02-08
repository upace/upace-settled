(function (window, document, $, Parse, api) {

    var
        selectors = {
            'universityItemTemplate': '#university-item-template',
            'gymItemTemplate': '#gym-item-template',
            'universityItems': '#university-items'
        },

        templates = {
            'universityItem': twig({
                data: $(selectors.universityItemTemplate).html()
            }),
            'gymItem': twig({
                data: $(selectors.gymItemTemplate).html()
            })
        },

        initRegistration = function() {
            var html = '',
                university;
            Parse.Promise.when(
                api.getUniversities(),
                api.getGyms()
            ).then(function(a, b) {
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
            });
        }

	// Initialize FB login
	api.initializeFacebookPlugin().then(
		function() {
			// TODO: add click event to Facebook button that fires off api.loginWithFacebook()
		},
		function() {
			console.error('failed to load Facebook plugin -- handle this in UI');
		}
	);
	
    $('#login-form').on('submit', function(evt) {
        evt.preventDefault();

        var f = flattenFormArray($(this).serializeArray());

        api.login(f.username, f.password).then(
            function(user) {
                console.log('user logged in');
                window.location = '/';
            },
            function() {
                console.error('login failed -- handle this in UI');
            }
        );
    });

    $('#registration-form').on('submit', function(evt) {
        evt.preventDefault();

        var f = flattenFormArray($(this).serializeArray());
        // console.log(f);

        api.registerNewUser(f).then(
            function(user) {
                console.log('user registered');
                window.location = '/'; // TODO: change this to root
            },
            function() {
                console.error('registration failed -- handle this in UI');
            }
        );
    });

    initRegistration();

})(this, document, jQuery, Parse, api);
