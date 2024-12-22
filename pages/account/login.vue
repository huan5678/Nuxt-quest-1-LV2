<script setup>
import {z} from 'zod';
const userAccountInCookie = useCookie('userAccount');
const {login} = useAuth();
const router = useRouter();

const formData = ref({
  email: '',
  password: ''
})

const formErrors = ref({});

const isLoading = ref(false);

const schema = z.object({
  email: z.string().email('請輸入正確的電子郵件'),
  password: z.string().min(1)
})

const isFormValid = computed(() => {
  const result = schema.safeParse(formData.value);
  return result.success;
});
const validateFormData = () => {
  const result = schema.safeParse(formData.value);
  if (!result.success) {
    formErrors.value = result.error.errors.reduce((acc, error) => {
      const key = error.path[ 0 ];
      acc[ key ] = error.message;
      return acc;
    }, {});
    return false;
  }
  formErrors.value = {};
  return true;
};


const handleRememberMe = () => {
  if (userAccountInCookie.value !== formData.value.email) {
    userAccountInCookie.value = formData.value.email;
  }
}

const handleOnSubmit = async () => {
  isLoading.value = true;

  if (!validateFormData()) {
    isLoading.value = false;
    return;
  }

  try {
    const response = await login(formData.value);
    console.log(response);
    const {status, message, token, result} = response;


    // 登入成功
    useCookie('userAccount').value = formData.value.email;
    useCookie('userData').value = JSON.stringify({
      token: token,
      email: result?.email,
      name: result?.name,
      ID: result?.id
    })
    router.push('/')

  } catch (err) {
    console.error('登入失敗:', err);
  } finally {
    isLoading.value = false;
  }
};

// 添加表單欄位的驗證函數
const validateField = (field, value) => {
  if (field === 'email') {
    try {
      z.string().email('請輸入正確的電子郵件').parse(value);
      formErrors.value.email = undefined;
    } catch (error) {
      if (error instanceof z.ZodError) {
        formErrors.value.email = error.errors[ 0 ].message;
      }
    }
  }
  if (field === 'password') {
    try {
      z.string().min(1, '請輸入密碼').parse(value);
      formErrors.value.password = undefined;
    } catch (error) {
      if (error instanceof z.ZodError) {
        formErrors.value.password = error.errors[ 0 ].message;
      }
    }
  }
};

// 監聽表單欄位變化
watch(() => formData.value.email, (newVal) => {
  validateField('email', newVal);
});

watch(() => formData.value.password, (newVal) => {
  validateField('password', newVal);
});

onMounted(() => {
  if (userAccountInCookie.value) {
    formData.value.email = userAccountInCookie.value;
  }
})

</script>

<template>
  <div class="px-5 px-md-0 pt-18 pt-md-30">
    <div class="mb-10">
      <p class="mb-2 text-primary-100 fs-8 fs-md-7 fw-bold">
        享樂酒店，誠摯歡迎
      </p>
      <h1 class="text-neutral-0 fw-bold">
        立即開始旅程
      </h1>
    </div>

    <form class="mb-10" @submit.prevent="handleOnSubmit">
      <div class="mb-4 fs-8 fs-md-7">
        <label class="mb-2 text-neutral-0 fw-bold" for="email">
          電子信箱
        </label>
        <input id="email" class="form-control p-4 text-neutral-100 fw-medium border-neutral-40"
               v-model="formData.email" placeholder="請輸入信箱" type="email" :disabled="isLoading">
        <p class="text-danger fw-bold pt-2" v-if="formData.email && formErrors.email">{{
          formErrors.email
          }}</p>
      </div>
      <div class="mb-4 fs-8 fs-md-7">
        <label class="mb-2 text-neutral-0 fw-bold" for="password">
          密碼
        </label>
        <input id="password" class="form-control p-4 text-neutral-100 fw-medium border-neutral-40"
               v-model="formData.password" placeholder="請輸入密碼" type="password"
               :disabled="isLoading">
      </div>
      <div class="d-flex justify-content-between align-items-center mb-10 fs-8 fs-md-7">
        <div class="form-check d-flex align-items-end gap-2 text-neutral-0">
          <input id="remember" class="form-check-input" type="checkbox"
                 :checked="userAccountInCookie" @change="handleRememberMe" :disabled="isLoading">
          <label class="form-check-label fw-bold" for="remember">
            記住帳號
          </label>
        </div>
        <button class="text-primary-100 fw-bold text-decoration-underline bg-transparent border-0"
                type="button">
          忘記密碼？
        </button>
      </div>
      <button class="btn btn-primary-100 w-100 py-4 text-neutral-0 fw-bold" type="submit"
              :disabled="isLoading || !isFormValid">
        會員登入
      </button>
    </form>

    <p class="mb-0 fs-8 fs-md-7">
      <span class="me-2 text-neutral-0 fw-medium">沒有會員嗎？</span>
      <NuxtLink to="signup" :disabled="isLoading"
                class="text-primary-100 fw-bold text-decoration-underline bg-transparent border-0">
        <span>前往註冊</span>
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
</style>
