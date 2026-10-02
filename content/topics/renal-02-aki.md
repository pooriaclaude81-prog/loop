@topic aki
cluster: renal
name: Acute kidney injury (AKI)
name_fa: آسیب حاد کلیه (AKI)
source: B
keywords: prerenal postrenal dialysis oliguria
refs: kdigo-aki-2012, kdigo-aki-2026

@guide
# ایده کلی
AKI یعنی افت سریع کارکرد کلیه. اول سه علت را از هم جدا کنید [^kdigo-aki-2012]:
- **پره‌رنال:** کم‌آبی، اسهال، استفراغ، نارسایی قلبی، خونریزی. درمان: مایع کافی.
- **پست‌رنال:** انسداد. درمان: سوند فولی و برداشتن علت انسداد.
- **رنال:** داروی نفروتوکسیک، کنتراست، ATN و ... مایع محدود و حمایت.
# اولین کار
در هر AKI یا CKD اول هیپرکالمی و ادم ریه را بررسی کنید؛ هر دو سریع کشنده‌اند.
# دیالیز اورژانس
هیپرکالمی مقاوم، اسیدوز، اورمی با پریکاردیت یا آنسفالوپاتی، overload مایع، ادم ریه مقاوم یا مسمومیت‌های دیالیزپذیر [^kdigo-aki-2026].

@variant aki-prerenal
name: Pre-renal (dehydrated)
level: II
source: B
meta: Imp: AKI, pre-renal · C: II
refs: kdigo-aki-2012

@scenario
مردی ۶۶ ساله سه روز اسهال و استفراغ داشته است. مخاط خشک، فشار 98/60، نبض 108 و کراتینین 3.4 (پایه 1.0) و ادرار کم.

@why
علت کم‌آبی است؛ مایع کافی و سریع اصل درمان است.

@orders
- CVS / NPO / RBR; supine
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, UA, **FeNa, urine Na**, HBsAg, HCV Ab, HIV Ab (viral markers in case dialysis is needed)
- PO & HM; O2 by nasal cannula if SpO2 ≤ 90%
- Bed-side guard + fixed relative; CXR; ECG
- **Kidney and urinary tract sonography**
- **Foley catheter** fix (relieves obstruction and measures output); **control I/O**
- Serum **N/S 1 L IV stat**, repeat as needed until out of dehydration

@branch
if: Pre-renal causes: diarrhea, vomiting, heart failure, burns, surgery, fever, trauma, GI bleeding
- Fluids as above, **rapid and adequate**

@branch
if: Hyperkalemia or pulmonary edema first
- In any patient with AKI or CKD consider **hyperkalemia and pulmonary edema first**; treat urgently
go: hyperk-ecg, ape-perfused

@branch
if: Still oliguric after volume correction
- Amp **Lasix** or **Mannitol**

@variant aki-postrenal
name: Post-renal (obstruction)
level: II
source: B
meta: Imp: AKI, post-renal
refs: kdigo-aki-2012

@scenario
مردی ۷۲ ساله ۱۲ ساعت است ادرار نکرده، مثانه لمس می‌شود، درد بالای عانه دارد و BPH دارد. کراتینین 4.

@why
علت انسداد ادراری است؛ سوند فولی انسداد را برطرف می‌کند.

@orders
- CVS / NPO / RBR; supine
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, UA, **FeNa, urine Na**, HBsAg, HCV Ab, HIV Ab (viral markers in case dialysis is needed)
- PO & HM; O2 by nasal cannula if SpO2 ≤ 90%
- Bed-side guard + fixed relative; CXR; ECG
- **Kidney and urinary tract sonography**
- **Foley catheter** fix (relieves obstruction and measures output); **control I/O**
- The **Foley catheter** relieves the obstruction
- If he stays admitted and needs fluid: **maintenance 1/3–2/3, 1 L every 8 h**

@variant aki-intrinsic
name: Intrinsic renal / normal hydration
level: II
source: B
meta: Imp: AKI, renal
refs: kdigo-aki-2012

@scenario
مردی ۵۴ ساله بعد از تصویربرداری با کنتراست و مصرف NSAID، حجمش نرمال، فشار 140/90 و کراتینین از 2.1 به 3.6 رسیده؛ استوانه‌های گرانولار در ادرار.

@why
آسیب داخل کلیه (ATN) است؛ حجم را متعادل نگه می‌داریم و حمایت می‌کنیم.

@orders
- CVS / NPO / RBR; supine
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, UA, **FeNa, urine Na**, HBsAg, HCV Ab, HIV Ab (viral markers in case dialysis is needed)
- PO & HM; O2 by nasal cannula if SpO2 ≤ 90%
- Bed-side guard + fixed relative; CXR; ECG
- **Kidney and urinary tract sonography**
- **Foley catheter** fix (relieves obstruction and measures output); **control I/O**
- Serum **N/S 250 mL + the urine output**, every 8 h
- If still oliguric once volume is corrected: Amp **Lasix** or **Mannitol**

@variant aki-dialysis
name: Emergency dialysis indications
level: I
source: B
meta: Imp: AKI / CKD, urgent dialysis · Level I
refs: kdigo-aki-2012

@scenario
مردی ۶۰ ساله با پتاسیم 7.1، کراتینین 9، BUN برابر 120، گیجی و ادم ریه که به دیورتیک جواب نداده است.

@why
اندیکاسیون دیالیز اورژانس دارد؛ درمان هم‌زمان هیپرکالمی و ادم ریه و مشاوره نفرولوژی.

@orders
- CVS / NPO / RBR; supine
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, UA, **FeNa, urine Na**, HBsAg, HCV Ab, HIV Ab (viral markers in case dialysis is needed)
- PO & HM; O2 by nasal cannula if SpO2 ≤ 90%
- Bed-side guard + fixed relative; CXR; ECG
- **Kidney and urinary tract sonography**
- **Foley catheter** fix (relieves obstruction and measures output); **control I/O**
- Send HBsAg, HCV Ab, HIV Ab if not already sent
- Treat hyperkalemia and pulmonary edema now (see [[hyperk-ecg|hyperkalemia]] and [[ape-perfused|pulmonary edema]])
- Nephrology consult for **emergency dialysis**

@branch
if: **Dialysis indications**: treatment-resistant hyperkalemia; refractory hypertension; uncontrollable pulmonary edema; encephalopathy; fluid overload; pericarditis; BUN > 100; refractory electrolyte disorders; dangerous poisonings (lithium, methanol, aspirin, ethylene glycol, theophylline)
- Emergency dialysis

@notes
- اندیکاسیون‌های دیالیز اورژانس: هیپرکالمی مقاوم به درمان، HTN، ادم ریه غیرقابل کنترل، منجر به انسفالوپاتی، overload مایع، پریکاردیت، BUN > ۱۰۰، اختلالات الکترولیتی مقاوم به درمان، مسمومیت‌های خطرناک و کشنده ناشی از لیتیوم، متانول، آسپیرین، اتیلن گلیکول، تئوفیلین.
