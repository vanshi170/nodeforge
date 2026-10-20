/**
 * NodeForge - Runtime Controller
 * Inspects and returns genuine details from the global 'process' object
 * without leaking sensitive environment secrets.
 */

function getRuntimeInfo(req, res) {
  const mem = process.memoryUsage();

  const toMB = bytes => Number((bytes / 1024 / 1024).toFixed(2));

  const runtimeData = {
    runtime: 'Node.js',
    version: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    environment: process.env.NODE_ENV || 'development',
    configuredPort: process.env.PORT || 3000,
    cwd: process.cwd(),
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: {
      rss: toMB(mem.rss),
      heapTotal: toMB(mem.heapTotal),
      heapUsed: toMB(mem.heapUsed),
      external: toMB(mem.external)
    },
    engineVersions: {
      v8: process.versions.v8,
      uv: process.versions.uv,
      zlib: process.versions.zlib,
      openssl: process.versions.openssl,
      modules: process.versions.modules
    },
    systemFeatures: {
      commonJsSupported: true,
      asyncAwaitSupported: true,
      workerThreadsSupported: true,
      cryptoSupported: true
    },
    timestamp: new Date().toISOString()
  };

  res.json({
    success: true,
    data: runtimeData
  });
}

module.exports = {
  getRuntimeInfo
};
