import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { compare } from 'bcryptjs';
import prisma from './prisma';
import { send2FAEmail } from './mailer';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // Internal provider used ONLY after Account Verification OTP is verified (or skipped)
    CredentialsProvider({
      id: 'verify-account',
      name: 'Account Verified',
      credentials: {
        userId: { label: 'User ID', type: 'text' },
        bypassToken: { label: 'Bypass Token', type: 'text' },
      },
      async authorize(credentials) {
        const { userId, bypassToken } = credentials;
        if (!userId || !bypassToken || !bypassToken.startsWith('vtk_')) {
          throw new Error('Invalid verification credentials');
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');
        
        // Validate the bypass token (check BOTH fields for vtk_ style skip tokens)
        const isMatch = (user.twoFactorCode === bypassToken || user.twoFactorSecret === bypassToken);
        if (!isMatch || !user.twoFactorExpires || new Date() > user.twoFactorExpires) {
          throw new Error('Verification bypass token is invalid or expired');
        }
        
        // Consume the token immediately
        const userUpdateData = {
          twoFactorCode: null,
          twoFactorSecret: null,
          twoFactorExpires: null,
        };

        // If they skipped (didn't verify during the process) we mark it so we don't ask again on login
        if (!user.isVerified) {
          userUpdateData.hasSkippedVerification = true;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: userUpdateData,
        });
        
        return { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          isVerified: user.isVerified || (userUpdateData.isVerified || false) 
        };
      }
    }),
    // Internal provider used ONLY after Google 2FA OTP is verified
    CredentialsProvider({
      id: 'google-2fa',
      name: 'Google 2FA Verified',
      credentials: {
        userId: { label: 'User ID', type: 'text' },
        bypassToken: { label: 'Bypass Token', type: 'text' },
      },
      async authorize(credentials) {
        const { userId, bypassToken } = credentials;
        if (!userId || !bypassToken || !bypassToken.startsWith('btk_')) {
          throw new Error('Invalid internal credentials');
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');
        // Validate the bypass token
        if (user.twoFactorCode !== bypassToken || !user.twoFactorExpires || new Date() > user.twoFactorExpires) {
          throw new Error('Bypass token is invalid or expired');
        }
        // Consume the token immediately
        await prisma.user.update({
          where: { id: user.id },
          data: { twoFactorCode: null, twoFactorExpires: null },
        });
        return { id: user.id, email: user.email, name: user.name };
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'OTP', type: 'text', optional: true },
      },
      async authorize(credentials) {
        console.log("Authorize attempt for:", credentials.email, "OTP:", credentials.otp);
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('No account found with this email');
        }

        if (!user.password) {
          throw new Error('Please sign in with Google');
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        console.log(`User ${user.email} 2FA Status:`, user.twoFactorEnabled, "Received OTP:", credentials.otp);

        if (user.twoFactorEnabled) {
          // Robust check: undefined value, empty string, or the string 'undefined'
          const otpProvided = (credentials.otp && credentials.otp.trim() !== '' && credentials.otp !== 'undefined');

          if (!otpProvided) {
            console.log("DEBUG: HIT OTP_NOT_PROVIDED branch for:", user.email);
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            await prisma.user.update({
              where: { id: user.id },
              data: { twoFactorCode: otpCode, twoFactorExpires: new Date(Date.now() + 10 * 60 * 1000) }
            });
            await send2FAEmail(user.email, otpCode);
            console.log("DEBUG: OTP sent to:", user.email);
            throw new Error('2FA_REQUIRED');
          } else {
            console.log("DEBUG: Checking OTP provided:", credentials.otp, "against DB code:", user.twoFactorCode);
            if (user.twoFactorCode !== credentials.otp || new Date() > user.twoFactorExpires) {
              console.log("DEBUG: OTP VALIDATION FAILED for:", user.email);
              throw new Error('Invalid or expired OTP');
            }
            console.log("DEBUG: OTP VALIDATION SUCCESS for:", user.email);
            // Clear code after successful use
            await prisma.user.update({
              where: { id: user.id },
              data: { twoFactorCode: null, twoFactorExpires: null }
            });
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email) return true;

      const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
      if (!dbUser) return true;

      // 1. Handle Account Verification (ONLY on first login/unverified state)
      // Only trigger if they haven't verified AND haven't explicitly chosen to skip it
      if (!dbUser.isVerified && !dbUser.hasSkippedVerification) {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const bypassToken = `vtk_${Math.random().toString(36).substring(2, 15)}`;
        
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            twoFactorCode: otpCode,
            twoFactorSecret: bypassToken,
            twoFactorExpires: new Date(Date.now() + 10 * 60 * 1000),
          },
        });

        const { sendVerificationEmail } = await import('./mailer');
        await sendVerificationEmail(dbUser.email, otpCode);
        
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        return `${baseUrl}/verify-account?email=${encodeURIComponent(dbUser.email)}&userId=${dbUser.id}&token=${bypassToken}`;
      }

      // 2. Handle 2FA (Every login if enabled)
      // If the provider is Google, we need to manually trigger 2FA here.
      // If it's 'credentials', 2FA is already handled in 'authorize' internally.
      if (account?.provider === 'google' && dbUser.twoFactorEnabled) {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            twoFactorCode: otpCode,
            twoFactorExpires: new Date(Date.now() + 10 * 60 * 1000),
          },
        });
        await send2FAEmail(dbUser.email, otpCode);
        
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        return `${baseUrl}/auth/2fa?email=${encodeURIComponent(dbUser.email)}`;
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.isVerified = user.isVerified;
      }
      
      // Update token if session is updated (useful for reflects verification status immediately)
      if (trigger === "update" && session?.isVerified !== undefined) {
        token.isVerified = session.isVerified;
      }
      
      // Refetch from DB if needed? For now just return token
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.isVerified = token.isVerified;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  events: {
    async createUser({ user }) {
      // Triggered only for OAuth sign-ups (first time Google login)
      try {
        const { sendWelcomeEmail } = await import('./mailer');
        await sendWelcomeEmail(user.email, user.name || 'Scholar');
      } catch (err) {
        console.error('Welcome email failed:', err);
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
