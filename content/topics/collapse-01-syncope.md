@topic syncope
cluster: collapse
name: Syncope
name_fa: سنکوپ (غش)
source: AB
keywords: faint collapse loss of consciousness
refs: syncope-2017, esc-syncope-2018

@guide
# ایده کلی
سنکوپ یعنی از دست رفتن گذرای هوشیاری به‌خاطر کاهش جریان خون مغز، با برگشت کامل و سریع. بیشتر موارد خوش‌خیم (رفلکسی، ارتواستاتیک) است، ولی بخشی ناشی از مشکل قلبی کشنده است [^syncope-2017].
# تمام کار: ریسک‌بندی
- **کم‌خطر:** جوان، بدون سابقه قلبی، زمینه روشن (ایستادن طولانی، گرما)، معاینه و ECG نرمال.
- **پرخطر (بستری و مانیتور):** درد قفسه، تنگی نفس، نارسایی قلبی، آریتمی بطنی، QT طولانی، بلوک جدید، سن بالای ۶۵، سابقه مرگ ناگهانی خانوادگی، سنکوپ حین ورزش یا خوابیده.
# سرنخ‌های خاص
شکم‌درد (آنوریسم آئورت، حاملگی خارج رحمی)، سیاه‌مدفوعی (خونریزی گوارشی)، سابقه آمبولی (D-dimer)، مسمومیت، در زنان βHCG [^esc-syncope-2018].

@variant syncope-lowrisk
name: Low-risk syncope
level: II
source: AB
meta: Imp: Syncope, faint · C: II · NPO · CBR · supine
refs: syncope-2017

@scenario
خانمی ۲۲ ساله بعد از ایستادن طولانی در یک اتاق گرم غش کرده است. قبلش احساس گرمی و تاری دید داشته و سریع به هوش آمده است. سابقه قلبی ندارد، در خانواده مرگ ناگهانی نبوده، درد قفسه ندارد و معاینه، فشار و ECG نرمال است.

@why
ریسک پایین است؛ بررسی پایه کافی است و بستری لازم نیست.

@orders
- CVS / NPO / CBR; supine
- IV line fix
- Labs: CBC/diff, BUN/Cr, Na, K. @B Also Ca, Ph, Mg, Alb, PT, PTT, INR, Trop.
- BS glucometry
- **ECG**
- PO & HM (cardiac monitoring + pulse oximetry)
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%
- Bed-side guard + fixed relative
- @A Serum N/S 500 mL IV stat
- Spiral brain CT without contrast, only for focal deficit, head injury or suspected first seizure @B
- CXR PA, if aortic dissection is suspected @A
- @B Amp Ranitidine 50 mg IV stat

@branch
if: Any of the high-risk features appears
go: syncope-highrisk

@variant syncope-highrisk
name: High-risk → admit and monitor
level: II
source: AB
meta: Imp: Syncope, high risk
refs: syncope-2017

@scenario
مردی ۷۱ ساله با نارسایی قلبی حین راه رفتن، بدون هیچ علامت هشداری غش کرده است. نبض 40 و در ECG بلوک شاخه جدید دارد، فشار 105/60. پدرش در ۵۰ سالگی ناگهان فوت کرده است. یا: غش حین ورزش، یا خوابیده، یا همراه با درد قفسه.

@why
پرخطر است؛ باید بستری و مانیتور شود و قلب‌شناس ببیند.

@orders
- CVS / NPO / CBR; supine
- IV line fix
- Labs: CBC/diff, BUN/Cr, Na, K. @B Also Ca, Ph, Mg, Alb, PT, PTT, INR, Trop.
- BS glucometry
- **ECG**
- PO & HM (cardiac monitoring + pulse oximetry)
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%
- Bed-side guard + fixed relative
- @A Serum N/S 500 mL IV stat
- Spiral brain CT without contrast, only for focal deficit, head injury or suspected first seizure @B
- CXR PA, if aortic dissection is suspected @A
- @B Amp Ranitidine 50 mg IV stat
- Admit to a **monitored bed**
- Cardiology consult

@branch
if: Admit and monitor if ANY of: chest pain, unexplained dyspnea, CHF, valvular disease, ventricular arrhythmia, prolonged QT, new BBB, age > 65, family history of sudden death, diabetes, syncope during activity, syncope in the supine position
- Admit to a monitored bed

@notes
- سنکوپ در موارد زیر بستری و مانیتور شود: همراهی با درد سینه، تنگی نفس توجیه‌نشده، CHF، بیماری‌های دریچه‌ای، دیس ریتمی‌های بطنی، طولانی شدن QT، BBB جدید، افراد بیشتر از ۶۵ سال، سابقه مرگ ناگهانی در خانواده، DM، سنکوپ حین فعالیت، سنکوپ در حالت خوابیده.

@variant syncope-special
name: Special branches (hub)
level: II
source: B
meta: Add to the base orders when the finding is present.
refs: esc-syncope-2018

@scenario
بیمار با غش و یک سرنخ اضافه: شکم‌درد، شک به آمبولی ریه، مسمومیت احتمالی، مدفوع سیاه، یا کمبود عصبی. یا زن در سن باروری.

@why
در هر کدام از این سرنخ‌ها یک آزمایش یا بررسی اضافه می‌خواهیم.

@branch
if: **Woman of childbearing age**
- **βHCG**

@branch
if: Suspected **PE**
- **D-dimer**

@branch
if: Suspected **poisoning**
- Drug screen and **toxin panel**

@branch
if: Neurological deficit, suspected first seizure, or abnormal neuro exam
- Do a full neurological exam; brain CT

@branch
if: Suspected **GI bleeding**
- **Rectal exam** to rule out GI bleeding
go: gib-stable

@branch
if: Syncope with **abdominal pain**
- Consider **aortic aneurysm, MI, ectopic pregnancy, hemorrhagic cyst**

@branch
if: Suspected **aortic dissection**
- CXR PA
go: chestpain-redflag

@notes
- در خانم‌های سنین باروری βHCG چک شود. در موارد شک به PTE، D-dimer ارسال شود. در شک به مسمومیت‌ها، Screen دارویی و toxin panel ارسال شود.
- معاینه TR (رکتال) برای رد GIB ضروری است.
