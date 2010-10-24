width = -1;
height = -1;
var transl = -50, xOffs = yOffs = 0, drag = 0, xRot = yRot = 0;

/*
    Scene.js
    
    Scene class is responsable for creating a new scene in WebGL
    context and dealing with all low-level WebGL commands.
    
    The object needs to be initialized once the document is loaded.
*/
Scene = function(canvas_id, framerate_id, meshes_array_passed, textures, zoom)
{
    this.canvas_id = canvas_id;
    this.framerate_id = framerate_id;
    this.meshes_array = meshes_array_passed;
    meshes_array = meshes_array_passed;
    this.textures = textures;
    this.zoom = zoom;
    this.timer;
    this.meshes = [];
    this.create();
}

Scene.prototype.create = function() {
    canvasObject = $('#'+this.canvas_id).get(0);
    canvasObject.width = $(canvasObject).width();
    canvasObject.height = $(canvasObject).height();
    
    gl = this.initWebGL(
        canvasObject.id,
        // The ids of the vertex and fragment shaders
        "vshader", "fshader", 
        // The vertex attribute names used by the shaders.
        // The order they appear here corresponds to their index
        // used later.
        [ "vNormal", "vColor", "vPosition"], //vColor => vTexCoord
        // The clear color and depth values
        [ 0, 0, 0, 0.2 ], 10000); // floats
    
    var this_textures = this.textures;
    for(texture in this_textures) {
        window[texture] = eval("loadImageTexture(gl, \""+this_textures[texture]+"\")");
    }
    
    gl.uniform3f(gl.getUniformLocation(gl.program, "lightDir"), 1, 0, 1);
    gl.uniform1i(gl.getUniformLocation(gl.program, "sampler2d"), 0);
    
    gl.sphere = makeSphere(gl, 1, 30, 30);
    gl.box = makeBox(gl);
    
    framerate = new Framerate(this.framerate_id);
    camera = new Camera(canvasObject);
    this.timer = setInterval(this.drawPicture, 10);
}

Scene.prototype.drawPicture = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    canvasObject.width = $(canvasObject).width();
    canvasObject.height = $(canvasObject).height();
    // make sure the canvas is sized correctly.
    scene.reshape(45); // angle as a parameter
    
    // rotate the scene based on xRot and yRot variables that change with user input
    gl.perspectiveMatrix.rotate(0, yRot / 50, 0);
    
    // clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // go through all meshes and load them
    var meshes_array_length = meshes_array.length;
    for (var i = 0; i < meshes_array_length; i++) {
        eval('new Mesh('+meshes_array[i]+')');
    }

    // finish up.
    gl.flush();

    // show the framerate
    framerate.snapshot();
}

Scene.prototype.reshape = function(angle) {
    if (canvasObject.width == width && canvasObject.height == height)
        return;

    width = canvasObject.width;
    height = canvasObject.height;

    // Set the viewport and projection matrix for the scene
    gl.viewport(0, 0, width, height);
    gl.perspectiveMatrix = new J3DIMatrix4();
    gl.perspectiveMatrix.perspective(angle, width/height, 0.1, 10000);
    gl.perspectiveMatrix.lookat(0, 0, scene.zoom, 0, 0, 0, 0, 1, 0);
    gl.perspectiveMatrix.rotate(30, 1,0,0);
    gl.perspectiveMatrix.rotate(-30, 0,1,0);
}

Scene.prototype.initWebGL = function(canvasName, vshader, fshader, attribs, clearColor, clearDepth)
{
    var canvas = $('#'+canvasName).get(0);
    var gl = canvas.getContext("experimental-webgl");
    if (!gl) {
        alert("No WebGL context found");
        return null;
    }

    // Add a console
    gl.console = ("console" in window) ? window.console : { log: function() { } };

    // create our shaders
    var vertexShader = loadShader(gl, vshader);
    var fragmentShader = loadShader(gl, fshader);

    if (!vertexShader || !fragmentShader)
        return null;

    // Create the program object
    gl.program = gl.createProgram();

    if (!gl.program)
        return null;

    // Attach our two shaders to the program
    gl.attachShader (gl.program, vertexShader);
    gl.attachShader (gl.program, fragmentShader);

    // Bind attributes
    for (var i in attribs)
        gl.bindAttribLocation (gl.program, i, attribs[i]);

    // Link the program
    gl.linkProgram(gl.program);

    // Check the link status
    var linked = gl.getProgramParameter(gl.program, gl.LINK_STATUS);
    if (!linked) {
        // something went wrong with the link
        var error = gl.getProgramInfoLog (gl.program);
        gl.console.log("Error in program linking:"+error);

        gl.deleteProgram(gl.program);
        gl.deleteProgram(fragmentShader);
        gl.deleteProgram(vertexShader);

        return null;
    }

    gl.useProgram(gl.program);

    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
    gl.clearDepth(clearDepth);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    return gl;
}