@topic asthma
cluster: resp
name: Asthma attack
name_fa: حمله آسم
source: B
keywords: salbutamol atrovent pulmicort magnesium wheeze bronchospasm
refs: gina-2026

@guide
# ایده کلی
در حمله آسم مجاری هوایی تنگ و ملتهب می‌شوند. درمان دو بخش دارد: باز کردن سریع مجرا (بتاآگونیست استنشاقی، ایپراتروپیوم) و کاهش التهاب (کورتون سیستمیک) [^gina-2026].
# شدت را از روی گفتار بسنجید
- جمله کامل: خفیف
- عبارت‌های کوتاه: متوسط
- کلمه‌به‌کلمه: شدید
همراه با تعداد نبض و تنفس بالا، استفاده از عضلات فرعی، یا کاهش هوشیاری.
# منطق دستورها
- **سالبوتامول** هر ۲۰ دقیقه تا ۳ نوبت (در شدید دوز بیشتر یا مداوم).
- **آتروونت** برای حمله شدید، بالای ۴۰ سال یا بتابلوکر.
- **کورتون:** خوراکی کافی است مگر بیمار نتواند بخورد یا حمله شدید باشد.
- **سولفات منیزیم** وقتی به درمان‌های بالا جواب نمی‌دهد و تنفس خیلی ضعیف است.
- **اپی‌نفرین** وقتی بیمار نمی‌تواند استنشاق کند یا اسپاسم خیلی شدید است.
- گرافی قفسه فقط وقتی به علت دیگری شک دارید (پنوموتوراکس، پنومونی، نارسایی قلب).
# خطر مرگ
خواب‌آلودگی، سینه «ساکت»، سیانوز یا نزدیک به ایست تنفسی یعنی سطح ۱ و اینتوباسیون [^gina-2026].

@variant asthma-mild-mod
name: Mild to moderate attack
level: II
source: B
meta: Imp: Asthma attack · C: II · NPO · CBR · semi-sitting or sitting
refs: gina-2026

@scenario
جوانی ۲۴ ساله با سابقه آسم بعد از تماس با گرده گل سه ساعت است که ویز و فشار سینه دارد. جمله‌ها را کامل یا در قالب عبارت می‌گوید، تنفس 22، نبض 105، SpO2 94٪ و از عضلات کمکی استفاده نمی‌کند. پیک‌فلو حدود ۶۰ تا ۷۰٪ بهترین عدد اوست.

@why
حمله خفیف تا متوسط است: نبولایزر سه‌دارویی و کورتون کافی است و معمولاً نیاز به درمان‌های ویژه نیست.

@orders
- CVS / NPO / CBR. Position: semi-sitting or sitting.
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, Troponin, Ca, Ph, Mg, Alb, VBG
- HM, PO
- O2 by nasal cannula 3–4 L/min if SpO2 ≤ 90% (use < 94% in pregnancy and ischemic heart disease)
- IV line fix; N/S 1 L over 8 h
- Bed-side guard up + fixed relative
- ECG (recommended for cardiac patients or chest pain)
- CXR **only if another diagnosis is suspected** (PTX, pneumonia, CHF), after stabilization. Not indicated otherwise.
- Neb **Salbutamol 2.5 mg** every 20 min, up to 3 doses
- Neb **Atrovent 0.5 mg** every 20 min, up to 3 doses
- Neb **Pulmicort 0.5 mg** every 20 min, up to 3 doses
- Amp **Methylprednisolone 80 mg** IV stat, **or** Tab **Prednisolone 50 mg** PO stat

@branch
if: **Mild attack** (full sentences): use an inhaler instead of a nebulizer
- **Salbutamol spray 8–12 puffs** with a spacer, with close supervision of the technique

@branch
if: Fever, sinusitis, purulent sputum, or pneumonia
- Amp **Ceftriaxone 1 g** IV infusion **+** Cap **Azithromycin 500 mg** PO stat
- **or** Amp **Levofloxacin 750 mg** IV stat
else: None of these features
- No antibiotic is indicated

@branch
if: Can tolerate oral intake
- Oral steroid is preferred (prednisolone 50 mg)
else: Vomiting / cannot swallow
- Cannot tolerate oral: use IV methylprednisolone

@branch
if: Reassess after 1 h: FEV1 40–69% predicted
- Repeat salbutamol every 1–3 h

@branch
if: Reassess after 1 h: FEV1 < 40% predicted
- Salbutamol **continuous or hourly**
go: asthma-severe

@branch
if: Steroid already given and the patient is fit for discharge
- Before discharge: **Dexamethasone 10 mg** or **Triamcinolone 40 mg** or **Methylprednisolone 160 mg**

@notes
- برای بررسی شدت آسم اگرچه اسپیرومتری امری ضروری است اما بیمارانی که یک جمله نسبتاً کامل می‌توانند بگویند در شدت خفیف قرار دارند، آنها که «عبارت» می‌گویند در شدت متوسط و آنهایی که «کلمه کلمه» صحبت می‌کنند در حمله شدید قرار دارند.
- اسپیرومتری و پیک فلومتری در همه موارد برای بررسی شدت آسم و جواب به درمان باید انجام شود.
- CXR برای مواردی که مشکوک به تشخیص دیگری غیر از آسم هستیم (PTX، پنومونی، CHF) باید گرفته شود. در غیر از این موارد در بیماران آسم اندیکاسیون ندارد.
- کورتون در مواردی که به سالبوتامول جواب ندهند یا در موارد شدید از ابتدا داده می‌شود. در موارد عدم توانایی در تحمل خوراکی فرم IV می‌دهیم؛ در غیر این موارد فرم خوراکی ارجح است.
- آنتی‌بیوتیک در بیماران آسمی برای افرادی که تب دارند، سینوزیت دارند، خلط چرکی دارند و پنومونی دارند اندیکاسیون دارد؛ در غیر این موارد اندیکاسیون ندارد.
- برای هر بیماری که کورتون دریافت کرده است و قابل ترخیص از اورژانس است، قبل از ترخیص ۱۰ mg دگزامتازون یا ۴۰ mg تریامسینولون یا ۱۶۰ mg متیل‌پردنیزولون استفاده شود.

@variant asthma-severe
name: Severe or refractory attack
level: II
source: B
meta: Imp: Asthma attack, severe or not responding · C: II (→ I if any trigger below)
refs: gina-2026

@scenario
مردی ۳۵ ساله شش ساعت است ویز دارد و ده بار اسپری زده است. فقط چند کلمه می‌گوید، تنفس 34، نبض 128، SpO2 88٪، از عضلات کمکی استفاده می‌کند و در بعضی جاها صدای تنفسی شنیده نمی‌شود. بعد از یک ساعت نبولایزر پاسخ خوبی نداده است (FEV1 زیر ۴۰٪).

@why
حمله شدید یا مقاوم به درمان اولیه است؛ دوز بالاتر سالبوتامول، منیزیم و اپی‌نفرین به کار می‌آید.

@orders
- CVS / NPO / CBR. Position: semi-sitting or sitting.
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, Troponin, Ca, Ph, Mg, Alb, VBG
- HM, PO
- O2 by nasal cannula 3–4 L/min if SpO2 ≤ 90% (use < 94% in pregnancy and ischemic heart disease)
- IV line fix; N/S 1 L over 8 h
- Bed-side guard up + fixed relative
- ECG (recommended for cardiac patients or chest pain)
- Neb **Salbutamol 5 mg** (instead of 2.5 mg) every 20 min up to 1 h, then continuous or hourly
- Neb **Atrovent 0.5 mg** every 20 min ×3 (use in severe attacks, age > 40, beta-blocker bronchospasm, or a previous response to it)
- Neb **Pulmicort 0.5 mg** every 20 min ×3
- Amp **Methylprednisolone 80 mg** IV stat, continued **every 6–8 h**
- Spirometry / peak flow at baseline and after treatment

@branch
if: No response to all of the above and FEV1 < 25%
- **Magnesium sulfate 2–3 g** IV over 20 min

@branch
if: Cannot use an inhaled beta-agonist, or very severe bronchospasm
- **Epinephrine 1:1000, 0.2–0.5 mg SC or IM** every 20 min up to 3 doses

@branch
if: Very severe, cannot tolerate oral or inhaled drugs
- **IV terbutaline** and epinephrine

@branch
if: Any of: severe dyspnea, severe tachycardia, profuse sweating, confusion, ↓LOC, cyanosis, near apnea, severe respiratory failure
go: asthma-lifethreat

@notes
- در حملات شدید آسم که به همه درمان‌های فوق جواب نداده‌اند و FEV1 < ۲۵٪ است، منیزیم سولفات ۲ تا ۳ گرم ظرف ۲۰ دقیقه می‌دهیم.
- در موارد بسیار شدید آسم که تحمل PO و استنشاقی ندارد از تربوتالین وریدی و اپی‌نفرین می‌توان استفاده کرد.
- در موارد شدید به جای ۲/۵ mg سالبوتامول می‌توان ۵ mg و هر ۲۰ دقیقه تا یک ساعت استفاده کرد.

@variant asthma-lifethreat
name: Life-threatening → Level I, airway
level: I
source: B
meta: Imp: Asthma attack, near-fatal · Level I
refs: gina-2026

@scenario
مردی ۲۸ ساله با آسم، خواب‌آلود و عرق‌کرده است و نمی‌تواند حرف بزند. سیانوزه، سینه‌اش «ساکت» است، تنفس به 8 در دقیقه رسیده، SpO2 78٪ و نبض 140. از پا افتاده و نزدیک ایست تنفسی است.

@why
این حمله تهدیدکننده حیات است؛ همزمان با درمان دارویی باید برای اینتوباسیون آماده باشید.

@orders
- Move to the **resuscitation room**; ABC; monitor
- High-flow O2, bag-mask ready
- Resuscitation and intubation equipment at the bedside. Drugs ready: **Fentanyl 200 µg, Etomidate 20 mg, Succinylcholine 100 mg**. **Never inject these without a resident AND an attending present.**
- Continue nebulized salbutamol / ipratropium / budesonide, IV steroid, magnesium and epinephrine as on the [[asthma-severe|severe-attack page]]
- If intubated: set the ventilator as in [[copd-resp-failure|COPD respiratory failure]], and give nebulizers **in-line** through the ventilator

@notes
- در موارد نیاز به اینتوباسیون به دستورات COPD مراجعه کنید.
