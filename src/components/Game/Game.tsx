import React, { useEffect, useState } from 'react'
import soundMine from "../../assets/boom.mp3";
import soundClick from "../../assets/click.mp3";
import { COUNT_MINE, Mask, MINE, SIZE } from '../../utils/constants';
import { Counter } from '../Counter/Counter';
import "./Game.css";

export const Game = () => {  
  let coord: number;
  const [timer, setTimer] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<boolean>(false);
  const [counterMin, setCounterMin] = useState<number>(COUNT_MINE);
  const [isFirstStep, setFirstStep] = useState<boolean>(true);
  const [field, setField] = useState<number[]>(() => createField(SIZE));
  const [mask, setMask] = useState<Mask[]>(() =>
    new Array(SIZE * SIZE).fill(Mask.Fill)
  );
  const [lose, setLose] = useState<boolean>(false);
  const [pressedButtonField, setPressedButtonField] = useState<boolean>(false);
  const [pressedButtonSmile, setPressedButtonSmile] = useState<boolean>(false);
  const clearing: [number, number][] = [];
  const dimension = new Array(SIZE).fill(0);
  const win = checkVictory(mask, counterMin, SIZE);

  const mapMaskToView: Record<Mask, React.ReactNode> = {
    [Mask.Transparent]: null,
    [Mask.Fill]: "close",
    [Mask.Flag]: "flag",
    [Mask.Question]: "question",
    [Mask.Bang]: "bang",
    [Mask.NotBomb]: "notbomb",
  };

  useEffect(() => {
    const interval = setInterval(() => onStartTimer1(), 1000);
    return () => {
      clearInterval(interval);
    };
  }, [gameStatus]);

  useEffect(() => {
    setGameStatus(false);
  }, [win]);

  function checkVictory(mask: Mask[], countMine: number, size: number) {
    const transparentCount = mask.reduce(
      (acc, cell) => (cell === Mask.Transparent ? acc + 1 : acc),
      0
    );
    return transparentCount === size * size - countMine;
  }

  function onStartTimer1() {
    if (gameStatus === true) {
      setTimer((prev) => prev + 1);
    }
  }

  function resetGame() {
    setGameStatus(false);
    setTimer(0);
    setCounterMin(COUNT_MINE);
    setLose(false);
    setField(createField(SIZE));
    setMask(new Array(SIZE * SIZE).fill(Mask.Fill));
    setFirstStep(true);
  }

  function clear(x: number, y: number) {
    if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) {
      if (mask[y * SIZE + x] === Mask.Transparent) return;
      clearing.push([x, y]);
    }
  }

  function handleClickField(x: number, y: number) {
    setGameStatus(true);  
    if (mask[y * SIZE + x] === Mask.Transparent) return;
    clear(x, y);
    while (clearing.length) {
      const [x, y] = clearing.pop()!!;
      mask[y * SIZE + x] = Mask.Transparent;
      if (field[y * SIZE + x] !== 0) continue;
      clear(x + 1, y);
      clear(x - 1, y);
      clear(x, y + 1);
      clear(x, y - 1);
    }
    new Audio(soundClick).play();
    setMask((prev) => [...prev]);
  }

  function createField(size: number): number[] {
    const field: number[] = new Array(size * size).fill(0);

    function inc(x: number, y: number) {
      if (x >= 0 && x < size && y >= 0 && y < size) {
        if (field[y * size + x] === MINE) return;
        field[y * size + x] += 1;
      }
    }

    for (let i = 0; i < counterMin; ) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      if (field[y * size + x] === MINE) continue;
      if (y * size + x === coord) continue;
      field[y * size + x] = MINE;
      i += 1;
      inc(x + 1, y);
      inc(x - 1, y);
      inc(x, y + 1);
      inc(x, y - 1);
      inc(x + 1, y - 1);
      inc(x - 1, y - 1);
      inc(x + 1, y + 1);
      inc(x - 1, y + 1);
    }
    return field;
  }

  return (
    <div className="game">
        <div className="game__header">
          <Counter timer={counterMin} />
          <div
            onClick={resetGame}
            className={`icon icon-smile icon-smile_${
              pressedButtonSmile
                ? "funny-pressed"
                : pressedButtonField
                ? "afraid"
                : win
                ? "stepp"
                : lose
                ? "sad"
                : "funny"
            }`}
            onMouseDown={(e) => {
              e.button === 0 && setPressedButtonSmile(true);
            }}
            onMouseUp={(e) => e.button === 0 && setPressedButtonSmile(false)}
            onMouseLeave={() => setPressedButtonSmile(false)}
          ></div>
          <Counter timer={timer} />
        </div>
        <div className="game__field">
          {dimension.map((_, y) => {
            return (
              <div key={y}>
                {dimension.map((_, x) => {
                  return (
                    <div
                      key={x}
                      onClick={
                        win || lose
                          ? undefined
                          : isFirstStep
                          ? () => {
                              coord = y * SIZE + x;
                              if (isFirstStep && field[coord] === MINE) {
                                setField(createField(SIZE));                                
                                console.log("Поле обновилось");
                              }
                              setFirstStep(false);
                              handleClickField(x, y);
                            }
                          : () => {
                              handleClickField(x, y);
                              if (field[y * SIZE + x] === MINE) {
                                mask.forEach((_, i) => {
                                  if (field[i] === MINE) {
                                    mask[y * SIZE + x] = Mask.Bang;
                                    mask[i] = Mask.Transparent;
                                    new Audio(soundMine).play();
                                  }
                                  if (mask[i] === Mask.Flag) {
                                    mask[i] = Mask.NotBomb;
                                  }
                                });
                                setLose(true);
                                setGameStatus(false);
                              }
                            }
                      }
                      onContextMenu={
                        win || lose
                          ? undefined
                          : (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setGameStatus(true);
                              if (mask[y * SIZE + x] === Mask.Transparent)
                                return;
                              if (mask[y * SIZE + x] === Mask.Fill) {
                                mask[y * SIZE + x] = Mask.Flag;
                                setCounterMin(counterMin - 1);
                              } else if (mask[y * SIZE + x] === Mask.Flag) {
                                mask[y * SIZE + x] = Mask.Question;
                                setCounterMin(counterMin + 1);
                              } else if (mask[y * SIZE + x] === Mask.Question) {
                                mask[y * SIZE + x] = Mask.Fill;
                              }
                              setMask((prev) => [...prev]);
                            }
                      }
                      onMouseDown={(e) =>
                        e.button === 0 && setPressedButtonField(true)
                      }
                      onMouseUp={(e) =>
                        e.button === 0 && setPressedButtonField(false)
                      }
                      onMouseLeave={() => setPressedButtonField(false)}
                      className={`icon icon-field icon-field_${
                        mask[y * SIZE + x] !== Mask.Transparent
                          ? mapMaskToView[mask[y * SIZE + x]]
                          : field[y * SIZE + x]
                      }`}
                    ></div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
  )
}
