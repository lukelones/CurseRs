var explosionPic;

const numExplosionFrames = 8;

var Explosion = function (xPos, yPos) {
    this.x = xPos;
    this.y = yPos;

    this.size = 50;

    this.frame = 0;
};

drawExplosion = function(ctx, explosion) {
    if (explosion.frame >= numExplosionFrames) {
        explosion.frame = -1;
    }

    if (explosion.frame >= 0) {
        ctx.drawImage(explosionPic, explosion.frame * explosion.size, 0,
                      explosion.size, explosion.size, explosion.x, explosion.y,
                      explosion.size, explosion.size);
        explosion.frame++;
    }
}

