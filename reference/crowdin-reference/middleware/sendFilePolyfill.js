/**
 * Polyfill for res.sendFile to use Cloudflare Workers Assets
 * 
 * This middleware intercepts res.sendFile calls and automatically
 * serves files from Cloudflare Workers Assets when available,
 * falling back to the original implementation if needed.
 */

let globalEnv = null;

/**
 * Set the environment for the polyfill to access ASSETS
 * @param {Object} env - Cloudflare Workers environment bindings
 */
export function setEnvironment(env) {
  globalEnv = env;
}

/**
 * Middleware that polyfills res.sendFile to use Cloudflare Workers Assets
 */
export function sendFilePolyfill(req, res, next) {
  const originalSendFile = res.sendFile?.bind(res);
  
  res.sendFile = async function(path, options, callback) {
    // Handle optional options parameter
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    options = options || {};
    
    // Check if ASSETS is available
    if (globalEnv?.ASSETS) {
      try {
        // Normalize path - remove __dirname prefix if present
        let assetPath = path;
        if (assetPath.startsWith(globalThis.__dirname)) {
          assetPath = assetPath.substring(globalThis.__dirname.length);
        }
        // Remove /public prefix if present
        if (assetPath.startsWith('/public')) {
          assetPath = assetPath.substring(7);
        }
        // Ensure leading slash
        if (!assetPath.startsWith('/')) {
          assetPath = '/' + assetPath;
        }
        
        console.log(`[sendFile polyfill] Attempting to serve: ${assetPath}`);
        
        // Create a new request for the asset
        const assetUrl = new URL(assetPath, req.protocol + '://' + req.get('host'));
        const assetRequest = new Request(assetUrl.toString(), {
          method: 'GET',
          headers: req.headers
        });
        
        const assetResponse = await globalEnv.ASSETS.fetch(assetRequest);
        
        if (assetResponse.ok) {
          console.log(`✅ [sendFile polyfill] Successfully served ${assetPath} from Assets`);
          
          // Set content type from asset response
          const contentType = assetResponse.headers.get('content-type');
          if (contentType) {
            res.setHeader('Content-Type', contentType);
          }
          
          // Stream the asset response
          const body = await assetResponse.arrayBuffer();
          res.send(Buffer.from(body));
          
          if (callback) callback();
          return;
        } else {
          console.log(`⚠️ [sendFile polyfill] Asset not found: ${assetPath} (status: ${assetResponse.status})`);
        }
      } catch (error) {
        console.error(`❌ [sendFile polyfill] Error fetching asset:`, error);
      }
    }
    
    // Fallback to original sendFile if available, or return 404
    if (originalSendFile) {
      console.log(`[sendFile polyfill] Falling back to original sendFile`);
      return originalSendFile(path, options, callback);
    } else {
      console.log(`[sendFile polyfill] No original sendFile available, returning 404`);
      res.status(404).send('File not found');
      if (callback) callback(new Error('File not found'));
    }
  };
  
  next();
}

