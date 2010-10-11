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
        if (ev.shiftKey) {
            transl *= 1 + (ev.clientY - yOffs)/100;
            yRot = - xOffs + ev.clientX;
         } else {
            //currentAngle = - xOffs + ev.clientX;
            yRot = - xOffs + ev.clientX;
            xRot = - yOffs + ev.clientY;
        }
        // xOffs = ev.clientX;    yOffs = ev.clientY;
    }
}