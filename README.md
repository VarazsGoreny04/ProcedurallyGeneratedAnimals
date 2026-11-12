ProcedurallyGeneratedAnimals
============================
Try it out online: [To the game](https://varazsgoreny04.github.io/ProcedurallyGeneratedAnimals/)

This is a library that generates simple 2D procedurally generated animals in an *HTML* Canvas using *JavaScript* and the [*p5.js*](https://p5js.org/) library.
The library also provides an example *HTML* document named ***index.html*** and an example JS file named ***simulator.js*** with 3 pre-generated animals:
- Snake
- Fish
- Lizard

The user can switch between the 3 animals using the buttons on top of the screen or by pressing the number keys. Each key corresponds to a position in the ***animals*** array where the program stores its animals, so it is possible to add more custom animals.

Once the page loads, the user is presented by the selected animal in the center of the screen. The animation can be paused and restarted the by pressing the "**F**" key or using the ***Pause*** button on top of the screen.

If the simulation is running, the animal will always follow the direction of the mouse, but is limited by the maximum rotation angle. By default, the mause position is set to the top left corner of the window. So on mobile, if the screen has not been pressed yet, or on PC, if the mouse has not been over the window, the animal will always head towards the top left corner at the start.
