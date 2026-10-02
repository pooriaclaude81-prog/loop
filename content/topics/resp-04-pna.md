@topic pna
cluster: resp
name: Pneumonia
name_fa: پنومونی
source: B
keywords: cap hcap aspiration pcp aids ceftriaxone azithromycin levofloxacin vancomycin
refs: ats-cap-2025, ats-idsa-cap-2019, ssc-2026

@guide
# ایده کلی
پنومونی عفونت پارانشیم ریه است. انتخاب آنتی‌بیوتیک بستگی دارد به اینکه بیمار از کجا آمده و چقدر بدحال است [^ats-cap-2025].
# پنج نسخه
- **CAP ساده (بستری عادی):** سفتریاکسون + آزیترومایسین (یا لووفلوکساسین).
- **شدید (ICU):** پوشش وسیع‌تر، وانکومایسین در سپسیس یا MRSA، و درمان شوک با مایع و وازوپرسور [^ssc-2026].
- **مرتبط با مراقبت سلامت (HCAP):** مثل بیماران همودیالیزی یا آسایشگاهی؛ پوشش گرم‌منفی و MRSA.
- **آسپیراسیون:** آنتی‌بیوتیک فقط اگر تب جدید، پیشرفت ارتشاح بعد از ۳۶ ساعت یا بدتر شدن بالینی دارد.
- **ایدز / PCP:** کوتریموکسازول اضافه می‌شود و کورتون با شرایطی (PaO2 زیر ۷۰).
# نکات
- کشت خون فقط در موارد خاص (نقص ایمنی، سپسیس شدید، ...).
- ایزوله کردن اگر احتمال TB هست.
- نمره CURB-65 به تصمیم بستری کمک می‌کند [^ats-idsa-cap-2019].

@variant pna-cap
name: Community-acquired (ward)
level: II
source: B
meta: Imp: Pneumonia (CAP) · C: I, II or III by clinical picture
refs: ats-cap-2025

@scenario
مردی ۵۵ ساله سه روز تب، سرفه خلط‌دار و درد پلورتیک سمت راست دارد. دمای 38.8، تنفس 22، SpO2 93٪، فشار 128/78. کراکل در قاعده راست و در CXR ارتشاح لوب تحتانی راست دیده می‌شود. بیماری زمینه‌ای ندارد و از خانه آمده است.

@why
CAP متوسط با نیاز به بستری عادی است؛ ترکیب سفتریاکسون و ماکرولید کافی است.

@orders
- CVS / NPO / CBR; semi-sitting
- Labs: CBC, BUN/Cr, VBG (blood cultures only for: immunocompromised, severe sepsis / shock, endovascular-infection risk, cavitation)
- PO + HM (always in pneumonia)
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- CXR
- IV line fix; N/S 1 L over 12 h
- Bed-side guard + fixed relative
- ECG
- Amp **Ceftriaxone 1 g** IV stat, then every 24 h
- **+** Cap **Azithromycin 500 mg** PO stat, then every 24 h
- **or** Amp **Levofloxacin 750 mg** IV stat, then every 24 h

@branch
if: TB risk (see the isolation list in the notes)
- Isolate the patient when: contact with a TB case; cough with immunosuppression or HIV; alcoholics, IV drug users, homeless; patients from TB-endemic regions.

@branch
if: Older age or comorbidity
- A **chest CT** is preferred

@branch
if: Severe features: CURB-65 ≥ 3, sepsis, shock
go: pna-severe

@notes
- CURB-65: Confusion، BUN > 20، RR > 30، BP < 90، سن ≥ 65. سه امتیاز یا بیشتر = دسته B (نیاز به بستری در ICU).
- CXR برای همه لازم نیست اما به صورت کلی می‌توان CXR انجام داد.
- روتین انجام آزمایشات خاصی الزامی نیست؛ در موارد شدید CBC/diff، BUN/Cr، LFT، Na، K و ABG لازم است. Procalcitonin، CRP و ESR به صورت کلی کمک‌کننده نیستند.
- ایزوله کردن بیماران: تماس با فرد مبتلا به TB، بیماران با سرفه و HIV مثبت، نقص ایمنی با سرفه، الکلی، IVDU، بی‌خانمان، مهاجرین از مناطق شایع TB.
- بیماران پنومونی با اسیدوز متابولیک یا اختلال LFT و BUN/Cr بستری شوند.

@variant pna-severe
name: Severe pneumonia (ICU)
level: I
source: B
meta: Imp: Severe pneumonia · category B (needs ICU)
refs: ssc-2026

@scenario
مردی ۶۶ ساله با سپسیس: تب، تنفس 34، فشار 84/50، گیج، SpO2 84٪ و ارتشاح دوطرفه. نمره CURB-65 برابر 4 است و احتمالاً به وازوپرسور و تهویه مکانیکی نیاز پیدا می‌کند.

@why
پنومونی شدید با سپسیس است؛ پوشش آنتی‌بیوتیک وسیع‌تر، مایع و وازوپرسور و آمادگی برای ICU لازم است.

@orders
- CVS / NPO / CBR; semi-sitting
- Labs: CBC, BUN/Cr, VBG (blood cultures only for: immunocompromised, severe sepsis / shock, endovascular-infection risk, cavitation)
- PO + HM (always in pneumonia)
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- CXR
- IV line fix; N/S 1 L over 12 h
- Bed-side guard + fixed relative
- ECG
- Amp **Ceftriaxone 1 g** IV infusion every 24 h
- Amp **Levofloxacin 750 mg** IV infusion every 24 h
- Amp **Vancomycin 1 g** IV in 250 mL N/S **over 1 h**, every 12 h
- Consider **aggressive fluid therapy**
- Consider **vasopressor**
- Consider **blood transfusion** if needed, per the septic-shock algorithm
- Consider **intubation and mechanical ventilation** if needed

@branch
if: Cyanosis, apnea, severe respiratory distress, severe agitation, septic shock, low SpO2, entirely abdominal breathing, confusion, PCO2 > 100, hemodynamic instability
- Level I, resuscitation room, **intubation considered**, resuscitation + intubation equipment at the bedside

@branch
if: Why vancomycin: severe pneumonia with sepsis, contact with MRSA, or necrotizing pneumonia on imaging
- Vancomycin as above

@variant pna-hcap
name: Health-care-associated (HCAP)
level: II
source: B
meta: Imp: Pneumonia (HCAP)
refs: ats-idsa-cap-2019

@scenario
مردی ۷۰ ساله ساکن آسایشگاه و تحت همودیالیز تب و سرفه خلط‌دار دارد. ماه گذشته سه روز بستری بوده است. عامل خطر HCAP دارد (آسایشگاه، بستری اخیر، دیالیز).

@why
خطر عوامل مقاوم بیشتر است؛ پوشش گرم‌منفی و MRSA هم لازم است.

@orders
- CVS / NPO / CBR; semi-sitting
- Labs: CBC, BUN/Cr, VBG (blood cultures only for: immunocompromised, severe sepsis / shock, endovascular-infection risk, cavitation)
- PO + HM (always in pneumonia)
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- CXR
- IV line fix; N/S 1 L over 12 h
- Bed-side guard + fixed relative
- ECG
- Amp **Cefepime 2 g** IV infusion every 12 h
- Amp **Ciprofloxacin 500 mg** IV infusion every 12 h
- Amp **Vancomycin 1 g** IV infusion every 12 h, in 250 mL N/S **over 1 h**

@variant pna-aspiration
name: Aspiration pneumonia
level: II
source: B
meta: Imp: Aspiration pneumonia
refs: ats-idsa-cap-2019

@scenario
مردی ۵۸ ساله و الکلی بعد از استفراغ خواب‌آلود پیدا شده است. یک روز بعد تب کرده و در CXR ارتشاح لوب تحتانی راست دارد.

@why
در آسپیراسیون آنتی‌بیوتیک فقط با معیارهای خاص شروع می‌شود و پوشش بی‌هوازی هم لازم است.

@orders
- CVS / NPO / CBR; semi-sitting
- Labs: CBC, BUN/Cr, VBG (blood cultures only for: immunocompromised, severe sepsis / shock, endovascular-infection risk, cavitation)
- PO + HM (always in pneumonia)
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- CXR
- IV line fix; N/S 1 L over 12 h
- Bed-side guard + fixed relative
- ECG
-- Antibiotics only if: new fever, infiltrate worse after 36 h, or unexplained clinical deterioration
- Amp **Ceftriaxone 1 g** IV infusion every 24 h
- **+** Cap **Azithromycin 500 mg** PO stat, every 24 h
- **+** Amp **Clindamycin 600 mg** IV stat **or** Amp **Metronidazole 400 mg** IV stat (anaerobic cover)

@branch
if: Alternative to the three antibiotics above
- **Ertapenem** or **Tazocin** alone

@variant pna-pcp
name: AIDS: PCP
level: II
source: B
meta: Imp: Pneumonia in AIDS, PCP
refs: ats-idsa-cap-2019

@scenario
مردی ۳۸ ساله مبتلا به HIV سه هفته است سرفه خشک و تنگی نفس پیشرونده دارد. با فعالیت SpO2 افت می‌کند، LDH بالاست و در CXR ارتشاح بینابینی دوطرفه دیده می‌شود. به PCP فکر کنید.

@why
در بیمار ایدزی علاوه بر درمان معمول، کوتریموکسازول و در صورت هیپوکسی شدید کورتون لازم است.

@orders
- CVS / NPO / CBR; semi-sitting
- Labs: CBC, BUN/Cr, VBG (blood cultures only for: immunocompromised, severe sepsis / shock, endovascular-infection risk, cavitation)
- PO + HM (always in pneumonia)
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- CXR
- IV line fix; N/S 1 L over 12 h
- Bed-side guard + fixed relative
- ECG
- Treat as for CAP / HCAP / aspiration according to category A, B or C, **plus**:
- Amp **Cotrimoxazole (TMP-SMX) 240/1200 mg** IV every 6 h

@branch
if: PaO2 < 70, or A-a gradient > 35 mmHg
- **Corticosteroid** is indicated in AIDS-related PCP

@notes
- در مواردی که AIDS مطرح است و یا کاویته در ریه همراه با LDH بالا داریم باید به PCP توجه کرد.
