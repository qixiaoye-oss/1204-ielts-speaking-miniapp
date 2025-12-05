const api = getApp().api
const audioUtil = require('../../../utils/audioUtil')
const loadingProgress = require('../../../behaviors/loadingProgress')
let intervalTimer
let countdownTimer
Page({
  behaviors: [loadingProgress],
  /**
   * 页面的初始数据
   */
  data: {
    // 当前正在进行回答的题目组
    currentQuestionGroup: {},
    // 当前正在进行回答的题目
    currentQuestion: {},
    // 当前激活的数据位置 ['组位置','题目位置']
    activeIndexArr: [0, 0],
    // 当前练习状态
    currentPracticeStatus: 'not_started',
    // 已录音时间
    recordedDuration: 0,
    // 剩余录音时间
    remainingRecordingTime: 0,
    // 录音开始时间戳
    recordingStartTime: 0,
    // 录音器配置项
    recorderManagerConfig: {
      duration: 600000,
      sampleRate: 48000,
      numberOfChannels: 1,
      encodeBitRate: 320000,
      format: 'mp3',
      frameSize: 50
    },
    // 正在播放音频类型
    currentAudioType: 'none',
    // 不熟开关状态
    switchChecked: false,
    // 录音语速
    speechRate: 0.8,
    // 防误触开关
    clicked: false,
    // 页面卸载开关
    pageUnload: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const _this = this
    // 获取数据
    _this.startLoading()
    _this.fetchDataList()
    // 初始化音频控件
    this.audioContext = wx.createInnerAudioContext()
    this.audioContext.autoplay = false
    this.audioContext.onEnded(() => {
      const { currentAudioType } = this.data
      // 陈述音频播放完毕
      if (currentAudioType === 'statement') {
        this.playStatementAudioEnd()
      }
      // 录音开始提示音播放完毕
      if (currentAudioType === 'prompt-start') {
        this.playStartPromptAudioEnd()
      }
      // 录音结束提示音播放完毕
      if (currentAudioType === 'prompt-end') {
        this.playEndPromptAudioEnd()
      }
      // 例句音频播放完毕
      if (currentAudioType === 'sample') {
        this.playSampleAudioEnd()
      }
      // 讲解音频播放完毕
      if (currentAudioType === 'explanation') {
        this.playExplanationAudioEnd()
      }
    })
    // 初始化录音控件
    this.recorderManager = wx.getRecorderManager()
    this.recorderManager.onStop(async (res) => {
      if (this.data.pageUnload) {
        return
      }
      wx.showLoading({
        title: '音频保存中...',
        mask: true
      })
      await this.saveRecordingFile(res.tempFilePath);
      wx.hideLoading()
    })
    this.recorderManager.onError((res) => {
      api.recorderErr("句型训练", res.errMsg)
    })
    this.recorderManager.onStart(() => {
      // 更新录音器状态
      this.setData({ recordingStartTime: Date.now() })
      // 更新进度
      this.startTimer()
    })
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.setData({ pageUnload: true })
    if (this.recorderManager) {
      this.recorderManager.stop()
    }
    if (this.audioContext) {
      this.audioContext.stop()
    }
    clearInterval(intervalTimer)
    clearInterval(countdownTimer)
  },
  // ===================================== 练习相关点击事件 START =====================================
  // 1 练习开始
  practiceStart() {
    // 计算可录音时间
    this.calculateAvailableRecordingTime()
    // 播放题目录音
    this.playQuestionAudio()
    // 进度更新
    this.updateProgress()
  },
  nextSentence() {
    // 防止误触
    if (this.data.clicked) { return }
    this.setData({ clicked: true })
    this.resetClicked()
    const { activeIndexArr, switchChecked } = this.data
    // 修改上一题的状态是已完成
    this.setData({
      [`list[${activeIndexArr[0]}].list[${activeIndexArr[1]}].isCorrect`]: switchChecked ? 1 : 2,
      [`currentQuestionGroup.list[${activeIndexArr[1]}].state`]: 'over',
      [`activeIndexArr[1]`]: activeIndexArr[1] + 1,
      switchChecked: false
    })
    // 下一题开始回答
    this.practiceStart()
  },
  nextPage() {
    // 防止误触
    if (this.data.clicked) { return }
    this.setData({ clicked: true })
    this.resetClicked()
    let { activeIndexArr, list, switchChecked } = this.data
    this.setData({
      [`list[${activeIndexArr[0]}].list[${activeIndexArr[1]}].isCorrect`]: switchChecked ? 1 : 2,
      [`currentQuestionGroup.list[${activeIndexArr[1]}].state`]: 'over',
      [`activeIndexArr[0]`]: activeIndexArr[0] + 1,
      [`activeIndexArr[1]`]: 0,
      currentQuestionGroup: list[activeIndexArr[0] + 1],
      switchChecked: false
    })
    this.practiceStart()
  },
  // 切换题目熟悉还是不熟状态
  switchChange({ detail }) {
    const { activeIndexArr } = this.data
    this.setData({
      [`list[${activeIndexArr[0]}].list[${activeIndexArr[1]}].selected`]: detail.value,
      [`currentQuestionGroup.list[${activeIndexArr[1]}].selected`]: detail.value,
      switchChecked: detail.value
    })
  },
  // 重置按钮状态
  resetClicked() {
    const clickedTimer = setTimeout(() => {
      this.setData({ clicked: false });
      clearTimeout(clickedTimer)
    }, 1000);
  },
  // 返回上一页
  cancel() {
    wx.navigateBack()
  },
  // ===================================== 练习相关点击事件  END  =====================================

  // ===================================== 练习相关计算事件 START =====================================
  // 1-1 切换题目时计算该题目可用录音时间
  calculateAvailableRecordingTime() {
    const { activeIndexArr, list, speechRate } = this.data
    this.setData({
      remainingRecordingTime: Math.ceil(list[activeIndexArr[0]].list[activeIndexArr[1]].wordCount * speechRate)
    })
    console.log("计算可用录音时间，结果：" + this.data.remainingRecordingTime)
  },
  // 1-2 更新题目进度
  updateProgress() {
    let { activeIndexArr, currentQuestionGroup, list } = this.data
    const updatedList = list.map(item => ({
      ...item,
      finishCount: item.list.filter(j => j.state != 'none').length
    }));
    this.setData({
      list: updatedList,
      isLastPage: (activeIndexArr[0] + 1) >= list.length,
      isLastSentence: (activeIndexArr[1] + 1) >= currentQuestionGroup.list.length
    });
  },
  // ===================================== 练习相关点击事件  END  =====================================

  // ===================================== 练习相关音频操作事件 START =====================================
  // 1-2 播放题目音频，根据状态判断该播放哪一个音频
  playQuestionAudio() {
    const { list, activeIndexArr } = this.data
    // 如果当前音频正在播放则停掉
    if (this.audioContext.paused) {
      this.audioContext.stop()
    }
    // 获取练习题目的陈述音频地址
    const statementAudio = list[activeIndexArr[0]].list[activeIndexArr[1]].statementAudio
    if (!api.isEmpty(statementAudio)) {
      this.playStatementAudio()
    } else {
      this.playStartPromptAudio()
    }
    // 状态切换，无论播放那种音频都要切换音频播放状态以及题目显示状态
    this.setData({
      [`currentQuestionGroup.list[${activeIndexArr[1]}].state`]: 'recoding',
      currentPracticeStatus: 'playing_audio'
    })
  },
  // 播放陈述音频
  playStatementAudio() {
    this.audioContext.stop()
    const { list, activeIndexArr } = this.data
    const statementAudio = list[activeIndexArr[0]].list[activeIndexArr[1]].statementAudio
    this.audioContext.src = statementAudio
    this.setData({ currentAudioType: 'statement' })
    wx.nextTick(() => {
      this.audioContext.play()
    })
    console.log("开始播放陈述音频")
  },
  // 陈述音频播放完毕
  playStatementAudioEnd() {
    this.playStartPromptAudio()
  },
  // 播放开始提示音频
  playStartPromptAudio() {
    // 开启录音
    this.startRecording()
    this.audioContext.stop()
    this.audioContext.src = '/audio/start-prompt.mp3'
    this.setData({ currentAudioType: 'prompt-start' })
    wx.nextTick(() => {
      this.audioContext.play()
    })
    console.log("开始播放开始提示音频")
  },
  // 开始提示因播放完毕
  playStartPromptAudioEnd() {
    const { remainingRecordingTime } = this.data
    // 如果可用录音时间为0，则默认设置一个可用录音时间为30秒
    if (remainingRecordingTime === 0) {
      this.setData({ endTime: Date.now() + (30 * 1000) })
    } else {
      this.setData({ endTime: Date.now() + (remainingRecordingTime * 1000) })
    }
    // 进入倒计时监听
    this.listenCountdownChanges()
  },
  // 播放结束提示音频
  playEndPromptAudio() {
    this.audioContext.stop()
    this.audioContext.src = '/audio/end-prompt.mp3'
    this.setData({ currentAudioType: 'prompt-end' })
    wx.nextTick(() => {
      this.audioContext.play()
    })
    console.log("开始播放结束提示音频")
  },
  // 结束提示音播放完毕
  playEndPromptAudioEnd() {
    // 结束录音
    this.stopRecording()
    // 先放讲解音频再播放例句音频，如果没有例句音频则直接播放讲解音频
    const { list, activeIndexArr } = this.data
    // 获取练习题目的陈述音频地址
    const explanationAudio = list[activeIndexArr[0]].list[activeIndexArr[1]].explanationAudio
    if (!api.isEmpty(explanationAudio)) {
      this.playExplanationAudio()
    } else {
      this.playSampleAudio()
    }
  },
  // 播放例句音频
  playSampleAudio() {
    this.audioContext.stop()
    const { list, activeIndexArr } = this.data
    const sampleAudio = list[activeIndexArr[0]].list[activeIndexArr[1]].sampleAudio
    this.audioContext.src = sampleAudio
    this.setData({
      currentAudioType: 'sample',
      currentPracticeStatus: 'practice_end',
      [`currentQuestionGroup.list[${activeIndexArr[1]}].state`]: 'answer'
    })
    wx.nextTick(() => {
      this.audioContext.play()
    })
    console.log("开始播放例句音频")
  },
  // 例句播放完毕
  playSampleAudioEnd() {

  },
  // 播放讲解音频
  playExplanationAudio() {
    this.audioContext.stop()
    const { list, activeIndexArr } = this.data
    const explanationAudio = list[activeIndexArr[0]].list[activeIndexArr[1]].explanationAudio
    this.audioContext.src = explanationAudio
    this.setData({
      currentAudioType: 'explanation',
      currentPracticeStatus: 'practice_end',
      [`currentQuestionGroup.list[${activeIndexArr[1]}].state`]: 'answer'
    })
    wx.nextTick(() => {
      this.audioContext.play()
    })
    console.log("开始播放讲解音频")
  },
  // 讲解音频播放完毕
  playExplanationAudioEnd() {
    // 播放例句音频
    this.playSampleAudio()
  },
  // 不熟标记
  keywordConfirm({ detail }) {
    let selIndex = detail.index
    const { activeIndexArr } = this.data
    let path1 = `list[` + activeIndexArr[0] + `].list[` + selIndex + `].selected`
    let path2 = `currentQuestionGroup.list[` + selIndex + `].selected`
    this.setData({
      [path1]: detail.selected,
      [path2]: detail.selected
    })
  },
  // 点击事件---准备全部提交
  answerOver() {
    // 防止误触
    if (this.data.clicked) { return }
    this.setData({ clicked: true })
    this.resetClicked()
    const { activeIndexArr, switchChecked } = this.data
    // 修改题目状态
    this.setData({
      [`list[${activeIndexArr[0]}].list[${activeIndexArr[1]}].isCorrect`]: switchChecked ? 1 : 2,
      [`currentQuestionGroup.list[${activeIndexArr[1]}].state`]: 'over',
      switchChecked: false,
      currentAudioType: 'all_over'
    })
    if (this.audioContext.paused) {
      this.audioContext.stop()
    }
    // 已经是最后一题，直接触发数据全量保存
    this.checkDataConsistency()
  },
  // ===================================== 练习相关点击事件  END  =====================================

  // ===================================== 练习相关录音事件 START =====================================
  // 开始录音
  startRecording() {
    console.log("初始化录音控件，开始录音")
    const { recorderManagerConfig } = this.data
    // 开始录音触发录音监听
    this.recorderManager.start(recorderManagerConfig)
  },
  // 结束录音
  stopRecording() {
    this.recorderManager.stop()
  },
  // ===================================== 练习相关录音事件  END  =====================================

  // ===================================== 练习相关定时器事件 START =====================================
  // 已经录音时长更新
  startTimer() {
    intervalTimer = setInterval(() => {
      const startTime = this.data.recordingStartTime
      const difference = Date.now() - startTime;
      this.setData({
        recordedDuration: Math.round(difference / 1000)
      })
    }, 100);
  },
  // 倒计时监听
  listenCountdownChanges() {
    countdownTimer = setInterval(() => {
      const { endTime } = this.data
      const remainingRecordingTime = Math.trunc((endTime - Date.now()) / 1000)
      // 获取当前时间，用结束时间减去当前时间计算剩余秒数
      this.setData({ remainingRecordingTime })
      if (remainingRecordingTime <= 0) {
        clearInterval(countdownTimer)
        this.playEndPromptAudio()
      }
    }, 50);
  },
  // ===================================== 练习相关定时器事件  END  =====================================

  // ===================================== 接口请求相关 START =====================================
  // 获取列表数据
  fetchDataList() {
    api.request(this, '/question/v2/p1/practice/recording/detail', {
      userId: api.getUserId(),
      ...this.options
    }, true).then(() => {
      this.loadData()
    }).finally(() => {
      this.finishLoading()
    })
  },
  // 初始化数据
  loadData() {
    const { list, activeIndexArr } = this.data
    this.setData({
      currentQuestionGroup: list[activeIndexArr[0]]
    })
  },
  // 记录录音文件
  saveRecordingFile(url) {
    const _this = this
    return new Promise((resolve, reject) => {
      // 停止计时器
      clearInterval(intervalTimer)
      let { list, activeIndexArr, recordedDuration } = _this.data
      let file = {
        time: api.formatTime(new Date()),
        url: url,
        duration: recordedDuration,
      }
      list[activeIndexArr[0]].list[activeIndexArr[1]]['file'] = file
      this.setData({
        list: list,
        recordedDuration: 0
      })
      resolve()
    })
  },
  // 准备提交录音记录
  checkDataConsistency() {
    wx.showLoading({
      title: '提交中...',
    })
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
            sourceId: elej.id,
            isMarked: elej.isCorrect
          })
        }
        if (!flag) break; // 如果 flag 已经为 false，跳出外层循环
      }
    }
    // 如果所有项目都已完成，则保存数据
    if (flag) {
      this.uploadRecordingFile(fileUrl);
    }
  },
  uploadRecordingFile(fileUrl) {
    const _this = this
    // 先上传音频文件
    audioUtil.batchUploadReading(fileUrl, '/question-practice/', this).then(res => {
      api.request(this, '/v2/question/p1/practice/save', {
        userId: api.getUserId(),
        ...this.options,
        recordDetailList: res
      }, true, 'POST').then(res => {
        wx.hideLoading()
        const param = {
          ..._this.options,
          practiceId: res.record
        }
        wx.redirectTo({
          url: '../recording-p1-record/index' + api.parseParams(param),
        })
      })
    })
  },
  // ===================================== 接口请求相关  END  =====================================
})