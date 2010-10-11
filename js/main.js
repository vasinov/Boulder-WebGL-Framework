$(document).ready(function() {
    $(window).resize(function() {
        $('div.wrapper').css({'height':(($(window).height()))+'px'});
        $('div.wrapper').css({'width':(($(window).width()))+'px'});
    });
    $(window).trigger('resize');
    
    $('#buttonTestAlert').click(function(e) {
        alert('Boulder, Boulder.');
        e.preventDefault();
    });
    
    scene = new Scene('canvas', 'framerate');
});

function drawOneCubicalObject(gl, angle, x, y, z, scale, texture) {
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);

    // Set up all the vertex attributes for vertices, normals and texCoords
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.box.vertexObject);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.box.normalObject);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.box.texCoordObject);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

    // Bind the index array
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.box.indexObject);
    
    // Create some matrices to use later and save their locations in the shaders
    var mvMatrix = new J3DIMatrix4();
    mvMatrix.translate(x,y,z);
    mvMatrix.scale(scale, scale, scale);

    // Construct the normal matrix from the model-view matrix and pass it in
    var normalMatrix = new J3DIMatrix4(mvMatrix);
    normalMatrix.invert();
    normalMatrix.transpose();
    normalMatrix.setUniform(gl, gl.getUniformLocation(gl.program, "u_normalMatrix"), false);

    // Construct the model-view * projection matrix and pass it in
    var mvpMatrix = new J3DIMatrix4(gl.perspectiveMatrix);
    mvpMatrix.multiply(mvMatrix);
    mvpMatrix.setUniform(gl, gl.getUniformLocation(gl.program, "u_modelViewProjMatrix"), false);

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.drawElements(gl.TRIANGLES, gl.box.numIndices, gl.UNSIGNED_BYTE, 0);
}

function drawOneSphericalObject(gl, angle, x, y, z, scale, texture) {
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.sphere.vertexObject);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.sphere.normalObject);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.sphere.texCoordObject);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.sphere.indexObject);

    // generate the model-view matrix
    var mvMatrix = new J3DIMatrix4();
    mvMatrix.translate(x,y,z);
    mvMatrix.scale(scale, scale, scale);

    // construct the normal matrix from the model-view matrix
    var normalMatrix = new J3DIMatrix4(mvMatrix);
    normalMatrix.invert();
    normalMatrix.transpose();
    normalMatrix.setUniform(gl, gl.getUniformLocation(gl.program, "u_normalMatrix"), false);
    
    // construct the model-view * projection matrix
    var mvpMatrix = new J3DIMatrix4(gl.perspectiveMatrix);
    mvpMatrix.multiply(mvMatrix);
    mvpMatrix.setUniform(gl, gl.getUniformLocation(gl.program, "u_modelViewProjMatrix"), false);
    
    gl.drawElements(gl.TRIANGLES, gl.sphere.numIndices, gl.UNSIGNED_SHORT, 0);
}

function drawPicture(gl, canvasObject) {
    // Make sure the canvas is sized correctly.
    reshape(gl, canvasObject, 45);

    gl.perspectiveMatrix.rotate(xRot/100, 1,0,0);
    gl.perspectiveMatrix.rotate(yRot/100, 0,1,0);
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var startX = -layoutWidth/2;
    var startY = -layoutHeight/2;
    var startZ = 0;
    
    drawOneCubicalObject(
        gl, // WebGL instance
        0, // angle
        0, // x
        0, // y
        0, // z
        1, // scale
        sphereTexture // texture
    );
    
    drawOneCubicalObject(
        gl, // WebGL instance
        90, // angle
        -3, // x
        0, // y
        0, // z
        2, // scale
        sphereTexture // texture
    );
    
    drawOneSphericalObject(
        gl, // WebGL instance
        0, // angle
        2, // x
        0, // y
        0, // z
        1, // scale
        sphereTexture // texture
    );
    
    drawOneSphericalObject(
        gl, // WebGL instance
        0, // angle
        2, // x
        1, // y
        0, // z
        0.5, // scale
        sphereTexture // texture
    );
    
    drawOneSphericalObject(
        gl, // WebGL instance
        0, // angle
        2, // x
        -1, // y
        0, // z
        0.5, // scale
        sphereTexture // texture
    );
    
    drawOneSphericalObject(
        gl, // WebGL instance
        0, // angle
        3, // x
        0, // y
        0, // z
        0.5, // scale
        sphereTexture // texture
    );
    
    //gl.bindTexture(gl.TEXTURE_2D, 0);

    // Finish up.
    gl.flush();

    // Show the framerate
    framerate.snapshot();
}

function reshape(gl, canvasObject, angle) {
    if (canvasObject.width == width && canvasObject.height == height)
        return;

    width = canvasObject.width;
    height = canvasObject.height;

    // Set the viewport and projection matrix for the scene
    gl.viewport(0, 0, width, height);
    gl.perspectiveMatrix = new J3DIMatrix4();
    gl.perspectiveMatrix.perspective(angle, width/height, 0.1, 10000);
    gl.perspectiveMatrix.lookat(0, 0, 20, 0, 0, 0, 0, 1, 0);
}

function init(canvasId) {
    // Initialize
    gl = initWebGL(
        // The id of the Canvas Element
        canvasId,
        // The ids of the vertex and fragment shaders
        "vshader", "fshader", 
        // The vertex attribute names used by the shaders.
        // The order they appear here corresponds to their index
        // used later.
        [ "vNormal", "vColor", "vPosition"], //vColor => vTexCoord
        // The clear color and depth values
        [ 0, 0, 0, 0.2 ], 10000); // floats

    // Set some uniform variables for the shaders
    gl.uniform3f(gl.getUniformLocation(gl.program, "lightDir"), 1, 0, 1);
    gl.uniform1i(gl.getUniformLocation(gl.program, "sampler2d"), 0);
    
    gl.sphere = makeSphere(gl, 1, 30, 30);
    
    gl.box = makeBox(gl);
            
    // get the images
    sphereTexture = loadImageTexture(gl, "textures/default.png");
    cubeTexture = loadImageTexture(gl, "textures/default.png");

    return gl;
}