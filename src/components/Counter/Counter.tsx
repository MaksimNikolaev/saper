import React from 'react'

type Props = {
  timer: number,
}

export const Counter: React.FC<Props> = ({timer}) => {
  return (
    <div>
              <div className={`icon icon-big-${timer < 0 ? 0 : timer.toString().length > 2 ? timer.toString()[0] : 0}`}></div>
              <div className={`icon icon-big-${timer < 0 ? 0 :timer.toString().length > 2 ? timer.toString()[1] : timer.toString().length > 1 ? timer.toString()[0]: 0}`}></div>
              <div className={`icon icon-big-${timer < 0 ? 0 :timer.toString().length > 2 ? timer.toString()[2] : timer.toString().length > 1 ? timer.toString()[1]: timer.toString()[0] }`}></div>
    </div>
  )
}
