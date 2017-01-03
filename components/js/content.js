const contactsNumOnOnePage = 15;

function sendMessageToBackground (obj) {
    chrome.runtime.sendMessage(obj);
}

function getNumPages(contactsNumber) {
    return contactsNumber > contactsNumOnOnePage ? Math.round(contactsNumber/contactsNumOnOnePage) : 0;
}

function addContacts(height, countOfPagesScrolled) {
    setTimeout(function () {
        if (countOfPagesScrolled > 0 && height != document.body.clientHeight) {
            scrollDown(document.body.clientHeight, --countOfPagesScrolled);
        } else {
            sendRequest();
        }
    }, 1500);
}

function scrollDown(height, countOfPagesScrolled){
    scroll(0, document.body.clientHeight);
    addContacts(height, countOfPagesScrolled);
}

function sendRequest(){
    var contactsNum = 1;
    var addedContacts = [];

    eachContactsList(function() {
        jQuery(this).click();

        addedContacts[contactsNum] = {
            initials: jQuery(this).parents('.card-wrapper').find('.picture img').attr('alt'),
            title: jQuery(this).parents('.card-wrapper').find('.headline > span').attr('title'),
            img: jQuery(this).parents('.card-wrapper').find('.picture img').attr('src'),
            link: jQuery(this).parents('.card-wrapper').find('.picture a').attr('href')
        };

        contactsNum++;
    });

    sendMessageToBackground({
        action: 'added_contacts',
        message: {
            totalAdded: contactsNum,
            addedContacts: addedContacts
        }
    });
}

function onRequest(request, sender, sendResponse) {

    if (request.action == 'add_contacts'){
        if ($(window).scrollTop() == $(document).height() - $(window).height()) {
            scroll(0, 0);
        }

        if (request.filters !== null) {
            scrollDownFilters(
                document.body.clientHeight,
                request.filters,
                request.contactsNumber,
                0
            );
        } else {
            scrollDown(document.body.clientHeight, getNumPages(request.contactsNumber));
        }
    }

}

function eachContactsList(callback) {
    jQuery.each( jQuery('.card-wrapper .bt-request-buffed'), callback);
}

function getInvitedNumber (filters) {
    var numberFoundContacts = 0;

    for (var key in filters) {
        var filter = filters[key];

        eachContactsList(function() {
            if (isSearchedInString(jQuery(this).parents('.card-wrapper').find('.headline > span').attr('title'), filter)) {
                numberFoundContacts++;
            } else {
                jQuery(this).parents('.pymk-card').remove();
            }
        });
    }

    return numberFoundContacts;
}

function isSearchedInString (str, search) {
    str = str.toLowerCase();
    search = search.toLowerCase();

    return str.indexOf(search) + 1;
}

function addContactsFilters(height, filters, needInvites, invited) {
    invited = getInvitedNumber(filters);

    setTimeout(function () {
        //if (invited < needInvites && height != document.body.clientHeight) {
        if (invited < needInvites) {
            scrollDownFilters(document.body.clientHeight, filters, needInvites, invited);
        } else {
            sendRequest();
        }
    }, 1500);
}

function scrollDownFilters(height, filters, needInvites, invited){
    scroll(0, document.body.clientHeight);
    addContactsFilters(height, filters, needInvites, invited);
}

chrome.runtime.onMessage.addListener(onRequest);