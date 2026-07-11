import dotenv from 'dotenv';
import { askVirtualDentist } from '../lib/gemini.js';

dotenv.config({ path: '.env.local' });

const result = await askVirtualDentist('What is the best way to floss correctly?');
console.log('Mode:', result.mode);
console.log('Model:', result.model || 'n/a');
console.log('Answer preview:', result.answer?.slice(0, 200));
