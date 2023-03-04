import React, { useEffect, useState } from 'react'
import soundMine from "../../assets/boom.mp3";
import soundClick from "../../assets/click.mp3";
import { Counter } from '../Counter/Counter';
import "./Game.css";

export const Game = () => {
  enum Mask {
    Transparent,
    Fill,
    Flag,
    Question,
    Bang,
    NotBomb,
  }

  const size = 16;
  const Mine = -1;
  const countMine = 40;
  let coord: number;
  const [timer, setTimer] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<boolean>(false);
  const [counterMin, setCounterMin] = useState<number>(countMine);
  const [isFirstStep, setFirstStep] = useState<boolean>(true);
  const [field, setField] = useState<number[]>(() => createField(size));
  const [mask, setMask] = useState<Mask[]>(() =>
    new Array(size * size).fill(Mask.Fill)
  );
  const [lose, setLose] = useState<boolean>(false);
  const [pressedButtonField, setPressedButtonField] = useState<boolean>(false);
  const [pressedButtonSmile, setPressedButtonSmile] = useState<boolean>(false);
  const dimension = new Array(size).fill(0);
  const win = checkVictory(mask, counterMin, size);

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
    setCounterMin(countMine);
    setLose(false);
    setField(createField(size));
    setMask(new Array(size * size).fill(Mask.Fill));
    setFirstStep(true);
  }

  function handleClickField(x: number, y: number) {
    setGameStatus(true);
    const clearing: [number, number][] = [];
    function clear(x: number, y: number) {
      if (x >= 0 && x < size && y >= 0 && y < size) {
        if (mask[y * size + x] === Mask.Transparent) return;
        clearing.push([x, y]);
      }
    }
    if (mask[y * size + x] === Mask.Transparent) return;
    clear(x, y);
    while (clearing.length) {
      const [x, y] = clearing.pop()!!;
      mask[y * size + x] = Mask.Transparent;
      if (field[y * size + x] !== 0) continue;
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
        if (field[y * size + x] === Mine) return;
        field[y * size + x] += 1;
      }
    }
    for (let i = 0; i < counterMin; ) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      if (field[y * size + x] === Mine) continue;
      if (y * size + x === coord) continue;
      field[y * size + x] = Mine;
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
                              coord = y * size + x;
                              if (isFirstStep && field[coord] === Mine) {
                                setField(createField(size));
                                handleClickField(x, y);
                                setFirstStep(false);
                                console.log("Поле обновилось");
                              }
                              setFirstStep(false);
                              handleClickField(x, y);
                            }
                          : () => {
                              handleClickField(x, y);
                              if (field[y * size + x] === Mine) {
                                mask.forEach((_, i) => {
                                  if (field[i] === Mine) {
                                    mask[y * size + x] = Mask.Bang;
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
                              if (mask[y * size + x] === Mask.Transparent)
                                return;
                              if (mask[y * size + x] === Mask.Fill) {
                                mask[y * size + x] = Mask.Flag;
                                setCounterMin(counterMin - 1);
                              } else if (mask[y * size + x] === Mask.Flag) {
                                mask[y * size + x] = Mask.Question;
                                setCounterMin(counterMin + 1);
                              } else if (mask[y * size + x] === Mask.Question) {
                                mask[y * size + x] = Mask.Fill;
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
                        mask[y * size + x] !== Mask.Transparent
                          ? mapMaskToView[mask[y * size + x]]
                          : field[y * size + x]
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
