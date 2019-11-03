// miniprogram/pages/createOrder/createOrder.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasHidden:true, // 是否显示搜索内容
    searchInfo:"", // 搜索内容
    orderCustomer: null, // 存储客户ID
    orderCustomerID:"",
    orderCustomerName:"", // 显示客户信息
    customerObject:null, // 搜索得到客户列表
    orderDate:"", // 订单日期
    preInstallDate:"", // 订单预安装日期
    orderState: ["待选产品", "待下单", "待收货", "待安装", "待处理", "待收款"], 
    orderStateIdx:0, // 订单状态索引
    orderType:["家装", "工装", "供货"],
    orderTypeIdx:0,
    orderImageUrl:[],
    imageMD5:[],
    cloudImageId:[]
  },

  bindKeyInput: function (e) {
    this.setData({
      searchInfo: e.detail.value
    });
    if (!this.data.hasHidden && (!this.data.searchInfo || 0 == this.data.searchInfo.length)) {
      this.setData({
        hasHidden:true,
      })
    }
  },

  orderDateChange: function (e) {
    this.setData({
      orderDate: e.detail.value
    })
  },

  preInstallDateChange: function (e) {
    this.setData({
      preInstallDate: e.detail.value
    })
  },

  orderStateChange: function (e) {
    this.setData({
      orderStateIdx: e.detail.value
    })
  },

  orderTypeChange: function (e) {
    this.setData({
      orderTypeIdx: e.detail.value
    })
  },

  addImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'],  //可选择原图或压缩后的图片
      sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
      success: res => {

        var images = res.tempFiles;
        this.setData({
          orderImageUrl: images.length <= 3 ? images : images.slice(0, 3)
        })

        Promise.all(that.data.orderImageUrl.map((item) => {
          wx.getFileSystemManager().readFile({
            filePath: item.path, //选择图片返回的相对路径
            // encoding: 'binary', //编码格式
            success: res => {
              //成功的回调
              var spark = new sMD5.ArrayBuffer();
              spark.append(res.data);
              var hexHash = spark.end(false);
              var temp = that.data.imageMD5;
              temp.push(hexHash);
              that.setData({
                imageMD5: temp
              });
              return temp;
            }
          })
        })).catch((err) => {
          console.log("addImage-catch:" + JSON.stringify(err));
        });
      }
    })
  },

  previewImg: function (e) {
    // console.log("previewImg-info:" + JSON.stringify(e));
    var info = e.currentTarget.dataset.info;
    // console.log("previewImg-info:" + JSON.stringify(info));
    var current = this.data.orderImageUrl[info];
    console.log("previewImg-current:" + JSON.stringify(current));
    if (!info) { return; }
    wx.previewImage({ current: current, urls: this.data.orderImageUrl });
  },

  deleteImage: function (e) {
    var that = this;
    var images = that.data.orderImageUrl;
    var index = e.currentTarget.dataset.info; //获取当前长按图片下标
    wx.showModal({
      title: '系统提醒',
      content: '确定要删除此图片吗？',
      success: function (res) {
        if (res.confirm) {
          images.splice(index, 1);
        } else if (res.cancel) {
          return false;
        }
        that.setData({
          orderImageUrl: images
        });
      }
    })
  },

  searchCustomer: function(e) {
    var _this = this;
    const db = wx.cloud.database("MLS");
    const cmd = db.command;
    db.collection('customers')
      .where(cmd.or([
        { customer: { $regex: ".*" + this.data.searchInfo + ".*"} },
        { phone: { $regex: ".*" + this.data.searchInfo + ".*" } },
        { address: { $regex: ".*" + this.data.searchInfo + ".*" } },
      ])).get({
        success:res=> {
          var customers = res.data;
          if (customers && customers.length > 0) {
            this.setData({
              customerObject: customers,
              hasHidden: false
            });
          } else {
            wx.showToast({
              title: "未找到！！！请新建客户信息！",
              icon: 'none',
            });
          }
        },
        fail: res=> {
          wx.showToast({
            title: "Error:" + res,
            icon: 'none',
          });
        }
      });
  },
  /**
  * 数据合法性校验
  */
  judgeInfo: function (info) {
    var comm = require("/../../config/public.js");
    if (!info || !info.orderCustomerID) {
      wx.showToast({
        title: "请新建/选择客户信息！",
        icon: 'none',
      });
      return null;
    }
    
    var s = comm.judgeNull(info.orderDate);
    if (!s || 0 == s.length) {
      info.orderDate = comm.formatDateString(new Date(), '').substring(0, 8);
    }

    if ((null != comm.judgeNull(info.orderEarnest)) &&
      (null != comm.judgeNull(info.preInstallDate)) &&
      // (null != comm.judgeNull(info.orderRemark)) &&
      (null != comm.judgeNull(info.orderInstallAddress))) {
      return info;
    }
    return null;
  },

  doUpload: function (info) {
    // 上传图片
    var that = this;
    var images = that.data.orderImageUrl;

    wx.showLoading({
      title: '图片上传中 ···',
    });
    let uploads = [];
    images.forEach(function (item, index) {
      uploads.push(new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: 'WlsGoodsImages/' + that.data.imageMD5[index] + item.path.match(/\.[^.]+?$/)[0], // 文件名称 
          filePath: item.path,
          success: function (res) {
            var id = that.data.cloudImageId;
            id.push(res.fileID);
            that.setData({
              cloudImageId: id
            });
            resolve(res.fileID);
          },
          fail: function (err) {
            reject(res);
          }
        });
      }))
    });

    Promise.all(uploads).then(res => {
      wx.hideLoading();
      wx.showLoading({
        title: '数据上传中 ···',
      });
      that.callCloundDB(info);
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '上传失败请重试' + JSON.stringify(err),
        icon: 'none'
      });
    })
  },

  addOrder: function(info) {
    const db = wx.cloud.database();
    const customers = db.collection('orders');

    customers.add({
      data: {
        orderCustomerID: this.data.orderCustomerID,
        orderDate: info.orderDate,
        preInstallDate: info.preInstallDate,
        installAddress: info.orderInstallAddress,
        orderEarnest: info.orderEarnest,
        orderState: info.orderState,
        orderType: info.orderType,
        orderRemark: info.orderRemark
      },
      success: function (res) {
        // console.log("createOrder:addOrder-res"+JSON.stringify(res));
        wx.navigateTo({
          url: '/pages/createGoods/createGoods?orderID=' + res._id,
        })
      },
      fail: function (res) {
        wx.showToast({
          title: "添加失败",
          icon: "none",
          duration: 2000
        });
      }
    });
  },

  /**
   * 数据交互
   */
  callCloundDB: function (info) {
    var _this = this;
    const db = wx.cloud.database("MLS");
    const cmd = db.command;
    db.collection('orders')
      .where(cmd.and([
        { orderCustomerID: this.data.orderCustomerID },
        { orderDate: info.orderDate }
      ])).get({
        success: res => {
          var orders = res.data;
          if (orders && orders.length > 0) {
            wx.showToast({
              title: "已存在客户订单！",
              icon: 'none',
            });
          } else {
            this.addOrder(info);
          }
        },
        fail: res => {
          wx.showToast({
            title: "Error:"+res,
            icon: 'none',
          });
        }
      });
  },

  /**
  * 数据提交
  */
  formSubmit: function (e) {
    var submitInfo = e.detail.value;
    
    if (!submitInfo) {
      wx.showToast({
        title: '信息不能为空！',
        icon:'none'
      });
      return;
    } else {
      var info = this.judgeInfo(submitInfo);
      if (null != info) {
        this.doUpload(info);
      } else {
        return;
      }
    }
  },

  formReset: function () {
    console.log('form发生了reset事件');
  },

  selectedCustomer: function (e) {
    var customer = e.currentTarget.dataset.customer;
    
    this.setData({
      orderCustomer:customer,
      orderCustomerID:customer._id,
      orderCustomerName:customer.customer+"@"+customer.phone+"@"+customer.address,
      hasHidden: true,
    });
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