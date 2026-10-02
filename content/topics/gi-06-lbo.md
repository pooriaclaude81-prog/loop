@topic lbo
cluster: gi
name: Large bowel obstruction
name_fa: انسداد روده بزرگ
source: B
keywords: lbo volvulus pseudo-obstruction
refs: wses-colorectal-2017

@guide
# ایده کلی
انسداد کولون معمولاً از تومور یا ولوولوس است. خطر اصلی سوراخ‌شدن سکوم و پریتونیت مدفوعی است [^wses-colorectal-2017].
# منطق دستورها
- NPO، NG، مایع، گرافی ایستاده و CT با کنتراست وریدی.
- **آنتی‌بیوتیک** اگر گانگرن، سوراخ‌شدن یا پریتونیت دارد (پوشش گرم‌منفی و بی‌هوازی).
- در شک به **سودو-انسداد** (اوگیلوی)، انمای کنتراست محلول در آب هم تشخیصی و هم گاهی درمانی است.
# هشدار
شوک یا کاهش هوشیاری = سطح ۱ و مایع تهاجمی.

@variant lbo-stable
name: Stable LBO
level: II
source: B
meta: Imp: Large bowel obstruction · C: II
refs: wses-colorectal-2017

@scenario
مردی ۷۴ ساله چند هفته یبوست داشته و بعد شکمش متسع شده، استفراغ و درد دارد و گاز دفع نمی‌کند. فشار 130/80. در گرافی کولون متسع دیده می‌شود، مشکوک به توده سیگموئید یا ولوولوس.

@why
LBO پایدار است؛ NG، مایع، تصویربرداری و مشاوره جراحی.

@orders
- CVS / NPO / CBR; semi-sitting
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, VBG, BS, **lactate**
- PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- IV line fix; ECG; N/S 1 L IV stat
- **Upright CXR** (if he cannot stand: left lateral decubitus abdominal film)
- **NGT fix**
- Amp Ondansetron 4 mg IV stat
- Amp Morphine 3 mg IV stat, slow, with respiratory control
- Abdominal and pelvic CT with IV contrast if needed

@branch
if: Shock / ↓LOC
go: lbo-shock

@branch
if: Gangrene, perforation, or peritoneal signs
go: lbo-gangrene

@branch
if: Suspected pseudo-obstruction
go: lbo-pseudo

@variant lbo-shock
name: Shock / airway risk → Level I
level: I
source: B
meta: Imp: Large bowel obstruction, unstable · Level I
refs: wses-colorectal-2017

@scenario
مردی ۷۸ ساله با LBO، استفراغ مکرر، گیجی، فشار 80/48 و نبض 130.

@why
شوک و خطر آسپیراسیون است؛ سطح ۱، مایع تهاجمی، NG ساکشن.

@orders
- CVS / NPO / CBR; semi-sitting
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, VBG, BS, **lactate**
- PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- IV line fix; ECG; N/S 1 L IV stat
- **Upright CXR** (if he cannot stand: left lateral decubitus abdominal film)
- **NGT fix**
- Amp Ondansetron 4 mg IV stat
- Amp Morphine 3 mg IV stat, slow, with respiratory control
- Abdominal and pelvic CT with IV contrast if needed
- **Level I** and **aggressive fluid therapy**
- If reduced consciousness: **NGT to suction**

@variant lbo-gangrene
name: Gangrene / perforation → antibiotics
level: II
source: B
meta: Imp: Large bowel obstruction with gangrene or perforation
refs: wses-colorectal-2017

@scenario
مردی ۷۰ ساله با LBO حالا تب‌دار و پریتونیتی است و هوای آزاد دارد. اورژانس جراحی.

@why
گانگرن یا سوراخ‌شدن است؛ آنتی‌بیوتیک وسیع‌الطیف و جراحی فوری.

@orders
- CVS / NPO / CBR; semi-sitting
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, VBG, BS, **lactate**
- PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- IV line fix; ECG; N/S 1 L IV stat
- **Upright CXR** (if he cannot stand: left lateral decubitus abdominal film)
- **NGT fix**
- Amp Ondansetron 4 mg IV stat
- Amp Morphine 3 mg IV stat, slow, with respiratory control
- Abdominal and pelvic CT with IV contrast if needed
-- Antibiotics (choose one regimen)
- Amp **Ciprofloxacin 400 mg** IV stat, then every 12 h **+** Amp **Metronidazole 500 mg** IV stat, then every 12 h
- **or** Amp **Ampicillin 2 g** IV every 6 h **+** Amp **Metronidazole 500 mg** every 6 h **+** Amp **Gentamicin 7 mg/kg** every 24 h
- **or** Amp **Imipenem 500 mg** IV every 6 h
- Surgical consult

@variant lbo-pseudo
name: Suspected pseudo-obstruction
level: II
source: B
meta: Imp: Colonic pseudo-obstruction (Ogilvie)
refs: wses-colorectal-2017

@scenario
مردی ۷۹ ساله بستری در بخش بعد از جراحی لگن، شکم بسیار متسع و کم‌درد دارد. علت مکانیکی محتمل نیست.

@why
به سودو-انسداد (اوگیلوی) شک می‌کنیم؛ انمای کنتراست محلول در آب افتراق می‌دهد.

@orders
- CVS / NPO / CBR; semi-sitting
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, VBG, BS, **lactate**
- PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- IV line fix; ECG; N/S 1 L IV stat
- **Upright CXR** (if he cannot stand: left lateral decubitus abdominal film)
- **NGT fix**
- Amp Ondansetron 4 mg IV stat
- Amp Morphine 3 mg IV stat, slow, with respiratory control
- Abdominal and pelvic CT with IV contrast if needed
- **Water-soluble contrast enema** to differentiate from mechanical obstruction
