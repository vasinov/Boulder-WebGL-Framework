var light_x = new Number(-1);
var light_z = new Number(0);
var light_increment = new Number(0.1);

var my_textures = {};
var my_objects = [];

$(document).ready(function() {
    var moving_light = false;

    $(window).resize(function() {
        $('div.wrapper').css({'height':(($(window).height()))+'px'});
        $('div.wrapper').css({'width':(($(window).width()))+'px'});
        $('div.wrapper').find('canvas#canvas').css({'height':(($(window).height()))+'px'});
        $('div.wrapper').find('canvas#canvas').css({'width':(($(window).width()))+'px'});
    });
    
    $(window).trigger('resize');
    
    $('#buttonZoomIn').click(function(e) {
        scene.zoom -= 5;
        gl.perspectiveMatrix = new J3DIMatrix4();
        gl.perspectiveMatrix.perspective(45, width/height, 0.1, 10000);
        gl.perspectiveMatrix.lookat(0, 0, scene.zoom, 0, 0, 0, 0, 1, 0);
        gl.perspectiveMatrix.rotate(30, 1,0,0);
        gl.perspectiveMatrix.rotate(-30, 0,1,0);
        e.preventDefault();
    });
    
    $('#buttonZoomOut').click(function(e) {
        scene.zoom += 5;
        gl.perspectiveMatrix = new J3DIMatrix4();
        gl.perspectiveMatrix.perspective(45, width/height, 0.1, 10000);
        gl.perspectiveMatrix.lookat(0, 0, scene.zoom, 0, 0, 0, 0, 1, 0);
        gl.perspectiveMatrix.rotate(30, 1,0,0);
        gl.perspectiveMatrix.rotate(-30, 0,1,0);
        e.preventDefault();
    });
    
    $('#buttonStartMovingLight').click(function(e) {
        if(moving_light) {
            moving_light = false;
            clearTimeout(light_timer);
            $('#buttonStartMovingLight').html('Start Moving Light');
        } else {
            moving_light = true;
            $('#buttonStartMovingLight').html('Stop Moving Light');
            light_timer = setInterval(function() {
                gl.uniform3f(gl.getUniformLocation(gl.program, "lightDir"), light_x, 0, light_z);
                if(light_x < 0 && (light_z >= -0.11 && light_z < 1.1)) {
                    light_x = light_x + light_increment;
                    light_z = light_z + light_increment;
                }else if((light_x >= 0 && light_x <= 1) && (light_z >= 0.1)) {
                    light_x = light_x + light_increment;
                    light_z = light_z - light_increment;
                }else if((light_x >= 0) && (light_z >= -1.1 && light_z <= 0.11)) {
                    light_x = light_x - light_increment;
                    light_z = light_z - light_increment;
                    console.log('section 3');
                }else if((light_x >= -1 && light_x <= 0) && (light_z <= 0)) {
                    light_x = light_x - light_increment;
                    light_z = light_z + light_increment;
                }

            }, 10);
        }

        e.preventDefault();
    });
    
    $('#buttonPerspectiveNormal').click(function(e) {
        mouse_rotate = true;
        gl.perspectiveMatrix = new J3DIMatrix4();
        gl.perspectiveMatrix.perspective(45, width/height, 0.1, 10000);
        gl.perspectiveMatrix.lookat(0, 0, 20, 0, 0, 0, 0, 1, 0);
        gl.perspectiveMatrix.rotate(30, 1,0,0);
        gl.perspectiveMatrix.rotate(-30, 0,1,0);
        e.preventDefault();
    });
    
    $('#buttonPerspectiveTop').click(function(e) {
        mouse_rotate = false;
        gl.perspectiveMatrix = new J3DIMatrix4();
        gl.perspectiveMatrix.perspective(1, width/height, 0.1, 10000);
        gl.perspectiveMatrix.lookat(0, 0, 600, 0, 0, 0, 0, 1, 0);
        gl.perspectiveMatrix.rotate(90, 1,0,0);
        e.preventDefault();
    });
    
    $('#buttonPerspectiveSide').click(function(e) {
        mouse_rotate = false;
        gl.perspectiveMatrix = new J3DIMatrix4();
        gl.perspectiveMatrix.perspective(1, width/height, 0.1, 10000);
        gl.perspectiveMatrix.lookat(0, 0, 600, 0, 0, 0, 0, 1, 0);
        gl.perspectiveMatrix.rotate(-90, 0,1,0);
        e.preventDefault();
    });
    
    $('#buttonRemoveOneObject').click(function(e) {
        my_objects.pop()
        e.preventDefault();
    });
    
    // manually add objects to the objects array
    my_objects = [
        "'box', 45, 0, 2, 0, 1, buildingTexture,'UNSIGNED_BYTE'",
        "'sphere', 0, 0, 4, 0, 1, sphereTexture, 'UNSIGNED_SHORT'"
    ];
    
    // or add objects to the objects array in a for-loop;
    // any object can be accessed later
    for(var i = -5; i <= 5; i++) {
        my_objects.push("'box', 45, "+3*i+", 0, 0, 1, buildingTexture,'UNSIGNED_BYTE'");
        my_objects.push("'box', 45, 0, 0, "+3*i+", 1, buildingTexture,'UNSIGNED_BYTE'");
        my_objects.push("'sphere', 0, "+3*i+", 2, 0, 1, sphereTexture,'UNSIGNED_SHORT'");
        my_objects.push("'sphere', 0, 0, 2, "+3*i+", 1, sphereTexture,'UNSIGNED_SHORT'");
    }
    
    // add textures to the textures associative array
    my_textures = {
        sphereTexture : "textures/default.png",
        buildingTexture : "textures/building-1.png"
    };
    
    // create a new scene with the canvas object id, framerate div id,
    // array of 3D objects, associative array of textures, and default zoom
    scene = new Scene('canvas', 'framerate', my_objects, my_textures, 45);
});