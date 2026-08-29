import https from 'https';

const apiKey = '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';

const allCandidates = [
  'meta/llama-3.2-90b-vision-instruct',
  'meta/llama-3.2-11b-vision-instruct',
  'deepseek-ai/deepseek-v4-flash-0731',
  'deepseek-ai/deepseek-v4-pro-0813',
  'meta/llama2-70b',
  'nvidia/llama3-chatqa-1.5-70b',
  'mistralai/mixtral-8x22b-v0.1',
  'mistralai/mistral-7b-instruct-v0.3'
];

async function testModel(model) {
  return new Promise(resolve => {
    const payload = JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: 'Di hola' }],
      max_tokens: 15
    });

    const req = https.request('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        resolve({ model, status: res.statusCode });
      });
    });
    req.on('error', e => resolve({ model, status: 'ERROR' }));
    req.write(payload);
    req.end();
  });
}

for (const m of allCandidates) {
  const res = await testModel(m);
  if (res.status === 200) {
    console.log('ACTIVE 200 OK:', m);
  }
}
