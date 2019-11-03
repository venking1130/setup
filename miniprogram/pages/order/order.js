// pages/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderTitle: ["姓名", "装修地址", "联系方式", "订单状态"],
    orderCustomer:null,
    orderCustomerObject:[], // 订单相应客户信息
    orders:null, // 服务器端订单数据
    orderDatas:[], // 显示数据信息
  },

  toOrderDetail: function (e) {
    // 此处跳转到订单详细数据
    console.log(this.data.orderDatas);
    var curData = e.currentTarget.dataset;
    console.log(curData.info);
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail?code='+curData.info.code,
    })
  },

  getOrderCustomer: function (order) {
    if (!order) {
      return null;
    }

    var _this = this;
    const db = wx.cloud.database("MLS");
    const cmd = db.command;
    db.collection('customers')
      .where({
        _id: order.orderCustomerID,
      }).get({
        success: res => {
          var customer = res.data[0];

          var temp = { "orderCustomer": customer.customer, "orderState": order.orderState, "installAddress": order.installAddress, "phone": customer.phone };
    
          _this.setData({
            orderDatas: this.data.orderDatas.concat([temp]),
          });
        },
        fail: res => {
          wx.showToast({
            title: "Error:" + res,
            icon: 'none',
          });
        }
      });
  },

  packageDatas: function (orders) {
    for (let i = 0; i < orders.length; i++) {
      this.getOrderCustomer(orders[i]);
    }
  },

  getOrders:function() {
    var _this = this;
    const db = wx.cloud.database("MLS");
    const cmd = db.command;
    db.collection('orders')
      .get({
        success: res => {
          this.setData({
            orders: res.data,
          });
          this.packageDatas(res.data);
        },
        fail: res => {
          wx.showToast({
            title: "Error:" + res,
            icon: 'none',
          });
        }
      });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrders();
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