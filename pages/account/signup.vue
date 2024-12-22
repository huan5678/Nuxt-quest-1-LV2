<script setup>
import {z} from 'zod';
import {Icon} from '@iconify/vue';
import {citys, zipcodes} from '~/assets/data/cityData';

const {register} = useAuth();

const formErrors = ref({});
const isLoading = ref(false);
const isNextStep = ref(false);

const birthDate = ref({
  year: new Date().getFullYear(),
  month: 1,
  day: 1
});

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const selectedCity = ref('高雄市');
const selectedZone = ref('新興區');
const selectedZipcode = ref(800);
const confirmTermsOfService = ref(false);

const formData = ref({
  "name": "",
  "phone": "",
  "birthday": "",
  "address": {
    "zipcode": 0,
    "detail": ""
  }
});

// 計算年份範圍（例如：從 1950 到當前年份）
const years = computed(() => {
  const currentYear = new Date().getFullYear();
  const startYear = 1950;
  return Array.from(
    {length: currentYear - startYear + 1},
    (_, i) => startYear + i
  ).reverse();
});

// 計算月份（1-12）
const months = computed(() => {
  return Array.from({length: 12}, (_, i) => i + 1);
});

// 計算指定年月的天數
const days = computed(() => {
  const daysInMonth = new Date(
    birthDate.value.year,
    birthDate.value.month,
    0
  ).getDate();
  return Array.from({length: daysInMonth}, (_, i) => i + 1);
});

// 監聽日期變化並更新 formData
watch(birthDate, (newDate) => {
  const {year, month, day} = newDate;
  // 格式化月份和日期，確保是兩位數
  const formattedMonth = month.toString().padStart(2, '0');
  const formattedDay = day.toString().padStart(2, '0');
  formData.value.birthday = `${year}/${formattedMonth}/${formattedDay}`;
  // 觸發驗證
  validateField('birthday', formData.value.birthday);
}, {deep: true});

// 計算當前選擇城市的區域列表
const currentZones = computed(() => {
  const cityData = zipcodes.find(item => item.city === selectedCity.value);
  return cityData ? cityData.zone.map(z => z.county) : [];
});

// 監聽城市變化
watch(selectedCity, (newCity) => {
  const cityData = zipcodes.find(item => item.city === newCity);
  if (cityData && cityData.zone.length > 0) {
    // 設定預設區域為該城市的第一個區域
    selectedZone.value = cityData.zone[ 0 ].county;
    selectedZipcode.value = cityData.zone[ 0 ].zipcode;
    // 更新地址資料
    updateAddressData();
  }
});

// 監聽區域變化
watch(selectedZone, (newZone) => {
  const cityData = zipcodes.find(item => item.city === selectedCity.value);
  if (cityData) {
    const zoneData = cityData.zone.find(z => z.county === newZone);
    if (zoneData) {
      selectedZipcode.value = zoneData.zipcode;
      // 更新地址資料
      updateAddressData();
    }
  }
});

// 更新地址資料
const updateAddressData = () => {
  formData.value.address.zipcode = selectedZipcode.value;
};

// 添加地址相關的驗證
const validateAddress = () => {
  const addressSchema = z.object({
    zipcode: z.number().min(1, '請選擇地區'),
    detail: z.string().min(1, '請輸入詳細地址')
  });

  const result = addressSchema.safeParse(formData.value.address);
  if (!result.success) {
    for (const error of result.error.errors) {
      formErrors.value[ `address.${error.path[ 0 ]}` ] = error.message;
    }
    return false;
  }

  formErrors.value[ 'address.zipcode' ] = undefined;
  formErrors.value[ 'address.detail' ] = undefined;
  return true;
};

// 監聽詳細地址變化
watch(() => formData.value.address.detail, (newVal) => {
  if (!newVal?.trim()) {
    formErrors.value[ 'address.detail' ] = '請輸入詳細地址';
  } else {
    formErrors.value[ 'address.detail' ] = undefined;
  }
});

// 計算所有表單數據
const allFormData = computed(() => ({
  email: email.value,
  password: password.value,
  confirmPassword: confirmPassword.value,
  ...formData.value
}));

// 檢查第一步驟是否已填寫完整
const isFirstStepComplete = computed(() => {
  return Boolean(
    email.value?.trim() &&
    password.value?.trim() &&
    confirmPassword.value?.trim()
  );
});

const firstStepSchema = z.object({
  email: z.string().min(1, '請輸入電子郵件').email('請輸入正確的電子郵件'),
  password: z.string().min(8, '密碼至少需要8個字元'),
  confirmPassword: z.string().min(8, '確認密碼至少需要8個字元')
}).refine((data) => data.password === data.confirmPassword, {
  message: '兩次密碼不相同',
  path: [ 'confirmPassword' ]
});

const schema = z.object({
  name: z.string().min(1, '請輸入姓名'),
  phone: z.string().min(1, '請輸入手機號碼'),
  birthday: z.string().min(1, '請輸入生日'),
  address: z.object({
    zipcode: z.number().min(1, '請輸入郵遞區號'),
    detail: z.string().min(1, '請輸入地址')
  })
})

// 驗證第一步驟的資料
const validateFirstStep = () => {
  const firstStepData = {
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value
  };

  const result = firstStepSchema.safeParse(firstStepData);

  if (!result.success) {
    const newErrors = result.error.errors.reduce((acc, error) => {
      const key = error.path[ 0 ];
      acc[ key ] = error.message;
      return acc;
    }, {});
    Object.assign(formErrors.value, newErrors);
    return false;
  }

  // 清除第一步驟相關的錯誤訊息
  for (const key of [ 'email', 'password', 'confirmPassword' ]) {
    formErrors.value[ key ] = undefined;
  }

  return true;
};

// 修改 handleNextStep 函數
const handleNextStep = () => {

  if (!isFirstStepComplete.value) {
    Object.assign(formErrors.value, {
      email: !email.value?.trim() ? '請輸入電子郵件' : undefined,
      password: !password.value?.trim() ? '請輸入密碼' : undefined,
      confirmPassword: !confirmPassword.value?.trim() ? '請輸入確認密碼' : undefined
    });
    return;
  }

  const isValid = validateFirstStep();
  if (isValid) {
    isNextStep.value = true;
  }
};

const validateFormData = () => {
  const result = schema.safeParse(formData.value);
  if (!result.success) {
    formErrors.value = result.error.errors.reduce((acc, error) => {
      const key = error.path[ 0 ];
      acc[ key ] = error.message;
      return acc
    }, {});
    return false;
  }
  formErrors.value = {};
  return true;
}

const validateField = (field, value) => {
  const trimmedValue = value?.trim();

  try {
    if (!trimmedValue) {
      formErrors[ field ] = '此欄位為必填';
      return;
    }

    // 根據不同欄位建立對應的驗證規則
    if (field === 'email') {
      const emailSchema = z.string().min(1, '請輸入電子郵件').email('請輸入正確的電子郵件');
      const result = emailSchema.safeParse(trimmedValue);
      if (!result.success) {
        formErrors.value[ field ] = result.error.errors[ 0 ].message;
        return;
      }
    }
    else if (field === 'password') {
      const passwordSchema = z.string().min(8, '密碼至少需要8個字元');
      const result = passwordSchema.safeParse(trimmedValue);
      if (!result.success) {
        formErrors.value[ field ] = result.error.errors[ 0 ].message;
        return;
      }
    }
    else if (field === 'confirmPassword') {
      // 確認密碼需要檢查是否與密碼相同
      const confirmPasswordSchema = z.string().min(8, '確認密碼至少需要8個字元');
      const result = confirmPasswordSchema.safeParse(trimmedValue);

      if (!result.success) {
        formErrors.value[ field ] = result.error.errors[ 0 ].message;
        return;
      }

      // 檢查密碼是否相同
      if (trimmedValue !== password.value) {
        formErrors.value[ field ] = '密碼與確認密碼不相同';
        return;
      }
    }
    // 如果驗證通過，刪除該欄位的錯誤訊息
    formErrors.value[ field ] = undefined;

  } catch (error) {
    console.error(`Error validating ${field}:`, error);
    formErrors.value[ field ] = '驗證發生錯誤';
  }
};

// 分別監聽每個欄位的變化
watch(email, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    validateField('email', newVal);
  }
});

watch(password, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    validateField('password', newVal);
    // 當密碼改變時，也要重新驗證確認密碼
    if (confirmPassword.value) {
      validateField('confirmPassword', confirmPassword.value);
    }
  }
});

watch(confirmPassword, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    validateField('confirmPassword', newVal);
  }
});

watch(confirmTermsOfService, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    formErrors.value.termsOfService = newVal ? undefined : '請同意服務條款';
  }
});

const handleOnSubmit = async () => {
  isLoading.value = true;

  if (!validateAddress()) {
    isLoading.value = false;
    return;
  }

  if (!validateFormData()) {
    isLoading.value = false;
    return;
  }

  if (!confirmTermsOfService.value) {
    isLoading.value = false;
    formErrors.value.termsOfService = '請同意服務條款';
    return;
  }

  try {
    const result = await register(allFormData.value);
    isLoading.value = false;
    if (result.status === false) {
      formErrors.value = result.message;
      return;
    }
    navigateTo('/account/login');
    // 可以添加成功提示或導航
  } catch (error) {
    isLoading.value = false;
    console.error(error);
    // 可以添加錯誤提示
  }
};

// 在組件掛載時初始化日期
onMounted(() => {
  // 如果 formData 中已有生日數據，則解析並設置
  if (formData.value.birthday) {
    const [ year, month, day ] = formData.value.birthday.split('/');
    birthDate.value = {
      year: Number.parseInt(year),
      month: Number.parseInt(month),
      day: Number.parseInt(day)
    };
  } else {
    // 設置預設值（可以是空或當前日期）
    const today = new Date();
    birthDate.value = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };
  }
});

</script>

<template>
  <div class="p-5 px-md-0 py-md-30">
    <div class="mb-10">
      <p class="mb-2 text-primary-100 fs-8 fs-md-7 fw-bold">
        享樂酒店，誠摯歡迎
      </p>
      <h1 class="mb-4 text-neutral-0 fw-bold">
        立即註冊
      </h1>

      <div class="d-flex align-items-center py-4 gap-2">
        <div class="d-flex flex-column align-items-center gap-1 text-neutral-0">
          <span :class="{ 'd-none': isNextStep }"
                class="step p-2 bg-primary-100 rounded-circle">1</span>
          <Icon :class="{ 'd-none': !isNextStep }" class="p-2 fs-3 bg-primary-100 rounded-circle"
                icon="material-symbols:check" />
          <p class="mb-0 fs-8 fs-md-7 fw-bold">
            輸入信箱及密碼
          </p>
        </div>

        <hr class="flex-grow-1 my-0 border border-neutral-60 opacity-100">

        <div :class="{
          'text-neutral-0': isNextStep, 'text-neutral-60': !isNextStep
        }" class="d-flex flex-column align-items-center gap-1">
          <span :class="{
            'bg-primary-100': isNextStep, 'bg-transparent border border-neutral-60': !isNextStep
          }" class="step p-2 rounded-circle">2</span>
          <p class="mb-0 fs-8 fs-md-7 fw-bold">
            填寫基本資料
          </p>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <form :class="{ 'd-none': isNextStep }" class="mb-4">
        <div class="mb-4 fs-8 fs-md-7">
          <label class="mb-2 text-neutral-0 fw-bold" for="email">
            電子信箱
          </label>
          <input id="email" class="form-control p-4 text-neutral-100 fw-medium border-neutral-40"
                 placeholder="hello@exsample.com" type="email" v-model.trim="email"
                 :disabled="isLoading" @blur="validateField('email', email)">
          <p class="text-danger fw-bold pt-2" v-if="formErrors.email">{{ formErrors.email }}</p>
        </div>
        <div class="mb-4 fs-8 fs-md-7">
          <label class="mb-2 text-neutral-0 fw-bold" for="password">
            密碼
          </label>
          <input id="password" class="form-control p-4 text-neutral-100 fw-medium border-neutral-40"
                 placeholder="請輸入密碼" type="password" v-model.trim="password" :disabled="isLoading"
                 @blur="validateField('password', password)">
          <p class="text-danger fw-bold pt-2" v-if="formErrors.password">{{ formErrors.password }}
          </p>
        </div>
        <div class="mb-10 fs-8 fs-md-7">
          <label class="mb-2 text-neutral-0 fw-bold" for="confirmPassword">
            確認密碼
          </label>
          <input id="confirmPassword"
                 class="form-control p-4 text-neutral-100 fw-medium border-neutral-40"
                 placeholder="請再輸入一次密碼" type="password" v-model.trim="confirmPassword"
                 :disabled="isLoading" @blur="validateField('confirmPassword', confirmPassword)">
          <p class="text-danger fw-bold pt-2" v-if="formErrors.confirmPassword">
            {{ formErrors.confirmPassword }}
          </p>
        </div>
        <button class="btn btn-neutral-40 w-100 py-4 text-neutral-60 fw-bold" type="button"
                :disabled="formErrors.email || formErrors.password || formErrors.confirmPassword || !email || !password || !confirmPassword"
                @click="handleNextStep">
          下一步
        </button>
      </form>
      <form :class="{ 'd-none': !isNextStep }" class="mb-4" @submit.prevent="handleOnSubmit">
        <div class="mb-4 fs-8 fs-md-7">
          <label class="mb-2 text-neutral-0 fw-bold" for="name">
            姓名
          </label>
          <input id="name"
                 class="form-control p-4 text-neutral-100 fw-medium border-neutral-40  rounded-3"
                 placeholder="請輸入姓名" type="text" v-model="formData.name" :disabled="isLoading">
          <p class="text-danger fw-bold pt-2" v-if="formErrors.name">{{ formErrors.name }}</p>
        </div>
        <div class="mb-4 fs-8 fs-md-7">
          <label class="mb-2 text-neutral-0 fw-bold" for="phone">
            手機號碼
          </label>
          <input id="phone"
                 class="form-control p-4 text-neutral-100 fw-medium border-neutral-40  rounded-3"
                 placeholder="請輸入手機號碼" type="tel" v-model="formData.phone" :disabled="isLoading">
          <p class="text-danger fw-bold pt-2" v-if="formErrors.phone">{{ formErrors.phone }}</p>
        </div>
        <div class="mb-4 fs-8 fs-md-7">
          <label class="mb-2 text-neutral-0 fw-bold" for="birth">
            生日
          </label>
          <div class="d-flex gap-2">
            <select id="birth-year" v-model="birthDate.year"
                    class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                    :disabled="isLoading">
              <option v-for="year in years" :key="year" :value="year">
                {{ year }} 年
              </option>
            </select>

            <select id="birth-month" v-model="birthDate.month"
                    class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                    :disabled="isLoading">
              <option v-for="month in months" :key="month" :value="month">
                {{ month }} 月
              </option>
            </select>

            <select id="birth-day" v-model="birthDate.day"
                    class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                    :disabled="isLoading">
              <option v-for="day in days" :key="day" :value="day">
                {{ day }} 日
              </option>
            </select>
          </div>
          <p class="text-danger fw-bold pt-2" v-if="formErrors.birthday">
            {{ formErrors.birthday }}
          </p>
        </div>
        <div class="mb-4 fs-8 fs-md-7">
          <label class="form-label text-neutral-0 fw-bold" for="address">
            地址
          </label>
          <div>
            <div class="d-flex gap-2 mb-2">
              <select class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                      v-model="selectedCity">
                <option v-for="city in citys" :key="city" :value="city">
                  {{ city }}
                </option>
              </select>

              <select class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                      v-model="selectedZone">
                <option v-for="zone in currentZones" :key="zone" :value="zone">
                  {{ zone }}
                </option>
              </select>
            </div>

            <div class="mb-2">
              <input type="text" class="form-control p-4 text-neutral-80 fw-medium rounded-3"
                     :placeholder="`${selectedZipcode} ${selectedCity}${selectedZone}`" disabled>
            </div>
            <input id="address" type="text" class="form-control p-4 rounded-3" placeholder="請輸入詳細地址"
                   v-model="formData.address.detail" :disabled="isLoading">
            <p class="text-danger fw-bold pt-2" v-if="formErrors.address">
              {{ formErrors.address }}
            </p>
          </div>
        </div>

        <div class="form-check d-flex align-items-end gap-2 mb-10 text-neutral-0">
          <input id="agreementCheck" class="form-check-input" type="checkbox"
                 v-model="confirmTermsOfService" :disabled="isLoading">
          <label class="form-check-label fw-bold" for="agreementCheck">
            我已閱讀並同意本網站個資使用規範
          </label>
        </div>
        <p class="text-danger fw-bold" v-if="formErrors.termsOfService">
          {{ formErrors.termsOfService }}
        </p>
        <button class="btn btn-primary-100 w-100 py-4 text-neutral-0 fw-bold" type="submit">
          完成註冊
        </button>
      </form>
    </div>

    <p class="mb-0 fs-8 fs-md-7">
      <span class="me-2 text-neutral-0 fw-medium">已經有會員了嗎？</span>
      <NuxtLink to="login"
                class="text-primary-100 fw-bold text-decoration-underline bg-transparent border-0">
        <span>立即登入</span>
      </NuxtLink>
    </p>
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


input[type="password"] {
  font: small-caption;
  font-size: 1.5rem;
}

input::placeholder {
  color: #909090;
  font-size: 1rem;
  font-weight: 500;

  @include media-breakpoint-down(md) {
    font-size: 14px;
  }
}

.form-check-input {
  width: 1.5rem;
  height: 1.5rem;
}

.form-check-input:checked {
  background-color: #BF9D7D;
  border-color: #BF9D7D;
}

.step {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
}
.form-select {
  flex: 1;
}
</style>
