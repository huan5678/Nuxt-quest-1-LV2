<script setup>
import {citys, zipcodes} from '@/assets/data/cityData';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      city: '臺北市',
      county: '信義區',
      zipcode: 0
    })
  }
});
const emit = defineEmits([ 'update:modelValue' ]);

// 計算當前選擇城市的區域列表
const currentZones = computed(() => {
  const cityData = zipcodes.find(item => item.city === props.modelValue.city);
  return cityData ? cityData.zone.map(z => z.county) : [];
});

// 更新城市
const updateCity = (newCity) => {
  const cityData = zipcodes.find(item => item.city === newCity);
  if (cityData && cityData.zone.length > 0) {
    emit('update:modelValue', {
      city: newCity,
      county: cityData.zone[ 0 ].county,
      zipcode: cityData.zone[ 0 ].zipcode
    });
  }
};

// 更新區域
const updateCounty = (newCounty) => {
  const cityData = zipcodes.find(item => item.city === props.modelValue.city);
  if (cityData) {
    const zoneData = cityData.zone.find(z => z.county === newCounty);
    if (zoneData) {
      emit('update:modelValue', {
        ...props.modelValue,
        county: newCounty,
        zipcode: zoneData.zipcode
      });
    }
  }
};

</script>
<template>
  <div class="d-flex gap-2 mb-4">
    <select class="form-select p-4 text-neutral-80 fw-medium rounded-3" :value="modelValue.city"
            @change="updateCity($event.target.value)">
      <option v-for="city in citys" :key="city" :value="city">
        {{ city }}
      </option>
    </select>

    <select class="form-select p-4 text-neutral-80 fw-medium rounded-3" :value="modelValue.county"
            @change="updateCounty($event.target.value)">
      <option v-for="zone in currentZones" :key="zone" :value="zone">
        {{ zone }}
      </option>
    </select>
  </div>
</template>
