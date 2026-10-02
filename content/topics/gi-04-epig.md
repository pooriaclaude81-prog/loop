@topic epig
cluster: gi
name: Epigastric / RUQ pain — undifferentiated
name_fa: درد اپیگاستر / RUQ (بدون تشخیص مشخص)
source: B
keywords: cholecystitis cholangitis perforation aaa mesenteric hub
refs: tg18, acg-pancreatitis-2024

@guide
# ایده کلی
درد اپیگاستر و RUQ فهرست طولانی دارد: گاستریت، پانکراتیت، کوله‌سیستیت، کلانژیت، سوراخ‌شدن زخم، آنوریسم آئورت، ایسکمی مزانتر، DKA، MI تحتانی. اول بیمار بدحال را از بیمار پایدار جدا کنید [^tg18].
# دستورهای پایه
آزمایش کامل (آنزیم‌ها، لاکتات، βHCG)، ECG (MI تحتانی)، CXR ایستاده یا گرافی دکوبیتوس، سونوگرافی صفراوی و مسکن.
# اگر بیمار بدحال است
شوک یا افت فشار مقاوم: سطح ۱، RUSH، و آنتی‌بیوتیک وسیع‌الطیف از ابتدا.
# اگر بیمار پایدار است
- کوله‌سیستیت: تازوسین.
- پانکراتیت عفونی یا با کلانژیت: سیپروفلوکساسین + مترونیدازول یا تازوسین [^acg-pancreatitis-2024].
- اگر علت مشخص نشد و بیمار باردار نیست، CT شکم.

@variant epig-hub
name: Work-up and branches (hub)
level: II
source: B
meta: Imp: R/O gastritis, pancreatitis, GIB / AAA, cholangitis, cholecystitis, cholelithiasis, mesenteric ischemia, DKA, perforation, obstruction, hepatitis · C: I/II/III
refs: tg18

@scenario
مردی ۵۷ ساله هشت ساعت است درد اپیگاستر و ربع فوقانی راست دارد، با تهوع. فشار 128/76، نبض 96، دما 37.8 و RUQ حساس است. هنوز علت مشخص نیست. دستورهای پایه را بنویسید و از روی شاخه‌ها جلو بروید.

@why
وقتی علت درد فوقانی شکم روشن نیست، اول بیمار بدحال را جدا می‌کنیم و بعد علت را از هاب می‌یابیم.

@orders
- CVS / NPO / CBR; semi-sitting; bed-side guard + fixed relative
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, CPK, LDH, Trop, VBG, AST, ALT, ALP, Bili (D & T), amylase, lipase, BS, **lactate**. **βHCG in women of childbearing age.**
- PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%
- CXR; if he can stand an upright CXR, **if not a left lateral decubitus abdominal film** (for suspected visceral perforation, perforated peptic ulcer, obstruction or foreign body)
- ECG; BS glucometry
- IV line fix; N/S 1 L IV stat, free infusion
- **Ultrasound of gallbladder, liver, bile ducts**
- Amp Ranitidine 50 mg IV stat; Amp Ondansetron 4 mg IV stat
- Amp **Morphine 3 mg** IV slow

@branch
if: **Shock**, refractory hypotension, ↓LOC
- Move at once to resus (Level I)
- **RUSH exam** by emergency medicine
- Intubation if needed
- Start **broad-spectrum antibiotics** at once

@branch
if: **Peritonitis** / acute surgical abdomen
- **Surgical consult**

@branch
if: **Acute cholecystitis**
- Amp **Tazocin 3.375 g** IV infusion

@branch
if: **Pancreatitis**
go: panc-mild, panc-modsevere, panc-infected

@branch
if: Pancreatitis that is **infected / necrotizing, or with cholangitis**
- **Ciprofloxacin 400 mg + metronidazole 500 mg** IV stat
- **or Tazocin 3.375 g**
- **or ceftriaxone 1 g + metronidazole 500 mg**

@branch
if: Diagnosis still unclear, non-pregnant
- **Abdominal CT scan** is advised to find the cause of pain

@branch
if: GI bleed / AAA
go: gib-stable

@branch
if: DKA
go: dyspnea-hub

@notes
- در بیماران با درد شکم و شوک، هیپوتانسیون مقاوم به درمان، کاهش سطح هوشیاری، بیمار فوراً به احیا منتقل شده در سطح یک قرار گرفته و اقدامات فوراً درمانی آغاز می‌شود.
- RUSH Exam توسط طب اورژانس انجام شده، در صورت نیاز اینتوباسیون انجام شود.
- آنتی‌بیوتیک در بیماران شوک از ابتدا وسیع‌الطیف شروع شود. در کوله‌سیستیت حاد آمپول تازوسین ۳.۳۷۵ gr انفوزیون IV شود.
- CT اسکن در خانم‌های غیرباردار و سایر افراد به شرطی که علت درد ناشناخته بماند جهت پیدا کردن علت درد توصیه می‌شود.
