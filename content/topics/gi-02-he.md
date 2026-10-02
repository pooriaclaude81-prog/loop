@topic he
cluster: gi
name: Hepatic encephalopathy
name_fa: انسفالوپاتی کبدی
source: B
keywords: lactulose cirrhosis ammonia sbp
refs: easl-he-2022

@guide
# ایده کلی
در سیروز، کبد آمونیاک را دفع نمی‌کند و به مغز می‌رسد. نتیجه: گیجی، خواب‌آلودگی، لرزش دست (فلاپینگ) و در موارد شدید کما. معمولاً یک عامل محرک دارد: یبوست، خونریزی گوارشی، عفونت (به‌ویژه SBP)، اختلال الکترولیت، دارو و آرام‌بخش [^easl-he-2022].
# درمان
- **لاکتولوز** (خوراکی یا انما): اولین دارو؛ هدف ۲ تا ۳ بار مدفوع نرم.
- آنتی‌بیوتیک غیرجذبی (مترونیدازول، نئومایسین، وانکومایسین خوراکی) در برخی پروتکل‌ها.
- علت محرک را پیدا و درمان کنید.
- **هیچ آرام‌بخشی** ندهید.
# نکات خطرناک
GCS ≤ 8 یا نبود رفلکس گگ یعنی اینتوباسیون. آمونیاک را چک کنید ولی تشخیص بالینی است. در آسیت و تب، تپ تشخیصی برای SBP و سفوتاکسیم.

@variant he-alert
name: Alert enough to take oral drugs
level: II
source: B
meta: Imp: Hepatic encephalopathy · C: II
refs: easl-he-2022

@scenario
مردی ۶۰ ساله با سیروز بعد از چند روز یبوست گیج و خواب‌آلود است و لرزش «فلاپینگ» دارد. GCS برابر 13، فشار 110/70 و تب ندارد.

@why
بیمار هنوز هوشیار است و می‌تواند دارو بخورد؛ لاکتولوز خوراکی ستون درمان است.

@orders
- CVS / NPO / CBR; semi-sitting or sitting
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, AFP, **NH4 (ammonia, must be checked)**, CPK, LDH, HBsAg, HCV Ab, HIV Ab, AST, ALT, ALP, Bili T/D, amylase, lipase, VBG
- HM, PO; O2 by nasal cannula 4–6 L/min if SpO2 < 94%
- CXR; **brain CT** (mandatory if reduced consciousness or confusion); ECG; BS glucometry
- IV line fix; serum **1/3–2/3, 1 L over 12 h**
- Amp Ranitidine 50 mg IV stat
- **No sedative drugs**
- Tab **Zinc 600 mg** PO daily
- Tab **Metronidazole 250 mg** PO stat, every 8 h
- Syrup **Lactulose 30 g** PO stat, then every 6 h until the stool is loose (diarrhea)

@branch
if: Alternative to metronidazole
- Oral **neomycin** or oral **vancomycin**

@variant he-lowloc
name: Decreased LOC / aspiration risk
level: I
source: B
meta: Imp: Hepatic encephalopathy, reduced consciousness · Level I
refs: easl-he-2022

@scenario
مردی ۵۸ ساله با سیروز فقط به درد پاسخ می‌دهد (GCS برابر 8) و رفلکس گگ ندارد. فشار 95/60. نمی‌تواند ببلعد و خطر آسپیراسیون بالاست.

@why
هوشیاری کم و خطر آسپیراسیون است؛ ابتدا راه هوایی و بعد دارو از راه NG یا انما.

@orders
- CVS / NPO / CBR; semi-sitting or sitting
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, AFP, **NH4 (ammonia, must be checked)**, CPK, LDH, HBsAg, HCV Ab, HIV Ab, AST, ALT, ALP, Bili T/D, amylase, lipase, VBG
- HM, PO; O2 by nasal cannula 4–6 L/min if SpO2 < 94%
- CXR; **brain CT** (mandatory if reduced consciousness or confusion); ECG; BS glucometry
- IV line fix; serum **1/3–2/3, 1 L over 12 h**
- Amp Ranitidine 50 mg IV stat
- **No sedative drugs**
- Tab **Zinc 600 mg** PO daily
- **Level I**: resuscitation equipment and intubation equipment at the bedside; **intubate** if GCS ≤ 8, absent gag, or BP ≤ 90
- **NGT fix**; give metronidazole tablets and lactulose syrup **by gavage**

@branch
if: Cannot take lactulose by mouth or NGT
- **Lactulose enema 300 mL in 700 mL water**

@variant he-sbp
name: With ascites: suspect SBP
level: II
source: B
meta: Imp: Hepatic encephalopathy, suspected SBP
refs: easl-he-2022

@scenario
مردی ۶۳ ساله الکلی با آسیت بزرگ، تب و درد شکم گیج شده است. به پریتونیت باکتریال خودبه‌خودی (SBP) به‌عنوان عامل محرک شک می‌کنیم.

@why
در بیمار آسیتی با تب، SBP را باید رد یا درمان کنیم؛ تپ تشخیصی و آنتی‌بیوتیک.

@orders
- CVS / NPO / CBR; semi-sitting or sitting
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, AFP, **NH4 (ammonia, must be checked)**, CPK, LDH, HBsAg, HCV Ab, HIV Ab, AST, ALT, ALP, Bili T/D, amylase, lipase, VBG
- HM, PO; O2 by nasal cannula 4–6 L/min if SpO2 < 94%
- CXR; **brain CT** (mandatory if reduced consciousness or confusion); ECG; BS glucometry
- IV line fix; serum **1/3–2/3, 1 L over 12 h**
- Amp Ranitidine 50 mg IV stat
- **No sedative drugs**
- Tab **Zinc 600 mg** PO daily
- Diagnostic **ascitic tap kit at the bedside**
- Amp **Cefotaxime 2 g** IV stat if SBP is suspected
- Tab Metronidazole 250 mg PO q8h and lactulose syrup 30 g as on the [[he-alert|first page]]
