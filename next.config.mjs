import { withPayload } from '@payloadcms/next/withPayload';
import { securityHeaders } from './src/lib/security.mjs';
export default withPayload({
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders() }];
  },
});
