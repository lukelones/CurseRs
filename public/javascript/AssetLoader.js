assetsLoaded = 0;
assetsToLoad = 3

loadImages = function() {
    //ADD ANY IMAGES TO LOAD HERE.
    //CAN DEFINE IMAGE VAR IN YOUR FILE JUST REFERENCE IT HERE
    //AN BE SURE TO ADD ONTO THE CONSTANT AT THE TOP WHEN YOU ADD ONE

    cursorPic = new Image();
    cursorPic.onload = function() {imageLoaded();};
    cursorPic.src = ('/img/Players-01.png');

    bulletPic = new Image();
    bulletPic.onload = function() {imageLoaded();};
    bulletPic.src = ('/img/Bullet-Basic.png');

    explosionPic = new Image();
    explosionPic.onload = function() {imageLoaded();};
    explosionPic.src = ('/img/Explosion.png');
}

imageLoaded = function() {
    assetsLoaded++;

    //check if all assets are loaded
    if(assetsLoaded == assetsToLoad) {
        fullyLoaded = true;
    }
}
