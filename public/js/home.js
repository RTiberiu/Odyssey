// Export functions that will be used by other JS files.
export { initializeMusic, loadingAnimation, createArtRows, popUpAnimForButtons, initializeContainerHover, initializeContainerClick, databaseData, updateDatabaseData, initializeAddRemoveLogic, initializeShareLogic, sendChosenArtwork };
// get the vw & vh used in css, in js
const vw = (coef) => window.innerWidth * (coef / 100);
const vh = (coef) => window.innerHeight * (coef / 100);

// Populate the artwork array with Objects from the MET API
let artworkObjects = [];
let artworksID = [];
let poems = [];
let runHomeJS = true;
let processMetRequest = false;
let processPoetryRequest = false;
let metCounter = 0;
let poetryCounter = 0;
let databaseData = {};
// Animate if hover
let hoverAnim = gsap.timeline();
let expansionAnim = gsap.timeline();
let leaveArtAnim = gsap.timeline();

// Control animations
let artIsClicked = false;
let restoreArt = false;


$(document).ready(function () {
    $('body').hide();
    $(window).on('load', function () {
        $('body').show();

        // Repopulate array with MET Objects (artworks)
        async function getMetObjects(amount) {
            let output = await makeMultipleMetRequests(amount);
            return new Promise((resolve, reject) => {
                resolve(output);
            });
        }

        // Wait for array to be populated and initialize the art rows
        async function initializeRows() {
            await getRandomPoems(60);
            await getIdsFromDepartments();
            await getMetObjects(30);

            // Remove the loading animation before adding the artworks
            await removeLoading();
            createArtRows(3, $('main'), false);
            resumeSyncFlow();
            // Reveal icon to add more rows
            $('#feather').css({
                'opacity': '1',
                'visibility': 'visible'
            });
        }

        // Initialize the rows only on the home page.
        // (This prevents the script from running when getting imported by another file)
        let currentHtmlLocation = document.location.href;
        let websiteURL = 'https://odyssey-art-and-poems.netlify.app/';
        if (currentHtmlLocation == websiteURL && runHomeJS) {
            initializeRows();
            loadingAnimation();
        }

        //Registering GSAP's plugins
        gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, ScrollToPlugin);

        // Run preloader or reveal home page (depending on session)
        checkSessionAndTakeAction();

        // Initialize the music and searching functionality
        initializeMusic();
        initializeSearch();

        $(window).resize(function () {
            let width = $(window).width();
            // Layouts resize
            resizeArtworks(width);
        });

        function resumeSyncFlow() {
            // Add container hover
            initializeContainerHover(false);

            // Animate if clicking
            initializeContainerClick(false);

            // Footer logic
            $('#feather, #paintbrush').hover(function () {
                gsap.timeline().to(this, .2, {
                    color: '#CEA65B',
                    ease: 'power1.inOut'
                })
            }, function () { // hover out
                gsap.timeline().to(this, .2, {
                    color: '#CACACA',
                    ease: 'power1.inOut'
                })
            })
            let addingRows = false;
            $('#feather').click(function () {
                if (artworkObjects.length - metCounter >= 25 && !addingRows) {
                    // Prevent multiple clicks (this will reset when calling resumeSyncFlow())
                    addingRows = true;
                    gsap.timeline().to($('#feather'), .5, {
                        color: '#CEA65B',
                        ease: 'power1.inOut'
                    })

                    createArtRows(3, $('main'));
                    resumeSyncFlow();

                    // Toggle paintbrush
                    gsap.timeline().to($('#feather'), .5, {
                        autoAlpha: 0,
                        ease: 'power1.inOut'
                    })
                        .set($('#paintbrush'), { css: { display: 'flex' } })
                        .set($('#feather'), { css: { display: 'none' } })
                        .to($('#paintbrush'), .5, {
                            autoAlpha: 1,
                            ease: 'power1.inOut'
                        })
                        .set($('#feather'), { css: { color: '#CACACA' } })
                }
            });

            $('#paintbrush').click(function () {
                if (artworkObjects.length - metCounter >= 25 && !addingRows) {
                    addingRows = true;

                    gsap.timeline().to($('#paintbrush'), .5, {
                        color: '#CEA65B',
                        ease: 'power1.inOut'
                    })

                    createArtRows(3, $('main'));
                    resumeSyncFlow();

                    // Toggle feather
                    gsap.timeline().to($('#paintbrush'), .5, {
                        autoAlpha: 0,
                        ease: 'power1.inOut'
                    })
                        .set($('#paintbrush'), { css: { display: 'none' } })
                        .set($('#feather'), { css: { display: 'flex' } })
                        .to($('#feather'), .5, {
                            autoAlpha: 1,
                            ease: 'power1.inOut'
                        })
                        .set($('#feather'), { css: { visibility: 'visible' } })
                        .set($('#paintbrush'), { css: { color: '#CACACA' } })
                }
            });
        }

        // }



    }); // end page is loaded

}); // end of js

// If first time on the session, run preloader, otherwise reveal home page.
function checkSessionAndTakeAction() {
    if (sessionStorage.getItem('preloader') === 'false' || sessionStorage.getItem('preloader') === null) {
        sessionStorage.setItem('preloader', 'true');
        runPreloader();
    } else {
        $('#preloader').hide();
        revealHomePage();
    };
}

// Execute the preloader animation
function runPreloader() {
    //Initialize GSAP timeline for preloader
    const preloadAnim = gsap.timeline({ onComplete: hidePreloader });

    let titleArr = $('#rectangle h1').text().split("");
    let artNameArr = $('#artworkName').text().split("");
    let artistArr = $('#artist').text().split("");
    $('#rectangle h1').empty();
    $('#artworkName').empty();
    $('#artist').empty();
    titleArr.forEach(letter => {
        $('#rectangle h1').append("<span>" + letter + "</span>");
    });
    artNameArr.forEach(letter => {
        $('#artworkName').append("<span>" + letter + "</span>");
    });
    artistArr.forEach(letter => {
        $('#artist').append("<span>" + letter + "</span>");
    });

    // Create particle effect
    let particleNo = 70;
    let particleCounter = 0;

    while (particleCounter < particleNo) {
        let particle = $('<span class="particle">');
        let particleDimension = parseInt(Math.random() * 7 + 1).toString() + 'px';
        let blurDimension = parseFloat(Math.random() * 4).toString() + 'px';
        particle.css({
            'top': parseInt(Math.random() * 100 + 1).toString() + 'vh',
            'left': parseInt(Math.random() * 100 + 1).toString() + 'vw',
            'width': particleDimension,
            'height': particleDimension,
            'filter': 'blur(' + blurDimension + ')',
        });
        $('#preloader').append(particle);
        particleCounter++;
    }

    const particleAnim = gsap.to($('.particle'), {
        x: "random(-200, 200)",
        y: "random(-200, 200)",
        duration: 10,
        ease: Power1.easeInOut,
        repeat: -1,
        repeatRefresh: true,
    })
    const particleFlash = gsap.to($('.particle'), {
        autoAlpha: "random(0, 1)",
        ease: Power1.easeInOut,
        repeat: -1,
        duration: 2,
        repeatRefresh: true
    });


    // Animate pictures and rectangle
    let width = $(window).width();
    // Get updated width
    $(window).resize(function () {
        width = $(window).width();
        // Preloader resize 
        // Hide hands 
        if (width < 1100) {
            gsap.timeline().to($('#rightHand'), 0.5, {
                autoAlpha: 0,
                ease: 'power1.inOut'
            })
                .to($('#leftHand'), 0.5, {
                    autoAlpha: 0,
                    ease: 'power1.inOut'
                }, '-=.5')
        }
        // Hide art title & artist
        if (width < 1400) {
            gsap.timeline().to($('#artworkName'), 0.5, {
                autoAlpha: 0,
                ease: 'power1.inOut'
            })
                .to($('#artist'), 0.5, {
                    autoAlpha: 0,
                    ease: 'power1.inOut'
                }, '-=.5')
        }

        // Layouts resize
        resizeArtworks(width);
    });

    if (width > 1100) {
        preloadAnim.fromTo($('#rightHand'), 2, {
            autoAlpha: 0,
        }, {
            autoAlpha: 1,
            ease: 'power1.inOut'
        })
            .to($('#rightHand'), 2, {
                xPercent: 225,
                scaleX: 2.5001,
                scaleY: 2.5001,
                fill: '#FFCE3B',
                force3D: true,
                rotationZ: 0.001,
                ease: 'power1.inOut',
            })
            .fromTo($('#leftHand'), 2, {
                autoAlpha: 0,
            }, {
                autoAlpha: 1,
                ease: 'power1.inOut'
            }, '-=4')
            .to($('#leftHand'), 2, {
                xPercent: -195,
                scaleX: 2.5001,
                scaleY: 2.5001,
                fill: '#FFCE3B',
                force3D: true,
                rotationZ: 0.001,
                ease: 'power1.inOut',
            }, '-=2')
            .fromTo($('#left'), 1, {
                height: vh(0),
                background: "rgb(23, 23, 23)",
                ease: "slow(0.7, 0.7, false)"
            }, {
                height: vh(70),
                background: "rgb(23, 23, 23)"
            }, "-=2")
            .to($('#left'), 0, { css: { top: 0 } }, '-=1')
            .fromTo($('#top'), 1, {
                width: vw(0),
                background: "rgb(23, 23, 23)",
                ease: "slow(0.7, 0.7, false)"
            }, {
                width: vw(75),
                background: "rgb(23, 23, 23)"
            }, '-=1')
            .to($('#top'), 0, { css: { right: 0 } })
            .to($('#left'), 1, {
                height: 0,
                ease: "slow(0.7, 0.7, false)"
            }, '-=1')
            .to($('#left'), 0, { css: { autoAlpha: 0, } })
            .to($('#top'), 1, {
                width: 0,
                ease: "slow(0.7, 0.7, false)"
            })
            .to($('#top'), { css: { autoAlpha: 0, } })
            .fromTo($('#right'), 1, {
                height: vh(0),
                background: "rgb(23, 23, 23)",
                ease: "slow(0.7, 0.7, false)"
            }, {
                height: vh(70),
                background: "rgb(23, 23, 23)"
            }, '-=3.5')
            .to($('#right'), 0, { css: { bottom: 0 } }, '-=2.5')
            .to($('#right'), 1, {
                height: 0,
                ease: "slow(0.7, 0.7, false)"
            }, '-=2.5')
            .to($('#right'), { css: { autoAlpha: 0, } })
            .fromTo($('#bottom'), 1, {
                width: vw(0),
                background: "rgb(23, 23, 23)",
                ease: "slow(0.7, 0.7, false)"
            }, {
                width: vw(75),
                background: "rgb(23, 23, 23)"
            }, '-=3')
            .to($('#bottom'), 0, { css: { left: 0 } }, '-=2')
            .to($('#bottom'), 1, {
                width: 0,
                ease: "slow(0.7, 0.7, false)"
            }, '-=2')
            .to($('#bottom'), 0, { css: { autoAlpha: 0, } }, '-=1')
            .to($('#preloader h1').children('span'), 1, { // Animate title
                top: 0,
                opacity: 1,
                ease: "power4.out",
                stagger: 0.1
            }, '-=3')

    } else {
        // Don't animate hands
        preloadAnim.fromTo($('#left'), 1, {
            height: vh(0),
            background: "rgb(23, 23, 23)",
            ease: "slow(0.7, 0.7, false)"
        }, {
            height: vh(70),
            background: "rgb(23, 23, 23)"
        })
            .to($('#left'), 0, { css: { top: 0 } })
            .fromTo($('#top'), 1, {
                width: vw(0),
                background: "rgb(23, 23, 23)",
                ease: "slow(0.7, 0.7, false)"
            }, {
                width: vw(75),
                background: "rgb(23, 23, 23)"
            })
            .to($('#top'), 0, { css: { right: 0 } })
            .to($('#left'), 1, {
                height: 0,
                ease: "slow(0.7, 0.7, false)"
            }, '-=1')
            .to($('#left'), 0, { css: { autoAlpha: 0, } })
            .to($('#top'), 1, {
                width: 0,
                ease: "slow(0.7, 0.7, false)"
            })
            .to($('#top'), { css: { autoAlpha: 0, } })
            .fromTo($('#right'), 1, {
                height: vh(0),
                background: "rgb(23, 23, 23)",
                ease: "slow(0.7, 0.7, false)"
            }, {
                height: vh(70),
                background: "rgb(23, 23, 23)"
            }, '-=3.5')
            .to($('#right'), 0, { css: { bottom: 0 } }, '-=2.5')
            .to($('#right'), 1, {
                height: 0,
                ease: "slow(0.7, 0.7, false)"
            }, '-=2.5')
            .to($('#right'), { css: { autoAlpha: 0, } })
            .fromTo($('#bottom'), 1, {
                width: vw(0),
                background: "rgb(23, 23, 23)",
                ease: "slow(0.7, 0.7, false)"
            }, {
                width: vw(75),
                background: "rgb(23, 23, 23)"
            }, '-=3')
            .to($('#bottom'), 0, { css: { left: 0 } }, '-=2')
            .to($('#bottom'), 1, {
                width: 0,
                ease: "slow(0.7, 0.7, false)"
            }, '-=2')
            .to($('#bottom'), 0, { css: { autoAlpha: 0, } }, '-=1')
            .to($('#preloader h1').children('span'), 1, { // Animate title
                top: 0,
                opacity: 1,
                ease: "power4.out",
                stagger: 0.1
            }, '-=3')
    }

    // Add artist and artworkname to the animation if above 1400
    if (width >= 1400) {
        preloadAnim
            .to($('#artworkName').children('span'), .1, { // Animate artwork name
                top: 0,
                opacity: 0.5,
                ease: "power4.out",
                stagger: 0.1
            }, '-=4')
            .to($('#artist').children('span'), .1, { // Animate artist
                top: 0,
                opacity: 0.5,
                ease: "power4.out",
                stagger: 0.1
            }, '-=4');
    }
}

// Change grid-template-columns and grid-template-areas depending on screen size
function resizeArtworks(width) {
    if (width > 1650) {
        $('.layoutSettings').css('grid-template-columns', 'repeat(6, 1fr)');
        $('.patternI').css('grid-template-areas', '"A1 A1 A2 A2 A4 A6" "A1 A1 A3 A3 A5 A6"');
        $('.patternII').css('grid-template-areas', '"B1 B2 B4 B4 B6 B6" "B1 B3 B3 B5 B6 B6"');
        $('.patternIII').css('grid-template-areas', '"C1 C3 C4 C4 C5 C6" "C2 C3 C4 C4 C5 C7"');
    }
    else if (width <= 1650 && width > 1250) {
        $('.layoutSettings').css('grid-template-columns', 'repeat(5, 1fr)');
        $('.patternI').css('grid-template-areas', '"A1 A1 A2 A2 A6" "A1 A1 A5 A5 A6" "A3 A3 A4 A4 A4"');
        $('.patternII').css('grid-template-areas', '"B1 B2 B4 B4 B6" "B1 B3 B3 B5 B6"');
        $('.patternIII').css('grid-template-areas', '"C1 C1 C1 C2 C2" "C3 C3 C4 C5 C5" "C3 C3 C4 C5 C5" "C6 C6 C7 C7 C7"');
    } else if (width < 1250 && width > 900) {
        $('.layoutSettings').css('grid-template-columns', 'repeat(3, 1fr)');
        $('.patternI').css('grid-template-areas', '"A1 A1 A2" "A1 A1 A3" "A6 A4 A4" "A6 A5 A5"');
        $('.patternII').css('grid-template-areas', '"B1 B2 B2" "B1 B3 B3" "B4 B4 B6" "B5 B5 B6"');
        $('.patternIII').css('grid-template-areas', '"C1 C1 C7" "C2 C2 C3" "C4 C4 C3" "C4 C4 C5" "C6 C6 C5"');
    } else if (width <= 900) {
        $('.layoutSettings').css('grid-template-columns', 'repeat(1, 1fr)');
        $('.patternI').css('grid-template-areas', '"A1" "A1" "A2" "A3" "A4" " A5" "A6" "A6"');
        $('.patternII').css('grid-template-areas', '"B1" "B1" "B2" "B3" "B4" "B5" "B6" "B6"');
        $('.patternIII').css('grid-template-areas', '"C1" "C2" "C3" "C3" "C4" "C4" "C5" "C5" "C6" "C7"');
    }
}

// Animation of hiding the preloader
function hidePreloader() {
    const hidePreAnim = gsap.timeline({ onComplete: revealHomePage })
    hidePreAnim.to($('#preloader'), 1, {
        height: 0,
        ease: 'power3.int'
    })
        .to([$('#leftHand'), $('#rightHand'), $('#preloader h1')], 1, {
            y: -vh(80),
            ease: 'power3.int'
        }, '-=1');
}

// Set the artworks size and reveal the main page (by settings css properties)
function revealHomePage() {
    // Remove particles from preloader
    $('.particle').remove();
    // Resize artworks before displaying 
    resizeArtworks($(window).width());
    // Display page
    gsap.timeline().set([$('header'), $('main'), $('footer')], { css: { 'display': 'block' } })
        .set($('footer'), { css: { 'display': 'flex' } })
        .to([$('header'), $('main'), $('footer')], 1, {
            autoAlpha: 1,
            ease: 'power1.intOut',
            delay: .7
        });
}

// Initialize the music controls
function initializeMusic() {
    // Don't allow user to select the music elements
    $('#music').attr('unselectable', 'on')
        .css('user-select', 'none')
        .on('selectstart', false);
    let lofiMax = 51
    let pianoMax = 19

    // Random number between range, used to select the song
    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    // Randomly choose the starting point (and the first song)
    let lofiCounter = getRandomNumber(1, lofiMax);
    let pianoCounter = getRandomNumber(1, pianoMax)

    // Start playing first lofi
    let lofi = new Audio(`./public/Music/Lofi/${lofiCounter}.mp3`);
    let piano = new Audio(`./public/Music/Piano/${pianoCounter}.mp3`);;
    let playingLofi = false;
    let playing = false;

    // Set starting volume
    lofi.volume = 0.5;
    piano.volume = 0.5;

    function playLofi() {
        if (!piano.paused) {
            piano.pause();
        }
        playingLofi = true
        if (playing) {
            lofi.play();
        }
    }

    function playPiano() {
        if (!lofi.paused) {
            lofi.pause();
        }
        playingLofi = false
        if (playing) {
            piano.play();
        }
    }

    $(lofi).on('ended', function () {
        if (lofiCounter + 1 > lofiMax) {
            lofiCounter = 1;
        } else {
            lofiCounter++;
        }
        lofi.src = `./public/Music/Lofi/${lofiCounter}.mp3`;
        lofi.play();
    });

    $(piano).on('ended', function () {
        if (pianoCounter + 1 > pianoMax) {
            pianoCounter = 1;
        } else {
            pianoCounter++;
        }
        piano.src = `./public/Music/Piano/${pianoCounter}.mp3`;
        piano.play();
    });

    // Music from header
    $('#play').click(function () {
        // Toggle to pause button
        gsap.timeline().to(this, .2, {
            autoAlpha: 0,
            ease: 'power1.inOut'
        })
            .to($('#pause'), .2, {
                autoAlpha: 1,
                ease: 'power1.inOut'
            })

        playing = true;

        // Check which type of music is playing
        if (playingLofi) {
            lofi.play();
        } else {
            piano.play();
        }
    });

    $('#pause').click(function () {
        // Toggle to play button
        gsap.timeline().to(this, .2, {
            autoAlpha: 0,
            ease: 'power1.inOut'
        })
            .to($('#play'), .2, {
                autoAlpha: 1,
                ease: 'power1.inOut'
            });

        playing = false;

        if (!lofi.paused) {
            lofi.pause();
        } else if (!piano.paused) {
            piano.pause();
        }
    });

    $('#piano').click(function () {
        // Toggle to piano music
        gsap.timeline().to($('#circle'), .3, {
            left: vw(-1),
            ease: 'power1.inOut'
        })
            .to($('#piano'), 0, {
                filter: 'invert(79%) sepia(13%) saturate(1618%) hue-rotate(358deg) brightness(87%) contrast(82%)',
            })
            .to($('#lofi'), 0, {
                filter: 'invert(89%) sepia(0%) saturate(2808%) hue-rotate(62deg) brightness(92%) contrast(93%)',
            })

        playPiano();
    });

    $('#lofi').click(function () {
        // Toggle to piano music
        gsap.timeline().to($('#circle'), .3, {
            left: vw(-2.4),
            ease: 'power1.inOut'
        })
            .to($('#lofi'), 0, {
                filter: 'invert(79%) sepia(13%) saturate(1618%) hue-rotate(358deg) brightness(87%) contrast(82%)',
            })
            .to($('#piano'), 0, {
                filter: 'invert(89%) sepia(0%) saturate(2808%) hue-rotate(62deg) brightness(92%) contrast(93%)',
            })

        playLofi();
    });

    $('#volumeDown').click(function () {
        let volume = piano.volume;

        gsap.timeline().to($('#volumeDown'), .2, {
            scale: 1.2,
            ease: 'power1.inOut'
        })
            .to($('#volumeDown'), .2, {
                scale: 1,
                ease: 'power1.inOut'
            })

        if (volume - 0.1 >= 0) {
            lofi.volume = volume - 0.1;
            piano.volume = volume - 0.1;
        }
    })

    $('#volumeUp').click(function () {
        let volume = piano.volume;

        gsap.timeline().to($('#volumeUp'), .2, {
            scale: 1.2,
            ease: 'power1.inOut'
        })
            .to($('#volumeUp'), .2, {
                scale: 1,
                ease: 'power1.inOut'
            })

        if (volume + 0.1 <= 1) {
            lofi.volume = volume + 0.1;
            piano.volume = volume + 0.1;
        }
    })
}

// Initialize the search controls and animation
function initializeSearch() {
    // Add hover effect for the menu and search button
    addHoverColor($('#search'), '#CACACA', '#CEA65B');
    addHoverColor($('#page1'), '#CACACA', '#CEA65B');
    addHoverColor($('#page2'), '#CACACA', '#CEA65B');
    addHoverColor($('#page3'), '#CACACA', '#CEA65B');

    $('#search').click(function () {
        let inputWidth = $('#searchInput').width();
        // Animate the input width
        if (inputWidth == 0) {
            gsap.timeline().to($('#searchInput'), 1.5, {
                width: vw(20),
                ease: 'power1.inOut'
            })
                .to($('#searchInput'), .4, {
                    paddingLeft: '15px',
                    ease: 'none'
                }, '-=1.5')

        } else {
            // // Toggle input width if there is no value when pressing search
            let inputValue = $('#searchInput').val();
            if (inputValue == "") {
                gsap.timeline().to($('#searchInput'), 1.5, {
                    width: vw(0),
                    ease: 'power1.inOut'
                })
                    .to($('#searchInput'), .1, {
                        paddingLeft: 0,
                        ease: 'none'
                    }, '-=.2')
            }
        }

    });
}

// Add loading animation
function loadingAnimation() {
    let brushContainer = $('<div id="brushContainer"></div>')
    let text = $('<h1 id="loading">Loading<span id="dot1">.</span><span id="dot2">.</span><span id="dot3">.</span></h1>')
    let brush = $('<img src="../public/Pictures/brush.svg" alt="brush" id="brush"></img>');
    brushContainer.append(text);
    brushContainer.append(brush);
    $('main').append(brushContainer);
    gsap.timeline().to($('#brush'), 20, {
        rotate: 360,
        ease: 'none',
        repeat: '-1'
    })
        .to($('#dot1'), 2, {
            autoAlpha: 0,
            ease: 'power1.inOut',
            repeat: '-1'
        }, '-=20')
        .to($('#dot2'), 2, {
            autoAlpha: 0,
            ease: 'power1.inOut',
            repeat: '-1'
        }, '-=19.8')
        .to($('#dot3'), 2, {
            autoAlpha: 0,
            ease: 'power1.inOut',
            repeat: '-1'
        }, '-=19.6')
}

// Remove loading animation
async function removeLoading() {
    // Hide loading animation
    gsap.timeline().to($('#brushContainer'), .5, {
        autoAlpha: 0,
        ease: 'power1.inOut'
    })
    $('#brushContainer').remove();
    // Wait for the load animation to fade out 
    await sleep(700);
}

// Implementing sleep for JS
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Variables needed for row creation 
// Patterns specifications .
const patterns = {
    'patternI': {
        'type': 'A',
        'amount': 6,
        'minHeight': [true, false, false, false, false, true],
        'poem': [false, true, false, false, false, true]
    },
    'patternII': {
        'type': 'B',
        'amount': 6,
        'minHeight': [true, false, false, false, false, true],
        'poem': [true, false, false, true, false, false]
    },
    'patternIII': {
        'type': 'C',
        'amount': 7,
        'minHeight': [false, false, true, true, true, false, false],
        'poem': [false, false, true, false, true, false]
    }
};

// Create rows by cycling the patterns dictionary 
async function createArtRows(amount, element, database) {
    let startPoint;
    // Counter for database
    let databaseCounter = 1;

    while (amount > 0) {
        // Get the last pattern name or choose to start from the first one if none exist
        let lastPattern;
        try {
            lastPattern = element.children('.layoutSettings').last().attr('class').split(' ')[1];
        } catch {
            lastPattern = 'patternIII';
        }

        // Decide startPoint to avoid repeating the same pattern
        switch (lastPattern) {
            case 'patternI': startPoint = 1; break;
            case 'patternII': startPoint = 2; break;
            case 'patternIII': startPoint = 0; break;
        }
        let patternName = Object.keys(patterns)[startPoint];
        let curentPattern = patterns[patternName];
        let rowArtCounter = 0;
        element.append('<div class="layoutSettings ' + patternName + '">');
        let currentRow = $('.layoutSettings').last();

        // Generate the each row depending on the current patern
        while (rowArtCounter < curentPattern.amount) {
            if (database) {
                let art = databaseData[databaseCounter - 1];
                let container = $('<div class="container ' + curentPattern.type + (rowArtCounter + 1).toString() + '">');
                currentRow.append(container);

                // Create the container
                $('.container').last().append(`<div class="artwork" id="art-${databaseCounter}">`);
                let artContainer = $(`#art-${databaseCounter}`);

                // Depending on the art, add poem or artwork
                if (art.poem) {
                    artContainer.append(`<h1>${art.title}</h1>`);
                    artContainer.append(`<h2>- ${art.author}</h2>`);
                    artContainer.append('<div class="poemLines">')
                    let poemLines = "";
                    art.lines.forEach(function (line) {
                        poemLines += line + '<br>';
                    });
                    $('.poemLines').append('<p>' + poemLines + '</p>');
                } else {
                    // Add image to artwork
                    $(artContainer).css({
                        'background': `url("${art.image}")`,
                        'background-size': 'cover'
                    });

                }

                // Add min-height if required
                if (curentPattern.minHeight[rowArtCounter]) {
                    $('#art-' + databaseCounter).css('min-height', '61vh');
                }

                // Exit function when all user artwork were inserted from the database
                if (databaseCounter == Object.keys(databaseData).length) {
                    return;
                }
                databaseCounter++;
            } else {
                // Insert container data from database or from API
                let container = $('<div class="container ' + curentPattern.type + (rowArtCounter + 1).toString() + '">');
                currentRow.append(container);
                // Insert poem or artwork depending on the design
                if (curentPattern.poem[rowArtCounter]) {
                    let currentPoem = poems[poetryCounter];
                    poetryCounter++;

                    // Add a div to container and set the poem ID (tracking purposes)
                    $('.container').last().append('<div class="artwork" id="poem-' + poetryCounter.toString() + '">');
                    let artContainer = $('#poem-' + poetryCounter.toString());

                    artContainer.append(`<h1>${currentPoem.title}</h1>`);
                    artContainer.append(`<h2>- ${currentPoem.author}</h2>`);
                    artContainer.append('<div class="poemLines">')
                    let poemLines = "";
                    currentPoem.lines.forEach(function (line) {
                        poemLines += line + '<br>';
                    });

                    $('.poemLines').append('<p>' + poemLines + '</p>');

                    // Get more poems if needed
                    // processPoetryRequest
                    if (poems.length - poetryCounter < 30 && !processPoetryRequest) {
                        getRandomPoems(60);
                    }

                    // Add min-height if required
                    if (curentPattern.minHeight[rowArtCounter]) {
                        $('#poem-' + poetryCounter.toString()).css('min-height', '61vh');
                    }
                } else {
                    // Get an artwork from the array
                    let artworkObject = artworkObjects[metCounter];
                    metCounter++;

                    // Add a div to container and set the poem ID (tracking purposes)
                    $('.container').last().append('<div class="artwork" id="art-' + metCounter.toString() + '">');
                    let artContainer = $('#art-' + metCounter.toString());

                    if (artworkObject != undefined) {
                        // Add image to artwork
                        $(artContainer).css({
                            'background': 'url("' + artworkObject.imageSmall + '")',
                            'background-size': 'cover'
                        });
                    }

                    // Add to the artwork objects array, if it contains less than 30 
                    if (artworkObjects.length - metCounter < 30 && !processMetRequest) {
                        makeMultipleMetRequests(30);
                    }

                    // Add min-height if required
                    if (curentPattern.minHeight[rowArtCounter]) {
                        $('#art-' + metCounter.toString()).css('min-height', '61vh');
                    }
                }
            }
            rowArtCounter++;
        }
        amount--;
    }
}

// Make multiple asynchronous MET API requests
async function makeMultipleMetRequests(amount) {
    processMetRequest = true;
    let startingAmount = artworkObjects.length
    return new Promise(function (resolve, reject) {
        // Make 3 API calls at a time --- Could reduce to a single call instead of 3
        for (let x = 0; x < amount; x++) {
            metRequest();
            metRequest();
            metRequest();
        }

        let time = 100;
        // Check when the output array was filled
        function checkOutput() {
            if (artworkObjects.length >= startingAmount + amount) { // When all objects are in the array, resolve

                processMetRequest = false;
                resolve(artworkObjects);
            } else if (time == 5000) { // Reject if the function didn't finish in 5 sec
                reject("Couldn't get artworks!");
            } else {
                time += 100;
                window.setTimeout(checkOutput, time);
            }
        }
        checkOutput();
    });
}

// Get random poems from the Poetry API
async function getRandomPoems(amount) {
    processPoetryRequest = true;
    return new Promise(function (resolve, reject) {
        $.getJSON(`https://poetrydb.org/random/${amount}`, (result) => {
            poems.push(...result);
            processPoetryRequest = false;
            resolve(true);
        });
    });
}

// Get IDs from all departments (MET API)
async function getIdsFromDepartments() {
    return new Promise(function (resolve, reject) {
        $.getJSON(`https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=11|21`, (result) => {
            artworksID = result.objectIDs;
            resolve(true);
        });
    })

}

// Get one random artwork from the MET API and add it to the array artworkObjects
function metRequest() {
    // Replace this in the future 
    let artIndex = Math.round(Math.random() * (artworksID.length - 1));
    $.getJSON(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${artworksID[artIndex]}`, (result) => {
        if (result.primaryImage == "" || result.primaryImage == undefined) {
            artworksID.splice(0, 1);
            metRequest();
        } else {

            let categories = [result.objectID, result.title, result.department, result.culture, result.period, result.reign, result.medium, result.objectName, result.artistDisplayName, result.artistDisplayBio, result.artistRole, result.city, result.country, result.objectDate, result.primaryImage, result.primaryImageSmall];

            let data = [];
            // Cycle through each category and replace it with Unknown if empty
            categories.forEach(category => {
                if (category == "") {
                    data.push("Unknown");
                } else {
                    data.push(category);
                }
            });
            artworkObjects.push({
                "objectID": data[0],
                "title": data[1],
                "department": data[2],
                "culture": data[3],
                "period": data[4],
                "reign": data[5],
                "medium": data[6],
                "name": data[7],
                "artist": data[8],
                "artistBio": data[9],
                "artistRole": data[10],
                "city": data[11],
                "country": data[12],
                "date": data[13],
                "image": data[14],
                "imageSmall": data[15]
            });
            return true;
        }
    });
}

// Search for keywords using the Wikipedia API
async function getWikiPageFromKeyword(keyword) {
    let url = 'https://en.wikipedia.org/w/api.php';
    let params = {
        action: 'query',
        list: 'search',
        srsearch: keyword,
        format: 'json'
    };

    url += '?origin=*';
    Object.keys(params).forEach((key) => {
        url += "&" + key + "=" + params[key];
    });

    return new Promise(function (resolve, reject) {
        $.getJSON(url, (result) => {
            // Get the wikipedia page title from the keyword.
            if (result.query.search.length == 0) {
                resolve(['<p>No Wikipedia data found</p>', ''])
            } else {
                let title = result.query.search[0].title

                // Get the wikipedia page from the title.
                resolve(new Promise(function (resolve, reject) {
                    // let pageUrl = `https://en.wikipedia.org/w/api.php?&action=query&format=json&prop=extracts&titles=${title}&formatversion=2&rvsection=0&origin=*`;       
                    let pageUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&list=&titles=${title}&exsentences=10&origin=*`;
                    $.ajax({
                        url: pageUrl,
                        success: (result) => {
                            let pageResult = result.query.pages;
                            let pageData = pageResult[Object.keys(pageResult)[0]].extract;
                            let pageLink = `https://en.wikipedia.org/?curid=${pageResult[Object.keys(pageResult)[0]].pageid}`;
                            resolve([pageData, pageLink]);
                        }
                    });
                }));
            }
        })
            .fail(function () {
                resolve(['<p>No Wikipedia data found</p>', ""]);
            })

    });
}

// Function that adds hover functionality to an icon
function addHoverColor(icon, startColor, endColor) {
    icon.hover(function () {
        gsap.to(icon, .3, {
            color: endColor,
            ease: 'power1.inOut'
        });
    }, function () {
        gsap.to(icon, .3, {
            color: startColor,
            ease: 'power1.inOut'
        });
    });
}

// Initializes the hover in and out animations and logic
function initializeContainerHover(onProfilePage) {
    $('.container').hover(function () {
        // Check if it has containerHover
        let containerHover = $(this).find('div.containerHover').length == 0;
        if (!artIsClicked && containerHover) {
            $(this).append('<div class="containerHover">');
            $('.containerHover').append('<span class="topBorder">')
                .append('<span class="rightBorder">')
                .append('<span class="bottomBorder">')
                .append('<span class="leftBorder">');

            // Animate border
            hoverAnim.fromTo($('.leftBorder'), 0.5, {
                autoAlpha: 0
            }, {
                autoAlpha: 1,
                height: $(this).height()
            })
                .fromTo($('.topBorder'), 0.5, {
                    autoAlpha: 0
                }, {
                    autoAlpha: 1,
                    width: $(this).width() * 0.99
                })
                .fromTo($('.rightBorder'), 0.5, {
                    autoAlpha: 0
                }, {
                    autoAlpha: 1,
                    height: $(this).height()
                }, '-=1')
                .fromTo($('.bottomBorder'), 0.5, {
                    autoAlpha: 0
                }, {
                    autoAlpha: 1,
                    width: $(this).width()
                }, '-=0.5')
                // Reverse border
                .to($('.leftBorder'), 0.5, {
                    y: -$(this).height() + 1,
                    height: 0
                }, '-=0.5')
                .to($('.leftBorder'), {
                    borderTop: 0,
                    borderBottom: 0
                }, '-=0.5')
                .to($('.leftBorder'), {
                    autoAlpha: 0
                })
                .to($('.topBorder'), 0.5, {
                    x: $(this).width() - 1,
                    width: 0,
                }, '-=.5')
                .to($('.topBorder'), {
                    borderLeft: 0,
                    borderRight: 0
                }, '-=0.5')
                .to($('.topBorder'), {
                    autoAlpha: 0
                }, '-=.0')
                .to($('.rightBorder'), 0.5, {
                    y: $(this).height() - 1,
                    height: 0
                }, '-=1.5')
                .to($('.rightBorder'), {
                    borderTop: 0,
                    borderBottom: 0
                }, '-=1.5')
                .to($('.rightBorder'), {
                    autoAlpha: 0
                }, '-=0.5')
                .to($('.bottomBorder'), 0.5, {
                    x: -$(this).width(),
                    width: 0,
                }, '-=1')
                .to($('.bottomBorder'), {
                    borderLeft: 0,
                    borderRight: 0
                }, '-=1')
                .to($('.bottomBorder'), {
                    autoAlpha: 0
                }, '-=.0');
        }

        // Display icons
        $('.containerHover').append('<i class="fas fa-heart fa-2x"></i>');
        $('.containerHover').append('<i class="fas fa-share fa-2x"></i>');

        if (onProfilePage) {
            $('.containerHover').append('<i class="fas fa-minus fa-2x removeArtwork"></i>');

        } else {
            $('.containerHover').append('<i class="fas fa-plus fa-2x addArtwork"></i>');
        }

        // Only run animation if the icons still exist (they get removed once a user hovers out)
        if ($('.containerHover').length != 0) {
            hoverAnim.fromTo($('.containerHover'), 0.7, {
                background: ""
            }, {
                ease: 'power1.inOut',
                background: "linear-gradient(0deg, rgba(40,40,40,1) 0%, rgba(40,40,40,.7) 14%, rgba(255,255,255,0) 55%)"
            }, '-=1.75')

            if (onProfilePage) {
                hoverAnim.to($('.fa-heart, .removeArtwork, .fa-share'), 0.7, {
                    ease: 'power1.inOut',
                    opacity: 1
                }, '-=1.3');
            } else {
                hoverAnim.to($('.fa-heart, .addArtwork, .fa-share'), 0.7, {
                    ease: 'power1.inOut',
                    opacity: 1
                }, '-=1.3');
            }


            // Adding hover functionality to the icons
            addHoverColor($('.fa-heart'), '#CACACA', '#B20000');
            addHoverColor($('.fa-share'), '#CACACA', '#CEA65B');

            if (onProfilePage) {
                addHoverColor($('.removeArtwork'), '#CACACA', '#CEA65B');
            } else {
                addHoverColor($('.addArtwork'), '#CACACA', '#CEA65B');
            }

            // Initialize share and add logic
            initializeShareLogic(onProfilePage);
            initializeAddRemoveLogic(onProfilePage);

            // Heart clicked
            $('.fa-heart').click(function () {
                gsap.to(this, {
                    color: '#C64939',
                })
            });
        }

    }, outContainer);
}

// Rearrange icons if they're displayed when user clicks artwork
function outContainer() {
    // hoverAnim.progress(1);
    // hoverAnim.restart();
    hoverAnim.progress(1);
    // Reposition icons if artwork expands
    if (artIsClicked) {
        $('.containerHover').remove();
    } else {
        $('.containerHover').remove();
        $('.fa-heart, .addArtwork, .fa-share', '.containerHover').remove();
    }
}

// Initializes the logic and animations when clicking a container, including the extension.
function initializeContainerClick(database) {
    $('.container').click(function (event) {
        // Prevent multiple clicks and check if icons are clicked
        if (!artIsClicked && !$(event.target).is('i')) {
            artIsClicked = true;
            // Fast forward border anim if running and clear icons if present
            if (hoverAnim.isActive() || $('.containerHover').children('.fas')) {
                outContainer();
            }

            // Blur all the other containers
            $('.container').css({
                'filter': 'blur(5px)',
                'z-index': -100
            })
            $(this).css({
                'filter': 'blur(0px)',
                'z-index': 1
            })
            // Rescale the artwork by modifying the templetate-areas
            let currentHeight = $(this).height();
            let currentWidth = $(this).width();

            // Update current values if window gets resized
            $(window).resize(() => {
                currentHeight = $(this).height();
                currentWidth = $(this).width();
            });

            // Set the container's style before animating
            setStyleProperties($(this));

            let resizeArtAnim = gsap.timeline({ onComplete: animateExtension, onCompleteParams: [$(this)] });

            // Choose how much to expand the artwork depending on the no of columns 
            let currentColumnsNo = $(this).parent().css('grid-template-columns').split(' ').length;
            let widthOfArt;
            switch (currentColumnsNo) {
                case 6: widthOfArt = vw(55); break;
                case 5: widthOfArt = vw(55); break;
                case 3: widthOfArt = vw(80); break;
                case 1: widthOfArt = $(this).width(); break;
            }

            $(this).append('<div class="extension">');
            resizeArtAnim.fromTo($(this), 1, {
                height: currentHeight,
            }, {
                width: widthOfArt, // change depending on layout 
                height: vh(61),
                ease: 'power1.inOut'
            })
                .fromTo($('.artwork', this), 1, {
                    height: currentHeight,
                    width: '100%'
                }, {
                    height: vh(61),
                    ease: 'power1.inOut'
                }, '-=1');


            // Get the aspect ration of cover/contain in pixel to be able to animate the transition
            function getImageSize(image, size) {
                // Create new image object and set the url
                let url = image.css('background-image').replace(/^(url\(\")/g, "").replace(/\"\)$/, "");
                let newImage = new Image();
                newImage.setAttribute('src', url);

                // Get dimensions for image and parent
                let parentHeight = image.parent().height();
                let parentWidth = image.parent().width();
                let height = newImage.naturalHeight;
                let width = newImage.naturalWidth;

                // Initialize future height and width variable
                let newHeight;
                let newWidth;

                // Set height and width depending on size parameter
                if (size == 'contain') {
                    if (height > width) {
                        newHeight = parentHeight;
                        newWidth = (parentHeight * width) / height;
                    } else { // width > height
                        newHeight = (parentWidth * height) / width;
                        newWidth = parentWidth;
                        if (newHeight > parentHeight) {
                            let ratio = height / width;
                            newHeight = parentHeight;
                            newWidth = parentHeight / ratio;
                        }
                    }
                } else if (size == "cover") {
                    newWidth = parentWidth;
                    newHeight = parentHeight;
                }

                let newSize = [Math.ceil(newWidth) + "px", Math.ceil(newHeight) + "px"];
                return newSize;
            }

            async function animateExtension(element) {
                // Prevent animating the extension if leaveArtAnim is running
                if (!leaveArtAnim.isActive()) {

                    // Get artwork ID and its number 
                    let id = element.children(":first").attr('id');
                    let artNumber = id.split('-')[1] - 1;

                    // Check if element is a poem or not
                    let isPoem = $(element).find('div.poemLines').length == 1;
                    if (isPoem) {
                        // Swap the metObject with the one from database if needed
                        let poemObject;
                        if (database) {
                            poemObject = databaseData[artNumber + 1];
                        } else {
                            poemObject = poems[artNumber];
                        }

                        $('.extension').append('<div class="artText">');
                        let title = $('<h1 class="titleArt"></h1>').text(poemObject.title);
                        let artist = $('<p class="descriptionArt"></p>').append(`<strong>Artist:</strong> ${poemObject.author}`);

                        $('.artText').append(title, artist);

                        // Open up animation
                        openArtAnimation();

                        // Search Wikipedia for more data
                        let wikiAuthor;
                        if (poemObject.author != "Unknown") {
                            wikiAuthor = await getWikiPageFromKeyword(poemObject.author);
                        } else {
                            wikiAuthor = $('<p> The artist is unknown </p>');
                        }

                        let wikiArt = await getWikiPageFromKeyword(poemObject.title);

                        // Add titles and the wikipedia info
                        let authorDetails = $(`<h2 class="descriptionArt"><a href="${wikiAuthor[1]}" target="_blank" id="authorLink">Author details</a></h2>`);
                        let poemDetails = $(`<h2 class="descriptionArt"><a href="${wikiArt[1]}" target="_blank" id="artLink">Poem details</a></h2>`);
                        $('.artText').append(authorDetails);
                        $('.artText').append(wikiAuthor[0]);
                        $('.artText').append(poemDetails);
                        $('.artText').append(wikiArt[0]);

                        // Add hover effect for the links
                        addHoverColor($('#authorLink'), '#CACACA', '#a78648');
                        addHoverColor($('#artLink'), '#CACACA', '#a78648');

                        // Add data for poem
                        revealExtensionDetails();
                    } else {
                        // Swap the metObject with the one from database if needed
                        let metObject;
                        if (database) {
                            metObject = databaseData[artNumber + 1];
                        } else {
                            metObject = artworkObjects[artNumber];
                        }
                        // Add data for artwork
                        $('.extension').append('<div class="artText">');

                        let title = $('<h1 class="titleArt"></h1>').text(metObject.title);
                        let quickFacts = $('<h2 class="descriptionArt"></h2>').text('Quick facts');
                        let artist = $('<p class="descriptionArt"></p>').append(`<strong>Artist:</strong> ${metObject.artist}`);
                        let bio = $('<p class="descriptionArt"></p>').append(`<strong>Artist bio:</strong> ${metObject.artistBio}`);
                        let creationDate = $('<p class="descriptionArt"></p>').append(`<strong>Creation date:</strong> ${metObject.date}`);
                        let country = $('<p class="descriptionArt"></p>').append(`<strong>Country of creation:</strong> ${metObject.country}`);
                        let city = $('<p class="descriptionArt"></p>').append(`<strong>City of creation:</strong> ${metObject.city}`);
                        let medium = $('<p class="descriptionArt"></p>').append('<strong>Medium:</strong> ' + metObject.medium);

                        $('.artText').append(title, quickFacts, artist, bio, creationDate, country, city, medium);

                        // Open up animation
                        openArtAnimation();

                        // Search Wikipedia for more data
                        let wikiAuthor;
                        if (metObject.artist != "Unknown") {
                            wikiAuthor = await getWikiPageFromKeyword(metObject.artist);
                        } else {
                            wikiAuthor = $('<p> The artist is unknown </p>');
                        }

                        let wikiArt = await getWikiPageFromKeyword(metObject.title);

                        // Add titles and the wikipedia info
                        let authorDetails = $(`<h2 class="descriptionArt"><a href="${wikiAuthor[1]}" target="_blank" id="authorLink">Author details</a></h2>`);
                        let artDetails = $(`<h2 class="descriptionArt"><a href="${wikiArt[1]}" target="_blank" id="artLink">Art details</a></h2>`);
                        $('.artText').append(authorDetails);
                        $('.artText').append(wikiAuthor[0]);
                        $('.artText').append(artDetails);
                        $('.artText').append(wikiArt[0]);

                        // Add hover effect for the links
                        addHoverColor($('#authorLink'), '#CACACA', '#a78648');
                        addHoverColor($('#artLink'), '#CACACA', '#a78648');

                        // Add artwork details to extension
                        revealExtensionDetails();
                    }

                    function openArtAnimation() {
                        // Add icons to extension
                        let iconContainer = $('<div id="iconContainer">')
                        iconContainer.append('<i class="fas fa-heart fa-2x"></i>');
                        // Add plus on home and minus on the profile page
                        if (database) {
                            iconContainer.append('<i class="fas fa-minus fa-2x removeArtwork"></i>');
                        } else {
                            iconContainer.append('<i class="fas fa-plus fa-2x addArtwork"></i>');
                        }
                        iconContainer.append('<i class="fas fa-share fa-2x"></i>');


                        $('.extension').append(iconContainer);
                        // Adding hover functionality to the icons
                        addHoverColor($('.fa-heart'), '#CACACA', '#B20000');
                        addHoverColor($('.addArtwork'), '#CACACA', '#1F1F1F');
                        addHoverColor($('.fa-share'), '#CACACA', '#1F1F1F');

                        // Initialize share and add logic
                        initializeShareLogic(database);
                        initializeAddRemoveLogic(database);

                        $('.extension', element).css({
                            'width': element.width(),
                            'background-color': '#131313'
                        })
                        $('.artwork', element).css('overflow-y', 'auto');


                        // Animate extension height
                        expansionAnim.to($('.extension'), 1, {
                            height: vh(50),
                            y: vh(50),
                            ease: 'power1.inOut'
                        })

                        // Animate to size "cover" only if it's not a poem
                        let artwork = $(element).children('.artwork');
                        if ($(artwork).children('.poemLines').length == 0) {
                            let coverSize = getImageSize($('.artwork', element), "cover");
                            let containSize = getImageSize($('.artwork', element), "contain");
                            expansionAnim.fromTo($('.artwork', element), 0.5, {
                                width: coverSize[0],
                                height: coverSize[1],
                                ease: 'power1.inOut',
                            }, {
                                width: containSize[0],
                                height: containSize[1],
                                ease: 'power1.inOut',
                            }, '-=1')
                        } else { // Otherwise add the side scroll area 
                            // Animate scrollable area
                            let scrollAreaLeft = $('<div id="poemScrollAreaLeft">');
                            let scrollAreaRight = $('<div id="poemScrollAreaRight">');
                            $(element).append(scrollAreaLeft);
                            $(element).append(scrollAreaRight);

                            expansionAnim.set([$('#poemScrollAreaLeft'), $('#poemScrollAreaRight')], {
                                css: {
                                    'height': vh(61)
                                }
                            }, '-=1');
                        }
                    }

                    async function revealExtensionDetails() {
                        // Check if user hovered out and thus removed the elements
                        if ($('.artText').length != 0) {
                            expansionAnim.fromTo([$('.artText').children(), $('.artText')], .5, {
                                autoAlpha: 0,
                                display: 'none'
                            }, {
                                autoAlpha: 1,
                                display: 'block',
                                ease: 'power1.inOut'
                            })
                                .to($('#iconContainer'), .5, {
                                    height: '100%',
                                    ease: 'power1.inOut'
                                })
                                .fromTo($('.fa-heart, .addArtwork, .fa-share'), .5, {
                                    autoAlpha: 0,
                                }, {
                                    autoAlpha: 1,
                                    ease: 'power1.inOut'
                                })
                        }
                    }
                }


            }

            // Restore artwork to its original position
            $(this).mouseleave(function () {
                // Don't run sequence if the artwork is clicked or if the .mouseleave sequence is already running
                if (artIsClicked && !restoreArt) {
                    restoreArt = true;
                    leaveArtAnim = gsap.timeline({ onComplete: revertContainerChanges, onCompleteParams: [$(this)] });

                    // Kill expansion animation

                    leaveArtAnim
                        .to([$('.artText').children(), $('.fa-heart, .addArtwork, .fa-share')], 0.5, {
                            autoAlpha: 0,
                            display: 'none',
                            ease: 'power1.inOut'
                        })
                        .to($('.extension'), 0.5, {
                            height: 0,
                            y: 0,
                            ease: 'power1.inOut'
                        })

                    // Animate iconContainer only if it was firstly added
                    if ($('#iconContainer').length != 0) {
                        leaveArtAnim.to($('#iconContainer'), 0.5, {
                            height: 0,
                            ease: 'power1.inOut'
                        }, '-=.5')

                    }

                    leaveArtAnim.call(() => $('.artText').remove())
                        // Stop extension from displaying as the artwork is resized
                        .to($('.extension'), 0, {
                            css: {
                                'height': 0,
                                'width': 0
                            }
                        })

                    // Resize artwork
                    // Add background size if painting, otherwise scroll poem to the top and remove scroll areas
                    if ($(this).find('.poemLines').length == 0) {
                        leaveArtAnim.to($('.artwork', this), 0, { backgroundSize: 'cover' })
                    } else {
                        leaveArtAnim.to($('.artwork', this), 0.5, { scrollTop: 0, ease: 'power1.inOut' })
                        $('#poemScrollAreaLeft').remove();
                        $('#poemScrollAreaRight').remove();
                    }
                    leaveArtAnim.to($('.artwork', this), 1, {
                        height: vh(30),
                        width: '100%',
                        ease: 'power1.inOut'
                    })
                        .to($(this), 1, {
                            height: currentHeight,
                            width: currentWidth,
                            ease: 'power1.inOut'
                        }, '-=1')
                }

            });

            function revertContainerChanges(container) {
                let currentBackground = $('.artwork', container).css('background');
                let artworkPosition = $(container).attr('class').split(' ')[1];
                let artworkNumber = artworkPosition.split('')[1];
                let artworkType = artworkPosition.split('')[0];
                let artworkMinHeight;
                let isPoem;

                // Find the the position of the artwork and check if it needs a minimum height
                $.each(patterns, function (key, value) {
                    if (value.type == artworkType) {
                        isPoem = value.poem[artworkNumber - 1];
                        artworkMinHeight = value.minHeight[artworkNumber - 1];
                    }
                });

                // Reset isPoem if the artwork was inserted from the database
                if (database) {
                    isPoem = databaseData[artworkNumber].poem
                }

                // Remove blur from the other containers
                $('.container').css({
                    'filter': 'blur(0px)',
                    'z-index': 1
                })
                $('.extension').remove();

                // Restore style properties
                container.removeAttr('style');
                $('.artwork', container).removeAttr('style');
                $('.arwtork', container).css({
                    'height': '30vh',
                    'width': '100%',
                });

                if (!isPoem) {
                    $('#' + container.children().attr('id')).css({
                        'background': currentBackground,
                    })
                }

                // Assign minimum height if required
                if (artworkMinHeight) {
                    $('#' + container.children().attr('id')).css({
                        'min-height': '61vh',
                    })
                }
                restoreArt = false;
                artIsClicked = false;
            }
        }

    });
}

// Decide depending on position which way the artwork should animate by assigning unique css properties
function setStyleProperties(container) {

    // Get coordinates of parent and container data 
    let parent = container.parent();
    let parentTop = parent.offset().top;
    let parentLeft = parent.offset().left;
    let parentRight = parentLeft + parent.width();
    let parentMidV = parent.width() / 2;
    let height = container.height();
    let width = container.width();
    let top = $(container).position().top;
    let left = $(container).position().left;
    let right = left + width;

    // Absolute values relative to the screen
    let absoluteBot = $(window).height() - top - height;
    let absoluteRight = $(window).width() - left - width;

    // Creating the css data 
    let cssTopLeft = { top: top, left: left, position: 'absolute' };
    let cssBotLeft = { bottom: absoluteBot, left: left, position: 'absolute' };
    let cssTopRight = { top: top, right: absoluteRight, position: 'absolute' };
    let cssBotRight = { bottom: absoluteBot, right: absoluteRight, position: 'absolute' };
    let cssZero = { top: 0, left: 0, position: 'relative' };

    // Apply generic css properties
    container.css({ height: height, width: width });

    // Apply specific css properties
    if (parseInt(left) == parseInt(parentLeft) && parseInt(right) == parseInt(parentRight)) {
        container.css(cssZero);
    } else if (parseInt(top) == parseInt(parentTop)) {
        if (left > parentMidV || parseInt(right) == parseInt(parentRight)) {
            container.css(cssTopRight);
        } else {
            container.css(cssTopLeft);
        }
    } else {
        if (left > parentMidV || parseInt(right) == parseInt(parentRight)) {
            container.css(cssBotRight);
        } else {
            container.css(cssBotLeft);
        }
    }
}

// Allows the user to copy a text of the artwork
function initializeShareLogic(database) {
    console.log('Added logic');
    $('.fa-share').click(function () {
        console.log('Share was clicked!')
        let artParent = $(this).parents('.container')
        let art = artParent.find(".artwork")

        // If artwork exists
        if (art.length != 0) {

            // Get artwork ID and its number 
            let id = art.attr('id');
            let artNumber = id.split('-')[1] - 1;

            // Check if element is a poem or not
            let isPoem = $(artParent).find('div.poemLines').length == 1;
            if (isPoem) { // Handle poem
                // Swap the metObject with the one from database if needed
                let poemObject;
                if (database) {
                    poemObject = databaseData[artNumber + 1];
                } else {
                    poemObject = poems[artNumber];
                }

                // Copy message to clipboard
                let poemLines = ''
                for (let x = 0; x < 7; x++) {
                    poemLines += poemObject.lines[x] + '\n';
                }

                let author = '';
                if (poemObject.author == undefined) {
                    author = 'Unknown'
                } else {
                    author = poemObject.author;
                }
                let clipboard = `Here's a poem I found on Odyssey and thought you might enjoy. \nIt's called: ${poemObject.title} \nBy: ${author} \n\nThis are the first couple of lines from it:\n\n${poemLines}\n`;

                navigator.clipboard.writeText(clipboard);

                // Announce that message was copied
                popUpAnimForButtons(this);

            } else { // Handle art
                // Swap the metObject with the one from database if needed
                let metObject;
                if (database) {
                    metObject = databaseData[artNumber + 1];
                } else {
                    metObject = artworkObjects[artNumber];
                }

                // Copy message to clipboard
                let artist = '';
                if (metObject.artist == undefined) {
                    artist = 'Unknown'
                } else {
                    artist = metObject.artist;
                }
                let clipboard = `Here's an artwork I found and thought you might enjoy.\nIt's called: ${metObject.title}\nBy: ${artist}\nLink to the image: ${metObject.image}`;
                navigator.clipboard.writeText(clipboard);

                // Announce that message was copied
                popUpAnimForButtons(this);
            }
        }
    });
}

// Display 'Copy to clipboard' animation
function popUpAnimForButtons(element) {
    let announce;
    let shareClicked = $(element).hasClass('fa-share');
    if (shareClicked) {
        announce = $('<div id="popUp"><h3 id="popUpText">Art saved to clipboard!<h3></div>');
    } else {
        announce = $('<div id="popUp"><h3 id="popUpText">Art saved to profile!<h3></div>');
    }

    // Check if icon is inside extension
    let insideExtension = $(element).parent('#iconContainer').length != 0;
    // Set the properties depending where the share button resides 
    if (insideExtension) {
        if (shareClicked) {
            $(announce).css({
                'top': '27vh',
                'left': '-45px'
            });
        } else {
            $(announce).css({
                'top': '21vh',
                'left': '-45px'
            });
        }
    } else {
        $(announce).css({
            'top': '-2.5vh',
            'left': '-55px'
        });
    }

    // Add element, animate it, and remove it
    $(element).append(announce);
    gsap.timeline().to($(announce), 1, {
        y: -vh(2),
        autoAlpha: 1,
        ease: 'elastic.out(1.5, 0.5)'
    })
        .to($(announce), .5, {
            delay: .2,
            autoAlpha: 0,
            ease: 'power1.inOut'
        })
        .add(() => { $(announce).remove(); });
}

// Allows the user to add an artwork to their profile 
function initializeAddRemoveLogic(database) {
    $('.addArtwork').click(function () {
        let result = returnArtObject(this);

        // Display animation
        popUpAnimForButtons(this)
        // Send data to DB
        sendChosenArtwork(result);
    });

    $('.removeArtwork').click(function () {
        let result = returnArtObject(this);

        // Display animation
        popUpAnimForButtons(this);
        // Remove data to DB
        removeChosenArtwork(result);
    });

    // Return if it's a poem and the art object itself
    function returnArtObject(element) {
        let artParent = $(element).parents('.container')
        let art = artParent.find(".artwork")

        // If artwork exists
        if (art.length != 0) {

            // Get artwork ID and its number 
            let id = art.attr('id');
            let artNumber = id.split('-')[1] - 1;

            // Check if element is a poem or not
            let isPoem = $(artParent).find('div.poemLines').length == 1;
            if (isPoem) { // Handle poem
                // Swap the poemObject with the one from database if needed
                let poemObject;
                if (database) {
                    poemObject = databaseData[artNumber + 1];
                } else {
                    poemObject = poems[artNumber];
                }
                // Swap the metObject with the one from database if needed
                return [isPoem, poemObject];
            } else { // Handle art
                // Swap the metObject with the one from database if needed
                let metObject;
                if (database) {
                    metObject = databaseData[artNumber + 1];
                } else {
                    metObject = artworkObjects[artNumber];
                }
                return [isPoem, metObject];
            }
        }
    }
}

function updateDatabaseData(newData) {}

function JSON_transformator_helper(input) {}

function sendChosenArtwork(result) {}

function removeChosenArtwork(result) {}