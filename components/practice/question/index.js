Component({
  properties: {
    detail: {
      type: Object,
      value: {}
    },
    index: {
      type: Number,
      value: 0
    },
    color: String,
    background: String
  },
  data: {
    indexStr: ''
  },
  observers: {
    'index': function (val) {
      const indexStr = val < 10 ? `0${val}` : `${val}`;
      this.setData({ indexStr });
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    keywordConfirm() {
      let { detail, index } = this.data
      this.setData({ [`detail.selected`]: !detail.selected })
      this.triggerEvent('selected', { ...detail, index: index - 1 })
    },
    listenStatementAudio() {
      let { detail } = this.data
      this.triggerEvent('listenAudio', { url: detail.sampleAudio })
    },
  }
})