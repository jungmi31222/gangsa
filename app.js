const form = document.querySelector('#inquiry-form');
const status = document.querySelector('#form-status');
document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelectorAll('.inquiry').forEach(link => link.addEventListener('click', () => {
  document.querySelector('#program-select').value = link.dataset.program;
}));
function inquiryText() {
  const data = new FormData(form);
  return ['김정미 강사님께 교육을 문의드립니다.', '', ...[['기관명 / 담당자','organization'],['회신 연락처','reply'],['교육 대상','audience'],['희망 교육','program'],['희망 일정·회차','schedule'],['문의 내용','message']].map(([label,key]) => `${label}: ${data.get(key) || '미정'}`)].join('\n');
}
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  window.location.href = `mailto:jungmi31222@gmail.com?subject=${encodeURIComponent('[강의 문의] ' + new FormData(form).get('organization'))}&body=${encodeURIComponent(inquiryText())}`;
  status.textContent = '이메일 앱에서 내용을 확인하고 전송해 주세요. 앱이 열리지 않으면 복사 기능을 이용해 주세요.';
});
document.querySelector('#copy-inquiry').addEventListener('click', async () => {
  if (!form.reportValidity()) return;
  try {
    await navigator.clipboard.writeText(inquiryText());
    status.textContent = '문의 내용을 복사했습니다. jungmi31222@gmail.com으로 붙여넣어 보내주세요.';
  } catch {
    status.textContent = '복사 권한이 없어 자동 복사하지 못했습니다. 작성 내용을 직접 복사하거나 010-9239-4609로 연락해 주세요.';
  }
});
