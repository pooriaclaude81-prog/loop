@topic tetanus
cluster: trauma
name: Tetanus prophylaxis (shared table)
name_fa: پیشگیری از کزاز
source: B
keywords: td tetabulin vaccine immunoglobulin wound
refs: acip-tetanus-2019, acip-2018

@guide
# ایده کلی
در هر زخم باید وضعیت واکسن کزاز را بررسی کرد. اگر واکسیناسیون کامل است نیازی به تزریق اضافه نیست؛ تصمیم بر اساس سابقه دوزها و نوع زخم است [^acip-tetanus-2019].
# دو سؤال
- سابقه واکسن: نامشخص یا کمتر از ۳ دوز، یا ۳ دوز و بیشتر؟
- زخم: تمیز و کوچک، یا غیر از آن (آلوده، له‌شدگی، نافذ، سوختگی)؟
# جدول
- تمیز و کوچک + نامشخص/کمتر از ۳ دوز: Td یا Tdap.
- تمیز و کوچک + ۳ دوز یا بیشتر: Td فقط اگر بیش از ۱۰ سال از آخرین دوز گذشته.
- سایر زخم‌ها + نامشخص/کمتر از ۳ دوز: Td/Tdap و ایمونوگلوبولین کزاز (۲۵۰ واحد).
- سایر زخم‌ها + ۳ دوز یا بیشتر: Td فقط اگر بیش از ۵ سال [^acip-2018].
# ممنوعیت
سابقه آلرژی شدید به واکسن کزاز.

@variant tetanus-table
name: Tetanus prophylaxis table
level: III
source: B
meta: Tetanus prophylaxis table [^acip-tetanus-2019]
refs: acip-tetanus-2019

@scenario
مردی ۳۵ ساله با زخم سوراخ‌شده کف پا از میخ زنگ‌زده. از سابقه واکسنش مطمئن نیست و آخرین دوزش ۸ سال پیش بوده است. آیا واکسن و ایمونوگلوبولین لازم است؟

@why
جدول کزاز: نوع زخم و سابقه واکسن مشخص می‌کنند چه چیزی لازم است.

@orders
- **If immunization is complete, no tetanus vaccine is needed** @B
- **Contraindication**: previous allergic reaction to a tetanus vaccine @B
- Orders: **Td 0.5 mL IM** and **Tetabulin (tetanus immunoglobulin) 250 IU IM** @B

@branch
if: **Clean, minor wound** AND history is **unknown or fewer than 3 doses**
- **Td (or Tdap)** 0.5 mL IM; complete the primary series [^acip-tetanus-2019]
- **No** tetanus immunoglobulin [^acip-tetanus-2019]

@branch
if: **Clean, minor wound** AND **3 or more doses**
- Td / Tdap only if **≥ 10 years** since the last dose [^acip-tetanus-2019]

@branch
if: **All other wounds** (contaminated with dirt, feces, soil or saliva; puncture; avulsion; missile; crush; burn; frostbite) AND history **unknown or fewer than 3 doses**
- **Td / Tdap** AND **tetanus immunoglobulin 250 U IM** at a different site [^acip-tetanus-2019]

@branch
if: **All other wounds** AND **3 or more doses**
- Td / Tdap only if **≥ 5 years** since the last dose; no immunoglobulin [^acip-tetanus-2019]
