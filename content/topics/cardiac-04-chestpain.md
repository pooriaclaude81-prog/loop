@topic chestpain
cluster: cardiac
name: Chest pain — atypical / red flags
name_fa: درد قفسه سینه (غیرتیپیک و علائم هشدار)
source: B
keywords: dissection tamponade pneumothorax pe esophageal rupture
refs: aha-chestpain-2021, acc-aorta-2022, aha-pe-2026

@guide
# ایده کلی
هر درد قفسه سینه باید اول از نظر «کشنده‌ها» غربال شود و بعد سراغ علل خوش‌خیم برویم [^aha-chestpain-2021]. هشت بیماری خطرناک را همیشه در ذهن داشته باشید:
- آریتمی (ضربان بالای ۱۵۰ یا زیر ۵۰)
- دایسکشن آئورت (درد خنجری به پشت یا شانه) [^acc-aorta-2022]
- پنوموتوراکس فشارنده (صدای ریه یک‌طرفه کم + فشار پایین + JVP برجسته)
- تامپوناد (صداهای قلب دور + JVP + فشار پایین)
- پارگی مری (درد شدید بعد از استفراغ)
- آمبولی ریه حجیم [^aha-pe-2026]
- انفارکتوس حاد قلب
- ادم حاد ریه
# منطق دستورها
درد کم‌خطر هم ECG سریال و تروپونین دو نوبته می‌خواهد، چون MI گاهی شکل غیرتیپیک دارد. اگر هر نشانه خطر بود، بیمار سطح ۱ می‌شود و درمان همان بیماری شروع می‌شود، نه صبر برای تأیید.

@variant chestpain-lowrisk
name: Atypical chest pain, stable
level: II
source: B
meta: Imp: Atypical chest pain · C: II · Diet: NPO · Activity: CBR · Position: supine
refs: aha-chestpain-2021

@scenario
خانمی ۴۴ ساله از ۶ ساعت پیش درد تیز سمت چپ قفسه سینه دارد که با حرکت و نفس عمیق تغییر می‌کند و ربطی به فعالیت ندارد. علائم حیاتی نرمال، معاینه نرمال و ECG اول بدون تغییر حاد است. نشانه‌ای از دایسکشن، آمبولی یا تامپوناد ندارد.

@why
درد کم‌خطر است ولی هنوز ECG سریال و تروپونین دو نوبته لازم دارد تا MI را کنار بگذاریم.

@orders
- CVS / NPO / CBR
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, **Troponin (0, 6 h)**
- HM, PO
- O2 non-rebreather 8–10 L/min only if SpO2 ≤ 94%
- CXR after stabilization
- Serial ECG
- IV line fix; N/S over 8 h
- Tab **ASA 325 mg chewed** PO stat
- Tab **Atorvastatin 40 mg** PO stat
- TNG pearl SL stat ×3 doses q 5 min **if PR > 50 and SBP ≥ 100**
- Amp Ranitidine 50 mg IV stat
- Bed guard up with fixed relative

@branch
if: Any of the life-threatening features appears
go: chestpain-redflag

@notes
- در هر بیمار که با درد قفسه صدری مراجعه می‌کند بیماری‌های خطرناک و کشنده باید در نظر گرفته شوند (جزئیات در صفحه «Red flags»).

@variant chestpain-redflag
name: Red flags: can’t-miss killers (hub)
level: I
source: B
meta: Any of these puts the patient in Level I: resuscitation room + resuscitation measures started.
refs: aha-chestpain-2021

@scenario
بیمار با درد قفسه سینه که «بدحال به نظر می‌آید»: درد پاره‌کننده به پشت، یا افت فشار، یا هیپوکسی، یا آریتمی. بر اساس یافته بالینی شاخه مناسب را انتخاب کنید.

@why
این صفحه یک هاب است: هر یافته خطرناک به درمان بیماری مربوط خودش هدایت می‌شود و بیمار در سطح ۱ قرار می‌گیرد.

@branch
if: **Arrhythmia**: tachycardia > 150 or bradycardia < 50
go: svt-unstable, ape-addons

@branch
if: **Aortic dissection**: stabbing pain radiating to the back or shoulder
- Level I, IV ×2, monitor
- **Heart-rate and BP control** (target HR < 60, SBP 100–120) with IV beta-blocker (esmolol / labetalol) before vasodilators [^acc-aorta-2022]
- CT angiography of the aorta, vascular / cardiac surgery consult [^acc-aorta-2022]

@branch
if: **Aortic + carotid dissection**: stabbing pain with unilateral neck pain and neurological signs (CVA features)
- CT angiography head and neck + chest; avoid anticoagulants / lytics until dissection is excluded [^acc-aorta-2022]

@branch
if: **Tension pneumothorax**: unilateral absent breath sounds + low BP + raised JVP + low SpO2
- Chest tube equipment at the bedside, call surgery
- Immediate needle decompression, 2nd intercostal space midclavicular line (or 5th ICS anterior axillary), then chest tube [^atls-11]

@branch
if: **Cardiac tamponade**: muffled heart sounds + raised JVP + low BP
- Emergency ultrasound / echo
- Pericardiocentesis equipment at the bedside

@branch
if: **Esophageal rupture**: severe mediastinal pain + vomiting + mediastinal air-fluid level or pleural effusion
- NPO, Level I
- Broad-spectrum IV antibiotics (piperacillin–tazobactam, as in [[neck-esoph|neck trauma]])
- Surgery consult

@branch
if: **Massive PE**: severe chest pain + falling BP + low SpO2 + raised JVP, RV-strain ECG, markedly dilated RV on echo
- Level I, resuscitation room
- Systemic thrombolysis if hemodynamically unstable and no contraindication, and start IV heparin; involve the PE response team [^aha-pe-2026]

@branch
if: **AMI**: ischemic symptoms, positive troponin, regional wall-motion abnormality on echo
go: acs-stemi

@branch
if: **Acute pulmonary edema**
go: ape-perfused, ape-hypoperfused

@notes
- ۱- تاکی یا برادی دیس ریتمی (PR > 150 یا PR < 50)
- ۲- دایسکشن آئورت: درد خنجری تیرکشنده به پشت یا شانه
- ۳- دایسکشن آئورت و کاروتید: درد خنجری همراه با درد یک‌طرفه گردن و علائم CVA
- ۴- پنوموتوراکس فشارنده: کاهش یک‌طرفه صدای ریوی همراه با افت BP و O2sat و JVP برجسته
- ۵- تامپوناد: مافل شدن صداهای قلبی همراه با JVP برجسته و افت BP
- ۶- پارگی مری: درد شدید مدیاستن همراه با سطح مایع هوا در مدیاستن یا پلورال افیوژن
- ۷- Massive PTE: درد شدید قفسه سینه، افت BP و O2sat، JVP برجسته، ECG با RV strain و بطن راست به شدت دیلاته در اکو
- ۸- AMI: علائم قلبی + Trop مثبت همراه با کاهش حرکت منطقه‌ای در اکو
- ۹- ادم حاد ریه
