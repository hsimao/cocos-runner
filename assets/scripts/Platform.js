const tileSize = 64;

cc.Class({
  extends: cc.Component,

  properties: {
    tile: {
      default: null,
      type: cc.Prefab
    }
  },

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {},

  start() {},

  update(dt) {
    this.node.x -= 150 * dt;
  },

  init(tilesCount, x, y) {
    // 設定地板位置
    this.node.setPosition(cc.v2(x, y));

    // 創建地板磚塊 tile
    for (let i = 0; i < tilesCount; i++) {
      // 實例化 tile prefab
      const tile = cc.instantiate(this.tile);

      // 將 tile 添加到自己底下
      this.node.addChild(tile);

      // 設定 tile 位置, 往右延伸
      tile.setPosition(i * tile.width, 0);
    }

    // 更新地板  size
    this.node.width = tileSize * tilesCount;
    this.node.height = tileSize;

    // 更新地板碰撞範圍 collider size
    const collider = this.node.getComponent(cc.PhysicsBoxCollider);
    collider.size.width = this.node.width;
    collider.size.height = this.node.height;
    collider.offset.x = this.node.width / 2 - tileSize / 2;
    collider.apply();
  }
});