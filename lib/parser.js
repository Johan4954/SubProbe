import esprima from 'esprima';
import chalk from 'chalk';

let consecutiveTimeouts = 0;
let totalTimeouts = 0;

export function parseJS(code) {
  if (!code || typeof code !== 'string') {
    return null;
  }

  const maxSize = 1024 * 1024; // 1MB
  if (code.length > maxSize) {
    code = code.substring(0, maxSize);
  }

  try {
    code = code.replace(/\/\/# sourceMappingURL=.*$/gm, '');
    
    const parsePromise = new Promise((resolve) => {
      try {
        const result = esprima.parseScript(code, { tolerant: true, range: true });
        consecutiveTimeouts = 0;
        resolve(result);
      } catch (e) {
        try {
          const result = esprima.parseModule(code, { tolerant: true, range: true });
          consecutiveTimeouts = 0;
          resolve(result);
        } catch (e2) {
          const syntheticAst = {
            type: 'Program',
            body: [],
            tokens: [],
            comments: []
          };
          
          resolve(syntheticAst);
        }
      }
    });

    const timeoutPromise = new Promise(resolve => {
      setTimeout(() => {
        consecutiveTimeouts++;
        totalTimeouts++;
        
        const syntheticAst = {
          type: 'Program',
          body: [],
          tokens: [],
          comments: []
        };
        resolve(syntheticAst);
      }, 10000);
    });

    return Promise.race([parsePromise, timeoutPromise]);
  } catch (e) {
    const syntheticAst = {
      type: 'Program',
      body: [],
      tokens: [],
      comments: []
    };
    return Promise.resolve(syntheticAst);
  }
}
