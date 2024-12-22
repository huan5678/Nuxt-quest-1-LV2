<script setup>
import {storeToRefs} from "pinia";
import {z} from 'zod';
import {Icon} from '@iconify/vue';

import BookingLoading from '@/components/rooms/BookingLoading.vue';
import AddressSelector from '@/components/global/AddressSelector.vue';

const {getProfile} = useApi();
const {formatCurrency} = useFormatCurrency();
const {createOrder} = useApi();
const ordersStore = useOrdersStore();
const router = useRouter();
const route = useRoute();

const {order} = storeToRefs(ordersStore);
const {resetOrder} = ordersStore;

const userInfo = ref({
  address: {
    zipcode: 0,
    detail: '',
    city: '臺北市',
    county: '信義區'
  },
  name: '',
  phone: '',
  email: ''
})

const orderId = ref('');

const orderSchema = z.object({
  roomId: z.string().min(1, '請選擇房型'),
  checkInDate: z.string().min(1, '請選擇入住日期'),
  checkOutDate: z.string().min(1, '請選擇退房日期'),
  peopleNum: z.number().min(1, '請選擇入住人數'),
  daysCount: z.number().min(1, '入住天數必須大於 0'),
  userInfo: z.object({
    address: z.object({
      zipcode: z.number().min(1, '請選擇郵遞區號'),
      detail: z.string().min(1, '請輸入詳細地址'),
      city: z.string().min(1, '請選擇城市'),
      county: z.string().min(1, '請選擇地區')
    }),
    name: z.string().min(1, '請輸入姓名'),
    phone: z.string().regex(/^09\d{8}$/, '請輸入正確的手機號碼格式'),
    email: z.string().email('請輸入正確的電子郵件格式')
  })
});


const formErrors = ref({});

const goBack = () => {
  router.back();
}
const isLoading = ref(false);

const roomId = route.params.id;

const {data, pending, error} = await useAsyncData('rooms', async () => {
  const api = useApi();
  try {
    const response = await api.getRoomDetail(roomId);
    return response.data.value;
  } catch (err) {
    console.error('Failed to fetch rooms:', err);
    throw err;
  }
});

const roomDetail = computed(() => data.value?.result || {});

const orderData = computed(() => ({
  roomId,
  checkInDate: order.value.checkInDate,
  checkOutDate: order.value.checkOutDate,
  peopleNum: order.value.peopleNum,
  daysCount: order.value.daysCount,
  userInfo: userInfo.value
}));

watch(() => userInfo.value, (newValue) => {
  validateFormData();
}, {deep: true});

const validateFormData = () => {
  const result = orderSchema.safeParse(orderData.value);
  if (!result.success) {
    formErrors.value = result.error.flatten().fieldErrors;
    return false;
  }
  formErrors.value = {};
  return true;
};

const isFormValid = computed(() => {
  return Object.keys(formErrors.value).length === 0 &&
    userInfo.value.name &&
    userInfo.value.phone &&
    userInfo.value.email &&
    userInfo.value.address.detail;
});

const handleConfirmBooking = async () => {
  isLoading.value = true;

  if (!validateFormData()) {
    isLoading.value = false;
    return;
  }

  try {
    const response = await createOrder(orderData.value);
    isLoading.value = false;
    const {status, result, message} = response.data.value;
    orderId.value = result._id;
    setTimeout(() => {
      resetOrder();
      router.push(`/booking/${orderId.value}/confirmation`);
    }, 3000);
  } catch (err) {
    console.error('Failed to create order:', err);
    isLoading.value = false;
    return;
  }
}


const handleUseAccountInfo = async () => {
  try {
    const response = await getProfile();
    const {result} = response.data.value;

    userInfo.value = {
      address: {
        zipcode: result.address?.zipcode || userInfo.value.address.zipcode,
        detail: result.address?.detail || userInfo.value.address.detail,
        city: result.city || userInfo.value.address.city,
        county: result.county || userInfo.value.address.county
      },
      name: result.name || '',
      phone: result.phone || '',
      email: result.email || ''
    };

    // 手動觸發驗證
    validateFormData();
  } catch (error) {
    console.error('Failed to get profile:', error);
  }
};

onMounted(() => {
  if (!order.value.checkOutDate) {
    router.push({
      name: 'rooms-id',
      params: {
        id: roomId
      }
    });
  }
});
</script>

<template>
  <main class="pt-18 pt-md-30 bg-neutral-120">
    <section class="py-10 py-md-30 bg-primary-10">
      <div class="container">
        <button class="d-flex align-items-baseline gap-2 mb-10 bg-transparent border-0"
                type="button" @click="goBack">
          <Icon class="fs-5 text-neutral-100" icon="mdi:keyboard-arrow-left" />
          <h1 class="mb-0 text-neutral-100 fs-3 fw-bold">
            確認訂房資訊
          </h1>
        </button>

        <div class="row gap-10 gap-md-0">
          <div class="col-12 col-md-7">
            <section>
              <h2 class="mb-8 mb-md-10 text-neutral-100 fs-6 fs-md-4 fw-bold">
                訂房資訊
              </h2>
              <div class="d-flex flex-column gap-6">
                <div class="d-flex justify-content-between align-items-center text-neutral-100">
                  <div>
                    <h3 class="title-deco mb-2 fs-7 fw-bold">
                      選擇房型
                    </h3>
                    <p class="mb-0 fw-medium">
                      {{ roomDetail.name }}
                    </p>
                  </div>
                  <button class="bg-transparent border-0 fw-bold text-decoration-underline"
                          type="button">
                    編輯
                  </button>
                </div>
                <div class="d-flex justify-content-between align-items-center text-neutral-100">
                  <div>
                    <h3 class="title-deco mb-2 fs-7 fw-bold">
                      訂房日期
                    </h3>
                    <p class="mb-2 fw-medium">
                      入住：{{ order.checkInDate }}
                    </p>
                    <p class="mb-0 fw-medium">
                      退房：{{ order.checkOutDate }}
                    </p>
                  </div>
                  <button class="bg-transparent border-0 fw-bold text-decoration-underline"
                          type="button">
                    編輯
                  </button>
                </div>
                <div class="d-flex justify-content-between align-items-center text-neutral-100">
                  <div>
                    <h3 class="title-deco mb-2 fs-7 fw-bold">
                      房客人數
                    </h3>
                    <p class="mb-0 fw-medium">
                      {{ order.peopleNum }} 人
                    </p>
                  </div>
                  <button class="bg-transparent border-0 fw-bold text-decoration-underline"
                          type="button">
                    編輯
                  </button>
                </div>
              </div>
            </section>

            <hr class="my-10 my-md-12 opacity-100 text-neutral-60">

            <section>
              <div class="d-flex justify-content-between align-items-center mb-10">
                <h2 class="mb-0 text-neutral-100 fs-6 fs-md-4 fw-bold">
                  訂房人資訊
                </h2>
                <button class="text-primary-100 bg-transparent border-0 fw-bold text-decoration-underline"
                        type="button" @click="handleUseAccountInfo">
                  套用會員資料
                </button>
              </div>

              <div class="d-flex flex-column gap-6">
                <div class="text-neutral-100">
                  <label for="name" class="form-label fs-8 fs-md-7 fw-bold">姓名</label>
                  <input id="name" type="text" class="form-control p-4 fs-8 fs-md-7 rounded-3"
                         placeholder="請輸入姓名" v-model="userInfo.name">
                  <p class="text-danger fw-bold pt-2"
                     v-if="userInfo.name && formErrors?.userInfo?.name">{{
                    formErrors.userInfo.name[ 0 ]
                    }}</p>
                </div>

                <div class="text-neutral-100">
                  <label for="phone" class="form-label fs-8 fs-md-7 fw-bold">手機號碼</label>
                  <input id="phone" type="tel" class="form-control p-4 fs-8 fs-md-7 rounded-3"
                         placeholder="請輸入手機號碼" v-model="userInfo.phone">
                  <p class="text-danger fw-bold pt-2"
                     v-if="userInfo.phone && formErrors?.userInfo?.phone">{{
                    formErrors.userInfo.phone[ 0 ]
                    }}</p>
                </div>

                <div class="text-neutral-100">
                  <label for="email" class="form-label fs-8 fs-md-7 fw-bold">電子信箱</label>
                  <input id="email" type="email" class="form-control p-4 fs-8 fs-md-7 rounded-3"
                         placeholder="請輸入電子信箱" v-model="userInfo.email">
                  <p class="text-danger fw-bold pt-2"
                     v-if="userInfo.email && formErrors?.userInfo?.email">{{
                    formErrors.userInfo.email[ 0 ]
                    }}</p>
                </div>

                <div class="text-neutral-100">
                  <label for="address" class="form-label fs-8 fs-md-7 fw-bold">地址</label>
                  <AddressSelector v-model="userInfo.address" />
                  <input id="address" type="text" class="form-control p-4 fs-8 fs-md-7 rounded-3"
                         placeholder="請輸入詳細地址" v-model="userInfo.address.detail">
                  <p class="text-danger fw-bold pt-2"
                     v-if="userInfo.address.detail && formErrors?.userInfo?.address?.detail">{{
                    formErrors.userInfo.address.detail[ 0 ]
                    }}</p>
                </div>
              </div>
            </section>

            <hr class="my-10 my-md-12 opacity-100 text-neutral-60">

            <section>
              <h2 class="mb-8 mb-md-10 text-neutral-100 fs-6 fs-md-4 fw-bold">
                房間資訊
              </h2>
              <div class="d-flex flex-column gap-6">
                <section>
                  <h3 class="title-deco mb-4 mb-md-6 fs-7 fs-md-5 fw-bold">
                    房型基本資訊
                  </h3>
                  <ul class="d-flex gap-4 list-unstyled">
                    <li class="card-info px-4 py-5 bg-neutral-0 border border-primary-40 rounded-3">
                      <Icon class="mb-2 fs-5 text-primary-100" icon="fluent:slide-size-24-filled" />
                      <p class="mb-0 fw-bold text-neutral-80 text-nowrap">
                        {{ roomDetail.areaInfo }}
                      </p>
                    </li>
                    <li class="card-info px-4 py-5 bg-neutral-0 border border-primary-40 rounded-3">
                      <Icon class="mb-2 fs-5 text-primary-100" icon="material-symbols:king-bed" />
                      <p class="mb-0 fw-bold text-neutral-80 text-nowrap">
                        {{ roomDetail.bedInfo }}
                      </p>
                    </li>
                    <li class="card-info px-4 py-5 bg-neutral-0 border border-primary-40 rounded-3">
                      <Icon class="mb-2 fs-5 text-primary-100" icon="ic:baseline-person" />
                      <p class="mb-0 fw-bold text-neutral-80 text-nowrap">
                        1-{{ roomDetail.maxPeople }} 人
                      </p>
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 class="title-deco mb-4 mb-md-6 text-neutral-100 fs-7 fs-md-5 fw-bold">
                    房間格局
                  </h3>
                  <ul
                      class="d-flex flex-wrap gap-6 gap-md-10 p-6 fs-8 fs-md-7 bg-neutral-0 rounded-3 list-unstyled">
                    <li v-for="layout in roomDetail.layoutInfo" :key="layout.title"
                        class="d-flex gap-2" :class="{ 'd-none': !layout.isProvide }">
                      <Icon class="fs-5 text-primary-100" icon="material-symbols:check" />
                      <p class="mb-0 text-neutral-80 fw-bold">
                        {{ layout.title }}
                      </p>
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 class="title-deco mb-4 mb-md-6 text-neutral-100 fs-7 fs-md-5 fw-bold">
                    房內設備
                  </h3>
                  <ul
                      class="d-flex flex-wrap row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 rounded-3 list-unstyled">
                    <li v-for="facility in roomDetail.facilityInfo" :key="facility.title"
                        class="flex-item d-flex gap-2" :class="{ 'd-none': !facility.isProvide }">
                      <Icon class="fs-5 text-primary-100" icon="material-symbols:check" />
                      <p class="mb-0 text-neutral-80 fw-bold">
                        {{ facility.title }}
                      </p>
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 class="title-deco mb-4 mb-md-6 text-neutral-100 fs-7 fs-md-5 fw-bold">
                    備品提供
                  </h3>
                  <ul
                      class="d-flex flex-wrap row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 rounded-3 list-unstyled">
                    <li v-for="amenity in roomDetail.amenityInfo" :key="amenity.title"
                        class="flex-item d-flex gap-2" :class="{ 'd-none': !amenity.isProvide }">
                      <Icon class="fs-5 text-primary-100" icon="material-symbols:check" />
                      <p class="mb-0 text-neutral-80 fw-bold">
                        {{ amenity.title }}
                      </p>
                    </li>
                  </ul>
                </section>
              </div>
            </section>
          </div>

          <div class="col-12 col-md-5">
            <div
                 class="confirm-form rounded-3xl d-flex flex-column gap-10 p-6 p-md-10 mx-auto ms-md-auto me-md-0 bg-neutral-0">
              <img class="img-fluid rounded-3" src="@/assets/images/room-a-1.png" alt="room-a">

              <div>
                <h2 className="mb-6 text-neutral-100 fs-6 fs-md-4 fw-bold">
                  價格詳情
                </h2>
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="d-flex align-items-center text-neutral-100 fw-medium">
                    <span>NT$ {{ formatCurrency(roomDetail.price) }} /
                    </span>
                    <Icon class="ms-2 me-1 text-neutral-80" icon="material-symbols:close" />
                    <span class="text-neutral-80">{{ order.daysCount }} 晚</span>
                  </div>
                  <span class="fw-medium">
                    NT$ {{ formatCurrency(roomDetail.price * order.daysCount) }}
                  </span>
                </div>
                <div class="d-flex justify-content-between align-items-center fw-medium">
                  <p class="d-flex align-items-center mb-0 text-neutral-100">
                    住宿折扣
                  </p>
                  <span class="text-primary-100">
                    -NT$ 1,000
                  </span>
                </div>
                <hr class="my-6 opacity-100 text-neutral-40">
                <div
                     class="d-flex justify-content-between align-items-center text-neutral-100 fw-bold">
                  <p class="d-flex align-items-center mb-0">
                    總價
                  </p>
                  <span>
                    NT$ {{ formatCurrency(roomDetail.price * order.daysCount - 1000) }}
                  </span>
                </div>
              </div>

              <button class="btn btn-primary-100 py-4 text-neutral-0 fw-bold rounded-3"
                      type="button" @click="handleConfirmBooking"
                      :disabled="isLoading || !isFormValid">
                確認訂房
              </button>
              <div v-if="Object.keys(formErrors).length > 0" class="mt-3">
                <p v-for="(errors, field) in formErrors" :key="field" class="text-danger mb-1 fs-8">
                  {{ errors[ 0 ] }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <BookingLoading v-if="isLoading" />
  </main>
</template>

<style lang="scss" scoped>
@import "bootstrap/scss/mixins/breakpoints";

$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px,
  xxxl: 1537px
);

.title-deco {
  display: flex;
  align-items: center;
}

.title-deco::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 24px;
  background-color: #BF9D7D;
  border-radius: 10px;
  margin-right: 0.75rem;
}

.form-control::placeholder {
  --neutral-60: #909090;
  color: var(--neutral-60);
  font-weight: 500;
}

.card-info {
  width: 97px;
  height: 97px;
}

.flex-item {
  flex: 1 1 15%;

  @include media-breakpoint-down(md) {
    flex-basis: 40%;
  }
}

.rounded-3xl {
  border-radius: 1.25rem;
}

.confirm-form {
  position: sticky;
  top: 160px;
  max-width: 478px;

  @include media-breakpoint-down(md) {
    position: static;
    top: 0;
    max-width: auto;
  }
}

</style>
