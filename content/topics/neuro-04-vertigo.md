@topic vertigo
cluster: neuro
name: Vertigo
name_fa: سرگیجه
source: B
keywords: dizziness bppv central peripheral cerebellar
refs: grace3-2023

@guide
# ایده کلی
سرگیجه یا محیطی است (گوش داخلی؛ مثل BPPV، نوریت وستیبولار) یا مرکزی (ساقه یا مخچه؛ مثل سکته و خونریزی). تمام نکته افتراق این دو است [^grace3-2023].
# منطق دستورها
- در نوع محیطی تیپیک، آزمایش و CT لازم نیست؛ ضدتهوع (اندانسترون یا پرومتازین) و مانور درمانی.
- در نوع مرکزی یا مشکوک (ریسک عروقی، سن بالا، سردرد، ناتوانی راه رفتن): CT/MRI، ECG، قند، و بررسی خونریزی مخچه.
- ابزار خوب بالینی HINTS است، ولی فقط برای کسی که آموزشش را دیده [^grace3-2023].
# هشدار
خونریزی مخچه نیاز به نوروسرجری اورژانسی دارد و کنترل فشار با لابتالول.

@variant vertigo-peripheral
name: Peripheral vertigo
level: III
source: B
meta: Imp: Vertigo · C: II (typically III if clearly peripheral)
refs: grace3-2023

@scenario
خانمی ۴۵ ساله با چرخیدن در تخت لحظه‌ای احساس چرخش می‌کند که کمتر از یک دقیقه طول می‌کشد، با تهوع. کم‌شنوایی، سردرد یا علائم عصبی ندارد و راه رفتنش نرمال است. تیپیک BPPV و تست دیکس‌هالپایک مثبت است.

@why
محیطی است؛ آزمایش و CT لازم نیست و درمان علامتی و مانور کافی است.

@orders
- CVS / NPO / CBR; supine
- IV line fix; N/S 1 L every 12 h
- PO & HM
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%
- Bed-side guard + fixed relative
- BS glucometry
- Amp **Ondansetron 4–8 mg** IV stat (or Amp Promethazine 25 mg IM)
- Lab tests other than BS are **not mandatory**. CBC and electrolytes only if syncope is suspected.
- **Brain CT is not needed** when the vertigo is typical, definite and peripheral

@notes
- سرگیجه‌های محیطی: BPPV، سندرم منیر، نوریت وستیبولار، نوروما آکوستیک، لابیرنتیت.
- در افتراق با سرگیجه موارد زیر مدنظر قرار گیرد: دیس ریتمی، MI، هیپوولمی، شوک وازواگال، سپسیس، حمله پانیک، آنمی، عفونت.

@variant vertigo-central
name: Central vertigo / cerebellar hemorrhage
level: II
source: B
meta: Imp: Vertigo, central · C: II
refs: grace3-2023

@scenario
مردی ۶۶ ساله با فشار خون و دیابت ناگهان سرگیجه شدید همراه با استفراغ، ناتوانی در راه رفتن و سردرد پیدا کرده است. نیستاگموس در نگاه به طرفین دارد و فشار 190/110. به سکته یا خونریزی مخچه شک می‌شود.

@why
مرکزی یا مشکوک است؛ تصویربرداری، کنترل فشار و مشاوره سریع نوروسرجری لازم است.

@orders
- CVS / NPO / CBR; supine
- IV line fix; N/S 1 L every 12 h
- PO & HM
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%
- Bed-side guard + fixed relative
- BS glucometry
- Amp **Ondansetron 4–8 mg** IV stat (or Amp Promethazine 25 mg IM)
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, Trop, BS
- **Brain CT**
- CXR
- ECG
- Resuscitation + intubation equipment at the bedside; move only with the resuscitation team

@branch
if: Cerebellar hemorrhage or other ICH suspected
- **Emergency neurosurgery consult**
- If **BP > 180/110**: Amp **Labetalol 20 mg (4 mL)** IV over 2 min, repeat every 10–15 min

@branch
if: Admit if any of: age > 55, AF rhythm, diabetes, vascular disease, vertigo not improved with drugs, central vertigo
- **Admit**

@notes
- سرگیجه‌های مرکزی: CVA، میگرن ورتبروبازیلار، هیپوگلیسمی، VBI، خونریزی مخچه، تروما سر و گردن.
- در خونریزی‌های مخچه مشاوره اورژانسی نوروسرجری درخواست شود.
- جهت کنترل BP در افراد با خونریزی مغزی و BP > ۱۸۰/۱۱۰، لابتالول ۲۰ mg (۴ cc) ظرف دو دقیقه تزریق شود و هر ۱۰ تا ۱۵ دقیقه تکرار شود.
