import { createClient } from '@supabase/supabase-js';

const url = 'https://tgoltttutmbskjtcxtai.supabase.co';
const key = 'sb_publishable_peVv1e-UGm_QIFpxs9eGVQ_RlfwRRV5';

async function testAuth() {
  const supabase = createClient(url, key);

  console.log('Testing woman sign in...');
  const { data: wData, error: wErr } = await supabase.auth.signInWithPassword({
    email: 'demo.woman@hercycle.app',
    password: 'Demo@12345',
  });
  console.log('Woman sign in:', { id: wData?.user?.id, role: wData?.user?.role, error: wErr });

  console.log('Testing partner sign in...');
  const { data: pData, error: pErr } = await supabase.auth.signInWithPassword({
    email: 'demo.partner@hercycle.app',
    password: 'Demo@12345',
  });
  console.log('Partner sign in:', { id: pData?.user?.id, role: pData?.user?.role, error: pErr });

  // Now test generate partner code as woman!
  if (wData?.session) {
    const womanClient = createClient(url, key, {
      global: { headers: { Authorization: `Bearer ${wData.session.access_token}` } }
    });
    console.log('Generating partner code as woman...');
    const { data: code, error: cErr } = await womanClient.rpc('generate_partner_code');
    console.log('Generated code:', { code, cErr });

    // Now test redeeming as partner!
    if (code && pData?.session) {
      const partnerClient = createClient(url, key, {
        global: { headers: { Authorization: `Bearer ${pData.session.access_token}` } }
      });
      console.log('Redeeming code as partner:', code);
      const redeemRes = await partnerClient.rpc('redeem_partner_code', { code_input: code });
      console.log('Redeem result:', redeemRes);

      // Now approve as woman!
      if (redeemRes.data?.link_id) {
        console.log('Approving link as woman...');
        const appRes = await womanClient.rpc('approve_partner_connection', { p_link_id: redeemRes.data.link_id });
        console.log('Approve result:', appRes);

        // Check partner view!
        const { data: pView, error: pvErr } = await partnerClient.from('partner_view').select('*');
        console.log('Partner view data:', { pView, pvErr });
      }
    }
  }
}

testAuth().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
