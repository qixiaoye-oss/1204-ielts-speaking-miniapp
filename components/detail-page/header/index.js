Component({
  properties: {
    title: String,
    titleBackground: String,
    hasAudio: Boolean,
    iconUrl: String,
    grading: Number,
    recordTotal: Number,
    probe: Boolean,
    top: Boolean,
    preferred: Boolean,
    isTop: Boolean,
  },
  data: {

  },
  methods: {
    switchChange(e) {
      this.triggerEvent('switch', e.detail.value)
    }
  }
})