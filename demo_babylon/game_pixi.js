import { canvas } from '../js/adaptor/window';
import './libs/pixi';

var GLSL_TO_SINGLE_SETTERS = {
    float: function (gl, location, cv, v) {
        if (cv !== v) {
            cv.v = v;
            gl.uniform1f(location, v);
        }
    },
    vec2: function (gl, location, cv, v) {
        if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2f(location, v[0], v[1]);
        }
    },
    vec3: function (gl, location, cv, v) {
        if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3f(location, v[0], v[1], v[2]);
        }
    },
    int: function (gl, location, _cv, value) { gl.uniform1i(location, value); },
    ivec2: function (gl, location, _cv, value) { gl.uniform2i(location, value[0], value[1]); },
    ivec3: function (gl, location, _cv, value) { gl.uniform3i(location, value[0], value[1], value[2]); },
    ivec4: function (gl, location, _cv, value) { gl.uniform4i(location, value[0], value[1], value[2], value[3]); },
    bool: function (gl, location, _cv, value) { gl.uniform1i(location, value); },
    bvec2: function (gl, location, _cv, value) { gl.uniform2i(location, value[0], value[1]); },
    bvec3: function (gl, location, _cv, value) { gl.uniform3i(location, value[0], value[1], value[2]); },
    bvec4: function (gl, location, _cv, value) { gl.uniform4i(location, value[0], value[1], value[2], value[3]); },
    mat2: function (gl, location, _cv, value) { gl.uniformMatrix2fv(location, false, value); },
    mat3: function (gl, location, _cv, value) { gl.uniformMatrix3fv(location, false, value); },
    mat4: function (gl, location, _cv, value) { gl.uniformMatrix4fv(location, false, value); },
    sampler2D: function (gl, location, _cv, value) { gl.uniform1i(location, value); },
    samplerCube: function (gl, location, _cv, value) { gl.uniform1i(location, value); },
    sampler2DArray: function (gl, location, _cv, value) { gl.uniform1i(location, value); },
};
var GLSL_TO_ARRAY_SETTERS = {
    float: function (gl, location, _cv, value) { gl.uniform1fv(location, value); },
    vec2: function (gl, location, _cv, value) { gl.uniform2fv(location, value); },
    vec3: function (gl, location, _cv, value) { gl.uniform3fv(location, value); },
    vec4: function (gl, location, _cv, value) { gl.uniform4fv(location, value); },
    int: function (gl, location, _cv, value) { gl.uniform1iv(location, value); },
    ivec2: function (gl, location, _cv, value) { gl.uniform2iv(location, value); },
    ivec3: function (gl, location, _cv, value) { gl.uniform3iv(location, value); },
    ivec4: function (gl, location, _cv, value) { gl.uniform4iv(location, value); },
    bool: function (gl, location, _cv, value) { gl.uniform1iv(location, value); },
    bvec2: function (gl, location, _cv, value) { gl.uniform2iv(location, value); },
    bvec3: function (gl, location, _cv, value) { gl.uniform3iv(location, value); },
    bvec4: function (gl, location, _cv, value) { gl.uniform4iv(location, value); },
    sampler2D: function (gl, location, _cv, value) { gl.uniform1iv(location, value); },
    samplerCube: function (gl, location, _cv, value) { gl.uniform1iv(location, value); },
    sampler2DArray: function (gl, location, _cv, value) { gl.uniform1iv(location, value); },
};
/* eslint-disable max-len */
function syncUniforms(group, uniformData, ud, uv, renderer) {
    var textureCount = 0;
    var v = null;
    var cv = null;
    var gl = renderer.gl;
    for (var i in group.uniforms) {
        var data = uniformData[i];
        var uvi = uv[i];
        var udi = ud[i];
        var gu = group.uniforms[i];
        if (!data) {
            if (gu.group) {
                renderer.shader.syncUniformGroup(uvi);
            }
            continue;
        }
        if (data.type === 'float' && data.size === 1) {
            if (uvi !== udi.value) {
                udi.value = uvi;
                gl.uniform1f(udi.location, uvi);
            }
        }
        /* eslint-disable max-len */
        else if ((data.type === 'sampler2D' || data.type === 'samplerCube' || data.type === 'sampler2DArray') && data.size === 1 && !data.isArray) 
        /* eslint-disable max-len */
        {
            renderer.texture.bind(uvi, textureCount);
            if (udi.value !== textureCount) {
                udi.value = textureCount;
                gl.uniform1i(udi.location, textureCount);
            }
            textureCount++;
        }
        else if (data.type === 'mat3' && data.size === 1) {
            if (gu.a !== undefined) {
                gl.uniformMatrix3fv(udi.location, false, uvi.toArray(true));
            }
            else {
                gl.uniformMatrix3fv(udi.location, false, uvi);
            }
        }
        else if (data.type === 'vec2' && data.size === 1) {
            if (gu.x !== undefined) {
                cv = udi.value;
                v = uvi;
                if (cv[0] !== v.x || cv[1] !== v.y) {
                    cv[0] = v.x;
                    cv[1] = v.y;
                    gl.uniform2f(udi.location, v.x, v.y);
                }
            }
            else {
                cv = udi.value;
                v = uvi;
                if (cv[0] !== v[0] || cv[1] !== v[1]) {
                    cv[0] = v[0];
                    cv[1] = v[1];
                    gl.uniform2f(udi.location, v[0], v[1]);
                }
            }
        }
        else if (data.type === 'vec4' && data.size === 1) {
            if (gu.width !== undefined) {
                cv = udi.value;
                v = uvi;
                if (cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height) {
                    cv[0] = v.x;
                    cv[1] = v.y;
                    cv[2] = v.width;
                    cv[3] = v.height;
                    gl.uniform4f(udi.location, v.x, v.y, v.width, v.height);
                }
            }
            else {
                cv = udi.value;
                v = uvi;
                if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
                    cv[0] = v[0];
                    cv[1] = v[1];
                    cv[2] = v[2];
                    cv[3] = v[3];
                    gl.uniform4f(udi.location, v[0], v[1], v[2], v[3]);
                }
            }
        }
        else {
            var funcArray = (data.size === 1) ? GLSL_TO_SINGLE_SETTERS : GLSL_TO_ARRAY_SETTERS;
            funcArray[data.type].call(null, gl, udi.location, udi.value, uvi);
        }
    }
}

function install(PIXI) {
    var _a;
    if (!((_a = PIXI === null || PIXI === void 0 ? void 0 : PIXI.systems) === null || _a === void 0 ? void 0 : _a.ShaderSystem)) {
        throw new Error('Unable to patch ShaderSystem, class not found.');
    }
    var ShaderSystem = PIXI.systems.ShaderSystem;
    var proceed = false;
    // Do a quick check to see if the patch is needed
    // want to make sure we only apply if necessary!
    try {
        ShaderSystem.prototype.systemCheck.call(null);
        proceed = false;
    }
    catch (err) {
        proceed = true;
    }
    // Only apply if needed
    if (proceed) {
        Object.assign(ShaderSystem.prototype, {
            systemCheck: function () {
                // do nothing, don't throw error
            },
            syncUniforms: function (group, glProgram) {
                var _a = this, shader = _a.shader, renderer = _a.renderer;
                /* eslint-disable max-len */
                syncUniforms(group, shader.program.uniformData, glProgram.uniformData, group.uniforms, renderer);
                /* eslint-disable max-len */
            },
        });
    }
}

function runDemoGraphic() {
    const graphics = new PIXI.Graphics();

    // Rectangle
    graphics.beginFill(0xDE3249);
    graphics.drawRect(50, 50, 100, 100);
    graphics.endFill();
    
    // Rectangle + line style 1
    graphics.lineStyle(2, 0xFEEB77, 1);
    graphics.beginFill(0x650A5A);
    graphics.drawRect(200, 50, 100, 100);
    graphics.endFill();
    
    // Rectangle + line style 2
    graphics.lineStyle(10, 0xFFBD01, 1);
    graphics.beginFill(0xC34288);
    graphics.drawRect(350, 50, 100, 100);
    graphics.endFill();
    
    // Rectangle 2
    graphics.lineStyle(2, 0xFFFFFF, 1);
    graphics.beginFill(0xAA4F08);
    graphics.drawRect(530, 50, 140, 100);
    graphics.endFill();
    
    // Circle
    graphics.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
    graphics.beginFill(0xDE3249, 1);
    graphics.drawCircle(100, 250, 50);
    graphics.endFill();
    
    // Circle + line style 1
    graphics.lineStyle(2, 0xFEEB77, 1);
    graphics.beginFill(0x650A5A, 1);
    graphics.drawCircle(250, 250, 50);
    graphics.endFill();
    
    // Circle + line style 2
    graphics.lineStyle(10, 0xFFBD01, 1);
    graphics.beginFill(0xC34288, 1);
    graphics.drawCircle(400, 250, 50);
    graphics.endFill();
    
    // Ellipse + line style 2
    graphics.lineStyle(2, 0xFFFFFF, 1);
    graphics.beginFill(0xAA4F08, 1);
    graphics.drawEllipse(600, 250, 80, 50);
    graphics.endFill();
    
    // draw a shape
    graphics.beginFill(0xFF3300);
    graphics.lineStyle(4, 0xffd900, 1);
    graphics.moveTo(50, 350);
    graphics.lineTo(250, 350);
    graphics.lineTo(100, 400);
    graphics.lineTo(50, 350);
    graphics.closePath();
    graphics.endFill();
    
    // draw a rounded rectangle
    graphics.lineStyle(2, 0xFF00FF, 1);
    graphics.beginFill(0x650A5A, 0.25);
    graphics.drawRoundedRect(50, 440, 100, 100, 16);
    graphics.endFill();
    
    // draw star
    graphics.lineStyle(2, 0xFFFFFF);
    graphics.beginFill(0x35CC5A, 1);
    graphics.drawStar(360, 370, 5, 50);
    graphics.endFill();
    
    // draw star 2
    graphics.lineStyle(2, 0xFFFFFF);
    graphics.beginFill(0xFFCC5A, 1);
    graphics.drawStar(280, 510, 7, 50);
    graphics.endFill();
    
    // draw star 3
    graphics.lineStyle(4, 0xFFFFFF);
    graphics.beginFill(0x55335A, 1);
    graphics.drawStar(470, 450, 4, 50);
    graphics.endFill();
    
    // draw polygon
    const path = [600, 370, 700, 460, 780, 420, 730, 570, 590, 520];
    
    graphics.lineStyle(0);
    graphics.beginFill(0x3500FA, 1);
    graphics.drawPolygon(path);
    graphics.endFill();
    
    app.stage.addChild(graphics);
}

function runDemoContainer() {
    const container = new PIXI.Container();

    app.stage.addChild(container);
    
    // Create a new texture
    const texture = PIXI.Texture.from('./images/bunny.png');
    
    // Create a 5x5 grid of bunnies
    for (let i = 0; i < 25; i++) {
        const bunny = new PIXI.Sprite(texture);
        bunny.anchor.set(0.5);
        bunny.x = (i % 5) * 40;
        bunny.y = Math.floor(i / 5) * 40;
        container.addChild(bunny);
    }
    
    // Move container to the center
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;
    
    // Center bunny sprite in local container coordinates
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;
    
    // Listen for animate update
    app.ticker.add((delta) => {
        // rotate the container!
        // use delta to create frame-independent transform
        container.rotation -= 0.01 * delta;
    });    
}

function runDemoClick() {
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    const sprite = PIXI.Sprite.from('./images/bunny.png');
    
    // Set the initial position
    sprite.anchor.set(0.5);
    sprite.x = app.screen.width / 2;
    sprite.y = app.screen.height / 2;
    
    // Opt-in to interactivity
    sprite.interactive = true;
    
    // Shows hand cursor
    sprite.buttonMode = true;
    
    // Pointers normalize touch and mouse
    sprite.on('pointerdown', onClick);
    
    // Alternatively, use the mouse & touch events:
    // sprite.on('click', onClick); // mouse-only
    // sprite.on('tap', onClick); // touch-only
    
    app.stage.addChild(sprite);
    
    function onClick() {
        sprite.scale.x *= 1.25;
        sprite.scale.y *= 1.25;
    }    
}

function runDemoDrag() {
// create a texture from an image path
const texture = PIXI.Texture.from('examples/assets/bunny.png');

// Scale mode for pixelation
texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

for (let i = 0; i < 10; i++) {
    createBunny(
        Math.floor(Math.random() * app.screen.width),
        Math.floor(Math.random() * app.screen.height),
    );
}

function createBunny(x, y) {
    // create our little bunny friend..
    const bunny = new PIXI.Sprite(texture);

    // enable the bunny to be interactive... this will allow it to respond to mouse and touch events
    bunny.interactive = true;

    // this button mode will mean the hand cursor appears when you roll over the bunny with your mouse
    bunny.buttonMode = true;

    // center the bunny's anchor point
    bunny.anchor.set(0.5);

    // make it a bit bigger, so it's easier to grab
    bunny.scale.set(3);

    // setup events for mouse + touch using
    // the pointer events
    bunny
        .on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)
        .on('pointermove', onDragMove);

    // For mouse-only events
    // .on('mousedown', onDragStart)
    // .on('mouseup', onDragEnd)
    // .on('mouseupoutside', onDragEnd)
    // .on('mousemove', onDragMove);

    // For touch-only events
    // .on('touchstart', onDragStart)
    // .on('touchend', onDragEnd)
    // .on('touchendoutside', onDragEnd)
    // .on('touchmove', onDragMove);

    // move the sprite to its designated position
    bunny.x = x;
    bunny.y = y;

    // add it to the stage
    app.stage.addChild(bunny);
}

function onDragStart(event) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    this.data = event.data;
    this.alpha = 0.5;
    this.dragging = true;
}

function onDragEnd() {
    this.alpha = 1;
    this.dragging = false;
    // set the interaction data to null
    this.data = null;
}

function onDragMove() {
    if (this.dragging) {
        const newPosition = this.data.getLocalPosition(this.parent);
        this.x = newPosition.x;
        this.y = newPosition.y;
    }
}
}

function runDemoInteractivity() {
// create a background...
const background = PIXI.Sprite.from('examples/assets/bg_button.jpg');
background.width = app.screen.width;
background.height = app.screen.height;

// add background to stage...
app.stage.addChild(background);

// create some textures from an image path
const textureButton = PIXI.Texture.from('examples/assets/button.png');
const textureButtonDown = PIXI.Texture.from('examples/assets/button_down.png');
const textureButtonOver = PIXI.Texture.from('examples/assets/button_over.png');

const buttons = [];

const buttonPositions = [
    175, 75,
    655, 75,
    410, 325,
    150, 465,
    685, 445,
];

for (let i = 0; i < 5; i++) {
    const button = new PIXI.Sprite(textureButton);

    button.anchor.set(0.5);
    button.x = buttonPositions[i * 2];
    button.y = buttonPositions[i * 2 + 1];

    // make the button interactive...
    button.interactive = true;
    button.buttonMode = true;

    button
    // Mouse & touch events are normalized into
    // the pointer* events for handling different
    // button events.
        .on('pointerdown', onButtonDown)
        .on('pointerup', onButtonUp)
        .on('pointerupoutside', onButtonUp)
        .on('pointerover', onButtonOver)
        .on('pointerout', onButtonOut);

    // Use mouse-only events
    // .on('mousedown', onButtonDown)
    // .on('mouseup', onButtonUp)
    // .on('mouseupoutside', onButtonUp)
    // .on('mouseover', onButtonOver)
    // .on('mouseout', onButtonOut)

    // Use touch-only events
    // .on('touchstart', onButtonDown)
    // .on('touchend', onButtonUp)
    // .on('touchendoutside', onButtonUp)

    // add it to the stage
    app.stage.addChild(button);

    // add button to array
    buttons.push(button);
}

// set some silly values...
buttons[0].scale.set(1.2);
buttons[2].rotation = Math.PI / 10;
buttons[3].scale.set(0.8);
buttons[4].scale.set(0.8, 1.2);
buttons[4].rotation = Math.PI;

function onButtonDown() {
    this.isdown = true;
    this.texture = textureButtonDown;
    this.alpha = 1;
}

function onButtonUp() {
    this.isdown = false;
    if (this.isOver) {
        this.texture = textureButtonOver;
    } else {
        this.texture = textureButton;
    }
}

function onButtonOver() {
    this.isOver = true;
    if (this.isdown) {
        return;
    }
    this.texture = textureButtonOver;
}

function onButtonOut() {
    this.isOver = false;
    if (this.isdown) {
        return;
    }
    this.texture = textureButton;
}    
}

function runDemoBlur() {
    const bg = PIXI.Sprite.from('examples/assets/pixi-filters/bg_depth_blur.jpg');
    bg.width = app.screen.width;
    bg.height = app.screen.height;
    app.stage.addChild(bg);
    
    const littleDudes = PIXI.Sprite.from('examples/assets/pixi-filters/depth_blur_dudes.jpg');
    littleDudes.x = (app.screen.width / 2) - 315;
    littleDudes.y = 200;
    app.stage.addChild(littleDudes);
    
    const littleRobot = PIXI.Sprite.from('examples/assets/pixi-filters/depth_blur_moby.jpg');
    littleRobot.x = (app.screen.width / 2) - 200;
    littleRobot.y = 100;
    app.stage.addChild(littleRobot);
    
    const blurFilter1 = new PIXI.filters.BlurFilter();
    const blurFilter2 = new PIXI.filters.BlurFilter();
    
    littleDudes.filters = [blurFilter1];
    littleRobot.filters = [blurFilter2];
    
    let count = 0;
    
    app.ticker.add(() => {
        count += 0.005;
    
        const blurAmount = Math.cos(count);
        const blurAmount2 = Math.sin(count);
    
        blurFilter1.blur = 20 * (blurAmount);
        blurFilter2.blur = 20 * (blurAmount2);
    });    
}

function runDemoText() {
    const basicText = new PIXI.Text('Basic text in pixi');
    basicText.x = 50;
    basicText.y = 100;
    app.stage.addChild(basicText);
    
    const style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#ffffff', '#00ff99'], // gradient
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440,
        lineJoin: 'round',
    });

    console.log("basicText: ", basicText);
    
    const richText = new PIXI.Text('Rich text with a lot of options and across multiple lines', style);
    richText.x = 50;
    richText.y = 220;
    
    app.stage.addChild(richText);
    
    const skewStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        dropShadow: true,
        dropShadowAlpha: 0.8,
        dropShadowAngle: 2.1,
        dropShadowBlur: 4,
        dropShadowColor: '0x111111',
        dropShadowDistance: 10,
        fill: ['#ffffff'],
        stroke: '#004620',
        fontSize: 60,
        fontWeight: 'lighter',
        lineJoin: 'round',
        strokeThickness: 12,
    });
    
    const skewText = new PIXI.Text('SKEW IS COOL', skewStyle);
    skewText.skew.set(0.65, -0.3);
    skewText.anchor.set(0.5, 0.5);
    skewText.x = 300;
    skewText.y = 480;
    
    app.stage.addChild(skewText);    
}

function runDemoMasksFilter() {
// Inner radius of the circle
const radius = 100;

// The blur amount
const blurSize = 32;

app.loader.add('grass', 'examples/assets/bg_grass.jpg');
app.loader.load(setup);

function setup(loader, resources) {
    const background = new PIXI.Sprite(resources.grass.texture);
    app.stage.addChild(background);
    background.width = app.screen.width;
    background.height = app.screen.height;

    const circle = new PIXI.Graphics()
        .beginFill(0xFF0000)
        .drawCircle(radius + blurSize, radius + blurSize, radius)
        .endFill();
    circle.filters = [new PIXI.filters.BlurFilter(blurSize)];

    const bounds = new PIXI.Rectangle(0, 0, (radius + blurSize) * 2, (radius + blurSize) * 2);
    const texture = app.renderer.generateTexture(circle, PIXI.SCALE_MODES.NEAREST, 1, bounds);
    const focus = new PIXI.Sprite(texture);

    app.stage.addChild(focus);
    background.mask = focus;

    app.stage.interactive = true;
    app.stage.on('mousedown', pointerMove);

    function pointerMove(event) {
        focus.position.x = event.data.global.x - focus.width / 2;
        focus.position.y = event.data.global.y - focus.height / 2;
    }
}
}

install(window.PIXI);

const { pixelRatio, windowWidth, windowHeight} = wx.getSystemInfoSync();
const app = new PIXI.Application({
    width: windowWidth, height: windowHeight, backgroundColor: 0x1099bb, resolution: pixelRatio,
    view: canvas
});

runDemoText();
