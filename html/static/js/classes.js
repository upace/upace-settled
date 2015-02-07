(function (window, document, $, Parse, api, listings) {

    var initClasses = function() {
            var parseDate = formatDateForParse(new Date());
            listings.fetchClasses(parseDate);
        };

        initClasses();

})(this, document, jQuery, Parse, api, listings);
