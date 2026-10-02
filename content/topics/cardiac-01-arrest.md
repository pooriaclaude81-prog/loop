@topic arrest
cluster: cardiac
name: Cardiac arrest
name_fa: ایست قلبی
source: A
keywords: cpr vf vt pea asystole shock epinephrine amiodarone acls
refs: aha-cpr-2025

@guide
# ایده کلی
ایست قلبی یعنی قلب دیگر خون به مغز نمی‌رساند. هر دقیقه تأخیر در ماساژ و شوک، شانس زنده ماندن بیمار را کمتر می‌کند. اولین کار همیشه یکی است: ماساژ قلبی باکیفیت و وصل کردن مانیتور یا دفیبریلاتور [^aha-cpr-2025].
# دو مسیر اصلی
- **ریتم شوک‌پذیر (VF یا VT بدون نبض):** قلب به‌جای انقباض منظم فقط می‌لرزد. مهم‌ترین «دارو» شوک است. بلافاصله بعد از شوک ماساژ را ادامه بدهید. اپی‌نفرین و آمیودارون کمک می‌کنند ولی جای شوک را نمی‌گیرند.
- **ریتم غیرشوک‌پذیر (PEA یا آسیستول):** شوک فایده ندارد. ماساژ، اپی‌نفرین هرچه زودتر، و پیدا کردن علت قابل‌درمان (کم‌حجمی، هیپوکسی، هیپرکالمی، پنوموتوراکس فشارنده، تامپوناد، مسمومیت، لخته).
# چرا این دستورها؟
- راه وریدی یا استخوانی برای دارو لازم است.
- راه هوایی و کاپنوگرافی هم تهویه را مطمئن می‌کند و هم نشان می‌دهد ماساژ چقدر خوب است.
- هر دو دقیقه ریتم را دوباره نگاه می‌کنیم تا ببینیم شوک لازم است یا نه.
# بعد از برگشت نبض
کار تمام نشده است: ECG ۱۲ لید (اگر STEMI بود، کت‌لب)، جلوگیری از هیپوکسی و افت فشار، کنترل دما و انتقال به ICU [^aha-cpr-2025].

@variant arrest-vf
name: Shockable (VF / pulseless VT)
level: I
source: A
meta: Source A case · Level I · resuscitation room
refs: aha-cpr-2025

@scenario
مردی ۵۲ ساله سر کار ناگهان از پا افتاده است. اطرافیان ماساژ قلبی داده‌اند و اورژانس او را آورده است. بیهوش است، نبض ندارد و روی مانیتور فیبریلاسیون بطنی (VF) دیده می‌شود.

@why
این نسخه فقط برای ریتم شوک‌پذیر است (VF یا VT بدون نبض). نکته اصلی شوک زودهنگام و ماساژ بی‌وقفه است.

@orders
- Chest compressions, high quality, minimal interruptions
- Cardiac monitoring / defibrillator pads on
- **Shock 200 J, asynchronized**, stat. Repeat as needed (VF).
- IV line fix (IO if no access)
- Amp **Epinephrine 1 mg** IV/IO stat, repeat every 3–5 min [^aha-cpr-2025]
- Intubation + ventilation + O2
- Amp **Amiodarone 300 mg** IV stat; second dose 150 mg if VF/pVT persists [^aha-cpr-2025]
- Cardiology service visit
- Anesthesia consult

@branch
if: ROSC achieved (pulse back)
- 12-lead ECG; if STEMI, emergency cardiology / cath lab [^aha-cpr-2025]
- Avoid hypoxia and hyperoxia (SpO2 92–98%), treat hypotension (SBP ≥ 90 / MAP ≥ 65) [^aha-cpr-2025]
- Hypotensive: **dopamine** 5–20 µg/kg/min, or norepinephrine infusion [^aha-cpr-2025]
- Targeted temperature management, ICU admission [^aha-cpr-2025]

@branch
if: Rhythm turns to PEA / asystole
go: arrest-nonshockable

@notes
- اردر اجرا: ماساژ قلبی، مانیتورینگ، شوک ۲۰۰ ژول غیرسینکرون (قابل تکرار)، IV line، اپی‌نفرین (قابل تکرار هر ۳ تا ۵ دقیقه)، اینتوباسیون و O2، آمیودارون ۳۰۰ میلی‌گرم، ویزیت قلب و عروق، مشاوره بیهوشی.

@variant arrest-nonshockable
name: Non-shockable (PEA / asystole)
level: I
source: A
meta: Reference-based pathway [^aha-cpr-2025]
refs: aha-cpr-2025

@scenario
مردی ۷۰ ساله با نارسایی کلیه که چند جلسه دیالیز را از دست داده، در خانه بی‌هوش پیدا شده است. روی مانیتور ریتم کند و پهن بدون نبض (PEA) دیده می‌شود. هیپرکالمی اولین مظنون است.

@why
وقتی ریتم شوک‌پذیر نیست، شوک فایده ندارد. ماساژ، اپی‌نفرین زود و پیدا کردن علت برگشت‌پذیر کلید کار است.

@orders
- Start CPR, 30:2 until the airway is secured, then continuous compressions with 10 breaths/min [^aha-cpr-2025]
- Monitor / pads on. **No shock** for PEA or asystole. [^aha-cpr-2025]
- IV/IO access [^aha-cpr-2025]
- **Epinephrine 1 mg** IV/IO as soon as possible, then every 3–5 min [^aha-cpr-2025]
- Secure the airway (intubation or supraglottic), waveform capnography [^aha-cpr-2025]
- Rhythm check every 2 minutes [^aha-cpr-2025]
- Search for and treat the reversible causes: hypovolemia, hypoxia, acidosis (H+), hypo/hyperkalemia, hypothermia, tension pneumothorax, tamponade, toxins, thrombosis (coronary / pulmonary) [^aha-cpr-2025]
- Point-of-care ultrasound during pulse checks (tamponade, RV dilation, hypovolemia) [^aha-cpr-2025]

@branch
if: Suspected hyperkalemia (dialysis patient, peaked T before arrest)
- Calcium gluconate / chloride IV, sodium bicarbonate, insulin + dextrose (see [[hyperk-ecg|Hyperkalemia with ECG changes]]) [^aha-cpr-2025]

@branch
if: Rhythm becomes VF / pulseless VT
go: arrest-vf

@branch
if: ROSC
go: arrest-vf
