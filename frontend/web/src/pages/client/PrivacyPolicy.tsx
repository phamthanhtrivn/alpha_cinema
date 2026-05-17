import { useEffect } from "react";
import { ShieldCheck, Film, Fingerprint, ShieldAlert, Users, Clock3 } from "lucide-react";
import { Container } from "@/components/common/Layout";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    icon: Fingerprint,
    title: "Chúng tôi thu thập gì",
    items: [
      "Thông tin tài khoản khi bạn đăng ký, đăng nhập hoặc cập nhật hồ sơ.",
      "Thông tin giao dịch đặt vé, mua combo, thanh toán và lịch sử đơn hàng.",
      "Dữ liệu thiết bị, phiên truy cập, cookie và hành vi sử dụng để cải thiện trải nghiệm.",
    ],
  },
  {
    icon: Film,
    title: "Chúng tôi dùng thông tin để làm gì",
    items: [
      "Xử lý đặt vé, giữ chỗ, thanh toán và thông báo tình trạng đơn hàng.",
      "Cá nhân hóa gợi ý phim, suất chiếu, ưu đãi và nội dung phù hợp.",
      "Gửi thông báo quan trọng như thay đổi lịch chiếu, hoàn tiền hoặc xác minh tài khoản.",
    ],
  },
  {
    icon: Users,
    title: "Chúng tôi chia sẻ với ai",
    items: [
      "Đối tác thanh toán, ví điện tử, cổng trung gian và đơn vị xử lý giao dịch.",
      "Đơn vị vận hành hạ tầng, lưu trữ và hệ thống gửi thông báo theo ủy quyền.",
      "Cơ quan có thẩm quyền khi có yêu cầu hợp pháp theo quy định pháp luật.",
    ],
  },
  {
    icon: ShieldAlert,
    title: "Quyền của khách hàng",
    items: [
      "Yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân trong phạm vi hệ thống cho phép.",
      "Rút lại sự đồng ý đối với các hoạt động tiếp thị không bắt buộc.",
      "Liên hệ bộ phận hỗ trợ nếu phát hiện truy cập trái phép hoặc rủi ro bảo mật.",
    ],
  },
];

const privacyHighlights = [
  "Dữ liệu được mã hóa khi truyền tải và kiểm soát truy cập theo vai trò.",
  "Thông tin thanh toán nhạy cảm được xử lý bởi cổng thanh toán trung gian, không lưu toàn bộ trên hệ thống nếu không bắt buộc.",
  "Chúng tôi chỉ lưu dữ liệu trong thời gian cần thiết cho mục đích vận hành, đối soát và tuân thủ pháp luật.",
];

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="bg-slate-50 py-14">
      <Container>
        <div className="mx-auto max-w-5xl space-y-8">
          <section className="relative overflow-hidden rounded-md border border-slate-200 bg-slate-950 px-6 py-10 text-white shadow-[0_20px_80px_rgba(15,23,42,0.18)] sm:px-10 sm:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.18),transparent_35%)]" />
            <div className="relative flex flex-col gap-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-slate-200">
                <ShieldCheck size={14} />
                Chính sách bảo mật
              </div>
              <div className="space-y-3 max-w-3xl">
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                  Bảo vệ thông tin khách hàng trong mọi trải nghiệm xem phim
                </h1>
                <p className="text-sm leading-7 text-slate-300 sm:text-base">
                  Áp dụng cho toàn bộ website, ứng dụng và các kênh dịch vụ của rạp.
                  Mục tiêu của chúng tôi là minh bạch cách thu thập, sử dụng và bảo vệ
                  dữ liệu cá nhân của bạn khi đặt vé, thanh toán và tham gia các chương
                  trình thành viên.
                </p>
              </div>
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-3">
            {privacyHighlights.map((item) => (
              <Card key={item} className="border-slate-200 bg-white shadow-sm">
                <CardContent className="flex h-full items-start gap-3 p-6">
                  <div className="rounded-md bg-sky-50 p-3 text-sky-600">
                    <ShieldCheck size={20} />
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {sections.map(({ icon: Icon, title, items }) => (
              <Card key={title} className="border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-slate-950 p-3 text-white">
                      <Icon size={20} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">{title}</h2>
                  </div>
                  <ul className="space-y-3 text-sm leading-6 text-slate-600">
                    {items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 flex-none rounded-md bg-alpha-orange" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="grid gap-6 p-6 sm:grid-cols-3">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                  <Clock3 size={14} />
                  Thời gian lưu trữ
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Dữ liệu được giữ trong thời hạn cần thiết cho việc cung cấp dịch vụ,
                  đối soát giao dịch, giải quyết khiếu nại và nghĩa vụ pháp lý.
                </p>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                  <ShieldCheck size={14} />
                  Bảo mật hệ thống
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Chúng tôi áp dụng phân quyền truy cập, theo dõi nhật ký hệ thống và
                  các biện pháp bảo vệ hợp lý để giảm nguy cơ rò rỉ dữ liệu.
                </p>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                  <Users size={14} />
                  Liên hệ
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Nếu cần hỗ trợ về dữ liệu cá nhân, khách hàng có thể liên hệ bộ phận
                  chăm sóc khách hàng của rạp qua kênh hỗ trợ chính thức.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default PrivacyPolicy;
