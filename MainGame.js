//MainGame.js 1-8-2016 JChoy setIdiot members
//var centerGameX = game.world.centerX;
//var centerGameY = game.world.centerY;

//var g = {
////    cx:400,
////    cy:300
//}

//-----
function OOCallback(obj,meth,arg){
	var _pt= this;
	_pt.obj = obj;
	_pt.meth = meth;
	_pt.arg = arg;
	this.fcn= function(a,b,c,d,e){ _pt.obj[_pt.meth](a,b,c,d,e); }
	this.fcna= function(b,c,d){ _pt.obj[_pt.meth](_pt.arg,b,c,d);}
}
function Cloner(o){
	this.copy = {};
	for (var m in o) this.copy[m]= o[m];
}
function Flagger(o, flagName){
	this.client = o;
	this.flagName = (flagName) ? flagName : "isRunning";
	this.set= function(){ this.client[this.flagName]= true }
	this.clear= function(){ this.client[this.flagName]= false }
}
function CanFlagger(o){
	this.constructor= Flagger;
	this.constructor(o, "canPlayAnimation");
}

var hi, enemyTest, enemyTest2P2, enemyTest2P1;
var paused;
var inter = 1, bloodToSpawn = 1;
var enemyTest2ArrayP1 = new Array();
var enemyTest2ArrayP2 = new Array();

var helper = {
    totalEnemySpawned: 0,
    splatArray: new Array(),
    bulletArrayP1: new Array(),
    bulletArrayP2: new Array(),
    
    bullets: null,
    bulletsP2: null
    
   /*helper.splatArray = new Array();
   helper.bulletArrayP1 = new Array();
   helper.bulletArrayP2 = new Array();

   helper.bullets = null;
   helper.bulletsP2 = null; */
}

var selector = {
    nextUp: function(){
        if(this.curNum >= this.images.length){
            this.curNum = 0;
        }
        return this.images[this.curNum++];
    },
    images: ["bloodTest1", "bloodTest2", "bloodTest3"],
    curNum: 0,
}

function EnemyCollider(){
    this.check = function (enemyArrayPx, collideFun){
        enemyArrayPx.sort(this.compareX);
        for (var i = 1, j = 0; i < enemyArrayPx.length; i++){
            for(var k = j; k < i; k++){
                collideFun(enemyArrayPx[i], enemyArrayPx[k]);
            }
            if (enemyArrayPx[i].body.x - enemyArrayPx[j].body.x > 30){
                j++;
            }
            if (enemyArrayPx[i].body.x - enemyArrayPx[j].body.x > 30){
                j++;
            }
        }
    }
    this.compareX = function(objectA, objectB){
        return objectA.body.x - objectB.body.y;
    }
}

var enemyCollider1 = new EnemyCollider();

var gunP1Stuff = {
    //stupid members, some code knows these as xxP1 or xxP2.
    numOfGuns: 4,
    currentGun: 1,
    currentGunNum: 1,
    fireRate: null,
    explosionArray: new Array(),
    //normal members
    explosion: null,
    bulletsToSpawn: 1,
    images: ["pistolIMG", "shotgunIMG", "machineGunIMG", "rocketLauncherIMG"],
    weaponInaccuracy: 100,      //higher = more inaccurate
    // pistolBullets: 25,
    shotgunBullets: 25,
    machineGunBullets: 100,
    rocketBullets: 10,
    setIdiotMembers: function(suf){
  	for (var m in this) this[m+"suf"] = this[m];
    },
    
    switchGuns: function(){
        if (this.currentGunP1 > 16 ){
            this.currentGunP1 = 1;
            console.log("fds");
        } else if (this.currentGunP1 <= 0){
            this.currentGunP1 = 16;
            console.log("yuyju");
        }
        if(this.currentGunP1 >= 1 && this.currentGunP1 <= 4){
            this.bulletsToSpawn = 1;
            this.fireRateP1 = 300;
            this.currentGunNumP1 = 1;
            this.weaponInaccuracy = 100;
            console.log("current gun is Pistol");
            return this.images[0];
        } else if (this.currentGunP1 >= 5 && this.currentGunP1 <= 8){
            this.bulletsToSpawn = 5;
            this.fireRateP1 = 500;
            this.currentGunNumP1 = 2;
            this.weaponInaccuracy = 1000;
            console.log("current gun is shotgun");
            return this.images[1];
        } else if (this.currentGunP1 >= 9 && this.currentGunP1 <= 12){
            this.bulletsToSpawn = 1;
            this.fireRateP1 = 50;
            this.currentGunNumP1 = 3;
            this.weaponInaccuracy = 250;
            console.log("current gun is machine gune");
            return this.images[2];
        } else {
            console.log("current gun is rocket launcher");
            this.bulletsToSpawn = 1;
            this.fireRateP1 = 750;
            this.currentGunNumP1 = 4;
            this.weaponInaccuracy = 300;
            this.weaponInaccuracy = 400;
            return this.images[3];
        }
    }
}

var gunP2Stuff = new Cloner(gunP1Stuff).copy
gunP1Stuff.setIdiotMembers("P1");
gunP2Stuff.setIdiotMembers("P2");


var p1Stuff = {
  maxHealth: 100,
  healthBarRed: null,
  healthBarGreen: null,
  totalKilled: 0,
  totalDMGTaken: 0
  setIdiotMembers: function(suf){
  	for (var m in this) this[m+"suf"] = this[m];
  }
}

var p2Stuff = new Cloner(p1Stuff).copy;
p1Stuff.setIdiotMemebers("P1");
p2Stuff.setIdiotMemebers("P2");

var enemyCollisionGroup, bulletCollisionGroup;
var bulletTime = 0;
var hiFacingDirection = 0, p2FacingDirection = 0; //0 = up, 1 = down, 2 = right, 3 = left

var fireRate = 100;
var nextFire = 0, scoreP1 = 0, healthP1 = 100;
var scoreP2 = 0, healthP2 = 100;

var healthTXTP1, scoreTXTP1, healthTXTP2, scoreTXTP2;

var keyW, keyA, keyS, keyD, keyV, keyP, keyK, keyL, keyJ, keyQ, keyE, keyC, keyB, keyT;
//You need to go cold turkey and stop declaring ANY more global variables.

var gameVar = {
    gameState: 0, //0 = start menu, 1 = in game, 3 = dead
    mainMenuScreem: null,
    deadScreen: null,
    startButton: null,
    retryButton: null,
    explosionSound: null,
    pistolSound: null,
    shotgunSound: null,
    walkingSound: null,
    zombieSoun: null,
    machineGunSound: null,
    rocketLaunchSound: null,
    p1GunStuffText: null,
    p2GunStuffText: null,
    enemySpawnLimit: 50,
    i: 0,
    w: 0,
    
    preload: function () {
        game.load.image("testIMG", 'Assets/ducksOnRollerCoasters.jpeg');
        game.load.image("zombieIMG", "Assets/mikeWazowskiWithTwoEyes.jpeg");
        game.load.image("bulletsIMG", "Assets/peanuts.jpeg");
        game.load.image("player2IMG","Assets/annieHasNoFriendsAcceptForNellyNell.jpeg");
        
        game.load.image("blood1IMG", "Assets/blood1.png");
        game.load.image("blood2IMG", "Assets/blood2.png");
        game.load.image("blood3IMG", "Assets/blood3.png");
        
        game.load.image("bloodTest1","Assets/bloodSplatTest1.jpg");
        game.load.image("bloodTest2","Assets/bloodSplatTest2.jpg");
        game.load.image("bloodTest3","Assets/bloodSplatTest3.jpg");
        
        game.load.image("blood", "Assets/blood.png");
        
        game.load.image("gunTest1", "Assets/gunTest1.jpg");
        game.load.image("gunTest2", "Assets/gunTest2.jpg");
        
        game.load.image("bulletIMG", "Assets/bullet.png");
        
        game.load.image("pistolIMG", "Assets/pistol.png");
        game.load.image("shotgunIMG", "Assets/shotgun.png");
        game.load.image("machineGunIMG", "Assets/machineGun.png");
        game.load.image("rocketLauncherIMG", "Assets/rocketLauncher.png");
        
        game.load.image("mainMenuIMG", "Assets/startMenu.png");
        game.load.image("deathScreenIMG", "Assets/deadMenu.png");
        
        game.load.image("p1Win", "Assets/p1Win.png");
        game.load.image("p2Win", "Assets/p2Win.png");
        
        game.load.image("healthBarRedIMG", "Assets/healthBarRed.jpg");
        game.load.image("healthBarGreenIMG", "Assets/healthBarGreen.jpg");
         
        game.load.spritesheet("p1Anim", "Assets/player1SS.png", 256, 256);
        game.load.spritesheet("p2Anim", "Assets/player2SS.png", 256, 256);
                
        game.load.spritesheet("zombieAtkAnim", "Assets/zombieAttack.png", 256, 256);
        
        game.load.spritesheet("zombieAnim", "Assets/zombieSS.png", 256, 256);
        game.load.spritesheet("explosionAnim", "Assets/boomSS.png", 400, 400);
        
        game.load.spritesheet("exitButton", "Assets/exitButton.png", 464, 176 );
        game.load.spritesheet("startButton", "Assets/startButton.png", 416, 176 );
        game.load.spritesheet("retryButton", "Assets/retryButton.png", 432, 144);
        
        game.load.audio('pistolSound', 'Assets/Audio/pistolSound.mp3');
        game.load.audio('explosionSound', 'Assets/Audio/explosionSound.mp3');
        game.load.audio('shotgunSound', 'Assets/Audio/shotgunSound.mp3');
        game.load.audio('walkingSound', 'Assets/Audio/walkingSound.mp3');
        game.load.audio('zombieSound', 'Assets/Audio/zombieSound.mp3');
        game.load.audio('machineGunSound', 'Assets/Audio/machineGunSound.mp3');
        game.load.audio('rocketLaunchSound', 'Assets/Audio/rocketLaunchSound.mp3');


    },

    create: function() {
//        game.physics.startSystem(Phaser.Physics.P2JS);
//        game.physics.p2.setImpactEvents(true);
//        game.physics.p2.restitution = 0.8;
        
//        button = game.add.button(game.world.centerX - 95, 400, 'p1Anim', null, this, 1, 0, 2, 3);

//        button.onInputOver.add(over, this);
//        button.onInputOut.add(out, this);
//        button.onInputUp.add(up, this);
        
        this.explosionSound  = game.add.audio('explosionSound');
        this.pistolSound = game.add.audio('pistolSound');
        this.shotgunSound = game.add.audio('shotgunSound');
        
        this.walkingSound = game.add.audio('walkingSound');
        this.zombieSound = game.add.audio('zombieSound');
        this.machineGunSound = game.add.audio('machineGunSound');
        this.rocketLaunchSound = game.add.audio('rocketLaunchSound');
        
        this.drawGame();
        
        game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);
        cursors = game.input.keyboard.createCursorKeys();
        
        keyW = game.input.keyboard.addKey(Phaser.Keyboard.W);
        keyA = game.input.keyboard.addKey(Phaser.Keyboard.A);
        keyA = game.input.keyboard.addKey(Phaser.Keyboard.A);
        keyS = game.input.keyboard.addKey(Phaser.Keyboard.S);
        keyD = game.input.keyboard.addKey(Phaser.Keyboard.D);
        keyV = game.input.keyboard.addKey(Phaser.Keyboard.V);
        keyP = game.input.keyboard.addKey(Phaser.Keyboard.P);
        keyK = game.input.keyboard.addKey(Phaser.Keyboard.K);
        keyL = game.input.keyboard.addKey(Phaser.Keyboard.L);
        keyJ = game.input.keyboard.addKey(Phaser.Keyboard.J);
        keyQ = game.input.keyboard.addKey(Phaser.Keyboard.Q);
        keyE = game.input.keyboard.addKey(Phaser.Keyboard.E);
        keyC = game.input.keyboard.addKey(Phaser.Keyboard.C);
        keyB = game.input.keyboard.addKey(Phaser.Keyboard.B);
        
        game.stage.backgroundColor = 0xffffff;
    },
    
    drawGame: function() {
        if (this.gameState == 0){
            console.log("drawing game phase 0");
            this.mainMenuScreen = game.add.sprite(0, 0, "mainMenuIMG");
            
            this.startButton = game.add.button(game.world.centerX - 170, 385, 'startButton', startGame, this, 3, 2, 1, 0);
        }

        else if (this.gameState == 1){
            console.log("drawing game phase 1");
            
            hi = game.add.sprite(game.world.centerX*4/3, game.world.centerY, "p1Anim");
            game.physics.arcade.enable(hi);
            hi.body.collideWorldBounds = true;
            hi.frame = 1;
            hi.scale.x = .25;
            hi.scale.y = .25;
            hi.anchor.setTo(0.5);
            hi.animations.add('walkP1', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], 40, true);

            gunP1Stuff.gun1P1 = game.add.sprite(-25 + hi.body.width/2, -75, "pistolIMG");
            game.physics.arcade.enable(gunP1Stuff.gun1P1);
    //        gunP1Stuff.gun1P1.body.collideWorldBounds = true;
            gunP1Stuff.gun1P1.scale.x = .3;
            gunP1Stuff.gun1P1.scale.y = .3;
            gunP1Stuff.gun1P1.anchor.setTo(.5);
            gunP1Stuff.gun1P1.angle = 0;
            hi.addChild(gunP1Stuff.gun1P1);
            gunP1Stuff.gun1P1.nextFire = 0;
            gunP1Stuff.gun1P1.fireRate = 300;
            gunP1Stuff.gun1P1.fireRateP1 = 300;
            gunP1Stuff.fireRateP1 = 300;
            gunP1Stuff.weaponInaccuracy = 100;
            gunP1Stuff.currentGunP1  = 1;
            gunP1Stuff.currentGunNumP1 = 1;
            
            hiFacingDirection = 0;
            
            p1Stuff.healthBarRed = game.add.sprite (450, 30, "healthBarRedIMG");
            p1Stuff.healthBarRed.scale.y = 0.2;
            
            p1Stuff.healthBarGreen = game.add.sprite(450, 30, "healthBarGreenIMG")
            p1Stuff.healthBarGreen.scale.y = 0.2;



            p2 = game.add.sprite(game.world.centerX/3 , game.world.centerY, "p2Anim");
            game.physics.arcade.enable(p2);
            p2.body.collideWorldBounds = true;
            p2.scale.x = .25;
            p2.scale.y = .25;
            p2.anchor.setTo(0.5);
            p2.animations.add('walkP2', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], 40, true);

            gunP2Stuff.gun1P2 = game.add.sprite(-25 + p2.body.width/2, -75, "pistolIMG")
            game.physics.arcade.enable(gunP2Stuff.gun1P2);
    //        gunP2Stuff.gun1P2.body.collideWorldBounds = true;
            gunP2Stuff.gun1P2.scale.x = .3;
            gunP2Stuff.gun1P2.scale.y = .3;
            gunP2Stuff.gun1P2.anchor.setTo(.5);
            gunP2Stuff.gun1P2.angle = 0;
            p2.addChild(gunP2Stuff.gun1P2);
            gunP2Stuff.gun1P2.nextFire = 0;
            gunP2Stuff.gun1P2.fireRate = 300;
            gunP2Stuff.gun1P2.fireRateP2 = 300;
            gunP2Stuff.fireRateP2 = 300;
            gunP2Stuff.weaponInaccuracy = 100;
            gunP2Stuff.currentGunP2  = 1;
            gunP2Stuff.currentGunNumP2 = 1;
            
            p2FacingDirection = 0;
            
            p2Stuff.healthBarRed = game.add.sprite (50, 30, "healthBarRedIMG");
            p2Stuff.healthBarRed.scale.y = 0.2;
            
            p2Stuff.healthBarGreen = game.add.sprite(50, 30, "healthBarGreenIMG")
            p2Stuff.healthBarGreen.scale.y = 0.2;

            this.p1GunStuffText = game.add.text(575, 475, "Pistol ", { font: '28px Arial', fill: '#ffffff' });
            this.p1GunStuffText.fill = "black";
            scoreTXTP1 = game.add.text(575, 500, 'Score: ' + scoreP1, { font: '28px Arial', fill: '#ffffff' });
            scoreTXTP1.fill = "black";
            // healthTXTP1 = game.add.text(575, 525, 'Health: ' + healthP1, { font: '28px Arial', fill: '#ffffff' });
            // healthTXTP1.fill = "black";

            this.p2GunStuffText = game.add.text(100, 475, "Pistol ", { font: '28px Arial', fill: '#ffffff' });
            this.p2GunStuffText.fill = "black";
            scoreTXTP2 = game.add.text(100, 500, 'Score: ' + scoreP2, { font: '28px Arial', fill: '#ffffff' });
            scoreTXTP2.fill = "black";
            // healthTXTP2 = game.add.text(100, 525, 'Health: ' + healthP2, { font: '28px Arial', fill: '#ffffff' });
            // healthTXTP2.fill = "black";
            
            healthP1 = 100;
            healthP2 = 100;
            
            scoreP1 = 0;
            scoreP2 = 0;
            
               // pistolBullets: 25,
            gunP1Stuff.shotgunBullets = 25;
            gunP1Stuff.machineGunBullets = 100;
            gunP1Stuff.rocketBullets = 10;
            
            gunP2Stuff.shotgunBullets = 25;
            gunP2Stuff.machineGunBullets = 100;
            gunP2Stuff.rocketBullets = 10;
            
            // healthTXTP1.text = "Health: " + healthP1;
            // healthTXTP2.text = "Health: " + healthP2;
            
            scoreTXTP1.text = "Score: " + scoreP1;
            scoreTXTP2.text = "Score: " + scoreP2;

            enemySpawnTimer = game.time.events.loop(Phaser.Timer.SECOND, this.spawnNewEnemy, this);

            enemyTest = game.add.sprite(300, 300, "blood1IMG");
    //        game.physics.p2.enable(enemyTest, false);
            enemyTest.scale.x = .2;
            enemyTest.scale.y = .2;
            enemyTest.anchor.setTo(.5);
            enemyTest.kill();
            
            
            if (this.retryButton != null){
                this.retryButton.kill();
            }
            if (this.startButton != null){
                this.startButton.kill();
            }
            
        }
    
        else if (this.gameState == 2){
            console.log("drawing game phase 2");
//            this.deadScreen = game.add.sprite(0, 0, "p1Win");
            this.deadScreen = game.add.sprite(0, 0, "p1Win");
            this.deadScreen.scale.x = 1.5;
            this.deadScreen.scale.y = 1.25;
            
            if (healthP1 <= 0){
                this.deadScreen.kill();
                this.deadScreen = game.add.sprite(0, 0, "p2Win");
                this.deadScreen.scale.x = 1.5;
                this.deadScreen.scale.y = 1.25;
                console.log("p2 win");
            }
            
            this.p1GunStuffText.kill();
            this.p2GunStuffText.kill();
            
            p1Stuff.healthBarRed.kill();
            p1Stuff.healthBarGreen.kill();
            
            p2Stuff.healthBarRed.kill();
            p2Stuff.healthBarGreen.kill();

            console.log("player 1");
            this.retryButton = game.add.button(game.world.centerX - 200, 400, 'retryButton', startGame, this, 3, 2, 1, 0);
            
            this.enemySpawnLimit = 50;
            

        }
    },
    
    spawnNewEnemy: function(){
        for (var ToSpawn = 0; ToSpawn < 5; ToSpawn++){
            if (inter%2 == 1){
                inter ++;
                enemyTest2P1 = game.add.sprite(game.world.randomX + game.width, game.world.randomY + game.height, "zombieAnim");
                enemyTest2P1.scale.x = .2;
                enemyTest2P1.scale.y = .2;
                enemyTest2P1.anchor.setTo(.5);
                game.physics.arcade.enable(enemyTest2P1);

                enemyTest2P1.isDead = false;

                enemyTest2ArrayP1.push(enemyTest2P1);

                enemyTest2P1.animations.add('walkZombieP1', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], 40, true);
                // enemyTest2P1.animations.add('zombieAtkAnim', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 40, false);
    //            var enemyTest2P1AtkAnim = enemyTest2P1.animations.add("zombieAtkAnim", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 40, false);
                enemyTest2P1.animations.play("walkZombieP1");

            } else {
                enemyTest2P2 = game.add.sprite(game.world.randomX - game.width, game.world.randomY - game.height, "zombieAnim");
                enemyTest2P2.scale.x = .2;
                enemyTest2P2.scale.y = .2;
                enemyTest2P2.anchor.setTo(.5);
                game.physics.arcade.enable(enemyTest2P2);

                enemyTest2P2.isDead = false;

                enemyTest2ArrayP2.push(enemyTest2P2);
                inter ++;

                enemyTest2P2.animations.add('walkZombieP2', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], 40, true);
    //            enemyTest2P1.animations.add('zombieAtkAnim', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 40, false);
        //            var enemyTest2P2AtkAnim = enemyTest2P1.animations.add("zombieAtkAnim");
                enemyTest2P2.animations.play("walkZombieP2");
            }
            helper.totalEnemySpawned ++;
            // this.enemySpawnLimit ++;
            
        }
        
        this.reDrawEveryThing();

    },
    
    bulletHasHitEnemyP1: function(bullet, enemy){
/*        debugger;
        var ranNumBloodSpawn = Math.ranßßß≈sßdom();
        if (ranNumBloodSpawn <= 0.3){
            var bloodSplat = game.add.sprite(enemyTest.body.x , enemyTest.body.y , "blood1IMG");
            bloodSplat.scale.x = .25;
            bloodSplat.scale.x = .25;
            console.log("blood1 spawned");
            //blood1 spawned
        } else if (ranNumBloodSpawn <= 0.6){
            var bloodSplat = game.add.sprite(enemyTest.body.x , enemyTest.body.y , "blood2IMG");
            bloodSplat.scale.x = .25;
            bloodSplat.scale.x = .25;
            console.log("blood2 spawned");
            //blood2 spawned
        } else {
            var bloodSplat = game.add.sprite(enemyTest.body.x , enemyTest.body.y , "blood3IMG");
            bloodSplat.scale.x = .25;
            bloodSplat.scale.x = .25;
            console.log("blood3 spawned");
            //blood3 spawned
        }*/

        console.log("hit");
        
        if (bullet == helper.bullets && gunP1Stuff.currentGunNumP1 == 4){
            gunP1Stuff.explosion = game.add.sprite(enemy.body.x, enemy.body.y, "explosionAnim");
            game.physics.arcade.enable(gunP1Stuff.explosion);
            gunP1Stuff.explosion.scale.x = .25;
            gunP1Stuff.explosion.scale.y = .25;
            gunP1Stuff.explosion.anchor.setTo(0.5);
            gunP1Stuff.explosion.animations.add('explodeAnim', [0, 1, 2, 3, 4, 5, 6], 10, false);
            explosionAnim = gunP1Stuff.explosion.animations.play('explodeAnim');
            explosionAnim.killOnComplete = true;
            
            gunP1Stuff.explosionArrayP1.push(gunP1Stuff.explosion);
            
            this.explosionSound.play();
        } else if (bullet == helper.bulletsP2 && gunP2Stuff.currentGunNumP2 == 4){
            gunP2Stuff.explosion = game.add.sprite(enemy.body.x, enemy.body.y, "explosionAnim");
            game.physics.arcade.enable(gunP2Stuff.explosion);
            gunP2Stuff.explosion.scale.x = .25;
            gunP2Stuff.explosion.scale.y = .25;
            gunP2Stuff.explosion.anchor.setTo(0.5);
            gunP2Stuff.explosion.animations.add('explodeAnim', [0, 1, 2, 3, 4, 5, 6], 10, false);
            explosionAnim = gunP2Stuff.explosion.animations.play('explodeAnim');
            explosionAnim.killOnComplete = true;
            
            gunP2Stuff.explosionArrayP2.push(gunP2Stuff.explosion);
            
            this.explosionSound.play();
        }
        
//        if (gunP1Stuff.currentGunNumP1 == 4){
//            var explosion = game.add.sprite(enemy.body.x, enemy.body.y, "explosionAnim");
//            game.physics.arcade.enable(explosion);
//            explosion.scale.x = .25;
//            explosion.scale.y = .25;
//            explosion.anchor.setTo(0.5);
//            explosion.animations.add('explodeAnim', [0, 1, 2, 3, 4, 5, 6], 10, false);
//            explosion.animations.play('explodeAnim');
//
//            explosionArrayP1.push(explosion);
//        }
        
        var bloodSpat = game.add.sprite(enemy.body.x,enemy.body.y, "blood");
        bloodSpat.scale.x = .2;
        bloodSpat.scale.y = .2;
        helper.splatArray.push(bloodSpat);

/*        if (bloodToSpawn == 1){
            var bloodSplat = game.add.sprite(0, 0 , "zombieIMG");
            bloodSplat.scale.x = .2;
            bloodSplat.scale.x = .2;
            console.log("blood1 spawned");
            helper.splatArray.push(bloodSplat);
            //blood1 spawned
            bloodToSpawn ++;
        } else if (bloodToSpawn == 2){
            var bloodSplat = game.add.sprite(0 ,0 , "zombieIMG");
            bloodSplat.scale.x = .2;
            bloodSplat.scale.x = .2;
            console.log("blood2 spawned");
            helper.splatArray.push(bloodSplat);
            //blood1 spawned
            bloodToSpawn ++;
        } else {
            var bloodSplat = game.add.sprite(0 , 0 , "zombieIMG");
            bloodSplat.scale.x = .2;
            bloodSplat.scale.x = .2;
            console.log("blood3 spawned");
            helper.splatArray.push(bloodSplat);
            //blood1 spawned
            bloodToSpawn = 1;
        } */

        enemy.kill();
        bullet.kill();
        
        if (bullet == helper.bullets){
            scoreP1 += 5;
            scoreTXTP1.text = "Score: " + scoreP1;
            p1Stuff.totalKilledP1 ++;
        }    else {
            scoreP2 += 5;
            scoreTXTP2.text = "Score: " + scoreP2;
            p2Stuff.totalKilledP2 ++;
        }

        this.reDrawEveryThing();
        
//        enemyTest2 = game.add.sprite(300, 300, "zombieIMG");
////        game.physics.p2.enable(enemyTest, false);
//        enemyTest2.scale.x = .2;
//        enemyTest2.scale.y = .2;
//        enemyTest2.anchor.setTo(.5);
//        game.physics.arcade.enable(enemyTest2);
//
//        //new enemy spawned
    },
    
    explosionHasHitEnemy: function(explosion, enemy){
        if (explosion == gunP1Stuff.explosion){
            scoreP1 += 5;
            scoreTXTP1.text = "Score: " + scoreP1;
            p1Stuff.totalKilledP1 ++;
        } else {
            scoreP2 += 5;
            scoreTXTP2.text = "Score: " + scoreP2;
            p2Stuff.totalKilledP2 ++;
        }
        enemy.kill();
        
        var bloodSpat = game.add.sprite(enemy.body.x,enemy.body.y, "blood");
        bloodSpat.scale.x = .2;
        bloodSpat.scale.y = .2;
        helper.splatArray.push(bloodSpat);
    },
    
    player1HitEnemy: function(player, enemy){
      // enemy.play("enemyTest2P1AtkAnim");

      if (!enemy.isRunning) {
      	var fl = new Flagger(enemy);
      	fl.set();	//isRunning=true;
      	setTimeout( new OOCallback(fl,"clear").fcn, 2000 );	//isRunning=false;
      	
        enemy.loadTexture("zombieAtkAnim", 0);
        anim = enemy.animations.add("attackAnim");
        enemy.animations.play("attackAnim", 40, false);
        
        enemy.events.onAnimationComplete.add( new OOCallback(fl,"clear").fcn, this );
        enemy.events.onAnimationComplete.add(function(){
  			  console.log("complete");
  			  if (player == hi){
              healthP1 -= 5;
              p1Stuff.totalDMGTakenP1 += 5;
              // healthTXTP1.text = "Health: " + healthP1;
              scoreTXTP1.text = "Score: " + scoreP1;
              p1Stuff.healthBarGreen.scale.x = healthP1/p1Stuff.maxHealth;
          } else {
              healthP2 -= 5;
              p2Stuff.totalDMGTakenP2 += 5;
              // healthTXTP2.text = "Health: " + healthP2;
              scoreTXTP2.text = "Score: " + scoreP2;
              p2Stuff.healthBarGreen.scale.x = healthP2/p2Stuff.maxHealth;
          }
          enemy.loadTexture("zombieAnim", 0);
          enemy.animations.add('walkZombieP2');
          enemy.animations.play("walkZombieP2", 40, true);

  		  }, this);
      }//if
		  
    },
    
    playerDead: function(player){
        
    },
    
    reDrawEveryThing: function(){
        // healthTXTP1.bringToTop();
        scoreTXTP1.bringToTop();
       
        // healthTXTP2.bringToTop();
        scoreTXTP2.bringToTop();
        
        hi.bringToTop();
        p2.bringToTop();
        
        this.p1GunStuffText.bringToTop();
        this.p2GunStuffText.bringToTop();
        
        p1Stuff.healthBarRed.bringToTop();
        p1Stuff.healthBarGreen.bringToTop();
        
        p2Stuff.healthBarRed.bringToTop();
        p2Stuff.healthBarGreen.bringToTop();
        
    },
    
/*    checkOverlap: function(sprite1, sprite2){
        console.log("dsfas");

        var spriteA = sprite1.getBounds();
        var spriteB = sprite2.getBounds();

        return Phaser.Rectangle.intersects(spriteA, spriteB);
        
    }, */

    update: function() {
        if (this.gameState == 0){
//            this.drawGame();
//            if (keyE.isDown){
//                this.gameState = 1;
//                this.drawGame();
//            }
        }
        
        if (this.gameState == 1){
//            if (keyP.isDown){
//                paused = !paused;
//            }

            if (!paused){
//                this.drawGame();
                game.physics.arcade.enable(enemyTest);

                hi.body.velocity.x = 0;
                hi.body.velocity.y = 0;

                p2.body.velocity.x = 0;
                p2.body.velocity.y = 0;
                
                if (this.mainMenuScreen != null){
                    this.mainMenuScreen.kill();
                }
                
                if (this.deadScreen != null){
                    this.deadScreen.kill();
                }

                //controls
                if (keyK.isDown){
                    if (gunP1Stuff.gun1P1.game.time.time > gunP1Stuff.gun1P1.nextFire){
                        for (var i = 0; i < gunP1Stuff.bulletsToSpawn; i++){
                            var bulletSpawnX, bulletSpawnY;
                            
                            if (hiFacingDirection == 0){
                                bulletSpawnX = hi.body.x + hi.body.width;
                                bulletSpawnY = hi.body.y;
                            } else if (hiFacingDirection == 1 ){
                                bulletSpawnX = hi.body.x;
                                bulletSpawnY = hi.body.y + hi.body.width;
                            } else if (hiFacingDirection == 2 ){
                                bulletSpawnX = hi.body.x + hi.body.width;
                                bulletSpawnY = hi.body.y + hi.body.width;
                            } else if (hiFacingDirection == 3 ){
                                bulletSpawnX = hi.body.x;
                                bulletSpawnY = hi.body.y ;
                            }
                        
                            helper.bullets = game.add.sprite(bulletSpawnX , bulletSpawnY , "bulletIMG");
                            game.physics.arcade.enable(helper.bullets);
                            
                            if (hiFacingDirection == 0){
                                helper.bullets.body.velocity.y = -2000;
                                helper.bullets.angle = 0;
                            } else if (hiFacingDirection == 1 ){
                                helper.bullets.body.velocity.y = 2000;
                                helper.bullets.angle = 180;
                            } else if (hiFacingDirection == 2 ){
                                helper.bullets.body.velocity.x = 2000;
                                helper.bullets.angle = 90;
                            } else if (hiFacingDirection == 3 ){
                                helper.bullets.body.velocity.x = -2000;
                                helper.bullets.angle = 270;
                            }
                            
                            if (gunP1Stuff.currentGunNumP1 == 4){
                              console.log("current gun is rocket");
                              helper.bullets.scale.x = 0.04;
                              helper.bullets.scale.y = 0.08;
                            } else {
                              helper.bullets.scale.x = .02;
                              helper.bullets.scale.y = .04;
                            }
                            
                            helper.bullets.outOfBoundsKill = true;
                            helper.bulletArrayP1.push(helper.bullets);
                            
                            if (gunP1Stuff.currentGunNumP1  == 1 ){
                              this.p1GunStuffText.text = "Pistol";
                              this.pistolSound.play();
                            } else if (gunP1Stuff.currentGunNumP1 == 2){
                              this.shotgunSound.play();
                              gunP1Stuff.shotgunBullets -= 0.2;
                              this.p1GunStuffText.text = "Shotgun: " + Math.floor(gunP1Stuff.shotgunBullets);
                            } else if (gunP1Stuff.currentGunNumP1 == 3){
                              this.machineGunSound.play();
                              gunP1Stuff.machineGunBullets --;
                              this.p1GunStuffText.text = "Machine Gun: " + gunP1Stuff.machineGunBullets;
                            } else if (gunP1Stuff.currentGunNumP1 == 4){
                              this.rocketLaunchSound.play();
                              gunP1Stuff.rocketBullets --;
                              this.p1GunStuffText.text = "RPG: " + gunP1Stuff.rocketBullets;
                            }
                            
                            if (i <= 0) {
                              if ( (hiFacingDirection == 0)||(hiFacingDirection == 1) ){
                                helper.bullets.body.velocity.x = gunP1Stuff.weaponInaccuracy*(Math.random() - 0.5);
                              } else {
                                helper.bullets.body.velocity.y = gunP1Stuff.weaponInaccuracy*(Math.random() - 0.5);
                              }
                            }

                            if ((i > 0) && ((hiFacingDirection == 0)||(hiFacingDirection == 1))) {
                                helper.bullets.body.velocity.x = gunP1Stuff.weaponInaccuracy*(Math.random()- 0.5);

                            } else if (i > 0) {
                                helper.bullets.body.velocity.y = gunP1Stuff.weaponInaccuracy*(Math.random()- 0.5);
                            }
                        }

        /*                    helper.bullets = game.add.sprite(gunP1Stuff.gun1P1.body.x , gunP1Stuff.gun1P1.body.y , "bulletIMG");
                        game.physics.arcade.enable(helper.bullets);
                        bullets.physicsBodyType = Phaser.Physics.P2JS;
                        bullets.body.setCollisionGroup(bulletCollisionGroup);
                        bullets.body.collides(enemyCollisionGroup, hit, this);
                        helper.bullets.scale.x = .01;
                        helper.bullets.scale.y = .02;
                        helper.bullets.outOfBoundsKill = true;
                        helper.bulletArrayP1.push(helper.bullets); */

        /*                setTimeout(function() {
                            bullets.kill();
                        }, 500); */
                        gunP1Stuff.gun1P1.nextFire = gunP1Stuff.gun1P1.game.time.time + gunP1Stuff.fireRateP1;
                    }

                }

                if (cursors.left.isDown){
                    hi.animations.play('walkP1');
                    hi.body.velocity.x = - 300;
                    hiFacingDirection = 3;
                    hi.angle = 270;
                } else if (cursors.right.isDown){
                    hi.animations.play('walkP1');
                    hi.body.velocity.x = 300;
                    hiFacingDirection = 2;
                    hi.angle = 90;
                } else if (cursors.down.isDown){
                    hi.animations.play('walkP1');
                    hi.body.velocity.y = 300;
                    hiFacingDirection = 1;
                    hi.angle = 180;
                } else if (cursors.up.isDown){
                    hi.animations.play('walkP1');
                    hi.body.velocity.y = - 300;
                    hiFacingDirection = 0;
                    hi.angle = 0;
                } else {
                    hi.body.velocity.x = 0;
                    hi.body.velocity.y = 0;
                    hi.animations.stop();
                    hi.frame = 0;
                
                }

                if (keyL.isDown){
                    gunP1Stuff.currentGunP1 ++;
                    gunP1Stuff.gun1P1.loadTexture(gunP1Stuff.switchGuns());
                    
                    if (gunP1Stuff.currentGunP1  == 1 ){
                        this.p1GunStuffText.text = "Pistol";
                        gunP1Stuff.gun1P1.scale.x = .3;
                        gunP1Stuff.gun1P1.scale.y = .3;
                    } else if (gunP1Stuff.currentGunNumP1 == 2){
                        this.p1GunStuffText.text = "Shotgun: " + Math.floor(gunP1Stuff.shotgunBullets);
                        gunP1Stuff.gun1P1.scale.x = .5;
                        gunP1Stuff.gun1P1.scale.y = .5;
                    } else if (gunP1Stuff.currentGunNumP1 == 3){
                        this.p1GunStuffText.text = "Machine Gun: " + gunP1Stuff.machineGunBullets;
                        gunP1Stuff.gun1P1.scale.x = .5;
                        gunP1Stuff.gun1P1.scale.y = .5;
                    } else if (gunP1Stuff.currentGunNumP1 == 4){
                        this.p1GunStuffText.text = "RPG: " + gunP1Stuff.rocketBullets;
                        gunP1Stuff.gun1P1.scale.x = .5;
                        gunP1Stuff.gun1P1.scale.y = .5;
                    }
                }
                if (keyJ.isDown){
                    gunP1Stuff.currentGunP1 --;
                    gunP1Stuff.gun1P1.loadTexture(gunP1Stuff.switchGuns());
                    
                    if (gunP1Stuff.currentGunP1  == 1 ){
                        this.p1GunStuffText.text = "Pistol";
                        gunP1Stuff.gun1P1.scale.x = .3;
                        gunP1Stuff.gun1P1.scale.y = .3;
                    } else if (gunP1Stuff.currentGunNumP1 == 2){
                        this.p1GunStuffText.text = "Shotgun: " + Math.floor(gunP1Stuff.shotgunBullets);
                        gunP1Stuff.gun1P1.scale.x = .5;
                        gunP1Stuff.gun1P1.scale.y = .5;
                    } else if (gunP1Stuff.currentGunNumP1 == 3){
                        this.p1GunStuffText.text = "Machine Gun: " + gunP1Stuff.machineGunBullets;
                        gunP1Stuff.gun1P1.scale.x = .5;
                        gunP1Stuff.gun1P1.scale.y = .5;
                    } else if (gunP1Stuff.currentGunNumP1 == 4) {
                        this.p1GunStuffText.text = "RPG: " + gunP1Stuff.rocketBullets;
                        gunP1Stuff.gun1P1.scale.x = .5;
                        gunP1Stuff.gun1P1.scale.y = .5;
                    } else {
                        this.p1GunStuffText.text = "Pistol";
                        gunP1Stuff.gun1P1.scale.x = .3;
                        gunP1Stuff.gun1P1.scale.y = .3;
                    }
                }

                if (keyW.isDown){
                    p2.body.velocity.y = - 300;
                    p2FacingDirection = 0;
                    console.log("player 2 moved up");
                    p2.animations.play('walkP2');
                    p2.angle = 0;
//                    this.walkingSound.play();
                } else if (keyS.isDown){
                    p2.body.velocity.y = 300;
                    p2FacingDirection = 1;
                    p2.animations.play('walkP2');
                    p2.angle = 180;
//                    this.walkingSound.play();
                } else if (keyD.isDown){
                    p2.body.velocity.x = 300;
                    p2FacingDirection = 2;
                    p2.animations.play('walkP2');
                    p2.angle = 90;
//                    this.walkingSound.play();
                } else if (keyA.isDown){
                    p2.body.velocity.x = - 300;
                    p2FacingDirection = 3;
                    p2.animations.play('walkP2');
                    p2.angle = 270;
//                    this.walkingSound.play();
                } else {
                    p2.body.velocity.x = 0;
                    p2.body.velocity.y = 0;
                    p2.animations.stop();
                    p2.frame = 0;
                }
               
                if (keyV.isDown){
                  if (gunP2Stuff.currentGunNumP2 == 2 && Math.floor(gunP2Stuff.shotgunBullets) <= 0){
                    //play empty gun sound
                    console.log(gunP2Stuff.currentGunNumP2 + " is out of bullets!");
                  } else if (gunP2Stuff.currentGunNumP2 == 3 && gunP2Stuff.machineGunBullets <= 0){
                    //play empty gun sound
                    console.log(gunP2Stuff.currentGunNumP2 + " is out of bullets!");
                  } else if (gunP2Stuff.currentGunNumP2 == 4 && gunP2Stuff.rocketBullets <= 0){
                     //play empty gun sound
                    console.log(gunP2Stuff.currentGunNumP2 + " is out of bullets!");
                  } else {
                    if (gunP2Stuff.gun1P2.game.time.time > gunP2Stuff.gun1P2.nextFire){
                        for (var w = 0; w < gunP2Stuff.bulletsToSpawn; w++){
                            var bulletSpawnX, bulletSpawnY;
                            
                            if (p2FacingDirection == 0){
                                bulletSpawnX = p2.body.x + p2.body.width;
                                bulletSpawnY = p2.body.y;
                            } else if (p2FacingDirection == 1 ){
                                bulletSpawnX = p2.body.x;
                                bulletSpawnY = p2.body.y + p2.body.width;
                            } else if (p2FacingDirection == 2 ){
                                bulletSpawnX = p2.body.x + p2.body.width;
                                bulletSpawnY = p2.body.y + p2.body.width;
                            } else if (p2FacingDirection == 3 ){
                                bulletSpawnX = p2.body.x;
                                bulletSpawnY = p2.body.y ;
                            }
                            
                            helper.bulletsP2 = game.add.sprite(bulletSpawnX , bulletSpawnY , "bulletIMG");
                            game.physics.arcade.enable(helper.bulletsP2);
                            
                           if (gunP2Stuff.currentGunNumP2 == 4){
                              console.log("current gun is rocket");
                              helper.bulletsP2.scale.x = 0.04;
                              helper.bulletsP2.scale.y = 0.08;
                            } else {
                              helper.bulletsP2.scale.x = .02;
                              helper.bulletsP2.scale.y = .04;
                            }
                            
                            helper.bulletsP2.outOfBoundsKill = true;
                            helper.bulletArrayP1.push(helper.bulletsP2);

                            if (p2FacingDirection == 0){
                                helper.bulletsP2.body.velocity.y = -2000;
                                helper.bulletsP2.angle = 0;
                            } else if (p2FacingDirection == 1 ){
                                helper.bulletsP2.body.velocity.y = 2000;
                                helper.bulletsP2.angle = 180;
                            } else if (p2FacingDirection == 2 ){
                                helper.bulletsP2.body.velocity.x = 2000;
                                helper.bulletsP2.angle = 90;
                            } else if (p2FacingDirection == 3 ){
                                helper.bulletsP2.body.velocity.x = -2000;
                                helper.bulletsP2.angle = 270;
                            }
                            
                            if (gunP2Stuff.currentGunNumP2 == 1 ){
                              this.p2GunStuffText.text = "Pistol";
                              this.pistolSound.play();
                            } else if (gunP2Stuff.currentGunNumP2 == 2){
                              this.shotgunSound.play();
                              gunP2Stuff.shotgunBullets -= 0.2;
                              this.p2GunStuffText.text = "Shotgun: " + Math.floor(gunP2Stuff.shotgunBullets);
                            } else if (gunP2Stuff.currentGunNumP2 == 3){
                              this.machineGunSound.play();
                              gunP2Stuff.machineGunBullets --;
                              this.p2GunStuffText.text = "Machine Gun: " + gunP2Stuff.machineGunBullets;
                            } else if (gunP2Stuff.currentGunNumP2 == 4){
                              this.rocketLaunchSound.play();
                              gunP2Stuff.rocketBullets --;
                              this.p2GunStuffText.text = "RPG: " + gunP2Stuff.rocketBullets;
                            }
                            
                            // if (i <= 0) {
                            //   if ( (hiFacingDirection == 0)||(hiFacingDirection == 1) ){
                            //     helper.bullets.body.velocity.x = gunP1Stuff.weaponInaccuracy*(Math.random() - 0.5);
                            //   } else {
                            //     helper.bullets.body.velocity.y = gunP1Stuff.weaponInaccuracy*(Math.random() - 0.5);
                            //   }
                            // }
                            
                            // if (w <= 0) {
                            //   if ( (hiFacingDirection == 0)||(hiFacingDirection == 1) ){
                            //     helper.bulletsP2.body.velocity.x = gunP2Stuff.weaponInaccuracy*(Math.random() - 0.5);
                            //   } else {
                            //     helper.bulletsP2.body.velocity.y = gunP2Stuff.weaponInaccuracy*(Math.random() - 0.5);
                            //   }
                            // }
                            
                            if ((w > 0) && ((p2FacingDirection == 0)||(p2FacingDirection == 1))) {
                                helper.bulletsP2.body.velocity.x = gunP2Stuff.weaponInaccuracy*(Math.random()- 0.5);

                            } else if (w > 0) {
                                helper.bulletsP2.body.velocity.y = gunP2Stuff.weaponInaccuracy*(Math.random()- 0.5);
                            }
                        }

                        gunP2Stuff.gun1P2.nextFire = gunP2Stuff.gun1P2.game.time.time + gunP2Stuff.fireRateP2;
                    }
                  }
                }

                if (keyB.isDown){
                    gunP2Stuff.currentGunP2 ++;
                    gunP2Stuff.gun1P2.loadTexture(gunP2Stuff.switchGuns());
                    
                    if (gunP2Stuff.currentGunP2  == 1 ){
                        this.p2GunStuffText.text = "Pistol";
                        gunP2Stuff.gun1P2.scale.x = 0.3;
                        gunP2Stuff.gun1P2.scale.y = 0.3;
                    } else if (gunP2Stuff.currentGunNumP2 == 2){
                        this.p2GunStuffText.text = "Shotgun: " + Math.floor(gunP2Stuff.shotgunBullets);
                        gunP2Stuff.gun1P2.scale.x = 0.5;
                        gunP2Stuff.gun1P2.scale.y = 0.5;
                    } else if (gunP2Stuff.currentGunNumP2 == 3){
                        this.p2GunStuffText.text = "Machine Gun: " + gunP2Stuff.machineGunBullets;
                        gunP2Stuff.gun1P2.scale.x = 0.5;
                        gunP2Stuff.gun1P2.scale.y = 0.5;
                    } else if (gunP2Stuff.currentGunNumP2 == 4){
                        this.p2GunStuffText.text = "RPG: " + gunP2Stuff.rocketBullets;
                        gunP2Stuff.gun1P2.scale.x = 0.5;
                        gunP2Stuff.gun1P2.scale.y = 0.5;
                    }
                }
                if (keyC.isDown){
                    gunP2Stuff.currentGunP2 --
                    gunP2Stuff.gun1P2.loadTexture(gunP2Stuff.switchGuns());
                    
                    if (gunP2Stuff.currentGunP2  == 1 ){
                        this.p2GunStuffText.text = "Pistol";
                        gunP2Stuff.gun1P2.scale.x = 0.3;
                        gunP2Stuff.gun1P2.scale.y = 0.3;
                    } else if (gunP2Stuff.currentGunNumP2 == 2){
                        this.p2GunStuffText.text = "Shotgun: " + gunP2Stuff.shotgunBullets;
                        gunP2Stuff.gun1P2.scale.x = 0.5;
                        gunP2Stuff.gun1P2.scale.y = 0.5;
                    } else if (gunP2Stuff.currentGunNumP2 == 3){
                        this.p2GunStuffText.text = "Machine Gun: " + Math.floor(gunP2Stuff.machineGunBullets);
                        gunP2Stuff.gun1P2.scale.x = 0.5;
                        gunP2Stuff.gun1P2.scale.y = 0.5;
                    } else if (gunP2Stuff.currentGunNumP2 == 4){
                        this.p2GunStuffText.text = "RPG: " + gunP2Stuff.rocketBullets;
                        gunP2Stuff.gun1P2.scale.x = 0.5;
                        gunP2Stuff.gun1P2.scale.y = 0.5;
                    } else {
                        this.p2GunStuffText.text = "Pistol";
                        gunP2Stuff.gun1P2.scale.x = 0.3;
                        gunP2Stuff.gun1P2.scale.y = 0.3;
                    }
                }


                //collide players
                game.physics.arcade.collide(hi, p2, null, null, this);

    /*            //collide p1 bullets with enemies
                game.physics.arcade.collide(bullets, enemyTest, this.bulletHasHitEnemy, null, this);
                //collide p2 bullets with enemies
                game.physics.arcade.collide(bulletsP2, enemyTest, this.bulletHasHitEnemy, null, this); */

                //collide p1 with enemy
                game.physics.arcade.collide(hi, enemyTest, this.player1HitEnemy, null, this);
                //collide p2 with enemy
                game.physics.arcade.collide(p2, enemyTest, this.player1HitEnemy, null, this);

                //move enemy to p1
                enemyTest.game.physics.arcade.moveToObject(enemyTest, hi, 50);


                for (var i=0; (i < 20) && (helper.splatArray.length > 100); i++) {
                    helper.splatArray.shift().kill();
                }
                for (var i=0; (i < 20) && (helper.bulletArrayP1.length > 50); i++) {
                    helper.bulletArrayP1.shift().kill();
                }
                for (var i=0; (i < 20) && (helper.bulletArrayP2.length > 50); i++) {
                    helper.bulletArrayP2.shift().kill();
                }
                if (enemyTest2ArrayP1.length > this.enemySpawnLimit){
                    var enemy9 = enemyTest2ArrayP1.shift();
                    enemy9.kill();
                }
                if (enemyTest2ArrayP2.length > this.enemySpawnLimit){
                    var enemy10 = enemyTest2ArrayP2.shift();
                    enemy10.kill();
                }

                if (gunP1Stuff.explosionArrayP1.length > 3){
                    var toKill = gunP1Stuff.explosionArrayP1.shift();
                    toKill.kill();
                }

                enemyCollider1.check(enemyTest2ArrayP1, function(a, b){
                    game.physics.arcade.collide(a, b, null, null, this);
                } )

                enemyCollider1.check(enemyTest2ArrayP2, function(a, b){
                    game.physics.arcade.collide(a, b, null, null, this);
                } )

    //            for (var i = 0; i < gunP1Stuff.explosionArrayP1.length; i++){
    //                if (gunP1Stuff.explosionArrayP1[i].animations.isfinished() ){
    //                    gunP1Stuff.explosionArrayP1[i].animation.kill();
    //
    //                }
    //            }

                for (var i = 0; i < enemyTest2ArrayP1.length; i++){
                    if (!enemyTest2ArrayP1[i].isDead){
                        enemyTest2ArrayP1[i].bringToTop();
                        enemyTest.game.physics.arcade.moveToObject(enemyTest2ArrayP1[i], hi, 50);
                        game.physics.arcade.collide(hi, enemyTest2ArrayP1[i], this.player1HitEnemy, null, this);
                        game.physics.arcade.collide(p2, enemyTest2ArrayP1[i], this.player1HitEnemy, null, this);

                        game.physics.arcade.collide(helper.bulletsP2, enemyTest2ArrayP1[i], this.bulletHasHitEnemyP1, null, this);
                        game.physics.arcade.collide(helper.bullets, enemyTest2ArrayP1[i], this.bulletHasHitEnemyP1, null, this);

                        game.physics.arcade.overlap(helper.bulletsP2, enemyTest2ArrayP1[i], this.bulletHasHitEnemyP1, null, this);
                        game.physics.arcade.overlap(helper.bullets, enemyTest2ArrayP1[i], this.bulletHasHitEnemyP1, null, this);

                        game.physics.arcade.overlap(gunP1Stuff.explosion, enemyTest2ArrayP1[i], this.explosionHasHitEnemy, null, this);
                        game.physics.arcade.overlap(gunP2Stuff.explosion, enemyTest2ArrayP1[i], this.explosionHasHitEnemy, null, this);


                        /*                    if (bullets != null && enemyTest2ArrayP1[i] != null){
                            this.checkOverlap(bullets, enemyTest2ArrayP1[i] );

                            if(bullets.getBounds().intersects(enemyTest2ArrayP1[i].getBounds())){
                            console.log("michael");
                            }
                        } */
                    }
                }
                for (var i = 0; i < enemyTest2ArrayP2.length; i++){
                    if (!enemyTest2ArrayP2[i].isDead){
                        enemyTest2ArrayP2[i].bringToTop();
                        enemyTest.game.physics.arcade.moveToObject(enemyTest2ArrayP2[i], p2, 50);
                        game.physics.arcade.collide(hi, enemyTest2ArrayP2[i], this.player1HitEnemy, null, this);
                        game.physics.arcade.collide(p2, enemyTest2ArrayP2[i], this.player1HitEnemy, null, this);

                        game.physics.arcade.collide(helper.bulletsP2, enemyTest2ArrayP2[i], this.bulletHasHitEnemyP1, null, this);
                        game.physics.arcade.collide(helper.bullets, enemyTest2ArrayP2[i], this.bulletHasHitEnemyP1, null, this);

                        game.physics.arcade.overlap(helper.bulletsP2, enemyTest2ArrayP2[i], this.bulletHasHitEnemyP1, null, this);
                        game.physics.arcade.overlap(helper.bullets, enemyTest2ArrayP2[i], this.bulletHasHitEnemyP1, null, this);

                        game.physics.arcade.overlap(gunP1Stuff.explosion, enemyTest2ArrayP2[i], this.explosionHasHitEnemy, null, this);
                        game.physics.arcade.overlap(gunP2Stuff.explosion, enemyTest2ArrayP2[i], this.explosionHasHitEnemy, null, this);

                    }
                }
                
                if (healthP1 <= 0){
                    console.log("player 1 is dead");
                    this.gameState = 2;
                    this.drawGame();
                }
                
                if (healthP2 <= 0){
                    console.log("player 2 is dead");
                    this.gameState = 2;
                    this.drawGame();
                }
//
//                if (healthP1 <= 0 && healthP2 <= 0){
//                    console.log("both players dead");
//                    this.gameState = 2;
//                }
                                
//                if (keyQ.isDown){
//                    this.gameState = 2;
//                    this.drawGame();
//                }

            } else {
    //            pauseTXT = game.add.text(350, 150, 'PAUSED', { font: '28px Arial', fill: '#ffffff' });
    //            pauseTXT.fill = "black";

                hi.body.velocity.x = 0;
                hi.body.velocity.y = 0;

                p2.body.velocity.x = 0;
                p2.body.velocity.y = 0;

                for (var i = 0; i < enemyTest2ArrayP1.length; i++){
                    if (!enemyTest2ArrayP1[i].isDead){
                        enemyTest2ArrayP1[i].body.velocity.x = 0;
                        enemyTest2ArrayP1[i].body.velocity.y = 0;
                        enemyTest2ArrayP1[i].animations.stop();
                    }
                }

                for (var i = 0; i < enemyTest2ArrayP2.length; i++){
                    if (!enemyTest2ArrayP2[i].isDead){
                        enemyTest2ArrayP2[i].body.velocity.x = 0;
                        enemyTest2ArrayP2[i].body.velocity.y = 0;
                        enemyTest2ArrayP2[i].animations.stop();
                    }
                }

                if(enemyTest != null){
                    enemyTest.body.velocity.x = 0;
                    enemyTest.body.velocity.y = 0;
                }

            }
        }
        
        if (this.gameState == 2){
//            this.drawGame();

            killAndRemoveAllFromArray(enemyTest2ArrayP1);
            killAndRemoveAllFromArray(enemyTest2ArrayP2);
            killAndRemoveAllFromArray(helper.splatArray);
            killAndRemoveAllFromArray(helper.bulletArrayP1);
            killAndRemoveAllFromArray(helper.bulletArrayP1);

/*           while(enemyTest2ArrayP1.length > 0){
                    enemyTest2ArrayP1.pop().kill();
            }
            
            for (var i = 0; i < enemyTest2ArrayP2.length; i++){
                    enemyTest2ArrayP2[i].kill();
            }
            
            for (var i = 0; i < helper.splatArray.length; i++ ){
                helper.splatArray[i].kill();
            }
*/
            
                
            hi.kill();
            // healthTXTP1.kill();
            scoreTXTP1.kill();
            
            p2.kill();
            // healthTXTP2.kill();
            scoreTXTP2.kill();
            
//            if (keyE.isDown){
//                this.gameState = 1;
//                this.drawGame();
//            }
        }
        
    }
    
}

function startGame(){
    gameVar.gameState = 1;
    gameVar.drawGame();
    
}

function killAndRemoveAllFromArray (arrayToKill){
   while(arrayToKill.length > 0){
      arrayToKill.pop().kill();
   }
}


/*    function shoot(){
        bullets.body.velocity.x = 0;
        bullets.body.velocity.y = 0;
        
        console.log("Shoot!");
        var charX = hi.x;
        var charY = hi.y;
        console.log("player is at " + charX + ", " + charY);
        
        if (game.time.now > bulletTime){
            bullet = bullets.getFirstExists(false);
            if (bullets){
                bullets.reset(hi.x + 6, hi.y - 8);
                bullets.body.velocity.y = -300;
                bulletTime = game.time.now + 150;
            }
        }
    } */


/*        enemyCollisionGroup = game.physics.p2.createCollisionGroup();
        bulletCollisionGroup = game.physics.p2.createCollisionGroup();
        
        game.physics.p2.updateBoundsCollisionGroup();
        
        enemyTest.body.setCollisionGroup(enemyCollisionGroup);
        
        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        
        
        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;

        bullets.createMultiple(50, 'bulletsIMG');
        bullets.setAll('checkWorldBounds', true);
        bullets.setAll('outOfBoundsKill', true);
        
        for (var i = 0; i < 20; i++) {
            var b = bullets.create(0, 0, 'bullet');
            b.name = 'bullet' + i;
            b.exists = false;
            b.visible = false;
            b.checkWorldBounds = true;
        }
           

            console.log("Shoot!");
            var charX = hi.x;
            var charY = hi.y;
            console.log("player is at " + charX + ", " + charY);

            if (game.time.now > bulletTime){
                bullet = bullets.getFirstExists(false);
                if (bullets){
                    bullets.reset(hi.x + 6, hi.y - 8);
                    bullets.body.velocity.y = -300;
                    bulletTime = game.time.now + 150;
                }
            }
            */
