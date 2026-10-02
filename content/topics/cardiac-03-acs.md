@topic acs
cluster: cardiac
name: Acute coronary syndrome (ACS)
name_fa: سندرم حاد کرونری (ACS)
source: B
keywords: mi stemi nstemi chest pain aspirin plavix heparin enoxaparin nitroglycerin troponin
refs: acc-acs-2025, aha-chestpain-2021

@guide
# ایده کلی
در ACS شریان کرونر تنگ یا بسته می‌شود و عضله قلب کم‌خون می‌شود. زمان یعنی عضله: هرچه زودتر جریان خون برگردد، عضله بیشتری نجات پیدا می‌کند [^acc-acs-2025].
# منطق دستورها
- **ECG سریالی و تروپونین:** تشخیص و تعیین نوع (STEMI یا غیر از آن).
- **آسپیرین جویدنی، کلوپیدوگرل، آتورواستاتین:** مهار پلاکت و تثبیت پلاک.
- **ضد انعقاد** (انوکساپارین یا هپارین) فقط وقتی درد ادامه دارد، ECG تغییر دارد، تروپونین مثبت است یا MI قطعی است.
- **نیتروگلیسرین** درد را کم می‌کند ولی در فشار پایین، نبض کم، و MI تحتانی/بطن راست خطرناک است، چون پیش‌بار را می‌اندازد.
- **اکسیژن** فقط وقتی SpO2 پایین است.
- بتابلوکر و ACEI در همان ساعات اول اورژانس اجباری نیستند.
# چه موقع سطح ۱؟
بی‌ثباتی (فشار زیر ۹۰، آریتمی، ادم ریه)، STEMI، یا علائم دایسکشن، تامپوناد و ... یعنی انتقال به اتاق احیا و اقدام فوری برای بازکردن شریان [^acc-acs-2025].

@variant acs-stable
name: ACS, stable
level: II
source: B
meta: Imp: ACS · C: II · Diet: NPO · Activity: CBR · Position: supine or semi-sitting
refs: acc-acs-2025

@scenario
مردی ۵۸ ساله و دیابتی ۴۵ دقیقه است که فشار پشت جناغ دارد، به بازوی چپ تیر می‌کشد و حالت تهوع دارد. فشار 142/88، نبض 84، SpO2 96٪ و ریه‌ها صاف است. ECG افت قطعه ST و وارونگی T در V4 تا V6 دارد، ولی بالا رفتن ST ندارد.

@why
بیمار پایدار است و ST بالا نرفته؛ پس مجموعه دستورهای استاندارد ACS با ضدپلاکت، ضدانعقاد و پایش سریالی لازم است.

@orders
- CVS / NPO / CBR
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, **Troponin 0–6 h**
- Heart monitoring (HM) + pulse oximetry (PO)
- O2 by non-rebreather mask 8–10 L/min **only if SpO2 ≤ 94%** (no oxygen needed if room-air SpO2 > 94%)
- Portable CXR (once stable, a non-portable film is acceptable)
- **Serial ECG**
- IV line fix
- N/S IV over 8 h (reduce if BP is high or the kidney is failing)
- BS glucometry
- Tab **ASA 325 mg**, non-enteric-coated, **chewed**, stat. (If already on aspirin at home, B writes 80 mg.)
- Tab **Plavix 300 mg** PO stat. (If already on Plavix at home: 75 mg.)
- Tab **Atorvastatin 40 mg** PO stat
- Tab Metoral 25 mg PO stat if SBP ≥ 90 and PR ≥ 60 (beta-blocker and ACE-I are not mandatory in the acute phase in the ED)
- Tab Oxazepam 10 mg PO stat
- Amp Pantoprazole 40 mg IV stat
- Amp **Morphine 3 mg** IV stat, slow over 2 min, with RR control
- Amp Ondansetron 4 mg IV stat if nauseated
- Bed guard up, relative at bedside

@branch
if: Ongoing / recurrent chest pain, ST-T changes, positive troponin, or acute MI → anticoagulate
- Amp **Enoxaparin 60 mg SC** stat
else: None of the criteria
- No anticoagulant is needed if none of these criteria is met

@branch
if: Renal failure
- Use **heparin** instead of enoxaparin: 5000 U IV stat, then 1000 U/h infusion

@branch
if: Candidate for thrombolysis
- Heparin **60 U/kg** IV stat, then **12 U/kg/h**
go: acs-stemi

@branch
if: Chest pain persists after 1 sublingual TNG pearl, SBP ≥ 90 and PR > 50
- **TNG pearl SL** stat, **up to 3 doses every 3–5 min**

@branch
if: Pain still present after 3 pearls and no contraindication to TNG: SBP ≥ 100, PR ≥ 50, **no RV MI, no inferior MI**
- Serum **TNG infusion 10 µg/min**
else: Contraindicated
- Do NOT give TNG when SBP < 90, PR < 50, RV MI, or inferior MI → [[acs-rvmi|inferior / RV MI]]

@branch
if: Patient is stable AND none of the Level I triggers apply
- After serial ECGs, send for CXR to radiology; portable is not required

@branch
if: Any Level I trigger: HR > 150 or < 50, cyanosis / severe distress, tearing pain to the back, altered consciousness, low BP with raised JVP, ST elevation, pulmonary edema, SBP < 90
go: acs-stemi, chestpain-redflag

@notes
- اگر SpO2 بیمار بالای ۹۴٪ است نیازی به اکسیژن مکمل ندارد.
- اگر بیمار قبلاً آسپرین می‌خورده ۸۰ میلی‌گرم و اگر پلاویکس می‌خورده ۷۵ میلی‌گرم داده شود.
- دادن بتابلوکر و ACEI در مرحله حاد ACS در اورژانس لزوم و اجبار ندارد.
- اندیکاسیون آنتی‌کوآگولان (هپارین/انوکساپارین): درد قفسه سینه دائمی یا تکرارشونده، ECG همراه با تغییرات ST-T، مثبت شدن مارکرهای قلبی، MI حاد. در نارسایی کلیه هپارین بدهید.
- TNG در بیماران با فشار کمتر از ۹۰، PR کمتر از ۵۰، RV MI و Inferior MI داده نشود.
- در صورتی که بیمار Stable است و موارد ردیف C را ندارد، پس از ECG های سریال برای CXR به رادیولوژی اعزام شود و نیازی به پرتابل بودن ندارد.

@variant acs-stemi
name: STEMI / unstable → Level I, reperfusion
level: I
source: B
meta: Imp: ACS with ST elevation or unstable features · Level I · resuscitation room
refs: acc-acs-2025

@scenario
مردی ۶۱ ساله یک ساعت است که درد له‌کننده قفسه سینه دارد، عرق کرده و رنگ‌پریده است. فشار 150/90، نبض 92 و SpO2 94٪. ECG بالا رفتن ST در V1 تا V4 را نشان می‌دهد (STEMI قدامی). یا بیماری با همین درد که ادم ریه یا آریتمی خطرناک دارد.

@why
STEMI یا ناپایداری یعنی هر دقیقه عضله قلب از بین می‌رود؛ اولویت باز کردن سریع شریان با PCI یا ترومبولیتیک است.

@orders
- Move to the resuscitation room, monitor + defibrillator pads, **resuscitation equipment at the bedside**
- ECG immediately; repeat / serial ECGs
- IV line fix; labs as in [[acs-stable|ACS, stable]] (troponin 0–6 h)
- ASA 325 mg chewed + Plavix 300 mg + Atorvastatin 40 mg (as in [[acs-stable|stable ACS]])
- Amp Morphine 3 mg IV slow over 2 min with RR control; ondansetron if nauseated
- TNG pearl SL / infusion only if no contraindication (see the stable-ACS page)
- **Emergency reperfusion**: fibrinolytic (reteplase) + emergency cardiology for PCI and transfer
- Heparin if thrombolysis: **60 U/kg stat then 12 U/kg/h**
- Bed guard up with relative at bedside

@branch
if: Shock or malignant arrhythmia
- Follow [[ape-hypoperfused|cardiogenic shock / pulmonary edema]] and [[ape-addons|arrhythmia add-ons]]
go: arrest-vf

@branch
if: Fibrinolysis chosen
- **Reteplase 10 U IV bolus over 2 min, repeat 10 U after 30 min** [^acc-acs-2025]
- Door-to-needle goal ≤ 30 min. Choose primary PCI instead if first-medical-contact-to-device ≤ 120 min. [^acc-acs-2025]

@variant acs-rvmi
name: Inferior / RV MI, or SBP < 90 / HR < 50
level: I
source: B
meta: Imp: ACS with TNG contraindication
refs: acc-acs-2025

@scenario
مردی ۶۶ ساله درد قفسه سینه و تعریق دارد. ECG بالا رفتن ST در II، III و aVF را نشان می‌دهد. فشار 84/50، نبض 48، ریه‌ها صاف و رگ‌های گردن برجسته است. انفارکتوس تحتانی همراه درگیری بطن راست است و نیتروگلیسرین می‌تواند فشار را بیشتر بیندازد.

@why
در MI تحتانی/بطن راست یا فشار زیر ۹۰ و نبض کم، نیترات ممنوع است؛ بقیه درمان ACS ادامه می‌یابد.

@orders
- Level I: resuscitation room, monitor, pads, defibrillator
- Serial ECG
- Right-sided ECG leads (V4R) to confirm RV infarct [^acc-acs-2025]
- IV line fix; N/S given cautiously (volume dependent)
- ASA 325 mg chewed + Plavix 300 mg + Atorvastatin 40 mg
- **NO TNG** (SBP < 90, PR < 50, RV MI and inferior MI are listed contraindications)
- Bradycardia < 50 with symptoms: atropine 0.5 mg IV, repeat up to 6 doses; external pacemaker + dopamine drip ready (from [[ape-addons|add-ons]])
- Fluid bolus 250–500 mL N/S and reassess; avoid diuretics and nitrates [^acc-acs-2025]
- Emergency reperfusion: see [[acs-stemi|STEMI]]
