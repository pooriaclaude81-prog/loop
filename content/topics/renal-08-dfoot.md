@topic dfoot
cluster: renal
name: Diabetic foot infection
name_fa: عفونت پای دیابتی
source: AB
keywords: gangrene clindamycin meropenem vancomycin ulcer
refs: iwgdf-2023

@guide
# ایده کلی
زخم پای دیابتی به‌خاطر نوروپاتی و بیماری عروقی عفونی می‌شود و می‌تواند به استخوان، گانگرن و سپسیس برسد [^iwgdf-2023].
# شدت را ببینید
- **خفیف:** سطحی و کوچک؛ آنتی‌بیوتیک خوراکی (کلیندامایسین) و مراقبت زخم.
- **متوسط تا شدید پایدار:** زخم بزرگ‌تر از ۲ سانتی‌متر، عمیق، چرکی و بدبو، تب، علائم ایسکمی؛ آنتی‌بیوتیک وریدی با پوشش گرم‌مثبت، گرم‌منفی و بی‌هوازی.
- **سپسیس/شوک:** سطح ۱، پوشش وسیع (مروپنم + وانکومایسین) و مایع.
# همیشه
گرافی پا (استئومیلیت؟)، کشت از زخم، کنترل قند، شستشو و دبریدمان، و مشاوره عفونی/جراحی.

@variant dfoot-mild
name: Mild: no systemic signs
level: III
source: B
meta: Imp: Diabetic foot · C: III
refs: iwgdf-2023

@scenario
مردی ۵۸ ساله و دیابتی زخم سطحی ۱ سانتی‌متری زیر انگشت شست پا و قرمزی خفیف دارد. چرک، تب یا علائم ایسکمی ندارد.

@why
عفونت خفیف است؛ آنتی‌بیوتیک خوراکی و مراقبت زخم کافی است.

@orders
- CVS / NPO / CBR; supine
- IV line fix
- Labs: CBC/diff, BUN/Cr, Na, K, BS, ESR. Also Ca, Ph, Mg, Alb, PT, PTT, INR, UA, CRP, blood culture, VBG.
- ECG
- **X-ray of the foot, AP and oblique**
- Smear and **culture of the wound secretions**; wound irrigation and dressing
- PO & HM; O2 if SpO2 ≤ 90%; BS glucometry; bed-side guard + fixed relative
- **Oral clindamycin** (if none of the risk features below)

@branch
if: Any of: ulcer > 2 cm, deep, foul purulent discharge, fever, ischemic changes, foot edema, sepsis or septic shock
- Use IV antibiotics (see next pages)
go: dfoot-stable, dfoot-septic

@variant dfoot-stable
name: Moderate to severe, stable
level: II
source: AB
meta: Imp: Diabetic foot · C: II
refs: iwgdf-2023

@scenario
مردی ۸۰ ساله و دیابتی با گانگرن انگشتان پای چپ بستری شده است. ترشح چرکی بدبو، زخم عمیق بزرگ‌تر از ۲ سانتی‌متر، ورم پا، تب خفیف و فشار 130/80.

@why
عفونت متوسط تا شدید ولی پایدار است؛ آنتی‌بیوتیک وریدی و مشاوره عفونی.

@orders
- CVS / NPO / CBR; supine
- IV line fix
- Labs: CBC/diff, BUN/Cr, Na, K, BS, ESR. @B Also Ca, Ph, Mg, Alb, PT, PTT, INR, UA, CRP, blood culture, VBG.
- ECG
- **X-ray of the foot, AP and oblique**
- @B Smear and **culture of the wound secretions**; wound irrigation and dressing
- @B PO & HM; O2 if SpO2 ≤ 90%; BS glucometry; bed-side guard + fixed relative
- @A Infectious-disease consult
- @B Amp **Clindamycin 900 mg** IV every 6 h **+** Amp **Ciprofloxacin 400 mg** IV every 8 h

@branch
if: Unstable vital signs or septic shock
go: dfoot-septic

@variant dfoot-septic
name: Septic shock / unstable
level: I
source: B
meta: Imp: Diabetic foot with sepsis · Level I
refs: iwgdf-2023

@scenario
مردی ۷۴ ساله و دیابتی با زخم نکروتیک پا و سلولیت منتشر، تب 39.5، فشار 80/48، نبض 124 و گیجی.

@why
سپسیس است؛ سطح ۱، مایع، مروپنم و وانکومایسین.

@orders
- CVS / NPO / CBR; supine
- IV line fix
- Labs: CBC/diff, BUN/Cr, Na, K, BS, ESR. Also Ca, Ph, Mg, Alb, PT, PTT, INR, UA, CRP, blood culture, VBG.
- ECG
- **X-ray of the foot, AP and oblique**
- Smear and **culture of the wound secretions**; wound irrigation and dressing
- PO & HM; O2 if SpO2 ≤ 90%; BS glucometry; bed-side guard + fixed relative
- **Level I**, resuscitation room; fluids and sepsis care
- Amp **Meropenem 1 g** IV every 8 h
- **+** Amp **Vancomycin 1 g** in 250 mL N/S over 1 h, every 12 h
