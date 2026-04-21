import ToolPageLayout from "./ToolPageLayout.vue";
import ActionButton from "./ActionButton.vue";
import LanguageSelector from "./LanguageSelector.vue";
import InputGroup from "./InputGroup.vue";
import ResultItem from "./ResultItem.vue";
import Panel from "./Panel.vue";
import FileUploadArea from "./FileUploadArea.vue";

export {
  ToolPageLayout,
  ActionButton,
  LanguageSelector,
  InputGroup,
  ResultItem,
  Panel,
  FileUploadArea
};

export default {
  install(app: any) {
    app.component('ToolPageLayout', ToolPageLayout);
    app.component('ActionButton', ActionButton);
    app.component('LanguageSelector', LanguageSelector);
    app.component('InputGroup', InputGroup);
    app.component('ResultItem', ResultItem);
    app.component('Panel', Panel);
    app.component('FileUploadArea', FileUploadArea);
  }
};