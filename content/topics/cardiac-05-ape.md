@topic ape
cluster: cardiac
name: Acute pulmonary edema
name_fa: ادم حاد ریه
source: AB
keywords: chf heart failure lasix furosemide nitroglycerin tng morphine norepinephrine dhf
refs: esc-hf-2026, aha-hf-2022

@guide
# ایده کلی
در ادم حاد ریه مایع از عروق ریه به آلوئول‌ها نشت می‌کند و بیمار غرق می‌شود. معمولاً علت، نارسایی قلب (یا فشار بالا، ایسکمی، آریتمی) است [^esc-hf-2026].
# اول فشار خون را ببینید
- **فشار خوب (بالای ۹۰):** بیمار «خیس و گرم» است. نیتروگلیسرین (پیش‌بار را می‌کاهد)، دیورتیک وریدی (فوروزماید) و در صورت لزوم مورفین با احتیاط. بیمار نشسته، O2 یا NIV.
- **فشار پایین یا شوک:** بیمار «خیس و سرد» است. نیتروگلیسرین و دوز بزرگ دیورتیک خطرناک است. اینوتروپ یا وازوپرسور (نوراپی‌نفرین) و گاهی بولوس کوچک مایع.
# چیزهایی که باید دنبالش بگردید
علت تشدید: ایسکمی/STEMI، AF سریع، برادی‌کاردی، تب و عفونت، قطع دارو، نارسایی کلیه، کم‌خونی (Hb زیر ۸).
# هشدار
نیترات در کسی که اخیراً سیلدنافیل مصرف کرده ممنوع است. اگر بیمار هیپوکسی مقاوم، خستگی تنفسی یا کاهش هوشیاری دارد، اینتوباسیون را زود در نظر بگیرید [^aha-hf-2022].

@variant ape-perfused
name: Good perfusion (SBP > 90)
level: II
source: AB
meta: Imp: Acute pulmonary edema / decompensated heart failure · NPO until stable
refs: esc-hf-2026

@scenario
مردی ۷۲ ساله با سابقه نارسایی قلبی دو شب است که نمی‌تواند دراز بکشد و حالا اصلاً نمی‌تواند نفس بکشد. تنفس 30 در دقیقه، SpO2 86٪ در هوای اتاق، فشار 160/95، نبض 110، کراکل تا قله ریه‌ها و خلط کف‌آلود صورتی. بدنش گرم و عرق‌کرده است.

@why
فشار خوب است، پس می‌توان با نیتروگلیسرین و دیورتیک بار قلب را کم کرد.

@orders
- CVS / NPO (until stable) / CBR. Position: **semi-sitting**, head of bed up.
- IV line fix
- Labs: CBC/diff, Na, K, BUN/Cr, Troponin (0, 6 h), **NT-proBNP**, VBG. @B Also Ca, Ph, Mg, Alb, PT/PTT/INR, D-dimer.
- Cardiac monitoring + pulse oximetry
- ECG (serial)
- @B O2 8–10 L/min if SpO2 ≤ 90%; mask / reservoir / NIV / intubation as the patient needs
- Portable CXR
- Bedside echocardiography (by the emergency resident) @B Lung ultrasound too
- @B BS glucometry if diabetic
- Foley catheter + I/O chart
-- Treatment (adequate perfusion, SBP > 90)
- @B Pearl **TNG 0.4 mg SL** every 5 min
- **Serum TNG 5–10 µg/min** infusion, titrate up rapidly to goal if perfusion is adequate / SBP ≥ 90
- Amp **Morphine sulfate 2–5 mg** IV slow boluses, titrated to effect, with airway support. Especially useful if angina.
- Amp **Furosemide (Lasix) 0.5–1 mg/kg** IV stat
- Bed guard, relative at bedside

@branch
if: SBP falls to ≤ 90 or perfusion poor
go: ape-hypoperfused

@branch
if: Recently took sildenafil (or similar)
- **Avoid nitrates** (refractory hypotension)

@branch
if: Cyanosis, apnea, respiratory distress, agitation, or hypoxia not corrected by high-flow O2
- Level I, move to the resuscitation room, **intubation** (endotracheal), resuscitation + intubation equipment at the bedside

@branch
if: Precipitating factor: fever / COPD / pneumonia / arrhythmia
go: ape-addons

@notes
- اینتوباسیون اندوتراکئال در بیماران آپنه، دیسترس تنفسی، آژیتاسیون و هیپوکسی غیرپاسخ‌دهنده به اکسیژن high flow به کار می‌رود.
- از مصرف نیترات‌ها در بیمارانی که اخیراً مصرف سیلدنافیل داشته‌اند (یا سایر عوامل مشابه) باید اجتناب شود، چرا که منجر به هیپوتانسیون مقاوم خواهد شد.
- همودیالیز در بیماران با نارسایی کلیوی مفید است.
- در صورت Hb < 8 ترانسفوزیون خون مفید است.

@variant ape-hypoperfused
name: Poor perfusion / shock (SBP ≤ 90)
level: I
source: AB
meta: Imp: Acute pulmonary edema with hypoperfusion · Level I
refs: esc-hf-2026

@scenario
خانمی ۶۸ ساله بعد از انفارکتوس قدامی با فشار 80/50، نبض 118، پوست سرد و مرطوب و ادرار کم، کراکل در ریه‌ها دارد. شوک کاردیوژنیک است. نیتروگلیسرین و دوز بزرگ دیورتیک فشارش را باز هم پایین می‌آورد.

@why
در شوک باید اول فشار و پرفیوژن را درست کنیم (نوراپی‌نفرین و ...)، نه اینکه با نیترات بیندازیمش.

@orders
- CVS / NPO (until stable) / CBR. Position: **semi-sitting**, head of bed up.
- IV line fix
- Labs: CBC/diff, Na, K, BUN/Cr, Troponin (0, 6 h), **NT-proBNP**, VBG. @B Also Ca, Ph, Mg, Alb, PT/PTT/INR, D-dimer.
- Cardiac monitoring + pulse oximetry
- ECG (serial)
- @B O2 8–10 L/min if SpO2 ≤ 90%; mask / reservoir / NIV / intubation as the patient needs
- Portable CXR
- Bedside echocardiography (by the emergency resident) @B Lung ultrasound too
- @B BS glucometry if diabetic
- Foley catheter + I/O chart
-- Treatment (SBP ≤ 90)
- @B **Arterial line** if available
- Serum **N/S 250 mL bolus over 5–10 min**, carefully (A: "با احتیاط"), only if hypoperfused
- **Norepinephrine 8–12 µg/min** infusion if SBP < 90 (preferred by B)
- Alternatives: Epinephrine 1–4 µg/min @B; Dopamine 2–20 µg/kg/min or Dobutamine 2–20 µg/kg/min [^esc-hf-2026]
- Resuscitation + intubation equipment at the bedside

@branch
if: Associated severe renal failure
- Keep **access and dialysis equipment** ready (B). Hemodialysis helps patients in renal failure.

@branch
if: STEMI behind the pulmonary edema
go: acs-stemi

@branch
if: SBP rises above 90 with good perfusion
go: ape-perfused

@variant ape-addons
name: Add-ons: arrhythmia, anemia, precipitants
level: I
source: AB
meta: Add these to the perfused or hypoperfused orders when the finding is present.
refs: esc-hf-2026

@scenario
بیمار مبتلا به ادم ریه که یک مشکل دوم هم دارد: فیبریلاسیون دهلیزی سریع، نبض خیلی کند، تاکی‌آریتمی با افت فشار، Hb برابر 6.8، یا تب با ارتشاح ریوی، یا STEMI.

@why
این صفحه افزودنی است: به دستورهای ادم ریه اضافه می‌شود وقتی علت یا عارضه دومی پیدا شده است.

@branch
if: **AF or flutter with rapid response** (rate control)
- @B Digoxin **0.5 mg IV**

@branch
if: **Tachyarrhythmia, PR > 150** with any of: BP < 90, acute drop in consciousness, shock, ischemic chest pain, acute heart failure
- Consider **synchronized shock 100 J**
- DC shock stand-by at the bedside
go: svt-unstable

@branch
if: **Bradycardia, PR < 50** (also with any of the five signs above)
- **Atropine 0.5 mg** stat, repeat up to 6 doses
- If no response to atropine: **dopamine drip** or **external pacemaker** ready

@branch
if: **Hb < 8**
- Transfuse **P.C**, iso-group / iso-Rh

@branch
if: **STEMI**
go: acs-stemi

@branch
if: **Fever** → treat fever. **Pneumonia** → treat pneumonia. **COPD** → treat COPD.
go: pna-cap, copd-modsevere

@branch
if: Severe renal failure
- Access and dialysis equipment ready

@notes
- در موارد وجود تاکی‌دیس‌ریتمی PR>150 همراه با هر یک از موارد: BP<90، افت حاد سطح هوشیاری، علائم شوک، علائم Chest pain ایسکمیک، نارسایی حاد قلبی، شوک سینکرونیزه J100 مدنظر باشد.
- در موارد وجود برادی‌کاردی PR<50 همراه با هر یک از موارد فوق: آتروپین ۰/۵ میلی‌گرم تا شش نوبت. اگر به آتروپین جواب نداد دریپ دوپامین یا پیس‌میکر اکسترنال مدنظر قرار گیرد.
