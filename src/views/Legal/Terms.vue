<template>
  <div class="terms-page">
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
        <h2 class="hero-title">{{ t("terms.title") }}</h2>
        <p class="hero-subtitle">{{ t("terms.subtitle") }}</p>
      </section>

      <section class="terms-content">
        <h3 class="section-title">{{ t("terms.acceptance") }}</h3>
        <p class="section-content">{{ t("terms.acceptanceContent") }}</p>

        <h3 class="section-title">{{ t("terms.useLicense") }}</h3>
        <p class="section-content">{{ t("terms.useLicenseContent") }}</p>

        <h3 class="section-title">{{ t("terms.prohibitedUses") }}</h3>
        <p class="section-content">{{ t("terms.prohibitedUsesContent") }}</p>
        <ul class="prohibited-list">
          <li>{{ t("terms.prohibited1") }}</li>
          <li>{{ t("terms.prohibited2") }}</li>
          <li>{{ t("terms.prohibited3") }}</li>
          <li>{{ t("terms.prohibited4") }}</li>
          <li>{{ t("terms.prohibited5") }}</li>
        </ul>

        <h3 class="section-title">{{ t("terms.intellectualProperty") }}</h3>
        <p class="section-content">
          {{ t("terms.intellectualPropertyContent") }}
        </p>

        <h3 class="section-title">{{ t("terms.disclaimer") }}</h3>
        <p class="section-content">{{ t("terms.disclaimerContent") }}</p>

        <h3 class="section-title">{{ t("terms.limitation") }}</h3>
        <p class="section-content">{{ t("terms.limitationContent") }}</p>

        <h3 class="section-title">{{ t("terms.changes") }}</h3>
        <p class="section-content">{{ t("terms.changesContent") }}</p>

        <h3 class="section-title">{{ t("terms.governingLaw") }}</h3>
        <p class="section-content">{{ t("terms.governingLawContent") }}</p>

        <h3 class="section-title">{{ t("terms.contact") }}</h3>
        <p class="section-content">{{ t("terms.contactContent") }}</p>
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
.terms-page {
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
      font-size: 20px;
      font-weight: bold;
      color: var(--text-primary);
      margin: 40px 0 15px;
    }

    .section-content {
      font-size: 16px;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .prohibited-list {
      font-size: 16px;
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0 0 30px 20px;

      li {
        margin-bottom: 10px;
      }
    }

    .contact-email {
      font-size: 16px;
      color: var(--text-primary);
      margin: 0;
    }
  }

  .footer {
    border-top: 1px solid #eaeaea;
    padding: 30px 0;
    margin-top: 60px;

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
  .terms-page {
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
        font-size: 18px;
        margin: 30px 0 10px;
      }

      .section-content {
        font-size: 14px;
      }

      .prohibited-list {
        font-size: 14px;
        margin: 0 0 20px 15px;

        li {
          margin-bottom: 8px;
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
