@topic stroke
cluster: neuro
name: Acute stroke (CVA)
name_fa: سکته مغزی (CVA)
source: AB
keywords: cva ischemic hemorrhagic alteplase tpa labetalol fnd
refs: aha-ais-2026, aha-ich-2022

@guide
# ایده کلی
سکته مغزی یعنی خونرسانی بخشی از مغز قطع شده (ایسکمیک، حدود ۸۵٪) یا رگ پاره شده (خونریزی‌دهنده). «زمان یعنی مغز»: هر دقیقه میلیون‌ها نورون از بین می‌رود [^aha-ais-2026].
# اول ABC و قند
راه هوایی، تنفس و گردش خون را ببینید. قند خون را قبل از CT بگیرید، چون هیپوگلیسمی شبیه سکته است. CT مغز بدون کنتراست هرچه سریع‌تر برای افتراق خونریزی از ایسکمی.
# سه مسیر بعد از CT
- **ایسکمیک و در پنجره زمانی:** ترومبولیز (آلتپلاز یا تنکتپلاز) اگر معیارها مناسب باشد؛ قبل از آن فشار باید زیر 185/110 باشد.
- **ایسکمیک بدون ترومبولیز:** فشار را آزاد می‌گذاریم (تا 220/120)، چون مغز به فشار بالا برای پرفیوژن کمک می‌گیرد. آسپیرین بعد از رد خونریزی.
- **خونریزی:** کنترل فشار (هدف حدود 140 سیستولیک)، برگرداندن اثر ضدانعقاد، نوروسرجری [^aha-ich-2022].
# هشدار
GCS ≤ 8، رفلکس گگ ضعیف یا علائم هرنی یعنی اینتوباسیون را از همان اول در نظر بگیرید.

@variant stroke-initial
name: Suspected stroke, initial orders
level: I
source: AB
meta: Imp: CVA / R/O CVA · C: I · NPO · CBR · supine
refs: aha-ais-2026

@scenario
مردی ۶۸ ساله ۹۰ دقیقه پیش ناگهان دست راستش ضعیف و صحبتش نامفهوم شد. فشار 175/95، نبض 88 و نامنظم، قند 140، GCS برابر 14 و افتادگی صورت سمت راست دارد. ضربه به سر یا مصرف ضدانعقاد نداشته است. هنوز CT نشده است.

@why
این مجموعه دستورهای اولیه برای هر سکته مشکوک است؛ بعد از CT به یکی از سه شاخه بعدی می‌رویم.

@orders
- CVS / NPO / CBR; supine
- IV line fix
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, BS, PT, PTT, INR, **Troponin**. @A Also CPK, LDH, CK-MB, ALT, AST, ALP. @B Also Alb.
- Pulse oximetry + cardiac monitoring (PO & HM)
- O2 by nasal cannula 4–6 L/min **if SpO2 ≤ 90%**
- **ECG**
- **Bedside glucose (glucometry) BEFORE the brain CT**, urgent
- **Emergency spiral brain CT without contrast**; read within 45 min; door-to-imaging goal ≤ 25 min [^aha-ais-2026]
- CXR after the patient is stable
- @B Serum N/S 500 mL IV every 4 h
- @B **Emergency neurology visit**
- @B Amp Pantoprazole 40 mg IV stat
- @B Bed-side guard + fixed relative. Move the patient only with the resuscitation team. Resuscitation + intubation equipment at the bedside.

@branch
if: **GCS ≤ 8, absent gag reflex, gasping respirations, signs of herniation** (eyes deviated to one side, one dilated pupil, pinpoint pupils, ↓LOC)
- **Intubation first**; assess breathing and circulation, treat as needed (ABC first in every stroke patient)

@branch
if: CT: no blood and onset within 4.5 h
go: stroke-ischemic-lysis

@branch
if: CT: no blood and outside the window, or lysis contraindicated
go: stroke-ischemic-nolysis

@branch
if: CT: intracranial hemorrhage
go: stroke-hemorrhagic

@notes
- در هر بیمار با شواهد stroke مثل همه بیماران دیگر ABC در قدم اول است. در صورت وجود GCS ≤ 8، عدم وجود رفلکس Gag، تنفس‌های gasping، علائم هرنیاسیون مغزی، Gaze چشم‌ها به طرفین، دیلاتاسیون یکی از مردمک‌ها، مردمک‌های pinpoint و کاهش هوشیاری مدنظر قرار دادن Intubation در ابتدا، همین‌طور موارد Breathing و Circulation ارزیابی و اقدامات لازم صورت گیرد.
- Brain CT اورژانسی حداکثر تا ۲۰ دقیقه از ورود بیمار به اورژانس گرفته شده باشد و حداکثر تا ۴۵ دقیقه رؤیت شده باشد.
- قند خون بیمار اورژانسی قبل از Brain CT گرفته شود.

@variant stroke-ischemic-lysis
name: Ischemic, within window → alteplase
level: I
source: AB
meta: Imp: Acute ischemic stroke, thrombolysis candidate · C: I
refs: aha-ais-2026

@scenario
همان مرد ۶۸ ساله با ضعف دست راست و اختلال گفتار از ۹۰ دقیقه پیش (NIHSS برابر 9). CT خونریزی ندارد. فشار 180/100، قند 140، ضدانعقاد و جراحی یا خونریزی اخیر ندارد. معیارهای بالینی و تصویربرداری ترومبولیز برقرار است.

@why
در این نسخه هدف، ترومبولیز سریع و کنترل فشار قبل و بعد از آن است.

@orders
- CVS / NPO / CBR; supine
- IV line fix
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, BS, PT, PTT, INR, **Troponin**. @A Also CPK, LDH, CK-MB, ALT, AST, ALP. @B Also Alb.
- Pulse oximetry + cardiac monitoring (PO & HM)
- O2 by nasal cannula 4–6 L/min **if SpO2 ≤ 90%**
- **ECG**
- **Bedside glucose (glucometry) BEFORE the brain CT**, urgent
- **Emergency spiral brain CT without contrast**; read within 45 min; door-to-imaging goal ≤ 25 min [^aha-ais-2026]
- CXR after the patient is stable
- @B Serum N/S 500 mL IV every 4 h
- @B **Emergency neurology visit**
- @B Amp Pantoprazole 40 mg IV stat
- @B Bed-side guard + fixed relative. Move the patient only with the resuscitation team. Resuscitation + intubation equipment at the bedside.
-- Blood pressure
- If **BP > 185/110**: Amp **Labetalol 20 mg (4 mL)** IV over 2 min
- Keep BP ≤ 185/110 before lysis and < 180/105 for 24 h after [^aha-ais-2026]
-- Thrombolysis
- Ready to give **alteplase** after the **OK of the emergency physician or the neurologist** (mandatory) and when clinical and radiological indications are met
- Alteplase **0.9 mg/kg** (max 90 mg): 10% as a bolus over 1 min, the remaining 90% over 60 min; tenecteplase 0.25 mg/kg is an accepted alternative [^aha-ais-2026]
- Transfer to the **Stroke Care Unit (SCU)**
- No anticoagulants or antiplatelets for 24 h after alteplase; repeat neuro checks and BP checks per protocol [^aha-ais-2026]

@branch
if: New severe headache, vomiting, or neurological worsening during the infusion
- Stop the infusion, urgent non-contrast CT, call neurology [^aha-ais-2026]

@variant stroke-hemorrhagic
name: Hemorrhagic stroke (ICH on CT)
level: I
source: AB
meta: Imp: Acute hemorrhagic stroke · C: I
refs: aha-ich-2022

@scenario
خانمی ۷۲ ساله که وارفارین مصرف می‌کند ناگهان سردرد شدید، استفراغ و ضعف سمت چپ بدن پیدا کرده است. فشار 195/110. در CT خونریزی داخل مغزی در عقده‌های قاعده‌ای راست دیده می‌شود.

@why
در خونریزی نه ترومبولیتیک و نه ضدپلاکت؛ فشار را پایین می‌آوریم و اثر ضدانعقاد را برمی‌گردانیم.

@orders
- CVS / NPO / CBR; supine
- IV line fix
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, BS, PT, PTT, INR, **Troponin**. @A Also CPK, LDH, CK-MB, ALT, AST, ALP. @B Also Alb.
- Pulse oximetry + cardiac monitoring (PO & HM)
- O2 by nasal cannula 4–6 L/min **if SpO2 ≤ 90%**
- **ECG**
- **Bedside glucose (glucometry) BEFORE the brain CT**, urgent
- **Emergency spiral brain CT without contrast**; read within 45 min; door-to-imaging goal ≤ 25 min [^aha-ais-2026]
- CXR after the patient is stable
- @B Serum N/S 500 mL IV every 4 h
- @B **Emergency neurology visit**
- @B Amp Pantoprazole 40 mg IV stat
- @B Bed-side guard + fixed relative. Move the patient only with the resuscitation team. Resuscitation + intubation equipment at the bedside.
-- Blood pressure
- If **SBP > 150**: Amp **Labetalol 20 mg (4 mL)** IV over 2 min, repeat as needed; target SBP about 140 (130–150) [^aha-ich-2022]
-- Anticoagulated
- If on an anticoagulant: request **FFP and Vitamin K** immediately
- **4-factor PCC** is preferred over FFP for warfarin reversal where available, with Vitamin K 10 mg IV slowly [^mja-warfarin-2025]
- Head of bed 30°, neurosurgery consult, ICU / stroke unit admission [^aha-ich-2022]
- No thrombolytic and no antithrombotic [^aha-ich-2022]

@branch
if: GCS ≤ 8, herniation signs
- Intubation first (see the initial page)
go: head-herniation

@variant stroke-ischemic-nolysis
name: Ischemic, no lysis
level: II
source: AB
meta: Imp: Acute ischemic stroke, not a thrombolysis candidate · C: I–II
refs: aha-ais-2026

@scenario
خانمی ۷۴ ساله با افتادگی صورت سمت راست و اختلال تکلم که ۸ ساعت پیش آخرین بار سالم دیده شده است. CT خونریزی ندارد. فشار 190/100. خارج از پنجره ترومبولیز است.

@why
ترومبولیز ممکن نیست؛ اینجا فشار را آزاد می‌گذاریم، آسپیرین می‌دهیم و بیمار را در بخش سکته بستری می‌کنیم.

@orders
- CVS / NPO / CBR; supine
- IV line fix
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, BS, PT, PTT, INR, **Troponin**. @A Also CPK, LDH, CK-MB, ALT, AST, ALP. @B Also Alb.
- Pulse oximetry + cardiac monitoring (PO & HM)
- O2 by nasal cannula 4–6 L/min **if SpO2 ≤ 90%**
- **ECG**
- **Bedside glucose (glucometry) BEFORE the brain CT**, urgent
- **Emergency spiral brain CT without contrast**; read within 45 min; door-to-imaging goal ≤ 25 min [^aha-ais-2026]
- CXR after the patient is stable
- @B Serum N/S 500 mL IV every 4 h
- @B **Emergency neurology visit**
- @B Amp Pantoprazole 40 mg IV stat
- @B Bed-side guard + fixed relative. Move the patient only with the resuscitation team. Resuscitation + intubation equipment at the bedside.
- BP: permissive hypertension; treat only if BP > 220/120 (labetalol 20 mg IV) [^aha-ais-2026]
- **Aspirin 160–325 mg** within 24–48 h once hemorrhage is excluded (not within 24 h after alteplase) [^aha-ais-2026]
- Transfer to the **SCU** / neurology
