const app = getApp()

Component({
  options: {
    multipleSlots: true
  },
  properties: {
    type: {
      type: String,
      value: ''
    }
  },
  data: {},
  methods: {
    onTap(e) {
      this.triggerEvent('tap', e.detail)
    }
  }
})
