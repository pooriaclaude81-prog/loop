@topic mt
cluster: trauma
name: Multiple trauma
name_fa: ترومای متعدد
source: B
keywords: polytrauma atls tranexamic pelvis
refs: atls-11, esc-trauma-2023

@guide
# ایده کلی
در ترومای متعدد با رویکرد xABCDE (ابتدا کنترل خونریزی حیاتی) جلو بروید. هدف جلوگیری از «سه‌گانه مرگبار»: هیپوترمی، اسیدوز، کواگولوپاتی [^atls-11].
# دو مسیر
- **پایدار:** مجموعه استاندارد (آزمایش، CXR، eFAST، CT طبق اندیکاسیون، کلار، مسکن، کزاز).
- **ناپایدار** (فشار ≤ 90، GCS ≤ 8، زخم نافذ به گردن/قفسه/شکم/اندام پروگزیمال، نیاز به اینتوباسیون): سطح ۱، دو رگ بزرگ، خون و FFP، جراحی.
- **FAST مثبت یا لگن ناپایدار:** اسید ترانگزامیک را زودتر شروع کنید [^esc-trauma-2023].
# یادآوری
خانم باردارشدنی: βHCG. CXR در هر ترومای متعدد. گرافی لگن لازم نیست اگر بیمار پایدار و بدون درد لگن است.

@variant mt-stable
name: Stable multiple trauma
level: II
source: B
meta: Imp: MT · C: II · NPO · CBR · supine
refs: atls-11

@scenario
رانندهٔ ۴۰ ساله با کمربند ایمنی بعد از تصادف متوسط: درد دیواره قفسه، حساسیت خفیف شکم و گردن. فشار 125/80، نبض 88 و GCS برابر 15.

@why
ترومای متعدد پایدار است؛ مجموعه استاندارد، پایش و تصویربرداری بر اساس اندیکاسیون.

@orders
- CVS / NPO / CBR; supine
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, UA, BG/Rh
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- **CXR in every MT patient**; neck AP / lateral (NEXUS); other films as needed
- **Brain CT** (per the indications on the head-trauma pages)
- IV line; Serum N/S 1 L IV stat
- Amp Ranitidine 50 mg IV stat; **eFAST**
- Amp **Morphine 3 mg** IV stat, slow over 2 min
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion
- Check Hb/Hct every 6 h; **mechanical collar** fix; protected bed + fixed relative

@branch
if: **Woman of childbearing age**
- βHCG

@branch
if: **Neck X-ray** (AP + lateral) if any NEXUS criterion: distracting injury, LOC, intoxication, FND, midline neck tenderness
- Neck AP and lateral

@branch
if: **Pelvic X-ray is NOT indicated** when: he has walked, no LOC, no pelvic-belt tenderness, fully alert, stable pelvic exam, no penetrating trauma
- Skip the pelvic film

@branch
if: **Laceration**
- Decide on tetanus: see the [[tetanus-table|table]]

@branch
if: Patient becomes unstable
go: mt-unstable

@variant mt-unstable
name: Unstable → Level I
level: I
source: B
meta: Imp: MT, unstable · Level I
refs: atls-11

@scenario
مردی ۲۸ ساله پس از سقوط از ارتفاع: فشار 78/40، نبض 130، GCS برابر 9، شکم متسع، لگن ناپایدار و بدشکلی واضح ران.

@why
ناپایدار است؛ سطح ۱، خون و FFP، کنترل خونریزی و جراحی.

@orders
- CVS / NPO / CBR; supine
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, UA, BG/Rh
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- **CXR in every MT patient**; neck AP / lateral (NEXUS); other films as needed
- **Brain CT** (per the indications on the head-trauma pages)
- IV line; Serum N/S 1 L IV stat
- Amp Ranitidine 50 mg IV stat; **eFAST**
- Amp **Morphine 3 mg** IV stat, slow over 2 min
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion
- Check Hb/Hct every 6 h; **mechanical collar** fix; protected bed + fixed relative
-- Added when the patient is unstable
- IV line ×2 **large**; portable CXR
- Resuscitation + intubation equipment at the bedside
- **Move only with the resuscitation team**
- NGT fix; Foley catheter fix; control I/O; BS glucometry; ECG; **ECG every 15 min**; vital signs every hour
- Reserve **4 U P.C** and **4 U FFP**, iso-group
- If intubated: Amp **Phenytoin 1 g in 250 mL N/S** over 1 h
- Surgery consult

@branch
if: **Level I** if: SBP ≤ 90; GCS ≤ 8; penetrating wound to neck, chest, abdomen or proximal limbs; respiratory distress needing intubation
- Immediately admitted at Level I; resuscitation + intubation; **ATLS**; request surgery

@branch
if: Shock
- **Lactate** and VBG

@branch
if: FAST positive, or pelvic fracture with unstable hemodynamics
go: mt-pelvic

@variant mt-pelvic
name: FAST positive / unstable pelvis: tranexamic acid
level: I
source: B
meta: Imp: MT with hemorrhage
refs: esc-trauma-2023

@scenario
بیمار ترومایی با FAST مثبت (مایع آزاد شکم) یا شکستگی لگن با همودینامیک ناپایدار.

@why
خونریزی فعال محتمل است؛ اسید ترانگزامیک را زودتر شروع می‌کنیم.

@orders
- All the orders of the [[mt-unstable|unstable MT page]]
- Amp **Tranexamic acid 1 g** IV over 10 min, then **1 g** IV infusion over 8 h, within 3 h of injury [^esc-trauma-2023]
