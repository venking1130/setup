// miniprogram/pages/createOrder/createOrder.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  tapCreateCustomer: function(e) {
    console.log("tapCreateCustomer" + e);
    var curData = e.currentTarget.dataset;
    console.log(curData.info);
    wx.navigateTo({
      url: '/pages/createCustomer/createCustomer?code=' + curData.info,
    })
  },

  tapCreateOrder: function (e) {
    console.log("tapCreateOrder" + e);
    var curData = e.currentTarget.dataset;
    console.log(curData.info);
    wx.navigateTo({
      url: '/pages/createOrder/createOrder?code=' + curData.info,
    })
  },

  tapCreateGoods: function(e) {
    console.log("tapCreateGoods" + e);
    var curData = e.currentTarget.dataset;
    console.log(curData.info);
    wx.navigateTo({
      url: '/pages/createGoods/createGoods?code=' + curData.info,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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