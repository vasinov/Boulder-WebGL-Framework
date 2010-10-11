var gl;
var canvasObject;
var w = Math.floor(window.innerWidth);
var h = Math.floor(window.innerHeight);

width = -1;
height = -1;

var transl = -50, xOffs = yOffs = 0, drag = 0, xRot = yRot = 0;

const layoutWidth = 5;
const layoutHeight = 4;
const globeSize = 15;

Scene = function(canvas_id, framerate_id)
{
    this.canvas_id = canvas_id;
    this.framerate_id = framerate_id;
    this.create();
}

Scene.prototype.create = function() {
    canvasObject = $('#'+this.canvas_id).get(0);
    gl = init(canvasObject.id);
    canvasObject.width = w;
    canvasObject.height = h;
    
    currentAngles = [ ];
    incAngles = [ ];
    showEarth = [ ];
    
    framerate = new Framerate(this.framerate_id);
    camera = new Camera(canvasObject);
    
    setInterval(function() { drawPicture(gl, canvasObject) }, 10);
}