@topic permcath
cluster: renal
name: Permcath (dialysis catheter) dysfunction
name_fa: اختلال کاتتر دیالیز (پرمکت)
source: B
keywords: alteplase reteplase hemodialysis catheter
refs: kdoqi-va-2019

@guide
# ایده کلی
بیمار دیالیزی با کاتتر که خون نمی‌کشد. اول ببینید دیالیز اورژانس لازم دارد یا نه، چون کاتتر مسدود یعنی راه نجات بسته است [^kdoqi-va-2019].
# اگر دیالیز فوری لازم نیست
- مانور ساده: والسالوا، ترندلنبورگ، کشش ملایم، اصلاح وضعیت دست و گرافی برای کینک.
- شستشوی با فشار با سرنگ ۱۰ سی‌سی سالین.
- اگر باز نشد، ترومبوز: تزریق آلتپلاز یا رتپلاز در هر لومن و صبر ۳۰ تا ۱۲۰ دقیقه.
# اگر دیالیز فوری لازم است
overload شدید، هیپرکالمی کنترل‌نشده، اسیدوز، پریکاردیت، آنسفالوپاتی اورمیک: سطح ۱ و دسترسی عروقی جدید.

@variant permcath-mech
name: Catheter malfunction, not urgent
level: II
source: B
meta: Imp: Permcath dysfunction · C: II
refs: kdoqi-va-2019

@scenario
مردی ۶۲ ساله همودیالیزی آمده چون کاتتر تونل‌دار در پایان جلسه دیالیز خون نکشید و شستشو نشد. حجمش نرمال، پتاسیم 4.8 و اندیکاسیون دیالیز فوری ندارد.

@why
اختلال مکانیکی یا ترومبوز بدون اورژانس دیالیز است؛ مانور، شستشو و در صورت لزوم داروی لیتیک.

@orders
- CVS / NPO / CBR; sitting or semi-sitting
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, VBG; **check K urgently**
- PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- ECG, then CXR after the ECG is seen
- Serum N/S 250 mL + the 6 h urine output, every 8 h
- Bed-side guard + fixed relative
- Reteplase or alteplase vial **ready at the bedside**
-- Stepwise
- Causes: (1) improper position, (2) kinking, (3) intraluminal thrombus, (4) extraluminal thrombus, (5) fibrin sheath
- **First**: Valsalva maneuver, **Trendelenburg** position; gentle traction on the catheter, mild hydration, bring the arm above the clavicle
- **CXR** can show a break, pinch-off, or kink
- **Up-to-date step**: push **forceful saline flushes** with a **10 mL syringe full of N/S** at maximum pressure, repeated several times, before any lytic

@branch
if: Lumen still not open: suspect thrombus
- **Alteplase** (1 mg/mL, diluted with sterile water) to the **volume of each lumen**, instilled in each lumen, **re-check after 2 h**. If it fails, repeat once.
- **or** **Reteplase** (one vial = 18 mg, diluted with 9 mL sterile water, so 1 mL = 2 mg) to the **lumen volume**, instilled, **re-check after 30 min**. If it fails, repeat once.

@branch
if: K > 6
go: hyperk-ecg

@branch
if: Any emergency-dialysis indication
go: permcath-dialysis

@variant permcath-dialysis
name: Urgent dialysis criteria → Level I
level: I
source: B
meta: Imp: Permcath dysfunction with an emergency-dialysis indication · Level I
refs: kdoqi-va-2019

@scenario
مردی ۵۹ ساله با کاتتر مسدود، پتاسیم 6.9، ادم ریه، خواب‌آلودگی و فلپ، اصطکاک پریکارد و BUN برابر 130. به دیالیز از مسیر دیگر نیاز دارد.

@why
اندیکاسیون دیالیز اورژانس دارد؛ سطح ۱ و دسترسی جدید مهم‌تر از باز کردن کاتتر است.

@orders
- CVS / NPO / CBR; sitting or semi-sitting
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, VBG; **check K urgently**
- PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- ECG, then CXR after the ECG is seen
- Serum N/S 250 mL + the 6 h urine output, every 8 h
- Bed-side guard + fixed relative
- **Level I**, dialysis emergency: arrange emergency dialysis (new access) and treat the complications
- Vial reteplase or alteplase ready at the bedside

@branch
if: **Emergency dialysis criteria**: (1) severe fluid overload; (2) resistant HTN; (3) uncontrollable hyperkalemia; (4) intractable nausea / vomiting; (5) severe acidosis resistant to treatment; (6) drowsiness, coma, tremor, seizure, asterixis; (7) pericarditis with tamponade risk; (8) BUN > 70–100; (9) uremic encephalopathy
- Level I; emergency dialysis

@branch
if: K > 6
go: hyperk-ecg
