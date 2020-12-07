/*
 * @Descripttion: 
 * @Author: NoYo
 * @Date: 2020-12-03 11:57:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-12-04 17:34:43
 */
class Sprite {
  constructor(row, col, type) {
    //行号
    this.row = row;
    //列号
    this.col = col;
    //图片类型
    this.type = type;
    //计算x和w
    this.x = this.col * game.spriteSize + game.paddingLR
    this.y = this.row * game.spriteSize + game.paddingT
    //小状态，是否处于爆炸状态
    this.isBombing = false;
    //爆炸切片序号0~7
    this.bombNumber = 0;
    //小状态，自己是否隐藏
    this.hide = false;
    //小状态，自己是否正在移动
    this.isMoving = false;
    //增量
    this.dx = 1;
    this.dy = 1;
    //总运动帧数
    this.animateDuring = 8
    //小帧号
    this.animateFrame = 0;
  }
  render () {
    //根据自己是否正在移动，改变x、y
    if (this.isMoving) {
      this.x += this.dx;
      this.y += this.dy;
      //如果已经到了总运动帧数，停止运动
      this.animateFrame++;
      if (this.animateFrame == this.animateDuring) this.isMoving = false;
    }
    //如果自己是隐藏状态，此时不需要渲染任何东西
    if (this.hide) return;
    //根据自己是否处于爆炸状态，来决定渲染什么
    if (!this.isBombing) {
      // xy各减去边框距离
      game.ctx.drawImage(game.resources[game.spriteTypes[this.type]], this.x + game.spriteBorder, this.y + game.spriteBorder, game.spriteSize - game.spriteBorder, game.spriteSize - game.spriteBorder);
    } else {
      //处于爆炸状态
      game.ctx.drawImage(game.resources["bomb"], 200 * this.bombNumber, 0, 200, 200, this.x, this.y, game.spriteSize, game.spriteSize);
      //让爆炸动画序列加1
      game.fno % 2 == 0 && this.bombNumber++;
      //图片编号0~7，所以当渲染完毕之后隐藏自己
      if (this.bombNumber > 7) {
        //隐藏自己
        this.hide = true;
        this.bombNumber = 0;
      }
    }
  }
  moveTo (targetRow, targetCol) {
    //计算目标移动后的位置所在的x、y：
    var targetX = game.paddingLR + targetCol * game.spriteSize;
    var targetY = game.paddingT + targetRow * game.spriteSize;
    //与现在的x、y进行比对，计算出distanceX、distanceY 相对移动距离
    var distanceX = targetX - this.x;
    var distanceY = targetY - this.y;
    //计算dx和dy 每帧移动距离
    this.dx = distanceX / this.animateDuring;
    this.dy = distanceY / this.animateDuring;
    //小帧号清零
    this.animateFrame = 0;
    //运动
    this.isMoving = true;
  }
}
