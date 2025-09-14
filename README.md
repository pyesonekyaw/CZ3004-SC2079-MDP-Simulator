<br />
<p align="center">
  <img src="/images/Map.png" alt="Logo" height=150 >
  <h1 align="center">
    CZ3004/SC2079 Multidisciplinary Project - Algorithm Simulator
  </h1>
</p>

## Setup

```bash
npm install
```

Start the app by

```bash
npm run dev
```

The app will be running at `localhost:3000`

## Usage

The interface is as intuitive as it can get. Position the robot where you want it to be and click on the buttons to add obstacles. Then click on `Submit` to find the path, or `Reset All` to clear the map and put the robot back to the starting position. `Reset Robot` just resets the robot to the starting position without clearing the map.

<div style="text-align:center"><img src="/images/1.jpg" alt="Interface" width=350 ></div>

You can also add obstacles without a symbol card by choosing the 'None' option for the direction.

<div style="text-align:center"><img src="/images/3.jpg" alt="Interface" width=350 ></div>

Use the left and right arrow buttons to go through the path step by step to see how the algorithm is working.

Of course, sometimes you might think it's not going by the shortest path possible, but that's because of the various constraints and safeguards in the algorithm, which can all be tweaked in the code.

The algorithm API server should be running at a specific address, which you will need to change in `BaseAPI.js`.

# Acknowledgements

I used [Group 28](https://github.com/CZ3004-Group-28)'s simulator as a boilerplate and improved it significantly, such as adding no-direction obstacles, being able to change the robot's starting position, and revamped the user interface to make it more modern and intuitive.

# Related Repositories

- [Website Repository](https://github.com/pyesonekyaw/MDP-Showcase)
- [Algorithm](https://github.com/pyesonekyaw/CZ3004-SC2079-MDP-Algorithm)
- [Raspberry Pi](https://github.com/pyesonekyaw/CZ3004-SC2079-MDP-RaspberryPi)
- [Image Recognition](https://github.com/pyesonekyaw/CZ3004-SC2079-MDP-ImageRecognition)

