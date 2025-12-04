const api = getApp().api
const audioUtil = require('../../../utils/audioUtil')
let intervalTimer
Page({
  data: {
    pageUnload: false,
    file: {
      time: "",
      url: "",
      duration: 0
    },
    list: [],
    recorderManager: null,
    recorderState: 'none',
    recordingTime: 0,
    recordingStartTime: '',
    audioFlag: true,
    index: [0, 0],
    isLastSentence: false,
    isLastPage: false,
    saveFlag: true,
    nextType: 'sentence'
  },
  // ===========生命周期 Start===========
  onShow() {
    this.getData(true)
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              console.log("同意")
            },
            fail() {
              api.toast("未开启麦克风权限无法进行录音")
              setTimeout(() => {
                wx.navigateBack()
              }, 2000)
            }
          })
        }
      }
    })
  },
  onLoad(options) {
    console.log(options)
    wx.enableAlertBeforeUnload({
      message: "是否确认退出练习？",
    });
    this.setData({
      queryParam: options
    })
    // 创建录音上下文
    const recorderManager = wx.getRecorderManager()
    this.setData({ recorderManager });
    recorderManager.onStop(async (res) => {
      if (this.data.pageUnload) {
        return
      }
      wx.showLoading({
        title: '音频保存中...',
        mask: true
      })
      await this.saveRecording(res.tempFilePath);
      // 是否进行下一步，如果是
      let { nextType, index, list } = this.data
      if (nextType === 'sentence') {
        this.setData({ [`index[1]`]: index[1] + 1 })
        this.startRecoding()
        wx.hideLoading()
      }
      if (nextType === 'page') {
        this.setData({
          [`index[0]`]: index[0] + 1,
          [`index[1]`]: 0,
          groupData: list[index[0] + 1]
        })
        this.startRecoding()
        wx.hideLoading()
      }
      if (nextType === 'save') {
        this.saveRecoding()
      }
    })
    recorderManager.onError((res) => {
      // api.modal("录音模块启动失败", res.errMsg, false)
      api.recorderErr("故事块", res.errMsg)
    })
  },
  onUnload() {
    this.setData({ pageUnload: true })
    const { recorderManager } = this.data
    if (recorderManager) {
      recorderManager.stop()
    }
  },
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  // 1-------返回上一级
  cancel() {
    wx.navigateBack()
  },
  // 2-------保存本地录音文件
  saveRecording(url) {
    const _this = this
    return new Promise((resolve, reject) => {
      // 停止计时器
      clearInterval(intervalTimer)
      let { list, index, recordingTime } = _this.data
      let file = {
        time: api.formatTime(new Date()),
        url: url,
        duration: recordingTime,
      }
      let path = `groupData.list[` + index[1] + `].state`
      list[index[0]].list[index[1]]['file'] = file
      this.setData({
        list: list,
        recorderState: 'stop',
        recordingTime: 0,
        [path]: 'over',
      })
      resolve()
    })
  },
  // 开始录音
  startRecoding() {
    const { recorderManager, index } = this.data
    // 修改句子显示状态，保存录音开始时间
    let path = `groupData.list[` + index[1] + `].state`
    this.setData({
      [path]: 'recoding',
      recorderState: 'play',
      recordingStartTime: Date.now()
    })
    // 录音配置向
    recorderManager.start({
      duration: 600000,
      sampleRate: 48000,
      numberOfChannels: 1,
      encodeBitRate: 320000,
      format: 'mp3',
      frameSize: 50
    })
    this.updateDisplayProgress()
    // 开始计时
    intervalTimer = setInterval(() => {
      const startTime = this.data.recordingStartTime
      const difference = Date.now() - startTime;
      this.setData({
        recordingTime: Math.round(difference / 1000)
      })
    }, 100);
  },
  // 更新显示进度
  updateDisplayProgress() {
    let { index, list, groupData } = this.data
    const updatedList = list.map(item => ({
      ...item,
      finishCount: item.list.filter(j => j.state != 'none').length
    }));
    this.setData({
      list: updatedList,
      isLastPage: (index[0] + 1) >= list.length,
      isLastSentence: (index[1] + 1) >= groupData.list.length
    });
  },
  // 下一个句子
  nextSentence() {
    this.setData({ nextType: 'sentence', pageUnload: false })
    this.stopRecoding()
  },
  nextPage() {
    this.setData({ nextType: 'page', pageUnload: false })
    this.stopRecoding()
  },
  // 准备提交保存
  saveReady() {
    this.setData({ nextType: 'save', pageUnload: false })
    this.stopRecoding()
  },
  // 结束录音
  stopRecoding() {
    if (this.data.recordingTime < 2) {
      api.toast('录音时间过短！')
      return
    }
    // 停止录音
    if (this.data.recorderState === 'play') {
      const { recorderManager } = this.data
      recorderManager.stop()
    }
  },
  // 保存记录
  saveRecoding() {
    let fileUrl = []
    // 初始化 flag 为 true
    let flag = true;
    // 获取 list 数据，如果为 null 或 undefined，则初始化为空数组
    const list = this.data.list || [];
    // 遍历 list，检查是否存在未完成的项目
    for (let i = 0; i < list.length; i++) {
      const elei = list[i];
      if (elei && elei.list) { // 确保 elei 和 elei.list 存在
        for (let j = 0; j < elei.list.length; j++) {
          const elej = elei.list[j];
          if (!elej.file) {
            wx.hideLoading()
            api.toast("存在未完成项目，无法保存");
            flag = false; // 直接修改外层的 flag
            break; // 跳出内层循环
          }
          fileUrl.push({
            ...elej.file,
            sentenceId: elej.id,
            selected: elej.selected ? 1 : 0,
          })
        }
        if (!flag) break; // 如果 flag 已经为 false，跳出外层循环
      }
    }
    // 如果所有项目都已完成，则保存数据
    if (flag) {
      this.saveData(fileUrl);
    }
  },
  // 不熟标记
  keywordConfirm({ detail }) {
    let selIndex = detail.index
    const { index } = this.data
    let path1 = `list[` + index[0] + `].list[` + selIndex + `].selected`
    let path2 = `groupData.list[` + selIndex + `].selected`
    this.setData({
      [path1]: detail.selected,
      [path2]: detail.selected
    })
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  getData(isPull) {
    api.request(this, '/story/listPracticeData', {
      userId: api.getUserId(),
      ...this.options
    }, isPull).then(res => {
      this.setData({
        groupData: this.data.list[this.data.index[0]]
      })
    })
  },
  saveData(fileUrl) {
    // 先上传音频文件
    audioUtil.batchUploadReading(fileUrl, '/practice/', this).then(res => {
      api.request(this, '/story/savePracticeData', {
        userId: api.getUserId(),
        ...this.options,
        recordDetailList: res
      }, true, 'POST').then(res => {
        wx.hideLoading()
        wx.redirectTo({
          url: '../record_detail/record_detail?id=' + res.record,
        })
      })
    })
  }
  // ===========数据获取 End===========
})