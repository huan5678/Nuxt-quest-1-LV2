<script setup>
import {Icon} from '@iconify/vue';
const {logout} = useAuth();
const auth = useAuth();
const route = useRoute();
const transparentBgRoute = [ 'index', 'rooms' ];

const isTransparentRoute = computed(() => transparentBgRoute.includes(route.name));
const userId = computed(() => auth.user.value?._id);
const isLoggedIn = computed(() => auth.isLoggedIn.value);

// 使用 useCookie 獲取用戶數據
const userData = useCookie('userData');
const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
})

// 登出處理
const handleLogout = () => {
  logout();
}
</script>

<template>
  <ClientOnly>
    <header :class="{
      'scrolled': isScrolled,
      'bg-transparent': isTransparentRoute,
      'bg-neutral-120': !isTransparentRoute
}" class="position-fixed top-0 z-3 w-100">
      <nav class="navbar navbar-expand-md p-0 px-3 py-4 px-md-20 py-md-6">
        <div class="container-fluid justify-content-between p-0">
          <NuxtLink class="navbar-brand p-0" to="/">
            <img src="@/assets/images/logo-white.svg" alt="logo" class="logo img-fluid">
          </NuxtLink>
          <button class="navbar-toggler collapsed p-2 text-white border-0 shadow-none" type="button"
                  data-bs-toggle="collapse" data-bs-target="#navbar" aria-controls="navbar"
                  aria-expanded="false" aria-label="Toggle navigation">
            <Icon class="fs-1" icon="mdi:close" />
            <Icon class="fs-5" icon="mdi:menu" />
          </button>
          <div id="navbar" class="collapse navbar-collapse">
            <ul class="navbar-nav gap-4 ms-auto fw-bold">
              <li class="nav-item">
                <NuxtLink :to="{
                  name: 'rooms'
                }" class="nav-link p-4 text-neutral-0">
                  客房旅宿
                </NuxtLink>
              </li>

              <!-- 已登入狀態 -->
              <template v-if="isLoggedIn">
                <li class="d-none d-md-block nav-item">
                  <div class="btn-group">
                    <button type="button" class="nav-link d-flex gap-2 p-4 text-neutral-0"
                            data-bs-toggle="dropdown">
                      <Icon class="fs-5" icon="mdi:account-circle-outline" />
                      {{ userData?.name || '使用者' }}
                    </button>
                    <ul class="dropdown-menu py-3 overflow-hidden"
                        style="right: 0; left: auto; border-radius: 20px;">
                      <li>
                        <NuxtLink :to="`/user/${userId}/profile`" class="dropdown-item px-6 py-4">
                          我的帳戶
                        </NuxtLink>
                      </li>
                      <li>
                        <button @click="handleLogout" class="dropdown-item px-6 py-4">
                          登出
                        </button>
                      </li>
                    </ul>
                  </div>
                </li>
                <li class="d-md-none nav-item">
                  <button @click="handleLogout"
                          class="nav-link p-4 text-neutral-0 border-0 bg-transparent">
                    登出
                  </button>
                </li>
              </template>

              <!-- 未登入狀態 -->
              <template v-else>
                <li class="nav-item">
                  <NuxtLink to="/account/login" class="nav-link p-4 text-neutral-0">
                    會員登入
                  </NuxtLink>
                </li>
              </template>

              <li class="nav-item">
                <NuxtLink :to="{
                  name: 'rooms'
                }" class="btn btn-primary-100 px-8 py-4 text-white fw-bold border-0 rounded-3">
                  立即訂房
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  </ClientOnly>
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

.logo {
  max-width: 27vw;
}

header {
  transition: background-color .3s;
}

header.scrolled {
  background-color: #000 !important;
}

@include media-breakpoint-down(md) {
  .navbar-toggler {
    z-index: 1;
    visibility: hidden;

    svg {
      transition: opacity .3s;
    }

    svg:nth-child(1) {
      position: absolute;
      top: 28px;
      right: 28px;
      opacity: 1;
      visibility: visible;
    }
    svg:nth-child(2) {
      opacity: 0;
      visibility: hidden;
    }
  }
  .navbar-toggler.collapsed {
    svg:nth-child(1) {
      opacity: 0;
      visibility: hidden;
    }
    svg:nth-child(2) {
      opacity: 1;
      visibility: visible;
    }
  }

  .navbar-collapse {
    min-height: 100vh;
    background-color: #140f0a;
    position: fixed;
    inset: 0;
    opacity: 0;
    overflow: hidden;
    transition: opacity .05s;
  }
  .navbar-collapse.show {
    opacity: 1;
  }
  .navbar-nav {
    height: 100%;
    justify-content: center;
    align-items: center;
    text-align: center;

    a {
      width: 90vw;
    }
  }
}

.dropdown-menu {
  --bs-dropdown-min-width: 16rem;
  --bs-dropdown-link-hover-color: #BF9D7D;
  --bs-dropdown-link-hover-bg: #F7F2EE;
  --bs-dropdown-link-active-color: #fff;
  --bs-dropdown-link-active-bg: #BF9D7D;
}


</style>
