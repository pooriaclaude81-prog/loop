@topic pchest
cluster: trauma
name: Penetrating chest trauma
name_fa: ترومای نافذ قفسه سینه
source: B
keywords: stab chest tube pneumothorax hemothorax
refs: atls-11

@guide
# ایده کلی
زخم نافذ قفسه سینه می‌تواند باعث پنوموتوراکس، هموتوراکس یا تامپوناد شود. بیمار ناپایدار نیاز به احیا و درمان فوری دارد [^atls-11].
# دو مسیر
- **ناپایدار** (افت هوشیاری، SpO2 زیر ۹۰، فشار پایین، صدای ریه یک‌طرفه کم، دیسترس): اتاق احیا، ATLS، سوزن‌گذاری یا چست‌تیوب، آمادگی توراکوتومی.
- **پایدار:** CXR یا eFAST (حساس‌تر برای PTX)؛ اگر معاینه نرمال و زخم سطحی، CT لازم نیست.
# نکته
شکستگی سه دنده پایین با آسیب شکمی (کلیه، کبد، طحال) همراه است.

@variant pchest-unstable
name: Unstable → resuscitation
level: I
source: B
meta: Imp: Penetrating chest trauma · C: II (→ Level I when unstable) · NPO · CBR · supine
refs: atls-11

@scenario
مردی ۲۸ ساله با چاقو به قفسه سینه چپ زخمی شده است. تنفس 36، SpO2 برابر 82٪، فشار 78/44، نبض 130، صدای ریه چپ شنیده نمی‌شود، وریدهای گردن متسع و هوشیاری کم. پنوموتوراکس فشارنده یا هموتوراکس ماسیو.

@why
ناپایدار است؛ اتاق احیا و کارهای نجات‌دهنده (چست‌تیوب، سوزن، توراکوتومی).

@orders
- CVS / NPO / CBR; supine
- Labs: CBC/diff, BUN/Cr, PT, PTT, INR, BG/Rh, **Troponin**, VBG, Na, K
- CXR; **FAST / eFAST** (more sensitive than CXR for pneumothorax)
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- IV line
- Serum N/S **1 L** IV stat, free infusion
- ECG
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion (if there is a laceration)
- Amp Ranitidine 50 mg IV stat; check **Hb/Hct every 6 h**
- Amp **Morphine 3 mg** IV slow over 2 min (if needed)
- **Move to the resuscitation room**, ATLS protocol
- IV line ×2 **large**
- Resuscitation and intubation equipment at the bedside
- **Needle thoracostomy** with a grey (16G) cannula, prepared and done
- **Chest-tube equipment** at the bedside
- **Emergency thoracotomy equipment** at the bedside
- Reserve **2 U P.C** and **2 U FFP**, iso-group iso-Rh (as needed for severity)
- **Emergency surgery visit**
- Foley catheter fix; control I/O; NGT fix; protected bed

@branch
if: Instability: ↓LOC, SpO2 ≤ 90%, BP ≤ 90, weak pulses, tachycardia, delayed capillary refill, absent unilateral breath sounds with BP drop, severe dyspnea, cardiac arrhythmia, active cardiac bleeding, sucking wound, likely massive hemothorax, tension pneumothorax
- Level I, resuscitation room, ATLS

@branch
if: Shock
- Check **lactate**; **βHCG** in women of childbearing age
- Portable CXR

@notes
- ناپایداری بیمار شامل: کاهش سطح هوشیاری، O2SAT ≤ ۹۰٪، BP ≤ ۹۰، نبض‌های ضعیف و تاکی‌کاردی و پرشدگی مویرگی تأخیری، کاهش صدای یک‌طرفه همراه با افت BP، دیسترس تنفسی شدید، دیس ریتمی قلبی، خونریزی فعال قلبی، زخم مکنده، احتمال هموتوراکس ماسیو و PTX فشارنده.

@variant pchest-stable
name: Stable
level: II
source: B
meta: Imp: Penetrating chest trauma · C: II · stable
refs: atls-11

@scenario
مردی ۲۵ ساله با زخم کوچک چاقو در قفسه راست، SpO2 برابر 97٪، صدای دو ریه برابر، بدون تنگی نفس و درد قفسه، فشار 130/80 و هوشیار است. شاید پنوموتوراکس کوچک باشد.

@why
پایدار است؛ CXR یا eFAST و پایش کافی است و CT معمولاً لازم نیست.

@orders
- CVS / NPO / CBR; supine
- Labs: CBC/diff, BUN/Cr, PT, PTT, INR, BG/Rh, **Troponin**, VBG, Na, K
- CXR; **FAST / eFAST** (more sensitive than CXR for pneumothorax)
- HM, PO (cardiac monitor, pulse oximetry)
- O2 by **non-rebreather mask 8–10 L/min** if SpO2 ≤ 90%
- IV line
- Serum N/S **1 L** IV stat, free infusion
- ECG
- Amp **Td 0.5 mL** IM stat, **if indicated** (see the [[tetanus-table|tetanus table]]; not needed if the vaccination is complete)
- Amp **Tetabulin (tetanus immunoglobulin) 250 IU** IM stat, **if indicated**.
- Amp **Cefazolin 1 g** IV infusion (if there is a laceration)
- Amp Ranitidine 50 mg IV stat; check **Hb/Hct every 6 h**
- Amp **Morphine 3 mg** IV slow over 2 min (if needed)
- **Chest CT**, if needed (more sensitive than CXR)
- Reserve P.C and FFP only if the trauma is severe; **not needed** if he is fully stable, alert, with a normal exam and a **superficial** wound

@branch
if: Stable patient with: **no unilateral decreased breath sounds, SpO2 ≥ 94%, no severe rib or sternum tenderness, no LOC, non-toxic, no arrhythmia or chest pain, no dyspnea, fully alert**
- A plain **CXR is enough**; **no CT** needed (saves costs)

@branch
if: Lacerations
- Cefazolin

@branch
if: Patient deteriorates
go: pchest-unstable

@branch
if: Fractures of the **lower three ribs**
- Intra-abdominal injury to the kidney, liver, spleen is likely; **more than three** rib fractures need **permanent admission**

@notes
- در صورت شکستگی در سه دنده‌ی تحتانی احتمال آسیب‌های داخل شکمی به کلیه، کبد، طحال زیاد است و در صورت شکستگی بیشتر از سه دنده از مجموع دنده‌ها بستری دائم لازم است.
