/* Custom js */

$(document).ready(function () {
    // wow init
    new WOW().init();

    // collapse the header main menu if <a> clicked
    $('a[ui-sref]').click(function () {
        $('#header-mainmenu').collapse('hide');
    });
});