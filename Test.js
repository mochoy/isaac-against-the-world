var sprite;
var bullets;

var fireRate = 100;
var nextFire = 0;

var gameVar = {
    keyW: null,
    keyA: null,
    keyS: null,
    keyD: null,
    

preload: function() {

    // game.load.image('ducksOnRollerCoasters', 'assets/sprites/arrow.png');
    // game.load.image('mikeWazowskiWithTwoEys', 'assets/sprites/purple_ball.png');
    
    game.load.image("img", "Assets/blood.png");
    
},

create: function() {


    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.startSystem(Phaser.Physics.P2JS);

    game.stage.backgroundColor = '#313131';
    
    sprite = game.add.sprite(100, 100, "img");
    game.physics.p2.enable(sprite);
    sprite.body.static = true;
    sprite.scale.x = .2;
    sprite.scale.y = 0.2;
    // sprite.body.collides(bullets);
    
    bullets = game.add.sprite(300, 100, "img");
    game.physics.p2.enable(bullets);
    sprite.body.static = true;
    bullets.scale.x = .2;
    bullets.scale.y = 0.2;
    // bullets.body.collides(sprite);

    
    this.keyW = game.input.keyboard.addKey(Phaser.Keyboard.W);
    this.keyA = game.input.keyboard.addKey(Phaser.Keyboard.A);
    this.keyS = game.input.keyboard.addKey(Phaser.Keyboard.S);
    this.keyD = game.input.keyboard.addKey(Phaser.Keyboard.D);
   
},

update: function () {
    bullets.body.y = 100;
    
    if (this.keyW.isDown){
        bullets.body.velocity.x -= 10;
    }
    
    if (this.keyS.isDown){
        bullets.body.velocity.x += 10;
    }
    
    if (this.keyA.isDown){
        sprite.body.velocity.x -= 10;
    }
    
    if (this.keyD.isDown){
        sprite.body.velocity.x += 10;
    }



},

render: function() {

    // game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.total, 32, 32);
    // game.debug.spriteInfo(sprite, 32, 450);
    }

}