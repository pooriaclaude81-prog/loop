@topic seizure
cluster: neuro
name: Seizure
name_fa: تشنج
source: AB
keywords: status epilepticus phenytoin diazepam depakin valproate levetiracetam
refs: aes-se-2016, esett-2019

@guide
# ایده کلی
بیشتر تشنج‌ها خودبه‌خود در کمتر از ۲ تا ۳ دقیقه تمام می‌شوند. کارهای شما: ایمنی بیمار، رد علت قابل‌درمان (قند، سدیم، کلسیم، مسمومیت، ضربه، خونریزی)، و درمان اگر ادامه پیدا کرد [^aes-se-2016].
# سه وضعیت
- **تشنج تمام شده، بیمار پایدار:** آزمایش، قند، ECG، CT اگر اندیکاسیون دارد. بار اول و تک‌نوبت معمولاً داروی ضدتشنج لازم ندارد.
- **استاتوس (بیش از ۵ دقیقه یا تکرار بدون برگشت هوشیاری):** خط اول بنزودیازپین، خط دوم فنی‌توئین/والپروات/لوتیراستام (اثر مشابه دارند)، خط سوم اینتوباسیون و بیهوشی [^esett-2019].
- **تشنج علامتی:** اگر علت پیدا شد (قند پایین، سدیم پایین، کلسیم پایین، مسمومیت، اکلامپسی) درمان علت اصلی‌ترین کار است.
# چرا آمپول دیازپام آماده؟
چون در تشنج راه ورید ممکن است سخت باشد؛ میدازولام عضلانی گزینه جایگزین است.

@variant seizure-stable
name: Seizure over, patient stable
level: II
source: AB
meta: Imp: Seizure · C: II · NPO · CBR · supine, head elevated
refs: aes-se-2016

@scenario
مردی ۳۲ ساله دو دقیقه تشنج تونیک‌کلونیک عمومی داشته که شاهد داشته است. حالا بعد از تشنج است و کم‌کم هوشیار می‌شود (GCS از 13 به 15)، فشار 130/80، قند 110. یا بار اول است یا مبتلا به صرع که دارویش را نخورده است.

@why
تشنج تمام شده و بیمار پایدار است؛ بررسی علت، ایمنی و آمادگی برای تشنج بعدی کافی است.

@orders
- CVS / NPO / CBR; bed guard + fixed relative; bed head up
- IV line fix
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, Ph, Mg, BS, PT, PTT, INR. @A Also CPK, LDH, CK-MB, Trop, UA, ALT, AST, ALP. @B Also Alb.
- PO & HM
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- N/S 1 L IV stat, free infusion
- ECG
- BS glucometry
- Brain CT when indicated (list below)
- Move the patient only with the resuscitation team
- Amp **Diazepam 10 mg** on **standby**, **or** Amp **Midazolam 5–10 mg IM** if no peripheral line
- @A Amp Pantoprazole 40 mg IV stat
- Resuscitation + intubation equipment at the bedside; LP set if indicated

@branch
if: **First seizure**, a single episode, patient now awake
- **Do not start** an antiseizure drug

@branch
if: On antiseizure drugs
- Check the serum level (Depakin / valproate, phenobarbital, levetiracetam, carbamazepine)

@branch
if: Brain CT indicated
- Brain CT indications: first seizure, suspected structural brain lesion, focal deficit, persistent altered consciousness, fever, recent head trauma, persistent headache, cancer history, anticoagulant use, immunodeficiency / HIV / chemotherapy, age > 40, partial seizure.

@branch
if: Fertile female
- βHCG

@branch
if: Suspected liver disease
- LFT

@branch
if: Suspected substance misuse
- Drug / toxin panel and levels

@branch
if: Seizure continues > 5 min or repeats without recovery
go: seizure-status

@branch
if: Low BS, low Na, low Ca, poisoning, eclampsia
go: seizure-causes

@branch
if: Neurology service ordering an antiseizure load
go: seizure-neuro-load

@notes
- در خانم‌های سنین باروری βHCG چک شود. در صورت شک به بیماری‌های کبدی LFT چک شود.
- در مواردی که بیمار بار اول است که تشنج کرده است و فقط یک نوبت تکرار شده است اندیکاسیون شروع داروی ضد تشنج ندارد و نباید شروع شود.
- در صورتی که بیمار سابقه تشنج و مصرف داروهای ضد تشنج دارد سطح سرمی داروها چک شود.
- در بیمارانی که شک به سوء مصرف مواد داریم داروها و سطح توکسین دارویی چک شود.

@variant seizure-status
name: Status epilepticus (3 lines)
level: I
source: B
meta: Imp: Status epilepticus · Level I
refs: aes-se-2016

@scenario
خانمی ۴۵ ساله هشت دقیقه است که تشنج می‌کند، یا چند تشنج پشت سر هم داشته و بین آنها هوشیار نشده است. SpO2 در حال افت و قند خون هنوز مشخص نیست.

@why
این استاتوس است؛ باید سریع و پله‌پله بنزودیازپین، داروی خط دوم و در صورت لزوم بیهوشی را پیش ببرید.

@orders
- Level I: resuscitation room, airway, O2, IV line, monitor, check glucose immediately
-- First line (benzodiazepine)
- **Diazepam 5 mg** IV over 2 min; repeat every 2–3 min up to a **cumulative 20 mg**
- (No IV line: Midazolam 5–10 mg IM)
-- Second line
- **Phenytoin 20 mg/kg** IV, at **max 50 mg/min** (or fos-phenytoin 20 mg/kg at max 150 mg/min IM/IV)
- **or** Sodium **valproate 20–40 mg/kg** IV over 10–20 min
- **or** **Levetiracetam 1–3 g** IV over 15 min
-- Third line: intubate, then start one of
- Pentobarbital 5 mg/kg then 0.5–3 mg/kg/h
- Phenobarbital 20 mg/kg then 50 mg/min
- Midazolam 0.2 mg/kg then 0.1–0.4 mg/kg/h
- Propofol 2 mg/kg then 5–10 mg/kg/h

@branch
if: A cause is found: hypoglycemia, low Na, low Ca, poisoning, eclampsia
go: seizure-causes

@notes
- درمان status: ۱) تشنج بیشتر از ۵ دقیقه یا ۲) تشنج‌های مکرر که در بین آنها بیمار هوشیار نشود.

@variant seizure-causes
name: Provoked seizure: treat the cause (hub)
level: II
source: B
meta: Use with the stable or status pages when the cause is found.
refs: aes-se-2016

@scenario
بیمار تشنج‌کننده‌ای که قند خونش 40 است، یا سدیمش 114 است، یا داروی سه‌حلقه‌ای زیاد خورده، یا خانم باردار هفته ۳۶ با فشار 170/110 است. درمان علت، تشنج را متوقف می‌کند وقتی بنزودیازپین کار نمی‌کند.

@why
این هاب علل قابل‌درمان تشنج را فهرست می‌کند؛ هر کدام درمان اختصاصی دارد.

@branch
if: **Hypoglycemia, BS < 60**
- **Dextrose 50%** IV: adult dose 25 g (50 mL of D50) [^ada-soc-2026]
go: hypoglycemia-bs

@branch
if: **Hyponatremia, Na < 120**
- **3% saline 3 mL/kg**

@branch
if: **Hypocalcemia, Ca < 6–7**
- **Calcium gluconate 10%, 10–30 mL**

@branch
if: **TCA overdose**
- Alkalinize: **Sodium bicarbonate 1 mEq/kg** and infusion

@branch
if: **Aspirin overdose**
- Alkalinization with **sodium bicarbonate 1 mEq/kg** + infusion; **dialysis**

@branch
if: **Isoniazid overdose**
- **Pyridoxine 5 g IV**

@branch
if: **Lithium poisoning**
- **Hemodialysis**

@branch
if: **Cocaine / methamphetamine ("glass")**
- **Benzodiazepine**

@branch
if: **Eclampsia**
- **Magnesium sulfate 6 g** over 20 min

@notes
- در هیپوگلیسمی BS < 60: از دکستروز ۵۰٪ ۱ gr/kg تزریق شود. هیپوناترمی Na < 120: تزریق ۳ cc/kg از سالین ۳٪. هیپوکلسمی Ca < 7-6: تزریق ۱۰ تا ۳۰ cc از کلسیم گلوکونات ۱۰٪. TCA overdose: آلکالیزاسیون با ۱ mg/kg سدیم بی‌کربنات و انفوزیون آن. ASA overdose: آلکالیزاسیون + دیالیز. ایزونیازید: پیریدوکسین ۵ گرم IV. مسمومیت با لیتیوم: همودیالیز. تشنج با کوکائین یا شیشه: بنزودیازپین. اکلامپسی: منیزیم سولفات ۶ گرم ظرف ۲۰ دقیقه.

@variant seizure-neuro-load
name: Neurology-service loading order
level: II
source: A
meta: Source A: this order was written by the **neurology service**, not emergency medicine.
refs: aes-se-2016

@scenario
بیماری ۴۰ ساله با تشنج توسط سرویس نورولوژی ویزیت شده و یک سری دستور کامل شامل «لود» داروی ضدتشنج نوشته‌اند.

@why
این دستور از سرویس نورولوژی (نه اورژانس) است و فنی‌توئین یا والپروات را به‌عنوان لود می‌دهد.

@orders
- Imp: seizure. Diet: NPO. Activity: CBR
- Labs: CBC/diff, BUN, Cr, Na, K, Mg, P, Ca, BS, PT, PTT, INR, CPK, LDH, CK-MB, Trop, UA, ALT, AST, ALP
- BS by glucometry
- ECG
- Spiral brain CT without contrast
- Amp **Phenytoin 750 mg** stat, then **100 mg TDS** (ampules in 500 mL N/S); usual load 15–20 mg/kg [^aes-se-2016]
- **Or instead of the phenytoin**: Amp **Depakin (valproate) 1200 mg** stat IV
- Amp **Diazepam** standby
- Amp Pantoprazole 40 mg IV stat
- Bed side up; a companion stays with the patient
