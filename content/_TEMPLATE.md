// Template for a new topic. Copy this file, rename it (any name, for example my-topic.md) and fill it in.
// Files whose name starts with _ are ignored by the site.
// Lines that start with // are comments.
@topic my-topic-id
cluster: cardiac
name: English name of the condition
name_fa: نام فارسی بیماری
source: B
keywords: words people may search for
refs: aha-cpr-2025

@guide
// Plain, conversational Farsi. A blank line starts a new paragraph. "- " makes a bullet.
اینجا به زبان ساده توضیح بدهید این بیماری چیست و منطق دستورها چیست.

@variant my-variant-id
name: Short variant name
level: II
source: B
meta: Imp: … · C: II · Diet: NPO · Activity: CBR
refs: aha-cpr-2025

@scenario
یک سناریوی کوتاه و واقعی به فارسی ساده که با همین نسخه از دستورها جور باشد.

@why
در یکی دو جمله بگویید چرا این نسخه از دستورها با نسخه‌های دیگر فرق دارد.

@orders
- CVS / NPO / CBR
- Amp **Drug 10 mg** IV stat [^aha-cpr-2025]
-- A sub-heading
- An order that comes from one source only @A

@branch
if: the patient is unstable
- order for this case
else: otherwise
- another order
go: another-variant-id

@notes
- یادداشت فارسی منبع (اختیاری)
