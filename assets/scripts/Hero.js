cc.Class({
  extends: cc.Component,

  properties: {
    jumpSpeed: cc.v2({ x: 0, y: 300 }), // 加速度
    maxJumpDistance: 100, // 跳躍高度上限
    jumpSprite: {
      default: null,
      type: cc.SpriteFrame
    }
  },

  // LIFE-CYCLE CALLBACKS:

  // 按下空白鍵、touch 螢幕, 開始跳躍
  onListenerEvent() {
    // 監聽鍵盤 key down 事件
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event) => {
      switch (event.keyCode) {
        case cc.macro.KEY.space:
          this.isJumpKeyPressed = true;
          break;
      }
    });

    // 監聽鍵盤 key up 事件
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, (event) => {
      switch (event.keyCode) {
        case cc.macro.KEY.space:
          this.isJumping = false;
          this.isJumpKeyPressed = false;
          break;
      }
    });

    // 監聽父層 touch start 事件
    this.node.parent.on(cc.Node.EventType.TOUCH_START, () => {
      this.isJumpKeyPressed = true;
    });

    // 監聽父層 touch end 事件
    this.node.parent.on(cc.Node.EventType.TOUCH_END, () => {
      this.isJumping = false;
      this.isJumpKeyPressed = false;
    });
  },

  // 事件、方法初始時機
  onLoad() {
    this.onListenerEvent();
  },

  // 數據初始化時機
  start() {
    this.animation = this.node.getComponent(cc.Animation);
    this.sprite = this.node.getComponent(cc.Sprite);
    this.body = this.getComponent(cc.RigidBody);
    this.isOnGround = false;
    this.isJumping = false;
    this.isJumpFinished = false;
    this.isJumpKeyPressed = false;
    this.startJumpY = null;
  },

  // 監聽物理碰撞
  onBeginContact() {
    this.isOnGround = true;
  },

  // 監聽物理結束碰撞
  onEndContact() {
    this.isOnGround = false;
  },

  // 監聽碰撞
  onCollisionEnter(other, self) {
    if (other.node.name === "diamond") {
      other.node.destroy();
      this.node.emit("score");
    }
  },

  update(dt) {
    if (this.isJumpKeyPressed) {
      this.jump();
    }

    this.animate();

    if (this.node.y < -cc.winSize.height / 2) {
      this.node.emit("die");
    }
  },

  /* 跳躍邏輯
    if 如果 hero 站在地板上
      記住 hero 開始位置
      設定 跳躍尚未結束
      設定 開始跳躍
      設定 hero 往上跳的加速度

    else if 如果英雄還在跳躍中, 且尚未結束
      if 如果還沒跳到最高高度
        繼續往上跳, 維持 y 軸加速度
      else
        結束跳躍
  */
  jump() {
    // 如果 hero 站在地板上
    if (this.isOnGround) {
      this.startJumpY = this.node.y;
      this.isJumpFinished = false;
      this.isJumping = true;
      this.body.linearVelocity = this.jumpSpeed;
      // 如果 hero 還在跳躍中, 且尚未結束
    } else if (this.isJumping && !this.isJumpFinished) {
      const jumpDistance = this.node.y - this.startJumpY;
      // 如果還沒跳到最高高度
      if (jumpDistance < this.maxJumpDistance) {
        this.body.linearVelocity = this.jumpSpeed;
        // 已經跳到最高高度
      } else {
        this.isJumpFinished = true;
      }
    }
  },

  animate() {
    const isPlaying = this.animation.getAnimationState("running").isPlaying;

    // hero 跑在地板上, 且 animation 尚未 play
    if (this.isOnGround && !isPlaying) {
      this.animation.start("running");
    }
    // hero 跳耀中, 且 animation 是 playing 狀態
    if (!this.isOnGround && isPlaying) {
      this.animation.stop();
      this.sprite.spriteFrame = this.jumpSprite;
    }
  }
});
