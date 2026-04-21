<template>
  <div class="home">
    <div class="home-content">
      <div class="logo-container">
        <div class="logo-icon">
          <PenToolIcon />
        </div>
        <h1 class="app-name">{{ t("home.title") }}</h1>
      </div>
      <p class="app-description">
        {{ t("home.appDescription") }}
      </p>

      <div class="features">
        <div class="feature-item">{{ t("home.features.free") }}</div>
        <div class="feature-item">{{ t("home.features.noUpload") }}</div>
        <div class="feature-item">{{ t("home.features.unlimited") }}</div>
      </div>

      <div class="tools-grid">
        <!-- 代码格式化 -->
        <div class="tool-card">
          <router-link to="/code-tools" class="tool-card-link">
            <div class="tool-card-icon">
              <Code />
            </div>
            <h3 class="tool-card-title">{{ t("home.code") }}</h3>
            <p class="tool-card-desc">{{ t("home.codeFormatDesc") }}</p>
          </router-link>
        </div>

        <!-- 时间戳转换 -->
        <div class="tool-card">
          <router-link to="/time-tools" class="tool-card-link">
            <div class="tool-card-icon">
              <Clock />
            </div>
            <h3 class="tool-card-title">{{ t("home.time") }}</h3>
            <p class="tool-card-desc">{{ t("home.timestampDesc") }}</p>
          </router-link>
        </div>

        <!-- 图片压缩 -->
        <div class="tool-card">
          <router-link to="/image-tools" class="tool-card-link">
            <div class="tool-card-icon">
              <Image />
            </div>
            <h3 class="tool-card-title">{{ t("home.image") }}</h3>
            <p class="tool-card-desc">{{ t("home.imageCompressDesc") }}</p>
          </router-link>
        </div>
      </div>

      <div class="footer-links">
        <router-link to="/about" class="footer-link">{{
          t("home.footer.about")
        }}</router-link>
        <router-link to="/privacy" class="footer-link">{{
          t("home.footer.privacy")
        }}</router-link>
        <router-link to="/terms" class="footer-link">{{
          t("home.footer.terms")
        }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from "@/utils/i18n";
import { Code, Clock, Image, PenToolIcon } from "lucide-vue-next";

// 使用翻译钩子
const { t } = useTranslation();
// 首页组件
</script>

<style scoped lang="scss">
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 40px 20px;
  background-color: var(--bg-primary);

  .home-content {
    max-width: 800px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;

    .logo-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;

      .logo-icon {
        width: 80px;
        height: 80px;
        border-radius: 20px;
        background-color: var(--primary-color);
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);

        svg {
          width: 40px;
          height: 40px;
          color: white;
        }
      }

      .app-name {
        font-size: 28px;
        font-weight: bold;
        color: var(--text-primary);
        margin: 0;
      }
    }

    .app-description {
      font-size: 16px;
      color: var(--text-secondary);
      text-align: center;
      margin: 0;
      max-width: 600px;
    }

    .features {
      display: flex;
      gap: 20px;

      .feature-item {
        padding: 8px 16px;
        background-color: var(--bg-secondary);
        border-radius: 20px;
        font-size: 14px;
        color: var(--text-primary);
      }
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      width: 100%;
      max-width: 700px;

      .tool-card {
        background-color: var(--bg-secondary);
        border-radius: 12px;
        padding: 30px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .tool-card-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          text-decoration: none;
          color: var(--text-primary);
          width: 100%;

          .tool-card-icon {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            background-color: var(--primary-color);
            display: flex;
            justify-content: center;
            align-items: center;

            svg {
              width: 28px;
              height: 28px;
              color: #fff;
            }
          }

          .tool-card-title {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
            color: var(--text-primary);
            text-align: center;
          }

          .tool-card-desc {
            font-size: 14px;
            color: var(--text-secondary);
            text-align: center;
            margin: 0;
          }
        }
      }
    }

    .footer-links {
      display: flex;
      gap: 20px;
      margin-top: 20px;

      .footer-link {
        font-size: 14px;
        color: var(--text-secondary);
        text-decoration: none;

        &:hover {
          color: var(--primary-color);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .home {
    padding: 30px 15px;

    .home-content {
      gap: 20px;

      .logo-container {
        .logo-icon {
          width: 60px;
          height: 60px;
          background-color: var(--primary-color);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);

          svg {
            width: 30px;
            height: 30px;
          }
        }

        .app-name {
          font-size: 24px;
        }
      }

      .app-description {
        font-size: 14px;
      }

      .features {
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;

        .feature-item {
          font-size: 12px;
          padding: 6px 12px;
        }
      }

      .tools-grid {
        grid-template-columns: 1fr;
        gap: 15px;

        .tool-card {
          padding: 20px 15px;

          .tool-card-link {
            gap: 10px;

            .tool-card-icon {
              width: 50px;
              height: 50px;

              svg {
                width: 24px;
                height: 24px;
              }
            }

            .tool-card-title {
              font-size: 16px;
            }

            .tool-card-desc {
              font-size: 13px;
            }
          }
        }
      }

      .footer-links {
        flex-wrap: wrap;
        justify-content: center;
        gap: 15px;

        .footer-link {
          font-size: 13px;
        }
      }
    }
  }
}
</style>
