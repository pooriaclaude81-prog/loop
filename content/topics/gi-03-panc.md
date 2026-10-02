@topic panc
cluster: gi
name: Acute pancreatitis
name_fa: پانکراتیت حاد
source: AB
keywords: amylase lipase epigastric pain
refs: acg-pancreatitis-2024

@guide
# ایده کلی
پانکراتیت حاد التهاب پانکراس است (شایع‌ترین علل: سنگ صفرا و الکل). درمان عمدتاً حمایتی است [^acg-pancreatitis-2024].
# ستون‌های درمان
- **مایع:** مایع وریدی (ترجیحاً رینگر لاکتات) با حجم متوسط تا زیاد و کنترل مکرر؛ مراقب نارسایی قلب و کلیه.
- **مسکن:** مورفین یا پتدین؛ مطالعات نشان نداده مورفین پانکراتیت را بدتر کند.
- **لوله NG** فقط در پانکراتیت متوسط تا شدید. در نوع خفیف تغذیه دهانی زودهنگام ایده‌آل است.
- **آنتی‌بیوتیک** پروفیلاکتیک نه؛ فقط وقتی نکروز عفونی یا کلانژیت دارد.
- **لیپاز** بهتر از آمیلاز است و ۳ برابر نرمال ارزش دارد؛ لازم نیست هر دو را بفرستید.
- **سونوگرافی** برای سنگ صفرا؛ CT روتین لازم نیست.

@variant panc-mild
name: Mild pancreatitis
level: III
source: AB
meta: Imp: Acute pancreatitis (mild) · NPO initially
refs: acg-pancreatitis-2024

@scenario
مردی ۴۵ ساله بعد از غذای چرب و الکل درد اپیگاستر دارد که به پشت تیر می‌کشد، یک بار استفراغ کرده است. همودینامیک پایدار، لیپاز ۴ برابر نرمال و نارسایی ارگان ندارد.

@why
پانکراتیت خفیف است؛ تغذیه دهانی زود، بدون NG و بدون آنتی‌بیوتیک.

@orders
- IV line fix
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, BS, Bili (T, D), ALT, AST, ALP, **amylase or lipase** (lipase is preferred), LDH, VBG, Alb @A Also HBsAg, HBsAb, P, PT, PTT, INR
- CXR (PA)
- **Ultrasound of liver, gallbladder, bile ducts** (case also lists pancreas)
- Amp **Ondansetron 4 mg** IV stat
- ECG; chart I/O
- Internist or surgeon consult
- Serum **N/S 2 L** IV stat @A, then maintenance with **lactated Ringer's**, preferred over saline [^acg-pancreatitis-2024]
- Amp **Morphine sulfate 2–5 mg** IV slowly, stat
- No NG tube: in mild pancreatitis **oral feeding is ideal** and shortens admission
- No prophylactic antibiotic

@notes
- درمان پانکراتیت حاد عمدتاً حمایتی است.
- تعیین سطح سرمی لیپاز نسبت به آمیلاز برتر است زیرا اختصاصیت بالاتری دارد. انجام همزمان هر دو تست، حساسیت و ویژگی را افزایش نمی‌دهد.
- برای هر ۲ آنزیم مقدار ۳ برابر بیشتر از نرمال ارزش دارد.
- انجام روتین CT scan نیاز نیست و فقط برای موارد نامشخص یا در فاز تأخیری برای رد کردن عوارض توصیه می‌شود.
- اگرچه گفته می‌شود مورفین باعث اسپاسم اسفنکتر اودی می‌شود ولی مطالعات بالینی که نشان‌دهنده‌ی بدتر شدن پانکراتیت یا کولسیستیت با مورفین باشد وجود ندارد.

@variant panc-modsevere
name: Moderate to severe pancreatitis
level: II
source: AB
meta: Imp: Acute pancreatitis (moderate / severe) · NPO
refs: acg-pancreatitis-2024

@scenario
خانمی ۶۸ ساله سه روز است درد مداوم (غیرکولیکی) اپیگاستر دارد و از دیروز تهوع و استفراغ. نبض 112، فشار 100/62، مخاط خشک، لیپاز ۸ برابر نرمال و کراتینین در حال افزایش.

@why
متوسط تا شدید است؛ مایع بیشتر، NG و مسکن لازم است.

@orders
- IV line fix
- Labs: CBC/diff, BUN/Cr, Na, K, Ca, BS, Bili (T, D), ALT, AST, ALP, **amylase or lipase** (lipase is preferred), LDH, VBG, Alb @A Also HBsAg, HBsAb, P, PT, PTT, INR
- CXR (PA)
- **Ultrasound of liver, gallbladder, bile ducts** (case also lists pancreas)
- Amp **Ondansetron 4 mg** IV stat
- ECG; chart I/O
- Internist or surgeon consult
- Serum **N/S 500 mL IV over 2 h, then 200 mL/h** @A; lactated Ringer's is preferred over saline [^acg-pancreatitis-2024]
- **NG tube fix** (only for moderate to severe pancreatitis)
- Amp **Morphine sulfate 2–5 mg** IV slowly @A
- Amp Pantoprazole 40 mg IV BD
- Amp Ondansetron 4 mg IV BD

@branch
if: CT scan
- Not routine. Use for unclear diagnosis or in the late phase to look for complications.

@branch
if: Infected / necrotizing pancreatitis, or with cholangitis
go: panc-infected

@notes
- سرم رینگر لاکتات، فیزیولوژیک‌تر از نرمال سالین است و ممکن است در بیمارانی که حجم زیادی از مایعات دریافت می‌کنند با پروگنوز بهتر همراه باشد.

@variant panc-infected
name: Infected or necrotizing, or with cholangitis
level: II
source: B
meta: Imp: Acute pancreatitis with infection
refs: tg18

@scenario
مردی ۵۹ ساله روز هشتم پانکراتیت شدید تب 39 دارد، WBC رو به افزایش و در CT نکروز عفونی. یا پانکراتیت با تب، زردی و درد RUQ (کلانژیت).

@why
عفونی یا همراه کلانژیت است؛ تنها در این حالت آنتی‌بیوتیک اندیکاسیون دارد.

@orders
- Continue the orders of [[panc-modsevere|moderate to severe]] pancreatitis
- Antibiotics (choose one):
- Amp **Ciprofloxacin 400 mg** IV stat + Amp **Metronidazole 500 mg** IV stat
- **or** Amp **Tazocin 3.375 g** IV infusion
- **or** Amp **Ceftriaxone 1 g** IV infusion + Amp **Metronidazole 500 mg** IV infusion

@notes
- آنتی‌بیوتیک پروفیلاکتیک اندیکاسیون ندارد و نباید صرفاً به دلیل وجود کرایتریای SIRS تجویز شود. ولی در مواردی که پانکراتیت نکروزه و عفونی شود یا شواهد آشکار عفونت وجود داشته باشد، آنتی‌بیوتیک تجویز می‌شود.
