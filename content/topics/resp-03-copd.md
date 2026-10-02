@topic copd
cluster: resp
name: COPD exacerbation
name_fa: تشدید COPD
source: B
keywords: bipap niv intubation ventilator salbutamol steroid
refs: gold-2026

@guide
# ایده کلی
تشدید COPD یعنی در عرض چند روز تنگی نفس، سرفه و خلط بیمار بیشتر از معمول شود. معمولاً علت عفونت یا آلودگی هواست [^gold-2026].
# منطق دستورها
- **سه داروی استنشاقی** (سالبوتامول، آتروونت، پولمیکورت) برای باز کردن مجرا و کاهش التهاب.
- **کورتون** (متیل‌پردنیزولون یا پردنیزون) دوره کوتاه.
- **آنتی‌بیوتیک** وقتی خلط چرکی یا نیاز به تهویه دارد.
- **اکسیژن** با هدف SpO2 حدود ۸۸ تا ۹۲٪. در COPD بیش‌اکسیژن‌دهی CO2 را بالا می‌برد.
- **BiPAP** (تهویه غیرتهاجمی) اگر خواب‌آلودگی و اسیدوز تنفسی هست ولی بیمار هنوز راه هوایی را حفظ می‌کند.
# چه موقع اینتوباسیون؟
سیانوز، تنفس کاملاً شکمی (paradoxical)، خواب‌آلودگی شدید، PCO2 خیلی بالا یا ناپایداری همودینامیک. در بیمار اینتوبه، تنظیمات ونتیلاتور مخصوص انسداد راه هوایی (حجم کم، تعداد کم، بازدم طولانی) لازم است تا هوا گیر نیفتد [^gold-2026].

@variant copd-modsevere
name: Moderate to severe exacerbation
level: II
source: B
meta: Imp: COPD exacerbation (moderate, severe) · C: II · NPO · CBR · sitting
refs: gold-2026

@scenario
مردی ۶۸ ساله و سیگاری سابق چهار روز است که سرفه و خلط چرکی و تنگی نفسش بیشتر شده است. تنفس 28، SpO2 86٪، ویز دارد، جمله‌های کوتاه می‌گوید و از عضلات کمکی استفاده می‌کند. هوشیار است.

@why
تشدید متوسط تا شدید است: نبولایزر سه‌دارویی، کورتون، آنتی‌بیوتیک و آمادگی برای BiPAP.

@orders
- CVS / NPO / CBR; sitting
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, Alb, PT, PTT, INR, CPK, LDH, Trop, NT-proBNP, **ABG**, D-dimer
- HM, PO
- O2 by nasal cannula 3–4 L/min if SpO2 ≤ 90% (give **after** the nebulizers)
- CXR after stabilization
- Blue-protocol lung ultrasound (by emergency resident)
- ECG
- IV line fix; N/S 1 L over 8 h
- Bed-side guard + fixed relative; BS glucometry
- Amp Pantoprazole 40 mg IV stat
- Neb **Salbutamol 2.5 mg ×3 doses**, every 20 min up to 1 h
- Neb **Pulmicort 0.5 mg ×3 doses**, every 20 min up to 1 h
- Neb **Atrovent 0.5 mg ×3 doses**, every 20 min up to 1 h
- Amp **Levofloxacin 750 mg** IV stat, **or** Amp **Ceftriaxone 1 g** IV infusion + Cap **Azithromycin 500 mg** PO stat
- Amp **Enoxaparin 60 mg** SC stat
- Amp **Methylprednisolone 125 mg** IV stat, **or** Tab **Prednisone 50 mg** PO stat
- BiPAP at the bedside

@branch
if: Any of: cyanosis, entirely abdominal breathing, severe distress, respiratory failure, ↓LOC, PCO2 > 100, hemodynamic instability, severe drowsiness
go: copd-resp-failure

@branch
if: Mild exacerbation
go: copd-mild

@notes
- این دستورات مربوط به COPD متوسط و شدید است که به COPDی اطلاق می‌شود که FEV1/FVC < ۷۰٪ و FEV1 < ۸۰٪ است.
- نبولایزرها در موارد COPD خفیف می‌توانند با ۸ پاف از اسپری‌ها با دم‌یار و نظارت مستقیم بر بیمار جایگزین شوند.

@variant copd-mild
name: Mild exacerbation
level: III
source: B
meta: Imp: COPD exacerbation (mild)
refs: gold-2026

@scenario
مردی ۶۲ ساله با COPD کمی بیشتر از همیشه تنگی نفس و سرفه دارد. جمله‌ها را کامل می‌گوید، SpO2 93٪، تنفس 20 و خواب‌آلود نیست.

@why
تشدید خفیف است؛ اسپری با اسپیسر و پردنیزون خوراکی کافی است.

@orders
- Base orders as in [[copd-modsevere|moderate to severe]] (monitoring, labs, ECG, IV line)
- **Salbutamol spray 8 puffs** via a spacer, with direct supervision of correct technique, **instead of nebulizers**
- Tab **Prednisone 50 mg** PO
- Antibiotics as in the moderate–severe page if sputum is purulent

@variant copd-resp-failure
name: Respiratory failure → BiPAP or intubation
level: I
source: B
meta: Imp: COPD exacerbation with respiratory failure · Level I
refs: gold-2026

@scenario
مردی ۷۲ ساله با COPD شدید خواب‌آلود است. تنفسش کاملاً شکمی (پارادوکس)، سیانوز دارد، تنفس 36 و گاز خون pH 7.18 با PCO2 بالای 100 است. همودینامیک مرزی است و دارد خسته می‌شود.

@why
نارسایی تنفسی است: اگر شرایط BiPAP را دارد آن را شروع کنید، وگرنه اینتوباسیون با تنظیمات ویژه COPD.

@orders
- Level I: resuscitation room, ABC, monitor
- All the drugs in [[copd-modsevere|the moderate–severe orders]]
-- BiPAP (only if ALL are true)
- No arrest, no need for intubation, not agitated, not drowsy, no airway obstruction, no aspiration risk, no recent gastric / esophageal / facial surgery, no facial trauma or anomaly
- BiPAP settings: **EPAP 2.5–5 cmH2O, IPAP 7.5–15 cmH2O**
-- Intubation (otherwise)
- Resuscitation and intubation equipment at the bedside. Drugs ready: **Fentanyl 200 µg, Etomidate 20 mg, Succinylcholine 100 mg**. **Never inject without a resident AND an attending.**
- Ventilator: **mode** assist-control or SIMV · **TV 6–8 mL/kg** · **rate 8–10/min** · **peak flow 80–100 L/min** · **FiO2 100%** · **I:E 1:4 to 1:3**
- Give the nebulizers **in-line** through the ventilator
