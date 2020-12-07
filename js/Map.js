/*
 * @Descripttion: 
 * @Author: NoYo
 * @Date: 2020-12-03 11:39:45
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-12-04 17:41:42
 */
class Map {
  constructor() {
    this.init()
  }
  // 初始化
  init () {
    // 矩阵生成
    this.matrix = (function () {
      var arr = [];
      for (var r = 0; r < game.gameRow; r++) {
        var a = [];
        for (var c = 0; c < game.gameCol; c++) {
          a.push(_.random(0, game.spriteAmount - 1));
        }
        arr.push(a);
      }
      return arr;
    })();
    //根据矩阵生成精灵
    this.createSpritesByMatrix();
    this.check()
  }
  //根据矩阵生成精灵
  createSpritesByMatrix () {
    this.sprites = [];	//二维数组
    //遍历每一行
    for (var r = 0; r < game.gameRow; r++) {
      var _temp = [];
      for (var c = 0; c < game.gameCol; c++) {
        _temp.push(new Sprite(r, c, this.matrix[r][c]));
      }
      this.sprites.push(_temp);
    }
  }
  // 渲染
  render () {
    //渲染自己精灵矩阵中的所有精灵
    for (var r = 0; r < game.gameRow; r++) {
      for (var c = 0; c < game.gameCol; c++) {
        //只要是精灵的实例，就能调用精灵的方法
        this.sprites[r][c].render();
      }
    }
  }
  // 检查
  check (immediatelyBomb = true) {
    var boomItems = [];
    // 先按行检查
    for (let r = 0; r < game.gameRow; r++) {
      let i = 0, j = 1
      while (j <= game.gameRow - 1) {
        if (this.matrix[r][i] === this.matrix[r][j]) {
          if ((j - i) >= 2) {
            boomItems.push(this.sprites[r][i], this.sprites[r][i + 1], this.sprites[r][i + 2])
          }
          j++
        } else {
          i = j
          j++
        }
      }
    }
    // 再按列检查
    for (let c = 0; c < game.gameCol; c++) {
      let i = 0, j = 1
      while (j <= game.gameCol - 1) {
        if (this.matrix[i][c] === this.matrix[j][c]) {
          if ((j - i) >= 2) {
            // 相隔2位  三连成功
            boomItems.push(this.sprites[i][c], this.sprites[i + 1][c], this.sprites[i + 2][c])
            i++
          }
          j++
        } else {
          i = j
          j++
        }
      }
    }
    // 去重
    this.boomItems = _.uniq(boomItems);
    if (boomItems.length) {
      if (!immediatelyBomb) {
        this.createSpritesByMatrix()
      }
      this.bomb()
    } else {
      game.state = 1
    }
    return boomItems.length
  }
  // 销毁
  bomb () {
    game.state = 2
    let boomItems = this.boomItems
    //根据一次销毁的精灵个数增加分数
    if (boomItems.length > 7) {
      game.score += boomItems.length + 2
    } else if (boomItems.length > 5) {
      game.score += boomItems.length + 1
    } else {
      game.score += boomItems.length
    }
    //记录combo帧号
    game.comboFno = game.fno;
    //计算联销 1秒50帧  combo等级越高 持续时间越短
    if (game.fno - game.comboFno < 50 * (10 - game.combo)) {
      game.combo++; // combo数增加
      if (game.combo > 8) {
        game.combo = 8;
      }
    } else {
      game.combo = 1; // combo数重置
    }
    if (game.combo >= 8) {
      game.score += game.combo * 3;
    } else if (game.combo >= 4) {
      game.score += game.combo * 2
    } else {
      game.score += game.combo
    }
    for (var i = 0; i < boomItems.length; i++) {
      this.sprites[boomItems[i].row][boomItems[i].col].isBombing = true;
      //矩阵爆炸坐标变为■
      this.matrix[boomItems[i].row][boomItems[i].col] = "■";
    }
    // 爆炸动画 7*2 动作间隔4 
    game.makeAppointment(game.fno + 7 * 2 + 4, () => {
      // 预约下落
      this.drop()
    });
  }
  // 下落
  drop () {
    game.state = 3
    // 看看当前的matrix，依次遍历每一个元素，计算这个元素应该下落的行数。就是统计这个元素下面的■的个数。
    // 从最底层开始遍历  已销毁的往上跟未销毁交换 直到下方紧贴 如果
    for (var row = game.gameRow - 1; row >= 0; row--) {
      for (var col = 0; col < game.gameCol; col++) {
        // 移动距离
        var sum = 0;
        for (var _row = row + 1; _row < game.gameRow; _row++) {
          if (this.matrix[_row][col] == "■") {
            sum++;
          }
        }
        //命令动画
        // row + sum 代表目标位置
        this.sprites[row][col].moveTo(row + sum, col);
        //紧凑编码矩阵
        if (sum != 0) {
          // 移动后所在位置的矩阵内容改该元素内容  下落完成的时候重新生成加上方补充
          this.matrix[row + sum][col] = this.matrix[row][col];
          // 该精灵所在位置的矩阵内容销毁
          this.matrix[row][col] = "■";
        }

      }
    }
    // 预约补充 下落动画8 动作间隔4 
    game.makeAppointment(game.fno + 8 + 4, () => {
      this.supplement()
    });
  }
  // 补充
  supplement () {
    game.state = 4
    this.createSpritesByMatrix()
    //遍历当前的matrix，遇见一个■就new一个新的，同时命令动画
    for (var row = 0; row < game.gameRow; row++) {
      for (var col = 0; col < game.gameCol; col++) {
        if (this.matrix[row][col] == "■") {
          var stype = _.random(0, game.spriteAmount - 1);
          //遇见一个■就补充一个新的
          this.sprites[row][col] = new Sprite(row, col, stype);
          //在天上就位
          this.sprites[row][col].y = 0;
          //然后下落
          this.sprites[row][col].moveTo(row, col);
          //写matrix
          this.matrix[row][col] = stype;
        }
      }
    }
    // 预约补充 动画8 动作间隔4 
    game.makeAppointment(game.fno + 8 + 4, () => {
      this.check()
    });
  }
}
