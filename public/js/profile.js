import { initializeMusic, loadingAnimation, createArtRows, popUpAnimForButtons, initializeContainerHover, initializeContainerClick, databaseData, updateDatabaseData, initializeAddRemoveLogic, initializeShareLogic, sendChosenArtwork } from './home.js';

var followed = []
var followedPerRow = 3;
var opened = false;
var toTranslate = null;
var currentUserData = null;
var buttonClicked = true;
var defaultState = true;

$(document).ready(function () {
    $('body').hide();
    $(window).on('load', function () {
        $('body').show();

        console.log('Running profile.js');

        //Registering GSAP's plugins
        gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, ScrollToPlugin);

        // Display the page
        gsap.timeline().set([$('header'), $('main'), $('footer')], { css: { 'display': 'block' } })
            .to([$('header'), $('main'), $('footer')], 1, {
                autoAlpha: 1,
                ease: 'power1.intOut',
                delay: .7
            });

        // get the vw & vh used in css, in js.
        const vw = (coef) => window.innerWidth * (coef / 100);
        const vh = (coef) => window.innerHeight * (coef / 100);

        //simulateFollowerPage();
        // initializeMusic();
        $('#followers').click(function () {
            console.log("Toggle triggered!")
            gsap.timeline().to($('#toggleElement'), .5, {
                margin: '0% 0% 0% 50%',
                ease: 'power1.intOut'
            })
                .to($('#account'), .5, {
                    color: '#cacaca',
                    ease: 'power1.intOut'
                }, '-=.3')
                .to($('#followers'), .5, {
                    color: '#101010',
                    ease: 'power1.intOut'
                }, '-=.5')
        });

        $('#account').click(function () {
            console.log("Toggle triggered!")
            gsap.timeline().to($('#toggleElement'), .5, {
                margin: '0% 0% 0% 0%',
                ease: 'power1.intOut'
            })
                .to($('#followers'), .5, {
                    color: '#cacaca',
                    ease: 'power1.intOut'
                }, '-=.3')
                .to($('#account'), .5, {
                    color: '#101010',
                    ease: 'power1.intOut'
                }, '-=.5')

            // if (buttonClicked == true) {
            //     hideFollowed();
            //     createProfile(currentUserData[0], currentUserData[1], currentUserData[2]);
            //     buttonClicked = false;
            //     // createArtRows(3, $('main'), true);
            //     // initializeContainerClick(true);
            //     getCurrentUsersArtworks();
            // }

        });

        // $.ajax({
        //     url: '/profileMain',
        //     success: function (result) {
        //         currentUserData = result;
        //         console.log("Current user data from profile");
        //         console.log(currentUserData);

        //         if (defaultState == true) {
        //             defaultState = false;
        //             buttonClicked = false;
        //             // template: createProfile (name, avatar, description)
        //             createProfile(result[0], result[1], result[2]);
        //             buttonClicked = false;
        //             getCurrentUsersArtworks();
        //         }
        //     }
        // });

    });
});


// A function that dynamically creates HTML code for the followed people and appends it to the appropriate div
function displayFollowed() {
    $('#profileFollowed').append('<div class="followedWrapper"> </div>')
    let followedCount = 0;
    while (followedCount < followed.length) {
        let followedArticle;
        $('.followedWrapper').append('<div class="articleRow"></div>');
        try {
            for (let i = 0; i < followedPerRow; i++) {
                let element = followed[followedCount];
                followedArticle = `
                    <article class = "followed" id="f-${element.id}">
                        <div class="followedAvatar">
                            <img src=${element.profileAvatar}>
                            <div class="followedName">
                                <p>${element.profileName}</p>
                            </div>
                        </div>
                    </article>
                `;
                followedCount++;
                $('.articleRow').last().append(followedArticle);
            }
        } catch {
            break;
        }
    }
}

function loadMoreArtwork() {
    $('.openedDashboard').scroll(() => {
        let pane = $('.openedDashboard');
        let totalPaneHeight = $(pane).prop('scrollHeight');
        let paneHeight = $(pane).height();
        console.log("You're srolling!");
        console.log("Window height:" + window.innerHeight);
        console.log("scrollTop: " + $(pane).scrollTop());
        console.log("pane height: " + paneHeight);
        console.log("pane scroll height: " + totalPaneHeight);
        if ($(pane).scrollTop() + $(pane).height() >= totalPaneHeight - 1 * paneHeight) {
            console.log("Loading more!!!");
            createArtRows(3, $('.openedDashboard'), true);
            initializeContainerHover(true);
            initializeContainerClick(true);
        }
    });
}

function hideFollowed() {
    $('.followedWrapper').remove();
}

function getCurrentUsersArtworks() {
    console.log("getCurrentUsersArtwork()");
    $.post('/pullDb', { currentUser: "yes", user: "user" }, function (result) {
        console.log("The result from the server is:");
        console.log(result);
        if (result == "empty") {
            $('main').append(`<div id="profileDashboardMessage"><h3> This user's dashboard is currently empty. </h3></div>`);
        } else if (result == "noUser") {
            console.log("Could not find the user!!");
        }
        else {
            updateDatabaseData(result);
            createArtRows(5, $('main'), true);
            initializeContainerHover(true);
            initializeContainerClick(true);
        }
    });
    return false;
}

function getFollowedArtworks(numberOfRows, followedIndex) {
    console.log("Called getFollowedArtworks!");
    let numberOfArtworks = numberOfRows * 7;
    $.post('/pullDb', { currentUser: "no", user: followedIndex }, function (result) {
        if (result == "empty") {
            $('main').append(`<div id="profileDashboardMessage"><h3> This user's dashboard is currently empty. </h3></div>`);
        } else if (result == "noUser") {
            console.log("Could not find the user!!");
        } else {
            updateDatabaseData(result);
            createArtRows(numberOfRows, $('.openedDashboard'), true);
            initializeContainerHover(true);
            initializeContainerClick(true);
        }
    });
    return false;
}

function createProfile(name, picture, info) {
    $('#userName').text(name);
    $('#pictureContainer').html(`<img src="${picture}" />`);
    $('#userDescription').text(`${info}`);
}

function removeProfile() {
    $('.layoutSettings').remove() + $("#profilePicNameLike").remove() + $("#profileInfo").remove();
    $('#profileDashboardMessage').remove();
}

// Simulate a follower's page by adding the follow button and its logic
function simulateFollowerPage(followed) {
    let followButton = $('<div id="followContainer"></div>');
    let followText = $('<h2>Follow</h2>');
    let followedText = $('<h2>Followed</h2>')
    $('#accountContainer').append(followButton);
    let followTimeline = gsap.timeline();

    // Initial setup
    if (followed) {
        $(followButton).css('background-color', '#cea65bb3');
        $(followButton).append(followedText);
        $(followedText).css('opacity', '1');
    } else {
        $(followButton).css('background-color', '#cb3e3784');
        $(followButton).append(followText);
        $(followText).css('opacity', '1');
    }

    $('#followContainer').click(function () {
        if ($('#followContainer h2').text() == 'Follow') {
            followTimeline.to($('#followContainer'), .3, {
                backgroundColor: '#cea65bb3',
                ease: 'power1.inOut'
            })
                .to($('#followContainer h2'), .3, {
                    autoAlpha: 0,
                    ease: 'power1.inOut'
                })
            $('#followContainer h2').remove();
            $(followButton).append(followedText);
            $('#followContainer h2').css({ 'color': '#cacaca', 'opacity': 'none' });
            followTimeline.to($('#followContainer h2'), .3, {
                autoAlpha: 1,
                ease: 'power1.inOut'
            }, '-=.3')

            // TODO Store in database;
        } else {
            followTimeline.to($('#followContainer'), .3, {
                backgroundColor: '#cb3e3784',
                ease: 'power1.inOut'
            })
                .to($('#followContainer h2'), .3, {
                    autoAlpha: 0,
                    ease: 'power1.inOut'
                })
            $('#followContainer h2').remove();
            $(followButton).append(followText);
            $('#followContainer h2').css({ 'color': '#2a2a2a', 'opacity': 'none' });
            followTimeline.to($('#followContainer h2'), .3, {
                autoAlpha: 1,
                ease: 'power1.inOut'
            }, '-=.3')

            // TODO Store in database;
        }
    });


}