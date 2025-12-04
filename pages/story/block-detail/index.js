const api = getApp().api
let audio = null
let timer = null
Page({
  data: {},
  // ===========生命周期 Start===========
  onShow() {
    this.getData(true)
  },
  onLoad(options) {
    audio = wx.createInnerAudioContext()
    audio.onPlay(() => {
      console.log('开始播放', new Date().getTime());
    })
    audio.onEnded(() => {
      this.stopAudio()
      this.setData({ audioPlayer: false })
    })
    audio.onError((err) => {
      api.audioErr(err, audio.src)
      // api.modal("", "本模块电脑版播放功能需要等待微信官方更新，目前手机/平板可以正常播放。", false)
    })
  },
  onUnload() {
    audio.stop()
    audio.destroy()
  },
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  stopAudio() {
    const { audioPlayer, list } = this.data
    if (audioPlayer) {
      audio.stop()
    }
    list.forEach(item => {
      item.list.forEach(subItem => {
        subItem.playStatus = 'none';
      });
    });
    this.setData({
      list: list
    })
  },
  // 点击句子播放
  playSentence({ currentTarget }) {
    const { paragraphIndex, sentenceIndex } = currentTarget.dataset
    const { list } = this.data
    let sentence = list[paragraphIndex].list[sentenceIndex]
    if (sentence.audioUrl) {
      let path = `list[` + paragraphIndex + `].list[` + sentenceIndex + `].playStatus`
      this.stopAudio()
      audio.src = sentence.audioUrl
      wx.nextTick(() => {
        audio.play()
      })
      this.setData({
        [path]: 'playing',
        audioPlayer: true
      })
    }
  },
  // 录音并评分
  recordAndRate() {
    const { detail } = this.data
    let param = {
      type: 4,
      id: detail.id,
      childId: detail.id
    }
    // 新版开始跟读
    wx.navigateTo({
      url: '/pages/question/reading/reading' + api.parseParams(param),
    })
  },
  punching() {
    const { list, detail } = this.data
    let menu = [], urls = [];
    list.forEach(i => {
      menu.push(i.title + '（训练）')
      urls.push(`/pages/story/recording/recording?id=${i.id}&blockId=${detail.id}&color=${detail.color}&background=${detail.backgroundColor}`)
      if (i.recordId) {
        menu.push(i.title + '（训练记录）')
        urls.push(`/pages/story/record_detail/record_detail?id=${i.recordId}&blockId=${detail.id}&color=${detail.color}&background=${detail.backgroundColor}`)
      }
    });
    wx.showActionSheet({
      itemList: menu,
      success: (({ tapIndex }) => {
        wx.navigateTo({ url: urls[tapIndex] })
      })
    })
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  getData(isPull) {
    const userId = api.getUserId();
    api.request(this, '/story/v2/getDetail', { userId, ...this.options }, isPull)
  },
  // ===========数据获取 End===========
})