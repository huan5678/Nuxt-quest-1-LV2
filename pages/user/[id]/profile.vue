<script setup>

const auth = useAuth();

const isEditPassword = ref(false);
const isEditProfile = ref(false);

const userData = ref({
  userId: '',
  name: '',
  email: '',
  phone: '',
  birthday: {
    year: '',
    month: '',
    day: ''
  },
  address: {
    city: '',
    county: '',
    detail: ''
  },
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const user = computed(() => auth.user.value);
const handleUpdateProfile = () => {
  console.log('update profile');

}

const handleUpdatePassword = () => {
  console.log('update password');
}

onMounted(() => {
  if (user.value) {
    const birthday = new Date(user.value.birthday);
    const formatBirthday = formatDate(birthday);
    userData.value = {
      userId: user.value.id,
      name: user.value.name,
      email: user.value.email,
      phone: user.value.phone,
      birthday: {
        year: formatBirthday.split('-')[ 0 ],
        month: formatBirthday.split('-')[ 1 ],
        day: formatBirthday.split('-')[ 2 ],
      },
      address: user.value.address,
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  }
})


</script>

<template>
  <div v-if="user" class="row gap-6 gap-md-0">
    <div class="col-12 col-md-5">
      <section class="rounded-3xl d-flex flex-column gap-6 gap-md-10 p-6 p-md-10 bg-neutral-0">
        <h2 class="fs-6 fs-md-5 fw-bold">
          修改密碼
        </h2>
        <div class="d-flex flex-column gap-4 gap-md-6">
          <div class="fs-8 fs-md-7">
            <p class="mb-2 text-neutral-80 fw-medium">
              電子信箱
            </p>
            <span class="form-control pe-none p-0 text-neutral-100 fw-bold border-0">{{
              user.email }}</span>
          </div>

          <div class="d-flex justify-content-between align-items-center"
               :class="{ 'd-none': isEditPassword }">
            <div>
              <label class="mb-0 text-neutral-80 fs-8 fs-md-7 fw-medium">
                密碼
              </label>
              <input class="form-control pe-none p-0 text-neutral-100 fs-5 fs-md-3 fw-bold border-0"
                     type="password" value="**********">
            </div>

            <button class="flex-shrink-0 text-primary-100 fs-8 fs-md-7 fw-bold text-decoration-underline border-0 bg-transparent"
                    type="button" @click="isEditPassword = !isEditPassword">
              重設
            </button>
          </div>

          <div class="d-flex flex-column gap-4 gap-md-6" :class="{ 'd-none': !isEditPassword }">
            <div>
              <label for="oldPassword" class="form-label fs-8 fs-md-7 fw-bold">舊密碼</label>
              <input id="oldPassword" type="password" class="form-control p-4 fs-7 rounded-3"
                     placeholder="請輸入舊密碼" v-model="userData.oldPassword">
            </div>

            <div>
              <label for="newPassword" class="form-label fs-8 fs-md-7 fw-bold">新密碼</label>
              <input id="newPassword" type="password" class="form-control p-4 fs-7 rounded-3"
                     placeholder="請輸入新密碼" v-model="userData.newPassword">
            </div>

            <div>
              <label for="confirmPassword" class="form-label fs-8 fs-md-7 fw-bold">確認新密碼</label>
              <input id="confirmPassword" type="password" class="form-control p-4 fs-7 rounded-3"
                     placeholder="請再輸入一次新密碼" v-model="userData.confirmPassword">
            </div>
          </div>

          <button :class="{ 'd-none': !isEditPassword }"
                  class="btn btn-neutral-40 align-self-md-start px-8 py-4 text-neutral-60 rounded-3"
                  type="button">
            儲存設定
          </button>
        </div>
      </section>
    </div>

    <div class="col-12 col-md-7">
      <section class="rounded-3xl d-flex flex-column gap-6 gap-md-10 p-6 p-md-10 bg-neutral-0">
        <h2 class="fs-6 fs-md-5 fw-bold">
          基本資料
        </h2>
        <div class="d-flex flex-column gap-4 gap-md-6">
          <div class="fs-8 fs-md-7">
            <label class="form-label"
                   :class="{ 'fw-bold text-neutral-100': isEditProfile, 'fw-medium text-neutral-80': !isEditProfile }"
                   for="name">
              姓名
            </label>
            <input id="name" name="name" class="form-control text-neutral-100 fw-bold"
                   :class="{ 'pe-none p-0 border-0': !isEditProfile, 'p-4': isEditProfile }"
                   type="text" v-model="userData.name">
          </div>

          <div class="fs-8 fs-md-7">
            <label class="form-label"
                   :class="{ 'fw-bold text-neutral-100': isEditProfile, 'fw-medium text-neutral-80': !isEditProfile }"
                   for="phone">
              手機號碼
            </label>
            <input id="phone" name="phone" class="form-control text-neutral-100 fw-bold"
                   :class="{ 'pe-none p-0 border-0': !isEditProfile, 'p-4': isEditProfile }"
                   type="tel" v-model="userData.phone">
          </div>

          <div class="fs-8 fs-md-7">
            <label class="form-label"
                   :class="{ 'fw-bold text-neutral-100': isEditProfile, 'fw-medium text-neutral-80': !isEditProfile }"
                   for="birth">
              生日
            </label>
            <span class="form-control pe-none p-0 text-neutral-100 fw-bold border-0"
                  :class="{ 'd-none': isEditProfile }">{{ formateBirthday(user.birthday) }}</span>
            <div class="d-flex gap-2" :class="{ 'd-none': !isEditProfile }">
              <select id="birth" class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                      v-model="userData.birthday.year">
                <option v-for="year in 65" :key="year" value="`${year + 1958} 年`">
                  {{ year + 1958 }} 年
                </option>
              </select>
              <select class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                      v-model="userData.birthday.month">
                <option v-for="month in 12" :key="month" value="`${month} 月`">
                  {{ month }} 月
                </option>
              </select>
              <select class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                      v-model="userData.birthday.day">
                <option v-for="day in 30" :key="day" value="`${day} 日`">
                  {{ day }} 日
                </option>
              </select>
            </div>
          </div>

          <div class="fs-8 fs-md-7">
            <label class="form-label"
                   :class="{ 'fw-bold text-neutral-100': isEditProfile, 'fw-medium text-neutral-80': !isEditProfile }"
                   for="address">
              地址
            </label>
            <span class="form-control pe-none p-0 text-neutral-100 fw-bold border-0"
                  :class="{ 'd-none': isEditProfile }">{{ userData.address.city }} {{
                    userData.address.county }} {{
                userData.address.detail }}</span>
            <div :class="{ 'd-none': !isEditProfile }">
              <AddressSelector v-model="userData.address" />
              <input id="address" type="text" class="form-control p-4 rounded-3"
                     placeholder="請輸入詳細地址" v-model="userData.address.detail">
            </div>
          </div>
        </div>
        <button :class="{ 'd-none': isEditProfile }"
                class="btn btn-outline-primary-100 align-self-start px-8 py-4 rounded-3"
                type="button" @click="isEditProfile = !isEditProfile">
          編輯
        </button>

        <button :class="{ 'd-none': !isEditProfile }"
                class="btn btn-neutral-40 align-self-md-start px-8 py-4 text-neutral-60 rounded-3"
                type="button">
          儲存設定
        </button>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rounded-3xl {
  border-radius: 1.25rem;
}

input[type="password"] {
  font: small-caption;
}

.form-control::placeholder {
  --neutral-60: #909090;
  color: var(--neutral-60);
  font-weight: 500;
}
</style>
