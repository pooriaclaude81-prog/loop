@topic hypoglycemia
cluster: collapse
name: Hypoglycemia
name_fa: افت قند خون
source: A
keywords: dextrose low blood sugar diabetic
refs: ada-soc-2026

@guide
# ایده کلی
مغز فقط با گلوکز کار می‌کند؛ قند زیر ۷۰ علامت می‌دهد و زیر ۵۴ خطرناک است. در بیمار دیابتی که انسولین یا سولفونیل‌اوره مصرف می‌کند شایع است [^ada-soc-2026].
# درمان
- **هوشیار و می‌تواند بخورد:** ۱۵ تا ۲۰ گرم قند خوراکی و کنترل بعد از ۱۵ دقیقه.
- **کاهش هوشیاری:** دکستروز ۵۰٪ وریدی (حدود ۲۵ گرم) و سپس انفوزیون دکستروز ۱۰٪.
- قند را مرتب چک کنید؛ سولفونیل‌اوره‌ها ممکن است چند ساعت بعد دوباره افت قند بدهند.
- اگر دو نوبت قند بالای ۲۰۰ شد، انفوزیون دکستروز را قطع کنید.
# علت را پیدا کنید
دوز اشتباه دارو، غذا نخوردن، نارسایی کلیه یا کبد، عفونت.

@variant hypoglycemia-bs
name: Diabetic patient, low BS
level: II
source: A
meta: Source A case: hypoglycemia
refs: ada-soc-2026

@scenario
خانمی ۷۸ ساله و دیابتی که انسولین مصرف می‌کند با ضعف و کاهش هوشیاری آورده شده است. عرق کرده و گیج است و قند خون 55 است.

@why
افت قند در بیمار دیابتی است؛ دکستروز وریدی سریع و کنترل مکرر قند.

@orders
- IV line fix
- Vial **Dextrose 50%** IV stat: 50 mL (25 g) [^ada-soc-2026]
- Serum **D/W 10%** infusion IV stat, titrated to the glucose [^ada-soc-2026]
- Check BS **every 2 hours**. Check again 15 min after the bolus.
- **If 2 consecutive BS readings are above 200 mg/dL, hold the dextrose infusion.**
- Continue the patient's usual medications, except the one that caused the episode (hold the insulin or sulfonylurea)

@branch
if: Patient is awake and can swallow
- Oral glucose 15–20 g (juice or glucose tablets), recheck in 15 min [^ada-soc-2026]
