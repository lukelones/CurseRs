var backgroundPic;

assetsLoaded = 0;
assetsToLoad = 5;

loadImages = function() {
    //ADD ANY IMAGES TO LOAD HERE.
    //CAN DEFINE IMAGE VAR IN YOUR FILE JUST REFERENCE IT HERE
    //AN BE SURE TO ADD ONTO THE CONSTANT AT THE TOP WHEN YOU ADD ONE

    cursorPic = new Image();
    cursorPic.onload = function() {imageLoaded();};
    cursorPic.src = ('/img/Player-01.png');

    bulletPic = new Image();
    bulletPic.onload = function() {imageLoaded();};
    bulletPic.src = ('/img/Bullet-Basic.png');

    myBulletPic = new Image();
    myBulletPic.onload = function() {imageLoaded();};
    myBulletPic.src = ('/img/Bullet-Friendly.png');

    explosionPic = new Image();
    explosionPic.onload = function() {imageLoaded();};
    explosionPic.src = ('/img/Explosion.png');

    tripShotUpPic = new Image();
    tripShotUpPic.onload = function() {imageLoaded();};
    tripShotUpPic.src = ('/img/PowerUpTripleShot.png');

    shieldUpPic = new Image();
    shieldUpPic.onload = function() {imageLoaded();};
    shieldUpPic.src = ('/img/PowerUpShield.png');

    healthUpPic = new Image();
    healthUpPic.onload = function() {imageLoaded();};
    healthUpPic.src = ('/img/PowerUpHealth.png');

    backgroundPic = new Image();
    backgroundPic.onload = function() {imageLoaded();};
    backgroundPic.src = ('/img/Background.png');

    monster0Pic = new Image();
    monster0Pic.onload = function() {imageLoaded();};
    monster0Pic.src = ('/img/Demon1.png');

    monster1Pic = new Image();
    monster1Pic.onload = function() {imageLoaded();};
    monster1Pic.src = ('/img/Demon2.png');

    monster2Pic = new Image();
    monster2Pic.onload = function() {imageLoaded();};
    monster2Pic.src = ('/img/Demon3.png');
}

imageLoaded = function() {
    assetsLoaded++;

    //check if all assets are loaded
    if(assetsLoaded == assetsToLoad) {
        fullyLoaded = true;
    }
}
