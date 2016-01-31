var bulletPic, myBulletPic;

var Bullet = function (owner, xPos, yPos, angle) {
    this.x = xPos;
    this.y = yPos;
    this.angle = angle;

    // mark bullet to be deleted
    this.kill = false;

    this.size = 5

    this.owner = owner;
};

drawBullet = function(ctx, bullet, socket) {
    // If you own the bullet, draw it as blue
    if (bullet.owner == ('/#' + socket.id)) {
        ctx.drawImage(myBulletPic, bullet.x, bullet.y, bullet.size, bullet.size);
    } else {
        ctx.drawImage(bulletPic, bullet.x, bullet.y, bullet.size, bullet.size);
    }
}

soundBullet = function(ctx, bullet, thisSocketID) {
    // Can make different sounds based on bullet type/bullet owner
    var snd = new Audio("/sounds/Shoot2.wav");
    snd.play();
}
