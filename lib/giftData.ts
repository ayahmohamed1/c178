// ============================================================
// 🎁 GIFT DATA — EDIT HERE to add or change customer content
// ============================================================
// Each key is the URL slug: /gift/aya → id = "aya"
// ============================================================

export interface GiftData {
  name: string;           // Shown in the intro "Make a wish, [name]!"
  senderName?: string;    // Signature at the bottom of the letter (e.g., "Aya ✨")
  envelopeImage: string;  // Path inside /public — the envelope image
  birthdayImage: string;  // Path inside /public — the main birthday card image
  message: string;        // The birthday message (supports \n for line breaks)
  musicUrl?: string;      // Optional: URL to a background music mp3
  accentColor?: string;   // Optional: custom accent color (default: #38bdf8)
}

// ============================================================
// CUSTOMER DATA
// ============================================================
const giftData: Record<string, GiftData> = {

  // ----------------------------------------------------------
  // CUSTOMER: Aya
  // Link: yourdomain.com/gift/aya
  // ----------------------------------------------------------
  aya: {
    name: "Mimi",                                     // اسم مستلم الهدية
    senderName: "your love",                                   // التوقيع في آخر الرسالة (اختياري)
    envelopeImage: "/images/envelope-aya.png",           // صورة الظرف
    birthdayImage: "/images/birthday-aya.png",           // صورة الهدية النهائية
    accentColor: "#38bdf8",                              // اللون الأزرق الفاتح المتوافق مع التصميم الجديد
    musicUrl: "",                                        // رابط الموسيقى هنا
    message: ` 
   Happy birthday to my love💗💗.
I wish you more life more happiness and success 
You're the sweetest person in the world, I'm sorry for being difficult sometimes but I promise you I've ever loved anyone more than you💗
There's a version of me that exists only for you, a softness,a love, and a side of me that nobody, else gets to experience.

I've never looked at you in an ordinary way, l always look through the eyes of love 
The eyes of love meant you're eyes Mimi💗.

I can't wait for the day when I open my eyes and you're the first thing I see, no texts needed, just you by my side💗💗.

Don't forget that I'm praying for you to be my lifetime partner, to be with you until we're both successful. No matter how hard life gets, still want to do things with you baby🙏🏻.

I always choose a fucking  hard day with you over an easy day with anyone.
They always said choose a girl with a beautiful heart, not just a beautiful face, then I met you with both🫂💗.

Finally, everytime I look at you I realize I have everything I've ever wanted💗.
    `,
  },

};

export default giftData;