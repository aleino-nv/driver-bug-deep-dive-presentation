function deepDivePresentation() {

    const angleBugURL = "http://anglebug.com/4821";
    const angleProjectURL = "https://github.com/google/angle";
    const testURL = "https://chromium-review.googlesource.com/c/angle/angle/+/2278713/21/src/tests/gl_tests/MipmapTest.cpp#624";
    const angleBugImageFileName = "anglebug-4821.png";
    const presenterFileName = "anders_leino.jpg";
    const webGLLogoFileName = "webgl_logo.svg";
    const nvidiaLogoFileName = "nvidia_logo.png";
    const svgElement = name => document.createElementNS('http://www.w3.org/2000/svg', name);
    const mathElement = name => document.createElementNS('http://www.w3.org/1998/Math/MathML', name);

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

    function textLinkNode(link) {
        return linkNode(link, link);
    }

    function imageNode(fileName, style) {
        const element = document.createElement("img");
        element.src = fileName;
        if(typeof style !== 'undefined') {
            element.setAttribute("style", style);
        }
        return element;
    }

    function isIterable(obj) {
        if (obj == null) {
            return false;
        }
        return typeof obj[Symbol.iterator] === 'function';
    }

    function iterable(obj) {
        if(isIterable(obj)) {
            return obj;
        } else {
            return [obj];
        }
    }

    function genericListNode(n) {
        if(typeof n === 'string') {
            return textNode(n);
        } else if(typeof n === 'function') {
            return n();
        } else {
            return n;
        }
    }

    function orderedListNode(itemNodes) {
        const element = document.createElement("ol");
        for(const itemNode of itemNodes) {
            const itemNodeNode = document.createElement("li");
            for(const n of iterable(itemNode)) {
                itemNodeNode.appendChild(genericListNode(n));
            }
            element.appendChild(itemNodeNode);
        }
        return element;
    }

    function unorderedListNode(itemNodes, hotItemCount) {
        const element = document.createElement("ul");
        for(var itemNodeIndex=0; itemNodeIndex < itemNodes.length; itemNodeIndex++) {
            const itemNode = itemNodes[itemNodeIndex];
            const itemNodeNode = document.createElement("li");
            if(itemNodeIndex < (itemNodes.length - hotItemCount)) {
                itemNodeNode.setAttribute("class", "old-item");
            }
            for(const n of iterable(itemNode)) {
                itemNodeNode.appendChild(genericListNode(n));
            }
            element.appendChild(itemNodeNode);
        }
        return element;
    }


    function pixels(resolution, pixelDimension, pixelColor) {

        const element = svgElement('g');

        const horizontalPixelCount = resolution[0];
        const verticalPixelCount = resolution[1];

        const gridDimensionX = horizontalPixelCount*pixelDimension;
        const gridDimensionY = verticalPixelCount*pixelDimension;

        function grid(dimension, pixelCount) {
            const grid = svgElement('g');

            const sliceCount = pixelCount + 1;
            for(var sliceIndex = 0; sliceIndex < sliceCount; sliceIndex++) {

                const sliceX = -pixelDimension*(sliceCount-1)/2 + pixelDimension*sliceIndex;
                const line = svgElement('line');
                line.setAttribute("x1", sliceX);
                line.setAttribute("y1", -dimension/2);
                line.setAttribute("x2", sliceX);
                line.setAttribute("y2", dimension/2);
                line.setAttribute("style", "stroke:rgb(0,0,0);stroke-width:0.5");

                grid.appendChild(line);

            }
            return grid;
        }

        const verticalGrid = svgElement('g');
        verticalGrid.setAttribute("transform", "matrix(0 1 1 0 0 0)");
        verticalGrid.appendChild(grid(gridDimensionX, verticalPixelCount));

        const horizontalGrid = svgElement('g');
        horizontalGrid.setAttribute("transform", "matrix(1 0 0 1 0 0)");
        horizontalGrid.appendChild(grid(gridDimensionY, horizontalPixelCount));

        if(typeof pixelColor !== 'undefined') {
            const pixelColors = svgElement('g');
            for(var rowIndex = 0; rowIndex < resolution[1]; rowIndex++) {
                for(var columnIndex = 0; columnIndex < resolution[0]; columnIndex++) {
                    const pixel = svgElement('rect');
                    const pc = pixelColor([columnIndex, rowIndex]);
                    const c = [255*pc[0], 255*pc[1], 255*pc[2]];
                    pixel.setAttribute("style", `fill:rgb(${c[0]}, ${c[1]}, ${c[2]})`);
                    pixel.setAttribute("width", `${pixelDimension}`);
                    pixel.setAttribute("height", `${pixelDimension}`);
                    const position = [-gridDimensionX/2 + pixelDimension*columnIndex,
                                      -gridDimensionY/2 + pixelDimension*rowIndex];
                    pixel.setAttribute("transform", `translate(${position[0]} ${position[1]})`);
                    pixelColors.appendChild(pixel);
                }
            }

            element.appendChild(pixelColors);
        }

        element.appendChild(verticalGrid)
        element.appendChild(horizontalGrid)

        return element;

    }

    function text(message, anchor, color, subscript) {
        const element = svgElement('text');
        element.appendChild(textNode(message));
        element.setAttribute("text-anchor", anchor);
        if(typeof color !== 'undefined') {
            element.setAttribute("fill", color);
        }
        if(typeof subscript !== 'undefined') {
            const subscriptElement = svgElement('tspan');
            subscriptElement.setAttribute("baseline-shift", "sub");
            subscriptElement.innerHTML = subscript;
            subscriptElement.setAttribute("style", "font-size: 3px");
            element.appendChild(subscriptElement);
        }
        return element;
    }

    function add(parent, child, transform) {
        parent.appendChild(child);
        if(typeof transform !== 'undefined') {
            child.setAttribute("transform", transform);
        }
    }

    const testTextureColor = [35/255, 81/255, 184/255];

    function mipMap(pixelDimension, baseLevelDimension, pixelColor, levelCount) {
        const element = svgElement('g');
        var levelIndex = 0;
        var leftMarginX = -(baseLevelDimension*pixelDimension/2 + pixelDimension*0.5);
        while(true) {
            if(typeof levelCount !== 'undefined' && levelIndex == levelCount) {
                break;
            }
            const levelDimension = Math.max(1, Math.floor(baseLevelDimension/Math.pow(2, levelIndex)));
            const levelY = pixelDimension*1.5*levelIndex;
            add(element, pixels([levelDimension, 1], pixelDimension, pixelColor), `translate(0 ${levelY})`);
            add(element, text("" + levelIndex, "end"), `translate(${leftMarginX} ${levelY + 1.5})`);
            if(levelDimension == 1) {
                break;
            }
            levelIndex++;
        }
        return element;
    }

    function mipMapping(pixelDimension, baseLevelDimension, components) {
        const element = svgElement('g');
        var mappingColor = (i) => {
            const colors = [
                [0.5,0.5,0.5],
                [0.8,0.8,0.8],
            ];
            return colors[i%colors.length];
        };
        if(components.mappingColor) {
            mappingColor = components.mappingColor;
        }
        const k = Math.floor(baseLevelDimension/2);
        function polygon(index) {
            const p = svgElement('polygon');
            const upLoX = -pixelDimension*baseLevelDimension/2 + (2+1/k)*pixelDimension*index;
            const upHiX = upLoX + (2 + 1/k)*pixelDimension;
            const upHiY = -pixelDimension/2;
            const upLoY = pixelDimension/2;
            const downLoX = (-k/2+index)*pixelDimension;
            const downHiX = downLoX + pixelDimension;
            const downLoY = 2*pixelDimension;
            const downHiY = pixelDimension;
            const points = [
                [upLoX, upHiY],
                [upHiX, upHiY],
                [upHiX, upLoY],
                [downHiX, downHiY],
                [downHiX, downLoY],
                [downLoX, downLoY],
                [downLoX, downHiY],
                [upLoX, upLoY],
            ];
            var pointString = "";
            for(const point of points) {
                pointString += `${point[0]},${point[1]} `;
            }
            p.setAttribute("points", pointString);
            const pc = mappingColor(index);
            var pcString = "none";
            if(typeof pc !== 'undefined') {
                const c = [255*pc[0], 255*pc[1], 255*pc[2]];
                pcString = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
            }
            p.setAttribute("style", `fill:${pcString}`);
            return p;
        }

        for(var i = 0; i < k; i++) {
            add(element, polygon(i));
        }

        if(components.weights) {
            for(var i = 0; i < k; i++) {

                const ws = [1-(1/k)*i, 1, 1/k*(i+1)];
                const offs = [0, 1-(1/k)*i, 2-(1/k)*i];
                for(var j = 0; j < 3; j++) {
                    if(components.weights(i,j,k)) {
                        const x =
                              -pixelDimension*baseLevelDimension/2 + (i*(2 + 1/k) + offs[j])*
                              pixelDimension;
                        const y = -pixelDimension/2;
                        const weightColors = [
                            [0.3, 0.1, 0.1],
                            [0.1, 0.3, 0.1],
                            [0.1, 0.1, 0.3],
                            [0.9, 0.5, 0.5],
                            [0.5, 0.9, 0.5],
                            [0.5, 0.5, 0.9],
                        ];
                        const w = ws[j]*pixelDimension;
                        const h = pixelDimension;
                        add(element, rectangle(w, h, weightColors[(3*i+j)%6]), `translate(${x} ${y})`);
                    }
                }
            }
        }

        if(components.guideLines) {
            const leftMarginX = -pixelDimension*baseLevelDimension/2;
            const yLo = 0;
            const yHiLo = -pixelDimension*1;
            const yHiHi = -pixelDimension*1 - 5;
            const xLo = leftMarginX + (2+1/k)*pixelDimension*components.guideLines.index;
            const xHi = xLo + (2 + 1/k)*pixelDimension;
            const xFudge = xHi - 2;
            if(components.guideLines.colors[0] && components.guideLines.index > 0) {
                add(element, arrow(
                    [
                        [leftMarginX, yLo],
                        [leftMarginX, yHiLo],
                        [xLo, yHiLo],
                    ]
                ));
            }
            if(components.guideLines.colors[1]) {
                add(element, arrow(
                    [
                        [leftMarginX, yLo],
                        [leftMarginX, yHiHi],
                        [xHi, yHiHi],
                    ]
                ));
            }
            if(components.guideLines.colors[2]) {
                add(element, arrow(
                    [
                        [leftMarginX, yLo],
                        [leftMarginX, yHiLo],
                        [xFudge, yHiLo],
                    ]
                ));
            }
            const y = pixelDimension*0.5;
            const pointses = [
                [
                    [xLo, y],
                    [xLo, yHiLo]
                ],
                [
                    [xHi, y],
                    [xHi, yHiHi]
                ],
                [
                    [xFudge, y],
                    [xFudge, yHiLo]
                ]
            ];
            for(var guideLineIndex = 0; guideLineIndex < 3; guideLineIndex++) {
                const guideLine = svgElement('polyline');
                const points = pointses[guideLineIndex];
                var pointString = "";
                for(var i = 0; i < 2; i++) {
                    var point = points[i];
                    pointString += `${point[0]},${point[1]} `;
                }
                guideLine.setAttribute("points", pointString);
                var col = components.guideLines.colors[guideLineIndex];
                if(components.guideLines.index == 0 && guideLineIndex == 0) {
                    col = undefined;
                }
                if(typeof col !== 'undefined') {
                    const c = [255*col[0], 255*col[1], 255*col[2]];
                    guideLine.setAttribute(
                        "style", `fill:none; stroke:rgb(${c[0]},${c[1]},${c[2]});stroke-width:0.3;`
                    );
                    add(element, guideLine);
                }
            }
            const textOffsetX = 1;
            const textOffsetY = -1;
            if(components.guideLines.colors[0] && components.guideLines.index > 0) {
                add(element, text("x", "end", undefined, "0"), `translate(${leftMarginX-textOffsetX} ${yHiLo+textOffsetY})`);
            }
            if(components.guideLines.colors[1]) {
                add(element, text("x", "end", undefined, "1"), `translate(${leftMarginX-textOffsetX} ${yHiHi+textOffsetY})`);
            }
            if(components.guideLines.colors[2]) {
                var t = text("x", "end", undefined, "1");
                t.innerHTML += "-fudge";
                add(element, t,
                    `translate(${leftMarginX-textOffsetX} ${yHiLo+textOffsetY})`);
            }
        }

        return element;
    }

    function errorPattern(pixelDimension, resolution, pixelColor) {
        const element = svgElement('g');
        add(element, pixels(resolution, pixelDimension, pixelColor), `translate(0 -25)`);
        return element;
    }

    function weights(components, wide) {
        const element = svgElement('g');
        const resolution = [4, 1];
        var pixelDimension = 10;
        const pixelColor = () => [1,1,1];
        var baseLevelDimension = 9;
        if(wide) {
            pixelDimension = 6;
            baseLevelDimension = 15;
        }
        const yBase = -30;
        if(components.mapping) {
            add(element, mipMapping(pixelDimension, baseLevelDimension, components.mapping), `translate(0 ${yBase})`);
        }
        add(element, mipMap(pixelDimension, baseLevelDimension, undefined, 2), `translate(0 ${yBase})`);
        return element;
    }

    function length(v) {
        return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
    }

    function normalized(v) {
        const lengthV = length(v);
        return [v[0]/lengthV, v[1]/lengthV];
    }

    function arrow(points, color) {
        console.assert(points.length >= 2);

        if(typeof color === 'undefined') {
            color = "black";
        }
        const nextToLastPoint = points[points.length-2];
        const lastPoint = points[points.length-1];
        var a = normalized([lastPoint[0] - nextToLastPoint[0], lastPoint[1] - nextToLastPoint[1]]);

        const element = svgElement('g');

        const head = svgElement('polygon');
        head.setAttribute("points", "0,-1 0,1, 1,0");
        head.setAttribute("style", `fill:${color};`);
        var headTransform = `translate(${lastPoint[0]-a[0]} ${lastPoint[1]-a[1]}) matrix(${a[0]} ${a[1]} ${-a[1]} ${a[0]} 0 0)`;
        head.setAttribute("transform", headTransform);

        const tail = svgElement('polyline');
        var pointString = "";
        for(var i = 0; i < points.length; i++) {
            var point = points[i];
            if(i == points.length-1) {
                point[0] = point[0] - a[0];
                point[1] = point[1] - a[1];
            }
            pointString += `${point[0]},${point[1]} `;
        }
        tail.setAttribute("points", pointString);

        tail.setAttribute("style", `fill:none; stroke:${color};stroke-width:0.5;`);


        element.appendChild(head);
        element.appendChild(tail);

        return element;
    }

    function mipMapArrows(pixelDimension, baseLevelDimension, colors) {
        const element = svgElement('g');
        var levelIndex = 1;
        var rightMarginX = baseLevelDimension*pixelDimension/2;
        while(true) {
            const levelDimension = Math.max(1, Math.floor(baseLevelDimension/Math.pow(2, levelIndex)));
            const levelY = pixelDimension*1.5*levelIndex;
            const color = colors[levelIndex];
            if(typeof color !== 'undefined') {
                add(element, arrow(
                    [
                        [rightMarginX, 0],
                        [rightMarginX + pixelDimension*0.5*levelIndex, 0],
                        [rightMarginX + pixelDimension*0.5*levelIndex, levelY],
                        [levelDimension*pixelDimension/2 + pixelDimension*0.5, levelY],
                    ],
                    color
                ), `translate(0 0)`);
            }
            if(levelDimension == 1) {
                break;
            }
            levelIndex++;
        }
        return element;
    }

    function rectangle(width, height, fillColor, strokeColor) {
        const element = svgElement('rect');
        element.setAttribute("width", width);
        element.setAttribute("height", height);
        var fillColorString = "none";
        if(typeof fillColor !== 'undefined') {
            const c = [255*fillColor[0], 255*fillColor[1], 255*fillColor[2]];
            fillColorString = `rgb(${c[0]},${c[1]},${c[2]})`;
        }
        var strokeColorString = "none";
        if(typeof strokeColor !== 'undefined') {
            const c = [255*strokeColor[0], 255*strokeColor[1], 255*strokeColor[2]];
            strokeColorString = `rgb(${c[0]},${c[1]},${c[2]})`;
        }
        element.setAttribute("style", `fill:${fillColorString}; stroke:${strokeColorString};stroke-width:0.5;`);
        return element;
    }

    var baseLevelDimension = Math.pow(2, 3)-1;
    const levelCount = Math.ceil(Math.log2(baseLevelDimension));

    function dataFlow(components, mipArrowColors) {
        const element = svgElement('g');
        var pixelDimension = 3;
        const mipMapWidth = (3 + baseLevelDimension + 0.5*levelCount)*pixelDimension;
        const mipMapHeight = pixelDimension * (levelCount*1.5 + 0.5);
        const mipMapBottomY = -45-pixelDimension + mipMapHeight;
        const shaderY = mipMapBottomY + 10;
        const framebufferY = shaderY + 12;
        if(components.mipMap) {
            add(element, mipMap(pixelDimension, baseLevelDimension, () => testTextureColor), "translate(0 -45)");
            add(element, mipMapArrows(pixelDimension, baseLevelDimension, mipArrowColors), "translate(0 -45)");
            const fillColor = undefined;
            const strokeColor = [0, 0, 0];
            add(element, rectangle(mipMapWidth, mipMapHeight, fillColor, strokeColor),
                `translate(${-mipMapWidth/2} ${-45-pixelDimension})`);
        }
        if(typeof components.textureRead !== 'undefined') {
            add(element, arrow([
                [0, mipMapBottomY],
                [0, shaderY - 5],
            ], components.textureRead), "translate(0 0)");
        }
        if(components.shader) {
            add(element, text("Fragment shader", "middle"), `translate(0 ${shaderY})`);
        }
        if(typeof components.framebufferWrite !== 'undefined') {
            add(element, arrow([
                [0, shaderY+2],
                [0, framebufferY-5],
            ], components.framebufferWrite), "translate(0 0)");
        }
        if(components.framebuffer) {
            add(element, text("Framebuffer", "middle"), `translate(0 ${framebufferY})`);
        }
        return element;
    }

    function diagramNode(svg) {
        const element = svgElement('svg');
        element.setAttribute("width", 1000);
        element.setAttribute("height", 800);
        element.setAttribute("viewBox", "-50 -50 100 100");
        element.setAttribute("class", "diagram");

        element.appendChild(svg);

        return element;
    }

    function blackBox(observerText, boxText) {
        var element = svgElement('g');
        const color = [0,0,0];
        const boxDimension = 40;
        const observerX = -boxDimension*.5;
        const observerY = boxDimension*0.5;
        const topY = -boxDimension*0.25;
        const bottomY = boxDimension*1.25;
        const middleY = boxDimension*0.5;
        const leftX = -boxDimension*0.5;
        const rightX = boxDimension*1.5;
        add(element, rectangle(boxDimension, boxDimension, color));
        add(element, text(observerText, "middle"), `translate(${observerX} ${observerY})`);
        add(element, arrow(
            [
                [boxDimension*0.5, 0],
                [boxDimension*0.5, topY],
                [observerX, topY],
                [observerX, observerY-4],
            ]
        ));
        add(element, arrow(
            [
                [observerX, observerY+2],
                [observerX, bottomY],
                [boxDimension*0.5, bottomY],
                [boxDimension*0.5, boxDimension+1],
            ]
        ));
        add(element, text(boxText, "middle", "rgb(255 255 255)"), `translate(${boxDimension*0.5} ${boxDimension*0.5})`);
        return element;
    }

    const bugIntroductionFootnotes = () => [textLinkNode(testURL)];

    const newANGLETestCodeLines = [
        "// This test generates mipmaps for an elongated npot texture with the maximum number of mips and",
        "// ensures all mips are generated.",
        "TEST_P(MipmapTestES3, GenerateMipmapLongNPOTTexture)",
        "{",
        "    // Imprecisions in the result.  http://anglebug.com/4821",
        "    ANGLE_SKIP_TEST_IF(IsNVIDIA() && IsOpenGL());",
        "",
        "    GLint #0|maxTextureWidth# = 32767;",
        "    glGetIntegerv(GL_MAX_TEXTURE_SIZE, &#0|maxTextureWidth#);",
        "",
        "    constexpr uint32_t kTextureHeight = 43;",
        "    const uint32_t #5|kTextureWidth#      = #2|maxTextureWidth - 1#;  // -1 to #5|make the width NPOT#",
        "",
        "    #3|const std::vector<GLColor> kInitialColor(kTextureWidth * kTextureHeight,",
        "                                             GLColor(35, 81, 184, 211));#",
        "",
        "    #4|// Create the texture.",
        "    glBindTexture(GL_TEXTURE_2D, mTexture);",
        "    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, kTextureWidth, kTextureHeight, 0, GL_RGBA,",
        "                 GL_UNSIGNED_BYTE, kInitialColor.data());#",
        "",
        "    // Then generate the mips.",
        "    #1|glGenerateMipmap(GL_TEXTURE_2D);#",
        "    ASSERT_GL_NO_ERROR();",
        "",
        "    // Enable mipmaps.",
        "    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST_MIPMAP_NEAREST);",
        "",
        "    // Verify that every mip is correct.",
        "    #6|verifyAllMips(kTextureWidth, kTextureHeight, kInitialColor[0]);#",
        "}",
    ];

    const verifyMipsCodeLines = [
        "void verifyAllMips(const uint32_t textureWidth,",
        "                   const uint32_t textureHeight,",
        "                   const GLColor &color)",
        "{",
        "    #0|ANGLE_GL_PROGRAM(program, essl3_shaders::vs::Texture2DLod(),",
        "                     essl3_shaders::fs::Texture2DLod());",
        "    glUseProgram(program);",
        "    const GLint textureLoc = glGetUniformLocation(program, essl3_shaders::Texture2DUniform());",
        "    const GLint lodLoc     = glGetUniformLocation(program, essl3_shaders::LodUniform());",
        "    ASSERT_NE(-1, textureLoc);",
        "    ASSERT_NE(-1, lodLoc);",
        "    glUniform1i(textureLoc, 0);#",
        "",
        "    // Verify that every mip is correct.",
        "    const int w = getWindowWidth() - 1;",
        "    const int h = getWindowHeight() - 1;",
        "    #1|for (uint32_t mip = 0; textureWidth >> mip >= 1 || textureHeight >> mip >= 1; ++mip)#",
        "    {",
        "        #5|glUniform1f(lodLoc, mip);#",
        "        #3|glClearColor(0.0f, 0.0f, 0.0f, 1.0f);",
        "        glClear(GL_COLOR_BUFFER_BIT);#",
        "        #2|drawQuad(program, essl3_shaders::PositionAttrib(), 0.5f);#",
        "        EXPECT_GL_NO_ERROR();",
        "        #4|EXPECT_PIXEL_COLOR_EQ(0, 0, color) << \"Failed on mip \" << mip;",
        "        EXPECT_PIXEL_COLOR_EQ(w, 0, color) << \"Failed on mip \" << mip;",
        "        EXPECT_PIXEL_COLOR_EQ(0, h, color) << \"Failed on mip \" << mip;",
        "        EXPECT_PIXEL_COLOR_EQ(w, h, color) << \"Failed on mip \" << mip;#",
        "    }",
        "}",
    ];

    function spanNode(text, color) {
        const element = document.createElement("span");
        element.setAttribute("class", "code");
        if(typeof color !== 'undefined'){
            element.setAttribute("style", `color: ${color}`);
        }
        element.innerHTML = text;
        return element;
    }

    function codeWalktrough(codeLines, chunkColors) {
        const element = document.createElement("div");
        element.setAttribute("class", "codeBlock");
        const preformatted = document.createElement("pre");
        const code = document.createElement("code");
        var newANGLETestCode = "";
        for(const line of codeLines) {
            newANGLETestCode += `${line}\n`;
        }
        var chunkIndex = 0;
        const chunks = newANGLETestCode.split("#");
        for(const chunk of chunks) {
            var escapedChunk = chunk.replace("<", "&lt;");
            escapedChunk.replace(">", "&gt;");
            escapedChunk.replace("&", "&amp;");
            var finalChunk;
            var chunkColor = undefined;
            if((chunkIndex % 2) === 1) {
                finalChunk = "";
                var chunkName = "";
                var characterIndex = 0;
                for(; characterIndex < escapedChunk.length; characterIndex++) {
                    const character = escapedChunk.charAt(characterIndex);
                    if(character === "|"){
                        break;
                    }
                    chunkName += character;
                }
                characterIndex++;
                for(; characterIndex < escapedChunk.length; characterIndex++) {
                    const character = escapedChunk.charAt(characterIndex);
                    finalChunk += character;
                }
                if(chunkColors[chunkName]) {
                    chunkColor = chunkColors[chunkName];
                }
            } else {
                finalChunk = escapedChunk;
            }

            code.appendChild(spanNode(finalChunk, chunkColor));
            chunkIndex++;
        }
        preformatted.appendChild(code);
        element.appendChild(preformatted);
        return element;
    }

    function wrapDiv(item, style) {
        const element = document.createElement("div");
        element.setAttribute("style", style);
        element.appendChild(item);
        return element;
    }

    function listDiagramSlide(items, hotItemCount, diagram, footnoteItems) {
        function footnotes(nodes) {
            const element = document.createElement("div")
            element.setAttribute("class", "footnotes");
            element.appendChild(orderedListNode(nodes))
            return element;
        }
        const element = document.createElement("div");
        element.setAttribute("style", `margin: 0; padding: 0`);

        const top = document.createElement("div");
        top.appendChild(wrapDiv(unorderedListNode(items, hotItemCount), "display: inline-block; *display: inline; width:900px; float:left;"));
        if(typeof diagram !== 'undefined') {
            top.appendChild(wrapDiv(diagram, "display: inline-block; *display: inline; float:left;"));
        }
        element.appendChild(top);

        if(typeof footnoteItems !== 'undefined') {
            element.appendChild(footnotes(footnoteItems));
        }
        return element;
    }

    function errorPatternDiagram(patternName, yResolution) {
        const pixelDimension = 3;
        const resolution = [40, yResolution || 10];
        var seed = 1;
        function random() {
            const x = 1234*Math.cos(seed);
            seed += 32;
            return x - Math.floor(x);
        }

        const randomErrorPixelColor = (position) => {
            const randomNumber = random();
            const error = randomNumber < 0.1;
            if(error) {
                return [random()*0.75 + 0.25,0,0];
            } else {
                return testTextureColor;
            }
        };
        const columnNoisePixelColor = (position) => {
            const originalSeed = seed;
            seed = position[0];
            const randomNumber = random();
            const error = randomNumber < 0.3;
            if(error) {
                seed = originalSeed + position[1];
                return [random()*0.75 + 0.25,0,0];
            } else {
                return testTextureColor;
            }
        };
        const noiseColumnPixelColor = (position) => {
            const originalSeed = seed;
            seed = position[0];
            const randomNumber = random();
            const error = randomNumber < 0.3;
            if(error) {
                return [0.75,0,0];
            } else {
                return testTextureColor;
            }
        };
        const clusteredError = (x) => {
            if(x < 0.1*resolution[0])
                return true;
            if(x > resolution[0]-3)
                return true;
            if(x == resolution[0]-4 || x == resolution[0]-7)
                return true;
            return false;
        };

        const clusteredNoiseColumnPixelColor = (position) => {
            if(clusteredError(position[0])) {
                return [0.75,0,0];
            } else {
                return testTextureColor;
            }
        };

        const clusteredNoiseColumnPixelColorHi = (position) => {
            if(clusteredError(position[0])) {
                if(position[0] > resolution[0]/2) {
                    return [0.75,0,0];
                } else {
                    return [0.3,0,0];
                }
            } else {
                return testTextureColor;
            }
        };

        const clusteredNoiseColumnPixelColorLo = (position) => {
            if(clusteredError(position[0])) {
                if(position[0] < resolution[0]/2) {
                    return [0.75,0,0];
                } else {
                    return [0.3,0,0];
                }
            } else {
                return testTextureColor;
            }
        };

        const patternPixelColors = {
            "noise": randomErrorPixelColor,
            "columnNoise": columnNoisePixelColor,
            "noiseColumns": noiseColumnPixelColor,
            "clusteredNoiseColumns": clusteredNoiseColumnPixelColor,
            "clusteredNoiseColumnsHi": clusteredNoiseColumnPixelColorHi,
            "clusteredNoiseColumnsLo": clusteredNoiseColumnPixelColorLo,
        };
        const pixelColor = patternPixelColors[patternName];
        return diagramNode(errorPattern(pixelDimension, resolution, pixelColor));
    }

    const examplePixelIndex = 1;
    const weightMappingComponentMappingColor = (pixelIndex) => {
        return (index) => {
            if(index == pixelIndex) {
                return [0.8, 0.8, 0.8];
            } else {
                return undefined;
            }
        }
    };
    const weightMappingComponentsWithMapping = {
        mapping: {
            mappingColor: weightMappingComponentMappingColor(examplePixelIndex),
        }
    };
    const weightMappingComponentsWithLoGuideline = {
        mapping: {
            mappingColor: weightMappingComponentMappingColor(examplePixelIndex),
            guideLines: {index: examplePixelIndex, colors: [[0.6, 0.2, 0.0]]}
        }
    };
    const weightMappingComponentsWithGuidelines = {
        mapping: {
            mappingColor: weightMappingComponentMappingColor(examplePixelIndex),
            guideLines: {index: examplePixelIndex, colors: [[0.6, 0.2, 0.0], [0.0, 0.0, 6.0]]}
        }
    };
    function weightMappingComponentsWithGuidelinesAndWeights(pixelIndex, weightIndex, lowColor, hiColor) {
        var lc = [0.6, 0.2, 0.0];
        if(lowColor === false)
            lc = undefined;
        var hc = [0.0, 0.0, 6.0];
        if(hiColor === false)
            hc = undefined;
        return  {
            mapping: {
                mappingColor: weightMappingComponentMappingColor(pixelIndex),
                guideLines: {
                    index: pixelIndex,
                    colors: [lc, hc]
                },
                weights: (i,j,k) =>
                    (i===pixelIndex && j === weightIndex) ||
                    (i===pixelIndex && j === weightIndex),
            }
        };
    }

    function weightMappingComponentsForFactor(pixelIndex) {
        return  {
            mapping: {
                mappingColor: weightMappingComponentMappingColor(pixelIndex),
                guideLines: {
                    index: pixelIndex,
                    colors: []
                },
                weights: (i,j,k) => (i===pixelIndex),
            }
        };
    }

    function weightMappingComponentsWithGuidelinesAndWeightsAndFudge(pixelIndex, weightIndex, fudge) {
        var fc = [0.7, 0.0, 0.0];
        if(fudge === false) {
            fc = undefined;
        }
        return  {
            mapping: {
                mappingColor: weightMappingComponentMappingColor(pixelIndex),
                guideLines: {
                    index: pixelIndex,
                    colors: [undefined, [0.0, 0.0, 6.0], fc]
                },
                weights: (i,j,k) =>
                    (i===pixelIndex && j === weightIndex) ||
                    (i===pixelIndex && j === weightIndex),
            }
        };
    }

    var slides = [];
    var slide = {};
    var items = [];
    var hotItemCount = 0;
    slide.items = () => items.slice(0,items.length);
    var timegroupStart = 0;
    var timegroupStartSlideIndex = 0;
    var timegroups = [];
    function endTimegroup(duration) {
        timegroups.push(
            {"start": timegroupStart,
             "duration": duration,
             "startSlideIndex": timegroupStartSlideIndex,
             "slideCount": slides.length - timegroupStartSlideIndex,
            });
        timegroupStart += duration;
        timegroupStartSlideIndex = slides.length;
    }
    function pushSlideItem(item) {
        items.push(item);
        hotItemCount = 1;
        slides.push(listDiagramSlide(slide.items(), hotItemCount, slide.diagram(), slide.footnotes()));
    }
    function pushSlideItems(newItems) {
        for(var item of newItems){
            items.push(item);
        }
        hotItemCount = newItems.length;
        slides.push(listDiagramSlide(slide.items(), hotItemCount, slide.diagram(), slide.footnotes()));
    }
    function clearItems() {
        items = [];
    }
    function introDiagram() {
        const element = document.createElement("div");
        add(element, imageNode(presenterFileName));
        add(element,
            wrapDiv(wrapDiv(imageNode(nvidiaLogoFileName, "width: 300;"),
                            "width: 900; display: flex; justify-content: center;"),
                    "display: inline-block; *display: inline"));
        add(element, imageNode(webGLLogoFileName, "width: 300"));
        return element;
    }

    function italicNode(text) {
        const element = document.createElement('i');
        element.innerHTML = text;
        return element;
    }

    // Presentation introduction
    clearItems();
    slide.diagram = () => introDiagram();
    slide.footnotes = () => undefined;
    pushSlideItems([
        "Anders Leino, NVIDIA",
        "I help the WebGL implementers with driver related issues.",
        "Speaking about work going on behind the scenes to support WebGL.",
    ]);
    clearItems();
    slide.footnotes = () => undefined;
    slide.diagram = () => imageNode(angleBugImageFileName);
    pushSlideItems([
        "This presentation: retelling my investigation of a driver bug.",
        ["Want to highlight the method of investigating the driver as a ", ()=>italicNode("black box"), "."],
        "I picked a bug that makes for an interesting story...",
        "...but I use the black box method often, and it works surprisingly well!"
    ]);
    endTimegroup(40);
    clearItems();
    slide.diagram = () => diagramNode(blackBox("Observer", "Driver"));
    pushSlideItem("Why consider the driver as a black box?");
    pushSlideItems([
        "No access to the source code? You can still learn a surprising amount...",
        "...this is one way of moving lower-priority bugs forward."
    ]);
    slide.diagram = () => diagramNode(blackBox("Test", "Driver"));
    pushSlideItem("Tests treat the driver as a black box. In a way, this method produces a very specific test case.");
    slide.diagram = () => diagramNode(blackBox("Test", "Driver & GPU"));
    pushSlideItem("Works for hardware issues as well: GPU is also in the box!");
    slide.footnotes = () => ["I'm new to the driver, with colleagues in different time-zones."];
    pushSlideItem("In my case: trouble finding relevant code! [1]");
    slide.footnotes = () => undefined;
    endTimegroup(30);

    // Bug introduction
    clearItems();
    slide.diagram = () => imageNode(angleBugImageFileName);
    slide.footnotes = () => bugIntroductionFootnotes();
    pushSlideItems([
        ["Starting point: pinged on ", ()=>textLinkNode(angleBugURL)],
        [()=>linkNode(testURL, "New test"), ()=>textNode(" [1] added to ANGLE test suite")],
        "Failing on NVIDIA GPUs"
    ]);
    slide.footnotes = () => [bugIntroductionFootnotes(), textLinkNode(angleProjectURL)];
    pushSlideItems([
        "By the way: ANGLE [2] is a userspace implementation of GLES...",
        "...used in several browsers to implement WebGL: WebGL/ANGLE/Driver/GPU",
    ]);

    slide.footnotes = () => undefined;
    var codeColoring;

    // Test code walktrough
    clearItems();
    slide.diagram = () => codeWalktrough(newANGLETestCodeLines, codeColoring);
    clearItems();
    codeColoring = {};
    pushSlideItems([
        "This is the code for the failing ANGLE test...",
        "...it's GLES code, but ANGLE is making regular OpenGL calls behind the scenes."
    ]);
    clearItems();
    codeColoring = {"0": "blue"};
    slide.footnotes = () => ["GL_MAX_TEXTURE_SIZE is typically 32768"];
    pushSlideItem("Query maximum texture width: a large even integer [1]...");
    codeColoring = {"2": "blue", "5": "red"};
    pushSlideItem(["...subtract 1 to make a ", ()=>italicNode("large odd texture width"), "."]);
    codeColoring = {"3": "green", "4": "blue"};
    pushSlideItem(["Fill level 0 of texture with ", ()=>italicNode("solid color"), "..."]);
    codeColoring = {"1": "red"};
    pushSlideItem("...generate the higher mip levels...");
    codeColoring = {"6": "red"};
    pushSlideItem("...verify that drawing a textured quad yields the same solid color, sampling in turn from each mip level.");
    slide.footnotes = () => undefined;

    // Test verification code walktrough
    slide.diagram = () => codeWalktrough(verifyMipsCodeLines, codeColoring);
    clearItems();
    codeColoring = {};
    pushSlideItem("Here's that verification code.");
    codeColoring = {"0": "blue"};
    pushSlideItems([
        "Set up a program...",
        "...with fragment shader sampling from a specified mip level, and then outputting the sampled color."
    ]);
    codeColoring = {"1": "blue"};
    pushSlideItem("Then, for every mip level...");
    codeColoring = {"2": "red", "3": "green", "5": "blue"};
    pushSlideItem("...draw a quad using that mip level...");
    codeColoring = {"4": "red"};
    pushSlideItems([
        "...read the framebuffer...",
        "...and verify that the base level color is returned.",
    ]);
    endTimegroup(60+15);

    // Data flow overview
    slide.diagram = () => diagramNode(dataFlow(flowComponents, flowMipArrows));
    clearItems();
    var flowComponents;
    var flowMipArrows;
    flowComponents = {}
    flowMipArrows = {};
    pushSlideItem("Let's look at the data flow.");
    flowComponents["mipMap"] = true;
    flowMipArrows = {};
    pushSlideItem("We have a texture with mip-levels...");
    flowComponents["shader"] = true;
    flowMipArrows = {};
    pushSlideItem("...a fragment shader...");
    flowComponents["framebuffer"] = true;
    flowMipArrows = {};
    pushSlideItem("...and a framebuffer.");
    clearItems()
    flowMipArrows = {1:'black', 2: 'black'};
    pushSlideItem("glGenerateMipmaps fills in the higher mip levels");
    flowComponents["textureRead"] = "black";
    pushSlideItem("Shader samples from texture");
    flowComponents["framebufferWrite"] = "black";
    pushSlideItem("Shader writes to framebuffer");
    clearItems();
    flowComponents["textureRead"] = "orange";
    flowComponents["framebufferWrite"] = "orange";
    flowMipArrows = {1:'orange', 2:'orange'};
    pushSlideItems([
        "Which step is wrong?",
        "We better look in order!"
    ]);
    flowComponents = {mipMap: true, shader: true, framebuffer: true};
    flowMipArrows = {1:'orange', 2:'orange'};
    pushSlideItem(["So let's ", ()=>italicNode("read back"), " the mip-levels instead of sampling from them..."]);
    flowMipArrows = {1:'red'};
    pushSlideItems([
        "We find that level 1 is not solid color...",
        "...so glGenerateMipmaps is failing!"
    ]);
    endTimegroup(35);

    // Error pattern
    var errorPatternName;
    clearItems();
    slide.diagram = () => undefined;
    pushSlideItem("In what way is level 1 not solid?");
    slide.diagram = () => errorPatternDiagram(errorPatternName);
    errorPatternName = "noise";
    pushSlideItem("Is it just random noise, or is there a pattern?");
    errorPatternName = "columnNoise";
    pushSlideItem("Observation: Errors come in entire columns");
    errorPatternName = "noiseColumns";
    slide.footnotes = () => ["Clamped on overflow"];
    pushSlideItem("Observation: All incorrect colors are the same: $$\\frac{3}{2}\\times\\text{ the correct color!}$$");
    errorPatternName = "clusteredNoiseColumns";
    pushSlideItem("Observation: The errors are clustered near ends");
    slide.diagram = () => errorPatternDiagram(errorPatternName, 1);
    pushSlideItems([
        "These findings allow us to think about 1d textures...",
        "...but all the following applies to 2d and 3d textures as well!",
    ]);
    endTimegroup(40);
    slide.footnotes = () => undefined;

    // Weight calculation
    clearItems();
    var weightComponents = {};
    var weightWide = false;
    slide.diagram = () => diagramNode(weights(weightComponents, weightWide));
    pushSlideItems([
        "Let's look at how level 1 should be calculated",
        "Guess: box filter, as the OpenGL specification recommends."
    ]);
    weightComponents = {};
    pushSlideItem(["Level 0 has odd width $$W=2n+1$$ where \\(n\\) is some ", ()=>italicNode("large integer")]);
    weightComponents = {mapping: {}};
    pushSlideItem(
        "...so each pixel in level 1 corresponds to slightly over 2 pixels in level 0 $$\\frac{W}{n} = 2 + \\frac{1}{n}$$",
    );
    clearItems();
    weightComponents = weightMappingComponentsForFactor(examplePixelIndex, 0);
    pushSlideItems([
        "Therefore, the calculated color depends on 3 pixels in level 0.",
        "Those 3 pixels are weighted proportionally to how much they are covered.",
    ]);
    endTimegroup(50);

    clearItems();
    weightComponents = {mapping: {weights: () => true}};
    pushSlideItem("Now remember that the errors happened only near the ends of the texture.");
    slide.diagram = () => diagramNode(weights(weightComponents, weightWide));
    weightComponents = {mapping: {weights: (i,j) => i===0 && j === 2}};
    pushSlideItem(["Notice how the ", ()=>italicNode("upper coverages"), " are small on the ", ()=>italicNode("low end"), " of the texture..."]);
    weightComponents = {mapping: {weights: (i,j,k) => (i===k-1 && j === 0)}};
    pushSlideItem(["...and the ", ()=>italicNode("lower coverages"), " are small on the ", ()=>italicNode("high end"), " of the texture..."]);
    weightComponents = {mapping: {weights: (i,j,k) => (i===0 && j === 2) || (i===k-1 && j === 0)}};
    pushSlideItem("What if these small coverages would be miscalculated as 1 for some reason?");
    clearItems();
    weightComponents = weightMappingComponentsForFactor(0, 0);
    pushSlideItem("Then the sum of the coverages would be \\(3+1/n \\approx 3\\) instead of being \\(2+1/n \\approx 2\\), which is the correct value!");
    pushSlideItems([
        "Since we have solid color in level 0...",
        "...the effect would be to scale the affected pixels by \\(\\frac{3+1/n}{2+1/n}\\approx \\frac{3}{2}\\)...",
        "...which is exactly the error we observed!"
    ]);
    clearItems();
    weightComponents = {mapping: {weights: (i,j,k) => (i===0 && j === 2) || (i===k-1 && j === 0)}};
    pushSlideItems([
        "We're onto something!",
        "But those coverages are \\(\\approx \\frac{1}{n}\\) near the ends...",
        "...and \\(\\frac{1}{n}\\) is tiny, so why would they be miscalculated as 1?",
    ]);
    pushSlideItems([
        "Guess: coverages might be calculated using \\(\\text{floor}\\) & \\(\\text{ceil}\\) functions?",
        "That's the most obvious way to handle the general case of \"scaling texture of odd width\"...",
        "...and might explain the errors, because \\(\\text{floor}\\) & \\(\\text{ceil}\\) have discontinuous steps of size 1!",
    ]);
    clearItems();
    weightComponents = {};
    pushSlideItems([
        "To explain the guess more clearly...",
        "...let's see how you'd write the coverage formulas using \\(\\text{floor}\\) and \\(\\text{ceil}\\)"
    ]);
    weightComponents = weightMappingComponentsWithMapping;
    pushSlideItem(`Take a look at pixel \\(j = ${examplePixelIndex}\\) in level 1`);
    weightComponents = weightMappingComponentsWithLoGuideline;
    pushSlideItem("Low edge of box: \\(x_0 = (2+\\frac{1}{n})j\\)");
    weightComponents = weightMappingComponentsWithGuidelines;
    pushSlideItem("High edge of box: \\(x_1 = (2+\\frac{1}{n})(j+1)\\)");
    weightComponents = weightMappingComponentsWithGuidelinesAndWeights(examplePixelIndex, 0);
    pushSlideItem("Coverage 0 would be written using \\(\\text{floor}\\) like this $$C_0 = 1 - (x_0 - \\text{floor}(x_0))$$");
    weightComponents = weightMappingComponentsWithGuidelinesAndWeights(examplePixelIndex, 1);
    pushSlideItem("Coverage 1 is always 1 $$C_1 = 1$$");
    weightComponents = weightMappingComponentsWithGuidelinesAndWeights(examplePixelIndex, 2);
    pushSlideItem("Coverage 2 would be written using \\(\\text{ceil}\\) like this $$C_2 = 1 - (\\text{ceil}(x_1) - x_1)$$");
    endTimegroup(2*60 + 5);

    // Weight miscalculation
    clearItems();
    weightWide = false;
    slide.diagram = () => diagramNode(weights(weightComponents, weightWide));
    weightComponents = weightMappingComponentsWithGuidelinesAndWeights(Math.floor(baseLevelDimension/2));
    weightComponents.mapping.guideLines.colors[1] = undefined;
    pushSlideItems([
        "Trouble: On high end, \\(\\text{floor}(x_0)\\) is sporadically miscalculated as \\(\\text{floor}(x_0)+1\\)!",
    ]);
    weightComponents = weightMappingComponentsWithGuidelinesAndWeights(Math.floor(baseLevelDimension/2), 0);
    weightComponents.mapping.guideLines.colors[1] = undefined;
    pushSlideItems([
        "Effect: \\(C_0\\) sporadically miscalculated as \\(C_0 + 1 \\approx 1\\), as guessed!",
        "As we saw, this leads scaling by \\(\\frac{3}{2}\\)."
    ]);
    errorPatternName = "clusteredNoiseColumnsHi";
    slide.diagram = () => errorPatternDiagram(errorPatternName);
    pushSlideItems([
        "This explains the errors on the high end!",
        ["Reproduced with a ", ()=>italicNode("CPU model"), "."],
        "(Just a few lines of code. Standard C library \\(\\text{floor}\\) has same issue.)",
    ]);

    clearItems();
    errorPatternName = "clusteredNoiseColumnsLo";
    pushSlideItem("But what about the errors on the low end of the texture?");
    slide.diagram = () => diagramNode(weights(weightComponents, weightWide));
    weightComponents = weightMappingComponentsWithGuidelinesAndWeights(0, 2);
    pushSlideItems([
        "Here, coverage 2 is small $$C_2 = 1 - (\\text{ceil}(x_1) - x_1)$$",
        "But \\(\\text{ceil}(x_1)\\) should be accurate on this end...",
        "...because \\(x_1\\) is small...",
        "...so the same explanation does not apply on the low end!",
        "(The CPU model mentioned earlier agrees.)",
    ]);
    endTimegroup(1*60);

    clearItems();
    weightComponents = weightMappingComponentsWithGuidelinesAndWeights(Math.floor(baseLevelDimension/2), undefined, false, false);
    pushSlideItems([
        "Hold that thought.",
        "First we have to fix something on the other end!",
    ]);
    weightComponents = weightMappingComponentsWithGuidelinesAndWeights(Math.floor(baseLevelDimension/2), undefined, false, true);
    pushSlideItems([
        "\\(x_1\\) is on an integer boundary...",
        "...so if it comes out bit too large, then \\(\\text{ceil}(x_1)\\) is off by 1!",
        "(Again: confirmed by CPU model.)",
    ]);
    weightComponents = weightMappingComponentsWithGuidelinesAndWeights(Math.floor(baseLevelDimension/2), 2, false);
    pushSlideItem("This would be trouble for coverage 2, because it uses \\(\\text{ceil}(x_1)\\) $$C_2 = 1 - (\\text{ceil}(x_1) - x_1)$$");
    weightComponents = weightMappingComponentsWithGuidelinesAndWeightsAndFudge(Math.floor(baseLevelDimension/2), 2);
    pushSlideItem("Guess: worked around by subtracting small \\(\\text{fudge}\\) term from \\(x_1\\) $$C_2^* = 1 - (\\text{ceil}(x_1-\\text{fudge}) - x_1)$$");
    clearItems();
    weightComponents = weightMappingComponentsWithGuidelinesAndWeightsAndFudge(0, 2, false);
    pushSlideItem("Phew, fixed! Back to the low end!");
    weightComponents = weightMappingComponentsWithGuidelinesAndWeightsAndFudge(0, 2, true);
    pushSlideItems([
        "As long as \\(\\text{fudge} < \\frac{1}{n}\\)...",
        "...the fudge term has no effect: $$\\text{ceil}(x_1-\\text{fudge}) = \\text{ceil}(x_1)$$",
        "...so \\(C_2^* = C_2\\)..."
    ]);
    pushSlideItem("Except! \\(\\frac{1}{n} = \\frac{1}{\\text{floor}(W/2)}\\) shrinks as texture width \\(W\\) increases...");
    weightWide = true;
    pushSlideItem("...which eventually causes \\(\\text{ceil}(x_1-\\text{fudge})\\) to drop down one \"stair step\": $$\\text{ceil}(x_1-\\text{fudge}) = \\text{ceil}(x_1) - 1$$");
    pushSlideItems([
        "...which causes coverage 2 to increase by 1: $$C_2^* = C_2 + 1$$",
        "Again: coverage 2 should be small, but suddenly increases by 1...",
        "...and again, this leads to scaling affected pixels by \\(\\frac{3}{2}\\), as we observe!"
    ]);
    clearItems();
    slide.diagram = () => errorPatternDiagram(errorPatternName);
    errorPatternName = "clusteredNoiseColumnsLo";
    pushSlideItems([
        "We have explained the errors on the low end...",
        "...they're due to a fudge term!",
    ]);
    weightWide = false;
    weightComponents = weightMappingComponentsWithGuidelinesAndWeightsAndFudge(Math.floor(baseLevelDimension/2), 2);
    slide.diagram = () => diagramNode(weights(weightComponents, weightWide));
    pushSlideItems([
        "But we can't test this in the CPU model yet...",
        "...we don't know how big the fudge term is...",
    ]);
    errorPatternName = "clusteredNoiseColumnsLo";
    slide.diagram = () => errorPatternDiagram(errorPatternName);
    pushSlideItem("New observation: The errors on the low end only appear for \\(W > 19999\\)");
    weightWide = true;
    slide.diagram = () => diagramNode(weights(weightComponents, weightWide));
    weightComponents = weightMappingComponentsWithGuidelinesAndWeightsAndFudge(0, 2, true);
    pushSlideItems([
        "...so we estimate \\(\\text{fudge} \\approx \\frac{1}{n}\\) when \\(W = 19999\\)",
        "\\(\\frac{1}{n} = \\frac{1}{\\text{floor}(W/2)} = \\frac{1}{\\text{floor}(19999/2)} = 0.00010001\\)",
        "\\(\\text{fudge} = 0.0001\\) seems like a good guess!",
    ]);
    endTimegroup(1*60 + 45);

    // Conclusion
    slide.diagram = () => diagramNode(blackBox("Test", "Driver & GPU"));
    clearItems();
    pushSlideItem("Conclusion: by observing effects...");
    pushSlideItems([
        "...we found out the following about the driver:",
        "\\(x_0 = (2+1/n)j\\)",
        "\\(x_1 = (2+1/n)(j+1)\\)",
        "\\(\\text{fudge} = 0.0001\\)",
        "\\(C_0\\) impl: \\(1 - (x_0 - \\text{floor}(x_0))\\)",
        "\\(C_1\\) impl: \\(1\\)",
        "\\(C_2\\) impl: \\(C_2^*= 1 - (\\text{ceil}(x_1-\\text{fudge}) - x_1)\\)",
    ]);
    pushSlideItems([
        "In the end, guess turned out to be correct!",
        "Even the vale of \\(\\text{fudge}\\)!"
    ]);
    clearItems();
    var endFootnotes = ["We're scaling specifically from a texture of width \\(W\\) to one of width \\(W/\\text{floor}(W/2)\\)!"];
    slide.footnotes = () => endFootnotes;
    pushSlideItems([
        "Here's a better way to calculate coverage, in the specific case of mip-level generation [1]",
        "\\(C_0\\) impl: \\(1 - j/n\\)",
        "\\(C_1\\) impl: \\(1\\)",
        "\\(C_2\\) impl: \\((j+1)/n\\)",
        "At this point, the fix was easy!",
        "(Once the source file was found...)",
    ]);
    endFootnotes.push("The original formulas were written for a more general case, which caused all the trouble.");
    pushSlideItems([
        "Hindsight: the original code wasn't \"bad\", just overly general. (See footnotes.)",
        "The \\(\\text{floor}\\) & \\(\\text{ceil}\\) -formulas are finally gone after 12 years... [2]",
        "...and \\(\\text{fudge}\\) after 11 years.",
        "Thank you, WebGL!"
    ]);
    endTimegroup(40);

    const duration = 10;
    const parameters = {
        title: "Driver bug deep dive starting from WebGL/ANGLE",
        author: {
            name: "Anders Leino",
            email: "aleino@nvidia.com",
        },
        occasion: "WebGL meetup, 17 March 2021",
        slidesURL: "https://github.com/aleino-nv/driver-bug-deep-dive-presentation",
        frontPageImage: imageNode(webGLLogoFileName, "width: 1000; padding: 100px;"),
        slideCount: slides.length,
        slide: (index) => slides[index-1],
        timegroups: timegroups,
    };

    return parameters;
}
