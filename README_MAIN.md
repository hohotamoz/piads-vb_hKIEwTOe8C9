# 🚀 PIADS Platform - منصة الإعلانات الديناميكية

<p align="center">
  <strong>منصة إعلانات حديثة مع نظام دفع Pi Network</strong><br/>
  <em>Built with Next.js 15, React 19, Supabase & TypeScript</em>
</p>

---

## 📖 التعليمات بالعربية 🇸🇦

### 🚀 **[دليل التشغيل والنشر الشامل](SETUP_AR.md)**
- كيفية تشغيل المشروع محلياً
- إعدادات OAuth (Google & Facebook)
- نشر على Vercel خطوة بخطوة
- حل المشاكل الشائعة

### ❓ **[الأسئلة الشائعة - FAQ](FAQ_AR.md)**
- أسئلة عن الاستجابة والأداء
- خطوات حل المشاكل
- الأوامر المهمة والنصائح

### 📋 **[ملخص المشروع النهائي](FINAL_SUMMARY_AR.md)**
- نتائج الفحص الشامل
- معايير الأداء
- Checklist النشر
- معلومات هامة

---

## ✨ الميزات الرئيسية

- ✅ **OAuth 2.0 Integration** - تسجيل دخول عبر Google و Facebook
- ✅ **Real-time Database** - Supabase for data management
- ✅ **Responsive Design** - عمل مثالي على جميع الأجهزة
- ✅ **Modern UI** - Radix UI + Tailwind CSS
- ✅ **TypeScript** - Type-safe development
- ✅ **Server-Side Rendering** - Next.js App Router

---

## 🛠️ التقنيات المستخدمة

| التقنية | الإصدار | الوظيفة |
|--------|--------|--------|
| **Next.js** | 15.5.9 | Web Framework |
| **React** | 19 | UI Library |
| **TypeScript** | Latest | Type Safety |
| **Supabase** | 2.91.1 | Backend & Auth |
| **Tailwind CSS** | Latest | Styling |
| **Radix UI** | Latest | Components |

---

## ⚡ البدء السريع

### المتطلبات:
- Node.js 18+
- npm أو yarn
- Git

### الخطوات:

```bash
# 1. استنساخ المشروع
git clone https://github.com/hohotamoz/piads-vb_hKIEwTOe8C9.git
cd piads-vb_hKIEwTOe8C9

# 2. تثبيت المكتبات
npm install

# 3. إعداد البيئة
# انسخ .env.example إلى .env.local وأضف مفاتيحك

# 4. تشغيل الخادم
npm run dev

# 5. افتح المتصفح
# http://localhost:3000
```

---

## 📁 هيكل المشروع

```
piads-vb_hKIEwTOe8C9/
├── app/                      # Next.js App Router
│   ├── auth/                 # Authentication pages
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   └── callback/         # OAuth callback handler
│   ├── api/                  # API routes
│   └── ...                   # Other pages
├── lib/                      # Utility functions
│   ├── supabase.ts           # Supabase client
│   ├── auth.ts               # Auth utilities
│   └── ...
├── components/               # React components
├── .env.local                # Environment variables (create this!)
└── package.json              # Dependencies
```

---

## 🔐 الأمان

- ✅ OAuth 2.0 Secure Flow
- ✅ Server-side token exchange
- ✅ Secure session management
- ✅ SSR safety (no window object on server)
- ✅ Environment variables protection

---

## 📊 حالة المشروع

| المقياس | الحالة |
|--------|--------|
| **Build** | ✅ Pass |
| **TypeScript** | ✅ No Errors |
| **Linting** | ✅ Clean |
| **OAuth Flow** | ✅ Working |
| **Performance** | ✅ Excellent |
| **Documentation** | ✅ Complete |

---

## 🚀 النشر على Vercel

### خطوات النشر:
1. رفع المشروع على GitHub
2. دخول Vercel وربط المستودع
3. إضافة متغيرات البيئة
4. النشر تلقائياً

**للتفاصيل الكاملة:** اقرأ [SETUP_AR.md](SETUP_AR.md)

---

## 📝 الأوامر المهمة

```bash
# التطوير
npm run dev              # تشغيل الخادم المحلي

# الإنتاج
npm run build            # بناء للإنتاج
npm start                # تشغيل الإنتاج محلياً

# الفحص
npm run lint             # فحص الأخطاء
npx tsc --noEmit        # فحص TypeScript

# التنظيف
rm -r node_modules .next
npm install              # إعادة تثبيت جميع المكتبات
```

---

## 🐛 حل المشاكل

### OAuth يفشل؟
1. تأكد من Client ID صحيح في .env.local
2. تحقق من Redirect URI في Google/Facebook Console
3. أعد تشغيل الخادم: `Ctrl+C` ثم `npm run dev`

### الجلسة تُحذف عند Refresh؟
هذا طبيعي في وضع التطوير. سيتم حلها في الإنتاج باستخدام httpOnly cookies.

### Server لا يبدأ؟
```bash
# امسح التخزين المؤقت وأعد التثبيت
rm -r node_modules .next
npm install
npm run dev
```

**للمزيد:** اقرأ [FAQ_AR.md](FAQ_AR.md)

---

## 📞 الدعم

- **GitHub Issues:** [اعرض المشاكل](https://github.com/hohotamoz/piads-vb_hKIEwTOe8C9/issues)
- **Documentation:** اقرأ ملفات `*.md` في المشروع
- **العربية:** اقرأ ملفات `*_AR.md`

---

## 📜 الترخيص

MIT License - انظر ملف LICENSE للتفاصيل

---

## 👨‍💻 المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/amazing`)
3. Commit التغييرات (`git commit -m 'Add feature'`)
4. Push للـ branch (`git push origin feature/amazing`)
5. افتح Pull Request

---

## 🎯 خريطة الطريق

### ✅ مكتمل:
- OAuth 2.0 Implementation
- Session Management
- Basic Authentication

### 🔄 قيد التطوير:
- Email Verification
- 2FA Support
- Admin Dashboard

### 📅 مخطط له:
- User Profiles
- Analytics Dashboard
- Advanced Notifications

---

## 📝 ملاحظات هامة

> **هام:** قبل البدء، اقرأ [SETUP_AR.md](SETUP_AR.md) للحصول على جميع التفاصيل اللازمة.

> **للعربية:** جميع التعليمات المفصلة متوفرة بالعربية في:
> - [SETUP_AR.md](SETUP_AR.md) - دليل التشغيل الشامل
> - [FAQ_AR.md](FAQ_AR.md) - الأسئلة الشائعة
> - [FINAL_SUMMARY_AR.md](FINAL_SUMMARY_AR.md) - الملخص النهائي

---

**Last Updated:** 2024  
**Version:** 1.0.0  
**Status:** ✅ Ready for Production

---

<p align="center">
  <strong>🎉 جاهز للنشر على Vercel!</strong><br/>
  اتبع خطوات <a href="SETUP_AR.md">SETUP_AR.md</a> للبدء
</p>
