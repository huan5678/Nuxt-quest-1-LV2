<script setup>
import {Icon} from '@iconify/vue';
const {getOrderDetail} = useApi();
const {formatCurrency} = useFormatCurrency();
const route = useRoute();
const router = useRouter();
const {id} = route.params;

const auth = useAuth();
const userId = computed(() => auth.user.value?._id);
const userData = useCookie('userData');

// 將 id 轉換為 ref
const orderId = ref(id);
const isAuthenticated = ref(false);
const loadingAuth = ref(true);

// 監聽路由參數變化
watch(() => route.params.id, (newId) => {
  if (newId) {
    orderId.value = newId;
  }
});

// 在組件掛載時檢查認證狀態
onMounted(async () => {
  try {
    loadingAuth.value = true;
    console.log('checking auth status', auth);

    // 使用 auth.token 來檢查認證狀態
    if (auth.isLoggedIn.value && auth.token.value) {
      isAuthenticated.value = true;
    } else {
      // 如果還沒有初始化，嘗試初始化
      await auth.initialize();
      // 再次檢查登入狀態
      isAuthenticated.value = auth.isLoggedIn.value && !!auth.token.value;
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    isAuthenticated.value = false;
  } finally {
    loadingAuth.value = false;
  }
});

// 監聽 auth.isLoggedIn 的變化
watch(() => auth.isLoggedIn.value, (newValue) => {
  if (newValue && auth.token.value) {
    isAuthenticated.value = true;
  } else {
    isAuthenticated.value = false;
  }
});

const {
  data: orderData,
  pending,
  error,
  refresh
} = await useAsyncData(
  `order-${orderId.value}`,
  async () => {
    // 如果正在載入認證狀態，等待完成
    if (loadingAuth.value) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!isAuthenticated.value) {
      throw new Error('請先登入');
    }

    try {
      const response = await getOrderDetail(orderId.value);
      if (!response?.data) {
        throw new Error('無效的回應資料格式');
      }
      const {result} = response.data.value;

      return {
        userInfo: result.userInfo || {},
        roomId: result.roomId || {
          name: '',
          imageUrl: ''
        },
        checkInDate: result.checkInDate || '',
        checkOutDate: result.checkOutDate || '',
        peopleNum: result.peopleNum || 0,
        _id: result._id || '',
        ...result
      };
    } catch (err) {
      console.error('Order detail error:', err);
      throw new Error(err.message || '取得訂單資料失敗');
    }
  },
  {
    server: false,
    immediate: true,
    watch: [ isAuthenticated, orderId ] // 使用 ref 來監聽
  }
);

// 當認證狀態改變時，重新加載數據
watch(isAuthenticated, (newValue) => {
  if (newValue) {
    refresh();
  }
});

// 監聽錯誤狀態
watch(error, (newError) => {
  if (newError) {
    console.error('Order data error:', newError);
  }
});

const handleGoToOrder = () => {
  // 修正：確保 userData 存在且有 _id 屬性
  if (!userId.value) {
    console.error('User data not found');
    return;
  }
  router.push(`/user/${userId.value}/order`);
};

</script>

<template>
  <div>
    <div v-if="pending">載入中...</div>
    <div v-else-if="error" class="text-center pt-18 pt-md-30">
      <p>{{ error.message || '發生錯誤' }}</p>
    </div>
    <main v-else-if="orderData" class="pt-18 pt-md-30 bg-neutral-120">
      <div class="container py-10 py-md-30">
        <div v-if="orderData" class="row gap-15 gap-md-0">
          <div class="col-12 col-md-7">
            <div
                 class="d-flex flex-column flex-md-row align-items-md-center gap-4 gap-md-10 mb-8 mb-md-10">
              <Icon class="p-2 display-4 text-neutral-0 bg-success-100 rounded-circle"
                    icon="material-symbols:check" />
              <div class="text-neutral-0 fs-1">
                <h1 class="fw-bold">
                  恭喜，{{ userData.name }}！
                </h1>
                <p class="mb-0 fw-bold">
                  您已預訂成功
                </p>
              </div>
            </div>
            <p class="text-neutral-40 fw-medium">
              我們已發送訂房資訊及詳細內容至你的電子信箱，入住時需向櫃檯人員出示訂房人證件。
            </p>

            <hr class="my-10 my-md-20 opacity-100  text-neutral-40">

            <div class="d-flex flex-column align-items-md-start">
              <h2 class="mb-6 mb-md-10 text-neutral-0 fs-7 fs-md-5 fw-bold">
                立即查看您的訂單紀錄
              </h2>
              <button class="btn btn-primary-100 px-md-15 py-4 text-neutral-0 fw-bold border-0 rounded-3"
                      type="button" @click="handleGoToOrder">
                前往我的訂單
              </button>
            </div>

            <hr class="my-10 my-md-20 opacity-100  text-neutral-40">

            <h2 class="mb-6 mb-md-10 text-neutral-0 fs-5 fw-bold">
              訂房人資訊
            </h2>
            <div class="d-flex flex-column gap-6">
              <div>
                <p class="mb-2 text-neutral-40 fw-medium">
                  姓名
                </p>
                <span class="text-neutral-0 fw-bold">{{ orderData.userInfo.name }}</span>
              </div>
              <div>
                <p class="mb-2 text-neutral-40 fw-medium">
                  手機號碼
                </p>
                <span class="text-neutral-0 fw-bold">{{ orderData.userInfo.phone }}</span>
              </div>
              <div>
                <p class="mb-2 text-neutral-40 fw-medium">
                  電子信箱
                </p>
                <span class="text-neutral-0 fw-bold">{{ orderData.userInfo.email }}</span>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-5">
            <div class="rounded-3xl d-flex flex-column gap-6 gap-md-10 p-4 p-md-10 mx-auto ms-md-auto bg-neutral-0"
                 style="max-width: 478px;">
              <div>
                <p class="mb-2 text-neutral-80 fs-8 fs-md-7 fw-medium">
                  預訂參考編號： {{ orderData._id }}
                </p>
                <h2 class="mb-0 text-neutral-100 fs-7 fs-md-5 fw-bold">
                  即將來的行程
                </h2>
              </div>

              <img class="img-fluid rounded-3" :src="orderData.roomId.imageUrl" alt="room-a">

              <section class="d-flex flex-column gap-6">
                <h3 class="d-flex align-items-center mb-6 text-neutral-80 fs-8 fs-md-6 fw-bold">
                  <p class="mb-0">
                    {{ orderData.roomId.name }}，{{ countNights(orderData.checkInDate,
                      orderData.checkOutDate) }} 晚
                  </p>
                  <span class="d-inline-block mx-4 bg-neutral-80"
                        style="width: 1px;height: 18px;" />
                  <p class="mb-0">
                    住宿人數：{{ orderData.peopleNum }} 位
                  </p>
                </h3>

                <div class="text-neutral-80 fs-8 fs-md-7 fw-bold">
                  <p class="title-deco mb-2">
                    入住：{{ new Date(orderData.checkInDate).toLocaleDateString('zh-TW', {
                      month:
                        'long', day: 'numeric', weekday: 'long'
                    }) }}，15:00 可入住
                  </p>
                  <p class="title-deco mb-0">
                    退房：{{ new Date(orderData.checkOutDate).toLocaleDateString('zh-TW', {
                      month:
                        'long', day: 'numeric', weekday: 'long'
                    }) }}，12:00 前退房
                  </p>
                </div>

                <p class="mb-0 text-neutral-80 fs-8 fs-md-7 fw-bold">
                  NT$ {{ formatCurrency(orderData.roomId.price * countNights(orderData.checkInDate,
                    orderData.checkOutDate) - 1000) }}
                </p>
              </section>

              <hr class="my-0 opacity-100 text-neutral-40">

              <section>
                <h3 class="title-deco mb-4 mb-md-6 text-neutral-100 fs-8 fs-md-7 fw-bold">
                  房內設備
                </h3>
                <ul
                    class="d-flex flex-wrap justify-content-between row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 border border-neutral-40 rounded-3 list-unstyled">
                  <li class="flex-item d-flex gap-2"
                      v-for="facilityInfo in orderData.roomId.facilityInfo"
                      :key="facilityInfo.title" :class="{ 'd-none': !facilityInfo.isProvide }">
                    <div class="d-flex gap-2" v-if="facilityInfo.isProvide">
                      <Icon class="fs-5 text-primary-100" icon="material-symbols:check" />
                      <p class="mb-0 text-neutral-80 fw-bold">{{ facilityInfo.title }}</p>
                    </div>
                  </li>
                </ul>
              </section>

              <section>
                <h3 class="title-deco mb-4 mb-md-6 text-neutral-100 fs-8 fs-md-7 fw-bold">
                  備品提供
                </h3>
                <ul
                    class="d-flex flex-wrap row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 border border-neutral-40 rounded-3 list-unstyled">
                  <li class="flex-item d-flex gap-2"
                      v-for="amenityInfo in orderData.roomId.amenityInfo" :key="amenityInfo.title"
                      :class="{ 'd-none': !amenityInfo.isProvide }">
                    <div class="d-flex gap-2" v-if="amenityInfo.isProvide">
                      <Icon class="fs-5 text-primary-100" icon="material-symbols:check" />
                      <p class="mb-0 text-neutral-80 fw-bold">{{ amenityInfo.title }}</p>
                    </div>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
      <picture>
        <source srcset="@/assets/images/deco-line-group-horizontal-full.svg"
                media="(min-width:576px)">
        <img class="w-100" src="@/assets/images/deco-line-group-horizontal-sm.svg"
             alt="deco-line-group">
      </picture>
    </main>
  </div>
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


.rounded-3xl {
  border-radius: 1.25rem;
}

.title-deco {
  display: flex;
  align-items: center;
}

.title-deco::before {
  --color: #BF9D7D;
  content: '';
  display: inline-block;
  width: 4px;
  height: 24px;
  background-color: var(--color);
  border-radius: 10px;
  margin-right: 0.75rem;
}

.title-deco:nth-child(2)::before {
  --color: #909090;
}

.flex-item {
  flex: 1 1 25%;
  white-space: nowrap;

  @include media-breakpoint-down(md) {
    flex-basis: 40%;
  }
}
</style>
