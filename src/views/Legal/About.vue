<template>
  <div class="about-page">
    <!-- 头部 -->
    <header class="header">
      <div class="header-content">
        <router-link to="/" class="app-name-link">
          <h1 class="app-name">{{ t("common.appName") }}</h1>
        </router-link>
        <LanguageSelector />
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="main-content">
      <section class="hero">
        <h2 class="hero-title">{{ t("about.title") }}</h2>
        <p class="hero-subtitle">{{ t("about.subtitle") }}</p>
      </section>

      <section class="our-values">
        <h3 class="section-title">{{ t("about.ourValues") }}</h3>
        <div class="values-grid">
          <div class="value-card">
            <div class="value-icon">🔒</div>
            <h4 class="value-title">{{ t("about.privacyFirst") }}</h4>
            <p class="value-content">{{ t("about.privacyFirstContent") }}</p>
          </div>
          <div class="value-card">
            <div class="value-icon">⚡</div>
            <h4 class="value-title">{{ t("about.fastAndSimple") }}</h4>
            <p class="value-content">{{ t("about.fastAndSimpleContent") }}</p>
          </div>
          <div class="value-card">
            <div class="value-icon">🔧</div>
            <h4 class="value-title">{{ t("about.richTools") }}</h4>
            <p class="value-content">{{ t("about.richToolsContent") }}</p>
          </div>
          <div class="value-card">
            <div class="value-icon">🌐</div>
            <h4 class="value-title">{{ t("about.availableEverywhere") }}</h4>
            <p class="value-content">
              {{ t("about.availableEverywhereContent") }}
            </p>
          </div>
        </div>
      </section>

      <section class="contact-us">
        <h3 class="section-title">{{ t("about.contactUs") }}</h3>
        <p class="section-content">{{ t("about.contactUsContent") }}</p>
        <p class="contact-email">{{ t("about.email") }}: tyrocccc@gmail.com</p>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <router-link to="/about" class="footer-link">{{
            t("about.title")
          }}</router-link>
          <router-link to="/privacy" class="footer-link">{{
            t("privacy.title")
          }}</router-link>
          <router-link to="/terms" class="footer-link">{{
            t("terms.title")
          }}</router-link>
        </div>
        <p class="footer-copyright">&copy; 2026 Tyro. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from "@/utils/i18n";
import LanguageSelector from "@/components/common/LanguageSelector.vue";

// 使用翻译钩子
const { t } = useTranslation();
</script>

<style scoped lang="scss">
.about-page {
  display: flex;
  flex-direction: column;

  .header {
    border-bottom: 1px solid #eaeaea;
    padding: 20px 0;

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .app-name-link {
        text-decoration: none;
        color: var(--text-primary);

        &:hover {
          color: var(--primary-color);
        }

        .app-name {
          font-size: 20px;
          font-weight: bold;
          margin: 0;
        }
      }
    }
  }

  .main-content {
    flex: 1;
    max-width: 1000px;
    margin: 0 auto;
    padding: 60px 20px;

    .hero {
      text-align: center;
      margin-bottom: 60px;

      .hero-title {
        font-size: 36px;
        font-weight: bold;
        color: var(--text-primary);
        margin-bottom: 10px;
      }

      .hero-subtitle {
        font-size: 18px;
        color: var(--text-secondary);
        margin: 0;
      }
    }

    .section-title {
      font-size: 24px;
      font-weight: bold;
      color: var(--text-primary);
      margin-bottom: 20px;
    }

    .section-content {
      font-size: 16px;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 40px;
    }

    .who-we-are {
      margin-bottom: 60px;
    }

    .our-values {
      margin-bottom: 60px;

      .values-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 30px;

        .value-card {
          background-color: var(--bg-secondary);
          border-radius: 12px;
          padding: 30px;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          }

          .value-icon {
            font-size: 32px;
            margin-bottom: 15px;
          }

          .value-title {
            font-size: 18px;
            font-weight: bold;
            color: var(--text-primary);
            margin-bottom: 10px;
          }

          .value-content {
            font-size: 14px;
            color: var(--text-secondary);
            line-height: 1.5;
            margin: 0;
          }
        }
      }
    }

    .contact-us {
      margin-bottom: 60px;

      .contact-email {
        font-size: 16px;
        color: var(--text-primary);
        margin: 0;
      }
    }
  }

  .footer {
    border-top: 1px solid #eaeaea;
    padding: 30px 0;

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      text-align: center;

      .footer-links {
        display: flex;
        justify-content: center;
        gap: 30px;
        margin-bottom: 20px;

        .footer-link {
          font-size: 14px;
          color: var(--text-secondary);
          text-decoration: none;

          &:hover {
            color: var(--primary-color);
          }
        }
      }

      .footer-copyright {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .about-page {
    .main-content {
      padding: 40px 20px;

      .hero {
        .hero-title {
          font-size: 28px;
        }

        .hero-subtitle {
          font-size: 16px;
        }
      }

      .section-title {
        font-size: 20px;
      }

      .section-content {
        font-size: 14px;
      }

      .our-values {
        .values-grid {
          grid-template-columns: 1fr;
          gap: 20px;

          .value-card {
            padding: 20px;

            .value-icon {
              font-size: 28px;
            }

            .value-title {
              font-size: 16px;
            }

            .value-content {
              font-size: 13px;
            }
          }
        }
      }
    }

    .footer {
      .footer-content {
        .footer-links {
          gap: 20px;

          .footer-link {
            font-size: 13px;
          }
        }

        .footer-copyright {
          font-size: 13px;
        }
      }
    }
  }
}
</style>
