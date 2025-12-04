Component({
  properties: {
    animation: {
      type: String,
    }
  },
  observers: {
    'animation': function (val) {
      if (val === 'left') {
        this.setData({
          animationData: 'fadeAwayToLeft'
        })
      }
      if (val === 'right') {
        this.setData({
          animationData: 'fadeAwayToRight'
        })
      }
      setTimeout(() => {
        this.setData({
          animationData: '',
        })
      }, 300);
    }
  },
  pageLifetimes: {
    resize() {
      this.setWindowHeight()
    }
  },
  lifetimes: {
    attached() {
      this.setWindowHeight()
    },
  },
  data: {
    sy: true,
    wh: '100vh',
    animationData: ''
  },
  methods: {
    setWindowHeight() {
      const _this = this
      wx.getSystemInfoAsync({
        success(res) {
          let pd = res.screenHeight - res.safeArea.bottom
          pd = pd < 20 ? 20 : pd
          _this.setData({
            wh: res.windowHeight + 'px',
            pd: pd + 'px'
          })
        },
      })
    }
  }
})