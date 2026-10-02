@topic pyelo
cluster: renal
name: Pyelonephritis
name_fa: پیلونفریت
source: B
keywords: uti urinary infection ciprofloxacin ceftriaxone
refs: idsa-cuti-2025

@guide
# ایده کلی
پیلونفریت یعنی عفونت کلیه: تب، درد پهلو، علائم ادراری. درمان بسته به ساده یا عارضه‌دار بودن تغییر می‌کند [^idsa-cuti-2025].
# ساده
خانم جوان، سالم، قادر به خوردن دارو: آنتی‌بیوتیک خوراکی (سیپروفلوکساسین یا لووفلوکساسین).
# عارضه‌دار
بارداری، سرکوب ایمنی، دیابت، CKD، ناهنجاری آناتومیک: آنتی‌بیوتیک وریدی (سفتریاکسون، سفپیم، تازوسین، فلوروکینولون).
# تصویربرداری
فقط اگر آبسه، سنگ، ناهنجاری آناتومیک یا تب بیش از ۷۲ ساعت علی‌رغم آنتی‌بیوتیک.
# قبل از شروع
کشت ادرار بفرستید و در زنان باردارشدنی βHCG.

@variant pyelo-uncomp
name: Uncomplicated
level: II
source: B
meta: Imp: Pyelonephritis · C: II
refs: idsa-cuti-2025

@scenario
خانمی ۳۰ ساله دو روز است تب، درد پهلوی راست، سوزش ادرار و تکرر ادرار دارد. دما 38.6، فشار 118/72، حساسیت در زاویه کوستوورتبرال و پیوری. حامله نیست، دیابت ندارد و می‌تواند بخورد.

@why
ساده است؛ آنتی‌بیوتیک خوراکی با پایش کافی است.

@orders
- CVS / NPO / CBR; supine
- Labs: CBC/diff, BUN/Cr, UA, **urine culture**, **βHCG**
- PO & HM; O2 by nasal cannula if SpO2 ≤ 90%
- IV line fix; Serum N/S 1 L IV stat
- Amp **Apotel (acetaminophen) 1 g** IV if T ≥ 38 °C
- Tab **Ciprofloxacin 500 mg** PO every 12 h **or** Tab **Levofloxacin 750 mg** PO daily

@branch
if: Complicated factors
go: pyelo-comp

@branch
if: Imaging criteria
go: pyelo-imaging

@variant pyelo-comp
name: Complicated (IV antibiotics)
level: II
source: B
meta: Imp: Pyelonephritis, complicated
refs: idsa-cuti-2025

@scenario
خانمی ۶۸ ساله با دیابت و CKD، تب 39، استفراغ، درد پهلو و فشار 105/65. یا خانم باردار یا دچار سرکوب ایمنی یا ناهنجاری آناتومیک.

@why
عارضه‌دار است؛ آنتی‌بیوتیک وریدی لازم است.

@orders
- CVS / NPO / CBR; supine
- Labs: CBC/diff, BUN/Cr, UA, **urine culture**, **βHCG**
- PO & HM; O2 by nasal cannula if SpO2 ≤ 90%
- IV line fix; Serum N/S 1 L IV stat
- Amp **Apotel (acetaminophen) 1 g** IV if T ≥ 38 °C
-- IV antibiotic (choose one)
- Amp **Cefepime 2 g** IV every 12 h
- Amp **Ceftriaxone 1 g** IV every 12 h
- Amp **Ciprofloxacin 400 mg** IV every 12 h
- Amp **Levofloxacin 500 mg** IV every 12 h
- Amp **Tazocin 3.375 g** every 6 h

@branch
if: Use the complicated regimen in: pregnancy, immunodeficiency, anatomical disorders, diabetes, CKD or ARF, other significant comorbidity
- IV regimen

@variant pyelo-imaging
name: When to image
level: II
source: B
meta: Imp: Pyelonephritis, imaging indications
refs: idsa-cuti-2025

@scenario
بیماری در روز سوم آنتی‌بیوتیک هنوز تب‌دار است، یا سابقه سنگ یا ناهنجاری شناخته‌شده دارد.

@why
تصویربرداری فقط در شرایط خاص اندیکاسیون دارد.

@orders
- Kidney and urinary-tract **ultrasound** if indicated
- **CT** of kidneys and urinary tract if indicated

@branch
if: Imaging is done **only** if: underlying anatomical disorder; suspected abscess; suspected stone with pyelonephritis; fever persists beyond **72 h** of antibiotics
- Image
