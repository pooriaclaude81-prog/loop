@topic loc
cluster: collapse
name: Decreased level of consciousness
name_fa: کاهش سطح هوشیاری
source: B
keywords: coma gcs naloxone thiamine meningitis hub
refs: aha-ais-2026, rcem-opioid-2024

@guide
# ایده کلی
در بیمار بی‌هوش اول ABC را درست کنید، بعد دنبال علت بگردید. حرف «علت پیدا نشده» ممنوع است؛ هر دستور باید یک احتمال را بسنجد یا درمان کند.
# اولویت‌ها
- راه هوایی: GCS ≤ 8 یا نبود رفلکس گگ یعنی اینتوباسیون.
- قند خون سریع (هیپوگلیسمی).
- ECG و گاز خون؛ ساختاری یا متابولیک.
# شاخه‌ها
- **اوپیوئید:** مردمک سوزنی و تنفس کند → نالوکسان تیتره [^rcem-opioid-2024].
- **الکلی/سوءتغذیه:** تیامین.
- **سکته:** CT و ترومبولیز در پنجره [^aha-ais-2026].
- **مننژیت:** آنتی‌بیوتیک را قبل از CT شروع کنید.
- **هرنی مغزی:** مانیتول یا سالین هیپرتونیک.
- **تشنج غیرتشنجی:** EEG.

@variant loc-hub
name: Work-up and branches (hub)
level: I
source: B
meta: Imp: LOC · C: I or II · NPO · CBR · supine · **ABC first**
refs: rcem-opioid-2024

@scenario
مردی ۵۵ ساله بی‌هوش پیدا شده و فقط به درد پاسخ می‌دهد (GCS برابر 9). علت مشخص نیست. اول راه هوایی، تنفس، گردش خون و قند، بعد دستورهای پایه و بر اساس سرنخ‌ها شاخه مناسب.

@why
برای هر بیمار بی‌هوش یک هاب داریم: اول ایمنی، بعد پیدا کردن علت.

@orders
- **ABC** first. If GCS ≤ 8 or no gag reflex: **RSI intubation**.
- CVS / NPO / CBR
- IV line fix
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, UA, BS, Cl, VBG, AST, ALT, ALP, Trop, TSH, T3, T4, NH4
- Toxin panel; levels of acetaminophen, ASA, ethanol; co-oximetry, MetHb
- PO & HM
- O2 by nasal cannula, mask, or mask with reservoir. **Target SpO2 > 96%.**
- Bed-side guard + fixed relative
- **BS glucometry**
- ECG; CXR; brain CT
- Move with the resuscitation team; resuscitation + intubation equipment at the bedside

@branch
if: **Opioid overdose**: gasping respirations or apnea
- **Naloxone 2 mg stat**, repeat every 3–5 min, max 10 mg

@branch
if: Miosis and a **mild** drop in consciousness
- **Opioid addict: naloxone 0.1 mg**. Healthy person: **0.4 mg** (per step).
go: opioid-resp

@branch
if: LOC with **cachexia / malnutrition**, hyperemesis gravidarum, or an alcoholic
- **Thiamine 100 mg**

@branch
if: **Brain herniation**
- **Mannitol 0.5–1 g/kg**
go: head-herniation

@branch
if: **Acute CVA within 4.5 h** with a thrombolytic indication
- **Alteplase**
go: stroke-ischemic-lysis

@branch
if: Suspected **meningitis**
- **Ceftriaxone 2 g + vancomycin 1 g** BEFORE the brain CT

@branch
if: Suspected vascular or brainstem lesion (carotid dissection, aneurysm, basilar stenosis)
- **CT angiography**

@branch
if: Suspected **non-convulsive seizure**
- **EEG**
go: seizure-status

@branch
if: Acute LOC where MRI is considered
- MRI has little use in acute LOC when the patient cannot be monitored in the scanner, except in acute cerebral apoplexy, infection, neoplasm

@branch
if: Hypoglycemia
go: hypoglycemia-bs

@branch
if: Hepatic encephalopathy
go: he-lowloc

@notes
- ابتدا ارزیابی راه هوایی، تنفس و سیرکولاسیون انجام می‌شود. در صورت GCS ≤ 8 و عدم وجود رفلکس Gag، بیمار تحت RSI اینتوباسیون می‌شود.
- میزان اکسیژن بر حسب O2SAT بیمار یا با نازال کانولا یا با ماسک یا با ماسک و رزروبگ داده شود و هدف حفظ O2SAT > ۹۶٪ است.
- تیامین ۱۰۰ mg: در مواردی که بیمار با LOC مراجعه کرده است و کاشکتیک و سوء تغذیه دارد و زنان با هیپرامزیس گراویداروم شدید، الکلی‌ها داده شود.
- مانیتول ۰/۵-۱ gr/kg در افرادی که هرنیاسیون مغزی دارند داده شود.
- در افراد مشکوک به مننژیت سفتریاکسون ۲ gr و وانکومایسین ۱ gr قبل از انجام B-CT داده شود.
- در موارد شک به تشنج‌های Non-convulsive، EEG انجام شود.
