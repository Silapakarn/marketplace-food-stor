'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <AntdRegistry>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#3cb65f',
              borderRadius: 12,
              fontFamily: 'inherit',
            },
          }}
        >
          {children}
        </ConfigProvider>
      </QueryClientProvider>
    </AntdRegistry>
  );
}
