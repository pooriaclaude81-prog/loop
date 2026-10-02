@topic rlq
cluster: gi
name: RLQ pain / appendicitis
name_fa: درد RLQ / آپاندیسیت
source: B
keywords: appendicitis ultrasound ct pregnant torsion
refs: wses-appendicitis-2020

@guide
# ایده کلی
آپاندیسیت کلاسیک: درد دور ناف که به RLQ می‌رود، بی‌اشتهایی، تهوع و تب خفیف. تشخیص بالینی است و تصویربرداری برای موارد نامشخص [^wses-appendicitis-2020].
# مسیر تصویربرداری
- بیمار با تشخیص نامشخص: سونوگرافی RLQ.
- زنان در سن باروری: βHCG، و سونوگرافی رحم و ضمائم (تورشن، حاملگی خارج رحمی).
- اگر سونوگرافی منفی یا نامشخص و بیمار باردار نیست: CT شکم و لگن با کنتراست. در بارداری: MRI بدون کنتراست.
# آنتی‌بیوتیک
- آپاندیسیت بدون پرفوراسیون: مترونیدازول + سیپروفلوکساسین یا سفتریاکسون.
- پرفوره: پوشش وسیع‌تر (تازوسین، سفپیم یا ایمی‌پنم).
- شوک: سطح ۱، مایع و آنتی‌بیوتیک وسیع‌الطیف.

@variant rlq-stable
name: Stable, suspected appendicitis
level: II
source: B
meta: Imp: RLQ abdominal pain · C: II/III
refs: wses-appendicitis-2020

@scenario
مردی ۲۴ ساله درد دور ناف را دارد که طی ۱۲ ساعت به RLQ رفته است، با بی‌اشتهایی، تهوع، تب خفیف و حساسیت در نقطه مک‌برنی. پایدار است.

@why
تشخیص آپاندیسیت محتمل است؛ سونوگرافی اولین قدم و بعد آنتی‌بیوتیک و جراحی.

@orders
- CVS / NPO / CBR; supine; bed-side guard + fixed relative
- Labs: CBC/diff, BUN/Cr, Na, K, VBG, UA, PT, PTT, INR, **CRP**
- PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- ECG (age > 40)
- IV line fix; N/S 1 L IV infusion every 12 h
- Amp **Morphine 3 mg** IV slow, with respiratory control
- Amp **Ondansetron 4 mg** IV stat
- Amp **Apotel (acetaminophen) 1 g** IV infusion if T ≥ 38 °C
- **RLQ graded-compression ultrasound**, R/O appendicitis

@branch
if: Diagnosis is not clear on clinical grounds
- RLQ ultrasound for appendicitis

@branch
if: Appendicitis confirmed, not perforated
go: rlq-nonperf

@branch
if: Perforated
go: rlq-perf

@branch
if: Shock
go: rlq-shock

@branch
if: Female, pregnancy possible, or ultrasound inconclusive
go: rlq-imaging

@variant rlq-shock
name: Shock → Level I
level: I
source: B
meta: Imp: RLQ pain with shock · Level I
refs: wses-appendicitis-2020

@scenario
مردی ۳۵ ساله با درد RLQ، تب، فشار 85/50، نبض 128، پرشدگی مویرگی کند و خواب‌آلود. احتمالاً پرفوراسیون با سپسیس.

@why
شوک است؛ سطح ۱، مایع و آنتی‌بیوتیک وسیع‌الطیف بدون تأخیر.

@orders
- CVS / NPO / CBR; supine; bed-side guard + fixed relative
- Labs: CBC/diff, BUN/Cr, Na, K, VBG, UA, PT, PTT, INR, **CRP**
- PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- ECG (age > 40)
- IV line fix; N/S 1 L IV infusion every 12 h
- Amp **Morphine 3 mg** IV slow, with respiratory control
- Amp **Ondansetron 4 mg** IV stat
- Amp **Apotel (acetaminophen) 1 g** IV infusion if T ≥ 38 °C
- **Level I**, resuscitation room
- **Aggressive fluid therapy** and **broad-spectrum antibiotics** at once (see the perforated page)
- Surgery consult

@branch
if: Antibiotic choice
go: rlq-perf

@variant rlq-nonperf
name: Non-perforated appendicitis: antibiotics
level: II
source: B
meta: Imp: Appendicitis, non-perforated
refs: wses-appendicitis-2020

@scenario
مردی ۲۴ ساله با آپاندیسیت ثابت‌شده در سونوگرافی، بدون پرفوراسیون و پایدار.

@why
آپاندیسیت ساده است؛ آنتی‌بیوتیک ساده و جراحی.

@orders
- CVS / NPO / CBR; supine; bed-side guard + fixed relative
- Labs: CBC/diff, BUN/Cr, Na, K, VBG, UA, PT, PTT, INR, **CRP**
- PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- ECG (age > 40)
- IV line fix; N/S 1 L IV infusion every 12 h
- Amp **Morphine 3 mg** IV slow, with respiratory control
- Amp **Ondansetron 4 mg** IV stat
- Amp **Apotel (acetaminophen) 1 g** IV infusion if T ≥ 38 °C
- Amp **Metronidazole 500 mg** IV **+** Amp **Ciprofloxacin 400 mg** IV
- **or** Amp **Ceftriaxone 1 g** IV infusion **+** Amp **Metronidazole 500 mg** IV infusion
- Surgical consult

@variant rlq-perf
name: Perforated appendicitis: antibiotics
level: II
source: B
meta: Imp: Appendicitis, perforated
refs: wses-appendicitis-2020

@scenario
مردی ۴۵ ساله پنج روز است درد RLQ دارد، حالا پریتونیت منتشر، تب و WBC برابر 22000. در CT پرفوراسیون با آبسه دیده می‌شود.

@why
پرفوره است؛ آنتی‌بیوتیک وسیع‌تر و جراحی.

@orders
- CVS / NPO / CBR; supine; bed-side guard + fixed relative
- Labs: CBC/diff, BUN/Cr, Na, K, VBG, UA, PT, PTT, INR, **CRP**
- PO & HM; O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- ECG (age > 40)
- IV line fix; N/S 1 L IV infusion every 12 h
- Amp **Morphine 3 mg** IV slow, with respiratory control
- Amp **Ondansetron 4 mg** IV stat
- Amp **Apotel (acetaminophen) 1 g** IV infusion if T ≥ 38 °C
- Amp **Tazocin (piperacillin–tazobactam) 4.5 g** IV
- **or** Amp **Cefepime 2 g** IV infusion
- **or** Amp **Imipenem 500 mg** IV infusion
- Surgical consult

@variant rlq-imaging
name: Imaging pathway: female, pregnant, unclear
level: II
source: B
meta: Imp: RLQ pain, diagnosis uncertain
refs: wses-appendicitis-2020

@scenario
خانمی ۲۶ ساله با درد RLQ و تأخیر قاعدگی، یا خانم باردار، یا فردی که سونوگرافی‌اش نامشخص است.

@why
این هاب مسیر تصویربرداری را برای زنان، باردار و موارد نامشخص مشخص می‌کند.

@branch
if: **Every woman of childbearing age**
- **βHCG**

@branch
if: Diagnosis not definite on clinical grounds
- **RLQ ultrasound** for appendicitis

@branch
if: Female
- Ask also for **ultrasound of the appendix and of the uterus / adnexa** (ovarian torsion)

@branch
if: **βHCG positive**
- Also evaluate for **ectopic pregnancy**

@branch
if: Renal colic symptoms, first episode
- Add **ultrasound of the kidneys and urinary tract**

@branch
if: Unclear diagnosis, ultrasound negative or non-diagnostic, **not pregnant**
- **Abdominal and pelvic CT with IV contrast**

@branch
if: Unclear diagnosis, ultrasound negative or non-diagnostic, **pregnant**
- **MRI of abdomen and pelvis without contrast**
