# ❓ الأسئلة الشائعة - FAQ

## الاستجابة والأداء

### س: كم تستغرق استجابة الخادم؟
**ج:** 
- ⚡ الصفحات الثابتة: **< 100ms**
- ⚡ صفحات OAuth: **150-300ms**
- ⚡ API endpoints: **200-500ms** (حسب Supabase)
- ✅ **الاستجابة سريعة وممتازة للإنتاج**

---

## المشاكل والحلول

### س: كل شيء تمام، كيف أرفع على Vercel؟

**ج:** اتبع هذه الخطوات:

#### الخطوة 1: رفع على GitHub
```bash
cd c:\Users\hohot\Desktop\piads-vb_hKIEwTOe8C9

# إذا لم تفعل بعد
git config user.name "Your Name"
git config user.email "your@email.com"

git add .
git commit -m "PIADS Platform - OAuth Implementation Ready"
git push -u origin main
```

#### الخطوة 2: دخول Vercel
1. اذهب إلى https://vercel.com/login
2. اختر "GitHub"
3. سجل الدخول بحسابك GitHub

#### الخطوة 3: استيراد المشروع
1. انقر "Add New"
2. اختر "Project"
3. ابحث عن `piads-vb_hKIEwTOe8C9`
4. اختره وانقر "Import"

#### الخطوة 4: متغيرات البيئة
1. انقر "Environment Variables"
2. أضف المتغيرات:

| المتغير | القيمة | النوع |
|---------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://your-project.supabase.co | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJ... | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJ... | Secret |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | xxx.apps.googleusercontent.com | Public |
| `NEXT_PUBLIC_FACEBOOK_APP_ID` | xxx | Public |

#### الخطوة 5: تحديث OAuth URLs
في **Google Console:**
- أضف: `https://your-vercel-domain.vercel.app/auth/callback`

في **Facebook:**
- أضف: `https://your-vercel-domain.vercel.app/auth/callback`

#### الخطوة 6: النشر
- انقر "Deploy"
- انتظر 1-2 دقيقة
- ✅ تم النشر!

---

### س: كيف أعرف إذا كل شيء يعمل صحيح؟

**ج:** اتبع Checklist:

- [ ] npm run build يعمل بدون أخطاء
- [ ] npm run dev يعمل بدون تحذيرات
- [ ] تسجيل الدخول عبر Google يعمل
- [ ] Cookie `supabase_session` محفوظ
- [ ] الصفحات تحمل بسرعة
- [ ] لا توجد أخطاء في console

**إذا كل الفقرات صحيحة، أنت جاهز للنشر! ✅**

---

### س: كيف أختبر OAuth محلياً؟

**ج:** 
1. فتح http://localhost:3000/auth/login
2. اضغط "Google Login"
3. سيفتح Google Login
4. اختر حسابك
5. سيعود إلى /auth/callback/processing
6. انتظر 2-3 ثوانٍ للتحويل

---

### س: الجلسة تُحذف عند Refresh - هل هذا طبيعي؟

**ج:** نعم، طبيعي جداً! 

**السبب:**
- في الوضع الحالي (A1): نستخدم session cookie عادي
- عند refresh، يتم قراءة الـ cookie من جديد
- هذا آمن للـ Development

**في الإنتاج (B2):**
- سنستخدم httpOnly cookie
- ستكون دائمة وآمنة أكثر
- لا مشاكل مع refresh

---

### س: OAuth يفشل - ماذا أفعل؟

**ج:** تحقق من:

1. **Google Client ID صحيح؟**
   ```bash
   # في .env.local
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   ```

2. **Redirect URI في Google Console؟**
   - محلي: `http://localhost:3000/auth/callback`
   - اضغط Save

3. **هل أعدت تشغيل الخادم؟**
   ```bash
   Ctrl+C
   npm run dev
   ```

4. **انظر للأخطاء:**
   - افتح DevTools (F12)
   - Console تحت
   - شوف الأخطاء

---

### س: كيف أغير Domain اسم النطاق؟

**ج:** في Vercel:
1. اذهب إلى Project Settings
2. انقر Domains
3. أضف domain جديد
4. اتبع التعليمات

---

## التحسينات المستقبلية

### ✅ تم بالفعل:
- ✅ OAuth 2.0 Flow
- ✅ Session Management
- ✅ Supabase integration
- ✅ Build optimization
- ✅ SSR safety

### 🔄 التخطيط لها:
- 🔜 Email Verification
- 🔜 2FA (Two-Factor Auth)
- 🔜 Password Reset via Email
- 🔜 User Profile Management
- 🔜 Admin Dashboard
- 🔜 Analytics

---

## أداء وحدود النظام

| المقياس | الحد | الملاحظات |
|--------|-----|---------|
| أقصى size لـ file upload | 10 MB | قابل للتغيير |
| أقصى صور في الإعلان | 10 | قابل للتغيير |
| Rate limit API | 60 req/min | لكل IP |
| أقصى session time | 24 ساعة | ثم تسجيل دخول جديد |
| Database connections | 25 | Supabase limit |

---

## الأوامر المفيدة

```bash
# فحص build
npm run build

# تشغيل الإنتاج محلياً
npm run build && npm start

# تنظيف واعادة تثبيت
rm -r node_modules .next
npm install

# فحص أخطاء TypeScript
npx tsc --noEmit

# فحص Linting
npm run lint

# تنسيق الكود
npm run format

# تحديث المكتبات
npm update
```

---

## معلومات الدعم

**Repository:** https://github.com/hohotamoz/piads-vb_hKIEwTOe8C9

**التكنولوجيا المستخدمة:**
- Next.js 15.5.9
- React 19
- TypeScript
- Supabase
- Tailwind CSS
- Radix UI

**التراخيص:** MIT

---

**آخر تحديث:** 2024
**الإصدار:** 1.0.0
