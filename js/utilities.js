

//
// loadShader
//
// 'shaderId' is the id of a <script> element containing the shader source string.
// Load this shader and return the WebGLShader object corresponding to it.
//
function loadShader(gl, shaderId)
{
    var shaderScript = document.getElementById(shaderId);
    if (!shaderScript) {
        gl.console.log("*** Error: shader script '"+shaderId+"' not found");
        return null;
    }

    if (shaderScript.type == "x-shader/x-vertex")
        var shaderType = gl.VERTEX_SHADER;
    else if (shaderScript.type == "x-shader/x-fragment")
        var shaderType = gl.FRAGMENT_SHADER;
    else {
        gl.console.log("*** Error: shader script '"+shaderId+"' of undefined type '"+shaderScript.type+"'");
        return null;
    }

    // Create the shader object
    var shader = gl.createShader(shaderType);
    if (shader == null) {
        gl.console.log("*** Error: unable to create shader '"+shaderId+"'");
        return null;
    }

    // Load the shader source
    gl.shaderSource(shader, shaderScript.text);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        // Something went wrong during compilation; get the error
        var error = gl.getShaderInfoLog(shader);
        gl.console.log("*** Error compiling shader '"+shaderId+"':"+error);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

//
// makeBox
//
// Create a box with vertices, normals and texCoords. Create VBOs for each as well as the index array.
// Return an object with the following properties:
//
//  normalObject        WebGLBuffer object for normals
//  texCoordObject      WebGLBuffer object for texCoords
//  vertexObject        WebGLBuffer object for vertices
//  indexObject         WebGLBuffer object for indices
//  numIndices          The number of indices in the indexObject
//
function makeBox(gl)
{
    // box
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    //
    // vertex coords array
    var vertices = new Float32Array(
        [  1, 1, 1,  -1, 1, 1,  -1,-1, 1,   1,-1, 1,    // v0-v1-v2-v3 front
           1, 1, 1,   1,-1, 1,   1,-1,-1,   1, 1,-1,    // v0-v3-v4-v5 right
           1, 1, 1,   1, 1,-1,  -1, 1,-1,  -1, 1, 1,    // v0-v5-v6-v1 top
          -1, 1, 1,  -1, 1,-1,  -1,-1,-1,  -1,-1, 1,    // v1-v6-v7-v2 left
          -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1,    // v7-v4-v3-v2 bottom
           1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1 ]   // v4-v7-v6-v5 back
    );

    // normal array
    var normals = new Float32Array(
        [  0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,     // v0-v1-v2-v3 front
           1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,     // v0-v3-v4-v5 right
           0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,     // v0-v5-v6-v1 top
          -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,     // v1-v6-v7-v2 left
           0,-1, 0,   0,-1, 0,   0,-1, 0,   0,-1, 0,     // v7-v4-v3-v2 bottom
           0, 0,-1,   0, 0,-1,   0, 0,-1,   0, 0,-1 ]    // v4-v7-v6-v5 back
       );


    // texCoord array
    var texCoords = new Float32Array(
        [  1, 1,   0, 1,   0, 0,   1, 0,    // v0-v1-v2-v3 front
           0, 1,   0, 0,   1, 0,   1, 1,    // v0-v3-v4-v5 right
           1, 0,   1, 1,   0, 1,   0, 0,    // v0-v5-v6-v1 top
           1, 1,   0, 1,   0, 0,   1, 0,    // v1-v6-v7-v2 left
           0, 0,   1, 0,   1, 1,   0, 1,    // v7-v4-v3-v2 bottom
           0, 0,   1, 0,   1, 1,   0, 1 ]   // v4-v7-v6-v5 back
       );

    // index array
    var indices = new Uint8Array(
        [  0, 1, 2,   0, 2, 3,    // front
           4, 5, 6,   4, 6, 7,    // right
           8, 9,10,   8,10,11,    // top
          12,13,14,  12,14,15,    // left
          16,17,18,  16,18,19,    // bottom
          20,21,22,  20,22,23 ]   // back
      );

    var retval = { };

    retval.normalObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, retval.normalObject);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    retval.texCoordObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, retval.texCoordObject);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    retval.vertexObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, retval.vertexObject);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    retval.indexObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, retval.indexObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    retval.numIndices = indices.length;

    return retval;
}

//
// makeSphere
//
// Create a sphere with the passed number of latitude and longitude bands and the passed radius.
// Sphere has vertices, normals and texCoords. Create VBOs for each as well as the index array.
// Return an object with the following properties:
//
//  normalObject        WebGLBuffer object for normals
//  texCoordObject      WebGLBuffer object for texCoords
//  vertexObject        WebGLBuffer object for vertices
//  indexObject         WebGLBuffer object for indices
//  numIndices          The number of indices in the indexObject
//
function makeSphere(gl, radius, lats, longs)
{
    var geometryData = [ ];
    var normalData = [ ];
    var texCoordData = [ ];
    var indexData = [ ];

    for (var latNumber = 0; latNumber <= lats; ++latNumber) {
        for (var longNumber = 0; longNumber <= longs; ++longNumber) {
            var theta = latNumber * Math.PI / lats;
            var phi = longNumber * 2 * Math.PI / longs;
            var sinTheta = Math.sin(theta);
            var sinPhi = Math.sin(phi);
            var cosTheta = Math.cos(theta);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1-(longNumber/longs);
            var v = latNumber/lats;

            normalData.push(x);
            normalData.push(y);
            normalData.push(z);
            texCoordData.push(u);
            texCoordData.push(v);
            geometryData.push(radius * x);
            geometryData.push(radius * y);
            geometryData.push(radius * z);
        }
    }

    for (var latNumber = 0; latNumber < lats; ++latNumber) {
        for (var longNumber = 0; longNumber < longs; ++longNumber) {
            var first = (latNumber * (longs+1)) + longNumber;
            var second = first + longs + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first+1);

            indexData.push(second);
            indexData.push(second+1);
            indexData.push(first+1);
        }
    }

    var retval = { };

    retval.normalObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, retval.normalObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);

    retval.texCoordObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, retval.texCoordObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoordData), gl.STATIC_DRAW);

    retval.vertexObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, retval.vertexObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometryData), gl.STATIC_DRAW);

    retval.numIndices = indexData.length;
    retval.indexObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, retval.indexObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);

    return retval;
}

//
// loadObj
//
// Load a .obj file from the passed URL. Return an object with a 'loaded' property set to false.
// When the object load is complete, the 'loaded' property becomes true and the following
// properties are set:
//
//  normalObject        WebGLBuffer object for normals
//  texCoordObject      WebGLBuffer object for texCoords
//  vertexObject        WebGLBuffer object for vertices
//  indexObject         WebGLBuffer object for indices
//  numIndices          The number of indices in the indexObject
//
function loadObj(gl, url)
{
    var obj = { loaded : false };
    obj.gl = gl;
    var req = new XMLHttpRequest();
    req.obj = obj;
    req.onreadystatechange = function () { processLoadObj(req) };
    req.open("GET", url, true);
    req.send(null);
    return obj;
}

function processLoadObj(req)
{
    req.obj.gl.console.log("req="+req)
    // only if req shows "complete"
    if (req.readyState == 4) {
        doLoadObj(req.obj, req.responseText);
    }
}

function doLoadObj(obj, text)
{
    vertexArray = [ ];
    normalArray = [ ];
    textureArray = [ ];
    indexArray = [ ];

    var vertex = [ ];
    var normal = [ ];
    var texture = [ ];
    var facemap = { };
    var index = 0;

    // This is a map which associates a range of indices with a name
    // The name comes from the 'g' tag (of the form "g NAME"). Indices
    // are part of one group until another 'g' tag is seen. If any indices
    // come before a 'g' tag, it is given the group name "_unnamed"
    // 'group' is an object whose property names are the group name and
    // whose value is a 2 element array with [<first index>, <num indices>]
    var groups = { };
    var currentGroup = [-1, 0];
    groups["_unnamed"] = currentGroup;

    var lines = text.split("\n");
    for (var lineIndex in lines) {
        var line = lines[lineIndex].replace(/[ \t]+/g, " ").replace(/\s\s*$/, "");

        // ignore comments
        if (line[0] == "#")
            continue;

        var array = line.split(" ");
        if (array[0] == "g") {
            // new group
            currentGroup = [indexArray.length, 0];
            groups[array[1]] = currentGroup;
        }
        else if (array[0] == "v") {
            // vertex
            vertex.push(parseFloat(array[1]));
            vertex.push(parseFloat(array[2]));
            vertex.push(parseFloat(array[3]));
        }
        else if (array[0] == "vt") {
            // normal
            texture.push(parseFloat(array[1]));
            texture.push(parseFloat(array[2]));
        }
        else if (array[0] == "vn") {
            // normal
            normal.push(parseFloat(array[1]));
            normal.push(parseFloat(array[2]));
            normal.push(parseFloat(array[3]));
        }
        else if (array[0] == "f") {
            // face
            if (array.length != 4) {
                obj.gl.console.log("*** Error: face '"+line+"' not handled");
                continue;
            }

            for (var i = 1; i < 4; ++i) {
                if (!(array[i] in facemap)) {
                    // add a new entry to the map and arrays
                    var f = array[i].split("/");
                    var vtx, nor, tex;

                    if (f.length == 1) {
                        vtx = parseInt(f[0]) - 1;
                        nor = vtx;
                        tex = vtx;
                    }
                    else if (f.length = 3) {
                        vtx = parseInt(f[0]) - 1;
                        tex = parseInt(f[1]) - 1;
                        nor = parseInt(f[2]) - 1;
                    }
                    else {
                        obj.gl.console.log("*** Error: did not understand face '"+array[i]+"'");
                        return null;
                    }

                    // do the vertices
                    var x = 0;
                    var y = 0;
                    var z = 0;
                    if (vtx * 3 + 2 < vertex.length) {
                        x = vertex[vtx*3];
                        y = vertex[vtx*3+1];
                        z = vertex[vtx*3+2];
                    }
                    vertexArray.push(x);
                    vertexArray.push(y);
                    vertexArray.push(z);

                    // do the textures
                    x = 0;
                    y = 0;
                    if (tex * 2 + 1 < texture.length) {
                        x = texture[tex*2];
                        y = texture[tex*2+1];
                    }
                    textureArray.push(x);
                    textureArray.push(y);

                    // do the normals
                    x = 0;
                    y = 0;
                    z = 1;
                    if (nor * 3 + 2 < normal.length) {
                        x = normal[nor*3];
                        y = normal[nor*3+1];
                        z = normal[nor*3+2];
                    }
                    normalArray.push(x);
                    normalArray.push(y);
                    normalArray.push(z);

                    facemap[array[i]] = index++;
                }

                indexArray.push(facemap[array[i]]);
                currentGroup[1]++;
            }
        }
    }

    // set the VBOs
    obj.normalObject = obj.gl.createBuffer();
    obj.gl.bindBuffer(obj.gl.ARRAY_BUFFER, obj.normalObject);
    obj.gl.bufferData(obj.gl.ARRAY_BUFFER, new Float32Array(normalArray), obj.gl.STATIC_DRAW);

    obj.texCoordObject = obj.gl.createBuffer();
    obj.gl.bindBuffer(obj.gl.ARRAY_BUFFER, obj.texCoordObject);
    obj.gl.bufferData(obj.gl.ARRAY_BUFFER, new Float32Array(textureArray), obj.gl.STATIC_DRAW);

    obj.vertexObject = obj.gl.createBuffer();
    obj.gl.bindBuffer(obj.gl.ARRAY_BUFFER, obj.vertexObject);
    obj.gl.bufferData(obj.gl.ARRAY_BUFFER, new Float32Array(vertexArray), obj.gl.STATIC_DRAW);

    obj.numIndices = indexArray.length;
    obj.indexObject = obj.gl.createBuffer();
    obj.gl.bindBuffer(obj.gl.ELEMENT_ARRAY_BUFFER, obj.indexObject);
    obj.gl.bufferData(obj.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), obj.gl.STREAM_DRAW);

    obj.groups = groups;

    obj.loaded = true;
}

//
// loadImageTexture
//
// Load the image at the passed url, place it in a new WebGLTexture object and return the WebGLTexture.
//
function loadImageTexture(gl, url)
{
    var texture = gl.createTexture();
    texture.image = new Image();
    texture.image.onload = function() { 
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.generateMipmap(gl.TEXTURE_2D)
        gl.bindTexture(gl.TEXTURE_2D, null);
    };
    texture.image.src = url;
    return texture;
}