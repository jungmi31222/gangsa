// EmailJS 공개 설정: 이 네 값은 여기서만 관리합니다.
const EMAILJS_PUBLIC_KEY = "GM5MTL5OHAF_m9grb";
const EMAILJS_SERVICE_ID = "service_5p56j7b";
const EMAILJS_TEMPLATE_ID = "template_asux0le"; // 접수 알림
const EMAILJS_AUTOREPLY_ID = "template_1kpkc3a"; // 자동회신
// 배포 주소의 기준은 head의 canonical 한 곳입니다.
const SITE_URL = document.querySelector('link[rel="canonical"]').href;
const CONTACT_EMAIL = 'jungmi31222@gmail.com';

document.querySelector('#year').textContent = new Date().getFullYear();
const form = document.querySelector('#inquiry-form');
const consent = form.elements.privacy_agreed;
const submitButton = form.querySelector('button[type="submit"]');
const statusText = document.querySelector('#inquiry-status');
let sending = false;
let agreedAt = '';
const timestamp = () => new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) + ' (한국시간)';
const syncButton = () => submitButton.setAttribute('aria-disabled', String(sending || !consent.checked));
consent.addEventListener('change', () => {
  agreedAt = consent.checked ? timestamp() : '';
  syncButton();
  statusText.textContent = consent.checked ? '' : '동의해 주세요.';
});
// 초기 스크립트가 준비된 뒤에만 버튼의 안내·전송 동작을 허용합니다.
submitButton.disabled = false;
// aria-disabled로 클릭 안내를 제공하고, 실제 전송은 아래에서 다시 차단합니다.
submitButton.addEventListener('click', event => {
  if (!consent.checked || sending) {
    event.preventDefault();
    if (!sending) statusText.textContent = '개인정보 수집 · 이용에 동의해 주세요.';
  }
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending) return;
  if (!consent.checked) {
    statusText.textContent = '개인정보 수집 · 이용에 동의해 주세요.';
    return;
  }
  for (const name of ['from_name', 'from_email', 'message']) {
    const field = form.elements[name];
    field.value = field.value.trim();
  }
  if (!form.reportValidity()) return;
  if (!window.emailjs) {
    statusText.textContent = '전송 기능을 불러오지 못했습니다. 새로고침하거나 이메일로 문의해 주세요.';
    return;
  }
  form.elements.to_email.value = CONTACT_EMAIL;
  form.elements.reply_to.value = form.elements.from_email.value;
  form.elements.submitted_at.value = timestamp();
  form.elements.page_url.value = new URL(location.pathname + location.hash, SITE_URL).href;
  form.elements.agreed_at.value = agreedAt || timestamp();
  const params = Object.fromEntries(new FormData(form));
  sending = true;
  syncButton();
  const fields = [...form.querySelectorAll('input, select, textarea')];
  fields.forEach(field => field.disabled = true);
  submitButton.textContent = '전송 중…';
  statusText.textContent = '문의를 전송하고 있습니다.';
  let notified = false;
  try {
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params, { publicKey: EMAILJS_PUBLIC_KEY });
    notified = true;
    // EmailJS의 초당 1회 전송 제한을 지킵니다.
    await new Promise(resolve => setTimeout(resolve, 1100));
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_AUTOREPLY_ID, params, { publicKey: EMAILJS_PUBLIC_KEY });
    statusText.textContent = '문의가 접수되었습니다. 확인 메일을 보내드렸습니다.';
  } catch (_) {
    statusText.textContent = notified
      ? '문의는 접수되었으나 확인 메일 발송에 실패했습니다. 다시 접수하지 않으셔도 됩니다.'
      : '전송에 실패했습니다. 잠시 후 다시 시도하거나 이메일로 문의해 주세요.';
  } finally {
    if (notified) { form.reset(); agreedAt = ''; }
    fields.forEach(field => field.disabled = false);
    sending = false;
    submitButton.textContent = '문의 보내기';
    syncButton();
  }
});
