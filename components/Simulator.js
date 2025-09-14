import React from "react";
import { useState, useEffect, useMemo } from "react";
import QueryAPI from "./QueryAPI";

const Direction = {
  NORTH: 0,
  EAST: 2,
  SOUTH: 4,
  WEST: 6,
  SKIP: 8,
};
 
const ObDirection = {
  NORTH: 0,
  EAST: 2,
  SOUTH: 4,
  WEST: 6,
  SKIP: 8,
};

const DirectionToString = {
  0: "Up",
  2: "Right",
  4: "Down",
  6: "Left",
  8: "None",
};

const transformCoord = (x, y) => {
  // Change the coordinate system from (0, 0) at top left to (0, 0) at bottom left
  return { x: 19 - y, y: x };
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Simulator() {
  const [robotState, setRobotState] = useState({
    x: 1,
    y: 1,
    d: Direction.NORTH,
    s: -1,
  });
  const [robotX, setRobotX] = useState(1);
  const [robotY, setRobotY] = useState(1);
  const [robotDir, setRobotDir] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [obXInput, setObXInput] = useState(0);
  const [obYInput, setObYInput] = useState(0);
  const [directionInput, setDirectionInput] = useState(0);
  const [isComputing, setIsComputing] = useState(false);


  const [path, setPath] = useState([]);
  const [commands, setCommands] = useState([]);
  const [page, setPage] = useState(0);


  const visitedGrid = useMemo(() => {
  const s = new Set();

  // mark the robot's 3×3 footprint at a base (x,y), store in rendered grid coords
  const markFootprint = (cx, cy) => {
    const x = Math.round(cx), y = Math.round(cy);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const bx = x + dx, by = y + dy;
        if (bx < 0 || bx >= 20 || by < 0 || by >= 20) continue;
        const t = transformCoord(bx, by); // -> { x: rowIndex, y: colIndex }
        s.add(`${t.x},${t.y}`);
      }
    }
  };

  if (!path || path.length === 0) return s;

  // up to current step (use `path.length - 1` if you want the whole route always)
  const end = Math.min(page, path.length - 1);

  // always include the first snapshot
  markFootprint(path[0].x, path[0].y);

  for (let i = 0; i < end; i++) {
    let x0 = Math.round(path[i].x);
    let y0 = Math.round(path[i].y);
    const x1 = Math.round(path[i + 1].x);
    const y1 = Math.round(path[i + 1].y);

    // Move in the axis that matches the robot's facing first (more realistic),
    // then the other axis. This fills all intermediate cells so there are no gaps.
    const preferXFirst =
      path[i].d === Direction.EAST || path[i].d === Direction.WEST;

    const stepTo = (tx, ty) => {
      const sx = Math.sign(tx - x0);
      const sy = Math.sign(ty - y0);
      while (x0 !== tx) {
        x0 += sx;
        markFootprint(x0, y0);
      }
      while (y0 !== ty) {
        y0 += sy;
        markFootprint(x0, y0);
      }
    };

    if (preferXFirst) {
      stepTo(x1, y0); // along X
      stepTo(x1, y1); // then along Y
    } else {
      stepTo(x0, y1); // along Y
      stepTo(x1, y1); // then along X
    }
  }

  return s;
}, [path, page]);


  const generateNewID = () => {
    while (true) {
      let new_id = Math.floor(Math.random() * 10) + 1; // just try to generate an id;
      let ok = true;
      for (const ob of obstacles) {
        if (ob.id === new_id) {
          ok = false;
          break;
        }
      }
      if (ok) {
        return new_id;
      }
    }
  };

  const generateRobotCells = () => {
    const robotCells = [];
    let markerX = 0;
    let markerY = 0;

    if (Number(robotState.d) === Direction.NORTH) {
      markerY++;
    } else if (Number(robotState.d) === Direction.EAST) {
      markerX++;
    } else if (Number(robotState.d) === Direction.SOUTH) {
      markerY--;
    } else if (Number(robotState.d) === Direction.WEST) {
      markerX--;
    }

    // Go from i = -1 to i = 1
    for (let i = -1; i < 2; i++) {
      // Go from j = -1 to j = 1
      for (let j = -1; j < 2; j++) {
        // Transform the coordinates to our coordinate system where (0, 0) is at the bottom left
        const coord = transformCoord(robotState.x + i, robotState.y + j);
        // If the cell is the marker cell, add the robot state to the cell
        if (markerX === i && markerY === j) {
          robotCells.push({
            x: coord.x,
            y: coord.y,
            d: robotState.d,
            s: robotState.s,
          });
        } else {
          robotCells.push({
            x: coord.x,
            y: coord.y,
            d: null,
            s: -1,
          });
        }
      }
    }

    return robotCells;
  };

  const onChangeX = (event) => {
    // If the input is an integer and is in the range [0, 19], set ObXInput to the input
    if (Number.isInteger(Number(event.target.value))) {
      const nb = Number(event.target.value);
      if (0 <= nb && nb < 20) {
        setObXInput(nb);
        return;
      }
    }
    // If the input is not an integer or is not in the range [0, 19], set the input to 0
    setObXInput(0);
  };

  const onChangeY = (event) => {
    // If the input is an integer and is in the range [0, 19], set ObYInput to the input
    if (Number.isInteger(Number(event.target.value))) {
      const nb = Number(event.target.value);
      if (0 <= nb && nb <= 19) {
        setObYInput(nb);
        return;
      }
    }
    // If the input is not an integer or is not in the range [0, 19], set the input to 0
    setObYInput(0);
  };

  const onChangeRobotX = (event) => {
    // If the input is an integer and is in the range [1, 18], set RobotX to the input
    if (Number.isInteger(Number(event.target.value))) {
      const nb = Number(event.target.value);
      if (1 <= nb && nb < 19) {
        setRobotX(nb);
        return;
      }
    }
    // If the input is not an integer or is not in the range [1, 18], set the input to 1
    setRobotX(1);
  };

  const onChangeRobotY = (event) => {
    // If the input is an integer and is in the range [1, 18], set RobotY to the input
    if (Number.isInteger(Number(event.target.value))) {
      const nb = Number(event.target.value);
      if (1 <= nb && nb < 19) {
        setRobotY(nb);
        return;
      }
    }
    // If the input is not an integer or is not in the range [1, 18], set the input to 1
    setRobotY(1);
  };

  const onClickObstacle = () => {
    // If the input is not valid, return
    if (!obXInput && !obYInput) return;
    // Create a new array of obstacles
    const newObstacles = [...obstacles];
    // Add the new obstacle to the array
    newObstacles.push({
      x: obXInput,
      y: obYInput,
      d: directionInput,
      id: generateNewID(),
    });
    // Set the obstacles to the new array
    setObstacles(newObstacles);
  };

  const onClickRobot = () => {
    // Set the robot state to the input

    setRobotState({ x: robotX, y: robotY, d: robotDir, s: -1 });
  };

  const onDirectionInputChange = (event) => {
    // Set the direction input to the input
    setDirectionInput(Number(event.target.value));
  };

  const onRobotDirectionInputChange = (event) => {
    // Set the robot direction to the input
    setRobotDir(event.target.value);
  };

  const onRemoveObstacle = (ob) => {
    // If the path is not empty or the algorithm is computing, return
    if (path.length > 0 || isComputing) return;
    // Create a new array of obstacles
    const newObstacles = [];
    // Add all the obstacles except the one to remove to the new array
    for (const o of obstacles) {
      if (o.x === ob.x && o.y === ob.y) continue;
      newObstacles.push(o);
    }
    // Set the obstacles to the new array
    setObstacles(newObstacles);
  };

  const compute = () => {
    // Set computing to true, act like a lock
    setIsComputing(true);
    // Call the query function from the API
    QueryAPI.query(obstacles, robotX, robotY, robotDir, (data, err) => {
      if (data) {
        // If the data is valid, set the path
        setPath(data.data.path);
        // Set the commands
        const commands = [];
        for (let x of data.data.commands) {
          // If the command is a snapshot, skip it
          if (x.startsWith("SNAP")) {
            continue;
          }
          commands.push(x);
        }
        setCommands(commands);
      }
      // Set computing to false, release the lock
      setIsComputing(false);
    });
  };

  const onGridCellClick = (rowIdx, colIdx) => {
  if (isComputing || path.length > 0) return;

  // Convert table cell (rowIdx, colIdx) -> original (x, y)
  const x = colIdx;
  const y = 19 - rowIdx;

  setObstacles(prev => {
    const idx = prev.findIndex(o => o.x === x && o.y === y);
    if (idx === -1) {
      // First tap: add facing Up
      return [...prev, { x, y, d: Direction.NORTH, id: generateNewID() }];
    }

    const ob = prev[idx];
    // Rotate Up -> Right -> Down -> Left, then remove on next tap
    if (ob.d === Direction.WEST) {
      // remove on 5th tap (after Left)
      return prev.filter((_, i) => i !== idx);
    }

    const nextDir = (ob.d + 2) % 8; // 0->2->4->6
    const copy = [...prev];
    copy[idx] = { ...ob, d: nextDir };
    return copy;
  });
};


  const onResetAll = () => {
    // Reset all the states
    setRobotX(1);
    setRobotDir(0);
    setRobotY(1);
    setRobotState({ x: 1, y: 1, d: Direction.NORTH, s: -1 });
    setPath([]);
    setCommands([]);
    setPage(0);
    setObstacles([]);
  };

  const onReset = () => {
    // Reset all the states
    setRobotX(1);
    setRobotDir(0);
    setRobotY(1);
    setRobotState({ x: 1, y: 1, d: Direction.NORTH, s: -1 });
    setPath([]);
    setCommands([]);
    setPage(0);
  };

  const renderGrid = () => {
    // Initialize the empty rows array
    const rows = [];

    const baseStyle = {
      width: 25,
      height: 25,
      borderStyle: "solid",
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      padding: 0,
    };

    // Generate robot cells
    const robotCells = generateRobotCells();

    // Generate the grid
    for (let i = 0; i < 20; i++) {
      const cells = [
        // Header cells
        <td key={i} className="w-5 h-5 md:w-8 md:h-8">
          <span className="text-orange-950 font-bold text-[0.6rem] md:text-base font-serif ">
            {19 - i}
          </span>
        </td>,
      ];

      for (let j = 0; j < 20; j++) {
        let foundOb = null;
        let foundRobotCell = null;

        for (const ob of obstacles) {
          const transformed = transformCoord(ob.x, ob.y);
          if (transformed.x === i && transformed.y === j) {
            foundOb = ob;
            break;
          }
        }

        if (!foundOb) {
          for (const cell of robotCells) {
            if (cell.x === i && cell.y === j) {
              foundRobotCell = cell;
              break;
            }
          }
        }
        // helper inside renderGrid() for cleaner pushes
      const pushCell = (cls) => {
        cells.push(
          <td
            onClick={() => onGridCellClick(i, j)}
            className={classNames("w-5 h-5 md:w-8 md:h-8 cursor-pointer", cls)}
          />
        );
      };


        

        if (foundOb) {
        if (foundOb.d === Direction.WEST) {
          pushCell("border border-l-4 border-l-red-500 bg-orange-950");
        } else if (foundOb.d === Direction.EAST) {
          pushCell("border border-r-4 border-r-red-500 bg-orange-950");
        } else if (foundOb.d === Direction.NORTH) {
          pushCell("border border-t-4 border-t-red-500 bg-orange-950");
        } else if (foundOb.d === Direction.SOUTH) {
          pushCell("border border-b-4 border-b-red-500 bg-orange-950");
        }
      } else if (foundRobotCell) {
        if (foundRobotCell.d !== null) {
          pushCell(classNames(
            "border",
            foundRobotCell.s != -1 ? "bg-red-500" : "bg-yellow-50"
          ));
        } else {
          pushCell("bg-yellow-400 border-white border");
        }
      } else {
        const wasVisited = visitedGrid.has(`${i},${j}`);
        pushCell(classNames("border-black border", wasVisited && "bg-purple-200"));
      }
      }


      rows.push(<tr key={19 - i}>{cells}</tr>);
    }

    const yAxis = [<td key={0} />];
    for (let i = 0; i < 20; i++) {
      yAxis.push(
        <td className="w-5 h-5 md:w-8 md:h-8">
          <span className="text-orange-950 font-bold text-[0.6rem] md:text-base font-serif">
            {i}
          </span>
        </td>
      );
    }
    rows.push(<tr key={20}>{yAxis}</tr>);
    return rows;
  };

  useEffect(() => {
    if (page >= path.length) return;
    setRobotState(path[page]);
  }, [page, path]);

  return (
  <div className="min-h-screen">
    <div className="mx-auto max-w-7xl px-4 py-8
                    grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr] gap-10">

      {/* LEFT PANEL */}
      <aside className="flex flex-col items-start">
        <h2 className="text-2xl text-black font-semibold font-serif">Algorithm Simulator</h2>
        <p className="mt-3 font-serif text-black">Click anywhere on the grid to place Obstacles.</p>
        <p className="font-serif text-black">Tap the obstacle to rotate (the 4th tap removes it)</p>

        {/* badges, XY, etc. */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          {obstacles.map((ob) => (
            <div key={ob.id}
                 className="badge flex items-center gap-2 font-serif text-black bg-orange-300 rounded-x">
              <span>X: {ob.x}</span><span>Y: {ob.y}</span><span>D: {DirectionToString[ob.d]}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   className="inline-block w-4 h-4 stroke-current cursor-pointer"
                   onClick={() => onRemoveObstacle(ob)}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
          ))}
        </div>

        {/* BUTTONS — pinned left, toward bottom on large screens */}
        <div className="flex gap-3 justify-start self-start mt-6 lg:mt-auto">
          <button className="btn border-0 bg-orange-600 text-white font-serif" onClick={onResetAll}>Reset All</button>
          <button className="btn border-0 bg-orange-600 text-white font-serif" onClick={onReset}>Reset Robot</button>
          <button className="btn border-0 bg-orange-600 text-white font-serif" onClick={compute}>Submit</button>
        </div>
      </aside>

      {/* RIGHT PANEL (Grid + stepper) */}
      <main className="flex flex-col items-end">
        {path.length > 0 && (
          <div className="flex items-center gap-4 mb-4 bg-sky-200 p-3 rounded-xl shadow">
            <button className="btn btn-circle" disabled={page===0} onClick={()=>setPage(page-1)}>‹</button>
            <span className="text-black">Step: {page+1} / {path.length}</span>
            <span className="text-black">{commands[page]}</span>
            <button className="btn btn-circle" disabled={page===path.length-1} onClick={()=>setPage(page+1)}>›</button>
          </div>
        )}

        {/* Make the grid use all remaining width */}
        <div className="w-full max-w-full overflow-auto">
          <table className="border-collapse">
            <tbody>{renderGrid()}</tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
);

}
