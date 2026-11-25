# Установка Main Page (Firefox)

## Быстрая установка (временная, сбрасывается при перезапуске браузера)

1. Открой `about:debugging#/runtime/this-firefox`
2. Нажми **"Загрузить временное дополнение…"**
3. Выбери файл `main-page@local/manifest.json` (НЕ xpi, а именно manifest из папки!)
   - Или скачай XPI: https://github.com/nicccita/ROUTER/releases/download/v1.0/main-page-1.0.xpi
   - Переименуй `.xpi` → `.zip`, распакуй, выбери `manifest.json` из распакованной папки

## Постоянная установка

### Вариант A: Firefox Developer Edition / Nightly / ESR
1. Открой `about:config`
2. Поставь `xpinstall.signatures.required` = `false`
3. Перетащи `dist/main-page-1.0.xpi` в окно браузера или открой через `about:addons` → шестерёнка → "Установить из файла"

### Вариант B: Обычный Firefox — подпись через AMO (бесплатно)
```bash
pip install web-ext
web-ext sign --source-dir main-page@local --api-key <JWT> --api-secret <secret>
```
Полученный подписанный `.xpi` ставится без ограничений.

## Важно после установки
- ID расширения сменился: `kirill-router@local` → `main-page@local`. Удали старую версию из `about:addons`.
- Нативный хост тоже нужно переименовать: файл манифеста хоста `kirill_router.json` → `main_page.json` в папке native-messaging-hosts профиля Firefox, и обнови `"name"` внутри него на `main_page`.
