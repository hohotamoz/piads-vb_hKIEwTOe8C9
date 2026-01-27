-- تفحص وجود المستخدم في جدول المصادقة (auth.users)
select * from auth.users where email = 'user_email_here';

-- تفحص وجود المستخدم في جدول الملفات الشخصية (public.profiles)
select * from public.profiles where email = 'user_email_here';

-- اذا كان المستخدم موجود في profiles ولكن ليس في auth.users، فهذا يعني انه حساب "قديم" او محلي.
-- الكود يحاول ترحيله (migration) عند تسجيل الدخول، لكن كلمة المرور يجب ان تطابق الـ hash.

-- للتحقق من الـ hash المخزن:
select email, password_hash from public.profiles where email = 'user_email_here';
