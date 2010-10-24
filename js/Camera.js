Camera = function(canvasObject)
{
    this.canvasObject = canvasObject;
    
    this.canvasObject.onmousedown = function ( ev ){
        drag = 1;
        xOffs = ev.clientX;
        yOffs = ev.clientY;
    }
    this.canvasObject.onmouseup = function ( ev ){
        drag = 0;
        xOffs = ev.clientX;    yOffs = ev.clientY;
        xRot = yRot = 0;
    }
    this.canvasObject.onmousemove = function ( ev ){
        if (drag == 0) return;
        if(ev.shiftKey) {
            scene.zoom += (ev.clientY - ($(window).height() / 2)) / 30;
            if(scene.zoom >= 0) {
                gl.perspectiveMatrix = new J3DIMatrix4();
                gl.perspectiveMatrix.perspective(45, width/height, 0.1, 10000);
                gl.perspectiveMatrix.lookat(0, 0, scene.zoom, 0, 0, 0, 0, 1, 0);
                gl.perspectiveMatrix.rotate(30, 1,0,0);
                gl.perspectiveMatrix.rotate(-30, 0,1,0);
            } else {
                scene.zoom = 0;
            }
         } else {
            yRot = - xOffs + ev.clientX;
            xRot = - yOffs + ev.clientY;
        }
    }
}