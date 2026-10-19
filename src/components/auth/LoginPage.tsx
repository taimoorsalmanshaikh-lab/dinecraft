import React, { useState } from 'react';
import { AuthBrandPanel } from './AuthBrandPanel';
import { LoginForm } from './LoginForm';

interface LoginPageProps {
  initialMode?: 'login' | 'signup';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode = 'login' }) => {
  const [currentMode, setCurrentMode] = useState<'login' | 'signup'>(initialMode);

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] flex flex-col font-sans antialiased text-[#17212B] overflow-x-hidden">
      {/* ======================================================== */}
      {/* DESKTOP & LARGE TABLET SPLIT-SCREEN LAYOUT (lg:flex)     */}
      {/* ======================================================== */}
      <div className="hidden lg:flex w-full h-screen max-h-screen overflow-hidden">
        {/* LEFT PANEL (~45% width): Restaurant food photography & branding */}
        <div className="w-[45%] xl:w-[46%] h-full shrink-0 relative">
          <AuthBrandPanel />
        </div>

        {/* RIGHT PANEL (~55% width): Centered login form with balanced whitespace */}
        <div className="flex-1 h-full bg-[#FFFFFF] flex items-center justify-center p-8 xl:p-12 overflow-y-auto">
          <div className="w-full max-w-[420px] my-auto">
            <LoginForm
              initialMode={currentMode}
              onModeChange={(m) => setCurrentMode(m)}
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE & COMPACT TABLET LAYOUT (< lg)                    */}
      {/* Clean, distraction-free centered login experience        */}
      {/* ======================================================== */}
      <div className="flex lg:hidden flex-col min-h-screen bg-[#FFFFFF] px-4 py-8 sm:px-6 sm:py-12 justify-center items-center">
        <div className="w-full max-w-[420px] my-auto">
          <LoginForm
            initialMode={currentMode}
            onModeChange={(m) => setCurrentMode(m)}
          />
        </div>
      </div>
    </div>
  );
};
