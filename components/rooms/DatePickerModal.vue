<script setup>
import {Icon} from '@iconify/vue';
import {DatePicker} from 'v-calendar';
import {useScreens} from 'vue-screen-utils';
const {$bootstrap} = useNuxtApp();

import 'v-calendar/style.css';

const modal = ref(null);
const modalElement = ref(null);

const modalInstance = computed(() => {
  if (import.meta.client && modalElement.value) {
    return new $bootstrap.Modal(modalElement.value, {
      // backdrop: 'static',  // 防止點擊背景關閉
      // keyboard: false      // 防止按 ESC 關閉
    });
  }
  return null;
});

onMounted(() => {
  if (import.meta.client) {
    nextTick(() => {
      try {
        modal.value = modalInstance.value;
      } catch (error) {
        console.error('Modal initialization error:', error);
      }
    });
  }
})

const openModal = () => {
  if (modal.value) {
    modal.value.show();
  }
};

const closeModal = () => {
  if (modal.value) {
    modal.value.hide();
  }
};

onUnmounted(() => {
  if (modal.value) {
    modal.value.dispose();
  }
});

defineExpose({
  openModal,
  closeModal
})

const emit = defineEmits([ 'handleDateChange' ]);


const props = defineProps({
  dateTime: {
    type: Object,
    required: true,
  }
})

// 添加日期格式化輔助函數
const formatDateToYYYYMMDD = (date) => {
  if (!date) return '';
  if (typeof date === 'string') {
    // 如果已經是 YYYY-MM-DD 格式就直接返回
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;
    const parsedDate = new Date(date);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// 修改現有的 formatDateTitle 函數
const formatDateTitle = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 修改 tempDate 的初始化
const tempDate = ref({
  date: {
    start: formatDateToYYYYMMDD(props.dateTime.date.start) || null,
    end: formatDateToYYYYMMDD(props.dateTime.date.end) || null,
  },
  minDate: new Date(props.dateTime.minDate),
  maxDate: new Date(props.dateTime.maxDate),
  key: 0
});

// 修改 watch
watch(() => props.dateTime, (newVal) => {
  tempDate.value = {
    date: {
      start: formatDateToYYYYMMDD(newVal.date.start),
      end: formatDateToYYYYMMDD(newVal.date.end),
    },
    minDate: newVal.minDate,
    maxDate: newVal.maxDate,
    key: tempDate.value.key
  };
}, {deep: true});


const masks = {
  title: 'YYYY 年 MM 月',
  modelValue: 'YYYY-MM-DD'
};

const {mapCurrent} = useScreens({
  md: '768px',
});

const rows = mapCurrent({md: 1}, 2);
const columns = mapCurrent({md: 2}, 1);
const expanded = mapCurrent({md: false}, true);
const titlePosition = mapCurrent({md: 'center'}, 'left');

const daysCount = computed(() => {
  const startDate = tempDate.value.date.start;
  const endDate = tempDate.value.date.end;

  if (!startDate || !endDate) return 0;

  // 創建新的 Date 對象並設置為當地時間
  const start = new Date(startDate);
  const end = new Date(endDate);

  const differenceTime = end.getTime() - start.getTime();
  const differenceDay = Math.ceil(differenceTime / (1000 * 60 * 60 * 24));

  return differenceDay;
});
const MAX_BOOKING_PEOPLE = 10;
const bookingPeopleMobile = ref(1);


const isConfirmDateOnMobile = ref(false);

const confirmDateOnMobile = () => {
  isConfirmDateOnMobile.value = true;
}

const confirmDate = () => {
  const isMobile = mapCurrent({md: false}, true);

  // 確保有選擇日期範圍
  if (!tempDate.value.date.start || !tempDate.value.date.end) {
    return;
  }

  const payload = {
    date: {
      start: formatDateToYYYYMMDD(tempDate.value.date.start),
      end: formatDateToYYYYMMDD(tempDate.value.date.end)
    },
    daysCount: daysCount.value
  };

  if (isMobile.value) {
    payload.people = bookingPeopleMobile.value;
  }

  emit('handleDateChange', payload);
  closeModal();
};

const clearDate = () => {
  tempDate.value = {
    ...tempDate.value,
    date: {
      start: null,
      end: null
    },
    key: tempDate.value.key + 1
  };
};

</script>

<template>
  <ClientOnly>
    <div id="dateModal" ref="modalElement" class="modal fade" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered m-0 mt-9 mx-md-auto">
        <div :class="{ 'mt-auto': isConfirmDateOnMobile }"
             class="modal-content gap-6 gap-md-10 rounded-3xl">
          <div class="d-md-none modal-header px-6 py-4 bg-neutral-40">
            <div class="d-flex flex-column gap-4">
              <button type="button" class="btn-close" style="margin-left: -8px !important;"
                      @click="closeModal" />
              <h3 v-if="tempDate.date.end === null" class="text-neutral-100 fs-6 fw-bold">
                選擇入住與退房日期
              </h3>
              <div v-else class="d-flex align-items-center gap-4">
                <h3 class="modal-title mb-0 text-neutral-100 fs-6 fw-bold">
                  {{ daysCount }} 晚
                </h3>
                <div class="d-flex gap-2 text-neutral-80 fs-8 fw-medium">
                  <span>{{ formatDateTitle(tempDate.date.start) }}</span>
                  -
                  <span>{{ formatDateTitle(tempDate.date.end) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="d-none d-md-flex modal-header gap-15 p-8 pb-0 border-0">
            <div>
              <h3 class="modal-title mb-2 text-neutral-100 fs-5 fw-bold">
                {{ daysCount }} 晚
              </h3>
              <div class="d-flex gap-2 text-neutral-80 fw-medium">
                <span>{{ formatDateTitle(tempDate.date.start) }}</span>
                -
                <span>{{ formatDateTitle(tempDate.date.end) }}</span>
              </div>
            </div>

            <div class="d-flex flex-wrap gap-2 w-50 ms-auto">
              <div class="form-floating flex-grow-1">
                <input id="checkInDate" readonly type="date"
                       :value="formatDateToYYYYMMDD(tempDate.date.start)"
                       class="form-control p-4 pt-9 text-neutral-100 fw-medium border-neutral-100 rounded-3"
                       style="min-height: 74px;" placeholder="yyyy-mm-dd">
                <label class="text-neutral-80 fw-medium" style="top: 8px;left: 8px;"
                       for="checkInDate">入住
                </label>
              </div>

              <div class="form-floating flex-grow-1">
                <input id="checkoutDate" type="date" readonly
                       :value="formatDateToYYYYMMDD(tempDate.date.end)"
                       class="form-control p-4 pt-9 text-neutral-100 fw-medium border-neutral-100 rounded-3"
                       style="min-height: 74px;" placeholder="yyyy-mm-dd">
                <label class="text-neutral-80 fw-medium" style="top: 8px;left: 8px;"
                       for="checkoutDate">退房
                </label>
              </div>
            </div>
          </div>
          <div class="modal-body px-6 px-md-8 py-0">
            <div v-if="!isConfirmDateOnMobile" class="date-picker">
              <DatePicker :key="tempDate.key" v-model.range="tempDate.date" color="primary"
                          :masks="masks" :first-day-of-week="1" :min-date="tempDate.minDate"
                          :max-date="tempDate.maxDate" :rows="rows" :columns="columns"
                          :expanded="expanded" :title-position="titlePosition" class="border-0" />
            </div>

            <div v-else>
              <h6 class="mb-1 text-neutral-100 fw-bold">
                選擇人數
              </h6>
              <p className="mb-4 text-neutral-80 fs-8 fw-medium">
                此房型最多供 4 人居住，不接受寵物入住。
              </p>

              <div class="d-flex align-items-center gap-4">
                <button :class="{ 'disabled bg-neutral-40': bookingPeopleMobile === 1 }"
                        class="btn btn-neutral-0 p-4 border border-neutral-40 rounded-circle"
                        type="button" @click="bookingPeopleMobile--">
                  <Icon class="fs-5 text-neutral-100" icon="ic:baseline-minus" />
                </button>

                <h6 id="people"
                    class="d-flex justify-content-center align-items-center mb-0 fw-bold text-neutral-100"
                    style="width: 24px;" name="people">
                  {{ bookingPeopleMobile }}
                </h6>

                <button :class="{
                  'disabled bg-neutral-40':
                    bookingPeopleMobile ===
                    MAX_BOOKING_PEOPLE
}" class="btn btn-neutral-0 p-4 border border-neutral-40 rounded-circle"
                        type="button" @click="bookingPeopleMobile++">
                  <Icon class="fs-5 text-neutral-100" icon="ic:baseline-plus" />
                </button>
              </div>
            </div>
          </div>
          <div class="d-none d-md-flex modal-footer p-3 p-md-8 pt-0 border-0">
            <button type="button"
                    class="btn btn-outline-neutral-80 flex-grow-1 flex-md-grow-0 p-4 fw-bold border-0 rounded-3"
                    @click="clearDate">
              清除日期
            </button>
            <button type="button"
                    class="btn btn-primary-100 flex-grow-1 flex-md-grow-0 px-8 py-4 text-neutral-0 fw-bold rounded-3"
                    @click="confirmDate">
              確定日期
            </button>
          </div>

          <div class="d-md-none modal-footer p-3 p-md-8 pt-0 border-0">
            <template v-if="isConfirmDateOnMobile">
              <button type="button"
                      class="btn btn-outline-neutral-80 flex-grow-1 flex-md-grow-0 p-4 fw-bold border-0 rounded-3"
                      @click="isConfirmDateOnMobile = false">
                重新選擇日期
              </button>
              <button type="button"
                      class="btn btn-primary-100 flex-grow-1 flex-md-grow-0 px-8 py-4 text-neutral-0 fw-bold rounded-3"
                      @click="confirmDate">
                儲存
              </button>
            </template>
            <template v-else>
              <button type="button"
                      class="btn btn-outline-neutral-80 flex-grow-1 flex-md-grow-0 p-4 fw-bold border-0 rounded-3"
                      @click="clearDate">
                清除日期
              </button>
              <button type="button"
                      class="btn btn-primary-100 flex-grow-1 flex-md-grow-0 px-8 py-4 text-neutral-0 fw-bold rounded-3"
                      @click="confirmDateOnMobile">
                確定日期
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>


<style lang="scss" scoped>
.modal {
  backdrop-filter: blur(10px);
}

.modal-dialog {
  max-width: 740px;
}


.date-picker :deep(.vc-primary) {
  --vc-accent-50: #f0f9ff;
  --vc-accent-100: #e0f2fe;
  --vc-accent-200: #F9F9F9;
  --vc-accent-300: #7dd3fc;
  --vc-accent-400: #38bdf8;
  --vc-accent-500: #0ea5e9;
  --vc-accent-600: #000000;
  --vc-accent-700: #FFFFFF;
  --vc-accent-800: #F9F9F9;
  --vc-accent-900: #000000;
}


.date-picker :deep(.vc-container) {
  --vc-font-family: : "Noto Serif TC", serif;
}

.date-picker :deep(.vc-pane-layout) {
  gap: 60px;
}

.date-picker :deep(.vc-header) {
  margin-bottom: 4px;
}



.date-picker :deep(.vc-title) {
  background-color: transparent;
  color: #000000;
  font-size: 1.25rem;
  font-weight: bold;
}

.date-picker :deep(.vc-arrow) {
  width: 24px;
  height: 24px;
  background-color: transparent;
}

.date-picker :deep(.vc-base-icon) {
  width: 12px;
  stroke: #000;
}

.date-picker :deep(.vc-weeks) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-picker :deep(.vc-weeks) {
  padding: 0;
}

.date-picker :deep(.vc-weekday) {
  --vc-weekday-color: #4B4B4B;
  font-size: var(--vc-text-base);
  font-weight: 500;
  padding: 12px 14px 8px 14px;
  line-height: unset;
}

.date-picker :deep(.vc-day-content) {
  font-size: var(--vc-text-base);
  width: 44px;
  height: 44px;
}

.date-picker :deep(.vc-highlight) {
  width: 44px;
  height: 44px;
}

.date-picker :deep(.vc-attr) {
  --vc-highlight-outline-bg: #000000;
}
</style>
