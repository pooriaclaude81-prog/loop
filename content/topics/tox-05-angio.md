@topic angio
cluster: tox
name: Angioedema / anaphylaxis
name_fa: آنژیوادم / آنافیلاکسی
source: A
keywords: allergy epinephrine acei hereditary c1 glucagon
refs: aaaai-anaphylaxis-2023, wao-anaphylaxis-2020, wao-hae-2025

@guide
# ایده کلی
آنژیوادم تورم عمق پوست و مخاط است. سه علت اصلی با درمان‌های متفاوت:
- **آلرژیک/هیستامینی** (با کهیر): اپی‌نفرین عضلانی، آنتی‌هیستامین، کورتون [^aaaai-anaphylaxis-2023].
- **مهارکننده ACE یا ارثی** (بدون کهیر): برادی‌کینین دخیل است؛ آنتی‌هیستامین و کورتون اثر ندارند. تمرکز بر راه هوایی [^wao-hae-2025].
- **مقاوم یا مصرف بتابلوکر:** گلوکاگون [^wao-anaphylaxis-2020].
# منطق دستورها
- **اپی‌نفرین عضلانی** مهم‌ترین داروست؛ هرچه زودتر.
- مایع وریدی.
- کورتون فاز حاد را درمان نمی‌کند ولی از عود جلوگیری می‌کند.
- راه هوایی را مرتب ارزیابی کنید؛ استریدور یا تورم زبان یعنی اینتوباسیون زودهنگام.

@variant angio-allergic
name: Allergic angioedema / anaphylaxis
level: II
source: A
meta: Imp: Angioedema
refs: aaaai-anaphylaxis-2023

@scenario
خانمی ۲۶ ساله ۲۰ دقیقه بعد از خوردن میگو لب و زبانش ورم کرده، کهیر و ویز دارد. فشار 100/60، نبض 115 و استریدور ندارد. آنافیلاکسی خفیف همراه آنژیوادم.

@why
واکنش آلرژیک است؛ اپی‌نفرین عضلانی اولویت اول است، بقیه کمکی‌اند.

@orders
- IV line fix
- O2 by nasal cannula 3–4 L/min
- Serum N/S **500–1000 mL** IV stat
- Epinephrine (1:1000, 1 mg/mL) **0.01 mg/kg (usually 0.3–0.5 mg) IM**, anterolateral thigh, stat, repeat every 5–15 min [^aaaai-anaphylaxis-2023][^wao-anaphylaxis-2020]
- Amp **Hydrocortisone 200 mg** IV stat [^wao-anaphylaxis-2020]
- Amp **Chlorpheniramine 10 mg** IM or IV slowly
- Salbutamol spray 4 puffs stat, or nebulized

@branch
if: On a beta-blocker, or no response to the above
go: angio-bblocker

@branch
if: Angioedema **without urticaria**, ACE-inhibitor or hereditary
go: angio-acei-hae

@branch
if: Stridor, voice change, tongue swelling threatening the airway
- Early intubation by the most experienced operator; surgical airway kit open [^wao-anaphylaxis-2020]
- Epinephrine IM and also nebulized epinephrine

@notes
- گلوکوکورتیکوئیدها (مثل هیدروکورتیزون) در فاز حاد مؤثر نیستند ولی از عود برونکواسپاسم، هیپوتانسیون یا کلاپس جلوگیری می‌کنند.
- آنتی‌هیستامین‌ها خط اول درمان در کهیر و آنژیوادم هستند.
- در موارد متوسط و شدید از اپی‌نفرین استفاده می‌شود.

@variant angio-bblocker
name: Beta-blocker patient / refractory
level: I
source: A
meta: Imp: Angioedema / anaphylaxis, refractory
refs: wao-anaphylaxis-2020

@scenario
مردی ۵۸ ساله که بیزوپرولول مصرف می‌کند دچار آنافیلاکسی شده است. فشار 70/40 و برونکواسپاسم دارد که با چند نوبت اپی‌نفرین بهتر نمی‌شود.

@why
بتابلوکر اثر اپی‌نفرین را کم می‌کند؛ گلوکاگون جایگزین مؤثر است.

@orders
- Continue the orders on the [[angio-allergic|allergic page]] (fluids, antihistamine, steroid, salbutamol)
- Amp **Glucagon 1 mg** IV stat, then **1 mg/h** IV infusion
- Aggressive IV fluids, and escalate to epinephrine infusion as per the resuscitation protocol [^wao-anaphylaxis-2020]

@notes
- در صورت مصرف داروی بتابلوکر و یا عدم پاسخ به درمان‌های فوق: Amp Glucagon 1mg IV stat then 1mg/h IV inf

@variant angio-acei-hae
name: No urticaria: ACE-I or hereditary
level: II
source: A
meta: Imp: Angioedema without urticaria
refs: wao-hae-2025

@scenario
مردی ۶۲ ساله که لیزینوپریل مصرف می‌کند، شش ساعت است لب و زبانش پیشرونده ورم کرده، بدون کهیر یا خارش و بدون ویز. یا جوانی با سابقه خانوادگی، شکم‌درد و تورم (کمبود C1 اینهیبیتور ارثی).

@why
بدون کهیر است و آنتی‌هیستامین و کورتون اثر ندارند؛ تمرکز بر راه هوایی و درمان اختصاصی.

@orders
- IV line fix, O2, monitor
- **Treatment focuses on the airway and hemodynamic instability**
- Antihistamines and steroids are **not** the answer (no urticaria, bradykinin-mediated)
- In **hereditary angioedema**, **FFP**, which contains C1 inhibitor, is useful
- Stop the ACE inhibitor permanently [^wao-hae-2025]
- Hereditary angioedema: **C1-inhibitor concentrate** (e.g. 20 U/kg IV) or **icatibant 30 mg SC**; adrenaline, antihistamines and steroids are ineffective [^wao-hae-2025]
- Airway: serial assessment, early awake fiberoptic or surgical-airway planning for expanding swelling [^wao-hae-2025]

@notes
- آنژیوادم بدون کهیر علامت کمبود مهارکننده C1 است یا به علت مصرف ACEI ایجاد شده است.
- درمان در آنژیوادم متمرکز بر برقراری راه هوایی و ناپایداری همودینامیک است.
- در موارد آنژیوادم ارثی، استفاده از FFP که مهارکننده C1 دارد مفید است.
