const { chromium } = require('playwright');
const accounts = require('./accounts.json');

(async () => {
  const targetUrl = 'https://www.instagram.com/ioioe.i?igsh=MTljeDdqeTFvcjdxdQ==';
  
  for (const acc of accounts) {
    console.log(`--- جاري محاولة تسجيل الدخول بالحساب: ${acc.user} ---`);
    
    const browser = await chromium.launch({ headless: true });
    // إضافة "هوية" حقيقية للمتصفح لتجنب الحظر
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      viewport: { width: 375, height: 812 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    });
    
    const page = await context.newPage();

    try {
      // 1. فتح الحساب المستهدف
      await page.goto(targetUrl, { waitUntil: 'networkidle' });
      console.log(`تم الوصول لصفحة الحساب: ${acc.user}`);

      // 2. تأخير عشوائي لمحاكاة سلوك البشر (بين 2 إلى 5 ثواني)
      const waitTime = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
      await page.waitForTimeout(waitTime);

      // 3. البحث عن زر المتابعة والضغط عليه
      // ملاحظة: نستخدم نص الزر أو الـ Selector الخاص به
      const followButton = page.locator('button:has-text("Follow"), button:has-text("متابعة")').first();
      
      if (await followButton.isVisible()) {
          await followButton.click();
          console.log(`✅ تم الضغط على زر المتابعة بنجاح للحساب: ${acc.user}`);
          // حفظ لقطة شاشة للتأكد
          await page.screenshot({ path: `success_${acc.user}.png` });
      } else {
          console.log(`⚠️ لم يتم العثور على زر المتابعة (ربما الحساب متابع بالفعل أو الصفحة لم تفتح بالكامل)`);
      }

    } catch (err) {
      console.error(`❌ خطأ فني مع الحساب ${acc.user}: ${err.message}`);
    } finally {
      await browser.close();
      // تأخير بسيط قبل الانتقال للحساب التالي لكي لا يتم حظر الـ IP الخاص بالسيرفر
      await new Promise(r => setTimeout(r, 3000));
    }
  }
})();

