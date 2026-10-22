---
name: demo-skill
description: Skill de exemplo para testar a região ✅/❌ do check CONSTITUTION.
---

# Demo

```javascript
// ✅ correto
var MyWidget = SuperWidget.extend({
  init: function() {
    var ctx = this;
    const t = "${i18n.getTranslation('ok')}";
  }
});

// ❌ errado — fora da região ✅, não deve ser reportado
var Wrong = SuperWidget.extend({
  init() {
    const t = "[=i18n.getTranslation('bad')]";
  }
});
```
