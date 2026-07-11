import { ClerkProvider } from '@clerk/nextjs';
import LayoutWrapper from '@/components/LayoutWrapper';
import './globals.css';

export const metadata = {
  title: 'DentalFlow - Appointment Reminder & No-Show Reduction',
  description: 'Smart appointment reminders and no-show risk prediction for dental clinics',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" data-scroll-behavior="smooth">
        <body style={{ backgroundColor: '#FAF9F6' }}>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}

