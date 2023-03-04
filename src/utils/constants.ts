const SIZE = 16;          //размер полей по горизонтали и вертикали
const MINE = -1;          //числовой отображение мины на карте
const COUNT_MINE = 40;    //количество мин

enum Mask {
  Transparent,
  Fill,
  Flag,
  Question,
  Bang,
  NotBomb,
}

export { SIZE, MINE, COUNT_MINE, Mask };