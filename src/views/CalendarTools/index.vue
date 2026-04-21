<template>
  <ToolPageLayout
    :title="t('calendar.title')"
    :description="t('calendar.description')"
  >
    <div class="calendar-container">
      <!-- 日历主体 -->
      <div class="calendar-main">
        <!-- 月份导航 -->
        <div class="calendar-header">
          <button class="nav-btn" @click="prevMonth" :disabled="isLoading">
            <ChevronLeft />
          </button>
          <div class="date-selector">
            <select
              v-model="selectedYear"
              @change="updateCalendar"
              class="year-select"
            >
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
            <select
              v-model="selectedMonth"
              @change="updateCalendar"
              class="month-select"
            >
              <option
                v-for="(month, index) in months"
                :key="index"
                :value="index"
              >
                {{ month }}
              </option>
            </select>
          </div>
          <button class="nav-btn" @click="nextMonth" :disabled="isLoading">
            <ChevronRight />
          </button>
        </div>

        <!-- 星期标题 -->
        <div class="week-header">
          <div v-for="day in weekDays" :key="day" class="week-day">
            {{ day }}
          </div>
        </div>

        <!-- 日期网格 -->
        <div class="calendar-grid">
          <div
            v-for="(date, index) in calendarDays"
            :key="index"
            :class="{
              'calendar-day': true,
              'other-month': date.isOtherMonth,
              today: date.isToday,
              selected:
                date.date && date.date.getTime() === selectedDate.getTime(),
              weekend: date.date && isWeekend(date.date),
            }"
            @click="date.date && selectDate(date.date)"
          >
            <div v-if="date.day" class="date-number">{{ date.day }}</div>
            <div v-if="date.lunar" class="lunar-date">{{ date.lunar }}</div>
          </div>
        </div>

        <!-- 今天按钮 -->
        <div class="today-btn-container">
          <button class="today-btn" @click="goToToday" :disabled="isLoading">
            <CalendarDays />
            {{ t("calendar.today") }}
          </button>
        </div>
      </div>

      <!-- 日期详情 -->
      <div class="date-details">
        <h3>{{ t("calendar.details") }}</h3>
        <div class="details-grid">
          <ResultItem
            :label="t('calendar.gregorian')"
            :value="selectedDateGregorian"
          />
          <ResultItem
            :label="t('calendar.weekday')"
            :value="selectedDateWeekday"
          />
          <ResultItem :label="t('calendar.lunar')" :value="selectedDateLunar" />
          <ResultItem
            :label="t('calendar.distance')"
            :value="selectedDateDistance"
          />
          <ResultItem
            :label="t('calendar.weekNumber')"
            :value="selectedDateWeekNumber"
          />
          <ResultItem
            :label="t('calendar.timestamp')"
            :value="selectedDateTimestamp"
          />
        </div>
      </div>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useTranslation } from "@/utils/i18n";
import ResultItem from "@/components/common/ResultItem.vue";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-vue-next";

const { t } = useTranslation();

// 状态
const selectedDate = ref(new Date());
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth());
const isLoading = ref(false);

// 年份范围（前后10年）
const currentYear = new Date().getFullYear();
const years = ref(Array.from({ length: 21 }, (_, i) => currentYear - 10 + i));

// 月份
const months = ref([
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
]);

// 星期
const weekDays = ref(["日", "一", "二", "三", "四", "五", "六"]);

// 计算日历天数
const calendarDays = computed(() => {
  const days = [];
  const year = selectedYear.value;
  const month = selectedMonth.value;

  // 当月第一天
  const firstDay = new Date(year, month, 1);
  // 当月最后一天
  const lastDay = new Date(year, month + 1, 0);
  // 当月第一天是星期几
  const firstDayOfWeek = firstDay.getDay();
  // 当月天数
  const daysInMonth = lastDay.getDate();

  // 先填充空白，使第一天正确对齐
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({
      date: null,
      day: null,
      lunar: "",
      isOtherMonth: true,
      isToday: false,
    });
  }

  // 填充当月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      day: i,
      lunar: getLunarDate(date),
      isOtherMonth: false,
      isToday: isSameDay(date, new Date()),
    });
  }

  return days;
});

// 计算选中日期的详情
const selectedDateGregorian = computed(() => {
  const date = selectedDate.value;
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
});

const selectedDateWeekday = computed(() => {
  const date = selectedDate.value;
  return `星期${weekDays.value[date.getDay()]}`;
});

const selectedDateLunar = computed(() => {
  return getLunarDate(selectedDate.value);
});

const selectedDateDistance = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(selectedDate.value);
  selected.setHours(0, 0, 0, 0);

  const diffTime = selected.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return t("calendar.today");
  } else if (diffDays > 0) {
    return `未来${diffDays}天`;
  } else {
    return `过去${Math.abs(diffDays)}天`;
  }
});

const selectedDateWeekNumber = computed(() => {
  const date = selectedDate.value;
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return `第${Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)}周`;
});

const selectedDateTimestamp = computed(() => {
  const date = new Date(selectedDate.value);
  date.setHours(0, 0, 0, 0);
  return Math.floor(date.getTime() / 1000).toString();
});

// 公历节假日映射表
const solarHolidays: Record<string, string> = {
  "01-01": "元旦",
  "02-14": "情人节",
  "05-01": "劳动节",
  "06-01": "儿童节",
  "09-10": "教师节",
  "10-01": "国庆节",
  "12-25": "圣诞节",
};

// 农历节假日映射表
const lunarHolidays: Record<string, string> = {
  "01-01": "春节", // 正月初一
  "01-15": "元宵节", // 正月十五
  "05-05": "端午节", // 五月初五
  "08-15": "中秋节", // 八月十五
  "09-09": "重阳节", // 九月初九
};

// 农历日期格式化函数
const formatLunarDay = (day: number): string => {
  const dayNames = [
    "初一",
    "初二",
    "初三",
    "初四",
    "初五",
    "初六",
    "初七",
    "初八",
    "初九",
    "初十",
    "十一",
    "十二",
    "十三",
    "十四",
    "十五",
    "十六",
    "十七",
    "十八",
    "十九",
    "二十",
    "廿一",
    "廿二",
    "廿三",
    "廿四",
    "廿五",
    "廿六",
    "廿七",
    "廿八",
    "廿九",
    "三十",
  ];
  return dayNames[day - 1] || "";
};

// 获取农历日期
const getLunarDate = (date: Date): string => {
  try {
    // 检查是否是公历节假日
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateKey = `${month}-${day}`;

    if (solarHolidays[dateKey]) {
      return solarHolidays[dateKey];
    }

    // 检查是否是农历节假日
    const lunarFormatter = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      month: "numeric",
      day: "numeric",
    });
    const lunarDate = lunarFormatter.format(date);
    const [lunarMonth, lunarDay] = lunarDate.split("-");
    const lunarDateKey = `${lunarMonth.padStart(2, "0")}-${lunarDay.padStart(2, "0")}`;

    if (lunarHolidays[lunarDateKey]) {
      return lunarHolidays[lunarDateKey];
    }

    // 如果不是节假日，显示农历日期（初一、初二等格式）
    const dayFormatter = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      day: "numeric",
    });
    const lunarDayStr = dayFormatter.format(date);
    const lunarDayNum = parseInt(lunarDayStr, 10);
    return formatLunarDay(lunarDayNum);
  } catch (error) {
    // 如果浏览器不支持农历，返回空字符串
    return "";
  }
};

// 判断是否是同一天
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// 判断是否是周末
const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

// 上一个月
const prevMonth = () => {
  if (selectedMonth.value === 0) {
    selectedMonth.value = 11;
    selectedYear.value--;
  } else {
    selectedMonth.value--;
  }
  updateCalendar();
};

// 下一个月
const nextMonth = () => {
  if (selectedMonth.value === 11) {
    selectedMonth.value = 0;
    selectedYear.value++;
  } else {
    selectedMonth.value++;
  }
  updateCalendar();
};

// 跳转到今天
const goToToday = () => {
  const today = new Date();
  selectedYear.value = today.getFullYear();
  selectedMonth.value = today.getMonth();
  selectedDate.value = today;
  updateCalendar();
};

// 选择日期
const selectDate = (date: Date) => {
  selectedDate.value = date;
};

// 更新日历
const updateCalendar = () => {
  // 可以在这里添加加载状态
};

// 初始化
onMounted(() => {
  updateCalendar();
});
</script>

<style scoped lang="scss">
.calendar-container {
  display: grid;
  grid-template-columns: 1fr 250px;
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;

  .calendar-main {
    background-color: white;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .calendar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .nav-btn {
        width: 24px;
        height: 24px;
        border: 1px solid var(--border-light-color);
        border-radius: 4px;
        background-color: var(--bg-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        &:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        svg {
          width: 12px;
          height: 12px;
        }
      }

      .date-selector {
        display: flex;
        gap: 6px;

        select {
          padding: 3px 6px;
          border: 1px solid var(--border-light-color);
          border-radius: 4px;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          font-size: 12px;

          &:focus {
            outline: none;
            border-color: var(--primary-color);
          }
        }
      }
    }

    .week-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      margin-bottom: 6px;

      .week-day {
        text-align: center;
        font-size: 11px;
        font-weight: 500;
        color: var(--text-secondary);
        padding: 4px 0;
      }
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;

      .calendar-day {
        position: relative;
        aspect-ratio: 1;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background-color: var(--bg-primary);
        }

        &.other-month {
          opacity: 0.3;
        }

        &.today {
          background-color: var(--primary-color);
          color: white;

          .lunar-date {
            color: rgba(255, 255, 255, 0.8);
          }
        }

        &.selected {
          background-color: #e3f2fd;
          border: 2px solid var(--primary-color);
        }

        &.weekend {
          color: #ff5722;

          &.today {
            color: white;
          }
        }

        .date-number {
          font-weight: 800;
          margin-bottom: 1px;
        }

        .lunar-date {
          font-size: 10px;
          color: var(--text-secondary);
        }
      }
    }

    .today-btn-container {
      display: flex;
      justify-content: center;
      margin-top: 12px;

      .today-btn {
        display: flex;
        align-items: center;
        gap: 3px;
        padding: 4px 10px;
        border: 1px solid var(--border-light-color);
        border-radius: 20px;
        background-color: var(--bg-primary);
        color: var(--text-primary);
        font-size: 11px;
        cursor: pointer;

        &:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        svg {
          width: 10px;
          height: 10px;
        }
      }
    }
  }

  .date-details {
    background-color: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    h3 {
      font-size: 14px;
      font-weight: bold;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    .details-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
      ::v-deep {
        font-weight: 700;
      }
    }
  }
}

@media (max-width: 768px) {
  .calendar-container {
    grid-template-columns: 1fr;
    padding: 16px;

    .calendar-main {
      padding: 16px;

      .calendar-grid {
        gap: 4px;

        .calendar-day {
          .lunar-date {
            font-size: 10px;
          }
        }
      }
    }
  }
}
</style>
