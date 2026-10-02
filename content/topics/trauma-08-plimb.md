@topic plimb
cluster: trauma
name: Penetrating limb trauma
name_fa: ترومای نافذ اندام
source: B
keywords: open fracture hard signs gentamicin
refs: atls-11, boast-openfx-2017, acip-tetanus-2019

@guide
# ایده کلی
در زخم نافذ اندام اول «علائم عروقی» را بررسی کنید [^atls-11].
- **Hard sign:** نبض نیست، ایسکمی، هماتوم رو به رشد، خونریزی ضربان‌دار، تریل/بروئی → جراحی فوری.
- **Soft sign:** کاهش نبض، هماتوم بزرگ ثابت، بی‌حسی → سونوگرافی داپلر و معاینه مکرر.
# شکستگی باز
زخم بزرگ‌تر از ۱ سانتی‌متر روی شکستگی: علاوه بر سفازولین، جنتامایسین؛ در حساسیت به سفازولین کلیندامایسین [^boast-openfx-2017].
# کزاز
بر اساس سابقه واکسن (جدول کزاز) [^acip-tetanus-2019].

@variant plimb-simple
name: Simple, stable wound
level: III
source: B
meta: Imp: Penetrating limb injury · C: III
refs: atls-11

@scenario
مردی ۳۰ ساله با زخم چاقو به ساعد، خونریزی کنترل‌شده، نبض و حس و حرکت نرمال. زخم ساده.

@why
ساده و پایدار است؛ آزمایش لازم نیست.

@orders
- CVS / NPO / CBR; supine
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- **X-ray AP & lateral** of the injured limb (wrist, forearm, elbow, arm: AP/lat. Palm, foot: AP/oblique. Ankle, leg, knee, thigh: AP/lat. Shoulder: AP)
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion
- Analgesic; **splint** the limb
- After the above: **emergency OR** for exploration, irrigation, dressing

@branch
if: Simple penetrating trauma without hemodynamic problems
- **No lab tests needed**

@branch
if: Complete tetanus vaccination
- No need for the vaccines above

@branch
if: Previous allergy to a tetanus vaccine
- **Contraindicated**

@branch
if: Any neurological or vascular sign appears
go: plimb-soft, plimb-hard

@variant plimb-soft
name: Soft signs
level: II
source: B
meta: Imp: Penetrating limb injury with soft signs · C: II
refs: atls-11

@scenario
مردی ۲۸ ساله با گلوله به ران؛ نبض پا ضعیف‌تر از طرف مقابل، هماتوم بزرگ بدون ضربان و بی‌حسی. خونریزی فعال ندارد.

@why
Soft sign دارد؛ سونوگرافی داپلر و معاینه مکرر.

@orders
- CVS / NPO / CBR; supine
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- **X-ray AP & lateral** of the injured limb (wrist, forearm, elbow, arm: AP/lat. Palm, foot: AP/oblique. Ankle, leg, knee, thigh: AP/lat. Shoulder: AP)
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion
- Analgesic; **splint** the limb
- After the above: **emergency OR** for exploration, irrigation, dressing
- **Arterial color-Doppler ultrasound** of the injured limb
- **Repeat examination** at intervals
- If neuro or pulse deficit: Level II; possible imminent amputation; emergency surgery / orthopedics visit

@branch
if: **Soft signs**: reduced pulse force or pulse asymmetry; large non-pulsatile, non-progressive hematoma; numbness or paresthesia
- Arterial color-Doppler ultrasound and repeated exams

@branch
if: **Gunshot to the proximal limb**, or the patient is hemodynamically unstable
- Emergency surgery visit

@branch
if: A hard sign appears
go: plimb-hard

@variant plimb-hard
name: Hard signs / major bleeding → OR
level: I
source: B
meta: Imp: Penetrating limb injury with hard signs · Level I/II
refs: atls-11

@scenario
جوانی ۲۴ ساله با چاقو به کشاله ران، خونریزی ضربان‌دار، هماتوم رو به رشد و نبض پشت پا لمس نمی‌شود. فشار 90/60.

@why
Hard sign دارد؛ جراحی اورژانس و احیای هم‌زمان.

@orders
- CVS / NPO / CBR; supine
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- **X-ray AP & lateral** of the injured limb (wrist, forearm, elbow, arm: AP/lat. Palm, foot: AP/oblique. Ankle, leg, knee, thigh: AP/lat. Shoulder: AP)
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion
- Analgesic; **splint** the limb
- After the above: **emergency OR** for exploration, irrigation, dressing
- **IV line ×2 large**; serum **N/S 1 L stat**
- Labs: CBC/diff, BUN/Cr, PT, PTT, INR, Na, K
- Reserve **blood (P.C) and FFP**
- **Emergency color-Doppler** of the artery; **CT angiography**
- **Surgery visit** and start resuscitation
- To the **emergency OR** for exploration and bleeding control

@branch
if: **Hard signs**: absent pulse; limb ischemia; expanding hematoma; pulsatile bleeding; bruit or thrill over the artery
- Emergency surgery visit; PO, HM, IV line, fluids, analgesia; transfer to the OR; **FFP and P.C** if unstable

@notes
- در صورت وجود علائم Hard sign مانند: نبودن نبض، ایسکمی اندام، هماتوم گسترش‌یابنده، خونریزی ضربان‌دار، بروئی یا تریل روی شریان: ویزیت اورژانس جراحی و اقدامات اورژانس لازم مانند PO، HM، IV line، سرم تراپی، مسکن و انتقال به اتاق عمل اورژانس.

@variant plimb-openfx
name: Open fracture (wound > 1 cm)
level: II
source: B
meta: Imp: Penetrating limb injury with fracture
refs: boast-openfx-2017

@scenario
مردی ۳۳ ساله با شکستگی باز تیبیا و زخم ۳ سانتی‌متری پوست (گوستیلو II/III) پس از تصادف موتور؛ آلوده. نبض‌ها سالم است.

@why
شکستگی باز با زخم بزرگ‌تر از ۱ سانتی‌متر است؛ آنتی‌بیوتیک وسیع‌تر.

@orders
- CVS / NPO / CBR; supine
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- **X-ray AP & lateral** of the injured limb (wrist, forearm, elbow, arm: AP/lat. Palm, foot: AP/oblique. Ankle, leg, knee, thigh: AP/lat. Shoulder: AP)
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion
- Analgesic; **splint** the limb
- After the above: **emergency OR** for exploration, irrigation, dressing
- Amp **Gentamicin 80 mg** IV stat, **added** (fracture with skin laceration larger than 1 cm, grades II and III)

@branch
if: **Cefazolin allergy**
- Use Amp **Clindamycin 600 mg** IV instead

@branch
if: Life-threatening signs: massive bleeding, hemorrhagic shock, abnormal pulses or neurological signs
- Surgery visit, resuscitation, emergency color-Doppler
- IV line ×2 large; N/S 1 L stat
