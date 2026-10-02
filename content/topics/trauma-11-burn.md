@topic burn
cluster: trauma
name: Burns
name_fa: سوختگی
source: A
keywords: parkland escharotomy vitamin c inhalation
refs: aba-burn-2024, isbi-2016

@guide
# ایده کلی
در سوختگی وسیع اولین خطر شوک سوختگی (نشت مایع) است و در سوختگی صورت و استنشاقی، خطر راه هوایی [^aba-burn-2024].
# منطق دستورها
- **مایع (رینگر لاکتات):** فرمول پارکلند: 4 × وزن × درصد سوختگی؛ نیمی در ۸ ساعت اول و نیم دیگر در ۱۶ ساعت بعد. راهنمای جدید شروع با 2 ml/kg/%TBSA و تنظیم با ادرار 0.5 ml/kg/h را پیشنهاد می‌کند. درجه یک حساب نمی‌شود.
- مسکن، پوشاندن، پیشگیری از هیپوترمی.
- **سوند فولی و NG** برای پایش و تغذیه.
- **راه هوایی:** مو سوخته بینی، دوده در دهان، صدای گرفته → اینتوباسیون زودهنگام [^isbi-2016].
- **اسکاروتومی** اگر سوختگی حلقوی روی توراکس یا اندام باعث محدودیت تنفس یا ایسکمی شود.

@variant burn-std
name: Major burn: Parkland resuscitation
level: I
source: A
meta: Imp: burn · NPO · ICU admission
refs: aba-burn-2024

@scenario
مردی ۳۵ ساله (70 کیلوگرم) از آتش‌سوزی خانه نجات یافته؛ سوختگی درجه ۲ و ۳ حدود ۴۰٪ سطح بدن. درد شدید، فشار 100/60 و نبض 120. راه هوایی فعلاً باز است.

@why
سوختگی وسیع است؛ احیای مایع با پارکلند، مسکن و بستری ICU.

@orders
- Imp: burn · Diet: NPO
- IV line ×2 **large**, or a **central line**
- Labs: CBC/diff, BUN, Cr, Na, K, BS, ABG, UA, Ca
- CXR
- **Ringer lactate** resuscitation by the Parkland formula: **4 mL × body weight (kg) × % burn** (first-degree burns are not counted); **half in the first 8 h, the other half over the next 16 h**. Example: 70 kg, 40% burn = 11,200 mL, 700 mL/h for the first 8 h. A starting rate of 2 mL/kg/%TBSA titrated to urine output 0.5 mL/kg/h is advised [^aba-burn-2024]
- NG tube fix; Foley catheter fix; chart I/O
- Amp **Famotidine 20 mg** IV stat, then TDS
- Amp **Morphine sulfate (MS) 5 mg** IV stat, slowly
- Cardiac monitoring + pulse oximetry
- Amp **Td 0.5 mL** SC stat
- Wash and dress the **non-burned** areas, **splint** the burned limb (**avoid manipulating blisters**)
- ICU admission; surgeon consult
- O2 by face mask **4–6 L/min**
- Amp **Vitamin C 1 g ×10 (10 g)** infusion in 1000 mL serum (burns > 30%); if given, reduce the initial fluid volume

@branch
if: **Vitamin C** is usually given for burns **> 30%**
- If given, **reduce the initial fluid volume**

@branch
if: Burns to count in the Parkland formula
- **First-degree burns are not counted**

@branch
if: Airway risk (face / neck burns, inhalation)
go: burn-airway

@branch
if: Circumferential burns of the thorax, neck or limbs
go: burn-circ

@notes
- سوختگی‌های درجه ۱ در قانون پارکلند محاسبه نمی‌شوند.
- Vit C معمولاً در بیماران با سوختگی بالای ۳۰٪ تجویز می‌شود و در صورت تجویز باید از حجم سرم اولیه کاسته شود.

@variant burn-airway
name: Inhalation / airway concern
level: I
source: A
meta: Imp: burn with airway involvement · Level I
refs: isbi-2016

@scenario
مردی ۴۰ ساله در آتش‌سوزی اتاق بسته: مو بینی سوخته، دوده در دهان، صدا گرفته، سوختگی صورت و SpO2 برابر 90٪.

@why
خطر راه هوایی دارد؛ اینتوباسیون زودهنگام قبل از ورم.

@orders
- Imp: burn · Diet: NPO
- IV line ×2 **large**, or a **central line**
- Labs: CBC/diff, BUN, Cr, Na, K, BS, ABG, UA, Ca
- CXR
- **Ringer lactate** resuscitation by the Parkland formula: **4 mL × body weight (kg) × % burn** (first-degree burns are not counted); **half in the first 8 h, the other half over the next 16 h**. Example: 70 kg, 40% burn = 11,200 mL, 700 mL/h for the first 8 h. A starting rate of 2 mL/kg/%TBSA titrated to urine output 0.5 mL/kg/h is advised [^aba-burn-2024]
- NG tube fix; Foley catheter fix; chart I/O
- Amp **Famotidine 20 mg** IV stat, then TDS
- Amp **Morphine sulfate (MS) 5 mg** IV stat, slowly
- Cardiac monitoring + pulse oximetry
- Amp **Td 0.5 mL** SC stat
- Wash and dress the **non-burned** areas, **splint** the burned limb (**avoid manipulating blisters**)
- ICU admission; surgeon consult
- O2 by face mask **4–6 L/min**, with **intubation for a secure airway**
- **Early intubation** while the airway is still passable; carboxyhemoglobin level; 100% O2 if CO exposure is suspected [^isbi-2016]

@variant burn-circ
name: Circumferential burn → escharotomy
level: I
source: A
meta: Imp: burn with circumferential eschar
refs: isbi-2016

@scenario
مردی ۳۰ ساله با سوختگی تمام‌ضخامت دور قفسه و ساعد چپ. تنفسش محدود و دست سرد با نبض ضعیف است.

@why
اسکار حلقوی است؛ اسکاروتومی لازم است.

@orders
- Imp: burn · Diet: NPO
- IV line ×2 **large**, or a **central line**
- Labs: CBC/diff, BUN, Cr, Na, K, BS, ABG, UA, Ca
- CXR
- **Ringer lactate** resuscitation by the Parkland formula: **4 mL × body weight (kg) × % burn** (first-degree burns are not counted); **half in the first 8 h, the other half over the next 16 h**. Example: 70 kg, 40% burn = 11,200 mL, 700 mL/h for the first 8 h. A starting rate of 2 mL/kg/%TBSA titrated to urine output 0.5 mL/kg/h is advised [^aba-burn-2024]
- NG tube fix; Foley catheter fix; chart I/O
- Amp **Famotidine 20 mg** IV stat, then TDS
- Amp **Morphine sulfate (MS) 5 mg** IV stat, slowly
- Cardiac monitoring + pulse oximetry
- Amp **Td 0.5 mL** SC stat
- Wash and dress the **non-burned** areas, **splint** the burned limb (**avoid manipulating blisters**)
- ICU admission; surgeon consult
- **Escharotomy** if indicated

@branch
if: Circumferential eschar of the **thorax or neck** with possible respiratory restriction
- **Escharotomy**

@branch
if: **Limb** escharotomy
- Cut on the **mid-lateral** side, deep enough that **fat bulges out**

@notes
- در زخم‌های حلقوی توراکس و گردن، در صورت احتمال محدودیت تنفسی، باید اسکاروتومی انجام شود.
- اسکاروتومی در اندام باید در سمت mid lat انجام شود و در حدی که چربی بیرون بزند کفایت می‌کند.
