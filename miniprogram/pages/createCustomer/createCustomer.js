// miniprogram/pages/createCustomer/createCustomer.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 数据合法性校验
   */
  judgeInfo: function(info) {
    var comm = require("/../../config/public.js");
    if ((null != comm.judgeNull(info.customerName)) && 
      (null != comm.judgeNull(info.customerPhone)) && 
      (null != comm.judgeNull(info.customerAddress))) {
        return info;
      }
    return null;
  },

  judgeUnique: function (info) {
    
  },

  addCustomer: function (db, info) {
    if (null == db || !info) {
      return ;
    }
    const customers = db.collection('customers');
    customers.add({
      data: {
        customer: info.customerName,
        phone: info.customerPhone,
        address: info.customerAddress,
        orders:[],
      },
      success: function (res) {
        wx.showToast({
          title: "添加成功",
          duration: 2000
        })
      },
      fail: function (res) {
        wx.showToast({
          title: "添加失败",
          icon: "none",
          duration: 2000
        })
      }
    })
  },

  /**
   * 数据交互
   */
  callCloudDB: function(info) {
    var customer = info;
    console.log(customer);
    const db = wx.cloud.database("MLS");
    db.collection('customers')
      .where({
        phone: customer.customerPhone
      }).get({
        success: res => {
          var customers = res.data;

          if (customers && customers.length > 0) {
            wx.showToast({
              title: "已存在电话相同客户！",
              icon: 'none',
            });
            console.log(customers);
          } else {
            this.addCustomer(db, customer);
          }

          return false;
        },
        fail: res => {
          this.addCustomer(customer);
        }
      });
  },

  /**
   * 数据提交
   */
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var submitInfo = e.detail.value;
    if (!submitInfo) {
      wx.showToast({
        title: '信息不能为空！',
      })
      return;
    } else {
      var info = this.judgeInfo(submitInfo);
      if (null != info) {
          this.callCloudDB(info);
      }
    }
  },

  formReset: function () {
    console.log('form发生了reset事件')
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