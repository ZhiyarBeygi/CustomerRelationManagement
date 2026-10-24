# رابط کاربری سامانه پشتیبانی و تیکت‌ها

این پروژه رابط React + Vite برای API فعلی `SupportTicketSystem` است.

## اجرا

1. بک‌اند ASP.NET Core را اجرا کنید (پروفایل HTTP فعلی روی `http://localhost:5237` است).
2. وارد پوشه `Client` شوید.
3. در صورت نیاز مقدار `VITE_API_URL` را در `.env` بررسی کنید.
4. `npm install` و سپس `npm run dev` را اجرا کنید.

## قابلیت‌های رابط

- ورود و ثبت‌نام کاربر عادی.
- ثبت تیکت برای کاربر عادی، مدیر سیستم و کارشناس.
- نمایش تیکت‌های ثبت‌شده توسط کاربر.
- صف رسیدگی مدیر و کارشناس؛ شامل جست‌وجو، فیلتر وضعیت، فیلتر تیکت‌های تخصیص‌یافته به کارشناس و تیکت‌های بدون کارشناس، تغییر وضعیت و اولویت، تغییر دپارتمان و دسته‌بندی، و تخصیص کارشناس. امکان حذف تیکت از رابط وجود ندارد.
- پنل مدیر برای مشاهده کاربران، ایجاد کاربر و ویرایش نام کاربری، نقش و دپارتمان.
- افزودن دیدگاه و ثبت یادداشت داخلی از رابط کارکنان پشتیبانی؛ دیدگاه‌های ثبت‌شده پس از ایجاد فقط قابل مشاهده هستند و رابط امکان ویرایش یا حذف آن‌ها را ارائه نمی‌کند.
- متن‌های رابط کاربری به فارسی ترجمه شده‌اند.

## محدودیت‌های API فعلی

- با وجود جدول‌های مربوط به درخواست پذیرش/انتقال تیکت در طرح پایگاه داده، API فعلی endpointهایی برای claim/transfer ارائه نمی‌کند؛ رابط عملیاتی برای این دو قابلیت اضافه نشده است تا زمانی که مسیرهای بک‌اند در دسترس باشند.
- بک‌اند مسیرهای lookup برای دریافت نقش‌ها، دپارتمان‌ها و دسته‌بندی‌ها ندارد؛ به همین دلیل گزینه‌های دپارتمان و دسته‌بندی در `src/constants/ticketOptions.js` تعریف شده‌اند و شناسه‌های آن‌ها از گزینه‌هایی که قبلاً در رابط وجود داشتند حفظ شده‌اند. قبل از استقرار، این شناسه‌ها را با داده‌های واقعی SSMS بررسی کنید.
- نقش‌های موجود کاربران از API خوانده می‌شوند. برای ایجاد نخستین کاربر با نقش Expert، در نبود چنین کاربری باید شناسه نقش را در `VITE_ROLE_ID_EXPERT` در فایل `.env` تنظیم کنید، چون endpoint مستقلی برای فهرست نقش‌ها وجود ندارد.
- API فعلی کنترل دسترسی مبتنی بر JWT/نقش و جداسازی امن یادداشت‌های داخلی را در خود controllerها اعمال نمی‌کند. فیلترکردن مسیرها و یادداشت‌های داخلی در کلاینت فقط تجربه کاربری است و **جایگزین مجوزدهی و فیلتر امنیتی سمت سرور نیست**.
- ورود فعلی یک شیء کاربر برمی‌گرداند و JWT را به کلاینت تحویل نمی‌دهد؛ در نتیجه کلاینت با session ذخیره‌شده در localStorage کار می‌کند تا زمانی که جریان JWT در بک‌اند تکمیل شود.


## Role behavior

- کاربران عادی می‌توانند تیکت ثبت کنند، تیکت‌های خود را ببینند و دیدگاه اضافه کنند. رابط امکان حذف تیکت یا ویرایش/حذف دیدگاه را ارائه نمی‌کند.
- کارشناسان می‌توانند تیکت ثبت کنند و از صف کارشناسی در `/admin` استفاده کنند؛ این صف امکان فیلتر تیکت‌های تخصیص‌یافته به کارشناس و تیکت‌های بدون کارشناس و به‌روزرسانی جزئیات رسیدگی را دارد. پنل مدیریت کاربران فقط برای مدیر سیستم است.
- مدیران می‌توانند تیکت ثبت کنند، کاربران را مدیریت کنند و فیلدهای تیکت را تغییر دهند. دکمه حذف تیکت و دکمه‌های ویرایش/حذف دیدگاه در رابط وجود ندارند.

The current backend has no roles lookup endpoint. If no existing account carries the Expert role, set `VITE_ROLE_ID_EXPERT` in `.env` to the role ID from the database's `Roles` table. The app can then offer that role in the admin user form. Restart Vite after changing `.env`. The analogous `VITE_ROLE_ID_ADMIN` and `VITE_ROLE_ID_USER` variables are also supported. The numeric values shown in the commented `.env` examples are placeholders: replace them with your actual database IDs before uncommenting.

**Backend enforcement note:** the current API controllers still expose ticket deletion and comment update/deletion endpoints. Removing buttons from the frontend hides these actions from normal users but does not secure the endpoints against direct API calls. To enforce the rule for the whole application, remove those controller routes or add server-side authorization/business rules.

## Particle background

The animated background is implemented in `src/components/ParticlesBackground.jsx` and mounted once by `App.jsx`. It initializes tsParticles with `loadSlim`, uses the gray linked-particle styling from the supplied reference component, and is layered behind the application content. The particle layer has `pointer-events: none` so links, forms, and buttons remain clickable.


## Animated particle background

The app uses `src/components/ParticlesBackground.jsx` to render the gray linked-particle effect supplied as the reference. The component initializes `@tsparticles/slim` using `initParticlesEngine` before rendering the canvas. It is mounted once above the route tree in `src/App.jsx`.

After extracting this archive, run `npm install` in the `Client` directory to install the dependencies and generate a fresh `package-lock.json`, then run `npm run dev`. The old lockfile was intentionally not included because it predates the tsParticles dependencies.
