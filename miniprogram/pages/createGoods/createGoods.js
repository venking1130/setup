// miniprogram/pages/createGoods/createGoods.js
var sMD5 = require('../../config/spark-md5.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasHidden: true, // 是否显示搜索内容
    searchInfo: "", // 搜索内容
    goodsDatas:[], // 产品列表
    goodsType: ["吊灯", "吸顶灯", "壁灯", "镜前灯", "台灯", "落地灯", "筒灯", "灯带", "射灯", "灯带", "光源", "开关插座", "水电材料", "其他",],
    goodsTypeIdx:0,
    goodsStyle: ["欧式风格", "美式风格", "现代风格", "亚洲风格", "北欧风格", "轻奢风格", "其他"],
    goodsStyleIdx:0,
    goodsLight: ["E27", "E14", "G9", "G4", "LED"],
    goodsLightIdx:0,
    orderID:null,
    goodsImageUrl:[], // 本地图片地址
    goodsMD5:[],
    cloudImageId:[] // 云端图片地址
  },

  bindKeyInput: function (e) {
    this.setData({
      searchInfo: e.detail.value
    });
    if (!this.data.hasHidden && (!this.data.searchInfo || 0 == this.data.searchInfo.length)) {
      this.setData({
        hasHidden: true,
      })
    }
  },

  searchGoods: function (e) {
    var _this = this;
    const db = wx.cloud.database("MLS");
    const cmd = db.command;
    db.collection('goods')
      .where(cmd.or([
        { goodsName: { $regex: ".*" + this.data.searchInfo + ".*" } },
        { goodsStyle: { $regex: ".*" + this.data.searchInfo + ".*" } },
        { goodsType: { $regex: ".*" + this.data.searchInfo + ".*" } },
        { goodsModel: { $regex: ".*" + this.data.searchInfo + ".*" } },
        { goodsAddtion: { $regex: ".*" + this.data.searchInfo + ".*" } },
      ])).get({
        success: res => {
          var goods = res.data;
          if (goods && goods.length > 0) {
            _this.setData({
              goodsDatas: goods,
              hasHidden: false
            });
          } else {
            wx.showToast({
              title: "未找到！！！请完善商品信息并提交。",
              icon: 'none',
            });
          }
        },
        fail: res => {
          wx.showToast({
            title: "Error:" + res,
            icon: 'none',
          });
        }
      });
  },

  goodsStyleChange: function (e) {
    this.setData({
      goodsStyleIdx: e.detail.value
    })
  },

  goodsTypeChange: function (e) {
    this.setData({
      goodsTypeIdx: e.detail.value
    })
  },

  goodsLightChange: function (e) {
    this.setData({
      goodsLightIdx: e.detail.value
    })
  },

  selectedGoods: function(e) {
    console.log("selectedGoods:" + JSON.stringify(e.currentTarget.dataset));
    this.setData({
      hasHidden: true
    });
  },

  addImage: function(e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'],  //可选择原图或压缩后的图片
      sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
      success: res => {
        
        var images = res.tempFiles;
        this.setData({
          goodsImageUrl: images.length <= 3 ? images : images.slice(0, 3)
        })

        Promise.all(that.data.goodsImageUrl.map((item) => {
          wx.getFileSystemManager().readFile({
            filePath: item.path, //选择图片返回的相对路径
            // encoding: 'binary', //编码格式
            success: res => {
              //成功的回调
              var spark = new sMD5.ArrayBuffer();
              spark.append(res.data);
              var hexHash = spark.end(false);
              var temp = that.data.goodsMD5;
              temp.push(hexHash);
              that.setData({
                goodsMD5:temp
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

  previewImg: function(e) {
    var info = e.currentTarget.dataset.info;
    if (!info){ return ;}
    wx.previewImage({ current: this.data.goodsImageUrl[info], urls:this.data.goodsImageUrl});
  },

  deleteImage: function (e) {
    var that = this;
    var images = that.data.goodsImageUrl;
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
          goodsImageUrl: images
        });
      }
    })
  },

  doUpload: function (info) {
    // 上传图片
    var that = this;
    var images = that.data.goodsImageUrl;
    
    wx.showLoading({
      title: '图片上传中 ···',
    });
    let uploads = [];
    images.forEach(function (item, index) {
      uploads.push(new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: 'WlsGoodsImages/' + that.data.goodsMD5[index] + item.path.match(/\.[^.]+?$/)[0], // 文件名称 
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
    }).catch(err=>{
      wx.hideLoading();
      wx.showToast({
        title: '上传失败请重试'+JSON.stringify(err),
        icon: 'none'
      });
    })
  },

  judgeInfo: function (info) {
    var comm = require("/../../config/public.js");
    if (!info) {
      return null;
    }


    if ((null != comm.judgeNull(info.goodsName)) &&
      (null != comm.judgeNull(info.goodsModel)) &&
      (null != comm.judgeNull(info.goodsNumber)) &&
      (null != comm.judgeNull(info.goodsInstallPrice)) &&
      (null != comm.judgeNull(info.goodsFirstCost)) &&
      (null != comm.judgeNull(info.goodsPrice)) &&
      (null != comm.judgeNull(info.goodsLight))) {
      return info;
    }
    return null;
  },

  callCloundDB: function (info) {
    const db = wx.cloud.database();
    const goods = db.collection('goods');
    var orderID = this.data.orderID;
    if (!orderID) {
      orderID = "0";
    }

    goods.add({
      data: {
        orderID:orderID,
        goodsName: info.goodsName,
        goodsStyle: info.goodsStyle,
        goodsType: info.goodsType,
        goodsLight: info.goodsLight,
        goodsInstallPrice: info.goodsInstallPrice,
        goodsModel: info.goodsModel,
        goodsAddtion: info.goodsAddtion,
        goodsSize: info.goodsSize,
        goodsSpace: info.goodsSpace,
        goodsNumber: info.goodsNumber,
        goodsFirstCost: info.goodsFirstCost,
        goodsPrice: info.goodsPrice,
        goodsRemark: info.goodsRemark,
        goodsImages: this.data.cloudImageId.toString()
      },
      success: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: '上传完成!',
          icon: 'none'
        });


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

  formSubmit: function (e) {
    var submitInfo = e.detail.value;
    if (!submitInfo) {
      wx.showToast({
        title: '信息不能为空！',
        icon: 'none'
      });
      return ;
    } else {
      var info = this.judgeInfo(submitInfo);
      if (null != info) {
        this.doUpload(info);
      } else {
        return ;
      }
    }
  },

  formReset: function () {
    console.log('form发生了reset事件');
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!options.code && typeof (options.code) != "undefined" && options.code != 0) {
      this.setData({
        orderID:options.code
      });
    }
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