//普通上传地址
var uploaduri = 'https://grammar.oss-cn-qingdao.aliyuncs.com/'

let url = {
  develop: 'https://speak.jingying.vip/api/mao',
  trial: 'http://192.168.112.227:8080/api/mao',
  release: 'https://speak.jingying.vip/api/mao',
}
const version = wx.getAccountInfoSync().miniProgram.envVersion
var uri = url[version]

function wxPromisify(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res) //成功
      }
      obj.fail = function (res) {
        reject(res) //失败
      }
      fn(obj)
    })
  }
}

//无论promise对象最后状态如何都会执行
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => {
      throw reason
    })
  );
};

/**
 * 微信请求方法
 * that 当前页面this
 * url 请求地址
 * data 以对象的格式传入
 * hasToast 是否需要显示toast(下拉刷新不需要toast) - 已废弃，改用页面进度条动效
 * method GET或POST请求
 */
function request(that, url, data, hasToast, method) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: uri + url,
      method: method || 'GET',
      data: data,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == '200') {
          if (isNotEmpty(that) && !isEmpty(that.route) && !isEmpty(res.data.data)) {
            that.setData(res.data.data)
          }
          resolve(res.data.data)
        } else {
          toast(res.data.msg || res.data.message)
        }
      },
      fail: function (res) {
        toast('请求失败，请稍候再试')
      },
      complete: function (res) {
        wx.stopPullDownRefresh()
      }
    })
  })
}

/**
 * 微信用户登录,获取code
 */
function wxLogin() {
  return wxPromisify(wx.login)
}

/**
 * 获取微信用户信息
 * 注意:须在登录之后调用
 */
function wxGetUserInfo() {
  return wxPromisify(wx.getUserInfo)
}

/**
 * 获取系统信息
 */
function wxGetSystemInfo() {
  return wxPromisify(wx.getSystemInfo)
}

/**
 * 获取系统设置信息
 */
function wxGetSetting() {
  return wxPromisify(wx.getSetting)
}

/**
 * json转get请求参数
 */
function parseParams(json) {
  try {
    var tempArr = []
    for (var key in json) {
      tempArr.push(key + '=' + json[key])
    }
    var urlParamsStr = tempArr.join('&')
    return '?' + urlParamsStr
  } catch (err) {
    return ''
  }
}

/**
 * 微信分享
 */
function share(title, that, imgUrl) {
  let pararm = {
    ...that.options,
    "openType": "share"
  }
  return {
    title: decodeURIComponent(title),
    path: that.route + parseParams(pararm),
    imageUrl: imgUrl
  }
}

/**
 * 用于判断空，Undefined String Array Object
 */
function isEmpty(str) {
  if (Object.prototype.toString.call(str) === '[object Undefined]') { //空
    return true
  } else if (
    Object.prototype.toString.call(str) === '[object String]' ||
    Object.prototype.toString.call(str) === '[object Array]') { //字条串或数组
    return str.length == 0 ? true : false
  } else if (Object.prototype.toString.call(str) === '[object Object]') {
    return Object.getOwnPropertyNames(str).length === 0;
  } else if (Object.prototype.toString.call(str) === '[object Number]') {
    return false
  } else if (Object.prototype.toString.call(str) === '[object Boolean]') {
    return str
  } else {
    return true
  }
}

/**
 * 非空判断
 */
function isNotEmpty(str) {
  return !isEmpty(str)
}

/**
 * 保存用户信息
 */
function saveUser(that) {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '完善用户信息'
    }).then(res => {
      let userInfo = res.userInfo
      wx.login().then(data => {
        userInfo.code = data.code
        request(that, '/user/save', userInfo, true).then(res => {
          wx.setStorageSync('user', res.user)
          resolve(true)
        })
      })
    }).catch(err => {
      reject(false)
      modal('提醒', '此功能需要获取微信授权，请点击“允许”。', false)
    })
  })

}

/**
 * 获取用户信息
 * that 设置信息
 */
function getUser(that) {
  var user = wx.getStorageSync('user')
  if (!isEmpty(user)) {
    that.setData({
      'user': user
    })
    return new Promise((resolve, reject) => {
      resolve(true)
    })
  } else {
    return wxLogin()().then(res => {
      return request(that, '/user/getUserByCode', {
        code: res.code
      }, true)
    }).then(res => {
      wx.setStorageSync('user', res.user)
      wx.setStorageSync('session', res.session)
      return true
    })
  }
}

/**
 * 获取用户id或者绑定的用户id
 * 为空 获取用户id 不为空 绑定用户id
 */
function getUserId() {
  let user = wx.getStorageSync('user')
  if (isEmpty(user)) {
    return ''
  }
  return user.id
}

/**
 * 上传附件
 */
function upload(src, path, that) {
  var imageName = src.toString();
  let fileName = imageName.substring(imageName.lastIndexOf('/') + 1);
  toast('上传中...', 'loading', 50000)
  return new Promise((resolve, reject) => {
    var realpath = 'ielts' + path + fileName
    wx.uploadFile({
      url: uploaduri,
      filePath: src,
      name: 'file',
      formData: {
        name: src,
        key: realpath,
        policy: "eyJleHBpcmF0aW9uIjoiMjAzMC0wMS0wMVQxMjowMDowMC4wMDBaIiwiY29uZGl0aW9ucyI6W1siY29udGVudC1sZW5ndGgtcmFuZ2UiLDAsMTA0ODU3NjAwMF1dfQ==",
        OSSAccessKeyId: "lapsix94Pq5fbomp",
        success_action_status: "200",
        signature: "cwQtszjZEpqW1ir6v4py2Cb9NlY=",
      },
      success: function (res) {
        wx.hideToast()
        toast("上传成功", 'success', 1000)
        resolve(uploaduri + realpath)
      },
      fail: function (res) {
        wx.hideToast()
        toast('上传失败', 'none', 1000)
        reject(res)
      },
    })
  })
}

/**
 * 弹窗(无需点击)
 */
function toast(title, icon, duration) {
  wx.showToast({
    title: title,
    icon: isEmpty(icon) ? 'none' : icon,
    duration: isEmpty(duration) ? 2000 : duration,
    mask: true
  })
}

/**
 * 弹窗(需要点击)
 */
function modal(title, content, cancel) {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: title,
      content: content,
      showCancel: isEmpty(cancel) ? true : cancel,
      success(res) {
        if (res.confirm) {
          resolve(true)
        } else if (res.cancel) {
          reject(false)
        }
      }
    })
  })
}

/**
 * 格式化时间
 */
function formatTime(date, option) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = function () {
    return date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  }
  var minute = function () {
    return date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  }
  var second = function () {
    return date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  }
  if (option == 'YY-MM-DD') return " " + year + "-" + month + "-" + day; //获取年月日
  if (option == 'YY-MM') return " " + year + "-" + month; //获取年月
  if (option == 'YY') return " " + year; //获取年
  if (option == 'MM') return " " + month; //获取月
  if (option == 'DD') return " " + day; //获取日
  if (option == 'yesterday') return " " + day - 1; //获取昨天
  if (option == 'hh-mm-ss') return " " + hour() + ":" + minute() + ":" + second(); //获取时分秒
  if (option == 'hh-mm') return " " + hour() + ":" + minute(); //获取时分
  if (option == 'mm-ss') return minute() + ":" + second(); //获取分秒
  if (option == 'mm') return minute(); //获取分
  if (option == 'ss') return second(); //获取秒
  return year + '-' + month + '-' + day + ' ' + hour() + ':' + minute() + ":" + second(); //默认时分秒年月日
}

/**
 * 格式化时间
 */
function dateformat(second) {
  second = parseInt(second);
  var min = Math.floor(second / 60);
  var sec = (second - min * 60);
  return (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
}


/**
 * 格式化时间
 */
function formatTimeBySecond(second) {
  second = parseInt(second)
  var hour = Math.floor(second / 3600)
  var min = Math.floor((second - hour * 3600) / 60)
  var sec = second - hour * 3600 - min * 60
  return (hour < 10 ? "0" + hour : hour) + ":" + (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec)
}

function initAudio(src) {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '音频准备中...',
      mask: true
    })
    const audio = wx.createInnerAudioContext()
    let timer
    audio.onCanplay(() => {
      wx.hideLoading()
      clearTimeout(timer)
      resolve(audio)
    })
    audio.onError(() => {
      wx.hideLoading()
      clearTimeout(timer)
      resolve(audio)
      modal("", "本模块电脑版播放功能需要等待微信官方更新，目前手机/平板可以正常播放。", false)
    })
    wx.downloadFile({
      url: src,
      success: ({
        tempFilePath,
        statusCode
      }) => {
        if (statusCode === 200) {
          audio.src = tempFilePath
          wx.setStorageSync('tempAudioUrl', tempFilePath)
          resolve(audio)
        }
      },
      fail(res) {
        console.log(res);
      }
    })
  })
}

function delAudioFile() {
  let tempUrl = wx.getStorageSync('tempAudioUrl')
  wx.getFileSystemManager().removeSavedFile({
    filePath: tempUrl
  })
  wx.removeStorageSync('tempAudioUrl')
}

function formatAudioTime(val) {
  let nval = Number(val).toFixed(3)
  return Number(nval)
}

function audioErr(err, url) {
  wx.getSystemInfo({
    success(res) {
      console.log(res);
      wx.request({
        url: uri + '/user/addLog',
        method: "POST",
        data: {
          audioUrl: url,
          userId: getUserId(),
          logContent: JSON.stringify(err),
          brand: res.brand,
          model: res.model,
          version: res.version,
          system: res.system,
          platform: res.platform,
          sdkversion: res.SDKVersion
        },
        header: {
          'Content-Type': 'application/json'
        },
      })
    }
  })
}

function recorderErr(model, log) {
  wx.getSystemInfo({
    success(res) {
      console.log(res);
      wx.request({
        url: uri + '/user/recorder/log',
        method: "POST",
        data: {
          userId: getUserId(),
          module: model,
          logContent: JSON.stringify(log),
          brand: res.brand,
          model: res.model,
          version: res.version,
          system: res.system,
          platform: res.platform,
          sdkversion: res.SDKVersion
        },
        header: {
          'Content-Type': 'application/json'
        },
      })
    }
  })
}

/**
 * 录音权限验证
 */
function verifyRecordingPermission() {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.record']) {
        wx.authorize({
          scope: 'scope.record',
          success() {},
          fail() {
            toast("未开启麦克风权限无法进行录音")
            setTimeout(() => {
              wx.navigateBack()
            }, 2000)
          }
        })
      }
    }
  })
}

module.exports = {
  wxPromisify: wxPromisify,
  wxLogin: wxLogin,
  wxGetUserInfo: wxGetUserInfo,
  wxGetSystemInfo: wxGetSystemInfo,
  wxGetSetting: wxGetSetting,
  request: request,
  isEmpty: isEmpty,
  isNotEmpty: isNotEmpty,
  saveUser: saveUser,
  getUser: getUser,
  getUserId: getUserId,
  upload: upload,
  toast: toast,
  modal: modal,
  parseParams: parseParams,
  share: share,
  formatTime: formatTime,
  dateformat: dateformat,
  formatTimeBySecond: formatTimeBySecond,
  initAudio: initAudio,
  delAudioFile: delAudioFile,
  formatAudioTime: formatAudioTime,
  audioErr: audioErr,
  recorderErr: recorderErr,
  verifyRecordingPermission: verifyRecordingPermission
}