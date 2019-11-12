class Game {
    // Global attributes for canvas
    // Readonly attributes are read-only. They can only be initialized in the constructor
    private readonly canvas: HTMLCanvasElement; 
    private readonly ctx: CanvasRenderingContext2D;

    // Some global player attributes
    private readonly player: string;
    private readonly score: number;
    private readonly lives: number;
    private readonly highscores: Array<any>; // TODO: do not use 'any': write an interface!
    private angle: number = 0;

    private repo : ImageRepository;

    private readonly images: Array<string> = [
        "PNG/UI/buttonBlue.png",
        "PNG/UI/playerLife1_blue.png",
        "PNG/playerShip1_blue.png",
        "PNG/Meteors/meteorBrown_big1.png",
        "PNG/Meteors/meteorBrown_big2.png",
        "PNG/Meteors/meteorBrown_big3.png",
        "PNG/Meteors/meteorBrown_big4.png",
        "PNG/Meteors/meteorBrown_med1.png",
        "PNG/Meteors/meteorBrown_med3.png",
        "PNG/Meteors/meteorBrown_small1.png",
        "PNG/Meteors/meteorBrown_small2.png",
        "PNG/Meteors/meteorBrown_tiny1.png",
        "PNG/Meteors/meteorBrown_tiny2.png",
    ];

    private readonly asteroid_names : string[] = [
        "PNG.Meteors.meteorBrown_big1",
        "PNG.Meteors.meteorBrown_big2",
        "PNG.Meteors.meteorBrown_big3",
        "PNG.Meteors.meteorBrown_big4",
        "PNG.Meteors.meteorBrown_med1",
        "PNG.Meteors.meteorBrown_med3",
        "PNG.Meteors.meteorBrown_small1",
        "PNG.Meteors.meteorBrown_small2",
        "PNG.Meteors.meteorBrown_tiny1",
        "PNG.Meteors.meteorBrown_tiny2",
    ];

    private asteroids : string[] = [];
    private asteroid_x : number[] = [];
    private asteroid_y : number[] = [];
    
    private static readonly LOAD_SCREEN = 0;
    private static readonly START_SCREEN = 1;
    private static readonly LEVEL_SCREEN = 2;
    private static readonly TITLE_SCREEN = 3;

    private currentScreen: number = Game.LOAD_SCREEN;

    private frameCounter : number = 0;
    private keyListener : KeyListener = new KeyListener();

    public constructor(canvasId: HTMLCanvasElement) {
        // Construct all of the canvas
        this.canvas = canvasId;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Set the context of the canvas
        this.ctx = this.canvas.getContext('2d');

        this.player = "Player one";
        this.score = 400;
        this.lives = 3;

        this.highscores = [
            {
                playerName: 'Loek',
                score: 40000
            },
            {
                playerName: 'Daan',
                score: 34000
            },
            {
                playerName: 'Rimmert',
                score: 200
            }
        ]

        const maxAsteroidsOnScreen: number = 5;

        for (let i = 0; i < maxAsteroidsOnScreen; i++) {
            const index = this.randomNumber(0, this.asteroid_names.length-1);
            const x = this.randomNumber(0, this.canvas.width - 20);
            const y = this.randomNumber(0, this.canvas.height - 20);
            this.asteroids[i] = this.asteroid_names[index];
            this.asteroid_x[i] = x;
            this.asteroid_y[i] = y;
        }
        console.log(this.asteroid_x);
        console.log(this.asteroid_y);
        console.log(this.asteroids);
        this.repo = new ImageRepository("./assets/images/SpaceShooterRedux", this.images);
        this.startAnimation();
    }

    public loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        switch (this.currentScreen) {
            case Game.LOAD_SCREEN :
                this.loadscreen();
                break;
            case Game.START_SCREEN : 
                this.startScreen();
                break;
            case Game.LEVEL_SCREEN : 
                this.levelScreen();
                break;
            case Game.TITLE_SCREEN :
                this.titleScreen();
                break; 
        } 
    }

    //-------- Load screen methods ------------------------------------
    /**
     * Method to initialize the load screen
     */
    private loadscreen() {
        //1. add 'Loading...' text
        this.writeTextToCanvas("Loading...", 80, this.canvas.width / 2, this.canvas.height / 2);

        // See if the repo is fully loaded to progress to the start screen
        // Minimum time of approx 2 seconds (on 60fps)
        if (!this.repo.isLoading() && this.frameCounter > 60 * 1) {
            this.currentScreen = Game.START_SCREEN;
        }
    }

    //-------- Splash screen methods ------------------------------------
    /**
     * Method to initialize the splash screen
     */
    public startScreen() {
        let centerX = this.canvas.width / 2;
        let centerY = this.canvas.height / 2;

        //1. add 'Asteroids' text
        this.writeTextToCanvas("Asteroids", 140, centerX, 150);

        //2. add 'Press to play' text
        this.writeTextToCanvas("PRESS PLAY OR HIT 'S' TO START", 40, centerX, centerY - 135);

        //3. add button with 'start' text
        this.drawImage("PNG.UI.buttonBlue", centerX, centerY + 220);
        this.writeTextToCanvas("Play", 20, centerX, centerY + 229, 'center', 'black');

        //4. add Asteroid image
        const angle = this.frameCounter * Math.PI / 180;
        this.drawImage("PNG.Meteors.meteorBrown_big1", centerX, centerY + 60, angle);

        // See if user wants to go to the next screen
        if (this.keyListener.isKeyDown(KeyListener.KEY_S)) {
            this.currentScreen = Game.LEVEL_SCREEN;
        }
    }

    //-------- level screen methods -------------------------------------
    /**
     * Method to initialize the level screen
     */
    public levelScreen() {
        // Listen to the keyboard to see if there is some player action
        const d = Math.PI/180 * 1.3;
        if (this.keyListener.isKeyDown(KeyListener.KEY_LEFT)){
            this.angle-=d;
        }
        if (this.keyListener.isKeyDown(KeyListener.KEY_RIGHT)){
            this.angle+=d;
        }

        //1. load life images
        const lifeImageFileName = "PNG.UI.playerLife1_blue";
        let x = 30;
        let y = 30;
        // Start a loop for each life in lives
        for (let life=0; life<this.lives; life++) {
            // Draw the image at the curren x and y coordinates
            this.drawImage(lifeImageFileName, x, y);
            // Increase the x-coordinate for the next image to draw
            x += 50; 
        }

        //2. draw current score
        this.writeTextToCanvas(`Your score: ${this.score}`, 20, this.canvas.width - 100, 30, 'right');

        //3. draw random asteroids
        for (let i = 0; i < this.asteroids.length; i++) {
            this.drawImage(this.asteroids[i], this.asteroid_x[i], this.asteroid_y[i]);
        }

        // //4. draw player spaceship
        const playerSpaceShipFileName = "PNG.playerShip1_blue";
        let img = this.repo.getImage(playerSpaceShipFileName);
        x = this.canvas.width / 2 - img.width / 2;
        y = this.canvas.height / 2 - img.height / 2;
        this.drawImage(playerSpaceShipFileName, x, y, this.angle);

        // See if the user wants to go to the next screen
        if (this.keyListener.isKeyDown(KeyListener.KEY_ESC)) {
            this.currentScreen = Game.TITLE_SCREEN;
        }

    }

    //-------- Title screen methods -------------------------------------

    /**
    * Method to initialize the title screen
    */
    public titleScreen() {
        const x = this.canvas.width / 2;
        let y = this.canvas.height / 2;

        //1. draw your score
        this.writeTextToCanvas(`${this.player} score is ${this.score}`, 80, x, y - 100);

        //2. draw all highscores
        this.writeTextToCanvas("HIGHSCORES", 40, x, y);
        for (let i=0; i<this.highscores.length; i++) {
            y += 40;
            const text = `${i + 1}: ${this.highscores[i].playerName} - ${this.highscores[i].score}`;
            this.writeTextToCanvas(text, 20, x, y);
        }

        // See if the user wants to go to the next screen
        if (this.keyListener.isKeyDown(KeyListener.KEY_SPACE)) {
            this.currentScreen = Game.START_SCREEN;
        }
    }

    //-------Generic canvas methods ----------------------------------

    /**
     * Writes text to the canvas
     * @param {string} text - Text to write
     * @param {number} fontSize - Font size in pixels
     * @param {number} xCoordinate - Horizontal coordinate in pixels
     * @param {number} yCoordinate - Vertical coordinate in pixels
     * @param {string} alignment - Where to align the text
     * @param {string} color - The color of the text
     */
    public writeTextToCanvas(
        text: string,
        fontSize: number = 20,
        xCoordinate: number,
        yCoordinate: number,
        alignment: CanvasTextAlign = "center",
        color: string = "white"
    ) {
        this.ctx.font = `${fontSize}px Minecraft`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = alignment;
        this.ctx.fillText(text, xCoordinate, yCoordinate);
    }


    private drawImage(name:string, x:number, y:number, angle:number = 0) {
        let img = this.repo.getImage(name);
        this.ctx.save();
        this.ctx.translate(x,y);
        this.ctx.rotate(angle);
        this.ctx.drawImage(img, -img.width / 2,  -img.height / 2);
        this.ctx.restore();
    }

    /**
    * Renders a random number between min and max
    * @param {number} min - minimal time
    * @param {number} max - maximal time
    */
    public randomNumber(min: number, max: number): number {
        return Math.round(Math.random() * (max - min) + min);
    }


    //----------------- Animation Methods -------------------------------------

    /**
     * Start the animation loop
     */
    private startAnimation() {
        console.log('start animation');
        requestAnimationFrame(this.animate);
    }

    animate = () => {
        this.frameCounter++;
        this.loop();
        requestAnimationFrame(this.animate);
    }

}

//this will get an HTML element. I cast this element in de appropriate type using <>
let init = function () {
    const Asteroids = new Game(<HTMLCanvasElement>document.getElementById('canvas'));
};

// Add EventListener to load the game whenever the browser is ready
window.addEventListener('load', init);