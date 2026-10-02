@topic headache
cluster: neuro
name: Headache
name_fa: سردرد
source: B
keywords: sah cluster migraine temporal arteritis
refs: acep-headache-2019, ean-cluster-2023

@guide
# ایده کلی
بیشتر سردردها اولیه و خوش‌خیم‌اند (میگرن، تنشی، کلاستر). کار اورژانس پیدا کردن «پرچم‌های قرمز» است: سردرد ناگهانی و شدید، تب با سفتی گردن، علائم نورولوژیک، سن بالا، سرکوب ایمنی، ضربه و ضدانعقاد [^acep-headache-2019].
# سه شاخه
- **سردرد شناخته‌شده و بیمار پایدار:** مسکن غیراپیوئیدی (استامینوفن، ایبوپروفن) و ضدتهوع؛ بعد از بهبود می‌تواند مرخص شود.
- **پرچم قرمز:** سطح ۱ و CT مغز؛ در صورت لزوم LP یا CTA.
- **کلاستر:** اکسیژن با جریان بالا و سوماتریپتان زیرجلدی [^ean-cluster-2023].
# نکات
- ESR در خانم بالای ۵۰ سال با شک به آرتریت تمپورال.
- βHCG در سنین باروری.
- فشار بالای 180/110 را کنترل کنید.

@variant headache-benign
name: Known headache, stable
level: III
source: B
meta: Imp: Headache · C: III
refs: acep-headache-2019

@scenario
خانمی ۳۴ ساله با میگرن شناخته‌شده از ۱۲ ساعت پیش سردرد ضربان‌دار سمت راست با تهوع دارد، شبیه حمله‌های قبلی. علائم حیاتی و معاینه عصبی نرمال و سفتی گردن ندارد.

@why
سردرد شناخته‌شده و کم‌خطر است؛ مسکن و ضدتهوع و ترخیص بعد از بهبود.

@orders
- CVS / NPO / CBR; supine, head elevated 30°
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, BS, **ESR**
- PO & HM
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- IV line fix; N/S 1 L IV stat, free infusion
- ECG; BS glucometry
- Bed-side guard + fixed relative
- Amp Ranitidine 50 mg IV stat
- Tab **Acetaminophen 500 mg** PO stat **or** Tab **Gelofen (ibuprofen) 400 mg** PO stat
- Amp **Metoclopramide 10 mg** IV

@branch
if: The patient has a known previous headache, you know the history well, **no meningismus**, **stable vital signs**, **no focal deficit**, and **improves during observation**
- **May be discharged from the emergency department**

@branch
if: Severe headache refractory to the analgesics above, no contraindication
- Amp **Morphine 3 mg** IV slowly over 3 min with RR control

@branch
if: Brain CT is needed
go: headache-redflag

@notes
- در صورتی که بیمار سردرد شناخته شده قبلی دارد، از تاریخچه بیمار آگاهی کامل داریم، علائم مننژیسموس نداشته باشد، علائم حیاتی پایدار داشته باشد، FND نداشته باشد و در طی دوره تحت نظر بهبود یابد می‌توان از اورژانس مرخص نمود.

@variant headache-redflag
name: Red flags → Level I
level: I
source: B
meta: Imp: Headache with red flags · Level I
refs: acep-headache-2019

@scenario
مردی ۵۲ ساله «بدترین سردرد عمرش» را ناگهان حین فعالیت داشته (رعد آسا)، با سفتی گردن و استفراغ. یا سردرد شدید با کاهش هوشیاری یا علائم موضعی. یا درد گردن با درد یک‌طرفه صورت و بی‌حسی دست و پا (مشکوک به دایسکشن کاروتید).

@why
پرچم قرمز دارد: سطح ۱، CT مغز و اقدامات اورژانسی، نه صرفاً مسکن.

@orders
- CVS / NPO / CBR; supine, head elevated 30°
- Labs: CBC/diff, BUN/Cr, Na, K, PT, PTT, INR, BS, **ESR**
- PO & HM
- O2 by nasal cannula 4–6 L/min if SpO2 ≤ 94%
- IV line fix; N/S 1 L IV stat, free infusion
- ECG; BS glucometry
- Bed-side guard + fixed relative
- Amp Ranitidine 50 mg IV stat
- Tab **Acetaminophen 500 mg** PO stat **or** Tab **Gelofen (ibuprofen) 400 mg** PO stat
- Amp **Metoclopramide 10 mg** IV
- Move to the resuscitation room (Level I); resuscitation + intubation equipment at the bedside
- **Brain CT**

@branch
if: **Brain CT is indicated** if any of: focal neurological deficit, suspected raised ICP, signs of meningitis, loss of consciousness, moderate or severe head trauma, severe or sudden headache, change in intensity or duration of a previous headache, CSF shunt, older age, minor head trauma on anticoagulants / alcohol / liver or kidney disease, headache not responding to drugs, immunosuppression, or headache with seizure
- Brain CT as above

@branch
if: Level I triggers: ↓LOC, focal deficit, herniation signs, terrible sudden headache, neck pain + unilateral facial pain + hand/foot numbness (suspect carotid dissection)
- Level I, resuscitation equipment at the bedside

@notes
- اگر بیمار کاهش سطح هوشیاری دارد، علائم FND دارد، علائم هرنی مغزی، تغییر در سطح هوشیاری، سردرد شدید و وحشتناک، درد گردن و یک‌طرفه صورت و بی‌حسی در دست و پا (مشکوک به دایسکشن کاروتید) بیمار در سطح یک قرار می‌گیرد.
- Brain CT در صورت وجود FND، شک به افزایش ICP، علائم مننژیت، LOC، تروماى سر متوسط و شدید، سردردهای شدید و ناگهانی، تغییر در شدت و مدت زمان علائم سردرد قبلی، وجود شانت مغزی، افراد مسن، تروماهای سر مینور که فرد داروهای ضد انعقاد، الکل، مشکلات کبدی و کلیوی دارد، سردردهایی که به درمان دارویی جواب نداده‌اند، سردرد در افراد نقص ایمنی و سردرد همراه با تشنج لازم است.

@variant headache-cluster
name: Cluster headache
level: III
source: B
meta: Imp: Cluster headache
refs: ean-cluster-2023

@scenario
مردی ۳۸ ساله درد شدید و سوزنده اطراف چشم راست دارد که ۴۵ دقیقه طول کشیده، با اشک‌ریزش، گرفتگی بینی و بی‌قراری. هر شب چند هفته است تکرار می‌شود.

@why
کلاستر درمان خاص دارد: اکسیژن با جریان بالا و سوماتریپتان.

@orders
- **First step: high-flow O2 by mask, at least 12 L/min for 15 min** [^ean-cluster-2023]
- CVS / NPO / CBR, monitor, IV line
- **Sumatriptan 6 mg SC** (or intranasal) if no cardiovascular contraindication [^ean-cluster-2023]

@variant headache-special
name: Special tests: GCA, pregnancy, severe hypertension
level: II
source: B
meta: Add-ons to the base headache orders.
refs: acep-headache-2019

@scenario
خانمی ۶۸ ساله با سردرد جدید شقیقه و درد فک (مشکوک به آرتریت تمپورال)، یا خانمی باردار ۳۵ هفته با سردرد و فشار 170/110، یا بیماری با فشار بالای 180/110.

@why
برای این گروه‌ها یک آزمایش یا اقدام اختصاصی لازم است (ESR، βHCG، کنترل فشار).

@branch
if: Suspected **temporal arteritis**: woman older than 50, collagen-vascular disease
- Check **ESR**

@branch
if: Fertile woman, suspected **eclampsia**
- Check **βHCG**
go: seizure-causes

@branch
if: **BP > 180/110**
- **Blood pressure control is mandatory**

@notes
- ESR در شک به آرتریت تمپورال معمولاً در خانم‌های سن بالای ۵۰ سال با سابقه بیماری‌های کلاژن واسکولار و βHCG در خانم‌های در سنین باروری و شک به اکلامپسی چک شود.
- در صورت وجود BP > ۱۸۰/۱۱۰ کنترل فشار خون الزامی است.
