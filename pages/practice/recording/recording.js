const api = getApp().api
const audioUtil = require('../../../utils/audioUtil')
let intervalTimer
let countdownTimer
Page({
  data: {
    model: 'practice',
    // 录音
    recorderManagerConfig: {
      duration: 600000,
      sampleRate: 48000,
      numberOfChannels: 1,
      encodeBitRate: 320000,
      format: 'mp3',
      frameSize: 50
    },
    recorderState: 'none',
    recordingTime: 0,
    recordingStartTime: '',
    // 音频
    audioType: 'none',
    list: [],
    index: [0, 0],
    isLastSentence: false,
    isLastPage: false,
    switchChecked: false,
    speed: 0.8,
    clicked: false // 按钮是否被点击了
  },
  // 重置按钮状态
  resetClicked() {
    const clickedTimer = setTimeout(() => {
      this.setData({ clicked: false });
      clearTimeout(clickedTimer)
    }, 1000);
  },
  // ===========生命周期 Start===========
  onShow() {
    this.getData(true)
    api.verifyRecordingPermission()
  },
  onLoad(options) {
    wx.enableAlertBeforeUnload({
      message: "是否确认退出练习？",
    });
    this.setData({ queryParam: options, model: options.model })
    // 创建音频播放上下文
    const audioContext = wx.createInnerAudioContext()
    this.audioContext = audioContext
    audioContext.autoplay = false
    audioContext.onEnded(() => {
      const { audioType } = this.data
      // 陈述音频播放完毕
      if (audioType === 'statement') {
        this.playStatementAudioEnd()
      }
      // 录音开始提示音播放完毕
      if (audioType === 'prompt-start') {
        this.playStartPromptAudioEnd()
      }
      // 录音结束提示音播放完毕
      if (audioType === 'prompt-end') {
        this.playEndPromptAudioEnd()
      }
      // 例句音频播放完毕
      if (audioType === 'sample') {
        this.playSampleAudioEnd()
      }
      // 讲解音频播放完毕
      if (audioType === 'explanation') {
        this.playExplanationAudioEnd()
      }
    })
    // 创建录音上下文
    const recorderManager = wx.getRecorderManager()
    this.recorderManager = recorderManager
    recorderManager.onStop(async (res) => {
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
    recorderManager.onError((res) => {
      api.recorderErr("句型训练", res.errMsg)
    })
    recorderManager.onStart(() => {
      // 更新录音器状态
      this.setData({ recordingStartTime: Date.now() })
      // 更新进度
      this.startTimer()
    })
  },
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
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  // 1-------返回上一级
  cancel() {
    wx.navigateBack()
  },
  // 点击事件---开始回答
  answerStart() {
    console.log("点击开始录音按钮")
    // 开始录音
    // this.startRecording()
    // 计算可录音时间
    this.calculateAvailableRecordingTime()
    // 播放题目录音
    this.playQuestionAudio()
    // 进度更新
    this.updateProgress()
  },
  // 切换题目时计算该题目可用录音时间
  calculateAvailableRecordingTime() {
    const { index, list, speed } = this.data
    this.setData({
      countdown: Math.ceil(list[index[0]].list[index[1]].wordCount * speed)
    })
    console.log("计算可用录音时间，结果：" + this.data.countdown)
  },// ------------音频操作事件------------
  // 开始播放题目音频
  playQuestionAudio() {
    const { list, index } = this.data
    // 如果当前音频正在播放则停掉
    if (this.audioContext.paused) {
      this.audioContext.stop()
    }
    // 获取练习题目的陈述音频地址
    const statementAudio = list[index[0]].list[index[1]].statementAudio
    if (!api.isEmpty(statementAudio)) {
      this.playStatementAudio()
    } else {
      this.playStartPromptAudio()
    }
    // 状态切换，无论播放那种音频都要切换音频播放状态以及题目显示状态
    this.setData({
      [`groupData.list[${index[1]}].state`]: 'recoding',
      recorderState: 'play'
    })
  },
  // 切换题目熟悉还是不熟状态
  switchChange({ detail }) {
    const { index } = this.data
    this.setData({
      [`list[${index[0]}].list[${index[1]}].selected`]: detail.value,
      [`groupData.list[${index[1]}].selected`]: detail.value,
      switchChecked: detail.value
    })
  },
  // 点击事件---下一个句子
  nextSentence() {
    // 防止误触
    const { clicked } = this.data
    this.setData({ clicked: true })
    this.resetClicked()
    if (clicked) { return }
    const { index, switchChecked } = this.data
    // 修改上一题的状态是已完成
    this.setData({
      [`list[${index[0]}].list[${index[1]}].isCorrect`]: switchChecked ? 1 : 2,
      [`groupData.list[${index[1]}].state`]: 'over',
      [`index[1]`]: index[1] + 1,
      switchChecked: false
    })
    // 下一题开始回答
    this.answerStart()
  },
  // 点击事件---下一组句子
  nextPage() {
    // 防止误触
    if (this.data.clicked) { return }
    this.setData({ clicked: true })
    this.resetClicked()
    let { index, list, switchChecked } = this.data
    this.setData({
      [`list[${index[0]}].list[${index[1]}].isCorrect`]: switchChecked ? 1 : 2,
      [`groupData.list[${index[1]}].state`]: 'over',
      [`index[0]`]: index[0] + 1,
      [`index[1]`]: 0,
      groupData: list[index[0] + 1],
      switchChecked: false
    })
    this.answerStart()
  },
  // 点击事件---准备全部提交
  answerOver() {
    // 防止误触
    if (this.data.clicked) { return }
    this.setData({ clicked: true })
    this.resetClicked()
    const { index, switchChecked } = this.data
    // 修改题目状态
    this.setData({
      [`list[${index[0]}].list[${index[1]}].isCorrect`]: switchChecked ? 1 : 2,
      [`groupData.list[${index[1]}].state`]: 'over',
      switchChecked: false
    })
    // 已经是最后一题，直接触发数据全量保存
    this.checkDataConsistency()
  },
  // ------------录音操作事件------------
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
  // ------------定时器组件------------
  // 已经录音时长更新
  startTimer() {
    intervalTimer = setInterval(() => {
      const startTime = this.data.recordingStartTime
      const difference = Date.now() - startTime;
      this.setData({
        recordingTime: Math.round(difference / 1000)
      })
    }, 100);
  },
  // 倒计时监听
  listenCountdownChanges() {
    countdownTimer = setInterval(() => {
      const { endTime } = this.data
      const countdown = Math.trunc((endTime - Date.now()) / 1000)
      // 获取当前时间，用结束时间减去当前时间计算剩余秒数
      this.setData({ countdown })
      if (countdown <= 0) {
        clearInterval(countdownTimer)
        this.playEndPromptAudio()
      }
    }, 50);
  },
  // ------------数据更新操作------------
  // 进度更新
  updateProgress() {
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
  // 记录录音文件
  saveRecordingFile(url) {
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
      list[index[0]].list[index[1]]['file'] = file
      this.setData({
        list: list,
        recordingTime: 0
      })
      resolve()
    })
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
    api.request(this, '/practice/getDetail', {
      userId: api.getUserId(),
      ...this.options
    }, isPull).then(res => {
      this.setData({
        groupData: this.data.list[this.data.index[0]]
      })
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
            sentenceId: elej.id,
            selected: elej.selected ? 1 : 0,
            note: elej.note,
            groupId: elei.id,
            isCorrect: elej.isCorrect
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
    // 先上传音频文件
    audioUtil.batchUploadReading(fileUrl, '/practice/', this).then(res => {
      api.request(this, '/practice/saveRecord', {
        userId: api.getUserId(),
        ...this.options,
        recordDetailList: res
      }, true, 'POST').then(res => {
        wx.hideLoading()
        wx.redirectTo({
          url: `../record_detail/record_detail?recordId=${res.record}&id=${this.data.queryParam.id}`,
        })
      })
    })
  },
  // ===========数据获取 End===========

  // ===========音频 Start===========
  // 播放陈述音频
  playStatementAudio() {
    this.audioContext.stop()
    const { list, index } = this.data
    const statementAudio = list[index[0]].list[index[1]].statementAudio
    this.audioContext.src = statementAudio
    this.setData({ audioType: 'statement' })
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
    this.setData({ audioType: 'prompt-start' })
    wx.nextTick(() => {
      this.audioContext.play()
    })
    console.log("开始播放开始提示音频")
  },
  // 开始提示因播放完毕
  playStartPromptAudioEnd() {
    const { countdown } = this.data
    // 如果可用录音时间为0，则默认设置一个可用录音时间为30秒
    if (countdown === 0) {
      this.setData({ endTime: Date.now() + (30 * 1000) })
    } else {
      this.setData({ endTime: Date.now() + (countdown * 1000) })
    }
    // 进入倒计时监听
    this.listenCountdownChanges()
  },
  // 播放结束提示音频
  playEndPromptAudio() {
    this.audioContext.stop()
    this.audioContext.src = '/audio/end-prompt.mp3'
    this.setData({ audioType: 'prompt-end' })
    wx.nextTick(() => {
      this.audioContext.play()
    })
    console.log("开始播放结束提示音频")
  },
  // 结束提示音播放完毕
  playEndPromptAudioEnd() {
    // 结束录音
    this.stopRecording()
    const { model } = this.data
    // 判断学员启用模式，练习模式直接播放例句音频
    if (model === 'practice') {
      this.playSampleAudio()
    }
    // 学习模式播放讲解音频
    if (model === 'study') {
      this.playExplanationAudio()
    }
  },
  // 播放例句音频
  playSampleAudio() {
    this.audioContext.stop()
    const { list, index } = this.data
    const sampleAudio = list[index[0]].list[index[1]].sampleAudio
    this.audioContext.src = sampleAudio
    this.setData({
      audioType: 'sample',
      recorderState: 'stop',
      [`groupData.list[${index[1]}].state`]: 'answer'
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
    const { list, index } = this.data
    const explanationAudio = list[index[0]].list[index[1]].explanationAudio
    this.audioContext.src = explanationAudio
    this.setData({
      audioType: 'explanation',
      recorderState: 'stop',
      [`groupData.list[${index[1]}].state`]: 'answer'
    })
    wx.nextTick(() => {
      this.audioContext.play()
    })
    console.log("开始播放讲解音频")
  },
  // 讲解音频播放完毕
  playExplanationAudioEnd() {

  },
  // ===========音频 End===========
})
