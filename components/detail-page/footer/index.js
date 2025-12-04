Component({
  properties: {
    title: String,
    titleBackground: String,
    hasAudio: Boolean,
    grading: Number,
    recordTotal: Number,
  },
  data: {

  },
  methods: {
    toRecording() {
      this.triggerEvent('click', {})
    }
  }
})