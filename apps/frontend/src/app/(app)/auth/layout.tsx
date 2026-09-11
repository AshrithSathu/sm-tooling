import { ReactNode } from 'react';
import { LogoTextComponent } from '@gitroom/frontend/components/ui/logo-text.component';
import ReturnUrlComponent from './return.url.component';
export const dynamic = 'force-dynamic';
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen w-full bg-[#0E0E0E] text-white flex items-center justify-center p-6">
    <ReturnUrlComponent />
    <div className="w-full max-w-[440px] rounded-xl bg-[#1A1919] p-8 flex flex-col gap-8">
      <LogoTextComponent />
      {children}
      <a className="text-xs text-gray-400 underline" href="/source.tar.gz">Source code &amp; license</a>
    </div>
  </div>;
}
