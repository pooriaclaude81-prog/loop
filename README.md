# دستورات اورژانس · Emergency Orders

دستورات اورژانس بر اساس خوشه‌های بالینی، با سناریوی فارسی، شاخه‌های «اگر … وگرنه»، مراجع شماره‌دار و راهنمای مطالعه.
Emergency physician orders grouped by clinical cluster, with Farsi scenarios, IF / OTHERWISE branches, numbered references and study guides.

- **53 موضوع · 146 نسخه دستور · 9 دسته**
- فهرست سریع در بالای صفحه، جستجو، حالت تاریک، مناسب موبایل، قابل چاپ، و کار کردن بدون اینترنت پس از اولین باز شدن.
- هر صفحه: سناریو → دستورات (قابل تیک‌زدن) → شاخه‌ها → یادداشت‌های فارسی منبع → مراجع → **راهنمای مطالعه** (باز/بسته) → **جعبه نظر**.

> فقط برای مطالعه و مرور. جایگزین قضاوت بالینی و پروتکل بیمارستان نیست.
> Study and reference aid only. It does not replace clinical judgement or local protocols.

## منابع · Sources
- **A**: برگه دستورات پزشک، مرکز آموزشی درمانی بعثت (دانشگاه علوم پزشکی همدان).
- **B**: «کتابچه دستورات شایع در اورژانس»، دانشگاه علوم پزشکی اصفهان، زمستان ۱۳۹۸ (بر پایه Rosen 2018).
- مواردی که در هیچ‌کدام نبوده و از راهنماهای بالینی روز اضافه شده‌اند، با شماره مرجع **[n]** مشخص شده‌اند. فهرست مراجع در `content/references.md` است.

---

## اضافه کردن بیماری جدید (ساده‌ترین راه) · Add a condition

### راه ۱: صفحه ویرایشگر
1. صفحه `admin.html` را باز کنید (آدرس سایت + `/admin.html`).
2. متن را بنویسید؛ پیش‌نمایش و خطاها همان لحظه دیده می‌شوند.
3. دکمه **ذخیره در GitHub** را بزنید و در صفحه GitHub روی **Commit changes** کلیک کنید.
4. حدود یک دقیقه بعد (Action ساخت خودکار) در سایت دیده می‌شود.

### راه ۲: مستقیم در GitHub
1. به پوشه `content/topics` بروید → **Add file → Create new file**.
2. محتوای `content/_TEMPLATE.md` را کپی و تکمیل کنید. نام فایل دلخواه است (مثلاً `my-topic.md`).
3. Commit کنید.

### ویرایش بیماری موجود
فایل را در `content/topics/` باز کنید → آیکون مداد → ویرایش → Commit. (یا در `admin.html` از «شروع از» استفاده کنید.)

### قالب فایل · File format (خلاصه)
```
@topic  my-topic-id            ← هر فایل یک بیماری. شناسه فقط حروف کوچک، عدد و خط تیره
cluster: cardiac               ← باید در content/clusters.txt باشد
name: English name
name_fa: نام فارسی
source: A | B | AB
keywords: کلمات جستجو
refs: aha-cpr-2025             ← کلیدهای content/references.md

@guide                         ← راهنمای مطالعه (فارسی ساده). خط خالی = پاراگراف جدید، «- » = بولت، «# » = تیتر
...
@variant my-variant-id         ← هر نسخه از دستورها
name: Short name
level: I | II | III
source: A | B | AB
meta: Imp: … · C: II · Diet: NPO
refs: aha-cpr-2025
@scenario                      ← سناریوی فارسی ساده
@why                           ← این نسخه چه فرقی دارد؟
@orders
- یک دستور در هر خط     **bold**   [[variant-id|متن لینک]]
-- زیرعنوان
- دستور از یک منبع @A
- دستور افزوده‌شده از راهنما [^aha-cpr-2025]
@branch                        ← جعبه «اگر … وگرنه» (تکرار شود)
if: شرط
- دستور وقتی شرط برقرار است
else: وگرنه
- دستور وگرنه
go: variant-id, other-id
@notes
- یادداشت فارسی منبع
```
خطی که با `//` شروع شود توضیح است و نادیده گرفته می‌شود. فایل‌هایی که با `_` شروع شوند خوانده نمی‌شوند.

### مراجع جدید
در `content/references.md` یک خط به شکل `کلید | ارجاع کامل` اضافه کنید، بعد در متن بنویسید `[^کلید]`.

### دسته جدید
در `content/clusters.txt` یک خط `id | English name | نام فارسی` اضافه کنید.

---

## جعبه نظر · Feedback box
- پایین هر صفحه. به‌صورت پیش‌فرض یک **GitHub Issue** پرشده (برچسب `feedback`) باز می‌کند؛ نظرها را در تب **Issues** می‌خوانید. نویسنده باید حساب GitHub داشته باشد.
- برای دریافت **ناشناس** نظرها: در `config.js` مقدار `commentEndpoint` را با آدرس یک فرم‌ساز (Formspree، Web3Forms، Getform یا Google Apps Script) پر کنید. آن‌وقت نظرها مستقیم به همان صندوق می‌روند.

## ساخت و بررسی · Build and validate
```
node tools/build.js          # بررسی همه فایل‌ها (لینک‌ها، مراجع، قالب) و ساخت content/bundle.js
node tools/build.js --check  # فقط بررسی
```
`content/bundle.js` را GitHub Action (`.github/workflows/content.yml`) هر بار که چیزی در `content/` تغییر کند خودکار می‌سازد. اگر قالب فایل اشتباه باشد، Action قرمز می‌شود و پیام خطا نشان می‌دهد و بقیه سایت سالم می‌ماند.

## فعال‌سازی GitHub Pages
**Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save.**

---

## الف) صفحه انتخاب و دو بخش · Start page and the two parts
- `index.html`: صفحه انتخاب بین دو بخش · chooser.
- `legacy.html`: سایت قبلی، بدون تغییر محتوا (فقط یک دکمه بازگشت به صفحه انتخاب) · the original site, content unchanged.
- `tintinalli/`: بخش جدید بر پایه Tintinalli، کاملاً جدا از بخش قبلی · the new Tintinalli-based part, fully separate. See `tintinalli/README.md`.
- لینک‌های قدیمی مثل `/#/t/acs` خودکار به `legacy.html` می‌روند · old deep links redirect to `legacy.html`.
- پیش‌نمایش شاخه: `.github/workflows/preview-pages.yml` سایت `main` را در ریشه و این شاخه را در `/preview/` منتشر می‌کند (Settings → Pages → Source = GitHub Actions) · branch preview.
