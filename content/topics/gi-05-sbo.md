@topic sbo
cluster: gi
name: Small bowel obstruction
name_fa: انسداد روده کوچک
source: B
keywords: sbo ileus ngt vomiting
refs: wses-asbo-2017

@guide
# ایده کلی
انسداد روده باریک (معمولاً بعد از جراحی قبلی، چسبندگی) با درد کولیکی، استفراغ، نفخ و نبود دفع گاز همراه است. در بیشتر بیماران درمان غیرجراحی کافی است، مگر نشانه خفگی روده (پریتونیت، ایسکمی) باشد [^wses-asbo-2017].
# منطق دستورها
- **NPO، NG tube و مایع وریدی** برای کم کردن فشار روده و جبران کم‌آبی.
- گرافی ایستاده یا CT با کنتراست.
- **مسکن و ضدتهوع.**
- **آنتی‌بیوتیک** فقط اگر سوراخ‌شدن یا جراحی در پیش است.
- **اکتروتاید** در انسداد بدخیم یا آسیت شدید.
# هشدار
شوک، کاهش هوشیاری یا خطر آسپیراسیون = سطح ۱ و NG به ساکشن.

@variant sbo-stable
name: Stable SBO
level: II
source: B
meta: Imp: Small bowel obstruction · C: II
refs: wses-asbo-2017

@scenario
خانمی ۶۶ ساله که قبلاً لاپاراتومی داشته، دو روز است درد کولیکی شکم، استفراغ و بدون دفع گاز دارد. شکم متسع و صداهای روده پرتحرک است. فشار 120/72 و نبض 100.

@why
SBO پایدار است؛ NG، مایع، مسکن و انتظار برای بهبود یا تصویربرداری کافی است.

@orders
- CVS / NPO / CBR; supine
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, VBG, BS, **lactate**
- PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%
- IV line fix; N/S 1 L over 12 h
- **Upright CXR** (if he cannot stand: left lateral decubitus abdominal film)
- ECG
- **NGT fix**
- Amp **Ondansetron 4 mg** IV stat
- Amp **Morphine 3 mg** IV stat, slow, with respiratory control

@branch
if: High suspicion of obstruction and the film shows nothing
- **Abdominal and pelvic CT with IV contrast**

@branch
if: Shock, ↓LOC, airway risk from vomiting
go: sbo-shock

@branch
if: Perforation or an operation planned
go: sbo-perf

@branch
if: Severe ascites / carcinomatosis
go: sbo-ascites

@variant sbo-shock
name: Shock / airway risk → Level I
level: I
source: B
meta: Imp: Small bowel obstruction, unstable · Level I
refs: wses-asbo-2017

@scenario
مردی ۷۲ ساله با انسداد روده، استفراغ مکرر و خواب‌آلودگی. فشار 82/50، نبض 124 و کم‌آب است. خطر آسپیراسیون دارد.

@why
شوک و خطر آسپیراسیون است؛ سطح ۱، مایع تهاجمی و NG به ساکشن.

@orders
- CVS / NPO / CBR; supine
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, VBG, BS, **lactate**
- PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%
- IV line fix; N/S 1 L over 12 h
- **Upright CXR** (if he cannot stand: left lateral decubitus abdominal film)
- ECG
- **NGT fix**
- Amp **Ondansetron 4 mg** IV stat
- Amp **Morphine 3 mg** IV stat, slow, with respiratory control
- **Level I**, aggressive fluid resuscitation
- If ↓LOC: **NGT to suction**, airway protection

@branch
if: Reduced level of consciousness
- **NGT connected to suction**

@variant sbo-perf
name: Perforation or surgery planned: antibiotics
level: II
source: B
meta: Imp: Small bowel obstruction with perforation / surgical plan
refs: wses-asbo-2017

@scenario
مردی ۶۰ ساله با SBO حالا تب، گاردینگ و هوای آزاد زیر دیافراگم در گرافی ایستاده دارد. جراحی برنامه‌ریزی شده است.

@why
سوراخ‌شدن یا جراحی در پیش است؛ آنتی‌بیوتیک وسیع‌الطیف لازم است.

@orders
- CVS / NPO / CBR; supine
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, VBG, BS, **lactate**
- PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%
- IV line fix; N/S 1 L over 12 h
- **Upright CXR** (if he cannot stand: left lateral decubitus abdominal film)
- ECG
- **NGT fix**
- Amp **Ondansetron 4 mg** IV stat
- Amp **Morphine 3 mg** IV stat, slow, with respiratory control
- Amp **Cefuroxime 1000 mg** IV every 8 h **or** Amp **Meropenem 1 g** IV every 8 h
- Surgical consult

@notes
- آنتی‌بیوتیک در انسداد روده کوچک زمانی لازم است که شواهد پرفوراسیون وجود داشته باشد و یا برنامه جراحی مدنظر باشد.

@variant sbo-ascites
name: Severe ascites / carcinomatosis
level: II
source: B
meta: Imp: Small bowel obstruction, malignant / ascites
refs: wses-asbo-2017

@scenario
خانمی ۵۸ ساله مبتلا به سرطان تخمدان با آسیت بزرگ، استفراغ و شکم متسع. انسداد بدخیم روده.

@why
انسداد بدخیم یا آسیت است؛ اکتروتاید به کاهش ترشحات کمک می‌کند.

@orders
- CVS / NPO / CBR; supine
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, VBG, BS, **lactate**
- PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 90%
- IV line fix; N/S 1 L over 12 h
- **Upright CXR** (if he cannot stand: left lateral decubitus abdominal film)
- ECG
- **NGT fix**
- Amp **Ondansetron 4 mg** IV stat
- Amp **Morphine 3 mg** IV stat, slow, with respiratory control
- Amp **Octreotide 0.3 mg/day** (300 µg per day)
