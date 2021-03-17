function initializePresentation(parameters) {

    var startTimestampMilliseconds = undefined;
    var accumulatedTimeMilliseconds = undefined;
    function currentTime() {
        if(typeof startTimestampMilliseconds === 'undefined') {
            return accumulatedTimeMilliseconds/1000;
        } else {
            return (accumulatedTimeMilliseconds + performance.now() - startTimestampMilliseconds)/1000;
        }
    }
    function pauseTimer() {
        accumulatedTimeMilliseconds =
            accumulatedTimeMilliseconds + performance.now() - startTimestampMilliseconds;
        startTimestampMilliseconds = undefined;
    }
    function startTimer() {
        startTimestampMilliseconds = performance.now();
    }

    function wrapNode(id, node) {
        const element = document.createElement("div");
        element.id = id;
        element.appendChild(node);
        return element;
    }

    function textNode(text) {
        const element = document.createTextNode(text)
        return element;
    }

    function linkNode(link, text) {
        const element = document.createElement("a");
        element.text = text;
        element.setAttribute("href", link);
        return element;
    }

    const svgElement = name => document.createElementNS('http://www.w3.org/2000/svg', name);

    function arrowNode(xScale) {
        const element = svgElement('svg');
        element.setAttribute("width", 20);
        element.setAttribute("height", 20);
        element.setAttribute("viewBox", "-50 -50 100 100");

        const arrow = svgElement('g');
        arrow.setAttribute("transform", `scale(${xScale} 1)`);

        const polygon = svgElement('polygon');
        polygon.setAttribute("points", "-45,-45 -45,45, 45,0");
        polygon.setAttribute("style", "fill:rgb(100,100,100);stroke:black;stroke-width:5");

        arrow.appendChild(polygon);
        element.appendChild(arrow)

        return element;
    }

    function leftArrowNode(request) {
        return arrowNode(-1);
    }

    function rightArrowNode(request) {
        return arrowNode(1);
    }

    function navigationNode(requests) {
        const element = document.createElement("div");
        element.id = "navigation";

        const leftArrow = leftArrowNode();
        const rightArrow = rightArrowNode();
        var leftNode = wrapNode("navigation-left", leftArrow);
        var rightNode = wrapNode("navigation-right", rightArrow);

        leftArrow.addEventListener("click", requests.previous);
        rightArrow.addEventListener("click", requests.next);

        function append(node) {
            node.setAttribute("class", "navigation-item");
            element.appendChild(node);
        }

        var indexText = wrapNode("navigation-index", textNode(""));
        indexText.setAttribute("style", "width: 40px; text-align:right");
        var highIndexText = wrapNode("navigation-index-high", textNode(""));
        append(indexText);
        append(leftNode);
        append(rightNode);
        append(highIndexText);

        return {
            element: element,
            commands: {
                set: (state) => {
                    indexText.innerHTML = state.index;
                    highIndexText.innerHTML = state.highIndex;
                },
            },
        };
    }

    function authorNode(author) {
        const element = document.createElement("div");
        element.id = "author";

        const name = wrapNode("author-name", textNode(author.name));
        const email = wrapNode("author-email", linkNode(`mailto:${author.email}`, author.email));

        element.appendChild(name);
        element.appendChild(email);

        return element;
    }

    function headerNode(parameters, requests) {
        const element = document.createElement("div");
        element.id = "header";

        const titleNode = wrapNode("header-title", textNode(parameters.title));

        const navigation = navigationNode(requests);

        element.appendChild(navigation.element);
        element.appendChild(titleNode);
        element.appendChild(wrapNode("author-container", authorNode(parameters.author)));
        return {
            element: element,
            commands: {
                set: navigation.commands.set,
            },
        };
    }

    function slideNode() {
        const element = document.createElement("div");
        element.id = "slide";

        return {
            "element": element,
            "commands": {
                set: (content) => {
                    element.innerHTML = "";
                    element.appendChild(content);
                },
            },
        };
    }

    function timerNode(timegroups) {
        const element = svgElement('svg');
        element.setAttribute("width", "100%");
        element.setAttribute("viewBox", "0 0 1000 10");
        element.setAttribute("style", "position:absolute; bottom:0; left:0");
        const pausedColor = [0.8, 0.8, 0.3];
        const runningColor = [0.4, 0.8, 0.4];
        var durationBox;

        function setRunning(running) {
            var color = pausedColor;
            if(running) {
                color = runningColor;
            }
            var c = [255*color[0], 255*color[1], 255*color[2]];
            durationBox.setAttribute(
                "style",
                `fill:rgb(${c[0]}, ${c[1]}, ${c[2]}); stroke:none`
            );
        }

        function setSlideIndex(time, highlightedSlideIndex, running) {
            element.innerHTML = "";
            var totalDuration = 0;
            for(var groupIndex=0; groupIndex < timegroups.length; groupIndex++) {
                const group = timegroups[groupIndex];
                totalDuration += group.duration;
            }
            var currentDuration = 0;
            var runningSlideIndex = 0;
            for(var groupIndex=0; groupIndex < timegroups.length; groupIndex++) {
                const group = timegroups[groupIndex];
                const slideCount = group.slideCount;

                const slideBox = svgElement('rect');
                slideBox.setAttribute("width",
                                      `${100*group.duration/totalDuration}%`);
                slideBox.setAttribute("height", "50%");
                shade = (0.3)*(1 + 1.5*(groupIndex%2));
                color = [shade, shade, shade];
                c = [255*color[0], 255*color[1], 255*color[2]];
                slideBox.setAttribute("style",
                                      `fill:rgb(${c[0]}, ${c[1]}, ${c[2]}); stroke:none`);
                slideBox.setAttribute("y", "0%");
                const x = currentDuration/totalDuration;
                slideBox.setAttribute("x", `${100*x}%`);
                element.appendChild(slideBox);

                for(var slideIndex = 0; slideIndex < slideCount; slideIndex++) {
                    if(runningSlideIndex === highlightedSlideIndex) {
                        const slideBox = svgElement('rect');
                        slideBox.setAttribute("width",
                                              `${100*group.duration/slideCount/totalDuration}%`);
                        slideBox.setAttribute("height", "20%");
                        shade = (0.3)*(1 + 1.5*(groupIndex%2));
                        color = [shade, shade, shade];
                        color = [1.0,0,0];
                        c = [255*color[0], 255*color[1], 255*color[2]];
                        slideBox.setAttribute("style",
                                              `fill:rgb(${c[0]}, ${c[1]}, ${c[2]}); stroke:none`);
                        slideBox.setAttribute("y", "15%");
                        const x =
                              currentDuration/totalDuration +
                              group.duration*slideIndex/slideCount/totalDuration;
                        slideBox.setAttribute("x", `${100*x}%`);
                        element.appendChild(slideBox);
                    }
                    runningSlideIndex++;
                }
                currentDuration += group.duration;
            }

            durationBox = svgElement('rect');
            durationBox.setAttribute("width", `${100*time/totalDuration}%`);
            durationBox.setAttribute("y", "50%");
            durationBox.setAttribute("height", "50%");
            setRunning(running);
            element.appendChild(durationBox);
        }

        return {
            element: element,
            commands: {
                set: setSlideIndex,
            },
        };
    }

    function presentationNode(parameters) {
        const element = document.createElement("div");
        element.id = "presentation"
        var slideIndex = 1;
        const slide = slideNode();
        var header;
        const timer = timerNode(parameters.timegroups);
        var timerInterval = undefined;
        function timerPaused() {
            return typeof timerInterval === 'undefined';
        }

        const next = () => {
            slideIndex = Math.max(1, Math.min(parameters.slideCount, slideIndex + 1));
            slide.commands.set(parameters.slide(slideIndex));
            header.commands.set({index: slideIndex, highIndex: parameters.slideCount});
            timer.commands.set(currentTime(), slideIndex-1, !timerPaused());
            MathJax.typesetPromise();
        };
        const previous = () => {
            slideIndex = Math.max(1, Math.min(parameters.slideCount, slideIndex - 1));
            slide.commands.set(parameters.slide(slideIndex));
            header.commands.set({index: slideIndex, highIndex: parameters.slideCount});
            timer.commands.set(currentTime(), slideIndex-1, !timerPaused());
            MathJax.typesetPromise();
        };
        const requests = {
            "next": next,
            "previous": previous,
        };
        header = headerNode(parameters, requests);

        element.appendChild(header.element);
        element.appendChild(timer.element);
        element.appendChild(slide.element);

        slide.commands.set(parameters.slide(slideIndex));
        header.commands.set({index: slideIndex, highIndex: parameters.slideCount});
        timer.commands.set(currentTime(), slideIndex-1, false);

        return {
            element: element,
            commands: {
                next: next,
                previous: previous,
                toggleTimer: () => {
                    if(timerPaused()) {
                        const intervalMilliseconds = 66;
                        startTimer();
                        timer.commands.set(currentTime(), slideIndex-1, true);
                        timerInterval = setInterval(function(){
                            timer.commands.set(currentTime(), slideIndex-1, true);
                        }, intervalMilliseconds);
                    } else {
                        timer.commands.set(currentTime(), slideIndex-1, false);
                        clearInterval(timerInterval);
                        timerInterval = undefined;
                        pauseTimer();
                    }
                },
            },
        };
    }

    document.title = `${parameters.title}`;

    function onStart(timestampMilliseconds) {
        accumulatedTimeMilliseconds = 0;
        startTimer();
        const presentation = presentationNode(parameters);
        document.onkeydown = (event) => {
            const leftKeyCode = '37';
            const rightKeyCode = '39';
            const spaceKeyCode = '32';
            if (event.keyCode == leftKeyCode) {
                presentation.commands.previous();
            } else if (event.keyCode == rightKeyCode) {
                presentation.commands.next();
            } else if (event.keyCode == spaceKeyCode) {
                presentation.commands.toggleTimer();
            }
        };
        document.body.innerHTML = "";
        document.body.appendChild(presentation.element);
        presentation.commands.toggleTimer();
        MathJax.typesetPromise();
    }

    function frontPageNode(totalDuration) {
        const element = document.createElement('center');

        const details = document.createElement('table');
        details.setAttribute("class", "front-page");
        details.innerHTML = `<tr><td><b>Event:</b></td><td>${parameters.occasion}</td></tr><tr><td><b>Title:</b></td><td>${parameters.title}</td></tr><tr><td><b>Duration:</b></td><td>${Math.floor(totalDuration/60)}:${("00" + (totalDuration % 60)).slice(-2)}</td></tr><tr><td><b>Speaker:</b></td><td>${parameters.author.name}</td></tr>`;

        element.appendChild(parameters.frontPageImage);
        element.appendChild(details);
        return element;
    }

    function holdUntilStart(timegroups) {
        var totalDuration = 0;
        for(var timegroup of timegroups) {
            totalDuration += timegroup.duration;
        }
        document.onkeydown = (event) => {
            const rightKeyCode = '39';
            if (event.keyCode == rightKeyCode) {
                onStart();
            }
        };
        document.innerHTML = "";
        document.body.appendChild(frontPageNode(totalDuration));
        MathJax.typesetPromise();
    }

    holdUntilStart(parameters.timegroups);
}
