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

        $('#followers').click(function () {
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
        });
    });
});

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