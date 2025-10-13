import { env } from 'cloudflare:workers';
import { SendFileOptions } from 'express-serve-static-core';
import { Request, Response, NextFunction } from 'express';

/**
 * Polyfill for res.sendFile to use Cloudflare Workers Assets
 * 
 * This middleware intercepts res.sendFile calls and automatically
 * serves files from Cloudflare Workers Assets when available,
 * falling back to the original implementation if needed.
 */

/**
 * Middleware that polyfills res.sendFile to use Cloudflare Workers Assets
 */
export function sendFilePolyfill(req: Request, res: Response, next: NextFunction): void {
  const originalSendFile = res.sendFile?.bind(res);
  
  res.sendFile = function(path: string, ...args: unknown[]): void {
    let options: SendFileOptions | undefined;
    let callback: ((err: Error | null) => void) | undefined;
    
    // Handle overloads: sendFile(path, fn?) and sendFile(path, options, fn?)
    if (args.length === 0) {
      // sendFile(path)
    } else if (args.length === 1) {
      if (typeof args[0] === 'function') {
        callback = args[0] as (err: Error | null) => void;
      } else {
        options = args[0] as SendFileOptions;
      }
    } else if (args.length === 2) {
      options = args[0] as SendFileOptions;
      callback = args[1] as (err: Error | null) => void;
    }
    
    const opts: SendFileOptions = options || {};
    
    // Check if ASSETS is available
    if (env.ASSETS) {
      (async () => {
        try {
          // Normalize path - remove __dirname prefix if present
          let assetPath: string = path;
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
          
          // Create a new request for the asset
          const assetUrl = new URL(assetPath, req.protocol + '://' + req.get('host'));
          const assetRequest = new globalThis.Request(assetUrl.toString(), {
            method: 'GET',
            headers: req.headers as HeadersInit
          });
          
          const assetResponse = await env.ASSETS.fetch(assetRequest);
          
          if (assetResponse.ok) {
            // Set content type from asset response
            const contentType = assetResponse.headers.get('content-type');
            if (contentType) {
              res.setHeader('Content-Type', contentType);
            }
            
            // Stream the asset response
            const body = await assetResponse.arrayBuffer();
            res.send(Buffer.from(body));
            
            if (callback) callback(null);
            return;
          } else {
            console.warn(`⚠️ [sendFile polyfill] Asset not found: ${assetPath} (status: ${assetResponse.status})`);
          }
        } catch (error) {
          console.error(`❌ [sendFile polyfill] Error fetching asset:`, error);
        }
        
        // Fallback to original sendFile if available, or return 404
        if (originalSendFile) {
          return originalSendFile(path, opts, callback);
        } else {
          res.status(404).send('File not found');
          if (callback) callback(new Error('File not found'));
        }
      })();
      return;
    }
    
    // Fallback to original sendFile if available, or return 404
    if (originalSendFile) {
      return originalSendFile(path, opts, callback);
    } else {
      res.status(404).send('File not found');
      if (callback) callback(new Error('File not found'));
    }
  };
  
  next();
}
