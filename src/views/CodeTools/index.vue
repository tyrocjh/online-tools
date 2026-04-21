<template>
  <ToolPageLayout
    :title="t('codeFormatter.title')"
    :description="t('codeFormatter.description')"
    :toolbar="true"
  >
    <!-- 工具栏 -->
    <template #toolbar>
      <div class="toolbar">
        <div class="toolbar-left">
          <!-- 语言选择 -->
          <LanguageSelector
            :languages="languages"
            :currentLanguage="currentLanguage"
            @select="selectLanguage"
          />

          <!-- 分隔符 -->
          <span class="separator">|</span>

          <!-- 操作按钮 -->
          <div class="action-btns">
            <ActionButton
              primary
              :text="t('codeFormatter.format')"
              :icon="AlignLeft"
              @click="formatCode"
            />
            <ActionButton
              :text="t('codeFormatter.compress')"
              :icon="Minimize2"
              @click="compressCode"
            />
            <ActionButton
              :text="isCopied ? '已复制' : t('codeFormatter.copy')"
              :icon="isCopied ? Check : Copy"
              @click="copyResult"
            />
            <ActionButton
              :text="t('codeFormatter.clear')"
              :icon="Trash2"
              @click="clearAll"
            />
          </div>
        </div>
        <!-- 缩进设置 -->
        <div class="indent-setting">
          <select v-model="indentSize" class="input-field setting-select">
            <option value="2">2 {{ t("codeFormatter.spaces") }}</option>
            <option value="4">4 {{ t("codeFormatter.spaces") }}</option>
            <option value="tab">Tab</option>
          </select>
        </div>
      </div>
    </template>

    <!-- 输入输出区域 -->
    <div class="io-container">
      <!-- 输入框 -->
      <Panel :title="t('codeFormatter.input')">
        <textarea
          v-model="inputCode"
          class="code-textarea"
          :placeholder="t('codeFormatter.inputPlaceholder')"
          spellcheck="false"
        ></textarea>
      </Panel>

      <!-- 输出框 -->
      <Panel :title="t('codeFormatter.output')">
        <textarea
          v-model="outputCode"
          class="code-textarea output"
          readonly
          :placeholder="t('codeFormatter.outputPlaceholder')"
          spellcheck="false"
        ></textarea>
      </Panel>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useTranslation } from "@/utils/i18n";
import { Minimize2, Copy, Trash2, AlignLeft, Check } from "lucide-vue-next";

const { t } = useTranslation();

// 当前选中的语言
const currentLanguage = ref("javascript");

// 缩进大小
const indentSize = ref("2");

// 输入输出代码
const inputCode = ref("");
const outputCode = ref("");

// 复制按钮状态
const isCopied = ref(false);

// 语言选项
const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
];

// 选择语言
const selectLanguage = (lang: string) => {
  currentLanguage.value = lang;
};

// 格式化代码
const formatCode = () => {
  if (!inputCode.value.trim()) {
    outputCode.value = "";
    return;
  }

  try {
    switch (currentLanguage.value) {
      case "javascript":
        outputCode.value = formatJavaScript(inputCode.value);
        break;
      case "html":
        outputCode.value = formatHTML(inputCode.value);
        break;
      case "css":
        outputCode.value = formatCSS(inputCode.value);
        break;
      default:
        outputCode.value = inputCode.value;
    }
  } catch (error) {
    outputCode.value = t("codeFormatter.formatError");
  }
};

// 压缩代码
const compressCode = () => {
  if (!inputCode.value.trim()) {
    outputCode.value = "";
    return;
  }

  try {
    switch (currentLanguage.value) {
      case "javascript":
        outputCode.value = compressJavaScript(inputCode.value);
        break;
      case "html":
        outputCode.value = compressHTML(inputCode.value);
        break;
      case "css":
        outputCode.value = compressCSS(inputCode.value);
        break;
      default:
        outputCode.value = inputCode.value.replace(/\s+/g, " ").trim();
    }
  } catch (error) {
    outputCode.value = t("codeFormatter.compressError");
  }
};

// HTML格式化
const formatHTML = (code: string): string => {
  let formatted = "";
  let indent = 0;
  const lines = code.split(/>(\s*)</g);
  const indentChar =
    indentSize.value === "tab"
      ? "\t"
      : " ".repeat(parseInt(indentSize.value) || 2);

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("/")) {
      indent = Math.max(0, indent - 1);
    }

    formatted +=
      indentChar.repeat(indent) +
      (i > 0 ? "<" : "") +
      line +
      (i < lines.length - 1 ? ">" : "") +
      "\n";

    if (
      !line.startsWith("/") &&
      !line.endsWith("/") &&
      !line.startsWith("!--")
    ) {
      indent++;
    }
  }

  return formatted.trim();
};

// CSS格式化
const formatCSS = (code: string): string => {
  const indentChar =
    indentSize.value === "tab"
      ? "\t"
      : " ".repeat(parseInt(indentSize.value) || 2);
  return code
    .replace(/\s*{\s*/g, " {\n" + indentChar)
    .replace(/;\s*/g, ";\n" + indentChar)
    .replace(/\s*}\s*/g, "\n}\n")
    .replace(/,\s*/g, ", ")
    .trim();
};

// JavaScript格式化
const formatJavaScript = (code: string): string => {
  const indentChar =
    indentSize.value === "tab"
      ? "\t"
      : " ".repeat(parseInt(indentSize.value) || 2);
  try {
    // 简单的JS格式化
    let formatted = code
      .replace(/;\s*/g, ";\n")
      .replace(/{\s*/g, " {\n" + indentChar)
      .replace(/}\s*/g, "\n}\n")
      .replace(/,\s*/g, ", ");

    return formatted.trim();
  } catch {
    return code;
  }
};

// HTML压缩
const compressHTML = (code: string): string => {
  return code
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();
};

// CSS压缩
const compressCSS = (code: string): string => {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/;\s*}/g, "}")
    .replace(/\s*{\s*/g, "{")
    .replace(/;\s*/g, ";")
    .trim();
};

// JavaScript压缩
const compressJavaScript = (code: string): string => {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/\s+/g, " ")
    .trim();
};

// 复制结果
const copyResult = async () => {
  if (!outputCode.value) return;

  try {
    await navigator.clipboard.writeText(outputCode.value);
    isCopied.value = true;
    // 2秒后重置状态
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error("复制失败:", err);
  }
};

// 清空所有
const clearAll = () => {
  inputCode.value = "";
  outputCode.value = "";
};
</script>

<style scoped lang="scss">
.io-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .io-container {
    grid-template-columns: 1fr;
  }
}
</style>
