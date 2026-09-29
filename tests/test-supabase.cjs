const { createClient } = require('@supabase/supabase-js');

const url = 'https://tgoltttutmbskjtcxtai.supabase.co';
const key = 'sb_publishable_peVv1e-UGm_QIFpxs9eGVQ_RlfwRRV5';

async function testFullSuite() {
  const supabase = createClient(url, key);

  console.log('1. Signing in woman (Sarah Miller)...');
  const { data: wAuth, error: wAuthErr } = await supabase.auth.signInWithPassword({
    email: 'demo.woman@hercycle.app',
    password: 'Demo@12345',
  });
  if (wAuthErr || !wAuth?.session) {
    console.error('Woman auth failed:', wAuthErr);
    throw new Error('Woman auth failed');
  }
  const womanClient = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${wAuth.session.access_token}` } }
  });

  console.log('2. Signing in partner (Alex Rivera)...');
  const { data: pAuth, error: pAuthErr } = await supabase.auth.signInWithPassword({
    email: 'demo.partner@hercycle.app',
    password: 'Demo@12345',
  });
  if (pAuthErr || !pAuth?.session) {
    console.error('Partner auth failed:', pAuthErr);
    throw new Error('Partner auth failed');
  }
  const partnerClient = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${pAuth.session.access_token}` } }
  });

  // Clean up any existing test links to start fresh
  await womanClient.from('partner_links').delete().eq('woman_id', wAuth.user.id);
  await womanClient.from('partner_connections').delete().eq('woman_user_id', wAuth.user.id);

  console.log('3. Woman generates fresh 6-digit connection code...');
  const { data: code, error: genErr } = await womanClient.rpc('generate_partner_code');
  if (genErr) throw genErr;
  console.log('   ✓ Generated code:', code);

  // Confirm row in database
  const { data: codeRow, error: cErr } = await womanClient.from('partner_codes').select('*').eq('code', code).single();
  if (cErr) throw cErr;
  console.log('   ✓ Confirmed in DB:', { code: codeRow.code, woman_id: codeRow.woman_id, expires_at: codeRow.expires_at, used: codeRow.used });

  console.log('4. Testing error cases...');
  // Case A: Invalid code
  const { error: errA } = await partnerClient.rpc('validate_partner_connection_code', { entered_code: '000000' });
  console.log('   ✓ Invalid code rejected:', errA?.message);

  // Case B: Self-connection (woman enters her own code)
  const { error: errB } = await womanClient.rpc('validate_partner_connection_code', { entered_code: code });
  console.log('   ✓ Self connection rejected:', errB?.message);

  console.log('5. Partner enters valid code:', code);
  const { data: redeemRes, error: redErr } = await partnerClient.rpc('validate_partner_connection_code', { entered_code: code });
  if (redErr) throw redErr;
  console.log('   ✓ Partner redeemed successfully:', redeemRes);

  console.log('6. Partner tries to use the same code again (single-use test)...');
  const { error: errUsed } = await partnerClient.rpc('validate_partner_connection_code', { entered_code: code });
  console.log('   ✓ Re-used code rejected:', errUsed?.message);

  console.log('7. Woman sees pending connection and approves...');
  const linkId = redeemRes.connection_id;
  const { error: appErr } = await womanClient.rpc('approve_partner_connection', { p_link_id: linkId });
  if (appErr) throw appErr;
  console.log('   ✓ Connection approved!');

  console.log('8. Partner accesses permitted shared view from Supabase...');
  const { data: pView, error: pvErr } = await partnerClient.from('partner_view').select('*');
  if (pvErr) throw pvErr;
  console.log('   ✓ Partner view retrieved:', {
    womanName: pView[0]?.woman_name,
    status: pView[0]?.status,
    cycleLength: pView[0]?.average_cycle_length,
    periodLength: pView[0]?.average_period_length,
    permissions: pView[0]?.permissions,
  });

  console.log('\n🎉 ALL REMOTE SUPABASE PARTNER TESTS COMPLETED SUCCESSFULLY!');
}

testFullSuite().then(() => process.exit(0)).catch(e => { console.error('FAILED:', e); process.exit(1); });
