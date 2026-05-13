import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient().$extends({
  query: {
    notification: {
      async create({ args, query }) {
        const result = await query(args);
        
        // Fire-and-forget: check user settings and send email if opted-in
        if (result && result.userId) {
          (async () => {
            try {
              const user = await prisma.user.findUnique({
                where: { id: result.userId },
                select: { email: true, name: true, settings: true }
              });
              if (!user || !user.email) return;

              // Parse settings
              const defaultSettings = { 
                theme: 'system', 
                notifications: { email: true, push: true, weekly: true, achievements: true } 
              };
              let st = defaultSettings;
              if (user.settings) {
                try { st = JSON.parse(user.settings); } catch(e) {}
              }

              // Route the notification type to the corresponding user setting
              let shouldSend = false;
              const titleLower = result.title.toLowerCase();
              
              if (titleLower.includes('achievement') || result.title.includes('🏆') || result.title.includes('✨') || result.title.includes('💯') || result.title.includes('📝')) {
                // Milestone Alerts
                if (st.notifications && st.notifications.achievements !== false) shouldSend = true;
              } else if (titleLower.includes('weekly') || titleLower.includes('progress') || titleLower.includes('report')) {
                // Progress Reports
                if (st.notifications && st.notifications.weekly !== false) shouldSend = true;
              } else {
                // System Updates / Email Alerts (catch-all)
                if (st.notifications && (st.notifications.email !== false || st.notifications.push !== false)) shouldSend = true;
              }

              if (shouldSend) {
                const { sendNotificationEmail } = await import('@/lib/mailer');
                await sendNotificationEmail(user.email, result.title, result.message, user.name || 'Student');
              }
            } catch (err) {
              console.error('Failed to send auto-notification email:', err);
            }
          })();
        }

        return result;
      }
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
