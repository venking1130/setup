// pages/orderDetail/orderDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderCode : "",
    customer : {"name":"小宋", "phone":"15585955625", "address":"芭蕉湾"},
    // detailTitle : ["code", "goodsName", "specs", "color", "unit", "numbers", "prics", "amount", "picture", "room", "remarks",],
    detailTitle: ["序号", "产品名称", "型号规格", "类型", "颜色", "单位", "数量", "原价(元)", "金额(元)", "优惠单价(元)", "优惠金额(元)", "图片", "区域", "备注", "状态"],
    detailData : [
      { "code": "01", "goodsName": "木林森照明", "specs": "MLS520/60*60", "type": "吊灯", "color": "粉色", "unit": "个", "numbers": 2, "prics": 1314, "amount": 2628, "discount": 1300, "disAmount": 2600, "picture": "/images/yz.jpg", "room": "主卧", "remarks": "", "state": "待收货" },
      { "code": "02", "goodsName": "万家灯饰", "specs": "WJ520/60*60", "type": "吸顶灯", "color": "粉色", "unit": "个", "numbers": 6, "prics": 5203, "amount": 31218, "discount": 5000, "disAmount": 30000, "picture": "/images/yz.jpg", "room": "次卧", "remarks": "", "state":"待下单" },
      { "code": "03", "goodsName": "木林森照明", "specs": "MLS520/60*60", "type": "吊灯", "color": "粉色", "unit": "个", "numbers": 2, "prics": 1314, "amount": 2628, "discount": 1300, "disAmount": 2600, "picture": "/images/yz.jpg", "room": "主卧", "remarks": "", "state": "待安装" },
      { "code": "04", "goodsName": "木林森照明", "specs": "MLS520/60*60", "type": "吊灯", "color": "粉色", "unit": "个", "numbers": 2, "prics": 1314, "amount": 2628, "discount": 1300, "disAmount": 2600, "picture": "/images/yz.jpg", "room": "主卧", "remarks": "", "state": "待处理" },
      { "code": "05", "goodsName": "木林森照明", "specs": "MLS520/60*60", "type": "吊灯", "color": "粉色", "unit": "个", "numbers": 2, "prics": 1314, "amount": 2628, "discount": 1300, "disAmount": 2600, "picture": "/images/yz.jpg", "room": "主卧", "remarks": "", "state": "已完成" },
    ],
  },

  toOrderDetailInfo: function (e) {
    // 此处跳转到订单详细数据
    console.log(e);
    var curData = e.currentTarget.dataset;
    console.log(curData.info);
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail?code=' + curData.info.code,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取上级参数信息
    this.data.orderCode = options;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})