@topic meoh
cluster: tox
name: Methanol / ethylene glycol poisoning
name_fa: مسمومیت با متانول / اتیلن گلیکول
source: A
keywords: fomepizole ethanol alcohol dialysis
refs: extrip-methanol-2015, extrip-eg-2022

@guide
# ایده کلی
متانول و اتیلن گلیکول خودشان کم‌خطرند، ولی بدن آنها را به سموم کشنده تبدیل می‌کند (فرمات و اگزالات) با آنزیم الکل دهیدروژناز. درمان یعنی جلوگیری از این تبدیل و پاک کردن سم [^extrip-methanol-2015].
# منطق دستورها
- **فومپیزول یا اتانول:** آنزیم را اشغال می‌کنند تا سم ساخته نشود.
- **بی‌کربنات:** برای اسیدوز شدید.
- **اسیدفولیک:** به تبدیل فرمات کمک می‌کند (متانول).
- **تیامین و پیریدوکسین و منیزیم:** برای اتیلن گلیکول (اگزالات).
- **همودیالیز:** سم و متابولیت را می‌شوید.
# اندیکاسیون دیالیز
اسیدوز شدید، اختلال بینایی، نارسایی کلیه، بدتر شدن علایم با وجود درمان، اختلال شدید الکترولیت، یا سطح بالای سم [^extrip-eg-2022].
# سرنخ
اسیدوز با آنیون گپ بالا، اختلال بینایی (متانول) و کریستال کلسیم اگزالات در ادرار (اتیلن گلیکول).

@variant meoh-base
name: Methanol toxicity
level: II
source: A
meta: Imp: Methanol toxicity · NPO until awake and stable · supine, bed head up
refs: extrip-methanol-2015

@scenario
مردی ۳۳ ساله ۱۲ ساعت پیش مشروب دست‌ساز خورده است. دید تار، شکم‌درد و استفراغ دارد، تنفس عمیق و تند (کوسمائول) و GCS برابر 14. گاز خون: pH برابر 7.12 و بی‌کربنات 8 با آنیون گپ بالا. قند خون نرمال است.

@why
این نسخه متانول است: آنتی‌دوت، بی‌کربنات، اسیدفولیک و معیارهای دیالیز.

@orders
- IV line fix
- Labs: CBC/diff, BUN, Cr, Na, K, BS, Ca, amylase, ALT, AST, ALP, CPK, UA
- Cardiac monitoring + pulse oximetry
- O2 by face mask 4–6 L/min if SpO2 < 92%
- **BS glucometry stat and every 1–2 h**
- Check serum **ethanol and methanol**
- Check serum **acetaminophen and salicylate** levels
- Serum **D/S 1000 mL** IV stat
- Amp Ondansetron 4 mg IV stat
- Amp Famotidine 20 mg IV stat
- NG tube fix (then oral route if he cannot tolerate: source note)
- Spiral brain CT scan
-- Antidote: choose one
- Amp **Fomepizole 15 mg/kg** stat (over 30 min), then **10 mg/kg every 12 h**
- **or** **Ethanol 10%: 10 mL/kg** stat infusion over 30 min, then **1.2 mL/kg/h**. Ethanol infusion must go through a **central vein**; keep the ethanol level at **100–150 mg/dL**.
- Chart I/O
- Amp **Folic acid 1 mg/kg** IV every 4–6 h
- Amp **Sodium bicarbonate 7.5%: 1–2 mEq/kg/dose** if pH < 7.2
- **Hemodialysis if indicated** (see the list below)
- Toxicology consult

@branch
if: **Hemodialysis indications (methanol and ethylene glycol)**: (1) metabolic acidosis: base deficit < −15, AG > 30, pH < 7.25; (2) visual disturbance; (3) renal failure; (4) worsening vital signs despite full treatment; (5) refractory electrolyte / metabolic disorder despite adequate treatment; (6) serum methanol or ethylene glycol > 50 mg/dL
- Hemodialysis

@branch
if: **Ethylene glycol** is suspected instead
go: meoh-eg

@notes
- مسمومیت با الکل می‌تواند ناشی از اتانول، متانول، اتیلن گلیکول باشد. علامت بالینی، حالت مستی است.
- اصل مدیریت درمان در مسمومیت با اتانول، تحت نظر گرفتن تا زمان هوشیاری است.
- برای تشخیص مسمومیت با متانول و اتیلن گلیکول، محاسبه‌ی آنیون گپ، اسمولار گپ و سرم اسمولالیته کمک‌کننده است.
- انفوزیون اتانول باید حتماً از طریق ورید مرکزی باشد و سطح اتانول ۱۰۰–۱۵۰ نگه داشته شود.

@variant meoh-eg
name: Ethylene glycol add-ons
level: II
source: A
meta: Imp: Ethylene glycol toxicity · Add these to the methanol orders
refs: extrip-eg-2022

@scenario
مردی ۴۰ ساله ضدیخ خورده است. افسردگی عصبی، تنفس تند، اسیدوز با آنیون گپ بالا، کاهش ادرار و کریستال اگزالات در ادرار دارد.

@why
درمان مثل متانول است، به‌علاوه تیامین، پیریدوکسین و منیزیم.

@orders
- All orders on the [[meoh-base|methanol page]] (fomepizole or ethanol, bicarbonate, dialysis)
-- Added for ethylene glycol
- Amp **Thiamine (Vit B1) 100 mg** IV stat, then every 6 h
- Amp **Pyridoxine (Vit B6) 50–100 mg** IV stat, then every 6 h
- Amp **MgSO4 2 g** IV stat
- Hemodialysis criteria as on the methanol page
