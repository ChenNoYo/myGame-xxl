/*
 * @Descripttion: 
 * @Author: NoYo
 * @Date: 2020-12-03 11:05:36
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-12-07 08:54:13
 */
/**
* @name: 
* @msg: 
* @param {源数据} array 
* @param {目标长度} Amount
* @return {*}
*/
class Game {
  /**
   * @name: 
   * @param {*} el canvas元素
   * @param {*} row 行数
   * @param {*} col 列数
   * @param {*} spriteAmount 精灵数
   * @return {*}
   */
  constructor(el, row, col, spriteAmount) {
    // canvas主体
    this.canvas = document.querySelector(el)
    // 上下文
    this.ctx = this.canvas.getContext("2d")
    // 资源
    this.resources = {
      "i1": "image/i1.jpg",
      "i2": "image/i2.jpg",
      "i3": "image/i3.jpg",
      "i4": "image/i4.jpg",
      "i5": "image/i5.jpg",
      "i6": "image/i6.jpg",
      "i7": "image/i7.jpg",
      "i8": "image/i8.jpg",
      "i9": "image/i9.jpg",
      "bomb": "image/bomb.png"
    };
    // 游戏行数
    this.gameRow = row
    // 游戏列数
    this.gameCol = col
    // 上方留白
    this.paddingT = 50 + 50
    // 左右留白
    this.paddingLR = 16
    // 精灵数
    this.spriteAmount = spriteAmount
    // 精灵边距
    this.spriteBorder = 2
    // 精灵资源
    // 预约器
    this.appointment = []
    this.init()
  }
  // 初始化
  init () {
    //设置canvas的宽度和高度，适配当前的视口
    this.canvas.width = document.documentElement.clientWidth;
    this.canvas.height = document.documentElement.clientHeight;
    if (this.canvas.width > 500) {
      this.canvas.width = 500;
    }
    if (this.canvas.height > 800) {
      this.canvas.height = 800;
    }
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    //精灵尺寸 宽高相等
    this.spriteSize = (this.canvas.width - 2 * this.paddingLR) / this.gameCol;
    this.loadSource(() => {
      // 展示开始
      this.showStart()
      // 绑定事件
      this.bindEvent()
    })
  }
  // 加载游戏资源
  loadSource (callback) {
    //图片资源总数
    var imagesAmount = Object.keys(this.resources).length;
    var self = this;
    var count = 0;
    for (let k in this.resources) {
      let image = new Image();
      image.src = self.resources[k];
      //监听图片加载完成
      image.onload = function () {
        //计数
        count++;
        // 修改为资源
        self.resources[k] = image;
        //提示用户
        self.ctx.textAlign = "center";
        self.ctx.font = "20px 黑体";
        self.ctx.fillStyle = "#fff"
        self.ctx.fillText("加载中" + Math.floor(count / imagesAmount) + '%', self.canvas.width / 2, 300);
        //如果加载好的数量等于总数，说明全都加载好了
        if (count == imagesAmount) {
          //清除提示
          self.clear();
          //全部加载完毕，执行回调函数。
          callback.call(self);
        }
      }
    }
  }
  start () {
    // 设置帧编号
    this.fno = 0;
    // 随机取
    this.spriteTypes = _.sample(["i1", "i2", "i3", "i4", "i5", "i6", "i7", "i8", "i9"], this.spriteAmount);
    // 实例化地图
    this.map = new Map(this);
    // 游戏总时间
    this.alltime = 90
    // 游戏得分
    this.score = 0
    // 连消次数
    this.combo = 0
    // 游戏状态
    this.state = 1   // 0动画 1检查 2爆炸 3下落 4补充 5交换 6结束 7等待开始
    // 进度条
    this.rate = 1;
    this.stop()
    // 主循环
    this.timer = setInterval(
      this.loop.bind(this), 20);
  }
  // 停止循环
  stop () {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
  // 展示开始
  showStart () {
    this.state = 7
    this.clear()
    //提示用户
    this.ctx.textAlign = "center";
    this.ctx.font = "20px 黑体";
    this.ctx.fillStyle = "#fff"
    this.ctx.fillText("点击开始", this.canvas.width / 2, 300);
  }
  // 展示结果
  showResult () {
    this.state = 6
    this.clear()
    this.ctx.textAlign = "center";
    this.ctx.font = "20px 黑体";
    this.ctx.fillStyle = "#fff"
    this.ctx.fillText("得分:" + this.score, this.canvas.width / 2, 300);
    this.ctx.fillText("点击重新开始", this.canvas.width / 2, 320);
  }
  loop () {
    // 检查预约器
    for (var i = this.appointment.length - 1; i >= 0; i--) {
      if (this.appointment[i].fno == this.fno) {
        this.appointment[i].fn.call(this);
        // 删除预约任务
        this.appointment.splice(i, 1);
      }
    }
    // 清屏
    this.clear();
    // 渲染矩阵精灵
    this.map.render();
    // 顶部遮挡
    this.ctx.fillRect(0, 0, this.canvas.width, this.paddingT);
    // 渲染分数
    this.renderScore()
    // 渲染时间条
    this.renderRank()
  }
  // 清屏
  clear () {
    // 清屏
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // 背景渲染
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  // 渲染进度条
  renderRank () {
    //帧编号加1
    this.fno++;
    //计算已经流逝了的比例，一秒50帧
    this.rate = 1 - ((this.fno / 50) / this.alltime);
    if (this.rate > 0) {
      this.ctx.fillStyle = "gold";
      this.ctx.fillRect(this.paddingLR + this.spriteBorder, 70, (this.canvas.width - 2 * (this.paddingLR + this.spriteBorder)) * this.rate, 30);
    } else {
      this.stop()
      this.showResult()
    }
  }
  // 渲染游戏得分
  renderScore () {
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    this.ctx.font = "16px consolas";
    this.ctx.fillStyle = "#fff";
    // this.ctx.fillText("状态：" + this.state, this.paddingLR + 10, 20);
    this.ctx.fillText("combo：" + this.combo, this.paddingLR + 10, 20);
    this.ctx.fillText("分数：" + this.score, this.paddingLR + 10, 40);
  }
  // 事件绑定
  bindEvent () {
    var self = this;
    var startrow, startcol;
    //绑定事件
    self.canvas.addEventListener("touchstart", function (event) {
      event.preventDefault();
      // 游戏中
      if (self.state === 1 && !self.moveIng) {
        var x = event.touches[0].clientX;
        var y = event.touches[0].clientY;
        startcol = parseInt((x - self.paddingLR) / self.spriteSize);
        startrow = parseInt((y - self.paddingT) / self.spriteSize);
        // 移出精灵范围
        if (startcol < 0 || startrow < 0 || startcol > self.gameCol - 1 || startrow > self.gameRow - 1) {
          return;
        } else {
          self.moveIng = true
        }
      } else if (self.state === 7) { // 等待开始
        // 游戏开始
        self.start()
      } else if (self.state === 6) { // 游戏结束
        // 游戏开始
        self.start()
      }
    }, false);
    document.addEventListener("touchend", function (event) {
      if (self.moveIng) {
        self.moveIng = false
        var x = event.changedTouches[0].clientX;
        var y = event.changedTouches[0].clientY;
        var endcol = parseInt((x - self.paddingLR) / self.spriteSize);
        var endrow = parseInt((y - self.paddingT) / self.spriteSize);
        // 移出精灵范围
        if (endcol < 0 || endrow < 0 || endcol > self.gameCol - 1 || endrow > self.gameRow - 1) {
          return;
        }
        if ( // 相邻
          startrow == endrow && Math.abs(startcol - endcol) == 1
          ||
          startcol == endcol && Math.abs(startrow - endrow) == 1
        ) {
          //命令交换运动
          self.map.sprites[startrow][startcol].moveTo(endrow, endcol);
          self.map.sprites[endrow][endcol].moveTo(startrow, startcol);
          //交换数组矩阵  
          var temp = self.map.matrix[startrow][startcol]
          self.map.matrix[startrow][startcol] = self.map.matrix[endrow][endcol]
          self.map.matrix[endrow][endcol] = temp
          self.state === 5
          // 预约交换完成 开始检测 动画8 
          self.makeAppointment(self.fno + 8, function () {
            if (self.map.check(false)) {
              // 可消除
            } else {
              // 不可消除
              self.map.matrix[endrow][endcol] = self.map.matrix[startrow][startcol]
              self.map.matrix[startrow][startcol] = temp
              // 精灵交换回去
              console.log('交换回去')
              self.map.sprites[startrow][startcol].moveTo(startrow, startcol);
              self.map.sprites[endrow][endcol].moveTo(endrow, endcol);
              self.state = 5
              // 预约交换完成检测 动画8 
              self.makeAppointment(self.fno + 8, function () {
                self.state = 1
              });
            }
            //检查是否能消除
            // if (!self.map.check()) {
            //   // 不能消除
            //   // 数据交换回去
            //   var temp = self.map.matrix[startrow][startcol];
            //   self.map.matrix[startrow][startcol] = self.map.matrix[endrow][endcol];
            //   self.map.matrix[endrow][endcol] = temp;
            //   // 精灵交换回去
            //   self.map.sprites[startrow][startcol].moveTo(startrow, startcol);
            //   self.map.sprites[endrow][endcol].moveTo(endrow, endcol);
            //   self.state = 5
            //   // 预约交换完成检测 动画8 
            //   self.makeAppointment(self.fno + 8, function () {
            //     self.state = 1
            //   });
            // } else {
            //   // 根据交换数据过后的矩阵来重新生成sprites
            //   self.map.createSpritesByMatrix();
            // }
          });
        }
      }
    }, false);
  }
  // 创建预约任务
  /**
   * @name: 
   * @param {游戏帧} fno
   * @param {回调} fn
   * @return {*}
   */
  makeAppointment (fno, fn) {
    this.appointment.push({ fno, fn });
  }
}