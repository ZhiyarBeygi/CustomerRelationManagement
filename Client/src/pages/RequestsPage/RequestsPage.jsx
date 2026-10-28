import PriorityRequestsPanel from "../../components/PriorityRequestsPanel";
import TransferRequestsPanel from "../../components/TransferRequestsPanel";

export default function RequestsPage() {
  return (
    <div className="requests-page" dir="rtl">
      <div className="row page-title-row">
        <div>
          <h1>مدیریت درخواست‌ها</h1>
          <p className="muted">
            درخواست‌های ارجاع تیکت و تغییر اولویت را بررسی، تأیید یا رد کنید.
          </p>
        </div>
      </div>
      <TransferRequestsPanel />
      <PriorityRequestsPanel />
    </div>
  );
}
