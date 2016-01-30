assetsLoaded = 0;
assetsToLoad = 2

loadImages = function() {
    //ADD ANY IMAGES TO LOAD HERE.
    //CAN DEFINE IMAGE VAR IN YOUR FILE JUST REFERENCE IT HERE
    //AN BE SURE TO ADD ONTO THE CONSTANT AT THE TOP WHEN YOU ADD ONE


    // city pics

    cursorPic = new Image();
    cursorPic.onload = function() {imageLoaded();};
    cursorPic.src = ('/img/Player-Blue.png');

    bulletPic = new Image();
    bulletPic.onload = function() {imageLoaded();};
    bulletPic.src = ('/img/Bullet-Basic.png');
}

imageLoaded = function() {
    assetsLoaded++;

    //check if all assets are loaded
    if(assetsLoaded == assetsToLoad) {
        fullyLoaded = true;
    }
}
