<script setup>
const {$bootstrap} = useNuxtApp();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info'
  }
})

const emit = defineEmits([ 'update:modelValue', 'confirm' ])
const showing = ref(false)

const modal = ref(null);
const modalElement = ref(null);

const modalInstance = computed(() => {
  if (import.meta.client && modalElement.value) {
    return new $bootstrap.Modal(modalElement.value, {
    });
  }
  return null;
});

const hide = () => {
  emit('update:modelValue', false)
}

const initModal = () => {
  // 確保在客戶端環境
  if (import.meta.client && modalElement.value) {
    if (props.modelValue) {
      modal.value.show()
    }
    showing.value = props.modelValue
  }
}

onMounted(() => {
  if (import.meta.client) {
    nextTick(() => {
      try {
        initModal()
        modal.value = modalInstance.value;
      } catch (error) {
        console.error('Modal initialization error:', error);
      }
    });
  }
})

onUnmounted(() => {
  if (modal.value) {
    modal.value.hide()
    modal.value.dispose()
  }
})

watch(() => props.modelValue, (newValue) => {
  if (!modal.value && modalElement.value) {
    initModal()
  }

  if (modal.value) {
    if (newValue) {
      modal.value.show()
    } else {
      modal.value.hide()
    }
    showing.value = newValue
  }
})
</script>

<template>
  <ClientOnly>
    <div class="modal fade" ref="modalElement" :class="{ 'show': showing }" tabindex="-1"
         aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header" :class="{
            'bg-primary-120 text-neutral-0': type === 'success' || type === 'info',
            'bg-alert-100 text-neutral-0': type === 'error'
          }">
            <h5 class="modal-title">{{ title }}</h5>
            <button type="button" class="btn-close"
                    :class="{ 'btn-close-white': type === 'success' || type === 'error' }"
                    aria-label="Close" @click="hide" />
          </div>
          <div class="modal-body">
            {{ message }}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn text-neutral-0" v-if="type === 'info'" :class="{
              'btn-info-100': type !== 'error',
            }" @click="hide">
              關閉
            </button>
            <button type="button" class="btn text-neutral-0" :class="{
              'btn-primary-120': type === 'success' || type === 'info',
              'btn-alert-100': type === 'error',
            }" @click="emit('confirm')">
              確認
            </button>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
<style scoped>
.modal-header.bg-success .btn-close,
.modal-header.bg-danger .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}
</style>
