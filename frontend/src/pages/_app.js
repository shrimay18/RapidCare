import { NotificationProvider } from '@/contexts/NotificationContext';
// import '@/styles/globals.css'; // Your global CSS file

export default function App({ Component, pageProps }) {
  return (
    <NotificationProvider>
      <Component {...pageProps} />
    </NotificationProvider>
  );
}