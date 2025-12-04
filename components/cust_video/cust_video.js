Component({
  behaviors: ['wx://component-export'],
  properties: {
    videoUrl: {
      type: String
    },
    watermark: {
      type: String,
      value: "版权水印"
    }
  },
  data: {
    playAlls: true, // 是否全屏
    duration: 0, // 视频的总时长
    sliderValue: 0, // 控制进度条slider的值，
    updateState: false, // 防止视频播放过程中导致的拖拽失效
    vleftTime: '00:00', // 进度条左边时间
    vrightTime: '00:00', // 进度条总时间
    videoBtn: true, // 播放暂停按钮切换
    playRateFlag: false, // 倍速播放弹窗
    showControl: false,
    playbackRateStr: '倍速',
    location: [-2, -1, 0, 1, 2, 3, 4],
  },
  attached() {
    this.initVideoControls()
  },
  methods: {
    // 绑定视频控件
    initVideoControls() {
      const _this = this
      const timer = setInterval(() => {
        const videoContext = this.selectComponent('#myVideo');
        if (videoContext) {
          _this.videoContext = videoContext
          _this.setData({ updateState: true });
          clearInterval(timer)
        }
      }, 100);
    },
    // 左边补0
    _padl(t) {
      var m = parseInt(t / 60);
      var mm = m < 10 ? "0" + m : m;
      var s = parseInt(t % 60);
      var ss = s < 10 ? "0" + s : s;
      this.setData({
        vleftTime: mm + ':' + ss
      })
    },
    // click() {
    //   this.setData({
    //     playRateFlag: this.data.showControl ? false : this.data.playRateFlag,
    //     showControl: !this.data.showControl
    //   })
    // },
    // ================================ 视频功能操作 START ================================
    // 打开播放视频速率窗口
    openPlaybackRateWindow() {
      this.setData({
        playRateFlag: !this.data.playRateFlag
      })
    },
    //拖拽过程中,不允许更新进度条
    sliderChanging(e) {
      this.setData({ updateState: false })
      var changingTime = e.detail.value / 100 * (this.data.duration);
      this._padl(changingTime);
    },
    //拖动进度条触发事件
    sliderChange(e) {
      if (this.data.duration) {
        this.setData({ sliderValue: e.detail.value });
        this.seek(e.detail.value / 100 * this.data.duration)
      }
    },
    //自定义全屏
    videoAllscreen(e) {
      this.data.playAlls ? this.videoContext.requestFullScreen() : this.videoContext.exitFullScreen();
      this.setData({
        playAlls: !this.data.playAlls
      })
    },
    // ================================ 视频功能操作  END  ================================

    // ================================ 视频操作事件 START ================================
    // 开始播放
    play() {
      this.videoContext.play()
    },
    // 暂停
    pause() {
      this.videoContext.pause()
    },
    // 设置播放速率
    setPlaybackRate(e) {
      const playbackRate = Number(e.currentTarget.dataset.rate)
      this.videoContext.playbackRate(playbackRate)
      // this.data.videoContext.play()
      // this.playRate()
      this.setData({
        playRateFlag: false,
        playbackRateStr: e.currentTarget.dataset.text
      })
    },
    // 更新视频播放进度
    seek(time) {
      this.videoContext.seek(time)
      this.setData({ updateState: true });
    },
    // ================================ 视频操作事件  END  ================================

    // ================================ 视频监听事件 START ================================
    // 视频播放监听
    onPlay() {
      this.setData({
        videoBtn: true,
        showControl: true
      })
    },
    // 视频暂停监听
    onPause() {
      this.setData({
        videoBtn: false,
        showControl: true
      })
    },
    // 视频播放时间更改监听
    onTimeUpdate(e) {
      //判断拖拽完成后才触发更新，避免拖拽失效
      if (this.data.updateState) {
        let sliderValue = e.detail.currentTime / e.detail.duration * 100;
        var m = parseInt(e.detail.duration / 60);
        var mm = m < 10 ? "0" + m : m;
        var s = parseInt(e.detail.duration % 60);
        var ss = s < 10 ? "0" + s : s;
        this.setData({
          sliderValue: sliderValue,
          duration: e.detail.duration,
          vrightTime: mm + ':' + ss
        });
        this._padl(e.detail.currentTime);
      };
    },
    // 视频播放完毕监听
    onEnded() {
      this.pause()
    }
    // ================================ 视频监听事件  END  ================================
  }
})